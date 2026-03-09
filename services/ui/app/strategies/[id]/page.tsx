"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useStrategyDetail,
  useStrategyAuditLog,
} from "@/lib/queries/strategies";
import {
  useSimulations,
  type Simulation,
} from "@/lib/queries/simulations";
import { TradeTable } from "@/components/trades/trade-table";
import { SimulationForm } from "@/components/simulations/simulation-form";
import { ArrowLeft, Plus } from "lucide-react";

function formatKo(ts: string | null) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(ts: string | null) {
  if (!ts) return "-";
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60_000) return "방금";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`;
  return formatKo(ts);
}

function PhaseBadge({ phase }: { phase: string }) {
  const cls: Record<string, string> = {
    running: "badge-running",
    pending: "badge-pending",
    stopped: "badge-stopped",
    error: "badge-error",
  };
  const labels: Record<string, string> = {
    running: "실행중",
    pending: "대기",
    stopped: "중지",
    error: "오류",
  };
  return (
    <span className={`obsidian-badge ${cls[phase] ?? "badge-stopped"}`}>
      {labels[phase] ?? phase}
    </span>
  );
}

function PnlText({ value }: { value: string | number | null }) {
  if (value == null) return <span style={{ color: "var(--text-muted)" }}>-</span>;
  const n = Number(value);
  return (
    <span style={{ color: n >= 0 ? "var(--profit)" : "var(--loss)" }}>
      {n >= 0 ? "+" : ""}{n.toFixed(2)}
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

interface Position {
  symbol: string;
  qty: number;
  avg_price?: number;
  avgPrice?: number;
  pnl?: number;
  unrealized_pnl?: number;
  unrealizedPnl?: number;
}

function ParametersTab({ strategy, auditLog }: { strategy: Record<string, unknown>; auditLog: Record<string, string>[] }) {
  const positions: Position[] = (() => {
    if (!strategy?.positions) return [];
    const p = strategy.positions;
    if (Array.isArray(p)) return p;
    if (typeof p === "object") return Object.values(p as Record<string, Position>);
    return [];
  })();

  const params: [string, unknown][] = (() => {
    if (!strategy?.params) return [];
    if (typeof strategy.params === "object") return Object.entries(strategy.params as Record<string, unknown>);
    return [];
  })();

  return (
    <div className="space-y-4">
      <Card className="obsidian-card py-3 gap-2">
        <CardHeader className="px-4 py-0">
          <CardTitle className="text-sm" style={{ color: "var(--text-primary)" }}>상태</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-0">
          <div className="grid grid-cols-2 gap-y-1.5 text-sm">
            <span style={{ color: "var(--text-muted)" }}>활성</span>
            <span>{(strategy.enabled as boolean) ? "ON" : "OFF"}</span>
            <span style={{ color: "var(--text-muted)" }}>스케줄</span>
            <span className="font-mono">{strategy.schedule as string}</span>
            <span style={{ color: "var(--text-muted)" }}>자본 비율</span>
            <span>{(Number(strategy.capital_pct) * 100).toFixed(1)}%</span>
            <span style={{ color: "var(--text-muted)" }}>심볼</span>
            <span>{(strategy.symbols as string[])?.join(", ") ?? "-"}</span>
            <span style={{ color: "var(--text-muted)" }}>하트비트</span>
            <span className="text-xs">{formatKo(strategy.heartbeat_at as string | null)}</span>
          </div>
        </CardContent>
      </Card>

      {positions.length > 0 && (
        <Card className="obsidian-card py-3 gap-2">
          <CardHeader className="px-4 py-0">
            <CardTitle className="text-sm" style={{ color: "var(--text-primary)" }}>포지션</CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-0">
            <div className="space-y-2">
              {positions.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{p.symbol}</span>
                    <span className="ml-2" style={{ color: "var(--text-muted)" }}>
                      {p.qty}주 @ ${Number(p.avg_price ?? p.avgPrice ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <PnlText value={p.pnl ?? p.unrealized_pnl ?? p.unrealizedPnl ?? null} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {params.length > 0 && (
        <Card className="obsidian-card py-3 gap-2">
          <CardHeader className="px-4 py-0">
            <CardTitle className="text-sm" style={{ color: "var(--text-primary)" }}>파라미터</CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-0">
            <div className="grid grid-cols-2 gap-y-1 text-sm">
              {params.map(([k, v]) => (
                <div key={k} className="contents">
                  <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{k}</span>
                  <span className="font-mono text-xs">{String(v)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {auditLog.length > 0 && (
        <Card className="obsidian-card py-3 gap-2">
          <CardHeader className="px-4 py-0">
            <CardTitle className="text-sm" style={{ color: "var(--text-primary)" }}>
              변경 이력
              <Badge variant="secondary" className="ml-2 text-[10px] px-1 py-0">
                {auditLog.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-0">
            <div className="space-y-0">
              {auditLog.slice(0, 10).map((a, i) => (
                <div
                  key={a.id ?? i}
                  className="flex gap-3 py-2.5 border-b last:border-0"
                  style={{ borderColor: "var(--bg-elevated)" }}
                >
                  <div className="flex flex-col items-center pt-0.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: "var(--text-muted)" }} />
                    {i < Math.min(auditLog.length, 10) - 1 && (
                      <div className="w-px flex-1 mt-1" style={{ background: "var(--bg-elevated)" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-mono text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                        {a.field_changed ?? a.fieldChanged}
                      </span>
                      <span className="text-[11px] whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                        {timeAgo(a.changed_at ?? a.changedAt)}
                      </span>
                    </div>
                    <div className="text-xs mt-0.5">
                      <span style={{ color: "var(--loss)" }}>{a.old_value ?? a.oldValue ?? "(없음)"}</span>
                      {" → "}
                      <span style={{ color: "var(--profit)" }}>{a.new_value ?? a.newValue ?? "(없음)"}</span>
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      by {a.changed_by ?? a.changedBy}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SimulationsTab({ strategyType }: { strategyType: string }) {
  const { data: allSims, isLoading } = useSimulations();
  const [createOpen, setCreateOpen] = useState(false);

  const sims = (allSims ?? []).filter(
    (s: Simulation) => s.strategyType === strategyType
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          {sims.length}개 시뮬레이션
        </span>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-[var(--accent)] text-white hover:bg-[var(--accent-bright)]"
        >
          <Plus className="h-4 w-4 mr-1" /> 새 시뮬레이션
        </Button>
      </div>

      {isLoading ? (
        <div className="empty-state">로딩중...</div>
      ) : sims.length === 0 ? (
        <div className="empty-state">이 전략의 시뮬레이션이 없습니다</div>
      ) : (
        <div className="space-y-2">
          {sims.map((s: Simulation) => (
            <Card key={s.id} className="obsidian-card py-3 gap-1">
              <CardContent className="px-4 py-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={s.status} />
                    <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                      {s.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {s.tradeSymbol}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="font-mono" style={{ color: "var(--text-muted)" }}>
                    {s.startDate} ~ {s.endDate}
                  </span>
                  <span className="font-mono">수익률: {formatPct(s.totalReturnPct)}</span>
                  <span className="font-mono">MDD: {formatPct(s.maxDrawdownPct)}</span>
                  <span className="font-mono">
                    샤프: {s.sharpeRatio ? Number(s.sharpeRatio).toFixed(2) : "-"}
                  </span>
                  <span className="font-mono">
                    거래: {s.totalTrades ?? "-"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SimulationForm open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function SignalsTab({ signals }: { signals: Record<string, string>[] }) {
  if (signals.length === 0) {
    return <div className="empty-state">신호 이력이 없습니다</div>;
  }

  return (
    <div className="space-y-2">
      {signals.map((s, i) => (
        <Card key={i} className="obsidian-card py-3 gap-1">
          <CardContent className="px-4 py-0">
            <div className="flex justify-between items-center">
              <span className={`obsidian-badge ${s.action === "buy" ? "badge-running" : s.action === "sell" ? "badge-error" : "badge-info"}`}>
                {s.action}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {formatKo(s.created_at)}
              </span>
            </div>
            {s.reason && (
              <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                {s.reason}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function StrategyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useStrategyDetail(id);
  const { data: auditData } = useStrategyAuditLog(id);

  const strategy = data?.strategy;
  const signals = data?.signals ?? [];
  const auditLog = auditData?.logs ?? data?.auditLog ?? [];

  if (isLoading) {
    return (
      <div className="space-y-5 animate-in">
        <div className="empty-state">로딩 중...</div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="space-y-5 animate-in">
        <div className="empty-state">전략을 찾을 수 없습니다</div>
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => router.push("/strategies")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> 전략 목록
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in">
      {/* Breadcrumb + Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/strategies")}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <Link href="/strategies" className="hover:underline">전략</Link>
              <span>/</span>
              <span style={{ color: "var(--text-primary)" }}>{strategy.name}</span>
            </div>
            <h2 className="page-title">{strategy.name}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PhaseBadge phase={strategy.phase} />
          <span className={`obsidian-badge ${strategy.mode === "live" ? "badge-live" : "badge-paper"}`}>
            {strategy.mode === "paper" ? "가상" : strategy.mode === "live" ? "실전" : strategy.mode}
          </span>
          <span className="obsidian-badge badge-info">{strategy.type}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="params">
        <TabsList className="w-full">
          <TabsTrigger value="params">파라미터</TabsTrigger>
          <TabsTrigger value="simulations">시뮬레이션</TabsTrigger>
          <TabsTrigger value="signals">
            신호이력
            {signals.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
                {signals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="trades">거래</TabsTrigger>
        </TabsList>

        <TabsContent value="params" className="mt-4">
          <ParametersTab strategy={strategy} auditLog={auditLog} />
        </TabsContent>

        <TabsContent value="simulations" className="mt-4">
          <SimulationsTab strategyType={strategy.type} />
        </TabsContent>

        <TabsContent value="signals" className="mt-4">
          <SignalsTab signals={signals} />
        </TabsContent>

        <TabsContent value="trades" className="mt-4">
          <TradeTable mode="live" strategy={strategy.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
