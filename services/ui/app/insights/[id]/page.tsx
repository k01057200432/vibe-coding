"use client";

import { use } from "react";
import Link from "next/link";
import { useReport } from "@/lib/queries/reports";
import { MarkdownRenderer } from "@/components/reports/markdown-renderer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const typeLabels: Record<string, string> = {
  daily: "일일",
  daily_market: "시장(일)",
  weekly: "주간",
  weekly_market: "시장(주)",
  strategy: "전략",
  simulation: "시뮬레이션",
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

export default function InsightDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const numId = Number(id);
  const { data: report, isLoading, error } = useReport(numId);

  if (isLoading) {
    return <div className="empty-state">로딩중...</div>;
  }

  if (error || !report) {
    return (
      <div className="empty-state">
        <p className="mb-4">리포트를 찾을 수 없습니다</p>
        <Link href="/insights">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            인사이트로 돌아가기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in">
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/insights">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          인사이트
        </span>
        <span style={{ color: "var(--text-dim)" }}>/</span>
        <span
          className={`obsidian-badge ${typeBadgeClass[report.type] ?? typeBadgeClass.custom}`}
        >
          {typeLabels[report.type] ?? report.type}
        </span>
        <h2 className="page-title text-lg">{report.title}</h2>
      </div>

      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
        {new Date(report.createdAt).toLocaleString("ko-KR")}
        <span className="ml-2">by {report.generatedBy}</span>
      </div>

      <div className="obsidian-card p-4 md:p-6">
        <MarkdownRenderer content={report.content} />
      </div>
    </div>
  );
}
