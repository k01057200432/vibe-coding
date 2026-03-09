import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function POST() {
  try {
    await db.execute(sql`NOTIFY force_reconcile`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("force-reconcile error:", e);
    return NextResponse.json(
      { error: "Failed to send force reconcile" },
      { status: 500 }
    );
  }
}
