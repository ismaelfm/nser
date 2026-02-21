import { tool } from "../../../wailsjs/go/models";

interface ToolDocHeaderProps {
    toolHealth?: tool.ToolHealth;
}

export default function ToolDocHeader({ toolHealth }: ToolDocHeaderProps) {
    if (!toolHealth) return null;

    const getCategoryStyles = (category: string) => {
        const lower = category.toLowerCase();
        if (lower === 'recon' || lower === 'reconnaissance') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        if (lower === 'scanning') return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        if (lower === 'exploit' || lower === 'exploitation') return 'bg-red-500/10 text-red-400 border-red-500/20';
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    return (
        <div className="mb-8 border-b border-gray-800/60 pb-8">
            <div className="flex items-center gap-4 mb-4">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 tracking-tight capitalize">
                    {toolHealth.name}
                </h1>

                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${getCategoryStyles(toolHealth.category)}`}>
                    {toolHealth.category}
                </span>

                {toolHealth.installed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-auto">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                        Installed {toolHealth.version ? `v${toolHealth.version}` : ''}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 ml-auto">
                        <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"></div>
                        Not Installed
                    </span>
                )}
            </div>

            {toolHealth.installHint && !toolHealth.installed && (
                <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-amber-200/80 text-sm">
                    <span className="font-semibold text-amber-400 block mb-1">Installation hint:</span>
                    {toolHealth.installHint}
                </div>
            )}

            <p className="text-xl text-gray-400 mt-2">
                External security tool for {toolHealth.category.toLowerCase()} phase.
            </p>
        </div>
    );
}
