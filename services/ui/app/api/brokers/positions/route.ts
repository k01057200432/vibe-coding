import { NextResponse } from "next/server";

const ALPACA_PAPER_BROKER_URL =
  process.env.ALPACA_PAPER_BROKER_URL || "http://trading-alpaca-broker-paper.trading:8080";
const ALPACA_LIVE_BROKER_URL =
  process.env.ALPACA_LIVE_BROKER_URL || "http://trading-alpaca-broker-live.trading:8080";
const PAPER_BROKER_URL =
  process.env.PAPER_BROKER_URL || "http://trading-paper-broker.trading:8080";

interface BrokerPosition {
  symbol: string;
  qty: string;
  avg_entry_price: string;
  current_price: string;
  market_value: string;
  unrealized_pl: string;
  unrealized_plpc: string;
}

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

function mapPositions(broker: string, positions: BrokerPosition[]): Position[] {
  return positions.map((p) => ({
    broker,
    symbol: p.symbol,
    qty: p.qty,
    avgEntryPrice: p.avg_entry_price,
    currentPrice: p.current_price,
    marketValue: p.market_value,
    unrealizedPnl: p.unrealized_pl,
    unrealizedPct: p.unrealized_plpc,
  }));
}

export async function GET() {
  const results: Position[] = [];

  // Alpaca Paper broker positions
  try {
    const res = await fetch(`${ALPACA_PAPER_BROKER_URL}/v1/positions`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const positions: BrokerPosition[] = await res.json();
      if (Array.isArray(positions)) {
        results.push(...mapPositions("alpaca-paper", positions));
      }
    }
  } catch {
    // skip
  }

  // Alpaca Live broker positions
  try {
    const res = await fetch(`${ALPACA_LIVE_BROKER_URL}/v1/positions`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const positions: BrokerPosition[] = await res.json();
      if (Array.isArray(positions)) {
        results.push(...mapPositions("alpaca-live", positions));
      }
    }
  } catch {
    // skip
  }

  // Paper broker positions (단일 인스턴스)
  try {
    const res = await fetch(`${PAPER_BROKER_URL}/v1/positions`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const positions: BrokerPosition[] = await res.json();
      if (Array.isArray(positions)) {
        results.push(...mapPositions("paper-broker", positions));
      }
    }
  } catch {
    // skip
  }

  return NextResponse.json(results);
}
