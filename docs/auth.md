# Claude 인증 가이드

## 플랜별 방법

| 플랜 | 방법 | 한도 |
|------|------|------|
| Max / Team / Enterprise | OAuth 토큰 → `.env` 설정 | 높은 사용 한도 |
| Pro (월 $20) | 구동 후 `claude login` | 메시지 한도 있음 |

---

## Max / Team / Enterprise

로컬 PC에서 토큰을 발급한 뒤 서버 `.env`에 붙여넣습니다.

**① 로컬에서 Claude CLI 설치**
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**② 토큰 발급**
```bash
claude setup-token
```

**③ 서버 `.env`에 설정**
```
CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-...
```

앱 시작 시 `entrypoint.sh`가 자동으로 `claude setup-token`을 실행하여 인증합니다. 별도 재로그인 불필요.

---

## Claude Pro (월 $20)

`.env`에 토큰 없이, 앱 실행 후 내장 터미널에서 로그인합니다.

**① 앱 실행 후 터미널 열기**
```bash
docker compose up -d --build
# → http://서버IP:8080 접속 후 터미널 버튼 클릭
```

**② 터미널에서 로그인**
```
claude login
```

브라우저 OAuth 인증 → Claude Pro 계정으로 로그인.

> 토큰 만료 시 동일하게 `claude login` 재실행.

---

## 인증 상태 확인

홈 화면에서 Claude 토큰 설정 여부를 자동으로 감지합니다.
미설정 시 안내 배너가 표시됩니다.

API로도 확인 가능:
```
GET /claude/api/auth-status
→ { "ok": true }
```
