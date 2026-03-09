# 서비스 구조

## docker-compose.yml 전체 흐름

```
docker-compose.yml
  ├── caddy   :8080 (외부 진입점)
  ├── ui             Next.js :3000
  └── claude         Go :8081 + Claude CLI
                       └── .:/workspace (모노레포 bind mount)
```

브라우저는 `:8080`으로만 접근하며, Caddy가 경로에 따라 ui와 claude로 분기합니다.

---

## ui — Next.js 14

**스택**
- Next.js 14 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui 컴포넌트
- Zustand 상태 관리

**구조**

```
services/ui/
├── app/
│   ├── page.tsx              # 홈
│   ├── login/page.tsx        # 로그인
│   ├── pro/page.tsx          # 인증 가이드
│   ├── guide/page.tsx        # 사용법
│   ├── examples/page.tsx     # 활용 방법
│   ├── deploy/page.tsx       # 배포 가이드
│   ├── api/auth/route.ts     # 로그인 API
│   └── layout.tsx            # 루트 레이아웃
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx     # 전체 레이아웃 래퍼
│   │   ├── nav-rail.tsx      # 사이드바 네비게이션
│   │   ├── terminal-panel.tsx # 내장 터미널 (iframe)
│   │   ├── bottom-tabs.tsx   # 모바일 하단 탭
│   │   ├── hud-overlay.tsx   # HUD 오버레이
│   │   └── command-palette.tsx
│   └── ui/                   # shadcn/ui 컴포넌트
├── lib/
│   ├── stores/ui.ts          # Zustand UI 상태
│   └── providers.tsx         # 클라이언트 프로바이더
└── Dockerfile
```

**인증**
- 세션 쿠키 기반
- `.env`의 `DEMO_USERNAME` / `DEMO_PASSWORD`로 로그인
- `middleware.ts`에서 인증 검사

**빌드**
```bash
# UI만 재빌드 (코드 변경 후)
docker compose build ui && docker compose up -d --force-recreate ui
```

---

## claude — Go 백엔드

**스택**
- Go 1.26
- WebSocket (PTY 터미널)
- SQLite (세션 저장)
- Claude CLI (`/home/coder/.local/bin/claude`)

**구조**

```
services/claude/
├── main.go
├── internal/
│   ├── server/
│   │   ├── server.go         # HTTP/WebSocket 서버
│   │   └── web.go            # 라우트 핸들러
│   ├── session/
│   │   ├── manager.go        # PTY 세션 관리
│   │   ├── handler.go        # WebSocket 핸들러
│   │   └── types.go
│   ├── store/
│   │   ├── sqlite.go         # SQLite 연결
│   │   ├── store.go          # 데이터 접근 레이어
│   │   └── schema.sql        # DB 스키마
│   ├── claude/
│   │   ├── auth.go           # Claude CLI 인증 상태 확인
│   │   └── prompt.go         # 시스템 프롬프트
│   └── chat/
│       └── handler.go        # 채팅 핸들러
├── entrypoint.sh             # 컨테이너 시작 스크립트
└── Dockerfile
```

**볼륨**

| 볼륨 | 설명 |
|------|------|
| `.:/workspace` | 모노레포 전체 bind mount. Claude가 수정한 파일이 호스트에 즉시 반영 |
| `/var/run/docker.sock` | 호스트 Docker 소켓 (DOOD) |
| `claude-home:/home/coder` | Claude CLI 인증 정보, 설정 영속화 |

**환경변수**

| 변수 | 설명 |
|------|------|
| `CLAUDE_CODE_OAUTH_TOKEN` | Max/Team/Enterprise OAuth 토큰 |
| `DOCKER_GID` | 호스트 docker 그룹 GID |

**DOOD**

컨테이너 안에서 `docker compose` 명령을 실행하면 호스트 Docker가 동작합니다.

```bash
# Claude에게 이렇게 시키면 됩니다
"UI 재빌드해줘"
# → docker compose build ui && docker compose up -d --force-recreate ui
```

---

## caddy — 리버스 프록시

**구조**

```
services/caddy/
├── Caddyfile    # 라우팅 설정
└── Dockerfile
```

**기본 Caddyfile**

```
:80 {
    handle /claude/* {
        reverse_proxy claude:8081
    }
    handle {
        reverse_proxy ui:3000
    }
}
```

**포트**

| 환경 | 설정 | 접속 |
|------|------|------|
| HTTP (기본) | `"8080:80"` | `http://서버IP:8080` |
| HTTPS | `"80:80"`, `"443:443"` | `https://your-domain.com` |

HTTPS 적용 시 Caddyfile과 docker-compose.yml 수정 필요. 자세한 내용은 `deploy.md` 참고.
