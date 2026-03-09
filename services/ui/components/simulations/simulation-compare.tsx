"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSimulationCompare } from "@/lib/queries/simulations";

interface SimulationCompareProps {
  ids: number[];
}

function formatPct(val: string | number | null) {
  if (val === null || val === undefined) return "-";
  const n = Number(val);
  if (isNaN(n)) return "-";
  return n.toFixed(2) + "%";
}

function formatMoney(val: string | number | null) {
  if (val === null || val === undefined) return "-";
  const n = Number(val);
  if (isNaN(n)) return "-";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

type Row = Record<string, unknown>;

const metrics: { key: string; label: string; format: (v: unknown) => string; higherBetter: boolean }[] = [
  { key: "strategy_type", label: "전략", format: (v) => String(v ?? "-"), higherBetter: true },
  { key: "trade_symbol", label: "심볼", format: (v) => String(v ?? "-"), higherBetter: true },
  { key: "total_return_pct", label: "수익률 %", format: (v) => formatPct(v as string), higherBetter: true },
  { key: "max_drawdown_pct", label: "최대 낙폭 %", format: (v) => formatPct(v as string), higherBetter: false },
  { key: "sharpe_ratio", label: "샤프 비율", format: (v) => Number(v ?? 0).toFixed(2), higherBetter: true },
  { key: "total_trades", label: "총 거래", format: (v) => String(v ?? 0), higherBetter: true },
  { key: "won_trades", label: "승", format: (v) => String(v ?? 0), higherBetter: true },
  { key: "lost_trades", label: "패", format: (v) => String(v ?? 0), higherBetter: false },
  { key: "final_equity", label: "최종 자산", format: (v) => formatMoney(v as string), higherBetter: true },
  { key: "initial_cash", label: "초기 자본", format: (v) => formatMoney(v as string), higherBetter: true },
  { key: "start_date", label: "시작일", format: (v) => String(v ?? "-"), higherBetter: true },
  { key: "end_date", label: "종료일", format: (v) => String(v ?? "-"), higherBetter: true },
];

function getBestWorst(rows: Row[], key: string, higherBetter: boolean) {
  const numericKeys = ["total_return_pct", "max_drawdown_pct", "sharpe_ratio", "total_trades", "won_trades", "lost_trades", "final_equity", "initial_cash"];
  if (!numericKeys.includes(key)) return { bestIdx: -1, worstIdx: -1 };

  let bestIdx = -1;
  let worstIdx = -1;
  let bestVal = -Infinity;
  let worstVal = Infinity;

  rows.forEach((r, i) => {
    const n = Number(r[key]);
    if (isNaN(n)) return;
    if (higherBetter) {
      if (n > bestVal) { bestVal = n; bestIdx = i; }
      if (n < worstVal) { worstVal = n; worstIdx = i; }
    } else {
      if (n < bestVal) { bestVal = n; bestIdx = i; }
      if (n > worstVal) { worstVal = n; worstIdx = i; }
    }
  });

  // Only highlight if more than 1 row and values differ
  if (rows.length <= 1 || bestIdx === worstIdx) return { bestIdx: -1, worstIdx: -1 };
  return { bestIdx, worstIdx };
}

export function SimulationCompare({ ids }: SimulationCompareProps) {
  const { data, isLoading } = useSimulationCompare(ids);

  if (isLoading) {
    return <div className="text-muted-foreground text-sm py-4 text-center">로딩중...</div>;
  }

  const rows: Row[] = data?.rows ?? [];
  if (rows.length === 0) {
    return <div className="text-muted-foreground text-sm py-4 text-center">비교할 완료된 시뮬레이션이 없습니다</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px]">지표</TableHead>
            {rows.map((r) => (
              <TableHead key={String(r.id)} className="min-w-[120px]">
                <div className="font-medium truncate max-w-[140px]">{String(r.name)}</div>
                <Badge variant="outline" className="text-[10px] mt-0.5">{String(r.strategy_type)}</Badge>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((m) => {
            const { bestIdx, worstIdx } = getBestWorst(rows, m.key, m.higherBetter);
            return (
              <TableRow key={m.key}>
                <TableCell className="font-medium text-muted-foreground text-xs">{m.label}</TableCell>
                {rows.map((r, i) => (
                  <TableCell
                    key={String(r.id)}
                    className={
                      i === bestIdx ? "text-profit font-semibold" :
                      i === worstIdx ? "text-loss font-semibold" : ""
                    }
                  >
                    {m.format(r[m.key])}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
