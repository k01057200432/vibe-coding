"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useReports } from "@/lib/queries/reports";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 20;

const typeLabels: Record<string, string> = {
  all: "전체",
  daily: "일일",
  daily_market: "시장(일)",
  weekly: "주간",
  weekly_market: "시장(주)",
  strategy: "전략",
  simulation: "시뮬",
  custom: "기타",
};

const typeBadgeClass: Record<string, string> = {
  daily: "badge-info",
  daily_market: "badge-info",
  weekly: "badge-pending",
  weekly_market: "badge-pending",
  strategy: "badge-running",
  simulation: "badge-warning",
  custom: "badge-stopped",
};

function ReportsContent() {
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type") ?? "all";
  const [page, setPage] = useState(0);

  const { data, isLoading } = useReports({
    type: currentType !== "all" ? currentType : undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="section-header" style={{ marginBottom: 0 }}>리포트</h3>
        <span className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>
          {total}건
        </span>
      </div>

      <nav className="tab-nav mb-4">
        {Object.entries(typeLabels).map(([key, label]) => {
          const href =
            key === "all" ? "/insights" : `/insights?type=${key}`;
          const active = currentType === key;
          return (
            <Link
              key={key}
              href={href}
              className={`tab-nav-item ${active ? "active" : ""}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {isLoading ? (
        <div className="empty-state">로딩중...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">리포트가 없습니다</div>
      ) : (
        <div className="space-y-2">
          {items.map((r) => (
            <Link key={r.id} href={`/insights/${r.id}`}>
              <div className="obsidian-card p-4 cursor-pointer hover:border-[var(--border-emphasis)] transition-all">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`obsidian-badge ${typeBadgeClass[r.type] ?? typeBadgeClass.custom}`}
                      >
                        {typeLabels[r.type] ?? r.type}
                      </span>
                      <span
                        className="font-medium text-sm truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {r.title}
                      </span>
                    </div>
                    {r.summary && (
                      <p
                        className="text-sm line-clamp-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {r.summary}
                      </p>
                    )}
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {new Date(r.createdAt).toLocaleString("ko-KR")}
                      <span className="ml-2">by {r.generatedBy}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="pagination-info">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
}

export default function InsightsPage() {
  return (
    <Suspense fallback={<div className="empty-state">로딩중...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
