# Content-Dedupe Audit (2026-05-26)

Forensics pass over MD test-cases + CSV deliverable + Playwright specs to find test cases that are unique by ID but duplicate by CONTENT. Read-only over source artifacts; this file is the only mutation.

**Source artifacts scanned**:
- `clients/encore/specs_planning/test-cases/setup/locations/*.md` — 11 files
- `clients/encore/specs_planning/test-cases/setup/local-office/*.md` — 3 files
- `clients/encore/test_cases_csv/*.csv` — 11 files
- `clients/encore/specs/locations/*.spec.ts` + `clients/encore/specs/locations/history/*.spec.ts` + `clients/encore/specs/local-office/*.spec.ts` — 13 files

**Records parsed** (after parser correctness fixes):
- MD: 477 test-case records (`## TC-XXX:` sections)
- CSV: 474 rows (12-column SP00 schema)
- Spec: 336 `test('TC-XXX-NNN: …')` entries

**Tooling**: `clients/encore/specs_planning/_internal/.dedupe-tmp/fingerprint.mjs` (Node.js, read-only). Outputs (`md.json`, `csv.json`, `spec.json`, `duplicates.json`, `cross-by-title.json`, `mapping.json`) live in the same `.dedupe-tmp/` scratch directory and may be safely deleted after the rename pass.

---

## 1. Methodology + fingerprint normalization rules

### 1.1 Content normalization (applied to titles, preconditions, steps, expected)

1. Lowercase
2. Strip markdown bold/italic/code (`**`, `*`, backtick)
3. Strip checkmark glyph `✓`
4. Unify hyphen/em-dash/en-dash variants → `-`
5. Unify curly quotes → straight quotes
6. Strip URLs (`https?://…`)
7. Strip punctuation noise: `()[]{}",;:!?'"`
8. Normalize step-ordinals: `1.` / `1)` → `1 `
9. Collapse runs of whitespace → single space
10. Trim

### 1.2 Three fingerprint flavors per record

- **Full fingerprint** = `SHA-256(title|preconditions|steps|expected)[:16]` — strongest collision check
- **Behavior fingerprint** = `SHA-256(steps|expected)[:16]` for MD/CSV; `SHA-256(extracted-signature)[:16]` for spec — catches "same logic, different title"
- **Title fingerprint** = `SHA-256(title)[:16]` — catches "same title, different ID"

### 1.3 Spec signature extraction

Spec bodies are parsed via balanced-brace walker (string/comment-aware) from the arrow `=>` of each `test()` to the matching closing `}`. The extracted body is reduced to a signature consisting of:

- All `label: '<X>'` literals
- All quoted string literals (≥3 chars) — preserves data-defining values like `'Venue/Branch Account'` vs `'Master Bill To Address'`
- All `.toBe(…) / .toEqual(…) / .toContain(…) / .toHaveCount(…) / .not.toBe(…)` matcher calls
- All `<X>Page.<method>(` calls
- All UPPER_SNAKE_CASE identifier references (e.g., `NOTE_4000_CHARS`, `VENUE_DISPLAY_FIELDS`)
- Helper-function markers (`saveAndVerifyCase`, `dependencyGate([...])`)

### 1.4 Cross-artifact matching

MD/CSV/spec are compared by **title fingerprint** only (their body shapes differ structurally — CSV preconditions ≠ MD precondition section ≠ spec preconditions). Where title-fp matches across artifacts, the IDs are flagged as a potential dedupe group.

For ambiguous cases (low title-fp score), a Jaccard token-overlap heuristic on normalized titles provides a fallback ranking.

---

## 2. Duplicate groups — summary table

| # | Category | Count | Severity | Notes |
|---|---|---|---|---|
| A | Cross-artifact MD↔Spec/CSV (FCC stale labels) | 40 logical pairs | HIGH | MD still carries `TC-{LOC-NTS,LOC-SSL}-FCC-NNN`; spec+CSV renumbered to non-FCC sequential. Same content, different ID. |
| B | Intra-spec ID collision (same ID, different tests) | 3 IDs (6 occurrences) | CRITICAL | `TC-LOC-NTS-033` / `-034` / `-035` each used by two different `test()` blocks in `location-notes.spec.ts`. |
| C | Within-MD content duplicates | 0 | — | MD is internally consistent (only retired/dropped entries with empty bodies). |
| D | Within-CSV content duplicates | 0 | — | CSV is internally consistent (only retired stub rows with placeholder text). |
| E | Within-spec content duplicates | 0 (after manual filter) | — | 2 fingerprint hits (SSL-006↔017, LOS-BAS-055↔056) are false positives — different test intents/fields. |

