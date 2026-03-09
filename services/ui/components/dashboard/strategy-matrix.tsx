"use client";

import { useRouter } from "next/navigation";
import { useStrategies } from "@/lib/queries/strategies";
import type { MatrixEntry } from "@/lib/queries/dashboard";

function getCellClass(pnl: number): string {
  if (pnl === 0) return "";
  if (pnl > 200) return "hm-gain-3";
  if (pnl > 50) return "hm-gain-2";
  if (pnl > 0) return "hm-gain-1";
  if (pnl < -200) return "hm-loss-3";
  if (pnl < -50) return "hm-loss-2";
  return "hm-loss-1";
}

interface StrategyMatrixProps {
  data: MatrixEntry[];
}

export function StrategyMatrix({ data }: StrategyMatrixProps) {
  const router = useRouter();
  const { data: strategies } = useStrategies();

  const strategyIdMap = new Map(
    (strategies ?? []).map((s) => [s.name, s.id])
  );

  if (data.length === 0) {
    return (
      <div className="obsidian-card p-4">
        <div className="text-sm font-semibold mb-3">전략 x 심볼</div>
        <div className="empty-state" style={{ padding: "1.5rem 1rem" }}>
          거래 데이터 없음
        </div>
      </div>
    );
  }

  // Group by strategy
  const grouped = new Map<string, MatrixEntry[]>();
  for (const entry of data) {
    const list = grouped.get(entry.strategy) ?? [];
    list.push(entry);
    grouped.set(entry.strategy, list);
  }

  const handleStrategyClick = (stratName: string) => {
    const id = strategyIdMap.get(stratName);
    if (id) router.push(`/strategies/${id}`);
  };

  return (
    <div className="obsidian-card p-4">
      <div className="text-sm font-semibold mb-3">전략 x 심볼</div>
      <div className="strat-heatmap">
        {[...grouped.entries()].map(([stratName, entries]) => (
          <div key={stratName} className="strat-heatmap-group">
            <div
              className="section-header cursor-pointer hover:text-[var(--accent)]"
              onClick={() => handleStrategyClick(stratName)}
            >
              {stratName}
            </div>
            <div className="strat-heatmap-cells">
              {entries.map((entry) => (
                <div
                  key={entry.symbol}
                  className={`strat-heatmap-cell ${getCellClass(entry.pnl)}`}
                  onClick={() => handleStrategyClick(stratName)}
                  data-tooltip={`${entry.trades}건`}
                >
                  <span className="strat-heatmap-sym">{entry.symbol}</span>
                  <span
                    className={`font-mono-num ${entry.pnl >= 0 ? "pnl-positive" : "pnl-negative"}`}
                  >
                    {entry.pnl >= 0 ? "+" : ""}${entry.pnl.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <span className="font-mono text-[0.5rem] text-muted-foreground mr-1">Loss</span>
        <div className="hm-cell hm-loss-3" />
        <div className="hm-cell hm-loss-2" />
        <div className="hm-cell hm-loss-1" />
        <div className="hm-cell" style={{ background: "var(--card-bg)" }} />
        <div className="hm-cell hm-gain-1" />
        <div className="hm-cell hm-gain-2" />
        <div className="hm-cell hm-gain-3" />
        <span className="font-mono text-[0.5rem] text-muted-foreground ml-1">Gain</span>
      </div>
    </div>
  );
}
