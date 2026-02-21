package tool

import (
	"bufio"
	"bytes"
	"context"
	"database/sql"
	"fmt"
	"os/exec"
	"strings"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// RunResult is returned to the frontend after a blocking tool run finishes.
type RunResult struct {
	RunID       int64  `json:"runId"`
	ToolName    string `json:"toolName"`
	Target      string `json:"target"`
	CommandLine string `json:"commandLine"`
	Status      string `json:"status"`
	Output      string `json:"output"`
	Duration    string `json:"duration"`
	ExitCode    int    `json:"exitCode"`
}

// StreamStartResult is returned immediately when a streaming run begins.
// The caller should then listen for Wails events:
//
//	"tool:output:<runID>"  — payload: string (one line of output)
//	"tool:done:<runID>"    — payload: RunResult (final summary)
type StreamStartResult struct {
	RunID       int64  `json:"runId"`
	CommandLine string `json:"commandLine"`
}

// Runner executes tools as subprocesses and stores results in the database.
type Runner struct {
	registry *Registry
	db       *sql.DB
}

// NewRunner creates a runner backed by the given registry and database.
func NewRunner(registry *Registry, db *sql.DB) *Runner {
	return &Runner{registry: registry, db: db}
}

// buildCommandLine constructs a human-readable CLI string for the history view.
func buildCommandLine(binary string, args []string) string {
	parts := make([]string, 0, len(args)+1)
	parts = append(parts, binary)
	for _, a := range args {
		if strings.ContainsAny(a, " \t\"'") {
			parts = append(parts, fmt.Sprintf("%q", a))
		} else {
			parts = append(parts, a)
		}
	}
	return strings.Join(parts, " ")
}

// insertRun inserts a new tool_runs record with status=running and returns its ID.
func (r *Runner) insertRun(ctx context.Context, workspaceID int64, toolName, target, commandLine string, userArgs []string) (int64, error) {
	argsStr := strings.Join(userArgs, " ")
	res, err := r.db.ExecContext(ctx,
		`INSERT INTO tool_runs (workspace_id, tool_name, target, args, command_line, status, started_at)
		 VALUES (?, ?, ?, ?, ?, 'running', ?)`,
		workspaceID, toolName, target, argsStr, commandLine, time.Now(),
	)
	if err != nil {
		return 0, fmt.Errorf("insert tool_run: %w", err)
	}
	return res.LastInsertId()
}

// finalizeRun updates the tool_runs record after a run completes.
func (r *Runner) finalizeRun(ctx context.Context, runID int64, output, status string, exitCode int) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE tool_runs SET raw_output = ?, status = ?, exit_code = ?, completed_at = ? WHERE id = ?`,
		[]byte(output), status, exitCode, time.Now(), runID,
	)
	return err
}

// prepareExec performs common setup: lookup binary, build full args list, commandLine.
func (r *Runner) prepareExec(toolName string, target string, userArgs []string) (string, []string, string, error) {
	def, err := r.registry.Get(toolName)
	if err != nil {
		return "", nil, "", err
	}
	binPath, err := exec.LookPath(def.Binary)
	if err != nil {
		return "", nil, "", fmt.Errorf("tool %q not found in PATH: %w", def.Binary, err)
	}
	args := make([]string, 0, len(def.DefaultArgs)+len(userArgs)+1)
	args = append(args, def.DefaultArgs...)
	args = append(args, userArgs...)
	args = append(args, target)

	cmdLine := buildCommandLine(def.Binary, args)
	return binPath, args, cmdLine, nil
}

// ─── Blocking Run ────────────────────────────────────────────────────────────

// Run executes a tool and blocks until it finishes, then stores and returns the result.
func (r *Runner) Run(ctx context.Context, toolName string, workspaceID int64, target string, userArgs []string) (*RunResult, error) {
	binPath, args, cmdLine, err := r.prepareExec(toolName, target, userArgs)
	if err != nil {
		return nil, err
	}

	startedAt := time.Now()

	runID, err := r.insertRun(ctx, workspaceID, toolName, target, cmdLine, userArgs)
	if err != nil {
		return nil, err
	}

	execCtx, cancel := context.WithTimeout(ctx, 5*time.Minute)
	defer cancel()

	cmd := exec.CommandContext(execCtx, binPath, args...)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	execErr := cmd.Run()

	combined := stdout.String()
	if stderr.Len() > 0 {
		combined += "\n--- STDERR ---\n" + stderr.String()
	}

	status := "completed"
	exitCode := 0
	if execErr != nil {
		status = "failed"
		if exitErr, ok := execErr.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		} else {
			exitCode = -1
		}
	}

	if err := r.finalizeRun(ctx, runID, combined, status, exitCode); err != nil {
		return nil, fmt.Errorf("update tool_run: %w", err)
	}

	duration := time.Since(startedAt).Round(time.Millisecond)

	return &RunResult{
		RunID:       runID,
		ToolName:    toolName,
		Target:      target,
		CommandLine: cmdLine,
		Status:      status,
		Output:      combined,
		Duration:    duration.String(),
		ExitCode:    exitCode,
	}, nil
}

// ─── Streaming Run ───────────────────────────────────────────────────────────

// RunStreaming starts a tool subprocess in a goroutine and returns immediately.
// Progress is delivered via Wails events:
//
//	"tool:output:<runID>" — one line of stdout/stderr per event
//	"tool:done:<runID>"   — RunResult payload sent when the process exits
//
// The calling context (ctx) must be the Wails app context so EventsEmit works.
func (r *Runner) RunStreaming(ctx context.Context, toolName string, workspaceID int64, target string, userArgs []string) (*StreamStartResult, error) {
	binPath, args, cmdLine, err := r.prepareExec(toolName, target, userArgs)
	if err != nil {
		return nil, err
	}

	runID, err := r.insertRun(ctx, workspaceID, toolName, target, cmdLine, userArgs)
	if err != nil {
		return nil, err
	}

	go func() {
		startedAt := time.Now()

		execCtx, cancel := context.WithTimeout(ctx, 5*time.Minute)
		defer cancel()

		cmd := exec.CommandContext(execCtx, binPath, args...)

		// Merge stdout + stderr into a single pipe for sequential output.
		cmd.Stderr = cmd.Stdout

		stdout, err := cmd.StdoutPipe()
		if err != nil {
			runtime.EventsEmit(ctx, fmt.Sprintf("tool:done:%d", runID), RunResult{
				RunID:       runID,
				ToolName:    toolName,
				Target:      target,
				CommandLine: cmdLine,
				Status:      "failed",
				Output:      fmt.Sprintf("pipe error: %v", err),
				ExitCode:    -1,
			})
			return
		}

		if err := cmd.Start(); err != nil {
			runtime.EventsEmit(ctx, fmt.Sprintf("tool:done:%d", runID), RunResult{
				RunID:       runID,
				ToolName:    toolName,
				Target:      target,
				CommandLine: cmdLine,
				Status:      "failed",
				Output:      fmt.Sprintf("start error: %v", err),
				ExitCode:    -1,
			})
			return
		}

		var outputBuilder strings.Builder
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			line := scanner.Text()
			outputBuilder.WriteString(line)
			outputBuilder.WriteByte('\n')
			runtime.EventsEmit(ctx, fmt.Sprintf("tool:output:%d", runID), line)
		}

		waitErr := cmd.Wait()

		status := "completed"
		exitCode := 0
		if waitErr != nil {
			status = "failed"
			if exitErr, ok := waitErr.(*exec.ExitError); ok {
				exitCode = exitErr.ExitCode()
			} else {
				exitCode = -1
			}
		}

		combined := outputBuilder.String()
		duration := time.Since(startedAt).Round(time.Millisecond)

		// Best-effort DB update — use background context in case app ctx is done.
		r.finalizeRun(context.Background(), runID, combined, status, exitCode) //nolint:errcheck

		result := RunResult{
			RunID:       runID,
			ToolName:    toolName,
			Target:      target,
			CommandLine: cmdLine,
			Status:      status,
			Output:      combined,
			Duration:    duration.String(),
			ExitCode:    exitCode,
		}
		runtime.EventsEmit(ctx, fmt.Sprintf("tool:done:%d", runID), result)
	}()

	return &StreamStartResult{
		RunID:       runID,
		CommandLine: cmdLine,
	}, nil
}
