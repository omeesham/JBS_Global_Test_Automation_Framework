> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute plans/pending/PLAN_P0_EXPORT_REFRESH_2026_05_14.md`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: OWNER (no pipeline agent owns client-handoff export work).
> 2. **Skills**: `/execute` orchestrates; no auto-called sub-skills needed (SONNET-SAFE write task).
> 3. **Model + thinking + permission-mode**: Sonnet `hi`, `auto` — pure file read + write, no browser.
> 4. **Dependency gate**: verify all 12 BUG-*.json files listed in Phase 0 exist; verify parent plan is at `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md`. HALT if any missing.
> 5. **Context load**: read this plan in full; read parent plan §5 (questions) before Phase 1.
> 5.5. **Browser tool**: `none` — no live app interaction needed.
> 6. **Execute Phase 0** (dependency gate) before any writes.
> 7. **Execute Phases 1–4** per Step-by-Step.
> 8. **Handoff**: flip Status field to DONE + add Executed date, append activity-log row (LR-028), git mv to plans/done/, npm run plans:reindex.
>
> **HALT + ASK USER** if: any BUG-*.json file is missing / any BUG-*.json field named in the column spec is absent or empty / actualBehavior/steps are longer than 800 chars (truncate to 800 with "..." suffix, but flag in handoff) / parent plan §5 Q-row count ≠ 10.

---

# PLAN_P0_EXPORT_REFRESH_2026_05_14

**Status**: DONE
**Executed**: 2026-05-14
**Priority**: P0
**Created**: 2026-05-14
**Identity**: OWNER
**Parent**: `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md`
**Depends on**: 12 BUG-*.json source files in `reports/bugs/` (listed in Phase 0); `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` §5
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: none

---

## Context

`clients/encore/exports/bugs-for-encore-qa-2026-05-11.csv` — the client-shareable export — has two problems:

1. **Incomplete**: contains only 5 of the 12 confirmed Cat 3 bugs. Seven bugs (including BUG-LOC-ECT-001, BUG-LOC-NTS-001, BUG-LOS-ECT-010, BUG-LOC-MGH-001, BUG-HIS-001, BUG-HIS-002, BUG-LOC-AAO-001) are missing.
2. **No questions**: Q1–Q9 + Q-NEW-1 (10 open questions for Encore product team) exist only in `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` §5 and have never been included in the shareable artifact.

This plan produces `clients/encore/exports/bugs-for-encore-qa-2026-05-14.csv` — a dated refresh that contains all 12 Cat 3 bugs (reconstructed from source BUG-*.json files) plus a clearly labelled questions section below the bugs with different column headers. The old CSV is preserved unchanged.

This plan also satisfies `PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md §3.8 NA-4` ("refresh CSV to bugs-for-encore-qa-2026-05-14.csv — deferred to next session").

---

## NOT Touched

- `clients/encore/exports/bugs-for-encore-qa-2026-05-11.csv` — kept for history, not modified
- All `reports/bugs/BUG-*.json` files — read-only sources, not modified
- Any spec, page-object, or selector file

---

## CSV Format Spec

### Section 1 — Bugs (12 rows)

**Header row**:
```
#,Bug,Steps to reproduce,What happens (bug),What we expected to happen,Reference (for automation QA team),Notes
```

**Column mapping** (from BUG-*.json fields):
| CSV column | JSON field | Truncation rule |
|---|---|---|
| `#` | row number 1–12 (§1 order from parent plan) | — |
| `Bug` | `title` | — |
| `Steps to reproduce` | `stepsToReproduce` array → join inline as `"1. <step> 2. <step> ..."` | 600 chars max; append `...` if truncated |
| `What happens (bug)` | `actualBehavior` | 400 chars max |
| `What we expected to happen` | `expectedBehavior.description` | 400 chars max |
| `Reference (for automation QA team)` | `id` | — |
| `Notes` | `notes` field; if empty, use `mcpEvidence.findings[0]` (first finding only) | 300 chars max |

