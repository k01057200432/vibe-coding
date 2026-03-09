import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { strategies, strategyAuditLog, notifications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  // 먼저 활성화된 전략 목록 조회
  const activeStrategies = await db
    .select({ id: strategies.id, name: strategies.name })
    .from(strategies)
    .where(eq(strategies.enabled, true));

  if (activeStrategies.length === 0) {
    return NextResponse.json({ disabled: 0 });
  }

  // 비활성화
  await db
    .update(strategies)
    .set({ enabled: false, updatedAt: new Date() })
    .where(eq(strategies.enabled, true));

  // 감사 로그 INSERT (각 전략에 대해)
  await db.insert(strategyAuditLog).values(
    activeStrategies.map((s) => ({
      strategyId: s.id,
      changedBy: "ui-killswitch",
      fieldChanged: "enabled",
      oldValue: "true",
      newValue: `false (kill all: ${activeStrategies.length} strategies disabled)`,
    }))
  );

  // critical 알림
  await db.insert(notifications).values({
    level: "critical",
    title: "Kill Switch 발동",
    message: `${activeStrategies.length}개 전략이 비활성화되었습니다`,
  });

  return NextResponse.json({ disabled: activeStrategies.length });
}
