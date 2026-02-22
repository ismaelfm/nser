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
                <div className="flex items-center justify-center gap-3">
                    <div className="h-2 w-2 bg-white rounded-none animate-ping"></div>
                    <span className="text-white text-xs tracking-widest uppercase font-mono">Loading SYS Data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-black border border-white max-w-lg mx-auto mt-20 font-mono">
                <p className="text-white font-bold uppercase tracking-widest">ERROR: Workspace Load Failed</p>
                <p className="text-gray-500 text-sm mt-4">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto w-full font-mono">
            <div className="flex items-center justify-between mb-12 border-b border-gray-800 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-[0.2em]">
                        [ WORKSPACES ]
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm uppercase tracking-wider">
                        Select a target environment to begin.
                    </p>
                </div>
                <button
                    onClick={() => setIsNewModalOpen(true)}
                    className="bg-white hover:bg-gray-200 text-black px-6 py-2 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-3 border-2 border-white"
                >
                    <span className="text-lg leading-none">+</span>
                    New Target
                </button>
            </div>

            <NewWorkspaceModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onCreated={loadWorkspaces}
            />

            {workspaces.length === 0 ? (
                <div className="text-center py-24 bg-black border border-gray-800">
                    <div className="text-gray-600 mb-6 font-mono text-4xl">_</div>
                    <p className="text-gray-300 text-lg uppercase tracking-widest">No Targets Identified</p>
                    <p className="text-gray-600 text-sm mt-4 max-w-md mx-auto">
                        Awaiting initialization. Create a new target workspace to commence operations.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workspaces.map((ws) => (
                        <div
                            key={ws.id}
                            onClick={() => onOpenWorkspace(ws.id)}
                            className="group bg-black border border-gray-800 hover:border-white p-6 cursor-pointer transition-all duration-200 flex flex-col h-full relative overflow-hidden"
                        >
                            {/* Decorative terminal corner bracket */}
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-transparent group-hover:border-white transition-colors" />

                            <div className="flex justify-between items-start mb-6">
                                <div className="text-gray-500 font-mono text-xs tracking-widest border border-gray-800 px-2 py-1 uppercase group-hover:bg-white group-hover:text-black group-hover:border-white transition-colors">
                                    SYS_{ws.id < 10 ? `0${ws.id}` : ws.id}
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, ws.id)}
                                    className="text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                    title="PURGE"
                                >
                                    [X]
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-gray-200 mb-3 truncate group-hover:text-white transition-colors uppercase tracking-widest">
                                {ws.name}
                            </h3>
                            <p className="text-gray-500 text-xs mb-8 flex-1 line-clamp-2 font-mono">
                                {ws.description ? `> ${ws.description}` : "> NO DATA AVAILABLE"}
                            </p>

                            <div className="pt-4 border-t border-gray-900 mt-auto flex items-center justify-between text-xs text-gray-600">
                                <div className="flex items-center gap-2 uppercase tracking-wider">
                                    <span>INIT:</span>
                                    {new Date(ws.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-transparent group-hover:text-white transition-colors uppercase tracking-widest font-bold text-[10px]">
                                    ACCESS_
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
