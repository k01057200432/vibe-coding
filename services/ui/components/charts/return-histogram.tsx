"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export interface HistogramBin {
  range: string;
  count: number;
  midpoint: number;
}

interface ReturnHistogramProps {
  data: HistogramBin[];
  title?: string;
}

export function ReturnHistogram({
  data,
  title = "수익률 분포",
}: ReturnHistogramProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center text-muted-foreground text-sm">
          데이터 없음
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(220 20% 15%)"
              vertical={false}
            />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 10, fill: "hsl(220 15% 55%)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(220 15% 55%)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={30}
            />
            <RechartsTooltip
              contentStyle={{
                background: "hsl(222 40% 5%)",
                border: "1px solid hsl(220 20% 15%)",
                borderRadius: "6px",
                fontSize: "12px",
              }}
              formatter={(value) => [`${value}`, "횟수"]}
            />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.midpoint >= 0 ? "#10b981" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
