# --- Stage 1: Install dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm i

# --- Stage 2: Build the app ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
RUN npm run build

# --- Stage 3: Production image ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Install dependencies required for Next.js and Cloudflared
# curl: to download cloudflared
# libc6-compat: required for both Next.js standalone and cloudflared on Alpine
RUN apk add --no-cache curl libc6-compat

# --- Install Cloudflared ---
RUN curl -L --output /usr/local/bin/cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 && \
    chmod +x /usr/local/bin/cloudflared

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# --- Create Entrypoint Script ---
# This script starts cloudflared in the background if the token exists, then starts the app
RUN echo "#!/bin/sh" > /app/entrypoint.sh && \
    echo "if [ -n \"\$CLOUDFLARE_TUNNEL_TOKEN\" ]; then" >> /app/entrypoint.sh && \
    echo "  echo 'Starting Cloudflare Tunnel...'" >> /app/entrypoint.sh && \
    echo "  /usr/local/bin/cloudflared tunnel --no-autoupdate run --token \$CLOUDFLARE_TUNNEL_TOKEN &" >> /app/entrypoint.sh && \
    echo "fi" >> /app/entrypoint.sh && \
    echo "echo 'Starting Next.js...'" >> /app/entrypoint.sh && \
    echo "exec node server.js" >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Use the custom entrypoint script
CMD ["/app/entrypoint.sh"]
