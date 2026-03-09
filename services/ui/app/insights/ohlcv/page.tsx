"use client";

import { useState, useMemo } from "react";
import { useWatchlist, type WatchlistItem } from "@/lib/queries/watchlist";
import { useOhlcvMulti, useOhlcv, type OhlcvBar } from "@/lib/queries/intel";
import { LayoutGrid, Table2, ChevronDown, ChevronUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";

type CategoryFilter = "all" | "stock_etf" | "sector" | "index" | "commodity";
type ViewMode = "grid" | "table";

const FILTERS: { key: CategoryFilter; label: string; categories: string[] }[] = [
  { key: "stock_etf", label: "Stock/ETF", categories: ["stock", "etf"] },
  { key: "sector", label: "Sector", categories: ["sector"] },
  { key: "index", label: "Index", categories: ["index"] },
  { key: "commodity", label: "Commodity", categories: ["commodity"] },
  { key: "all", label: "전체", categories: [] },
];

function getChangeInfo(bars: OhlcvBar[]) {
  if (bars.length < 2) return { change: 0, latest: 0 };
  const latest = parseFloat(bars[bars.length - 1].close);
  const prev = parseFloat(bars[bars.length - 2].close);
  return { change: prev !== 0 ? ((latest - prev) / prev) * 100 : 0, latest };
}

function formatNum(n: number, decimals = 2): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(decimals);
}

