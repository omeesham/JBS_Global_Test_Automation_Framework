# PLAN: Per-Worker Office Pool — Parallel Isolation (remove the single-1604 write-contention)

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-06-04
**Identity**: OWNER
**Depends on**: none
**Model**: claude-opus-4-8
**Thinking**: max
**PermissionMode**: plan
**RiskAcknowledged**: n/a
**BrowserTool**: none  <!-- this is the master/strategy tracker; live work is scoped to its subplans -->
**Justification**: master planning tracker — produces subplan files, no code; Opus `max` for the multi-rule + adversarial-edge-case judgment this isolation refactor requires.

---

## Context

The full suite fails intermittently because **every spec writes the same shared office `1604`** on the live e2e server, while Playwright runs `workers: 2` locally / `4` on CI with `fullyParallel: false` (within-spec serial, **across-spec parallel**). When two spec files on two workers both SAVE office 1604, they clobber each other's server-side form state → flaky failures. Proven on a scoped reproduction: **workers=2 → 7/20 fail; workers=1 → 20/20 pass**. Root cause is the concurrent SAVE to one shared office, not the test logic.

**Goal (user, 2026-06-04):** remove the dependency on a single office so each parallel worker operates on its **own** office and is never interrupted by another worker's save. e2e and nav2 are automation-only, so we may use multiple offices freely. The offices we pick must be **functionally similar to 1604** (same tabs, same dropdown catalogs) and seeded so we don't get **consistent** failures merely because an office ≠ 1604. Transient post-test deviation is fine (per-test baseline reset handles it); a structural mismatch that fails every run is not.

**User decisions (AskUserQuestion, 2026-06-04):**
1. Offices are functionally similar to 1604 but their **baselines differ per office** → we must split each office's fields into **editable-baseline** (reset-to defaults) vs **fixed-baseline** (read-expected) and adapt per location, maintaining reusability / simplicity, no logic loss.
2. **Per-office data maps** (keyed by office number) — every test runs on any worker.
3. Support **up to 8 workers now**, **scalable later** when willed.
4. **Phased via subplans**, all on **top of `plans/INDEX.md` pending priority**.

**Why this can't be "baseline exactly as 1604":** office 1604 = "The Parker Palm Springs" — a specific hotel. Venue name, phone, merchant IDs, the management-history row's own office number/name, and price-book rows are *intrinsically* unique per hotel and cannot be made identical. So most assertions (which are **structural** — checkbox defaults, dropdown option catalogs, the 87-column history schema, SC/Terms option lists) hold on any identically-configured office, while the minority of **value** assertions become **per-office data maps**. This is exactly user decision #2.

---

## Strategy (user ask #1 — optimal, elastic to worker count)

### Core mechanism: one office per parallel worker, indexed by `parallelIndex`

Playwright exposes `workerInfo.parallelIndex` ∈ `[0, workers)` — it is **reused** as workers recycle and is the framework's documented pattern for assigning a unique per-worker resource (account, DB, office). We index a fixed **pool** of functionally-similar offices by `parallelIndex`:

```
office = OFFICE_POOL[workerInfo.parallelIndex]
```

A worker-scoped `office` fixture resolves this once per worker; every spec consumes the `office` fixture instead of importing the hardcoded `OFFICE_NO`. No two concurrently-live workers ever share an office → the clobber is structurally impossible.

### Elastic to worker count (increase/decrease at any time)

