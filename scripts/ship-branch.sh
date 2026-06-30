#!/usr/bin/env bash
#
# ship-branch.sh — per-module branch ship to the encore mock
# (RutviK-JBS/encore_deliverables_test). INTERNAL tooling — NEVER ships, NEVER wired
# into client:ship / xlsx:build / hooks / CI. ON-DEMAND ONLY: run by hand when the
# user explicitly says "ship module-wise" (PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT
# §Per-module branch ship constraint; navigation.md row 70).
#
# Persists the per-branch flow that previously lived ONLY in a 2026-06-10 ship
# session transcript (lost). The deliverable is a git-archive extract — never `cp -r`
# (LR-049). The push is HARD-GATED on the deny-list (scripts/verify-no-forbidden.mjs)
# run against a CLEAN re-extract of the FINAL trimmed content, never the scratch dir
# itself (feedback_gate_push_on_denylist + LR-049 scratch-init caveat: the repo
# core.hooksPath is NOT inherited in a fresh `git init`, so this manual gate is the
# only net).
#
# DEFAULT = DRY-RUN (build + trim + deny-list verify, NO push). Pass --push to push.
#
# 5 branches (each currently also carries the now-retired *_testrail.xlsx twin —
# DELETE it on the next refresh, LR-050):
#   notes            --modules=LOC.NTS  --surface='location-notes*'
#   ssl              --modules=LOC.SSL  --surface='location-shared-setup*'
#   legal            --modules=LOC.LGL  --surface='location-legal*'
#   account-address  --modules=LOC.ACC  --surface='location-account-address*'
#   corporate-pricing --modules=CPR     --surface='corporate-pricing/**'
#
# Usage:
#   bash scripts/ship-branch.sh --branch=notes                 # preset, dry-run
#   bash scripts/ship-branch.sh --branch=notes --push          # preset, actually push
#   bash scripts/ship-branch.sh --branch=X --modules=LOC.NTS --surface='location-notes*' [--push]
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REMOTE_NAME="encore-mock"
REMOTE_URL="https://github.com/RutviK-JBS/encore_deliverables_test.git"

BRANCH=""; MODULES=""; SURFACE=""; DO_PUSH=0
for arg in "$@"; do
  case "$arg" in
    --branch=*)  BRANCH="${arg#*=}" ;;
    --modules=*) MODULES="${arg#*=}" ;;
    --surface=*) SURFACE="${arg#*=}" ;;
    --push)      DO_PUSH=1 ;;
    *) echo "[ship-branch] unknown arg: $arg" >&2; exit 2 ;;
  esac
done

# Presets for the 5 known branches (override with explicit --modules/--surface).
if [[ -z "$MODULES" || -z "$SURFACE" ]]; then
  case "$BRANCH" in
    notes)            MODULES="${MODULES:-LOC.NTS}"; SURFACE="${SURFACE:-location-notes*}" ;;
    ssl)              MODULES="${MODULES:-LOC.SSL}"; SURFACE="${SURFACE:-location-shared-setup*}" ;;
    legal)            MODULES="${MODULES:-LOC.LGL}"; SURFACE="${SURFACE:-location-legal*}" ;;
    account-address)  MODULES="${MODULES:-LOC.ACC}"; SURFACE="${SURFACE:-location-account-address*}" ;;
    corporate-pricing) MODULES="${MODULES:-CPR}";    SURFACE="${SURFACE:-corporate-pricing/**}" ;;
    *) echo "[ship-branch] need --modules and --surface (no preset for branch '$BRANCH')" >&2; exit 2 ;;
  esac
fi
[[ -n "$BRANCH" ]] || { echo "[ship-branch] --branch is required" >&2; exit 2; }

echo "[ship-branch] branch=$BRANCH modules=$MODULES surface=$SURFACE push=$DO_PUSH"

SCRATCH="$(mktemp -d)"; VERIFY="$(mktemp -d)"
cleanup() { rm -rf "$SCRATCH" "$VERIFY"; }
trap cleanup EXIT

# 1. git-archive extract of the client (tracked files only — gitignored agent
#    artifacts are structurally excluded, LR-049 layer 1).
git -C "$REPO_ROOT" archive HEAD clients/encore/ | tar -x -C "$SCRATCH" --strip-components=2

