import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await pool.query(`SELECT pg_notify('force_reconcile', $1)`, [id]);
  return NextResponse.json({ ok: true });
}