**Total downstream-reference touch-set** (files holding at least one rename target): **18 files** (10 plans + 1 runtime + the 3 artifact directories) — see §3 for line-level cites.

---

## 3. Group A — Cross-artifact FCC stale labels (40 pairs)

The 2026-05-21 FCC pilot landed 26 Notes-FCC + 14 SSL-FCC test entries. The subsequent rename pass (per `plans/done/SUBPLAN_PARITY_00_OFFLINE_CSV_SPEC_PARITY_PATCH.md`) renumbered CSV + spec to non-FCC sequential (NTS-039..061, SSL-031..044) but **left the MD test-case files at the original FCC-XXX labels**. Net: every MD FCC-XXX entry is a duplicate of one CSV/Spec non-FCC NTS-NN / SSL-NN entry.

**Canonical ID rule**: spec+CSV (which align) win. The 40 FCC labels in MD are stale.

### 3.1 Notes-FCC → Notes non-FCC (26 pairs)

| MD ID (stale) | MD line | Canonical ID (spec+CSV) | Spec line | CSV line | Title (canonical) | Confidence |
|---|---|---|---|---|---|---|
| TC-LOC-NTS-FCC-001 | locations_notes_test_cases.md:599 | **TC-LOC-NTS-039** | location-notes.spec.ts:42 | locations_notes_test_cases.csv:40 | 1-char persist (BVA min) | HIGH (1.00) |
| TC-LOC-NTS-FCC-002 | :612 | **TC-LOC-NTS-040** | :63 | :41 | 3999-char persist (BVA -1) | HIGH (1.00) |
| TC-LOC-NTS-FCC-006 | :625 | **TC-LOC-NTS-041** | :81 | :42 | Whitespace-only persist | HIGH (0.67 — short title) |
| TC-LOC-NTS-FCC-007 | :638 | **TC-LOC-NTS-042** | :98 | :43 | Leading whitespace persist | HIGH |
| TC-LOC-NTS-FCC-008 | :651 | **TC-LOC-NTS-043** | :115 | :44 | Trailing whitespace persist | HIGH |
| TC-LOC-NTS-FCC-009 | :664 | **TC-LOC-NTS-033** (1st occurrence — see §4 caveat) | :132 | (no CSV entry) | Tab character persist | HIGH — but conflicts with §4 spec dup-ID (TC-LOC-NTS-033 is reused by another test) |
| TC-LOC-NTS-FCC-010 | :677 | **TC-LOC-NTS-044** | :149 | :45 | Newline persist | HIGH (low Jaccard from string-heavy title) |
| TC-LOC-NTS-FCC-012 | :690 | **TC-LOC-NTS-034** (1st occurrence — see §4 caveat) | :167 | :46 (CSV-034 has DIFFERENT title — see note) | Edit append | HIGH — but conflicts with §4 |
| TC-LOC-NTS-FCC-013 | :703 | **TC-LOC-NTS-045** | :189 | :46 | Edit prepend | HIGH (1.00) |
| TC-LOC-NTS-FCC-014 | :716 | **TC-LOC-NTS-046** | :211 | :47 | Edit partial-replace (slice middle) | HIGH (1.00) |
| TC-LOC-NTS-FCC-015 | :729 | **TC-LOC-NTS-047** | :239 | :48 | Edit clear-to-empty (row stays with empty value) | HIGH (1.00) |
| TC-LOC-NTS-FCC-016 | :742 | **TC-LOC-NTS-048** | :269 | :49 | 2-row positive (smallest multi-row save+reload) | HIGH (1.00) |
| TC-LOC-NTS-FCC-017 | :755 | **TC-LOC-NTS-049** (manual correction — Jaccard picked NTS-048 due to shared phrasing) | :291 | :50 | 5-row positive (smoke at moderate count) | HIGH after manual review |
| TC-LOC-NTS-FCC-018 | :768 | **TC-LOC-NTS-050** | :315 | :51 | Mixed-content (row 0 = 1-char, row 1 = 4000-char) save+reload | HIGH (1.00) |
| TC-LOC-NTS-FCC-019 | :781 | **TC-LOC-NTS-051** | :337 | :52 | Edit row 1 of 2 — row 0 value unchanged after save+reload | HIGH (0.86) |
| TC-LOC-NTS-FCC-020 | :794 | **TC-LOC-NTS-052** | :364 | :53 | Delete first of 2 rows — row 1 becomes sole remaining row | HIGH (1.00) |
| TC-LOC-NTS-FCC-021 | :807 | **TC-LOC-NTS-053** | :391 | :54 | Delete last of 3 rows — rows 0+1 remain | HIGH (0.80) |
| TC-LOC-NTS-FCC-022 | :820 | **TC-LOC-NTS-035** (1st occurrence — see §4 caveat) | :425 (fixme) | (no direct CSV — CSV-035 has DIFFERENT title) | Delete one of one (single row) — empty state persists | HIGH — but conflicts with §4 |
| TC-LOC-NTS-FCC-023 | :833 | **TC-LOC-NTS-054** | :457 | :55 | Save → Cancel → edit → Save → Ok → final value persists | HIGH (1.00) |
| TC-LOC-NTS-FCC-024 | :846 | **TC-LOC-NTS-055** | :474 | :56 | Save → dialog opens → reload page mid-dialog → no persist, no error | HIGH (1.00) |
| TC-LOC-NTS-FCC-025 | :859 | **TC-LOC-NTS-056** | :497 | :57 | Save → Escape on dialog → dialog closes, dirty preserved, no persist | HIGH (0.88) |
| TC-LOC-NTS-FCC-026 | :872 | **TC-LOC-NTS-057** | :520 | :58 | Save → click outside dialog → observe behavior | HIGH (0.56) |
| TC-LOC-NTS-FCC-027 | :885 | **TC-LOC-NTS-058** | :549 | :59 | Idempotent save — pristine form Save stays disabled, second-save fires no API call | HIGH (manual — CSV-058 confirms intent) |
| TC-LOC-NTS-FCC-028 | :898 | **TC-LOC-NTS-038** (existing HIST entry in main MD) | history/location-hist-notes.spec.ts:225 | :39 (CSV-038) | HIST col 69 — sequential save (A then B) produces 2 distinct history rows | MEDIUM (0.50) — see §6 caveat — TC-LOC-NTS-038 already exists as HIST equivalent; FCC-028 was authored as the main-spec counterpart; spec maps to HIST file, NOT main file |
| TC-LOC-NTS-FCC-029 | :911 | **TC-LOC-NTS-060** | :616 | :61 | Save Notes → switch to Currency tab → Currency NOT dirty (cross-tab isolation) | HIGH (0.88) |
| TC-LOC-NTS-FCC-032 | :924 | **TC-LOC-NTS-061** | :640 | :62 | Post-save row content check (assert content, not count per LR-053) | HIGH (0.45 — title slightly differs but FCC-032 is the documented post-save row-count assertion; CSV+spec call it "row content check") |

