import { useState } from "react";
import { CreateWorkspace } from "../../wailsjs/go/main/App";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function NewWorkspaceModal({ isOpen, onClose, onCreated }: Props) {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [target, setTarget] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Name is required");
            return;
        }

        setLoading(true);
        try {
            await CreateWorkspace(name, desc, target);
            onCreated();
            onClose();
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 font-mono">
            <div className="bg-black border-2 border-white rounded-none w-full max-w-md shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden">
                <div className="p-6 border-b border-white flex justify-between items-center bg-black">
                    <h3 className="text-xl font-bold text-white uppercase tracking-[0.2em]">[ NEW_TARGET ]</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        [X]
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-black border-2 border-white text-white p-3 font-bold uppercase tracking-widest text-xs">
                            [ERROR] {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-white uppercase tracking-widest">Target Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black border-2 border-gray-800 text-white rounded-none px-4 py-2.5 outline-none focus:border-white transition-colors placeholder:text-gray-800 uppercase"
                            placeholder="CORP.INTERNAL"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-white uppercase tracking-widest">Base IP/Domain</label>
                        <input
                            type="text"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full bg-black border-2 border-gray-800 text-white rounded-none px-4 py-2.5 outline-none focus:border-white transition-colors placeholder:text-gray-800 uppercase"
                            placeholder="192.168.1.0/24"
                        />
                        <p className="text-xs text-gray-600 uppercase tracking-widest mt-2">{"> DEFAULT_TARGET_FOR_TOOLS"}</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-white uppercase tracking-widest">Notes</label>
                        <textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full bg-black border-2 border-gray-800 text-white rounded-none px-4 py-2.5 outline-none focus:border-white transition-colors placeholder:text-gray-800 min-h-[80px] resize-none"
                            placeholder="MISSION_BRIEF..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-4 border-t border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-xs font-bold text-gray-500 hover:text-white border-2 border-transparent hover:border-gray-500 transition-colors uppercase tracking-widest"
                        >
                            ABORT
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="bg-white hover:bg-gray-300 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-black px-6 py-2 rounded-none text-xs font-bold uppercase tracking-[0.2em] transition-colors border-2 border-transparent disabled:border-gray-800"
                        >
                            {loading ? "INITIALIZING..." : "INITIALIZE"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
