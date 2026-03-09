import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paperAccounts, strategies } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  const accounts = await db
    .select()
    .from(paperAccounts)
    .orderBy(asc(paperAccounts.name));

  const paperStrategies = await db
    .select({
      id: strategies.id,
      name: strategies.name,
      type: strategies.type,
      broker: strategies.broker,
      mode: strategies.mode,
      enabled: strategies.enabled,
      capitalPct: strategies.capitalPct,
    })
    .from(strategies)
    .where(eq(strategies.mode, "paper"))
    .orderBy(asc(strategies.name));

  // total across all accounts
  const total = accounts.reduce(
    (acc, a) => ({
      initialCapital: acc.initialCapital + Number(a.initialCapital),
      currentBalance: acc.currentBalance + Number(a.currentBalance),
    }),
    { initialCapital: 0, currentBalance: 0 }
  );

  // strategy allocations with dollar amounts
  const allocations = paperStrategies.map((s) => ({
    ...s,
    capitalPct: Number(s.capitalPct),
    allocated: total.currentBalance * Number(s.capitalPct),
  }));

  return NextResponse.json({ accounts, total, allocations });
}
