# Vibe Coding

브라우저에서 Claude Code를 사용하여 UI를 실시간으로 만드는 셀프호스팅 플랫폼.

터미널에서 Claude에게 지시하면 Claude가 UI 소스를 직접 수정하고, 재빌드 후 반영됩니다.
터미널은 별도 컨테이너(iframe)이므로 UI가 깨져도 Claude로 복구할 수 있습니다.

## 아키텍처

```
┌─────────────────────────────────────────┐
│  Caddy (:8080)  — 리버스 프록시          │
│  /          → ui:3000  (Next.js)        │
│  /claude/*  → claude:8081  (Go + CLI)   │
└─────────────────────────────────────────┘

Claude 컨테이너가 모노레포 전체를 마운트 (.:/workspace)
→ services/ui/ 소스 수정 → UI 재빌드로 반영
```

## 사전 요구사항

- Docker & Docker Compose
- Claude Code OAuth 토큰

## Claude Code OAuth 토큰 발급

1. [claude.ai](https://claude.ai) 로그인
2. Claude Code CLI 설치 (로컬):
   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```
3. OAuth 토큰 생성:
   ```bash
   claude oauth create-token
   ```
   또는 Claude Max/Team/Enterprise 플랜의 OAuth 토큰을 사용합니다.
   토큰은 `sk-ant-oat01-...` 형식입니다.

## 설치 및 실행

```bash
# 1. 클론
git clone https://github.com/k01057200432/vibe-coding.git
cd vibe-coding

# 2. 환경변수 설정
cp .env.example .env
```

`.env` 파일을 편집합니다:

```env
DEMO_USERNAME=admin
DEMO_PASSWORD=your-password
CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-xxxxx
DOCKER_GID=999
```

`DOCKER_GID`는 호스트의 docker 그룹 ID입니다:

```bash
getent group docker | cut -d: -f3
```

```bash
# 3. 빌드 & 실행
docker compose up -d --build

# 4. 접속
# http://localhost:8080
```

## 환경변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `DEMO_USERNAME` | 로그인 아이디 | `demo` |
| `DEMO_PASSWORD` | 로그인 비밀번호 | `changeme` |
| `CLAUDE_CODE_OAUTH_TOKEN` | Claude Code OAuth 토큰 | (필수) |
| `DOCKER_GID` | 호스트 docker 그룹 ID (DOOD용) | `999` |

## 사용법

1. `http://localhost:8080` 접속
2. 설정한 아이디/비밀번호로 로그인
3. 하단 터미널 토글 → Claude 터미널 열기
4. Claude에게 지시: "버튼 추가해줘", "대시보드 만들어줘" 등
5. Claude가 `/workspace/services/ui/` 소스를 수정
6. UI 재빌드로 반영 (Claude가 DOOD로 직접 `docker compose` 실행 가능)

## UI 재빌드

Claude가 코드를 수정한 후 UI에 반영하려면 재빌드가 필요합니다.

```bash
# 호스트에서 직접
docker compose build ui && docker compose up -d --force-recreate ui

# 또는 Claude 터미널에서 (DOOD)
# Claude에게 "docker compose build ui && docker compose up -d --force-recreate ui 실행해줘"
```

## 프로젝트 구조

```
vibe-coding/
├── docker-compose.yml      # 서비스 정의
├── Caddyfile               # 리버스 프록시 설정
├── .env                    # 환경변수 (gitignored)
├── .env.example            # 환경변수 템플릿
└── services/
    ├── ui/                 # Next.js 앱
    │   ├── Dockerfile
    │   ├── app/            # 페이지 & API 라우트
    │   └── components/     # UI 컴포넌트
    └── claude/             # Claude 서버 (Go)
        ├── Dockerfile
        └── entrypoint.sh   # CLI 설치 & 토큰 등록
```

## 프로덕션 배포 (Caddy + HTTPS)

도메인이 있으면 `Caddyfile`을 수정하여 자동 SSL을 적용할 수 있습니다:

```
your-domain.com {
    reverse_proxy /claude/* claude:8081
    reverse_proxy ui:3000
}
```

`docker-compose.yml`에서 포트를 `80:80`과 `443:443`으로 변경합니다.
Caddy가 Let's Encrypt 인증서를 자동 발급합니다.
