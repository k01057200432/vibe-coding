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
  const seconds = Number(body.intervalSeconds);

  if (!seconds || seconds < 1) {
    return NextResponse.json({ error: "invalid interval" }, { status: 400 });
  }

  const [updated] = await db
    .update(intelCollectors)
    .set({ intervalSeconds: seconds, updatedAt: new Date() })
    .where(eq(intelCollectors.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
