"use client";

import { NavRail } from "./nav-rail";
import { BottomTabs } from "./bottom-tabs";
import { TerminalPanel } from "./terminal-panel";
import { CommandPalette } from "./command-palette";
import { useUIStore } from "@/lib/stores/ui";

export function AppShell({ children }: { children: React.ReactNode }) {
  const terminalOpen = useUIStore((s) => s.terminalOpen);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Desktop nav */}
      <NavRail className="hidden md:flex" />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Terminal panel (top dropdown) */}
        {terminalOpen && <TerminalPanel />}

        {/* Main content */}
        <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 animate-in">
          {children}
        </main>

        {/* Mobile bottom tabs */}
        <BottomTabs className="md:hidden" />
      </div>

      <CommandPalette />
    </div>
  );
}
