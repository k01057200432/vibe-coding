"use client";

import { useState } from "react";
import { useTrades, type TradesParams } from "@/lib/queries/trades";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 20;

function sideBadge(side: string) {
  return side === "buy" ? (
    <span className="obsidian-badge badge-running">매수</span>
  ) : (
    <span className="obsidian-badge badge-error">매도</span>
  );
}

function pnlClass(pnl: string | null) {
  if (!pnl) return "";
  const v = parseFloat(pnl);
  if (v > 0) return "pnl-positive";
  if (v < 0) return "pnl-negative";
  return "";
}

function defaultFrom() {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().slice(0, 10);
}

function defaultTo() {
  return new Date().toISOString().slice(0, 10);
}

export function TradeTable({ mode, strategy }: { mode: "live" | "simulation"; strategy?: string }) {
  const [page, setPage] = useState(0);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [broker, setBroker] = useState("all");
  const [symbol, setSymbol] = useState("all");

  const params: TradesParams = {
    mode,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    from: from || undefined,
    to: to || undefined,
    broker: broker !== "all" ? broker : undefined,
    symbol: symbol !== "all" ? symbol : undefined,
    strategy: strategy || undefined,
  };

  const { data, isLoading } = useTrades(params);
  const trades = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="date"
          value={from}
          onChange={(e) => { setFrom(e.target.value); setPage(0); }}
          className="w-36"
          placeholder="From"
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => { setTo(e.target.value); setPage(0); }}
          className="w-36"
          placeholder="To"
        />
        <Select value={broker} onValueChange={(v) => { setBroker(v); setPage(0); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Broker" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 브로커</SelectItem>
            <SelectItem value="paper-alpaca">Paper Alpaca</SelectItem>
            <SelectItem value="alpaca-paper">Alpaca Paper</SelectItem>
            <SelectItem value="alpaca-live">Alpaca Live</SelectItem>
            <SelectItem value="simulate">Simulate</SelectItem>
          </SelectContent>
        </Select>
        <Select value={symbol} onValueChange={(v) => { setSymbol(v); setPage(0); }}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="종목" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 종목</SelectItem>
            <SelectItem value="TQQQ">TQQQ</SelectItem>
            <SelectItem value="SQQQ">SQQQ</SelectItem>
            <SelectItem value="SOXL">SOXL</SelectItem>
            <SelectItem value="TECL">TECL</SelectItem>
            <SelectItem value="COIN">COIN</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
          {total}건 거래
        </span>
      </div>

      <div className="obsidian-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>시간</TableHead>
                <TableHead>심볼</TableHead>
                <TableHead>방향</TableHead>
                <TableHead>수량</TableHead>
                <TableHead>가격</TableHead>
                <TableHead>브로커</TableHead>
                <TableHead>전략</TableHead>
                <TableHead>손익</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="select-none">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center" style={{ color: 'var(--text-muted)' }}>
                    로딩중...
                  </TableCell>
                </TableRow>
              ) : trades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center" style={{ color: 'var(--text-muted)' }}>
                    거래 내역이 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                trades.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {new Date(t.createdAt).toLocaleString("ko-KR", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{t.symbol}</TableCell>
                    <TableCell>{sideBadge(t.side)}</TableCell>
                    <TableCell className="font-mono">{t.qty}</TableCell>
                    <TableCell className="font-mono">
                      ${parseFloat(t.price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs">{t.broker}</TableCell>
                    <TableCell className="text-xs">{t.strategy ?? "-"}</TableCell>
                    <TableCell className={`font-mono ${pnlClass(t.pnl)}`}>
                      {t.pnl ? `$${parseFloat(t.pnl).toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>
                      <span className="obsidian-badge badge-stopped">{t.status}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
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
    </div>
  );
}
