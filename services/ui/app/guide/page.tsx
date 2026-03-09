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
  Smartphone,
  Wifi,
  BellRing,
  MonitorSmartphone,
  Zap,
  CreditCard,
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
          {/* Step 1: Fork & Clone */}
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
                  style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--accent-bright)" }}
                >
                  git clone https://github.com/your-username/vibe-coding.git
                </code>
                <code
                  className="block rounded px-3 py-2 font-mono text-xs"
                  style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--accent-bright)" }}
                >
                  cd vibe-coding && cp .env.example .env
                </code>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-4 w-4" style={{ color: "var(--text-dim)" }} />
          </div>

          {/* Step 2: Claude 인증 */}
          <div
            className="obsidian-card space-y-4"
            style={{ borderLeft: "2px solid var(--accent-amber)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "var(--accent-amber-glow)", color: "var(--accent-amber)" }}
              >
                <Key className="h-[18px] w-[18px]" />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  2. Claude 인증
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  플랜에 따라 방식이 다릅니다
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Max / Team / Enterprise */}
              <div
                className="rounded-lg p-3 space-y-2.5"
                style={{ background: "var(--bg-base)", border: "2px solid var(--accent)" }}
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--accent)" }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
                    Max / Team / Enterprise
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  로컬 PC에서 토큰을 발급한 뒤 .env에 설정합니다. 앱 시작 시 자동으로 인증됩니다.
                </p>
                <div className="space-y-1">
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>① 로컬에서 CLI 설치 후 토큰 발급</p>
                  <code
                    className="block rounded px-2 py-1.5 font-mono text-xs"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--accent-bright)" }}
                  >
                    curl -fsSL https://claude.ai/install.sh | bash
                  </code>
                  <code
                    className="block rounded px-2 py-1.5 font-mono text-xs"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--accent-bright)" }}
                  >
                    claude setup-token
                  </code>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>② 발급된 토큰을 .env에 붙여넣기</p>
                  <code
                    className="block rounded px-2 py-1.5 font-mono text-xs"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--accent-bright)" }}
                  >
                    CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-...
                  </code>
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  높은 사용 한도 · 별도 재로그인 불필요
                </p>
              </div>

              {/* Pro */}
              <div
                className="rounded-lg p-3 space-y-2.5"
                style={{ background: "var(--bg-base)", border: "2px solid var(--accent-blue)" }}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--accent-blue)" }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--accent-blue)" }}>
                    Claude Pro (월 $20)
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  .env 토큰 설정 없이, 앱 실행 후 내장 터미널에서 로그인합니다.
                </p>
                <div className="space-y-1">
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>아래 스텝 3 실행 후 내장 터미널에서:</p>
                  <code
                    className="block rounded px-2 py-1.5 font-mono text-xs"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--accent-bright)" }}
                  >
                    claude login
                  </code>
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  브라우저 OAuth 인증 · 메시지 한도 있음
                </p>
                <div
                  className="flex items-start gap-2 rounded px-2 py-1.5"
                  style={{ background: "var(--accent-amber-glow)", border: "1px solid var(--accent-amber)" }}
                >
                  <span className="text-xs font-bold shrink-0" style={{ color: "var(--accent-amber)" }}>!</span>
                  <p className="text-xs" style={{ color: "var(--accent-amber)" }}>
                    토큰 만료 시 동일하게 claude login 재실행
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-4 w-4" style={{ color: "var(--text-dim)" }} />
          </div>

          {/* Step 3: Run */}
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
                style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--accent-bright)" }}
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
                style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--accent-bright)" }}
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
{`docker-compose.yml
  ├── caddy   :8080  ← 브라우저 진입점
  ├── ui             Next.js (빌드된 정적 서버)
  └── claude         Go 백엔드 + Claude CLI
                       └── .:/workspace (모노레포 bind mount)`}
          </pre>
        </div>
        <div className="obsidian-card space-y-3">
          {[
            {
              title: "세 개의 서비스",
              desc: "docker compose up -d --build 한 줄로 caddy, ui, claude 세 컨테이너가 함께 뜹니다. 외부에 노출되는 포트는 8080 하나뿐입니다.",
            },
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

      {/* PWA */}
      <section className="space-y-3">
        <h2 className="section-header" style={{ fontSize: "0.6875rem" }}>
          PWA — 모바일에서도 코딩하기
        </h2>

        <div
          className="obsidian-card space-y-4"
          style={{ borderLeft: "2px solid var(--accent)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
            >
              <MonitorSmartphone className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                홈 화면에 설치하면 앱처럼 사용
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                브라우저 없이 전체 화면으로 실행됩니다
              </p>
            </div>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            HTTPS 도메인을 설정하면 iPhone·Android 홈 화면에 Vibe Coding을 설치할 수 있습니다.
            브라우저 탭이 아닌 <strong style={{ color: "var(--text-primary)" }}>네이티브 앱처럼</strong> 전체 화면으로 열립니다.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            {
              icon: Smartphone,
              accent: "var(--accent-blue)",
              glow: "var(--accent-blue-glow)",
              title: "이동 중 프롬프트",
              desc: "카페, 지하철, 침대에서도 Claude에게 기능 추가·수정을 지시할 수 있습니다. PC 없이 스마트폰으로 프로젝트를 관리하세요.",
            },
            {
              icon: Zap,
              accent: "var(--accent-amber)",
              glow: "var(--accent-amber-glow)",
              title: "즉각 실행",
              desc: "생각이 날 때 바로 열어서 Claude에게 지시합니다. 브라우저를 열고 URL을 입력하는 단계가 없습니다.",
            },
            {
              icon: MonitorSmartphone,
              accent: "var(--accent)",
              glow: "var(--accent-glow)",
              title: "PC와 동일한 기능",
              desc: "모바일에서도 세션 생성·터미널 접근·코드 수정 지시가 동일하게 작동합니다. 기능 제한 없음.",
            },
            {
              icon: BellRing,
              accent: "var(--accent-purple)",
              glow: "rgba(167, 139, 250, 0.12)",
              title: "Push 알림",
              desc: "Claude가 작업을 완료했을 때 알림을 보내도록 구현할 수 있습니다. 화면을 보지 않아도 완료를 바로 알 수 있습니다.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="obsidian-card flex items-start gap-3"
              style={{ borderLeft: `2px solid ${item.accent}` }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: item.glow, color: item.accent }}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {item.title}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="obsidian-card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            설치 방법
          </p>
          <div className="space-y-2">
            {[
              { platform: "iPhone / iPad", steps: "Safari → 공유 버튼 → '홈 화면에 추가'" },
              { platform: "Android", steps: "Chrome → 메뉴(⋮) → '앱 설치' 또는 '홈 화면에 추가'" },
              { platform: "PC (Chrome)", steps: "주소창 우측 설치 아이콘 클릭 → 설치" },
            ].map((item, i) => (
              <div key={i} className="flex items-baseline gap-3">
                <span
                  className="shrink-0 font-mono text-xs font-semibold"
                  style={{ color: "var(--accent)", minWidth: "7rem" }}
                >
                  {item.platform}
                </span>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {item.steps}
                </span>
              </div>
            ))}
          </div>
          <div
            className="flex items-start gap-2 rounded-lg px-3 py-2"
            style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}
          >
            <Wifi className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              PWA 설치는 HTTPS 환경에서만 가능합니다. 도메인·SSL 설정은{" "}
              <strong style={{ color: "var(--text-secondary)" }}>활용 방법 → HTTPS 적용</strong> 프롬프트를 참고하세요.
            </p>
          </div>
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
