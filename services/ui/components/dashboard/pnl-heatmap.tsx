"use client";

import type { HeatmapEntry } from "@/lib/queries/dashboard";

function getHeatClass(pnl: number): string {
  if (pnl === 0) return "hm-empty";
  if (pnl > 0) {
    if (pnl > 500) return "hm-gain-4";
    if (pnl > 200) return "hm-gain-3";
    if (pnl > 50) return "hm-gain-2";
    return "hm-gain-1";
  }
  if (pnl < -500) return "hm-loss-4";
  if (pnl < -200) return "hm-loss-3";
  if (pnl < -50) return "hm-loss-2";
  return "hm-loss-1";
}

interface PnlHeatmapProps {
  data: HeatmapEntry[];
}

export function PnlHeatmap({ data }: PnlHeatmapProps) {
  // Fill missing days in range
  const filled: HeatmapEntry[] = [];
  if (data.length > 0) {
    const byDate = new Map(data.map((d) => [d.date, d]));
    const start = new Date(data[0].date);
    const end = new Date(data[data.length - 1].date);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      filled.push(byDate.get(key) ?? { date: key, pnl: 0, trades: 0 });
    }
  }

  // Pad to start on Monday
  if (filled.length > 0) {
    const firstDay = new Date(filled[0].date).getDay();
    const padDays = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < padDays; i++) {
      filled.unshift({ date: "", pnl: 0, trades: -1 });
    }
  }

  // Build weeks (columns)
  const weeks: HeatmapEntry[][] = [];
  for (let i = 0; i < filled.length; i += 7) {
    weeks.push(filled.slice(i, i + 7));
  }

  // Month labels
  const monthLabels: { col: number; label: string }[] = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const validDay = week.find((d) => d.date !== "" && d.trades !== -1);
    if (validDay) {
      const m = new Date(validDay.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ col: wi, label: monthNames[m] });
        lastMonth = m;
      }
    }
  });

  const dayLabels = ["Mon", "", "Wed", "", "Fri", "", ""];

  return (
    <div className="obsidian-card p-4">
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-sm font-semibold">손익 캘린더</span>
        <span className="font-mono text-[0.625rem] text-muted-foreground">최근 90일</span>
      </div>

      <div className="heatmap-wrap">
        <div className="flex">
          {/* Day labels */}
          <div className="heatmap-days">
            {dayLabels.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>

          <div>
            {/* Month labels */}
            <div className="heatmap-months" style={{ paddingLeft: 0 }}>
              {weeks.map((_, wi) => {
                const ml = monthLabels.find((m) => m.col === wi);
                return <span key={wi}>{ml ? ml.label : ""}</span>;
              })}
            </div>

            {/* Heatmap grid */}
            <div className="heatmap-grid">
              {filled.map((day, i) =>
                day.trades === -1 ? (
                  <div key={i} className="hm-cell" style={{ visibility: "hidden" }} />
                ) : (
                  <div
                    key={i}
                    className={`hm-cell ${getHeatClass(day.pnl)}`}
                    data-tooltip={
                      day.date
                        ? `${day.date} | ${day.pnl >= 0 ? "+" : ""}$${day.pnl.toFixed(2)} | ${day.trades}t`
                        : undefined
                    }
                  />
                )
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="heatmap-legend">
          <span className="font-mono text-[0.5rem] text-muted-foreground mr-1">Loss</span>
          <div className="hm-cell hm-loss-4" />
          <div className="hm-cell hm-loss-3" />
          <div className="hm-cell hm-loss-2" />
          <div className="hm-cell hm-loss-1" />
          <div className="hm-cell hm-empty" />
          <div className="hm-cell hm-gain-1" />
          <div className="hm-cell hm-gain-2" />
          <div className="hm-cell hm-gain-3" />
          <div className="hm-cell hm-gain-4" />
          <span className="font-mono text-[0.5rem] text-muted-foreground ml-1">Gain</span>
        </div>
      </div>
    </div>
  );
}
