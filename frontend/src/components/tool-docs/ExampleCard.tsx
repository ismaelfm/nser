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
        <div className="bg-gray-800/40 p-5 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors flex flex-col h-full">
            <h4 className="font-semibold text-gray-200 mb-1">{example.title}</h4>
            {example.description && (
                <p className="text-gray-400 text-sm mb-4 flex-1">
                    {example.description}
                </p>
            )}

            <div className="relative group mt-auto">
                <div className="bg-gray-950 font-mono text-sm p-3 rounded-lg text-emerald-400 border border-gray-800/80 overflow-x-auto whitespace-pre">
                    {example.command}
                </div>
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Copy command"
                >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
            </div>
        </div>
    );
}
