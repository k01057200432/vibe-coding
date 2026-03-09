import { NextResponse } from "next/server";

const PAPER_BROKER_URL =
  process.env.PAPER_BROKER_URL || "http://trading-paper-broker.trading:8080";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const capital = Number(body.capital);

  if (!capital || capital <= 0) {
    return NextResponse.json({ error: "유효한 자본금을 입력하세요" }, { status: 400 });
  }

  const res = await fetch(`${PAPER_BROKER_URL}/v1/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ capital }),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "paper-broker 호출 실패" }));
    return NextResponse.json(err, { status: res.status });
  }

  return NextResponse.json({ ok: true, id });
}
