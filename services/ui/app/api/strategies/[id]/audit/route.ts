import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { strategyAuditLog } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const logs = await db
    .select()
    .from(strategyAuditLog)
    .where(eq(strategyAuditLog.strategyId, id))
    .orderBy(desc(strategyAuditLog.changedAt))
    .limit(50);

  return NextResponse.json({ logs });
}
