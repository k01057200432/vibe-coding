import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface PaperAccount {
  id: string;
  name: string;
  initialCapital: string;
  currentBalance: string;
  currency: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
}

interface Allocation {
  id: string;
  name: string;
  type: string;
  broker: string;
  mode: string;
  enabled: boolean;
  capitalPct: number;
  allocated: number;
}

interface PaperResponse {
  accounts: PaperAccount[];
  total: { initialCapital: number; currentBalance: number };
  allocations: Allocation[];
}

export function usePaperAccounts() {
  return useQuery({
    queryKey: ["paper", "accounts"],
    queryFn: async (): Promise<PaperResponse> => {
      const res = await fetch("/api/paper");
      if (!res.ok) throw new Error("Failed to fetch paper accounts");
      return res.json();
    },
  });
}

export function useUpdatePaperCapital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, capital }: { id: string; capital: number }) => {
      const res = await fetch(`/api/paper/${id}/capital`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capital }),
      });
      if (!res.ok) throw new Error("Failed to update capital");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["paper"] }),
  });
}

export type { PaperAccount, Allocation, PaperResponse };
