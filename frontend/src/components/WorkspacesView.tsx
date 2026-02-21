import { useEffect, useState } from "react";
import { GetWorkspaces, DeleteWorkspace } from "../../wailsjs/go/main/App";
import { main } from "../../wailsjs/go/models";
import NewWorkspaceModal from "./NewWorkspaceModal";

interface WorkspacesViewProps {
    onOpenWorkspace: (id: number) => void;
}

export default function WorkspacesView({ onOpenWorkspace }: WorkspacesViewProps) {
    const [workspaces, setWorkspaces] = useState<main.Workspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);

    const loadWorkspaces = () => {
        setLoading(true);
        GetWorkspaces()
            .then((ws) => {
                setWorkspaces(ws || []);
                setLoading(false);
            })
            .catch((err) => {
                setError(String(err));
                setLoading(false);
            });
    };

    useEffect(() => {
        loadWorkspaces();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this workspace and all its data?")) {
            try {
                await DeleteWorkspace(id);
                setWorkspaces(workspaces.filter(ws => ws.id !== id));
            } catch (err) {
                console.error("Failed to delete workspace:", err);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-full">
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
            <div className="p-8 text-center bg-red-950/20 rounded-xl border border-red-900/50 max-w-lg mx-auto mt-20">
                <p className="text-red-400 font-medium">Failed to load workspaces</p>
                <p className="text-red-500/70 text-sm mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight">
                        Workspaces
                    </h2>
                    <p className="text-gray-400 mt-2 text-lg">
                        Select a workspace to begin recon and analysis.
                    </p>
                </div>
                <button
                    onClick={() => setIsNewModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Workspace
                </button>
            </div>

            <NewWorkspaceModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onCreated={loadWorkspaces}
            />

            {workspaces.length === 0 ? (
                <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
                    <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <p className="text-gray-400 text-lg font-medium">No workspaces found</p>
                    <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                        Create your first workspace to start organizing your security engagements and tool runs.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workspaces.map((ws) => (
                        <div
                            key={ws.id}
                            onClick={() => onOpenWorkspace(ws.id)}
                            className="group bg-gray-900/40 hover:bg-gray-800/80 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-blue-500/10 flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-1 rounded-md">ID: {ws.id}</span>
                                    <button
                                        onClick={(e) => handleDelete(e, ws.id)}
                                        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-900/30"
                                        title="Delete Workspace"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-100 mb-2 truncate group-hover:text-blue-300 transition-colors">
                                {ws.name}
                            </h3>
                            <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-2">
                                {ws.description || "No description provided."}
                            </p>

                            <div className="pt-4 border-t border-gray-800/60 mt-auto flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    {new Date(ws.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-blue-400/0 group-hover:text-blue-400 transition-colors">
                                    Open
                                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
