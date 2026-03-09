import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports, notifications } from "@/lib/db/schema";
import { desc, eq, sql, and, type SQL } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const type = sp.get("type");
  const limit = Math.min(Number(sp.get("limit") ?? 20), 100);
  const offset = Number(sp.get("offset") ?? 0);

  const conditions: SQL[] = [];
  if (type && type !== "all") {
    conditions.push(eq(reports.type, type));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select({
        id: reports.id,
        type: reports.type,
        title: reports.title,
        summary: reports.summary,
        metadata: reports.metadata,
        generatedBy: reports.generatedBy,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .where(where)
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(where),
  ]);

  return NextResponse.json({
    data,
    total: countResult[0]?.count ?? 0,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, title, content, summary, metadata, generatedBy } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "title and content required" }, { status: 400 });
  }

  const validTypes = ["daily", "weekly", "daily_market", "weekly_market", "strategy", "simulation", "custom"];
  const reportType = validTypes.includes(type) ? type : "custom";

  const [report] = await db
    .insert(reports)
    .values({
      type: reportType,
      title,
      content,
      summary: summary ?? null,
      metadata: metadata ?? {},
      generatedBy: generatedBy ?? "system",
    })
    .returning();

  // 알림 동시 발송
  const typeLabel: Record<string, string> = {
    daily: "일일", daily_market: "시장(일)", weekly: "주간",
    weekly_market: "시장(주)", strategy: "전략",
    simulation: "시뮬레이션", custom: "기타",
  };
  await db.insert(notifications).values({
    level: "info",
    title: `📊 ${typeLabel[reportType] ?? reportType} 리포트: ${title}`,
    message: summary ?? title,
    data: { category: "report", reportId: report.id, type: reportType },
  });

  return NextResponse.json(report, { status: 201 });
}
