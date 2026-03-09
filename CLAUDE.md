# Vibe Coding — CLAUDE.md

브라우저에서 Claude와 대화하며 Next.js UI를 실시간으로 만드는 바이브 코딩 샌드박스.

---

## 프로젝트 구조

```
vibe-coding/
├── docker-compose.yml          # 세 서비스 정의 (caddy, ui, claude)
├── .env                        # 환경변수 (gitignored)
├── .env.example                # 환경변수 템플릿
├── services/
│   ├── ui/                     # Next.js 14 프론트엔드
│   ├── claude/                 # Go 백엔드 + Claude CLI (WebSocket 터미널)
│   └── caddy/                  # 리버스 프록시
└── docs/                       # 상세 문서
```

---

## 서비스

### ui — Next.js 프론트엔드

- 경로: `services/ui/`
- 내부 포트: 3000 (외부 직접 노출 없음)
- 빌드: `npm run build && npm start` (프로덕션 빌드, dev server 아님)
- 코드 수정 후 반드시 재빌드 필요

**주요 디렉토리**

| 경로 | 설명 |
|------|------|
| `app/` | Next.js App Router 페이지 |
| `components/layout/` | 레이아웃 컴포넌트 (nav-rail, app-shell, terminal-panel 등) |
| `components/ui/` | shadcn/ui 기반 공통 컴포넌트 |
| `lib/` | 유틸리티, Zustand 스토어 |

**페이지 목록**

| 경로 | 파일 | 설명 |
|------|------|------|
| `/` | `app/page.tsx` | 홈 |
| `/login` | `app/login/page.tsx` | 로그인 |
| `/pro` | `app/pro/page.tsx` | 인증 가이드 |
| `/guide` | `app/guide/page.tsx` | 사용법 |
| `/examples` | `app/examples/page.tsx` | 활용 방법 |
| `/deploy` | `app/deploy/page.tsx` | 배포 가이드 |

---

### claude — Go 백엔드

- 경로: `services/claude/`
- 내부 포트: 8081 (외부 직접 노출 없음)
- 언어: Go 1.26
- 기능: PTY 기반 Claude CLI 세션 관리, WebSocket 터미널, SQLite 세션 저장
- 볼륨:
  - `.:/workspace` — 모노레포 전체 bind mount (Claude가 파일을 직접 수정)
  - `/var/run/docker.sock` — 호스트 Docker 소켓 (DOOD)
  - `claude-home:/home/coder` — Claude CLI 인증 정보 영속화

**DOOD (Docker Outside of Docker)**

Claude 컨테이너가 호스트 `docker.sock`을 공유하므로, 컨테이너 안에서 `docker compose` 명령을 실행하면 호스트의 Docker가 동작합니다. Claude에게 재빌드를 시키면 알아서 처리합니다.

---

### caddy — 리버스 프록시

- 경로: `services/caddy/`
- 외부 포트: `8080:80` (기본값, HTTP)
- 라우팅 (`services/caddy/Caddyfile`):
  - `/claude/*` → `claude:8081`
  - 나머지 → `ui:3000`
- **⚠ 주의: Caddy 재시작 시 사용자 접속이 끊깁니다. 웬만해선 Caddy는 재시작하지 마세요.** 코드 수정 반영은 `ui` 또는 `claude` 컨테이너만 개별 재시작하면 됩니다.

---

## 환경변수 (.env)

```
DEMO_USERNAME=admin          # 앱 로그인 아이디
DEMO_PASSWORD=changeme       # 앱 로그인 비밀번호
CLAUDE_CODE_OAUTH_TOKEN=...  # Claude OAuth 토큰 (Max/Team/Enterprise만 필요)
DOCKER_GID=999               # 호스트 docker 그룹 GID
```

`DOCKER_GID` 확인 방법:
```bash
getent group docker | cut -d: -f3
```

---

## 빌드 방법

### UI만 재빌드 (코드 수정 후 가장 자주 사용)

```bash
docker compose build ui && docker compose up -d --force-recreate ui
```

### 전체 빌드 (처음 실행 또는 구조 변경 시)

```bash
docker compose up -d --build
```

### Caddy만 재시작 (포트 충돌 시)

```bash
docker compose stop caddy && docker compose up -d caddy
```

---

## 배포 방법 (Oracle Cloud Always Free)

자세한 내용: `docs/deploy.md`

**요약**

1. OCI 콘솔에서 VM.Standard.A1.Flex (ARM, 4코어 24GB) 인스턴스 생성
2. Security List에서 **8080** 포트 인바운드 추가 (HTTP 전용 운영 시)
3. 인스턴스에서 방화벽 허용:
   ```bash
   sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
   sudo netfilter-persistent save
   ```
4. Docker 설치:
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER && newgrp docker
   ```
5. 레포 클론 및 `.env` 설정:
   ```bash
   git clone https://github.com/k01057200432/vibe-coding.git
   cd vibe-coding && cp .env.example .env && vi .env
   ```
6. 실행:
   ```bash
   docker compose up -d --build
   ```
7. `http://서버IP:8080` 접속

---

## HTTPS 적용

1. OCI Security List에 **443** (접속), **80** (Let's Encrypt 인증서 발급) 추가
2. 인스턴스 방화벽에 80, 443 허용
3. `services/caddy/Caddyfile` 수정:
   ```
   your-domain.com {
       handle /claude/* {
           reverse_proxy claude:8081
       }
       handle {
           reverse_proxy ui:3000
       }
   }
   ```
4. `docker-compose.yml` caddy 포트 변경:
   ```yaml
   caddy:
     ports:
       - "80:80"
       - "443:443"
       - "443:443/udp"
     volumes:
       - caddy_data:/data
   ```
   > HTTPS 적용 시 8080은 사용하지 않습니다.
5. `docker compose up -d --build`로 재시작 → 인증서 자동 발급

---

## 새 서비스 추가 패턴

1. `services/새서비스/` 디렉토리에 `Dockerfile` 생성
2. `docker-compose.yml`에 서비스 추가
3. 경로 기반 라우팅이 필요하면 `services/caddy/Caddyfile`에 규칙 추가
4. 단독 빌드:
   ```bash
   docker compose up -d --build 새서비스
   ```

---

## Claude 인증

| 플랜 | 방법 |
|------|------|
| Max / Team / Enterprise | `.env`에 `CLAUDE_CODE_OAUTH_TOKEN` 설정 → 자동 인증 |
| Pro (월 $20) | 구동 후 내장 터미널에서 `claude login` 실행 |

자세한 내용: `docs/auth.md`
