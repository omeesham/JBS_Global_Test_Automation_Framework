# SUBPLAN_OPI_D_MIGRATE_LOCATIONS_BATCH — migrate remaining Location Settings specs to per-office

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-06-04
**Identity**: OWNER
**Parent**: PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md
**Depends on**: SUBPLAN_OPI_C_MIGRATE_LEGAL_PILOT.md
**Blocks**: SUBPLAN_OPI_Z_FINAL_FLIP_AND_CLEANUP.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**Justification**: n/a

---

## Context

Applies the OPI_C recipe, **one spec at a time (vertical)**, to the remaining Location Settings specs: account-address, left-panel-basic-information, local-information, auto-addon, currency, pricing. Each is migrated, proven single-worker == today, then proven isolated at `--workers=2`, before moving to the next — so a half-migrated spec never navigates office-K while asserting 1604's data (F1.1). Owns **F1.4, F5.3, F8.4 (these specs), F10.1 (left-panel cascade)**. Excludes SSL + history (OPI_E) and local-office (OPI_F). No TC semantics change → no Phase 0.5b.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (gate) · `/regression-guard` (wrap) · `/relevant` (Phase 0.5) · `/rca` (per-spec `--workers=2` flake) · `/final-q` (exit)

**Context files**:
- parent + `plans/pending/SUBPLAN_OPI_C_MIGRATE_LEGAL_PILOT.md` (the recipe) + `plans/done/SUBPLAN_OPI_B_*` (confirmed offices + per-constant inventory; values live-read at migration)
- `.claude/rules/specs.md`, `.claude/rules/angular.md` (LR-009/011/026 — local-info NaN reload, left-panel cascade), `.claude/rules/data.md`, `.claude/rules/browser-tool.md`
- `clients/encore/CLAUDE.md` (LR-008 date-offset rules, LR-012 shared dialog, LR-ENC-002 parity)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm OPI_C in `plans/done/`.
2–5. navigation.md, agent-mistakes (GEN-*/ALL-*), patterns.md, LR scan (LR-008/009/011/026, LR-012).
6. **Browser-tool**: `BrowserTool=cli`. Spec runs via runner; per-spec `--workers=2` flake RCA = HEADED cli (LR-038 `/rca`).

---

## Phase 1+ — Actual work (apply OPI_C 5-step recipe per spec, in this order)

1. **account-address** — `VENUE_NAME`, `PHONE1_BASELINE`, `MASTER_DISPLAY_FIELDS` → per-office maps (venue=fixed, phone=editable). Delete the `?? PHONE1_BASELINE` silent fallback in `location-account-address.page.ts` `ensureDefaultState` (F1.1 silent-wrong-office trap) — always pass `accountDefaultsFor(office)`.
2. **left-panel-basic-information** — `LP_DEFAULTS`→`LP_FIXED_BY_OFFICE`, `LP_BASELINE`→`LP_EDITABLE_BY_OFFICE`, `LEFT_PANEL_EXPECTED`→per-office. **Keep Country-first reset ordering** (cascade clears Tax Mode + Region — F10.1). Keep `LP_DROPDOWN` catalogs FLAT.
3. **local-information** — checkbox defaults + spin defaults → per-office editable; `DISABLED_CHECKBOX_STATES` + `chkEnableJobCosting` disabled+checked → per-office FIXED (F5.3). LDW silent-reject band stays a flat RULE.
4. **auto-addon** — checkbox defaults → per-office editable; dialog text FLAT.
5. **currency** — `MERCHANT_DATA` (merchant IDs) → per-office FIXED; default currency → per-office; currency option catalog FLAT. Verify merchant IDs are office-scoped not globally shared (F5.2 note from OPI_B).
6. **pricing** — `PRIMARY_TEST_ROW` / `MULTI_ALT_PRICEBOOKS` price-book rows → per-office FIXED; currency-option list FLAT.

