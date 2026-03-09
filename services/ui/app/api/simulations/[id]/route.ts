import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { simulations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [row] = await db
    .select()
    .from(simulations)
    .where(eq(simulations.id, id));
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(simulations).where(eq(simulations.id, id));
  return NextResponse.json({ ok: true });
}
