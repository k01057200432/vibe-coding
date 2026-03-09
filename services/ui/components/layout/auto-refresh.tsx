"use client";

import { RefreshCw } from "lucide-react";

export function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="fixed bottom-20 right-4 z-50 md:bottom-4 flex items-center gap-2 rounded-full px-3 py-2 shadow-lg border text-xs font-medium transition-all active:scale-95"
      style={{
        background: "var(--bg-elevated)",
        borderColor: "var(--border-subtle)",
        color: "var(--text-muted)",
      }}
      title="새로고침"
    >
      <RefreshCw className="h-3.5 w-3.5" />
    </button>
  );
}
