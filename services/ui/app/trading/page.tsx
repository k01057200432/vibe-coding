"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown } from "lucide-react";
import { BrokerCards } from "@/components/brokers/broker-cards";
import { TradeTable } from "@/components/trades/trade-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Position {
  broker: string;
  symbol: string;
  qty: string;
  avgEntryPrice: string;
  currentPrice: string;
  marketValue: string;
  unrealizedPnl: string;
  unrealizedPct: string;
}

export default function TradingPage() {
  const [tradeMode, setTradeMode] = useState<"live" | "simulation">("live");
  const [killing, setKilling] = useState(false);

  const handleKill = async () => {
    if (!confirm("모든 전략을 비활성화하고 포지션을 청산합니까?")) return;
    setKilling(true);
    try {
      await fetch("/api/kill", { method: "POST" });
    } finally {
      setKilling(false);
    }
  };

  const handleResume = async () => {
    await fetch("/api/resume", { method: "POST" });
  };

  const { data: brokerData, isLoading: brokersLoading, refetch: refetchBrokers } = useQuery({
    queryKey: ["brokers"],
    queryFn: async () => {
      const res = await fetch("/api/brokers");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const { data: positions = [], isLoading: positionsLoading } = useQuery<Position[]>({
    queryKey: ["positions"],
    queryFn: async () => {
      const res = await fetch("/api/brokers/positions");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const totalUnrealized = positions.reduce(
    (sum, p) => sum + parseFloat(p.unrealizedPnl || "0"),
    0
  );

  return (
    <div className="space-y-6 animate-in">
      {/* Action Bar */}
      <div className="page-header">
        <div>
          <h2 className="page-title">거래</h2>
          <p className="page-subtitle">브로커 계좌, 포지션, 거래내역</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-kill px-3 py-1.5 rounded text-xs min-w-[5rem]"
            onClick={handleKill}
            disabled={killing}
            title="모든 전략을 비활성화하고 봇을 중지합니다"
          >
            {killing ? "중지 중..." : "전체 중지"}
          </button>
          <button
            className="btn-resume px-3 py-1.5 rounded text-xs min-w-[5rem]"
            onClick={handleResume}
            title="중지된 전략들을 다시 활성화합니다"
          >
            재개
          </button>
        </div>
      </div>

      {/* Broker Account Summary */}
      <section>
        <h3 className="section-title mb-3" style={{ color: "var(--text-secondary)" }}>
          계좌 요약
        </h3>
        {brokersLoading ? (
          <div className="empty-state">로딩중...</div>
        ) : (
          <BrokerCards
            brokers={brokerData?.brokers ?? []}
            strategies={brokerData?.strategies ?? []}
            onRefresh={() => refetchBrokers()}
          />
        )}
      </section>

      {/* Active Positions */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="section-title" style={{ color: "var(--text-secondary)" }}>
            활성 포지션
          </h3>
          {positions.length > 0 && (
            <span
              className={`text-sm font-mono font-semibold ${
                totalUnrealized >= 0 ? "pnl-positive" : "pnl-negative"
              }`}
            >
              {totalUnrealized >= 0 ? (
                <TrendingUp className="mr-1 h-3.5 w-3.5 inline" />
              ) : (
                <TrendingDown className="mr-1 h-3.5 w-3.5 inline" />
              )}
              <span className="select-text">${totalUnrealized.toFixed(2)}</span>
            </span>
          )}
        </div>
        {positionsLoading ? (
          <div className="empty-state">로딩중...</div>
        ) : positions.length === 0 ? (
          <div className="obsidian-card p-6 text-center" style={{ color: "var(--text-muted)" }}>
            열린 포지션이 없습니다
          </div>
        ) : (
          <div className="obsidian-card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>브로커</TableHead>
                    <TableHead>심볼</TableHead>
                    <TableHead className="text-right">수량</TableHead>
                    <TableHead className="text-right">평균단가</TableHead>
                    <TableHead className="text-right">현재가</TableHead>
                    <TableHead className="text-right">평가금액</TableHead>
                    <TableHead className="text-right">미실현 손익</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="select-text">
                  {positions.map((p, i) => {
                    const pnl = parseFloat(p.unrealizedPnl || "0");
                    const pct = parseFloat(p.unrealizedPct || "0");
                    return (
                      <TableRow key={`${p.broker}-${p.symbol}-${i}`}>
                        <TableCell className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {p.broker}
                        </TableCell>
                        <TableCell className="font-mono font-medium" style={{ color: "var(--text-primary)" }}>
                          {p.symbol}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {p.qty}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${parseFloat(p.avgEntryPrice).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${parseFloat(p.currentPrice).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${parseFloat(p.marketValue).toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right font-mono font-semibold select-text ${pnl >= 0 ? "pnl-positive" : "pnl-negative"}`}>
                          ${pnl.toFixed(2)} ({(pct * 100).toFixed(2)}%)
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </section>

      {/* Recent Trades */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="section-title" style={{ color: "var(--text-secondary)" }}>
            거래 내역
          </h3>
          <nav className="tab-nav">
            <button
              className={`tab-nav-item ${tradeMode === "live" ? "active" : ""}`}
              onClick={() => setTradeMode("live")}
            >
              실전
            </button>
            <button
              className={`tab-nav-item ${tradeMode === "simulation" ? "active" : ""}`}
              onClick={() => setTradeMode("simulation")}
            >
              시뮬레이션
            </button>
          </nav>
        </div>
        <TradeTable mode={tradeMode} />
      </section>
    </div>
  );
}
