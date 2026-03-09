import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { watchlist } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

const MAX_TRADES_QUOTES = 30;

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const sym = symbol.toUpperCase();

  const [row] = await db
    .select({ source: watchlist.source })
    .from(watchlist)
    .where(eq(watchlist.symbol, sym));

  if (!row) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (row.source === "system") {
    return NextResponse.json({ error: "system symbols cannot be deleted" }, { status: 403 });
  }

  await db.delete(watchlist).where(eq(watchlist.symbol, sym));
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const sym = symbol.toUpperCase();
  const body = await request.json();

  const [existing] = await db
    .select()
    .from(watchlist)
    .where(eq(watchlist.symbol, sym));

  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const updates: Record<string, boolean | string> = {};

  if (typeof body.description === "string") updates.description = body.description.trim();
  if (typeof body.bars === "boolean") updates.bars = body.bars;
  if (typeof body.trades === "boolean") {
    if (body.trades && !existing.trades) {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(watchlist)
        .where(eq(watchlist.trades, true));
      if (Number(count) >= MAX_TRADES_QUOTES) {
        return NextResponse.json(
          { error: `trades limit reached (max ${MAX_TRADES_QUOTES})` },
          { status: 400 }
        );
      }
    }
    updates.trades = body.trades;
  }
  if (typeof body.quotes === "boolean") {
    if (body.quotes && !existing.quotes) {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(watchlist)
        .where(eq(watchlist.quotes, true));
      if (Number(count) >= MAX_TRADES_QUOTES) {
        return NextResponse.json(
          { error: `quotes limit reached (max ${MAX_TRADES_QUOTES})` },
          { status: 400 }
        );
      }
    }
    updates.quotes = body.quotes;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "no valid fields" }, { status: 400 });
  }

  const [updated] = await db
    .update(watchlist)
    .set(updates)
    .where(eq(watchlist.symbol, sym))
    .returning();

  return NextResponse.json(updated);
}
