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
            <div className="flex items-center justify-center p-12 font-mono uppercase tracking-widest text-white">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white animate-ping"></div>
                    FETCHING_DOCS...
                </div>
            </div>
        );
    }

    if (!health && !docs) {
        return (
            <div className="p-8 max-w-4xl mx-auto w-full text-center font-mono uppercase tracking-widest">
                <div className="bg-black p-8 border-2 border-white inline-block mb-6">
                    <p className="text-white font-bold">TOOL_NOT_FOUND</p>
                    <p className="text-gray-500 text-xs mt-4">{error || `NO_DATA_AVAILABLE_FOR "${toolName}"`}</p>
                </div>
                <div>
                    <button onClick={() => navigate('/tools')} className="text-white hover:text-gray-400 font-bold transition-colors">
                        [RETURN_TO_REGISTRY]
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto w-full relative font-mono">
            <button
                onClick={() => navigate('/tools')}
                className="mb-8 text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
            >
                [&lt;- RETURN]
            </button>

            <div className="bg-black border-2 border-gray-800 p-8">
                <ToolDocHeader toolHealth={health} />

                <div className="mt-8 space-y-12">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-[0.2em] border-b border-gray-800 pb-2">
                            [ DOCUMENTATION ]
                        </h2>
                        <ToolDocContent markdown={docs?.documentation || ""} />
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-[0.2em] border-b border-gray-800 pb-2">
                            [ EXAMPLES ]
                        </h2>
                        <ToolExamplesGrid examples={docs?.examples || []} />
                    </section>
                </div>
            </div>
        </div>
    );
}
