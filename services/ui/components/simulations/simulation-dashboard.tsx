"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSimulationDashboard, useSimulationCompareSymbols } from "@/lib/queries/simulations";
import { SimulationLeaderboard } from "./simulation-leaderboard";
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Activity, GitCompareArrows } from "lucide-react";

function formatPct(val: string | number | null) {
  if (val === null || val === undefined) return "-";
  const n = Number(val);
  if (isNaN(n)) return "-";
  const cls = n >= 0 ? "pnl-positive" : "pnl-negative";
  return <span className={cls}>{n.toFixed(2)}%</span>;
}

function formatNum(val: string | number | null, decimals = 2) {
  if (val === null || val === undefined) return "-";
  const n = Number(val);
  if (isNaN(n)) return "-";
  return n.toFixed(decimals);
}

function ReturnHistogram({
  data,
}: {
  data: { bucket: number; count: string; range_min: string; range_max: string }[];
}) {
  if (!data.length) {
    return <div className="empty-state">No data</div>;
  }
  const maxCount = Math.max(...data.map((d) => Number(d.count)));

  return (
    <div className="space-y-1">
      {data.map((d) => {
        const pct = maxCount > 0 ? (Number(d.count) / maxCount) * 100 : 0;
        const mid = (Number(d.range_min) + Number(d.range_max)) / 2;
        const isProfit = mid >= 0;
        return (
          <div key={d.bucket} className="flex items-center gap-2 text-xs">
            <span className="w-20 text-right font-mono" style={{ color: 'var(--text-muted)' }}>
              {Number(d.range_min).toFixed(0)}~{Number(d.range_max).toFixed(0)}%
            </span>
            <div className="flex-1 h-4 rounded overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
              <div
                className="h-full rounded transition-all"
                style={{
                  width: `${pct}%`,
                  background: isProfit ? 'var(--accent)' : 'var(--accent-red)',
                }}
              />
            </div>
            <span className="w-8 font-mono" style={{ color: 'var(--text-muted)' }}>{d.count}</span>
          </div>
        );
      })}
    </div>
  );
}

