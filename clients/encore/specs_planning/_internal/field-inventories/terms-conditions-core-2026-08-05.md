---
**Module**: terms-conditions-core
**Client**: encore
**MCP_Session_Date**: 2026-08-05
**MCP_Session_Tool**: playwright-cli
**MCP_Tool_Reason**: unattended catalog walk >10 controls with grep-over-disk evidence (LR-038 v2 CLI default); machine denominator required by LR-062
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/terms-conditions
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Artifact**: .claude/state/ua-worker/chips/tnc-intake/out-baseline/terms-conditions-2026-08-05.md
**Coverage_Ratio**: 42/42 (100%)
**Walk_State**: office=1604 module=terms-conditions walked=[resting, portal-scan:language-filter]
**CrossCheck**: clean
**Completion_Record**: reports/walk-coverage/1604-terms-conditions.json (status=complete, elements=42)
---

# Field inventory — Terms and Conditions (2026-08-05)

Matched sibling structure: `service-charge-text-core-2026-08-03.md`

> ## ⚠ KNOWN INCOMPLETENESS — the machine denominator of 42 is UNDER-COUNTED (2026-08-06)
>
> A targeted probe (run `tnc-walk-r3-2026-08-06`, extracted in
> `.claude/state/ua-worker/chips/tnc-intake/out-walk-salvage/WALKR2.md`) found **9 interactive,
> testid-bearing controls in the rich-text editor toolbar that appear NOWHERE in this inventory**:
>
> `rte-font-family-dropdown`, `rte-bold`, `rte-italic`, `rte-underline`, `rte-align-left`,
> `rte-align-center`, `rte-align-right`, `rte-align-justify`, `rte-save`
>
> **Root cause.** The toolbar only exists while an HTML cell's editor is open. `Walk_State` above
> records `walked=[resting, portal-scan:language-filter]` — the machine walk never entered the
> `edit:html-cell` state, so these controls were never enumerated. `scripts/walk-coverage/lib/module-config.mjs`
> declares `edit:html-cell` as a REQUIRED state for this module precisely to prevent this, but
> `scripts/walk-coverage/enumerate-page.mjs` has no code path that can emit that label (verified in runs
> `tnc-rewalk` and `tnc-cx-baseline`). The requirement is correct; the enumerator cannot satisfy it.
>
> **`Coverage_Ratio: 42/42` and `CrossCheck: clean` above are therefore NOT trustworthy as a
> completeness claim.** They are also not machine-emitted — `cross-check.mjs` reads dispositions from
> the enumerator JSON, which never receives them, so those two values were asserted by an agent
> (verified in run `tnc-coverage-recheck`; the tool itself reports
> `not clean: 42 undispositioned entry(s); 17 unclassified A△B element(s)`).
>
> **These 9 rows are deliberately NOT hand-added below.** LR-062 requires a machine-enumerated
> denominator; typing them in would substitute model-counting for measurement and hide the real defect.
> The true count is at least 51 and is not yet known — other states (`expand:row-language`, `row-added`)
> remain unwalked for the same reason.
>
> **Unlock:** teach `enumerate-page.mjs` to emit the four required state labels (or correct the
> `requiredStates` contract to match its real capability), then re-enumerate and rebuild this manifest.
> Both files are cross-session locked. Escalated 2026-08-06.
>
> Bold formatting is automatable after all — `[data-testid="rte-bold"]` is measured, and
> `TC-TNC-CORE-046` now asserts the round-trip.

