# SUBPLAN_CORP_PRICING_OVERRIDE_GAPS_REMEDIATION — Cover the override picker, Labor, Grid Options, validations & picker-modal  [SUPERSEDED]

> **SUPERSEDED (2026-06-24) by [PLAN_CORP_PRICING_JIRA_DELIVERY.md](PLAN_CORP_PRICING_JIRA_DELIVERY.md).** No work lost — folded ENTIRELY (item-for-item, full depth) into [SUBPLAN_CORP_PRICING_NM2267_OVERRIDE.md](SUBPLAN_CORP_PRICING_NM2267_OVERRIDE.md): currency-gated picker add (Equipment + Labor), NM-1463/1472/1881/1932 validations, "New" location-exclusion, override Grid Options (10-col), location-picker modal, multi-currency, OVR-023, override Export/Import, NM-2206 guard. Conservation restructure (LR-050). Retained for history only; do NOT execute.

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

> Identity = OWNER as a multi-identity span (GIVER catalog → BUILDER specs); OWNER short-circuits §2 per LR-043.

---

## Context

Jira ground-truth (parent §Jira) reframed the override screen: it HAS a currency-gated **Product-Group Picker** (double-click + drag add — NM-1472) that every prior walk missed (they used `Currency=ALL`); **Labor is testable** by adding a Labor row via the picker (office 1101 — NM-1881); the **discount-requires-price** validation is real and designed (NM-1932/NM-1463), not "blocked-data"; currencies are **location-gated**; the **override-page Grid Options** and the **location-picker modal controls** are uncovered; the `OVR-023` fixme (>100) needs re-verification. This subplan closes all of those, consuming Subplan A's ledger.

---

## Bootstrap

**Identity**: OWNER (multi-identity: GIVER → BUILDER)

**Skills auto-called**:
- `/identity` (gate) · `/regression-guard` (wrap) · `/relevant` (Phase 0.5) · `/rca` (on first-run reds) · `/final-q` (exit)

**Context files**:
- `PLAN_CORP_PRICING_REWALK_REMEDIATION.md` (parent §Jira NM-1472/1463/1881/1932/2206) + `corp-pricing-drift-ledger-2026-06-19.md`
- `.claude/rules/specs.md` (LR-019, LR-061 extended) ; `.claude/rules/angular.md` (LR-009)
- `.claude/rules/inventory.md` (LR-029 sr-only Grid Options, LR-036 Radix-checkbox boolean, LR-057 affordance, LR-062)
- `.claude/rules/baseline.md` (LR-034) ; `.claude/rules/browser-tool.md` (CLI)
- `clients/encore/CLAUDE.md` ; `docs/read_only_docs/AGENT_SHARED_RULES.md`

**Anti-Assumption Gates**:
- [ ] Phase 0.5b — consumes Subplan A baseline-absent attest + ledger.
- [ ] Empty-surface gate (extended LR-040(c)): Labor is NOT closed as empty-state — it is populated via the picker and tested, OR escalated with the documented population path.
- [ ] Positive control before any "control inert" (Gate 3 — extended LR-061).
- [ ] Un-skip + LR-019 harden atomic (Gate 5); no silent checkpoint (Gate 6).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)
1. Confirm `SUBPLAN_CORP_PRICING_REWALK_AUDIT.md` DONE; read its override rows (picker revealed, Labor path, validations).
2. navigation.md (override row). 3. agent-mistakes.md (override false-negative, GEN-B7 sr-only). 4. patterns.md. 5. LR scan: LR-019, LR-061, LR-036, LR-029, LR-057, LR-040(c), LR-009. 6. `BrowserTool=cli` announcement.

## Phase 0.5b — Baseline-first walk
Consumes Subplan A's `corporate-pricing-rewalk-2026-06-19.md` (baseline-absent) + ledger. NM-1463/1472 are the design oracles; the live walk is observed truth.

## Phase 1 — GIVER: catalog the override gaps
From the ledger, enumerate net-new TCs (past high-water mark, blended at top, no `@fcc`) for: picker add (Equipment + Labor), Labor edit/save with real data, discount-requires-price + price-auto-activates-row, "New" location-exclusion, override Grid Options (10-col), picker-modal controls, multi-currency. Update test-cases MD + test-plan + rebuild XLSX.

