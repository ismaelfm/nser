import { tool } from "../../../wailsjs/go/models";

interface ToolDocHeaderProps {
    toolHealth?: tool.ToolHealth;
}

export default function ToolDocHeader({ toolHealth }: ToolDocHeaderProps) {
    if (!toolHealth) return null;

    const getCategoryStyles = (category: string) => {
        return 'bg-white text-black border-white';
    };

    return (
        <div className="mb-8 border-b-2 border-white pb-6 font-mono">
            <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-white tracking-[0.2em] uppercase">
                    {toolHealth.name}
                </h1>

                <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold border-2 uppercase tracking-widest ${getCategoryStyles(toolHealth.category)}`}>
                    {toolHealth.category}
                </span>

                {toolHealth.installed ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold text-white tracking-widest uppercase border border-white ml-auto">
                        [INSTALLED {toolHealth.version ? `V${toolHealth.version}` : ''}]
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold text-gray-500 tracking-widest uppercase border border-gray-800 ml-auto">
                        [NOT_INSTALLED]
                    </span>
                )}
            </div>

            {toolHealth.installHint && !toolHealth.installed && (
                <div className="mb-4 bg-black border-2 border-white p-4 text-white text-xs uppercase tracking-widest">
                    <span className="font-bold block mb-2 underline">INSTALL_HINT:</span>
                    {toolHealth.installHint}
                </div>
            )}

            <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">
                External security tool for {toolHealth.category.toLowerCase()} phase.
            </p>
        </div>
    );
}