# 1b. Remove paths that must never ship even when force-tracked in git (e.g. internal
#     docs/ or specs_planning/ files that were added via git add -f during migrations).
#     Mirrors the DENY_GLOBS in scripts/lib/forbidden-patterns.mjs.
rm -rf "$SCRATCH/docs" "$SCRATCH/specs_planning" "$SCRATCH/readable_externals" \
       "$SCRATCH/.github" "$SCRATCH/.auth" "$SCRATCH/.claude" "$SCRATCH/CLAUDE.md"

# 2. Trim tests/ to the module's surface + auth.setup.ts. auth.setup.ts is not a
#    *.spec.ts so the find below never touches it (kept automatically). SURFACE may
#    be a comma-separated list of globs (mirrors --modules comma syntax); each spec
#    is kept if its path relative to tests/ matches ANY listed glob, both directly
#    ($s) and one level down (*/$s). A single glob (legacy usage) is a list of one.
if [[ -d "$SCRATCH/tests" ]]; then
  IFS=',' read -ra SURFACE_LIST <<< "$SURFACE"
  find "$SCRATCH/tests" -type f -name '*.spec.ts' -print0 \
    | while IFS= read -r -d '' f; do
        rel="${f#$SCRATCH/tests/}"
        keep=0
        for s in "${SURFACE_LIST[@]}"; do
          case "$rel" in
            $s|*/$s) keep=1; break ;;
          esac
        done
        [[ "$keep" -eq 1 ]] || rm -f "$f"
      done
  # prune now-empty dirs left behind
  find "$SCRATCH/tests" -type d -empty -delete 2>/dev/null || true
fi

# 3. Trim the workbook to the module scope (registry-driven + Overview-row prune).
node "$REPO_ROOT/scripts/xlsx-trim.mjs" "$SCRATCH/test_cases_xlsx/encore_test_cases.xlsx" --modules="$MODULES"

# 4. Throwaway git repo with EXPLICIT identity (never inherited in a temp dir).
git -C "$SCRATCH" init -q
git -C "$SCRATCH" config user.email "deliverable@jade-biz.com"
git -C "$SCRATCH" config user.name "Encore Deliverable"
git -C "$SCRATCH" config commit.gpgsign false
git -C "$SCRATCH" add -A
git -C "$SCRATCH" commit -q -m "Encore deliverable — $BRANCH module"

# 5. CLEAN re-extract of the FINAL trimmed content (no node_modules/.git false-positives).
git -C "$SCRATCH" archive HEAD | tar -x -C "$VERIFY"

# 6. HARD deny-list gate — push is conditional on exit 0 (echo-and-continue already
#    leaked once; feedback_gate_push_on_denylist).
if ! node "$REPO_ROOT/scripts/verify-no-forbidden.mjs" --target="$VERIFY"; then
  echo "[ship-branch] DENY-LIST FAILED on the trimmed extract — refusing to push." >&2
  exit 1
fi
echo "[ship-branch] deny-list clean on $VERIFY"

# 7. Push (only with --push AND a clean gate). force-with-lease against the live tip.
if [[ "$DO_PUSH" -ne 1 ]]; then
  echo "[ship-branch] DRY-RUN complete (build + trim + deny-list verify). Re-run with --push to ship."
  exit 0
fi

git -C "$SCRATCH" remote add "$REMOTE_NAME" "$REMOTE_URL"
git -C "$SCRATCH" fetch -q "$REMOTE_NAME" "$BRANCH" || true
LIVE_TIP="$(git -C "$SCRATCH" rev-parse --verify --quiet "$REMOTE_NAME/$BRANCH" 2>/dev/null || true)"
if [[ -n "$LIVE_TIP" ]]; then
  git -C "$SCRATCH" push --force-with-lease="refs/heads/$BRANCH:$LIVE_TIP" "$REMOTE_NAME" "HEAD:refs/heads/$BRANCH"
else
  echo "[ship-branch] no live tip for $BRANCH — first push (no lease)."
  git -C "$SCRATCH" push "$REMOTE_NAME" "HEAD:refs/heads/$BRANCH"
fi
echo "[ship-branch] pushed $BRANCH."
