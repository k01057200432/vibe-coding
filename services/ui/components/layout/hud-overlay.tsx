"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/stores/ui";
import { navItems } from "@/components/layout/nav-rail";
import { getPageHotkeys, globalHotkeys } from "@/lib/hooks/use-hotkeys";

export function HudOverlay() {
  const hudVisible = useUIStore((s) => s.hudVisible);
  const pathname = usePathname();
  const router = useRouter();

  if (!hudVisible) return null;

  const pageHotkeys = getPageHotkeys(pathname, router);

  const pageName =
    pathname === "/"
      ? "대시보드"
      : pathname.startsWith("/strategies")
        ? "전략"
        : pathname.startsWith("/trading")
          ? "거래"
          : pathname.startsWith("/insights")
            ? "인사이트"
            : null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div className="rounded-xl border border-white/10 bg-black/75 px-8 py-6 shadow-2xl backdrop-blur-sm">
        <h3 className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-white/50">
          키보드 단축키
        </h3>

        {/* Terminal + Command Palette */}
        <div className="mb-3">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/30">
            전역
          </p>
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
            {globalHotkeys.map((h) => (
              <div key={h.key} className="flex items-center gap-2">
                <kbd className="inline-flex h-5 min-w-[3rem] items-center justify-center rounded bg-white/10 px-1.5 text-[11px] font-mono text-white/70">
                  Alt+{h.key.toUpperCase()}
                </kbd>
                <span className="text-xs text-white/60">{h.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-3 border-t border-white/10 pt-3">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/30">
            페이지 이동
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
            {navItems.map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <kbd className="inline-flex h-5 min-w-[3rem] items-center justify-center rounded bg-white/10 px-1.5 text-[11px] font-mono text-white/70">
                  Alt+{item.key}
                </kbd>
                <span className="text-xs text-white/60">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Page-specific */}
        {pageHotkeys.length > 0 && (
          <div className="border-t border-white/10 pt-3">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/30">
              {pageName} 단축키
            </p>
            <div className="space-y-0.5">
              {pageHotkeys.map((h) => (
                <div key={h.key} className="flex items-center gap-2">
                  <kbd className="inline-flex h-5 min-w-[3rem] items-center justify-center rounded bg-white/10 px-1.5 text-[11px] font-mono text-white/70">
                    Alt+{h.key.toUpperCase()}
                  </kbd>
                  <span className="text-xs text-white/60">{h.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
