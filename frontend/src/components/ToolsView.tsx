import { useEffect, useState } from "react";
import { GetToolHealth, GetTools } from "../../wailsjs/go/main/App";
import { tool } from "../../wailsjs/go/models";
import { useNavigate } from "react-router-dom";

const formatVersion = (v: string) => {
    if (!v) return "";
    return v.replace(/https?:\/\/[^\s)]+/gi, '').replace(/\(\s*\)/g, '').trim();
};

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
            <div className="flex items-center justify-center h-full font-mono uppercase tracking-widest text-white">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white animate-ping"></div>
                    LOADING_REGISTRY...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-black border-2 border-white font-mono uppercase tracking-widest">
                <p className="text-white font-bold">ERROR_LOADING_TOOLS</p>
                <p className="text-gray-500 text-xs mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto w-full font-mono">
            <div className="mb-8 border-b border-gray-800 pb-4">
                <h2 className="text-2xl font-bold text-white uppercase tracking-[0.2em]">
                    [ TOOL_REGISTRY ]
                </h2>
                <p className="text-gray-500 mt-2 text-xs uppercase tracking-widest">
                    Manage and monitor external security packages.
                </p>
            </div>

            <div className="bg-black border-2 border-gray-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white text-black text-xs uppercase tracking-[0.2em] font-bold">
                            <th className="py-3 px-6">Package</th>
                            <th className="py-3 px-6">Status</th>
                            <th className="py-3 px-6">Version</th>
                            <th className="py-3 px-6 hidden md:table-cell">Path</th>
                            <th className="py-3 px-6 text-right">Privileges</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {tools.map((t, i) => (
                            <tr
                                key={i}
                                onClick={() => navigate(`/tools/${t.name}`)}
                                className="hover:bg-gray-900 transition-colors duration-150 group cursor-pointer"
                            >
                                <td className="py-4 px-6">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-300 group-hover:text-white uppercase tracking-wider">{t.name}</span>
                                            <span className="text-[10px] text-black bg-gray-600 font-bold uppercase tracking-widest px-2 py-0.5 hidden md:inline-block border border-gray-600 group-hover:bg-white transition-colors">{t.category}</span>
                                        </div>
                                        {t.description && (
                                            <span className="text-xs text-gray-500 mt-2 line-clamp-1 border-l-2 border-gray-800 pl-2">&gt;&nbsp;{t.description}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    {t.installed ? (
                                        <span className="inline-flex items-center gap-2 text-xs font-bold text-white tracking-widest uppercase">
                                            [OK]
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 tracking-widest uppercase">
                                            [MISSING]
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-gray-300 text-xs">
                                    {t.version ? (
                                        <span
                                            className="inline-block max-w-[150px] truncate align-middle border border-gray-700 px-2 py-1 text-gray-300 group-hover:border-white transition-colors"
                                            title={t.version}
                                        >
                                            {formatVersion(t.version)}
                                        </span>
                                    ) : (
                                        <span className="text-gray-700 font-bold">---</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-xs hidden md:table-cell">
                                    {t.path ? (
                                        <span className="text-gray-500 truncate max-w-[200px] inline-block hover:text-white transition-colors" title={t.path}>
                                            {t.path}
                                        </span>
                                    ) : (
                                        <span className="text-gray-700 italic">N/A</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    {t.needsRoot ? (
                                        <span className="inline-flex items-center px-2 py-1 text-xs font-bold border-2 border-white text-white bg-black">
                                            SUDO
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-gray-500">
                                            USER
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {tools.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-500 uppercase tracking-widest text-xs font-bold">
                                    {">_ DATABASE_EMPTY"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
