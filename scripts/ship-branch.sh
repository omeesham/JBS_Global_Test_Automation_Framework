#!/usr/bin/env bash
#
# ship-branch.sh â€” per-module branch ship to the encore mock
# (omeesham/EncoreGlobal_AI_Test_Framework). INTERNAL tooling â€” NEVER ships, NEVER wired
# into client:ship / xlsx:build / hooks / CI. ON-DEMAND ONLY: run by hand when the
# user explicitly says "ship module-wise" (PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT
# Â§Per-module branch ship constraint; navigation.md row 70).
#
# Persists the per-branch flow that previously lived ONLY in a 2026-06-10 ship
# session transcript (lost). The deliverable is a git-archive extract â€” never `cp -r`
# (LR-049). The push is HARD-GATED on the deny-list (scripts/verify-no-forbidden.mjs)
# run against a CLEAN re-extract of the FINAL trimmed content, never the scratch dir
# itself (feedback_gate_push_on_denylist + LR-049 scratch-init caveat: the repo
# core.hooksPath is NOT inherited in a fresh `git init`, so this manual gate is the
# only net).
#
# DEFAULT = DRY-RUN (build + trim + deny-list verify, NO push). Pass --push to push.
#
# NOTE (2026-08-13): Per-ticket delivery branches are retired. Only `main` ships to the
# client via the owner's explicit /push-encore-deliverables. This script remains for
# ad-hoc scoped shipments only -- always supply --branch, --modules, and --surface explicitly.
#
# Named presets retained for stable collection branches only (no per-ticket nm#### presets):
#   notes            --modules=LOC.NTS  --surface='location-notes*'
#   ssl              --modules=LOC.SSL  --surface='location-shared-setup*'
#   legal            --modules=LOC.LGL  --surface='location-legal*'
#   account-address  --modules=LOC.ACC  --surface='location-account-address*'
#   corporate-pricing --modules=CPR     --surface='corporate-pricing/**'
#   auto-addon             --modules=LOC.AAO  --surface='location-auto-addon*'
#   left-panel-basic-info  --modules=LOC.LP   --surface='location-left-panel-basic-information*'
#   locations              --modules=LOC.ACC,LOC.AAO,LOC.LP,LOC.LGL,LOC.NTS,LOC.SSL
#                          --surface='location-account-address*,location-auto-addon*,location-left-panel-basic-information*,location-legal*,location-notes*,location-shared-setup*'
#
# Usage (ad-hoc, always explicit):
#   bash scripts/ship-branch.sh --branch=X --modules=LOC.NTS --surface='location-notes*' [--push]
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REMOTE_NAME="encore-mock"
REMOTE_URL="https://github.com/omeesham/EncoreGlobal_AI_Test_Framework.git"

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

