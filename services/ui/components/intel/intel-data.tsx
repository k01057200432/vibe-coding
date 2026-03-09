"use client";

import { useState } from "react";
import {
  useIntelEvents,
  useMarketData,
  useOhlcv,
} from "@/lib/queries/intel";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 30;

const impactBadgeClass: Record<string, string> = {
  low: "badge-stopped",
  medium: "badge-warning",
  high: "badge-critical",
};

export function vixLevel(v: number) {
  if (v < 15) return { label: "낮음", className: "pnl-positive" };
  if (v < 25) return { label: "보통", className: "text-warning" };
  if (v < 35) return { label: "높음", className: "text-warning" };
  return { label: "극단", className: "pnl-negative" };
}

export function MarketOverview() {
  const { data, isLoading } = useMarketData();

  if (isLoading) return <div className="empty-state">로딩중...</div>;
  if (!data?.latest) return <div className="empty-state">시장 데이터 없음</div>;

  const snap = data.latest;
  const vix = snap.vix ? parseFloat(snap.vix) : null;
  const vl = vix !== null ? vixLevel(vix) : null;

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
      <div className="stat-card" data-accent={vix !== null && vix < 20 ? "green" : vix !== null && vix < 30 ? "amber" : "red"}>
        <div className="stat-label">VIX</div>
        <div className={`stat-value ${vl?.className ?? ""}`}>
          {vix?.toFixed(1) ?? "-"}
        </div>
        {vl && <p className={`text-xs mt-0.5 ${vl.className}`}>{vl.label}</p>}
      </div>
      <div className="stat-card" data-accent="blue">
        <div className="stat-label">Fear & Greed</div>
        <div className="stat-value">{snap.fearGreedIdx ?? "-"}</div>
      </div>
      <div className="stat-card" data-accent="green">
        <div className="stat-label">스냅샷 (24H)</div>
        <div className="stat-value">{data.recent.length}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">마지막 업데이트</div>
        <div className="text-sm font-mono mt-1" style={{ color: 'var(--text-primary)' }}>
          {new Date(snap.ts).toLocaleTimeString("ko-KR")}
        </div>
      </div>
    </div>
  );
}

export function OhlcvSummary() {
  const [symbol, setSymbol] = useState("QQQ");
  const { data, isLoading } = useOhlcv(symbol, 5);

  return (
    <div className="obsidian-card">
      <div className="p-4 pb-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>OHLCV</h3>
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="QQQ">QQQ</SelectItem>
              <SelectItem value="SPY">SPY</SelectItem>
              <SelectItem value="TQQQ">TQQQ</SelectItem>
              <SelectItem value="SOXL">SOXL</SelectItem>
              <SelectItem value="SQQQ">SQQQ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>최근 캔들</p>
      </div>
      <div style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div className="empty-state">로딩중...</div>
        ) : !data?.data?.length ? (
          <div className="empty-state">OHLCV 데이터 없음</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>O</TableHead>
                  <TableHead>H</TableHead>
                  <TableHead>L</TableHead>
                  <TableHead>C</TableHead>
                  <TableHead>Vol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.slice(-5).map((bar) => (
                  <TableRow key={bar.id}>
                    <TableCell className="text-xs font-mono">
                      {new Date(bar.ts).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {parseFloat(bar.open).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {parseFloat(bar.high).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {parseFloat(bar.low).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {parseFloat(bar.close).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {Number(parseFloat(bar.volume)).toLocaleString()}
                    </TableCell>
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

export function EventsTable() {
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState("all");

  const { data, isLoading } = useIntelEvents({
    type: typeFilter !== "all" ? typeFilter : undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const events = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="obsidian-card">
      <div className="p-4 pb-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>이벤트</h3>
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-32 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="fomc">FOMC</SelectItem>
              <SelectItem value="earnings">Earnings</SelectItem>
              <SelectItem value="news">News</SelectItem>
              <SelectItem value="economic">Economic</SelectItem>
              <SelectItem value="index_drop">지수 급락</SelectItem>
              <SelectItem value="credit_risk">신용 위험</SelectItem>
              <SelectItem value="breadth_divergence">내부강도 다이버전스</SelectItem>
              <SelectItem value="insider">인사이더</SelectItem>
              <SelectItem value="fed_speech">Fed 연설</SelectItem>
              <SelectItem value="gap">갭 스캐너</SelectItem>
              <SelectItem value="etf_flow">ETF 자금 흐름</SelectItem>
              <SelectItem value="dollar_spike">달러 급변</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-auto text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
            {total}건 이벤트
          </span>
        </div>
      </div>
      <div style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div className="empty-state">로딩중...</div>
        ) : events.length === 0 ? (
          <div className="empty-state">이벤트 없음</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>시간</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>제목</TableHead>
                    <TableHead>영향</TableHead>
                    <TableHead>심볼</TableHead>
                    <TableHead>예상</TableHead>
                    <TableHead>실제</TableHead>
                    <TableHead>이전</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell className="text-xs font-mono">
                        {new Date(ev.detectedAt).toLocaleString("ko-KR", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <span className="obsidian-badge badge-info">{ev.type}</span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">
                        {ev.title}
                      </TableCell>
                      <TableCell>
                        <span className={`obsidian-badge ${impactBadgeClass[ev.impactLevel] ?? impactBadgeClass.low}`}>
                          {ev.impactLevel}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {ev.symbols?.join(", ") ?? "-"}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {ev.expectedValue ?? "-"}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {ev.actualValue != null && ev.expectedValue != null ? (
                          <span style={{
                            color: parseFloat(ev.actualValue) > parseFloat(ev.expectedValue)
                              ? "var(--profit)"
                              : parseFloat(ev.actualValue) < parseFloat(ev.expectedValue)
                                ? "var(--loss)"
                                : "var(--text-primary)"
                          }}>
                            {ev.actualValue}
                          </span>
                        ) : (ev.actualValue ?? "-")}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {ev.previousValue ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="pagination py-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="pagination-info">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

