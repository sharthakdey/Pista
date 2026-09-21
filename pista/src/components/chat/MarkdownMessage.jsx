import "katex/dist/katex.min.css";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const components = {
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer noopener" />,
  table: ({ node, ...props }) => <div className="overflow-x-auto"><table {...props} /></div>,
};

function MarkdownMessage({ content }) {
  return (
    <div className="prose-pista min-w-0 break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default memo(MarkdownMessage);