# Presets for stable collection branches (override with explicit --modules/--surface).
if [[ -z "$MODULES" || -z "$SURFACE" ]]; then
  case "$BRANCH" in
    notes)            MODULES="${MODULES:-LOC.NTS}"; SURFACE="${SURFACE:-location-notes*}" ;;
    ssl)              MODULES="${MODULES:-LOC.SSL}"; SURFACE="${SURFACE:-location-shared-setup*}" ;;
    legal)            MODULES="${MODULES:-LOC.LGL}"; SURFACE="${SURFACE:-location-legal*}" ;;
    account-address)  MODULES="${MODULES:-LOC.ACC}"; SURFACE="${SURFACE:-location-account-address*}" ;;
    corporate-pricing) MODULES="${MODULES:-CPR}";    SURFACE="${SURFACE:-corporate-pricing/**}" ;;
    auto-addon)             MODULES="${MODULES:-LOC.AAO}"; SURFACE="${SURFACE:-location-auto-addon*}" ;;
    left-panel-basic-info)  MODULES="${MODULES:-LOC.LP}";  SURFACE="${SURFACE:-location-left-panel-basic-information*}" ;;
    locations)              MODULES="${MODULES:-LOC.ACC,LOC.AAO,LOC.LP,LOC.LGL,LOC.NTS,LOC.SSL}"; SURFACE="${SURFACE:-location-account-address*,location-auto-addon*,location-left-panel-basic-information*,location-legal*,location-notes*,location-shared-setup*}" ;;
    main)
      # Derive scope from delivery manifest â€” modules with status delivered or approved-next.
      # Codes are validated against module-codes.json (the registry xlsx-trim uses downstream).
      _manifest="$REPO_ROOT/scripts/deliverable/delivery-manifest.encore.json"
      _modcodes="$REPO_ROOT/export_test_cases/module-codes.json"
      if [[ ! -f "$_manifest" ]]; then
        echo "[ship-branch] FATAL: delivery manifest not found at $_manifest" >&2; exit 1
      fi
      if [[ ! -f "$_modcodes" ]]; then
        echo "[ship-branch] FATAL: module-codes.json not found at $_modcodes" >&2; exit 1
      fi
      _derived="$(node -e '
        const m = require(process.argv[1]);
        const reg = require(process.argv[2]);
        const ok = new Set(["delivered", "approved-next"]);
        const valid = new Set();
        for (const [g, subs] of Object.entries(reg.submodules))
          for (const s of Object.keys(subs)) valid.add(g + "." + s);
        const inc = m.modules.filter(x => ok.has(x.status));
        const codes = inc.map(mod => {
          if (valid.has(mod.code)) return mod.code;
          const g = mod.code.split(".")[0], subs = reg.submodules[g] || {};
          const stem = (mod.specs[0] || "").split("/").pop().replace(/\.spec\.ts$/, "").replace(/-/g, "_");
          for (const [s, info] of Object.entries(subs))
            if (stem.startsWith(info.sheet) || info.sheet.startsWith(stem)) return g + "." + s;
          return mod.code;
        }).join(",");
        const globs = inc.flatMap(x =>
          x.specs.map(s => s.split("/").pop().replace(/\.spec\.ts$/, "") + "*")
        ).join(",");
        process.stdout.write(codes + "\n" + globs + "\n");
      ' "$_manifest" "$_modcodes")" || { echo "[ship-branch] FATAL: failed to parse delivery manifest" >&2; exit 1; }
      MODULES="${MODULES:-$(echo "$_derived" | head -n 1)}"
      SURFACE="${SURFACE:-$(echo "$_derived" | sed -n '2p')}"
      echo "[ship-branch] main: derived modules from manifest (status: delivered | approved-next)"
      echo "[ship-branch] main modules: $MODULES"
      ;;
    *) echo "[ship-branch] need --modules and --surface (no preset for branch '$BRANCH')" >&2; exit 2 ;;
  esac
fi
[[ -n "$BRANCH" ]] || { echo "[ship-branch] --branch is required" >&2; exit 2; }

# --- Branch-name convention gate ---------------------------------------------------------------
# Sev S2 (LR-069 §3.1) — process defect, not a leak; fails fast with the correct name in the message.
# Graduating directive: Rutvik 2026-08-05 — team standard is feature/sprint<N>-<name>-NM-<ticket>
#   e.g. feature/sprint17-vikas-NM-4333   ("feature/sprint" fixed, sprint number and name and ticket vary)
# Widened 2026-09-02 by Vikas (owner): a delivery may close more than one ticket, so the name may
# carry more than one, each keeping its own NM- prefix so the name stays unambiguous:
#   e.g. feature/sprint17-vikas-NM-2254-NM-3650
# Single-ticket names are unaffected. Separator-only forms (NM-2254-3650, NM-2254_3650) stay invalid
# — a bare trailing number cannot be told apart from a typo in the first one.
# The gate fires ONLY on branch CREATION. Branches that already exist on the remote are grandfathered:
# refusing to push to one cannot rename it, it only blocks a legitimate delivery.
BRANCH_CONVENTION='^feature/sprint[0-9]+-[a-z][a-z0-9]*-NM-[0-9]+(-NM-[0-9]+)*$'
LS_OUT="$(git ls-remote --heads "$REMOTE_URL" "$BRANCH" 2>/dev/null)"; LS_RC=$?
if [[ $LS_RC -ne 0 ]]; then
  echo "[ship-branch] WARN - could not reach $REMOTE_NAME to check whether '$BRANCH' exists;" >&2
  echo "[ship-branch] treating it as NEW and applying the naming standard conservatively." >&2
