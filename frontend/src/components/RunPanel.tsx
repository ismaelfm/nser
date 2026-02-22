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
        <div className="bg-black p-6 border-b-2 border-white space-y-4 font-mono">
            <div className="flex gap-4 items-end">
                <div className="flex-1 max-w-[200px] space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">Tool</label>
                    <select
                        value={selectedTool}
                        onChange={(e) => setSelectedTool(e.target.value)}
                        disabled={phaseTools.length === 0}
                        className="w-full bg-black border-2 border-gray-800 text-white rounded-none px-4 py-2.5 outline-none focus:border-white appearance-none disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                    >
                        {phaseTools.length === 0 ? (
                            <option value="">NO_TOOLS</option>
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
                        placeholder="IP / DOMAIN"
                        className="w-full bg-black border-2 border-gray-800 text-white rounded-none px-4 py-2.5 outline-none focus:border-white font-mono text-sm uppercase placeholder-gray-800"
                    />
                </div>

                <div className="flex-[2] space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">Extra Args</label>
                    <input
                        type="text"
                        value={args}
                        onChange={(e) => setArgs(e.target.value)}
                        placeholder="-P 80,443 --SCRIPT VULN"
                        className="w-full bg-black border-2 border-gray-800 text-white rounded-none px-4 py-2.5 outline-none focus:border-white font-mono text-sm uppercase placeholder-gray-800"
                    />
                </div>

                <button
                    onClick={handleRun}
                    disabled={!selectedTool || !target || isRunning}
                    className="h-[46px] px-8 bg-white hover:bg-gray-300 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-black rounded-none font-bold uppercase tracking-[0.2em] transition-colors ml-auto flex items-center gap-3 border-2 border-transparent disabled:border-gray-800"
                >
                    {isRunning ? (
                        <>
                            <div className="w-2 h-2 bg-black animate-ping"></div>
                            EXECUTING_
                        </>
                    ) : (
                        <>
                            <span className="text-lg leading-none">&gt;_</span>
                            EXECUTE
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
