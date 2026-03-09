"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useIndicatorHistory, type TimeRange } from "@/lib/queries/intel";
import { TimeRangeSelector } from "./time-range-selector";

function fmtDate(ts: string, range: TimeRange) {
  const d = new Date(ts);
  if (range === "1d") return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

export function IndicatorChart({
  indicator,
  label,
  color = "#6366F1",
  unit = "",
  decimals = 2,
}: {
  indicator: string;
  label: string;
  color?: string;
  unit?: string;
  decimals?: number;
}) {
  const [range, setRange] = useState<TimeRange>("1w");
  const { data, isLoading } = useIndicatorHistory(indicator, range);

  const points = (data?.data ?? []).map((p) => ({
    ts: p.ts,
    value: parseFloat(p.value),
  }));

  return (
    <div className="obsidian-card p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {label}
        </p>
        <TimeRangeSelector value={range} onChange={setRange} />
      </div>
      {isLoading ? (
        <div className="h-[160px] animate-pulse rounded" style={{ background: "var(--bg-elevated)" }} />
      ) : points.length === 0 ? (
        <div className="h-[160px] flex items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
          데이터 없음
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={points}>
            <defs>
              <linearGradient id={`grad-${indicator}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3" stroke="#1a2540" vertical={false} />
            <XAxis
              dataKey="ts"
              tickFormatter={(v) => fmtDate(v, range)}
              tick={{ fontSize: 10, fill: "#4a5874" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#4a5874" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v.toFixed(decimals)}${unit}`}
              width={60}
              domain={["auto", "auto"]}
            />
            <RechartsTooltip
              contentStyle={{
                background: "#0f1729",
                border: "1px solid #1a2540",
                borderRadius: 6,
                fontSize: 12,
                fontFamily: "JetBrains Mono, monospace",
              }}
              formatter={(v) => [`${Number(v).toFixed(decimals)}${unit}`, label]}
              labelFormatter={(v) => new Date(v).toLocaleString("ko-KR")}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#grad-${indicator})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
