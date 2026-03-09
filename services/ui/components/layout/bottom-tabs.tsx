"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Terminal as TerminalIcon } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui";

const tabs = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/__terminal__", icon: TerminalIcon, label: "터미널" },
];

export function BottomTabs({ className }: { className?: string }) {
  const pathname = usePathname();
  const toggleTerminal = useUIStore((s) => s.toggleTerminal);
  const terminalOpen = useUIStore((s) => s.terminalOpen);

  const isActive = (href: string) =>
    href === "/__terminal__"
      ? terminalOpen
      : pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <nav
      className={cn(
        "flex items-stretch border-t border-subtle bg-base safe-area-bottom",
        className
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.href);

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
  );
}
