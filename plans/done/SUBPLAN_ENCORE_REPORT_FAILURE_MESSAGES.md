# SUBPLAN: Encore report — human-readable assertion (failure-view) messages

**Status**: DONE
**Executed**: 2026-07-09
**Priority**: P3
**Created**: 2026-07-09
**Parent**: PLAN_ENCORE_REPORT_READABILITY.md
**Identity**: BUILDER
**Depends on**: PLAN_ENCORE_REPORT_READABILITY.md (DONE — step-label Proxy + gate landed)
**Model**: claude-opus-4-8 · **Thinking**: hi · **PermissionMode**: acceptEdits
**BrowserTool**: none (message strings + inline `test.step`; verified by typecheck + gate)

## Context

The parent plan landed the plain-English step labels — the client's actual complaint (a passing
report now reads in plain English). This subplan carries the deferred readability polish (parent
Item 3): when an assertion breaks, the report still shows raw code (`expected false to be true`).
Add human-readable message args to the highest-visibility assertions so a non-technical reader
understands what a break means, and wrap the 15 assertion-form `.page.` accessors catalogued in the
parent's remediation in inline `test.step('short english', …)` so they read cleanly in the report
tree. This is additive text on top of a green, gated baseline — no assertion logic changes.

## Bootstrap

- **Identity**: BUILDER.
- **Skills**: /execute, /regression-guard, /final-q.
- **Context files**: parent `plans/done/PLAN_ENCORE_REPORT_READABILITY.md`; `.claude/rules/specs.md`
  (LR-022 no hardcoded counts, LR-068 no silent partial coverage); `.claude/rules/deliverable.md`
  (LR-058 no jargon in shipped strings); `clients/encore/src/fixtures/step-wrapper.ts` (label mechanism).

## Phase 0 — Gate

- Parent is DONE (`step-wrapper.ts` + `check-step-labels.mjs` live). No browser needed — this is
  message-string + `test.step` text, verified by `npm run typecheck` + the step-label gate.

## Phase 1 — Assertion messages (~40-60, happy-path)

- Add a plain-English `expect(value, 'what was expected')` message to the save / navigation /
  grid-content assertions on the primary (happy-path) test bodies across
  `clients/encore/tests/**/*.spec.ts`. Each message states the expectation in plain English, carries
  no jargon/selectors (LR-058), and does NOT add or change any asserted value or count (LR-022).
  Skip negative-path and structural-count assertions.

## Phase 2 — Inline `test.step` for the 15 assertion-form `.page.` accessors

- For the 15 `expect(p.page.getByText(...))…` accessors catalogued in the parent (corporate-pricing
  specs), wrap each in `test.step('short english', async () => { … })` OR expose the locator via a
  page-object getter, so the report tree reads cleanly. No behavior change.

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | — |
| GIVER | (none) | (none) | — |
| BUILDER | `clients/encore/tests/**/*.spec.ts` (assertion `message` args + inline `test.step` — no TC logic / count changes) | (skipped: no new file — this subplan only adds message strings + test.step labels to existing specs; verified by typecheck + the step-label gate) | `npm run typecheck` exit 0 + `node scripts/check-step-labels.mjs --enforce` exit 0 |
| HEALER | (none) | (none) | — |
| WATCHDOG | (none) | (none) | — |
| GARDENER | (none) | (none) | — |
| OWNER | (none) | (none) | — |

## Acceptance criteria

- [x] ~40-60 happy-path save/nav/grid assertions carry a plain-English message. → **60** messages across 23 spec files (top of range).
- [x] The assertion-form `.page.` accessors read as plain-English steps in the report tree. → **13** wrapped (grep-verified zero unwrapped remain). Parent's catalogued "15" was an over-count — see Execution Summary §2.
- [x] `npm run typecheck` exit 0; `node scripts/check-step-labels.mjs --enforce` exit 0. → both exit 0.
- [x] No jargon (LR-058) in any added string; no asserted value/count added or changed (LR-022). → LR-058 scan 0 hits / 73 strings; diff shows only 2nd-arg message inserts + `test.step` wraps, every asserted value/matcher/count byte-identical.

### Execution Summary

**Executed**: 2026-07-09 · **Method**: `/ultra-agents` council (Copilot fleet edits + cross-vendor review; Opus = guarantor only, 0 self-edits to specs).

**§1 — Messages added (Phase 1): 60**, across all 23 spec files under `clients/encore/tests/**`. Each is a plain-English 2nd positional arg on a happy-path save / navigation / grid / export assertion. Negative-path, structural-count, and already-messaged assertions were deliberately skipped (grep-verified: e.g. `getCheckboxCount().toBe(5)`, `getGridRowCount().toBe(3)`, empty-before-action `.toBe(0)` left unmessaged). Coverage was intentionally the highest-visibility set, not exhaustive (LR-068-honest: not every assertion carries a message by design).

**§2 — `test.step` wraps (Phase 2): 13** (grep-verified complete; parent PLAN's "15" corrected). The corporate-pricing specs contain **14** `.page.` accessor lines total: **13 assertion-form** (all wrapped — 12 `expect(...page...)` + 1 shape-(c) `const listCheckboxes = await test.step(async () => …count())` that preserves scope) + **1 locator-builder** (`new-pricebook.spec.ts:539 const firstRow = sp.page.locator('tbody tr').first()`, handed to a page-object method — not an inline assertion, correctly out-of-scope). No 15th accessor exists; the parent over-counted (13 assertion-form + 1 locator-builder + 1 double-count). Phase 2.5 grep confirms **zero unwrapped assertion-form accessors remain** in any module (locations / local-office specs have none — they assert through page-object methods). Intent (every inline assertion-accessor reads as a plain-English step) is 100% satisfied.

**§3 — Adversarial review + repair**: gpt-5.5 (different-vendor `council-reviewer`) reviewed the isolated diff → 3 findings (1 blocker: a label echoed selector token `new-strategy`; 2 major: two messages overstated a `>0`/count check as "every"). All 3 verified by me against source (none false), fixed by a council repair worker, re-verified byte-exact.

**§4 — Guarantor gates (all GREEN, post-repair)**:
- `cd clients/encore && npx tsc --noEmit` → exit 0.
- `node scripts/check-step-labels.mjs --enforce` → 0 violations (24 specs scanned).
- LR-058 jargon scan on all 73 extracted message+label strings → 0 hits.
- `npm run check:spec-quality` (LR-060 obligation 4, working tree) → 5/5 sub-checks clean.

**§5 — Integrity**: isolated diff vs a pre-council baseline snapshot shows exactly **23 spec files** changed (zero stray files; `auth.setup.ts` + `_unit/` were pre-existing dirty, byte-identical to baseline). **Zero** test-boundary lines (`test(`/`describe`/`fixme`/`skip`) added, removed, or moved. Per-file `test(`-block parity vs baseline: **0 mismatches**. No assertion added/removed/reordered; no import/comment/title/value/matcher/count changed (LR-022 satisfied).

**TCs**: none created or dropped — this subplan is additive report-readability text only (message strings + step labels) on existing green specs. No new file (BUILDER matrix row honored via `(skipped: …)`).

## Handoff

Chat-only on completion (per handoff discipline). Delivered: 60 plain-English assertion messages + 13 labelled report steps across the Encore spec suite; report failure-view now reads in business English. All gates green; no assertion logic touched.
