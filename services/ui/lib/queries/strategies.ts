"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Strategy {
  id: string;
  name: string;
  type: string;
  broker: string;
  symbols: string[];
  params: Record<string, unknown>;
  mode: string;
  enabled: boolean;
  schedule: string;
  capitalPct: string;
  phase: string;
  message: string | null;
  lastSignalAt: string | null;
  podName: string | null;
  positions: unknown;
  heartbeatAt: string | null;
  createdAt: string;
  updatedAt: string;
  description: string;
}

export function useStrategies() {
  return useQuery<Strategy[]>({
    queryKey: ["strategies"],
    queryFn: () => fetch("/api/strategies").then((r) => r.json()),
    refetchInterval: 10_000,
  });
}

export function useToggleStrategy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/strategies/${id}/toggle`, { method: "PUT" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["strategies"] }),
  });
}

export function useCreateStrategy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch("/api/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["strategies"] }),
  });
}

export function useUpdateStrategy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      fetch(`/api/strategies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["strategies"] }),
  });
}

export function useDeleteStrategy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/strategies/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["strategies"] }),
  });
}

export function useStrategyDetail(id: string | null) {
  return useQuery({
    queryKey: ["strategy-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/strategies/${id}/detail`);
      if (!res.ok) throw new Error("Failed to fetch strategy detail");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useStrategyAuditLog(id: string | null) {
  return useQuery<{ logs: Record<string, string>[] }>({
    queryKey: ["strategy-audit", id],
    queryFn: async () => {
      const res = await fetch(`/api/strategies/${id}/audit`);
      if (!res.ok) throw new Error("Failed to fetch audit log");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useRestartStrategy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/strategies/${id}/restart`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["strategies"] }),
  });
}
