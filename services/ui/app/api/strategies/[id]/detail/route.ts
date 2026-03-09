import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [strategyRes, signalsRes, tradesRes, auditRes] = await Promise.all([
    pool.query(
      `SELECT * FROM strategies WHERE id = $1`,
      [id]
    ),
    pool.query(
      `SELECT s.action, s.symbol, s.position_pct, s.reason, s.created_at
       FROM signals s
       JOIN strategies st ON st.name = s.strategy
       WHERE st.id = $1
       ORDER BY s.created_at DESC LIMIT 10`,
      [id]
    ),
    pool.query(
      `SELECT t.symbol, t.side, t.qty, t.price, t.pnl, t.created_at
       FROM trades t
       JOIN strategies st ON st.name = t.strategy
       WHERE st.id = $1 AND t.simulation_id IS NULL
       ORDER BY t.created_at DESC LIMIT 10`,
      [id]
    ),
    pool.query(
      `SELECT field_changed, old_value, new_value, changed_by, changed_at
       FROM strategy_audit_log
       WHERE strategy_id = $1
       ORDER BY changed_at DESC LIMIT 5`,
      [id]
    ),
  ]);

  if (strategyRes.rows.length === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({
    strategy: strategyRes.rows[0],
    signals: signalsRes.rows,
    trades: tradesRes.rows,
    auditLog: auditRes.rows,
  });
}
