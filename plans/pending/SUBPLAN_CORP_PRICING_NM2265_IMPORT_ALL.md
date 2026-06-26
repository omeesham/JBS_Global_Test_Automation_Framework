# SUBPLAN_CORP_PRICING_NM2265_IMPORT_ALL — Pricing Import All: drift fix + real upload round-trip (4 variants)

> **⚠ SBC ID correction (2026-06-24):** surface/behavior cases use **ordinary 3-segment IDs** (`TC-CPR-<SUB>-NNN`, the page's existing band) + a `**Surface_Family**: <family> (QUICK|DEEP)` line — **NOT** the 4-segment `-SBC-` / `-SBC-MAX-` infix this plan body references (that shape is rejected by `check-tc-parity` G6). Same coverage, grammar-safe. Canonical: LR-065 (`.claude/rules/inventory.md`) + `docs/read_only_docs/CASE_GENERATION_STANDARD.md`.

**Status**: PENDING
**Priority**: P1
**Created**: 2026-06-24
**Identity**: OWNER
**Parent**: PLAN_CORP_PRICING_JIRA_DELIVERY.md
**Depends on**: SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli

---

## Context

Jira [NM-2265](https://encore.atlassian.net/browse/NM-2265) — "Automate Pricing Import All." The `Import ▾` dropdown exposes 4 variants: All Equipment Pricing, All Labor Pricing, All Equipment Max Discount, All Labor Max Discount. Current tests `TC-CPR-TIO-007..011` were authored at trigger level (menu opens + file-chooser dialog visible) but are **DRIFTED-RED**: the app now gates every Import variant behind a **Year(s) + Currency precondition dialog** (Continue disabled until both set); on Continue a second file-chooser upload dialog opens — the old contract assumed an immediate file-chooser, which no longer exists. This subplan has two jobs: (1) correct the 5 stale tests to the new Year+Currency→Continue→file-chooser contract, and (2) add real upload round-trip TCs for all 4 variants.

Folds:
- **SOURCE A** (`SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md`) — Import ▾ drift-fix obligation: Phase 2 Step 1 says "Fix the 10 stale `TC-CPR-TIO-*` to the current behavior … Import ▾ Year+Currency dialog asserted." The real-file-round-trip was explicitly deferred there (Phase 2 Step 6, "real file round-trip stays in EDGE_P3 — APPEND grep-verifiable line items there"). This subplan is the durable owner of that deferred work.
- **SOURCE B** (`SUBPLAN_CORP_PRICING_EDGE_P3.md`) — Seed entry: "Export / Import real file I/O round-trip … real import upload (fixture files → validation / error / success). Needs a download-dir + committed fixture files. (Trigger-level + Grid-Options behavior is already owned by WV1.5-B — NOT re-covered here; this is the heavy I/O slice only.)" This subplan fully activates that seed for the Import All slice.
- **Walk evidence** (`walk-evidence-corporate-pricing-2026-06-23.md` rows B7–B9) — live-confirmed: Import variant → dialog "Select between 1 and 3 years and choose a currency to continue." Year(s) combobox (multi-select 1–3, options 2021–2028) + Currency (USD/CAD/MXN); Continue disabled:true until both set; on Continue a SECOND dialog opens with `input[type=file]` ("Import All [Variant] — Choose a file to import data / Browse / Upload progress 0% / Cancel / Upload / Close").

NM-2305 (`SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md`) builds the shared `setInputFiles`-based upload helper. This subplan reuses it — hence the Depends-on gate.

---

## Bootstrap

**Identity**: OWNER (multi-identity span: BUILDER fixes drift → HEALER first-run RCA → GIVER TC catalog + XLSX → WATCHDOG do-or-die audit)

**Skills auto-called**:
- `/identity` (gate, fires on launch)
- `/regression-guard` (wrap — BEFORE snapshot before any spec edits, AFTER snapshot at closure)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/ultracoverage` (drives the full /ultracoverage pass on all 4 variants + edges)
- `/final-q` (mandatory exit gate per LR-042)

**Context files**:
- `plans/pending/PLAN_CORP_PRICING_JIRA_DELIVERY.md` (parent)
- `plans/pending/SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md` (SOURCE A — drift-fix fold)
- `plans/pending/SUBPLAN_CORP_PRICING_EDGE_P3.md` (SOURCE B — real I/O fold)
- `plans/pending/SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md` (Depends-on — upload helper)
- `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-23.md` (live evidence rows B7–B9)
- `clients/encore/CLAUDE.md` (LR-ENC-001/002/003/004, LR-008/012/017/036)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, ALL-* rules)
- `docs/read_only_docs/LEARNED_RULES.md` (cross-cutting LR-NNN)
- `.claude/rules/specs.md` (LR-019 per-test baseline, LR-021/022/024/051/052/061)
- `.claude/rules/pipeline.md` (LR-028 activity-log, LR-040 closure gate, LR-046 strict lines, LR-048 subplan structure, LR-060 no silent checkpoint)
- `.claude/rules/browser-tool.md` (LR-054 CLI capability; BrowserTool=cli)
- `.claude/rules/baseline.md` (LR-045 baseline truth; LR-034/LR-044 bug-filing protocol)
- `.claude/rules/deliverable.md` (LR-058 no internal jargon in shipped source)
- `.claude/rules/inventory.md` (LR-062 machine denominator, LR-065 surface behavior-cases)
- `clients/encore/specs_planning/_internal/field-case-generation.md` (§3 surface/behavior families)

**Anti-Assumption Gates**:
- [ ] Phase 0.5b baseline walk consumed from walk-evidence-corporate-pricing-2026-06-23.md rows B7–B9 (no re-walk needed; baseline-absent per LR-ENC-001 for this net-new round-trip contract).
- [ ] No "control un-drivable" verdict without overlay-clear + reload + PO-selector vs live-DOM diff + DOM inspect (Gate 3 — LR-061).
- [ ] Un-skip + LR-019 harden applied atomically in the same change (Gate 5 — LR-021 corollary).
- [ ] No env-rationalized deferral of env-independent TC authoring / MD / XLSX updates (Gate 4 — LR-060).
- [ ] All phases complete OR user-signed `## Deferral Authorization` block recorded (Gate 6 — LR-060).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. **Depends-on check**: confirm `SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md` is in `plans/done/` — the upload helper it builds is required before this subplan's real-upload TCs can be written. HALT if not done.
2. **Navigation registry**: read `.claude/context/navigation.md` — check Exploration Registry for Corporate Pricing toolbar rows; consume listed findings, skip rediscovery.
3. **Agent-mistakes**: read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter ALL-* and GEN-* entries for toolbar-io, dialog-sequencing, and setInputFiles patterns.
4. **Patterns**: read `.claude/context/patterns.md` — match dialog-sequence and file-upload patterns to this subplan's subtasks.
5. **LR scan**: LR-019 (per-test baseline), LR-021 (un-skip + harden), LR-034/LR-044 (bug doctrine), LR-040 (closure gate), LR-046 (strict lines), LR-054 (CLI capability before any "can't drive" claim), LR-058 (no internal jargon in shipped source), LR-061 (verify-before-blocked + positive control), LR-ENC-001/002 (baseline truth, FCC parity structural).
6. **Browser-tool announcement**: `BrowserTool=cli`. Reason: spec edits + dialog interaction via playwright-cli for any live verification pass; no visual/CSS work and no fresh-MFA requirement.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

`baselineScope: baseline-absent`

The new Import ▾ Year+Currency precondition dialog is a net-new contract on the new Navigator Cloud site. Walk evidence from 2026-06-23 (rows B7–B9) is the live truth oracle; the old-site baseline (`navigator2.training.psav.com`) does not have this dialog pattern and is therefore not the source of truth for this specific behavior. Per LR-ENC-001 and LR-048 §5 — `baseline-absent` is recorded here, NOT a HALT. The walk-evidence artifact serves as the evidence anchor for all TC expectations in this subplan.

Evidence anchor: `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-23.md` §B rows B7–B9 (live-confirmed 2026-06-23, Opus-self worker).

---

## Phase 1 — BUILDER: Drift fix — correct TC-CPR-TIO-007..011 to the new Year+Currency dialog contract

The live contract (walk-evidence rows B7–B9):
- `Import ▾` opens menu → 4 variants (same labels as Export: All Equipment Pricing / All Labor Pricing / All Equipment Max Discount / All Labor Max Discount).
- Clicking any variant opens a **precondition dialog** titled "Import" with text "Select between 1 and 3 years and choose a currency to continue." — Year(s) combobox (multi-select, options 2021–2028, limit 1–3) + Currency combobox (USD / CAD / MXN) + Cancel / Continue (disabled:true initially) / Close.
- **Continue gate**: Continue remains disabled until BOTH Year(s) (≥1 selection) AND Currency are set.
- On Continue → a **SECOND dialog** opens: "Import All [Variant] — Choose a file to import data / Browse / Upload progress 0% / Cancel / Upload / Close" with `input[type=file]`.

**Stale assertions in TC-CPR-TIO-008..011** (each calls `openImportVariantDialog(variant)` and then immediately inspects `getImportDialogInfo()` for title, buttons, hasFileInput): the page object method `openImportVariantDialog` currently skips the Year+Currency dialog and goes directly to the file-chooser — this is wrong under the new contract. The dialog is now a two-step sequence.

### Steps:

1. **Read the current spec and page object** — read `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts` (TC-CPR-TIO-007..011) and `clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts` (or equivalent) to understand how `openImportMenu`, `openImportVariantDialog`, and `getImportDialogInfo` are currently implemented.

2. **Update the page object** — extend or replace the Import interaction methods to model the two-step dialog sequence:
   - `openImportMenu()` → clicks `Import ▾` to reveal the 4 variant menu items (unchanged).
   - `selectImportVariant(variantLabel)` → clicks the variant menu item; asserts the precondition dialog appears (title "Import", contains "Select between 1 and 3 years…", Continue disabled).
   - `setImportYears(years: string[])` → selects 1–3 years in the Year(s) combobox (multi-select).
   - `setImportCurrency(currency: string)` → selects a currency (e.g., "USD").
   - `assertContinueEnabled(expected: boolean)` → asserts Continue button disabled state.
   - `clickImportContinue()` → clicks Continue; waits for the file-chooser upload dialog to appear.
   - `getUploadDialogInfo()` → returns `{ title, buttons, hasFileInput }` from the second dialog.
   - `cancelImportFlow()` → closes / cancels the active dialog (precondition or upload), restores clean state.
   No internal-jargon comments in shipped source — plain English only per LR-058.

3. **Correct TC-CPR-TIO-007** (menu opens, lists 4 variants) — this test's assertion is still valid under the new contract (menu items are unchanged); verify it still passes unchanged or adjust if labels drifted.

4. **Correct TC-CPR-TIO-008** (All Equipment Pricing) — rewrite the test body: `selectImportVariant` → assert precondition dialog title + "Select between 1 and 3 years…" text + Continue disabled → set Year + Currency → assert Continue enabled → `clickImportContinue` → assert upload dialog appears with title "Import All Equipment Pricing…", buttons include Browse/Upload/Cancel, hasFileInput true → cancel.

5. **Correct TC-CPR-TIO-009** (All Labor Pricing) — same pattern as TC-008, variant "All Labor Pricing".

6. **Correct TC-CPR-TIO-010** (All Equipment Max Discount) — same pattern, variant "All Equipment Max Discount".

7. **Correct TC-CPR-TIO-011** (All Labor Max Discount) — same pattern, variant "All Labor Max Discount".

8. **Per-test LR-019 baseline hardening**: each corrected test opens a fresh page via `beforeEach` navigation guard. Import interactions do not mutate persistent data (they open dialogs and cancel) — the baseline is inherently stateless for these trigger-level tests. Confirm the `beforeEach` calls `p.open()` or equivalent to guarantee a clean page each run.

9. **First-run**: run `npx playwright test corporate-pricing-toolbar-io --workers=1` — read failure artifacts before any fix attempt (LR-024); fix iteratively, citing evidence.

---

## Phase 2 — BUILDER + GIVER: Real upload round-trip for all 4 variants (reuse NM-2305 upload helper)

### Mutation safety protocol (CRITICAL — read before writing any upload TC)

Import mutates real data in the E2E environment. This is the same constraint as all write operations in this test suite. The following rules are binding for every upload TC in this phase:

- **Dedicated fixture files**: committed under `clients/encore/src/data/corporate-pricing/fixtures/` (or equivalent — verify against NM-2305's fixture directory convention). Each fixture must be scoped to the specific variant (equipment pricing, labor pricing, equipment max discount, labor max discount). Do NOT reuse production-intended files or arbitrary data.
- **Pre-state capture**: before any upload, assert the current state of affected rows (e.g., read a known row's price or discount value to record the before-state).
- **Bounded-retry restore**: after a successful import that mutates data, restore to the pre-state by re-importing the original fixture (or equivalent reverse operation). If no safe restore path exists (e.g., the fixture format does not support a no-op re-import), use controlled no-persist verification: upload to the dialog, assert the success/error response without committing, documented reason why no persist occurred.
- **Never mutate arbitrary data**: only rows whose before-state was explicitly captured may be asserted after import. Do not rely on "whatever is in the grid" as the after-state oracle.
- **If no safe restore exists**: record a documented reason in the test comment (plain English, no internal IDs per LR-058), gate the TC as a verify-only assertion (upload → assert success dialog / progress indicator / error message → cancel or assert rollback), and flag via `/encore-questions` if full round-trip requires admin setup outside test scope.

### TC-CPR-TIO-018 through TC-CPR-TIO-029 (approximate band — check spec for next-free after Phase 1 edits)

Extend the TIO band from TC-CPR-TIO-018 onward. The exact IDs are determined after reading the spec's current high-water mark post-Phase 1. Do not hardcode IDs here — read the spec, use the next sequential free number.

**For each of the 4 variants (All Equipment Pricing, All Labor Pricing, All Equipment Max Discount, All Labor Max Discount), author the following TC set:**

#### Happy-path: valid fixture upload → success response
- Open Import ▾ → select variant → precondition dialog appears.
- Set Year(s) (e.g., 2026) + Currency (USD) → Continue enabled → click Continue.
- Upload dialog appears with `input[type=file]`.
- **Reuse NM-2305 upload helper**: call `setInputFiles` on the `input[type=file]` element with the variant-specific fixture file path.
- Assert upload progress indicator or success signal (browse NM-2305 helper for the exact pattern).
- Assert post-import state: the value(s) from the fixture are reflected in the grid for the captured rows (price / max discount updated to fixture values).
- Execute restore: re-upload the original fixture or document why no restore was applied.

#### Error-path: malformed / wrong-format file → error surfaced
- Same precondition dialog sequence (Year + Currency → Continue).
- Upload a malformed fixture (e.g., a text file with `.xlsx` extension, or a fixture with invalid column headers).
- Assert an error message is surfaced in the dialog (error text visible, not silently ignored).
- Assert no data mutation occurs (grid values unchanged after error).

#### Steps:

1. **Confirm NM-2305 upload helper API**: read `SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md` execution summary (or its spec file) to confirm the helper method signature, fixture directory convention, and `setInputFiles` pattern. Use it exactly — do not duplicate.

2. **Create fixture files** — author minimal valid and intentionally malformed fixtures for each variant in the designated fixture directory. Valid fixture: minimal CSV/XLSX matching the import schema (check the API endpoint signature from walk-evidence row B9 for format hints; if format is unclear, escalate via `/encore-questions` before assuming). Malformed fixture: a file that triggers the app's error path (wrong MIME type, missing required columns, or zero data rows).

3. **Author TCs in spec** — extend `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts` with a new `test.describe` block for "Import All — real upload round-trip" covering all 4 variants × 2 paths (happy + error). Apply LR-019 per-test baseline (mutation safety protocol above), LR-058 (no internal jargon in comments), LR-022 (no hardcoded structural counts).

4. **Author TC entries in MD** — add TC-CPR-TIO-NNN rows to the corporate pricing toolbar-IO test-cases MD with IDs, titles, preconditions, steps, expected results, and tags. Run `npm run check:tc-parity` to confirm alignment.

5. **Update test-plan** — add the new TC IDs to the test-plan scenarios section.

6. **Rebuild XLSX** — run `npm run xlsx:build` (or the `planner:post-complete` script) to include the new TCs in the deliverable workbook.

7. **First-run**: `npx playwright test corporate-pricing-toolbar-io --workers=1` — artifact-first RCA on any failure (LR-024); fix iteratively with evidence.

---

## Phase 2b — Axis-2 Surface-Family Ultracoverage (Case-Generation Standard — the 7 families)

> **Why this phase exists:** Axis-1 cases cover one control at a time. The
> [Case-Generation Standard](../../docs/read_only_docs/CASE_GENERATION_STANDARD.md) Axis 2 (7 active surface
> families) covers behaviors that live *between* cells — result-fidelity, pagination, sorting, combination,
> render-state, empty/volume, persistence. Apply only families whose **trigger** holds; record an inapplicable
> family as `out-of-scope:<family>=<reason ≥20 chars>` per LR-065. The execution walk confirms each trigger live
> (LR-064). **These dispositions FOLD INTO the LR-062 100% completeness gate** — a surface with no
> `behavior-cases:` disposition is undispositioned = closure-gate Cx FAIL. SBC TCs ride `check:tc-parity`; no
> separate surface-parity script. Encore oracles per `field-case-generation.md` §3. QUICK = `TC-CPR-TIO-SBC-*`
> (L1 must-assert); DEEP = `TC-CPR-TIO-SBC-MAX-*` (L2/L3 exhaustive). Number within the SBC band at execution by
> reading the live MD/spec for the next free SBC number; scope each TC title by surface ("Import All") to avoid
> collision with the other toolbar-I/O surfaces sharing the TIO page band.

Import ▾ All is a 4-variant upload flow behind a Year(s)+Currency precondition gate: result-fidelity (each variant's post-import grid reflects the file), combination (the variant × Year × Currency gate), empty-vol (empty / malformed / wrong-format per variant), and persistence (imported data durable) apply; pagination / sorting / render-state are out-of-scope (those belong to the underlying grid surface).

| Family | Trigger | QUICK (`-SBC-`) must-assert | DEEP (`-SBC-MAX-`) exhaustive | Encore oracle |
|---|---|---|---|---|
| result-fidelity | each variant's post-import grid reflects the uploaded file | a known-changed row shows the new value per variant (promotes the happy-path TC) | partial-update per variant; full content match against the fixture | content-anchored lookup, never by index (`feedback_history_content_anchored_lookup.md`); round-trip oracle |
| combination | variant × Year(s) × Currency precondition gate | one variant + year + currency → Continue enables + correct upload context (promotes Phase 3 edges) | bounded **pairwise** covering-array across {4 variants} × {Year 1 / 3} × {USD / CAD / MXN} for the gate (Continue enablement + upload-dialog context) | Year(s) 1–3 limit; currency options (B7–B9); pairwise keeps the matrix bounded (Standard combinatorial method) |
| empty-vol | empty / malformed / wrong-format per variant | an empty/wrong-format file rejected with an observable error (promotes Phase 3 edges) | per-variant empty + large-file boundary | error-path + Phase 3 edges; mutation-safety per fixture |
| persistence | imported data is durable per variant | post-import reload shows the imported values | values persist across reload + browser-back; post-import grid is NOT blank (NM-2206 regression guard) | NM-2206 blank-grid lead; durable round-trip |

**Out-of-scope dispositions (LR-065 token — reason ≥20 chars; execution confirms):**
- `out-of-scope:pagination=Import All is a two-dialog upload flow with no rows-per-page control; post-import grid paging belongs to the underlying grid surface, validated by content-anchored lookup (LR-022)`
- `out-of-scope:sorting=the import flow exposes no sortable column; sort belongs to the underlying grid, not the import surface`
- `out-of-scope:render-state=the import-specific render is the precondition-dialog + upload-dialog progress/error state (covered by drift-fix + error-path TCs); grid cell rendering belongs to the shared grid surface`

**Disposition rule:** at execution, the Import ▾ All surface carries a `behavior-cases:<families>` disposition (LR-065) — result-fidelity + combination + empty-vol + persistence covered (each ≥1 QUICK SBC TC), the other three carrying their `out-of-scope:<family>=<reason>` tokens. Leaving it undispositioned DENIES closure (LR-062 Cx). The DEEP `-SBC-MAX-` band (esp. the combination pairwise matrix) is authored to full exhaustion per the Standard L2/L3 (this is `/ultracoverage`).

---

## Phase 3 — Edge coverage (Year boundary, Currency each-option, Cancel aborts, empty/wrong-format)

Author the following edge TCs (extend the TIO band, continuing from Phase 2's high-water mark):

1. **Year(s) boundary — single year**: select exactly 1 year → Continue enables → proceed normally.
2. **Year(s) boundary — three years**: select exactly 3 years → Continue enables → proceed.
3. **Year(s) boundary — four-year attempt blocked** (if the UI enforces max 3): attempt to select a 4th year → assert the 4th selection is rejected or the combobox caps at 3 (verify live behavior; if it simply allows any N, document and skip this edge; consult `/encore-questions` before filing a bug — watch NM-2165 and NM-2206 for related dialog-behavior bugs per LR-034/LR-044).
4. **Currency each-option**: for one variant (All Equipment Pricing), cycle through USD / CAD / MXN — assert Continue enables for each option and the selected currency is passed to the upload dialog context.
5. **Dialog Cancel aborts** (precondition dialog): open Import ▾ → select variant → precondition dialog open → click Cancel → dialog closes → no file-chooser opens → search page is clean.
6. **Dialog Cancel aborts** (upload dialog): open Import ▾ → select variant → set Year + Currency → Continue → upload dialog open → click Cancel → upload dialog closes → no import initiated → search page is clean.
7. **Continue disabled until both set** (boundary): set Year only → assert Continue disabled; set Currency only → assert Continue disabled; set both → assert Continue enabled (three-assertion gate from walk-evidence row B5).
8. **Empty file upload** (if upload dialog permits clicking Upload without a file): attempt Upload with no file selected → assert error or Upload button disabled.
9. **Wrong-format file**: upload a `.txt` file renamed to `.csv` or a binary blob → assert error dialog or error message surfaced; assert no silent success.

Bug doctrine: any suspicious behavior (dialog does not close on Cancel, Continue enables with only one field set, wrong-format file triggers silent success) → capture as `/encore-questions` clarification first if cause is ambiguous (permission-locked? timing? data-state?), or file per LR-034 once it reproduces in the runner (LR-044). Watch NM-2165 and NM-2206 (related Import dialog bugs already in flight). Consult LR-054 before any "CLI can't drive this" claim.

---

## Phase 4 — HEALER: First-run RCA (conditional)

On any first-run red from Phase 1, 2, or 3:

1. Read failure artifacts (`failure-summary.json`, screenshots) BEFORE re-running or guessing (LR-024).
2. Artifact-first `/rca`: classify signal → hypothesis → evidence-driven fix. No guess-patch; cite evidence per LR-044.
3. Positive-control before any "un-drivable" verdict: prove the same primitive works on a known-positive control (LR-061 §C).
4. Fix iteratively; run the individual spec after each fix to confirm (LR-018 workflow).
5. Max 2 fix cycles per failure — if still red after 2, HALT and surface to user with full artifact evidence. Do not loop.

---

## Phase 5 — WATCHDOG: Do-or-die audit

Run `/audit` (Mode: review) against all changed files:
- `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts`
- `clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts` (or whichever page-object file was updated)
- The test-cases MD and test-plan

Audit checks:
- No false-green assertions (drift-fixed TCs assert the new contract, not a trivially-true value).
- No internal jargon in shipped source (LR-058 — no LR-NNN, SUBPLAN-*, PLAN-*, pipeline codenames).
- No hardcoded structural counts (LR-022).
- Per-test baseline present for every mutating TC (LR-019).
- Mutation safety protocol honored for every upload TC.
- Every folded item from SOURCE A and SOURCE B is present in the spec and test-cases MD.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed during Phases 1–5 that is (same identity) + (same file/module) + (5–30 min) + (no user input needed), pick exactly one:

- **DO-NOW** — execute before Phase 3.5 closure.
- **SPAWN** — `mcp__ccd_session__spawn_task` with a self-contained prompt + acceptance criteria.
- **APPEND** — edit a named pending subplan to add a grep-verifiable line item; verify with `grep -F "<the line>" plans/pending/<file>` before continuing.

Bare "out of scope" / "flagged for follow-up" with no recipient = HALT + ask user (per LR-040 + LR-046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none — baseline-absent; walk-evidence-corporate-pricing-2026-06-23.md is the oracle) | `(none)` | (none) |
| GIVER | test-cases MD + test-plan + XLSX workbook | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_toolbar_io_test_cases.md`<br>`clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec file + page object | `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts`<br>`clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts` | `npx playwright test corporate-pricing-toolbar-io --list` resolves all new TC IDs |
| HEALER | per-fix RCA log (conditional — only if first-run reds) | `(skipped: conditional — only authored if Phase 4 fires; replaced at close with the fixed spec path or confirmed no HEALER work)` | `npx playwright test corporate-pricing-toolbar-io --workers=1` green |
| WATCHDOG | do-or-die audit findings | `(skipped: audit is in-session Phase 5 — findings recorded in activity-log row; no separate artifact unless defects found requiring a BUG-*.json)` | `/audit` Mode review exit clean |
| GARDENER | (none) | `(none)` | (none) |
| OWNER | closure + XLSX rebuild coordination | `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `npm run xlsx:lint` exit 0 |

---

## Acceptance criteria

- [ ] `TC-CPR-TIO-007..011` corrected to the new Year+Currency precondition dialog contract — all 5 pass ×2 consecutive clean runs (`npx playwright test corporate-pricing-toolbar-io --workers=1 --retries=0` twice).
- [ ] Stale `openImportVariantDialog` / `getImportDialogInfo` page-object contract replaced with two-step sequence (precondition dialog → Continue → upload dialog); no old-contract callers remain.
- [ ] Real upload round-trip TCs present for all 4 variants (All Equipment Pricing, All Labor Pricing, All Equipment Max Discount, All Labor Max Discount) — happy-path + error-path per variant; all green ×2.
- [ ] Edge TCs present (Year boundary ×2, Currency each-option, Cancel aborts ×2, Continue gate boundary, empty file, wrong-format file); all green ×2.
- [ ] Mutation safety protocol honored for every upload TC: dedicated fixture files committed, pre-state captured, restore documented.
- [ ] `npm run check:tc-parity` exit 0 — TC IDs in spec match MD.
- [ ] `npm run xlsx:lint` exit 0 — XLSX rebuilt with new TC rows.
- [ ] `npm run typecheck` clean — no TypeScript errors introduced.
- [ ] Do-or-die `/audit` clean: no false-green, no internal jargon in shipped source (LR-058), no hardcoded counts (LR-022), per-test baselines present (LR-019), mutation safety honored.
- [ ] **Axis-2 surface families dispositioned (LR-065 → LR-062 Cx)**: the Import ▾ All surface carries a `behavior-cases:` disposition for all 7 families — result-fidelity + combination + empty-vol + persistence each ≥1 QUICK `TC-CPR-TIO-SBC-*` + full DEEP `TC-CPR-TIO-SBC-MAX-*` (combination DEEP = bounded pairwise across the 4 variants × Year × Currency); pagination/sorting/render-state each an `out-of-scope:<family>=<reason ≥20 chars>` token.
- [ ] `/regression-guard` before/after snapshot clean — no silent breakage on touched files.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.
- [ ] Every folded item from SOURCE A (drift fix for all 4 variants) and SOURCE B (real I/O round-trip seed) is verifiably present in the spec and test-cases MD.

---

## Verification

```bash
# Drift-fixed TCs + new upload round-trip TCs all green
npx playwright test corporate-pricing-toolbar-io --workers=1 --retries=0

# TC IDs in spec match MD
npm run check:tc-parity

# XLSX rebuilt and valid
npm run xlsx:lint

# TypeScript clean
npm run typecheck

# Confirm drift-fixed TCs cover the new two-step dialog contract
grep -F "precondition dialog" clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts

# Confirm SOURCE A fold: all 4 variants drift-fixed
grep -E "TC-CPR-TIO-00[7-9]|TC-CPR-TIO-01[01]" clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts

# Confirm SOURCE B fold: real upload round-trip TCs present
grep -F "setInputFiles" clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts
```

---

## Handoff

Chat-only summary per `feedback_handoff_in_chat_only.md`. Describes outcomes per LR-039 (no obstacle claims; never name a specific failure mode in this section).

When this subplan closes: `TC-CPR-TIO-007..011` are corrected to the live Year+Currency dialog contract; real upload round-trip tests for all 4 Import ▾ variants (happy-path + error-path) and the full edge band are green; `check:tc-parity` and `xlsx:lint` both exit 0; the PLAN_CORP_PRICING_JIRA_DELIVERY.md parent receives a DONE annotation for this child per LR-027 parent-cascade. The Import All obligation from NM-2265 is fully discharged.
