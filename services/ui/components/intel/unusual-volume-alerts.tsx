"use client";

interface VolumeAnomaly {
  symbol: string;
  ratio: number;
  currentVol: number;
  avgVol: number;
}

export function UnusualVolumeAlerts({ volumeAnomalies }: { volumeAnomalies: Record<string, unknown> | null }) {
  if (!volumeAnomalies || Object.keys(volumeAnomalies).length === 0) {
    return null;
  }

  const alerts: VolumeAnomaly[] = Object.entries(volumeAnomalies)
    .map(([symbol, data]) => {
      const d = data as Record<string, number>;
      const avg = d.avg_vol_20 ?? d.avg ?? 0;
      const current = d.current ?? d.volume ?? 0;
      return { symbol, ratio: avg > 0 ? current / avg : 0, currentVol: current, avgVol: avg };
    })
    .filter((a) => a.ratio >= 2)
    .sort((a, b) => b.ratio - a.ratio);

  if (alerts.length === 0) return null;

  return (
    <div className="obsidian-card p-4">
      <p className="section-header mb-2">이상 거래량</p>
      <div className="space-y-1.5">
        {alerts.map((a) => (
          <div key={a.symbol} className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)] last:border-0">
            <span className="text-xs font-mono font-bold" style={{ color: "var(--warning)" }}>
              {a.symbol}
            </span>
            <span className="text-xs font-mono" style={{ color: "var(--text-primary)" }}>
              {a.ratio.toFixed(1)}x 평균
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
