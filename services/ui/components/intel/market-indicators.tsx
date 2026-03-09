"use client";

import { useState, Children } from "react";
import { useMarketIndicators, type MarketIndicator } from "@/lib/queries/intel";
import { useWatchlistByCategory } from "@/lib/queries/watchlist";
import { IndicatorChart } from "./indicator-chart";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(v: string | number, decimals = 2): string {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "-";
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function changeBadge(changePct: string | undefined) {
  if (!changePct) return null;
  const n = parseFloat(changePct);
  if (isNaN(n)) return null;
  const cls = n > 0 ? "pnl-positive" : n < 0 ? "pnl-negative" : "text-muted-foreground";
  return (
    <span className={`text-xs font-mono ${cls}`}>
      {n > 0 ? "+" : ""}{n.toFixed(2)}%
    </span>
  );
}

// ─── single row ─────────────────────────────────────────────────────────────

function IndicatorRow({ name, value, changePct, decimals = 2 }: {
  name: string;
  value: string;
  changePct?: string;
  decimals?: number;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{name}</span>
      <div className="flex items-center gap-3">
        {changeBadge(changePct)}
        <span className="text-xs font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
          {fmt(value, decimals)}
        </span>
      </div>
    </div>
  );
}

// ─── panel wrapper ───────────────────────────────────────────────────────────

const COLLAPSE_THRESHOLD = 5;

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const items = Children.toArray(children);
  const shouldCollapse = items.length > COLLAPSE_THRESHOLD;
  const collapsed = shouldCollapse && !expanded;
  const visible = collapsed ? items.slice(0, COLLAPSE_THRESHOLD) : items;

  return (
    <div className="obsidian-card p-4">
      <p className="section-header mb-2">{title}</p>
      <div className={collapsed ? "[&>*:last-child]:border-0" : ""}>
        {visible}
      </div>
      {shouldCollapse && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full mt-2 py-1.5 text-xs font-medium rounded transition-colors"
          style={{ color: "var(--text-muted)", background: "var(--bg-elevated)" }}
        >
          {expanded ? "접기" : `더보기 (+${items.length - COLLAPSE_THRESHOLD})`}
        </button>
      )}
    </div>
  );
}

// ─── lookup helpers ──────────────────────────────────────────────────────────

function byIndicator(data: MarketIndicator[], indicator: string): MarketIndicator | undefined {
  return data.find((d) => d.indicator === indicator);
}

// ─── Global Indices Panel ────────────────────────────────────────────────────

const INDEX_LABELS: Record<string, string> = {
  "^N225": "닛케이225", "^GDAXI": "DAX", "^FTSE": "FTSE100",
  "^HSI": "항셍", "000001.SS": "상하이", "^SOX": "필라델피아 반도체",
  "^VIX": "VIX",
};

function GlobalIndicesPanel({ data, symbols }: { data: MarketIndicator[]; symbols: string[] }) {
  return (
    <Panel title="글로벌 주가지수">
      {symbols.map((sym) => {
        const indicator = `global_${sym}`;
        const row = byIndicator(data, indicator);
        const name = INDEX_LABELS[sym] ?? sym;
        if (!row) return (
          <div key={indicator} className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{name}</span>
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>-</span>
          </div>
        );
        return (
          <IndicatorRow
            key={indicator}
            name={name}
            value={row.value}
            changePct={row.metadata?.change_pct}
            decimals={sym.includes(".") ? 2 : 0}
          />
        );
      })}
    </Panel>
  );
}

// ─── Commodities Panel ────────────────────────────────────────────────────────

const COMMODITY_LABELS: Record<string, string> = {
  "GC=F": "금 (Gold)", "CL=F": "WTI 원유", "HG=F": "구리 (Copper)", "SI=F": "은 (Silver)",
};

function CommoditiesPanel({ data, symbols }: { data: MarketIndicator[]; symbols: string[] }) {
  return (
    <Panel title="원자재">
      {symbols.map((sym) => {
        const indicator = `commodity_${sym}`;
        const row = byIndicator(data, indicator);
        const name = COMMODITY_LABELS[sym] ?? sym;
        if (!row) return (
          <div key={indicator} className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{name}</span>
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>-</span>
          </div>
        );
        return (
          <IndicatorRow
            key={indicator}
            name={name}
            value={row.value}
            changePct={row.metadata?.change_pct}
            decimals={2}
          />
        );
      })}
    </Panel>
  );
}

// ─── Extended Macro Panel ─────────────────────────────────────────────────────

