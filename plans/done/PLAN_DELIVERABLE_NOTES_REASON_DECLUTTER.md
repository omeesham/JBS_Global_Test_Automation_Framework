> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER.md`. All context below.**
>
> The agent self-bootstraps from the frontmatter + sections in this file. On invocation, follow this sequence **without any additional user prompting**:
>
> 1. **Identity**: load `/identity` per the Identity field below (OWNER — internal tooling, no §2 pipeline path collision).
> 2. **Skills**: `/execute` (leading) auto-calls `/identity`, `/relevant`, `/regression-guard`, `/audit`, `/reflect`, `/final-q`.
> 3. **Model + thinking + permission-mode**: read `**Model**` / `**Thinking**` / `**PermissionMode**` from frontmatter (LR-041). Phase 0 present → keep thinking tier high.
> 4. **Dependency gate**: verify the one Depends-on item is DONE in `plans/done/`. HALT if absent.
> 5. **Context load**: read this plan in full + the two source files it changes most (`export_test_cases/to-xlsx.ts`, `scripts/xlsx-lint-rules.mjs`).
> 5.5. **Browser tool**: `none` — this plan never browses a live app (pure file edits + a local workbook rebuild). Declared in frontmatter.
> 6. **Phase 0 FIRST**: run the freshness/regression snapshot before any edit.
> 7. **Execute Phases 1+** per Step-by-Step.
> 8. **Handoff**: flip the Status field to DONE + add the Executed date, append an activity-log row (LR-028 + LR-037), `git mv` to `plans/done/`, `npm run plans:reindex`, commit.
>
> **HALT + ASK USER** if: dependency blocker / scope ambiguity beyond the KEEP list / Phase 0 reveals >30% scope extension / regression-guard shows unrelated changes / LR-037 timestamp drift / any gate (`xlsx:lint`, `check:tc-parity`, `test:xlsx-merged-shape`, `test:xlsx-continuation-row`, `typecheck`) cannot be made green by the changes below.

---

# PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER — `Notes / Reason` reason-only + last column + **permanent anti-pollution gate**

**Status**: DONE
**Executed**: 2026-06-11
**Priority**: P2
**Created**: 2026-06-11
**Identity**: OWNER
**Model**: Opus
**Thinking**: hi
**PermissionMode**: acceptEdits
**BrowserTool**: none
**Depends on**: PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT (DONE — established the 13-col merged schema + `composeNotesReason` + the lint integrity stack this plan refines)

---

## 1. Context — why this change

The merged TestRail workbook's `Notes / Reason` column is over-populated. Empirical read of the committed workbook (`encore_test_cases.xlsx`, 634 cases):

| Automation Status | rows | with `Notes / Reason` |
|---|---|---|
| Pass | 507 | **222** |
| Blocked | 19 | 19 |
| Skipped | 8 | 8 |
| (blank — Manual / Pending) | 100 | 34 |

**256 of those populated cells are on rows that are not Fail / Skipped / Blocked.** They split into:
- **158 `Cleanup after test: …` breadcrumbs** — test-restore instructions, not client information.
- **~30 polished behaviour notes** on `corporate_pricing_search` (e.g. *"The Pricing Strategy filter is a free-text box, not a dropdown"*) — commentary, not a reason.
- **~30 internal-leakage notes** currently shipping to the client: `MCP ref:`, `Validators.min(1)`, `per source code`, `Added per requirements update (Jira)`, `CORS errors`, `form control error`, and the `Internal: for USA` tail on `TC-LOC-LI-058`. These slip past the vocab deny-list (agent-mistakes 2026-06-09 B1: the deny-list is shape-blind to whole jargon classes) and partly arrive via the trailing-section `Notes:` swallow (agent-mistakes 2026-06-10 ALL-078b).

**Root-cause separation.** Two distinct inputs feed the cell via `composeNotesReason(notes, reason, execution)`:
1. `tc.ifFailedReason` — the **curated reason** (from `blocked-reasons.json`, fixme registry, spec runtime fixmes). The build's integrity tripwire (`to-xlsx.ts` ~L505) already **guarantees this is never present on a Pass row**. This is the signal.
2. `tc.notes` — MD `**Notes**:` + folded `**Cleanup**:` content. Present on Pass and non-Pass alike. This is the entire noise + leak surface.

**User directives (this session, both confirmed):**
- **Reason scope** = *"Keep curated reasons too"* — populate for Fail / Skipped / Blocked **and** any not-yet-automated / manual case that carries a curated reason (≈21 client-safe reasons like *"Not yet automated — requires a different office"* and *"Kept as a manual check"*).
- **Commentary** = *"Drop all of it"* — remove the MD-notes content (cleanup + behaviour commentary + leakage) from the deliverable entirely. It stays in the MD source.
- Plus: **move `Notes / Reason` to the last column.**

**Resulting rule (deterministic, source-based — no per-note content classification):**
> `Notes / Reason` carries **only `tc.ifFailedReason`** (with the existing execution-gated `Blocked — ` marker). `tc.notes` is no longer emitted to the column. Because the integrity invariant keeps `ifFailedReason` off every Pass row, Pass rows become empty automatically; the ≈21 curated Pending/Manual reasons survive; all cleanup/commentary/leakage disappears.

The only content that would be *lost* under a naive drop is the 4 `TC-LOC-LI-111…114` *"Kept as a manual check"* explanations — those live in `tc.notes`, not `ifFailedReason`. They are migrated into `blocked-reasons.json` so they survive as curated reasons (the user explicitly named this one as a keep).

**Make it impossible to recur (user directive: "make sure no one pollutes like this in future").** The one-time composer change is necessary but not sufficient — a future edit could re-route `tc.notes` back into the column. The durable lock is a new **C9 integrity check inside the shared `lintWorkbook()`** (`scripts/xlsx-lint-rules.mjs`). Because that one function is called by the build self-lint, the commit hook (`.githooks/pre-commit` §5b → `xlsx-vocab-lint.mjs`), AND both ship modes (`verify-no-forbidden.mjs` `lintXlsxDir` for `--client` and `--target`), a single check fires at **every** gate. **Robustness constraint (verified while planning):** the `--target` ship gate lints a `git archive HEAD` extract *directory* that contains the workbook but not `export_test_cases/`. In practice the lint **module** still executes from the repo (`verify-no-forbidden.mjs` does `await import('./xlsx-lint-rules.mjs')`), so it resolves the registry relative to its own repo path and the file is normally reachable. To avoid depending on that subtlety, C9's two primary clauses are **workbook-only (zero external-file dependency)** so the gate holds even if `lintWorkbook` is ever pointed at a standalone workbook with no repo context; the stronger curated-source cross-check (C9c) loads the registry relative to the lint module and **fail-opens** (skips itself) if the file is absent — it never false-fails a ship. See §2.7.

### Review findings folded in (`/review` of the touched surface)
- **R1 (latent leak, now fixed for free):** internal tokens ship on Pass rows today. Dropping `tc.notes` removes the whole vector without re-opening the deny-list.
- **R2 (dead code after change):** `NOTES_SEPARATOR` / `NOTES_SEP_RE` and the `notes` half of `splitNotesReason` go dead — the producer stops emitting the `\n\nNotes: ` tail. Simplify, don't leave vestiges (Council: no dead code).
- **R3 (`sp00-audit-v5.mjs` over-strict under the new model):** its "Automated=No ⇒ reason required" check will false-flag ~30 Pending rows that now legitimately have no reason. Narrow it to `Fail ⇒ reason required` (a real gap) — keep the tool meaningful. It is advisory / manual-run (no gate depends on it).
- **R4 (header name kept on purpose):** the column still legitimately carries *reasons*; renaming to `Reason` would touch 6 lockstep sites for cosmetics the user did not request → **out of scope, header stays `Notes / Reason`.**

---

## 2. Exact changes

### 2.1 `export_test_cases/to-xlsx.ts` (the emitter — core)

**(a) Reorder `MODULE_SHEET_HEADERS`** — `Notes / Reason` moves from position 10 to position 13 (last); `Preconditions` / `Steps (Step)` / `Steps (Expected Result)` shift left one:
```ts
const MODULE_SHEET_HEADERS = [
  'TC ID', 'Title', 'Module', 'Submodule', 'Test Data', 'Type', 'Priority',
  'Coverage Status', 'Automation Status',
  'Preconditions', 'Steps (Step)', 'Steps (Expected Result)',
  'Notes / Reason', // execution-reason channel — reason-only, last column (declutter plan)
] as const;
```

**(b) Replace `composeNotesReason` with a reason-only `composeReason`** (drop the `notes` param, the `NOTES_SEPARATOR`, and the appended-notes branches; keep idempotent marker strip + scrub + execution-gated `Blocked — `):
```ts
const BLOCKED_MARKER_RE = /^Blocked\s*[—–-]\s*/i;
// NOTES_SEPARATOR removed — the column no longer composes tc.notes (declutter plan).

