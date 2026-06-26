# SUBPLAN_CORP_PRICING_DETAIL_DRAGDROP_REMEDIATION — Settle the Detail drag/double-click verdict with real evidence  [SUPERSEDED]

> **SUPERSEDED (2026-06-24) by [PLAN_CORP_PRICING_JIRA_DELIVERY.md](PLAN_CORP_PRICING_JIRA_DELIVERY.md).** No work lost — re-homed item-for-item (conservation restructure, LR-050): create-mode drag-add positive-control → NM-2263; Detail management-mode no-add TC-correction (DET-008/009/010, positive-control evidence) → NM-2260; NM-2301 Max-Discount-NULL→0.00 watch → NM-2260. Retained for history only; do NOT execute.

**Status**: SUPERSEDED
**Superseded-by**: PLAN_CORP_PRICING_JIRA_DELIVERY.md
**Priority**: P0
**Created**: 2026-06-19
**Identity**: OWNER
**Parent**: PLAN_CORP_PRICING_REWALK_REMEDIATION.md
**Depends on**: SUBPLAN_CORP_PRICING_REWALK_AUDIT.md
**Blocks**: SUBPLAN_CORP_PRICING_REMEDIATION_CLOSURE.md
**Model**: claude-opus-4-8
**Thinking**: max
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**Justification**: false-negative RCA + app-vs-spec divergence adjudication (Opus max per LR-041).

> Identity = OWNER as a multi-identity span (HEALER RCA → BUILDER spec → GIVER catalog); OWNER short-circuits §2 per LR-043. May be folded into `SUBPLAN_CORP_PRICING_1443_DETAIL_FCC_P2.md` at execution if the team prefers one Detail subplan.

---

## Context

`TC-CPR-DET-008/009/010` assert single/double-click/drag do NOT add a product group in Pricing Detail **management mode** — but the drag was "proven" with Playwright `.dragTo()` (a primitive that frequently never fires React/HTML5 DnD), so the evidence is unsound even though the *conclusion* matches the design ([NM-1443](https://encore.atlassian.net/browse/NM-1443): management mode = no add; create mode = add). The human tester observed drag DOES add in Detail — a contradiction that must be settled live. This subplan re-drives the interaction with a REAL drag + a positive control (extended LR-061) and makes the tests reflect reality, filing an app-vs-spec bug if the live app diverges from NM-1443.

---

## Bootstrap

**Identity**: OWNER (multi-identity: HEALER → BUILDER → GIVER)

**Skills auto-called**:
- `/identity` (gate) · `/rca` (HEADED CLI live walk) · `/regression-guard` (wrap) · `/relevant` (Phase 0.5) · `/bugfix` (if app-vs-spec divergence) · `/final-q` (exit)

**Context files**:
- `PLAN_CORP_PRICING_REWALK_REMEDIATION.md` (parent §Jira NM-1443) + `corp-pricing-drift-ledger-2026-06-19.md`
- `.claude/rules/specs.md` (LR-019, LR-061 extended positive-control)
- `.claude/rules/angular.md` (LR-009 net-zero)
- `.claude/rules/baseline.md` (LR-034 bug filing)
- `.claude/rules/browser-tool.md` (CLI HEADED for `/rca`)
- `clients/encore/CLAUDE.md`; `docs/read_only_docs/AGENT_SHARED_RULES.md`

**Anti-Assumption Gates**:
- [ ] Phase 0.5b — consumes Subplan A baseline-absent attest; NM-1443 is the design oracle.
- [ ] Positive control MANDATORY (Gate 3 — extended LR-061): prove the SAME drag adds in create mode before asserting no-add in mgmt; `.dragTo()` banned — full pointer sequence / native dnd only.
- [ ] N≥2 before "regression" (Gate 2) — reconcile live vs NM-1443 + a 2nd office if claiming app-wide.
- [ ] Un-skip + LR-019 harden atomic (Gate 5); no silent checkpoint (Gate 6).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)
1. Confirm `SUBPLAN_CORP_PRICING_REWALK_AUDIT.md` DONE; read its Detail drag verdict + positive-control evidence.
2. navigation.md (Detail row). 3. agent-mistakes.md (drag / false-negative / RC-2). 4. patterns.md (control-does-nothing). 5. LR scan: LR-061, LR-019, LR-009, LR-034. 6. `BrowserTool=cli` (HEADED) announcement — reason: `/rca` live re-verification of a false-negative-evidence claim.

## Phase 0.5b — Baseline-first walk
Consumes Subplan A's baseline-absent attestation; NM-1443 (design) + the live walk (observed) are the two truth sources. Any live behavior that contradicts NM-1443 is classified (a) regression / (b) intentional / (c) baseline-absent per LR-034 and filed accordingly.

## Phase 1 — HEALER: settle the verdict (HEADED `/rca`)
1. Implement a robust drag helper on the Detail page object (full pointer sequence: `mouse.move`→`down`→ several `move`s →`up`, or native `dragstart/dragover/drop` with populated `dataTransfer`) — NOT `.dragTo()`.
2. **Positive control**: prove the helper DOES add a product group in **create / new-pricebook** mode (NM-1443 says it should).
3. Re-drive in **management** mode: does a real drag add a row at the bottom? Re-test double-click.
4. Verdict:
   - real drag does NOT add in mgmt → conclusion stands; keep `DET-008/009/010` but replace the `.dragTo()` evidence with the positive-control proof.
   - real drag DOES add in mgmt (contradicts NM-1443) → file `BUG-CPR-DET-*` (LR-034, post-baseline) + cover the add path.

## Phase 2 — BUILDER: make the tests reflect reality
1. Correct `DET-008/009/010` (+ double-click) per the Phase-1 verdict.
2. Add real add-path coverage where add is valid (drag-add → lands at bottom → edit New Price/Max Discount → Save → persist → restore; LR-009/LR-019).
3. Lock the verified op set (drag-add per mode + inline edit + Save; no phantom ops).
4. Watch NM-2301 (Max Discount NULL→0.00 on UI price update) — assert/flag.

## Phase 3 — GIVER: sync catalog/MD/XLSX
Update test-cases MD + test-plan + rebuild XLSX (planner:post-complete); parity exit 0.

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)
Adjacent Detail fixes → DO-NOW / SPAWN / APPEND grep-verified line (into 1443_DETAIL_FCC_P2 if folding). Bare "out of scope" = HALT.

