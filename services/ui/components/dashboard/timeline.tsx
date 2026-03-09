"use client";

import { useDashboardTimeline } from "@/lib/queries/dashboard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

interface TimelineItem {
  kind: string;
  id: string;
  createdAt: string;
  title: string;
  tone: string;
  value: number | null;
  details?: {
    strategy?: string;
    symbol?: string;
    side?: string;
    qty?: number;
    price?: number;
    commission?: number;
  };
}

export function Timeline() {
  const { data, isLoading } = useDashboardTimeline(20);

  if (isLoading) {
    return (
      <div className="obsidian-card p-4">
        <div className="text-sm font-semibold mb-3">타임라인</div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 bg-elevated rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const items: TimelineItem[] = data ?? [];

  return (
    <div className="obsidian-card p-4 overflow-hidden min-w-0">
      <div className="text-sm font-semibold mb-3">타임라인</div>

      {items.length === 0 ? (
        <div className="empty-state" style={{ padding: "1.5rem 1rem" }}>
          거래 없음
        </div>
      ) : (
        <Accordion type="multiple" className="max-h-72 overflow-y-auto overflow-x-hidden">
          {items.map((item) => {
            const isTrade = item.kind === "trade";
            const isBuy = item.title.includes("BUY") || item.title.includes("매수");
            const icon = isTrade ? (isBuy ? "▲" : "▼") : "●";
            const iconClass = isTrade
              ? isBuy
                ? "tl-trade-buy"
                : "tl-trade-sell"
              : item.tone === "warning"
                ? "text-warning"
                : item.tone === "critical"
                  ? "text-loss"
                  : "text-muted-foreground";

            return (
              <AccordionItem
                key={`${item.kind}-${item.id}`}
                value={`${item.kind}-${item.id}`}
                className="border-b border-subtle"
              >
                <AccordionTrigger className="py-2 hover:no-underline hover:bg-elevated rounded px-2 -mx-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0 text-left">
                    <span className={`text-sm shrink-0 ${iconClass}`}>{icon}</span>
                    <span className="flex-1 truncate text-xs font-mono text-[var(--text-secondary)]">
                      {item.title}
                    </span>
                    {item.value != null && (
                      <span
                        className={`font-mono-num text-xs font-semibold shrink-0 ${
                          item.value >= 0 ? "pnl-positive" : "pnl-negative"
                        }`}
                      >
                        {item.value >= 0 ? "+" : ""}${item.value.toFixed(2)}
                      </span>
                    )}
                    <span className="font-mono text-[0.625rem] text-[var(--text-muted)] shrink-0">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-2">
                  <div className="bg-elevated rounded-lg p-3 text-xs space-y-1.5">
                    {item.details ? (
                      <>
                        {item.details.strategy && (
                          <div className="flex justify-between">
                            <span className="text-[var(--text-muted)]">전략</span>
                            <span className="text-[var(--text-secondary)]">{item.details.strategy}</span>
                          </div>
                        )}
                        {item.details.symbol && (
                          <div className="flex justify-between">
                            <span className="text-[var(--text-muted)]">심볼</span>
                            <span className="font-mono text-[var(--info)]">{item.details.symbol}</span>
                          </div>
                        )}
                        {item.details.side && (
                          <div className="flex justify-between">
                            <span className="text-[var(--text-muted)]">방향</span>
                            <span className={item.details.side === "buy" ? "text-profit" : "text-loss"}>
                              {item.details.side.toUpperCase()}
                            </span>
                          </div>
                        )}
                        {item.details.qty != null && (
                          <div className="flex justify-between">
                            <span className="text-[var(--text-muted)]">수량</span>
                            <span className="font-mono-num">{item.details.qty}</span>
                          </div>
                        )}
                        {item.details.price != null && (
                          <div className="flex justify-between">
                            <span className="text-[var(--text-muted)]">가격</span>
                            <span className="font-mono-num">${item.details.price.toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[var(--text-muted)]">
                        {new Date(item.createdAt).toLocaleString("ko-KR")}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
