# SUBPLAN_PRODUCTS_00_FOUNDATION — discover Location Products from both sites + Jira, lay net-new scaffolding (no tests)

**Status**: SUPERSEDED
**Superseded-by**: PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md (2026-08-31 — NM-2253 rules the module office-1101-only, contradicting this subplan's 1604 target; its discovery/scaffolding phases are absorbed by that plan's Phases 0.3–0.75 + 2)
**Priority**: P0
**Created**: 2026-06-22
**Identity**: OWNER (multi-identity within phases — HUNTER → GIVER → BUILDER → OWNER; WATCHDOG/GARDENER/HEALER conditional)
**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md
**Depends on**: PLAN_SELF_HELP_RESEARCH_MANDATE.md, PLAN_TIERED_DELEGATED_WALK.md
**Blocks**: SUBPLAN_PRODUCTS_FCC.md
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

The Location **Products** page (`https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/products`)
has **zero** automated coverage — no page object, selector file, test data, spec, fixture entry,
field-inventory, or walk-evidence anywhere in `clients/encore/`. It has never been explored. It is also
**structurally different** from every existing Location module: those live at
`/locations/{id}/settings/location` (shared DOM tabs, shared Save dialog) and use `navigateToSubTab()`;
Products is a **separate top-level URL** `/locations/{id}/products`, so `navigateToSubTab()` does NOT apply
and Save-dialog / rendering parity cannot be assumed — it must be walked. On the old site (nav2,
`https://navigator2.training.psav.com/#/`) Products lives as **"item search"** (baseline PRESENT).

This Foundation subplan discovers the surface from both sites + Jira and lays net-new scaffolding only —
**no tests**. It depends on the two framework plans landing first so HUNTER has working Jira access
(self-help mandate) AND the field walk runs through the Tiered Delegated Walk engine (LR-064).

---

## Bootstrap

**Identity**: OWNER (orchestrates the per-phase identities)

**Skills auto-called**:
- `/identity` (Step 1.5 gate, fires on subplan launch)
- `/regression-guard` (BEFORE + AFTER snapshots over the net-new scaffolding)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/final-q` (Phase 4 — mandatory exit per LR-042)

**Context files**:
- `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` (parent doctrine + Anti-Assumption Gates)
- `.claude/rules/inventory.md` (LR-007/013/014/015/057/062 + LR-064 TDW)
- `.claude/rules/baseline.md`, `.claude/rules/browser-tool.md`, `.claude/rules/data.md`
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, ALL-* rules)
- `docs/read_only_docs/LEARNED_RULES.md` (cross-cutting LR-NNN incl. LR-063 self-help)
- `clients/encore/CLAUDE.md` (LR-008/012/017/036, LR-ENC-001..004)
- `clients/encore/specs_planning/_internal/field-inventory-spec.md`, `field-case-generation.md`

**Anti-Assumption Gates** (binding — per `PLAN_BIG_PIVOT_FCC_MASTER.md` §Anti-Assumption Gates):
- [ ] Phase 0.5b baseline walk EXECUTED before any behavior classification (Gate 1 — LR-045 / LR-ENC-001 / LR-048 §5).
- [ ] No "corrupt / atypical / app-wide / regression" claim on <2 evidence sources (Gate 2 — LR-061).
- [ ] No control marked un-drivable without overlay-clear + reload + PO-selector-vs-live-DOM diff + DOM-inspect (Gate 3 — LR-061 / LR-021).
- [ ] No env-rationalized deferral of env-independent work (Gate 4 — LR-060).
- [ ] Un-skip + LR-019 harden applied atomically (Gate 5 — n/a here; no pre-existing tests).
- [ ] All phases complete OR a user-signed `## Deferral Authorization` block (Gate 6 — LR-060).
- [ ] Machine-enumerated walk denominator, Coverage_Ratio 100% (Gate 7 — LR-062).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm BOTH `plans/done/PLAN_SELF_HELP_RESEARCH_MANDATE.md` AND `plans/done/PLAN_TIERED_DELEGATED_WALK.md`
   exist (else HALT — HUNTER can't Jira-research and the TDW procedure (LR-064) isn't the default yet).
   Confirm `clients/encore/src/utils/field-case-runner.ts` `saveAndVerifyCase` exists. Confirm Task 0a
   LR-014 golden-rule landed (`grep "testid-first golden rule" .claude/rules/inventory.md`).
