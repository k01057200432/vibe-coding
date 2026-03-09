"use client";

import { useState } from "react";
import {
  useWatchlist,
  useUpdateWatchlistItem,
  type WatchlistItem,
} from "@/lib/queries/watchlist";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const MAX_STREAM = 30;

type CategoryTab = "stock_etf" | "sector" | "index" | "commodity";

const TABS: { key: CategoryTab; label: string; categories: string[] }[] = [
  { key: "stock_etf", label: "Stock/ETF", categories: ["stock", "etf"] },
  { key: "sector", label: "Sector", categories: ["sector"] },
  { key: "index", label: "Index", categories: ["index"] },
  { key: "commodity", label: "Commodity", categories: ["commodity"] },
];

// stock/etf만 Alpaca WS 스트리밍 대상
const STREAMABLE_CATEGORIES = new Set(["stock", "etf"]);

const CATEGORY_LABELS: Record<string, string> = {
  stock: "주식",
  etf: "ETF",
  futures: "선물",
  sector: "섹터",
  index: "지수",
  commodity: "원자재",
};

const CATEGORY_COLORS: Record<string, string> = {
  stock: "var(--accent-blue, #60a5fa)",
  etf: "var(--accent-green, #34d399)",
  futures: "var(--accent-orange, #fb923c)",
  sector: "var(--accent-purple, #a78bfa)",
  index: "var(--accent-amber, #fbbf24)",
  commodity: "var(--accent-orange, #fb923c)",
};

function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? "var(--text-muted)";
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
      style={{ color, border: `1px solid ${color}40`, background: `${color}10` }}
    >
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}

function WatchlistRow({
  item,
  tradesCount,
  quotesCount,
  streamable,
}: {
  item: WatchlistItem;
  tradesCount: number;
  quotesCount: number;
  streamable: boolean;
}) {
  const update = useUpdateWatchlistItem();

  const tradesDisabled = !streamable || (!item.trades && tradesCount >= MAX_STREAM);
  const quotesDisabled = !streamable || (!item.quotes && quotesCount >= MAX_STREAM);
  const barsDisabled = !streamable;

  return (
    <TableRow className="border-0">
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium" style={{ color: "var(--text-primary)" }}>
            {item.symbol}
          </span>
          <CategoryBadge category={item.category} />
        </div>
        {item.description && (
          <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {item.description}
          </div>
        )}
      </TableCell>
      <TableCell className="text-center">
        <Checkbox
          checked={item.bars}
          onCheckedChange={(checked) =>
            update.mutate(
              { symbol: item.symbol, bars: !!checked },
              { onError: (e) => toast.error(e.message) }
            )
          }
          disabled={update.isPending || barsDisabled}
        />
      </TableCell>
      <TableCell className="text-center">
        <Checkbox
          checked={item.trades}
          onCheckedChange={(checked) =>
            update.mutate(
              { symbol: item.symbol, trades: !!checked },
              { onError: (e) => toast.error(e.message) }
            )
          }
          disabled={update.isPending || tradesDisabled}
        />
      </TableCell>
      <TableCell className="text-center">
        <Checkbox
          checked={item.quotes}
          onCheckedChange={(checked) =>
            update.mutate(
              { symbol: item.symbol, quotes: !!checked },
              { onError: (e) => toast.error(e.message) }
            )
          }
          disabled={update.isPending || quotesDisabled}
        />
      </TableCell>
    </TableRow>
  );
}

export function WatchlistManager() {
  const [activeTab, setActiveTab] = useState<CategoryTab>("stock_etf");
  const { data, isLoading } = useWatchlist();

  if (isLoading) return <div className="empty-state">로딩중...</div>;

  const items = data?.data ?? [];
  const tradesCount = data?.tradesCount ?? 0;
  const quotesCount = data?.quotesCount ?? 0;

  const currentTabDef = TABS.find((t) => t.key === activeTab)!;
  const filtered = items.filter((item) => currentTabDef.categories.includes(item.category));
  const streamable = currentTabDef.categories.some((c) => STREAMABLE_CATEGORIES.has(c));

  return (
    <div className="space-y-4">
      {/* 카테고리 탭 */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <nav className="tab-nav">
          {TABS.map((tab) => {
            const count = items.filter((item) => tab.categories.includes(item.category)).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`tab-nav-item ${activeTab === tab.key ? "active" : ""}`}
              >
                {tab.label}
                {count > 0 && (
                  <span className="ml-1 text-[10px] font-mono opacity-60">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          {streamable ? (
            <>
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                Trades: {tradesCount}/{MAX_STREAM}
              </span>
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                Quotes: {quotesCount}/{MAX_STREAM}
              </span>
            </>
          ) : (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Yahoo 일봉만 수집 (실시간 스트리밍 없음)
            </span>
          )}
        </div>
      </div>

      {/* 테이블 */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          {currentTabDef.label} 워치리스트가 비어 있습니다
        </div>
      ) : (
        <div className="obsidian-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="[&_tr]:border-0">
                <TableRow className="border-0">
                  <TableHead>심볼</TableHead>
                  <TableHead className="text-center">Bars</TableHead>
                  <TableHead className="text-center">Trades</TableHead>
                  <TableHead className="text-center">Quotes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <WatchlistRow
                    key={item.symbol}
                    item={item}
                    tradesCount={tradesCount}
                    quotesCount={quotesCount}
                    streamable={streamable}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
