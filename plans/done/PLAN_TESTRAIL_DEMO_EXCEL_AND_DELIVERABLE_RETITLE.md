# Plan — TestRail demo excel + deliverable renumber/retitle NOW; deep sweep → deferred subplan

**Status**: DONE
**Executed**: 2026-06-05

## Execution decisions (LOCKED 2026-06-05 — supersede stale plan-body counts)

These were confirmed with the user at execution start (the "sanity check once" pass surfaced
four drifts in the original body; corrected here per LR-020):

1. **Scope = 16 modules / 547 cases**, NOT "13 / ~725". `corporate-pricing` (detail/search/strategy,
   `TC-LOC-CPR-*`, NM-1443/1445/1441) was added 2026-06-05 *before* this plan and is **in scope** for
   BOTH the retitle and the demo. 547 = sum of the current `encore_test_cases.xlsx` Overview = count of
   `## TC-…:` MD headers.
2. **Authoritative inputs = the real files in `~/Downloads`** (not the plan's paraphrase): the 4 scripts
   `_convert_to_testrail.py` / `_make_mapping.py` / `_rename_tests.py` / `_renumber_spec.py` +
   `test-case-standards_instructions.md`. **Scripts/standard = authority for FORMAT; this plan =
   authority for SCOPE & APPROACH.** Do NOT blind-follow the scripts where they drift from plan: NO
   mapping doc (`_make_mapping.py` skipped), NO xlsx→spec source inversion (`_rename_tests.py` direction
   rejected — our source of truth is the MD), the scripts' stale `tests/…`/`src/data/…` paths are
   ignored (we are on `clients/encore/…`).
3. **Retitle = conform EVERY title to the standard §3** in every place (MD header + spec `test()` +
   data `name`), reviewer-satisfaction bar. Already-compliant titles left as-is; violators
   (shorthand/selectors/IDs/>80char) fixed everywhere.
4. **Demo = pure-TS throwaway** converter (e.g. `scripts/_gen-testrail-demo.ts`, created then removed; Python is NOT installed; no install),
   output to `clients/encore/test_cases_xlsx/encore_test_cases_testrail.xlsx` (sibling of the live xlsx).
   Its schema/format is a faithful 1:1 port of `_convert_to_testrail.py` (`TESTRAIL_COLUMNS`, multi-row
   per-step, `per_step_expected` / `derive_test_data` / `derive_automation`). The client reviewer
   verifies the demo, not us.
5. **Reversibility correction**: `specs_planning/` (the 16 MD files) is **gitignored** — the original
   "git-revert → byte-for-byte" claim is FALSE for the MDs. Real net = a timestamped backup of the 16
   MDs + xlsx taken before any edit (`~/encore_backups/testrail_<ts>/`). Tracked artifacts (spec / data /
   blocked-reasons.json / xlsx) remain git-revertible.

## Context

A JBS/Encore person gave 4 Python review scripts + a `test-case-standards_instructions.md` standard.
They review our work with the scripts and aren't satisfied with the current titles. The client wants
our cases in **TestRail "Test Case (Steps)" format**, with clean plain-English titles and gap-free
numbering. Governing rules from the user:

- **Satisfy both** the 4 scripts **and** the MD standard — without nuking what we have; reversible.
- **Risk-tier:** the heavy TestRail mutation goes into a **new file**; the safe improvements (titles)
  and the authorized renumber apply to the real deliverables (git-revertible).
- **Deliverables FIRST for speed.** Everything non-deliverable (other-module gaps, internal
  references, title refs outside deliverables) is **deferred to a subplan that runs later, not
  alongside**.
- The new excel is a **one-time throwaway conversion** — not a permanent pipeline citizen — until/if
  the client accepts it. Do **not** wire the standard into our Planner/Generator agents yet (their
  §10–12), or our agents would mass-produce the new format before approval.

Verified facts (no assumptions): Notes IDs currently skip `028, 029, 030, 031, 032, 038` (the deleted
HIST-notes cases); `check-tc-parity.ts` compares **IDs only** (titles can change freely); our markdown
is the source that `to-xlsx.ts` regenerates the deliverable from; titles are functionally inert (grep /
`dependencyGate` / `blocked-reasons` key on the ID).

## Scope NOW — deliverables only

### 1. New demo TestRail excel — additive, delete-to-revert
A **standalone throwaway script** (NOT added to `index.ts` / `package.json` / ship-gate) reads our
markdown via the existing `CsvConverter.parseSimpleFormat`, runs every cell through `scrubInternalVocab`,
and writes `clients/encore/test_cases_xlsx/encore_test_cases_testrail.xlsx` for **all 547 cases across
16 modules**, conforming to `_convert_to_testrail.py`'s exact output schema (the `TESTRAIL_COLUMNS`
order): `ID, Title, Mission, Section, Section Hierarchy, Section Depth, Module, Sub-Module, Test Data,
Template, Type, Priority, Automation Type, Preconditions, References, Steps (Step), Steps (Expected
Result)` — one sheet per module, multi-row per-step (first row carries case-level cols; later rows blank
except the two Steps cols). Per-step Expected Results are derived exactly as the python's
`per_step_expected` (last step = case-level expected; earlier steps = verb-templated observable outcome —
there is **no** `[auto — pending review]` tag; that was a paraphrase artifact). Script is removed once the
demo file is finalized.

