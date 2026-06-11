# SUBPLAN_CORP_PRICING_PRE_EDGE — map every field/page dependency in Corporate Pricing (Wave 2.5)

> 🤖 **SESSION BOOTSTRAP — invoke with `/execute SUBPLAN_CORP_PRICING_PRE_EDGE.md`. All context below; zero extra prompting.**
>
> On load the agent self-bootstraps: **(1)** load `/identity` per the Identity field (GIVER). **(2)** load Skills below. **(3)** resolve model/thinking/permission from frontmatter (Opus `xhi`, `auto`). **(4)** **Dependency gate** — verify all three `Depends on` FCC subplans are in `plans/done/`; HALT if any is still pending. **(5)** read master `PLAN_CORP_PRICING_MASTER.md` Doctrine + the 5 field-inventories + the encore-questions-drafts. **(6)** `BrowserTool=cli` (announce). **(7)** Phase 0 FIRST. **(8)** execute Phases 1→3 + Phase 2.5. **(9)** handoff: flip the Status field to DONE, add the Executed date, append the activity-log row (LR-028/LR-037), `git mv` to `plans/done/`, `npm run plans:reindex`.
>
> **HALT + ASK** if: a dependency is blocked / scope ambiguity beyond the field roster / the live walk needs a CREATE that can't be safely reversed / regression-guard shows unrelated changes / any inventory field cannot be classified into one of the three allowed buckets (LR-040 closure gate).

**Status**: PENDING
**Priority**: P2
**Created**: 2026-06-09
**Identity**: GIVER
**Parent**: PLAN_CORP_PRICING_MASTER.md
**Depends on**: SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md, SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md, SUBPLAN_CORP_PRICING_1443_DETAIL_FCC_P2.md
**Blocks**: SUBPLAN_CORP_PRICING_EDGE_P3.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a

---

## Context

**WAVE 2.5 (inserted between Wave-2 FCC and Wave-3 Edge).** EDGE_P3 is the only place cross-field integration is tested, but it currently has *no map of which field on which page touches/depends on which field on which page* — so its "cross-field" coverage is whatever the executor happens to notice, not a guaranteed enumeration. This subplan closes that gap: a **GIVER-led live walk that produces ONE dependency-map artifact** enumerating every Corporate Pricing field's within-page and cross-page relationships, so EDGE_P3 consumes a complete map instead of improvising.

**Deliverable boundary (user decision 2026-06-09):** this subplan produces the **dependency-map artifact + raised/filed bugs ONLY**. It does **NOT** write integration specs — EDGE_P3 owns the cross-field test authoring and consumes this map as its input. Clean separation, no overlap.

**Why now (sequence):** it Depends-on the three Wave-2 FCC subplans so it runs only after the per-field inventories are complete (Search/Strategy/Detail FCC enrich the field rosters) — mapping before then would map an incomplete field set and miss things. It Blocks EDGE_P3 so edge cannot run until the map exists.

**Anti-rework mandate (user, verbatim): do not waste time re-mapping what is already mapped.** Five field-inventories already exist (`search`/`strategy`/`detail` 2026-06-05, `override`/`toolbar-io` 2026-06-08) and the encore-questions-drafts already record concrete relations. Phase 1 ingests these as the seed; Phase 2 walks **only the gaps**.

