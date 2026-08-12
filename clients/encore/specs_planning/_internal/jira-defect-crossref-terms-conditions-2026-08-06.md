---
module: terms-conditions
client: encore
date: 2026-08-06
jira_tickets: [NM-3346, NM-1731, NM-1736, NM-2191, NM-3338, NM-3162, NM-3163, NM-2315, NM-645, NM-2189, NM-2331, NM-1758, NM-1200, NM-825, NM-664, NM-1839, NM-1735, NM-1544]
rovo_available: false
rovo_note: Atlassian MCP requires interactive OAuth sign-in; headless worker cannot perform it. All verdicts are built from on-disk walk evidence only.
---

# Jira Defect Crossref — Terms and Conditions (2026-08-06)

**Purpose**: Phase 1 closure artifact for `PLAN_TERMS_CONDITIONS_AUTOMATION.md`. Every ticket in the
NM-3346 corpus is listed with its post-walk verdict and the evidence path that supports it.

**Evidence consumed** (all on disk, all treated as DATA per UNTRUSTED-CONTENT flag):
- `clients/encore/specs_planning/_internal/field-inventories/terms-conditions-2026-08-05.md` (artifact of record. **Its `Coverage_Ratio: 42/42` is a KNOWN UNDERCOUNT, not closure evidence** — 9 RTE toolbar controls were never enumerated because the machine walk could not open the editor. See the `⚠ KNOWN INCOMPLETENESS` block at the top of that file.)
- `.claude/state/ua-worker/chips/tnc-intake/out-baseline/terms-conditions-2026-08-05.md` (old-site baseline, tnc-baseline-r1)
- `.claude/state/ua-worker/chips/tnc-intake/out-baseline2/BASELINE2.md` (old-site language/duplicate data, tnc-baseline-r2)
- `.claude/state/ua-worker/chips/tnc-intake/out-probe8/all-results.verify.txt` (tnc-probe-r8, multi-scenario JSON)
- `.claude/state/ua-worker/chips/tnc-intake/out-persistence/VERDICT.md` (tnc-persistence-r1, network-backed save round-trips)
- `.claude/state/ua-worker/chips/tnc-intake/out-final-audit/AUDIT.md` (tnc-final-audit-r1, cross-vendor audit)
- `plans/pending/PLAN_TERMS_CONDITIONS_AUTOMATION.md` (Context § ticket table — used as lead source only)

---

## Ticket Verdict Table