/* 카드용 스파크라인 — 종가 추이 + 그라데이션 fill */
function Sparkline({ bars }: { bars: OhlcvBar[] }) {
  if (bars.length < 2) return <div className="h-10 w-full" />;
  const data = bars.map((b) => ({ close: parseFloat(b.close) }));
  const first = data[0].close;
  const last = data[data.length - 1].close;
  const positive = last >= first;
  const stroke = positive ? "#22c55e" : "#ef4444";
  const values = data.map((d) => d.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.05 || 1;

  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`spark-${positive ? "up" : "down"}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <YAxis domain={[min - pad, max + pad]} hide />
        <Area
          type="monotone"
          dataKey="close"
          stroke={stroke}
          strokeWidth={1.5}
          fill={`url(#spark-${positive ? "up" : "down"})`}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* 상세 캔들차트 — OHLC + 거래량 */
function CandleChart({ symbol }: { symbol: string }) {
  const { data, isLoading } = useOhlcv(symbol, 90);
  if (isLoading)
    return (
      <div
        className="h-52 animate-pulse rounded"
        style={{ background: "var(--bg-tertiary)" }}
      />
    );
  const bars = data?.data ?? [];
  if (bars.length === 0)
    return (
      <div
        className="text-xs text-center py-4"
        style={{ color: "var(--text-muted)" }}
      >
        데이터 없음
      </div>
    );

  const chartData = bars.map((b) => {
    const o = parseFloat(b.open);
    const h = parseFloat(b.high);
    const l = parseFloat(b.low);
    const c = parseFloat(b.close);
    const up = c >= o;
    return {
      date: new Date(b.ts).toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      }),
      open: o,
      high: h,
      low: l,
      close: c,
      // Recharts bar: [low, high] for wick, [open, close] for body
      bodyLow: up ? o : c,
      bodyHigh: up ? c : o,
      wickLow: l,
      wickHigh: h,
      up,
      volume: parseInt(b.volume),
    };
  });

  const allPrices = chartData.flatMap((d) => [d.low, d.high]);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const pad = (maxP - minP) * 0.05 || 1;

  return (
    <div className="p-3 space-y-1" style={{ background: "var(--bg-secondary)" }}>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-primary)"
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minP - pad, maxP + pad]}
            tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            tickFormatter={(v) => `$${formatNum(v)}`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border-primary)",
              borderRadius: "6px",
              fontSize: "12px",
            }}
            formatter={(v: number | undefined, name: string | undefined) => {
              const labels: Record<string, string> = {
                open: "시가",
                high: "고가",
                low: "저가",
                close: "종가",
              };
              return [`$${(v ?? 0).toFixed(2)}`, labels[name ?? ""] ?? name];
            }}
          />
          <Line
            type="monotone"
            dataKey="high"
            stroke="var(--text-muted)"
            strokeWidth={0.5}
            dot={false}
            opacity={0.3}
          />
          <Line
            type="monotone"
            dataKey="low"
            stroke="var(--text-muted)"
            strokeWidth={0.5}
            dot={false}
            opacity={0.3}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="var(--accent-blue, #60a5fa)"
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="open"
            stroke="var(--text-muted)"
            strokeWidth={0.8}
            dot={false}
            strokeDasharray="4 2"
            opacity={0.5}
          />
        </ComposedChart>
      </ResponsiveContainer>
      {/* 거래량 바 */}
      <ResponsiveContainer width="100%" height={40}>
        <BarChart data={chartData}>
          <XAxis dataKey="date" hide />
          <YAxis hide />
          <Bar dataKey="volume" isAnimationActive={false}>
            {chartData.map((d, i) => (
              <Cell
                key={i}
                fill={
                  d.up ? "var(--profit, #22c55e)" : "var(--loss, #ef4444)"
                }
                opacity={0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SparklineCard({
  symbol,
  description,
  bars,
}: {
  symbol: string;
  description: string;
  bars: OhlcvBar[];
}) {
  const { change, latest } = getChangeInfo(bars);
  const positive = change >= 0;

  return (
    <div className="obsidian-card p-3 select-none">
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-sm font-mono font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {symbol}
        </span>
        <span
          className="text-xs font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          ${latest.toFixed(2)}
        </span>
      </div>
      {description && (
        <div
          className="text-[10px] mb-1 truncate"
          style={{ color: "var(--text-muted)" }}
        >
          {description}
        </div>
      )}
      <Sparkline bars={bars} />
      <div
        className="text-sm font-mono font-semibold mt-1"
        style={{
          color: positive
            ? "var(--profit, #22c55e)"
            : "var(--loss, #ef4444)",
        }}
      >
        {positive ? "+" : ""}
        {change.toFixed(2)}%
      </div>
    </div>
  );
}

function TableView({
  symbols,
  ohlcvData,
  descriptionMap,
}: {
  symbols: string[];
  ohlcvData: Record<string, OhlcvBar[]>;
  descriptionMap: Record<string, string>;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="obsidian-card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-0">
              <TableHead>심볼</TableHead>
              <TableHead className="text-right">현재가</TableHead>
              <TableHead className="text-right">변동률</TableHead>
              <TableHead className="text-right hidden sm:table-cell">
                거래량
              </TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {symbols.flatMap((sym) => {
              const bars = ohlcvData[sym] ?? [];
              const { change, latest } = getChangeInfo(bars);
              const lastBar = bars[bars.length - 1];
              const volume = lastBar ? parseInt(lastBar.volume) : 0;
              const positive = change >= 0;
              const isExpanded = expanded === sym;
              const desc = descriptionMap[sym];

              const rows = [
                <TableRow
                  key={sym}
                  className="cursor-pointer border-0"
                  onClick={() => setExpanded(isExpanded ? null : sym)}
                >
                  <TableCell>
                    <span
                      className="font-mono font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {sym}
                    </span>
                    {desc && (
                      <span
                        className="ml-1.5 text-[11px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {desc}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${latest.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono font-semibold ${positive ? "pnl-positive" : "pnl-negative"}`}
                  >
                    {positive ? "+" : ""}
                    {change.toFixed(2)}%
                  </TableCell>
                  <TableCell
                    className="text-right font-mono text-xs hidden sm:table-cell"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {formatNum(volume, 0)}
                  </TableCell>
                  <TableCell>
                    {isExpanded ? (
                      <ChevronUp
                        className="h-3.5 w-3.5"
                        style={{ color: "var(--text-muted)" }}
                      />
                    ) : (
                      <ChevronDown
                        className="h-3.5 w-3.5"
                        style={{ color: "var(--text-muted)" }}
                      />
                    )}
                  </TableCell>
                </TableRow>,
              ];
              if (isExpanded) {
                rows.push(
                  <TableRow key={`${sym}-detail`} className="border-0">
                    <TableCell colSpan={5} className="p-0">
                      <CandleChart symbol={sym} />
                    </TableCell>
                  </TableRow>,
                );
              }
              return rows;
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function OhlcvPage() {
  const [filter, setFilter] = useState<CategoryFilter>("stock_etf");
  const [view, setView] = useState<ViewMode>("grid");

  const { data: watchlistData, isLoading: wlLoading } = useWatchlist();

  const filteredItems = useMemo(() => {
    const items = watchlistData?.data ?? [];
    if (filter === "all") return items;
    const filterDef = FILTERS.find((f) => f.key === filter)!;
    return items.filter((i) => filterDef.categories.includes(i.category));
  }, [watchlistData, filter]);

  const filteredSymbols = useMemo(
    () => filteredItems.map((i) => i.symbol),
    [filteredItems],
  );

  const descriptionMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const item of filteredItems) {
      if (item.description) map[item.symbol] = item.description;
    }
    return map;
  }, [filteredItems]);

  const { data: ohlcvData, isLoading: ohlcvLoading } = useOhlcvMulti(
    filteredSymbols,
    30,
  );

  const isLoading = wlLoading || ohlcvLoading;

  return (
    <div className="space-y-4">
      {/* 필터 + 뷰 토글 */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <nav className="tab-nav">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`tab-nav-item ${filter === f.key ? "active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </nav>
        <nav className="tab-nav">
          <button
            className={`tab-nav-item flex items-center justify-center h-7 w-7 !p-0 ${view === "grid" ? "active" : ""}`}
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            className={`tab-nav-item flex items-center justify-center h-7 w-7 !p-0 ${view === "table" ? "active" : ""}`}
            onClick={() => setView("table")}
          >
            <Table2 className="h-3.5 w-3.5" />
          </button>
        </nav>
      </div>

      {/* 콘텐츠 */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="obsidian-card h-24 animate-pulse" />
          ))}
        </div>
      ) : filteredSymbols.length === 0 ? (
        <div className="empty-state">해당 카테고리에 종목이 없습니다</div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredSymbols.map((sym) => (
            <SparklineCard
              key={sym}
              symbol={sym}
              description={descriptionMap[sym] ?? ""}
              bars={ohlcvData?.data?.[sym] ?? []}
            />
          ))}
        </div>
      ) : (
        <TableView
          symbols={filteredSymbols}
          ohlcvData={ohlcvData?.data ?? {}}
          descriptionMap={descriptionMap}
        />
      )}
    </div>
  );
}
