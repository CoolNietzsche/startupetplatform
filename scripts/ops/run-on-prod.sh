#!/usr/bin/env bash
# Runs one of the scripts/ops/*.mjs scripts against the production database,
# inside the production app container (so it has @prisma/client, bcryptjs,
# etc. already installed and can reach the DB via the "db" service name).
#
# Usage:
#   ./scripts/ops/run-on-prod.sh <script-name> [args...]
#
# Examples:
#   ./scripts/ops/run-on-prod.sh list-users.mjs
#   ./scripts/ops/run-on-prod.sh list-users.mjs SUPER_ADMIN
#   ./scripts/ops/run-on-prod.sh find-user.mjs someone@example.com
#   ./scripts/ops/run-on-prod.sh create-user.mjs new@startupethiopia.et 'Pass@word1' ADMIN Jane Doe
#
# Auth: plain interactive `ssh`/`scp` by default (you'll get the normal
# password prompt). To run non-interactively, export NSLP_PROD_SSH_PASS in
# your own shell/session before calling this script - it is never read from
# or written to any file here, so it's safe to commit this script to git.

set -euo pipefail

HOST="administrator@196.189.50.63"
REMOTE_DIR="/home/administrator/nslp-production"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SCRIPT_NAME="${1:?Usage: run-on-prod.sh <script-name> [args...]}"
shift

SCRIPT_PATH="$SCRIPT_DIR/$SCRIPT_NAME"
if [[ ! -f "$SCRIPT_PATH" ]]; then
  echo "No such script: $SCRIPT_PATH" >&2
  echo "Available scripts:" >&2
  ls "$SCRIPT_DIR"/*.mjs >&2
  exit 1
fi

if [[ -n "${NSLP_PROD_SSH_PASS:-}" ]] && command -v sshpass >/dev/null 2>&1; then
  SSH=(sshpass -p "$NSLP_PROD_SSH_PASS" ssh -o StrictHostKeyChecking=no)
  SCP=(sshpass -p "$NSLP_PROD_SSH_PASS" scp -o StrictHostKeyChecking=no)
else
  SSH=(ssh)
  SCP=(scp)
fi

"${SCP[@]}" "$SCRIPT_DIR/_db.mjs" "$SCRIPT_PATH" "$HOST:$REMOTE_DIR/"

# Safely quote remaining args for the remote shell.
ARGS=""
for a in "$@"; do
  printf -v q '%q' "$a"
  ARGS="$ARGS $q"
done

"${SSH[@]}" "$HOST" "cd $REMOTE_DIR && \
  docker compose cp _db.mjs app:/app/_db.mjs && \
  docker compose cp $SCRIPT_NAME app:/app/$SCRIPT_NAME && \
  (docker compose exec -T app node $SCRIPT_NAME$ARGS; status=\$?; \
   docker compose exec -T app rm -f /app/$SCRIPT_NAME /app/_db.mjs; \
   rm -f $SCRIPT_NAME _db.mjs; \
   exit \$status)"
