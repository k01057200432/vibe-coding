"use client";

import { useState } from "react";
import {
  Database,
  Box,
  ChevronRight,
  Sparkles,
  Lock,
  Globe,
  Smartphone,
  LayoutGrid,
  BarChart3,
  Clock,
  FileText,
  Github,
  Table2,
  Copy,
  Check,
  Upload,
  Zap,
} from "lucide-react";

interface Example {
  icon: typeof Database;
  title: string;
  accent: string;
  glow: string;
  prompt: string;
  result: string[];
  note?: string;
}

interface Category {
  label: string;
  description: string;
  examples: Example[];
}

const categories: Category[] = [
  {
    label: "UI / 페이지",
    description: "새 페이지, 컴포넌트, 대시보드를 만듭니다.",
    examples: [
      {
        icon: FileText,
        title: "서브 페이지 만들기",
        accent: "var(--accent)",
        glow: "var(--accent-glow)",
        prompt:
          "공지사항 페이지 만들어줘. app/notice/page.tsx 생성하고, 상단에 제목/날짜/뱃지가 있는 카드 리스트 형태로 만들어줘. 더미 데이터 3~5개 넣고, 사이드바 메뉴에도 '공지사항' 추가해줘. 재빌드까지 해줘.",
        result: [
          "app/notice/page.tsx 공지사항 페이지 생성",
          "카드 리스트 UI (제목, 날짜, 뱃지)",
          "nav-rail.tsx에 공지사항 메뉴 추가",
          "docker compose 재빌드 및 반영",
        ],
      },
      {
        icon: BarChart3,
        title: "대시보드 페이지 만들기",
        accent: "var(--accent)",
        glow: "var(--accent-glow)",
        prompt:
          "관리자 대시보드 페이지 만들어줘. 상단에 통계 카드 4개(총 사용자, 오늘 방문, 활성 세션, 저장 용량), 중간에 최근 7일 방문 추이 차트(recharts 사용), 하단에 최근 활동 로그 테이블. 사이드바 메뉴에도 추가해줘. 재빌드까지.",
        result: [
          "app/dashboard/page.tsx 대시보드 페이지",
          "recharts 패키지 설치 및 라인 차트 컴포넌트",
          "통계 카드, 활동 로그 테이블 UI",
          "nav-rail.tsx에 대시보드 메뉴 추가",
        ],
      },
      {
        icon: Table2,
        title: "DB를 활용한 CRUD 페이지",
        accent: "var(--accent)",
        glow: "var(--accent-glow)",
        prompt:
          "SQLite로 할 일(Todo) 관리 페이지 만들어줘. better-sqlite3 설치하고, lib/db.ts에 todos 테이블 만들어줘. app/todos/page.tsx는 서버 컴포넌트로 DB에서 목록 읽어서 보여주고, 추가/삭제는 Server Actions로 처리해줘. docker volume에 DB 파일 영속화하고, 사이드바 메뉴에 추가하고 재빌드해줘.",
        result: [
          "better-sqlite3 설치 + lib/db.ts todos 테이블",
          "app/todos/page.tsx 서버 컴포넌트 (DB 조회)",
          "app/todos/actions.ts Server Actions (추가/삭제)",
          "docker-compose.yml data volume 영속화",
          "nav-rail.tsx 메뉴 추가 + 재빌드",
        ],
      },
      {
        icon: Zap,
        title: "실시간 알림 / 토스트 시스템",
        accent: "var(--accent)",
        glow: "var(--accent-glow)",
        prompt:
          "앱 전역에서 사용할 토스트 알림 시스템 만들어줘. sonner 패키지 사용하고, layout.tsx에 Toaster 추가해줘. lib/toast.ts에 success, error, info 헬퍼 함수 만들어서 어느 컴포넌트에서든 toast.success('저장됨') 형태로 쓸 수 있게 해줘. 재빌드까지.",
        result: [
          "sonner 패키지 설치",
          "layout.tsx에 <Toaster /> 추가",
          "lib/toast.ts 헬퍼 (success, error, info, warning)",
          "사용 예시 컴포넌트 작성",
        ],
      },
    ],
  },
  {
    label: "데이터베이스",
    description: "DB 서비스를 추가하고 데이터를 영속화합니다.",
    examples: [
      {
        icon: Database,
        title: "SQLite 추가",
        accent: "var(--profit)",
        glow: "var(--profit-glow)",
        prompt:
          "UI에 SQLite 데이터베이스 추가해줘. better-sqlite3 패키지 설치하고, lib/db.ts에 연결 코드 만들어줘. 데이터 파일은 /app/data/app.db에 저장하고 docker volume으로 영속화해줘.",
        result: [
          "package.json에 better-sqlite3 의존성 추가",
          "lib/db.ts 데이터베이스 연결 모듈",
          "docker-compose.yml에 data volume 추가",
          "Dockerfile에 빌드 의존성 추가 (native module)",
        ],
      },
      {
        icon: Database,
        title: "PostgreSQL 추가",
        accent: "var(--profit)",
        glow: "var(--profit-glow)",
        prompt:
          "docker-compose.yml에 PostgreSQL 서비스 추가해줘. UI에서 접속할 수 있게 환경변수도 설정하고, .env.example에도 반영해줘. 초기 스키마는 services/db/init.sql에 만들어줘.",
        result: [
          "docker-compose.yml에 postgres 서비스 추가",
          ".env에 DB_HOST, DB_USER, DB_PASSWORD 등 환경변수",
          "services/db/init.sql 초기 스키마 파일",
          "UI 서비스에 DB 환경변수 연결",
        ],
      },
      {
        icon: Lock,
        title: "로그인 방식 변경 (DB 기반)",
        accent: "var(--profit)",
        glow: "var(--profit-glow)",
        prompt:
          "현재 .env의 DEMO_USERNAME/DEMO_PASSWORD로 로그인하는 방식을 DB 기반으로 바꿔줘. PostgreSQL에 users 테이블 만들고, 비밀번호는 bcrypt로 해시해서 저장해줘. 회원가입 페이지도 만들어줘. 세션은 기존 쿠키 방식 유지하되, JWT로 바꿔줘.",
        result: [
          "PostgreSQL에 users 테이블 (id, email, password_hash, created_at)",
          "app/api/auth/route.ts bcrypt 기반 인증으로 교체",
          "app/register/page.tsx 회원가입 페이지",
          "lib/jwt.ts JWT 토큰 발급/검증",
          "middleware.ts JWT 쿠키 검증으로 변경",
        ],
      },
    ],
  },
  {
    label: "인프라",
    description: "새 서비스를 추가하고 백엔드를 확장합니다.",
    examples: [
      {
        icon: Box,
        title: "새 백엔드 서비스 추가 (Go + Chi)",
        accent: "var(--accent-blue)",
        glow: "var(--accent-blue-glow)",
        prompt:
          "services/api/ 디렉토리에 Go + Chi 프레임워크로 REST API 서버 만들어줘. go.mod에 github.com/go-chi/chi/v5 의존성 추가하고, 라우터는 chi.NewRouter()로 구성해줘. 미들웨어는 chi.Logger, chi.Recoverer 적용하고, /api/health, /api/v1/items CRUD 엔드포인트 만들어줘. 데이터는 인메모리 슬라이스로 관리하고, 멀티스테이지 빌드로 최종 이미지는 scratch 기반으로 만들어줘. docker-compose.yml에 서비스 추가 + Caddyfile에 /api/* 프록시 설정 + 재빌드까지 해줘.",
        result: [
          "services/api/ 에 main.go, go.mod (chi v5 의존성), Dockerfile (멀티스테이지, scratch 기반)",
          "chi.NewRouter() + Logger/Recoverer 미들웨어 설정",
          "GET /api/health, GET/POST /api/v1/items, GET/PUT/DELETE /api/v1/items/{id}",
          "인메모리 슬라이스 기반 CRUD (sync.RWMutex로 동시성 처리)",
          "docker-compose.yml에 api 서비스 추가 + Caddyfile /api/* 프록시",
        ],
        note: "이미 claude 서비스가 Go로 작성되어 있어 같은 스택을 유지할 수 있습니다. Chi는 Go 표준 net/http와 100% 호환되는 경량 라우터로, 미들웨어 체이닝과 URL 파라미터 추출이 깔끔합니다. 빌드 결과물이 단일 바이너리라 최종 이미지가 ~10MB로 작고, 메모리 사용량이 낮으며, 콜드 스타트가 빠릅니다.",
      },
      {
        icon: Upload,
        title: "파일 업로드 (로컬 저장)",
        accent: "var(--accent-blue)",
        glow: "var(--accent-blue-glow)",
        prompt:
          "파일 업로드 기능 추가해줘. app/api/upload/route.ts에 multipart/form-data를 받아서 /app/uploads/ 폴더에 저장하는 API 만들어줘. docker-compose.yml에 uploads volume 추가해서 컨테이너 재시작해도 파일이 유지되게 해줘. Caddyfile에서 /uploads/* 정적 파일 서빙도 추가해줘.",
        result: [
          "app/api/upload/route.ts 파일 업로드 API",
          "docker-compose.yml에 uploads volume 추가",
          "Caddyfile에 /uploads/* 정적 파일 서빙",
          "업로드 폼 컴포넌트 예시",
        ],
      },
      {
        icon: Box,
        title: "Java 서비스를 Go + Chi로 마이그레이션",
        accent: "var(--accent-blue)",
        glow: "var(--accent-blue-glow)",
        prompt:
          "services/legacy-java/ 에 있는 Java Spring Boot 서비스를 Go + Chi 프레임워크로 다시 작성해줘. 기존 REST API 엔드포인트를 동일하게 유지하면서 github.com/go-chi/chi/v5 라우터로 구현해줘. chi.Logger, chi.Recoverer 미들웨어 적용하고, URL 파라미터는 chi.URLParam()으로 추출해줘. Dockerfile은 멀티스테이지 빌드로 scratch 기반 최종 이미지로 만들어줘. docker-compose.yml에서 기존 java 서비스를 go 서비스로 교체하고 재빌드해줘.",
        result: [
          "기존 Spring Boot 컨트롤러 분석 후 Chi 라우터로 1:1 재구현",
          "services/api-go/ 디렉토리에 main.go, go.mod (chi v5), Dockerfile",
          "chi.Logger / chi.Recoverer 미들웨어, 서브라우터로 버전별 경로 분리",
          "멀티스테이지 빌드 — 빌드 단계(golang:bookworm) + 실행 단계(scratch)",
          "docker-compose.yml에서 java 서비스 → go 서비스로 교체 + 재빌드",
        ],
        note: "JVM 없이 단일 바이너리로 실행되므로 컨테이너 이미지가 수백 MB에서 ~10MB로 줄어듭니다. Chi는 Spring의 @PathVariable, @RequestMapping과 유사한 방식으로 라우팅을 구성할 수 있어 마이그레이션 구조를 그대로 유지하기 쉽습니다.",
      },
      {
        icon: Clock,
        title: "크론잡 / 백그라운드 워커",
        accent: "var(--accent-blue)",
        glow: "var(--accent-blue-glow)",
        prompt:
          "매일 자정에 DB 백업하는 크론잡 서비스 만들어줘. services/cron/ 디렉토리에 간단한 스크립트와 Dockerfile 만들고, docker-compose.yml에 추가해줘. PostgreSQL의 pg_dump로 백업하고 /backups 볼륨에 저장해줘.",
        result: [
          "services/cron/ 디렉토리에 backup.sh, Dockerfile",
          "docker-compose.yml에 cron 서비스 + backups 볼륨",
          "PostgreSQL 네트워크 연결 설정",
          "7일 이상 된 백업 자동 삭제",
        ],
      },
      {
        icon: Github,
        title: "Private GitHub 레포를 서비스로 추가",
        accent: "var(--accent-blue)",
        glow: "var(--accent-blue-glow)",
        prompt:
          "Private GitHub 레포(https://github.com/my-org/my-app)를 새 서비스로 추가해줘. GitHub Personal Access Token은 .env의 GITHUB_TOKEN에 있어. services/my-app/ 에 클론하고 Dockerfile 만들어줘. docker-compose.yml에 my-app 서비스 추가하고, Caddyfile에서 my-app.example.com 서브도메인으로 프록시 설정해줘. 코드 업데이트는 'git pull && docker compose build my-app && docker compose up -d my-app'으로 하면 되게 해줘.",
        result: [
          ".env에 GITHUB_TOKEN 항목 추가 (.env.example 반영)",
          "services/my-app/ 에 레포 클론 + Dockerfile 생성",
          "docker-compose.yml에 my-app 서비스 추가",
          "Caddyfile에 my-app.example.com 서브도메인 프록시",
          "업데이트 방법 주석 문서화",
        ],
      },
    ],
  },
  {
    label: "배포 / 운영",
    description: "도메인, HTTPS, PWA 등 운영 환경을 설정합니다.",
    examples: [
      {
        icon: Lock,
        title: "Claude 터미널 관리자 전용으로 제한",
        accent: "var(--accent-amber)",
        glow: "var(--accent-amber-glow)",
        prompt:
          "여러 사람이 앱을 사용하는데, Claude 터미널(/claude 경로)은 관리자만 접근하게 해줘. .env에 ADMIN_USERNAME 추가하고, 로그인 API(app/api/auth/route.ts)에서 관리자 여부를 판별해서 role=admin 또는 role=user를 쿠키에 담아줘. middleware.ts에서 /claude/* 경로는 role=admin이 아니면 홈(/)으로 리다이렉트해줘. 사이드바 터미널 버튼도 관리자만 보이게 하고, 터미널 패널을 여는 단축키(Ctrl+`)도 관리자 아니면 동작하지 않게 막아줘. 재빌드까지.",
        result: [
          ".env / .env.example에 ADMIN_USERNAME 추가",
          "app/api/auth/route.ts: 로그인 시 role=admin 또는 role=user 쿠키 발급",
          "middleware.ts: /claude/* 경로는 role=admin 없으면 / 리다이렉트",
          "nav-rail.tsx: 관리자 쿠키 있을 때만 터미널 버튼 표시",
          "terminal-panel.tsx 또는 단축키 훅: role=admin 아니면 단축키 이벤트 무시",
          "재빌드 및 반영",
        ],
        note: "일반 사용자는 앱을 정상적으로 이용하지만 터미널에는 접근할 수 없습니다. 쿠키 위조를 막으려면 JWT 서명 검증(lib/jwt.ts)을 함께 사용하거나, Caddy에서 /claude/* 경로에 별도 Basic Auth를 추가하는 방법도 있습니다.",
      },
      {
        icon: Globe,
        title: "HTTPS 적용 (도메인)",
        accent: "var(--accent-amber)",
        glow: "var(--accent-amber-glow)",
        prompt:
          "Caddyfile을 수정해서 HTTPS를 적용해줘. 도메인은 example.com이야. docker-compose.yml에서 Caddy 포트를 80:80, 443:443, 443:443/udp로 바꾸고, caddy_data 볼륨도 추가해줘. Let's Encrypt 인증서 자동 발급되게 해줘. 재빌드까지.",
        result: [
          "Caddyfile을 example.com { ... } 형식으로 변경",
          "docker-compose.yml Caddy 포트 80, 443 개방 (8080 제거)",
          "caddy_data 볼륨 추가 (인증서 영속화)",
          "Caddy가 Let's Encrypt 인증서 자동 발급",
        ],
      },
      {
        icon: LayoutGrid,
        title: "서브도메인으로 새 서비스 추가",
        accent: "var(--accent-amber)",
        glow: "var(--accent-amber-glow)",
        prompt:
          "services/blog/ 디렉토리에 Next.js 블로그 앱을 새로 만들어줘. Dockerfile도 만들고, docker-compose.yml에 blog 서비스로 추가해줘. Caddyfile에서 blog.example.com 서브도메인으로 이 서비스에 프록시하게 설정해줘. 메인 앱과 독립적으로 동작해야 해.",
        result: [
          "services/blog/ 디렉토리에 Next.js 프로젝트 (Dockerfile, package.json, app/)",
          "docker-compose.yml에 blog 서비스 추가",
          "Caddyfile에 blog.example.com { reverse_proxy blog:3000 } 추가",
          "서브도메인별 자동 SSL 인증서 발급",
        ],
      },
      {
        icon: Zap,
        title: "서버 부팅 시 자동 시작 (restart 정책)",
        accent: "var(--accent-amber)",
        glow: "var(--accent-amber-glow)",
        prompt:
          "서버 재부팅 시 모든 서비스가 자동으로 올라오게 해줘. docker-compose.yml의 각 서비스에 restart: unless-stopped 추가해줘. Docker 데몬 자체는 설치 시 자동으로 부팅 등록되니 이걸로 충분해. 적용 후 docker compose up -d로 재시작까지 해줘.",
        result: [
          "docker-compose.yml 각 서비스에 restart: unless-stopped 추가",
          "서버 재부팅 → Docker 데몬 기동 → 컨테이너 자동 재시작",
          "docker compose up -d 로 재적용",
          "docker compose ps 로 상태 확인",
        ],
        note: "restart: unless-stopped는 컨테이너가 수동으로 중지(docker compose stop)되지 않는 한 항상 재시작합니다. 서버 리부팅, 컨테이너 크래시 모두 자동 복구됩니다. systemd 서비스 파일은 컨테이너 안에서 만들 수 없으니 이 방식이 정답입니다.",
      },
      {
        icon: Smartphone,
        title: "PWA 설치 가능하게 만들기",
        accent: "var(--accent-amber)",
        glow: "var(--accent-amber-glow)",
        prompt:
          "HTTPS가 적용된 상태야. PWA로 만들어서 모바일에서 앱처럼 설치할 수 있게 해줘. manifest.json, service worker, 앱 아이콘(192, 512px) 설정하고, layout.tsx에 메타 태그 추가해줘. 오프라인 캐시는 앱 셸만.",
        result: [
          "public/manifest.json (name, icons, start_url, display: standalone)",
          "public/sw.js 서비스 워커 (앱 셸 캐시)",
          "public/icons/ 앱 아이콘 192px, 512px",
          "layout.tsx에 apple-web-app 메타 태그, SW 등록 스크립트",
          "middleware.ts에 /sw.js, /manifest.json 인증 제외",
        ],
      },
    ],
  },
];

