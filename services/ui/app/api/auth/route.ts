import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const demoUsername = process.env.DEMO_USERNAME;
  const demoPassword = process.env.DEMO_PASSWORD;

  if (!demoUsername || !demoPassword) {
    return NextResponse.json(
      { error: "서버 인증 설정이 되어있지 않습니다." },
      { status: 500 }
    );
  }

  if (username === demoUsername && password === demoPassword) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set("session", "authenticated", {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });
    return response;
  }

  return NextResponse.json(
    { error: "사용자명 또는 비밀번호가 올바르지 않습니다." },
    { status: 401 }
  );
}
