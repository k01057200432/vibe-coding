import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get("sortBy") ?? "total_return_pct";
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);

  const allowedSorts = [
    "total_return_pct",
    "sharpe_ratio",
    "max_drawdown_pct",
    "total_trades",
    "final_equity",
    "created_at",
  ];
  const sortCol = allowedSorts.includes(sortBy) ? sortBy : "total_return_pct";

  const [statsResult, distributionResult, topResult, aggregatesResult] =
    await Promise.all([
      // Dashboard stats: completed count, best, worst, avg return
      pool.query(`
      WITH completed AS (
        SELECT * FROM simulations WHERE status = 'completed'
      ),
      best AS (
        SELECT name, total_return_pct FROM completed
        ORDER BY total_return_pct::numeric DESC NULLS LAST LIMIT 1
      ),
      worst AS (
        SELECT name, total_return_pct FROM completed
        ORDER BY total_return_pct::numeric ASC NULLS LAST LIMIT 1
      ),
      stats AS (
        SELECT
          COUNT(*) AS total_completed,
          COALESCE(AVG(total_return_pct::numeric), 0) AS avg_return,
          COALESCE(AVG(sharpe_ratio::numeric), 0) AS avg_sharpe,
          COALESCE(AVG(max_drawdown_pct::numeric), 0) AS avg_drawdown
        FROM completed
      )
      SELECT
        s.total_completed, s.avg_return, s.avg_sharpe, s.avg_drawdown,
        b.name AS best_name, b.total_return_pct AS best_return,
        w.name AS worst_name, w.total_return_pct AS worst_return
      FROM stats s
      LEFT JOIN best b ON true
      LEFT JOIN worst w ON true
    `),

      // Return distribution histogram
      pool.query(`
      SELECT
        width_bucket(total_return_pct::numeric, -50, 100, 15) AS bucket,
        COUNT(*) AS count,
        MIN(total_return_pct::numeric) AS range_min,
        MAX(total_return_pct::numeric) AS range_max
      FROM simulations
      WHERE status = 'completed' AND total_return_pct IS NOT NULL
      GROUP BY bucket
      ORDER BY bucket
    `),

      // Top simulations (dynamic sort)
      pool.query(
        `
      SELECT
        id, name, strategy_type, broker_type, trade_symbol,
        total_return_pct, max_drawdown_pct, sharpe_ratio,
        total_trades, won_trades, lost_trades, final_equity,
        initial_cash, start_date, end_date, created_at
      FROM simulations
      WHERE status = 'completed'
      ORDER BY ${sortCol}::numeric DESC NULLS LAST
      LIMIT $1
    `,
        [limit]
      ),

      // Strategy type aggregates
      pool.query(`
      SELECT
        strategy_type,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed,
        COALESCE(AVG(total_return_pct::numeric) FILTER (WHERE status = 'completed'), 0) AS avg_return,
        COALESCE(MAX(total_return_pct::numeric) FILTER (WHERE status = 'completed'), 0) AS best_return,
        COALESCE(MIN(total_return_pct::numeric) FILTER (WHERE status = 'completed'), 0) AS worst_return,
        COALESCE(AVG(sharpe_ratio::numeric) FILTER (WHERE status = 'completed'), 0) AS avg_sharpe,
        COALESCE(AVG(max_drawdown_pct::numeric) FILTER (WHERE status = 'completed'), 0) AS avg_drawdown,
        COALESCE(SUM(total_trades) FILTER (WHERE status = 'completed'), 0) AS total_trades
      FROM simulations
      GROUP BY strategy_type
      ORDER BY completed DESC
    `),
    ]);

  return NextResponse.json({
    stats: statsResult.rows[0] ?? null,
    distribution: distributionResult.rows,
    top: topResult.rows,
    aggregates: aggregatesResult.rows,
  });
}
