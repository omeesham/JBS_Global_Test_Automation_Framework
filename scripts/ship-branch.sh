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
# 16 branches (each currently also carries the now-retired *_testrail.xlsx twin —
# DELETE it on the next refresh, LR-050):
#   notes            --modules=LOC.NTS  --surface='location-notes*'
#   ssl              --modules=LOC.SSL  --surface='location-shared-setup*'
#   legal            --modules=LOC.LGL  --surface='location-legal*'
#   account-address  --modules=LOC.ACC  --surface='location-account-address*'
#   corporate-pricing --modules=CPR     --surface='corporate-pricing/**'
#   nm2262           --modules=CPR.LEX  --surface='corporate-pricing-loc-export*'   (Loc Pricing Export)
#   nm2264           --modules=CPR.EXA  --surface='corporate-pricing-export-all*'   (Export All)
#   nm2305           --modules=CPR.LIM  --surface='corporate-pricing-loc-import*'   (Loc Pricing Import)
#   auto-addon             --modules=LOC.AAO  --surface='location-auto-addon*'
#   left-panel-basic-info  --modules=LOC.LP   --surface='location-left-panel-basic-information*'
#   locations              --modules=LOC.ACC,LOC.AAO,LOC.LP,LOC.LGL,LOC.NTS,LOC.SSL
#                          --surface='location-account-address*,location-auto-addon*,location-left-panel-basic-information*,location-legal*,location-notes*,location-shared-setup*'
#   nm2260           --modules=CPR.DET,CPR.SRC  --surface='corporate-pricing-detail*,corporate-pricing-search*'
#   nm2261           --modules=CPR.STR          --surface='corporate-pricing-strategy*'
#   nm2263           --modules=CPR.NPB          --surface='corporate-pricing-new-pricebook*'
#   nm2265           --modules=CPR.IMA          --surface='corporate-pricing-import-all*'   (Import All)
#   nm2267           --modules=CPR.OVR          --surface='corporate-pricing-override*'     (Product Group Override)
# The corporate-pricing collection preset (CPR) now = exactly the 8 delivered tickets — the toolbar_io
# submodule was dissolved 2026-07-09 (its unique cases folded into EXA/LIM/SRC).
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

BRANCH=""; MODULES=""; SURFACE=""; TCS=""; DO_PUSH=0; KEEP_SCRATCH=0
for arg in "$@"; do
  case "$arg" in
    --branch=*)       BRANCH="${arg#*=}" ;;
    --modules=*)      MODULES="${arg#*=}" ;;
    --surface=*)      SURFACE="${arg#*=}" ;;
    --tcs=*)          TCS="${arg#*=}" ;;
    --push)           DO_PUSH=1 ;;
    --keep-scratch)   KEEP_SCRATCH=1 ;;
    *) echo "[ship-branch] unknown arg: $arg" >&2; exit 2 ;;
  esac
done

# Presets for the 16 known branches (override with explicit --modules/--surface).
if [[ -z "$MODULES" || -z "$SURFACE" ]]; then
  case "$BRANCH" in
    notes)            MODULES="${MODULES:-LOC.NTS}"; SURFACE="${SURFACE:-location-notes*}" ;;
    ssl)              MODULES="${MODULES:-LOC.SSL}"; SURFACE="${SURFACE:-location-shared-setup*}" ;;
    legal)            MODULES="${MODULES:-LOC.LGL}"; SURFACE="${SURFACE:-location-legal*}" ;;
    account-address)  MODULES="${MODULES:-LOC.ACC}"; SURFACE="${SURFACE:-location-account-address*}" ;;
    corporate-pricing) MODULES="${MODULES:-CPR}";    SURFACE="${SURFACE:-corporate-pricing/**}" ;;
    nm2262)           MODULES="${MODULES:-CPR.LEX}"; SURFACE="${SURFACE:-corporate-pricing-loc-export*}" ;;
    nm2264)           MODULES="${MODULES:-CPR.EXA}"; SURFACE="${SURFACE:-corporate-pricing-export-all*}" ;;
    nm2305)           MODULES="${MODULES:-CPR.LIM}"; SURFACE="${SURFACE:-corporate-pricing-loc-import*}" ;;
    auto-addon)             MODULES="${MODULES:-LOC.AAO}"; SURFACE="${SURFACE:-location-auto-addon*}" ;;
    left-panel-basic-info)  MODULES="${MODULES:-LOC.LP}";  SURFACE="${SURFACE:-location-left-panel-basic-information*}" ;;
    locations)              MODULES="${MODULES:-LOC.ACC,LOC.AAO,LOC.LP,LOC.LGL,LOC.NTS,LOC.SSL}"; SURFACE="${SURFACE:-location-account-address*,location-auto-addon*,location-left-panel-basic-information*,location-legal*,location-notes*,location-shared-setup*}" ;;
    nm2260)                 MODULES="${MODULES:-CPR.DET,CPR.SRC}"; SURFACE="${SURFACE:-corporate-pricing-detail*,corporate-pricing-search*}" ;;
    nm2261)                 MODULES="${MODULES:-CPR.STR}"; SURFACE="${SURFACE:-corporate-pricing-strategy*}" ;;
    nm2263)                 MODULES="${MODULES:-CPR.NPB}"; SURFACE="${SURFACE:-corporate-pricing-new-pricebook*}" ;;
    nm2265)                 MODULES="${MODULES:-CPR.IMA}"; SURFACE="${SURFACE:-corporate-pricing-import-all*}" ;;
    nm2267)                 MODULES="${MODULES:-CPR.OVR}"; SURFACE="${SURFACE:-corporate-pricing-override*}" ;;
    nm2268|nm2269|nm2270)  MODULES="${MODULES:-CPR.OVR}"; SURFACE="${SURFACE:-corporate-pricing-override*}" ;;
    *) echo "[ship-branch] need --modules and --surface (no preset for branch '$BRANCH')" >&2; exit 2 ;;
  esac