fi
if [[ -n "$LS_OUT" ]]; then
  echo "[ship-branch] branch '$BRANCH' already exists on $REMOTE_NAME - naming check skipped (existing branch)"
elif [[ ! "$BRANCH" =~ $BRANCH_CONVENTION ]]; then
  echo "[ship-branch] FATAL - '$BRANCH' does not exist on $REMOTE_NAME, so this push would CREATE it," >&2
  echo "[ship-branch] and a new branch must follow the team standard:" >&2
  echo "[ship-branch]     feature/sprint<N>-<name>-NM-<ticket>    e.g. feature/sprint17-vikas-NM-4333" >&2
  echo "[ship-branch] A delivery closing several tickets repeats the NM- prefix for each:" >&2
  echo "[ship-branch]     feature/sprint<N>-<name>-NM-<t1>-NM-<t2>  e.g. feature/sprint17-vikas-NM-2254-NM-3650" >&2
  echo "[ship-branch] Fix the name, or target an existing branch. List them with:" >&2
  echo "[ship-branch]     git ls-remote --heads $REMOTE_URL" >&2
  exit 2
else
  echo "[ship-branch] branch '$BRANCH' is NEW and matches the naming standard - it will be created on push"
fi

echo "[ship-branch] branch=$BRANCH modules=$MODULES surface=$SURFACE tcs=${TCS:-<none>} push=$DO_PUSH"

# Guard: if --tcs is supplied, spec-trim.mjs must exist before any work begins.
# Shipping a TC-filtered workbook without matching spec trimming is a mismatched delivery.
if [[ -n "$TCS" ]]; then
  if [[ ! -f "$REPO_ROOT/scripts/spec-trim.mjs" ]]; then
    echo "[ship-branch] FATAL â€” --tcs='$TCS' requires scripts/spec-trim.mjs, which does not exist." >&2
    echo "[ship-branch] A workbook trimmed to '$TCS' without matching spec trimming is a mismatched delivery." >&2
    echo "[ship-branch] Build or obtain spec-trim.mjs (built in parallel by worker B1) before using --tcs." >&2
    exit 1
  fi
fi

# Working-tree integrity snapshot â€” assert at exit that the source tree under
# clients/ is unchanged. A structural guarantee: no path-resolution bug or future
# code change can silently corrupt tracked files during a build/trim run.
_WTC_SNAPSHOT="$(git -C "$REPO_ROOT" status --porcelain -- clients/ 2>/dev/null || true)"

SCRATCH="$(mktemp -d)"; VERIFY="$(mktemp -d)"
cleanup() {
  local rc=$?
  local _wt_after
  _wt_after="$(git -C "$REPO_ROOT" status --porcelain -- clients/ 2>/dev/null || true)"
  if [[ "$_wt_after" != "$_WTC_SNAPSHOT" ]]; then
    echo "[ship-branch] SAFETY VIOLATION â€” source tree under clients/ was modified during this run!" >&2
    echo "[ship-branch] A write escaped the scratch directory. Diff:" >&2
    diff <(echo "$_WTC_SNAPSHOT") <(echo "$_wt_after") >&2 || true
    rc=99
  fi
  [[ "$KEEP_SCRATCH" -eq 1 ]] || rm -rf "$SCRATCH" "$VERIFY"
  return "$rc"
}
trap cleanup EXIT

# 1. git-archive extract of the client (tracked files only â€” gitignored agent
#    artifacts are structurally excluded, LR-049 layer 1).
git -C "$REPO_ROOT" archive HEAD clients/encore/ | tar -x -C "$SCRATCH" --strip-components=2

# 1b. Remove paths that must never ship even when force-tracked in git (e.g. internal
#     docs/ or specs_planning/ files that were added via git add -f during migrations).
#     Derived from DENY_GLOBS via --emit-exclusions (scripts/verify-no-forbidden.mjs)
#     so this list cannot drift from the deny-list and is never hand-written here.
#     NOTE: DENY_GLOBS is defined in scripts/lib/forbidden-patterns.mjs line 21
#     (the single source of truth shared with the write-time jargon hook); update it
#     there. A drift between that list and what this script strips would cause internal
#     files (credentials, agent docs, specs_planning/) to pass through to the client
#     payload undetected.
#     .env.local and all other denied files are covered automatically â€” no coincidental
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
  echo "[ship-branch] FATAL: blank starter environment file missing at scripts/deliverable/env-local.template â€” payload cannot be assembled." >&2
  exit 1
