import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { simulations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [updated] = await db
    .update(simulations)
    .set({ status: "paused" })
    .where(eq(simulations.id, id))
    .returning();
  if (!updated)
    return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
}