- `POOL_SIZE = OFFICE_POOL.length` (start at **8**).
- `playwright.config.ts` clamps `workers = min(requested, POOL_SIZE)` and **warns** when a requested count exceeds the pool — raising workers can never silently overflow the pool into an `undefined` office or a 1604 fallback.
- **Decrease** is always safe: fewer workers use a prefix of the pool (index 0 = `1604` reproduces today's single-office behavior exactly).
- **Increase beyond 8 later** = a one-line change: append office numbers to `OFFICE_POOL`. `POOL_SIZE`, the clamp ceiling, and the fixture all recompute automatically. The `Record<PoolOffice,T>` typing then forces every per-office data map to gain the new key at compile time (intended fail-fast — no silent half-provisioned office).

### Per-office data model (user ask #2 — reusable, editable vs fixed)

Generalize the **already-existing** `LP_DEFAULTS` (fixed) / `LP_BASELINE` (editable) split in `clients/encore/src/data/testdata/locations/location-left-panel-basic-information.data.ts` to every office-dependent tab:

- **Storage** — per-module keyed maps co-located with each tab's existing data file (preserves LR-017 locality; no central mega-registry that couples unrelated tabs):
  - `*_EDITABLE_BY_OFFICE: ByOffice<T>` — values a test mutates then resets (feeds `ensureDefaultState`).
  - `*_FIXED_BY_OFFICE: ByOffice<T>` — read-only/immutable per office (venue, merchant IDs, history identity, price-book).
- **Type** — `ByOffice<T> = Record<PoolOffice, T>` in a new `office-data.types.ts`. TypeScript fails the build if any pool office key is missing from any map.
- **Accessor** — `forOffice(map, office, mapName)` throws loudly if an office is missing (belt-and-suspenders runtime fail-fast; **no silent fall-through to wrong-office data**).
- **Office-INDEPENDENT values STAY FLAT** — dialog text, dropdown option catalogs, the 87-column header set, LR-008 date-offset positivity rules, sentinels, XSS payloads. These are NOT per-office (decision: don't multiply what doesn't differ).

### Hard discipline: resolve per-office data INSIDE the test, never at module top-level

Per-office data MUST be resolved via `*For(office)` **inside `beforeEach`/the test body** using the `office` fixture — never as a module-level `const X = somethingFor(OFFICE_NO)`. This is the structural defense against the retry-lands-on-different-office failure (edge case **F1.1**): module-level consts are baked at import and won't follow a retry to a different worker/office.

### Threading the office through page objects

The `office` is injected into each page object via its constructor (fixture-wired); `BasePage` stores `this.officeNo` and navigation defaults flow from it. This makes the one truly-semantic literal — SSL self-row exclusion `office !== '1604'` — become `office !== this.officeNo` in **one** place. Specs still pass resolved DATA objects (`legalDefaultsFor(office)`) into methods; page objects own only the office NUMBER (for navigation + self-row identity), not test-data resolution.

### Migration shape: phase-by-SPEC (vertical), not phase-by-layer

Each migration subplan converts **one spec end-to-end** — its data file → keyed maps, its `OFFICE_NO` → `office` fixture, its assertions → `*For(office)`, its page-object wiring — then proves it green single-worker (must match today) AND at workers≥2 against distinct pool offices (proves isolation). A spec is therefore always either fully-legacy-1604 or fully-per-office, never a half-migrated hybrid that navigates office-K while asserting 1604's data.

### Interim worker policy during phased rollout (edge case F6)

While some specs are migrated and others still hardcode 1604, the **full mixed suite is NOT parallel-safe** (unmigrated specs all target 1604 across workers = the original clobber). Therefore:
- Full mixed-suite runs stay **`workers=1`** until 100% migrated (correctness lane).
- Per-subplan isolation is proven by running **only the migrated spec(s) in isolation at `--workers=2`** against distinct offices.
- CI default worker count is pinned to 1 for the full-suite job until the final flip subplan.

---

## Edge-case registry (user ask #2 — everything that can break, with owner + mitigation)

Severity: **BLOCKER** (must fix before that surface runs on a pool office) · **HIGH** · **MEDIUM** · **LOW**. "Owner" = the subplan that lands the mitigation.

| # | Edge case | Sev | Mitigation | Owner |
|---|---|---|---|---|
| **F1.1** | Retry re-runs on a different worker → different office; module-level data consts don't follow → asserts office-J data on office-K | BLOCKER | Resolve office + its data via the `office` fixture **inside** the test; ban module-level per-office consts | A (rule) + every C–F |
| **F1.2** | `workers` > `POOL_SIZE` → `OFFICE_POOL[idx]` undefined OR silent 1604 fallback → clobber returns | BLOCKER | Hard-throw in fixture if `parallelIndex ≥ POOL_SIZE`; config clamps + warns | A |
| **F1.3** | `--shard` resets `parallelIndex` per shard → two shards' worker-0 both hit office index 0 on the same server | HIGH | Forbid concurrent sharding against the shared server, or globally partition the pool by shard; document the invariant | A (doc) + Z |
| **F1.4** | Worker recycle reuses `parallelIndex` but inherits a dirty office (crash after save, before cleanup) | MEDIUM | `ensureDefaultState` in `beforeEach` resets editable fields; SSL `ensureCleanSSLTable` resets fixed-table state — treat fixed-baseline as "verify clean at start," not "assume clean" | C–F |
| **F2.1** | Single SSO user may lack OPEN/SAVE rights on a pool office → silent `/home` skeleton cascade misread as flake | BLOCKER | **Pool-access preflight** in the `setup` project: open + prove a save-capable control on each office; FAIL the run loudly if any is inaccessible | B |
| **F2.2** | `clickSaveWithDialog` returns `{success:true}` when Save is disabled → a no-permission/read-only office "saves" silently | HIGH | Assert Save is ENABLED before confirming (FCC `expectBeforeSave`); a read-only office fails at the dirty-check, not post-reload | B + C |
| **F3.1** | `findNonSelfRow()` hardcodes `office !== '1604'` → on office-K returns the SELF row → cleanup loop tries to delete the undeletable self-row → hang/timeout | BLOCKER | Replace literal with `this.officeNo` (worker's office) | E |
| **F3.2** | `SELF_ROW` + dialog-search expectations hardcode 1604/Parker/Miami/990002 | HIGH | Per-office `SELF_ROW` map; keep global-catalog search targets shared only if F3.3 holds | E |
| **F3.3** | A pool office's NAME collides with an SSL catalog search term (Boston/Chicago/Dallas/Denver/Atlanta/Miami/Marriott/Test Server) → shifts counts / self-row exclusion | HIGH | Pool-selection constraint: no pool office name may contain any in-use search term; verify catalog scoping is GLOBAL not office-scoped | B |
| **F3.4** | `searchByNameMaxResults: 600` headroom assumes 1604's catalog size | MEDIUM | Confirm catalog is global (not office-scoped) for all 8; else make the cap per-office | B + E |
| **F4.1** | History row-0 identity strict-asserts `'1604'`/`'Parker Palm Springs'`; relaxed Active/Currency were loosened only because of cross-spec interleave that per-office isolation REMOVES | HIGH | Make `ROW_1_EXPECTED` identity per-office; **re-tighten** Active/Currency to exact per-office values once isolation lands | E |
| **F4.2** | History is append-only & unbounded per office; `getRowsSinceTimestamp` is PAGE-1-ONLY; a thin fresh office may fail `waitForRecentTopRow`'s freshness window | MEDIUM | "Warm" each pool office (≥1 recent save) during capture; monitor per-office history growth | B + E |
| **F5.1** | Captured editable-default could itself be DIRTY (prior crashed run) → bakes a non-default → net-zero trap → permanent failures that look like app bugs | BLOCKER | Capture each office's baseline TWICE (different days) + diff; cross-check against nav2 old-site truth (LR-ENC-001, office-parameterized URL); record provenance per office | B |
| **F5.2** | Two offices sharing a venue/phone/merchant silently mask a worker→office mapping bug | MEDIUM | During capture, assert ≥1 pairwise-distinct identity field per office | B |
| **F5.3** | Fields that LOOK editable are server-derived/disabled per office (LDW% silent-reject band, `chkEnableJobCosting` disabled+checked for 1604) → reset fails | MEDIUM | Capture disabled/enabled state per office; `DISABLED_CHECKBOX_STATES` becomes a per-office map (highest capture cost) | B + D |
| **F6.1/6.2** | Half-migrated suite at `workers>1` re-clobbers via unmigrated 1604 specs; CI default is 4 | HIGH | Interim policy: full mixed runs `workers=1`; verify migrated specs in isolation at `--workers=2`; pin CI full-suite job to 1 until final flip | (policy) all C–F; flipped in Z |
| **F7.x** | Single shared storageState — any per-office session coupling? | LOW | Cookies are office-agnostic; no coupling. Optionally fold the F2.1 access check into the worker warm-up | B |
| **F8.1** | `HOME_URL` hardcodes `.../locations/1604/home` in both env files; consumed by auto-addon `/home` poll + SSL `discardAndReturn` → wrong-office home on a pool office | HIGH | Derive home URL per-office from `base_url` + office; deprecate hardcoded `HOME_URL` (or templatize) | Z (consumers patched in D/E) |
| **F8.2** | `discardAndReturn` builds `base_url + 'navigator/...'` while `base_url` already ends in `/navigator/` → `/navigator/navigator/...` (latent bug) | MEDIUM | Fix the double-segment while threading per-office home | E |
| **F8.3** | ~44 page methods default `officeNo='1604'`; any missed call site silently falls back to 1604 | HIGH | Keep `= OFFICE_POOL[0]` default during phased rollout; **remove the defaults (make required) in the final flip** so the compiler flags every straggler | A (alias) → Z (make required) |
| **F8.4** | Strict 1604 literals across data files (`ROW_1_EXPECTED`, `MERCHANT_DATA`, `SELF_ROW`, `LEFT_PANEL_EXPECTED.office`, pricing/notes/account-address) | HIGH | Every `@office-dependent` export → per-office keyed map. Scope (evidence, this audit): **10** tagged data files, **78** export consts; **45** files contain `1604`. The JSDoc tag drives the data-map work; OPI_Z's make-`officeNo`-required turns `tsc` into the exhaustive finder for every literal, so the 45-file count is informational, not a manual hunt | C–F |
| **F8.5** | History skip-reasons cite "1604 has 2900+ rows"; `COLUMN_COUNT=87` assumes 1604's feature flags | MEDIUM | Re-derive skip conditions per office; verify column count is structurally identical across pool (else per-office) | B (parity) + E |
| **F9.1** | Per-office maps × 8 = 8× capture + drift surface; disabled-state least stable | HIGH | **Capture per-tab at migration via live-read (LR-015), NOT a monolithic upfront script** — each migrating session reads only the tab+offices it needs, reconciles vs nav2, stamps dated provenance (the proven `LP_DEFAULTS` pattern); never hand-maintain | B (inventory) + C–F (capture) |
| **F9.2** | A pool office decommissioned/renamed server-side kills its worker slot suite-wide | MEDIUM | F2.1 preflight surfaces it immediately; keep pool > worker count so a dead office can be dropped without going serial; document swap procedure | B + Z |
| **F9.3** | Pool offices aren't TRUE structural clones (missing tab, different column/row counts, different ECT sections) | HIGH | **Structural-parity** is a gating pool-selection criterion (same tabs, same column counts, same checkbox set, same currency rows, same ECT sections vs 1604) | B |
| **F10.1** | Left-panel Country change cascade-clears Tax Mode + Region across the SHARED left panel; wrong per-office capture corrupts multiple sub-tabs | HIGH | Capture left-panel Country/TaxMode/Region per office with care; keep Country-first reset ordering | B + D |
| **F10.3** | `AgentReporter` records `workerIndex` only — failure-summary won't say which OFFICE failed → per-office RCA is blind | MEDIUM | Add `parallelIndex` + resolved office to the failure-summary + test annotations (do EARLY — needed to debug the rollout) | A |
| **F10.4** | ECT uses SECTION-specific Save buttons (not the shared dialog); a pool office with different ECT sections breaks section-save selectors | MEDIUM | Include ECT section parity in F9.3 structural check | B + F |

**Top 5 blockers (must land before the surface runs on any pool office):** F3.1 (SSL self-row hang), F2.1 (pool-access preflight), F1.1 (resolve-via-fixture not module-const), F8.3+F8.4 (make `officeNo` required + per-office maps), F6.1/F1.2 (interim `workers=1` + pool-size guard).

---

## Subplan roadmap (phased; all P0-EMERGENCY, dependency-chained)

| Subplan | Scope | Owns edge cases | Browser | Depends on |
|---|---|---|---|---|
| **SUBPLAN_OPI_A_INFRA_FOUNDATION** | `office-pool.ts`, `office-data.types.ts`, `office` worker fixture + page-object constructor wiring, `base-page` default, config clamp + shard/pool guard, `OFFICE_NO = OFFICE_POOL[0]` alias, AgentReporter office tagging. Backward-compatible — full suite stays green at workers=1 **and** workers=2 with **zero** specs migrated. | F1.1(rule), F1.2, F1.3(doc), F8.3(alias), F10.3 | none | none |
| **SUBPLAN_OPI_B_POOL_SELECTION_ACCESS_CAPTURE** | Discover/confirm 7 non-1604 offices that are STRUCTURAL clones + non-colliding names; pool-access (open+save) preflight in `setup`; produce a per-constant inventory (which of the 78 consts are office-dependent values vs flat) + the dirty-reconcile discipline; emit dated confirmation artifacts; populate `OFFICE_POOL`. Per-office VALUE capture is deferred to per-tab live-read during migration (C–F, LR-015). **User confirms the 8 offices.** | F2.1, F2.2, F3.3, F3.4, F5.1, F5.2, F5.3, F8.5, F9.1, F9.2, F9.3, F10.1, F10.4 | cli | A |
| **SUBPLAN_OPI_C_MIGRATE_LEGAL_PILOT** | Migrate `location-legal.spec.ts` end-to-end → `*_BY_OFFICE` + `legalDefaultsFor/legalFixedFor`; prove single-worker == today + `--workers=2` isolation. Establishes the per-spec migration recipe. | F1.1, F1.4, F2.2, F8.4 (Legal) | cli | A, B |
| **SUBPLAN_OPI_D_MIGRATE_LOCATIONS_BATCH** | Same recipe for account-address, left-panel-basic-info, local-information, auto-addon, currency, pricing (each vertical, each proven). | F1.4, F5.3, F8.4, F10.1 | cli | C |
| **SUBPLAN_OPI_E_MIGRATE_SSL_AND_HISTORY** | SSL (F3.1 self-row, catalog counts), management-history + local-office-history (per-office row-0 identity, RE-TIGHTEN relaxed Active/Currency), notes; fix `discardAndReturn` double-segment + per-office home. | F3.1, F3.2, F4.1, F4.2, F8.1(consumers), F8.2, F8.4 | cli | C |
| **SUBPLAN_OPI_F_MIGRATE_LOCAL_OFFICE** | local-office settings + ect (section-save gotcha) + local-office history identity. | F8.4, F10.4 | cli | C |
| **SUBPLAN_OPI_Z_FINAL_FLIP_AND_CLEANUP** | Remove `officeNo='1604'` defaults (make REQUIRED → compiler catches stragglers); per-office `HOME_URL`; flip CI/local default workers up; full-suite green at workers=4 and 8; LR-050 stale-1604 sweep; graduate the "resolve-via-fixture / no module-level per-office const" rule; close parent. | F1.3, F8.1, F8.3, F9.2 | cli | D, E, F |

**Cascade closure rules:** OPI_Z is the last subplan; on its closure it closes this parent (LR-027 parent-cascade). Each child annotates its DONE line in this parent's body while this parent is in `plans/pending/` (LR-027 annotation extension).

### Child DONE annotations (filled as children close)

- _(none closed yet)_

---

## Acceptance criteria (this master)

- [ ] All 7 subplan files exist in `plans/pending/` with LR-048 structure + LR-041 frontmatter, dependency-chained A→B→{C→D,C→E,C→F}→Z.
- [ ] `npm run plans:reindex` regenerates `plans/INDEX.md`; all 8 (this + 7) sort into the top P0-EMERGENCY ready group.
- [ ] Every edge case F1–F10 in the registry is assigned to exactly one owner subplan whose body addresses it.
- [ ] Strategy answers both user asks: #1 elastic worker scaling (clamp + pool one-liner), #2 per-office editable/fixed data maps.

---

## Verification

```bash
# All subplans present and parented to this master
ls plans/pending/SUBPLAN_OPI_*.md            # expect: A, B, C, D, E, F, Z (7 files)
grep -L "PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md" plans/pending/SUBPLAN_OPI_*.md  # expect: empty (all reference parent)
# INDEX regenerated, this plan present
npm run plans:reindex && grep -c "OPI" plans/INDEX.md   # expect: >= 8
```

---

## Handoff (post-authoring)

This master is the strategy + edge-case registry + roadmap. Execution runs the subplans in dependency order: **A** (inert infra, green at workers=1 and 2 with nothing migrated) → **B** (confirm + seed + capture the 8 offices; user confirms numbers) → **C** (Legal pilot establishes the recipe) → **D/E/F** (the rest of the specs, vertical) → **Z** (make `officeNo` required, flip workers up, prove green at 4 and 8, sweep stale 1604). Until Z lands, full mixed-suite runs stay `workers=1`; isolation is proven per-spec at `--workers=2`.
