# SUBPLAN_OPI_G_MIGRATE_CORP_PRICING — migrate Corporate Pricing specs to per-office isolation

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-06-12
**Identity**: OWNER
**Parent**: PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md
**Depends on**: SUBPLAN_OPI_C_MIGRATE_LEGAL_PILOT.md, SUBPLAN_OPI_B_POOL_SELECTION_ACCESS_CAPTURE.md
**Blocks**: SUBPLAN_OPI_Z_FINAL_FLIP_AND_CLEANUP.md
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: live structural-parity judgment across pool offices for Corporate Pricing entities (do equivalent pricebooks/strategies/override rows even EXIST per office?) + the feasibility-fallback decision + RCA-class `--workers=2` flake analysis = adaptive max-judgment work → Opus `max`.
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a (single tool — `cli`; live structural-parity walk across pool offices + `--workers=2` flake RCA run HEADED cli per the `/rca` row of `.claude/rules/browser-tool.md`)
**Parked**: 2026-06-12 per user — runs in the parked OPI wave, after OPI_A infra + OPI_B confirmed pool land. Authored 2026-06-12 from the corp-pricing contention research; not executed.

---

## Context

The OPI initiative gives each parallel worker its own office so no two workers ever save the same location (the proven locations clobber: workers=2 → 7/20 fail, workers=1 → 20/20). **Corporate Pricing (~94 specs, landed 2026-06-08/09) was NOT in the original OPI scope.** This subplan brings it in so the user's invariant — *every worker operates on a different office, zero collision possibility ever* — holds across ALL modules.

**Honest exposure statement (no overclaim):** the three corp-pricing *mutating* specs touch **distinct entities** and are collision-safe **among themselves** by construction — `CORP_PRICING_OVERRIDE_FIXTURE` (`override.ts:124-131`) documents and live-verifies this: Detail mutates pricebook `2021-PB6`, Strategy mutates pricebook `2022-NP Tier 1`, Override mutates the `/pg-override` row `2605` (a different screen + endpoint). So there is **no proven intra-corp-pricing clobber today.** The real reasons to migrate:

1. **All three hardcode office `1604`** (`common.ts:41` `CORPORATE_PRICING_COMMON.office`, `override.ts:139`), the SAME office the locations specs hammer. They run concurrently with locations under the `chromium` catch-all project on a bare `npm test`. Once OPI moves locations onto a pool, office 1604 is still pool index 0 — a corp-pricing worker on 1604 can collide with the locations worker on 1604. **The invariant is violated unless corp-pricing is ALSO pooled.**
2. **Zero cross-worker isolation** exists in corp-pricing (no `parallelIndex`/pool/per-worker naming anywhere). Today's safety is the accidental fact that only two pricebooks + one override row are used; a future 4th mutating spec on 1604 makes intra-module clobber probable.

**Run-model facts (verified 2026-06-12, file:line):**
- Corp-pricing specs run under the **`chromium`** project (`playwright.config.ts:134-136` — `testIgnore` excludes only `tests/locations/**` + `tests/local-office/**`); inherits root `fullyParallel:false` + `workers` (2 local / 4 CI) + shared `.auth/encore-state.json`.
- **`npm test` (local) runs them; CI does NOT** (`clients/encore/.github/workflows/playwright-tests.yml:74` lists only `encore-local-office` + `encore-locations`). → exposure is **local-only today**; OPI_Z's worker-flip must decide whether corp-pricing gets a dedicated `encore-corporate-pricing` project so it runs isolated post-flip (F11.3).

**Favourable for migration:** the route builders already take `office` as a param (`common.ts:14` `detailsPath(office, pricebookId)`, `:20` `overridePath(office)`), so the only office hardcodes are `CORPORATE_PRICING_COMMON.office` + the GUID fixtures. This is the **same `*_BY_OFFICE` map pattern** the rest of OPI uses — office is the single isolation dimension; no separate pricebook-pool axis.

