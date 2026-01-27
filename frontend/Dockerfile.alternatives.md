# Docker Image Alternatives for Next.js Frontend

## Current: node:20-alpine (~40-50 MB) ✅ RECOMMENDED
**Your current choice is already optimal!**

## Alternative 1: Google Distroless (~50-60 MB)
Ultra-minimal, security-focused image with no shell or package manager.

```dockerfile
# Build stage with Node Alpine
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
RUN npm run build

# Runtime with Distroless
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["server.js"]
```

**Pros:** Most secure, smallest attack surface
**Cons:** No shell for debugging, harder to troubleshoot

## Alternative 2: Chainguard (~30-40 MB)
Even smaller than Alpine, but may have compatibility issues.

```dockerfile
FROM cgr.dev/chainguard/node:latest AS base
# ... rest similar to Alpine version
```

**Pros:** Smallest size
**Cons:** May have compatibility issues with some npm packages

## Alternative 3: Optimized Alpine (RECOMMENDED)
Same base but with optimizations:

```dockerfile
# Use Node.js 20 Alpine (smallest official image)
FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# Runtime stage - minimal
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create user in one RUN command (reduces layers)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what's needed
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
```

## Size Comparison

| Image | Compressed Size | Uncompressed Size | Security | Compatibility |
|-------|----------------|-------------------|----------|---------------|
| node:20-alpine | ~40 MB | ~120 MB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| distroless | ~50 MB | ~150 MB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| chainguard | ~30 MB | ~100 MB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| node:20-slim | ~70 MB | ~200 MB | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| node:20 | ~350 MB | ~1 GB | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## Recommendation

**Stick with `node:20-alpine`** - it's the best balance of:
- ✅ Small size (~40 MB)
- ✅ Official Node.js image
- ✅ Great compatibility
- ✅ Easy to debug (has shell)
- ✅ Well-maintained

## Additional Optimizations (Without Changing Base Image)

1. **Use .dockerignore** to exclude unnecessary files:
```
node_modules
.next
.git
*.md
.env*
.vscode
.idea
```

2. **Enable Next.js standalone output** in `next.config.js`:
```javascript
module.config = {
  output: 'standalone',
}
```

3. **Multi-stage build** (already doing this ✅)

4. **Combine RUN commands** to reduce layers (see Alternative 3)

## Final Verdict

Your current Dockerfile is already excellent! The only minor improvement would be Alternative 3 (Optimized Alpine) which combines some RUN commands to reduce layers slightly.
