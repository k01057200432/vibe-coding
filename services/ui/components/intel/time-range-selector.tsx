"use client";

import type { TimeRange } from "@/lib/queries/intel";

const RANGES: { value: TimeRange; label: string }[] = [
  { value: "1d", label: "1일" },
  { value: "1w", label: "1주" },
  { value: "1m", label: "1개월" },
  { value: "3m", label: "3개월" },
];

export function TimeRangeSelector({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
}) {
  return (
    <div className="flex gap-1">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            value === r.value
              ? "bg-[var(--accent-primary)] text-white font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
