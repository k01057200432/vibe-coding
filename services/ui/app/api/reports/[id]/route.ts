import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);
  if (Number.isNaN(numId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, numId))
    .limit(1);

  if (!report) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}