const macroDefs = [
  { indicator: "sox_index",     name: "SOX 반도체지수",      decimals: 0, changePct: true },
  { indicator: "BAMLH0A0HYM2", name: "HY 크레딧 스프레드",   decimals: 2, unit: "%" },
  { indicator: "DFII10",       name: "10Y 실질금리 (TIPS)",   decimals: 2, unit: "%" },
  { indicator: "UMCSENT",      name: "소비자심리 (미시건대)", decimals: 1 },
  { indicator: "pct_above_50ma", name: "50MA 상위 비율",      decimals: 0, unit: "%" },
  { indicator: "DGS2",         name: "미국채 2Y",             decimals: 2, unit: "%" },
  { indicator: "DGS10",        name: "미국채 10Y",            decimals: 2, unit: "%" },
  { indicator: "spread_2y10y", name: "수익률 스프레드 (2Y-10Y)", decimals: 2, unit: "%" },
  { indicator: "dff",          name: "연방기금금리",          decimals: 2, unit: "%" },
  { indicator: "CPIAUCSL",     name: "CPI",                   decimals: 1 },
  { indicator: "PCEPI",        name: "PCE",                   decimals: 1 },
  { indicator: "T5YIE",        name: "5Y 기대인플레이션",     decimals: 2, unit: "%" },
  { indicator: "ICSA",         name: "신규 실업수당 청구",    decimals: 0, unit: "K" },
  { indicator: "CCSA",         name: "지속 실업수당 청구",    decimals: 0, unit: "K" },
];

function MacroExtendedPanel({ data }: { data: MarketIndicator[] }) {
  return (
    <Panel title="매크로 지표">
      {macroDefs.map(({ indicator, name, decimals, unit, changePct }) => {
        const row = byIndicator(data, indicator);
        const displayValue = row
          ? `${fmt(row.value, decimals)}${unit ? " " + unit : ""}`
          : "-";
        return (
          <div key={indicator} className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{name}</span>
            <div className="flex items-center gap-3">
              {changePct && row && changeBadge(row.metadata?.change_pct)}
              <span className="text-xs font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
                {displayValue}
              </span>
            </div>
          </div>
        );
      })}
    </Panel>
  );
}

// ─── Sentiment Panel ──────────────────────────────────────────────────────────

const sentimentDefs = [
  { indicator: "put_call_ratio", name: "Put/Call Ratio (SPY)", decimals: 2 },
  { indicator: "aaii_bullish",   name: "AAII Bullish %",       decimals: 1, unit: "%" },
  { indicator: "aaii_neutral",   name: "AAII Neutral %",       decimals: 1, unit: "%" },
  { indicator: "aaii_bearish",   name: "AAII Bearish %",       decimals: 1, unit: "%" },
];

function SentimentPanel({ data }: { data: MarketIndicator[] }) {
  return (
    <Panel title="투자 심리">
      {sentimentDefs.map(({ indicator, name, decimals, unit }) => {
        const row = byIndicator(data, indicator);
        const displayValue = row
          ? `${fmt(row.value, decimals)}${unit ? " " + unit : ""}`
          : "-";
        return (
          <div key={indicator} className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{name}</span>
            <span className="text-xs font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
              {displayValue}
            </span>
          </div>
        );
      })}
    </Panel>
  );
}

// ─── ETF Flows Panel ──────────────────────────────────────────────────────────

function ETFFlowsPanel({ data, symbols }: { data: MarketIndicator[]; symbols: string[] }) {
  return (
    <Panel title="ETF 자금 흐름">
      {symbols.map((sym) => {
        const indicator = `etf_flow_${sym}`;
        const row = byIndicator(data, indicator);
        if (!row) return (
          <div key={indicator} className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{sym}</span>
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>-</span>
          </div>
        );
        return (
          <IndicatorRow
            key={indicator}
            name={sym}
            value={row.value}
            changePct={row.metadata?.change_pct}
            decimals={2}
          />
        );
      })}
    </Panel>
  );
}

// ─── COT Positioning Panel ────────────────────────────────────────────────────

const cotDefs = [
  { indicator: "cot_es_noncomm_long",  name: "ES Long (Non-Comm)",  decimals: 0 },
  { indicator: "cot_es_noncomm_short", name: "ES Short (Non-Comm)", decimals: 0 },
  { indicator: "cot_nq_noncomm_long",  name: "NQ Long (Non-Comm)",  decimals: 0 },
  { indicator: "cot_nq_noncomm_short", name: "NQ Short (Non-Comm)", decimals: 0 },
];

function COTPanel({ data }: { data: MarketIndicator[] }) {
  return (
    <Panel title="COT 포지셔닝">
      {cotDefs.map(({ indicator, name, decimals }) => {
        const row = byIndicator(data, indicator);
        return (
          <div key={indicator} className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{name}</span>
            <span className="text-xs font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
              {row ? fmt(row.value, decimals) : "-"}
            </span>
          </div>
        );
      })}
    </Panel>
  );
}