### 3.2 SSL-FCC → SSL non-FCC (14 pairs)

| MD ID (stale) | MD line | Canonical ID (spec+CSV) | Spec line | CSV line | Title (canonical) | Confidence |
|---|---|---|---|---|---|---|
| TC-LOC-SSL-FCC-001 | locations_shared_setup_locations_test_cases.md:780 | **TC-LOC-SSL-033** | location-shared-setup-locations.spec.ts:39 | locations_shared_setup_locations_test_cases.csv:34 | 1-char search filter shows ≥1 result (BVA min) | HIGH (1.00) |
| TC-LOC-SSL-FCC-002 | :804 | **TC-LOC-SSL-034** | :62 | :35 | 200-char search does not crash dialog (BVA max) | HIGH (0.50 — phrasing differs) |
| TC-LOC-SSL-FCC-003 | :828 | **TC-LOC-SSL-035** | :87 | :36 | clear-input restores full row count (BVA empty after non-empty) | HIGH (0.86) |
| TC-LOC-SSL-FCC-004 | :852 | **TC-LOC-SSL-036** | :114 | :37 | special chars return clean empty-state (no crash) | HIGH (0.86) |
| TC-LOC-SSL-FCC-005 | :876 | **TC-LOC-SSL-037** | :138 | :38 | whitespace-only filter does not crash | HIGH (0.86) |
| TC-LOC-SSL-FCC-006 | :900 | **TC-LOC-SSL-038** | :161 | :39 | leading/trailing whitespace matches base term | HIGH (0.75) |
| TC-LOC-SSL-FCC-007 | :924 | **TC-LOC-SSL-039** | :189 | :40 | type → clear → re-type swaps results | HIGH (0.57) |
| TC-LOC-SSL-FCC-008 | :948 | **TC-LOC-SSL-040** | :218 | :41 | clear-via-input restores baseline | HIGH (0.63) |
| TC-LOC-SSL-FCC-009 | :972 | **TC-LOC-SSL-031** | :248 | :32 | delete-MIDDLE row + save + reload (3 → 2 with middle gone) | HIGH (0.71) |
| TC-LOC-SSL-FCC-010 | :998 | **TC-LOC-SSL-041** | :283 | :42 | delete-ALL non-self + save + reload (2 → 0 non-self) | HIGH (0.75) |
| TC-LOC-SSL-FCC-011 | :1022 | **TC-LOC-SSL-042** | :322 | :43 | cross-row edit-preserve (toggle non-self SI → self SI unchanged across save) | HIGH (0.80) |
| TC-LOC-SSL-FCC-012 | :1045 | **TC-LOC-SSL-032** (manual correction — Jaccard picked SSL-030 due to "rows + save + reload" mass) | :363 | :33 | 5-row N-boundary push (add 5 non-Miami + save + reload all 5 persist) | HIGH after manual review |
| TC-LOC-SSL-FCC-013 | :1070 | **TC-LOC-SSL-043** | :393 | :44 | cross-row independence pre-save (toggle non-self → self unchanged in-page) | HIGH (0.23 — short titles; manually verified) |
| TC-LOC-SSL-FCC-014 | :1098 | **TC-LOC-SSL-044** | :435 | :45 | SI full round-trip ON → save → OFF → save persists each leg | HIGH (0.45) |

