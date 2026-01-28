# Optimized Dockerfile for Next.js Frontend
# Uses node:20-alpine (smallest official Node image ~40MB)

FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables
# These MUST be passed via --build-arg during docker build
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Set them as env vars for the build
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NODE_ENV=production

# CRITICAL: Validate that all required env vars are set
# Build will FAIL if any are missing - this is intentional
RUN echo "=== Build-time Environment Variables ===" && \
    echo "NEXT_PUBLIC_API_BASE_URL: $NEXT_PUBLIC_API_BASE_URL" && \
    echo "NEXT_PUBLIC_SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL" && \
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..." && \
    echo "NODE_ENV: $NODE_ENV" && \
    echo "========================================" && \
    if [ -z "$NEXT_PUBLIC_API_BASE_URL" ]; then \
      echo "❌ ERROR: NEXT_PUBLIC_API_BASE_URL is not set!"; \
      echo "You must pass it via --build-arg during docker build"; \
      exit 1; \
    fi && \
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then \
      echo "❌ ERROR: NEXT_PUBLIC_SUPABASE_URL is not set!"; \
      exit 1; \
    fi && \
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then \
      echo "❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set!"; \
      exit 1; \
    fi

# Build Next.js app
RUN npm run build

# Post-build validation: scan for localhost leaks
RUN echo "=== Scanning build output for localhost leaks ===" && \
    if grep -r "localhost:8000" .next/static 2>/dev/null; then \
      echo "❌ ERROR: Found localhost:8000 in build output!"; \
      echo "This means env vars were not properly injected at build time."; \
      exit 1; \
    fi && \
    if grep -r "127.0.0.1:8000" .next/static 2>/dev/null; then \
      echo "❌ ERROR: Found 127.0.0.1:8000 in build output!"; \
      exit 1; \
    fi && \
    echo "✅ No localhost leaks detected in build output" && \
    echo "================================================"

# Production runtime stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Create non-root user (combined into one layer for efficiency)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