/**
 * Compose the 'Notes / Reason' cell. Reason-only: the column is reserved for the
 * curated execution reason (why a case is not a clean automated pass). tc.notes
 * (MD Notes / Cleanup) is intentionally NOT surfaced — it is cleanup/commentary,
 * not client information, and was the sole content on passing rows. The integrity
 * tripwire below guarantees a Pass row never carries ifFailedReason, so Pass rows
 * resolve to ''. The 'Blocked — ' marker stays execution-gated (only when exec is
 * actually 'Blocked'); idempotent strip avoids 'Blocked — Blocked — …'.
 */
export function composeReason(reason: string, execution: string): string {
  const cleanReason = scrubInternalVocab(reason || '').trim().replace(BLOCKED_MARKER_RE, '').trim();
  if (!cleanReason) return '';
  return execution === 'Blocked' ? `Blocked — ${cleanReason}` : cleanReason;
}
```
Exported for the new unit test (mirrors how `toSheetName` is exported for `to-xlsx-sheet-name.test.ts`).

**(c) Emitter loop** — call site + the three row arrays:
```ts
const notesReason = composeReason(tc.ifFailedReason, tc.automationExecution);
...
ws.addRow(
  i === 0
    ? [
        tc.id, tc.title, tc.module, tc.submodule, testData, DEFAULT_TYPE, DEFAULT_PRIORITY,
        tc.coverageStatus, tc.automationExecution,
        tc.preconditions, stepCell, expected,
        notesReason, // last column
      ]
    // Continuation rows carry ONLY Steps (Step)+(Expected Result) — now cols 11-12.
    : ['', '', '', '', '', '', '', '', '', '', stepCell, expected, '']
);
```

**(d) SUMMARY row** — move the `Last Updated:` cell to col 13:
```ts
const summary = ws.addRow([
  'SUMMARY', SHEET_DISPLAY_NAMES[mdSlugForSheet(sheetName)] ?? sheetName,
  '', '', '', '', '',                                                         // cols 3-7
  `Automated: ${metrics.automated} / Pending: ${metrics.pendingAutomation}`,  // Coverage Status
  `Pass:${metrics.pass} Fail:${metrics.fail} Skipped:${metrics.skipped} Blocked:${metrics.blocked}`, // Automation Status
  '', '', '',                                                                  // Preconditions, Steps (Step), Steps (Expected Result)
  `Last Updated: ${buildIsoDate}`,                                            // Notes / Reason (last)
]);
```

**(e) Remove the now-unused `notes` carrier** — `ParsedTc.notes`, the `notesCol` lookup, and the `notes:` field in `parseMd` (nothing consumes `tc.notes` after (b)). Add a one-line comment that MD Notes are intentionally not surfaced.

**(f) Update the header-shape doc comments** (the "cols 1-11 / continuation cols 12-13" prose) to the new "first row cols 1-12 + reason at 13; continuation carries only Steps at cols 11-12" shape.

### 2.2 `scripts/xlsx-lint-rules.mjs` (lint lockstep)

- **`CHECKED_COLS`**: reorder to match — `'Notes / Reason'` last.
- **`splitNotesReason`**: simplify — the producer no longer emits the `\n\nNotes: ` tail, so drop `NOTES_SEP_RE` and the tail-slice; the cell *is* the reason. Keep the `{ reasonPart, hasBlocked, blockedReason }` shape (C1/C3/C4/C5 + the continuation-row test consume it). Update the lockstep comment to point at `composeReason` (not `composeNotesReason`).
- **Integrity checks unchanged in logic** (they read by column name): C1 (Pass+marker), C3 (Blocked+no marker, warn), C4 (Manual+status/marker), C5 (<4-word blocked reason). C4's "(plain Notes OK)" parenthetical is now moot — reword the comment, the check stays correct.

### 2.3 `export_test_cases/blocked-reasons.json` (preserve the 4 manual reasons)

Change `TC-LOC-LI-111` … `TC-LOC-LI-114` from `"reason": ""` to the curated manual reason (verbatim intent from the existing MD Notes, client-safe):
```json
"TC-LOC-LI-111": { "coverage": "Manual", "execution": "", "reason": "Kept as a manual check — a security / exploratory verification that requires tester observation on each run." },
```
(same for 112/113/114). `coverage: Manual`, `execution: ""` keep them out of C1/C3/C5; no `Blocked — ` marker → C4 passes (Manual + blank execution + no marker). `TC-LOC-NTS-018…020` stay blank (their MD note was cleanup, not a why-manual reason — correctly dropped; do NOT fabricate a reason).

### 2.4 `scripts/sp00-audit-v5.mjs` (advisory tool — keep correct + non-noisy)

- **`COLUMNS`**: reorder to match the sheet (`'Notes / Reason'` last) — used positionally for `COLUMNS[c]` labels, so order must track.
- **Narrow the required-reason check** (R3): replace `if ((automated === 'No' || execution === 'Fail') && !reason)` with `if (execution === 'Fail' && !reason)`. A Pending-Automation row without a reason is now legitimate; a failing row without one is a real gap. Keep check 4 (contradictory Automated=No + Pass).

### 2.5 Tests (test-first, then regenerate)

- **NEW `scripts/xlsx-compose-reason.test.ts`** (sibling of `to-xlsx-sheet-name.test.ts`; `npm` script `test:xlsx-compose-reason`): assert `composeReason` — `('','')→''`; `('grid date values do not persist','Skipped')→'grid date values do not persist'`; `('the dialog still lists…','Blocked')→'Blocked — the dialog still lists…'`; idempotent `('Blocked — x','Blocked')→'Blocked — x'` (single marker); execution-gated `('Not yet automated — …','')→'Not yet automated — …'` (no marker). Pins the reason-only contract.
- **`scripts/xlsx-merged-shape.test.mjs`**: reorder `MERGED_HEADERS` to the new order. `FORBIDDEN_OLD_COLUMNS` unchanged.
- **`scripts/xlsx-continuation-row.test.mjs`**: reorder `HEADERS`, the `cont()` array (`stepCell`/`expected` now at indices 10/11, blank `Notes / Reason` at 12), the fixture first-rows + SUMMARY row. Add **C9 assertions** (this test already drives `lintWorkbook`): (i) a Pass first-row whose `Notes / Reason` is non-empty → raises a `C9` violation (C9a); (ii) a row whose cell starts `Cleanup after test:` → raises `C9` (C9b); (iii) a Blocked/Skipped row with a real reason → **no** C9; (iv) a Pass row with an empty cell → **no** C9. (C9c needs the real `blocked-reasons.json`, exercised by the full-workbook gate run in Phase 3, not the synthetic fixture.)

### 2.6 Regenerate + docs

- `npm run xlsx:build` (list-only) regenerates `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` — the committed deliverable (build runs its own self-lint).
- Append a dated one-paragraph note to `export_test_cases/README.md` (reason-only + last-column) and refresh the merged-architecture row in `.claude/context/navigation.md` (note `Notes / Reason` is reason-only, last col).

### 2.7 `scripts/xlsx-lint-rules.mjs` — **C9 anti-pollution gate** (the permanent lock)

Add a new integrity check `C9` to `lintWorkbook()`, after the C1–C5 block. It fires on every first-row (TC ID present, ≠ `SUMMARY`). Reads `exec = Automation Status`, `nr = (Notes / Reason).trim()`. Three clauses, two always-on + one conditional:

```js
// C9 — Notes / Reason anti-pollution gate (declutter plan). The column is the
// curated execution-reason channel ONLY; cleanup/commentary must never ship.
// Always-on clauses are workbook-only so they hold at ship --target (the archive
// extract has no export_test_cases/). 'first-rows' = TC ID present (continuation
// rows have a blank TC ID and a blank Notes / Reason by construction).