**Bug doctrine (master Doctrine 2):** while walking dependencies, anything suspicious/buggy → raise an `/encore-questions` clarification, or file per LR-034 once it reproduces in the runner (LR-044). Never silently absorb it. Two candidates already in flight are owned elsewhere but must be carried into the map: **CPR-DETAIL-BUG-A** (New-Price-only edit doesn't reliably enable Save) and **Q-WV15-1** (Override edit-activation blocked / permission-lock).

**Jira defect cross-ref (UNVERIFIED leads — prove each on the live site before it becomes a test expectation OR a filing, LR-044)**: `clients/encore/specs_planning/_internal/jira-defect-crossref-2026-06-09.md` §D names two cross-page edges this map MUST carry — **NM-1675** (Override `Current Price` is computed from the location's assigned pricebook → editing the location default changes it) and **NM-2068** (assigning a location pricebook should populate the strategy's "Locations Using" list — known bug, doesn't). The trigger for both lives on the Location Settings > Pricing tab (outside the 5 screens): reach that bridge or classify `blocked-pending-question` per the scope call. It is an external AI's Jira-search output — reproduce live before filing.

**Provenance:** user directive 2026-06-09 — "an agent whose job is to find what field in what page depends and touches what field on what page of corp pricing… no misses… thorough… follow doctrine to find bugs."

---

## Bootstrap

**Identity**: GIVER (the whole subplan; conditional HEALER only if a walk reproduces a defect to file). Clean re-load at each switch.
**Skills auto-called**: `/identity`, `/regression-guard`, `/relevant`, `/find-bugs` (doctrine — report suspicious behavior, not a separate adversarial hunt), `/rca` (if a relation walk surfaces a reproducible defect), `/final-q`.
**Context files**: `PLAN_CORP_PRICING_MASTER.md` (Doctrine 2 + Divergence Ledger), the 5 `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-*.md`, the `clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-*-divergences-*.md` drafts, `field-case-generation.md`, `clients/encore/src/data/corporate-pricing/common.ts` (`CORPORATE_PRICING_FIXTURES`) + `override.ts` (`CORP_PRICING_OVERRIDE_FIXTURE`), `.claude/rules/{specs,angular,inventory,baseline,browser-tool}.md` (LR-009 revert, LR-019 per-test baseline, LR-022 no hardcoded counts, LR-031 no-lazy-skip, LR-034/LR-030/LR-044 bug doctrine, LR-036 boolean, LR-ENC-001 baseline truth).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm all three `Depends on` FCC subplans are DONE in `plans/done/`; HALT if any pending.
2. Read `.claude/context/navigation.md` Exploration Registry for corporate-pricing; pull findings instead of re-exploring.
3. LR scan: LR-031 (no lazy skip — every field classified), LR-034/LR-030/LR-044 (bug doctrine), LR-022 (no hardcoded counts vs virtualized grids), LR-019 (per-test baseline for any save-cycle observation), LR-009 (revert ≠ pristine), LR-036 (boolean render per page), LR-ENC-001 (baseline-absent), LR-040/LR-046 (closure / strict-line).
4. `BrowserTool=cli`, sessions `-s=cpr-depmap` on `clients/encore/.auth/encore-state.json`. Announce the choice + reason in the first output.
5. **Mutation safety**: any "edit field A → observe field B" save-cycle uses the matching fixture (`strategyFixture` / `detailFixture` / `CORP_PRICING_OVERRIDE_FIXTURE`) with bounded-retry `ensureDefaultState()` restore. NEVER mutate an arbitrary pricebook. Cross-page flows that would require an irreversible CREATE (e.g. New-Pricebook → Search-list) are observed against EXISTING data where possible; if a create is unavoidable, HALT + ask (do not invent disposable data).

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL — REQUIRED: output drives EDGE TC design + bug doctrine)

1. Consume the S0 baseline-absent note. `## Baseline diff` = "baseline-absent; Corporate Pricing is net-new on e2e (no nav2 equivalent) — intent oracle = live DOM + the 5 field-inventories; LR-ENC-001 `baselineScope: baseline-absent`." Not a HALT.

---

## Phase 1 — Ingest the already-mapped relations (anti-rework gate) + build the field roster

1. **Build the master field roster** — extract every enumerated field/control/column from all 5 inventories into one list keyed by `(page, field)`. This is the completeness denominator (every entry must appear in the final map). Approx counts to reconcile against (verify live, do not hardcode — LR-022): Search ~25, Strategy ~25, Detail ~8 functional, Override ~25, Toolbar-I/O ~14.
2. **Seed the map from documented relations** — transcribe every relation ALREADY recorded (do NOT re-walk these; cite the inventory + line):
   - Strategy: `Is Productions` (checked) → disables `Is Internal` + `Is GSO` (within-page gating).
   - Detail: `New Price` → becomes `Price` on Save (staging); `Max Discount` edit → reliably enables Save; `New Price`-only edit → Save NOT reliably enabled (**CPR-DETAIL-BUG-A**); `Price` updates to saved override (CPR-DETAIL-Q2).
   - Override: `Select a location` → gates the whole grid; `Equipment`/`Labor` tab → resets grid (independent spaces); `Active only` → filters rows; `Currency` → narrows; `Filter Product Groups Override` → client-side row filter; `Override Price`/`Max Discount %`/`Active` edit-activation → **blocked, Q-WV15-1**.
   - Cross-page: `Pricing Override` button → `/pg-override`; `New ▾` → `/add?type=equipment|labor`; Search row → `/details/<guid>`; **Save button + "Save Changes" dialog SHARED across Strategy ↔ Detail tabs**.
3. Mark each seeded relation `documented` (source-cited) so Phase 2 skips it.

---

## Phase 2 — Gap walk: classify EVERY remaining field's dependencies live (no misses)

For every `(page, field)` in the roster NOT already classified in Phase 1, walk live (CLI) and assign exactly one classification — this is the strict completeness contract:

- **`depends-on: [list]`** — field demonstrably touches/affects/depends on other field(s). Capture direction (A→B), trigger (edit/select/toggle/save), and scope (within-page | cross-page). Save-cycle observations cite a timestamp + before/after value (per LR-019, fixture-restored).
- **`independent-verified`** — walked, no relationship observed (the field neither affects nor is affected by another). Must be *verified live*, not assumed.
- **`blocked-pending-question: <Q-ID>`** — cannot be exercised yet (e.g. Override edit-activation behind Q-WV15-1, or anything RBAC-gated for the automation user). This IS coverage (an explicit, auditable gap), NOT a miss — never a silent skip (LR-031).

**Cross-page data-flow** (the user's headline case) is walked explicitly for: New-Pricebook create → appears in Search list; Override Price → reflected in Detail/Search display; Strategy selection → Detail grid; shared-Save commit on one tab → state on the other. Where a create is required and not safely reversible, classify `blocked-pending-question` with a note (do not mutate unsafely).

**Bug doctrine throughout:** any suspicious/buggy behavior surfaced by the walk → record as an `/encore-questions` clarification when cause is unclear, or (HEALER, conditional) reproduce in the runner per LR-044 and file `reports/bugs/BUG-CPR-NNN.json` per LR-034. If this walk reproduces **CPR-DETAIL-BUG-A** in a fresh runner context, file it (it was deferred here-or-FCC for exactly this confirmation).

---

## Phase 3 — Emit the dependency-map artifact + bug/question ledger

1. Write `clients/encore/specs_planning/_internal/corporate-pricing-dependency-map-<session-date>.md` (dated per the `_internal` walk-artifact convention; sibling to walk-evidence). Structure:
   - **Frontmatter**: module, MCP_Session_Date, sources (the 5 inventories + drafts).
   - **Completeness header**: `fields mapped = N` and `N == sum of fields across the 5 inventories` (the no-miss equality).
   - **The map table**: `Page | Field | Type | Within-page deps | Cross-page deps | Classification (depends-on / independent-verified / blocked-pending-question) | Evidence (inventory-cite | save-cycle timestamp | network | Q-ID)`.
   - **Cross-page data-flow section**: directed edges (page A field → page B field) with trigger + evidence.
   - **Bugs/Questions ledger**: `Bugs filed: BUG-CPR-… | NONE`; `Questions raised/carried: Q-WV15-1, CPR-DETAIL-BUG-A, … | NONE`.
2. This artifact is EDGE_P3's input — note that EDGE authors the cross-field integration tests from it.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Adjacent fixes noticed during the walk → DO-NOW (<30 min, same identity/file) or APPEND a grep-verifiable line to a named pending recipient (EDGE_P3 for test-authoring items). Bare "follow-up later" with no recipient = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline freshness | `(skipped: baseline-absent net-new module per LR-ENC-001; reuses the 5 existing corporate-pricing field-inventories as input — no new baseline walk)` | grep baseline-absent note |
| GIVER | the dependency-map artifact (this subplan's sole product) | `(skipped: produced on activation — clients/encore/specs_planning/_internal/corporate-pricing-dependency-map-<session-date>.md; cannot pre-date before the gated live walk runs)` | `ls clients/encore/specs_planning/_internal/corporate-pricing-dependency-map-*.md` |
| BUILDER | (none — no selectors/page-objects/specs; EDGE_P3 owns integration tests) | `(none)` | n/a |
| HEALER | conditional bug filing | `(skipped: conditional — only if the gap walk reproduces a defect (e.g. CPR-DETAIL-BUG-A) in a fresh runner; then files reports/bugs/BUG-CPR-NNN.json per LR-034/LR-044)` | `ls reports/bugs/ on activation` |
| WATCHDOG | completeness audit of the map | `(skipped: on activation — verifies fields-mapped == sum of inventory fields, every field classified; no spec/MD/XLSX edits)` | field-count parity check |
| GARDENER | (none) | `(none)` | n/a |

---

## Acceptance criteria (LR-040 / LR-031 closure gate — strict, user-mandated "no misses")

- [ ] Phase 1 seeded the map from ALL already-documented relations (each source-cited); zero of them re-walked.
- [ ] **Every** `(page, field)` in the combined roster of the 5 inventories appears in the map exactly once with a classification — `depends-on:[...]` | `independent-verified` | `blocked-pending-question:<Q-ID>`. `fields mapped == sum of inventory fields` (strict equality, stated in the artifact header). No silent skips (LR-031).
- [ ] Cross-page data-flow explicitly walked (create→list, override→display, strategy→detail, shared-Save cross-tab) — each an edge in the map or an explicit `blocked-pending-question`.
- [ ] Bug doctrine honoured: ledger states `Bugs filed: [IDs|NONE]` + `Questions raised/carried: [IDs|NONE]`; CPR-DETAIL-BUG-A + Q-WV15-1 carried.
- [ ] All save-cycle observations fixture-restored (zero drift); no arbitrary pricebook mutated.
- [ ] Artifact path exists; EDGE_P3 Depends-on includes this subplan (wiring verified).

---

## Verification

```bash
# 1. The map artifact exists and asserts its own completeness:
ls clients/encore/specs_planning/_internal/corporate-pricing-dependency-map-*.md   # expect: 1 file
grep -E "fields mapped\s*=\s*[0-9]+" clients/encore/specs_planning/_internal/corporate-pricing-dependency-map-*.md  # expect: a count == sum of inventory fields

# 2. No field left unclassified (every row has one of the 3 buckets):
grep -cE "depends-on:|independent-verified|blocked-pending-question" clients/encore/specs_planning/_internal/corporate-pricing-dependency-map-*.md  # expect: == fields mapped

# 3. EDGE consumes it (wiring):
grep "PRE_EDGE" plans/pending/SUBPLAN_CORP_PRICING_EDGE_P3.md   # expect: in Depends-on
```

---

## Handoff

Wave-2.5 cross-field/cross-page dependency map. Produces one auditable map (every Corp Pricing field classified depends-on / independent / blocked) + a bug/question ledger; raises or files anything suspicious per doctrine. EDGE_P3 inherits the map as the input for its cross-field integration tests. Gated on the three Wave-2 FCC subplans; blocks EDGE_P3.
