import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids") ?? "";

  const ids = idsParam
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n))
    .slice(0, 5);

  if (ids.length === 0) {
    return NextResponse.json({ rows: [] });
  }

  const result = await pool.query(
    `SELECT id, name, strategy_type, trade_symbol, status,
            total_return_pct, max_drawdown_pct, sharpe_ratio,
            total_trades, won_trades, lost_trades,
            final_equity, initial_cash, start_date, end_date
     FROM simulations
     WHERE id = ANY($1::int[]) AND status = 'completed'
     ORDER BY total_return_pct::numeric DESC NULLS LAST`,
    [ids]
  );

  return NextResponse.json({ rows: result.rows });
}
