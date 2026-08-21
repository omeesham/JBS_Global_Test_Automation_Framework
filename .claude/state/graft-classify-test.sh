#!/usr/bin/env bash
SRC="$1"
F_FRAMEWORK='^(\.claude/|\.githooks/|scripts/|pipeline/|src/|docs/read_only_docs/|CLAUDE\.md$|package(-lock)?\.json$|tsconfig\.json$|playwright\.config\.ts$|\.gitignore$)'
F_CLIENTCFG='^clients/[^/]+/(CLAUDE\.md|package(-lock)?\.json|playwright\.config\.ts|tsconfig\.json|\.gitignore|\.env\.|scripts/)'
F_LEARNINGS='^clients/[^/]+/specs_planning/_internal/(agent-mistakes|agent-activity-log|bug-archetypes|field-case-generation|field-inventory-spec|active-experiments)\.md$'
D_SURFACE='^clients/[^/]+/(src|tests|config|testcases|test_cases_xlsx|docs)/'
D_QAWORK='^clients/[^/]+/specs_planning/(test-cases|test-plans|field-inventories|old-site-baseline|_internal)/'
D_PLANS='^plans/(pending|done)/(PLAN|SUBPLAN)_.*\.md$'
git diff --name-only main..."$SRC" | while IFS= read -r f; do
  if   printf '%s\n' "$f" | grep -qE "$F_FRAMEWORK|$F_CLIENTCFG|$F_LEARNINGS"; then t=F
  elif printf '%s\n' "$f" | grep -qE "$D_SURFACE|$D_QAWORK|$D_PLANS";          then t=D
  else t=F; fi
  echo "$t  $f"
done | sort
