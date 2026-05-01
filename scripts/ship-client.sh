#!/usr/bin/env bash
# Ship a client deliverable via git archive. The ONLY blessed way to ship.
# Usage:
#   npm run client:ship -- --client=encore --out=/tmp/encore-deliv
#   ./scripts/ship-client.sh --client=encore --out=/tmp/encore-deliv

set -euo pipefail

CLIENT=""; OUT=""; FORCE=0
for arg in "$@"; do
  case "$arg" in
    --client=*) CLIENT="${arg#*=}" ;;
    --out=*)    OUT="${arg#*=}" ;;
    --force)    FORCE=1 ;;
    *)          echo "Unknown arg: $arg" >&2; exit 2 ;;
  esac
done
[[ -z "$CLIENT" ]] && { echo "ERR: --client=<id> required" >&2; exit 2; }
[[ -z "$OUT" ]]    && { echo "ERR: --out=<path> required" >&2; exit 2; }

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Pre-flight: working tree must be clean (no uncommitted edits to clients/$CLIENT/ or src/ or pipeline/).
if [[ -n "$(git status --porcelain "clients/$CLIENT/" src/ pipeline/ 2>/dev/null || true)" ]] && [[ $FORCE -ne 1 ]]; then
  echo "ERR: working tree dirty in tracked paths. Commit or pass --force." >&2
  exit 3
fi

# Pre-flight: clients/$CLIENT must exist.
[[ ! -d "clients/$CLIENT" ]] && { echo "ERR: clients/$CLIENT not found" >&2; exit 4; }

# Pre-flight: vendored framework must be fresh.
node scripts/verify-vendor-fresh.mjs --client="$CLIENT"

# Pre-flight: deny-list grep against tracked files for this client.
node scripts/verify-no-forbidden.mjs --client="$CLIENT"

# Ship via git archive. --strip-components=2 removes the leading "clients/<id>/".
[[ -d "$OUT" ]] && rm -rf "$OUT"
mkdir -p "$OUT"
git archive HEAD "clients/$CLIENT/" | tar -x -C "$OUT" --strip-components=2

# Post-ship: deny-list grep against the actual output (defense in depth).
node scripts/verify-no-forbidden.mjs --target="$OUT"

# Post-ship: smoke (npx playwright test --list, no browser launch).
( cd "$OUT" && npm install --silent && npx playwright test --list >/dev/null )

echo "[OK] Shipped clients/$CLIENT/ -> $OUT via git archive"
