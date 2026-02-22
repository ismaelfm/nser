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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8 font-mono">
            <div className="bg-black border-2 border-white rounded-none w-full max-w-5xl h-full max-h-[85vh] shadow-[0_0_30px_rgba(255,255,255,0.1)] flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white flex justify-between items-center bg-black">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-none border border-white flex items-center justify-center text-white bg-white">
                            <span className="text-black font-bold text-lg leading-none">&gt;_</span>
                        </div>
                        <h3 className="font-bold text-white tracking-[0.2em] uppercase">{toolName} // OUTPUT</h3>
                        <span className="text-xs border border-gray-600 text-gray-400 px-2 py-1 uppercase tracking-widest">RUN_ID: {runId}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
                        [X]
                    </button>
                </div>

                <div className="flex-1 p-0 overflow-hidden bg-[#050505] flex flex-col border-t border-gray-900">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-gray-500 gap-3 font-mono uppercase tracking-widest">
                            <div className="w-3 h-3 bg-white animate-ping"></div>
                            FETCHING_DATA...
                        </div>
                    ) : error ? (
                        <div className="m-4 p-4 bg-black text-white border-2 border-white font-bold uppercase tracking-widest">
                            ERROR_DETECTED: {error}
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6 font-mono text-sm whitespace-pre-wrap text-gray-300 leading-relaxed">
                            {output || <span className="text-gray-600 italic">&gt;&gt; NO_DATA_RETURNED</span>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
