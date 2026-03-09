import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { simulations, simulationSnapshots } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [sim] = await db
    .select({
      id: simulations.id,
      status: simulations.status,
      progressPct: simulations.progressPct,
      currentBar: simulations.currentBar,
      totalBars: simulations.totalBars,
      simTime: simulations.simTime,
      finalEquity: simulations.finalEquity,
      totalReturnPct: simulations.totalReturnPct,
      maxDrawdownPct: simulations.maxDrawdownPct,
      sharpeRatio: simulations.sharpeRatio,
      totalTrades: simulations.totalTrades,
      wonTrades: simulations.wonTrades,
      lostTrades: simulations.lostTrades,
      errorMessage: simulations.errorMessage,
    })
    .from(simulations)
    .where(eq(simulations.id, id));

  if (!sim) return NextResponse.json({ error: "not found" }, { status: 404 });

  const snapshots = await db
    .select()
    .from(simulationSnapshots)
    .where(eq(simulationSnapshots.simulationId, id))
    .orderBy(asc(simulationSnapshots.barIndex));

  return NextResponse.json({ ...sim, snapshots });
}
