---
artifact: field-case-catalog
module: service-charge-text
client: encore
session_date: 2026-08-03
author_identity: GIVER
field_inventory: clients/encore/specs_planning/_internal/field-inventories/service-charge-text-2026-08-03.md
walk_evidence: clients/encore/specs_planning/_internal/walk-evidence-service-charge-text-2026-08-03.md
baseline_artifact: clients/encore/specs_planning/_internal/old-site-baseline/service-charge-text-2026-08-03.md
jira_tickets: [NM-1694, NM-1728, NM-3336, NM-3126, NM-2922, NM-2924]
tc_band: TC-SCT-CORE-001..
---

# Field-Case Catalog — Service Charge Text (2026-08-03)

Two axes per `docs/read_only_docs/CASE_GENERATION_STANDARD.md` + `field-case-generation.md`:
**Axis 1** = per-field-type cases (§2). **Axis 2** = surface-behavior cases (§3, LR-065).

**Existing coverage: ZERO.** This is a net-new module — every case below is a gap. TC IDs are
3-segment `TC-SCT-CORE-NNN` (`SCT` matches Jira's own prefix; `CORE` is the only submodule the walk
found, so no `types.ts` edit is needed).

**Governing intent**: NM-1728 (status QA). **Every expected value below is either live-DOM-verified
or cited to an NM-1728 section** — none is invented (GEN-045).

---

## Axis 1 — Field-type cases (§2)

### A. Plain text × 3 — Service Charge Name / Display Name / Report Column Name

| TC | Case | Type | Expected | Source |
|---|---|---|---|---|
| 001 | Each of the 3 metadata columns is editable inline | positive | value accepts typed input | live |
| 002 | Blank required field keeps Save disabled | negative | `Save disabled=true` | live #9 |
| 003 | All required fields populated with unique values enables Save | positive | `Save disabled=false` | **live #9** |
| 004 | **Duplicate Service Charge Name within a language re-disables Save** | negative | `Save disabled=true` | **live #10** |
| 005 | **Duplicate name announces a row/field-level error** | negative + §2.1 oracle | error text visible AND escapable | NM-1728 §5 — **currently FAILS, carries SCT-OBS-2** |
| 006 | Name accepts 300 chars (no maxlength) | BVA | `maxlength=none`, value retained | live #12 |
| 007 | **Over-long name renders legibly (no clip/overflow)** | BVA + render | cell not clipped | **currently FAILS, carries SCT-OBS-3** (`CLIPPED=true`) |
| 008 | Whitespace-only name treated as blank | negative | Save stays disabled | NM-1728 §5 (required) |
| 009 | Special characters accepted and preserved | positive | value round-trips | §2 plain-text template |
| 010 | Revert an edited field to its original value | save-cycle | Save returns to disabled | PLN-025 — **NOT yet live-verified** |

### B. Dropdown / combobox × 2 — page filter + per-row language

| TC | Case | Type | Expected | Source |
|---|---|---|---|---|
| 011 | Page language filter opens with exactly 5 options | positive | `All, English (Canada), US English, Spanish (Mexico), French (Canada)` | **live #6** |
| 012 | Default selected filter value is US English | positive | `US English` | live inventory §2 |
| 013 | Selecting a language filters the grid | result-fidelity | row set changes / reloads for that language | NM-1728 §2 |
| 014 | Selecting `All` shows every language's rows | result-fidelity | superset of any single language | NM-1728 §2 |
| 015 | Switching filter with unsaved changes prompts before discarding | guard | confirm dialog; Cancel restores prior selection | NM-1728 §2 |
| 016 | Per-row language control is the Radix button, not the native select | positive | driving the BUTTON opens the listbox | **live #2 (`SAME_NODE=false`)** |
| 017 | Per-row language listbox offers 4 options (no `All`) | positive | 4 languages, `All` absent | live inventory §7.6 |

### C. Rich text × 1 — Service Charge Text (Tiptap)

| TC | Case | Type | Expected | Source |
|---|---|---|---|---|
| 018 | Clicking an HTML cell loads that row into the editor | positive | `rte-content` present, contenteditable | **live #5** |
| 019 | Selecting a row does NOT dirty the form | negative/guard | `Save disabled=true` after selection | **live #7** |
| 020 | Editor is enabled only once an HTML cell is selected | positive | disabled before selection | NM-1728 §1 |
| 021 | Editing editor content marks the row dirty | save-cycle | Save reflects the change | NM-1728 §7 |
| 022 | Switching HTML cells with unsaved editor changes prompts to discard | guard | confirm; Cancel keeps current selection | NM-1728 §6 |
| 023 | Empty HTML field loads a default placeholder structure | positive | placeholder present | NM-1728 §6 |

