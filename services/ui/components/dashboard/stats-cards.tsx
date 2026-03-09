"use client";

import { Eye } from "lucide-react";
import type { TradeStats, VixPoint } from "@/lib/queries/dashboard";

function VixSparkline({ data }: { data: VixPoint[] }) {
  if (data.length < 2) return null;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const h = 24;
  const w = 56;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  const latest = values[values.length - 1];

  return (
    <svg width={w} height={h} className="inline-block ml-1">
      <polyline
        points={points}
        fill="none"
        stroke={latest >= 25 ? "var(--loss)" : "var(--warning)"}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function formatUsd(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

interface StatsCardsProps {
  stats: TradeStats;
  vix: VixPoint[];
  activeStrategies?: number;
  totalStrategies?: number;
  watchlistCount?: number;
  tradesCount?: number;
  quotesCount?: number;
}

const MAX_STREAM = 30;

export function StatsCards({ stats, vix, activeStrategies = 0, totalStrategies = 0, watchlistCount, tradesCount, quotesCount }: StatsCardsProps) {
  const winRate =
    stats.wins + stats.losses > 0
      ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1)
      : "0.0";
  const latestVix = vix.length > 0 ? vix[vix.length - 1].value : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {/* 오늘 손익 */}
      <div className="stat-card" data-accent={stats.todayPnl >= 0 ? "green" : "red"}>
        <div className="stat-label">오늘 손익</div>
        <div className={`font-mono-num text-2xl font-bold ${stats.todayPnl >= 0 ? "text-profit" : "text-loss"}`}>
          {stats.todayPnl >= 0 ? "+" : ""}{formatUsd(stats.todayPnl)}
        </div>
      </div>

      {/* 총 손익 */}
      <div className="stat-card" data-accent={stats.totalPnl >= 0 ? "green" : "red"}>
        <div className="stat-label">총 손익</div>
        <div className={`font-mono-num text-2xl font-bold ${stats.totalPnl >= 0 ? "text-profit" : "text-loss"}`}>
          {stats.totalPnl >= 0 ? "+" : ""}{formatUsd(stats.totalPnl)}
        </div>
      </div>

      {/* 승률 */}
      <div className="stat-card" data-accent="blue">
        <div className="stat-label">승률</div>
        <div className="font-mono-num text-2xl font-bold text-[var(--text-primary)]">
          {winRate}%
        </div>
      </div>

      {/* VIX */}
      <div className="stat-card" data-accent="amber">
        <div className="stat-label">VIX</div>
        <div className="flex items-end gap-1">
          <span className={`font-mono-num text-2xl font-bold ${latestVix !== null && latestVix >= 25 ? "text-loss" : "text-[var(--text-primary)]"}`}>
            {latestVix !== null ? latestVix.toFixed(1) : "--"}
          </span>
          <VixSparkline data={vix} />
        </div>
      </div>

      {/* 전략 */}
      <div className="stat-card" data-accent="blue">
        <div className="stat-label">전략</div>
        <div className="font-mono-num text-2xl font-bold text-[var(--text-primary)]">
          <span className="text-[var(--profit)]">{activeStrategies}</span>
          <span className="text-[var(--text-muted)] text-lg">/{totalStrategies}</span>
        </div>
      </div>

      {/* 구독 종목 */}
      <div className="stat-card" data-accent="blue">
        <div className="stat-label">
          <Eye className="inline h-3 w-3 mr-1" />
          구독 종목
        </div>
        <div className="font-mono-num text-2xl font-bold text-[var(--text-primary)]">
          {watchlistCount ?? "--"}
        </div>
      </div>

      {/* Trades 스트림 */}
      <div className="stat-card" data-accent="blue">
        <div className="stat-label">Trades</div>
        <div className="font-mono-num text-2xl font-bold text-[var(--text-primary)]">
          <span className="text-[var(--profit)]">{tradesCount ?? 0}</span>
          <span className="text-[var(--text-muted)] text-lg">/{MAX_STREAM}</span>
        </div>
      </div>

      {/* Quotes 스트림 */}
      <div className="stat-card" data-accent="blue">
        <div className="stat-label">Quotes</div>
        <div className="font-mono-num text-2xl font-bold text-[var(--text-primary)]">
          <span className="text-[var(--profit)]">{quotesCount ?? 0}</span>
          <span className="text-[var(--text-muted)] text-lg">/{MAX_STREAM}</span>
        </div>
      </div>
    </div>
  );
}
