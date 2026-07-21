# FCC Truth Investigation — 2026-05-26

**Author**: Investigative subagent (Opus 4.7) on behalf of Rutvik
**Inputs**: live MD/spec/CSV state in repo + SP00 plan + 2 prior forensic ledgers (csv-md-delta + content-dedupe)
**Authority**: READ-ONLY everywhere except this output file
**User policy** (anchoring every recommendation):
- Every TC must be retained (no lazy drops)
- IDs follow submodule naming (no `-FCC-` segment)
- Notes tests live in Notes module; History tests live in History module
- `clients/encore/specs/locations/history/` is the temp home for "Notes-shown-in-History" cross-tests

---

## Headline answer per Q

| Q | TC | One-line conclusion | Recommended canonical ID | Recommended files |
|---|---|---|---|---|
| Q1 | NTS-FCC-022 | SP00 doc claim "no MD entry" is FALSE — MD line 820 has it. Spec test exists at `location-notes.spec.ts:425` already using `TC-LOC-NTS-035` (test.fixme). But `NTS-035` collides with the canonical `TC-LOC-NTS-035` "Save empty row" at `location-notes.spec.ts:1085` (different intent, different content). Two distinct intents collapsed onto one ID. | **TC-LOC-NTS-062** (new free ID — neither intent fits the other's content) | Rename MD section + rename `test.fixme` head + author CSV row for NTS-062 |
| Q2 | NTS-FCC-009 (tab character) | Spec test EXISTS at `location-notes.spec.ts:132` with `id: 'TC-LOC-NTS-033'` — but `NTS-033` collides with canonical "Sequential save" at `location-notes.spec.ts:1039`. CSV row for NTS-033 has the Sequential-save content. No CSV row for the tab-character test exists. | **TC-LOC-NTS-063** (new free ID) | Rename spec test + MD section + author new CSV row |
| Q3 | NTS-FCC-028 | MD entry at line 898 IS a Notes-displayed-in-History cross-test (Steps 4–6 navigate to LM History; Expected asserts history rows). Already covered by `TC-LOC-NTS-038` MD at line 575 + `history/location-hist-notes.spec.ts:225` spec. The two MD entries describe the SAME assertion (verified content-dedupe table §3.1). | **TC-LOC-NTS-038** (already exists — keep) | DROP FCC-028 MD section (true content-duplicate of NTS-038); MD lives in Notes MD per user policy; spec already lives at `specs/locations/history/` per user policy |

All three resolutions preserve the test (no lazy drop) and produce one canonical non-FCC ID per intent. Q3 is the only "drop" — and it drops a DUPLICATE MD section, not a test (the underlying test stays alive under NTS-038).

---

## Q1 — NTS-FCC-022 ground truth

### Evidence

**SP00 doc claim** (`plans/done/SUBPLAN_PARITY_00_OFFLINE_CSV_SPEC_PARITY_PATCH.md:30`):

> v2 added orphan-row injection: 5 spec-fixme TCs that have no CSV row (SSL-026, SSL-030, SSL-FCC-009, SSL-FCC-012, NTS-FCC-022) ... CSV row authored with real content from spec body

Line 592 expands this to claim the orphan-injected TCs include `NTS-035`. The implication of the SP00 narrative is that NTS-FCC-022 was a spec-only fixme test with no MD entry; the augment script invented a CSV row from the spec body.

**MD state** — `clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md:820`:

```
## TC-LOC-NTS-FCC-022: Delete one of one (single row) → empty state persists
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensureEmptyState 2. fillNote(0, NOTE_1_CHAR); saveAndConfirm; reloadAndNavigateToNotesTab 3. clearNote(0); deleteRow(0) 4. saveAndConfirm 5. reloadAndNavigateToNotesTab 6. isDefaultEmptyState() returns true OR row 0 holds an empty value (placeholder per BUG-LOC-NTS-003)
**Expected**: After reload, the Notes section is at its empty representation (either the "No Notes Available" row or a single placeholder empty textarea).
**Data**: office=1604 | NOTE_1_CHAR
```

So MD HAS the entry. SP00 doc is wrong on that point.

**Spec state** — `clients/encore/specs/locations/location-notes.spec.ts:425`:

```typescript
// BUG-LOC-NTS-004: Delete button vanishes on single-row form-array after clear() — TC cannot
// reach the Delete step. Filed 2026-05-21 (lifecycle refactor Group D-4).
test.fixme('TC-LOC-NTS-035: Delete one of one (single row) — empty state persists', async ({ ... }) => {
  ...
  id: 'TC-LOC-NTS-035',
  label: 'Delete the only row',
  ...
});
```

This test asserts the exact intent of MD's NTS-FCC-022 ("Delete one of one (single row) — empty state persists"). The spec head says `TC-LOC-NTS-035`. SP00's "FCC rename" mapped FCC-022 → NTS-035. The test is marked `test.fixme` blocked by `BUG-LOC-NTS-004`.

**CSV state** — `clients/encore/test_cases_csv/locations_notes_test_cases.csv:36`:

```
TC-LOC-NTS-035,Save empty row — persists as empty textarea not No Notes Available, ...
Steps: 1. Open Notes tab, ensure empty state 2. Click Add to create empty row (do not type anything) 3. Verify Save enables (form dirty from Add) 4. Click Save, confirm dialog 5. Reload page, click Notes tab 6. Verify 1 empty textarea row exists (NOT "No Notes Available") ...
Expected: An empty row saved deliberately persists as an empty textarea, distinct from the "No Notes Available" default state
Notes: Blocked by Encore-reported issue; pending fix. ... Yes,Fail,Blocked: Delete button vanishes on single-row note list after clearing text — TC cannot reach the Delete step.
```

The CSV row for NTS-035 carries the title and steps of the **canonical** `TC-LOC-NTS-035` at `location-notes.spec.ts:1085` — "Save empty row — persists as empty textarea, not No Notes Available". That intent is DIFFERENT from FCC-022:

- **FCC-022 intent (MD :820)** — type one char, save it, then DELETE the only row, save, verify empty state. Path through Add → Fill → Save → Reload → Clear → Delete → Save → Reload.
- **CSV-035 intent (CSV :36)** — Add empty row (no typing), save, verify the empty row persists distinct from "No Notes Available". Path through Add → Save → Reload (no fill, no clear, no delete).
- **Spec :1085 intent** — matches CSV-035 (Add empty → Save → Reload → assert empty textarea row count).

Two completely different test intents. The `test.fixme` block at spec :425 carries the FCC-022 intent labeled with NTS-035 ID — a name collision created when SP00 mass-renamed without checking for existing NTS-035.

### Verdict

SP00 doc is wrong twice:
1. NTS-FCC-022 had an MD entry all along (line 820)
2. The "orphan-injected NTS-035" CSV row does NOT carry FCC-022 content — it carries the canonical NTS-035 (Save empty row) content from spec :1085

Two distinct intents now share `TC-LOC-NTS-035`:
- spec :425 `test.fixme('TC-LOC-NTS-035: Delete one of one (single row)...')` — FCC-022 content; blocked
- spec :1085 `test('TC-LOC-NTS-035: Save empty row...')` — canonical NTS-035 content; passing

Playwright executes both `test('TC-LOC-NTS-035', ...)` blocks (Playwright keys on file position, not title) but Allure / dedupe-by-id reporting will mis-attribute results. This is also the §4 finding of `content-dedupe-audit-2026-05-26.md`.

### Recommended disposition

Per user policy (retain every TC, no FCC segment, Notes-in-Notes-module):

1. **Pick a new free ID** for the FCC-022 (Delete one of one) intent. Latest NTS-NN used = 061. Suggested new ID = **`TC-LOC-NTS-062`**.
2. **MD edit** at `locations_notes_test_cases.md:820`: rename header `## TC-LOC-NTS-FCC-022:` → `## TC-LOC-NTS-062:` (content unchanged).
3. **Spec edit** at `location-notes.spec.ts:425-454`: rename `test.fixme('TC-LOC-NTS-035: Delete one of one ...'` → `test.fixme('TC-LOC-NTS-062: Delete one of one ...'`; rename `id: 'TC-LOC-NTS-035'` → `id: 'TC-LOC-NTS-062'`.
4. **CSV row** for NTS-062: author a new row in `locations_notes_test_cases.csv` with Title = "Delete the single saved note row — empty state persists after save and reload", Steps + Expected lifted from MD :820; Automation columns `Yes / Fail / BUG-LOC-NTS-004 — Delete button vanishes on single-row form-array after clear().`
5. **SP00 doc correction** (optional follow-up): update the orphan-injection claim. Lines 30 + 592 conflate "no CSV row for FCC-022" (true) with "no MD entry for FCC-022" (false). Not blocking; audit-trail note only.

The existing CSV-035 row and spec :1085 stay AS-IS — they are the canonical `TC-LOC-NTS-035` "Save empty row".

---

## Q2 — NTS-FCC-009 (tab character) retention path

### Evidence

**MD state** — `locations_notes_test_cases.md:664`:

```
## TC-LOC-NTS-FCC-009: Tab character "a\tb" persist
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensureEmptyState 2. fillNote(0, "a" + tab + "b") via pasteIntoNote 3. saveAndConfirm 4. reloadAndNavigateToNotesTab 5. getNoteValue(0) returns the literal tab between a and b
**Expected**: After reload, row 0 holds a single tab character between a and b, not a space or two spaces.
**Data**: office=1604 | NOTE_TAB_CHAR="a\tb"
```

The test exercises **tab-character persistence** (a literal `\t` between two characters). It is NOT a tab-key-navigation test and NOT a whitespace edge case in general — it's a single targeted assertion that the textarea round-trips an embedded `\t` byte exactly.

**Spec state** — `location-notes.spec.ts:132`:

```typescript
test('TC-LOC-NTS-033: Tab character "a\\tb" persist', async ({ locationNotesPage, dependencyGate }) => {
  dependencyGate([]);
  test.setTimeout(60_000);
  await saveAndVerifyCase({
    id: 'TC-LOC-NTS-033',
    label: 'Tab character persist',
    baseline: () => locationNotesPage.ensureEmptyState(),
    act: () => locationNotesPage.pasteIntoNote(0, NOTE_TAB_CHAR),
    saveAndConfirm: () => locationNotesPage.saveAndConfirm(),
    reload: () => locationNotesPage.reloadAndNavigateToNotesTab(),
    expectAfterReload: async () => {
      expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_TAB_CHAR);
    },
    ...
  });
});
```

Spec head uses `TC-LOC-NTS-033`. But `NTS-033` collides with the canonical `TC-LOC-NTS-033` at `location-notes.spec.ts:1039`:

```typescript
test('TC-LOC-NTS-033: Sequential save — add second note with reload between saves, both persist', async ({ ... }) => {
```

The Sequential-save intent has the CSV row at `locations_notes_test_cases.csv:34` and the MD entry at `locations_notes_test_cases.md:435`. The Tab-character intent has the MD entry at `locations_notes_test_cases.md:664` (under `TC-LOC-NTS-FCC-009`) but **NO CSV row**.

**SP00 rename math** (per SP00 doc :30 / change-log entry 4 / `csv-md-delta-investigation-2026-05-26.md` Cluster 2): the rename mapped 23 of the 26 NTS-FCC headers to NTS-039..061. Going by position:

- FCC-001 → NTS-039
- FCC-002 → NTS-040
- FCC-006 → NTS-041
- FCC-007 → NTS-042
- FCC-008 → NTS-043
- **FCC-009 → ??? (intended NTS-044 by sequence, but the spec uses NTS-044 for FCC-010 "newline" — SP00 skipped FCC-009 in the new sequence)**
- FCC-010 → NTS-044
- FCC-012 → ??? (skipped — collides with NTS-034 canonical)
- FCC-013 → NTS-045
- ... etc.

The 3 FCC entries SP00 silently dropped from the rename pass are **FCC-009, FCC-012, FCC-022** — exactly the ones whose target IDs (NTS-033/034/035) were already in use by the late-batch tests at spec :1039/:1063/:1085. SP00 did NOT renumber them; SP00 did NOT drop them; SP00 left them dangling — the early-in-file `test('TC-LOC-NTS-033'...)` at line 132 became a silent collision with the late-in-file `test('TC-LOC-NTS-033'...)` at line 1039.

### Verdict

Per user policy "retain every TC + no FCC segment":

1. **Pick a new free ID**. Latest NTS used = 061. After NTS-062 allocated to Q1, suggested ID = **`TC-LOC-NTS-063`**.
2. **MD edit** at `locations_notes_test_cases.md:664`: rename header `## TC-LOC-NTS-FCC-009:` → `## TC-LOC-NTS-063:` (content unchanged).
3. **Spec edit** at `location-notes.spec.ts:132`: rename `test('TC-LOC-NTS-033: Tab character ...')` → `test('TC-LOC-NTS-063: Tab character ...')`; rename `id: 'TC-LOC-NTS-033'` → `id: 'TC-LOC-NTS-063'`.
4. **CSV row** for NTS-063: author NEW row in `locations_notes_test_cases.csv` (currently absent). Title = "Verify tab character persists after save and reload"; Steps from MD :664; Expected = "Tab character between two characters persists exactly after save and reload, neither converted to a space nor doubled into two spaces"; Automation columns `Yes / Pass / (empty)`.

The existing `TC-LOC-NTS-033` Sequential-save (spec :1039 + CSV :34 + MD :435) stays AS-IS — it is the canonical NTS-033.

### Rename map for §2 of `content-dedupe-audit`

```
TC-LOC-NTS-FCC-009 (MD :664) + spec :132 + new CSV row  →  TC-LOC-NTS-063
TC-LOC-NTS-FCC-012 (MD :690) + spec :167 + new CSV row  →  TC-LOC-NTS-064 (mentioned for completeness — same collision class with canonical NTS-034 "Edit existing saved note"; NOT in this Q's scope but Rutvik will want it handled the same way)
TC-LOC-NTS-FCC-022 (MD :820) + spec :425 + new CSV row  →  TC-LOC-NTS-062 (per Q1)
```

---

## Q3 — NTS-FCC-028 (Notes/History cross-test) module ownership

### Evidence

**MD state** — `locations_notes_test_cases.md:898`:

```
## TC-LOC-NTS-FCC-028: Sequential save → 2 HIST rows (one per save, not one merged row)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensureEmptyState 2. fillNote(0, "HIST seq A"); saveAndConfirm; reloadAndNavigateToNotesTab 3. fillNote(0, "HIST seq B"); saveAndConfirm 4. navigate to Location Management History tab 5. sort by Modified On descending 6. read the Notes column on the top two rows
**Expected**: The top two HIST rows show one save each — the most recent containing "HIST seq B" and the one below containing "HIST seq A". The two saves did NOT merge into a single HIST row.
**Data**: office=1604 | NOTE_SEQUENTIAL_HIST_A="HIST seq A" | NOTE_SEQUENTIAL_HIST_B="HIST seq B" | history_column="Notes"
```

This is unambiguously a **Notes-displayed-in-LM-History view** cross-test (the assertion lives on LM History rows, not on the Notes form).

**Other MD section** — `locations_notes_test_cases.md:575` — `## TC-LOC-NTS-038: HIST col 69 — sequential save (A then B) produces 2 distinct history rows`:

```
**Spawned_From**: PLAN_FCC_NOTES_COMPLETION_2026-05-21 Phase 1.6 Path A (FCC-028 Notes-side rename; HIST counterpart). The Notes-spec FCC-028 was realigned 2026-05-21 to assert value-persistence only; this HIST-side TC owns the "2 distinct history rows, one per save, not merged" assertion that FCC-028 no longer makes.
**Depends_On**: TC-LOC-NTS-028
**Steps**: 1. Open the "Notes" sub-tab on Location Settings for office 1604. 2. Make sure no rows are saved ... 3. Click "Add" to create a new empty note row. 4. Type the text "HIST seq A" ... 5. Click "Save" ... 7. Reload the page and return to the "Notes" sub-tab. 8. Clear the row 0 textarea and type "HIST seq B" ... 9. Click "Save" ... 11. Click the "Location Management History" tab ... 13. Read the "Notes" column on every row whose "Modified On" timestamp is after the start of step 3.
**Expected**: Two distinct history rows are present in the read window — one whose "Notes" column equals today's date followed by " - HIST seq A" ... and another whose "Notes" column equals today's date followed by " - HIST seq B" ... The two rows have different "Modified On" timestamps and the row for "HIST seq B" is more recent than the row for "HIST seq A". The two saves did NOT merge into a single history row.
```

This is the **same intent** as FCC-028 — "two distinct HIST rows from sequential saves, not merged". The differences are only cosmetic:
- NTS-038 specifies the read window via timestamp ("rows after the start of step 3"); FCC-028 says "top two rows"
- NTS-038's expected matches the actual encoding format from the spec (`${date} - HIST seq A` etc. — the format the spec asserts); FCC-028's expected uses informal prose
- NTS-038 has `Spawned_From: PLAN_FCC_NOTES_COMPLETION_2026-05-21 Phase 1.6 Path A (FCC-028 Notes-side rename; HIST counterpart)` — explicitly says it is the rename target of FCC-028

The `content-dedupe-audit-2026-05-26.md` §3.1 row for FCC-028 also flags this:

> **TC-LOC-NTS-038** (existing HIST entry in main MD) ... HIST col 69 — sequential save (A then B) produces 2 distinct history rows | MEDIUM (0.50) — see §6 caveat — TC-LOC-NTS-038 already exists as HIST equivalent; FCC-028 was authored as the main-spec counterpart; spec maps to HIST file, NOT main file

And §7.7 of the same ledger:

> **NTS-FCC-028 (HIST sequential save)**: This is a SPECIAL case — the MD entry was authored as the "main spec" counterpart to a HIST-side test (`TC-LOC-NTS-038`). The HIST spec at `clients/encore/specs/locations/history/location-hist-notes.spec.ts:225` is the only implementation. CSV-038 is the HIST version. There is NO non-HIST main-spec implementation.

**Spec state** — `specs/locations/history/location-hist-notes.spec.ts:225`:

```typescript
/**
 * TC-LOC-NTS-038 — HIST col 69 sequential-save 2-row distinctness.
 *
 * Spawned from FCC notes completion 2026-05-21 Phase 1.6 (NTS-059
 * Notes-side rename; HIST counterpart). ...
 * Assertion the renamed NTS-059 no longer makes: that sequential saves produce
 * TWO distinct HIST rows (one per save), not one merged row.
 */
test('TC-LOC-NTS-038: HIST col 69 — sequential save (A then B) produces 2 distinct history rows', async ({...}) => {
  ...
});
```

The spec implementation IS at `clients/encore/specs/locations/history/location-hist-notes.spec.ts` — exactly where the user policy says cross-tests live. No separate main-spec implementation exists.

**Spec state (Notes side)** — `location-notes.spec.ts:598`:

```typescript
test('TC-LOC-NTS-059: Sequential save persists most recent value (HIST row verification deferred to HIST spec)', async ({...}) => {
  ...
  // Verify the final value persisted (content-only — HIST top-2 row verification deferred to HIST spec).
  expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_SEQUENTIAL_HIST_B);
  ...
});
```

The Notes-side test (`NTS-059`, the SP00-renamed NTS-FCC-029) only asserts value-persistence after sequential saves — it explicitly defers the "2 HIST rows" assertion to the HIST spec (i.e., `TC-LOC-NTS-038`). So there are TWO independent tests covering the sequential-save flow:

- `NTS-059` (Notes form) — confirms the final saved value persists
- `NTS-038` (LM History view) — confirms 2 distinct history rows fire

Neither needs FCC-028's content. FCC-028 is a duplicate of NTS-038.

**CSV state**:
- CSV row at `locations_notes_test_cases.csv:39` already exists for `TC-LOC-NTS-038` with the same intent.
- CSV row at `locations_notes_test_cases.csv:60` already exists for `TC-LOC-NTS-059` (Notes-side).
- No CSV row exists with `TC-LOC-NTS-FCC-028` ID (SP00 did not orphan-inject this one because the renamed slot NTS-059 was already taken by FCC-029).

### Module ownership analysis (per user policy)

The user policy explicitly accommodates this case: *"`clients/encore/specs/locations/history/` is the temp home for Notes-shown-in-history cross-tests"*. The current spec layout follows that policy exactly:

- Notes form behavior tests → `specs/locations/location-notes.spec.ts`
- Notes-shown-in-LM-History tests → `specs/locations/history/location-hist-notes.spec.ts`

The question is where the MD section lives. There are two clean choices:

- **(a)** Notes MD owns it (current state of NTS-038 at MD :575) — because the test's *trigger* is a Notes form save and the *feature under test* is Notes-row-encoding-in-HIST-column-69. The HIST module is the view, but the encoding is a Notes feature.
- **(b)** LM History MD owns it — because the *assertion* lives on the LM History page, and the LM History MD (`locations_management_history_test_cases.md`) is the canonical home for `## TC-LOC-MGH-*` and any history-row assertions.

The current MD already lives in Notes MD (file `locations_notes_test_cases.md:575`). Going by user policy "Notes tests live in Notes module" and the spec convention of test ID prefix `TC-LOC-NTS-*` (not `TC-LOC-MGH-*`), choice (a) wins — the TC is a Notes-feature test that happens to verify via the History view.

LM History MD (`locations_management_history_test_cases.md`) has zero references to `NTS-038` and uses its own `TC-LOC-MGH-NNN` numbering for its own DataTable-behavior tests. Moving NTS-038 there would break that boundary and require renumbering to `MGH-NNN` even though the test is not about MGH DataTable behavior.

### Verdict

FCC-028 is a true content duplicate of NTS-038. Both MD sections describe the same flow (sequential save A then B → 2 distinct HIST rows). The spec implementation already lives where the user policy says it should (`specs/locations/history/location-hist-notes.spec.ts`). Nothing about the FCC-028 MD entry adds coverage beyond what NTS-038 already documents.

Per user policy "every test case must be retained": the **test** is retained — under `TC-LOC-NTS-038` — only the duplicate MD prose for FCC-028 needs to go.

### Recommended disposition

1. **MD delete** at `locations_notes_test_cases.md:898-907`: remove the entire `## TC-LOC-NTS-FCC-028:` section. The same content lives at MD :575 under `TC-LOC-NTS-038`. No assertion is lost.
2. **No spec change** — `location-hist-notes.spec.ts:225` already uses `TC-LOC-NTS-038`.
3. **No CSV change** — `locations_notes_test_cases.csv:39` already has the `TC-LOC-NTS-038` row.
4. **MD section heading at line 589** (`## Field-Case Coverage (FCC) — TC-LOC-NTS-FCC-001..032`) — update prose to reflect the post-rename canonical IDs OR simply note "the FCC-028 case has been merged into TC-LOC-NTS-038 (HIST counterpart in Notes MD :575)".

### One-line tabular summary

| File | Action | Why |
|---|---|---|
| `locations_notes_test_cases.md:898-907` (FCC-028 section) | **DELETE** | true content duplicate of NTS-038 at :575 |
| `locations_notes_test_cases.md:575` (NTS-038 section) | **KEEP** | canonical entry for the Notes-saved-shows-in-HIST cross-test |
| `specs/locations/history/location-hist-notes.spec.ts:225` (NTS-038 spec) | **KEEP** | already lives at user-policy temp home |
| `locations_notes_test_cases.csv:39` (NTS-038 row) | **KEEP** | already canonical |

---

## Summary table (one row per Q)

| Q | TC | Disposition | Files touched | Test retained? |
|---|---|---|---|---|
| Q1 | FCC-022 (Delete one of one) | Rename to **NTS-062** | MD :820 + spec :425 + new CSV row | Yes (was already in MD + spec; just gets a unique non-colliding ID + missing CSV row) |
| Q2 | FCC-009 (Tab char) | Rename to **NTS-063** | MD :664 + spec :132 + new CSV row | Yes (was already in MD + spec; just gets a unique non-colliding ID + missing CSV row) |
| Q3 | FCC-028 (Sequential HIST 2-row) | **DELETE MD section** (content duplicate of NTS-038) | MD :898-907 (delete only) | Yes — the test survives under existing `TC-LOC-NTS-038` |

All recommendations honor: every TC retained, no `-FCC-` segment in any canonical ID, Notes-feature tests stay in Notes MD, the Notes-shown-in-History cross-test spec stays at `specs/locations/history/`.

---

## Methodology + caveats

1. Read-only inspection across MD/CSV/spec/2 forensic ledgers + SP00 plan. No mutations outside this output file.
2. Q1 + Q2 dispositions are constrained by the §4 spec-collision finding of `content-dedupe-audit-2026-05-26.md` (NTS-033/034/035 each used by two different `test()` blocks). The new IDs NTS-062/063 are picked as next-available after NTS-061. Confirm with Rutvik before executing — the dedupe-audit §6 rename map suggests NTS-062..064 too, so this is consistent with that prior recommendation.
3. Q3 conclusion (content-duplicate of NTS-038) reads three independent signals: (a) MD :575 `Spawned_From` explicitly cites FCC-028 as its rename source; (b) `content-dedupe-audit-2026-05-26.md` §3.1 + §7.7 already classified FCC-028 as the HIST-counterpart duplicate; (c) spec file `location-hist-notes.spec.ts:209-223` comment also names FCC-028 as the original case it replaced.
4. No baseline-truth source consulted — pure-content inspection over existing artifacts. Per LR-045 / LR-ENC-001, baseline (`navigator2.training.psav.com`) would only need to enter the loop if the user disputes whether sequential-save-creates-2-HIST-rows is intended behavior. The 3 disposition recommendations do not assert app behavior; they classify content-state of artifacts.
5. SP00 plan-doc corrections are explicitly OUT of scope; the doc's narrative gaps (NTS-FCC-022 wrongly described as "no MD entry") are noted but not flagged for immediate fix. SP00 is closed; corrections would be a separate follow-up.