### D. Row lifecycle × 1 — add-row

| TC | Case | Type | Expected | Source |
|---|---|---|---|---|
| 024 | Add row appends an empty row | positive | grid 114 → 115 | **live #8** |
| 025 | A newly added empty row does NOT enable Save | negative | `Save disabled=true` | **live #8** |
| 026 | Completing the new row's required fields enables Save | positive | `Save disabled=false` | **live #9** |
| 027 | Unsaved added row is discarded on reload | reversibility | row count returns to 114 | **live #15 net-zero** |

---

## Axis 2 — Surface-Behavior Cases (SBC), §3 families (LR-065)

The grid (`service-charge-text-table`, 115 rows) is a §3 surface. Each applicable family gets ≥1
QUICK must-assert; inapplicable families are explicitly scoped out with a reason ≥20 chars.

| Family | Applicable | TC | QUICK must-assert |
|---|---|---|---|
| **result-fidelity** | YES | 028 | Filtering by a language shows only that language's rows; `All` restores the full set |
| **render-state** | YES | 029 | The 5 column headers render exactly: Language · Service Charge Name · Service Charge Display Name · Report Column Name · Service Charge Text (**guards NM-2922 missing-header and NM-2924 column-not-displayed**) |
| **empty-vol** | YES | 030 | Grid renders 114 data rows fully; a content-anchored row (e.g. `"Administrative Fee"`) is readable without pagination |
| **persistence** | YES | 031 | Values survive a reload from source of truth after save (**deferred — needs a committed save**) |
| **pagination** | NO | — | `out-of-scope: pagination=the 115-row grid renders fully with no pager control present in the 613-element raw enumeration` |
| **sorting** | NO | — | `out-of-scope: sorting=no sort affordance exists; the only <th> button is "Resize column" (guard NM-3126 reorder regression instead)` |
| **combination** | NO | — | `out-of-scope: combination=a single language filter is the only filter on this surface, so there is no second dimension to combine with` |

---

## Bug-carrying TCs (plan loop-closure: every CONFIRMED walk bug becomes a required TC)

| TC | Bug | Assertion | Status |
|---|---|---|---|
| **005** | **SCT-OBS-2** — duplicate-name rejection enforced but silent | asserts an announced, escapable rejection per §2.1 | **will FAIL until fixed — the TC IS the bug evidence** |
| **007** | **SCT-OBS-3** — 300-char name renders clipped | asserts the over-long cell renders legibly | **will FAIL until fixed** |

SCT-OBS-1 was **withdrawn** at A7 triage (Save is validity-gated; NM-1728 §4 wording is loose) — it
gets **no** bug-carrying TC. TC-026 covers the correct behaviour instead.

---

## Divergence-driven exclusions (do NOT author these)

| Excluded | Why |
|---|---|
| `HTML Display Text V2` column cases | **SCT-DIV-1** — column absent from the DOM entirely; NM-1728 is status QA so this is unbuilt scope, not a defect |
| Report-preview cases (NM-1728 §8) | **SCT-DIV-2** — no preview affordance before or after row selection; escalated via `/encore-questions` |
| CKEditor-specific cases (iframe switching) | **SCT-DIV-3** — editor is Tiptap/ProseMirror; drive `[data-testid="rte-content"]` directly |
| Downstream MS-propagation assertions | **NM-3336** — sync is broken and unresolved; persistence stops at Navigator's reload |
| Any per-office data assumption | surface is byte-identical across 1604/1101/1605 |
| `rbac` family (NM-1728 §10 role guard) | deferred — the ticket itself marks the role "(Need to confirm)" and the automation account's role is unestablished |

---

## Totals

- **Axis 1**: 27 TCs (`TC-SCT-CORE-001..027`)
- **Axis 2**: 4 SBC TCs (`028..031`), 3 families explicitly out-of-scope
- **Net-new**: **31** — existing coverage was zero
- **Expected to fail on first run**: 2 (005, 007) as deliberate bug evidence
- **Deferred pending a committed save**: 010, 015, 021, 022, 031

Surface TCs carry `**Surface_Family**: <family> (QUICK)` on the Surface_Family line ONLY — never on the
`## TC-…` heading (ALL-091; `xlsx-lint-rules.mjs` hard-blocks the marker in titles).
