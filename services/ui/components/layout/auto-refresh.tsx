"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "vibe-auto-refresh";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { enabled: !!parsed.enabled, interval: parsed.interval || 5 };
    }
  } catch {}
  return { enabled: false, interval: 5 };
}

function saveState(enabled: boolean, interval: number) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, interval }));
}

export function AutoRefresh() {
  const [enabled, setEnabled] = useState(false);
  const [interval, setIntervalSec] = useState(5);
  const [countdown, setCountdown] = useState(5);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 초기 마운트 시 localStorage에서 복원
  useEffect(() => {
    const state = loadState();
    setEnabled(state.enabled);
    setIntervalSec(state.interval);
    setCountdown(state.interval);
    setMounted(true);
  }, []);

  // 타이머 관리
  useEffect(() => {
    if (!mounted) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!enabled) {
      setCountdown(interval);
      return;
    }

    setCountdown(interval);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.reload();
          return interval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, interval, mounted]);

  if (!mounted) return null;

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    saveState(next, interval);
    setMenuOpen(false);
  };

  const changeInterval = (sec: number) => {
    setIntervalSec(sec);
    setCountdown(sec);
    saveState(enabled, sec);
    setMenuOpen(false);
  };

  const intervals = [3, 5, 10, 15, 30];

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-4">
      {menuOpen && (
        <div
          className="mb-2 rounded-xl border px-3 py-2 shadow-lg space-y-2"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <p
            className="text-xs font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            새로고침 간격
          </p>
          <div className="flex gap-1.5">
            {intervals.map((sec) => (
              <button
                key={sec}
                onClick={() => changeInterval(sec)}
                className={cn(
                  "rounded-lg px-2 py-1 text-xs font-mono transition-colors",
                  interval === sec ? "font-semibold" : "hover:opacity-80"
                )}
                style={{
                  background:
                    interval === sec
                      ? "var(--accent-glow)"
                      : "var(--bg-overlay)",
                  color:
                    interval === sec ? "var(--accent)" : "var(--text-muted)",
                  border: `1px solid ${
                    interval === sec
                      ? "var(--accent)"
                      : "var(--border-subtle)"
                  }`,
                }}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={toggle}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuOpen(!menuOpen);
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          setMenuOpen(!menuOpen);
        }}
        className={cn(
          "flex items-center gap-2 rounded-full px-3 py-2 shadow-lg transition-all",
          "border text-xs font-medium"
        )}
        style={{
          background: enabled ? "var(--accent-glow)" : "var(--bg-elevated)",
          borderColor: enabled ? "var(--accent)" : "var(--border-subtle)",
          color: enabled ? "var(--accent)" : "var(--text-muted)",
        }}
        title="클릭: 토글 / 우클릭·더블클릭: 간격 설정"
      >
        <RefreshCw
          className={cn("h-3.5 w-3.5", enabled && "animate-spin")}
          style={
            enabled
              ? { animationDuration: `${interval}s` }
              : undefined
          }
        />
        {enabled ? `${countdown}s` : "Auto"}
      </button>
    </div>
  );
}
