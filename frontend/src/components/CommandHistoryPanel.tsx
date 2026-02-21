import { main } from "../../wailsjs/go/models";

interface Props {
    history: main.CommandRun[];
    onViewOutput: (runId: number, toolName: string) => void;
    onDeleteRun: (runId: number) => void;
}

export default function CommandHistoryPanel({ history, onViewOutput, onDeleteRun }: Props) {
    if (!history || history.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500 text-sm border-t border-gray-800 bg-[#0a0f18]/50">
                No commands have been run in this workspace yet.
            </div>
        );
    }

    return (
        <div className="border-t border-gray-800 bg-[#0a0f18] flex flex-col min-h-[150px] max-h-[30vh]">
            <div className="px-6 py-3 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-[#0a0f18] z-10">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Command History</h3>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{history.length} runs</span>
            </div>

            <div className="divide-y divide-gray-800 overflow-y-auto flex-1">
                {history.map(run => (
                    <div key={run.id} className="group px-6 py-4 hover:bg-gray-800/30 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 overflow-hidden">
                            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] flex-shrink-0 ${run.status === "completed" && run.exitCode === 0
                                ? "bg-emerald-500 shadow-emerald-500/50"
                                : run.status === "running"
                                    ? "bg-blue-500 shadow-blue-500/50 animate-pulse"
                                    : "bg-red-500 shadow-red-500/50"
                                }`} />
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-mono text-sm text-gray-300 truncate font-semibold">
                                    {run.commandLine}
                                </span>
                                <div className="text-xs text-gray-500 flex gap-3 mt-1">
                                    <span>{new Date(run.startedAt).toLocaleString()}</span>
                                    {run.status === "completed" && <span>• Exit {run.exitCode}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onViewOutput(run.id, run.toolName)}
                                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-medium transition-colors"
                            >
                                View Output
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm("Delete this run record?")) onDeleteRun(run.id);
                                }}
                                className="px-2 py-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
