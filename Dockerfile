# Multi-stage build for Next.js application
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build stage
FROM base AS builder
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build the Next.js application
COPY . .
RUN npm run build

# Runtime stage
FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000

# Copy installed dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Create non-root user for security
RUN addgroup --gid 1001 --system nodejs
RUN adduser --uid 1001 --system nextjs
USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
