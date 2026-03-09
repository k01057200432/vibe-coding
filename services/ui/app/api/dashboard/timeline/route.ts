import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

  try {
    const result = await pool.query(
      `
      SELECT kind, id, created_at, title, tone, value FROM (
        SELECT
          'trade' AS kind,
          id::text,
          created_at,
          strategy || ': ' || side || ' ' || qty || ' ' || symbol || ' @' || price AS title,
          CASE WHEN pnl > 0 THEN 'profit' WHEN pnl < 0 THEN 'loss' ELSE 'neutral' END AS tone,
          pnl::numeric AS value
        FROM trades
        WHERE simulation_id IS NULL
        UNION ALL
        SELECT
          'notification' AS kind,
          id::text,
          created_at,
          title,
          level AS tone,
          NULL::numeric AS value
        FROM notifications
      ) combined
      ORDER BY created_at DESC
      LIMIT $1
      `,
      [limit]
    );

    return NextResponse.json(
      result.rows.map((r) => ({
        kind: r.kind,
        id: r.id,
        createdAt: r.created_at,
        title: r.title,
        tone: r.tone,
        value: r.value != null ? Number(r.value) : null,
      }))
    );
  } catch (err) {
    console.error("Timeline API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}
