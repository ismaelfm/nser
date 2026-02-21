import { useState, useEffect } from "react";
import { Phase } from "./PhaseTabs";

// Assuming we get the tools array and a function to run the tool
export interface RunPanelProps {
    workspaceId: number;
    activePhase: Phase;
    tools: any[]; // ToolDef[]
    defaultTarget: string;
    onRunTool: (toolName: string, target: string, extraArgs: string[]) => void;
    isRunning: boolean;
}

export default function RunPanel({ workspaceId, activePhase, tools, defaultTarget, onRunTool, isRunning }: RunPanelProps) {
    const [selectedTool, setSelectedTool] = useState<string>("");
    const [target, setTarget] = useState(defaultTarget || "");
    const [args, setArgs] = useState("");

    // Filter tools by active phase (case-insensitive)
    const phaseTools = tools.filter(t => t.Category?.toLowerCase() === activePhase.toLowerCase());

    useEffect(() => {
        if (phaseTools.length > 0 && !phaseTools.find(t => t.Name === selectedTool)) {
            setSelectedTool(phaseTools[0].Name);
        } else if (phaseTools.length === 0) {
            setSelectedTool("");
        }
    }, [activePhase, phaseTools, selectedTool]);

    useEffect(() => {
        if (defaultTarget && !target) {
            setTarget(defaultTarget);
        }
    }, [defaultTarget]);

    const handleRun = () => {
        if (!selectedTool) return;
        const extraArgs = args.trim() ? args.trim().split(/\s+/) : [];
        onRunTool(selectedTool, target, extraArgs);
    };

    return (
        <div className="bg-[#0a0f18] p-6 border-b border-gray-800 space-y-4">
            <div className="flex gap-4 items-end">
                <div className="flex-1 max-w-[200px] space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">Tool</label>
                    <select
                        value={selectedTool}
                        onChange={(e) => setSelectedTool(e.target.value)}
                        disabled={phaseTools.length === 0}
                        className="w-full bg-[#05080f] border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500/50 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {phaseTools.length === 0 ? (
                            <option value="">No tools available</option>
                        ) : (
                            phaseTools.map(t => (
                                <option key={t.Name} value={t.Name}>{t.Name}</option>
                            ))
                        )}
                    </select>
                </div>

                <div className="flex-1 max-w-[300px] space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">Target</label>
                    <input
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="e.g. 192.168.1.1"
                        className="w-full bg-[#05080f] border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500/50 font-mono text-sm"
                    />
                </div>

                <div className="flex-[2] space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">Extra Args</label>
                    <input
                        type="text"
                        value={args}
                        onChange={(e) => setArgs(e.target.value)}
                        placeholder="-p 80,443 --script vuln"
                        className="w-full bg-[#05080f] border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500/50 font-mono text-sm"
                    />
                </div>

                <button
                    onClick={handleRun}
                    disabled={!selectedTool || !target || isRunning}
                    className="h-[46px] px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg font-semibold shadow-lg shadow-blue-500/20 transition-all ml-auto flex items-center gap-2"
                >
                    {isRunning ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Running...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 ml-[-4px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Run Tool
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
