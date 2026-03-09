import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trades } from "@/lib/db/schema";
import { desc, and, sql, isNull, isNotNull, gte, lte, eq, type SQL } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const mode = sp.get("mode") ?? "live";
  const limit = Math.min(Number(sp.get("limit") ?? 20), 100);
  const offset = Number(sp.get("offset") ?? 0);
  const from = sp.get("from");
  const to = sp.get("to");
  const strategy = sp.get("strategy");
  const broker = sp.get("broker");
  const symbol = sp.get("symbol");

  const conditions: SQL[] = [];

  if (mode === "live") {
    conditions.push(isNull(trades.simulationId));
  } else {
    conditions.push(isNotNull(trades.simulationId));
  }

  if (from) {
    conditions.push(gte(trades.createdAt, new Date(from)));
  }
  if (to) {
    conditions.push(lte(trades.createdAt, new Date(to + "T23:59:59.999Z")));
  }
  if (strategy) {
    conditions.push(eq(trades.strategy, strategy));
  }
  if (broker) {
    conditions.push(eq(trades.broker, broker));
  }
  if (symbol) {
    conditions.push(eq(trades.symbol, symbol));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(trades)
      .where(where)
      .orderBy(desc(trades.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(trades)
      .where(where),
  ]);

  return NextResponse.json({
    data,
    total: countResult[0]?.count ?? 0,
  });
}
