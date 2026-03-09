"use client";

import { useEffect, useRef, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
});

function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
    mermaid.render(id, code).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg;
    }).catch(() => {
      if (ref.current) ref.current.textContent = code;
    });
  }, [code]);

  return <div ref={ref} className="my-4 flex justify-center overflow-x-auto" />;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
}: {
  content: string;
}) {
  return (
    <div className="prose prose-invert prose-sm max-w-none select-text" style={{ color: 'var(--text-secondary)' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        children={content}
        components={{
          code({ className, children, ...props }) {
            const match = /language-mermaid/.exec(className || "");
            const code = String(children).replace(/\n$/, "");
            if (match) {
              return <MermaidBlock code={code} />;
            }
            if (!className) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded text-sm font-mono"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--accent-bright)' }}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="rounded-lg p-4 overflow-x-auto" style={{ background: 'var(--bg-elevated)' }}>
                <code className={`${className} font-mono`} style={{ color: 'var(--text-primary)' }} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full text-sm" style={{ color: 'var(--text-secondary)' }}>{children}</table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th
                className="px-3 py-2 text-left font-medium text-xs uppercase"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
              >
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-3 py-2" style={{ borderColor: 'var(--border-subtle)' }}>{children}</td>
            );
          },
          h1({ children }) {
            return <h1 style={{ color: 'var(--text-primary)' }}>{children}</h1>;
          },
          h2({ children }) {
            return <h2 style={{ color: 'var(--text-primary)' }}>{children}</h2>;
          },
          h3({ children }) {
            return <h3 style={{ color: 'var(--text-primary)' }}>{children}</h3>;
          },
          strong({ children }) {
            return <strong style={{ color: 'var(--text-primary)' }}>{children}</strong>;
          },
          a({ children, href, ...props }) {
            return (
              <a href={href} style={{ color: 'var(--accent-bright)' }} {...props}>
                {children}
              </a>
            );
          },
        }}
      />
    </div>
  );
});