// C9a — a clean automated pass has nothing to explain → cell must be empty.
if (exec === 'Pass' && nr) {
  integrityViolations.push({ code: 'C9', sheet: r.sheet, tcId: hitTcId,
    detail: `Notes / Reason populated on a Pass row — a clean pass needs no note (cleanup/commentary must not ship): "${nr.slice(0, 80)}"` });
}
// C9b — cleanup breadcrumbs are test-maintenance, never client content.
if (/^Cleanup after test\b/i.test(nr)) {
  integrityViolations.push({ code: 'C9', sheet: r.sheet, tcId: hitTcId,
    detail: `Notes / Reason carries a "Cleanup after test…" breadcrumb — must not ship: "${nr.slice(0, 80)}"` });
}
// C9c (CONDITIONAL — only when export_test_cases/blocked-reasons.json is present;
// silently skipped in the shipped extract). A blank-execution row may carry a
// reason ONLY if it is a curated reason in blocked-reasons.json. Any other
// populated blank-exec cell is commentary that slipped in.
if (curatedReasonIds && exec === '' && nr && !curatedReasonIds.has(hitTcId)) {
  integrityViolations.push({ code: 'C9', sheet: r.sheet, tcId: hitTcId,
    detail: `Notes / Reason populated on a non-fail/skip/blocked row with no curated reason in blocked-reasons.json — commentary leak: "${nr.slice(0, 80)}"` });
}
```

`curatedReasonIds` loader (top of `lintWorkbook`, fail-open on absence):
```js
let curatedReasonIds = null; // null ⇒ registry unavailable (shipped extract) ⇒ skip C9c
try {
  const brPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'export_test_cases', 'blocked-reasons.json');
  if (existsSync(brPath)) {
    const br = JSON.parse(readFileSync(brPath, 'utf8').replace(/^﻿/, ''));
    curatedReasonIds = new Set(
      Object.entries(br).filter(([k, v]) => k.startsWith('TC-') && v && String(v.reason || '').trim() !== '').map(([k]) => k)
    );
  }
} catch { curatedReasonIds = null; } // unreadable ⇒ degrade to C9a/C9b only (never false-fail a ship)
```

**Why no false positives:** Fail/Skipped/Blocked rows are never touched by C9. The ~21 curated Pending/Manual reasons live in `blocked-reasons.json` → in `curatedReasonIds` → exempt from C9c (and they're not Pass, not cleanup → exempt from C9a/C9b). No legitimate reason starts with "Cleanup after test". At ship `--target`, C9c is skipped (registry absent) and C9a/C9b still hold. This is **fail-green** — confirm 0 C9 hits on the freshly-rebuilt workbook before committing.

### 2.8 (optional hardening, fail-green) — close the deny-list shape-gaps the leak rode in on

Agent-mistakes 2026-06-09 (B1): the vocab deny-list is shape-blind to whole classes. Since dropping `tc.notes` removes the leak vector, this is belt-and-suspenders for any future hand-written curated reason. Add to `BANNED` ONLY after confirming **0 occurrences** across the rebuilt workbook (the established fail-green discipline for every `BANNED` entry): `{ name: 'MCP ref', re: /\bMCP\s+ref\b/i }`, `{ name: 'per source code', re: /\bper\s+source\s+code\b/i }`, `{ name: 'Jira tool ref', re: /\bJira\b/i }`. If any has a non-zero count post-rebuild, DO NOT add it blindly — investigate the cell first.

### NOT touched (deliberate)
- `export_test_cases/to-csv.ts` — the parity oracle reads/writes by **name**; column order is irrelevant to it and its standalone `Notes` CSV column is its own schema. No functional change (optional 1-line comment only).
- `scripts/check-tc-parity.ts` — entirely ID/title-based; reorder is invisible to it. (Run it as a gate anyway.)
- Header name `Notes / Reason` — kept (R4).
- `module-codes.json`, `testrail-format.ts`, `sp00-augment-logic.ts` — untouched (no column/notes dependency).
- MD test-case sources — untouched; notes remain in source, just not surfaced.

---

## 3. Step-by-Step

- **Phase 0** — `/regression-guard` BEFORE snapshot of the 6 touched source files. `npm run xlsx:freshness` (or note current state). Confirm the Depends-on plan is DONE.
- **Phase 1 (test-first)** — write `xlsx-compose-reason.test.ts` (red), add npm script. Reorder the two existing test files' header/fixture arrays + the Pass-empty assertion.
- **Phase 2 (emitter + lint + data + guard)** — apply 2.1, 2.2, 2.3, 2.4, **2.7 (C9 gate + `curatedReasonIds` loader)**, and 2.8 only after the 0-occurrence check. `npm run typecheck`.
- **Phase 3 (regenerate + gate)** — run, in order, fixing fallout at the source (never coerce):
  1. `npm run xlsx:build` (self-lint runs)
  2. `npm run xlsx:lint`  → 0 vocab, 0 integrity (incl. **0 C9**). Then a negative test: temporarily hand-edit one rebuilt cell to inject a `Cleanup after test:` note → `xlsx:lint` must FAIL with a C9 hit → revert. Proves the gate bites.
  3. `npm run check:tc-parity`  → PASS
  4. `npm run test:xlsx-merged-shape`
  5. `npm run test:xlsx-continuation-row`
  6. `npm run test:xlsx-compose-reason`
  7. `npm run test:xlsx-sheet-name` (regression — unaffected)
  8. `node scripts/sp00-audit-v5.mjs` (advisory — expect dramatically fewer Notes-column flags)
- **Phase 2.5** — Adjacent-Sweep: grep for any other reader of `composeNotesReason` / `NOTES_SEPARATOR` / positional `Notes / Reason` index across `scripts/` + `export_test_cases/` (DO-NOW if in-scope, else flag).
- **Phase 3.5** — `/audit` (what was NOT done) → `/reflect` → flip Status DONE + Execution Summary → `git mv` to `plans/done/` → `npm run plans:reindex` → activity-log row (LR-028/LR-037) → `/final-q`.

---

## 4. Verification artifact (D23 — re-runnable)

After Phase 3, re-run the read-only inspection and assert:
```
node .recover-scratch/notes-inspect.mjs   # (read-only; or inline equivalent)
EXPECT:
  Pass        total=507  withNotes=   0      ← was 222
  Blocked     total= 19  withNotes=  19      ← unchanged (curated reasons)
  Skipped     total=  8  withNotes=   8      ← unchanged
  (blank)     total=100  withNotes= ~21      ← curated Pending/Manual reasons survive (incl. LI-111…114)
  "Cleanup after test:" occurrences in Notes / Reason column = 0
  "MCP ref" / "Internal:" / "Jira" / "per source code" occurrences = 0
