import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { strategies, strategyTypes, strategyAuditLog, watchlist } from "@/lib/db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";

const KNOWN_ETFS = new Set(["TQQQ","SQQQ","SPY","QQQ","IWM","UPRO","SPXU","SOXL","SOXS","TMF"]);

export async function GET() {
  const rows = await db
    .select({
      id: strategies.id,
      name: strategies.name,
      type: strategies.type,
      broker: strategies.broker,
      symbols: strategies.symbols,
      params: strategies.params,
      mode: strategies.mode,
      enabled: strategies.enabled,
      schedule: strategies.schedule,
      capitalPct: strategies.capitalPct,
      phase: strategies.phase,
      message: strategies.message,
      lastSignalAt: strategies.lastSignalAt,
      podName: strategies.podName,
      positions: strategies.positions,
      heartbeatAt: strategies.heartbeatAt,
      createdAt: strategies.createdAt,
      updatedAt: strategies.updatedAt,
      description: sql<string>`COALESCE(${strategies.params}->>'readme', ${strategyTypes.description}, '')`,
    })
    .from(strategies)
    .leftJoin(strategyTypes, eq(strategies.type, strategyTypes.type))
    .orderBy(desc(strategies.enabled), asc(strategies.broker), asc(strategies.name));

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const [row] = await db
    .insert(strategies)
    .values({
      name: body.name,
      type: body.type,
      broker: body.broker,
      symbols: body.symbols,
      params: body.params ?? {},
      mode: body.mode ?? "paper",
      enabled: body.enabled ?? false,
      schedule: body.schedule ?? "1s",
      capitalPct: body.capitalPct ?? "0.1000",
    })
    .returning();

  await db.insert(strategyAuditLog).values({
    strategyId: row.id,
    changedBy: "ui",
    fieldChanged: "created",
    oldValue: null,
    newValue: row.name,
  });

  // Auto-add strategy symbols to watchlist
  const symbols: string[] = body.symbols ?? [];
  for (const sym of symbols) {
    const cat = KNOWN_ETFS.has(sym) ? "etf" : "stock";
    await db.insert(watchlist)
      .values({ symbol: sym, category: cat, source: "strategy", bars: true })
      .onConflictDoNothing();
  }

  return NextResponse.json(row, { status: 201 });
}
