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
  Webhook,
  Clock,
  Mail,
  Eye,
} from "lucide-react";

const examples = [
  {
    icon: Database,
    title: "PostgreSQL 추가",
    accent: "var(--accent-blue)",
    glow: "var(--accent-blue-glow)",
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
      "Dockerfile에 빌드 의존성 추가 (빌드 시 native module)",
    ],
  },
  {
    icon: Box,
    title: "새 백엔드 서비스 추가",
    accent: "var(--accent-purple)",
    glow: "rgba(167, 139, 250, 0.12)",
    prompt:
      "services/api/ 디렉토리에 Express.js API 서버 만들어줘. docker-compose.yml에 서비스로 추가하고, Caddy에서 /api/* 로 프록시 설정해줘.",
    result: [
      "services/api/ 디렉토리에 Dockerfile, package.json, index.ts",
      "docker-compose.yml에 api 서비스 추가",
      "Caddyfile에 /api/* 리버스 프록시 규칙 추가",
    ],
  },
  {
    icon: Box,
    title: "S3 호환 오브젝트 스토리지",
    accent: "var(--accent-amber)",
    glow: "var(--accent-amber-glow)",
    prompt:
      "docker-compose.yml에 MinIO 추가해줘. UI에서 파일 업로드할 수 있게 API 라우트도 만들어줘. 버킷 이름은 uploads로.",
    result: [
      "docker-compose.yml에 minio 서비스 (9000, 9001 포트)",
      ".env에 MINIO_ROOT_USER, MINIO_ROOT_PASSWORD",
      "app/api/upload/route.ts 파일 업로드 API",
      "lib/s3.ts MinIO 클라이언트",
    ],
  },
  {
    icon: Lock,
    title: "로그인 방식 변경 (DB 기반)",
    accent: "var(--accent-purple)",
    glow: "rgba(167, 139, 250, 0.12)",
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
  {
    icon: Globe,
    title: "HTTPS 적용 (도메인)",
    accent: "var(--accent-amber)",
    glow: "var(--accent-amber-glow)",
    prompt:
      "Caddyfile을 수정해서 HTTPS를 적용해줘. 도메인은 example.com이야. docker-compose.yml에서 Caddy 포트를 80:80, 443:443으로 바꾸고, Caddy data 볼륨도 추가해줘. Let's Encrypt 자동 발급되게.",
    result: [
      "Caddyfile을 example.com { ... } 형식으로 변경",
      "docker-compose.yml Caddy 포트 80, 443 개방",
      "caddy_data, caddy_config 볼륨 추가 (인증서 영속화)",
      "Caddy가 Let's Encrypt 인증서 자동 발급",
    ],
  },
  {
    icon: LayoutGrid,
    title: "서브도메인으로 새 서비스 추가",
    accent: "var(--accent-blue)",
    glow: "var(--accent-blue-glow)",
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
    icon: BarChart3,
    title: "대시보드 페이지 만들기",
    accent: "var(--accent)",
    glow: "var(--accent-glow)",
    prompt:
      "관리자 대시보드 페이지 만들어줘. 상단에 통계 카드 4개(총 사용자, 오늘 방문, 활성 세션, 저장 용량), 중간에 최근 7일 방문 추이 차트(recharts 사용), 하단에 최근 활동 로그 테이블. 사이드바 메뉴에도 추가해줘.",
    result: [
      "app/dashboard/page.tsx 대시보드 페이지",
      "recharts 패키지 설치 및 라인 차트 컴포넌트",
      "통계 카드, 활동 로그 테이블 UI",
      "nav-rail.tsx에 대시보드 메뉴 추가",
    ],
  },
  {
    icon: Webhook,
    title: "WebSocket 실시간 알림",
    accent: "var(--accent-red)",
    glow: "var(--accent-red-glow)",
    prompt:
      "실시간 알림 기능 만들어줘. services/notify/ 디렉토리에 Go 또는 Node.js WebSocket 서버 만들고, docker-compose.yml에 추가해줘. UI에서 알림 벨 아이콘 클릭하면 실시간 메시지 목록이 보이게. Caddy에서 /ws/* 로 프록시해줘.",
    result: [
      "services/notify/ WebSocket 서버 (Dockerfile 포함)",
      "docker-compose.yml에 notify 서비스 추가",
      "Caddyfile에 /ws/* WebSocket 프록시",
      "UI에 알림 벨 + 드롭다운 컴포넌트",
    ],
  },
  {
    icon: Clock,
    title: "크론잡 / 백그라운드 워커",
    accent: "var(--accent-amber)",
    glow: "var(--accent-amber-glow)",
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
    icon: Mail,
    title: "이메일 발송 (SMTP)",
    accent: "var(--accent-purple)",
    glow: "rgba(167, 139, 250, 0.12)",
    prompt:
      "이메일 발송 기능 추가해줘. .env에 SMTP 설정(호스트, 포트, 계정) 넣고, lib/mail.ts에 nodemailer로 발송 모듈 만들어줘. 비밀번호 재설정 이메일 API도 만들어줘.",
    result: [
      ".env에 SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS",
      "lib/mail.ts nodemailer 발송 모듈",
      "app/api/auth/reset-password/route.ts 비밀번호 재설정 API",
      "이메일 HTML 템플릿",
    ],
  },
  {
    icon: Eye,
    title: "모니터링 (Grafana + Prometheus)",
    accent: "var(--profit)",
    glow: "var(--profit-glow)",
    prompt:
      "docker-compose.yml에 Prometheus와 Grafana 추가해줘. Caddy에서 grafana.example.com 서브도메인으로 Grafana에 프록시하고, Node.js 앱의 메트릭을 수집할 수 있게 prom-client 패키지도 설치해줘.",
    result: [
      "docker-compose.yml에 prometheus, grafana 서비스",
      "services/prometheus/prometheus.yml 설정 파일",
      "Caddyfile에 grafana 서브도메인 프록시",
      "UI에 prom-client 메트릭 엔드포인트 (/metrics)",
    ],
  },
  {
    icon: Smartphone,
    title: "PWA 설치 가능하게 만들기",
    accent: "var(--profit)",
    glow: "var(--profit-glow)",
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
];

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
          Docker Compose에 서비스를 추가하고, 코드를 생성하고, 재빌드까지 알아서 합니다.
        </p>
      </div>

      {/* Examples */}
      <div className="space-y-4">
        {examples.map((ex, i) => (
          <section key={i} className="obsidian-card space-y-4" style={{ borderLeft: `2px solid ${ex.accent}` }}>
            {/* Title */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: ex.glow, color: ex.accent }}
              >
                <ex.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {ex.title}
              </h3>
            </div>

            {/* Prompt */}
            <div className="relative">
              <div
                className="rounded-lg px-4 py-3 font-mono text-xs leading-relaxed"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>
                  <ChevronRight className="mr-1 inline h-3 w-3" style={{ color: ex.accent }} />
                </span>
                {ex.prompt}
              </div>
            </div>

            {/* Result */}
            <div className="space-y-1.5 pl-1">
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
          </section>
        ))}
      </div>

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
