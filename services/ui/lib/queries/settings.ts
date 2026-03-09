"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Setting {
  key: string;
  value: string;
  updatedAt: string;
}

export function useSettings(keys: string[]) {
  return useQuery<Setting[]>({
    queryKey: ["settings", keys],
    queryFn: async () => {
      const params = new URLSearchParams();
      keys.forEach((k) => params.append("key", k));
      const res = await fetch(`/api/settings?${params}`);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });
}

export function useSetting(key: string) {
  return useQuery<Setting | null>({
    queryKey: ["settings", key],
    queryFn: async () => {
      const res = await fetch(`/api/settings?key=${encodeURIComponent(key)}`);
      if (!res.ok) throw new Error("Failed to fetch setting");
      const data = await res.json();
      return data[0] ?? null;
    },
  });
}

export function useUpsertSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Failed to save setting");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
