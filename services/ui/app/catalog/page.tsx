"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import { ChevronDown, ChevronRight, TrendingUp, Shield, Clock, Zap } from "lucide-react";

// Mermaid init (dark theme)
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    darkMode: true,
    background: "transparent",
    primaryColor: "#6366f1",
    primaryTextColor: "#e2e8f0",
    primaryBorderColor: "#475569",
    lineColor: "#64748b",
    secondaryColor: "#1e293b",
    tertiaryColor: "#0f172a",
  },
});

interface StrategyType {
  type: string;
  label: string;
  description: string;
  createdAt: string | null;
  updatedAt: string | null;
}

const strategyMeta: Record<string, { color: string; icon: typeof TrendingUp; tagline: string }> = {
  swing:            { color: "#10b981", icon: TrendingUp, tagline: "추세 추종" },
  contrarian:       { color: "#f59e0b", icon: Shield,     tagline: "역발상" },
  thursday_fear:    { color: "#ef4444", icon: Zap,        tagline: "데이트레이드" },
  monthly_balance:  { color: "#6366f1", icon: Clock,      tagline: "리밸런싱" },
  mean_reversion:   { color: "#06b6d4", icon: TrendingUp, tagline: "평균회귀" },
  sector_rotation:  { color: "#8b5cf6", icon: TrendingUp, tagline: "로테이션" },
  earnings_drift:   { color: "#ec4899", icon: Zap,        tagline: "이벤트" },
  pairs_trading:    { color: "#14b8a6", icon: Shield,     tagline: "시장중립" },
};

const defaultMeta = { color: "#64748b", icon: TrendingUp, tagline: "전략" };

/** Renders ```mermaid code blocks as SVG diagrams */
function MermaidBlock({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");

  useEffect(() => {
    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
    mermaid.render(id, chart).then(({ svg }) => setSvg(svg)).catch(() => {});
  }, [chart]);

  return (
    <div
      ref={ref}
      className="my-3 flex justify-center overflow-x-auto rounded-lg border border-subtle bg-[var(--bg-base)] p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/** Custom code component: mermaid → diagram, rest → normal pre/code */
function CodeBlock({ className, children, ...props }: any) {
  const match = /language-(\w+)/.exec(className || "");
  const lang = match?.[1];
  const code = String(children).replace(/\n$/, "");

  if (lang === "mermaid") {
    return <MermaidBlock chart={code} />;
  }

  // Inline code (no language)
  if (!className) {
    return <code className={className} {...props}>{children}</code>;
  }

  // Block code
  return <code className={className} {...props}>{children}</code>;
}

function StrategyCard({ strategy }: { strategy: StrategyType }) {
  const [open, setOpen] = useState(false);
  const meta = strategyMeta[strategy.type] || defaultMeta;
  const Icon = meta.icon;

  return (
    <div
      className="group overflow-hidden rounded-xl border border-subtle bg-elevated transition-all duration-200"
      style={{ borderLeftWidth: "3px", borderLeftColor: meta.color }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--bg-hover)]"
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${meta.color}18` }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color: meta.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {strategy.label}
            </h2>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
              style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
            >
              {meta.tagline}
            </span>
          </div>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            {strategy.type}
          </span>
        </div>
        <div className="shrink-0 text-[var(--text-muted)] transition-transform duration-200">
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Body — collapsible */}
      {open && strategy.description && (
        <div className="border-t border-subtle px-5 py-4">
          <div className="catalog-markdown select-text prose prose-sm prose-invert max-w-none text-[var(--text-secondary)]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{ code: CodeBlock }}
            >
              {strategy.description}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StrategyCatalogPage() {
  const [types, setTypes] = useState<StrategyType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/strategy-types")
      .then((r) => r.json())
      .then((data) => setTypes(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 animate-in">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">
            전략 카탈로그
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {types.length}개 전략 타입 — 클릭하여 상세 설명 확인
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      ) : types.length === 0 ? (
        <div className="rounded-lg border border-subtle bg-elevated p-8 text-center text-sm text-[var(--text-muted)]">
          등록된 전략 타입이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {types.map((t) => (
            <StrategyCard key={t.type} strategy={t} />
          ))}
        </div>
      )}

      {/* Markdown styling */}
      <style jsx global>{`
        .catalog-markdown h2 {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          padding-bottom: 0.25rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .catalog-markdown h2:first-child {
          margin-top: 0;
        }
        .catalog-markdown h3 {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-top: 1rem;
          margin-bottom: 0.35rem;
        }
        .catalog-markdown p {
          font-size: 0.8rem;
          line-height: 1.6;
          margin-bottom: 0.5rem;
        }
        .catalog-markdown ul,
        .catalog-markdown ol {
          font-size: 0.8rem;
          padding-left: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .catalog-markdown li {
          margin-bottom: 0.15rem;
        }
        .catalog-markdown code {
          font-size: 0.7rem;
          background: var(--bg-base);
          padding: 0.15rem 0.35rem;
          border-radius: 4px;
          color: var(--accent);
        }
        .catalog-markdown pre {
          font-size: 0.7rem;
          background: var(--bg-base);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          overflow-x: auto;
          margin-bottom: 0.75rem;
        }
        .catalog-markdown pre code {
          background: none;
          padding: 0;
          color: var(--text-secondary);
        }
        /* Table — high visibility */
        .catalog-markdown table {
          width: 100%;
          font-size: 0.75rem;
          border-collapse: separate;
          border-spacing: 0;
          margin-bottom: 0.75rem;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          overflow: hidden;
        }
        .catalog-markdown thead {
          background: rgba(255,255,255,0.1);
        }
        .catalog-markdown th {
          text-align: left;
          padding: 0.55rem 0.75rem;
          font-weight: 700;
          color: var(--text-primary);
          border-bottom: 2px solid rgba(255,255,255,0.15);
          white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .catalog-markdown td {
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          color: var(--text-primary);
        }
        .catalog-markdown tbody tr:hover {
          background: rgba(255,255,255,0.08);
        }
        .catalog-markdown tbody tr:last-child td {
          border-bottom: none;
        }
        .catalog-markdown tbody tr:nth-child(even) {
          background: rgba(255,255,255,0.05);
        }
        .catalog-markdown strong {
          color: var(--text-primary);
          font-weight: 600;
        }
        .catalog-markdown hr {
          border-color: var(--border-subtle);
          margin: 1rem 0;
        }
        .catalog-markdown blockquote {
          border-left: 3px solid var(--accent);
          padding-left: 0.75rem;
          color: var(--text-muted);
          font-style: italic;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}