function CopyButton({ text, accent }: { text: string; accent: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs transition-colors"
      style={{
        background: copied ? "var(--profit-glow)" : "var(--bg-elevated)",
        border: `1px solid ${copied ? "var(--profit)" : "var(--border-subtle)"}`,
        color: copied ? "var(--profit)" : "var(--text-muted)",
      }}
      title="프롬프트 복사"
    >
      {copied ? (
        <Check className="h-3 w-3" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {copied ? "복사됨" : "복사"}
    </button>
  );
}

export default function ExamplesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
          >
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            활용 방법
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Claude에게 아래 프롬프트를 그대로 복붙하면 됩니다.
          docker-compose.yml, Dockerfile, Caddyfile, 코드 생성, 재빌드까지 알아서 합니다.
        </p>
      </div>

      {/* Categories */}
      {categories.map((cat) => (
        <section key={cat.label} className="space-y-3">
          {/* Category header */}
          <div className="flex items-center gap-3">
            <h2 className="section-header" style={{ fontSize: "0.6875rem" }}>
              {cat.label}
            </h2>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {cat.description}
            </span>
          </div>

          <div className="space-y-3">
            {cat.examples.map((ex, i) => (
              <div
                key={i}
                className="obsidian-card space-y-3"
                style={{ borderLeft: `2px solid ${ex.accent}` }}
              >
                {/* Title */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: ex.glow, color: ex.accent }}
                  >
                    <ex.icon className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="flex-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {ex.title}
                  </h3>
                </div>

                {/* Prompt */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      프롬프트
                    </p>
                    <CopyButton text={ex.prompt} accent={ex.accent} />
                  </div>
                  <div
                    className="rounded-lg px-3 py-2.5 font-mono text-xs leading-relaxed"
                    style={{
                      background: "var(--bg-base)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <ChevronRight className="mr-1 inline h-3 w-3" style={{ color: ex.accent }} />
                    {ex.prompt}
                  </div>
                </div>

                {/* Result */}
                <div className="space-y-1 pl-1">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Claude가 하는 일
                  </p>
                  {ex.result.map((r, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs font-bold" style={{ color: ex.accent }}>+</span>
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{r}</span>
                    </div>
                  ))}
                </div>

                {/* Note */}
                {ex.note && (
                  <div
                    className="rounded px-2.5 py-2"
                    style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}
                  >
                    <p className="text-xs" style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>
                      {ex.note}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Note */}
      <div
        className="obsidian-card text-sm"
        style={{ color: "var(--text-secondary)", borderColor: "var(--border-default)" }}
      >
        <p>
          프롬프트는 그대로 사용해도 되고, 상황에 맞게 수정해도 됩니다.
          Claude는 docker-compose.yml, Dockerfile, Caddyfile, .env 등 모노레포 전체를 수정할 수 있으므로
          원하는 구성을 자연어로 설명하면 됩니다.
        </p>
      </div>
    </div>
  );
}
