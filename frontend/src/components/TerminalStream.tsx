import { useEffect, useRef } from "react";

interface TerminalStreamProps {
    lines: string[];
    isRunning: boolean;
    resultSummary: any | null; // Optional summary when done
}

export default function TerminalStream({ lines, isRunning, resultSummary }: TerminalStreamProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lines]);

    return (
        <div className="flex-1 bg-[#05080f] border border-gray-800 rounded-lg m-6 flex flex-col overflow-hidden shadow-inner">
            <div className="bg-[#0a0f18] px-4 py-2 border-b border-gray-800 flex justify-between items-center text-xs font-mono text-gray-500">
                <span>TERMINAL OUTPUT</span>
                {isRunning && <span className="flex items-center gap-2 text-blue-400">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Live
                </span>}
            </div>

            <div
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto font-mono text-sm whitespace-pre-wrap flex flex-col scroll-smooth"
            >
                {lines.length === 0 && !isRunning && (
                    <div className="text-gray-600 italic mt-auto mb-auto text-center">
                        Select a tool and click Run to start ...
                    </div>
                )}

                {lines.map((line, idx) => {
                    const isError = line.toLowerCase().includes("error") || line.toLowerCase().includes("fail");
                    return (
                        <div key={idx} className={isError ? "text-red-400" : "text-green-300/90"}>
                            {line}
                        </div>
                    );
                })}

                {resultSummary && (
                    <div className="mt-4 pt-4 border-t border-gray-800/50 flex items-center gap-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${resultSummary.exitCode === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                            }`}>
                            Exit {resultSummary.exitCode}
                        </span>
                        {resultSummary.duration && (
                            <span className="text-gray-500">{resultSummary.duration}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
