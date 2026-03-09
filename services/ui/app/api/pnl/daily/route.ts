import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const days = Math.min(Number(sp.get("days")) || 30, 365);

  try {
    const { rows } = await pool.query(
      `
      WITH daily AS (
        SELECT date, realized_pnl, trade_count, win_count, loss_count
        FROM daily_pnl
        WHERE date >= CURRENT_DATE - $1 * INTERVAL '1 day'
        ORDER BY date
      )
      SELECT
        date,
        realized_pnl,
        trade_count,
        win_count,
        loss_count,
        SUM(realized_pnl) OVER (ORDER BY date) AS cumulative_pnl
      FROM daily
      ORDER BY date
      `,
      [days]
    );

    return NextResponse.json(
      rows.map((r) => ({
        date: r.date,
        pnl: Number(r.realized_pnl),
        trades: Number(r.trade_count),
        wins: Number(r.win_count),
        losses: Number(r.loss_count),
        cumulativePnl: Number(r.cumulative_pnl),
      }))
    );
  } catch (err) {
    console.error("Daily PnL API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch daily PnL" },
      { status: 500 }
    );
  }
}
