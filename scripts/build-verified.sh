#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

vinext="${SITES_PROJECT_ROOT}/node_modules/.bin/vinext"
if [[ ! -x "${vinext}" ]]; then
  vinext="./node_modules/.bin/vinext"
fi

if command -v timeout >/dev/null 2>&1; then
  echo "Running bounded vinext build..."
  timeout \
    --signal=TERM \
    --kill-after="${SITES_BUILD_KILL_AFTER:-10s}" \
    "${SITES_BUILD_TIMEOUT:-3m}" \
    "${vinext}" build
else
  echo "Running direct vinext build..."
  "${vinext}" build
fi

if [[ "${VERCEL:-}" != "1" ]] && [[ -f "${script_dir}/validate-artifact.sh" ]]; then
  "${script_dir}/validate-artifact.sh" || true
fi

