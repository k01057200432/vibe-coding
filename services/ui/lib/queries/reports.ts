import { useQuery } from "@tanstack/react-query";

export interface Report {
  id: number;
  type: string;
  title: string;
  content: string;
  summary: string | null;
  metadata: Record<string, unknown>;
  generatedBy: string;
  createdAt: string;
}

interface ReportsListItem {
  id: number;
  type: string;
  title: string;
  summary: string | null;
  metadata: Record<string, unknown>;
  generatedBy: string;
  createdAt: string;
}

interface ReportsResponse {
  data: ReportsListItem[];
  total: number;
}

interface ReportsParams {
  type?: string;
  limit?: number;
  offset?: number;
}

async function fetchReports(params: ReportsParams): Promise<ReportsResponse> {
  const sp = new URLSearchParams();
  if (params.type && params.type !== "all") sp.set("type", params.type);
  sp.set("limit", String(params.limit ?? 20));
  sp.set("offset", String(params.offset ?? 0));

  const res = await fetch(`/api/reports?${sp}`);
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
}

async function fetchReport(id: number): Promise<Report> {
  const res = await fetch(`/api/reports/${id}`);
  if (!res.ok) throw new Error("Failed to fetch report");
  return res.json();
}

export function useReports(params: ReportsParams) {
  return useQuery({
    queryKey: ["reports", params],
    queryFn: () => fetchReports(params),
  });
}

export function useReport(id: number) {
  return useQuery({
    queryKey: ["reports", id],
    queryFn: () => fetchReport(id),
    enabled: id > 0,
  });
}

export type { ReportsListItem, ReportsResponse, ReportsParams };
