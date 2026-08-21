#!/usr/bin/env bash
# classify-incoming.sh — split an incoming colleague ref into the three graft lanes.
#
# D-NEW    — a path THEY created that we do not have. Taken as-is; their name is on it.
# D-COMMON — their edit to a path WE ALREADY HAVE (or to a shared surface). Tried for BLAST RADIUS
#            before splicing: their new module is not the only thing their branch touched, and a
#            regression here lands on other collaborators' clean, green work.
# F        — anything that changes how MY framework behaves in every future session.
#            Guilty until proven right; per-hunk trial before a single line is spliced.
#
# AXIS 1 (D vs F) is NOT "does it ship to the client" — it is "whose future does this change".
# A test-case markdown never ships and is still Tier D (it is their ticket output).
# A hook, a rule, a learnings ledger, a config knob is Tier F even when it looks trivial.
#
# AXIS 2 (D-NEW vs D-COMMON) is "is this THEIR ground or OURS". The fast lane is only sound for a
# file that did not exist here before — such a file cannot regress anything of ours. The moment
# their diff touches a file we already have, that reasoning is gone.
#
# DEFAULT DIRECTION: anything the lists do not recognise is F; anything we cannot PROVE is new is
# D-COMMON. Unknown costs one extra look; a mis-filed D-NEW costs a silent regression on a clean
# deliverable. Same posture as LR-074 §74.3.
#
# Usage:
#   bash .claude/skills/graft/classify-incoming.sh <source-ref>     # e.g. origin/NM-2271
#   bash .claude/skills/graft/classify-incoming.sh --self-test
#
# Output: one "<LANE>  <path>" line per changed file, sorted, then a count summary on stderr.

set -o pipefail

# ── Tier F — framework behaviour (evaluated FIRST; wins any overlap) ──────────

# Repo-level framework surface: gates, doctrine, check scripts, runtime, root config.
F_FRAMEWORK='^(\.claude/|\.githooks/|scripts/|pipeline/|src/|docs/read_only_docs/|CLAUDE\.md$|package(-lock)?\.json$|tsconfig\.json$|playwright\.config\.ts$|\.gitignore$)'

# Per-client RUN config + client doctrine. These ship, but they also change how specs
# execute on my disk (LR-050 graduating incident was a drifted fullyParallel flag).
F_CLIENTCFG='^clients/[^/]+/(CLAUDE\.md|package(-lock)?\.json|playwright\.config\.ts|tsconfig\.json|\.gitignore|\.env\.|scripts/)'

# The learnings ledgers Rutvik named explicitly. Shared, append-only, and read by every
# future session — a colleague's edit here rewrites what my agents believe.
F_LEARNINGS='^clients/[^/]+/specs_planning/_internal/(agent-mistakes|agent-activity-log|bug-archetypes|field-case-generation|field-inventory-spec|active-experiments)\.md$'

# ── Tier D — the colleague's ticket work product ─────────────────────────────

# Shipped client surface: page objects, selectors, test data, specs, fixtures, workbook.
D_SURFACE='^clients/[^/]+/(src|tests|config|testcases|test_cases_xlsx|docs)/'

# QA work product that does not ship: test cases, test plans, walk evidence, inventories.
D_QAWORK='^clients/[^/]+/specs_planning/(test-cases|test-plans|field-inventories|old-site-baseline|_internal)/'

# Their ticket's own plan/subplan file — a record of their execution, not framework doctrine.
D_PLANS='^plans/(pending|done)/(PLAN|SUBPLAN)_.*\.md$'