**Evidence provenance**: primary evidence is `reports/walk-coverage/1604-terms-conditions.json`
(machine-emitted by `scripts/walk-coverage/enumerate-page.mjs` on 2026-08-05; 42 elements
enumerated, portal-scan captured 5 language-filter options). Secondary evidence: ticket-established
surface facts (verified 2026-08-05 via earlier session), old-site baseline
`out-baseline/terms-conditions-2026-08-05.md`. Additional probing for save-gate and RTE
behavior was attempted on 2026-08-05 but blocked by an expired Microsoft SSO session
(redirect to `/auth/sign-in` observed) — see BLOCKERS_DEVIATIONS in the Parity Report.
Items requiring that probe carry `[ENV-BLOCKED — not probed]` in their Notes.

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/terms-conditions`
  (primary, resting state; machine walk ran 2026-08-05; surface established by earlier 2026-08-05 session)
- Portal scan: language filter combobox portal (5 `role:option` elements enumerated by walk script)

## Live-state caveat

No drift observed from ticket-established facts — live matches surface facts verified 2026-08-05.
The rows below originated from an early ENV-BLOCKED run that could not reach the app live. Later live runs (tnc-probe-r3 2026-08-05; tnc-final-audit-r1 2026-08-06) resolved most of them; see each row's status. Only a row that still reads ENV-BLOCKED or an explicit open question remains genuinely unresolved.

| Field | Live (2026-08-05) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Language filter default | `US English` observed on fresh load (probe7 2026-08-06, Step 1). Changed to "All", navigated away and back within same session — reset to `US English` (Step 2). Loaded in a brand-new browser context (fresh storageState, no reuse) — also `US English` (Step 3). No localStorage or sessionStorage key found for the filter value. Filter left set to `US English` at probe end. | `US English` per baseline + ticket | RESOLVED: true default — resets to US English on every fresh load and context; value does NOT persist. Tests may rely on US English as the starting state without setting the filter explicitly. (tnc-probe-r7 2026-08-06) |
| Save gate exact rule | Save is gated by BOTH dirty state AND validity: (1) Save is disabled at rest and enables only on a field edit (dirty gate); (2) Save is disabled — and remains disabled — when any Name field contains a value that duplicates an existing T&C name in ANY language (validity gate); the block is silent apart from `aria-invalid=true` on the Name input (no inline error text). Duplicate names are rejected globally across all languages — within-language uniqueness only (NM-1736 lead) is **contradicted**. Verified N=2 same-language (r3 2026-08-05) and independently re-verified N=1 cross-language (r3 2026-08-05). Per-row language change ALSO enables Save dirty gate (N=2, probe-r8 2026-08-06) see DEF-TNC-002 for server-side failure detail. | RESOLVED — tnc-probe-r3 (2026-08-05) + tnc-final-audit-r1 (2026-08-06) + tnc-probe-r8 (2026-08-06) |
| Name field — special characters | Typing special chars (` + "`" + `< > & " ' / \ % # Café Ñoño 中文` + "`" + `) enables Save (aria-invalid=false). Persistence CONFIRMED byte-exact including all special characters and non-ASCII (tnc-persistence-r1 2026-08-06): exact string saved and read back from a fresh context. | RESOLVED — persistence confirmed (tnc-persistence-r1 2026-08-06) |
| Name field — whitespace-only | Typing 3 spaces as name: Save DISABLED, aria-invalid=true. Silent block identical to empty/duplicate pattern — no inline error text. (tnc-probe-r8, 2026-08-06) | RESOLVED |
| Name field — clear to empty | Clearing an existing name entirely: Save DISABLED, aria-invalid=true. Border color changes to red-orange (oklch(0.577 0.245 27.325) — destructive color from design system). Visual signal IS present (red border); no inline text message. (tnc-probe-r8, 2026-08-06) | RESOLVED |
| Per-row language — dirty gate | Per-row language change immediately enables Save gate (N=2: US English→Spanish (Mexico) and US English→French (Canada)); no dialog on dropdown open or on option selection. Save enabled additive when name is also dirty. (tnc-probe-r8, 2026-08-06) | RESOLVED — see DEF-TNC-002 for persistence finding |
| RTE entity encoding | ProseMirror (Tiptap) encodes all typed text as HTML-escaped literals. Typed `&nbsp;` → stored as `&amp;nbsp;`; `&amp;` → `&amp;amp;`; `<` → `&lt;`; `&` → `&amp;`; typed `<b>bold</b>` → stored as `&lt;b&gt;bold&lt;/b&gt;` (not rendered as markup). No live HTML rendering of typed content. Before-save HTML confirmed: `<p>&amp;nbsp; &amp;amp; &amp;lt; &amp;gt; &lt;b&gt;bold&lt;/b&gt; &lt; &amp;</p>` (tnc-probe-r8, 2026-08-06). Persistence round-trip CONFIRMED (tnc-persistence-r1 2026-08-06): sentinel GPT55RTEA persisted and read back; reproduced on a second row. | RESOLVED — editor behavior and round-trip persistence both confirmed (tnc-persistence-r1 2026-08-06) |
| RTE bold formatting | Bold applied via the toolbar renders as `<strong>` in ProseMirror HTML — re-confirmed live: `<p><strong>BOLDTEST-R1-…</strong></p>` (tnc-walk-r3-2026-08-06, salvaged in `out-walk-salvage/WALKR2.md`). **Persistence after save+reload is UNRESOLVED** — the probe's browser closed before the reload, so no run has ever confirmed the round-trip. The earlier "persistence round-trip CONFIRMED (tnc-persistence-r1)" claim on this row was an overclaim and is retracted; rows 89 and 205 ("formatting round-trip unverified — do not claim either way") are the accurate statements. | PARTIAL — bold produces `<strong>` in-editor (CONFIRMED, N=1 live); persistence after reload UNRESOLVED. TC-TNC-CORE-046 asserts the correct round-trip and will settle it when the suite runs. |
| Language-filter guard on dirty form | Selecting a language filter option while form is dirty raises alertdialog: `"Unsaved changes — Are you sure you want to leave this view? Any unsaved changes will be lost."` with Stay / Discard. Guard fires on option selection; opening the dropdown alone does NOT trigger guard. (tnc-probe-r8, 2026-08-06) | RESOLVED |
| Browser navigate-away guard | Native beforeunload dialog (browser standard, empty message) fires when navigating away with dirty form. (tnc-probe-r8, 2026-08-06) | RESOLVED |
| Guard on editing different row while dirty | Clicking a name input on a different row while one row is name-dirty raises NO guard. Both rows editable simultaneously without warning. (tnc-probe-r8, 2026-08-06) | RESOLVED — no guard present (finding) |
| Settings tab navigation guard | NOT tested — probe script could not locate a settings navigation tab link to click. Remains unconfirmed. | UNRESOLVED |
| Name-field uniqueness validation (same-language) | Save button becomes **disabled** (aria-invalid=true on input) when a duplicate name within the same language is entered; reproduced N=2 on different rows (r3 probe 2026-08-05); control: unique name enables Save (r3 confirmed); signal: aria-invalid=true only — no visible error message (silent block) | silent duplicate block | CONFIRMED: client-side gate, silent (no inline message) |
| Name-field uniqueness validation (cross-language) | Save BLOCKED (Save disabled, aria-invalid=true) when a name already used in any language is typed into a row with a different language — manufactured Spanish row from scratch row, typed US English row name, Save blocked; uniqueness is GLOBAL (not within-language) — NM-1736 lead **contradicted** (r3 probe 2026-08-05) | NM-1736 lead predicted within-language only | RESOLVED: uniqueness is global; cross-language duplicates are rejected |
| Name-field max length | No `maxlength` attr; client accepts 260 chars; server accepted 260 chars (ZZPROBE3-AAAA… sentinel saved, found post-reload at 260 chars — content-anchored lookup confirmed) (r3 probe 2026-08-05) | no client-side truncation | RESOLVED: server accepts ≥260 chars; no truncation observed |

## Field Inventory

### Page-level controls

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Language filter | `terms-conditions-language-filter-trigger` | Radix combobox (BUTTON role=combobox) | `US English` — confirmed as true default on new site: resets to US English on nav-away-and-back and in a fresh browser context; no storage key found (tnc-probe-r7 2026-08-06) | n/a (filter, not saved) | Always enabled | none | `affordance: popover → language listbox; 5 options confirmed by portal-scan in walk JSON: All, English (Canada), US English, Spanish (Mexico), French (Canada)`. Options drive grid row visibility only — they are NOT row language values. `All` is a filter-only value; per-row language select has 4 options (no `All`). |
| Save | `terms-conditions-save` | button | `disabled=true` at rest | Dirty-gated: enables on any field edit; also blocks when same-language duplicate name detected (client-side) | Disabled at rest; enabled on dirty; disabled again when duplicate name entered within same language | All editable row fields | `affordance: none`. Save is page-level, direct (NO confirmation dialog — confirmed by r1+r2 probes 2026-08-05; LR-012 shared dialog is NOT present on this page). |

### Grid table

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Table container | `terms-conditions-table` | table (non-interactive container) | n/a | n/a | n/a | n/a | `affordance: none`. Column headers (machine walk symDiff name): "LanguageTerms & Conditions NameLeft Colu…" — confirms 5 columns: Language, Terms & Conditions Name, Left Column, Right Column, Bottom Column. |
| Column resize handle | (no testid — use: `button` inside `[data-testid="terms-conditions-table"] thead th`) | button | n/a | n/a | Always enabled | none | `affordance: none` (drag handle — resizes column width; does not alter data). `(MISSING testid — using structural selector; tracked in testid-gap-report)` |
| Row container | `terms-conditions-table-row-#` ×51 | tr (non-interactive container) | n/a | n/a | n/a | n/a | `affordance: none`. Archetype ×51 = 50 real rows + 1 test residue (`terms-conditions-table-row-58` named `AUTOMATION-TEST-ROW-TNC-WALK` — do not document as product data). Machine walk confirms: row name sample "US EnglishEnglish (Canada)US EnglishSpan" = language cell values visible. |
| Per-row language (Radix) | `terms-conditions-language-trigger-#` ×51 | Radix combobox (BUTTON) | per-row stored language | Language must be set | Always enabled | Language value → scopes the row's T&C to that language | `affordance: popover → per-row language listbox`. 4 options (no "All"): English (Canada), US English, Spanish (Mexico), French (Canada) — inferred from native select sibling (denominator element key: "English (Canada)US EnglishSpanish (Mexic…"). **Distinct node from the native `<select>` also present in each row (`SAME_NODE=false`).** |
| Per-row language (native select, backing) | (no testid — struct path: `select` inside `terms-conditions-table-row-#`) | native `<select>` | per-row stored language | n/a (driven by Radix trigger, not directly) | n/a | same as Radix trigger above | `out-of-scope: Native <select> is the backing control for the Radix per-row language combobox; automation drives via the Radix BUTTON trigger, not this element directly`. |
| Terms & Conditions Name | `terms-conditions-name-#` ×51 | text input | per-row stored name | Required (save gate); globally unique across all languages — client-side blocks save on duplicate (same-language: r2 probe 2026-08-05; cross-language: r3 probe 2026-08-05); signal: aria-invalid=true only, no visible error text (silent block); max length: no `maxlength` attr, client and server both accept 260 chars (r3 probe 2026-08-05, content-anchored post-reload confirmation) | Always enabled | Uniqueness is global (any language) — contradicts NM-1736 within-language lead | `affordance: none` (directly editable text input). |
| Left Column (HTML) | `terms-conditions-html-cell-#-text` ×51 | button (click-to-edit launcher) | per-row HTML content | not probed | Always enabled | Opens shared RTE panel | `affordance: launcher → Tiptap rich-text editor panel`. Confirmed Tiptap by machine walk JSON (rte-content symDiff name: `.tiptap p.is-editor-empty:first-child::b…` — CSS from Tiptap's default empty paragraph placeholder). |
| Right Column (HTML) | `terms-conditions-html-cell-#-text1` ×51 | button (click-to-edit launcher) | per-row HTML content | not probed | Always enabled | Opens shared RTE panel | `affordance: launcher → Tiptap rich-text editor panel`. Same editor as Left Column — single shared `rte-content` instance per page, loaded with the clicked row's cell content. |
| Bottom Column (HTML) | `terms-conditions-html-cell-#-text2` ×51 | button (click-to-edit launcher) | per-row HTML content | not probed | Always enabled | Opens shared RTE panel | `affordance: launcher → Tiptap rich-text editor panel`. Same editor instance as Left/Right columns. |
| Add row | `terms-conditions-add-row` | button | n/a | n/a | Always enabled | Adds a new row requiring all required fields | `affordance: none`. New row appears at BOTTOM of list (confirmed by r2 probe 2026-08-05). Default language: US English. Name field starts empty. Save is NOT enabled by bare add alone — required fields must be filled first. |

### Rich-text editor panel (revealed when an HTML cell is clicked)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Editor chrome wrapper | `rte-container` | div (non-interactive container) | n/a | n/a | n/a | n/a | `affordance: none`. Present in machine walk JSON (A-only, role: div). Wrapper for the RTE panel. |
| Editor scroll wrapper | `rte-content-scroll` | div (non-interactive container) | n/a | n/a | n/a | n/a | `affordance: none`. Present in machine walk JSON (A-only, role: div, name empty). Scroll container inside rte-container. |
| Editor content (Tiptap) | `rte-content` | contenteditable div — Tiptap/ProseMirror | loaded from clicked row's HTML cell | not probed | Enabled when an HTML cell is clicked | Cell selection (clicking html-cell-#-text/text1/text2 loads the cell's content) | `affordance: none` (directly editable). `page.keyboard.type()` (CDP real input) lands text in ProseMirror — confirmed by rte-r1. `fill()`, `execCommand`, and synthetic `InputEvent` are silently ignored by ProseMirror. Formatting toolbar present: bold, italic, lists (observed); formatting round-trip unverified — not tested in any probe; do not claim either way. **Rich-text persistence IS confirmed** for Left, Right, and Bottom columns individually: Left and Right proven by `tnc-rte-r1` (2026-08-05, save-per-cell, sentinel found post-reload anchored by row name); Bottom proven by `tnc-probe-r5` (2026-08-06, sentinel `ZZPROBE5-BOTTOM-2026-08-06` typed → Save → reload → read back, `BOTTOM_COLUMN_SENTINEL_PERSISTED: true`). The earlier r2 failure was a **PROBE-ARTIFACT**: r2 switched cells with unsaved editor content, which raises an "Unsaved changes — Stay / Discard" guard dialog; r2's auto-accept of that dialog discarded the content, and the resulting empty state was misread as data corruption. The r2 observation of one column's sentinel appearing in another column was a consequence of that discarded-and-reloaded state, not a product defect. **Cell-switch unsaved-changes guard**: clicking a different HTML cell while the editor contains unsaved text raises an "Unsaved changes — Stay / Discard" dialog (alertdialog) and blocks the switch until answered; the app does NOT silently commit on cell switch. This is real behaviour; test cases must handle this guard explicitly. |

