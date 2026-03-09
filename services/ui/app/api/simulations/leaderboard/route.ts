import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const by = searchParams.get("by") ?? "strategy_type";

  const groupCol = by === "trade_symbol" ? "trade_symbol" : "strategy_type";

  const result = await pool.query(`
    SELECT ${groupCol} AS group_key,
           count(*)::int AS total,
           round(avg(total_return_pct::numeric), 2) AS avg_return,
           round(max(total_return_pct::numeric), 2) AS best_return,
           round(min(total_return_pct::numeric), 2) AS worst_return,
           round(avg(sharpe_ratio::numeric), 2) AS avg_sharpe,
           round(avg(max_drawdown_pct::numeric), 2) AS avg_drawdown
    FROM simulations
    WHERE status = 'completed'
    GROUP BY ${groupCol}
    ORDER BY avg_return DESC
  `);

  return NextResponse.json({ rows: result.rows });
}