# ── Axis 2 — shared-surface force list (D-COMMON regardless of git status) ────
#
# A regression in any of these lands on OTHER collaborators, not on the ticket. Even a
# genuinely-new file here costs only one extra look; the reverse error is a silent break of
# someone else's green module.
#
#   testcases/*.xlsx      — the workbook is a WHOLE-REPO AGGREGATE (npm run xlsx:build archives
#                           HEAD). Their branch rebuilt it from THEIR HEAD, so it is missing every
#                           test case landed on main since their merge-base. Standing disposition
#                           is REJECT-KEEP-OURS + rebuild here — never splice their binary.
#   src/**/index.ts       — barrels: one line re-points every importer in the client.
#   src/pages/components/ — shared components consumed across modules.
#   src/{fixtures,utils,setup,types,reporter}/ — shared runtime every spec loads.
#   src/pages/*base*.ts   — base page / base class: every page object inherits it.
#   tests/**/auth.setup.ts — shared auth; breaking it takes down every spec at once.
D_SHARED_FORCE='^clients/[^/]+/(testcases/.*\.xlsx$|test_cases_xlsx/.*\.xlsx$|src/([^/]+/)*index\.ts$|src/pages/components/|src/(fixtures|utils|setup|types|reporter)/|src/pages/[^/]*base[^/]*\.ts$|tests/([^/]+/)*auth\.setup\.ts$)'

# ── Axis 1: path → D or F ────────────────────────────────────────────────────

classify() {
  local f="$1"
  if   printf '%s\n' "$f" | grep -qE "$F_FRAMEWORK|$F_CLIENTCFG|$F_LEARNINGS"; then echo F
  elif printf '%s\n' "$f" | grep -qE "$D_SURFACE|$D_QAWORK|$D_PLANS";          then echo D
  else echo F   # default-deny: unrecognised path goes to the trial lane
  fi
}

# ── Axis 2: a Tier D path → D-NEW or D-COMMON ────────────────────────────────
#
# Pure function so the self-test can drive it without a git tree.
#   $1 = path   $2 = git status letter (A/M/D/R…)   $3 = 1 if the path EXISTS in our main
#
# BOTH conditions are required for D-NEW. Status A alone is NOT enough: `main...<ref>` is scoped
# to the merge-base, so a file both sides added independently shows as A while our main already
# has its own version — grafting that as "new" silently overwrites ours.
lane_for_d() {
  local f="$1" st="$2" in_main="$3"
  printf '%s\n' "$f" | grep -qE "$D_SHARED_FORCE" && { echo "D-COMMON"; return; }
  case "$st" in A) ;; *) echo "D-COMMON"; return ;; esac   # M/D/R/C/T → we already have it
  [ "$in_main" = "1" ] && { echo "D-COMMON"; return; }
  echo "D-NEW"
}

# ── Self-test ────────────────────────────────────────────────────────────────
# Fixtures are real paths observed on origin/NM-2271 and origin/NM-2267, plus the
# boundary cases the lists exist to separate.

