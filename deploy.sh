#!/bin/bash
set -euo pipefail

# Deploy Fusion Kilmacolm to the existing Namecheap subdomain
# https://fusion-kilmacolm.yurshack.co.uk/
#
# Expects Cursor secrets (preferred):
#   YURSHACK_SSH_PRIVATE_KEY
#   YURSHACK_SSH_USER
#   YURSHACK_SSH_HOST   (optional; default premium139-4.web-hosting.com)
#   YURSHACK_SSH_PORT   (optional; default 21098)
#   REMOTE_DIR          (optional; default subdomains/fusion-kilmacolm)
#
# Plain SSH_* names are also accepted as fallbacks.

HOST="${YURSHACK_SSH_HOST:-${SSH_HOST:-premium139-4.web-hosting.com}}"
PORT="${YURSHACK_SSH_PORT:-${SSH_PORT:-21098}}"
USER_NAME="${YURSHACK_SSH_USER:-${SSH_USER:-}}"
PRIVATE_KEY="${YURSHACK_SSH_PRIVATE_KEY:-${SSH_PRIVATE_KEY:-}}"
REMOTE_DIR="${REMOTE_DIR:-subdomains/fusion-kilmacolm}"
ROOT="$(cd "$(dirname "$0")" && pwd)"

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes -p "$PORT")

cleanup() {
  if [[ -n "${KEY_FILE:-}" && -f "${KEY_FILE}" ]]; then
    rm -f "$KEY_FILE"
  fi
}
trap cleanup EXIT

if [[ -z "$USER_NAME" ]]; then
  echo "Missing YURSHACK_SSH_USER (cPanel username)." >&2
  exit 1
fi

if [[ -z "$PRIVATE_KEY" ]]; then
  echo "Missing YURSHACK_SSH_PRIVATE_KEY." >&2
  exit 1
fi

KEY_FILE="$(mktemp)"
printf '%s\n' "$PRIVATE_KEY" | sed 's/\r$//' | sed 's/\\n/\n/g' >"$KEY_FILE"
chmod 600 "$KEY_FILE"
SSH_OPTS+=(-i "$KEY_FILE")

TARGET="${USER_NAME}@${HOST}"
echo "Deploying $ROOT -> ${TARGET}:~/${REMOTE_DIR} (port ${PORT})"

ssh "${SSH_OPTS[@]}" "$TARGET" "mkdir -p '${REMOTE_DIR}'"

tar -C "$ROOT" \
  --exclude='.DS_Store' \
  --exclude='._*' \
  --exclude='.git' \
  --exclude='.github' \
  --exclude='deploy.sh' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='README.md' \
  --exclude='.nojekyll' \
  -czf - . \
  | ssh "${SSH_OPTS[@]}" "$TARGET" "tar -xzf - -C '${REMOTE_DIR}'"

echo "Done. Visit https://fusion-kilmacolm.yurshack.co.uk/"
