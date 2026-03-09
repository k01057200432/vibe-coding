FROM golang:1.26-bookworm AS builder
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=1 go build -o /app/claude-server .

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates tzdata git curl bash sudo \
    tini nodejs npm \
    build-essential python3-dev \
    docker.io \
    && curl -fsSL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
       -o /usr/local/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose \
    && ln -s /usr/local/bin/docker-compose /usr/local/bin/docker-compose-v2 \
    && mkdir -p /usr/local/lib/docker/cli-plugins \
    && ln -s /usr/local/bin/docker-compose /usr/local/lib/docker/cli-plugins/docker-compose \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/claude-server /app/claude-server
COPY --from=builder /usr/local/go /usr/local/go
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

RUN groupadd -g 1000 coder \
    && useradd -u 1000 -g coder -s /bin/bash -m coder \
    && echo 'coder ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/coder

USER coder
RUN curl -fsSL https://claude.ai/install.sh | bash

ENV GOROOT=/usr/local/go
ENV GOPATH=/home/coder/go
ENV PATH="/home/coder/.local/bin:/usr/local/go/bin:/home/coder/go/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
ENV SHELL=/bin/bash
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

EXPOSE 8081
ENTRYPOINT ["/app/entrypoint.sh"]
