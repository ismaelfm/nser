//go:build windows

package tool

import (
	"os/exec"
	"os/user"
	"strings"
)

// CheckPrivileges reports whether the current process is running with
// elevated privileges (Administrator on Windows).
func CheckPrivileges() PrivilegeInfo {
	info := PrivilegeInfo{OS: "windows"}

	if u, err := user.Current(); err == nil {
		info.Username = u.Username
	}

	// "net session" succeeds only when running as Administrator.
	out, err := exec.Command("net", "session").CombinedOutput()
	if err == nil && !strings.Contains(string(out), "Access is denied") {
		info.Elevated = true
	}

	return info
}
