import { useEffect, useState } from "react";
import { GetRunOutput } from "../../wailsjs/go/main/App";

interface Props {
    runId: number | null;
    toolName: string;
    onClose: () => void;
}

export default function OutputModal({ runId, toolName, onClose }: Props) {
    const [output, setOutput] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!runId) return;
        setLoading(true);
        GetRunOutput(runId)
            .then(res => {
                setOutput(res);
                setError("");
            })
            .catch(err => setError(String(err)))
            .finally(() => setLoading(false));
    }, [runId]);

    if (!runId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-8">
            <div className="bg-[#0a0f18] border border-gray-800 rounded-2xl w-full max-w-5xl h-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-800/80 flex justify-between items-center bg-gray-900/40">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-gray-100">{toolName} Output</h3>
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">Run #{runId}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors p-1">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 p-0 overflow-hidden bg-[#05080f] flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-gray-500 gap-2">
                            <span className="animate-spin">⚙️</span> Loading output...
                        </div>
                    ) : error ? (
                        <div className="m-4 p-4 bg-red-900/20 text-red-400 rounded-lg border border-red-900/50">
                            {error}
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6 font-mono text-sm whitespace-pre-wrap text-green-300/90 leading-relaxed">
                            {output || <span className="text-gray-600 italic">No output recorded.</span>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
