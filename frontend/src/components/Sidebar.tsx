import { useEffect, useState } from "react";
import { GetPrivilegeStatus } from "../../wailsjs/go/main/App";
import { tool } from "../../wailsjs/go/models";

const navItems = [
    { label: "Workspaces", icon: "folder", active: true },
    { label: "Tools", icon: "tool", active: true },
    { label: "AI Copilot", icon: "cpu", active: false },
    { label: "Reports", icon: "file-text", active: false },
];

interface SidebarProps {
    activeItem: string;
    onItemClick: (label: string) => void;
}

export default function Sidebar({ activeItem, onItemClick }: SidebarProps) {
    const [privilege, setPrivilege] = useState<tool.PrivilegeInfo | null>(null);

    useEffect(() => {
        GetPrivilegeStatus()
            .then((res) => {
                setPrivilege(res);
            })
            .catch((err) => {
                console.error("Failed to fetch privilege status", err);
            });
    }, []);

    return (
        <aside className="w-64 bg-black border-r border-gray-800 flex flex-col z-10 font-mono">
            <div className="p-4 border-b border-gray-800">
                <div className="flex flex-col items-center justify-center w-full">
                    <pre className="text-[8px] leading-[8px] text-gray-300 font-mono text-center mb-4 select-none">
                        {`   \\  /
 \\  \\/  /
  \\/  \\/
  /\\   \\
 /  \\   \\
/    \\   \\`}
                    </pre>
                    <h1 className="text-2xl font-bold text-white tracking-[0.3em] font-mono">
                        NSER
                    </h1>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => item.active && onItemClick(item.label)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium uppercase tracking-wider transition-all duration-150 ${activeItem === item.label
                            ? "bg-white text-black border border-white"
                            : item.active
                                ? "text-gray-500 hover:text-white hover:border-gray-500 border border-transparent"
                                : "text-gray-800 cursor-not-allowed border border-transparent"
                            }`}
                        disabled={!item.active}
                    >
                        {/* Terminal-like cursor indicator */}
                        <div className={`w-2 h-4 ${activeItem === item.label ? "bg-black animate-pulse" : "bg-transparent"}`} />
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Privilege Status Footer */}
            <div className="p-4 border-t border-gray-800 bg-black">
                {privilege ? (
                    <div className="flex items-center gap-3 px-3 py-2 bg-black border border-gray-800">
                        <div className={`w-2 h-2 rounded-none ${privilege.elevated ? 'bg-white' : 'bg-gray-600'}`} />
                        <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-gray-300 uppercase">
                                {privilege.username || "USER"}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                                {privilege.elevated ? "ROOT/ADMIN" : "STANDARD"}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="animate-pulse h-10 bg-gray-900 border border-gray-800"></div>
                )}
            </div>
        </aside>
    );
}
