"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Terminal, AlertTriangle, CreditCard } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui";

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [authOk, setAuthOk] = useState<boolean | null>(null);
  const router = useRouter();
  const { toggleTerminal } = useUIStore();

  useEffect(() => {
    setLoggedIn(document.cookie.includes("session="));
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    fetch("/claude/api/auth-status")
      .then((r) => r.json())
      .then((d) => setAuthOk(d.ok))
      .catch(() => setAuthOk(null));
  }, [loggedIn]);

  if (loggedIn === null) return null;

  if (!loggedIn) {
    return (
      <div className="flex flex-col items-center gap-8 px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-glow)] text-[var(--accent)]">
            <Terminal className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Vibe Coding</h1>
          <p className="max-w-md text-[var(--text-secondary)]">
            브라우저에서 바이브 코딩. Claude와 대화하며 UI를 실시간으로 만드세요.
          </p>
        </div>
        <Link href="/login">
          <Button size="lg" className="px-8">
            시작하기
          </Button>
        </Link>
      </div>
    );
  }

  const handleStart = () => {
    toggleTerminal();
    router.push("/guide");
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
      {/* 토큰 미설정 안내 배너 */}
      {authOk === false && (
        <div
          className="flex w-full max-w-md items-start gap-3 rounded-xl px-4 py-3"
          style={{
            background: "var(--accent-amber-glow)",
            border: "1px solid var(--accent-amber)",
          }}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent-amber)" }} />
          <div className="space-y-1.5">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Claude 인증이 필요합니다
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              터미널을 열고 <code className="font-mono" style={{ color: "var(--accent-bright)" }}>claude login</code>으로 로그인하거나,
              .env 파일에 <code className="font-mono" style={{ color: "var(--accent-bright)" }}>CLAUDE_CODE_OAUTH_TOKEN</code>을 설정하세요.
            </p>
            <Link href="/pro">
              <button
                className="mt-1 flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: "var(--accent-amber)" }}
              >
                <CreditCard className="h-3.5 w-3.5" />
                인증 가이드 →
              </button>
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-glow)] text-[var(--accent)]">
          <Terminal className="h-6 w-6" />
        </div>
        <p className="text-[var(--text-secondary)]">
          터미널을 열어 Claude와 대화를 시작하세요.
        </p>
      </div>
      <Button size="lg" className="px-8" onClick={handleStart}>
        시작하기
      </Button>
      <p className="text-xs text-[var(--text-muted)]">
        사이드바 하단 &quot;터미널&quot; 버튼 또는 Ctrl+` 단축키
      </p>
    </div>
  );
}
