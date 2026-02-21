import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ToolDocContentProps {
    markdown: string;
}

export default function ToolDocContent({ markdown }: ToolDocContentProps) {
    if (!markdown) {
        return (
            <div className="text-gray-500 italic p-8 text-center border border-dashed border-gray-700 rounded-xl">
                No documentation available for this tool.
            </div>
        );
    }

    return (
        <div className="prose prose-invert prose-blue max-w-none mt-6
            prose-headings:text-gray-200 prose-headings:font-semibold
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
            prose-code:text-emerald-300 prose-code:bg-gray-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800/80 prose-pre:text-gray-300
            prose-blockquote:border-blue-500/50 prose-blockquote:bg-blue-500/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
            prose-th:text-gray-300 prose-td:text-gray-400 prose-tr:border-gray-800/60"
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
            </ReactMarkdown>
        </div>
    );
}
