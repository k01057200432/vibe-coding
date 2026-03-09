"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setLoggedIn(document.cookie.includes("session="));
  }, []);

  if (loggedIn === null) return null;

  if (!loggedIn) {
    return (
      <div className="flex flex-col items-center gap-8">
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

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-[var(--text-secondary)]">
        터미널을 열어 Claude와 대화를 시작하세요.
      </p>
      <p className="text-xs text-[var(--text-muted)]">
        사이드바 하단 &quot;터미널&quot; 버튼 또는 Ctrl+` 단축키
      </p>
    </div>
  );
}
