import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trades } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rows = await db
    .select()
    .from(trades)
    .where(eq(trades.simulationId, id))
    .orderBy(desc(trades.createdAt));

  return NextResponse.json(rows);
}