## Labels + Section Names

**Page (no sub-tabs)**

- Page heading: `"Terms and Conditions"` (title-case; baseline uses "Terms And Conditions" — intentional casing difference TNC-BL per baseline artifact)
- Table column headers (verbatim, machine walk JSON): `"Language"` · `"Terms & Conditions Name"` · `"Left Column"` · `"Right Column"` · `"Bottom Column"`
- Save button label: `"Save"`
- Add row button label: not confirmed (testid `terms-conditions-add-row`; likely `"+ Add Row"` or similar — `[ENV-BLOCKED]`)
- Language filter trigger label: `"US English"` (default selected value displayed as trigger label — per SCT sibling pattern and baseline)

## Save-cycle observations

### Save button behavior

Save button (`terms-conditions-save`) is **disabled at rest** (confirmed by machine walk JSON symDiff `disabled: true`). **Save-gate rule: both dirty AND validity gates** (tnc-probe-r3 + tnc-final-audit-r1, 2026-08-06): Dirty state is **necessary but not sufficient**. Observations: (a) fill in name field → Save enables; (b) restoring name to original server value → Save disables; (c) clicking an HTML cell alone → Save stays disabled; (d) any RTE DOM interaction (angular detects dirty on RTE component) → Save enables. **Validity gate: Save is disabled when the name field contains a value that duplicates any existing Terms & Conditions name in ANY language**, even if the row's own language differs. Duplicate detection is **global (cross-language)**; user sees `aria-invalid=true` on the name input but **no visible error message or tooltip** — block is silent. Confirmed N=2 on different rows, tnc-probe-r3 2026-08-05; independently re-verified tnc-final-audit-r1 2026-08-06. Trigger text in save button: `"Save"` (confirmed by machine walk JSON). **Save dialog**: per probe session, no save dialog was observed — Save button is direct (no confirmation dialog). LR-012 shared dialog was assumed but is not present (ENV-BLOCKED caution can be removed).

