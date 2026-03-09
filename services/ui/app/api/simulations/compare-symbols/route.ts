import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols");

  try {
    let result;

    if (symbolsParam) {
      const symbols = symbolsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      result = await pool.query(
        `
        SELECT
          trade_symbol,
          COUNT(*) AS sim_count,
          AVG(total_return_pct::numeric) AS avg_return,
          AVG(max_drawdown_pct::numeric) AS avg_mdd,
          AVG(sharpe_ratio::numeric) AS avg_sharpe,
          MAX(total_return_pct::numeric) AS best_return,
          MIN(total_return_pct::numeric) AS worst_return
        FROM simulations
        WHERE status = 'completed'
          AND trade_symbol = ANY($1)
        GROUP BY trade_symbol
        ORDER BY avg_return DESC
        `,
        [symbols]
      );
    } else {
      // No symbols filter: return all distinct symbols
      result = await pool.query(`
        SELECT
          trade_symbol,
          COUNT(*) AS sim_count,
          AVG(total_return_pct::numeric) AS avg_return,
          AVG(max_drawdown_pct::numeric) AS avg_mdd,
          AVG(sharpe_ratio::numeric) AS avg_sharpe,
          MAX(total_return_pct::numeric) AS best_return,
          MIN(total_return_pct::numeric) AS worst_return
        FROM simulations
        WHERE status = 'completed'
          AND trade_symbol IS NOT NULL
        GROUP BY trade_symbol
        ORDER BY avg_return DESC
      `);
    }

    return NextResponse.json(
      result.rows.map((r) => ({
        tradeSymbol: r.trade_symbol,
        simCount: Number(r.sim_count),
        avgReturn: Number(r.avg_return),
        avgMdd: Number(r.avg_mdd),
        avgSharpe: Number(r.avg_sharpe),
        bestReturn: Number(r.best_return),
        worstReturn: Number(r.worst_return),
      }))
    );
  } catch (err) {
    console.error("Compare symbols API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch symbol comparison" },
      { status: 500 }
    );
  }
}
