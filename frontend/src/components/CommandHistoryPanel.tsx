import { main } from "../../wailsjs/go/models";

interface Props {
    history: main.CommandRun[];
    onViewOutput: (runId: number, toolName: string) => void;
    onDeleteRun: (runId: number) => void;
}

export default function CommandHistoryPanel({ history, onViewOutput, onDeleteRun }: Props) {
    if (!history || history.length === 0) {
        return (
            <div className="p-6 text-center text-gray-600 border-l-2 border-white bg-black h-full font-mono uppercase tracking-widest flex items-center justify-center flex-col text-xs">
                <span>[ NO_COMMAND_HISTORY ]</span>
            </div>
        );
    }

    return (
        <div className="border-l-2 border-white bg-black flex flex-col h-full font-mono">
            <div className="px-6 py-3 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-black z-10">
                <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">COMMAND_HISTORY</h3>
                <span className="text-xs text-black font-bold bg-white px-2 py-0.5 uppercase tracking-widest">TOTAL: {history.length}</span>
            </div>

            <div className="divide-y divide-gray-900 overflow-y-auto flex-1 bg-[#050505]">
                {history.map(run => (
                    <div key={run.id} className="group px-6 py-4 hover:bg-gray-900 transition-colors flex items-center justify-between border-l-2 border-transparent hover:border-white">
                        <div className="flex items-center gap-4 flex-1 overflow-hidden">
                            <div className={`w-3 h-3 flex-shrink-0 ${run.status === "completed" && run.exitCode === 0
                                ? "bg-white"
                                : run.status === "running"
                                    ? "bg-gray-500 animate-pulse"
                                    : "bg-gray-800 border-2 border-white"
                                }`} />
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-mono text-sm text-gray-200 truncate font-bold tracking-wider">
                                    {run.commandLine}
                                </span>
                                <div className="text-[10px] text-gray-600 flex gap-3 mt-1 uppercase tracking-widest">
                                    <span>{new Date(run.startedAt).toLocaleString()}</span>
                                    {run.status === "completed" && <span className="text-gray-400">| EXIT: {run.exitCode}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onViewOutput(run.id, run.toolName)}
                                className="px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-300 transition-colors"
                            >
                                VIEW
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm("Delete this run record?")) onDeleteRun(run.id);
                                }}
                                className="px-2 py-1 text-gray-600 hover:text-white border border-transparent hover:border-gray-500 transition-colors uppercase text-xs font-bold"
                            >
                                [X]
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