### 2. Renumber Notes — close the 6 gaps; deliverables; git-revertible
Renumber survivors contiguous (033→028 … 064→058) using a two-phase old→placeholder→new pass, applied
across the **deliverable artifacts**: Notes markdown, Notes spec (`test()` titles + `dependencyGate`
refs), `location-notes.data.ts` (`SPECIAL_CONTENT_TESTS` tcIds), `blocked-reasons.json` Notes entries,
then regenerate the current xlsx + the demo xlsx. `check:tc-parity` green proves consistency. **Notes
only now**; other modules' gaps (if any) → subplan.

### 3. Retitle all 16 modules to the standard — deliverables; backup-revertible
Conform every title to the standard's §3 style (short plain-English outcome / `Verify <behaviour> when
<condition>`, <80 chars, no shorthand / IDs / selectors) — e.g. `1-char persist (BVA min)` →
`Verify a single-character note persists after save and reload`. Already-compliant titles stay as-is;
violators are fixed. Apply in the **deliverable artifacts only**: the 16 markdown files, spec `test()`
titles, `*.data.ts` names, then regenerate the current xlsx + demo xlsx. Do **not** hunt title
references outside deliverables — that's the subplan.

## Deferred to a subplan (authored at execution; runs later, not alongside)

`plans/pending/SUBPLAN_TESTRAIL_DEEP_SWEEP.md` — created when we execute, run on demand:
- Discover + renumber any gaps in the other 12 modules.
- Sweep + fix every **non-deliverable** reference to renumbered Notes IDs (bug JSONs, internal docs,
  old-site-baseline / walk-evidence notes, etc.).
- Sweep + fix **non-deliverable** title references.
- Purpose: keep delivery fast now; clean the long tail later.

## NOT done

- No wiring the standard into our agents until the client approves (their §10–12).
- No running/porting the 4 Python scripts; no mapping doc (their own review tool).

## Files (NOW)

- **Throwaway (create → delete):** a one-off converter script (e.g. `scripts/_gen-testrail-demo.ts`),
  not committed to the permanent pipeline; removed after the demo xlsx is produced.
- **Create (keep):** `clients/encore/test_cases_xlsx/encore_test_cases_testrail.xlsx`.
- **Edit (deliverables — renumber Notes + retitle all 16):** the 16 MD files under
  `clients/encore/specs_planning/test-cases/setup/**`; spec `test()` titles across
  `clients/encore/specs/**/*.spec.ts` (+ Notes IDs/deps in `location-notes.spec.ts`);
  `clients/encore/src/data/testdata/locations/location-notes.data.ts`;
  `export_test_cases/blocked-reasons.json` (Notes refs); regenerate the current xlsx via
  `npm run xlsx:build`.
- **Create (deferred):** `plans/pending/SUBPLAN_TESTRAIL_DEEP_SWEEP.md`.
- **Reuse (no change):** `scrubInternalVocab`, `xlsx-lint-rules.mjs`, `parseSimpleFormat`,
  `augmentByTcId`, ExcelJS writer pattern.

## Verification & reversibility

- `npm run check:tc-parity` green after the Notes renumber (IDs consistent across spec/MD/xlsx).
- `npm run xlsx:build` self-lint (LR-ENC-004) passes; current xlsx differs only in titles + Notes IDs.
- Notes IDs read contiguous; `npm test -- --grep "TC-LOC-NTS"` resolves every test.
- Demo xlsx imports as TestRail "Test Case (Steps)"; jargon-lint clean.
- **Revert:** delete `encore_test_cases_testrail.xlsx`; `git checkout` the tracked artifacts (spec /
  data / blocked-reasons.json / xlsx); restore the 16 MD files from the timestamped pre-edit backup at
  `~/encore_backups/testrail_<ts>/md_setup/` (the MDs are gitignored, so git-revert alone does NOT
  restore them — see decision #5). After restoring MDs, re-run `npm run xlsx:build` to confirm the xlsx
  regenerates byte-equivalent to today's.

---

### Execution Summary

**Executed**: 2026-06-05 (OWNER, single interactive session). Scope = deliverables-only fast path; the
non-deliverable long tail was authored into `plans/pending/SUBPLAN_TESTRAIL_DEEP_SWEEP.md` (created, PENDING).

**Sanity-check (the user's "sanity check once") caught four plan drifts, all corrected before execution**
(LR-020): (1) "13 modules / ~725 cases" → actually **16 modules / 547 cases** (corporate-pricing added
the same day); (2) the demo schema column order in the body was a paraphrase — the real
`_convert_to_testrail.py` `TESTRAIL_COLUMNS` order was used; (3) the "git-revertible" reversibility claim
is false for the 16 MD files (`specs_planning/` is gitignored) — a timestamped pre-edit backup was taken
instead; (4) **the renumber premise was wrong** — `028/029/030/031/032/038` were NOT deleted gaps but
**live HIST col-69 cases relocated to the management_history sheet**; a naive renumber would have minted
duplicate IDs. Resolved with the user: re-ID those 6 to `TC-LOC-MGH-020..025`, then renumber Notes.

**Item 2 — Notes renumber + HIST re-ID (deliverables; verified):**
- Re-ID 6 HIST cases `TC-LOC-NTS-028..032/038 → TC-LOC-MGH-020..025`; renumber Notes survivors
  `TC-LOC-NTS-033..064 → 028..058` (Notes now contiguous **001–058**). Applied via a one-off two-phase
  (old→placeholder→new) pass across the Notes MD, the management_history MD, `location-notes.spec.ts`,
  `location-management-history.spec.ts`, and one `field-case-runner.ts` doc-comment. `location-notes.data.ts`
  + `export_test_cases/blocked-reasons.json` held only identity-range IDs (013/018/019/020) — unchanged.
- Verified: 0 duplicate `test()` IDs in either spec; the lone cross-spec `TC-LOC-NTS-053` in the MGH spec
  is a doc-comment reference, not a second definition.

**Item 3 — Retitle to standard §3 (deliverables; verified):** 61 titles that read like internal QA
shorthand (>80 chars, `aria-invalid`, `Spinbutton`, "HIST col 69", BVA, `\n`, `->` step-sequences,
idempotent/pristine/dirty) were conformed to plain-English outcome phrases (<80 chars, no
code/selectors/IDs). Applied to every MD header + matching spec `test()` title (50 spec titles synced;
11 are MD-only/planned). The other ~486 titles were already compliant and left untouched. The two MD
summary-count headers (Notes 63→58, MGH 19→25) were corrected.

**Item 1 — TestRail demo workbook (deliverable; created):**
`clients/encore/test_cases_xlsx/encore_test_cases_testrail.xlsx` — 16 module sheets, 547 cases, 2604
step-rows, multi-row-per-step, schema = `_convert_to_testrail.py` `TESTRAIL_COLUMNS` (17 cols, exact
order) + derived Mission / Test Data / per-step Expected / Automation Type. Throwaway converter created,
run, archived to the backup dir, then removed (not wired to package.json / index.ts / ship-gate).

**TCs dropped: none.** **MCP/live-browser verification: N/A** — this was a deterministic ID/title/format
transform on existing artifacts; no app behavior was asserted (BrowserTool not used).

**Documentation changes:** corrected this plan's stale counts/schema/reversibility (LR-020); authored
the deferred subplan; corrected the Notes + management_history MD summary lines.

**Test-pass confirmation (2026-06-05):**
- `npm run check:tc-parity` → **PASS** (Spec 443, Markdown 547, XLSX 547; every spec TC present in MD + XLSX).
- `npm run xlsx:build` + `npm run xlsx:lint` → **PASS** (0 vocab hits, 0 integrity violations, 0 warnings; 547 rows, 16 sheets).
- `npx playwright test --list` (inside parity) compiled all specs — the renumber/re-ID/retitle broke no test references.
- Demo workbook re-opened and verified: 16 sheets, correct TestRail schema, multi-row steps, 0 vocab leaks.

**Reversibility net:** pre-edit backup of all 16 MDs + the prior xlsx + the throwaway scripts at
`~/encore_backups/testrail_<ts>/` (the MDs are gitignored — git alone cannot restore them).
