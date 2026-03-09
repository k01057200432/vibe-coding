import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface WatchlistItem {
  symbol: string;
  category: string;
  bars: boolean;
  trades: boolean;
  quotes: boolean;
  description: string;
  source: string;
  createdAt: string;
}

interface WatchlistResponse {
  data: WatchlistItem[];
  tradesCount: number;
  quotesCount: number;
}

export function useWatchlist() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: async (): Promise<WatchlistResponse> => {
      const res = await fetch("/api/watchlist");
      if (!res.ok) throw new Error("Failed to fetch watchlist");
      return res.json();
    },
    refetchInterval: 10_000,
  });
}

export function useAddWatchlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ symbol, category, description }: { symbol: string; category: string; description?: string }) => {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, category, description }),
      });
      if (res.status === 409) throw new Error("이미 존재하는 심볼입니다");
      if (!res.ok) throw new Error("Failed to add symbol");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}

export function useRemoveWatchlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (symbol: string) => {
      const res = await fetch(`/api/watchlist/${encodeURIComponent(symbol)}`, {
        method: "DELETE",
      });
      if (res.status === 403) throw new Error("시스템 심볼은 삭제할 수 없습니다");
      if (!res.ok) throw new Error("Failed to remove symbol");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}

export function useWatchlistByCategory(category: string | string[]) {
  const { data, ...rest } = useWatchlist();
  const categories = Array.isArray(category) ? category : [category];
  const filtered = data?.data?.filter((item) => categories.includes(item.category)) ?? [];
  return { data: filtered, ...rest };
}

export function useUpdateWatchlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      symbol,
      ...fields
    }: {
      symbol: string;
      bars?: boolean;
      trades?: boolean;
      quotes?: boolean;
      description?: string;
    }) => {
      const res = await fetch(`/api/watchlist/${encodeURIComponent(symbol)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (res.status === 400) {
        const err = await res.json();
        throw new Error(err.error ?? "제한에 도달했습니다");
      }
      if (!res.ok) throw new Error("Failed to update symbol");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}
