"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NavRail } from "./nav-rail";
import { BottomTabs } from "./bottom-tabs";
import { TerminalPanel } from "./terminal-panel";
import { CommandPalette } from "./command-palette";
import { useUIStore } from "@/lib/stores/ui";
import { RefreshButton } from "./auto-refresh";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const terminalOpen = useUIStore((s) => s.terminalOpen);
  const setTerminalOpen = useUIStore((s) => s.setTerminalOpen);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(document.cookie.includes("session="));
  }, [pathname]);

  // 터미널 상태 localStorage 복원
  useEffect(() => {
    const saved = localStorage.getItem("vibe-terminal-open");
    if (saved === "true") setTerminalOpen(true);
  }, [setTerminalOpen]);

  // 터미널 상태 localStorage 저장
  useEffect(() => {
    localStorage.setItem("vibe-terminal-open", String(terminalOpen));
  }, [terminalOpen]);

  const showNav = loggedIn && pathname !== "/login";

  if (!showNav) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-start pt-20 md:justify-center md:pt-0">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <NavRail className="hidden md:flex" />
      <div className="flex flex-1 flex-col min-w-0">
        {terminalOpen && <TerminalPanel />}
        <main className="relative z-10 flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-4 md:p-6 animate-in">
          {children}
        </main>
        <BottomTabs className="md:hidden" />
      </div>
      <CommandPalette />
      <RefreshButton />
    </div>
  );
}
