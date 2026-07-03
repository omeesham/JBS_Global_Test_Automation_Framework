# SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION — Remediation the stale toolbar + cover every button & dropdown value  [SUPERSEDED]

> **SUPERSEDED (2026-06-24) by [PLAN_CORP_PRICING_JIRA_DELIVERY.md](PLAN_CORP_PRICING_JIRA_DELIVERY.md).** No work lost — re-homed item-for-item (conservation restructure, LR-050): Export ▾ drift-fix → NM-2264; Import ▾ drift-fix → NM-2265; Loc Pricing Export re-verify → NM-2262; Loc Pricing Import re-verify → NM-2305; New ▾ Equipment/Labor → NM-2263; Pricing Override link + override Grid Options → NM-2267; Search Grid Options → NM-2260. Retained for history only; do NOT execute.

**Status**: SUPERSEDED
**Superseded-by**: PLAN_CORP_PRICING_JIRA_DELIVERY.md
**Priority**: P0
**Created**: 2026-06-19
**Identity**: OWNER
**Parent**: PLAN_CORP_PRICING_REWALK_REMEDIATION.md
**Depends on**: SUBPLAN_CORP_PRICING_REWALK_AUDIT.md
**Blocks**: SUBPLAN_CORP_PRICING_REMEDIATION_CLOSURE.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli

> Identity = OWNER as a multi-identity span (GIVER catalog → BUILDER specs → HEALER fixes); OWNER short-circuits §2 per LR-043.

---

## Context

The toolbar I/O suite drifted on ~2026-06-10: 10 of 17 `TC-CPR-TIO-*` are red (`Export ▾` no longer fires the direct request; `Import ▾` is now a Year+Currency dialog). Plus three never-covered controls surfaced in the audit: the `Pricing Override` link (zero coverage), the `New ▾` dropdown items (reached by URL, never clicked), and the override-page Grid Options (distinct from the Search-page one). This subplan re-walks those controls against the current app (ledger from Subplan A) and re-covers them so **every button + every dropdown value is exercised**, under the new positive-control rule (no `.click()`/`.dragTo()` no-op accepted as truth).

---

## Bootstrap

**Identity**: OWNER (multi-identity: GIVER → BUILDER → HEALER)

**Skills auto-called**:
- `/identity` (gate) · `/regression-guard` (wrap) · `/relevant` (Phase 0.5) · `/rca` (on any first-run red) · `/final-q` (exit)

**Context files**:
- `PLAN_CORP_PRICING_REWALK_REMEDIATION.md` (parent) + `corp-pricing-drift-ledger-2026-06-19.md`
- `.claude/rules/specs.md` (LR-019 per-test baseline, LR-061 extended positive-control)
- `.claude/rules/angular.md` (LR-009 net-zero / dirty)
- `.claude/rules/inventory.md` (LR-029 sr-only selector, LR-062)
- `.claude/rules/browser-tool.md` (CLI)
- `clients/encore/CLAUDE.md` (LR-ENC-001/004; LR-036) ; `docs/read_only_docs/AGENT_SHARED_RULES.md`

**Anti-Assumption Gates**:
- [ ] Phase 0.5b — consumes Subplan A's baseline-absent attest + ledger (no new baseline needed; re-verify-only surface).
- [ ] No "control un-drivable" without verify-before-blocked + positive control (Gate 3 — extended LR-061).
- [ ] Un-skip + LR-019 harden atomically (Gate 5).
- [ ] No silent checkpoint (Gate 6).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)
1. Confirm `SUBPLAN_CORP_PRICING_REWALK_AUDIT.md` DONE; read its ledger rows for toolbar controls.
2. navigation.md (Corp Pricing search/toolbar rows). 3. agent-mistakes.md (GEN-B7 sr-only Grid Options, toolbar-io staleness). 4. patterns.md. 5. LR scan: LR-019, LR-061, LR-029, LR-009. 6. `BrowserTool=cli` announcement (reason: functional re-walk + spec fix).

