import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pool } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_notify('force_reconcile', '')");
  } finally {
    client.release();
  }

  await db.insert(notifications).values({
    level: "info",
    title: "강제 재조정 요청",
    message: "Force Reconcile이 요청되었습니다",
  });

  return NextResponse.json({ ok: true });
}
