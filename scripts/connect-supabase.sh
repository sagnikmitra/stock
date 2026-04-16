#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_EXAMPLE="${ROOT_DIR}/.env.example"
ENV_LOCAL="${ROOT_DIR}/.env.local"

if [[ ! -f "${ENV_EXAMPLE}" ]]; then
  echo "Missing .env.example at ${ENV_EXAMPLE}"
  exit 1
fi

if [[ -z "${SUPABASE_DATABASE_URL:-}" ]]; then
  echo "Missing SUPABASE_DATABASE_URL."
  echo "Use pooled Transaction URL from Supabase (recommended for app runtime)."
  exit 1
fi

if [[ -z "${SUPABASE_DIRECT_URL:-}" ]]; then
  echo "Missing SUPABASE_DIRECT_URL."
  echo "Use direct Session URL from Supabase (required for Prisma schema push)."
  exit 1
fi

if [[ ! -f "${ENV_LOCAL}" ]]; then
  cp "${ENV_EXAMPLE}" "${ENV_LOCAL}"
fi

set_env_value() {
  local key="$1"
  local value="$2"
  local file="$3"
  local escaped

  escaped="$(printf '%s' "${value}" | sed -e 's/[&|]/\\&/g')"

  if rg -q "^${key}=" "${file}"; then
    sed -i.bak "s|^${key}=.*$|${key}=${escaped}|" "${file}"
    rm -f "${file}.bak"
  else
    printf '\n%s=%s\n' "${key}" "${value}" >> "${file}"
  fi
}

set_env_value "DATABASE_URL" "${SUPABASE_DATABASE_URL}" "${ENV_LOCAL}"
set_env_value "DIRECT_URL" "${SUPABASE_DIRECT_URL}" "${ENV_LOCAL}"

if [[ -n "${SUPABASE_URL:-}" ]]; then
  set_env_value "NEXT_PUBLIC_SUPABASE_URL" "${SUPABASE_URL}" "${ENV_LOCAL}"
fi

if [[ -n "${SUPABASE_ANON_KEY:-}" ]]; then
  set_env_value "NEXT_PUBLIC_SUPABASE_ANON_KEY" "${SUPABASE_ANON_KEY}" "${ENV_LOCAL}"
fi

if [[ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  set_env_value "SUPABASE_SERVICE_ROLE_KEY" "${SUPABASE_SERVICE_ROLE_KEY}" "${ENV_LOCAL}"
fi

echo "Configured .env.local with Supabase connection values."
echo "Running Prisma generate, push, seed..."

cd "${ROOT_DIR}"
COREPACK_HOME=/tmp/corepack corepack pnpm db:generate
COREPACK_HOME=/tmp/corepack corepack pnpm db:push
COREPACK_HOME=/tmp/corepack corepack pnpm db:seed

echo "Supabase DB setup complete."