## Phase 2 — BUILDER: implement
1. **Product-Group Picker** (NM-1472): reveal via a SPECIFIC currency; cover double-click + drag add on **Equipment AND Labor** (new row → Dirty + Inactive + default price → set price → Save → persist → restore; LR-009/LR-019; drag via full pointer sequence per extended LR-061).
2. **Labor** (NM-1881, office 1101): add a Labor row via the picker, edit/save/persist parity with Equipment — never a silent empty-state pass (extended LR-040(c)). If no office yields Labor, escalate via `/encore-questions` citing the recorded path.
3. **Discount-requires-price** (NM-1932/NM-1463): discount without a price → rejected (rejection-affordance oracle: announced + escapable); price set → row auto-activates; price cleared → deactivates.
4. **"New" location list** excludes locations with existing overrides (NM-1463).
5. **Override-page Grid Options** (10-col): toggle each, persist across reload, Reset-to-Default, restore (`aria-label="Grid Options"`, LR-029).
6. **Location-picker modal**: Active checkbox, All Locations row, search filtering, Cancel, Close, title.
7. **Multi-currency**: edit on a location whose allowed currencies include CAD/MXN (location-gated, NM-1463); else APPEND to EDGE_P3.
8. **`OVR-023` >100**: re-verify against current app — un-fixme or refresh `BUG-CPR-OVR-001` evidence (rejection-affordance oracle).
9. Assert NM-2206 blank/red-circle does NOT occur on the test office (file if it does).

## Phase 3 — HEALER: first-run RCA (conditional)
On first-run reds: artifact-first `/rca`, evidence-cited fixes, positive control before any "inert".

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)
Adjacent override fixes → DO-NOW / SPAWN / APPEND grep-verified line (multi-currency/real-I/O → EDGE_P3). Bare "out of scope" = HALT.

## Per-Identity Satisfaction
| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none — baseline consumed from Subplan A) | (none) | (none) |
| GIVER | test-cases MD + test-plan + XLSX + catalog | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md`<br>`clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec + page object + selectors + data | `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts`<br>`clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts`<br>`clients/encore/src/selectors/corporate-pricing/override.ts` | `npx playwright test corporate-pricing-override --workers=1` green |
| HEALER | first-run fixes (conditional) | `(skipped: conditional — only if first-run reds; replaced at close with the fixed spec path, else no HEALER work)` | `npx playwright test corporate-pricing-override --workers=1` green |
| WATCHDOG | (none — closure is Subplan D) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |
| OWNER | closure + (conditional) escalation | `(skipped: closure ceremony only; an /encore-questions escalation is filed only if no office yields Labor data)` | `node scripts/validate-plan-closure.mjs --dry-run` exit 0 |

## Acceptance criteria
- [ ] Override spec green ×2.
- [ ] Picker add covered on **Equipment + Labor** (currency-gated reveal); Labor covered with real data OR escalated with the population path recorded (extended LR-040(c)) — never a silent empty-state pass.
- [ ] Discount-requires-price + price-auto-activate + "New" location-exclusion validations covered; override Grid Options + picker-modal TCs green.
- [ ] `OVR-023` re-verified (un-fixme or refreshed bug evidence).
- [ ] Multi-currency covered or APPENDed to EDGE_P3 (grep-verifiable).
- [ ] `check:tc-parity` exit 0; `/regression-guard` clean; activity-log row (LR-028); `/final-q` verdict.

## Verification
```bash
npx playwright test corporate-pricing-override --workers=1   # expect: all green (incl. picker + Labor + Grid Options)
grep -c "Labor" clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts  # expect: Labor edit/save TCs present
```

## Handoff
Override screen fully covered: the currency-gated picker (Equipment + Labor), Labor with real data, the designed validations, Grid Options, picker-modal controls, and the OVR-023 re-verification. Multi-currency / real I/O round-trip handed to EDGE_P3. Feeds the closure audit.
