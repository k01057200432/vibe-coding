import {
  CreditCard,
  AlertTriangle,
  LogIn,
  Zap,
  PiggyBank,
  Terminal,
  KeyRound,
} from "lucide-react";

export default function AuthGuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
          >
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Claude 인증 가이드
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          플랜에 따라 인증 방식이 다릅니다. 아래에서 본인 플랜에 맞는 방법을 따라하세요.
        </p>
      </div>

      {/* Plan Comparison */}
      <section className="space-y-3">
        <h2 className="section-header" style={{ fontSize: "0.6875rem" }}>
          플랜별 인증 방식
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Pro */}
          <div
            className="obsidian-card space-y-3"
            style={{ borderLeft: "2px solid var(--accent-blue)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "var(--accent-blue-glow)", color: "var(--accent-blue)" }}
              >
                <CreditCard className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Claude Pro (월 $20)
              </p>
            </div>
            <div className="space-y-1.5">
              {[
                { ok: true, text: "터미널에서 claude login 으로 로그인" },
                { ok: true, text: "브라우저 OAuth 인증" },
                { ok: false, text: "setup-token 미지원" },
                { ok: false, text: "메시지 한도 있음" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="mt-0.5 shrink-0 text-xs font-bold"
                    style={{ color: item.ok ? "var(--profit)" : "var(--loss)" }}
                  >
                    {item.ok ? "+" : "-"}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Max / Team / Enterprise */}
          <div
            className="obsidian-card space-y-3"
            style={{ borderLeft: "2px solid var(--accent)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
              >
                <Zap className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Max / Team / Enterprise
              </p>
            </div>
            <div className="space-y-1.5">
              {[
                { ok: true, text: ".env에 토큰 설정으로 자동 인증" },
                { ok: true, text: "setup-token 자동 적용" },
                { ok: true, text: "높은 사용 한도" },
                { ok: false, text: "월 $100+ 구독 필요" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="mt-0.5 shrink-0 text-xs font-bold"
                    style={{ color: item.ok ? "var(--profit)" : "var(--loss)" }}
                  >
                    {item.ok ? "+" : "-"}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pro: claude login */}
      <section className="space-y-3">
        <h2 className="section-header" style={{ fontSize: "0.6875rem" }}>
          Pro 플랜 — 터미널에서 로그인
        </h2>
        <div
          className="obsidian-card flex items-start gap-4"
          style={{ borderLeft: "2px solid var(--accent-blue)" }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--accent-blue-glow)", color: "var(--accent-blue)" }}
          >
            <Terminal className="h-[18px] w-[18px]" />
          </div>
          <div className="space-y-2 w-full">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              이 앱의 터미널에서 바로 실행하세요
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              로컬 PC에 별도 설치 없이, 사이드바 하단 <strong>터미널</strong> 버튼을 눌러 아래 명령을 입력하면 됩니다.
            </p>
            <code
              className="block rounded px-3 py-2 font-mono text-xs"
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border-subtle)",
                color: "var(--accent-bright)",
              }}
            >
              claude login
            </code>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              명령 실행 후 표시되는 URL을 브라우저에서 열어 Claude Pro 계정으로 로그인합니다.
              인증이 완료되면 터미널이 자동으로 재개됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* Max/Team/Enterprise: .env */}
      <section className="space-y-3">
        <h2 className="section-header" style={{ fontSize: "0.6875rem" }}>
          Max / Team / Enterprise — 토큰 설정
        </h2>
        <div
          className="obsidian-card flex items-start gap-4"
          style={{ borderLeft: "2px solid var(--accent)" }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
          >
            <LogIn className="h-[18px] w-[18px]" />
          </div>
          <div className="space-y-2 w-full">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              .env 파일에 OAuth 토큰 입력
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Max 이상 플랜은 <code className="font-mono" style={{ color: "var(--accent-bright)" }}>setup-token</code>을 지원합니다.
              아래처럼 .env에 토큰을 설정하면 시작 시 자동으로 적용됩니다.
            </p>
            <div
              className="rounded-lg px-4 py-3 font-mono text-xs leading-relaxed"
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>CLAUDE_CODE_OAUTH_TOKEN=</span>
              <span style={{ color: "var(--accent-bright)" }}>sk-ant-oat01-...</span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              토큰은 claude.ai 계정 설정에서 발급받을 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Token expiry for Pro */}
      <section className="space-y-3">
        <h2 className="section-header" style={{ fontSize: "0.6875rem" }}>
          Pro — 토큰 만료 시
        </h2>
        <div className="obsidian-card space-y-3">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            OAuth 로그인은 일정 기간 후 만료됩니다. Claude가 인증 오류를 낼 경우 터미널에서 다시 실행하세요.
          </p>
          <code
            className="block rounded px-3 py-2 font-mono text-xs"
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border-subtle)",
              color: "var(--accent-bright)",
            }}
          >
            claude login
          </code>
        </div>
      </section>

      {/* Pricing note */}
      <section className="space-y-3">
        <h2 className="section-header" style={{ fontSize: "0.6875rem" }}>
          Pro 사용량 한도
        </h2>
        <div className="obsidian-card space-y-3">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4" style={{ color: "var(--accent-amber)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              메시지 수 제한
            </p>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Pro 플랜은 일정 메시지 수 제한이 있습니다. 한도 초과 시 다음 리셋까지 기다리거나 Max 플랜 업그레이드를 고려하세요.
          </p>
          {[
            "코딩 작업은 메시지당 토큰 소모가 크므로 한도가 빨리 찰 수 있습니다.",
            "/compact 명령으로 대화 맥락을 압축하면 토큰 소모를 줄일 수 있습니다.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className="mt-0.5 shrink-0 font-mono text-xs font-bold"
                style={{ color: "var(--accent-amber)" }}
              >
                *
              </span>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {tip}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Warning */}
      <div
        className="obsidian-card flex items-start gap-3"
        style={{ borderLeft: "2px solid var(--accent-amber)" }}
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent-amber)" }} />
        <div className="space-y-1">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            토큰 보안 주의
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            OAuth 토큰은 .env 파일에만 보관하고 절대 공개 저장소에 커밋하지 마세요.
            .gitignore에 .env가 포함되어 있는지 반드시 확인하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
