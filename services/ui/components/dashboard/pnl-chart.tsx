"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailyPnlEntry } from "@/lib/queries/dashboard";

const PERIODS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
] as const;

interface PnlChartProps {
  data: DailyPnlEntry[];
}

export function PnlChart({ data }: PnlChartProps) {
  const [period, setPeriod] = useState(30);

  const filtered = data.slice(-period);
  const lastPnl = filtered[filtered.length - 1]?.cumulativePnl ?? 0;

  return (
    <div className="obsidian-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">누적 손익</span>
          <span
            className={`text-sm font-mono font-bold ${lastPnl >= 0 ? "text-profit" : "text-loss"}`}
          >
            {lastPnl >= 0 ? "+" : ""}${lastPnl.toFixed(2)}
          </span>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.label}
              className={`chart-period-btn ${period === p.days ? "active" : ""}`}
              onClick={() => setPeriod(p.days)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: "2rem 1rem" }}>
          손익 데이터 없음
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={filtered}>
            <defs>
              <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={lastPnl >= 0 ? "#10b981" : "#ef4444"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={lastPnl >= 0 ? "#10b981" : "#ef4444"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1a2540"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#4a5874" }}
              tickFormatter={(v: string) => v.slice(5)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#4a5874" }}
              tickFormatter={(v: number) =>
                v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`
              }
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <RechartsTooltip
              contentStyle={{
                background: "#0f1729",
                border: "1px solid #1a2540",
                borderRadius: "6px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
              }}
              labelFormatter={(v) => String(v)}
              formatter={(value) => [
                `$${Number(value).toFixed(2)}`,
                "누적 손익",
              ]}
            />
            <Area
              type="monotone"
              dataKey="cumulativePnl"
              stroke={lastPnl >= 0 ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              fill="url(#pnlGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