fi
cp "$_ENV_TEMPLATE" "$SCRATCH/.env.local"
echo "[ship-branch] blank starter environment file added to payload."

# Parse surface into an array â€” used by the spec filter (step 2).
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
      echo "[ship-branch] FATAL â€” spec-trim.mjs failed on: $specFile" >&2
      echo "[ship-branch] Refusing to continue to workbook trim â€” a trimmed workbook beside an untrimmed spec is a mismatched delivery." >&2
      exit 1
    fi
  done < <(find "$SCRATCH/tests" -name '*.spec.ts' -print0)

  # 2c. Source-level dead-code elimination (src-trim.mjs) â€” DISABLED 2026-07-20.
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
#     are untouched â€” xlsx-trim handles the consolidated one in step 3 below. Workbooks
#     are module-scoped, so they filter by --modules via module-codes.json â€” NOT by
#     --surface globs (which are file-scoped and cannot reliably match paths that
#     include a directory component). A sub-task folder declared on a submodule entry
#     (module-codes.json dir) resolves by folder alone; module-level folders still
#     resolve by workbook stem vs sheet name.
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
      if (!groupCode) {
        // A sub-task workbook lives in a folder declared on its SUBMODULE entry
        // (dir on reg.submodules[group][sub], e.g. search-for-product-groups -> ISR.PGR),
        // so the folder alone names the owner and no stem/sheet match is needed. A folder
        // claimed by two sub-tasks stays unresolvable and is kept, like any unknown folder.
        const owners = [];
        for (const [group, subs] of Object.entries(reg.submodules)) {
          for (const [code, sub] of Object.entries(subs)) {
            if (sub.dir === dir) owners.push(group + "." + code);
          }
        }
        return owners.length === 1 ? owners[0] : null;
      }
      if (!reg.submodules[groupCode]) return null;
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
# .env.local is listed in the shipped .gitignore so plain `add -A` skips it.
# Force-add so the blank starter survives the git-archive re-extract to VERIFY.
git -C "$SCRATCH" add -f .env.local
git -C "$SCRATCH" commit -q -m "Encore deliverable â€” $BRANCH module"

# 5. CLEAN re-extract of the FINAL trimmed content (no node_modules/.git false-positives).
git -C "$SCRATCH" archive HEAD | tar -x -C "$VERIFY"

# 6. HARD deny-list gate â€” push is conditional on exit 0 (echo-and-continue already
#    leaked once; feedback_gate_push_on_denylist).
if ! node "$REPO_ROOT/scripts/verify-no-forbidden.mjs" --target="$VERIFY" --require-env-local; then
  echo "[ship-branch] DENY-LIST FAILED on the trimmed extract â€” refusing to push." >&2
  exit 1
fi
echo "[ship-branch] deny-list clean on $VERIFY"

# 6b. Scope gate â€” every payload file must resolve to an approved module (fail-closed).
if ! node "$REPO_ROOT/scripts/verify-approved-scope.mjs" --target="$VERIFY" --client=encore; then
  echo "[ship-branch] SCOPE GATE FAILED â€” payload contains unapproved modules." >&2
  exit 1
fi
echo "[ship-branch] scope gate clean on $VERIFY"

# LR-073: structural-names gate (S0) — no ticket IDs as file/directory names.
node scripts/lib/check-structural-names.mjs --target="$VERIFY" || { echo "ERR: LR-073 structural-names gate failed — rename using feature-based names." >&2; exit 10; }

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
  echo "[ship-branch] no live tip for $BRANCH â€” first push (no lease)."
  git -C "$SCRATCH" push "$REMOTE_NAME" "HEAD:refs/heads/$BRANCH"
fi
echo "[ship-branch] pushed $BRANCH."
