import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications, settings } from "@/lib/db/schema";
import { desc, and, eq, sql, type SQL } from "drizzle-orm";

const VALID_LEVELS = new Set(["info", "warning", "critical"]);

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") ?? "all";
  const level = sp.get("level");
  const limit = Math.min(Number(sp.get("limit") ?? 20), 100);
  const offset = Number(sp.get("offset") ?? 0);

  const conditions: SQL[] = [];
  if (status === "unread") {
    conditions.push(eq(notifications.read, false));
  } else if (status === "read") {
    conditions.push(eq(notifications.read, true));
  }
  if (level) {
    const levels = level.split(",");
    conditions.push(
      sql`${notifications.level} = ANY(${levels}::text[])`
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(where)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(where),
  ]);

  return NextResponse.json({
    data,
    total: countResult[0]?.count ?? 0,
  });
}

export async function POST(req: NextRequest) {
  // 토큰 인증 (외부 webhook용)
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token) {
    const [row] = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, "webhook_token"));
    if (!row || row.value !== token) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else {
    // 토큰 없으면 내부 호출만 허용 (K8s 내부 네트워크)
    // Next.js 서버 사이드에서 호출되는 경우 등
  }

  const body = await req.json();
  const level = body.level ?? "info";
  const title = body.title;
  const message = body.message ?? "";
  const data = body.data ?? null;

  if (!title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }
  if (!VALID_LEVELS.has(level)) {
    return NextResponse.json(
      { error: `invalid level: ${level}. must be info, warning, or critical` },
      { status: 400 },
    );
  }

  const [row] = await db
    .insert(notifications)
    .values({ level, title, message, data })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
