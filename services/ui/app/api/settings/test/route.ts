import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

type TestType = "alpaca" | "alpaca-live" | "fred";

async function getSettingValues(keys: string[]): Promise<Record<string, string>> {
  const rows = await db.select().from(settings).where(inArray(settings.key, keys));
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

async function testAlpaca(live: boolean): Promise<{ ok: boolean; message: string; details?: unknown }> {
  const keyPrefix = live ? "alpaca_live" : "alpaca";
  const vals = await getSettingValues([`${keyPrefix}_api_key`, `${keyPrefix}_secret_key`]);
  const apiKey = vals[`${keyPrefix}_api_key`];
  const secretKey = vals[`${keyPrefix}_secret_key`];

  if (!apiKey || !secretKey) {
    return { ok: false, message: "API Key 또는 Secret Key가 설정되지 않았습니다" };
  }

  const baseUrl = live
    ? "https://api.alpaca.markets"
    : "https://paper-api.alpaca.markets";

  const res = await fetch(`${baseUrl}/v2/account`, {
    headers: {
      "APCA-API-KEY-ID": apiKey,
      "APCA-API-SECRET-KEY": secretKey,
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, message: `연결 실패: ${res.status} ${res.statusText}`, details: body };
  }

  const data = await res.json();
  return {
    ok: true,
    message: `연결 성공 (계정: ${data.account_number ?? data.id ?? "확인됨"})`,
    details: { status: data.status, currency: data.currency, buying_power: data.buying_power },
  };
}

async function testFred(): Promise<{ ok: boolean; message: string; details?: unknown }> {
  const vals = await getSettingValues(["fred_api_key"]);
  const key = vals["fred_api_key"];

  if (!key) {
    return { ok: false, message: "FRED API Key가 설정되지 않았습니다" };
  }

  const res = await fetch(
    `https://api.stlouisfed.org/fred/series?series_id=VIXCLS&api_key=${encodeURIComponent(key)}&file_type=json`,
    { signal: AbortSignal.timeout(5000) },
  );

  if (!res.ok) {
    return { ok: false, message: `연결 실패: ${res.status} ${res.statusText}` };
  }

  const data = await res.json();
  if (data.error_code || data.error_message) {
    return { ok: false, message: `인증 오류: ${data.error_message}` };
  }

  return { ok: true, message: "연결 성공 (FRED API 정상)" };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const type = body?.type as TestType | undefined;

  if (!type || !["alpaca", "alpaca-live", "fred"].includes(type)) {
    return NextResponse.json(
      { ok: false, message: "유효하지 않은 type입니다" },
      { status: 400 },
    );
  }

  try {
    let result: { ok: boolean; message: string; details?: unknown };

    switch (type) {
      case "alpaca":
        result = await testAlpaca(false);
        break;
      case "alpaca-live":
        result = await testAlpaca(true);
        break;
      case "fred":
        result = await testFred();
        break;
    }

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error && err.name === "TimeoutError"
        ? "연결 시간 초과 (5초)"
        : `네트워크 오류: ${err instanceof Error ? err.message : String(err)}`;
    return NextResponse.json({ ok: false, message });
  }
}
