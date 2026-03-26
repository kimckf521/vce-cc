"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function MathContent({ content }: { content: string }) {
  return (
    <div className="prose prose-base max-w-none text-gray-800 [&_.katex]:text-2xl [&_.katex-display]:text-3xl [&_p]:mb-3 [&_p:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
