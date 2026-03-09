"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Simulation {
  id: string;
  name: string;
  strategyType: string;
  strategyParams: Record<string, unknown>;
  brokerType: string | null;
  symbols: string[];
  tradeSymbol: string;
  startDate: string;
  endDate: string;
  speedMultiplier: string | null;
  initialCash: string | null;
  status: string | null;
  progressPct: string | null;
  currentBar: number | null;
  totalBars: number | null;
  simTime: string | null;
  finalEquity: string | null;
  totalReturnPct: string | null;
  maxDrawdownPct: string | null;
  sharpeRatio: string | null;
  totalTrades: number | null;
  wonTrades: number | null;
  lostTrades: number | null;
  errorMessage: string | null;
  createdAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface SimDashboard {
  stats: {
    total_completed: string;
    avg_return: string;
    avg_sharpe: string;
    avg_drawdown: string;
    best_name: string | null;
    best_return: string | null;
    worst_name: string | null;
    worst_return: string | null;
  } | null;
  distribution: {
    bucket: number;
    count: string;
    range_min: string;
    range_max: string;
  }[];
  top: Record<string, unknown>[];
  aggregates: {
    strategy_type: string;
    total: string;
    completed: string;
    avg_return: string;
    best_return: string;
    worst_return: string;
    avg_sharpe: string;
    avg_drawdown: string;
    total_trades: string;
  }[];
}

export function useSimulations() {
  return useQuery<Simulation[]>({
    queryKey: ["simulations"],
    queryFn: () => fetch("/api/simulations").then((r) => r.json()),
    refetchInterval: 10_000,
  });
}

export function useSimulationStatus(id: string | null) {
  return useQuery({
    queryKey: ["simulation-status", id],
    queryFn: () => fetch(`/api/simulations/${id}/status`).then((r) => r.json()),
    enabled: !!id,
    refetchInterval: 5_000,
  });
}

export function useSimulationDashboard(sortBy = "total_return_pct") {
  return useQuery<SimDashboard>({
    queryKey: ["simulation-dashboard", sortBy],
    queryFn: () =>
      fetch(`/api/simulations/dashboard?sortBy=${sortBy}`).then((r) =>
        r.json()
      ),
    refetchInterval: 30_000,
  });
}

export function useSimulationCompare(ids: number[]) {
  return useQuery<{ rows: Record<string, unknown>[] }>({
    queryKey: ["simulation-compare", ids],
    queryFn: () =>
      fetch(`/api/simulations/compare?ids=${ids.join(",")}`).then((r) =>
        r.json()
      ),
    enabled: ids.length >= 2,
  });
}

export function useSimulationLeaderboard(by: string = "strategy_type") {
  return useQuery<{ rows: Record<string, unknown>[] }>({
    queryKey: ["simulation-leaderboard", by],
    queryFn: () =>
      fetch(`/api/simulations/leaderboard?by=${by}`).then((r) => r.json()),
    refetchInterval: 30_000,
  });
}

export interface SymbolComparison {
  tradeSymbol: string;
  simCount: number;
  avgReturn: number;
  avgMdd: number;
  avgSharpe: number;
  bestReturn: number;
  worstReturn: number;
}

export function useSimulationCompareSymbols(symbols?: string[]) {
  const params = symbols?.length ? `?symbols=${symbols.join(",")}` : "";
  return useQuery<SymbolComparison[]>({
    queryKey: ["simulation-compare-symbols", symbols],
    queryFn: () =>
      fetch(`/api/simulations/compare-symbols${params}`).then((r) => r.json()),
    refetchInterval: 30_000,
  });
}

export function useCreateSimulation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["simulations"] }),
  });
}

export function useDeleteSimulation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/simulations/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["simulations"] }),
  });
}

export function usePauseSimulation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/simulations/${id}/pause`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["simulations"] });
      qc.invalidateQueries({ queryKey: ["simulation-status"] });
    },
  });
}

export function useResumeSimulation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/simulations/${id}/resume`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["simulations"] });
      qc.invalidateQueries({ queryKey: ["simulation-status"] });
    },
  });
}

export function useStopSimulation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/simulations/${id}/stop`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["simulations"] });
      qc.invalidateQueries({ queryKey: ["simulation-status"] });
    },
  });
}
