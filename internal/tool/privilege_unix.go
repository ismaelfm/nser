//go:build !windows

package tool

import (
	"os"
	"os/user"
)

// CheckPrivileges reports whether the current process is running with
// elevated privileges (root on Unix).
func CheckPrivileges() PrivilegeInfo {
	info := PrivilegeInfo{OS: "unix"}

	if u, err := user.Current(); err == nil {
		info.Username = u.Username
	}

	info.Elevated = os.Getuid() == 0

	return info
}
