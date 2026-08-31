# SUBPLAN_PRODUCTS_DQU — deep-quality coverage for Location Products (P2, GATED stub)

**Status**: GATED
**Priority**: P2
**Created**: 2026-06-22
**Identity**: OWNER (multi-identity within phases — GIVER → BUILDER → WATCHDOG → GARDENER → OWNER; HEALER conditional)
**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md
**Depends on**: PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md (repointed 2026-08-31 — SUBPLAN_PRODUCTS_FCC.md SUPERSEDED)
**Blocks**: none
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

The **P2** deep-quality wave for Location Products — runs only after `SUBPLAN_PRODUCTS_FCC.md` (P1) ships.
Authored **now** as a GATED stub carrying the full LR-048 structural minimum so structure can never be
silently dropped (RC-3 prevention). The seed list below is the LR-040(b) grep-verifiable recipient that lets
the FCC wave close with zero phantom hand-offs; full TC design happens after FCC closes + the walk reveals
cross-field dependencies. Each phase is marked "FILL IN at activation — same per-module FCC obligations."

---

## Bootstrap

**Identity**: OWNER (orchestrates the per-phase identities)

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (BEFORE + AFTER)
- `/relevant` (Phase 0.5 injection)
- `/find-bugs` (adversarial, Jira-aware)
- `/final-q` (mandatory exit per LR-042)

**Context files**:
- `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` (Doctrine + Anti-Assumption Gates)
- `clients/encore/specs_planning/_internal/field-inventories/products-<DATE>.md` (Foundation output)
- `clients/encore/specs_planning/_internal/field-case-catalogs/products-<DATE>.md` (FCC output)
- `.claude/rules/inventory.md`, `.claude/rules/specs.md`; `docs/read_only_docs/{AGENT_SHARED_RULES,LEARNED_RULES}.md`; `clients/encore/CLAUDE.md`

**Anti-Assumption Gates** (binding — per parent §Anti-Assumption Gates): the same 7 gates as the FCC subplan
apply at activation. (Stub state — re-checked when GATED → PENDING.)

---

## Phase 0 — Dependency gate (FILL IN at activation)

`SUBPLAN_PRODUCTS_FCC.md` in `plans/done/`; field-inventory + catalog ≤14d fresh (re-walk if drift).

## Phase 0.5 — Verification + false-green pre-audit (FILL IN at activation — same per-module FCC obligations)

phase-0-verification PROCEED gate + 13-sweep against the FCC spec before adding DQU cases.

## Phase 2 — GIVER deep-quality catalog (FILL IN at activation — same per-module FCC obligations)

Derive deep-quality TCs from the seed list below + the walk's recorded cross-field dependencies; append to
the Products test-cases MD + test-plan + XLSX; `check:tc-parity` exit 0.

## Phase 3 — BUILDER (FILL IN at activation — same per-module FCC obligations)

Blend-at-top into `location-products.spec.ts`; `saveAndVerifyCase()`; testid→fixme per Task 0a LR-014;
§2.1 oracle; green ×2.

## Phase 4 — WATCHDOG (FILL IN at activation — SEPARATE session, AUD-017)

13-sweep finalize + completeness audit + Jira-aware `/find-bugs`.

## Phase 5 — GARDENER (FILL IN at activation)

Typecheck / lint / dedup sweep.

## Phase 6 — OWNER closure (FILL IN at activation)

Status → DONE, Execution Summary (LR-027), activity-log, `git mv` to `done/`, `plans:reindex`, master
annotation `— DONE <DATE>`, closure manifest, cascade-skip citation, `/final-q`.

---

## Seed list (grep-verifiable, refined post-walk)

cross-field & cascade validation · grid virtualization / large-list stress · cell-edit restrictions ·
compound multi-filter / multi-field save · neutral-eye adversarial findings · a11y (keyboard / aria) · RBAC
(role-gated visibility) · file **import** round-trip (if present) · file **export** round-trip (if present).
TC band: starts where FCC ends (post-walk).