---

## 4. Group B — Intra-spec ID collisions (CRITICAL)

`clients/encore/specs/locations/location-notes.spec.ts` contains **three TC IDs that are each used by two different `test()` blocks**. Playwright runs both — but Allure / dedupe-by-id reporting will mis-attribute results.

| ID | First occurrence (line) | First title | Second occurrence (line) | Second title | CSV-defined intent | Action |
|---|---|---|---|---|---|---|
| TC-LOC-NTS-033 | :132 | Tab character `"a\tb"` persist | :1039 | Sequential save — add second note with reload between saves, both persist | CSV-033 = "Sequential save…" → line 1039 is canonical; line 132 needs a new ID | **Rename line 132 → assign a new free NTS number (next-available after NTS-061; e.g., NTS-062). Currently maps to the work `TC-LOC-NTS-FCC-009` describes — confirm with Rutvik whether a new CSV row should be authored for "Tab character" since CSV has no row for it.** |
| TC-LOC-NTS-034 | :167 | Edit append | :1063 | Edit existing saved note — overwritten text persists | CSV-034 = "Edit existing saved note…" → line 1063 is canonical; line 167 needs a new ID | **Rename line 167 → assign NTS-045** *if* the intent is "Edit append" (then NTS-045 spec already exists and points to "Edit prepend" — conflict). Likely needs a new free number. Confirm with Rutvik. |
| TC-LOC-NTS-035 | :425 (note: `test.fixme`) | Delete one of one (single row) — empty state persists | :1085 | Save empty row — persists as empty textarea, not No Notes Available | CSV-035 = "Save empty row…" → line 1085 is canonical; line 425 needs a new ID | **Rename line 425 → align with FCC-022 mapping** which says it should become NTS-035 — but that's the canonical NTS-035 already (line 1085). Two different intents collapsed onto one ID. Confirm with Rutvik how to disambiguate (likely: assign the `fixme`-skipped delete-one-of-one a new ID since it's currently disabled). |

**Root cause**: the FCC-rename in `SUBPLAN_PARITY_00_OFFLINE_CSV_SPEC_PARITY_PATCH.md` reassigned NTS-033/034/035 to the late-batch "Coverage Gap-Fill" tests (lines 1039/1063/1085) without renumbering the earlier-in-file FCC orphans (lines 132/167/425). Both occurrences now coexist in the same spec file.

**Downstream-reference impact**: any CI report, parity-check script, or human reviewer that greps for `TC-LOC-NTS-033` gets two hits in the same file with different titles.

---

## 5. Group A — Per-pair downstream-reference map

