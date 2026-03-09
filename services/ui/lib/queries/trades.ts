import { useQuery } from "@tanstack/react-query";

interface Trade {
  id: number;
  broker: string;
  symbol: string;
  side: string;
  qty: string;
  price: string;
  orderType: string;
  status: string;
  orderId: string | null;
  strategy: string | null;
  pnl: string | null;
  simulationId: string | null;
  createdAt: string;
}

interface TradesResponse {
  data: Trade[];
  total: number;
}

interface TradesParams {
  mode: "live" | "simulation";
  limit?: number;
  offset?: number;
  from?: string;
  to?: string;
  strategy?: string;
  broker?: string;
  symbol?: string;
}

async function fetchTrades(params: TradesParams): Promise<TradesResponse> {
  const sp = new URLSearchParams();
  sp.set("mode", params.mode);
  sp.set("limit", String(params.limit ?? 20));
  sp.set("offset", String(params.offset ?? 0));
  if (params.from) sp.set("from", params.from);
  if (params.to) sp.set("to", params.to);
  if (params.strategy) sp.set("strategy", params.strategy);
  if (params.broker) sp.set("broker", params.broker);
  if (params.symbol) sp.set("symbol", params.symbol);

  const res = await fetch(`/api/trades?${sp}`);
  if (!res.ok) throw new Error("Failed to fetch trades");
  return res.json();
}

export function useTrades(params: TradesParams) {
  return useQuery({
    queryKey: ["trades", params],
    queryFn: () => fetchTrades(params),
  });
}

export type { Trade, TradesResponse, TradesParams };
