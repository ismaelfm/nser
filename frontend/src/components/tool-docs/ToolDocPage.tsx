import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetToolHealth, GetToolDocs } from "../../../wailsjs/go/main/App";
import { tool, main } from "../../../wailsjs/go/models";
import ToolDocHeader from "./ToolDocHeader";
import ToolDocContent from "./ToolDocContent";
import ToolExamplesGrid from "./ToolExamplesGrid";
import { ArrowLeft } from "lucide-react";

export default function ToolDocPage() {
    const { toolName } = useParams<{ toolName: string }>();
    const navigate = useNavigate();

    const [health, setHealth] = useState<tool.ToolHealth | undefined>(undefined);
    const [docs, setDocs] = useState<main.ToolDocumentation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!toolName) return;

        setLoading(true);
        setError(null);

        // Fetch both health list (to find this tool) and the docs
        Promise.all([
            GetToolHealth(),
            GetToolDocs(toolName).catch(err => {
                console.warn(`No docs found for ${toolName}:`, err);
                return null;
            })
        ]).then(([healthList, toolDocs]) => {
            const currentHealth = (healthList || []).find(t => t.name === toolName);
            setHealth(currentHealth);
            setDocs(toolDocs);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to fetch tool data:", err);
            setError("Failed to load tool documentation: " + String(err));
            setLoading(false);
        });
    }, [toolName]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-pulse flex space-x-2">
                    <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                    <div className="h-3 w-3 bg-blue-500 rounded-full animation-delay-200"></div>
                    <div className="h-3 w-3 bg-blue-500 rounded-full animation-delay-400"></div>
                </div>
            </div>
        );
    }

    if (!health && !docs) {
        return (
            <div className="p-8 max-w-4xl mx-auto w-full text-center">
                <div className="bg-red-950/20 p-8 rounded-xl border border-red-900/50 inline-block mb-6">
                    <p className="text-red-400 font-medium">Tool Not Found</p>
                    <p className="text-red-500/70 text-sm mt-2">{error || `Could not find any data for "${toolName}"`}</p>
                </div>
                <div>
                    <button onClick={() => navigate('/tools')} className="text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center gap-2 mx-auto transition-colors">
                        <ArrowLeft size={16} /> Back to Tools Registry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto w-full relative">
            <button
                onClick={() => navigate('/tools')}
                className="mb-8 text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-2 text-sm font-medium"
            >
                <ArrowLeft size={16} /> Back to Tools
            </button>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/60 p-8 shadow-2xl">
                <ToolDocHeader toolHealth={health} />

                <div className="mt-8 space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-2">
                            <span>Documentation</span>
                            <div className="h-px bg-gray-800/80 flex-1 ml-4 block" />
                        </h2>
                        <ToolDocContent markdown={docs?.documentation || ""} />
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-2">
                            <span>Usage Examples</span>
                            <div className="h-px bg-gray-800/80 flex-1 ml-4 block" />
                        </h2>
                        <ToolExamplesGrid examples={docs?.examples || []} />
                    </section>
                </div>
            </div>
        </div>
    );
}