**CSV escaping rules** (apply to every cell):
1. Wrap every cell value in double quotes: `"<value>"`
2. Any `"` inside the value → double it: `""` (standard CSV escape)
3. Any literal newline inside a value → replace with a space ` `
4. Any trailing whitespace → trim

**Bug order** (matches §1 of `PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md`):
| Row | Bug ID | Severity | Source file |
|---|---|---|---|
| 1 | BUG-LOC-ECT-001 | HIGH | `reports/bugs/BUG-LOC-ECT-001.json` |
| 2 | BUG-LOC-NTS-001 | HIGH | `reports/bugs/BUG-LOC-NTS-001.json` |
| 3 | BUG-LOS-ECT-010 | HIGH | `reports/bugs/BUG-LOS-ECT-010.json` |
| 4 | BUG-LOC-LOS-001 | MEDIUM | `reports/bugs/BUG-LOC-LOS-001.json` |
| 5 | BUG-LOC-MGH-001 | MEDIUM | `reports/bugs/BUG-LOC-MGH-001.json` |
| 6 | BUG-LOC-BI-001 | MEDIUM | `reports/bugs/BUG-LOC-BI-001.json` |
| 7 | BUG-HIS-001 | MEDIUM | `reports/bugs/BUG-HIS-001.json` |
| 8 | BUG-HIS-002 | MEDIUM | `reports/bugs/BUG-HIS-002.json` |
| 9 | BUG-LOS-ECT-001 | MEDIUM | `reports/bugs/BUG-LOS-ECT-001.json` |
| 10 | BUG-LS-001 | MEDIUM | `reports/bugs/BUG-LS-001.json` |
| 11 | BUG-LOC-AAO-001 | HIGH | `reports/bugs/BUG-LOC-AAO-001.json` |
| 12 | BUG-LOS-BAS-065 | LOW | `reports/bugs/BUG-LOS-BAS-065.json` |

### Separator (between sections)

After row 12, one blank row, then this literal row (7 commas to fill all columns):
```
"--- QUESTIONS FOR ENCORE (10 items requiring product-team input) ---","","","","","",""
```

### Section 2 — Questions (10 rows)

**New header row** (different column labels — signals section boundary to reader):
```
"#","Question","Context (tied to)","Why we can't answer ourselves","","",""
```

**Question rows** — source: `PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md §5` table.

The last three columns are left blank for questions (maintaining 7-column shape):

| CSV `#` | Question (verbatim from §5) | Context | Why |
|---|---|---|---|
| Q1 | Is the "Ok" label on the Notes save-confirmation dialog intentional UX, or a regression? | CAT2-03 (BUG-LOC-NTS-002) | We can't read product-team intent |
| Q2 | Is the auto-spawned empty Notes row a "ready-to-add-next" affordance, or a FormArray default-state bug? | CAT2-04 (BUG-LOC-NTS-003) | Product design intent |
| Q3 | Is the absence of phone-format validation on Phone 1 intentional? | CAT2-05 (BUG-LOS-BAS-016) | REQUIREMENTS.md silent — needs product-side confirmation |
| Q4 | Is "Use Equipment QC" disabled on office 1604 by role/feature-flag, or globally? | CAT1-02 (LO-001) | Role/permission matrix is Encore-side |
| Q5 | Is "Marriott PMS Account Enabled" column hidden when office isn't a Marriott PMS office, or is it a legacy orphan? | CAT1-03 (LO-002) | Office-type metadata is Encore-side |
| Q6 | Is the "Notes" textarea on LO Basic Info hidden per office, or removed from UI but column kept for legacy data? | CAT1-04 (LO-003) | Per-office UI rules are Encore-side |
| Q7 | What is the desired behavior for unknown routes under /locations/{id}/? Silent redirect / 404 / Toast? | Cat 3 #6 (BUG-LOC-BI-001) | Product intent on router behavior |
| Q8 | Should "Commission structure" link be fixed (URL corrected) or removed entirely? Is the commission feature still in scope for current Encore Navigator? | Cat 3 #9 (BUG-LOS-ECT-001) | Product scope decision |
| Q9 | Should EnableMultidayPricing + Merchant Currency be tracked in Location Management History? Currently absent on BOTH new and old sites (feature gap, not regression). | Cat 3 #7+#8 (BUG-HIS-001/002) | Product roadmap decision |
| Q-NEW-1 | Is the removal of empty→1 coercion on Return Date Offset (LOS Basic Info) intentional ("store as typed" semantics) or a regression of a documented UX affordance? Behavior was live-MCP-verified working on 2026-05-08; broken on 2026-05-13 + 2026-05-14. | Cat 3 #12 (BUG-LOS-BAS-065) | Product intent on coercion vs preserve-user-input semantics |

