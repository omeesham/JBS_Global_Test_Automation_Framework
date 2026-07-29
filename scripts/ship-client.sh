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

# Pre-flight: capture deny-listed paths for exclusion at archive time (reporter, not gate).
EMIT_EXIT=0
EMIT_OUTPUT="$(node scripts/verify-no-forbidden.mjs --emit-exclusions="$CLIENT")" || EMIT_EXIT=$?
if [[ $EMIT_EXIT -ne 0 ]]; then
  echo "ERR: verify-no-forbidden.mjs --emit-exclusions=$CLIENT failed (exit $EMIT_EXIT) — aborting to prevent unstripped archive" >&2
  exit 9
fi
if [[ -n "$EMIT_OUTPUT" ]]; then
  mapfile -t EXCLUSIONS <<< "$EMIT_OUTPUT"
else
  EXCLUSIONS=()
fi

# Pre-flight: XLSX deliverable must exist and be fresh vs MD sources
# (PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION Phase B). Encore-only check until a
# second client onboards a workbook. Non-encore clients skip silently.
if [[ "$CLIENT" == "encore" ]]; then
  WORKBOOK_PATH="clients/encore/testcases/encore_test_cases.xlsx"
  if [[ ! -f "$WORKBOOK_PATH" ]]; then
    echo "ERR: $WORKBOOK_PATH missing. Run: npm run xlsx:build" >&2
    exit 6
  fi
  if ! npm run --silent xlsx:freshness 2>/dev/null; then
    echo "ERR: XLSX workbook is stale vs MD sources. Run: npm run xlsx:build" >&2
    exit 7
  fi
fi

# Stage into a temp dir; $OUT is populated only after the authoritative verify passes.
STAGING="$(mktemp -d)"
trap 'rm -rf "$STAGING"' EXIT

# Ship via git archive into staging, then strip deny-listed files so they never reach
# the authoritative gate or $OUT. Inline :(exclude) pathspecs work with git archive, but
# 453 of them (~27 KB on the command line) would approach the Windows command-line limit;
# --pathspec-from-file is not available in git 2.43.0.windows.1 to work around that.
# Staging-delete is the correct approach for this environment.
git archive HEAD "clients/$CLIENT/" | tar -x -C "$STAGING" --strip-components=2
for p in "${EXCLUSIONS[@]}"; do
  rel="${p#clients/$CLIENT/}"
  [[ -e "$STAGING/$rel" ]] && rm -rf "$STAGING/$rel"
done
# Prune empty directories left after file removal so they never appear in the payload.
find "$STAGING" -mindepth 1 -type d -empty -delete 2>/dev/null || true

# Authoritative gate: verify staged payload contains zero deny-listed files.
node scripts/verify-no-forbidden.mjs --target="$STAGING"

# $OUT safety: refuse unconditionally if $OUT is a git worktree (--force does NOT override).
if [[ -d "$OUT" ]] && git -C "$OUT" rev-parse --git-dir >/dev/null 2>&1; then
  echo "ERR: $OUT is a git worktree — refusing to overwrite. Pass a non-repo directory." >&2
  exit 1
fi
# Refuse non-empty $OUT without --force.
if [[ -d "$OUT" ]] && [[ -n "$(ls -A "$OUT" 2>/dev/null)" ]] && [[ $FORCE -ne 1 ]]; then
  echo "ERR: $OUT exists and is non-empty. Pass --force to overwrite." >&2
  exit 1
fi
[[ -d "$OUT" ]] && rm -rf "$OUT"
mkdir -p "$OUT"
(cd "$STAGING" && tar -cf - .) | (cd "$OUT" && tar -xf -)

# Post-ship: defense in depth — verify the final output contains zero deny-listed files
# (S0 gate per LR-069; placed before npm install to avoid scanning node_modules).
node scripts/verify-no-forbidden.mjs --target="$OUT"

# Post-ship: deliverable must NOT contain a GitHub workflow (client requirement —
# they explicitly do not want any .github workflows in the deliverable).
shopt -s nullglob; WF=( "$OUT"/.github/workflows/*.yml "$OUT"/.github/workflows/*.yaml ); shopt -u nullglob
[[ ${#WF[@]} -gt 0 ]] && { echo "ERR: $OUT contains a GitHub workflow (${WF[*]}). The client requires deliverables with NO .github workflows. Remove it from clients/$CLIENT/." >&2; exit 5; }

# Post-ship: smoke (npx playwright test --list, no browser launch). Remove runtime
# artifacts after smoke so the delivered directory stays a clean git-archive extract.
( cd "$OUT" && npm install --silent && npx playwright test --list >/dev/null )
rm -rf "$OUT/node_modules" "$OUT/reports" "$OUT/test-results"

# Post-ship: XLSX deliverable must be present in the archive
# (PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION Phase B). Encore-only check.
if [[ "$CLIENT" == "encore" ]]; then
  if [[ ! -f "$OUT/testcases/encore_test_cases.xlsx" ]]; then
    echo "ERR: $OUT/testcases/encore_test_cases.xlsx missing in shipped archive" >&2
    exit 8
  fi
fi

echo "[OK] Shipped clients/$CLIENT/ -> $OUT via git archive"
