"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  ArrowLeftRight,
  Lightbulb,
  Bell,
  CalendarDays,
  Settings,
  Terminal,
  BarChart3,
  PanelLeftClose,
  PanelLeft,
  BookOpen,
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui";
import { Button } from "@/components/ui/button";

export interface NavItem {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  key: string;
}

export const navItems: NavItem[] = [
  { href: "/", icon: LayoutDashboard, label: "대시보드", key: "1" },
  { href: "/catalog", icon: BookOpen, label: "카탈로그", key: "2" },
  { href: "/strategies", icon: Target, label: "전략", key: "3" },
  { href: "/trading", icon: ArrowLeftRight, label: "거래", key: "4" },
  { href: "/insights", icon: Lightbulb, label: "인사이트", key: "5" },
  { href: "/notifications/unread", icon: Bell, label: "알림", key: "6" },
  { href: "/calendar", icon: CalendarDays, label: "캘린더", key: "7" },
  { href: "/settings", icon: Settings, label: "설정", key: "8" },
];

export function NavRail({ className }: { className?: string }) {
  const pathname = usePathname();
  const { navCollapsed, toggleNavCollapsed, toggleTerminal } = useUIStore();

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <aside
      className={cn(
        "sidebar-glow relative flex h-full flex-col bg-base border-r border-subtle",
        navCollapsed ? "w-16" : "w-56",
        "transition-[width] duration-200",
        className
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-subtle px-4 py-4">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent)]">
            <BarChart3 className="h-[18px] w-[18px]" />
          </div>
          {!navCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-[var(--text-primary)] truncate">
                Trading
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-dim">
                v1.0
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "sidebar-nav-link",
                  navCollapsed && "justify-center px-2",
                  active && "active"
                )}
                title={navCollapsed ? item.label : undefined}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                {!navCollapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    <span className="nav-shortcut hidden lg:flex">{item.key}</span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Actions */}
      <div className="border-t border-subtle px-2 py-3 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            navCollapsed ? "justify-center px-2" : "justify-start gap-2"
          )}
          onClick={toggleTerminal}
          title="터미널 (Ctrl+`)"
        >
          <Terminal className="h-4 w-4 shrink-0" />
          {!navCollapsed && <span className="text-xs">터미널</span>}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
            navCollapsed ? "justify-center px-2" : "justify-start gap-2"
          )}
          onClick={toggleNavCollapsed}
          title={navCollapsed ? "사이드바 확장" : "사이드바 축소"}
        >
          {navCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="text-xs">축소</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
