"use client";

import { useQuery } from "@tanstack/react-query";

export interface TradeStats {
  wins: number;
  losses: number;
  totalPnl: number;
  todayPnl: number;
}

export interface HeatmapEntry {
  date: string;
  pnl: number;
  trades: number;
}

export interface MatrixEntry {
  strategy: string;
  symbol: string;
  pnl: number;
  trades: number;
}

export interface IntelEvent {
  id: number;
  type: string;
  source: string;
  title: string;
  summary: string;
  impact_level: string;
  symbols: string[];
  detected_at: string;
}

export interface VixPoint {
  value: number;
  ts: string;
}

export interface DashboardData {
  tradeStats: TradeStats;
  todayPnl: Record<string, number>;
  heatmap: HeatmapEntry[];
  matrix: MatrixEntry[];
  events: IntelEvent[];
  vix: VixPoint[];
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
    refetchInterval: 3_000,
  });
}

export interface DailyPnlEntry {
  date: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
  cumulativePnl: number;
}

export function useDailyPnl(days = 30) {
  return useQuery<DailyPnlEntry[]>({
    queryKey: ["pnl", "daily", days],
    queryFn: async () => {
      const res = await fetch(`/api/pnl/daily?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch daily PnL");
      return res.json();
    },
    refetchInterval: 30_000,
  });
}

export interface YearlyPnl {
  realizedGains: number;
  realizedLosses: number;
  netPnl: number;
  winningTrades: number;
  losingTrades: number;
  netPnlKrw: number;
  taxFreeKrw: number;
  taxableKrw: number;
  estimatedTaxKrw: number;
  warningThresholdKrw: number;
  nearWarning: boolean;
}

export interface TimelineItem {
  kind: string;
  id: string;
  createdAt: string;
  title: string;
  tone: string;
  value: number | null;
}

export function useDashboardTimeline(limit = 20) {
  return useQuery<TimelineItem[]>({
    queryKey: ["dashboard-timeline", limit],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/timeline?limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch timeline");
      return res.json();
    },
    refetchInterval: 15_000,
  });
}

export function useYearlyPnl() {
  return useQuery<YearlyPnl>({
    queryKey: ["pnl", "yearly"],
    queryFn: async () => {
      const res = await fetch("/api/pnl/yearly");
      if (!res.ok) throw new Error("Failed to fetch yearly PnL");
      return res.json();
    },
    refetchInterval: 60_000,
  });
}
