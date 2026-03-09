"use client";

import { useUIStore } from "@/lib/stores/ui";

export function HudOverlay() {
  const hudVisible = useUIStore((s) => s.hudVisible);

  if (!hudVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div className="rounded-xl border border-white/10 bg-black/75 px-8 py-6 shadow-2xl backdrop-blur-sm">
        <h3 className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-white/50">
          키보드 단축키
        </h3>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <kbd className="inline-flex h-5 min-w-[3rem] items-center justify-center rounded bg-white/10 px-1.5 text-[11px] font-mono text-white/70">
              Ctrl+`
            </kbd>
            <span className="text-xs text-white/60">터미널 토글</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="inline-flex h-5 min-w-[3rem] items-center justify-center rounded bg-white/10 px-1.5 text-[11px] font-mono text-white/70">
              Ctrl+K
            </kbd>
            <span className="text-xs text-white/60">Command Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}