**The one hard risk (gated, never assumed):** a pool office may have **no Corporate Pricing entities at all** — the pricebook GUIDs `91acb5ca…`/`5f2a4088…` are reached via the 1604 URL and are office-specific; another office may lack an equivalent detail pricebook, strategy pricebook, the `/pg-override` row `2605`, and the product-group content anchors (`Balloon Light Decor`/277, `Analog Mixer`/280). OPI_B's structural-parity check is therefore EXTENDED to corp-pricing (see Depends-on); if an office is corp-pricing-incapable, OPI_G falls back to a **dedicated pricebook pool on a single office** for that slot (documented fallback, F11.1). Owns edge cases **F1.1, F2.2, F8.4 (corp-pricing), F11.1, F11.2, F11.3, F11.4**.

No new TCs (data-sourcing refactor + per-office maps) → no Phase 0.5b baseline walk.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate) · `/regression-guard` (wrap — per touched file) · `/relevant` (Phase 0.5) · `/rca` (per-spec `--workers=2` flake — HEADED cli) · `/final-q` (exit per LR-042)

**Context files**:
- `plans/pending/PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md` (parent — strategy + F11 registry)
- `plans/done/SUBPLAN_OPI_C_MIGRATE_LEGAL_PILOT.md` (the 5-step recipe D/E/F/G reuse)
- `plans/done/SUBPLAN_OPI_B_POOL_SELECTION_ACCESS_CAPTURE.md` (confirmed offices + **corp-pricing entity parity**, per the OPI_B extension)
- `.claude/rules/specs.md` (LR-018 run-all, LR-019 per-test baseline, LR-022 no hardcoded counts, LR-024 clean-before-RCA, LR-025 Radix retry)
- `.claude/rules/browser-tool.md` (LR-038 v2 / LR-054)
- `.claude/rules/deliverable.md` (LR-058 — shipped corp-pricing comments stay plain English; write-time hook DENIES internal IDs)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`; `docs/read_only_docs/LEARNED_RULES.md`
- `clients/encore/CLAUDE.md` (LR-012 shared dialog, LR-017 page boundary, LR-ENC-002 FCC parity, LR-ENC-003 env)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `SUBPLAN_OPI_C` AND `SUBPLAN_OPI_B` (corp-pricing-extended) are in `plans/done/`. If OPI_B did not capture corp-pricing entity parity per office → HALT (do not migrate onto unverified offices).
2. Read `.claude/context/navigation.md` registry for corp-pricing + fixtures/parallelism findings; reuse.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter ALL-* + any GEN-* about corp-pricing / fixtures.
4. Read `.claude/context/patterns.md` for matching decision trees (Radix dropdowns, save→tab race).
5. LR scan — LR-018/019/022/024/025, LR-012, LR-ENC-002, LR-058.
6. **Browser-tool**: `BrowserTool=cli`. Reason: spec runs via `npx playwright test` (runner, not a browser-tool); per-spec `--workers=2` flake RCA + any live structural re-check run HEADED cli per the LR-038 `/rca` row.

---

## Phase 1+ — Actual work (OPI_C 5-step recipe, per spec, vertical)

**Migrate in this order (mutating first — they carry the real isolation value):**

1. **Per-office fixtures (`src/data/corporate-pricing/common.ts`):** `CORPORATE_PRICING_FIXTURES` (the `detailFixture`/`strategyFixture` GUID pairs) + `CORPORATE_PRICING_COMMON.office` → `CORP_PRICING_FIXTURES_BY_OFFICE: ByOffice<{detailFixture; strategyFixture}>` + accessor `corpPricingFixturesFor(office)` via `forOffice` (from OPI_A's `office-data.types.ts`). Each pool office's GUIDs are LIVE-READ at migration (LR-015) from that office's corp-pricing search grid and reconciled vs nav2 (F5.1), with dated provenance — OPI_B confirms existence, OPI_G captures the values. Keep FLAT: `searchColumns`, `searchFilters`, `detailGridColumns`, `tcBands`, `booleanRender` (`common.ts:43-106`).

2. **detail** (`detail.ts` + `corporate-pricing-detail.spec.ts`): `DETAIL.office`/`pricebookGuid`/`pricebookName` + the content anchors `DETAIL.anchorA` (277 Balloon Light Decor) / `anchorB` (280 Analog Mixer) → per-office maps (anchors are office-specific product-group rows → per-office FIXED). Spec: drop hardcoded office, take the `office` fixture, `ensureDefaultState` receives `corpPricingFixturesFor(office).detail…`.

3. **strategy** (`strategy.ts` + `corporate-pricing-strategy.spec.ts`): `STRATEGY.office`/`pricebookGuid`/`fixtureStrategyName` + `header` reference → per-office; the reversible rename edit stays the dirty lever. Spec → `office` fixture.

4. **override** (`override.ts` + `corporate-pricing-override.spec.ts`): `CORP_PRICING_OVERRIDE_FIXTURE` (`office`, `mutationRowAnchor` row 2605, `readAnchors`) → `CORP_PRICING_OVERRIDE_BY_OFFICE` (the pg-override product-group rows are office-specific → per-office FIXED). Spec → `office` fixture; `reloadAndReselect`/`ensureDefaultState` (`override.page.ts:238/399`) take the per-office anchor.

5. **read-only specs** (`search`, `toolbar-io`, `new-pricebook`): consume the `office` fixture for their route navigation only (read-only / no-commit — lower risk, but keeps them off a single shared office so a worker isn't pinned to 1604). `new-pricebook` create-page is per-office via the `newPricebookPath(office, type)` builder.

**Per spec (every one):** resolve `*For(office)` **in-body only** (F1.1 — never a module-level const; OPI_A's `check-office-isolation.mjs` gate enforces). Assert Save ENABLED before confirm (F2.2 — each page object's bounded-retry `ensureDefaultState` already guards this; confirm it fails loud on a no-pricebook office rather than silently passing). Run `--workers=1` (== today's result for that spec) THEN in isolation at `--workers=2` on ≥2 distinct pool offices BEFORE moving to the next spec (no half-migrated spec navigating office-K while asserting 1604 data).

**F11.3 note (hand to OPI_Z):** corp-pricing runs under the `chromium` catch-all, not a module project. Append a grep-verifiable line to OPI_Z: at the worker-flip, EITHER add a dedicated `encore-corporate-pricing` project (testDir `./tests/corporate-pricing`, `dependencies:['setup']`, `fullyParallel:false`, clamped workers) so corp-pricing runs module-parallel like the others, OR confirm the `chromium` catch-all is included in the flipped parallel run. Do NOT silently leave corp-pricing on a different worker policy than locations.

**F11.4 note:** corp-pricing is absent from the CI workflow today (`playwright-tests.yml:74`). That is a SEPARATE CI finding — flag it; do NOT bolt a CI change onto this subplan.

**LR-058:** every comment added to the shipped corp-pricing files = plain English, no `LR-NNN`/plan-IDs/codenames (write-time `jargon-gate.sh` DENIES otherwise).

**Sonnet boundary**: the data-map + spec-edit mechanics are [SONNET-SAFE]; the per-office live-read/reconcile, structural-parity judgment, `--workers=2` runs + flake RCA are [OPUS-ONLY].

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Stray `'1604'` literal in a touched corp-pricing file → DO-NOW (same file, <30 min). A corp-pricing office-incapability discovered mid-migration → APPEND a grep-verifiable line to OPI_B (pool replacement) and notify the user. The `encore-corporate-pricing` project / CI-gap items → APPEND grep-verifiable lines to OPI_Z (F11.3) / a CI finding (F11.4). No bare "out of scope" (LR-040/LR-046).

---

## Per-Identity Satisfaction

This subplan modifies `.spec.ts` + data files (mechanical office-fixture + per-office-map swaps, NO change to TC IDs/titles/count/assertions) — parity unaffected (LR-ENC-002 framework-internal). Any inadvertent TC-ID/title change is out of scope and must be reverted.

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline | (none) — corp-pricing entity existence confirmed in OPI_B; values live-read here at migration (LR-015) | (none) |
| GIVER | test-cases / test-plans / XLSX | (skipped: data-sourcing refactor only, no TC semantics change; parity must still verify clean) | `npm run check:tc-parity` exit 0 |
| BUILDER | `tests/corporate-pricing/{corporate-pricing-detail,-strategy,-override,-search,-toolbar-io,-new-pricebook}.spec.ts` + `src/data/corporate-pricing/{common,detail,strategy,override}.ts` | per-office maps + `office`-fixture specs; each first-run pass; also assess the 3 toolbar-split specs (`-loc-export` / `-export-all` / `-loc-import`, created 2026-07-08) for office-parameterization — `loc-import` uses throwaway office 5897 and is likely exempt | `cd clients/encore && npx playwright test tests/corporate-pricing/ --list` |
| HEALER | per-fix MD | (none) — proactive isolation refactor, not RCA-driven (if a `--workers=2` run surfaces a real bug → file per LR-044) | (none) |
| WATCHDOG | findings table | (none) — not audit-driven | (none) |
| GARDENER | refactor citation | structural data-sourcing change only; no spec logic change | `cd clients/encore && npm run typecheck` clean |

> Matrix footnotes: HUNTER — existence is OPI_B's; values are live-read at migration, no new baseline artifact. GIVER/BUILDER — no TC added/removed/renamed; mechanical office-fixture + per-office-map swaps, FCC/MD/XLSX parity unaffected. HEALER/WATCHDOG — not RCA/audit-driven.

---

## Acceptance criteria (LR-040 closure gate — enumerates every pool office)

- [ ] **(a)** For EACH pool office: its corp-pricing entity set (detail pricebook + strategy pricebook + pg-override row + product-group content anchors) is captured into the `*_BY_OFFICE` maps with live-read provenance, OR the office is recorded corp-pricing-incapable and routed to the single-office pricebook-pool fallback (F11.1) — classified (a)/(b)/(c) per office.
- [ ] All 6 corp-pricing specs migrated; data files expose `*_BY_OFFICE` maps + accessors with an entry for every pool office (TS `Record<PoolOffice,T>` enforces).
- [ ] Each of the 3 mutating specs green `--workers=1` (== today) AND green in isolation at `--workers=2` on distinct pool offices (the corp-pricing clobber is structurally impossible post-migration).
- [ ] Zero module-level `*For(` resolution across the 6 specs (F1.1 — `check-office-isolation.mjs` green).
- [ ] F11.3 (`encore-corporate-pricing` project OR chromium-in-flip) appended as a grep-verifiable line to OPI_Z; F11.4 (CI gap) flagged.
- [ ] `npm run check:tc-parity` exit 0 (LR-ENC-002); `npm run typecheck` clean.
- [ ] `/regression-guard` before/after = only the intended fixture/data deltas.
- [ ] Activity-log row per LR-028 (LR-037 timestamp ≥ touched-file mtimes).
- [ ] `/final-q` verdict block emitted (LR-042).

---

## Verification

```bash
cd clients/encore
npm run typecheck                                                        # expect: clean
npx playwright test tests/corporate-pricing/corporate-pricing-detail.spec.ts --workers=2     # expect: green on distinct offices
npx playwright test tests/corporate-pricing/corporate-pricing-strategy.spec.ts --workers=2   # expect: green on distinct offices
npx playwright test tests/corporate-pricing/corporate-pricing-override.spec.ts --workers=2   # expect: green; pg-override row per-office
grep -rnE "^(export )?const .*=.*corpPricingFixturesFor\(" tests/corporate-pricing/   # expect: empty (no module-level resolution)
grep -rn "'1604'" src/data/corporate-pricing/ tests/corporate-pricing/   # expect: only per-office map KEY '1604' + comments
node ../../scripts/check-office-isolation.mjs   # expect: green (F1.1/F1.3/no-new-1604)
npm run check:tc-parity                          # expect: exit 0
```

---

## Handoff (post-execution)

Chat-only per `feedback_handoff_in_chat_only.md` (no obstacle claims). Summarize: which corp-pricing specs went per-office; the per-office entity-parity result (which offices have full corp-pricing sets vs which used the single-office fallback); the `--workers=2` isolation proof per mutating spec; the F11.3 disposition handed to OPI_Z (dedicated project vs chromium-in-flip) and the F11.4 CI-gap flag; and confirmation that with OPI_G done, EVERY mutating module (locations, local-office, corp-pricing) is per-worker-office-isolated — the user's "zero collision possibility ever" invariant holds suite-wide. OPI_Z then makes `officeNo` required, flips workers up, and proves the full suite green at 4 & 8.
