import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { simulations } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(simulations)
    .orderBy(desc(simulations.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const [row] = await db
    .insert(simulations)
    .values({
      name: body.name,
      strategyType: body.strategyType,
      strategyParams: body.strategyParams ?? {},
      brokerType: body.brokerType ?? "alpaca",
      symbols: body.symbols,
      tradeSymbol: body.tradeSymbol,
      startDate: body.startDate,
      endDate: body.endDate,
      speedMultiplier: body.speedMultiplier ?? "10000",
      initialCash: body.initialCash ?? "100000",
      status: "pending",
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
