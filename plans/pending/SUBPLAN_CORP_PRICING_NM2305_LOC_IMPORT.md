# SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT — Full upload round-trip + post-import validation for Loc Pricing Import (NM-2305)

> **⚠ SBC ID correction (2026-06-24):** surface/behavior cases use **ordinary 3-segment IDs** (`TC-CPR-<SUB>-NNN`, the page's existing band) + a `**Surface_Family**: <family> (QUICK|DEEP)` line — **NOT** the 4-segment `-SBC-` / `-SBC-MAX-` infix this plan body references (that shape is rejected by `check-tc-parity` G6). Same coverage, grammar-safe. Canonical: LR-065 (`.claude/rules/inventory.md`) + `docs/read_only_docs/CASE_GENERATION_STANDARD.md`.

**Status**: PENDING
**Priority**: P1
**Created**: 2026-06-24
**Identity**: OWNER
**Parent**: PLAN_CORP_PRICING_JIRA_DELIVERY.md
**Depends on**: none
**Blocks**: SUBPLAN_CORP_PRICING_NM2265_IMPORT_ALL.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli

---

## Context

Jira NM-2305 requires full automation of Location Pricing Import — including updates to an existing
file and the actual import, plus data validation after the import. The current coverage
(`TC-CPR-TIO-013`) asserts only that the "Import All Location Pricing" file-chooser dialog opens and
contains the expected controls; it performs no real upload and no post-import validation.

This subplan delivers the net-new deliverable: a REAL upload round-trip using `setInputFiles` against
a dedicated, updated fixture file, followed by post-import data validation (success path, error path,
partial-update path). Mutation safety is a hard constraint — the import writes to real data; the design
uses a controlled fixture office/dataset with pre/post state capture and bounded restore.

**Folds from SOURCE A** (`SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md` Phase 2 line 6): the
trigger re-verify for `Loc Pricing Import` (file-chooser "Import All Location Pricing", UNCHANGED by
toolbar drift). This is a quick re-verification step, not authoring from scratch.

**Folds from SOURCE B** (`SUBPLAN_CORP_PRICING_EDGE_P3.md` Phase 1+ "Export / Import real file I/O
round-trip" seed): the heavy I/O slice for Location Pricing Import — real upload via `setInputFiles`
of an UPDATED fixture file, post-import data validation (success / error / success), mutation-safety
constraints, and fixture teardown strategy. This is the grep-verifiable LR-040(b) recipient for
that seed.

**Blocks SUBPLAN_CORP_PRICING_NM2265_IMPORT_ALL.md** because the reusable upload helper built here
(`locPricingUpload` method in the search page object + fixture infrastructure) is the shared component
NM-2265 (Import All Equipment/Labor Pricing) reuses. NM-2265 MUST NOT duplicate this helper; it
imports it.

Known bugs to watch: NM-2165 (import shows network-error toast but Product Groups still update),
NM-2206 (grid goes blank after import). Treat as *leads* — verify on live app before filing. Per
LR-034/LR-044 any confirmed new defect gets filed.

---

## Bootstrap

**Identity**: OWNER (multi-identity span: GIVER catalog → BUILDER implementation → HEALER first-run
fixes; OWNER short-circuits §2 per LR-043)

**Skills auto-called**:
- `/identity` (gate — fires first)
- `/regression-guard` (wrap — BEFORE snapshot before any code change; AFTER snapshot before closure)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/ultracoverage` (Phase 1.1 — generate full coverage model for Loc Pricing Import surface)
- `/rca` (Phase 3 conditional — on any first-run red; artifact-first per SKILL.md)
- `/final-q` (exit gate — mandatory per LR-042)

**Context files** (every rule + reference this subplan loads):
- `PLAN_CORP_PRICING_JIRA_DELIVERY.md` (parent)
- `plans/pending/SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md` (SOURCE A — trigger re-verify fold)
- `plans/pending/SUBPLAN_CORP_PRICING_EDGE_P3.md` (SOURCE B — real I/O round-trip seed fold)
- `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-23.md` (B12 row — file-chooser confirmed)
- `clients/encore/CLAUDE.md` (LR-ENC-001, LR-ENC-002, LR-ENC-004, LR-008, LR-017, LR-036)
- `.claude/rules/specs.md` (LR-019 per-test baseline, LR-021 un-skip+harden atomically, LR-022 no hardcoded counts, LR-024 clean before RCA, LR-051 no opaque OR-assertion, LR-052 no fixed sleep in loops, LR-056 network filter on API path, LR-061 verify-before-blocked)
- `.claude/rules/angular.md` (LR-009 net-zero dirty, LR-026 dirty-state defensive)
- `.claude/rules/pipeline.md` (LR-040 closure completeness, LR-048 structural minimum, LR-050 restructure plans cleanup, LR-060 no silent checkpoint)
- `.claude/rules/browser-tool.md` (LR-038 v2 cli default; LR-054 playwright-cli vs npx playwright distinction)
- `.claude/rules/deliverable.md` (LR-058 no internal jargon in shipped files)
- `.claude/rules/baseline.md` (LR-045 baseline-first; LR-034 bug filing schema)
- `.claude/rules/inventory.md` (LR-062 machine denominator, LR-065 surface behavior-cases)
- `clients/encore/specs_planning/_internal/field-case-generation.md` (§3 surface/behavior families)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, ALL-* rules)
- `docs/read_only_docs/LEARNED_RULES.md` (cross-cutting LR-NNN)

**Anti-Assumption Gates**:
- [ ] Gate 1 (Phase 0.5b) — `baselineScope: baseline-absent` declared (net-new real-upload feature on new site; no old-site equivalent upload flow to walk; trigger-level baseline already consumed by TC-CPR-TIO-013).
- [ ] Gate 2 — No "import corrupts / app-wide regression" claim on <2 evidence sources; watch NM-2165 / NM-2206 as leads, not confirmed bugs, until reproduced live.
- [ ] Gate 3 — No control marked un-drivable without overlay-clear + reload + PO-selector-vs-live-DOM diff + DOM-inspect + positive control (LR-061 B+C).
- [ ] Gate 4 — Env defers only the env-blocked step; baseline walk and fixture/MD authoring are env-independent (LR-060).
- [ ] Gate 5 — Any un-skip + LR-019 hardening applied atomically in the same change (LR-021 corollary).
- [ ] Gate 6 — All phases complete OR a user-signed `## Deferral Authorization` block recorded (LR-060).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `Depends on: none` — no predecessor required. Verify `PLAN_CORP_PRICING_JIRA_DELIVERY.md` exists in `plans/pending/` (parent plan).
2. Read `.claude/context/navigation.md` (R00) — check Exploration Registry for Corporate Pricing toolbar / Loc Pricing Import rows; pull listed findings instead of re-exploring.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter for OWNER / ALL-* / BUILDER-class mistakes relevant to upload/setInputFiles, mutation tests, fixture teardown.
4. Read `.claude/context/patterns.md` — match patterns: file-upload via setInputFiles, mutation-safety teardown, per-test baseline (`ensureDefaultState`), network listener (LR-056).
5. LR scan — rules whose triggers fire for this subplan:
   - LR-019 (per-test baseline — mutation test after import must restore state)
   - LR-021 (un-skip + harden atomically — TC-CPR-TIO-013 is re-verified in place, not skipped)
   - LR-022 (no hardcoded counts)
   - LR-034 / LR-044 (bug filing — NM-2165 / NM-2206 leads verified live before filing)
   - LR-038 v2 / LR-054 (browser-tool — CLI for functional upload; consult Table 2 before any CLI limit claim)
   - LR-056 (network listener on API endpoint, not page URL)
   - LR-058 (no internal jargon in shipped source)
   - LR-061 (verify-before-blocked + positive-control before any "can't drive" verdict)
   - LR-ENC-001 (baseline-absent for real-upload feature)
   - LR-ENC-002 (parity — MD + XLSX update mandatory alongside spec changes)
   - LR-ENC-004 (Jira-first: read NM-2305, NM-2165, NM-2206 via Atlassian MCP before authoring expectations)
6. **BrowserTool=cli** announcement. Reason: functional real-upload round-trip — `setInputFiles` is a Playwright `page.` API call executed by the test runner (`npx playwright test`), not via the agent-CLI browsing session. The CLI walk-evidence (B12 from `walk-evidence-corporate-pricing-2026-06-23.md`) already confirms the file-chooser selector and dialog structure; no additional live walk is needed at Phase 0. If a live DOM re-verification is required mid-subplan, `playwright-cli` headless with `-s=encore-state` is the tool (consult CLI_BROWSER_GUIDE.md Table 2 before any limit claim per LR-054).

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

`baselineScope: baseline-absent`

The "Import All Location Pricing" real-upload feature has no equivalent in the old Navigator UI
(`navigator2.training.psav.com`) — the old site's Location Pricing tab does not expose a CSV import
flow that can be walked for intent baseline. The trigger-level coverage (dialog opens, file input
present, Browse + Upload buttons) was established by TC-CPR-TIO-013 against the live new site and is
confirmed by walk-evidence B12 (2026-06-23). Per LR-ENC-001, baseline-absent is NOT a HALT — it is
an honest classification that routes intent questions to Jira (LR-ENC-004) rather than the old site.

Before authoring test expectations:
1. Read NM-2305 via Atlassian MCP — extract the acceptance criteria, expected success/error behavior, and any documented import format constraints.
2. Read NM-2165 (import network-error but Product Groups update) and NM-2206 (blank grid after import) via Atlassian MCP as leads; classify as `data-blocked` / `env-specific` / `confirmed-bug` only after live reproduction (LR-044).
3. Emit or refresh `clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-loc-import-2026-06-24.md` with `baselineScope: baseline-absent`, the Jira lead findings, and the B12 evidence as the "intent oracle" (NM-2305 Jira spec + walk-evidence 2026-06-23 B12).

---

## Phase 1 — GIVER: catalog the Loc Pricing Import surface + extend TCs

1. **Re-verify trigger behavior** (fold from SOURCE A): using `walk-evidence-corporate-pricing-2026-06-23.md` row B12 as the live-confirmed oracle, assert that `Loc Pricing Import` opens a file-chooser dialog titled "Import All Location Pricing" with Browse, Upload, and Cancel controls and `input[type=file]` — UNCHANGED from the toolbar drift. TC-CPR-TIO-013 covers this; no new TC needed for the trigger alone. This re-verify step produces a grep-verifiable line in the activity log confirming B12 is still the live contract.
2. **Extend the TC catalog** in `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_toolbar_io_test_cases.md` — add TCs in the TIO band continuing after the current high-water mark (read the existing file to determine the next-free number after TC-CPR-TIO-017; assign sequentially). Net-new TCs to author:
   - **TC-CPR-TIO-0XX: Real upload — success path**: upload a valid, updated fixture CSV; assert the dialog shows upload progress / success indication; assert post-import grid reflects the updated values (at least 1 known-changed row).
   - **TC-CPR-TIO-0XX: Real upload — error path (malformed file)**: upload a file with invalid structure or mismatched columns; assert a validation error is surfaced (error message or toast visible); assert grid state is unchanged.
   - **TC-CPR-TIO-0XX: Real upload — error path (empty file)**: upload a zero-byte or header-only CSV; assert appropriate error or rejection.
   - **TC-CPR-TIO-0XX: Real upload — error path (wrong format)**: upload a `.xlsx` or `.txt` file when CSV is expected (or vice versa — confirm format from NM-2305); assert format rejection error.
   - **TC-CPR-TIO-0XX: Partial-update file**: upload a valid CSV touching only a subset of rows; assert changed rows updated, unchanged rows untouched.
   - **TC-CPR-TIO-0XX: Post-import state restore**: after a successful import, assert the page is navigable and the grid renders (regression against NM-2206 blank-grid lead).
   - **TC-CPR-TIO-0XX: Cancel mid-upload**: cancel the dialog after file selection but before clicking Upload; assert no import occurred (grid unchanged).
3. Update the test-plan section for toolbar I/O in the same MD to include the new Scenarios.
4. Run `npm run xlsx:build` (planner:post-complete) to rebuild `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` with the new TCs.
5. Run `npm run check:tc-parity` — must exit 0.

---

## Phase 1b — Axis-2 Surface-Family Ultracoverage (Case-Generation Standard — the 7 families)

> **Why this phase exists:** Axis-1 cases cover one control at a time. The
> [Case-Generation Standard](../../docs/read_only_docs/CASE_GENERATION_STANDARD.md) Axis 2 (7 active surface
> families) covers behaviors that live *between* cells — result-fidelity, pagination, sorting, combination,
> render-state, empty/volume, persistence. Apply only families whose **trigger** holds; record an inapplicable
> family as `out-of-scope:<family>=<reason ≥20 chars>` per LR-065. The execution walk confirms each trigger live
> (LR-064). **These dispositions FOLD INTO the LR-062 100% completeness gate** — a surface with no
> `behavior-cases:` disposition is undispositioned = closure-gate Cx FAIL. SBC TCs ride `check:tc-parity`; no
> separate surface-parity script. Encore oracles per `field-case-generation.md` §3. QUICK = `TC-CPR-TIO-SBC-*`
> (L1 must-assert); DEEP = `TC-CPR-TIO-SBC-MAX-*` (L2/L3 exhaustive). Number within the SBC band at execution by
> reading the live MD/spec for the next free SBC number; scope each TC title by surface ("Loc Import") to avoid
> collision with the other toolbar-I/O surfaces sharing the TIO page band.

Loc Pricing Import is an upload round-trip: result-fidelity (the post-import grid reflects the uploaded file), empty-vol (empty / malformed / large file), and persistence (imported data is durable) apply; pagination / sorting / combination / render-state are out-of-scope for the import action (those belong to the underlying Loc Pricing grid surface).

| Family | Trigger | QUICK (`-SBC-`) must-assert | DEEP (`-SBC-MAX-`) exhaustive | Encore oracle |
|---|---|---|---|---|
| result-fidelity | the post-import grid reflects the uploaded file | a known-changed row shows the new value (promotes the success-path TC) | partial-update (only touched rows change, untouched rows stable — promotes the partial-update TC); full content match against the fixture | content-anchored row lookup, never by index (`feedback_history_content_anchored_lookup.md`); the round-trip oracle |
| empty-vol | empty / header-only file + large file | an empty file rejected with an observable error (promotes the error-path TC) | empty + header-only + large-file import boundary | error-path TCs; mutation-safety per fixture |
| persistence | imported data is durable | post-import reload shows the imported values | imported values persist across reload + browser-back; post-import grid is NOT blank (NM-2206 regression guard, promotes the post-import-state TC) | NM-2206 blank-grid lead; durable round-trip |

**Out-of-scope dispositions (LR-065 token — reason ≥20 chars; execution confirms):**
- `out-of-scope:pagination=the import is a dialog + upload action with no rows-per-page control; post-import grid paging is a property of the Loc Pricing grid surface, validated by content-anchored lookup not paging (LR-022)`
- `out-of-scope:sorting=the import action exposes no sortable column; sort is a property of the underlying Loc Pricing grid, not the import surface`
- `out-of-scope:combination=the import is a single upload action with no filter/sort/paginate controls to compose; post-import filtering belongs to the grid surface, not the import`
- `out-of-scope:render-state=the import-specific render is the upload-dialog progress/error-message state (covered by the error-path TCs); post-import grid cell rendering (currency/boolean per LR-036) belongs to the shared Loc Pricing grid surface`

**Disposition rule:** at execution, the Loc Pricing Import surface carries a `behavior-cases:<families>` disposition (LR-065) — result-fidelity + empty-vol + persistence covered (each ≥1 QUICK SBC TC), the other four carrying their `out-of-scope:<family>=<reason>` tokens. Leaving it undispositioned DENIES closure (LR-062 Cx). The DEEP `-SBC-MAX-` band is authored to full exhaustion per the Standard L2/L3 (this is `/ultracoverage`).

---

## Phase 2 — BUILDER: upload helper + specs

### 2.1 Fixture infrastructure

1. Determine the import CSV format for Location Pricing from NM-2305 Jira and/or by downloading a real export via `TC-CPR-TIO-012` (Loc Pricing Export) to use as a template. The exported file is the authoritative format oracle.
2. Commit a set of test fixture files to `clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/`:
   - `valid-update.csv` — a valid CSV derived from the real export format with at least 2 rows modified to known test values (values that differ from current prod state on the fixture office).
   - `partial-update.csv` — a valid CSV covering a subset of rows; rest omitted or zero-change.
   - `empty.csv` — zero-byte file.
   - `malformed.csv` — a CSV with invalid structure (wrong column count or header).
   - `wrong-format.txt` — a plain-text file to trigger format-rejection.
3. **Mutation safety** — the fixture files MUST be scoped to a designated fixture office (confirm with Rutvik whether office 1604 is safe for import mutation, or whether a separate fixture office must be used before any import TC runs). Capture the pre-import grid state (at minimum the rows the fixture touches) programmatically in `beforeEach` and restore them in `afterEach` via a bounded-retry pattern. If safe server-restore is not possible (no undo endpoint confirmed from NM-2305), design the success-path TC as a **controlled-no-persist verification**: assert the upload dialog success indication and the HTTP response code without verifying grid state post-import, and document the constraint in the TC Notes column. This is the safe floor; if restore IS confirmed, full round-trip grid assertion is preferred.

### 2.2 Upload helper in page object

1. Add a `locPricingUpload(fixturePath: string): Promise<{ success: boolean; message: string }>` method to `clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts`. Implementation:
   - Click the "Loc Pricing Import" button.
   - Wait for the dialog (`dialog[role="dialog"]` or equivalent — verify selector from B12 DOM, not from memory).
   - Call `page.locator('input[type="file"]').setInputFiles(fixturePath)` inside the dialog scope.
   - Click the Upload button.
   - Wait for either a success indication or an error/toast (use `page.waitForSelector` with a timeout; do NOT use `waitForTimeout` per LR-052).
   - Listen to the network response for the import API endpoint — filter on the backend API path (not page URL substring) per LR-056. Capture the response status code and return it alongside the UI-observable message.
   - Return `{ success, message }` derived from observable DOM + network state.
2. Add a `captureLocPricingGridState(rowIdentifiers: string[]): Promise<Record<string, unknown>[]>` helper for pre/post state capture by content-anchored row lookup (not by index — shared import handler may interleave rows; per `feedback_history_content_anchored_lookup.md`).
3. These helpers are designed for reuse by `SUBPLAN_CORP_PRICING_NM2265_IMPORT_ALL.md`; export them from the page object's public API. Add a JSDoc comment naming NM-2305 as the origin and NM-2265 as the downstream consumer, in plain English without internal jargon (LR-058).
4. Add any new selector constants to `clients/encore/src/selectors/corporate-pricing/search.ts` (no hardcoded env values per `feedback_no_hardcoded_env_in_selectors.md`; per-context entries only).

### 2.3 Spec authoring

1. Add a new `test.describe` block at the bottom of `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts` for the real-upload TCs — do NOT create a separate spec file (same module, same describe-file pattern).
2. Tag `@corporate-pricing @toolbar-io @mutation` on the new describe block.
3. Wire `beforeEach` to:
   - Navigate fresh to the search page.
   - Capture pre-import grid state for the fixture-touched rows (`captureLocPricingGridState`).
   - Set `test.setTimeout(120_000)` (file upload + server processing may be slow).
4. Wire `afterEach` to restore the pre-import state: if a restore endpoint is confirmed, call it; if not, reload and assert the grid is not blank (NM-2206 regression guard) — log the no-restore constraint via a `test.info()` annotation rather than a hard assertion.
5. Implement each TC from the catalog in Phase 1 step 2. Per-test baseline per LR-019 (the `beforeEach` nav + state-capture IS the baseline; do not rely on a prior TC having set it).
6. Import assertions:
   - Success path: `expect(result.success).toBe(true)` + `expect(result.message).toContain(...)` using the confirmed success text from NM-2305 or live walk.
   - Error paths: `expect(result.success).toBe(false)` + assert error message visible in DOM (do NOT use `.toBe(true)` on an OR-expression per LR-051).
   - Grid-state assertion: use content-anchored lookup, not `getColumnByIndex` (per `feedback_history_content_anchored_lookup.md`).
7. Do NOT re-cover the trigger level (that is TC-CPR-TIO-013, already green).

---

## Phase 3 — HEALER: first-run RCA (conditional)

On any first-run failure:
1. Read `failure-summary.json` and available `trace` artifacts BEFORE re-running (LR-024 — clean before RCA, not guess-patch).
2. Apply mama-led `/rca` discipline: artifact-first read, classify into evidence-backed root cause (selector drift, timing, mutation-state bleed, fixture format mismatch, API response structure mismatch).
3. Every fix cites the artifact evidence (no hypothetical fixes).
4. Positive control before any "control un-drivable" verdict (LR-061 C) — prove the `setInputFiles` primitive works on a known-positive case (e.g., the malformed-file TC) before concluding the success-path upload cannot be driven.
5. NM-2165 / NM-2206 pattern watch: if the network response is 4xx/5xx but the grid shows updated values, that IS the NM-2165 pattern — record it, do NOT mark the test as broken; assert the UI-observable outcome and file the API-response discrepancy per LR-034 with `baselineComparison` + `baselineEvidence` fields populated.
6. If a failure cannot be resolved within 2 fix cycles, HALT and surface evidence to user with `/encore-questions` classification (LR-044 false-verdict prevention).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed during Phase 1–3 that is (same identity) + (same file/module) + (5–30 min) + (no user input needed), pick exactly one:

- **DO-NOW** — execute before Phase 3.5 closure.
- **SPAWN** — `mcp__ccd_session__spawn_task` with self-contained prompt + acceptance criteria.
- **APPEND** — edit a named pending subplan to add a grep-verifiable line item; verify with `grep -F "<the line>" plans/pending/<file>` before continuing.

Bare "out of scope" / "flagged for follow-up" with no recipient = HALT + ask user (LR-040 + LR-046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site baseline (net-new upload feature) | `clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-loc-import-2026-06-24.md` | `grep "baselineScope: baseline-absent" clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-loc-import-2026-06-24.md` |
| GIVER | test-cases MD + test-plan + XLSX | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_toolbar_io_test_cases.md`<br>`clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec (new describe block) + page object upload helper + selectors + fixture files | `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts`<br>`clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts`<br>`clients/encore/src/selectors/corporate-pricing/search.ts`<br>`clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/valid-update.csv`<br>`clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/partial-update.csv`<br>`clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/empty.csv`<br>`clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/malformed.csv`<br>`clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/wrong-format.txt` | `npx playwright test --list` resolves all new TC-CPR-TIO-0XX IDs |
| HEALER | first-run fixes + TC Notes (conditional) | `(skipped: conditional — only if first-run reds; replaced at close with the fixed spec path and the specific TC IDs fixed, else no HEALER-exclusive artifact)` | `npx playwright test corporate-pricing-toolbar-io --workers=1` exit 0 |
| WATCHDOG | (none — closure audit is a separate deliverable subplan) | `(none)` | (none) |
| GARDENER | (none) | `(none)` | (none) |
| OWNER | closure ceremony | `(skipped: closure ceremony only — deliverables are the HUNTER/GIVER/BUILDER artifacts above; closure = validate-plan-closure dry-run pass + activity-log row + final-q)` | `node scripts/validate-plan-closure.mjs --dry-run` exit 0 |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] TC-CPR-TIO-013 re-verified green (trigger re-verify fold from SOURCE A) — file-chooser dialog still UNCHANGED from B12 oracle.
- [ ] All new TC-CPR-TIO-0XX specs (success path, error paths, partial-update, cancel, post-import state) green ×2 consecutive runs (workers=1) without mutation of production-like arbitrary data.
- [ ] Real upload round-trip confirmed end-to-end: `setInputFiles` delivers file → upload API endpoint fires (confirmed via network listener on backend API path per LR-056) → post-import state validated (or controlled-no-persist design documented with explicit justification in TC Notes when restore is not available).
- [ ] Error path asserted: malformed file AND empty file AND wrong-format file each produce an observable error in the UI (error message or toast); the grid is not left in a blank state (NM-2206 regression guard).
- [ ] Partial-update path asserted: only the fixture-touched rows change; unchanged rows remain stable.
- [ ] Mutation safety demonstrated: pre-import state captured in `beforeEach`; post-test restore attempted in `afterEach` (or controlled-no-persist justification documented).
- [ ] `locPricingUpload` helper and `captureLocPricingGridState` helper are in the public page object API and carry JSDoc naming NM-2305 origin and NM-2265 consumer — in plain English, no internal jargon (LR-058).
- [ ] Fixture files committed under `clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/` (at minimum: valid-update, partial-update, empty, malformed, wrong-format).
- [ ] `npm run check:tc-parity` exit 0 — MD + XLSX + spec IDs in sync (LR-ENC-002).
- [ ] `npm run xlsx:lint` exit 0 (if the lint script exists; skip with a log line if not present, do NOT introduce the command if missing).
- [ ] `npm run typecheck` exit 0 — no TypeScript errors introduced.
- [ ] **Axis-2 surface families dispositioned (LR-065 → LR-062 Cx)**: the Loc Pricing Import surface carries a `behavior-cases:` disposition for all 7 families — result-fidelity + empty-vol + persistence each ≥1 QUICK `TC-CPR-TIO-SBC-*` + full DEEP `TC-CPR-TIO-SBC-MAX-*` (result-fidelity DEEP = post-import-grid-matches-file partial+full round-trip); pagination/sorting/combination/render-state each an `out-of-scope:<family>=<reason ≥20 chars>` token.
- [ ] `/regression-guard` snapshot before/after — no silent breakage on touched files.
- [ ] NM-2165 and NM-2206 leads resolved: each classified as (a) confirmed and filed per LR-034, or (b) not reproduced on live app with evidence.
- [ ] Do-or-die `/audit` pass (mode=review) on all new/changed source files — no findings blocking closure.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042 with evidence-emission format.

---

## Verification

```bash
# All new upload TCs pass (workers=1 for mutation safety)
npx playwright test corporate-pricing-toolbar-io --grep "TC-CPR-TIO-0" --workers=1 --retries=0
# expect: all green, no failures

# TC-CPR-TIO-013 trigger still green
npx playwright test corporate-pricing-toolbar-io --grep "TC-CPR-TIO-013" --workers=1
# expect: green

# TC parity gate
npm run check:tc-parity
# expect: exit 0

# TypeScript clean
npm run typecheck
# expect: exit 0

# Upload helper exported from page object
grep -n "locPricingUpload" clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts
# expect: method definition present

# Fixture files present
ls clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/
# expect: valid-update.csv, partial-update.csv, empty.csv, malformed.csv, wrong-format.txt

# Baseline artifact present with baseline-absent declaration
grep "baselineScope: baseline-absent" "clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-loc-import-2026-06-24.md"
# expect: line found

# New TC IDs registered in MD
grep "TC-CPR-TIO-0" "clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_toolbar_io_test_cases.md"
# expect: multiple new entries above TC-CPR-TIO-017

# No internal jargon in shipped files (spot-check)
node scripts/verify-no-forbidden.mjs --staged-diff
# expect: exit 0
```

---

## Handoff

Chat-only summary per `feedback_handoff_in_chat_only.md`. Outcome: the Loc Pricing Import surface has
real upload coverage — success path (updated fixture values reflected post-import), error paths (empty,
malformed, wrong-format), partial-update path, and cancel path. The `locPricingUpload` helper and
`captureLocPricingGridState` helper are exported from the search page object for direct reuse by
NM-2265 (Import All Equipment/Labor Pricing), which MUST import them rather than re-implement.
NM-2165 and NM-2206 leads are classified. The TIO band is extended with the new TC IDs. MD + XLSX +
spec are in parity. This subplan closes the NM-2305 deliverable and unblocks
`SUBPLAN_CORP_PRICING_NM2265_IMPORT_ALL.md`.
