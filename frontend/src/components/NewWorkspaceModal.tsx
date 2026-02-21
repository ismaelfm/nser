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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-[#0a0f18] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-800/80 flex justify-between items-center bg-gray-900/40">
                    <h3 className="text-xl font-bold text-gray-100">New Workspace</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-300">Workspace Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#05080f] border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                            placeholder="e.g. Acme Corp External"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-300">Default Target</label>
                        <input
                            type="text"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full bg-[#05080f] border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600 font-mono text-sm"
                            placeholder="e.g. 192.168.1.0/24 or example.com"
                        />
                        <p className="text-xs text-gray-500">Pre-fills the target input when running tools.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-300">Description</label>
                        <textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full bg-[#05080f] border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600 min-h-[80px] resize-none"
                            placeholder="Optional context..."
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
                        >
                            {loading ? "Creating..." : "Create Workspace"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
