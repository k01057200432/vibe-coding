import {
  Terminal,
  MessageSquare,
  RefreshCw,
  ArrowDown,
  Layers,
  ChevronRight,
  GitFork,
  Key,
  Rocket,
} from "lucide-react";

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
          >
            <Layers className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            사용법
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          터미널에서 Claude에게 말하면 UI가 바뀝니다. 그게 전부입니다.
        </p>
      </div>

      {/* Setup */}
      <section className="space-y-3">
        <h2 className="section-header" style={{ fontSize: "0.6875rem" }}>
          시작하기
        </h2>

        <div className="space-y-2">
          {/* Step: Fork & Clone */}
          <div
            className="obsidian-card flex items-start gap-4"
            style={{ borderLeft: "2px solid var(--accent-blue)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--accent-blue-glow)", color: "var(--accent-blue)" }}
            >
              <GitFork className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                1. Fork &amp; Clone
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                GitHub에서 레포를 Fork한 후 클론합니다.
              </p>
              <div className="space-y-1.5">
                <code
                  className="block rounded px-3 py-2 font-mono text-xs"
                  style={{
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--accent-bright)",
                  }}
                >
                  git clone https://github.com/your-username/vibe-coding.git
                </code>
                <code
                  className="block rounded px-3 py-2 font-mono text-xs"
                  style={{
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--accent-bright)",
                  }}
                >
                  cd vibe-coding && cp .env.example .env
                </code>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-4 w-4" style={{ color: "var(--text-dim)" }} />
          </div>

          {/* Step: Claude Code Token */}
          <div
            className="obsidian-card flex items-start gap-4"
            style={{ borderLeft: "2px solid var(--accent-amber)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--accent-amber-glow)", color: "var(--accent-amber)" }}
            >
              <Key className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                2. Claude Code OAuth 토큰 발급
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Claude Max / Team / Enterprise 플랜이 필요합니다.
                로컬에 Claude Code CLI를 설치한 후 토큰을 생성합니다.
              </p>
              <div className="space-y-1.5">
                <code
                  className="block rounded px-3 py-2 font-mono text-xs"
                  style={{
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--accent-bright)",
                  }}
                >
                  curl -fsSL https://claude.ai/install.sh | bash
                </code>
                <code
                  className="block rounded px-3 py-2 font-mono text-xs"
                  style={{
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--accent-bright)",
                  }}
                >
                  claude setup-token
                </code>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                발급된 <code className="font-mono" style={{ color: "var(--accent-bright)" }}>sk-ant-oat01-...</code> 토큰을
                .env 파일의 <code className="font-mono" style={{ color: "var(--accent-bright)" }}>CLAUDE_CODE_OAUTH_TOKEN</code>에 붙여넣습니다.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-4 w-4" style={{ color: "var(--text-dim)" }} />
          </div>

          {/* Step: Run */}
          <div
            className="obsidian-card flex items-start gap-4"
            style={{ borderLeft: "2px solid var(--profit)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--profit-glow)", color: "var(--profit)" }}
            >
              <Rocket className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                3. 실행
              </p>
              <code
                className="block rounded px-3 py-2 font-mono text-xs"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--accent-bright)",
                }}
              >
                docker compose up -d --build
              </code>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                http://localhost:8080 접속 → .env에 설정한 아이디/비밀번호로 로그인
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="space-y-3">
        <h2 className="section-header" style={{ fontSize: "0.6875rem" }}>
          동작 방식
        </h2>

        <div className="space-y-2">
          {/* Step 1 */}
          <div
            className="obsidian-card flex items-start gap-4"
            style={{ borderLeft: "2px solid var(--accent)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
            >
              <MessageSquare className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                터미널에서 Claude에게 지시
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                &quot;대시보드 페이지 만들어줘&quot;, &quot;사이드바에 설정 메뉴 추가해줘&quot; 등
                자연어로 원하는 걸 말합니다.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-4 w-4" style={{ color: "var(--text-dim)" }} />
          </div>

          {/* Step 2 */}
          <div
            className="obsidian-card flex items-start gap-4"
            style={{ borderLeft: "2px solid var(--profit)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--profit-glow)", color: "var(--profit)" }}
            >
              <Terminal className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Claude가 코드를 수정
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Claude는 <code className="font-mono text-xs" style={{ color: "var(--accent-bright)" }}>/workspace/services/ui/</code> 안의
                소스 코드를 직접 편집합니다. 페이지, 컴포넌트, 스타일 등 뭐든 수정 가능합니다.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-4 w-4" style={{ color: "var(--text-dim)" }} />
          </div>

          {/* Step 3 */}
          <div
            className="obsidian-card flex items-start gap-4"
            style={{ borderLeft: "2px solid var(--accent-amber)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--accent-amber-glow)", color: "var(--accent-amber)" }}
            >
              <RefreshCw className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Docker로 UI 재빌드
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                코드 수정 후 UI에 반영하려면 재빌드가 필요합니다.
                Claude에게 아래 명령어를 실행해달라고 하면 됩니다.
              </p>
              <code
                className="block rounded px-3 py-2 font-mono text-xs"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--accent-bright)",
                }}
              >
                docker compose build ui && docker compose up -d --force-recreate ui
              </code>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Claude가 컨테이너 안에서 호스트 Docker를 직접 제어합니다 (DOOD).
                별도 터미널 없이 Claude에게 시키면 끝.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example: Adding a menu */}
      <section className="space-y-3">
        <h2 className="section-header" style={{ fontSize: "0.6875rem" }}>
          예시 — 새 메뉴 추가하기
        </h2>
        <div className="obsidian-card space-y-4">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Claude에게 이렇게 말하면:
          </p>
          <div
            className="flex items-center gap-2 rounded-md px-3 py-2.5"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--accent)" }} />
            <span className="font-mono text-xs" style={{ color: "var(--text-primary)" }}>
              &quot;설정 페이지 만들고 사이드바에 메뉴 추가해줘&quot;
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Claude가 자동으로:
          </p>
          <div className="space-y-2 pl-1">
            {[
              { file: "app/settings/page.tsx", desc: "설정 페이지 생성" },
              { file: "components/layout/nav-rail.tsx", desc: "사이드바에 메뉴 항목 추가" },
            ].map((item) => (
              <div key={item.file} className="flex items-start gap-2">
                <span className="mt-0.5 text-xs" style={{ color: "var(--profit)" }}>+</span>
                <div>
                  <code className="font-mono text-xs" style={{ color: "var(--accent-bright)" }}>
                    {item.file}
                  </code>
                  <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    — {item.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            그다음 Claude에게 &quot;UI 재빌드해줘&quot;라고 하면 반영됩니다.
          </p>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="space-y-3">
        <h2 className="section-header" style={{ fontSize: "0.6875rem" }}>
          인프라 원리
        </h2>
        <div className="obsidian-card font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
          <pre className="overflow-x-auto whitespace-pre" style={{ lineHeight: "1.8" }}>
{`Browser (:8080)
  │
Caddy (리버스 프록시)
  ├── /          → UI (Next.js :3000)
  └── /claude/*  → Claude Server (Go :8081)
                      ├── WebSocket 터미널
                      ├── Claude CLI (PTY)
                      └── /workspace ← 모노레포 bind mount`}
          </pre>
        </div>
        <div className="obsidian-card space-y-3">
          {[
            {
              title: "Bind Mount",
              desc: "모노레포 전체(.:/workspace)가 Claude 컨테이너에 마운트됩니다. Claude가 수정한 파일은 호스트에 바로 반영됩니다.",
            },
            {
              title: "DOOD (Docker Outside of Docker)",
              desc: "Claude 컨테이너가 호스트의 docker.sock을 공유합니다. Claude가 컨테이너 안에서 docker compose 명령을 실행하면 호스트의 Docker가 동작합니다.",
            },
            {
              title: "프로덕션 빌드",
              desc: "UI는 dev server가 아닌 npm run build && npm start로 실행됩니다. 코드 변경 후 재빌드해야 반영되는 이유입니다.",
            },
            {
              title: "Caddy",
              desc: "경로 기반 프록시로 UI와 Claude 서버를 하나의 포트(8080)로 통합합니다. 도메인 설정 시 Let's Encrypt SSL을 자동 발급합니다.",
            },
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {item.title}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="space-y-3">
        <h2 className="section-header" style={{ fontSize: "0.6875rem" }}>
          팁
        </h2>
        <div className="obsidian-card space-y-3">
          {[
            "터미널은 별도 컨테이너(iframe)이므로 UI가 깨져도 Claude로 복구할 수 있습니다.",
            "Claude에게 \"docker compose build ui && docker compose up -d --force-recreate ui 실행해줘\"라고 하면 알아서 재빌드합니다.",
            "코드만 수정하고 재빌드를 안 하면 화면에 반영되지 않습니다.",
            "사이드바 하단 터미널 버튼 또는 Ctrl + ` 으로 터미널을 열 수 있습니다.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className="mt-0.5 shrink-0 font-mono text-xs font-bold"
                style={{ color: "var(--accent)" }}
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
    </div>
  );
}
