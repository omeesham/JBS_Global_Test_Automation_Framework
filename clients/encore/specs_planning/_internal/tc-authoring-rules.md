# TC Authoring Rules — Client-Facing Text Hygiene

**Status**: ACTIVE (2026-04-22)
**Owner**: TC-authoring subplans (SP-C1, SP-C2, SP-D1..D10, any future subplan touching `clients/encore/specs_planning/test-cases/**`)
**Installed by**: [SUBPLAN_HIST_PIVOT_42_L1_TC_AUTHORING_RULES.md](../../../../plans/done/SUBPLAN_HIST_PIVOT_42_L1_TC_AUTHORING_RULES.md)

---

## Why this doc exists

Test-case markdown files in `clients/encore/specs_planning/test-cases/**` are read by the client. The client reviewer has flagged two classes of defects in delivered TCs:

1. **Reviewer-formatting leaks** (2026-04-21) — tick/check/arrow symbols used as step-result separators, markdown bold used for UI labels (`**Basic Information**`), jargon like `tabpanel renders` / `spinner` / `DataTable` in Expected Results that a non-technical reader cannot parse.
2. **Bug-descriptor leaks** (2026-04-22) — internal bug commentary pasted into client-visible TC text. Example: [TC-LOC-MGH-002](../test-cases/setup/locations/locations_management_history_test_cases.md:118) Step 4 reads `(known bug — not translated)`; Expected reads `Column #28 displays raw i18n key`. [TC-LOC-MGH-038](../test-cases/setup/locations/locations_management_history_test_cases.md:305) is an entire TC dedicated to asserting the buggy state (`bugBehavior=untranslated i18n key rendered`).

Both classes are "TC text that a human reviewer would not have written." The rules below close both gaps at authoring time.

---

## The 5 rules (MANDATORY for every TC MD edit)

### Rule 1 — No symbols

No tick marks, check marks, cross marks, arrows, decorative bullets, or any decorative glyph inside step text or expected-result text. Plain English only.

**Forbidden characters** (grep-blockable):
- `✓` `✔` `✅` (ticks / checks)
- `✗` `✘` `❌` (crosses)
- `→` `⇒` `▶` `►` (arrows)
- `•` `◦` `■` `□` (decorative bullets — use numbered lists or dashes instead)
- `⚠️` `ℹ️` `❗` (warning/info glyphs — write "Warning:" / "Note:" instead)

### Rule 2 — No markdown bold for UI labels

Do not wrap field names, tab names, button names, or any UI element name in double-asterisks (`**...**`). Use double-quotes around the literal UI label instead.

Wrong: Click the **Save** button on the **Basic Information** tab.
Right: Click the "Save" button on the "Basic Information" tab.

**Style convention** (locked 2026-04-28 by SP-DQU-05B file-wide application on `locations_local_information_test_cases.md`):

The Phase 0 grep `\*\*[A-Z][^*]{0,40}\*\*` matches both UI labels AND any other bolded uppercase-start phrase ≤40 chars (metadata keys like `**Steps**:`, sub-section headings, descriptive emphasis). To get the file-wide grep to zero, ALL bold of that shape must be removed — not just UI-label bold. Apply one consistent file-wide style:

| Pattern type | Example before | Example after |
|---|---|---|
| UI label (no trailing colon) | `**Apply LDW**` | `"Apply LDW"` |
| Metadata key (trailing colon) | `**Steps**:` | `Steps:` |
| Sub-section heading or descriptive emphasis | `**EXPECTED (per requirements)**:` | `EXPECTED (per requirements):` |
| Lowercase-start UI label | `**eCommerce Active**` | `"eCommerce Active"` |

Drop bold from metadata keys file-wide (do NOT quote them — they are not UI literals). Quote UI labels with double-quotes (CSV-safe). Sub-section headings and descriptive emphasis follow metadata-key style (drop bold, no quotes). This is the convention all subsequent TC-authoring subplans must follow when editing or regenerating TC MDs in `clients/encore/specs_planning/test-cases/**`.

### Rule 3 — Expected Results in simple descriptive English

No jargon, no shorthand, no technical phrasing like "no spinner remains", "tabpanel renders", "aria-invalid set", "DataTable visible". Write full sentences that a non-technical reader can follow.

**Wrong**: `Expected: DataTable is visible with column headers. No spinner remains after load.`
**Right**: `Expected: The history table should be visible on the screen with all its column names shown in the header row. There should be no loading indicator still showing after the table has finished loading.`

### Rule 4 — No bug-descriptor language in client-visible TC text

Client-visible fields (TC title, Preconditions, Steps, Expected, Notes, Data, and any column-header table rows inside the TC MD) must NEVER describe a bug, workaround, "as-is buggy" behavior, or defect commentary.

