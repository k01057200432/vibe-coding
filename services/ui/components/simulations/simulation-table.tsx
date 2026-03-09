"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useSimulations,
  useDeleteSimulation,
  usePauseSimulation,
  useResumeSimulation,
  useStopSimulation,
  type Simulation,
} from "@/lib/queries/simulations";
import { SimulationForm } from "./simulation-form";
import { SimulationCompare } from "./simulation-compare";
import {
  MoreHorizontal,
  Plus,
  Trash2,
  Pause,
  Play,
  Square,
  BarChart3,
  GitCompareArrows,
} from "lucide-react";

function StatusBadge({ status }: { status: string | null }) {
  const cls: Record<string, string> = {
    pending: "badge-pending",
    running: "badge-running",
    paused: "badge-stopped",
    completed: "badge-running",
    failed: "badge-error",
    cancelled: "badge-stopped",
  };
  const labels: Record<string, string> = {
    pending: "대기",
    running: "실행중",
    paused: "일시정지",
    completed: "완료",
    failed: "실패",
    cancelled: "취소됨",
  };
  const s = status ?? "";
  return (
    <span className={`obsidian-badge ${cls[s] ?? "badge-stopped"}`}>
      {labels[s] ?? s}
    </span>
  );
}

function formatPct(val: string | null) {
  if (val === null || val === undefined) return "-";
  const n = Number(val);
  if (isNaN(n)) return "-";
  const cls = n >= 0 ? "pnl-positive" : "pnl-negative";
  return <span className={cls}>{n.toFixed(2)}%</span>;
}

function formatMoney(val: string | null) {
  if (val === null || val === undefined) return "-";
  const n = Number(val);
  if (isNaN(n)) return "-";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function ProgressBar({ pct }: { pct: string | null }) {
  const n = Number(pct ?? 0);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(n, 100)}%`, background: 'var(--accent)' }}
        />
      </div>
      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
        {n.toFixed(0)}%
      </span>
    </div>
  );
}

export function SimulationTable() {
  const { data: sims, isLoading } = useSimulations();
  const deleteSim = useDeleteSimulation();
  const pauseSim = usePauseSimulation();
  const resumeSim = useResumeSimulation();
  const stopSim = useStopSimulation();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 5) {
        next.add(id);
      }
      return next;
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" 시뮬레이션을 삭제하시겠습니까?`)) {
      deleteSim.mutate(id);
    }
  };

  const isActive = (s: Simulation) =>
    s.status === "running" || s.status === "paused";

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="page-title">시뮬레이션</h2>
            <p className="page-subtitle">Time Machine 시뮬레이션 관리</p>
          </div>
          <Link href="/simulation/dashboard">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-1" />
              대시보드
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {selected.size >= 2 && (
            <Button size="sm" variant="outline" onClick={() => setCompareOpen(true)}>
              <GitCompareArrows className="h-4 w-4 mr-1" />
              비교 ({selected.size})
            </Button>
          )}
          <Button size="sm" onClick={() => setCreateOpen(true)} className="btn-accent">
            <Plus className="h-4 w-4 mr-1" /> 새 시뮬레이션
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="empty-state">로딩중...</div>
      ) : !sims?.length ? (
        <div className="empty-state">시뮬레이션이 없습니다</div>
      ) : (
        <div className="obsidian-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>상태</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>전략</TableHead>
                  <TableHead>심볼</TableHead>
                  <TableHead>기간</TableHead>
                  <TableHead>진행률</TableHead>
                  <TableHead>수익률</TableHead>
                  <TableHead>낙폭</TableHead>
                  <TableHead>샤프</TableHead>
                  <TableHead>거래</TableHead>
                  <TableHead>자산</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sims.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(Number(s.id))}
                        onCheckedChange={() => toggleSelect(Number(s.id))}
                        disabled={!selected.has(Number(s.id)) && selected.size >= 5}
                        aria-label={`Select ${s.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} />
                    </TableCell>
                    <TableCell className="font-medium max-w-[150px] truncate">
                      {s.name}
                    </TableCell>
                    <TableCell>
                      <span className="obsidian-badge badge-info">{s.strategyType}</span>
                    </TableCell>
                    <TableCell>
                      {s.tradeSymbol}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {s.startDate} ~ {s.endDate}
                    </TableCell>
                    <TableCell>
                      {isActive(s) ? (
                        <ProgressBar pct={s.progressPct} />
                      ) : s.status === "completed" ? (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>완료</span>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono">{formatPct(s.totalReturnPct)}</TableCell>
                    <TableCell className="font-mono">{formatPct(s.maxDrawdownPct)}</TableCell>
                    <TableCell className="font-mono">
                      {s.sharpeRatio ? Number(s.sharpeRatio).toFixed(2) : "-"}
                    </TableCell>
                    <TableCell className="font-mono">
                      {s.totalTrades ?? "-"}
                      {s.wonTrades != null && s.lostTrades != null && (
                        <span className="text-xs ml-1">
                          (<span className="pnl-positive">{s.wonTrades}</span>/
                          <span className="pnl-negative">{s.lostTrades}</span>)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono">{formatMoney(s.finalEquity)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {s.status === "running" && (
                            <DropdownMenuItem onClick={() => pauseSim.mutate(s.id)}>
                              <Pause className="h-4 w-4 mr-2" />
                              일시정지
                            </DropdownMenuItem>
                          )}
                          {s.status === "paused" && (
                            <DropdownMenuItem onClick={() => resumeSim.mutate(s.id)}>
                              <Play className="h-4 w-4 mr-2" />
                              재개
                            </DropdownMenuItem>
                          )}
                          {isActive(s) && (
                            <DropdownMenuItem onClick={() => stopSim.mutate(s.id)}>
                              <Square className="h-4 w-4 mr-2" />
                              중지
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            style={{ color: 'var(--accent-red)' }}
                            onClick={() => handleDelete(s.id, s.name)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <SimulationForm open={createOpen} onOpenChange={setCreateOpen} />

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-primary)' }}>시뮬레이션 비교</DialogTitle>
          </DialogHeader>
          <SimulationCompare ids={Array.from(selected)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
