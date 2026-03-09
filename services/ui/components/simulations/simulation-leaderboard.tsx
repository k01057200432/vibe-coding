"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSimulationLeaderboard } from "@/lib/queries/simulations";
import { Trophy } from "lucide-react";

function formatPct(val: string | number | null) {
  if (val === null || val === undefined) return "-";
  const n = Number(val);
  if (isNaN(n)) return "-";
  const cls = n >= 0 ? "text-profit" : "text-loss";
  return <span className={cls}>{n.toFixed(2)}%</span>;
}

function formatNum(val: string | number | null, decimals = 2) {
  if (val === null || val === undefined) return "-";
  const n = Number(val);
  if (isNaN(n)) return "-";
  return n.toFixed(decimals);
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">1위</Badge>;
  if (rank === 2) return <Badge className="bg-gray-400/20 text-gray-400 border-gray-400/30">2위</Badge>;
  if (rank === 3) return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">3위</Badge>;
  return <span className="text-muted-foreground text-sm">{rank}</span>;
}

export function SimulationLeaderboard() {
  const [groupBy, setGroupBy] = useState<"strategy_type" | "trade_symbol">("strategy_type");
  const { data, isLoading } = useSimulationLeaderboard(groupBy);

  const rows = data?.rows ?? [];

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Trophy className="h-4 w-4" /> 리더보드
          </CardTitle>
          <Tabs value={groupBy} onValueChange={(v) => setGroupBy(v as "strategy_type" | "trade_symbol")}>
            <TabsList className="h-7">
              <TabsTrigger value="strategy_type" className="text-xs px-2 h-6">전략</TabsTrigger>
              <TabsTrigger value="trade_symbol" className="text-xs px-2 h-6">심볼</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {isLoading ? (
          <div className="text-muted-foreground text-sm py-4 text-center">로딩중...</div>
        ) : !rows.length ? (
          <div className="text-muted-foreground text-sm py-4 text-center">데이터 없음</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>{groupBy === "strategy_type" ? "전략" : "심볼"}</TableHead>
                <TableHead>횟수</TableHead>
                <TableHead>평균 수익률</TableHead>
                <TableHead>최고</TableHead>
                <TableHead>최저</TableHead>
                <TableHead>평균 샤프</TableHead>
                <TableHead>평균 낙폭</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row: Record<string, unknown>, i: number) => (
                <TableRow key={String(row.group_key)}>
                  <TableCell><RankBadge rank={i + 1} /></TableCell>
                  <TableCell>
                    <Badge variant="outline">{String(row.group_key)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{String(row.total)}</TableCell>
                  <TableCell>{formatPct(row.avg_return as string)}</TableCell>
                  <TableCell>{formatPct(row.best_return as string)}</TableCell>
                  <TableCell>{formatPct(row.worst_return as string)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatNum(row.avg_sharpe as string)}</TableCell>
                  <TableCell>{formatPct(row.avg_drawdown as string)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
