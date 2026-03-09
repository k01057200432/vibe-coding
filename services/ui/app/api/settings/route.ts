import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq, inArray, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const keys = req.nextUrl.searchParams.getAll("key");
  if (keys.length === 0) {
    return NextResponse.json([]);
  }

  const rows =
    keys.length === 1
      ? await db.select().from(settings).where(eq(settings.key, keys[0]))
      : await db.select().from(settings).where(inArray(settings.key, keys));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { key, value } = (await req.json()) as { key: string; value: string };

  if (!key || typeof value !== "string") {
    return NextResponse.json({ error: "key and value required" }, { status: 400 });
  }

  await db
    .insert(settings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: new Date() },
    });

  return NextResponse.json({ ok: true });
}
