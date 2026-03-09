# Vibe Coding

브라우저에서 Claude Code와 대화하며 Next.js UI를 실시간으로 만드는 셀프호스팅 바이브 코딩 샌드박스.

터미널에서 Claude에게 지시하면 Claude가 UI 소스를 직접 수정하고, 재빌드 후 반영됩니다.
터미널은 별도 컨테이너(iframe)이므로 UI가 깨져도 Claude로 복구할 수 있습니다.

---

## 아키텍처

```
┌────────────────────────────────────────────┐
│  Caddy (:8080)  — 리버스 프록시             │
│  /          →  ui:3000   (Next.js)         │
│  /claude/*  →  claude:8081  (Go + CLI)     │
└────────────────────────────────────────────┘

Claude 컨테이너 — .:/workspace bind mount
  → services/ui/ 소스를 직접 수정
  → docker.sock 공유(DOOD)로 재빌드까지 처리
```

---

## 설치 방법

### 1. 사전 요구사항

- Docker & Docker Compose
- Claude 계정 (Pro / Max / Team / Enterprise)

---

### 2. 클론

```bash
git clone https://github.com/k01057200432/vibe-coding.git
cd vibe-coding
cp .env.example .env
```

---

### 3. Claude 인증 설정

플랜에 따라 방식이 다릅니다.

#### Max / Team / Enterprise — OAuth 토큰 발급 후 .env 설정

로컬 PC에서 Claude CLI를 설치하고 토큰을 발급합니다.

```bash
# 로컬 PC에서
curl -fsSL https://claude.ai/install.sh | bash
claude setup-token
```

발급된 토큰을 `.env`에 설정합니다.

```env
CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-...
```

앱 시작 시 자동으로 인증됩니다. 재로그인 불필요.

#### Claude Pro (월 $20) — 앱 실행 후 터미널 로그인

`.env`에 토큰 설정 없이 아래 5번을 먼저 실행한 뒤, 내장 터미널에서:

```bash
claude login
```

브라우저 OAuth 인증 창이 열립니다. 메시지 한도가 있으며, 토큰 만료 시 동일하게 `claude login`을 재실행합니다.

---

### 4. 환경변수 설정

`.env` 파일을 편집합니다.

```env
DEMO_USERNAME=admin          # 앱 로그인 아이디
DEMO_PASSWORD=changeme       # 앱 로그인 비밀번호
CLAUDE_CODE_OAUTH_TOKEN=     # Max/Team/Enterprise만 필요, Pro는 비워둠
DOCKER_GID=999               # 호스트 docker 그룹 GID
```

`DOCKER_GID` 확인:

```bash
getent group docker | cut -d: -f3
```

---

### 5. 빌드 & 실행

```bash
docker compose up -d --build
```

`http://localhost:8080` 접속 → `.env`에 설정한 아이디/비밀번호로 로그인

---

## 사용법

1. 앱에 로그인
2. 하단 터미널 토글 버튼으로 Claude 터미널 열기 (또는 Ctrl + `)
3. Claude에게 자연어로 지시:
   - `"대시보드 페이지 만들어줘"`
   - `"사이드바에 설정 메뉴 추가해줘"`
   - `"버튼 색깔 파란색으로 바꿔줘"`
4. Claude가 `/workspace/services/ui/` 소스를 직접 수정
5. 재빌드 요청 (Claude에게 말하거나 직접 실행):

```bash
docker compose build ui && docker compose up -d --force-recreate ui
```

Claude가 DOOD로 컨테이너 안에서 호스트 Docker를 직접 제어하므로, Claude에게 재빌드도 시킬 수 있습니다.

---

## 프로젝트 구조

```
vibe-coding/
├── docker-compose.yml          # 서비스 정의 (caddy, ui, claude)
├── .env                        # 환경변수 (gitignored)
├── .env.example                # 환경변수 템플릿
└── services/
    ├── ui/                     # Next.js 14 프론트엔드
    │   ├── Dockerfile
    │   ├── app/                # 페이지 & API 라우트
    │   └── components/         # UI 컴포넌트
    ├── claude/                 # Go 백엔드 (PTY + WebSocket 터미널)
    │   ├── Dockerfile
    │   └── entrypoint.sh
    └── caddy/                  # 리버스 프록시
        └── Caddyfile
```

---

## UI 재빌드

코드 수정 후 화면에 반영하려면 재빌드가 필요합니다.

```bash
# UI만 재빌드 (빠름)
docker compose build ui && docker compose up -d --force-recreate ui

# 전체 재빌드
docker compose up -d --build
```

---

## Oracle Cloud 무료 배포

OCI VM.Standard.A1.Flex (ARM, 4코어 24GB) 인스턴스를 활용하면 무료로 서버를 운영할 수 있습니다.

1. OCI 콘솔에서 인스턴스 생성, Security List에서 **8080** 포트 인바운드 추가
2. 방화벽 허용:
   ```bash
   sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
   sudo netfilter-persistent save
   ```
3. Docker 설치 후 레포 클론 & `.env` 설정, `docker compose up -d --build`
4. `http://서버IP:8080` 접속

### HTTPS 적용 (도메인 있을 때)

`services/caddy/Caddyfile` 수정:

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

`docker-compose.yml` caddy 포트를 `80:80`, `443:443`으로 변경 후 재시작 → Let's Encrypt 인증서 자동 발급.

---

## PWA — 모바일에서 앱처럼 사용

HTTPS 도메인 설정 후 스마트폰 홈 화면에 설치하면 네이티브 앱처럼 전체 화면으로 실행됩니다.

| 플랫폼 | 방법 |
|--------|------|
| iPhone / iPad | Safari → 공유 버튼 → 홈 화면에 추가 |
| Android | Chrome → 메뉴(⋮) → 앱 설치 |
| PC (Chrome) | 주소창 우측 설치 아이콘 클릭 |

이동 중에도 Claude에게 기능 추가·수정을 지시할 수 있습니다.