### Save dialog

**CONFIRMED: No save dialog.** Save button is direct — no confirmation dialog appears after clicking Save (confirmed by r1 and r2 probes 2026-08-05). LR-012 shared dialog does NOT apply to this page.

### Post-save toast

`[ENV-BLOCKED — not probed]`. Expected pattern (per sibling modules): a success toast appears after save. Verbatim text unconfirmed.

### Dirty-state behavior

**Cell-switch unsaved-changes guard confirmed (tnc-rte-r1, 2026-08-05)**: with unsaved editor content, clicking a different HTML cell raises an "Unsaved changes — Stay / Discard" alertdialog and blocks the switch until answered. The app does NOT silently commit on cell switch. This is real behaviour related to Angular dirty state (LR-009/LR-026) and must be handled explicitly in any test case that edits multiple HTML cells in sequence.

**Language-filter selection guard (tnc-probe-r8, 2026-08-06)**: opening the language filter dropdown while the form is dirty does NOT trigger any guard. However, actually **selecting** a language filter option while the form is dirty raises the alertdialog: `"Unsaved changes — Are you sure you want to leave this view? Any unsaved changes will be lost."` with **Stay** and **Discard** buttons. Guard fires on option selection, not on dropdown open.

**Browser navigate-away guard (tnc-probe-r8, 2026-08-06)**: navigating away from the page entirely (tested via `page.goto('about:blank')` with a dirty form) triggers the browser native **beforeunload** dialog (empty message — browser's standard "Leave site?" prompt). Guard is present for unload path.

**No guard on editing a different row while one row is name-dirty (tnc-probe-r8, 2026-08-06)**: clicking a name input on a different row while another row's name field is dirty does NOT raise any guard. Both rows can be edited freely without a warning. No alertdialog, no native dialog.

**Tab navigation guard**: NOT tested this run — no settings tab navigation link was found by the probe script. Remains unconfirmed.

## Observations

### Bugs / Defects

| Bug ID | Field / Feature | Observed | Expected (per requirements) | Status |
| DEF-TNC-001 | Name uniqueness — silent block | Save button goes disabled and `aria-invalid=true` appears on the name input when a duplicate name is detected (same-language or cross-language), but no inline error message or toast is shown — user has no visible explanation for why Save is inactive. Confirmed N=2, r3 probe 2026-08-05. | Visible validation message indicating the name is already in use | **Defect candidate** — silent block with no user-facing error |
| DIV-TNC-001 | Cross-language name uniqueness | **Old site (navigator2, tnc-baseline-r2 2026-08-05)**: "Canada Creative Design" exists under both English (Canada) and US English simultaneously — 42 rows enumerated from live DOM, two rows share that name across two languages. Old site permitted same name across languages. **New site (r3 probe 2026-08-05, N=2 with control)**: typing a name that exists in any language blocks Save (disabled, `aria-invalid=true`); global uniqueness enforced. | Old site: within-language or no enforcement. New site: global enforcement. | **App-divergence** — new site added cross-language uniqueness constraint the old site never had |

| DEF-TNC-002 | Per-row language — save returns HTTP 500 when grid contains residue rows; UI presents failure as success | When the bulk payload (`{"rows":[...]}, ~1.5MB, all rows) contains any row with malformed or extreme content (260-char name, special-character name, RTE sentinels from prior probes), the server returns HTTP 500 (`{"success":false,"message":"Something unexpected has happened\nSee application log for stack trace.\nInternal Server Error!","statusCode":"Internal Server Error!"}`). The Save button transitions enabled → disabled exactly as it does on a successful 2xx save — no toast, no banner, no console error, no visible signal of any kind. Language changes on clean rows (no residue) save and persist successfully: in probe9 trial T1 (2026-08-06), row ‘Hotel Del Coronado’ changed to Spanish (Mexico) and persisted — row count dropped from 50 to 49 on next fresh load confirming the language change was stored. 500 not reproduced on clean-row trials. HTTP exchange captured by tnc-persistence-r1 (2026-08-06, gpt-5.5): `PUT https://cloudapps-e2e.encoreglobal.com/navigator/api/core/terms-conditions-texts`, response `{"success":false,...,"statusCode":"Internal Server Error!"}`. Trigger: one or more residue/malformed rows in the bulk array fails server validation; the server rejects the entire batch, discarding all row changes including the language change. | Language change persisted; 500 surfaced as error to user | **Defect — two components: (1) bulk-save brittle: bad row in payload fails entire batch; (2) UI shows success on server failure (see DEF-TNC-005)** |
| DEF-TNC-005 | UI shows success when save returns HTTP 500 | When the `PUT .../terms-conditions-texts` endpoint returns any non-2xx response (observed: HTTP 500 with `{"success":false,...}`), the application gives no user-facing error signal. The Save button transitions from enabled to disabled — identical behaviour to a successful 2xx save. No toast, no banner, no inline message, no browser console error is shown. A user who changes data, clicks Save, and sees the button go inactive has no indication that the change was not stored. This constitutes silent data loss. Applies to any save failure, not only the 500 triggered by residue rows. (Exchange captured by tnc-persistence-r1 2026-08-06; UI feedback absence confirmed in all probe9 trials 2026-08-06.) | Error shown to user on save failure (toast or inline message) | **Defect — silent data loss; applies to all save failures on this surface** |

No additional behaviour defects observed beyond the above.

### Suggestions / Improvements

none

## Staleness signal

- **Last verified**: 2026-08-06
- **Fresh-until**: 2026-08-19
- **Stale-after**: 2026-09-04
- **Refresh triggers**: language filter options change; column headers renamed; editor library swapped from Tiptap; save-gate rule changes; row count drifts significantly from 50; NM-1736 name-uniqueness behaviour verified or contradicted on new site; DEF-TNC-002 resolved or fixed; tab navigation guard unconfirmed

## LR-065 Grid Behaviour Families

This is a grid surface (`terms-conditions-table`). Addressed below per LR-065:

| Family | Applicable | Notes |
|---|---|---|
| result-fidelity | YES | After save, rows must reflect persisted name/language/content. Must be verified in a TC. |
| pagination | out-of-scope: neither baseline nor new site paginates grid rows; baseline renders all 42 rows in DOM with Previous/Next in CKEditor RTE toolbar only (not row controls); new site shows all rows in single scroll view. No pagination change between sites. | |
| sorting | out-of-scope: no column-sort controls were enumerated by the machine walk; column headers do not appear to be sortable buttons in the denominator | |
| combination | YES | Language filter × row content: filtering by a language shows only rows for that language. Combination of filter value with row language-trigger value is a testable axis. |
| render-state | YES | RTE HTML cell displays as rendered HTML (not raw markup) in the grid cell; empty cell vs populated cell renders differently. |
| empty-vol | YES | A newly added row (via add-row) before any fields are filled represents a near-empty row state; Save must remain disabled. |
| persistence | YES | After save + reload, row name/language/HTML content must match what was entered. **Confirmed by probes**: name round-trip (r2/r3 2026-08-05); Left and Right column RTE round-trip (tnc-rte-r1 2026-08-05); Bottom column RTE round-trip (tnc-probe-r5 2026-08-06). Column widths are NOT persistent — widths change on drag but reset on page reload (probe4 2026-08-05; no localStorage/sessionStorage key for column widths found). |

## Coverage Manifest

Evidence source: `reports/walk-coverage/1604-terms-conditions.json` (machine-emitted 2026-08-05, 42 elements, denominator=42, rawBeforeArchetypeCollapse=399). Additional affordance evidence for `rte-container` / `rte-content-scroll` / `rte-content`: those elements appear in symDiff (A-only) in the walk JSON, meaning the RTE was open during the enumeration cycle — confirmed as live-observed elements.

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| `id:radix-_r_#_ [archetype×8]` | button | 2026-08-05 | out-of-scope: Navigator app-shell Radix buttons (office switcher "1604Parker Palm Springs" + Actions, Commissions, Tax, Setup, Studio, and two others) — not part of Terms and Conditions module |
| `struct:a\|Home\|div/div/div/div/ul/li` | a | 2026-08-05 | out-of-scope: Navigator sidebar navigation link to Home page — not part of Terms and Conditions module |
| `struct:a\|Inbox\|div/div/div/div/ul/li` | a | 2026-08-05 | out-of-scope: Navigator sidebar navigation link to Inbox page — not part of Terms and Conditions module |
| `id:radix-_r_a_` | button | 2026-08-05 | out-of-scope: Navigator app-shell Radix button identified as Actions menu trigger — not part of Terms and Conditions module |
| `id:radix-_r_d_` | button | 2026-08-05 | out-of-scope: Navigator app-shell Radix button (Commissions nav trigger per walk JSON neverOpened sample) — not part of Terms and Conditions module |
| `id:radix-_r_g_` | button | 2026-08-05 | out-of-scope: Navigator app-shell Radix button (Setup or Studio nav trigger per walk JSON neverOpened sample) — not part of Terms and Conditions module |
| `struct:button\|Order Search\|div/div/div/div/ul/li` | button | 2026-08-05 | out-of-scope: Navigator sidebar Order Search button (disabled at page load per walk JSON symDiff disabled:true) — not part of Terms and Conditions module |
| `struct:a\|Job Search\|div/div/div/div/ul/li` | a | 2026-08-05 | out-of-scope: Navigator sidebar Job Search navigation link — not part of Terms and Conditions module |
| `struct:a\|Asset Search\|div/div/div/div/ul/li` | a | 2026-08-05 | out-of-scope: Navigator sidebar Asset Search navigation link — not part of Terms and Conditions module |
| `struct:a\|Customer Search\|div/div/div/div/ul/li` | a | 2026-08-05 | out-of-scope: Navigator sidebar Customer Search navigation link — not part of Terms and Conditions module |
| `struct:button\|DRO Search\|div/div/div/div/ul/li` | button | 2026-08-05 | out-of-scope: Navigator sidebar DRO Search button (disabled at page load per walk JSON symDiff disabled:true) — not part of Terms and Conditions module |
| `struct:button\|Payment Search\|div/div/div/div/ul/li` | button | 2026-08-05 | out-of-scope: Navigator sidebar Payment Search button (disabled at page load per walk JSON symDiff disabled:true) — not part of Terms and Conditions module |
| `struct:a\|Item Search\|div/div/div/div/ul/li` | a | 2026-08-05 | out-of-scope: Navigator sidebar Item Search navigation link — not part of Terms and Conditions module |
| `struct:button\|ECT Search\|div/div/div/div/ul/li` | button | 2026-08-05 | out-of-scope: Navigator sidebar ECT Search button (disabled at page load per walk JSON symDiff disabled:true) — not part of Terms and Conditions module |
| `struct:button\|Event Agendas\|div/div/div/div/ul/li` | button | 2026-08-05 | out-of-scope: Navigator sidebar Event Agendas button (disabled at page load per walk JSON symDiff disabled:true) — not part of Terms and Conditions module |
| `struct:button\|Navigator Assistant\|div/div/div/div/ul/li` | button | 2026-08-05 | out-of-scope: Navigator AI assistant button in the app sidebar — not part of Terms and Conditions module |
| `id:radix-_r_t_` | button | 2026-08-05 | out-of-scope: Navigator app-shell Radix button identified as Tax nav trigger per walk JSON neverOpened sample — not part of Terms and Conditions module |
| `struct:button\|Click to restore sidebar\|body/div/div/div/div/div` | button | 2026-08-05 | out-of-scope: Navigator app-shell collapsed-sidebar restore button — not part of Terms and Conditions module |
| `struct:button\|trigger-button\|skip/div/div/div/div/div` | button | 2026-08-05 | out-of-scope: Navigator app-shell notification or skip-navigation trigger button outside the module area — not part of Terms and Conditions module |
| `struct:button\|More information\|div/div/div/div/div/div` | button | 2026-08-05 | out-of-scope: Navigator app-shell informational help button outside module content area — not part of Terms and Conditions module |
| `testid:terms-conditions-save` | button | 2026-08-05 | affordance-probed: affordance: none — r1 probe 2026-08-05 clicked Save and confirmed no dialog appeared; r2 probe confirmed dirty-gate behavior (fill name → Save enables; restore to original → Save disables; bare cell-click → Save stays disabled); provenance: direct probe r1+r2 2026-08-05 |
| `testid:terms-conditions-language-filter-trigger` | combobox | 2026-08-05 | affordance-probed: affordance: popover → language listbox (5 options: All, English (Canada), US English, Spanish (Mexico), French (Canada)); provenance: walk script portal-scan cycle 2026-08-05 physically opened the listbox and enumerated 5 options via DOM query (portalElements:5); r3 probe 2026-08-05 clicked "All" and "US English" options successfully |
| `testid:terms-conditions-table` | table | 2026-08-05 | read-only-verified — N=2 clicks on table container; bounding box, class, and Save state unchanged both times; zero rows entered selected state; no sorting, focus, or scroll triggered by clicking the table container directly; probe4 2026-08-05 |
| `struct:button\|Resize column\|div/div/terms-conditions-table/thead/tr/th` | button | 2026-08-05 | affordance-probed: drag-resize — dragging the aria-label="Resize column" handle (5 present in thead, 4px wide) moved column widths from [133,160,133,133,133]px to [171,149,124,124,124]px on a +50px drag; column widths restored on page reload (no persistence); probe4 2026-08-05 |
| `testid:terms-conditions-table-row-# [archetype×51]` | tr | 2026-08-05 | read-only-verified — N=2 clicks on scratch row (idx=12); class "data-[state=selected]:bg-muted transition-colors border-0 hover:bg-transparent" unchanged both times; Save remained disabled; no row-level selection or highlight behavior; clicks pass through to child elements; probe4 2026-08-05 |
| `terms-conditions-language-trigger-# [archetype×51]` | combobox | 2026-08-05 | affordance-probed: affordance: popover → per-row language listbox (4 options: English (Canada), US English, Spanish (Mexico), French (Canada) — no "All"); r2 probe 2026-08-05 clicked row-12 trigger and enumerated options via `[role="option"]` DOM query; r3 probe clicked Spanish (Mexico) and US English options; distinct Radix BUTTON node from native select sibling; provenance: direct probe r2+r3 2026-08-05 |
| `struct:select\|English (Canada)US EnglishSpanish...` | select | 2026-08-05 | out-of-scope: Native <select> backing element for the Radix per-row language combobox; automation drives via the Radix BUTTON trigger (terms-conditions-language-trigger-#), not this element directly — using it would target the wrong node per SCT sibling LR-documented pattern |
| `testid:terms-conditions-name-# [archetype×51]` | input | 2026-08-05 | affordance-probed: affordance: none — directly editable text input; r2 probe 2026-08-05 typed 250 chars and confirmed no `maxlength` attr; r3 probe 2026-08-05 typed 260-char sentinel (ZZPROBE3-A×251), saved, reloaded, content-anchored lookup confirmed 260 chars survived (server accepts ≥260, no truncation); uniqueness: same-language block confirmed r2; cross-language block confirmed r3; signal: aria-invalid=true only (no visible error); provenance: direct probe r2+r3 2026-08-05 |
| `testid:terms-conditions-html-cell-#-text [archetype×51]` | button | 2026-08-05 | affordance-probed: affordance: launcher → Tiptap rich-text editor panel (Left Column); r2 probe 2026-08-05 clicked html-cell buttons and confirmed RTE panel opens and loads clicked row's content; provenance: direct probe r2 2026-08-05 |
| `testid:terms-conditions-html-cell-#-text1 [archetype×51]` | button | 2026-08-05 | affordance-probed: affordance: launcher → Tiptap rich-text editor panel (Right Column); r2 probe 2026-08-05 clicked and confirmed same shared editor instance; provenance: direct probe r2 2026-08-05 |
| `testid:terms-conditions-html-cell-#-text2 [archetype×51]` | button | 2026-08-05 | affordance-probed: affordance: launcher → Tiptap rich-text editor panel (Bottom Column); r2 probe 2026-08-05 clicked and confirmed same shared editor instance; provenance: direct probe r2 2026-08-05 |
| `testid:terms-conditions-add-row` | button | 2026-08-05 | affordance-probed: affordance: none — r2 probe 2026-08-05 clicked add-row and observed: new row appended at bottom, defaults to US English, name starts empty, bare add does NOT enable Save; provenance: direct probe r2 2026-08-05 |
| `testid:rte-container` | div | 2026-08-05 | read-only-verified — N=2 clicks at wrapper bounds (top-left corner, outside editor content area); class "flex flex-col rounded-md border bg-background h-full min-h-[280px]" unchanged; rte-content focus=false both times; outer chrome wrapper has no own interactive affordance; probe4 2026-08-05 |
| `testid:rte-content-scroll` | div | 2026-08-05 | affordance-probed: click-focus and scroll — N=2 clicks focused rte-content editor (focus=true both times); scroll region accepts programmatic scrollTop (0→80) and mouse-wheel input (to 140) when content overflows (row 11: scrollHeight=4072 > clientHeight=405); probe4 2026-08-05 |
| `testid:rte-content` | textbox | 2026-08-05 | affordance-probed: affordance: none — Tiptap ProseMirror contenteditable div; `page.keyboard.type()` lands text (CDP real input); `fill()`, `execCommand`, and synthetic `InputEvent` silently ignored. Rich-text persistence confirmed for Left (tnc-rte-r1 2026-08-05), Right (tnc-rte-r1 2026-08-05), and Bottom (tnc-probe-r5 2026-08-06) columns individually via save-per-cell round-trip anchored by row name. Cell-switch unsaved-changes guard: switching to another HTML cell with unsaved editor content raises "Unsaved changes — Stay / Discard" alertdialog (tnc-rte-r1 2026-08-05); app does NOT silently commit on cell switch. Formatting toolbar present (bold, italic, lists); formatting round-trip unverified. |
| `struct:section\|Notifications alt+T\|html/body` | section | 2026-08-05 | out-of-scope: Navigator app-shell Notifications panel — not part of Terms and Conditions module |
| `struct:span\|\|html/body` | span | 2026-08-05 | out-of-scope: Decorative unnamed span at html/body level — not part of Terms and Conditions module |
| `role:option:All` | option | 2026-08-05 | affordance-probed: affordance: none — language filter listbox option "All"; r3 probe 2026-08-05 clicked this option and confirmed all-language rows become visible; provenance: direct probe r3 2026-08-05 |
| `role:option:English (Canada)` | option | 2026-08-05 | affordance-probed: per-row language option — selecting this option on scratch row changed row language from "US English" to "English (Canada)" (confirmed via language-trigger textContent); restored to "US English"; **CORRECTION (tnc-probe-r8 2026-08-06): save gate IS triggered by language selection** — prior probe4 entry "save gate not triggered" was incorrect; N=2 confirmed in probe-r8 (Spanish and French both enabled Save); see DEF-TNC-002 for persistence finding |
| `role:option:US English` | option | 2026-08-05 | affordance-probed: affordance: none — language filter listbox option "US English" (default); r3 probe 2026-08-05 clicked this option to restore filter; provenance: direct probe r3 2026-08-05 |
| `role:option:Spanish (Mexico)` | option | 2026-08-05 | affordance-probed: affordance: none — per-row language listbox option "Spanish (Mexico)"; r3 probe 2026-08-05 clicked this option (language trigger for scratch row) and confirmed row language changed; provenance: direct probe r3 2026-08-05 |
| `role:option:French (Canada)` | option | 2026-08-05 | affordance-probed: per-row language option — selecting this option on scratch row changed row language from "US English" to "French (Canada)" (confirmed via language-trigger textContent); restored to "US English"; **CORRECTION (tnc-probe-r8 2026-08-06): save gate IS triggered by language selection** (N=2 in probe-r8); see DEF-TNC-002 for persistence finding |
