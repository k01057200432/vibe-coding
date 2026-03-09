"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useNotifications,
  useMarkAsRead,
  type NotificationsParams,
} from "@/lib/queries/notifications";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

const PAGE_SIZE = 20;

const levelBadgeClass: Record<string, string> = {
  info: "badge-info",
  warning: "badge-warning",
  critical: "badge-critical",
};

export function NotificationList({
  status,
}: {
  status: string;
}) {
  const [page, setPage] = useState(0);

  const params: NotificationsParams = {
    status: status !== "all" ? status : undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  const { data, isLoading } = useNotifications(params);
  const markAsRead = useMarkAsRead();

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{total}건 알림</span>
      </div>

      {isLoading ? (
        <div className="empty-state">로딩중...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">알림이 없습니다</div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const reportId = n.data?.report_id;
            const isReport = n.data?.category === "report" && reportId;
            const reportHref = isReport ? `/insights/${reportId}` : null;

            return (
              <div
                key={n.id}
                className={`obsidian-card p-4 ${!n.read ? "border-l-2 cursor-pointer" : "opacity-60"}`}
                style={!n.read ? { borderLeftColor: 'var(--accent)' } : undefined}
                onClick={() => { if (!n.read) markAsRead.mutate(n.id); }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`obsidian-badge ${levelBadgeClass[n.level] ?? levelBadgeClass.info}`}>
                        {n.level}
                      </span>
                      <span className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {n.title}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2 select-text" style={{ color: 'var(--text-secondary)' }}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                        {new Date(n.createdAt).toLocaleString("ko-KR")}
                      </p>
                      {reportHref && (
                        <Link
                          href={reportHref}
                          className="flex items-center gap-1 text-xs font-medium hover:underline"
                          style={{ color: 'var(--accent-bright)' }}
                          onClick={(e) => { e.stopPropagation(); if (!n.read) markAsRead.mutate(n.id); }}
                        >
                          <FileText className="h-3 w-3" />
                          리포트 보기
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
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
    </div>
  );
}
