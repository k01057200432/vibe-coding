import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { watchlist } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(watchlist)
    .orderBy(watchlist.category, watchlist.symbol);

  const [tradesCount] = await db
    .select({ count: sql<number>`count(*) filter (where trades = true)` })
    .from(watchlist);
  const [quotesCount] = await db
    .select({ count: sql<number>`count(*) filter (where quotes = true)` })
    .from(watchlist);

  return NextResponse.json({
    data: rows,
    tradesCount: Number(tradesCount.count),
    quotesCount: Number(quotesCount.count),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const symbol = (body.symbol as string)?.trim().toUpperCase();
  const category = body.category ?? "stock";
  const description = (body.description as string)?.trim() ?? "";

  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }

  const existing = await db
    .select({ symbol: watchlist.symbol })
    .from(watchlist)
    .where(sql`${watchlist.symbol} = ${symbol}`);

  if (existing.length > 0) {
    return NextResponse.json({ error: "symbol already exists" }, { status: 409 });
  }

  const [row] = await db
    .insert(watchlist)
    .values({ symbol, category, description, source: "manual", bars: true })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
