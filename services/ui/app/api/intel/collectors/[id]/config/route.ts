import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { intelCollectors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  if (typeof body.config !== "object" || body.config === null) {
    return NextResponse.json({ error: "invalid config" }, { status: 400 });
  }

  const [updated] = await db
    .update(intelCollectors)
    .set({ config: body.config, updatedAt: new Date() })
    .where(eq(intelCollectors.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
