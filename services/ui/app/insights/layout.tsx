"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const subNavItems = [
  { href: "/insights",            label: "리포트" },
  { href: "/insights/market",     label: "시장 개요" },
  { href: "/insights/indicators", label: "지표" },
  { href: "/insights/events",     label: "이벤트" },
  { href: "/insights/ohlcv",      label: "시세" },
];

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // /insights/[id] (상세 페이지)에서는 서브 네비 숨김
  const isDetailPage = /^\/insights\/[^/]+$/.test(pathname) &&
    !["market", "indicators", "events", "ohlcv"].includes(pathname.split("/")[2]);

  return (
    <div className="space-y-5 animate-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">인사이트</h2>
          <p className="page-subtitle">리포트 및 시장 인텔리전스</p>
        </div>
      </div>

      {!isDetailPage && (
        <nav className="tab-nav">
          {subNavItems.map((item) => {
            const active =
              item.href === "/insights"
                ? pathname === "/insights"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`tab-nav-item ${active ? "active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}

      {children}
    </div>
  );
}