run_self_test() {
  local pass=0 fail=0

  # --- Axis 1: path → D / F -------------------------------------------------
  # format: <expected-tier>|<path>
  local fixtures=(
    # --- Tier D: ticket work product -------------------------------------
    "D|clients/encore/src/pages/corporate-override/corporate-override.page.ts"
    "D|clients/encore/src/selectors/corporate-override/override.ts"
    "D|clients/encore/src/data/corporate-override/override.ts"
    "D|clients/encore/tests/corporate-override/corporate-override-labor-grid.spec.ts"
    # Pre-restructure xlsx location. Still live on 18 remote branches, so an incoming
    # colleague branch can legitimately carry it — the classifier must keep matching it.
    "D|clients/encore/test_cases_xlsx/encore_test_cases.xlsx"
    "D|clients/encore/testcases/encore_test_cases.xlsx"
    "D|clients/encore/specs_planning/test-cases/setup/corporate-pricing/x_test_cases.md"
    "D|clients/encore/specs_planning/test-plans/setup/corporate-pricing/x_test_plan.md"
    "D|clients/encore/specs_planning/_internal/walk-evidence-override-2026-07-20-SAVE.md"
    "D|clients/encore/specs_planning/_internal/field-inventories/service-charge-2026-08-10.md"
    "D|plans/done/SUBPLAN_CORP_PRICING_NM2271_GRID_EQUIPMENT_LABOR.md"
    "D|plans/pending/PLAN_CORP_PRICING_JIRA_DELIVERY.md"
    "D|clients/encore/docs/MODULE_REGISTRY.md"

    # --- Tier F: gates, doctrine, check scripts, runtime ------------------
    "F|.claude/hooks/lib/check-identity-switch.mjs"
    "F|.claude/hooks/client-surface-gate.sh"
    "F|.claude/settings.json"
    "F|.claude/guardrail-config.json"
    "F|.claude/rules/pipeline.md"
    "F|.claude/skills/graft/SKILL.md"
    "F|.claude/agents/BUILDER.md"
    "F|.claude/context/navigation.md"
    "F|.claude/collaborator-memory/feedback_x.md"
    "F|docs/read_only_docs/LEARNED_RULES.md"
    "F|scripts/check-per-test-baseline.mjs"
    "F|.githooks/pre-push"
    "F|pipeline/orchestrator.ts"
    "F|src/contracts/queue.ts"
    "F|CLAUDE.md"
    "F|package.json"
    "F|playwright.config.ts"
    "F|tsconfig.json"

    # --- Tier F: the boundary cases the lists exist to separate -----------
    "F|clients/encore/CLAUDE.md"
    "F|clients/encore/playwright.config.ts"
    "F|clients/encore/package.json"
    "F|clients/encore/.env.e2e"
    "F|clients/encore/scripts/build-xlsx.mjs"
    "F|clients/encore/specs_planning/_internal/agent-mistakes.md"
    "F|clients/encore/specs_planning/_internal/agent-activity-log.md"
    "F|clients/encore/specs_planning/_internal/bug-archetypes.md"
    "F|plans/INDEX.md"

    # --- default-deny: unrecognised paths fall to F -----------------------
    "F|some/brand/new/thing.ts"
    "F|clients/encore/mystery-dir/thing.ts"
    "F|.vscode/settings.json"
  )

  for fx in "${fixtures[@]}"; do
    local want="${fx%%|*}" path="${fx#*|}" got
    got="$(classify "$path")"
    if [ "$got" = "$want" ]; then
      pass=$((pass + 1))
    else
      echo "FAIL  axis1  want=$want got=$got  $path" >&2
      fail=$((fail + 1))
    fi
  done

  # --- Axis 2: (path, status, in_main) → D-NEW / D-COMMON -------------------
  # format: <expected-lane>|<path>|<status>|<in_main>
  local lanes=(
    # Genuinely new territory — the fast lane, and it must stay fast.
    "D-NEW|clients/encore/src/pages/corporate-override/corporate-override.page.ts|A|0"
    "D-NEW|clients/encore/tests/corporate-override/corporate-override-labor-grid.spec.ts|A|0"
    "D-NEW|clients/encore/src/selectors/corporate-override/override.ts|A|0"
    "D-NEW|clients/encore/specs_planning/test-cases/setup/corporate-pricing/x_test_cases.md|A|0"
    "D-NEW|plans/done/SUBPLAN_CORP_PRICING_NM2271_GRID_EQUIPMENT_LABOR.md|A|0"

    # Their edit to a file we already have — the whole point of this rewrite.
    "D-COMMON|clients/encore/src/pages/corporate-override/corporate-override.page.ts|M|1"
    "D-COMMON|clients/encore/tests/service-charge/service-charge.spec.ts|M|1"
    "D-COMMON|clients/encore/src/data/shared/offices.ts|M|1"
    "D-COMMON|clients/encore/specs_planning/test-cases/setup/pricing/x_test_cases.md|M|1"

    # Deleted / renamed a pre-existing file — highest blast radius, invisible in a green run.
    "D-COMMON|clients/encore/tests/service-charge/service-charge.spec.ts|D|1"
    "D-COMMON|clients/encore/src/pages/pricing/pricing.page.ts|R096|1"

    # Status A but our main ALSO has it — both sides added it independently. NOT new to us.
    "D-COMMON|clients/encore/src/data/shared/offices.ts|A|1"

    # Shared-surface force list — D-COMMON even when brand new to both sides.
    "D-COMMON|clients/encore/testcases/encore_test_cases.xlsx|A|0"
    "D-COMMON|clients/encore/test_cases_xlsx/encore_test_cases.xlsx|M|1"
    "D-COMMON|clients/encore/src/index.ts|A|0"
    "D-COMMON|clients/encore/src/pages/index.ts|A|0"
    "D-COMMON|clients/encore/src/pages/components/grid.component.ts|A|0"
    "D-COMMON|clients/encore/src/fixtures/test-fixtures.ts|A|0"
    "D-COMMON|clients/encore/src/utils/wait.ts|A|0"
    "D-COMMON|clients/encore/src/setup/global-setup.ts|A|0"
    "D-COMMON|clients/encore/src/types/office.ts|A|0"
    "D-COMMON|clients/encore/src/reporter/allure-reporter.ts|A|0"
    "D-COMMON|clients/encore/src/pages/base.page.ts|A|0"
    "D-COMMON|clients/encore/tests/auth.setup.ts|A|0"
    "D-COMMON|clients/encore/tests/setup/auth.setup.ts|A|0"
  )

  for fx in "${lanes[@]}"; do
    local IFS='|'; read -r want path st inm <<< "$fx"; unset IFS
    local got; got="$(lane_for_d "$path" "$st" "$inm")"
    if [ "$got" = "$want" ]; then
      pass=$((pass + 1))
    else
      echo "FAIL  axis2  want=$want got=$got  $path (status=$st in_main=$inm)" >&2
      fail=$((fail + 1))
    fi
  done

  echo "self-test: $pass passed, $fail failed" >&2
  [ "$fail" -eq 0 ] || return 1
  return 0
}

