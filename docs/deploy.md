# 배포 가이드 — Oracle Cloud Always Free

## 인스턴스 생성

OCI 콘솔 → Compute → Instances → Create Instance

| 항목 | 값 |
|------|-----|
| Shape | VM.Standard.A1.Flex (ARM) |
| OCPU | 4 |
| RAM | 24GB |
| OS | Ubuntu 22.04 |
| Boot Volume | 200GB |
| SSH Key | 필수 등록 |

---

## HTTP 전용 (도메인 없이 IP로 접속)

### 1. 포트 개방

**OCI 콘솔** → Networking → Virtual Cloud Networks → Security List → Ingress Rules
- Protocol: TCP, Port: **8080**

**인스턴스 방화벽**:
```bash
sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
sudo netfilter-persistent save
```

### 2. Docker 설치

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker compose version  # 확인
```

### 3. 레포 클론 및 설정

```bash
git clone https://github.com/k01057200432/vibe-coding.git
cd vibe-coding
cp .env.example .env
vi .env
```

`.env` 필수 설정:
```
DEMO_USERNAME=admin
DEMO_PASSWORD=your-password
CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-...   # Max 이상만 필요
DOCKER_GID=999                              # 아래 명령으로 확인
```

DOCKER_GID 확인:
```bash
getent group docker | cut -d: -f3
```

### 4. 실행

```bash
docker compose up -d --build
```

접속: `http://서버IP:8080`

### 5. Claude Pro 플랜인 경우 추가 단계

1. 앱 로그인 후 터미널 열기
2. 터미널에서 실행:
   ```
   claude login
   ```
3. 표시된 URL을 브라우저에서 열어 Claude Pro 계정으로 인증

---

## HTTPS 적용 (도메인 있는 경우)

### 1. DNS 설정

도메인 업체(Cloudflare 등)에서 A 레코드 추가:
- Type: A
- Name: @ (또는 서브도메인)
- Value: 서버 공인 IP

### 2. 포트 개방

OCI Security List에 **443** 추가. 80은 Let's Encrypt 인증서 발급용.

```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

> HTTPS 적용 시 8080은 사용하지 않습니다.

### 3. Caddyfile 수정

`services/caddy/Caddyfile`:
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

### 4. docker-compose.yml caddy 포트 변경

```yaml
caddy:
  ports:
    - "80:80"
    - "443:443"
    - "443:443/udp"
  volumes:
    - caddy_data:/data

volumes:
  caddy_data:
  claude-home:
```

### 5. 재시작

```bash
docker compose up -d --build
```

Caddy가 Let's Encrypt 인증서를 자동 발급합니다. 별도 Certbot 불필요.

접속: `https://your-domain.com`

> Claude에게 "도메인 example.com으로 HTTPS 적용해줘"라고 하면 Caddyfile과 docker-compose.yml 수정부터 재빌드까지 알아서 합니다.

---

## 업데이트

```bash
git pull
docker compose up -d --build
```