**NM-2253 repoint notes (2026-08-31)**: (1) Office scope is **1101** (`locations/1101/products`) per the NM-2253 ticket ruling — not 1604; all DQU work inherits that pin (LR-ENC-007 carve-out, LR-ENC-005 corporate office). (2) The `a11y (keyboard / aria)` seed item must be re-scoped to **behaviour-only** at activation — LR-ENC-009 (2026-08-28) bars DOM/markup accessibility findings as bugs/TCs/observations for Encore. (3) The upstream artifacts now live in the **item-search** namespace (module `ISR`, submodules `PRS`/`PCD`/`PGR`; `tests/item-search/`, `field-inventories/item-search-*`, `field-case-catalogs/item-search-*`), superseding this stub's `location-products` / `products-<DATE>` placeholders — re-path at activation.

### NM-2253 deferred-to-DEEP seeds (appended at PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK closure)

(rows appended by that plan's Phase 4 — each a grep-verifiable LR-040(b) line item)

**Exhaustiveness guarantee:** the element set is already guaranteed by **LR-062** (Foundation Coverage
Manifest — 100% dispositioned; Cx blocks <100%); DQU inherits it. The only axis LR-062 doesn't auto-enumerate
is cross-field **combinations** — so DQU adds the corp-pricing Wave-2.5 dependency-map (every field
`depends-on:[…]` / `independent-verified` / `blocked-pending-question`) **only if the walk records ≥1 real
cross-field dependency**; else `(skipped: walk found no cross-field deps)`.

---

## Per-Identity Satisfaction Matrix (shell — FILL IN at activation)

| Identity | Owned artifact | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline + Jira (reused) | `(skipped: produced in Foundation; reused at activation with LR-013 freshness re-check)` | grep freshness ≤14d |
| GIVER | deep-quality catalog + TCs | `(none)` — FILL IN at activation: `field-case-catalogs/products-dqu-<DATE>.md` + Products test-cases MD rows | `npm run check:tc-parity` (root) exit 0 |
| BUILDER | deep-quality spec block | `(none)` — FILL IN at activation: DQU `test.describe` in `clients/encore/tests/locations/location-products.spec.ts` | `npx playwright test … location-products.spec.ts --list` |
| HEALER | conditional | `(skipped: fires only if Phase 4 returns RED)` | n/a |
| WATCHDOG | verification + sweep + audit | `(none)` — FILL IN at activation: `phase-0-verification` + `false-green-sweeps` + `fcc-completeness-audit` dated docs | PROCEED + GREEN (fresh session) |
| GARDENER | refactor citation | `(skipped: typecheck/lint/dedup inline at activation; escalate cross-module helper)` | `npm run typecheck` (root) clean |
| OWNER | closure | `(none)` — FILL IN at activation: `plans/_closure_manifests/SUBPLAN_PRODUCTS_DQU.md.manifest.json` | `node scripts/validate-plan-closure.mjs --plan plans/done/SUBPLAN_PRODUCTS_DQU.md --enforce` PASS |

---

## Acceptance criteria (LR-040 closure gate — FILL IN at activation)

- [ ] Every seed-list item is (a) covered by a DQU TC, (b) deferred with a grep-verifiable recipient, or (c) user-flagged not-applicable.
- [ ] phase-0-verification PROCEED + 13-sweep GREEN + completeness audit GREEN (fresh WATCHDOG session).
- [ ] `npm run check:tc-parity` (root) exit 0; full spec green ×2.
- [ ] `/regression-guard` before/after = no silent breakage.
- [ ] Activity-log row per LR-028; `/final-q` verdict block per LR-042.

---

## Verification (FILL IN at activation)

```bash
ls plans/done/SUBPLAN_PRODUCTS_FCC.md                                  # gate satisfied
npx playwright test clients/encore/tests/locations/location-products.spec.ts --list
npm run check:tc-parity                                                # root, exit 0
```

---

## Handoff (post-execution)

Chat-only summary per `feedback_handoff_in_chat_only.md`. This is the terminal Products subplan — on close,
Location Products is FCC + deep-quality covered end to end.
