# Vibe Coding

Claude Code 터미널 샌드박스. 브라우저에서 바이브 코딩 — UI가 실시간으로 바뀜.

## 구조

```
┌──┬──────────────────────────┐
│  │                          │
│네│   UI 자체가 실시간 변경    │
│비│   (Next.js hot reload)   │
│  │                          │
│  ├──────────────────────────┤
│  │ 터미널 (iframe)           │
│  │ ← claude:8081 (불사)     │
└──┴──────────────────────────┘
```

Claude가 UI 소스 코드를 직접 수정 → Next.js dev server가 감지 → 핫 리로드.
터미널은 Claude 컨테이너의 iframe이라 UI가 터져도 살아있음 → Claude로 복구 가능.

## Quick Start

```bash
# 1. 환경변수 설정
cp .env.example .env
# .env 파일을 편집하여 CLAUDE_CODE_OAUTH_TOKEN 설정

# 2. 실행
docker compose up --build

# 3. 접속
# http://localhost:8080
# 로그인: demo / changeme
```

## 환경변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `DEMO_USERNAME` | 로그인 아이디 | `demo` |
| `DEMO_PASSWORD` | 로그인 비밀번호 | `changeme` |
| `CLAUDE_CODE_OAUTH_TOKEN` | Claude Code OAuth 토큰 | (필수) |

## 워크플로우

1. `localhost:8080` 접속 → 소개 페이지
2. 로그인 → 메인 화면
3. 터미널 토글 → Claude 터미널 올라옴
4. Claude에게 "버튼 추가해줘", "차트 만들어줘" 등 지시
5. Claude가 UI 소스 수정 → Next.js 핫 리로드 → 화면이 바로 바뀜

## 서비스

| 서비스 | 기술 | 역할 |
|--------|------|------|
| `ui` | Next.js (dev mode) | 소개/로그인 페이지 + 실시간 UI |
| `claude` | Go + Claude Code CLI | 터미널 WebSocket + 세션 관리 |
| `caddy` | Caddy | 리버스 프록시 (`/` → ui, `/claude/*` → claude) |
