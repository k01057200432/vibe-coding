import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT
        COALESCE(SUM(pnl) FILTER (WHERE pnl > 0), 0) AS realized_gains,
        COALESCE(SUM(pnl) FILTER (WHERE pnl < 0), 0) AS realized_losses,
        COALESCE(SUM(pnl), 0) AS net_pnl,
        COUNT(*) FILTER (WHERE pnl > 0) AS winning_trades,
        COUNT(*) FILTER (WHERE pnl < 0) AS losing_trades
      FROM trades
      WHERE simulation_id IS NULL
        AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now())
    `);

    const stats = rows[0];
    const netPnl = Number(stats.net_pnl);
    // 250만원 기본공제, KRW 환율 ~1450
    const taxFreeKrw = 2_500_000;
    const exchangeRate = 1450;
    const netPnlKrw = netPnl * exchangeRate;
    const taxableKrw = Math.max(0, netPnlKrw - taxFreeKrw);
    const estimatedTaxKrw = Math.round(taxableKrw * 0.22);

    return NextResponse.json({
      realizedGains: Number(stats.realized_gains),
      realizedLosses: Number(stats.realized_losses),
      netPnl,
      winningTrades: Number(stats.winning_trades),
      losingTrades: Number(stats.losing_trades),
      netPnlKrw: Math.round(netPnlKrw),
      taxFreeKrw,
      taxableKrw: Math.round(taxableKrw),
      estimatedTaxKrw,
      warningThresholdKrw: 2_400_000,
      nearWarning: netPnlKrw >= 2_400_000,
    });
  } catch (err) {
    console.error("Yearly PnL API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch yearly PnL" },
      { status: 500 }
    );
  }
}
