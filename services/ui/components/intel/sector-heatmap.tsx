"use client";

import { useWatchlistByCategory } from "@/lib/queries/watchlist";

const SECTOR_LABELS: Record<string, string> = {
  XLK: "기술", XLF: "금융", XLE: "에너지", XLV: "헬스케어",
  XLY: "경기소비", XLP: "필수소비", XLI: "산업", XLB: "소재",
  XLRE: "부동산", XLU: "유틸리티", XLC: "통신",
};

function cellColor(pct: number): string {
  if (pct >= 2) return "var(--profit)";
  if (pct >= 0.5) return "rgba(34, 197, 94, 0.6)";
  if (pct > -0.5) return "var(--text-muted)";
  if (pct > -2) return "rgba(239, 68, 68, 0.6)";
  return "var(--loss)";
}

export function SectorHeatmap({ sectorFlows }: { sectorFlows: Record<string, number> | null }) {
  const { data: sectorSymbols } = useWatchlistByCategory("sector");

  if (!sectorFlows || Object.keys(sectorFlows).length === 0) {
    return <div className="empty-state text-xs">섹터 데이터 없음</div>;
  }

  const watchlistSet = new Set(sectorSymbols.map((s) => s.symbol));
  const sorted = Object.entries(sectorFlows)
    .filter(([k]) => watchlistSet.size > 0 ? watchlistSet.has(k) : k in SECTOR_LABELS)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="obsidian-card p-4">
      <p className="section-header mb-3">섹터 ETF 히트맵</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {sorted.map(([symbol, pct]) => (
          <div
            key={symbol}
            className="rounded-md p-2 text-center"
            style={{ background: "var(--bg-elevated)" }}
          >
            <div className="text-xs font-mono font-bold" style={{ color: cellColor(pct) }}>
              {symbol}
            </div>
            <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {SECTOR_LABELS[symbol] ?? symbol}
            </div>
            <div
              className="text-xs font-mono font-semibold mt-0.5"
              style={{ color: cellColor(pct) }}
            >
              {pct > 0 ? "+" : ""}{pct.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