For EACH: data→`*_BY_OFFICE` + accessors (live-read this tab's values per pool office at migration, LR-015, reconcile vs nav2 F5.1, dated provenance — no OPI_B pre-capture); spec `OFFICE_NO`→`office` fixture; resolve `*For(office)` in-body only (F1.1); assert Save-enabled before confirm (F2.2); run `--workers=1` (==today) then `--workers=2` isolation BEFORE moving to the next spec.

**Sonnet boundary**: data-map + spec edits [SONNET-SAFE]; the per-spec `--workers=2` runs + any flake RCA [OPUS-ONLY].

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Stray `'1604'` in a touched file → DO-NOW. Cross-tab mutation or shared-dialog nit → APPEND grep-verifiable line to OPI_E/OPI_Z. No bare "out of scope".

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline | (none) — captured in OPI_B | (none) |
| GIVER | test-cases / test-plans / XLSX | (skipped: data-sourcing refactor only, no TC semantics change; parity must verify clean) | `npm run check:tc-parity` exit 0 |
| BUILDER | `tests/locations/{location-account-address,location-left-panel-basic-information,location-local-information,location-auto-addon,location-currency,location-pricing}.spec.ts` + their `src/data/locations/*.ts` data files (the `.data` suffix was dropped in the 2026-06-05 restructure) | per-office maps + `office`-fixture specs; each first-run pass | `cd clients/encore && npx playwright test tests/locations/location-account-address.spec.ts tests/locations/location-left-panel-basic-information.spec.ts tests/locations/location-local-information.spec.ts tests/locations/location-auto-addon.spec.ts tests/locations/location-currency.spec.ts tests/locations/location-pricing.spec.ts --list` |
| HEALER | per-fix MD | (none) | (none) |
| WATCHDOG | findings | (none) | (none) |
| GARDENER | refactor citation | (none) | (none) |

---

## Acceptance criteria

- [ ] All 6 specs migrated; each data file exposes `*_EDITABLE_BY_OFFICE`/`*_FIXED_BY_OFFICE` + accessors with all 8 office entries.
- [ ] `?? PHONE1_BASELINE` fallback deleted from account-address page object (F1.1).
- [ ] Left-panel keeps Country-first reset ordering (F10.1) — confirm in `ensureDefaultState`.
- [ ] Each of the 6 specs green `--workers=1` (==today) AND green in isolation at `--workers=2` on distinct offices.
- [ ] Zero module-level `*For(` resolution across the 6 specs (F1.1).
- [ ] `npm run check:tc-parity` exit 0; `npm run typecheck` clean.
- [ ] `/regression-guard` before/after. Activity-log row (LR-028). `/final-q` verdict.

---

## Verification

```bash
cd clients/encore && for s in account-address left-panel-basic-information local-information auto-addon currency pricing; do npx playwright test tests/locations/location-$s.spec.ts --workers=1 || echo "FAIL $s"; done   # expect: no FAIL
cd clients/encore && for s in account-address left-panel-basic-information local-information auto-addon currency pricing; do npx playwright test tests/locations/location-$s.spec.ts --workers=2 || echo "FAIL2 $s"; done   # expect: no FAIL2
grep -rnE "^(export )?const .*=.*For\(" clients/encore/tests/locations/location-{account-address,left-panel-basic-information,local-information,auto-addon,currency,pricing}.spec.ts  # expect: empty
grep -n "PHONE1_BASELINE" clients/encore/src/pages/locations/location-account-address.page.ts  # expect: no '?? PHONE1_BASELINE' fallback
```

---

## Handoff (post-execution)

All six remaining Location Settings specs are per-office and individually proven isolated at workers=2. The account-address silent-fallback trap and the left-panel cascade-ordering risk are handled. Remaining specs: SSL + history (OPI_E) and local-office (OPI_F), which share OPI_C's recipe but carry their own blockers (SSL self-row hang; history per-office identity + assertion re-tightening; ECT section-save). Final flip is OPI_Z.