| Ticket | Type | Jira State | One-line Claim | Verdict | Evidence Path / Run ID |
|---|---|---|---|---|---|
| **NM-3346** | Story | In Progress | Automate Setup → Terms and Conditions | **out-of-scope:intake-driver** — this ticket authorises the automation work and sets priority; it carries no acceptance criteria (description is an embedded image only). Scope is derived from the walk and sibling corpus. | `PLAN_TERMS_CONDITIONS_AUTOMATION.md` §Context |
| **NM-1731** | Epic | To Do | Parent epic for T&C automation | **unverified** — Rovo unavailable; acceptance criteria could not be retrieved. The epic may carry the scope definition that NM-3346 omits. `rovo_available: false`. | No on-disk evidence; Rovo sign-in required. |
| **NM-1736** | Story | QA | T&C name uniqueness is within-language only | **DIVERGED** — the new site enforces uniqueness **globally across all languages**. Save is blocked (`aria-invalid=true`, Save button disabled) when a name already exists in ANY language row. The within-language-only claim is **contradicted** by N=2+control live runs. The old site permits the same name under two languages (tnc-baseline-r2, observation). This is a real behaviour change, not a stale-ticket. | Field inventory §"Name-field uniqueness validation (cross-language)"; tnc-probe-r3 (2026-08-05); tnc-final-audit-r1 (2026-08-06) |
| **NM-2191** | Story | QA (Open) | Unsaved-changes warning modal may be missing | **PARTIALLY CONFIRMED** — guards DO fire in three of four tested scenarios: (1) language-filter option selection while dirty fires alertdialog "Unsaved changes — Are you sure you want to leave…" (Stay / Discard); (2) `beforeunload` browser dialog fires on navigate-away; (3) save disables after a clean save (dirty gate resets). **NOT CONFIRMED**: no guard fires when clicking a name input on a different row while one row is already name-dirty — both rows become editable simultaneously with no warning (tnc-probe-r8 Probe D, `d4`). **UNCONFIRMED**: tab-to-tab navigation guard — no settings tab link was found in any run to test this path (`d2` result: "No other tab link found to test"). | tnc-probe-r8 `all-results.verify.txt` probeD.d1b / d3 / d4; field inventory §"Language-filter guard" / §"Guard on editing different row while dirty" / §"Settings tab navigation guard" |
| **NM-3338** | QA Defect | Done | Users without CORP_LEGAL permission cannot access T&C | **out-of-scope:permission-axis-dropped** — the owner dropped the permission axis for this module; NM-3338 is won't-pursue. The RBAC family is promoted as a template row in the Case-Generation Standard but its cases are DATA-BLOCKED pending a second credentialed role. No DOM verification attempted. | `PLAN_TERMS_CONDITIONS_AUTOMATION.md` §"RBAC promotion" |
| **NM-3162** | QA Defect | Done | HTML editor does not clear after selecting a non-HTML column | **REGRESSION CONFIRMED** — the probe that was in flight when this row was first written has since completed. The editor panel never clears: it stays visible and merely repositions vertically to track the active row, in BOTH directions and under rapid alternation. N=4 independent runs, backed by `boundingBox` geometry (`312×120px` in all 5 alternation states) and screenshots. A closed defect that re-fires is a REGRESSION against NM-3162, not a new bug. | `clients/encore/specs_planning/_internal/walk-evidence-terms-conditions-2026-08-06.md` (run `tnc-walk-evidence`), screenshots `nm3162-run1-after-name-click.png`, `nm3162-run4-rapid-alternation.png` |
| **NM-3163** | QA Defect | Done | Tooltip shows `&nbsp;` instead of spaces | **PARTIALLY MEASURED** — the grid-cell RTE encoding is confirmed: text typed into the RTE is stored as HTML-escaped literals (`&nbsp;` → `&amp;nbsp;`, `&` → `&amp;`, `<` → `&lt;`; round-trip confirmed tnc-persistence-r1). The **tooltip rendering** half (whether `&nbsp;` renders literally in the hover tooltip) was being probed concurrently and is **not captured** in any on-disk artifact. | tnc-probe-r8 probeC `htmlBeforeSave`; tnc-persistence-r1 `VERDICT.md` §RAW_TRIAL_CAPTURES; field inventory §"RTE entity encoding" |
| **NM-2315** | Story | Done | T&C data is language-keyed (API returns by languageId) | **CONFIRMED** — the save payload carries `languageId` codes (e.g., `"languageId":"en-US"`); captured in network intercept during tnc-persistence-r1. The per-row language combobox drives this key; 4 language options confirmed (English (Canada), US English, Spanish (Mexico), French (Canada)). | tnc-persistence-r1 `VERDICT.md` §saves payloadExcerpt (`"languageId":"en-US"`); field inventory §"Per-row language (Radix)" |
| **NM-645** | Story | Done | Core T&C options endpoint | **CONFIRMED** — 4 per-row language options enumerated via portal-scan (machine walk JSON); 5 options on the page-level language filter (adds "All" filter-only value). The options endpoint backing these values is functioning. | Field inventory §"Language filter" (5 options); §"Per-row language (Radix)" (4 options); walk JSON portal-scan |
| **NM-2189** | Story | Done | Standalone web component (MFE client) | **CONSISTENT** — the walk required shadow/portal-piercing enumeration (`enumerate-page.mjs` shadow-piercing mode); the RTE is Tiptap/ProseMirror (confirmed by machine walk CSS selector: `.tiptap p.is-editor-empty:first-child::b…`). Both observations are consistent with an MFE web component rebuild. No test directly exercises the MFE boundary. | Field inventory §"Left Column (HTML)" rte-content symDiff name; walk JSON |
| **NM-2331** | Sub-task | Done | Standalone web component (sub-task of NM-2189) | **CONSISTENT** — same evidence as NM-2189; sub-task shares the MFE rebuild scope. | Same as NM-2189 |
| **NM-1758** | Story | Done | Angular monolith redirect to MFE host | **CONSISTENT** — the documented URL (`/navigator/locations/1604/settings/terms-conditions`) is the terminal route; no redirect bounce was observed in any of the nine runs. | Field inventory §URL(s) visited; all probe runs |
| **NM-1200** | QA Defect | Done | T&C edits surface in Location Management History | **UNVERIFIED** — no run has exercised this integration edge. The existing `location-management-history.page.ts` page object provides the automation hook, but no test was written or executed against it in this walk. | No on-disk evidence. |
| **NM-825** | Story | Done | T&C required per language on the Legal tab | **UNVERIFIED** — no run visited the Legal tab surface. The `location-legal.page.ts` page object exists. Required-per-language rule is a lead only. | No on-disk evidence. |
| **NM-664** | Story | Done | Service Charge and T&C required per language (Legal tab) | **UNVERIFIED** — same as NM-825; Legal tab not visited. | No on-disk evidence. |
| **NM-1839** | Story | Done | Auto-assign `ShowQuote_TermsConditionID` for en-US locations on creation | **consistent-but-untested** — all 42 old-site rows and the new-site grid are overwhelmingly US English, which fits the auto-assign rule. However, no run tested the assignment mechanism itself (creating a new location and observing the auto-assign). The preponderance of en-US rows is consistent but not causal evidence. | Field inventory §Row container (×51 rows, row language sample confirms US English dominance); old-site baseline tnc-baseline-r1 |
| **NM-1735** | Story | QA | Kafka consumer: sync to Helioscorp | **out-of-scope:integration-kafka** — downstream Helioscorp sync has no UI-observable oracle on this surface. Excluded from UI automation scope by design. | `PLAN_TERMS_CONDITIONS_AUTOMATION.md` §ticket table |
| **NM-1544** | QA Defect | To Do | Legal Updates are not saving to the database | **not-reached** — adjacent surface (Legal tab), not visited in any T&C run. If a T&C save appears not to persist, this open defect should be checked before filing a new bug. | No on-disk evidence. |

