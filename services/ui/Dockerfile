### Build stage
FROM reg.int.gobau.dev/library/node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_CLAUDE_URL=https://trading.int.gobau.dev/claude/chat
ENV NEXT_PUBLIC_CLAUDE_URL=$NEXT_PUBLIC_CLAUDE_URL

RUN npm run build

### Runtime stage
FROM reg.int.gobau.dev/distroless/nodejs22-debian12

ENV TZ=Asia/Seoul
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public* ./public/

EXPOSE 3000

CMD ["server.js"]
