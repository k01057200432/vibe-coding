"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  ArrowLeftRight,
  Lightbulb,
  MoreHorizontal,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Bell, CalendarDays, Settings, Terminal as TerminalIcon } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui";

const tabs = [
  { href: "/", icon: LayoutDashboard, label: "대시보드" },
  { href: "/strategies", icon: Target, label: "전략" },
  { href: "/__terminal__", icon: TerminalIcon, label: "터미널" },
  { href: "/insights", icon: Lightbulb, label: "인사이트" },
  { href: "/__more__", icon: MoreHorizontal, label: "더보기" },
];

const moreItems = [
  { href: "/catalog", icon: BookOpen, label: "카탈로그" },
  { href: "/trading", icon: ArrowLeftRight, label: "거래" },
  { href: "/notifications/unread", icon: Bell, label: "알림" },
  { href: "/calendar", icon: CalendarDays, label: "캘린더" },
  { href: "/settings", icon: Settings, label: "설정" },
];

export function BottomTabs({ className }: { className?: string }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const toggleTerminal = useUIStore((s) => s.toggleTerminal);

  const terminalOpen = useUIStore((s) => s.terminalOpen);
  const isActive = (href: string) =>
    href === "/__more__"
      ? pathname.startsWith("/notifications") || pathname.startsWith("/calendar") || pathname.startsWith("/settings") || pathname.startsWith("/trading")
      : href === "/__terminal__"
        ? terminalOpen
        : pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <>
      <nav
        className={cn(
          "flex items-stretch border-t border-subtle bg-base safe-area-bottom",
          className
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const isMore = tab.href === "/__more__";

          if (tab.href === "/__terminal__") {
            return (
              <button
                key={tab.href}
                onClick={() => toggleTerminal()}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[48px] transition-colors",
                  active
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-muted)]"
                )}
              >
                <tab.icon className="h-5 w-5" strokeWidth={1.75} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          }

          if (isMore) {
            return (
              <button
                key={tab.href}
                onClick={() => setMoreOpen(true)}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[48px] transition-colors",
                  active
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-muted)]"
                )}
              >
                <tab.icon className="h-5 w-5" strokeWidth={1.75} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[48px] transition-colors",
                active
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-muted)]"
              )}
            >
              <tab.icon className="h-5 w-5" strokeWidth={1.75} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="bg-base border-subtle">
          <div className="space-y-1 py-2">
            {moreItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-[var(--text-secondary)] hover:bg-elevated hover:text-[var(--text-primary)] transition-colors"
              >
                <item.icon className="h-5 w-5" strokeWidth={1.75} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