**If a real defect is discovered during authoring**:

1. File `reports/bugs/BUG-<MODULE>-<NNN>.json` per LR-034 (mandatory schema, dedup check, MCP evidence).
2. Author the TC against the **documented expected behavior** (from REQUIREMENTS.md / Functional Requirement .docx / Jira ACs / NM-* tickets), not against the buggy DOM state.
3. If the assertion is blocked by the bug: add a single metadata line to the TC's priority/status table — `Status: Blocked by BUG-<MODULE>-<NNN>`. That metadata line is the ONLY place in the TC MD where a bug ID appears. Never in Steps, Expected, Data, Notes, or column-header tables.
4. Record the linkage by adding the TC ID to the BUG JSON's `affectedTests[]` array.

**Forbidden phrases** (grep-blockable, case-insensitive):
- `known bug`
- `not translated`
- `untranslated key`
- `raw i18n key`
- `renders (an )?untranslated`
- `not yet localized`
- `i18n miss`
- `**BUG**:`
- `bugBehavior=`
- `defect`
- `as-is buggy`
- `known defect`
- `pending fix`
- `workaround`
- `FIXME` (except inside spec .ts files — TC MDs only)
- `TODO` (except inside spec .ts files — TC MDs only)

### Rule 5 — Live-DOM-first: every TC MD edit needs a fresh field-inventory artifact

Behavioural content in a TC MD (the text inside `**Steps**:`, `**Expected**:`,
`**Data**:`, or `**Preconditions**:` — and the future `## Steps` / `## Expected`
/ `## Data` / `## Preconditions` h2 equivalents) MUST be authored against the
live DOM, not from memory or from `REQUIREMENTS.md` alone. Pairing is enforced
**structurally** by the SP-AAE-02 pre-commit hook:

- For every `clients/<client>/specs_planning/test-cases/**/*.md` edit whose diff
  touches a content block, the hook requires a sibling artifact at
  `clients/<client>/specs_planning/_internal/field-inventories/<module>-<YYYY-MM-DD>.md`
  with `**MCP_Session_Date**: YYYY-MM-DD` dated within the last **14 days**.
- Pure metadata edits (MCP_VERIFICATION_LOG timestamps, CORRECTIONS headers,
  Priority / Status table cells, HTML comments, blank-line reflow, inline
  FIELD INVENTORY updates) are **not** blocked.

If the hook rejects a commit you consider legitimate, re-read AAE-D2 in
[PLAN_AGENT_AUTHORING_EFFICIENCY.md](../../../../plans/pending/PLAN_AGENT_AUTHORING_EFFICIENCY.md)
and the format contract in
[field-inventory-spec.md](./field-inventory-spec.md) before tuning — the scope
guard is calibrated against the two real TC MD styles in-repo today and
defaults to opt-out for anything that is not a content block.

**Sample error message** (from `scripts/check-tc-has-fieldinventory.mjs`):

```
[check-tc-has-fieldinventory] BLOCKED — commit rejected.

One or more staged test-case markdown edits changed the behavioural content
(Steps / Expected / Data / Preconditions) without a paired field-inventory
artifact dated within the last 14 days. See
clients/<client>/specs_planning/_internal/field-inventory-spec.md (SP-AAE-01).

  x clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md
      needs field-inventory artifact at:
        clients/encore/specs_planning/_internal/field-inventories/local-office-settings-<YYYY-MM-DD>.md
      (module "local-office-settings" has no paired artifact)
```

Fix path: run a dated MCP walk, emit the field-inventory artifact per the
spec, re-attempt the commit.

Install the hook once per clone with `npm run plans:hooks:install`. CI should
run `npm run test:tc-has-fieldinventory` to exercise the script's 18 fixtures
without installing the hook locally.

---

## Phase 0 enforcement — mandatory grep before save

Before saving any test-case MD you have written or edited, run:

```bash
# From repo root
grep -niE '✓|✔|✅|✗|✘|❌|→|⇒|▶|►|⚠️|ℹ️|❗' <edited-tc-md-file>
grep -niE '\*\*[A-Z][^*]{0,40}\*\*' <edited-tc-md-file>   # bold around UI labels
grep -niE 'known bug|not translated|untranslated key|raw i18n key|not yet localized|\*\*BUG\*\*:|bugBehavior=|as-is buggy|known defect|pending fix|workaround|renders (an )?untranslated' <edited-tc-md-file>
grep -niE '\b(DataTable|tabpanel|spinner|aria-invalid|data-testid|shadow DOM|selector)\b' <edited-tc-md-file>   # jargon in Expected
```

