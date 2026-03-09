import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { strategies, strategyAuditLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [row] = await db
    .select()
    .from(strategies)
    .where(eq(strategies.id, id));
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const [old] = await db
    .select()
    .from(strategies)
    .where(eq(strategies.id, id));
  if (!old) return NextResponse.json({ error: "not found" }, { status: 404 });

  const [updated] = await db
    .update(strategies)
    .set({
      name: body.name ?? old.name,
      type: body.type ?? old.type,
      broker: body.broker ?? old.broker,
      symbols: body.symbols ?? old.symbols,
      params: body.params ?? old.params,
      mode: body.mode ?? old.mode,
      enabled: body.enabled ?? old.enabled,
      schedule: body.schedule ?? old.schedule,
      capitalPct: body.capitalPct ?? old.capitalPct,
    })
    .where(eq(strategies.id, id))
    .returning();

  const fields = [
    "name",
    "type",
    "broker",
    "mode",
    "enabled",
    "schedule",
    "capitalPct",
  ] as const;
  for (const f of fields) {
    if (body[f] !== undefined && String(old[f]) !== String(body[f])) {
      await db.insert(strategyAuditLog).values({
        strategyId: id,
        changedBy: "ui",
        fieldChanged: f,
        oldValue: String(old[f]),
        newValue: String(body[f]),
      });
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(strategies).where(eq(strategies.id, id));
  return NextResponse.json({ ok: true });
}
