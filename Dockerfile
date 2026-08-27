# Stage 1: Base image
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm

# Stage 2: Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
# Standard pnpm install
RUN pnpm install --no-frozen-lockfile

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client
RUN npx prisma generate --schema prisma/schema
# Build Next.js (Standard mode)
ENV NEXT_TELEMETRY_DISABLED 1
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN pnpm run build

# Stage 4: Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy build artifacts and dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Sync DB schema and start Next.js
CMD npx prisma db push --schema prisma/schema --accept-data-loss && pnpm run start
