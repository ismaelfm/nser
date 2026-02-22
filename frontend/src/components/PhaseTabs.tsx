export type Phase = "recon" | "scanning" | "exploit";

interface PhaseTabsProps {
    activePhase: Phase;
    onPhaseChange: (phase: Phase) => void;
}

export default function PhaseTabs({ activePhase, onPhaseChange }: PhaseTabsProps) {
    const tabs: { id: Phase; label: string }[] = [
        { id: "recon", label: "RECON" },
        { id: "scanning", label: "SCANNING" },
        { id: "exploit", label: "EXPLOIT" },
    ];

    return (
        <div className="flex bg-black border-b border-gray-800 font-mono">
            {tabs.map((tab) => {
                const isActive = activePhase === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onPhaseChange(tab.id)}
                        className={`flex items-center gap-2 px-8 py-4 border-b-2 text-sm font-bold tracking-[0.2em] transition-all uppercase ${isActive
                            ? 'border-white text-black bg-white'
                            : 'border-transparent text-gray-500 hover:text-white hover:bg-gray-900'
                            }`}
                    >
                        {isActive ? `[ ${tab.label} ]` : tab.label}
                    </button>
                );
            })}
        </div>
    );
}
