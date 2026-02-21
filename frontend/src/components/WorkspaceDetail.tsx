import { useEffect, useState } from "react";
import { GetWorkspaceByID, GetTools, GetWorkspaceHistory, RunToolStreaming, DeleteRun, GetToolHealth } from "../../wailsjs/go/main/App";
import { EventsOn, EventsOff } from "../../wailsjs/runtime/runtime";
import { main, tool } from "../../wailsjs/go/models";

import PhaseTabs, { Phase } from "./PhaseTabs";
import RunPanel from "./RunPanel";
import TerminalStream from "./TerminalStream";
import CommandHistoryPanel from "./CommandHistoryPanel";
import OutputModal from "./OutputModal";

export default function WorkspaceDetail({ workspaceId, onBack }: { workspaceId: number, onBack: () => void }) {
    const [workspace, setWorkspace] = useState<main.Workspace | null>(null);
    const [activePhase, setActivePhase] = useState<Phase>("recon");
    const [tools, setTools] = useState<any[]>([]);

    // Run state
    const [currentRunId, setCurrentRunId] = useState<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [streamLines, setStreamLines] = useState<string[]>([]);
    const [runSummary, setRunSummary] = useState<any | null>(null);

    // History state
    const [history, setHistory] = useState<main.CommandRun[]>([]);

    // Modal state
    const [viewOutputRunId, setViewOutputRunId] = useState<number | null>(null);
    const [viewOutputTool, setViewOutputTool] = useState("");

    const loadHistory = () => {
        GetWorkspaceHistory(workspaceId)
            .then(res => setHistory(res || []))
            .catch(console.error);
    };

    useEffect(() => {
        GetWorkspaceByID(workspaceId).then(setWorkspace).catch(console.error);

        // Fetch tools AND their install status
        Promise.all([GetTools(), GetToolHealth()])
            .then(([fetchedTools, health]) => {
                const toolsArr = fetchedTools || [];
                const healthArr = health || [];

                // Only keep tools that are actually installed on the system
                const installedTools = toolsArr.filter(t => {
                    const h = healthArr.find(status => status.name === t.Name);
                    return h && h.installed;
                });

                setTools(installedTools);
            })
            .catch(console.error);

        loadHistory();
    }, [workspaceId]);

    // Setup streaming events
    useEffect(() => {
        if (!currentRunId) return;

        const outputEvent = `tool:output:${currentRunId}`;
        const doneEvent = `tool:done:${currentRunId}`;

        const cancelOutput = EventsOn(outputEvent, (line: string) => {
            setStreamLines(prev => [...prev, line]);
        });

        const cancelDone = EventsOn(doneEvent, (result: any) => {
            setIsRunning(false);
            setRunSummary(result);
            loadHistory();
        });

        return () => {
            cancelOutput();
            cancelDone();
        };
    }, [currentRunId]);

    const handleRunTool = async (toolName: string, target: string, args: string[]) => {
        try {
            setStreamLines([]);
            setRunSummary(null);
            setIsRunning(true);
            const res = await RunToolStreaming(workspaceId, toolName, target, args);
            // res is tool.StreamStartResult -> { runId: number, status: string }
            setCurrentRunId(res.runId);
            loadHistory(); // To show it as running in the history list
        } catch (err) {
            console.error("Failed to start tool:", err);
            setStreamLines([`Error starting tool: ${err}`]);
            setIsRunning(false);
        }
    };

    const handleDeleteRun = async (runId: number) => {
        try {
            await DeleteRun(runId);
            loadHistory();
        } catch (err) {
            console.error("Failed to delete run:", err);
        }
    };

    if (!workspace) {
        return <div className="p-8 text-center text-gray-500">Loading workspace...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-[#05080f] animate-in fade-in duration-300">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0a0f18] border-b border-gray-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-100 flex items-center gap-3">
                            {workspace.name}
                            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-mono font-normal">ID: {workspace.id}</span>
                        </h2>
                        {workspace.description && (
                            <p className="text-sm text-gray-500 mt-0.5">{workspace.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Left side / main split */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-gray-800 bg-[#05080f]">
                    <PhaseTabs activePhase={activePhase} onPhaseChange={setActivePhase} />

                    <RunPanel
                        workspaceId={workspaceId}
                        activePhase={activePhase}
                        tools={tools}
                        defaultTarget={workspace.target}
                        onRunTool={handleRunTool}
                        isRunning={isRunning}
                    />

                    <div className="flex-1 min-h-0 flex flex-col bg-[#0a0f18]/20 relative">
                        {/* Shadow to signify depth */}
                        <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10" />

                        <TerminalStream
                            lines={streamLines}
                            isRunning={isRunning}
                            resultSummary={runSummary}
                        />
                    </div>
                </div>

                {/* Right Edge: Command History */}
                <div className="w-96 flex flex-col bg-[#0a0f18] flex-shrink-0 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.3)] z-10">
                    <div className="flex-1 overflow-y-auto">
                        <CommandHistoryPanel
                            history={history}
                            onViewOutput={(id, name) => {
                                setViewOutputRunId(id);
                                setViewOutputTool(name);
                            }}
                            onDeleteRun={handleDeleteRun}
                        />
                    </div>
                </div>
            </div>

            <OutputModal
                runId={viewOutputRunId}
                toolName={viewOutputTool}
                onClose={() => setViewOutputRunId(null)}
            />
        </div>
    );
}
