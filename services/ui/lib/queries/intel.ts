import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// --- Intel Events ---

interface IntelEvent {
  id: number;
  type: string;
  source: string;
  title: string;
  summary: string | null;
  impactLevel: string;
  symbols: string[] | null;
  expectedValue: string | null;
  actualValue: string | null;
  previousValue: string | null;
  detectedAt: string;
  createdAt: string;
}

interface EventsResponse {
  data: IntelEvent[];
  total: number;
}

interface EventsParams {
  type?: string;
  limit?: number;
  offset?: number;
}

export function useIntelEvents(params: EventsParams = {}) {
  return useQuery({
    queryKey: ["intel", "events", params],
    queryFn: async (): Promise<EventsResponse> => {
      const sp = new URLSearchParams({ tab: "events" });
      if (params.type) sp.set("type", params.type);
      sp.set("limit", String(params.limit ?? 30));
      sp.set("offset", String(params.offset ?? 0));
      const res = await fetch(`/api/intel/data?${sp}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
  });
}

// --- Market Snapshots ---

interface MarketSnapshot {
  id: number;
  vix: string | null;
  sectorFlows: unknown;
  volumeAnomalies: unknown;
  fearGreedIdx: number | null;
  ts: string;
}

interface MarketResponse {
  latest: MarketSnapshot | null;
  recent: MarketSnapshot[];
}

export function useMarketData() {
  return useQuery({
    queryKey: ["intel", "market"],
    queryFn: async (): Promise<MarketResponse> => {
      const res = await fetch("/api/intel/data?tab=market");
      if (!res.ok) throw new Error("Failed to fetch market data");
      return res.json();
    },
  });
}

// --- OHLCV ---

interface OhlcvBar {
  id: number;
  symbol: string;
  timeframe: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  ts: string;
}

export function useOhlcv(symbol: string, limit = 60) {
  return useQuery({
    queryKey: ["intel", "ohlcv", symbol, limit],
    queryFn: async (): Promise<{ data: OhlcvBar[] }> => {
      const sp = new URLSearchParams({
        tab: "ohlcv",
        symbol,
        limit: String(limit),
      });
      const res = await fetch(`/api/intel/data?${sp}`);
      if (!res.ok) throw new Error("Failed to fetch OHLCV");
      return res.json();
    },
  });
}

export function useOhlcvMulti(symbols: string[], limit = 30) {
  return useQuery({
    queryKey: ["intel", "ohlcv-multi", symbols, limit],
    queryFn: async (): Promise<{ data: Record<string, OhlcvBar[]> }> => {
      if (symbols.length === 0) return { data: {} };
      const sp = new URLSearchParams({
        tab: "ohlcv",
        symbols: symbols.join(","),
        limit: String(limit),
      });
      const res = await fetch(`/api/intel/data?${sp}`);
      if (!res.ok) throw new Error("Failed to fetch OHLCV");
      return res.json();
    },
    enabled: symbols.length > 0,
    refetchInterval: 60_000,
  });
}

// --- Collectors ---

interface IntelCollector {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  intervalSeconds: number;
  config: Record<string, unknown>;
  lastRunAt: string | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useCollectors() {
  return useQuery({
    queryKey: ["intel", "collectors"],
    queryFn: async (): Promise<{ data: IntelCollector[] }> => {
      const res = await fetch("/api/intel/collectors");
      if (!res.ok) throw new Error("Failed to fetch collectors");
      return res.json();
    },
  });
}

export function useToggleCollector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/intel/collectors/${id}/toggle`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to toggle");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["intel", "collectors"] }),
  });
}

export function useUpdateInterval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      intervalSeconds,
    }: {
      id: string;
      intervalSeconds: number;
    }) => {
      const res = await fetch(`/api/intel/collectors/${id}/interval`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intervalSeconds }),
      });
      if (!res.ok) throw new Error("Failed to update interval");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["intel", "collectors"] }),
  });
}

export function useUpdateConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      config,
    }: {
      id: string;
      config: Record<string, unknown>;
    }) => {
      const res = await fetch(`/api/intel/collectors/${id}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      if (!res.ok) throw new Error("Failed to update config");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["intel", "collectors"] }),
  });
}

// --- Indicator History (time-series) ---

interface HistoryPoint {
  value: string;
  ts: string;
}

type TimeRange = "1d" | "1w" | "1m" | "3m";

export function useIndicatorHistory(indicator: string, range: TimeRange = "1w") {
  return useQuery({
    queryKey: ["intel", "history", indicator, range],
    queryFn: async (): Promise<{ data: HistoryPoint[] }> => {
      const sp = new URLSearchParams({ tab: "history", indicator, range });
      const res = await fetch(`/api/intel/data?${sp}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
    enabled: !!indicator,
  });
}

export type { HistoryPoint, TimeRange };

export type { IntelEvent, MarketSnapshot, OhlcvBar, IntelCollector };

// --- Market Indicators (global / commodity / macro) ---

export interface MarketIndicator {
  indicator: string;
  value: string;
  metadata: Record<string, string>;
  ts: string;
}

export function useMarketIndicators(group: "global" | "commodity" | "macro" | "all" = "all") {
  return useQuery({
    queryKey: ["intel", "indicators", group],
    queryFn: async (): Promise<{ data: MarketIndicator[] }> => {
      const res = await fetch(`/api/intel/data?tab=indicators&group=${group}`);
      if (!res.ok) throw new Error("Failed to fetch indicators");
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });
}
