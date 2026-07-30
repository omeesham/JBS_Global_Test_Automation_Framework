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
# 22 branches (each currently also carries the now-retired *_testrail.xlsx twin —
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
#   nm2267           --modules=CPR.OVR,COR.CORE --surface='corporate-pricing-override-nav*,corporate-override-core*'  (Override nav + core)
#   nm2268           --modules=COR.N268         --surface='corporate-override-nm2268*'      (Override — location picker)
#   nm2269           --modules=COR.N269         --surface='corporate-override-nm2269*'      (Override — active/currency filters)
#   nm2270           --modules=COR.N270         --surface='corporate-override-nm2270*'      (Override — text filter & sort)
#   nm2271           --modules=COR.N271         --surface='corporate-override-nm2271*'      (Override — labor tab & FCC)
#   nm2272           --modules=COR.N272         --surface='corporate-override-nm2272*'      (Override — export)
#   nm2273           --modules=COR.N273         --surface='corporate-override-nm2273*'      (Override — import)
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
    nm2267)                MODULES="${MODULES:-CPR.OVR,COR.CORE}"; SURFACE="${SURFACE:-corporate-pricing-override-nav*,corporate-override-core*}" ;;
    nm2268)                MODULES="${MODULES:-COR.N268}"; SURFACE="${SURFACE:-corporate-override-nm2268*}" ;;
    nm2269)                MODULES="${MODULES:-COR.N269}"; SURFACE="${SURFACE:-corporate-override-nm2269*}" ;;
    nm2270)                MODULES="${MODULES:-COR.N270}"; SURFACE="${SURFACE:-corporate-override-nm2270*}" ;;
    nm2271)                MODULES="${MODULES:-COR.N271}"; SURFACE="${SURFACE:-corporate-override-nm2271*}" ;;
    nm2272)                MODULES="${MODULES:-COR.N272}"; SURFACE="${SURFACE:-corporate-override-nm2272*}" ;;
    nm2273)                MODULES="${MODULES:-COR.N273}"; SURFACE="${SURFACE:-corporate-override-nm2273*}" ;;
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

# Working-tree integrity snapshot — assert at exit that the source tree under
# clients/ is unchanged. A structural guarantee: no path-resolution bug or future
# code change can silently corrupt tracked files during a build/trim run.
_WTC_SNAPSHOT="$(git -C "$REPO_ROOT" status --porcelain -- clients/ 2>/dev/null || true)"

SCRATCH="$(mktemp -d)"; VERIFY="$(mktemp -d)"
cleanup() {
  local rc=$?
  local _wt_after
  _wt_after="$(git -C "$REPO_ROOT" status --porcelain -- clients/ 2>/dev/null || true)"
  if [[ "$_wt_after" != "$_WTC_SNAPSHOT" ]]; then
    echo "[ship-branch] SAFETY VIOLATION — source tree under clients/ was modified during this run!" >&2
    echo "[ship-branch] A write escaped the scratch directory. Diff:" >&2
    diff <(echo "$_WTC_SNAPSHOT") <(echo "$_wt_after") >&2 || true
    rc=99
  fi
  [[ "$KEEP_SCRATCH" -eq 1 ]] || rm -rf "$SCRATCH" "$VERIFY"
  return "$rc"
}
trap cleanup EXIT

# 1. git-archive extract of the client (tracked files only — gitignored agent
#    artifacts are structurally excluded, LR-049 layer 1).
git -C "$REPO_ROOT" archive HEAD clients/encore/ | tar -x -C "$SCRATCH" --strip-components=2

# 1b. Remove paths that must never ship even when force-tracked in git (e.g. internal
#     docs/ or specs_planning/ files that were added via git add -f during migrations).
#     Derived from DENY_GLOBS via --emit-exclusions (scripts/verify-no-forbidden.mjs)
#     so this list cannot drift from the deny-list and is never hand-written here.
#     NOTE: DENY_GLOBS is defined in scripts/lib/forbidden-patterns.mjs (the single
#     source of truth shared with the write-time jargon hook); update it there.
#     .env.local and all other denied files are covered automatically — no coincidental
#     dependency on the shipped .gitignore to filter credentials.
#     NOTE: --emit-exclusions emits repo-relative paths (clients/encore/foo); the
#     archive at line 137 used --strip-components=2, so paths inside $SCRATCH are
#     client-relative (foo). Strip the prefix before removing.
while IFS= read -r repo_rel; do
  client_rel="${repo_rel#clients/encore/}"
  rm -f "$SCRATCH/$client_rel" 2>/dev/null || true
done < <(node "$REPO_ROOT/scripts/verify-no-forbidden.mjs" --emit-exclusions=encore)
# Prune directories that became empty after stripping denied files.
find "$SCRATCH" -mindepth 1 -type d -empty -delete 2>/dev/null || true

