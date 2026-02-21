export type Phase = "recon" | "scanning" | "exploit";

interface PhaseTabsProps {
    activePhase: Phase;
    onPhaseChange: (phase: Phase) => void;
}

export default function PhaseTabs({ activePhase, onPhaseChange }: PhaseTabsProps) {
    const tabs: { id: Phase; label: string; icon: string; color: string }[] = [
        { id: "recon", label: "Recon", icon: "🔍", color: "blue" },
        { id: "scanning", label: "Scanning", icon: "🔬", color: "indigo" },
        { id: "exploit", label: "Exploit", icon: "💥", color: "red" },
    ];

    return (
        <div className="flex bg-[#0a0f18] border-b border-gray-800">
            {tabs.map((tab) => {
                const isActive = activePhase === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onPhaseChange(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 border-b-2 text-sm font-semibold transition-all ${isActive
                                ? tab.color === 'blue'
                                    ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                                    : tab.color === 'indigo'
                                        ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                                        : 'border-red-500 text-red-400 bg-red-500/10'
                                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