## Per-Identity Satisfaction
| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none — baseline consumed from Subplan A) | (none) | (none) |
| GIVER | test-cases MD + test-plan + XLSX | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_detail_test_cases.md`<br>`clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec + page object | `clients/encore/tests/corporate-pricing/corporate-pricing-detail.spec.ts`<br>`clients/encore/src/pages/corporate-pricing/corporate-pricing-detail.page.ts` | `npx playwright test corporate-pricing-detail --workers=1` green |
| HEALER | RCA verdict + (conditional) bug | `clients/encore/specs_planning/_internal/rca-corp-pricing-detail-drag-2026-06-19.md` | `ls` the RCA doc; verdict recorded with positive-control evidence |
| WATCHDOG | (none — closure is Subplan D) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |
| OWNER | closure + (conditional) BUG file | `(skipped: closure ceremony only; a BUG-CPR-DET-*.json is filed only if live diverges from NM-1443)` | `node scripts/validate-plan-closure.mjs --dry-run` exit 0 |

## Acceptance criteria
- [ ] Detail spec green ×2.
- [ ] The drag/double-click verdict carries **positive-control evidence** (create-mode add proven), NOT a `.dragTo()` no-op.
- [ ] Tests reflect reality; if live diverges from NM-1443, a `BUG-CPR-DET-*` is filed (LR-034) and the add path covered.
- [ ] `check:tc-parity` exit 0; `/regression-guard` clean; activity-log row (LR-028); `/final-q` verdict.

## Verification
```bash
npx playwright test corporate-pricing-detail --workers=1   # expect: all green
ls clients/encore/specs_planning/_internal/rca-corp-pricing-detail-drag-2026-06-19.md  # expect: exists
```

## Handoff
The Detail drag/double-click question is settled with sound evidence (positive control), the tests reflect reality, and any app-vs-spec divergence from NM-1443 is filed as a bug. Feeds the closure audit.
