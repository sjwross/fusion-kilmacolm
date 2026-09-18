#!/bin/bash
set -euo pipefail

# Deploy Fusion Kilmacolm to the existing Namecheap subdomain
# https://fusion-kilmacolm.yurshack.co.uk/
#
# Document root (cPanel subdomain on premium139-4.web-hosting.com):
#   typically ~/public_html/fusion-kilmacolm  (override with REMOTE_DIR)
#
# Usage:
#   ./deploy.sh
#   SSH_USER=myuser SSH_HOST=premium139-4.web-hosting.com ./deploy.sh
#
# Auth: set SSH_PRIVATE_KEY (PEM) in the environment, or use your local ssh-agent/key.

HOST="${SSH_HOST:-premium139-4.web-hosting.com}"
PORT="${SSH_PORT:-21098}"
USER_NAME="${SSH_USER:-}"
REMOTE_DIR="${REMOTE_DIR:-public_html/fusion-kilmacolm}"
ROOT="$(cd "$(dirname "$0")" && pwd)"

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes -p "$PORT")

cleanup() {
  if [[ -n "${KEY_FILE:-}" && -f "${KEY_FILE}" ]]; then
    rm -f "$KEY_FILE"
  fi
}
trap cleanup EXIT

if [[ -n "${SSH_PRIVATE_KEY:-}" ]]; then
  KEY_FILE="$(mktemp)"
  # Support keys pasted with literal \n sequences
  printf '%s\n' "$SSH_PRIVATE_KEY" | sed 's/\r$//' | sed 's/\\n/\n/g' >"$KEY_FILE"
  chmod 600 "$KEY_FILE"
  SSH_OPTS+=(-i "$KEY_FILE")
fi

if [[ -z "$USER_NAME" ]]; then
  echo "Set SSH_USER to your Namecheap/cPanel username." >&2
  exit 1
fi

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