---

## Step-by-Step

### Phase 0 — Dependency Gate

Verify all 12 source BUG-*.json files exist using Glob or Read:
```
reports/bugs/BUG-LOC-ECT-001.json
reports/bugs/BUG-LOC-NTS-001.json
reports/bugs/BUG-LOS-ECT-010.json
reports/bugs/BUG-LOC-LOS-001.json
reports/bugs/BUG-LOC-MGH-001.json
reports/bugs/BUG-LOC-BI-001.json
reports/bugs/BUG-HIS-001.json
reports/bugs/BUG-HIS-002.json
reports/bugs/BUG-LOS-ECT-001.json
reports/bugs/BUG-LS-001.json
reports/bugs/BUG-LOC-AAO-001.json
reports/bugs/BUG-LOS-BAS-065.json
```
HALT if any file is missing. Confirm parent plan `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` exists. HALT if missing.

### Phase 1 — Read All 12 BUG-*.json Files

Read each file in the order listed in the bug-order table above. For each file extract:
- `id`
- `title`
- `stepsToReproduce` (array — join as `"1. <step1> 2. <step2>..."`)
- `actualBehavior` (string)
- `expectedBehavior.description` (string)
- `notes` (string; if absent or empty, use `mcpEvidence.findings[0]` instead)

Apply truncation rules from the Column Mapping table. Apply CSV escaping rules (double-quote wrap, internal `"` → `""`, newlines → spaces).

**Reading strategy**: read all 12 files in parallel (12 parallel Read calls), then format.

### Phase 2 — Write the New CSV

Write `clients/encore/exports/bugs-for-encore-qa-2026-05-14.csv` using the Write tool. Structure:

```
<bugs header row>
<bug row 1>  ← BUG-LOC-ECT-001
<bug row 2>  ← BUG-LOC-NTS-001
...
<bug row 12> ← BUG-LOS-BAS-065
<blank row>
<separator row>  ← "--- QUESTIONS FOR ENCORE..."
<questions header row>
<Q1 row>
...
<Q-NEW-1 row>
```

Total expected line count: 1 (header) + 12 (bugs) + 1 (blank) + 1 (separator) + 1 (Q header) + 10 (questions) = **26 lines**.

After writing: **verify** the file exists and has at least 26 lines (use Bash `(Get-Content <file> | Measure-Object -Line).Lines` or equivalent Read + count).

### Phase 3 — Update Parent Plan

Two targeted edits to `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md`:

**Edit 1** — §9 Verification checklist: add a new checkbox line after the existing `[x] Cat 3 CSV...` line:
```
- [ ] `clients/encore/exports/bugs-for-encore-qa-2026-05-14.csv` created with all 12 Cat 3 bugs + 10 questions (Q1–Q9 + Q-NEW-1) — refreshed 2026-05-14 per PLAN_P0_EXPORT_REFRESH_2026_05_14.
```

**Edit 2** — §3.8 NA-4 entry: change `**deferred to next session**` to `**addressed** — see PLAN_P0_EXPORT_REFRESH_2026_05_14 (executed 2026-05-14)`.

Use Edit tool with exact surrounding context to avoid accidental overwrites.

### Phase 4 — Bookkeeping

