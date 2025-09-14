// web/src/components/MarkdownView.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // Code highlighting style

type Props = { children: string };

export default function MarkdownView({ children }: Props) {
  const content = (children || '').trim();
  if (!content) return <div className="text-muted">—</div>;

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

