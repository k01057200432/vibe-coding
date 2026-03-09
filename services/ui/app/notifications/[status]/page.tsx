"use client";

import { use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationList } from "@/components/notifications/notification-list";
import { PushToggle } from "@/components/notifications/push-toggle";

const statuses = [
  { key: "unread", label: "안읽음" },
  { key: "read", label: "읽음" },
  { key: "all", label: "전체" },
];

export default function NotificationsPage({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = use(params);
  const pathname = usePathname();

  return (
    <div className="space-y-5 animate-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">알림</h2>
          <p className="page-subtitle">시스템 알림 및 경고</p>
        </div>
        <PushToggle />
      </div>

      <nav className="tab-nav">
        {statuses.map(({ key, label }) => {
          const href = `/notifications/${key}`;
          return (
            <Link
              key={key}
              href={href}
              className={`tab-nav-item ${pathname === href ? "active" : ""}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <NotificationList status={status} />
    </div>
  );
}
