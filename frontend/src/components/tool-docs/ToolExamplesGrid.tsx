import { main } from "../../../wailsjs/go/models";
import ExampleCard from "./ExampleCard";

interface ToolExamplesGridProps {
    examples: main.ToolExample[];
}

export default function ToolExamplesGrid({ examples }: ToolExamplesGridProps) {
    if (!examples || examples.length === 0) {
        return (
            <div className="p-8 text-center bg-black border-2 border-dashed border-gray-800 font-mono uppercase tracking-widest text-xs">
                <p className="text-gray-600">NO_EXAMPLES_FOUND</p>
            </div>
        );
    }

    // Sort examples by sortOrder
    const sortedExamples = [...examples].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {sortedExamples.map((example) => (
                <ExampleCard key={example.id} example={example} />
            ))}
        </div>
    );
}