# 1c. Supply a blank starter environment file.
#     Step 1b removes the internal .env.local (credentials must never ship).
#     This step places a blank replacement so the customer receives the file
#     the setup instructions reference. A content check later in the pipeline
#     confirms the replacement is the blank starter, not a credentials file.
_ENV_TEMPLATE="$REPO_ROOT/scripts/deliverable/env-local.template"
if [[ ! -f "$_ENV_TEMPLATE" ]]; then
  echo "[ship-branch] FATAL: blank starter environment file missing at scripts/deliverable/env-local.template — payload cannot be assembled." >&2
  exit 1
fi
cp "$_ENV_TEMPLATE" "$SCRATCH/.env.local"
echo "[ship-branch] blank starter environment file added to payload."

# Parse surface into an array — used by the spec filter (step 2).
IFS=',' read -ra SURFACE_LIST <<< "$SURFACE"

# 2. Trim tests/ to the module's surface + auth.setup.ts. auth.setup.ts is not a
#    *.spec.ts so the find below never touches it (kept automatically). SURFACE may
#    be a comma-separated list of globs (mirrors --modules comma syntax); each spec
#    is kept if its path relative to tests/ matches ANY listed glob, both directly
#    ($s) and one level down (*/$s). A single glob (legacy usage) is a list of one.
if [[ -d "$SCRATCH/tests" ]]; then
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

# 2d. Filter per-module split workbooks in testcases/ subdirectories by module code
#     (registry-driven). Root-level files (the consolidated workbook and QA tracker)
#     are untouched — xlsx-trim handles the consolidated one in step 3 below. Workbooks
#     are module-scoped, so they filter by --modules via module-codes.json — NOT by
#     --surface globs (which are file-scoped and cannot reliably match paths that
#     include a directory component).
if [[ -d "$SCRATCH/testcases" ]]; then
  node -e '
    const fs = require("fs");
    const path = require("path");
    const reg = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const modules = process.argv[2].split(",");
    const tcBase = process.argv[3];

    function resolveToCode(dir, stem) {
      const normalized = stem.replace(/-/g, "_");
      let groupCode = null;
      for (const [code, mod] of Object.entries(reg.modules)) {
        if (mod.dir === dir) { groupCode = code; break; }
      }
      if (!groupCode || !reg.submodules[groupCode]) return null;
      const candidates = [normalized];
      if (normalized.startsWith("location_") && !normalized.startsWith("locations_")) {
        candidates.push("locations_" + normalized.slice("location_".length));
      }
      const subs = reg.submodules[groupCode];
      for (const c of candidates) {
        for (const [code, sub] of Object.entries(subs)) {
          if (sub.sheet === c) return groupCode + "." + code;
        }
      }
      for (const c of candidates) {
        for (const [code, sub] of Object.entries(subs)) {
          if (c.startsWith(sub.sheet) || sub.sheet.startsWith(c)) {
            return groupCode + "." + code;
          }
        }
      }
      return null;
    }

    if (!fs.existsSync(tcBase)) process.exit(0);
    for (const dirEnt of fs.readdirSync(tcBase, { withFileTypes: true })) {
      if (!dirEnt.isDirectory()) continue;
      const subdir = path.join(tcBase, dirEnt.name);
      for (const fileEnt of fs.readdirSync(subdir, { withFileTypes: true })) {
        if (!fileEnt.isFile() || !fileEnt.name.endsWith(".xlsx")) continue;
        const filePath = path.join(subdir, fileEnt.name);
        const stem = fileEnt.name.replace(/\.xlsx$/, "");
        const code = resolveToCode(dirEnt.name, stem);
        if (code === null) {
          process.stderr.write("[ship-branch] WARNING: unresolvable split workbook, keeping: " +
            dirEnt.name + "/" + fileEnt.name + "\n");
          continue;
        }
        const group = code.split(".")[0];
        const keep = modules.some(m => m === group || m === code);
        if (!keep) fs.unlinkSync(filePath);
      }
    }
  ' "$REPO_ROOT/export_test_cases/module-codes.json" "$MODULES" "$SCRATCH/testcases"
  find "$SCRATCH/testcases" -mindepth 1 -type d -empty -delete 2>/dev/null || true
fi

# 3. Trim the consolidated workbook to the module scope (registry-driven + Overview-row prune).
XLSX_TRIM_ARGS=( --modules="$MODULES" )
[[ -n "$TCS" ]] && XLSX_TRIM_ARGS+=( --tcs="$TCS" )
node "$REPO_ROOT/scripts/xlsx-trim.mjs" "$SCRATCH/testcases/encore_test_cases.xlsx" "${XLSX_TRIM_ARGS[@]}"

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
if ! node "$REPO_ROOT/scripts/verify-no-forbidden.mjs" --target="$VERIFY" --require-env-local; then
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
