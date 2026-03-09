# 빌드 방법

## 로컬 개발 환경

### 처음 실행

```bash
git clone https://github.com/k01057200432/vibe-coding.git
cd vibe-coding
cp .env.example .env
vi .env   # 환경변수 설정
docker compose up -d --build
```

접속: `http://localhost:8080`

---

## 재빌드

### UI만 재빌드 (가장 자주 사용)

UI 코드(`services/ui/`) 수정 후 반드시 재빌드해야 반영됩니다.

```bash
docker compose build ui && docker compose up -d --force-recreate ui
```

> Claude에게 "UI 재빌드해줘"라고 하면 알아서 실행합니다.

### claude 서비스 재빌드

Go 코드(`services/claude/`) 수정 시:

```bash
docker compose build claude && docker compose up -d --force-recreate claude
```

### 전체 재빌드

```bash
docker compose up -d --build
```

### Caddy만 재시작 (포트 충돌 시)

```bash
docker compose stop caddy && docker compose up -d caddy
```

---

## 주의사항

- UI는 **프로덕션 빌드** (`npm run build && npm start`)로 실행됩니다. dev server가 아니므로 코드 변경 후 재빌드 없이는 반영되지 않습니다.
- claude 서비스는 모노레포 전체(`.:/workspace`)가 bind mount되어 있어, Go 코드 외의 파일(UI 소스 등)은 재빌드 없이도 컨테이너에서 접근 가능합니다.

---

## 새 서비스 추가

1. `services/새서비스/` 디렉토리에 `Dockerfile` 작성
2. `docker-compose.yml`에 서비스 추가
3. 경로 라우팅이 필요하면 `services/caddy/Caddyfile` 수정
4. 단독 빌드 및 실행:
   ```bash
   docker compose up -d --build 새서비스
   ```

### 예시: Express.js API 서버 추가

```yaml
# docker-compose.yml에 추가
services:
  api:
    build:
      context: ./services/api
      dockerfile: Dockerfile
```

```
# services/caddy/Caddyfile에 추가
handle /api/* {
    reverse_proxy api:4000
}
```

---

## 환경변수 (.env)

```bash
DEMO_USERNAME=admin
DEMO_PASSWORD=changeme
CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-...   # Max/Team/Enterprise만 필요
DOCKER_GID=999                              # getent group docker | cut -d: -f3
```
