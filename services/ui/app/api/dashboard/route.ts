import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [tradeStats, todayPnl, heatmap, matrix, events, vix] =
      await Promise.all([
        // 1. Year-to-date trade stats
        pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE pnl > 0) AS wins,
          COUNT(*) FILTER (WHERE pnl < 0) AS losses,
          COALESCE(SUM(pnl), 0) AS total_pnl,
          COALESCE(SUM(pnl) FILTER (WHERE DATE(created_at) = CURRENT_DATE), 0) AS today_pnl
        FROM trades
        WHERE simulation_id IS NULL
          AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now())
      `),

        // 2. Today PnL by strategy
        pool.query(`
        SELECT strategy, COALESCE(SUM(pnl), 0) AS pnl
        FROM trades
        WHERE created_at >= CURRENT_DATE AND strategy != '' AND simulation_id IS NULL
        GROUP BY strategy
      `),

        // 3. PnL heatmap (last 90 days)
        pool.query(`
        SELECT date, realized_pnl, trade_count
        FROM daily_pnl
        WHERE date >= CURRENT_DATE - INTERVAL '90 days'
        ORDER BY date
      `),

        // 4. Strategy x Symbol matrix
        pool.query(`
        SELECT strategy, symbol, COALESCE(SUM(pnl), 0) AS pnl, COUNT(*) AS trades
        FROM trades
        WHERE simulation_id IS NULL AND strategy != ''
        GROUP BY strategy, symbol
        ORDER BY strategy, symbol
      `),

        // 5. High-impact events
        pool.query(`
        SELECT id, type, source, title, COALESCE(summary, '') AS summary,
               impact_level, COALESCE(symbols, '{}') AS symbols, detected_at
        FROM intel_events
        WHERE impact_level IN ('critical', 'high')
        ORDER BY detected_at DESC LIMIT 5
      `),

        // 6. VIX sparkline (last 24h)
        pool.query(`
        SELECT vix, ts FROM market_snapshots
        WHERE ts >= NOW() - INTERVAL '24 hours' AND vix IS NOT NULL
        ORDER BY ts
      `),
      ]);

    const stats = tradeStats.rows[0] ?? {
      wins: 0,
      losses: 0,
      total_pnl: 0,
      today_pnl: 0,
    };

    return NextResponse.json({
      tradeStats: {
        wins: Number(stats.wins),
        losses: Number(stats.losses),
        totalPnl: Number(stats.total_pnl),
        todayPnl: Number(stats.today_pnl),
      },
      todayPnl: Object.fromEntries(
        todayPnl.rows.map((r) => [r.strategy, Number(r.pnl)])
      ),
      heatmap: heatmap.rows.map((r) => ({
        date: r.date,
        pnl: Number(r.realized_pnl),
        trades: Number(r.trade_count),
      })),
      matrix: matrix.rows.map((r) => ({
        strategy: r.strategy,
        symbol: r.symbol,
        pnl: Number(r.pnl),
        trades: Number(r.trades),
      })),
      events: events.rows,
      vix: vix.rows.map((r) => ({
        value: Number(r.vix),
        ts: r.ts,
      })),
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