```
Plus all eight gate commands in Phase 3 exit 0 (the four `test:xlsx-*` + `xlsx:lint` + `check:tc-parity` + `typecheck`).

**Anti-pollution gate proof (the "no one pollutes in future" deliverable):**
```
# 1. Clean workbook passes with zero C9:
npm run xlsx:lint            # → PASS, integrity violations: 0

# 2. The gate actually bites — inject pollution, expect FAIL:
#    (hand-edit any Pass-row 'Notes / Reason' cell to "Cleanup after test: x" in a scratch copy,
#     OR rely on the C9 unit assertions in xlsx-continuation-row.test.mjs)
npm run test:xlsx-continuation-row   # C9a/C9b assertions PASS (a polluted fixture row IS flagged)

# 3. Same rule fires at commit + ship (no extra wiring): build self-lint, .githooks/pre-commit §5b,
#    and verify-no-forbidden.mjs lintXlsxDir all import the SAME lintWorkbook() now carrying C9.
```

---

## 5. Per-Identity Satisfaction (LR-048 v3)

| Identity | Concrete deliverable |
|---|---|
| OWNER | `export_test_cases/to-xlsx.ts`<br>`scripts/xlsx-lint-rules.mjs`<br>`export_test_cases/blocked-reasons.json`<br>`scripts/sp00-audit-v5.mjs`<br>`scripts/xlsx-merged-shape.test.mjs`<br>`scripts/xlsx-continuation-row.test.mjs`<br>`scripts/xlsx-compose-reason.test.ts`<br>`package.json` (one npm script: `test:xlsx-compose-reason`)<br>`clients/encore/test_cases_xlsx/encore_test_cases.xlsx`<br>`export_test_cases/README.md`<br>`.claude/context/navigation.md` |

---

## 6. Plan-Deviations log

1. **typecheck gate scoped to changed files (user-authorized).** `npm run typecheck` is pre-existing RED on this branch — 77 `tsc` parse/`Invalid character` errors, 100% inside the deprecated dead stub `scripts/build-framework-vendor.ts` (unmodified by this plan; owned by `PLAN_ROOT_CLIENT_DEDUPE`). My changed files have **zero** type errors (`tsc --noEmit | grep -v build-framework-vendor | grep "error TS"` → empty). User chose "proceed; scope-typecheck only". Filed chip `task_b6e07c30` to fix the dead-file break in its owning plan's scope.
2. **C9 negative test run on a temp copy, not the committed workbook.** §3 step 2 said "hand-edit one rebuilt cell … → revert". To avoid any risk to the committed binary deliverable, the injection was done on a `git`-clean temp copy (`mkdtempSync`) and asserted there (C9 fired: 2 violations on the polluted Pass row). The committed workbook was never mutated by the test. The durable proof also lives in `test:xlsx-continuation-row`'s C9a/C9b assertions.
3. **Added a `_README_LI_MANUAL_CHECK` provenance key** to `blocked-reasons.json` (not strictly required by §2.3) — matches the file's existing convention of documenting each curated-reason group and records the MD-Notes→curated-reason migration for audit.

---

## Execution Summary

_(LR-027 — PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER)_

**Executed**: 2026-06-11 · **Identity**: OWNER · **Outcome**: all §2.1–2.8 deliverables landed; all gates green (typecheck scoped per deviation #1).

### What changed (11 files + 1 new)
- `export_test_cases/to-xlsx.ts` — §2.1(a) `MODULE_SHEET_HEADERS` reorder (`Notes / Reason` → last, col 13); §2.1(b) `composeNotesReason` → exported reason-only `composeReason(reason, execution)`, `NOTES_SEPARATOR` removed; §2.1(c) call site + first-row + continuation arrays; §2.1(d) SUMMARY `Last Updated:` → col 13; §2.1(e) removed `ParsedTc.notes` + `notesCol` + the `notes:` push; §2.1(f) header-shape doc comments.
- `scripts/xlsx-lint-rules.mjs` — §2.2 `CHECKED_COLS` reorder + `splitNotesReason` simplified (dropped `NOTES_SEP_RE`/tail-slice, shape preserved) + reworded C1/C4 comments; §2.7 `curatedReasonIds` fail-open loader + **C9 gate** (C9a populated-Pass / C9b `Cleanup after test:` breadcrumb / C9c non-curated blank-exec); §2.8 deny-list +`MCP ref` +`per source code` +`Jira tool ref` (0-occurrence-verified).
- `export_test_cases/blocked-reasons.json` — §2.3 `TC-LOC-LI-111..114` curated "Kept as a manual check …" reasons (migrated from MD `**Notes**:`) + provenance README.
- `scripts/sp00-audit-v5.mjs` — §2.4 `COLUMNS` reorder + required-reason narrowed to `execution==='Fail'` (R3).
- `scripts/xlsx-compose-reason.test.ts` (**NEW**) + `package.json` (`test:xlsx-compose-reason`) — §2.5 reason-only contract test.
- `scripts/xlsx-merged-shape.test.mjs` + `scripts/xlsx-continuation-row.test.mjs` — §2.5 header/fixture reorder + C9a/C9b assertions.
- `export_test_cases/README.md` + `.claude/context/navigation.md` — §2.6 dated declutter note + registry row.
- `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` — regenerated (`npm run xlsx:build`; 217236→215113 bytes; 634 cases).

### Gate evidence (all 2026-06-11)
- `npm run xlsx:build` → OK, self-lint **0 vocab / 0 integrity (incl. 0 C9) / 0 warnings**, 2796 rows.
- `npm run xlsx:lint` → PASS (re-run after §2.8). Negative test (temp copy, inject `Cleanup after test:` into a Pass row) → **C9 fired (2 violations)** → gate bites.
- `npm run check:tc-parity` → PASS. `npm run test:xlsx-merged-shape` / `test:xlsx-continuation-row` (incl. 4 new C9 assertions) / `test:xlsx-compose-reason` / `test:xlsx-sheet-name` → all PASS.
- `node scripts/sp00-audit-v5.mjs` → advisory: **0 Notes-column flags**; 2 pre-existing empty-`Expected Result` flags (ACC-021/024, present in HEAD workbook, orthogonal).
- `npm run typecheck` → scoped green (zero errors in changed files; pre-existing dead-file break per deviation #1).

### D23 verification artifact (re-runnable — matched plan §4 exactly)
`Pass total=507 withNotes=0` (was 222) · `Blocked 19/19` · `Skipped 8/8` · `(blank) 100/21` · `Cleanup after test:`=0 · `MCP ref`/`Internal:`/`Jira`/`per source code`=0.

### Per-Identity Matrix closure (LR-048 / closure-check C6)
OWNER row — every Concrete Deliverable resolves to a file on disk: `to-xlsx.ts`, `xlsx-lint-rules.mjs`, `blocked-reasons.json`, `sp00-audit-v5.mjs`, `xlsx-merged-shape.test.mjs`, `xlsx-continuation-row.test.mjs`, `xlsx-compose-reason.test.ts`, `package.json`, `encore_test_cases.xlsx`, `README.md`, `navigation.md`. All present (see diff).
