#!/usr/bin/env bash
# classify-incoming.sh — split an incoming colleague ref into the two graft tiers.
#
# Tier D (DELIVERABLE)  — the colleague's ticket work product. Taken as-is; their name is on it.
# Tier F (FRAMEWORK)    — anything that changes how MY framework behaves in every future session.
#                         Guilty until proven right; per-hunk trial before a single line is spliced.
#
# The split axis is NOT "does it ship to the client" — it is "whose future does this change".
# A test-case markdown never ships and is still Tier D (it is their ticket output).
# A hook, a rule, a learnings ledger, a config knob is Tier F even when it looks trivial.
#
# DEFAULT DIRECTION: anything the lists do not recognise is Tier F. Unknown costs one extra
# look; a mis-filed Tier D costs a silently degraded framework. Same posture as LR-074 §74.3.
#
# Usage:
#   bash .claude/skills/graft/classify-incoming.sh <source-ref>     # e.g. origin/NM-2271
#   bash .claude/skills/graft/classify-incoming.sh --self-test
#
# Output: one "<TIER>  <path>" line per changed file, sorted, then a count summary on stderr.

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

classify() {
  local f="$1"
  if   printf '%s\n' "$f" | grep -qE "$F_FRAMEWORK|$F_CLIENTCFG|$F_LEARNINGS"; then echo F
  elif printf '%s\n' "$f" | grep -qE "$D_SURFACE|$D_QAWORK|$D_PLANS";          then echo D
  else echo F   # default-deny: unrecognised path goes to the trial lane
  fi
}

# ── Self-test ────────────────────────────────────────────────────────────────
# Fixtures are real paths observed on origin/NM-2271 and origin/NM-2267, plus the
# boundary cases the two lists exist to separate.

run_self_test() {
  local pass=0 fail=0
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
      echo "FAIL  want=$want got=$got  $path" >&2
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
while IFS= read -r f; do
  [ -n "$f" ] || continue
  out="${out}$(classify "$f")  ${f}"$'\n'
done < <(git diff --name-only "main...$SRC")

printf '%s' "$out" | sort

d_count=$(printf '%s' "$out" | grep -c '^D  ' || true)
f_count=$(printf '%s' "$out" | grep -c '^F  ' || true)

echo "" >&2
echo "Tier D (take as-is, fast lane):     $d_count file(s)" >&2
echo "Tier F (trial, guilty until right): $f_count file(s)" >&2
if [ "$f_count" -gt 0 ]; then
  echo "-> $f_count file(s) require the Step 2 per-hunk trial before any splice." >&2
fi
exit 0