All four greps must return zero hits. Any hit is a HALT condition — rewrite the TC text before saving.

---

## Sweep obligation — when you TOUCH an existing TC MD that already contains leaks

Subplans that edit or regenerate existing TC MDs own the cleanliness of what they touch. If the grep above returns hits on an existing file you're editing:

1. File the missing `BUG-*.json` per LR-034 (if Rule 4 leak — no BUG yet).
2. Rewrite the offending TC text to comply with all 4 rules.
3. Move any bug ID into the `Status: Blocked by BUG-*` metadata line (delete bug references from Steps / Expected / Data / Notes / column tables).
4. Re-export the paired CSV if one exists (`npx ts-node export_test_cases/to-csv.ts ./path/to.md ./path/to.csv`).
5. Log the sweep in your activity-log row's description with the TC IDs cleaned and the BUG-* IDs filed.

Do NOT silently regenerate over leaked text — that preserves the leak.

---

## Known leaks (as of 2026-04-22) — fix when next subplan touches these files

| File | Lines | Rule violated | Action |
|---|---|---|---|
| [locations_management_history_test_cases.md](../test-cases/setup/locations/locations_management_history_test_cases.md) | 38 (column-header table) | Rule 4 (`**BUG**: renders raw i18n key`) | Delete the "BUG:" prefix; file BUG-HIS-CDWNA-001; replace row with the eventual translated label or mark as "pending translation" without bug language. |
| [locations_management_history_test_cases.md](../test-cases/setup/locations/locations_management_history_test_cases.md) | 127 (TC-LOC-MGH-002 Step 4) | Rules 1, 2, 4 (tick, bold, "known bug — not translated") | Remove Step 4 entirely; column-#28 verification belongs in a focused TC gated by BUG-HIS-CDWNA-001, not in the generic 87-header structural TC. |
| [locations_management_history_test_cases.md](../test-cases/setup/locations/locations_management_history_test_cases.md) | 129 (TC-LOC-MGH-002 Expected) | Rules 3, 4 (jargon "raw i18n key") | Rewrite Expected to "All 87 column headers should be visible across the table in plain English." (drop the column-#28 commentary). |
| [locations_management_history_test_cases.md](../test-cases/setup/locations/locations_management_history_test_cases.md) | 305–317 (TC-LOC-MGH-038) | Rule 4 (entire TC asserts buggy state) | Delete the TC. Content becomes `expectedBehavior` / `actualBehavior` of BUG-HIS-CDWNA-001. If a verification TC is still wanted, author a fresh one against the *correct* translated header with `Status: Blocked by BUG-HIS-CDWNA-001`. |

BUG-HIS-CDWNA-001 is NOT yet filed as of 2026-04-22. The subplan that next touches `locations_management_history_test_cases.md` owns filing it (LR-034 protocol).

Additional entries in this table should be appended — not edited out — when new leaks are discovered during sweeps. Dated append-only.

---

## Scope — what these rules do NOT cover

- Spec code (`.ts` files) — comments, `test.skip` reasons, diagnostics are NOT client-visible. `FIXME`, `TODO`, bug IDs are permitted in spec code.
- BUG-*.json files — these are internal artifacts; their `expectedBehavior` / `actualBehavior` / `mcpEvidence` fields can and should contain frank bug descriptions.
- Catalog and mapping docs (`hist-root-map-*.md`, `clients/encore/specs_planning/catalogs/**`) — reference material, not client-delivered.
- Planning artifacts (`plans/**/*.md`, `test-plans/**/*.md`, `REQUIREMENTS.md`) — internal-first.
- `agent-activity-log.md`, `agent-mistakes.md` — internal audit trail.
- `_internal/` directory (this file included) — agent-facing, not client-facing.

If in doubt whether a file is client-visible: check whether it gets exported into a CSV or whether the client receives it in delivery bundles. If yes → rules apply.

---

## Graduation path

When these rules have survived 3+ subplan executions without new leak discoveries, graduate them to framework-level as `LR-041 — TC authoring hygiene` in root `CLAUDE.md` (SP-K1 framework rules sweep is the canonical destination). Until graduation, this doc is the single source of truth.

---

## Revision history

- **2026-04-22** — Initial version (4 rules). Installed by SP-L1 in response to two reviewer-feedback incidents: 2026-04-21 formatting (Rules 1–3) and 2026-04-22 bug-language (Rule 4).
- **2026-04-23** — SP-AAE-02 adds Rule 5 (Live-DOM-first field-inventory artifact required). Structurally enforced by `.githooks/pre-commit` via `scripts/check-tc-has-fieldinventory.mjs`. Also adds the `npm run test:tc-has-fieldinventory` CI fixture runner.
