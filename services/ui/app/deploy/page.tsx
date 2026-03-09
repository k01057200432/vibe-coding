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
  MessageSquare,
} from "lucide-react";

const CodeBlock = ({ children }: { children: string }) => (
  <code
    className="block overflow-x-auto rounded px-3 py-2 font-mono text-xs"
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
          className="obsidian-card flex items-start gap-3 md:gap-4"
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
          className="obsidian-card flex items-start gap-3 md:gap-4"
          style={{ borderLeft: "2px solid var(--accent-amber)" }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--accent-amber-glow)", color: "var(--accent-amber)" }}
          >
            <Shield className="h-[18px] w-[18px]" />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              2. 포트 개방
            </p>
            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              OCI 콘솔 → Networking → VCN → Security List → Ingress Rules 추가
            </p>

            {/* HTTP only */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                도메인 없이 IP로 접속하는 경우 (HTTP)
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Security List에 <strong>8080</strong> 추가 후 방화벽 허용:
              </p>
              <CodeBlock>sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT</CodeBlock>
              <CodeBlock>sudo netfilter-persistent save</CodeBlock>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                → <code className="font-mono" style={{ color: "var(--accent-bright)" }}>http://서버IP:8080</code> 으로 접속
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--border-subtle)" }} />

            {/* HTTPS */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                도메인 + HTTPS 적용하는 경우
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Security List에 <strong>443</strong> 추가 후 방화벽 허용.
                80은 Let&apos;s Encrypt 인증서 발급 시에만 필요합니다. 8080은 사용하지 않습니다.
              </p>
              <CodeBlock>sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT</CodeBlock>
              <CodeBlock>sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT</CodeBlock>
              <CodeBlock>sudo netfilter-persistent save</CodeBlock>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                → <code className="font-mono" style={{ color: "var(--accent-bright)" }}>https://your-domain.com</code> 으로 접속 (아래 HTTPS 섹션 참고)
              </p>
            </div>
          </div>
        </div>

        <Arrow />

        {/* 3. Docker */}
        <div
          className="obsidian-card flex items-start gap-3 md:gap-4"
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
          className="obsidian-card flex items-start gap-3 md:gap-4"
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
          className="obsidian-card flex items-start gap-3 md:gap-4"
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
          className="obsidian-card flex items-start gap-3 md:gap-4"
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
            className="obsidian-card flex items-start gap-3 md:gap-4"
            style={{ borderLeft: "2px solid var(--accent-blue)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--accent-blue-glow)", color: "var(--accent-blue)" }}
            >
              <Globe className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-3 w-full">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                1. DNS 설정
              </p>

              {/* OCI IP 확인 */}
              <div
                className="rounded px-3 py-2 text-xs"
                style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}
              >
                <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>OCI 공인 IP 확인:</span>
                <span style={{ color: "var(--text-muted)" }}> 콘솔 → Compute → Instances → 인스턴스 클릭 → </span>
                <span className="font-mono" style={{ color: "var(--accent-bright)" }}>Public IP address</span>
              </div>

              {/* 루트 vs 서브도메인 선택 */}
              <div className="space-y-2">
                {/* 루트 도메인 */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    루트 도메인 — <span className="font-mono font-normal" style={{ color: "var(--accent-bright)" }}>example.com</span>
                  </p>
                  <div
                    className="rounded-lg px-4 py-2.5 font-mono text-xs leading-relaxed"
                    style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}
                  >
                    <div><span style={{ color: "var(--text-muted)" }}>Type: </span><span style={{ color: "var(--text-primary)" }}>A</span></div>
                    <div><span style={{ color: "var(--text-muted)" }}>Name: </span><span style={{ color: "var(--accent-bright)" }}>@</span></div>
                    <div><span style={{ color: "var(--text-muted)" }}>Value: </span><span style={{ color: "var(--accent-bright)" }}>서버 공인 IP</span></div>
                  </div>
                </div>

                {/* 서브도메인 */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    서브도메인 — <span className="font-mono font-normal" style={{ color: "var(--accent-bright)" }}>vibe.example.com</span>
                  </p>
                  <div
                    className="rounded-lg px-4 py-2.5 font-mono text-xs leading-relaxed"
                    style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}
                  >
                    <div><span style={{ color: "var(--text-muted)" }}>Type: </span><span style={{ color: "var(--text-primary)" }}>A</span></div>
                    <div><span style={{ color: "var(--text-muted)" }}>Name: </span><span style={{ color: "var(--accent-bright)" }}>vibe</span><span style={{ color: "var(--text-muted)" }}> (원하는 이름)</span></div>
                    <div><span style={{ color: "var(--text-muted)" }}>Value: </span><span style={{ color: "var(--accent-bright)" }}>서버 공인 IP</span></div>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Caddyfile에도 동일한 서브도메인을 입력해야 합니다. (아래 3단계 참고)
                  </p>
                </div>
              </div>

              {/* DNS 서비스별 위치 */}
              <div className="space-y-1">
                <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>서비스별 DNS 관리 위치:</p>
                {[
                  ["Cloudflare", "도메인 선택 → DNS → Records → Add record"],
                  ["GoDaddy", "My Products → DNS → Add"],
                  ["가비아", "My가비아 → 도메인 관리 → DNS 정보 → 레코드 수정"],
                  ["후이즈", "도메인 관리 → 네임서버/DNS → DNS 레코드 관리"],
                ].map(([service, path], i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="shrink-0 font-mono text-xs font-semibold" style={{ color: "var(--accent-blue)", minWidth: "5rem" }}>{service}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{path}</span>
                  </div>
                ))}
              </div>

              {/* Cloudflare 프록시 주의 */}
              <div
                className="flex items-start gap-2 rounded px-2 py-1.5"
                style={{ background: "var(--accent-amber-glow)", border: "1px solid var(--accent-amber)" }}
              >
                <span className="text-xs font-bold shrink-0" style={{ color: "var(--accent-amber)" }}>주의</span>
                <p className="text-xs" style={{ color: "var(--accent-amber)" }}>
                  Cloudflare 사용 시 인증서 발급 중엔 Proxy를 <strong>DNS only (회색 구름)</strong>으로 설정하세요.
                  발급 완료 후 다시 Proxied(주황 구름)로 변경해도 됩니다.
                </p>
              </div>

              {/* 전파 확인 */}
              <div className="space-y-1">
                <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>DNS 전파 확인 (서버에서):</p>
                <CodeBlock>nslookup vibe.example.com</CodeBlock>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>서버 IP가 출력되면 전파 완료. 보통 수 분 ~ 최대 48시간 소요.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-4 w-4" style={{ color: "var(--text-dim)" }} />
          </div>

          {/* OCI 80/443 포트 추가 */}
          <div
            className="obsidian-card flex items-start gap-3 md:gap-4"
            style={{ borderLeft: "2px solid var(--accent-amber)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--accent-amber-glow)", color: "var(--accent-amber)" }}
            >
              <Shield className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2 w-full">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                2. 80 / 443 포트 추가 개방
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                OCI Security List에 80, 443 인바운드 규칙을 추가하고, 인스턴스 방화벽도 허용합니다.
              </p>
              <div className="space-y-1.5">
                <CodeBlock>sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT</CodeBlock>
                <CodeBlock>sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT</CodeBlock>
                <CodeBlock>sudo netfilter-persistent save</CodeBlock>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-4 w-4" style={{ color: "var(--text-dim)" }} />
          </div>

          {/* docker-compose & Caddyfile 수정 */}
          <div
            className="obsidian-card flex items-start gap-3 md:gap-4"
            style={{ borderLeft: "2px solid var(--accent-purple)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "rgba(167, 139, 250, 0.12)", color: "var(--accent-purple)" }}
            >
              <Zap className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2 w-full">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                3. Caddyfile + docker-compose.yml 수정
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Caddy는 이미 docker compose 안에 포함되어 있습니다.
                별도 설치 없이 파일 두 곳만 수정하면 Let&apos;s Encrypt 인증서가 자동 발급됩니다.
              </p>
              <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                services/caddy/Caddyfile:
              </p>
              <div
                className="rounded-lg px-4 py-3 font-mono text-xs leading-relaxed whitespace-pre overflow-x-auto"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
              >{`your-domain.com {
    handle /claude/* {
        reverse_proxy claude:8081
    }
    handle {
        reverse_proxy ui:3000
    }
}`}</div>
              <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                docker-compose.yml — caddy 포트 변경:
              </p>
              <div
                className="rounded-lg px-4 py-3 font-mono text-xs leading-relaxed whitespace-pre overflow-x-auto"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
              >{`caddy:
  ports:
    - "80:80"
    - "443:443"
    - "443:443/udp"
  volumes:
    - caddy_data:/data`}</div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                수정 후 <code className="font-mono" style={{ color: "var(--accent-bright)" }}>docker compose up -d --build</code> 로 재시작하면 인증서가 자동 발급됩니다.
              </p>
              <div
                className="flex items-start gap-2 rounded px-2 py-1.5"
                style={{ background: "var(--accent-glow)", border: "1px solid var(--accent)" }}
              >
                <span className="text-xs font-bold shrink-0" style={{ color: "var(--accent)" }}>TIP</span>
                <p className="text-xs" style={{ color: "var(--accent)" }}>
                  터미널에서 Claude에게 &quot;도메인 example.com으로 HTTPS 적용해줘&quot;라고 하면 파일 수정부터 재빌드까지 알아서 합니다.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-4 w-4" style={{ color: "var(--text-dim)" }} />
          </div>

          {/* PWA */}
          <div
            className="obsidian-card flex items-start gap-3 md:gap-4"
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

      {/* Wildcard Subdomain */}
      <section className="space-y-3">
        <h2 className="section-header" style={{ fontSize: "0.6875rem" }}>
          와일드카드 서브도메인 + Caddy 라우팅
        </h2>
        <div className="space-y-2">

          {/* 개요 */}
          <div
            className="obsidian-card flex items-start gap-3 md:gap-4"
            style={{ borderLeft: "2px solid var(--accent-purple)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "rgba(167, 139, 250, 0.12)", color: "var(--accent-purple)" }}
            >
              <Globe className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2 w-full">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                와일드카드란?
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                DNS에 <code className="font-mono" style={{ color: "var(--accent-bright)" }}>*.example.com</code> A 레코드를 등록하면,
                어떤 서브도메인을 쳐도 같은 서버 IP로 연결됩니다.
                Caddy에서 서브도메인별로 다른 서비스로 라우팅하면 서버 1대로 여러 앱을 운영할 수 있습니다.
              </p>
              <div className="space-y-1">
                {[
                  "vibe.example.com → 이 앱 (UI + Claude)",
                  "blog.example.com → 다른 서비스",
                  "api.example.com → 또 다른 서비스",
                  "새 서브도메인 추가 시 DNS 설정 없이 Caddyfile만 수정",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-xs font-bold" style={{ color: "var(--accent-purple)" }}>→</span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DNS 와일드카드 설정 */}
          <div
            className="obsidian-card flex items-start gap-3 md:gap-4"
            style={{ borderLeft: "2px solid var(--accent-blue)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--accent-blue-glow)", color: "var(--accent-blue)" }}
            >
              <Shield className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2 w-full">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                1. DNS — 와일드카드 A 레코드 등록
              </p>
              <div
                className="rounded-lg px-4 py-2.5 font-mono text-xs leading-relaxed"
                style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}
              >
                <div><span style={{ color: "var(--text-muted)" }}>Type: </span><span style={{ color: "var(--text-primary)" }}>A</span></div>
                <div><span style={{ color: "var(--text-muted)" }}>Name: </span><span style={{ color: "var(--accent-bright)" }}>*</span></div>
                <div><span style={{ color: "var(--text-muted)" }}>Value: </span><span style={{ color: "var(--accent-bright)" }}>서버 공인 IP</span></div>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                루트 도메인(<code className="font-mono">@</code>)과 함께 등록하면
                <code className="font-mono" style={{ color: "var(--accent-bright)" }}> example.com</code>과
                <code className="font-mono" style={{ color: "var(--accent-bright)" }}> *.example.com</code> 모두 커버됩니다.
              </p>
            </div>
          </div>

          {/* Caddyfile 방법 A — 단순 분리 */}
          <div
            className="obsidian-card flex items-start gap-3 md:gap-4"
            style={{ borderLeft: "2px solid var(--accent)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
            >
              <Zap className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2 w-full">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  2-A. Caddyfile — 서브도메인별 사이트 블록 (권장)
                </p>
                <span
                  className="rounded px-1.5 py-0.5 text-xs font-semibold"
                  style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
                >
                  간단
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                서브도메인마다 사이트 블록을 따로 작성합니다. 각각 Let&apos;s Encrypt 인증서가 자동 발급됩니다.
              </p>
              <div
                className="rounded-lg px-4 py-3 font-mono text-xs leading-relaxed whitespace-pre overflow-x-auto"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
              >{`# 이 앱
vibe.example.com {
    handle /claude/* {
        reverse_proxy claude:8081
    }
    handle {
        reverse_proxy ui:3000
    }
}

# 다른 서비스
blog.example.com {
    reverse_proxy localhost:4000
}

api.example.com {
    reverse_proxy localhost:5000
}`}</div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                새 서브도메인 추가 시 블록 하나만 붙이고 <code className="font-mono" style={{ color: "var(--accent-bright)" }}>docker compose restart caddy</code>
              </p>
            </div>
          </div>

          {/* Caddyfile 방법 B — 와일드카드 인증서 */}
          <div
            className="obsidian-card flex items-start gap-3 md:gap-4"
            style={{ borderLeft: "2px solid var(--accent-amber)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--accent-amber-glow)", color: "var(--accent-amber)" }}
            >
              <Zap className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2 w-full">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  2-B. Caddyfile — 와일드카드 인증서 + SNI 라우팅 (고급)
                </p>
                <span
                  className="rounded px-1.5 py-0.5 text-xs font-semibold"
                  style={{ background: "var(--accent-amber-glow)", color: "var(--accent-amber)" }}
                >
                  Cloudflare 필요
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                <code className="font-mono" style={{ color: "var(--accent-bright)" }}>*.example.com</code> 와일드카드 인증서 하나로 모든 서브도메인을 커버합니다.
                단, 와일드카드 HTTPS 인증서는 DNS-01 챌린지가 필요해 Cloudflare DNS + API 토큰이 있어야 합니다.
              </p>
              <div
                className="rounded-lg px-4 py-3 font-mono text-xs leading-relaxed whitespace-pre overflow-x-auto"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
              >{`{
    acme_dns cloudflare {env.CF_API_TOKEN}
}

*.example.com, example.com {
    tls {
        dns cloudflare {env.CF_API_TOKEN}
    }

    @vibe host vibe.example.com
    handle @vibe {
        handle /claude/* {
            reverse_proxy claude:8081
        }
        handle {
            reverse_proxy ui:3000
        }
    }

    @blog host blog.example.com
    handle @blog {
        reverse_proxy localhost:4000
    }

    handle {
        abort
    }
}`}</div>
              <div className="space-y-1">
                {[
                  "Cloudflare DNS 관리 → API Tokens → Edit zone DNS 권한으로 토큰 발급",
                  ".env에 CF_API_TOKEN=... 추가",
                  "docker-compose.yml caddy 서비스에 environment: - CF_API_TOKEN=${CF_API_TOKEN} 추가",
                  "Caddy 이미지를 cloudflare 플러그인 포함 버전으로 교체 필요 (caddy:2-cloudflare)",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 font-mono text-xs font-bold" style={{ color: "var(--accent-amber)" }}>{i + 1}.</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{step}</span>
                  </div>
                ))}
              </div>
              <div
                className="flex items-start gap-2 rounded px-2 py-1.5"
                style={{ background: "var(--accent-glow)", border: "1px solid var(--accent)" }}
              >
                <span className="text-xs font-bold shrink-0" style={{ color: "var(--accent)" }}>TIP</span>
                <p className="text-xs" style={{ color: "var(--accent)" }}>
                  복잡하면 Claude에게 &quot;Cloudflare API 토큰으로 *.example.com 와일드카드 HTTPS 설정해줘&quot;라고 하면 됩니다.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Prompt Examples */}
      <section className="space-y-3">
        <h2 className="section-header" style={{ fontSize: "0.6875rem" }}>
          Claude에게 바로 시키기
        </h2>
        <div
          className="obsidian-card flex items-start gap-3 md:gap-4"
          style={{ borderLeft: "2px solid var(--accent)" }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
          >
            <MessageSquare className="h-[18px] w-[18px]" />
          </div>
          <div className="space-y-3 w-full">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              배포 관련 설정을 터미널에서 Claude에게 직접 요청할 수 있습니다.
              파일 수정, 재빌드, 재시작까지 알아서 처리합니다.
            </p>
            <div className="space-y-2">
              {[
                {
                  label: "도메인 + HTTPS 적용",
                  prompt: "vibe.example.com 도메인으로 HTTPS 적용해줘",
                },
                {
                  label: "서브도메인 변경",
                  prompt: "Caddyfile에서 도메인을 app.example.com으로 바꾸고 재빌드해줘",
                },
                {
                  label: "Cloudflare Tunnel 설정",
                  prompt: "cloudflared 설치하고 vibe.example.com으로 터널 설정해줘",
                },
                {
                  label: "포트 변경",
                  prompt: "외부 접속 포트를 8080에서 9000으로 바꿔줘",
                },
                {
                  label: "전체 재빌드",
                  prompt: "docker compose up -d --build로 전체 재빌드해줘",
                },
              ].map(({ label, prompt }, i) => (
                <div key={i} className="space-y-0.5">
                  <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{label}</p>
                  <div
                    className="rounded px-3 py-2 font-mono text-xs"
                    style={{
                      background: "var(--bg-base)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--accent-bright)",
                    }}
                  >
                    &quot;{prompt}&quot;
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 서브도메인 등록 방법 */}
      <section className="space-y-3">
        <h2 className="section-header" style={{ fontSize: "0.6875rem" }}>
          서브도메인 등록 방법
        </h2>
        <div className="space-y-2">

          {/* 무료 — DuckDNS */}
          <div
            className="obsidian-card flex items-start gap-3 md:gap-4"
            style={{ borderLeft: "2px solid var(--profit)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--profit-glow)", color: "var(--profit)" }}
            >
              <Globe className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2 w-full">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>무료 — DuckDNS</p>
                <span
                  className="rounded px-1.5 py-0.5 text-xs font-semibold"
                  style={{ background: "var(--profit-glow)", color: "var(--profit)" }}
                >
                  도메인 구매 불필요
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                <code className="font-mono" style={{ color: "var(--accent-bright)" }}>yourname.duckdns.org</code> 형태의 서브도메인을 무료로 사용합니다.
                GitHub 계정으로 로그인 후 즉시 발급됩니다.
              </p>
              <div className="space-y-1">
                {[
                  "duckdns.org 접속 → GitHub/Google 로그인",
                  "원하는 이름 입력 후 add domain",
                  "current ip에 OCI 공인 IP 입력 후 update ip",
                  "Caddyfile에 yourname.duckdns.org 입력",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 font-mono text-xs font-bold" style={{ color: "var(--profit)" }}>{i + 1}.</span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 유료 도메인 구매 후 서브도메인 */}
          <div
            className="obsidian-card flex items-start gap-3 md:gap-4"
            style={{ borderLeft: "2px solid var(--accent-blue)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--accent-blue-glow)", color: "var(--accent-blue)" }}
            >
              <Globe className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2 w-full">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>유료 도메인 구매 후 서브도메인 분리</p>
                <span
                  className="rounded px-1.5 py-0.5 text-xs font-semibold"
                  style={{ background: "var(--accent-blue-glow)", color: "var(--accent-blue)" }}
                >
                  연 $1~10
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                도메인을 하나 구매하면 서브도메인은 무제한 무료입니다.
                <code className="font-mono" style={{ color: "var(--accent-bright)" }}> vibe.example.com</code>,
                <code className="font-mono" style={{ color: "var(--accent-bright)" }}> dev.example.com</code> 등 원하는 만큼 분리 운영 가능합니다.
              </p>
              <div className="space-y-1">
                {[
                  ["Cloudflare Registrar", "최저가, DNS 관리 통합, 국내외 인기"],
                  ["Namecheap", "저렴한 첫해 프로모션 多"],
                  ["가비아 / 후이즈", "국내 결제 편리, 한국어 지원"],
                ].map(([name, desc], i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="shrink-0 font-mono text-xs font-semibold" style={{ color: "var(--accent-blue)", minWidth: "8rem" }}>{name}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                구매 후 도메인 DNS 관리 페이지에서 A 레코드 추가 → 위 DNS 설정 참고
              </p>
            </div>
          </div>

          {/* Caddyfile 반영 */}
          <div
            className="obsidian-card flex items-start gap-3 md:gap-4"
            style={{ borderLeft: "2px solid var(--accent-purple)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "rgba(167, 139, 250, 0.12)", color: "var(--accent-purple)" }}
            >
              <Zap className="h-[18px] w-[18px]" />
            </div>
            <div className="space-y-2 w-full">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Caddyfile에 서브도메인 반영
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                등록한 서브도메인을 <code className="font-mono" style={{ color: "var(--accent-bright)" }}>services/caddy/Caddyfile</code>에 입력합니다.
              </p>
              <div
                className="rounded-lg px-4 py-3 font-mono text-xs leading-relaxed whitespace-pre overflow-x-auto"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
              >{`yourname.duckdns.org {
    handle /claude/* {
        reverse_proxy claude:8081
    }
    handle {
        reverse_proxy ui:3000
    }
}`}</div>
              <div
                className="flex items-start gap-2 rounded px-2 py-1.5"
                style={{ background: "var(--accent-glow)", border: "1px solid var(--accent)" }}
              >
                <span className="text-xs font-bold shrink-0" style={{ color: "var(--accent)" }}>TIP</span>
                <p className="text-xs" style={{ color: "var(--accent)" }}>
                  터미널에서 &quot;yourname.duckdns.org로 HTTPS 적용해줘&quot;라고 하면 Caddyfile 수정 + 재빌드까지 알아서 합니다.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
