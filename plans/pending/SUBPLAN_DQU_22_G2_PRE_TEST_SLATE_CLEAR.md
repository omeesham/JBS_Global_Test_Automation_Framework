# SUBPLAN: Pre-Test Slate-Clear — Pattern Design + Shared Utility

**Status**: Pending
**Priority**: P1-CYCLE-2
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-21 (state matrix required)
**Blocks**: SP-DQU-24 (rollout)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_22_G2_PRE_TEST_SLATE_CLEAR.md`
**Identity**: BUILDER
**Skills auto-called**: /identity, /planning, /simplify
**Model + thinking**: Opus + high (design work)
**Dependency gate**: SP-DQU-21 `Status: DONE`
**Context files**:
- `clients/encore/specs_planning/_internal/spec-state-matrix-2026-04-22.md`
- Existing `src/pages/` base utilities (e.g., `base-page.ts`) for extension points
- `src/fixtures/pages.fixture.ts` for worker-scoped session fixture
- LR-026 (Angular dirty-state unreliability)

## Purpose

Design a reusable pre-test "slate-clear" primitive: brings office 1604 to a known-good baseline before each spec. Implement as a shared utility used via Playwright fixture or explicit beforeEach call.

Per user vision: "they need to clear the slate before testing". Non-brittle, page-agnostic where possible, page-specific where needed.

## Step-by-step

1. Read state matrix; identify primitive operations needed (reload, type-original, API restore, checkbox-cascade-reset).
2. Design API surface:
   - `slateClear.beforeSpec(page, module)` — module-aware baseline reset. Default: navigate + reload + wait for Angular stable.
   - `slateClear.beforeTest(page, tests)` — per-test targeted reset if TC declares state dependency.
3. Implement in `src/utils/slate-clear.ts` (new file). Keep code minimal — one exported object with 2 methods. Internals call page-specific helpers lazy-loaded per module.
4. Per-module helper files (optional): `src/utils/slate-clear/local-office.ts`, `local-information.ts`, etc. — only if module needs more than reload + navigate.
5. Fallback pattern: reload after each test (`waitUntil: 'domcontentloaded'` + `waitForAngularStable()`). LR-023 compliance.
6. Angular dirty-state handling per LR-026: if beforeEach navigate detects `[role="alertdialog"]` → dismiss with "Discard".
7. Unit-smoke the utility on one spec (e.g., local-office-settings.spec.ts) by calling `beforeSpec` in that spec's beforeAll. Verify baseline state achieved.
8. Activity-log row.

## Acceptance criteria

- [ ] `src/utils/slate-clear.ts` exists with 2-method API surface.
- [ ] API is page-agnostic with lazy per-module branching.
- [ ] Smoke-test on 1 spec passes.
- [ ] LR-023, LR-026 compliance evident in code comments or commits.
- [ ] Activity-log row.

## Handoff

Next: SP-DQU-23 (post-test slate-clear). Chat summary: API signature + smoke-spec that works.
