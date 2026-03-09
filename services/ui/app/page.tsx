"use client";

import { useDashboard, useDailyPnl } from "@/lib/queries/dashboard";
import { useStrategies } from "@/lib/queries/strategies";
import { useWatchlist, useWatchlistByCategory } from "@/lib/queries/watchlist";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { PnlHeatmap } from "@/components/dashboard/pnl-heatmap";
import { PnlChart } from "@/components/dashboard/pnl-chart";
import { StrategyMatrix } from "@/components/dashboard/strategy-matrix";
import { Timeline } from "@/components/dashboard/timeline";
import { AlertTriangle, Zap } from "lucide-react";

function MarketContextCard({
  events,
  todayPnl,
}: {
  events: {
    id: number;
    type: string;
    title: string;
    impact_level: string;
    detected_at: string;
  }[];
  todayPnl: Record<string, number>;
}) {
  const entries = Object.entries(todayPnl);

  return (
    <div className="obsidian-card overflow-hidden min-w-0">
      <div className="text-sm font-semibold mb-3">시장 컨텍스트</div>

      {entries.length > 0 && (
        <div className="mb-3">
          <div className="section-header mb-2">
            <Zap className="inline h-3 w-3 mr-1" />
            오늘 전략별 수익
          </div>
          <div className="space-y-1">
            {entries.map(([strategy, pnl]) => (
              <div key={strategy} className="flex items-center justify-between text-xs">
                <span className="truncate mr-2 text-[var(--text-secondary)]">{strategy}</span>
                <span className={`font-mono-num font-semibold ${pnl >= 0 ? "pnl-positive" : "pnl-negative"}`}>
                  {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div>
          <div className="section-header mb-2">
            <AlertTriangle className="inline h-3 w-3 mr-1" />
            주요 이벤트
          </div>
          <div className="space-y-1.5">
            {events.map((e) => (
              <div key={e.id} className="flex items-start gap-2 text-xs">
                <span
                  className={`obsidian-badge text-[0.5625rem] shrink-0 ${
                    e.impact_level === "critical"
                      ? "badge-critical"
                      : e.impact_level === "warning"
                        ? "badge-warning"
                        : "badge-info"
                  }`}
                >
                  {e.impact_level}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[var(--text-secondary)]">{e.title}</div>
                  <div className="text-[var(--text-muted)] text-[0.625rem] font-mono">
                    {new Date(e.detected_at).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && events.length === 0 && (
        <div className="text-xs text-[var(--text-muted)] text-center py-3">
          이벤트 없음
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: dashboard, isLoading: dashLoading } = useDashboard();
  const { data: dailyPnl, isLoading: pnlLoading } = useDailyPnl(90);
  const { data: strategies } = useStrategies();
  const { data: watchlistData } = useWatchlist();
  const { data: stockEtfSymbols } = useWatchlistByCategory(["stock", "etf"]);

  if (dashLoading) {
    return (
      <div className="space-y-4 animate-in">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="stat-card h-20 animate-pulse" />
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="obsidian-card h-64 animate-pulse" />
          <div className="obsidian-card h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  const stats = dashboard?.tradeStats ?? {
    wins: 0,
    losses: 0,
    totalPnl: 0,
    todayPnl: 0,
  };
  const vix = dashboard?.vix ?? [];
  const heatmap = dashboard?.heatmap ?? [];
  const matrix = dashboard?.matrix ?? [];
  const events = dashboard?.events ?? [];
  const todayPnl = dashboard?.todayPnl ?? {};
  const daily = dailyPnl ?? [];

  const activeStrategies = strategies?.filter((s) => s.enabled)?.length ?? 0;
  const totalStrategies = strategies?.length ?? 0;

  return (
    <div className="space-y-4 animate-in stagger-in">
      {/* Stats Cards */}
      <StatsCards
        stats={stats}
        vix={vix}
        activeStrategies={activeStrategies}
        totalStrategies={totalStrategies}
        watchlistCount={stockEtfSymbols?.length}
        tradesCount={watchlistData?.tradesCount}
        quotesCount={watchlistData?.quotesCount}
      />

      {/* PnL Heatmap */}
      <PnlHeatmap data={heatmap} />

      {/* Mid Grid: PnL Chart + Strategy Matrix */}
      <div className="grid gap-3 lg:grid-cols-2 min-w-0">
        <PnlChart data={daily} />
        <StrategyMatrix data={matrix} />
      </div>

      {/* Bottom Grid: Market Context + Timeline */}
      <div className="grid gap-3 lg:grid-cols-2 min-w-0">
        <MarketContextCard events={events} todayPnl={todayPnl} />
        <Timeline />
      </div>
    </div>
  );
}
