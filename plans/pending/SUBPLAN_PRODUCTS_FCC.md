# SUBPLAN_PRODUCTS_FCC — full FCC field-matrix coverage for Location Products (P1, ship-first batch)

**Status**: PENDING
**Priority**: P1
**Created**: 2026-06-22
**Identity**: OWNER (multi-identity within phases — GIVER → BUILDER → WATCHDOG → GARDENER → OWNER; HEALER conditional)
**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md
**Depends on**: SUBPLAN_PRODUCTS_00_FOUNDATION.md
**Blocks**: SUBPLAN_PRODUCTS_DQU.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**Author**: Rutvik (via Claude Opus 4.8)
**ActiveClient**: encore

co-doctrine: §False-Green Sweep Doctrine + §Anti-Assumption Gates (PLAN_BIG_PIVOT_FCC_MASTER.md) — NOT a second Parent.

---

## Context

With Foundation done (surface discovered, scaffolding laid, PRD registered), this subplan ships the **first
shippable batch**: full FCC field-matrix coverage — one independent `test()` per (field × case-class) per
`field-case-generation.md` §2 (positive / BVA / negative / save-cycle / each-option) + the §2.1
rejection-affordance oracle. FCC's positive + save-cycle cases ARE the functional/happy-path coverage, so
there is no separate DOCX-functional tier. This is the **P1** wave per the corp-pricing priority model —
ship it, then DQU (P2) layers deep-quality cases.

---

## Bootstrap

**Identity**: OWNER (orchestrates the per-phase identities)

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (BEFORE + AFTER over the authored spec + page object)
- `/relevant` (Phase 0.5 injection)
- `/find-bugs` (Phase 4 adversarial pass — Jira-aware per the self-help plan)
- `/final-q` (mandatory exit per LR-042)

**Context files**:
- `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` (Doctrine + False-Green Sweep + Anti-Assumption Gates)
- `clients/encore/specs_planning/_internal/field-case-generation.md` (§2 templates, §2.1 oracle)
- `clients/encore/specs_planning/_internal/field-inventories/products-<DATE>.md` (Foundation output)
- `.claude/rules/inventory.md`, `.claude/rules/specs.md`, `.claude/rules/baseline.md`, `.claude/rules/data.md`
- `docs/read_only_docs/{AGENT_SHARED_RULES,LEARNED_RULES}.md`, `clients/encore/CLAUDE.md`

**Anti-Assumption Gates** (binding — per parent §Anti-Assumption Gates):
- [ ] Phase 0.5b baseline freshness re-checked before any classification (Gate 1).
- [ ] N≥2 evidence before any generalization (Gate 2 — LR-061).
- [ ] Verify-before-blocked on any control (Gate 3).
- [ ] No env-rationalized deferral of env-independent work (Gate 4 — LR-060).
- [ ] Atomic un-skip + LR-019 harden (Gate 5).
- [ ] All phases complete OR user-signed `## Deferral Authorization` (Gate 6 — LR-060).
- [ ] Coverage denominator 100% dispositioned (Gate 7 — LR-062, inherited from Foundation).

---

## Phase 0 — Dependency gate

1. `SUBPLAN_PRODUCTS_00_FOUNDATION.md` is in `plans/done/`.
2. Field-inventory `products-<DATE>.md` ≤14d fresh (LR-013 spot-check 2–3 random fields on live DOM).
3. BrowserTool announce: `cli`.

---

## Phase 0.5a — WATCHDOG verification gate + false-green pre-audit

- Emit `clients/encore/specs_planning/_internal/phase-0-verification-products-<DATE>.md` — **PROCEED
  required** before any spec work (nested-orbit v2 Phase 0 checks).
- Emit `clients/encore/specs_planning/_internal/false-green-sweeps/products-<DATE>.md` — net-new module
  (0 pre-existing tests); the 13 sweeps run against the AUTHORED spec at Phase 4.

## Phase 0.5b — Baseline freshness

Confirm Foundation's baseline + field-inventory + jira-crossref ≤14d; reuse per LR-013 (no re-walk unless drift).

---

## Phase 2 — GIVER: catalog + TCs + workbook

- **Step 0 — coverage ledger**: grep `clients/encore/tests/` for any existing Products assertion (expect
  none; record the honest zero).
- **Step 1 — Jira enrichment (PLN-051)**: every Jira AC/validation from the crossref becomes a TC candidate;
  DOM-vs-Jira contradictions classified (intentional / app-bug / stale).
- Emit field-case-catalog `clients/encore/specs_planning/_internal/field-case-catalogs/products-<DATE>.md`.
- Append the FCC block to `clients/encore/specs_planning/test-cases/setup/locations/locations_products_test_cases.md`.
- Add Scenarios to the locations test-plan.
- `npm run planner:post-complete <id>` (root) — confirm `[OK] XLSX workbook fresh:` + rows == MD count.
- `npm run check:tc-parity` (root) exit 0.
- IDs `TC-LOC-PRD-001..0NN` (count from the walk). Priority column `High` = happy-path/save-cycle,
  `Medium` = BVA/negative.

---

## Phase 3 — BUILDER: FCC spec (blend-at-top)

- FCC `test.describe` at the **TOP** of `clients/encore/tests/locations/location-products.spec.ts`
  (blend-at-top, NO `@fcc` tag/describe; tag `@locations @products`), each test independent via
  `saveAndVerifyCase()`.
