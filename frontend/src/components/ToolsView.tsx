import { useEffect, useState } from "react";
import { GetToolHealth, GetTools } from "../../wailsjs/go/main/App";
import { tool } from "../../wailsjs/go/models";
import { useNavigate } from "react-router-dom";

export default function ToolsView() {
    const navigate = useNavigate();
    const [tools, setTools] = useState<(tool.ToolHealth & { description?: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([GetTools(), GetToolHealth()])
            .then(([fetchedTools, health]) => {
                const toolsArr = fetchedTools || [];
                const healthArr = health || [];

                const merged = healthArr.map(h => {
                    const def = toolsArr.find(t => t.Name === h.name);
                    return { ...h, description: def?.Description };
                });

                setTools(merged);
                setLoading(false);
            })
            .catch((err) => {
                setError(String(err));
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-pulse flex space-x-2">
                    <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                    <div className="h-3 w-3 bg-blue-500 rounded-full animation-delay-200"></div>
                    <div className="h-3 w-3 bg-blue-500 rounded-full animation-delay-400"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-950/20 rounded-xl border border-red-900/50">
                <p className="text-red-400 font-medium">Failed to load tools</p>
                <p className="text-red-500/70 text-sm mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto w-full">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
                    Tool Registry
                </h2>
                <p className="text-gray-400 mt-2 text-lg">
                    Manage and monitor external security tooling.
                </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/60 overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-800/40 border-b border-gray-800/60 text-gray-400 text-sm uppercase tracking-wider">
                            <th className="py-4 px-6 font-semibold">Tool</th>
                            <th className="py-4 px-6 font-semibold">Status</th>
                            <th className="py-4 px-6 font-semibold">Version</th>
                            <th className="py-4 px-6 font-semibold hidden md:table-cell">Path</th>
                            <th className="py-4 px-6 font-semibold text-right">Privileges</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {tools.map((t, i) => (
                            <tr
                                key={i}
                                onClick={() => navigate(`/tools/${t.name}`)}
                                className="hover:bg-gray-800/30 transition-colors duration-200 group cursor-pointer"
                            >
                                <td className="py-4 px-6">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">{t.name}</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-800/50 hidden md:inline-block">{t.category}</span>
                                        </div>
                                        {t.description && (
                                            <span className="text-xs text-gray-400 mt-1 line-clamp-1">{t.description}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    {t.installed ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                            Installed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                            Missing
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-gray-300 text-sm font-mono">
                                    {t.version ? (
                                        <span className="bg-gray-800/50 px-2 py-1 rounded text-blue-300">{t.version}</span>
                                    ) : (
                                        <span className="text-gray-600">—</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-sm hidden md:table-cell">
                                    {t.path ? (
                                        <span className="text-gray-400 font-mono text-xs truncate max-w-[200px] inline-block" title={t.path}>
                                            {t.path}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500 text-xs italic">{t.installHint || "Not explicitly mapped"}</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    {t.needsRoot ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                            sudo
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-gray-500">
                                            user
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {tools.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-500">
                                    No tools are currently registered.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
