import {
  Cloud,
  Server,
  Shield,
  Terminal,
  Rocket,
  ArrowDown,
  Globe,
  Smartphone,
  Zap,
} from "lucide-react";

const CodeBlock = ({ children }: { children: string }) => (
  <code
    className="block rounded px-3 py-2 font-mono text-xs"
    style={{
      background: "var(--bg-base)",
      border: "1px solid var(--border-subtle)",
      color: "var(--accent-bright)",
    }}
  >
    {children}
  </code>
);

const Arrow = () => (
  <div className="flex justify-center">
    <ArrowDown className="h-4 w-4" style={{ color: "var(--text-dim)" }} />
  </div>
);

export default function DeployPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
          >
            <Cloud className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Oracle Cloud 배포
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Oracle Cloud Always Free 티어에서 무료로 운영할 수 있습니다.
          ARM 4코어 24GB 인스턴스를 평생 무료로 사용합니다.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {/* 1. Instance */}
        <div
          className="obsidian-card flex items-start gap-4"
          style={{ borderLeft: "2px solid var(--accent-blue)" }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--accent-blue-glow)", color: "var(--accent-blue)" }}
          >
            <Server className="h-[18px] w-[18px]" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              1. 인스턴스 생성
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Oracle Cloud 콘솔에서 Compute → Instance → Create Instance
            </p>
            <div className="space-y-1">
              {[
                "Shape: VM.Standard.A1.Flex (ARM)",
                "OCPU: 4, RAM: 24GB (무료 한도)",
                "OS: Ubuntu 22.04 또는 Oracle Linux",
                "Boot Volume: 200GB (무료 한도)",
                "SSH Key 등록 필수",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-xs" style={{ color: "var(--accent-blue)" }}>-</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Arrow />

        {/* 2. Firewall */}
        <div
          className="obsidian-card flex items-start gap-4"
          style={{ borderLeft: "2px solid var(--accent-amber)" }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--accent-amber-glow)", color: "var(--accent-amber)" }}
          >
            <Shield className="h-[18px] w-[18px]" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              2. 포트 개방
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              OCI 콘솔 → Networking → Virtual Cloud Networks → Security List에서
              80, 443 포트 인바운드 규칙을 추가합니다.
            </p>
            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              인스턴스 방화벽도 해제:
            </p>
            <CodeBlock>sudo iptables -F</CodeBlock>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              firewalld 사용 시:
            </p>
            <div className="space-y-1.5">
              <CodeBlock>sudo firewall-cmd --zone=public --add-port=80/tcp --permanent</CodeBlock>
              <CodeBlock>sudo firewall-cmd --zone=public --add-port=443/tcp --permanent</CodeBlock>
              <CodeBlock>sudo firewall-cmd --reload</CodeBlock>
            </div>
          </div>
        </div>

        <Arrow />

        {/* 3. Docker */}
        <div
          className="obsidian-card flex items-start gap-4"
          style={{ borderLeft: "2px solid var(--accent-purple)" }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(167, 139, 250, 0.12)", color: "var(--accent-purple)" }}
          >
            <Terminal className="h-[18px] w-[18px]" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              3. Docker 설치
            </p>
            <div className="space-y-1.5">
              <CodeBlock>curl -fsSL https://get.docker.com | sh</CodeBlock>
              <CodeBlock>sudo usermod -aG docker $USER</CodeBlock>
              <CodeBlock>newgrp docker</CodeBlock>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Docker Compose는 Docker Engine에 포함되어 있습니다.{" "}
              <code className="font-mono" style={{ color: "var(--accent-bright)" }}>docker compose version</code>으로 확인.
            </p>
          </div>
        </div>

        <Arrow />

        {/* 4. Clone */}
        <div
          className="obsidian-card flex items-start gap-4"
          style={{ borderLeft: "2px solid var(--accent)" }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
          >
            <Rocket className="h-[18px] w-[18px]" />
          </div>
          <div className="space-y-2 w-full">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              4. 저장소 클론
            </p>
            <div className="space-y-1.5">
              <CodeBlock>git clone https://github.com/k01057200432/vibe-coding.git</CodeBlock>
              <CodeBlock>cd vibe-coding</CodeBlock>
            </div>
          </div>
        </div>

        <Arrow />

        {/* 5. .env */}
        <div
          className="obsidian-card flex items-start gap-4"
          style={{ borderLeft: "2px solid var(--accent-purple)" }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(167, 139, 250, 0.12)", color: "var(--accent-purple)" }}
          >
            <Terminal className="h-[18px] w-[18px]" />
          </div>
          <div className="space-y-2 w-full">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              5. 환경변수 설정
            </p>
            <div className="space-y-1.5">
              <CodeBlock>cp .env.example .env && vi .env</CodeBlock>
            </div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              필수 설정 항목:
            </p>
            <div
              className="rounded-lg px-4 py-3 font-mono text-xs leading-relaxed"
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div><span style={{ color: "var(--text-muted)" }}># 앱 로그인 계정</span></div>
              <div><span style={{ color: "var(--text-muted)" }}>DEMO_USERNAME=</span><span style={{ color: "var(--text-primary)" }}>admin</span></div>
              <div><span style={{ color: "var(--text-muted)" }}>DEMO_PASSWORD=</span><span style={{ color: "var(--text-primary)" }}>your-password</span></div>
              <div className="mt-2"><span style={{ color: "var(--text-muted)" }}># Max/Team/Enterprise만 해당 (Pro는 구동 후 claude login)</span></div>
              <div><span style={{ color: "var(--text-muted)" }}>CLAUDE_CODE_OAUTH_TOKEN=</span><span style={{ color: "var(--accent-bright)" }}>sk-ant-oat01-...</span></div>
              <div className="mt-2"><span style={{ color: "var(--text-muted)" }}># Docker 소켓 접근용 GID</span></div>
              <div><span style={{ color: "var(--text-muted)" }}>DOCKER_GID=</span><span style={{ color: "var(--text-primary)" }}>$(getent group docker | cut -d: -f3)</span></div>
            </div>
            <div className="space-y-1">
              {[
                "CLAUDE_CODE_OAUTH_TOKEN: Max 이상 플랜만 필요. Pro 플랜은 구동 후 터미널에서 claude login 으로 인증합니다.",
                "DOCKER_GID: 서버에서 getent group docker | cut -d: -f3 으로 확인하세요.",
              ].map((note, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-xs" style={{ color: "var(--accent-purple)" }}>*</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Arrow />

        {/* 6. Run */}
        <div
          className="obsidian-card flex items-start gap-4"
          style={{ borderLeft: "2px solid var(--profit)" }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--profit-glow)", color: "var(--profit)" }}
          >
            <Rocket className="h-[18px] w-[18px]" />
          </div>
          <div className="space-y-2 w-full">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              6. 구동
            </p>
            <CodeBlock>docker compose up -d --build</CodeBlock>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              빌드 완료 후 <code className="font-mono" style={{ color: "var(--accent-bright)" }}>http://서버IP:8080</code> 으로 접속합니다.
            </p>
            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              Pro 플랜인 경우 구동 후 추가 단계:
            </p>
            <div className="space-y-1">
              {[
                "앱에 로그인 후 터미널 열기",
                "터미널에서 claude login 실행",
                "표시된 URL을 브라우저에서 열어 Claude Pro 계정으로 인증",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 font-mono text-xs font-bold" style={{ color: "var(--profit)" }}>{i + 1}.</span>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{step}</span>
                </div>
              ))}
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              도메인이 있으면 활용 방법의 &quot;HTTPS 적용&quot; 프롬프트를 참고하세요.
            </p>
          </div>
        </div>
      </div>

      {/* Domain & HTTPS */}
      <section className="space-y-3">
        <h2 className="section-header" style={{ fontSize: "0.6875rem" }}>
          도메인 등록 및 HTTPS
        </h2>
        <div className="space-y-2">

          {/* DNS */}
          <div
            className="obsidian-card flex items-start gap-4"
            style={{ borderLeft: "2px solid var(--accent-blue)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--accent-blue-glow)", color: "var(--accent-blue)" }}
            >
              <Globe className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2 w-full">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                DNS 설정
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                도메인 등록 업체(Cloudflare, Namecheap 등)에서 A 레코드를 서버 IP로 지정합니다.
              </p>
              <div
                className="rounded-lg px-4 py-3 font-mono text-xs leading-relaxed"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div><span style={{ color: "var(--text-muted)" }}>Type: </span><span style={{ color: "var(--text-primary)" }}>A</span></div>
                <div><span style={{ color: "var(--text-muted)" }}>Name: </span><span style={{ color: "var(--accent-bright)" }}>@</span><span style={{ color: "var(--text-muted)" }}> (또는 서브도메인)</span></div>
                <div><span style={{ color: "var(--text-muted)" }}>Value: </span><span style={{ color: "var(--accent-bright)" }}>서버 공인 IP</span></div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-4 w-4" style={{ color: "var(--text-dim)" }} />
          </div>

          {/* Caddy */}
          <div
            className="obsidian-card flex items-start gap-4"
            style={{ borderLeft: "2px solid var(--accent-amber)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--accent-amber-glow)", color: "var(--accent-amber)" }}
            >
              <Zap className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2 w-full">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Caddy 설치
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Caddy는 Let&apos;s Encrypt 인증서를 자동으로 발급·갱신합니다. 별도 Certbot 불필요.
              </p>
              <div className="space-y-1.5">
                <CodeBlock>sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl</CodeBlock>
                <CodeBlock>{`curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg`}</CodeBlock>
                <CodeBlock>{`curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list`}</CodeBlock>
                <CodeBlock>sudo apt update && sudo apt install caddy -y</CodeBlock>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-4 w-4" style={{ color: "var(--text-dim)" }} />
          </div>

          {/* Caddyfile */}
          <div
            className="obsidian-card flex items-start gap-4"
            style={{ borderLeft: "2px solid var(--accent-purple)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "rgba(167, 139, 250, 0.12)", color: "var(--accent-purple)" }}
            >
              <Server className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2 w-full">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Caddyfile 설정 (HTTPS 자동 + WebSocket)
              </p>
              <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                /etc/caddy/Caddyfile:
              </p>
              <div
                className="rounded-lg px-4 py-3 font-mono text-xs leading-relaxed whitespace-pre"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
              >{`your-domain.com {
    reverse_proxy localhost:8080
}`}</div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Caddy는 WebSocket을 자동으로 처리하며 443 포트 HTTPS와 80→443 리다이렉트를 모두 자동 설정합니다.
              </p>
              <div className="space-y-1.5">
                <CodeBlock>sudo systemctl reload caddy</CodeBlock>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-4 w-4" style={{ color: "var(--text-dim)" }} />
          </div>

          {/* PWA */}
          <div
            className="obsidian-card flex items-start gap-4"
            style={{ borderLeft: "2px solid var(--profit)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--profit-glow)", color: "var(--profit)" }}
            >
              <Smartphone className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2 w-full">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                PWA 사용 가능
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                HTTPS 도메인으로 접속하면 브라우저에서 앱 설치(PWA)가 가능합니다.
                PC와 모바일 홈 화면에 추가하여 네이티브 앱처럼 사용하세요.
              </p>
              <div className="space-y-1">
                {[
                  "Chrome/Edge: 주소창 오른쪽 설치 아이콘 클릭",
                  "Safari(iOS): 공유 버튼 → 홈 화면에 추가",
                  "HTTPS 없이는 PWA 설치 불가 (보안 정책)",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-xs font-bold" style={{ color: "var(--profit)" }}>+</span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