For each FCC-stale ID, every file that mentions it needs updating to the canonical ID. The grep coverage below is exhaustive across `clients/encore/**`, `plans/**`, `.claude/**`, `docs/**`.

### 5.1 MD source files (PRIMARY rename targets — 2 files)

| File | FCC ID matches |
|---|---|
| `clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md` | 26 occurrences across 26 distinct FCC IDs (one per `## TC-LOC-NTS-FCC-NNN:` header at lines 599, 612, 625, 638, 651, 664, 677, 690, 703, 716, 729, 742, 755, 768, 781, 794, 807, 820, 833, 846, 859, 872, 885, 898, 911, 924). Header at line 589 (`## Field-Case Coverage (FCC) — TC-LOC-NTS-FCC-001..032`) also references the FCC range and needs updating. |
| `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md` | 14 occurrences across 14 distinct SSL-FCC IDs (catalog rows at :725, :728, :729, :731-736, :742, :744, :748, :752, :754, :755 PLUS the 14 `## TC-LOC-SSL-FCC-NNN:` headers at :780, :804, :828, :852, :876, :900, :924, :948, :972, :998, :1022, :1045, :1070, :1098). The "Net-new TC catalog" header at :776 also references the FCC range. |

### 5.2 Plan files (10 files)

| File | Lines |
|---|---|
| `plans/done/SUBPLAN_NOTES_FCC_PILOT.md` | :381-412 (FCC catalog table), :438, :449, :527, :705, :707, :838, :923, :1022 — historical execution log. **Editor decision**: rewriting historical execution logs is discouraged (LR-027 / LR-040 audit-trail principle). Add a closing note to the Execution Summary instead, OR leave untouched if Rutvik approves. |
| `plans/done/PLAN_FCC_NOTES_COMPLETION_2026-05-21.md` | :204, :215, :288 — same audit-trail concern as above |
| `plans/done/SUBPLAN_PARITY_00_OFFLINE_CSV_SPEC_PARITY_PATCH.md` | :32+ (multiple matches) — historical |
| `plans/done/SUBPLAN_PARITY_W1_02_TOOLING_MD_CSV_REEXPORT_AND_LO_SPLIT.md` | :144 — historical |
| `plans/done/PLAN_DQU_V6_PILOT_NOTES.md` | (matches via NTS-033/034/035 grep) — historical |
| `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` | :267 — pending plan; **MUST UPDATE** before plan executes (would otherwise look for files that don't exist) |
| `plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` | :249 (lists the rename gap explicitly: *"GP-4 Notes ID/FCC reconciliation: rename 27 FCC IDs in MD to match CSV/spec normalized IDs"*) — pending; **MUST UPDATE** the line item after the rename completes |
| `plans/pending/SUBPLAN_SSL_FCC.md` | :102-103, :107, :147, :159, :163 — pending; this subplan is the **template** for new SSL-FCC additions; **CONFIRM with Rutvik** whether this subplan is still in scope (if so, decide whether new SSL-FCC additions should use FCC-NNN labels going forward or non-FCC). |
| `plans/pending/PLAN_RCA_NOTES_SPEC_2026-05-21.md` | :22 — pending; **MUST UPDATE** if plan is still scheduled |
| `plans/pending/_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md` | :22 (lists the duplicate-NTS-035 issue) — pending; this audit feeds back into it. |
| `plans/pending/SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md` | (matches NTS-033/034/035) — pending; cross-reference |
| `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` | (matches NTS-033/034/035) — pending; cross-reference |

### 5.3 Runtime file (1 file)

| File | Lines |
|---|---|
| `clients/encore/src/core/field-case-runner.ts` | :13 — only a docstring example (`"TC-LOC-NTS-FCC-001"`). Rename to a representative non-FCC ID (e.g., `"TC-LOC-NTS-039"`) OR keep generic (`"TC-XXX-NNN-NNN"`) — Rutvik's call. |

### 5.4 CSV deliverable files (NO RENAME — already canonical)

None of the 11 CSV files contain any FCC-prefixed ID — they already use the non-FCC sequential IDs. After the rename, MD will align with CSV.

### 5.5 Spec files (NO RENAME for FCC — already canonical)

`location-notes.spec.ts` and `location-shared-setup-locations.spec.ts` already use non-FCC sequential IDs. The 3 intra-spec ID collisions in Group B (NTS-033/034/035) require DIFFERENT renames that are NOT cleared by the FCC sweep — they need user input first.

### 5.6 Test-data files (NONE)

`clients/encore/src/data/testdata/locations/location-notes.data.ts` does not reference TC IDs (it exports test-data constants like `NOTE_1_CHAR`, `NOTE_4000_CHARS`). No rename needed.

### 5.7 Page-object / selector files (NONE)

No `*.page.ts` or `*.selectors.ts` file in the locations or local-office tree references any FCC-prefixed ID. (Verified via grep — page objects are TC-agnostic by design.)

### 5.8 Docs / agents / hooks (NONE)

No `.md` under `docs/`, `.claude/agents/`, `.claude/rules/`, `.claude/skills/`, or `.claude/hooks/` references any FCC-prefixed TC ID. The FCC pattern lives only in plan files and the 2 MD test-case files. (Verified — grep returned zero matches outside the 9 files listed above.)

---

## 6. Per-group rename map (consolidated)

```
# Notes FCC sweep — 26 renames in MD
TC-LOC-NTS-FCC-001  →  TC-LOC-NTS-039
TC-LOC-NTS-FCC-002  →  TC-LOC-NTS-040
TC-LOC-NTS-FCC-006  →  TC-LOC-NTS-041
TC-LOC-NTS-FCC-007  →  TC-LOC-NTS-042
TC-LOC-NTS-FCC-008  →  TC-LOC-NTS-043
TC-LOC-NTS-FCC-009  →  ⚠ NTS-033 conflicts with §4 spec-collision; needs NEW free ID (suggest NTS-062 with new CSV row)
TC-LOC-NTS-FCC-010  →  TC-LOC-NTS-044
TC-LOC-NTS-FCC-012  →  ⚠ NTS-034 conflicts with §4 spec-collision; needs NEW free ID
TC-LOC-NTS-FCC-013  →  TC-LOC-NTS-045
TC-LOC-NTS-FCC-014  →  TC-LOC-NTS-046
TC-LOC-NTS-FCC-015  →  TC-LOC-NTS-047
TC-LOC-NTS-FCC-016  →  TC-LOC-NTS-048
TC-LOC-NTS-FCC-017  →  TC-LOC-NTS-049
TC-LOC-NTS-FCC-018  →  TC-LOC-NTS-050
TC-LOC-NTS-FCC-019  →  TC-LOC-NTS-051
TC-LOC-NTS-FCC-020  →  TC-LOC-NTS-052
TC-LOC-NTS-FCC-021  →  TC-LOC-NTS-053
TC-LOC-NTS-FCC-022  →  ⚠ NTS-035 conflicts with §4 spec-collision; needs NEW free ID
TC-LOC-NTS-FCC-023  →  TC-LOC-NTS-054
TC-LOC-NTS-FCC-024  →  TC-LOC-NTS-055
TC-LOC-NTS-FCC-025  →  TC-LOC-NTS-056
TC-LOC-NTS-FCC-026  →  TC-LOC-NTS-057
TC-LOC-NTS-FCC-027  →  TC-LOC-NTS-058
TC-LOC-NTS-FCC-028  →  ⚠ ambiguous: MD-038 already exists. Either DROP FCC-028 (covered by HIST) or rename to a new ID. Confirm with Rutvik.
TC-LOC-NTS-FCC-029  →  TC-LOC-NTS-060
TC-LOC-NTS-FCC-032  →  TC-LOC-NTS-061

# SSL FCC sweep — 14 renames in MD
TC-LOC-SSL-FCC-001  →  TC-LOC-SSL-033
TC-LOC-SSL-FCC-002  →  TC-LOC-SSL-034
TC-LOC-SSL-FCC-003  →  TC-LOC-SSL-035
TC-LOC-SSL-FCC-004  →  TC-LOC-SSL-036
TC-LOC-SSL-FCC-005  →  TC-LOC-SSL-037
TC-LOC-SSL-FCC-006  →  TC-LOC-SSL-038
TC-LOC-SSL-FCC-007  →  TC-LOC-SSL-039
TC-LOC-SSL-FCC-008  →  TC-LOC-SSL-040
TC-LOC-SSL-FCC-009  →  TC-LOC-SSL-031
TC-LOC-SSL-FCC-010  →  TC-LOC-SSL-041
TC-LOC-SSL-FCC-011  →  TC-LOC-SSL-042
TC-LOC-SSL-FCC-012  →  TC-LOC-SSL-032
TC-LOC-SSL-FCC-013  →  TC-LOC-SSL-043
TC-LOC-SSL-FCC-014  →  TC-LOC-SSL-044
```

---

## 7. Methodology caveats

1. **MD parser limitations**: the parser extracts `**FieldName**:` AND `FieldName:` patterns at line start. Some MD entries embed steps in a `Steps:` plain-text section without bold markers; these are now correctly parsed (verified against locations_local_information_test_cases.md sections). Entries with truly empty `Steps:` (e.g., DROPPED placeholders at TC-LOC-ACC-021, TC-LOC-ACC-024, TC-LOC-LI-065) are correctly flagged as low-content and excluded from behavior-fingerprint comparison.

2. **CSV parser**: RFC-4180 quoted-field parser implemented manually (no external dependency). Handles embedded commas, newlines in quoted strings, and `""` escapes. Verified by record-count match against `wc -l` on each CSV (off-by-one is expected — header row).

3. **Spec brace tracker**: the v2 parser is string/comment-aware and correctly identifies the arrow function body of each `test()` even when the parameter destructure contains `{ … }`. Records report identical line numbers as `git grep` line outputs.

4. **Title fingerprint sensitivity**: titles are case-insensitive and punctuation-insensitive but otherwise preserve content. Two records with the same fingerprint = same content modulo formatting noise. Cross-artifact matching with title-fp `==` is the strictest signal; Jaccard token-overlap is a softer fallback heuristic.

5. **Spec signature limitations**: signature extraction captures string literals, matcher calls, identifier references, and page-object method names — but does NOT differentiate between same-method-different-index calls (e.g., `NON_NUMERIC_TEST_FIELDS[0]` vs `[1]`). This produced 2 false-positive spec_behavior matches (SSL-006 vs SSL-017; LOS-BAS-055 vs LOS-BAS-056). Both excluded from §2 after manual review.

6. **Confidence scores**: title-fp matches are exact (1.00 / 0.00); Jaccard scores are continuous (0.00..1.00). HIGH = exact match or ≥0.50 Jaccard with no ambiguous alternative. Manual review applied where Jaccard chose a near-miss (e.g., NTS-FCC-017 incorrectly picked NTS-048 because "2-row" / "5-row" both share "row positive smallest moderate save reload" tokens — the larger common-token mass with NTS-048's title beat the digit difference). All 6 low-Jaccard mappings were manually validated by reading both records.

7. **NTS-FCC-028 (HIST sequential save)**: This is a SPECIAL case — the MD entry was authored as the "main spec" counterpart to a HIST-side test (`TC-LOC-NTS-038`). The HIST spec at `clients/encore/specs/locations/history/location-hist-notes.spec.ts:225` is the only implementation. CSV-038 is the HIST version. There is NO non-HIST main-spec implementation. **Decision needed**: drop FCC-028 from MD (it's a duplicate of NTS-038 which already exists in MD), OR retain FCC-028 with a "Coverage: covered by HIST TC-LOC-NTS-038" cross-reference. Rutvik should choose.

8. **Spec ID collisions (§4) interact with FCC rename**: 3 of the 26 NTS-FCC entries naturally map to IDs that are ALREADY USED by another spec test (NTS-033, NTS-034, NTS-035). A straight rename would worsen the collision — the FCC entry's intent would land on the same ID as an unrelated test. These 3 FCC entries need NEW unused IDs (likely NTS-062, NTS-063, NTS-064) OR a manual content-merge where Rutvik decides which test concept survives. **DO NOT execute these 3 renames without user input.**

9. **Plan files are historical artifacts**: per LR-027 / LR-040 audit-trail principle, rewriting `plans/done/SUBPLAN_NOTES_FCC_PILOT.md` (which executed under FCC labels) is generally discouraged. The right move is either (a) leave plan files as historical truth and only update the active 4 pending plans + 1 runtime file + 2 MD files, OR (b) add a closing note to each done plan's Execution Summary clarifying the post-rename canonical IDs. Rutvik's call.

10. **No baseline-diff applied**: per `.claude/rules/baseline.md` LR-045, baseline truth source (`navigator2.training.psav.com`) was NOT consulted during this audit. This is a pure-content fingerprinting pass over existing artifacts — no behavior claims, no MCP/CLI walk, no DOM verification. The rename targets are derived from spec+CSV alignment, NOT from old-site oracle.

---

## 8. Recommended execution order (IF Rutvik approves)

**Phase 1 — Confirm with user (BEFORE any rename)**:
1. Approve the Notes-FCC → NTS-NN mapping table (§3.1).
2. Approve the SSL-FCC → SSL-NN mapping table (§3.2).
3. Decide handling of the 3 spec ID collisions (§4): new IDs OR content-merge.
4. Decide handling of TC-LOC-NTS-FCC-028 (§7.7): drop OR retain with cross-ref.
5. Decide whether to update `plans/done/*.md` historical files (§7.9).
6. Decide whether `clients/encore/src/core/field-case-runner.ts:13` docstring keeps FCC example or generalizes.

**Phase 2 — Atomic rename (single commit per artifact class)**:
1. Rename 26 Notes-FCC entries in `locations_notes_test_cases.md`: replace each `## TC-LOC-NTS-FCC-NNN:` header AND any internal cross-reference to FCC-NNN. Also update line 589 header text.
2. Rename 14 SSL-FCC entries in `locations_shared_setup_locations_test_cases.md`: replace each `## TC-LOC-SSL-FCC-NNN:` header AND all the catalog-table rows (:725-755, :770, :776).
3. Update 4 pending plan files to use canonical non-FCC IDs.
4. Update `field-case-runner.ts:13` docstring per §5.3 decision.

**Phase 3 — Spec ID collision resolution** (separate change, gated on user input):
1. Per §4, rename 3 spec tests at lines 132/167/425 to new free IDs.
2. Add corresponding CSV rows + MD entries for the new IDs (since they currently exist only in spec).

**Phase 4 — Verification**:
1. `npm run check:tc-parity` exits 0 (MD ↔ CSV ↔ spec triplet parity).
2. `npx playwright test --list` resolves all renamed IDs.
3. `grep -RE "TC-(LOC-NTS|LOC-SSL)-FCC-" clients/ plans/ docs/ .claude/ src/` returns ZERO matches (or only retained historical references in `plans/done/`).
4. `final-q` audit passes.

---

## 9. High-risk items flagged for user attention

1. **Spec ID collisions (§4)** — 3 IDs each used by two tests in the same file. CRITICAL. Cannot proceed with FCC rename for FCC-009/-012/-022 until disambiguated.
2. **CSV deliverable confusion (§3.1 row TC-LOC-NTS-033 etc.)** — the canonical IDs that FCC-009/-012/-022 *would* take are ALREADY in CSV pointing to different test content. Renaming MD to those IDs would create a 3-way MD/CSV/spec mismatch worse than the current state. **STOP and ask Rutvik.**
3. **TC-LOC-NTS-FCC-028** — special HIST-vs-main duplicity (§7.7). Possibly DROP from MD rather than rename.
4. **Plan files in `plans/done/`** — rewriting historical execution logs has LR-027/LR-040 audit-trail implications (§7.9).
5. **`SUBPLAN_SSL_FCC.md` in `plans/pending/`** — template still uses FCC-NNN labels (§5.2 row). If this subplan is still planned to execute, its FCC pattern needs to align with the new naming convention OR Rutvik confirms the subplan is superseded.
6. **No old-site baseline diff** — this audit is pure-content fingerprinting (§7.10). If any FCC rename should be validated against old-site baseline behavior, that's a separate session per LR-045.

---

## 10. Appendix — fingerprint extractor tooling

Source: `clients/encore/specs_planning/_internal/.dedupe-tmp/fingerprint.mjs`

Outputs (intermediate JSON, may be deleted after rename pass):

- `md.json` — 477 MD records with `{id, title, steps, expected, preconditions, notes, file, line, fp:{full,title,behavior}}`
- `csv.json` — 474 CSV rows with same shape
- `spec.json` — 336 spec test() entries with `{id, title, body, file, line, fp:{full,title,behavior}}`
- `duplicates.json` — full/behavior/title fingerprint collision groups per artifact type
- `cross-by-title.json` — multi-artifact title-fp collision groups
- `mapping.json` — 40 FCC→canonical Jaccard-matched pairs with confidence scores

To re-run after any source edit:

```
node clients/encore/specs_planning/_internal/.dedupe-tmp/fingerprint.mjs
```

The script is idempotent and READ-ONLY against source artifacts. It only writes to `.dedupe-tmp/`.