- **`should-have-MISSING` testid fields → `test.fixme('awaiting data-testid: <field>')`** (not run even if a
  fallback would make it green; the TC still ships in MD/XLSX fixme-synced, never silently dropped — Task 0a
  LR-014).
- Finish `ensureDefaultState` / `saveAndConfirm` on the page object.
- §2.1 rejection-affordance oracle on every negative/BVA (announced AND escapable — natural blur before any
  cleanup Escape).
- `/regression-guard` before + after; net-new spec green ×2.

---

## Phase 4 — WATCHDOG (SEPARATE session, AUD-017)

- Finalize the 13-sweep against the authored spec (`false-green-sweeps/products-<DATE>.md`).
- FCC-completeness audit → `clients/encore/specs_planning/_internal/fcc-completeness-audit-products-<DATE>.md`.
- `/find-bugs` adversarial pass — Jira-aware (cross-check "is this by-design?" before flagging, per the
  self-help plan's AUDIT change).

## Phase 5 — GARDENER

Typecheck / lint / JSDoc / dedup / barrel / parity sweep (inline; escalate if dedup surfaces a cross-module helper).

## Phase 6 — OWNER closure

Status → DONE, Execution Summary (LR-027), activity-log (LR-028), `git mv` to `done/`, `npm run plans:reindex`
(LR-035), annotate the master roadmap Products line `— DONE <DATE>` (C4 cascade), closure manifest,
`LR-027 cascade SKIPPED per master plan §Cascade closure rules (user override 2026-05-21)`, `/final-q`.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

DO-NOW / SPAWN / APPEND for every adjacent fix; bare "out of scope" = HALT + ask (LR-040 + LR-046).

---

## Per-Identity Satisfaction Matrix

| Identity | Owned artifact | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline + Jira (reused) | `(skipped: baseline + field-inventory + jira-defect-crossref produced in SUBPLAN_PRODUCTS_00_FOUNDATION; reused here with freshness re-checked per LR-013)` | grep freshness ≤14d |
| GIVER | catalog + TCs + workbook | `clients/encore/specs_planning/_internal/field-case-catalogs/products-<DATE>.md`<br>`clients/encore/specs_planning/test-cases/setup/locations/locations_products_test_cases.md`<br>`clients/encore/testcases/encore_test_cases.xlsx` | `npm run check:tc-parity` (root) exit 0 |
| BUILDER | spec + helpers | `clients/encore/tests/locations/location-products.spec.ts`<br>`clients/encore/src/pages/locations/location-products.page.ts` | `npx playwright test … location-products.spec.ts --list` resolves all `TC-LOC-PRD-*` |
| HEALER | conditional | `(skipped: net-new spec; no pre-existing failing/false-green tests; HEALER fires only if Phase 4 returns RED)` | n/a |
| WATCHDOG | verification + sweep + audit | `clients/encore/specs_planning/_internal/phase-0-verification-products-<DATE>.md`<br>`clients/encore/specs_planning/_internal/false-green-sweeps/products-<DATE>.md`<br>`clients/encore/specs_planning/_internal/fcc-completeness-audit-products-<DATE>.md` | PROCEED + sweep GREEN + audit GREEN (fresh session) |
| GARDENER | refactor citation | `(skipped: typecheck/lint/dedup run inline in Phase 5; no shared-helper extraction for one module — escalate if dedup surfaces a cross-module helper)` | `npm run typecheck` (root) clean |
| OWNER | closure | `plans/_closure_manifests/SUBPLAN_PRODUCTS_FCC.md.manifest.json`<br>`plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` | `node scripts/validate-plan-closure.mjs --plan plans/done/SUBPLAN_PRODUCTS_FCC.md --enforce` PASS |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] Every Jira AC + every taxonomy cell from the field-inventory is (a) MCP-proven via a TC, (b) deferred with a grep-verifiable line item in `SUBPLAN_PRODUCTS_DQU.md`, or (c) user-flagged with a named bug-ID.
- [ ] `should-have-MISSING` testid fields are `test.fixme` (not run even if green); each ships in MD/XLSX fixme-synced (Task 0a LR-014).
- [ ] phase-0-verification PROCEED + 13-sweep GREEN + FCC-completeness audit GREEN (fresh WATCHDOG session, AUD-017).
- [ ] `npm run check:tc-parity` (root) exit 0; XLSX rows == MD count.
- [ ] Full spec green ×2 (`--retries=0 --workers=1`).
- [ ] `/regression-guard` snapshot before/after = no silent breakage.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.

---

## Verification

```bash
ls plans/done/SUBPLAN_PRODUCTS_00_FOUNDATION.md
ls clients/encore/tests/locations/location-products.spec.ts
npx playwright test clients/encore/tests/locations/location-products.spec.ts --list   # all TC-LOC-PRD-* resolve
npm run check:tc-parity                                                                # root, exit 0
ls clients/encore/specs_planning/_internal/phase-0-verification-products-*.md \
   clients/encore/specs_planning/_internal/false-green-sweeps/products-*.md \
   clients/encore/specs_planning/_internal/fcc-completeness-audit-products-*.md
node scripts/validate-plan-closure.mjs --plan plans/pending/SUBPLAN_PRODUCTS_FCC.md --dry-run
```

---

## Handoff (post-execution)

Chat-only summary per `feedback_handoff_in_chat_only.md`. On close, the shippable FCC field-matrix batch is
green and parity-clean; `SUBPLAN_PRODUCTS_DQU.md` inherits the catalog, the walk's cross-field findings, and
the LR-040(b) seed list for the deep-quality wave.
