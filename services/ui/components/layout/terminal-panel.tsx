"use client";

import { useRef, useState, useEffect } from "react";
import { X, GripHorizontal, ExternalLink } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CLAUDE_URL = process.env.NEXT_PUBLIC_CLAUDE_URL
  ? `${process.env.NEXT_PUBLIC_CLAUDE_URL}/chat`
  : "";
const MIN_HEIGHT = 200;
const MIN_HEIGHT_MODE_SELECT = 480;

export function TerminalPanel() {
  const { terminalHeight, setTerminalHeight, setTerminalOpen } = useUIStore();
  const [hasSession, setHasSession] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "claude-terminal-state") {
        setHasSession(e.data.hasSession);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const minHeight = hasSession ? MIN_HEIGHT : MIN_HEIGHT_MODE_SELECT;
  const effectiveHeight = Math.max(terminalHeight, minHeight);

  const blockIframe = () => {
    if (iframeRef.current) iframeRef.current.style.pointerEvents = "none";
  };
  const unblockIframe = () => {
    if (iframeRef.current) iframeRef.current.style.pointerEvents = "";
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startH: effectiveHeight };
    setIsDragging(true);
    blockIframe();

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = ev.clientY - dragRef.current.startY;
      setTerminalHeight(Math.max(MIN_HEIGHT, dragRef.current.startH + delta));
    };
    const onUp = () => {
      dragRef.current = null;
      setIsDragging(false);
      unblockIframe();
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    dragRef.current = { startY: e.touches[0].clientY, startH: effectiveHeight };
    setIsDragging(true);
    blockIframe();

    const onMove = (ev: TouchEvent) => {
      if (!dragRef.current) return;
      ev.preventDefault();
      const delta = ev.touches[0].clientY - dragRef.current.startY;
      setTerminalHeight(Math.max(MIN_HEIGHT, dragRef.current.startH + delta));
    };
    const onEnd = () => {
      dragRef.current = null;
      setIsDragging(false);
      unblockIframe();
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
  };

  if (!CLAUDE_URL) {
    return (
      <div
        className="flex flex-col border-b border-subtle bg-base"
        style={{ height: effectiveHeight }}
      >
        <div className="flex items-center justify-between px-3 py-1.5 bg-elevated border-b border-subtle">
          <span className="font-mono text-xs text-[var(--text-muted)]">Claude Terminal</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setTerminalOpen(false)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[var(--text-muted)]">NEXT_PUBLIC_CLAUDE_URL 미설정</p>
        </div>
        <div
          className={cn(
            "flex items-center justify-center h-3 cursor-row-resize",
            "bg-elevated hover:bg-[var(--bg-overlay)] transition-colors",
            "touch-action-none"
          )}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <GripHorizontal className="h-3 w-3 text-[var(--text-muted)]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col border-b border-subtle bg-base"
      style={{ height: effectiveHeight }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-elevated border-b border-subtle">
        <span className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">
          Claude Terminal
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-[var(--text-muted)]"
            onClick={() => window.open(CLAUDE_URL, "_blank")}
            title="새 탭으로 열기"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-[var(--text-muted)]"
            onClick={() => setTerminalOpen(false)}
            title="닫기 (Ctrl+`)"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Claude iframe */}
      <div className="flex-1 min-h-0">
        <iframe
          ref={iframeRef}
          src={CLAUDE_URL}
          className="h-full w-full border-0"
          title="Claude Terminal"
          allow="clipboard-write"
          style={{ touchAction: "manipulation" }}
        />
      </div>

      {/* Drag handle */}
      <div
        className={cn(
          "flex items-center justify-center h-3 cursor-row-resize",
          "bg-elevated hover:bg-[var(--bg-overlay)] transition-colors",
          "touch-action-none"
        )}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <GripHorizontal className="h-3 w-3 text-[var(--text-muted)]" />
      </div>
    </div>
  );
}
