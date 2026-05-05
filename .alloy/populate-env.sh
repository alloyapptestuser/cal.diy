#!/usr/bin/env bash
# Populate the repo-root .env file used by the Cal.diy dev runtime.
#
# Alloy invokes this before `docker compose up` so Prisma and NextAuth can
# boot inside the sandbox container. We seed from .env.example (which already
# points DATABASE_URL/DATABASE_DIRECT_URL at the postgres service exposed on
# localhost:5450) and inject deterministic dev secrets for NextAuth and the
# Cal.com encryption key.
#
# Idempotent: if .env already exists, leave it alone unless --force is passed.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"
ENV_EXAMPLE="$REPO_ROOT/.env.example"

force=0
if [[ "${1:-}" == "--force" ]]; then
  force=1
fi

if [[ -f "$ENV_FILE" && "$force" -eq 0 ]]; then
  echo ">>> $ENV_FILE already exists; skipping (pass --force to regenerate)"
  exit 0
fi

if [[ ! -f "$ENV_EXAMPLE" ]]; then
  echo "!!! $ENV_EXAMPLE not found; cannot populate .env" >&2
  exit 1
fi

# Stable dev-only secrets. These are NOT for production use and are scoped to
# the Alloy sandbox. CALENDSO_ENCRYPTION_KEY must be exactly 32 chars (AES256).
NEXTAUTH_SECRET="alloy-dev-nextauth-secret-do-not-use-in-prod"
CALENDSO_ENCRYPTION_KEY="alloy-dev-calcom-aes256-key-32ch"

if [[ "${#CALENDSO_ENCRYPTION_KEY}" -ne 32 ]]; then
  echo "!!! CALENDSO_ENCRYPTION_KEY must be 32 chars (got ${#CALENDSO_ENCRYPTION_KEY})" >&2
  exit 1
fi

cp "$ENV_EXAMPLE" "$ENV_FILE"

# Fill in the empty values that the example leaves blank.
sed -i "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET='${NEXTAUTH_SECRET}'|" "$ENV_FILE"
sed -i "s|^CALENDSO_ENCRYPTION_KEY=.*|CALENDSO_ENCRYPTION_KEY='${CALENDSO_ENCRYPTION_KEY}'|" "$ENV_FILE"

echo ">>> Wrote $ENV_FILE"