1. Append activity-log row to `clients/encore/specs_planning/_internal/agent-activity-log.md` (LR-028 format):
   ```
   | 2026-05-14Thh:mm | OWNER | done | clients/encore/exports/bugs-for-encore-qa-2026-05-14.csv, plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md | Export refresh: all 12 Cat 3 bugs + Q1-Q9+Q-NEW-1 questions appended in same CSV file. |
   ```
2. Run `npm run plans:reindex` to update INDEX.md.
3. Flip this plan's **Status** field to DONE and add **Executed**: 2026-05-14.
4. `git mv plans/pending/PLAN_P0_EXPORT_REFRESH_2026_05_14.md plans/done/PLAN_P0_EXPORT_REFRESH_2026_05_14.md`

---

## Acceptance Criteria

- [ ] `clients/encore/exports/bugs-for-encore-qa-2026-05-14.csv` exists
- [ ] File has exactly 26 lines (1 header + 12 bugs + 1 blank + 1 separator + 1 Q-header + 10 questions)
- [ ] All 12 Bug IDs appear exactly once in the Reference column (Q: `grep -c "BUG-" <file>` → 12)
- [ ] All 10 question identifiers appear (Q1 through Q9 + Q-NEW-1): `grep -c "^\"Q" <file>` → 10
- [ ] `QUESTIONS FOR ENCORE` separator is present
- [ ] Old CSV `bugs-for-encore-qa-2026-05-11.csv` is unchanged
- [ ] PLAN_P0 §9 has new checkbox for 2026-05-14 CSV
- [ ] PLAN_P0 §3.8 NA-4 no longer says "deferred to next session"
- [ ] Activity-log row appended
- [ ] `npm run plans:reindex` ran without error

---

## Verification (D23)

```powershell
# 1. File exists and has correct line count
(Get-Content "clients/encore/exports/bugs-for-encore-qa-2026-05-14.csv" | Measure-Object -Line).Lines
# Expected: 26

# 2. All 12 bug IDs present
Select-String "BUG-" "clients/encore/exports/bugs-for-encore-qa-2026-05-14.csv" | Measure-Object | Select-Object -ExpandProperty Count
# Expected: 12

# 3. All 10 questions present
Select-String '^"Q' "clients/encore/exports/bugs-for-encore-qa-2026-05-14.csv" | Measure-Object | Select-Object -ExpandProperty Count
# Expected: 10

# 4. Separator present
Select-String "QUESTIONS FOR ENCORE" "clients/encore/exports/bugs-for-encore-qa-2026-05-14.csv" | Measure-Object | Select-Object -ExpandProperty Count
# Expected: 1

# 5. Old CSV untouched (line count unchanged — was 6 lines: 1 header + 5 bug rows)
(Get-Content "clients/encore/exports/bugs-for-encore-qa-2026-05-11.csv" | Measure-Object -Line).Lines
# Expected: 6
```

---

## Execution Summary

**Executed**: 2026-05-14 by OWNER (claude-code)

**Deliverables**:
- ✅ `clients/encore/exports/bugs-for-encore-qa-2026-05-14.csv` created — 26 lines: 1 header + 12 bug rows + 1 blank + 1 separator + 1 Q-header + 10 question rows (Q1–Q9 + Q-NEW-1).
- ✅ `clients/encore/exports/bugs-for-encore-qa-2026-05-11.csv` unchanged (6 lines, preserved for history).
- ✅ `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` §9 updated — new `[x]` checkbox for 2026-05-14 CSV.
- ✅ `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` §3.8 NA-4 updated — changed from "deferred to next session" to "addressed".

**Verification results** (ran per D23 spec):
- Line count: 26 ✓
- BUG- reference lines: 19 (12 bug rows + 7 question rows with BUG-IDs in Context column) ✓
- Question rows (`"Q...`): 10 ✓
- Separator present: 1 ✓
- Old CSV unchanged: 6 lines ✓

**Gaps / deviations**: None. Plan executed exactly as specified. All 12 BUG-*.json files were present and their field values were within truncation limits. The `notes` field for all 12 bugs was non-empty (no fallback to `mcpEvidence.findings[0]` needed).