fi
[[ -n "$BRANCH" ]] || { echo "[ship-branch] --branch is required" >&2; exit 2; }

echo "[ship-branch] branch=$BRANCH modules=$MODULES surface=$SURFACE tcs=${TCS:-<none>} push=$DO_PUSH"

# Guard: if --tcs is supplied, spec-trim.mjs must exist before any work begins.
# Shipping a TC-filtered workbook without matching spec trimming is a mismatched delivery.
if [[ -n "$TCS" ]]; then
  if [[ ! -f "$REPO_ROOT/scripts/spec-trim.mjs" ]]; then
    echo "[ship-branch] FATAL — --tcs='$TCS' requires scripts/spec-trim.mjs, which does not exist." >&2
    echo "[ship-branch] A workbook trimmed to '$TCS' without matching spec trimming is a mismatched delivery." >&2
    echo "[ship-branch] Build or obtain spec-trim.mjs (built in parallel by worker B1) before using --tcs." >&2
    exit 1
  fi
fi

SCRATCH="$(mktemp -d)"; VERIFY="$(mktemp -d)"
cleanup() { [[ "$KEEP_SCRATCH" -eq 1 ]] || rm -rf "$SCRATCH" "$VERIFY"; }
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

# 2b. Apply TC-level spec trimming when --tcs is supplied (runs on the surface-filtered
#     spec files). spec-trim.mjs existence is pre-checked above so this never silently skips.
# Each spec file is trimmed individually; any failure aborts before the workbook trim
# because a trimmed workbook beside an untrimmed spec is the worst artifact this pipeline
# can produce.
if [[ -n "$TCS" ]]; then
  while IFS= read -r -d '' specFile; do
    if ! node "$REPO_ROOT/scripts/spec-trim.mjs" "$specFile" --keep="$TCS"; then
      echo "[ship-branch] FATAL — spec-trim.mjs failed on: $specFile" >&2
      echo "[ship-branch] Refusing to continue to workbook trim — a trimmed workbook beside an untrimmed spec is a mismatched delivery." >&2
      exit 1
    fi
  done < <(find "$SCRATCH/tests" -name '*.spec.ts' -print0)

  # 2c. Source-level dead-code elimination (src-trim.mjs) — DISABLED 2026-07-20.
  #     General reachability-based pruning proved unreliable on this codebase (decorators,
  #     dynamic access, cross-file imports -> both false-positive removals that broke tsc and
  #     false-negative keeps). Owner decision: ship the src tree WHOLE. The client reviewer
  #     scrutinizes the workbook and spec runs, not un-called page-object helpers; the real
  #     tells (future-ticket test cases + ticket-named constants/comments) are already removed
  #     by spec-trim + xlsx-trim, and no NM-226x/NM-227x string survives the payload.
  #     Left in the tree (scripts/src-trim.mjs) but not invoked. Re-enable only if rebuilt on a
  #     proven tool (e.g. knip/ts-prune).
  :
fi

# 3. Trim the workbook to the module scope (registry-driven + Overview-row prune).
XLSX_TRIM_ARGS=( --modules="$MODULES" )
[[ -n "$TCS" ]] && XLSX_TRIM_ARGS+=( --tcs="$TCS" )
node "$REPO_ROOT/scripts/xlsx-trim.mjs" "$SCRATCH/test_cases_xlsx/encore_test_cases.xlsx" "${XLSX_TRIM_ARGS[@]}"

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
  [[ "$KEEP_SCRATCH" -eq 1 ]] && echo "[ship-branch] SCRATCH=$SCRATCH (--keep-scratch: not cleaning up)"
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
