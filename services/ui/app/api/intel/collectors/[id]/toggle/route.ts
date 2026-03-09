import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { intelCollectors } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function PUT(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [updated] = await db
    .update(intelCollectors)
    .set({
      enabled: sql`NOT ${intelCollectors.enabled}`,
      updatedAt: new Date(),
    })
    .where(eq(intelCollectors.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
