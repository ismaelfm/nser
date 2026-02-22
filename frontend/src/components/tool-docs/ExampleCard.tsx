import { main } from "../../../wailsjs/go/models";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface ExampleCardProps {
    example: main.ToolExample;
}

export default function ExampleCard({ example }: ExampleCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(example.command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-black p-5 border-2 border-gray-800 hover:border-white transition-colors flex flex-col h-full font-mono">
            <h4 className="font-bold text-white mb-2 uppercase tracking-widest">{example.title}</h4>
            {example.description && (
                <p className="text-gray-500 text-xs mb-4 flex-1 uppercase tracking-widest border-l-2 border-gray-800 pl-3">
                    {example.description}
                </p>
            )}

            <div className="relative group mt-auto">
                <div className="bg-black p-4 text-white border-2 border-gray-800 group-hover:border-gray-600 transition-colors overflow-x-auto whitespace-pre font-mono text-xs uppercase tracking-widest">
                    {example.command}
                </div>
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 px-2 py-1 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-300 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 border-2 border-transparent"
                    title="COPY_COMMAND"
                >
                    {copied ? "[ COPIED ]" : "[ COPY ]"}
                </button>
            </div>
        </div>
    );
}
