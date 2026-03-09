# 외부 설정 가이드

## 모노레포 구조

```
monorepo/
├── docker-compose.yml
├── Caddyfile
├── .env
├── SETUP.md
└── services/
    ├── ui/          # Next.js 앱
    │   ├── Dockerfile
    │   ├── app/         ← named volume으로 claude와 공유
    │   └── components/  ← named volume으로 claude와 공유
    └── claude/      # claude-server (Go 바이너리)
        └── Dockerfile
```

---

## 1. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일:

```env
DEMO_USERNAME=admin
DEMO_PASSWORD=비밀번호
CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-...
DOCKER_GID=999   # 아래 명령어로 확인
```

DOCKER_GID 확인:
```bash
getent group docker | cut -d: -f3
```

---

## 2. docker-compose.yml

```yaml
services:
  caddy:
    image: caddy:latest
    ports:
      - "8080:80"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
    depends_on:
      - ui
      - claude

  ui:
    build:
      context: ./services/ui
      dockerfile: Dockerfile
    command: sh -c "npm run build && npm start"
    environment:
      - DEMO_USERNAME=${DEMO_USERNAME}
      - DEMO_PASSWORD=${DEMO_PASSWORD}
      - NEXT_PUBLIC_CLAUDE_URL=/claude
    volumes:
      - ui-source:/app/app
      - ui-components:/app/components

  claude:
    build:
      context: ./services/claude
      dockerfile: Dockerfile
    environment:
      - CLAUDE_CODE_OAUTH_TOKEN=${CLAUDE_CODE_OAUTH_TOKEN}
    volumes:
      - ui-source:/workspace/app
      - ui-components:/workspace/components
      - claude-home:/home/coder
      - /var/run/docker.sock:/var/run/docker.sock  # DOOD
    group_add:
      - "${DOCKER_GID:-999}"

volumes:
  ui-source:
  ui-components:
  claude-home:
```

---

## 3. DOOD 설정 (컨테이너 안에서 docker 명령 사용)

`services/claude/Dockerfile`에 docker CLI 추가:

```dockerfile
# Alpine 기반
RUN apk add --no-cache docker-cli

# Debian/Ubuntu 기반
RUN apt-get update && apt-get install -y docker-ce-cli
```

---

## 4. 첫 실행

```bash
docker compose build
docker compose up -d
```

---

## 5. UI 재빌드 (코드 수정 후)

### 방법 A — 호스트에서 직접
```bash
docker compose build ui
docker compose up -d --force-recreate ui
```

### 방법 B — 컨테이너 안에서 (DOOD 설정 후)
터미널에서 Claude에게:
```
docker compose build ui && docker compose up -d --force-recreate ui 실행해줘
```

---

## 6. Caddyfile (HTTPS + 리버스 프록시)

```
your-domain.com {
    reverse_proxy ui:3000
}

# 서브도메인 추가 시
blog.your-domain.com {
    reverse_proxy blog:3001
}
```

자동 Let's Encrypt SSL 발급됩니다. 별도 설정 불필요.

---

## 7. 서비스 재시작

```bash
# 전체 재시작
docker compose restart

# UI만 재시작 (코드 변경 없이 프로세스 재시작)
docker compose restart ui

# UI 재빌드 + 재시작 (코드 변경 후)
docker compose build ui && docker compose up -d --force-recreate ui

# 전체 내리고 다시 올리기
docker compose down && docker compose up -d
```

---

## 8. Oracle Cloud 무료 티어 배포

1. **인스턴스 생성** — Ampere A1 (ARM, 4코어 24GB 무료)
2. **포트 개방** — Security List에서 80, 443 인바운드 허용
3. **firewall 해제**
   ```bash
   sudo iptables -F
   # 또는
   sudo firewall-cmd --zone=public --add-port=80/tcp --permanent
   sudo firewall-cmd --zone=public --add-port=443/tcp --permanent
   sudo firewall-cmd --reload
   ```
4. **Docker 설치**
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   newgrp docker
   ```
5. **레포 클론 후 실행**
   ```bash
   git clone <repo>
   cd <repo>
   cp .env.example .env && vi .env
   docker compose up -d
   ```
