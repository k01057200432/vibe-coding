FROM reg.int.gobau.dev/library/golang:1.26.0-bookworm AS builder
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=1 go build -o /app/claude-server .

FROM reg.int.gobau.dev/astral-sh/uv:latest AS uv

FROM reg.int.gobau.dev/library/debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates tzdata git curl bash sudo \
    tini nodejs npm \
    build-essential python3-dev \
    && rm -rf /var/lib/apt/lists/*

# kubectl (공식 바이너리 직접 다운로드 — apt repo 의존성 회피)
RUN curl -fsSL "https://dl.k8s.io/release/$(curl -fsSL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    -o /usr/local/bin/kubectl && chmod +x /usr/local/bin/kubectl

COPY --from=builder /app/claude-server /app/claude-server
COPY --from=builder /usr/local/go /usr/local/go
COPY --from=uv /uv /usr/local/bin/uv
COPY --from=uv /uvx /usr/local/bin/uvx
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# trading (admin): UID 1000, PVC 소유자
# trading-advisory: UID 1001, 제한된 advisory 세션용
RUN groupadd -g 1000 trading \
    && useradd -u 1000 -g trading -s /bin/bash -m trading \
    && groupadd -g 1001 trading-advisory \
    && useradd -u 1001 -g trading-advisory -s /bin/bash -m trading-advisory \
    && echo 'trading ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/trading

# Install Claude Code (trading 유저; advisory는 동일 바이너리 공유)
USER trading
RUN curl -fsSL https://claude.ai/install.sh | bash

ENV GOROOT=/usr/local/go
ENV GOPATH=/home/trading/go
ENV PATH="/home/trading/.local/bin:/usr/local/go/bin:/home/trading/go/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
ENV SHELL=/bin/bash
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

EXPOSE 8081
ENTRYPOINT ["/app/entrypoint.sh"]
