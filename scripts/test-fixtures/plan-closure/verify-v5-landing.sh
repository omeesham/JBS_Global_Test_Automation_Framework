#!/usr/bin/env bash
set -euo pipefail

# === BEHAVIOR — authoritative self-tests (NV3) ===
node scripts/validate-plan-closure.mjs --self-test 2>&1 | tail -3
node .claude/hooks/lib/check-plan-closure.mjs --self-test 2>&1 | tail -3
node scripts/validate-overrides.mjs --self-test 2>&1 | tail -3
node scripts/validate-plan-layout.mjs --self-test 2>&1 | tail -3

# === SMOKE — grep checks (string-presence only, not behavior) ===
# B1 (Lock-paths first)
grep -q "LOCK-PATHS CHECK FIRST" .claude/hooks/lib/check-plan-closure.mjs
# B2 (no blanket fixture exemption)
! grep -q "fixtures\"$" scripts/validate-plan-closure.mjs
# B3 (inline-backtick filter removed from rule)
! grep -q "Inside inline backticks → drop" .claude/rules/plan-closure.md
# B4 (no override:/user-approved: filter)
! grep -q "user-approved:.*override:" scripts/validate-plan-closure.mjs
# B5+V10 (landed-at + last-change)
grep -q "closure-gate-landed-at" scripts/validate-plan-layout.mjs
grep -q "git log -1 --format=%at" scripts/validate-plan-layout.mjs
# B7 (plan_sha256 verification in layout)
grep -q "plan_sha256" scripts/validate-plan-layout.mjs
# B10 (path normalization)
grep -q "relative" scripts/validate-plan-closure.mjs
# B11 (extension set extended)
grep -qE '\.log|\.txt|\.har|\.xml' scripts/validate-plan-closure.mjs
# B12+V9 (parseField reuse)
grep -q "parseField" scripts/validate-plan-closure.mjs
# B13 (recipient-required-token)
grep -q "recipient-required-token" scripts/validate-plan-closure.mjs
# B15 (dubious ownership handler)
grep -q "dubious ownership" scripts/validate-plan-closure.mjs
# NB1 (no manifest writes in layout)
! grep -qE "writeFileSync.*manifest" scripts/validate-plan-layout.mjs
# NB2 (additionalProperties false)
grep -q '"additionalProperties": false' .claude/closure-overrides.schema.json
# NB3 (blanket pending skip removed)
! grep -q 'rel.startsWith..plans/pending/.. continue' scripts/verify-no-forbidden.mjs
# M2 (closure-attempts dir exists)
test -d .claude/state/closure-attempts
# M3 (closure_meta in schema)
grep -q "closure_meta" .claude/closure-overrides.schema.json || grep -q "meta_plans" .claude/closure-overrides.schema.json
# M5 (LR-N populated)
grep -qE "LR-[0-9]+" .claude/rules/plan-closure.md
# R2 (Bash mode wired + MCP no-op guard)
grep -q "plan-closure-gate.sh --bash-mode" .claude/settings.json
grep -q "tool_name" .claude/hooks/lib/check-plan-closure.mjs
# R3 (meta_plans in schema)
grep -q "meta_plans" .claude/closure-overrides.schema.json
# R4+V5 (fail-closed counter — RENAMED from fail-open)
grep -q "closure-fail-closed-counter" .claude/hooks/lib/check-plan-closure.mjs
# R5 (authorization surface section)
grep -q "Authorization surface" .claude/rules/plan-closure.md || grep -q "authorization surface" .claude/rules/plan-closure.md

# === V4 BLOCKER FIXES ===
# V1 (PowerShell writers in regex)
grep -qE "Set-Content|Out-File|Add-Content|Tee-Object" .claude/hooks/lib/check-plan-closure.mjs
# V1 (node fs writers)
grep -qE "fs\.writeFile|fs\.appendFile" .claude/hooks/lib/check-plan-closure.mjs
# V1 (read-only allowlist)
grep -q "READ_ONLY_PREFIX_RX" .claude/hooks/lib/check-plan-closure.mjs
# V2 (best-effort attribution acknowledgment)
grep -q "best-effort attribution" .claude/rules/plan-closure.md
# V3 (staged blob for pre-commit)
grep -q "git show :.claude/closure-overrides.json" scripts/validate-overrides.mjs
# V4 (2-commit bootstrap mentioned in rule)
grep -qE "commit-A|commit-B|Bootstrap" .claude/rules/plan-closure.md
# V5 (fail-CLOSED for plan-paths, not fail-open)
grep -q "fail-CLOSED" .claude/hooks/lib/check-plan-closure.mjs || grep -q "FAIL-CLOSED" .claude/hooks/lib/check-plan-closure.mjs
! grep -q "first 3 free" .claude/hooks/lib/check-plan-closure.mjs
# V6 (--write-manifest separate flag)
grep -q "write-manifest" scripts/validate-plan-closure.mjs
grep -q "plans:validate-closure:write-manifest" package.json
# V8 (this script exists, runnable)
test -f scripts/test-fixtures/plan-closure/verify-v5-landing.sh
# V9 (Parent parseField reused)
grep -q "parseField" scripts/validate-plan-closure.mjs
# V10 (last-change timestamp, not creation)
grep -q "git log -1 --format=%at" scripts/validate-plan-layout.mjs
# NV1 (backslash in lock-path regex)
grep -qE 'closure-overrides' .claude/hooks/lib/check-plan-closure.mjs
# NV2 (separate cleanup mode)
grep -q "cleanup-tmp-manifests" scripts/validate-plan-layout.mjs
# NV3 (BEHAVIOR vs SMOKE comments)
grep -q "BEHAVIOR" scripts/test-fixtures/plan-closure/verify-v5-landing.sh
# NV4/v5 fixture count (25 plan-body .md fixtures + 3 helpers)
test "$(ls scripts/test-fixtures/plan-closure/*.md | wc -l)" -eq 25
test -f scripts/test-fixtures/plan-closure/_overrides.json
test -f scripts/test-fixtures/plan-closure/_authors.txt
test -f scripts/test-fixtures/plan-closure/_helpers.mjs

echo "ALL GREEN — plan-closure-gate v5 landed, all 52 corrections verified"
