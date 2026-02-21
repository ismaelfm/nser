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
        <aside className="w-64 bg-[#0a0f18] border-r border-gray-800 flex flex-col shadow-2xl z-10">
            <div className="p-6 border-b border-gray-800/80">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 tracking-wide">
                        NSER
                    </h1>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => item.active && onItemClick(item.label)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeItem === item.label
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm"
                                : item.active
                                    ? "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 transparent border border-transparent"
                                    : "text-gray-600/50 cursor-not-allowed border border-transparent"
                            }`}
                        disabled={!item.active}
                    >
                        {/* Simple icon placeholder */}
                        <div className={`w-1.5 h-1.5 rounded-full ${activeItem === item.label ? "bg-blue-400" : item.active ? "bg-gray-600" : "bg-gray-800"}`} />
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Privilege Status Footer */}
            <div className="p-4 border-t border-gray-800/80 bg-gray-900/30">
                {privilege ? (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/40 border border-gray-700/50">
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${privilege.elevated ? 'bg-red-500 shadow-red-500/50' : 'bg-emerald-500 shadow-emerald-500/50'}`} />
                        <div className="flex flex-col text-left">
                            <span className="text-xs font-semibold text-gray-300">
                                {privilege.username || "User"}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono mt-0.5">
                                {privilege.elevated ? "Root / Admin" : "Standard Privileges"}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="animate-pulse h-10 bg-gray-800/50 rounded-lg"></div>
                )}
            </div>
        </aside>
    );
}
