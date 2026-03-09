"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import iCalendarPlugin from "@fullcalendar/icalendar";
import { Copy, Check, CalendarDays, X } from "lucide-react";
import type { EventClickArg } from "@fullcalendar/core";

interface PopoverState {
  title: string;
  description: string;
  categories: string;
  time: string;
  x: number;
  y: number;
}

export default function CalendarPage() {
  const calRef = useRef<FullCalendar>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState("dayGridMonth");
  const [copied, setCopied] = useState(false);
  const [icsUrl] = useState(
    "https://trading.gobau.dev/api/v1/intel/calendar.ics",
  );
  const [popover, setPopover] = useState<PopoverState | null>(null);

  // Close description popover on outside click (capture phase)
  // Stops event from reaching FullCalendar so the "more" popover stays open
  useEffect(() => {
    if (!popover) return;
    const dismiss = (e: Event) => {
      e.stopImmediatePropagation();
      if (popoverRef.current?.contains(e.target as Node)) return;
      setPopover(null);
    };
    const raf = requestAnimationFrame(() => {
      document.addEventListener("mousedown", dismiss, true);
      document.addEventListener("click", dismiss, true);
    });
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousedown", dismiss, true);
      document.removeEventListener("click", dismiss, true);
    };
  }, [popover]);

  const changeView = (v: string) => {
    setView(v);
    calRef.current?.getApi().changeView(v);
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(icsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEventClick = useCallback((info: EventClickArg) => {
    info.jsEvent.stopPropagation();
    const ev = info.event;
    const desc = (ev.extendedProps?.description as string) ?? "";

    const rect = info.el.getBoundingClientRect();
    setPopover({
      title: ev.title,
      description: desc.replace(/\\n/g, "\n"),
      categories: "",
      time: ev.start
        ? ev.start.toLocaleString("ko-KR", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      x: Math.min(rect.left, window.innerWidth - 360),
      y: rect.bottom + 8,
    });
  }, []);

  const eventSource = useMemo(
    () => ({ url: "/api/v1/intel/calendar.ics", format: "ics" as const }),
    [],
  );

  const views = [
    { id: "dayGridMonth", label: "월간" },
    { id: "dayGridWeek", label: "주간" },
    { id: "listWeek", label: "리스트" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-[var(--accent)]" />
          경제 캘린더
        </h1>
        <div className="flex gap-1">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => changeView(v.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === v.id
                  ? "bg-[var(--accent)] text-white"
                  : "bg-elevated text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="obsidian-card calendar-wrapper">
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, listPlugin, iCalendarPlugin]}
          initialView={view}
          events={eventSource}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          locale="ko"
          height="auto"
          dayMaxEvents={5}
          eventClick={handleEventClick}
          eventDidMount={(info) => {
            const title = info.event.title;
            const desc =
              (info.event.extendedProps?.description as string) ?? "";
            const el = info.el;
            el.style.cursor = "pointer";
            let color = "var(--profit)";
            if (/매[수도]/.test(title)) {
              color = "var(--accent)";
            } else if (/뉴스/.test(title)) {
              color = "var(--profit)";
            } else if (desc.includes("중요도: 높음")) {
              color = "var(--loss)";
            } else if (desc.includes("중요도: 보통")) {
              color = "var(--warning)";
            }
            el.style.backgroundColor = color;
            el.style.borderColor = color;
          }}
        />
      </div>

      {/* Event detail popover */}
      {popover && (
        <div
          ref={popoverRef}
          className="fixed z-[9999] w-[340px] max-h-[50vh] bg-elevated border border-subtle rounded-lg shadow-2xl overflow-hidden"
          style={{ left: popover.x, top: popover.y }}
        >
          <div className="flex items-start justify-between gap-2 px-4 py-3 border-b border-subtle">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                {popover.title}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                {popover.time}
                {popover.categories && ` · ${popover.categories}`}
              </p>
            </div>
            <button
              onClick={() => setPopover(null)}
              className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {popover.description && (
            <div className="px-4 py-3 overflow-y-auto max-h-[35vh]">
              <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap font-sans leading-relaxed">
                {popover.description}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Impact legend */}
      <div className="flex gap-4 text-xs text-[var(--text-secondary)] flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-[var(--accent)]" />
          매매
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-[var(--loss)]" />
          High / Critical
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-[var(--warning)]" />
          Medium
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-[var(--profit)]" />
          Low (그룹)
        </span>
      </div>

      {/* Google Calendar subscription guide */}
      <div className="obsidian-card space-y-2">
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          Google Calendar / Apple Calendar 구독
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          아래 URL을 복사하여 캘린더 앱에서 &quot;URL로 구독&quot;을
          선택하세요.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-base px-3 py-2 rounded border border-subtle truncate text-[var(--text-secondary)]">
            {icsUrl}
          </code>
          <button
            onClick={copyUrl}
            className="shrink-0 px-3 py-2 text-xs rounded bg-elevated hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4 text-[var(--profit)]" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