# ── Entry point ──────────────────────────────────────────────────────────────

if [ "${1:-}" = "--self-test" ]; then
  run_self_test
  exit $?
fi

SRC="${1:-}"
if [ -z "$SRC" ]; then
  echo "usage: bash .claude/skills/graft/classify-incoming.sh <source-ref>   (or --self-test)" >&2
  exit 2
fi

if ! git rev-parse --verify --quiet "$SRC" >/dev/null; then
  echo "ERROR: '$SRC' is not a resolvable git ref. Fetch it first." >&2
  exit 2
fi

# Build the full result set first. Piping the loop straight into `sort` would run it in a
# subshell and silently lose the counters — the counts must survive to the summary.
out=""
while IFS= read -r line; do
  [ -n "$line" ] || continue
  status="${line%%$'\t'*}"
  rest="${line#*$'\t'}"
  case "$status" in
    R*|C*) f="${rest#*$'\t'}" ;;   # rename/copy: take the NEW path (the old one was ours)
    *)     f="$rest" ;;
  esac
  [ -n "$f" ] || continue

  if [ "$(classify "$f")" = "F" ]; then
    lane=F
  else
    # Does OUR main already have this path? That, not their status letter, is what decides.
    if git cat-file -e "main:$f" 2>/dev/null; then in_main=1; else in_main=0; fi
    lane="$(lane_for_d "$f" "$status" "$in_main")"
  fi
  out="${out}${lane}  ${f}"$'\n'
done < <(git diff --name-status "main...$SRC")

printf '%s' "$out" | sort

new_count=$(printf '%s' "$out" | grep -c '^D-NEW  ' || true)
com_count=$(printf '%s' "$out" | grep -c '^D-COMMON  ' || true)
f_count=$(printf '%s' "$out" | grep -c '^F  ' || true)

echo "" >&2
echo "D-NEW    (take as-is, fast lane):        $new_count file(s)" >&2
echo "D-COMMON (blast-radius trial, Step 1.5): $com_count file(s)" >&2
echo "F        (trial, guilty until right):    $f_count file(s)" >&2
if [ "$com_count" -gt 0 ]; then
  echo "-> $com_count file(s) touch code we ALREADY HAVE. Step 1.5 per-hunk (code level, no execution)" >&2
  echo "   before any splice; anything that ALTERS a pre-existing line is REJECT-KEEP-OURS." >&2
fi
if [ "$f_count" -gt 0 ]; then
  echo "-> $f_count file(s) require the Step 2 per-hunk trial before any splice." >&2
fi
if [ "$com_count" -eq 0 ] && [ "$f_count" -eq 0 ]; then
  echo "-> pure fast lane: splice, prove, sync, done." >&2
fi
exit 0
