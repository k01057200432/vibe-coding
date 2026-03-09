"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStrategyDetail, useStrategyAuditLog } from "@/lib/queries/strategies";

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
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}일 전`;
  return formatKo(ts);
}

function PnlText({ value }: { value: string | number | null }) {
  if (value == null) return <span className="text-muted-foreground">-</span>;
  const n = Number(value);
  return (
    <span className={n >= 0 ? "text-profit" : "text-loss"}>
      {n >= 0 ? "+" : ""}
      {n.toFixed(2)}
    </span>
  );
}

function PhaseBadge({ phase }: { phase: string }) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    running: { variant: "default", label: "실행중" },
    pending: { variant: "secondary", label: "대기" },
    stopped: { variant: "outline", label: "중지" },
    error: { variant: "destructive", label: "오류" },
  };
  const v = variants[phase] ?? { variant: "outline" as const, label: phase };
  return <Badge variant={v.variant}>{v.label}</Badge>;
}

interface Position {
  symbol: string;
  qty: number;
  avg_price?: number;
  avgPrice?: number;
  current_price?: number;
  currentPrice?: number;
  pnl?: number;
  unrealized_pnl?: number;
  unrealizedPnl?: number;
}

export function StrategyDetail({
  strategyId,
  open,
  onOpenChange,
}: {
  strategyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useStrategyDetail(strategyId);

  const strategy = data?.strategy;
  const signals = data?.signals ?? [];
  const trades = data?.trades ?? [];
  const { data: auditData } = useStrategyAuditLog(strategyId);
  const auditLog = auditData?.logs ?? data?.auditLog ?? [];

  const positions: Position[] = (() => {
    if (!strategy?.positions) return [];
    const p = strategy.positions;
    if (Array.isArray(p)) return p;
    if (typeof p === "object") return Object.values(p);
    return [];
  })();

  const params: [string, unknown][] = (() => {
    if (!strategy?.params) return [];
    if (typeof strategy.params === "object") return Object.entries(strategy.params);
    return [];
  })();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] md:w-[500px] sm:max-w-[500px] p-0">
        <SheetHeader className="px-4 pt-4 pb-0">
          <SheetTitle>
            {isLoading ? "로딩 중..." : strategy?.name ?? "전략 상세"}
          </SheetTitle>
          {strategy && (
            <SheetDescription asChild>
              <div className="flex gap-1.5 flex-wrap">
                <Badge variant="outline">{strategy.type}</Badge>
                <Badge variant="secondary">{strategy.broker}</Badge>
                <PhaseBadge phase={strategy.phase} />
                <Badge
                  variant={strategy.mode === "live" ? "destructive" : "secondary"}
                >
                  {strategy.mode === "paper" ? "가상" : strategy.mode === "live" ? "실전" : strategy.mode}
                </Badge>
              </div>
            </SheetDescription>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-80px)]">
          <div className="space-y-3 p-4">
            {isLoading ? (
              <div className="text-muted-foreground text-center py-8">로딩 중...</div>
            ) : !strategy ? (
              <div className="text-muted-foreground text-center py-8">데이터 없음</div>
            ) : (
              <Tabs defaultValue="detail">
                <TabsList className="w-full">
                  <TabsTrigger value="detail">상세</TabsTrigger>
                  <TabsTrigger value="audit">
                    변경 이력
                    {auditLog.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
                        {auditLog.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="detail" className="space-y-3 mt-3">
                  {/* 상태 */}
                  <Card className="py-3 gap-2">
                    <CardHeader className="px-4 py-0">
                      <CardTitle className="text-sm">상태</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-0">
                      <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                        <span className="text-muted-foreground">활성</span>
                        <span>{strategy.enabled ? "ON" : "OFF"}</span>
                        <span className="text-muted-foreground">스케줄</span>
                        <span className="font-mono">{strategy.schedule}</span>
                        <span className="text-muted-foreground">자본 비율</span>
                        <span>{(Number(strategy.capital_pct) * 100).toFixed(1)}%</span>
                        <span className="text-muted-foreground">심볼</span>
                        <span>{strategy.symbols?.join(", ") ?? "-"}</span>
                        <span className="text-muted-foreground">하트비트</span>
                        <span className="text-xs">{formatKo(strategy.heartbeat_at)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 포지션 */}
                  <Card className="py-3 gap-2">
                    <CardHeader className="px-4 py-0">
                      <CardTitle className="text-sm">포지션</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-0">
                      {positions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">포지션 없음</p>
                      ) : (
                        <div className="space-y-2">
                          {positions.map((p, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <div>
                                <span className="font-medium">{p.symbol}</span>
                                <span className="text-muted-foreground ml-2">
                                  {p.qty}주 @ ${Number(p.avg_price ?? p.avgPrice ?? 0).toFixed(2)}
                                </span>
                              </div>
                              <PnlText value={p.pnl ?? p.unrealized_pnl ?? p.unrealizedPnl ?? null} />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 파라미터 */}
                  {params.length > 0 && (
                    <Card className="py-3 gap-2">
                      <CardHeader className="px-4 py-0">
                        <CardTitle className="text-sm">파라미터</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 py-0">
                        <div className="grid grid-cols-2 gap-y-1 text-sm">
                          {params.map(([k, v]) => (
                            <div key={k} className="contents">
                              <span className="text-muted-foreground font-mono text-xs">{k}</span>
                              <span className="font-mono text-xs">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Separator />

                  {/* 최근 신호 */}
                  <Card className="py-3 gap-2">
                    <CardHeader className="px-4 py-0">
                      <CardTitle className="text-sm">최근 신호</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-0">
                      {signals.length === 0 ? (
                        <p className="text-sm text-muted-foreground">데이터 없음</p>
                      ) : (
                        <div className="space-y-2">
                          {signals.map((s: Record<string, string>, i: number) => (
                            <div key={i} className="text-sm border-b border-border/50 pb-1.5 last:border-0">
                              <div className="flex justify-between items-center">
                                <Badge variant="outline" className="text-xs">
                                  {s.action}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatKo(s.created_at)}
                                </span>
                              </div>
                              {s.reason && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {s.reason}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 최근 거래 */}
                  <Card className="py-3 gap-2">
                    <CardHeader className="px-4 py-0">
                      <CardTitle className="text-sm">최근 거래</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-0">
                      {trades.length === 0 ? (
                        <p className="text-sm text-muted-foreground">데이터 없음</p>
                      ) : (
                        <div className="space-y-2">
                          {trades.map((t: Record<string, string>, i: number) => (
                            <div key={i} className="flex items-center justify-between text-sm border-b border-border/50 pb-1.5 last:border-0">
                              <div>
                                <Badge
                                  variant="outline"
                                  className={t.side === "buy" ? "text-emerald-400" : "text-red-400"}
                                >
                                  {t.side === "buy" ? "매수" : t.side === "sell" ? "매도" : t.side?.toUpperCase()}
                                </Badge>
                                <span className="ml-1.5">{t.symbol}</span>
                                <span className="text-muted-foreground ml-1 text-xs">
                                  {t.qty}주 @ ${Number(t.price).toFixed(2)}
                                </span>
                              </div>
                              <div className="text-right">
                                <PnlText value={t.pnl} />
                                <div className="text-xs text-muted-foreground">
                                  {formatKo(t.created_at)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="audit" className="mt-3">
                  {auditLog.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      변경 이력이 없습니다
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {auditLog.map((a: Record<string, string>, i: number) => (
                        <div
                          key={a.id ?? i}
                          className="flex gap-3 py-2.5 border-b border-border/50 last:border-0"
                        >
                          <div className="flex flex-col items-center pt-0.5">
                            <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                            {i < auditLog.length - 1 && (
                              <div className="w-px flex-1 bg-border/60 mt-1" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-mono text-xs font-medium text-foreground">
                                {a.field_changed ?? a.fieldChanged}
                              </span>
                              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {timeAgo(a.changed_at ?? a.changedAt)}
                              </span>
                            </div>
                            <div className="text-xs mt-0.5">
                              <span className="text-loss">{a.old_value ?? a.oldValue ?? "(없음)"}</span>
                              {" → "}
                              <span className="text-profit">{a.new_value ?? a.newValue ?? "(없음)"}</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              by {a.changed_by ?? a.changedBy}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