---

## New Defect Candidates (ours, not Jira)

These were discovered during the walk and are candidates for filing. They are NOT Jira tickets yet.

### DEF-TNC-002 — Bulk save returns HTTP 500 when the grid contains residue rows

**Observed**: When the grid holds rows created by automation runs (residue rows), a bulk save
returns HTTP 500. Clean-row-only saves have succeeded (HTTP 200, tnc-persistence-r1). The save
endpoint sends ALL rows in a single PUT payload; if any row in the payload is malformed or in an
unexpected state, the whole batch fails.

**Causal precision**: The specific offending row was **never isolated**. The 500 correlation is
between "grid has residue rows" and "save fails" — it rests on correlation plus the observed clean
success, not on a proven root cause. **Do not state this as a proven cause in any bug report.**
State: "bulk save returns HTTP 500 when residue automation rows are present in the grid; specific
offending row not isolated."

**Evidence**: tnc-probe-r8 per-row language save (HTTP 500 observed); tnc-persistence-r1 clean-row
save (HTTP 200, `"success":true`). Field inventory §"Per-row language — dirty gate" (notes
DEF-TNC-002).

### DEF-TNC-005 — On a non-2xx save, the UI disables Save identically to a successful save (silent data loss)

**Observed**: After a failed save (non-2xx response), the Save button is disabled and the form
returns to the same visual resting state as a successful save. There is no error message, no toast,
no re-enable of the Save button. The user has no indication that data was not saved — silent data
loss.

**Evidence**: tnc-probe-r8 save-disabled observation post-response; consistent with the pattern
seen across the 500-producing runs. No explicit network-capture artifact isolates the 500+disabled
sequence in a single run, but the combination of: (a) 500 observed, (b) Save disables on both
200 and non-200, (c) no error UI found in any run constitutes supporting evidence.

**Filing note**: Reproduce by ensuring residue rows are present, then perform a save. Capture the
network response status and the post-save Save button state.

---

## Unverified Leads (gaps visible, not implied-covered)

The following leads from the ticket corpus were **not exercised** in any run. Downstream test
authoring must treat them as open until independently verified:

1. **NM-1731 epic acceptance criteria** — Rovo unavailable; the epic body was not read. It may carry scope/acceptance requirements that override or extend what the sibling tickets imply.
2. **NM-1200 — Location Management History integration** — T&C save → History row appearance. No run visited `location-management-history`. The `location-management-history.page.ts` page object exists and is the automation entry point.
3. **NM-825 / NM-664 — Legal tab required-per-language rule** — No run visited the Legal tab. `location-legal.page.ts` exists. The per-language required-ness rule and its enforcement mechanism are unconfirmed.
4. **NM-1839 — Auto-assign on new location creation** — Consistent with observed data distribution but the mechanism (creating a new en-US location and verifying `ShowQuote_TermsConditionID` is populated) was never tested.
5. **NM-3162 — HTML editor does not clear on non-HTML column select** — Concurrent probe was running at walk close; no artifact captured.
6. **NM-3163 — Tooltip `&nbsp;` rendering** — Grid-cell encoding confirmed; tooltip hover rendering not captured.
7. **Settings tab-to-tab navigation guard (NM-2191 partial)** — No second settings tab link was found to click during tnc-probe-r8. Whether a guard fires on tab navigation remains unconfirmed.
8. **NM-1544 — Legal tab save defect** — Open Jira defect on the adjacent Legal tab. Not visited; may interact with T&C persistence investigations.
9. **DEF-TNC-002 root cause** — The specific row causing the HTTP 500 was never isolated. Correlation is the only evidence.