// ─── Dollar & Forex Panel ─────────────────────────────────────────────────────

const forexDefs = [
  { indicator: "dollar_index", name: "DXY (달러 인덱스)", decimals: 2 },
  { indicator: "forex_KRW=X", name: "USD/KRW (원)", decimals: 2 },
  { indicator: "forex_JPY=X", name: "USD/JPY (엔)", decimals: 2 },
  { indicator: "forex_EURUSD=X", name: "EUR/USD (유로)", decimals: 4 },
  { indicator: "forex_GBPUSD=X", name: "GBP/USD (파운드)", decimals: 4 },
  { indicator: "forex_CNY=X", name: "USD/CNY (위안)", decimals: 4 },
];

function DollarForexPanel({ data }: { data: MarketIndicator[] }) {
  return (
    <Panel title="달러 · 환율">
      {forexDefs.map(({ indicator, name, decimals }) => {
        const row = byIndicator(data, indicator);
        return (
          <IndicatorRow
            key={indicator}
            name={name}
            value={row ? String(row.value) : "-"}
            changePct={row?.metadata?.change_pct}
            decimals={decimals}
          />
        );
      })}
    </Panel>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function MarketIndicators() {
  const { data, isLoading } = useMarketIndicators("all");
  const indicators = data?.data ?? [];

  const { data: indexSymbols } = useWatchlistByCategory("index");
  const { data: commoditySymbols } = useWatchlistByCategory("commodity");
  const { data: etfSymbols } = useWatchlistByCategory("etf");

  const indexList = indexSymbols.length > 0 ? indexSymbols.map((s) => s.symbol) : Object.keys(INDEX_LABELS);
  const commodityList = commoditySymbols.length > 0 ? commoditySymbols.map((s) => s.symbol) : Object.keys(COMMODITY_LABELS);
  const etfList = etfSymbols.length > 0 ? etfSymbols.map((s) => s.symbol) : [];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="obsidian-card p-4 animate-pulse h-40" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GlobalIndicesPanel data={indicators} symbols={indexList} />
        <CommoditiesPanel data={indicators} symbols={commodityList} />
        <SentimentPanel data={indicators} />
        {etfList.length > 0 && <ETFFlowsPanel data={indicators} symbols={etfList} />}
        <DollarForexPanel data={indicators} />
        <COTPanel data={indicators} />
      </div>
      <div>
        <MacroExtendedPanel data={indicators} />
      </div>
      <div className="mt-4 space-y-6">
        <div>
          <p className="section-header mb-3">시장 심리 · 변동성</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <IndicatorChart indicator="global_^VIX" label="VIX 변동성 지수" color="#EF4444" decimals={2} />
            <IndicatorChart indicator="put_call_ratio" label="Put/Call Ratio" color="#F59E0B" decimals={2} />
            <IndicatorChart indicator="BAMLH0A0HYM2" label="HY 크레딧 스프레드" color="#F97316" decimals={2} unit="%" />
            <IndicatorChart indicator="UMCSENT" label="소비자심리 (미시건대)" color="#22C55E" decimals={1} />
          </div>
        </div>
        <div>
          <p className="section-header mb-3">금리 · 채권</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <IndicatorChart indicator="DGS2" label="미국채 2Y" color="#06B6D4" decimals={2} unit="%" />
            <IndicatorChart indicator="DGS10" label="미국채 10Y" color="#6366F1" decimals={2} unit="%" />
            <IndicatorChart indicator="spread_2y10y" label="수익률 스프레드 (2Y-10Y)" color="#3B82F6" decimals={2} unit="%" />
            <IndicatorChart indicator="DFII10" label="10Y 실질금리 (TIPS)" color="#8B5CF6" decimals={2} unit="%" />
            <IndicatorChart indicator="dff" label="연방기금금리" color="#14B8A6" decimals={2} unit="%" />
            <IndicatorChart indicator="T5YIE" label="5Y 기대인플레이션" color="#D946EF" decimals={2} unit="%" />
          </div>
        </div>
        <div>
          <p className="section-header mb-3">달러 · 환율</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <IndicatorChart indicator="dollar_index" label="달러 인덱스 (DXY)" color="#A78BFA" decimals={2} />
            <IndicatorChart indicator="forex_KRW=X" label="USD/KRW 환율" color="#F472B6" decimals={2} />
          </div>
        </div>
        <div>
          <p className="section-header mb-3">원자재</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <IndicatorChart indicator="commodity_GC=F" label="금 (Gold)" color="#EAB308" decimals={2} unit="$" />
            <IndicatorChart indicator="commodity_CL=F" label="WTI 원유" color="#78716C" decimals={2} unit="$" />
          </div>
        </div>
      </div>
    </div>
  );
}
