import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { strategies, strategyAuditLog, watchlist } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const KNOWN_ETFS = new Set(["TQQQ","SQQQ","SPY","QQQ","IWM","UPRO","SPXU","SOXL","SOXS","TMF"]);

export async function PUT(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [old] = await db
    .select({ enabled: strategies.enabled, symbols: strategies.symbols })
    .from(strategies)
    .where(eq(strategies.id, id));
  if (!old) return NextResponse.json({ error: "not found" }, { status: 404 });

  const [updated] = await db
    .update(strategies)
    .set({ enabled: !old.enabled })
    .where(eq(strategies.id, id))
    .returning();

  await db.insert(strategyAuditLog).values({
    strategyId: id,
    changedBy: "ui",
    fieldChanged: "enabled",
    oldValue: String(old.enabled),
    newValue: String(!old.enabled),
  });

  // Auto-add symbols to watchlist when enabling
  if (!old.enabled && old.symbols) {
    for (const sym of old.symbols) {
      const cat = KNOWN_ETFS.has(sym) ? "etf" : "stock";
      await db.insert(watchlist)
        .values({ symbol: sym, category: cat, source: "strategy", bars: true })
        .onConflictDoNothing();
    }
  }

  return NextResponse.json(updated);
}
