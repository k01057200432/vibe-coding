import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-20">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-glow)] text-[var(--accent)]">
          <Terminal className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Vibe Coding</h1>
        <p className="max-w-md text-[var(--text-secondary)]">
          AI와 함께하는 개발 환경. 터미널을 열어 Claude와 대화하며 코드를 작성하세요.
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
