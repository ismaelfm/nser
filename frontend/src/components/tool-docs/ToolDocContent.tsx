import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ToolDocContentProps {
    markdown: string;
}

export default function ToolDocContent({ markdown }: ToolDocContentProps) {
    if (!markdown) {
        return (
            <div className="text-gray-500 font-mono uppercase tracking-widest text-xs p-8 text-center border-2 border-dashed border-gray-800">
                [ NO_DOCUMENTATION_AVAILABLE ]
            </div>
        );
    }

    return (
        <div className="prose prose-invert prose-gray max-w-none mt-6 font-mono
            prose-headings:text-white prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-widest
            prose-a:text-gray-300 prose-a:underline hover:prose-a:text-white
            prose-code:text-white prose-code:bg-gray-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:border prose-code:border-gray-800
            prose-pre:bg-black prose-pre:border-2 prose-pre:border-gray-800 prose-pre:text-gray-300 prose-pre:rounded-none
            prose-blockquote:border-l-4 prose-blockquote:border-white prose-blockquote:bg-gray-900/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:text-gray-400
            prose-th:text-white prose-th:uppercase prose-th:tracking-widest prose-td:text-gray-400 prose-tr:border-gray-800"
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
            </ReactMarkdown>
        </div>
    );
}
