#!/bin/sh
set -e

echo "──────────────────────────────────────────"
echo "  StartupET — Container Startup"
echo "──────────────────────────────────────────"

# ── Wait for PostgreSQL to be ready ────────────────────────────
MAX_RETRIES=30
RETRY_INTERVAL=3
COUNT=0

echo "⏳ Waiting for database to be ready..."

until node -e "
  const { Client } = require('pg');
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  c.connect().then(() => { c.end(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  COUNT=$((COUNT + 1))
  if [ $COUNT -ge $MAX_RETRIES ]; then
    echo "❌ Database not available after $MAX_RETRIES retries. Exiting."
    exit 1
  fi
  echo "   Retry $COUNT/$MAX_RETRIES — waiting ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done

echo "✅ Database is ready!"

# ── Run Prisma schema push (idempotent) ─────────────────────────
echo "🔄 Applying database schema..."
node node_modules/prisma/build/index.js db push \
  --schema prisma/schema \
  --skip-generate \
  --accept-data-loss=false

echo "✅ Schema applied!"

# ── Start Next.js standalone server ────────────────────────────
echo "🚀 Starting StartupET application on port ${PORT:-3000}..."
exec node server.js
