import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const ALPACA_PAPER_BROKER_URL =
  process.env.ALPACA_PAPER_BROKER_URL || "http://trading-alpaca-broker-paper.trading:8080";
const ALPACA_LIVE_BROKER_URL =
  process.env.ALPACA_LIVE_BROKER_URL || "http://trading-alpaca-broker-live.trading:8080";
const PAPER_BROKER_URL =
  process.env.PAPER_BROKER_URL || "http://trading-paper-broker.trading:8080";

interface BrokerAccount {
  equity: number;
  buying_power: number;
  cash: number;
}

interface BrokerInfo {
  name: string;
  label: string;
  connected: boolean;
  equity: string;
  buyingPower: string;
  cash: string;
  positions: number;
  hasKey: boolean;
  error?: string;
}

function formatUSD(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function fetchAlpacaBroker(
  mode: "paper" | "live",
  settingsMap: Map<string, string>
): Promise<BrokerInfo> {
  const label = mode === "paper" ? "Alpaca Paper" : "Alpaca Live";
  const name = mode === "paper" ? "alpaca-paper" : "alpaca-live";
  const baseUrl = mode === "paper" ? ALPACA_PAPER_BROKER_URL : ALPACA_LIVE_BROKER_URL;
  const hasKey =
    mode === "paper"
      ? true
      : !!(settingsMap.get("alpaca_live_api_key"));

  const info: BrokerInfo = {
    name,
    label,
    connected: false,
    equity: "$0.00",
    buyingPower: "$0.00",
    cash: "$0.00",
    positions: 0,
    hasKey,
  };

  try {
    const [accountRes, positionsRes] = await Promise.all([
      fetch(`${baseUrl}/v1/account`, {
        signal: AbortSignal.timeout(3000),
      }),
      fetch(`${baseUrl}/v1/positions`, {
        signal: AbortSignal.timeout(3000),
      }),
    ]);

    if (accountRes.ok) {
      const account: BrokerAccount = await accountRes.json();
      info.connected = true;
      info.equity = formatUSD(account.equity);
      info.buyingPower = formatUSD(account.buying_power);
      info.cash = formatUSD(account.cash);
    }

    if (positionsRes.ok) {
      const positions = await positionsRes.json();
      info.positions = Array.isArray(positions) ? positions.length : 0;
    }
  } catch (e) {
    info.error = e instanceof Error ? e.message : "연결 실패";
  }

  return info;
}

async function fetchPaperBroker(): Promise<BrokerInfo> {
  const info: BrokerInfo = {
    name: "paper-broker",
    label: "Paper Broker",
    connected: false,
    equity: "$0.00",
    buyingPower: "$0.00",
    cash: "$0.00",
    positions: 0,
    hasKey: true,
  };

  try {
    const [accountRes, positionsRes] = await Promise.all([
      fetch(`${PAPER_BROKER_URL}/v1/account`, { signal: AbortSignal.timeout(3000) }),
      fetch(`${PAPER_BROKER_URL}/v1/positions`, { signal: AbortSignal.timeout(3000) }),
    ]);

    if (accountRes.ok) {
      const account: BrokerAccount = await accountRes.json();
      info.connected = true;
      info.equity = formatUSD(account.equity);
      info.buyingPower = formatUSD(account.buying_power);
      info.cash = formatUSD(account.cash);
    }

    if (positionsRes.ok) {
      const positions = await positionsRes.json();
      info.positions = Array.isArray(positions) ? positions.length : 0;
    }
  } catch (e) {
    info.error = e instanceof Error ? e.message : "연결 실패";
  }

  return info;
}

export async function GET() {
  const { rows: settingsRows } = await pool.query<{
    key: string;
    value: string;
  }>(
    `SELECT key, value FROM settings WHERE key IN ($1, $2)`,
    ["alpaca_live_api_key", "alpaca_live_secret_key"]
  );
  const settingsMap = new Map(settingsRows.map((r) => [r.key, r.value]));

  const [alpacaPaper, alpacaLive, paperBroker] = await Promise.all([
    fetchAlpacaBroker("paper", settingsMap),
    fetchAlpacaBroker("live", settingsMap),
    fetchPaperBroker(),
  ]);

  const brokers = [alpacaPaper, alpacaLive, paperBroker];

  const { rows: strategies } = await pool.query(`
    SELECT
      broker,
      count(*)::int AS total,
      count(*) FILTER (WHERE enabled = true)::int AS enabled,
      count(*) FILTER (WHERE enabled = false)::int AS disabled,
      jsonb_object_agg(phase, phase_count) AS phases
    FROM (
      SELECT broker, enabled, phase, count(*)::int AS phase_count
      FROM strategies
      GROUP BY broker, enabled, phase
    ) sub
    GROUP BY broker
    ORDER BY broker
  `);

  return NextResponse.json({ brokers, strategies });
}