2. Read `.claude/context/navigation.md` (R00) Exploration Registry — **no Products row expected** (first
   explore); do NOT derive the surface from other Location modules.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter ALL-* + the identity prefix of
   each phase.
4. Read `.claude/context/patterns.md` — match decision-tree patterns.
5. LR scan — every active LR whose Trigger fires.
6. **Browser-tool announcement** (LR-038 v2): `BrowserTool=cli` — catalog walkthrough + locator discovery,
   unattended, grep-over-disk discipline.

---

## Phase 0.4 — Rovo Jira/Confluence research (LR-ENC-004)

Canary `getVisibleJiraProjects`; search `project = NM AND text ~ "item search"|"products"` + Confluence
CQL; emit `clients/encore/specs_planning/_internal/jira-defect-crossref-products-<DATE>.md` (each ticket =
lead, classify by-design / open / resolved); record `jira_tickets: [...]` on the baseline artifact. If Rovo
absent → log `[ROVO-SKIP]` + `rovo_available: false`, continue (degrade, don't fake).

---

## Phase 0.5b — Baseline-first walk (nav2 "item search") — non-deletable (Gate 1)

1. Visit baseline truth source first per `.claude/rules/baseline.md`. Office 1604 = "The Parker Palm Springs".
2. Emit `clients/encore/specs_planning/_internal/old-site-baseline/products-<DATE>.md` with a `## Baseline diff`
   section. Observation-only (zero data-testid on the old site).
3. Classify every observed divergence (a) regression / (b) intentional UX change (cite Jira from Phase 0.4)
   / (c) baseline-absent (`baselineScope: baseline-absent` per LR-ENC-001 — not a HALT).

---

## Phase 1 — New-site live walk + field-inventory (BLOCKED until baseline artifact exists)

Executed via the **Tiered Delegated Walk procedure (LR-064)** — Opus recon + worklist, then Haiku→Sonnet→Opus
probes, Opus verifies every report + writes the verdict trail into the walk-evidence artifact.

- Walk `/locations/1604/products`; capture the real save endpoint (LR-056) via network.
- Affordance-probe every non-editable control (LR-057): `affordance: none / launcher / navigation / popover`.
- Assign each control a `testid-disposition`: `has-testid` / `should-have-MISSING` (→ `test.fixme`, Task 0a
  LR-014) / `cant-have` (native/iframe — fallback OK).
- Cross-reference Jira ACs (Phase 0.4) into the expected column.
- Emit `clients/encore/specs_planning/_internal/field-inventories/products-<DATE>.md` — 8 frontmatter keys +
  7 sections per `field-inventory-spec.md` + **Coverage Manifest** (`scripts/walk-coverage/enumerate-page.mjs`
  + cross-check, `Coverage_Ratio 100%`, `CrossCheck clean` — LR-062 / Cx).
- Emit/refresh `clients/encore/specs_planning/_internal/walk-evidence-products-<DATE>.md` — per-field TDW
  tier + raw evidence + Opus verdict (LR-064).

---

## Phase 2 — Register TC code (root)

Add the `PRD` submodule under `submodules.LOC` in `export_test_cases/module-codes.json`:
`"PRD": {"name":"products","display":"Products","sheet":"locations_products","mdBasename":"locations_products_test_cases"}`
— **before** any `TC-LOC-PRD-NNN` is minted (guardrail 6/7). Run from repo root.

---

## Phase 3 — BUILDER scaffolding (jargon-free, LR-058; no tests)

- `clients/encore/src/selectors/locations/products.ts` — `SetupProductsSelectors = {...} as const`, own
  namespace (LR-017); Save testid from the walk.
- `clients/encore/src/pages/locations/location-products.page.ts` — `class LocationProductsPage extends
  BasePage`; `navigateToProducts()` via direct `BasePage.navigateTo(\`${base_url}locations/${officeNo}/products\`)`
  (NOT `navigateToSubTab`); `ensureDefaultState()` bounded 3-retry (LR-019); `saveAndConfirm()` to the
  discovered dialog (LR-012 — verify shared-vs-custom, don't assume).
- `clients/encore/src/data/locations/location-products.ts` — `as const`, `@office-dependent` where live-verified.
- `clients/encore/src/fixtures/pages.fixture.ts` — add `locationProductsPage` fixture.
- `/regression-guard` before + after.

---

## Phase 4 — Registry + master update + exit decision

- Add a Products row to `.claude/context/navigation.md` Exploration Registry.
- (Master roadmap subsection is added by the master-update step of this plan-set; this Foundation closure
  annotates the Foundation line.)
- **Exit decision** (logged): FCC = single subplan / merge-with-Foundation (trivial surface) / split
  per-sub-screen (large surface). Foundation's walk decides; per-sub-screen split is pre-authorized (no HALT).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Any adjacent fix noticed (same identity + same file/module + 5–30 min + no user input) → DO-NOW / SPAWN /
APPEND. Bare "out of scope" = HALT + ask (LR-040 + LR-046).

---

## Per-Identity Satisfaction Matrix

| Identity | Owned artifact | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline + Jira research | `clients/encore/specs_planning/_internal/old-site-baseline/products-<DATE>.md`<br>`clients/encore/specs_planning/_internal/jira-defect-crossref-products-<DATE>.md` | grep freshness ≤14d; `jira_tickets:` key present (or `rovo_available: false`) |
| GIVER | field-inventory + walk-evidence | `clients/encore/specs_planning/_internal/field-inventories/products-<DATE>.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-products-<DATE>.md` | 8 keys + 7 sections + `Coverage_Ratio 100%`; per-field TDW verdict present |
| BUILDER | scaffolding | `clients/encore/src/pages/locations/location-products.page.ts`<br>`clients/encore/src/selectors/locations/products.ts`<br>`clients/encore/src/data/locations/location-products.ts`<br>`clients/encore/src/fixtures/pages.fixture.ts` | `npm run typecheck` (root) clean |
| HEALER | — | `(skipped: net-new scaffolding only; no failing/false-green spec exists in Foundation to heal)` | n/a |
| WATCHDOG | — | `(skipped: no spec authored in Foundation; coverage-manifest cross-check rides the GIVER field-inventory; FCC-completeness audit runs in SUBPLAN_PRODUCTS_FCC Phase 4 per AUD-017)` | n/a |
| GARDENER | — | `(skipped: net-new scaffolding reviewed by /regression-guard; no structural refactor of existing code in Foundation)` | n/a |
| OWNER | activity log + index | `clients/encore/specs_planning/_internal/agent-activity-log.md`<br>`plans/INDEX.md` | `npm run plans:reindex` (root) clean |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] Both `Depends on:` plans are in `plans/done/` before any walk.
- [ ] Baseline + Jira-crossref + field-inventory + walk-evidence emitted, all dated `<DATE>`, freshness ≤14d.
- [ ] Coverage Manifest present: machine-enumerated via `scripts/walk-coverage/enumerate-page.mjs`, every union element dispositioned, `CrossCheck: clean`, `Coverage_Ratio 100%` (LR-062 / Cx).
- [ ] `PRD` registered in `export_test_cases/module-codes.json` before any TC minted.
- [ ] 4 scaffolding files created; `npm run typecheck` (root) clean; NO `.spec.ts` authored.
- [ ] `/regression-guard` snapshot before/after = no silent breakage.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.

---

## Verification

```bash
ls plans/done/PLAN_SELF_HELP_RESEARCH_MANDATE.md plans/done/PLAN_TIERED_DELEGATED_WALK.md   # both closed first
grep '"PRD"' export_test_cases/module-codes.json                                            # products entry
ls clients/encore/specs_planning/_internal/old-site-baseline/products-*.md \
   clients/encore/specs_planning/_internal/jira-defect-crossref-products-*.md \
   clients/encore/specs_planning/_internal/field-inventories/products-*.md \
   clients/encore/specs_planning/_internal/walk-evidence-products-*.md
ls clients/encore/src/pages/locations/location-products.page.ts \
   clients/encore/src/selectors/locations/products.ts \
   clients/encore/src/data/locations/location-products.ts
npm run typecheck                                                                            # root, clean
node scripts/check-subplan-identity.mjs plans/pending/SUBPLAN_PRODUCTS_00_FOUNDATION.md
```

---

## Handoff (post-execution)

Chat-only summary per `feedback_handoff_in_chat_only.md`. On close, the Products surface is discovered
(both sites + Jira), the denominator is 100% dispositioned, the PRD code is registered, and net-new
scaffolding exists with no tests. `SUBPLAN_PRODUCTS_FCC.md` inherits the field-inventory, scaffolding, and
the exit decision (single / merged / split).
