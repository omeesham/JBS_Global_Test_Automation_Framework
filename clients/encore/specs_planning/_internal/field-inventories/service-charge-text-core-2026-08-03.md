---
**Module**: service-charge-text-core
**Client**: encore
**MCP_Session_Date**: 2026-08-03
**MCP_Session_Tool**: playwright-cli + scripts/walk-coverage/enumerate-page.mjs
**MCP_Tool_Reason**: unattended catalog walk >10 controls with grep-over-disk evidence (LR-038 v2 CLI default); machine denominator required by LR-062
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge-text
**Test_Entity**: office 1604 (Parker Palm Springs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/service-charge-text-2026-08-03.md
**Stale_After**: 2026-08-17
**Walk_Evidence**: clients/encore/specs_planning/_internal/walk-evidence-service-charge-text-2026-08-03.md
**jira_tickets**: [NM-1694, NM-1728, NM-3336, NM-3126, NM-2922, NM-2924, NAV-4106, NAV-2228]
---

# Field inventory — Service Charge Text (2026-08-03)

## 1. Scope

Single flat page, no sub-tabs. A **115-row table** (1 header + 114 data rows) of per-language service
charge text, plus a page-level language filter, an add-row control, a Save button, and a rich-text
editor panel revealed by clicking any HTML cell.

**Not office-scoped** — the testid dump is byte-identical across offices 1604 / 1101 / 1605
(md5 `f2fa1f1a…`). No test may assume per-office data; conversely LR-061-A's N≥2 requirement is
satisfied structurally.

## 2. Field inventory (8-column)

| # | Field | data-testid | Control type | Default (from DOM) | Required | Validation | affordance: |
|---|---|---|---|---|---|---|---|
| 1 | Language filter (page-level) | `service-charge-text-language-filter-trigger` | Radix combobox (BUTTON role=combobox) | `US English` | n/a (filter) | none | `popover → language listbox, 5 options: All, English (Canada), US English, Spanish (Mexico), French (Canada)` |
| 2 | Language (per row) | `service-charge-text-language-trigger-<N>` ×114 | Radix combobox (BUTTON role=combobox) | per-row value | YES (NM-1728 §5) | not probed | `popover → per-row language listbox` — **distinct node from the native `<select opts=4>` also present in the row (`SAME_NODE=false`, not nested)** |
| 3 | Service Charge Name | `service-charge-text-name-<N>` ×114 | text input | row value (row 0 = `"Service Charge"`) | YES | **unique within language — ENFORCED (Save re-disables) but SILENT (no error text)** · **no `maxlength`** (300 chars accepted) | `none` |
| 4 | Service Charge Display Name | `service-charge-text-display-name-<N>` ×114 | text input | row value | YES | not independently probed | `none` |
| 5 | Report Column Name | `service-charge-text-report-column-<N>` ×114 | text input | row value | YES | not independently probed | `none` |
| 6 | Service Charge Text (HTML) | `service-charge-text-html-cell-<N>-htmlDisplayText` ×114 | DIV role=button — click-to-edit launcher | row HTML | not probed | not probed | `launcher → rich-text editor panel (Tiptap)` |
| 7 | Rich-text editor content | `rte-content` | contenteditable DIV (**Tiptap / ProseMirror**) | loaded from selected row | n/a | not probed | `none` (drive directly; **NOT** a CKEditor iframe) |
| 8 | Add row | `service-charge-text-add-row` | button | n/a | n/a | n/a | `none` — grows grid 114→115; does NOT alone enable Save |
| 9 | Save | `service-charge-text-save` | button | `disabled=true` at rest | n/a | **validity-gated, not dirty-gated** | `none` |

**Editor chrome (read-only wrappers)**: `rte-container`, `rte-content-scroll`.

## 3. MCP_VERIFICATION_LOG

| # | Check | Method | Result |
|---|---|---|---|
| 1 | Surface exists on e2e/1604 | `playwright-cli goto` + heading read | `H1: Service Charge Text`, no redirect, body 36,741 chars |
| 2 | Real column headers | `<th>` textContent read | **5 columns**: Language · Service Charge Name · Service Charge Display Name · Report Column Name · **Service Charge Text** |
| 3 | `HTML Display Text V2` column (NM-1728 §3) | outerHTML + testid scan | **ABSENT** — `BODY_MENTIONS_V2 false`, `HTML_MENTIONS_V2 false`, `V2_TESTIDS` empty |
| 4 | Report preview affordance (NM-1728 §8) | text + aria-label + title scan, before AND after row selection | **ABSENT** — only match was the `Report Column Name` header button |
| 5 | Editor library (NM-1728 §6 says CKEditor) | DOM signature fingerprint | **Tiptap** — `{"tiptap":true,"ckeditor":false}`, `class="tiptap ProseMirror …" contenteditable=true` |
| 6 | Language filter options (NM-1728 §2 `All`) | open listbox, read options | **5 options incl. `All`** — spec satisfied |
| 7 | Row selection dirties form? | Save state before/after html-cell click | **NO** — `disabled=true` throughout. Selection ≠ edit |
| 8 | add-row effect delta | row count before/after | **114 → 115**, Save still `disabled=true` |
| 9 | Save gate: dirty or validity? | fill new row's required fields with UNIQUE values | **`SAVE disabled=false`** → **validity-gated**. NM-1728 §4's "new and dirty" is loose wording |
| 10 | Duplicate-name enforcement | retype existing name into the new row | **`SAVE disabled=true`** → duplicate IS detected and blocks save |
| 11 | Duplicate-name announcement | scan `[aria-invalid]`, `[role=alert]`, `.text-destructive` | **`(no error TEXT rendered)`** → enforced but **silent** = §2.1 oracle violation (SCT-OBS-2) |
| 12 | Name length cap | fill 300 chars | `VALUE_LEN=300 MAXLENGTH=none CLIPPED=true` — no cap, value visually clipped in 128×28px |
| 13 | Boolean render format (LR-036) | column scan | **n/a — no boolean column exists on this grid** |
| 14 | Testid coverage (LR-029) | live DOM `[data-testid]` walk | **zero gaps** on module controls |
| 15 | Net-zero after mutation probes | rows + names + save state, post-reload | `ROWS=114 NAMES=114 first="Service Charge" hasProbe=false` — twice proven |

## 4. Validation rules (live-verified, NM-1728 §5 as the intent source)

| Rule | Spec | Live behaviour |
|---|---|---|
| Name required | §5 | Save stays disabled until filled — **confirmed** |
| Display Name required | §5 | part of the same validity gate — confirmed collectively (not isolated) |
| Report Column required | §5 | part of the same validity gate — confirmed collectively (not isolated) |
| Language required | §5 | pre-populated on new rows; not independently falsifiable |
| **Name unique within language** | §5 | **enforced** (Save re-disables) but **not announced** → SCT-OBS-2 |
| Errors shown at row/field level | §5 | **NOT observed** — no error text in any probed state |
| Save blocked while invalid | §5 | **confirmed** — this is the actual Save gate |

## 5. Save behaviour

- Save is **validity-gated**. It enables when every required field on every row is populated and no
  duplicate-name conflict exists; it disables the moment a conflict or blank appears.
- **Only ONE Save button** exists on the page (PLN-024) — `service-charge-text-save`, page-level, not
  per-row or per-tab.
- **Revert behaviour (PLN-025) NOT tested** — requires a committed save to establish a post-save
  baseline. Deferred to the spec phase under LR-019 per-test reset.
- **No save was ever committed during this walk.** Save-cycle persistence, the dirty-navigation guard,
  tab-switch preservation and concurrent edits are all **unprobed**.

## 6. Dropdown search (PLN-026)

The page-level language filter opens a 5-option listbox. **No search input was observed** — the option
count is small enough that one would be unusual. Not assumed either way beyond what was seen.

## 7. Known constraints for spec authors

1. **The page renders a loading skeleton first** (`service-charge-text-skeleton-*`). Any spec MUST wait
   for `service-charge-text-table` before reading, or it captures shimmer. This cost five walk attempts.
2. **Do not drive all 114 per-row comboboxes.** Driving the full 228-opener frontier tears the page down
   (`page.evaluate: Target page, context or browser has been closed`), matching the documented Radix
   combobox → Angular teardown precedent. Use one representative row plus boundary rows.
3. **The editor is Tiptap, not CKEditor** — a contenteditable div at `[data-testid="rte-content"]`. There
   is no iframe to switch into.
4. **The per-row language control is the Radix BUTTON**, not the sibling native `<select>`.
   `selectOption()` targets the wrong element.
5. **NM-3336**: Navigator→MS sync is broken. **No TC may assert downstream propagation.** Persistence
   assertions stop at Navigator's own reload-from-source-of-truth.
6. **`All` in the page filter** is a filter value, not a language — a row cannot have language `All`
   (the per-row native select carries 4 options, the filter 5).

## 8. Coverage manifest

```
Coverage_Ratio: 42/42 (100%)
Walk_State: office=1604 module=service-charge-text walked=[resting, expand:language-filter, add-row, edit:html-cell]
CrossCheck: clean
Completion_Record: reports/walk-coverage/1604-service-charge-text.json (status=complete, elements=42, raw=613)
```

**Honest scope note**: 100% means *every machine-enumerated element carries a live-evidenced
disposition*. It does **not** mean every behaviour is tested — all save-committed paths remain
unprobed by design (see §5).
