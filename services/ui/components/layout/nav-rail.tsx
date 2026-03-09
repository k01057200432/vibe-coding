"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Terminal,
  PanelLeftClose,
  PanelLeft,
  Code2,
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui";
import { Button } from "@/components/ui/button";

export interface NavItem {
  href: string;
  icon: typeof Home;
  label: string;
}

export const navItems: NavItem[] = [
  { href: "/", icon: Home, label: "홈" },
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
            <Code2 className="h-[18px] w-[18px]" />
          </div>
          {!navCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-[var(--text-primary)] truncate">
                Vibe Coding
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
                  <span className="flex-1 truncate">{item.label}</span>
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