function SymbolComparisonTable() {
  const { data, isLoading } = useSimulationCompareSymbols();

  if (isLoading) return <div className="empty-state">로딩중...</div>;
  if (!data?.length) return <div className="empty-state">데이터 없음</div>;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>심볼</TableHead>
            <TableHead>시뮬 수</TableHead>
            <TableHead>평균 수익률</TableHead>
            <TableHead>평균 MDD</TableHead>
            <TableHead>평균 샤프</TableHead>
            <TableHead>최고</TableHead>
            <TableHead>최저</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.tradeSymbol}>
              <TableCell>
                <span className="obsidian-badge badge-info">{row.tradeSymbol}</span>
              </TableCell>
              <TableCell className="font-mono">{row.simCount}</TableCell>
              <TableCell className="font-mono">{formatPct(row.avgReturn)}</TableCell>
              <TableCell className="font-mono">{formatPct(row.avgMdd)}</TableCell>
              <TableCell className="font-mono">{formatNum(row.avgSharpe)}</TableCell>
              <TableCell className="font-mono">{formatPct(row.bestReturn)}</TableCell>
              <TableCell className="font-mono">{formatPct(row.worstReturn)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function SimulationDashboard() {
  const [sortBy, setSortBy] = useState("total_return_pct");
  const { data, isLoading } = useSimulationDashboard(sortBy);

  if (isLoading) {
    return <div className="empty-state">로딩중...</div>;
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/simulation/list">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              목록
            </Button>
          </Link>
          <div>
            <h2 className="page-title">시뮬레이션 대시보드</h2>
            <p className="page-subtitle">Time Machine 시뮬레이션 통계</p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card" data-accent="blue">
          <div className="stat-label flex items-center gap-1">
            <BarChart3 className="h-3 w-3" /> 완료
          </div>
          <div className="stat-value">{stats?.total_completed ?? 0}</div>
        </div>
        <div className="stat-card" data-accent="green">
          <div className="stat-label flex items-center gap-1">
            <Activity className="h-3 w-3" /> 평균 수익률
          </div>
          <div className="stat-value text-lg">{formatPct(stats?.avg_return ?? null)}</div>
        </div>
        <div className="stat-card" data-accent="green">
          <div className="stat-label flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> 최고
          </div>
          <div className="stat-value text-lg">{formatPct(stats?.best_return ?? null)}</div>
          <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{stats?.best_name ?? "-"}</div>
        </div>
        <div className="stat-card" data-accent="red">
          <div className="stat-label flex items-center gap-1">
            <TrendingDown className="h-3 w-3" /> 최저
          </div>
          <div className="stat-value text-lg">{formatPct(stats?.worst_return ?? null)}</div>
          <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{stats?.worst_name ?? "-"}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Return Distribution */}
        <div className="obsidian-card p-4">
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>수익률 분포</h3>
          <ReturnHistogram data={data?.distribution ?? []} />
        </div>

        {/* Strategy Type Aggregates */}
        <div className="obsidian-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="p-4 pb-2">
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>전략 유형별</h3>
          </div>
          {!data?.aggregates?.length ? (
            <div className="empty-state">데이터 없음</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>유형</TableHead>
                    <TableHead>수량</TableHead>
                    <TableHead>평균 수익률</TableHead>
                    <TableHead>평균 샤프</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.aggregates.map((a) => (
                    <TableRow key={a.strategy_type}>
                      <TableCell>
                        <span className="obsidian-badge badge-info">{a.strategy_type}</span>
                      </TableCell>
                      <TableCell className="font-mono">{a.completed}/{a.total}</TableCell>
                      <TableCell className="font-mono">{formatPct(a.avg_return)}</TableCell>
                      <TableCell className="font-mono">{formatNum(a.avg_sharpe)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Symbol Comparison */}
      <div className="obsidian-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="p-4 pb-2">
          <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            <GitCompareArrows className="h-4 w-4" />
            심볼별 비교
          </h3>
        </div>
        <SymbolComparisonTable />
      </div>

      {/* Leaderboard by Strategy/Symbol */}
      <SimulationLeaderboard />

      {/* Top Simulations */}
      <div className="obsidian-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>리더보드</h3>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total_return_pct">수익률 %</SelectItem>
                <SelectItem value="sharpe_ratio">샤프 비율</SelectItem>
                <SelectItem value="max_drawdown_pct">최대 낙폭</SelectItem>
                <SelectItem value="total_trades">총 거래수</SelectItem>
                <SelectItem value="created_at">최신순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {!data?.top?.length ? (
          <div className="empty-state">완료된 시뮬레이션 없음</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>전략</TableHead>
                  <TableHead>심볼</TableHead>
                  <TableHead>수익률</TableHead>
                  <TableHead>낙폭</TableHead>
                  <TableHead>샤프</TableHead>
                  <TableHead>거래</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.top.map((row, i) => (
                  <TableRow key={row.id as string}>
                    <TableCell className="font-mono" style={{ color: 'var(--text-muted)' }}>
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium max-w-[150px] truncate" style={{ color: 'var(--text-primary)' }}>
                      {row.name as string}
                    </TableCell>
                    <TableCell>
                      <span className="obsidian-badge badge-info">{row.strategy_type as string}</span>
                    </TableCell>
                    <TableCell className="font-mono">{row.trade_symbol as string}</TableCell>
                    <TableCell className="font-mono">{formatPct(row.total_return_pct as string)}</TableCell>
                    <TableCell className="font-mono">{formatPct(row.max_drawdown_pct as string)}</TableCell>
                    <TableCell className="font-mono">{formatNum(row.sharpe_ratio as string)}</TableCell>
                    <TableCell className="font-mono">{row.total_trades as number}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