## Phase 0.5b — Baseline-first walk
Consumes `corp-pricing-rewalk-2026-06-19.md` (baseline-absent) + the drift ledger from Subplan A. No new baseline walk (toolbar is observed-truth-only on the new site).

## Phase 1 — GIVER: re-catalog the changed/missed controls
1. From the ledger, enumerate the current behavior of: `Export ▾` (4 variants), `Import ▾` (4 variants — Year+Currency dialog), `Loc Pricing Export/Import`, `New ▾` (Equipment/Labor menu items), `Pricing Override` link, Search Grid Options (9-col), override Grid Options (10-col).
2. Update test-cases MD + test-plan + rebuild the XLSX (planner:post-complete). Net-new TC IDs past the high-water mark; blend at top of the existing describe; no `@fcc` tag.

## Phase 2 — BUILDER: re-cover every control + value
1. Fix the 10 stale `TC-CPR-TIO-*` to the current behavior (Export ▾ new contract; Import ▾ Year+Currency dialog asserted; Loc Pricing).
2. `New ▾`: click Equipment + Labor menu items (real dropdown interaction, not URL).
3. `Pricing Override` link: net-new nav TC → asserts navigation to `/pg-override`.
4. Override-page Grid Options: net-new (toggle each of 10 cols, persist across reload, Reset-to-Default, restore) — anchor on `aria-label="Grid Options"` (LR-029, sr-only).
5. Re-verify Search Grid Options (9-col) still green.
6. Real file round-trip stays in EDGE_P3 — APPEND grep-verifiable line items there (LR-040b).

## Phase 3 — HEALER: first-run RCA (conditional)
On any first-run red: artifact-first `/rca` (read failure-summary, no guess-patch); fixes cite evidence; positive-control before any "un-drivable" (extended LR-061).

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)
Adjacent toolbar/selectors fixes → DO-NOW / SPAWN / APPEND grep-verified line. Bare "out of scope" = HALT.

## Per-Identity Satisfaction
| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none — re-verify-only surface; baseline consumed from Subplan A) | (none) | (none) |
| GIVER | test-cases MD + test-plan + XLSX + catalog | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_toolbar_io_test_cases.md`<br>`clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | specs + page objects + selectors | `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts`<br>`clients/encore/tests/corporate-pricing/corporate-pricing-search.spec.ts` | `npx playwright test --list` resolves all toolbar TC IDs |
| HEALER | first-run fixes (conditional) | `(skipped: conditional — only if first-run reds; replaced at close with the fixed spec path, else no HEALER work)` | `npx playwright test corporate-pricing-toolbar-io --workers=1` green |
| WATCHDOG | (none — closure audit is Subplan D) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |
| OWNER | closure | `(skipped: closure ceremony only — deliverables are the GIVER/BUILDER artifacts above)` | `node scripts/validate-plan-closure.mjs --dry-run` exit 0 |

## Acceptance criteria
- [ ] All 17 `TC-CPR-TIO-*` green ×2 against the current app; the 10 stale ones re-cover the new behavior.
- [ ] `New ▾` Equipment + Labor exercised via dropdown click; `Pricing Override` nav TC green; override Grid Options TCs green; Search Grid Options re-verified.
- [ ] Real file round-trip APPENDed to EDGE_P3 with grep-verifiable line items (LR-040b).
- [ ] `check:tc-parity` exit 0; `/regression-guard` clean; activity-log row (LR-028); `/final-q` verdict.

## Verification
```bash
npx playwright test corporate-pricing-toolbar-io --workers=1   # expect: all green
grep -F "real file round-trip" plans/pending/SUBPLAN_CORP_PRICING_EDGE_P3.md   # expect: appended line present
```

## Handoff
Toolbar re-verified against the current app with every button + dropdown value exercised, plus the three missed controls (Pricing Override link, New ▾ clicks, override Grid Options) covered. Real I/O round-trip handed to EDGE_P3.
