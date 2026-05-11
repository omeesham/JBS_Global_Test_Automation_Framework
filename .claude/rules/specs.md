---
description: Spec authoring + spec-fixing workflow discipline
paths:
  - "clients/*/tests/specs/**/*.spec.ts"
  - "clients/*/src/pages/**/*.ts"
---

# Spec Authoring & Spec-Fixing Discipline

Path-scoped rule pack — loads when authoring or fixing Playwright specs and page objects.

## LR-018: Spec-fixing workflow — run-all is the only truth

When fixing failing specs, follow this exact order:

1. Run ALL specs together → identify failures
2. Run each failing spec INDIVIDUALLY → classify as "run-all only" vs "always fails"
3. Fix "always fails" specs first (selector, logic, timeout issues)
4. Run fixed specs individually → confirm fix
5. Run ALL specs together again → check for serial contamination
6. If spec passes individually but fails in run-all → RCA is serial state, timing, or auth
7. Iterate until run-all is green

**Trigger**: Any spec-fixing session. Enforced by healer/maintainer agents.

## LR-019: First test in any spec MUST enforce baseline state

Whether the spec uses `test.describe()` or legacy `test.describe.serial()`, the first test (TC-001) must:

1. Navigate to the page fresh
2. Read current state from DOM (not assume defaults)
3. Reset any dirty state from prior runs (toggle checkboxes, clear fields)
4. Save if needed to persist clean baseline
5. Re-navigate to ensure clean state

Required because subsequent tests assume a known starting state. Never hardcode expected initial values without baseline enforcement.
**Trigger**: Every new spec. Generator must implement.

## LR-021: Un-skip before rewrite — always try original logic first

When fixing a skipped test, FIRST remove the skip and run the original test logic AS-IS.
If it passes, the underlying bug was fixed — keep the original assertions.
Only rewrite to "test actual behavior" if the original logic STILL fails.
This prevents unnecessary test rewrites and catches silently-fixed bugs.
**Trigger**: Any session that involves fixing skipped tests.

## LR-022: No hardcoded structural counts in assertions

Never assert exact counts of DOM elements (`.toBe(42)`, `.toHaveLength(114)`) unless
the count itself is the feature under test. These break on any UI addition/removal
without catching real bugs. Use content assertions (`.toContain()`), behavior assertions
(click → verify effect), or existence checks (`.toBeGreaterThan(0)`).
**Trigger**: Any test generation or review session.

## LR-024: Clean artifacts and run fresh BEFORE any RCA — never diagnose from stale data

When fixing failing specs:

1. Clean ALL artifacts (`npm run clean`, clear `.auth/`)
2. Run the spec fresh
3. THEN RCA from the actual failure evidence

Stale diagnostics accumulate from multiple prior runs and will lead to wrong root causes.
Historical example: stale diagnostics said LGL-010 was an SSO reload issue. Fresh run showed
LGL-013 failed (Radix dropdown instability). Second fresh run showed LGL-010 failed with
the SAME Radix issue. The stale diagnostics were 100% wrong about the root cause.

**Corollary**: Run the failing spec TWICE before RCA to confirm the failure is consistent
and identify whether it's deterministic or intermittent (same test vs different test each time).
**Trigger**: Any spec-fixing session. Complements LR-018 workflow.

## Annotation: dependencyGate is annotation-only (2026-05-08)

`dependencyGate(['TC-...'])` is annotation-only as of 2026-05-08 (PLAN_DEPENDENCY_GATE_REMOVAL); never gates execution. Tests surface their own failures via per-test `test.beforeEach` nav guards in each spec (mirrors local-office-settings.spec.ts:33). Dep declarations remain visible in Allure as `dependsOn` annotations; the prior `depGateSkipped` cascade is gone.

## LR-025: Radix UI large-option dropdowns need retry on option selection

Radix UI Select with many options (50+) auto-scrolls to the checked item on open.
Options above the scroll position become "not stable" (bounding box changing during
scroll animation) then "detached from DOM" (portal re-render). This is intermittent —
depends on timing, browser load, and how far the target option is from the checked one.

Fix pattern: wrap open+click in a retry loop (max 3). On failure: press Escape to close
the listbox, wait for hidden, re-open, `scrollIntoViewIfNeeded()`, then click.
Reduce per-attempt timeout (5s) so retries stay within total budget.

**Trigger**: Any combobox/select interaction with 50+ options in Radix UI.
