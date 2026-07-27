# Corporate Pricing — New Pricebook create flow Test Cases (NM-1440 + NM-2263)

**Module**: corporate-pricing | **Total**: 52 | **Status**: Complete | **Updated**: 2026-06-30

> **NM-2263 extension (2026-06-29):** the NM-1440 Equipment create band (TC-CPR-NPB-001..031) is
> extended with the create-mode **drag-add** positive control (032–033), the toolbar **New ▾**
> Equipment/Labor menu-item clicks (034–036), an **update-existing** management-mode entry pair
> (037–038, the deep inline-edit/save-cycle/persist stays owned by the Pricing Detail band
> `TC-CPR-DET-*` + the Strategy band `TC-CPR-STR-*` — cited, not duplicated), the **NM-2022 / NM-2057**
> validation-lead dispositions (039–040), and the Axis-2 **Surface-Behavior Cases** band (041–050).
>
> **Labor Save coverage (2026-06-30):** the Labor route previously had only a Save-*enable* check
> (029). Added **051** (Labor Save → dialog → Cancel, the Labor mirror of 024) and **052** (Labor
> commit → persist → found in Search, the Labor mirror of 031), closing the asymmetry where only the
> Equipment route proved a real Save. 052 also surfaced that the Search hides Labor pricebooks unless
> the "Is Labor" filter is on.

---

## MCP_VERIFICATION_LOG — New Pricebook (NM-1440)

| Field | Value |
|-------|-------|
| Date | 2026-06-09 |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/add?type=equipment (+ `?type=labor`) |
| Office/Entity | 1604 (Parker Palm Springs) — **create mode** (no pre-existing fixture record; the form starts empty) |
| Intent oracle | DOCX `Pricing-Functional Details-JIRA STORIES 1.docx` NM-1440 + XLSX helpers `TC-ENC-PRC-1440-001..025` (baseline-absent; net-new on e2e) |
| Field-inventory | `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-new-pricebook-2026-06-09.md` |
| Divergences | `clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-newpricebook-divergences-2026-06-09.md` (CPR-1440-Q1..Q5) |
| Stack | React/Next.js (App Router, RSC); form in **light DOM**; React inputs need the native value-setter (`.fill()` does not commit React state) |
| Header (live) | Pricebook Name (text) · Price Book Type (dropdown, **disabled** — route-param-fixed) · Price Year (text, numeric-sanitized) · Currency (dropdown, default USD; options USD/CAD/MXN) |
| Tabs (live) | Pricing Strategy (default) + Pricing Detail — shared header above both |
| Add strategy | `New Pricing Strategy` (+, icon button) opens the "New Pricing Strategy" dialog (Strategy Name + flags Is GSO/Is Active[checked]/Is Internal/Is Productions + Cancel/Add/Close) — **no separate Type field** (CPR-1440-Q2) |
| Product-group ADD | Pricing Detail tab: double-click a Product Groups source item → adds to the pricebook grid (Price 0.00). Catalog is type-specific (Equipment ≈3707 / Labor ≈547) |
| Save precondition | Pricebook Name (non-empty/non-whitespace) + Price Year + **≥1 strategy** (CPR-1440-Q5). Product groups optional (Empty-Shell) |
| Save | dialog-gated "Save Changes" confirmation dialog (LR-012) → `POST /navigator/api/location/pricing/save` → 200 → redirects to `/details/<new-guid>`; success grid row shows Unicode ✔ (LR-036) |
| Mutation safety | **No-commit default** — a created pricebook has NO UI delete (CPR-1440-Q4, irreversible). The save-cycle field-coverage TCs assert reachability (Save enabled → dialog appears → **Cancel**). **Persistence is now proven by ONE committing test, TC-CPR-NPB-031** (this environment is single-tenant/ours, so the permanent record is accepted — authorized 2026-06-26). Baseline LR-019 = navigate fresh to the (always-empty) create page per test |
| data-testid coverage | near-zero — one usable `id` (`#new-strategy-name`); else text/role/placeholder/content-anchored (Doctrine 4 / D8) |

### HELPER VERIFICATION LEDGER (25 XLSX `TC-ENC-PRC-1440-*` + 1×`1443-010` → live verdict → `TC-CPR-NPB-NNN`)

| Helper | Verdict (live 2026-06-09) | Re-ID |
|---|---|---|
| 001 Valid Name allows Save | VERIFIED (Name + Year + strategy ⇒ Save enabled) | TC-CPR-NPB-002/015/023 |
| 002 Single-char Name accepted | VERIFIED ("A" keeps form savable) | TC-CPR-NPB-008 |
| 003 Long Name up to limit | VERIFIED (250 chars accepted, no client truncation) | TC-CPR-NPB-009 |
| 004 Empty Name blocks Save | VERIFIED (Save disabled) | TC-CPR-NPB-011 |
| 005 Whitespace-only Name = empty | VERIFIED (whitespace ⇒ Save disabled) | TC-CPR-NPB-012 |
| 006 Special chars in Name preserved | VERIFIED-mechanism (accepted; persistence = no-commit) | TC-CPR-NPB-010 |
| 007 Equipment Type saves | **CORRECTED**: Type is disabled/display-only on create page (route-param-fixed) — CPR-1440-Q1 | TC-CPR-NPB-001/003 |
| 008 Labor Type saves | **CORRECTED**: same (Type disabled = "Labor" on `?type=labor`) | TC-CPR-NPB-028 |
| 009 Type dropdown lists only Equipment+Labor | **CORRECTED**: Type is NOT a usable dropdown on create page (disabled) — choice is at `+New` toolbar (TC-016/017); CPR-1440-Q1 | TC-CPR-NPB-003 |
| 010 Valid 4-digit year accepted | VERIFIED (2026 ⇒ savable) | TC-CPR-NPB-004/015 |
| 011 Empty year blocks Save | VERIFIED (Save disabled) | TC-CPR-NPB-013 |
| 012 Non-numeric year rejected | VERIFIED (alpha reverts to last valid) | TC-CPR-NPB-014 |
| 013 Decimal year rejected | **CORRECTED**: decimal ("20.5") + 2-digit accepted client-side; not blocked — CPR-1440-Q3 (server unverified) | TC-CPR-NPB-015 |
| 014 Currency defaults USD | VERIFIED | TC-CPR-NPB-005 |
| 015 Change Currency saves | VERIFIED-options (USD/CAD/MXN; selection works; persistence = no-commit) | TC-CPR-NPB-006 |
| 016 Add single strategy (name+type) appends | **CORRECTED**: dialog has Name + 4 flags (no "Type"); Add appends — CPR-1440-Q2 | TC-CPR-NPB-016/018 |
| 017 Add second strategy, both in list | VERIFIED (Total →2) | TC-CPR-NPB-019 |
| 018 Add five strategies persist after Save | VERIFIED-multi-add; **persistence NOT-AUTOMATED-IN-CI** (no-commit, CPR-1440-Q4) | TC-CPR-NPB-019 |
| 019 Add blocked when Strategy Name empty | VERIFIED (empty name keeps Add disabled — the guard; Total unchanged, dialog stays open) | TC-CPR-NPB-020 |
| 020 Add blocked when Strategy Type empty | **N/A — CORRECTED**: dialog has no Type field (CPR-1440-Q2); empty-Name is the real gate (TC-CPR-NPB-020) | (folded → TC-CPR-NPB-016/020) |
| 021 Save with zero product groups (Empty Shell) | VERIFIED (Save enabled w/ 0 product groups) | TC-CPR-NPB-023 |
| 022 Save commits header+strategies+groups | VERIFIED-reachability (dialog appears, Cancel); **commit NOT-AUTOMATED-IN-CI** (CPR-1440-Q4) | TC-CPR-NPB-024 |
| 023 Save success feedback | VERIFIED-walk (toast + redirect to `/details/<guid>`); **NOT-AUTOMATED-IN-CI** (needs commit) | (walk evidence; see §Known gaps) |
| 024 Save fails when Name missing | VERIFIED (Save disabled = the block) | TC-CPR-NPB-011 |
| 025 Access requires Revenue Management Role | **NOT-AUTOMATABLE** (single automation account; no role-less account to prove the negative) | (none — §Known gaps) |
| 1443-010 Save with no product groups in New-Pricebook mode | VERIFIED (= Empty-Shell) | TC-CPR-NPB-023 |

**Dropped**: 0 of 25 (+1443-010). All retained: 21 covered as P1 create-FCC; 3 CORRECTED to live (009/013/020); 3 persistence cases classified NOT-AUTOMATED-IN-CI (018/022/023); 1 NOT-AUTOMATABLE (025).

### Clarifications (RAISED via `/encore-questions` — Doctrine 2) — see `drafts/corporate-pricing-newpricebook-divergences-2026-06-09.md`

| # | DOCX/helper intent | Live reality | Disposition |
|---|---|---|---|
| CPR-1440-Q1 | Price Book Type = selectable Equipment/Labor dropdown | disabled/display-only (route-param-fixed) | RAISED; intentional UI (choice at `+New`). Asserted live in TC-CPR-NPB-003/028 |
| CPR-1440-Q2 | strategy "Name + Type" | Name + 4 boolean flags, no Type field | RAISED; flags express classification. TC-CPR-NPB-016 asserts |
| CPR-1440-Q3 | decimal year rejected / 4-digit | decimal + 2-digit accepted client-side | RAISED (possible client-validation gap; server unverified). TC-CPR-NPB-015 documents |
| CPR-1440-Q4 | (n/a) | no UI delete/deactivate for a created pricebook | RAISED (irreversible); drives no-commit design. §Known gaps |
| CPR-1440-Q5 | Empty-Shell save (empty product groups) | Save also requires ≥1 strategy | RAISED; TC-CPR-NPB-022/023 assert the strategy precondition |

---

## FIELD INVENTORY — New Pricebook

Full dated inventory: `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-new-pricebook-2026-06-09.md`. 1 usable `id` (`#new-strategy-name`); else text/role/placeholder/content-anchored.

| Field | Type | Default (live 2026-06-09) | State | Notes |
|---|---|---|---|---|
| Pricebook Name | text input | `""` | editable | mandatory; whitespace = empty; long/special accepted (TC-CPR-NPB-008..012) |
| Price Book Type | dropdown | `Equipment`/`Labor` per route | **disabled** | display-only (CPR-1440-Q1; TC-CPR-NPB-003/028) |
| Price Year | text input (numeric-sanitized) | `""` | editable | mandatory; alpha rejected; decimal/2-digit accepted (CPR-1440-Q3; TC-CPR-NPB-013..015) |
| Currency | dropdown | `USD` | editable | options USD/CAD/MXN (TC-CPR-NPB-005/006) |
| New Pricing Strategy (+) | icon button | — | enabled | opens dialog (TC-CPR-NPB-016) |
| Strategy Name (dialog) | text input `#new-strategy-name` | `""` | enabled | empty ⇒ Add disabled — the guard (TC-CPR-NPB-020) |
| Flags (dialog) | checkboxes | Is Active checked; rest unchecked | enabled | TC-CPR-NPB-017 |
| Product Groups source list | draggable list | Eq ≈3707 / Labor ≈547 | enabled | type-specific catalog (TC-CPR-NPB-025/030) |
| Pricebook detail grid | HTML table | empty | — | double-click adds rows (TC-CPR-NPB-026/027) |
| Save | button | disabled | enables on Name+Year+strategy | dialog-gated; no-commit (TC-CPR-NPB-021..024) |

## Validation Rules

- **Save precondition**: Pricebook Name (non-empty, non-whitespace) + Price Year (non-empty) + ≥1 strategy. Product groups optional (Empty-Shell). Type/Currency are defaulted (CPR-1440-Q5).
- **Name**: empty or whitespace-only ⇒ Save disabled; 1-char / 250-char / special chars accepted.
- **Price Year**: empty ⇒ Save disabled; alpha rejected (input reverts); decimal + short values accepted client-side (CPR-1440-Q3).
- **Type**: disabled/display-only, fixed by `?type=` route param (CPR-1440-Q1).
- **Strategy dialog**: empty Strategy Name ⇒ "Add" is a no-op (Total unchanged, dialog stays open).
- **Mutation safety**: a committed pricebook is irreversible via UI (CPR-1440-Q4) ⇒ tests are no-commit (assert Save reachability, Cancel the confirm dialog).

---

## Validation Leads — NM-2022 + NM-2057 (live-reproduced 2026-06-29, NO-COMMIT)

Two carried-forward Jira validation leads, reproduced verbatim on the live create page (office 1604,
`?type=equipment`) before any TC or bug was authored. Both are NO-COMMIT (a created pricebook is
irreversible — CPR-1440-Q4).

| Lead | Jira intent | Live reality (2026-06-29) | Disposition |
|---|---|---|---|
| **NM-2057** | Price Year required but no indicator / Save silently disabled | Empty Price Year carries `aria-invalid="true"` **and a visible RED border** (`oklch(0.577 0.245 27.325)` = destructive/red) that turns neutral-gray once a valid year is entered (`aria-invalid="false"`). Save is disabled while empty (correct gate). There IS a visible+programmatic required/invalid indicator. | **NOT-REPRODUCED** — the current build DOES indicate the required/invalid state (red border + `aria-invalid`). No bug. TC-CPR-NPB-039 asserts the indicator is present (expected behavior). |
| **NM-2022** | Name uniqueness should be name+strategy, not name alone | Typing an EXISTING pricebook name ("2022-NP Tier 1") into the create Name field raises **no client-side inline uniqueness error** (`aria-invalid="false"`, no "already exists" text after blur+settle) — unlike strategy names, which DO show inline uniqueness errors (NM-2261). The form stays client-savable. Server name-only-vs-name+strategy semantics require committing **two** duplicate pricebooks = irreversible. | **CLIENT-SIDE reproduced** (no client-side uniqueness validation on the pricebook name); **server semantics NOT-AUTOMATABLE** (NO-COMMIT, irreversible). No bug (server behavior unprovable without an irreversible duplicate commit; absence of a client check alone is a clarification). TC-CPR-NPB-040 asserts the client-side observed behavior. |

---

## Surface-Behavior Cases (SBC) — Axis-2 families (NM-2263, LR-065)

The field/FCC cases above (Axis 1) cover one control at a time. The Axis-2 surface families
(`field-case-generation.md` §3) cover behaviors that live *between* cells. Each applicable family
carries ≥1 QUICK must-assert + DEEP exhaustive coverage; inapplicable families carry an
`out-of-scope:<family>=<reason>` token. The marker rides the per-TC `**Surface_Family**:` line —
ordinary 3-segment IDs, no `-SBC-` infix (LR-065).

`behavior-cases: render-state, empty-vol, persistence, result-fidelity` (4 covered) + `out-of-scope`
(3) for the New-Pricebook create surface + the Search pricebook list:

| Family | Trigger (live-confirmed 2026-06-29) | QUICK | DEEP | Encore oracle |
|---|---|---|---|---|
| **render-state** | Search pricebook-name cells are link-buttons; 5 boolean cols; Currency col | TC-CPR-NPB-041 (pricebook-name cells navigate) | TC-CPR-NPB-042 (every name cell is a link + sample navigates + Currency renders); TC-CPR-NPB-043 (boolean cols render per table format, LR-036) | link-cell → Details nav; LR-036 boolean ✔/empty; never blind-file a non-link |
| **empty-vol** | create-mode empty-state hint + 3707 Eq / ~547 Labor catalog | TC-CPR-NPB-044 (empty-state hint verbatim + 1-product grid) | TC-CPR-NPB-045 (0/1/N groups + virtualization: off-screen group reachable by content via source search) | content-anchored reads, never a strict count (LR-022) |
| **persistence** | create dirty (tab-switch + beforeunload) + net-zero | TC-CPR-NPB-046 (dirty survives Strategy↔Detail tab-switch) | TC-CPR-NPB-047 (dirty discards on navigate-away beforeunload → reload empty); TC-CPR-NPB-048 (remove the only strategy → Save returns disabled, net-zero) | beforeunload guard; LR-009 revert≠pristine; NO-COMMIT |
| **result-fidelity** | the create-mode source list HAS a search box "Search ID or Name…" (E2) — **promoted IN-SCOPE** (the plan draft guessed out-of-scope) | TC-CPR-NPB-049 (source search filters the catalog to matches) | TC-CPR-NPB-050 (exact ID/name narrows to that item; clearing restores the full catalog) | result-set reflects the query; content-anchored |

**Out-of-scope dispositions (LR-065 token — reason ≥20 chars; trigger confirmed absent at the live walk):**
- `out-of-scope:pagination=the create-mode product-group catalog is virtualized with no rows-per-page control, and the destination grid shows every added row with no pager to exercise`
- `out-of-scope:sorting=neither the create-mode destination grid nor the source product-group list exposes a sortable/clickable column header, so there is no per-column order to flip`
- `out-of-scope:combination=the combination family needs two or more of filter/sort/paginate co-present; the create flow exposes only the source-search filter, so there is nothing to combine`

---

## TC-CPR-NPB-001: New Pricebook (Equipment) create page loads via the type route param
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: Authenticated on office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the New Pricebook create page with the Equipment type route param. | The New Pricebook create page loads with the Equipment type parameter applied in the URL. |
| 2 | Verify the page title and heading. | The Equipment New Pricebook create page loads from its ?type=equipment route (this is the Equipment Pricing option of the + New menu) |

**Expected**: The Equipment New Pricebook create page loads from its `?type=equipment` route (this is the Equipment Pricing option of the + New menu).
**Data**: office=1604, type=equipment

---

## TC-CPR-NPB-002: Pricebook Name field is present and editable
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-001
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the create page. | The New Pricebook create page loads and displays the Pricebook Name field. |
| 2 | Enter a value into the Pricebook Name field. | The Pricebook Name field (label "Pricebook Name") is present and accepts input |

**Expected**: The Pricebook Name field (label "Pricebook Name") is present and accepts input.
**Data**: office=1604

---

## TC-CPR-NPB-003: Price Book Type shows Equipment and is read-only (route-param-fixed)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-001
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the create page. | The New Pricebook create page loads and displays the Price Book Type control. |
| 2 | Read the "Labor / Equipment" type control. | The Type control renders and displays its current value. |
| 3 | Inspect its enabled state. | Type shows "Equipment" and is disabled - it is fixed by the route parameter, not a user-selectable dropdown on this page (the Equipment/Labor choice is made on the previous screen) |

**Expected**: Type shows "Equipment" and is disabled — it is fixed by the route parameter, not a user-selectable dropdown on this page (the Equipment/Labor choice is made on the previous screen).
**Data**: office=1604, type=equipment

---

## TC-CPR-NPB-004: Price Year field is present and editable
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-001
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the create page. | The New Pricebook create page loads and displays the Price Year field. |
| 2 | Enter "2026" into the Price Year field. | The Price Year field (label "Price Year", placeholder "e.g. 2026") is present and accepts a valid year |

**Expected**: The Price Year field (label "Price Year", placeholder "e.g. 2026") is present and accepts a valid year.
**Data**: office=1604

---

## TC-CPR-NPB-005: Currency defaults to USD
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-001
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page in a fresh load.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the create page. | The New Pricebook create page loads and displays the Currency control. |
| 2 | Read the Currency control's value. | Currency defaults to USD on first load |

**Expected**: Currency defaults to USD on first load.
**Data**: office=1604

---

## TC-CPR-NPB-006: Currency dropdown offers USD, CAD, MXN
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-005
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the create page. | The New Pricebook create page loads and displays the Currency control. |
| 2 | Open the Currency dropdown. | The Currency dropdown expands and displays its list of options. |
| 3 | Read the option list. | The Currency dropdown lists USD, CAD, and MXN |

**Expected**: The Currency dropdown lists USD, CAD, and MXN.
**Data**: office=1604

---

## TC-CPR-NPB-007: Tabs render — Pricing Strategy + Pricing Detail
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-001
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the create page. | The New Pricebook create page loads and displays its tab buttons. |
| 2 | Read the tab buttons. | Both tabs render above the shared header |

**Expected**: Both tabs render above the shared header.
**Data**: office=1604

---

## TC-CPR-NPB-008: Single-character Pricebook Name keeps the form savable
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-002
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a valid Year and one strategy already added (so Name is the only variable).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Year=2026 and add one strategy. | The Price Year field holds 2026 and the strategy list shows one added strategy. |
| 2 | Enter a single character "A" as the Pricebook Name. | The Pricebook Name field accepts and displays the single character "A". |
| 3 | Observe the Save button. | A 1-character name satisfies the Name requirement (Save enabled) |

**Expected**: A 1-character name satisfies the Name requirement (Save enabled).
**Data**: office=1604

---

## TC-CPR-NPB-009: Long Pricebook Name (250 chars) is accepted
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: TC-CPR-NPB-002
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a valid Year and one strategy added.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter a 250-character Pricebook Name. | The Pricebook Name field accepts the full 250-character name and does not shorten it. |
| 2 | Observe the Save button. | A long name is accepted and the name is not shortened; the form stays savable |

**Expected**: A long name is accepted and the name is not shortened; the form stays savable.
**Data**: office=1604

---

## TC-CPR-NPB-010: Special characters in Pricebook Name are accepted
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: TC-CPR-NPB-002
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a valid Year and one strategy added.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter a name containing these literal special characters: `AT&T <Tag> #1 "Q" é`. | The Pricebook Name field accepts and displays the special characters exactly as typed. |
| 2 | Observe the Save button. | Special characters are accepted in the Name field; the form stays savable |

**Expected**: Special characters are accepted in the Name field; the form stays savable.
**Data**: office=1604

---

## TC-CPR-NPB-011: Empty Pricebook Name blocks Save
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-002
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a valid Year and one strategy added.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Leave the Pricebook Name empty. | The Pricebook Name field remains empty. |
| 2 | Observe the Save button. | An empty name blocks Save (Name is mandatory) |

**Expected**: An empty name blocks Save (Name is mandatory).
**Data**: office=1604

---

## TC-CPR-NPB-012: Whitespace-only Pricebook Name is treated as empty (blocks Save)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-002
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a valid Year and one strategy added.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter only spaces ("   ") as the Pricebook Name. | The Pricebook Name field contains only the space characters entered. |
| 2 | Observe the Save button. | A whitespace-only name is treated as empty and blocks Save |

**Expected**: A whitespace-only name is treated as empty and blocks Save.
**Data**: office=1604

---

## TC-CPR-NPB-013: Empty Price Year blocks Save
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-004
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a valid Name and one strategy added.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Leave the Price Year empty. | The Price Year field remains empty. |
| 2 | Observe the Save button. | An empty Price Year blocks Save (Year is required) |

**Expected**: An empty Price Year blocks Save (Year is required).
**Data**: office=1604

---

## TC-CPR-NPB-014: Non-numeric Price Year input is rejected
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-004
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page; Price Year holds a valid value.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Attempt to enter alphabetic text ("abcd") into Price Year. | The Price Year input does not accept alphabetic characters |

**Expected**: The Price Year input does not accept alphabetic characters.
**Data**: office=1604

---

## TC-CPR-NPB-015: Valid Price Year keeps the form savable (decimal/short not blocked)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-004
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a valid Name and one strategy added.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter "2026" and observe the Save button. | Entering the valid year 2026 completes the required fields and the Save button becomes enabled. |
| 2 | Enter a decimal "20.5" and observe the Save button. | A valid 4-digit year keeps the form savable; the page does not block a decimal or short year |

**Expected**: A valid 4-digit year keeps the form savable; the page does not block a decimal or short year.
**Data**: office=1604

---

## TC-CPR-NPB-016: New Pricing Strategy (+) opens the add dialog (Name + flags, no Type field)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-001
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "New Pricing Strategy" (+). | The New Pricing Strategy dialog opens. |
| 2 | Inspect the dialog. | The add dialog presents a Strategy Name and the four flag toggles (there is no separate "Type" selection in the dialog) |

**Expected**: The add dialog presents a Strategy Name and the four flag toggles (there is no separate "Type" selection in the dialog).
**Data**: office=1604

---

## TC-CPR-NPB-017: Strategy dialog defaults — Is Active checked
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: TC-CPR-NPB-016
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the New Pricing Strategy dialog. | The New Pricing Strategy dialog opens and displays its flag toggles. |
| 2 | Read the flag states. | The dialog defaults to Is Active checked, the other flags unchecked |

**Expected**: The dialog defaults to Is Active checked, the other flags unchecked.
**Data**: office=1604

---

## TC-CPR-NPB-018: Adding a strategy appends it to the list
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-016
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Strategy tab, zero strategies ("No strategies yet", Total: 0).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog, enter a Strategy Name, click "Add". | The dialog closes and the new strategy is added to the list. |
| 2 | Read the strategy list. | Adding a strategy via the dialog appends it (Total goes from 0 to 1, empty state cleared) |

**Expected**: Adding a strategy via the dialog appends it (Total goes from 0 to 1, empty state cleared).
**Data**: office=1604

---

## TC-CPR-NPB-019: Adding a second strategy lists both
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-018
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with one strategy already added.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Add a second strategy via the dialog. | The dialog closes and the second strategy is added to the list. |
| 2 | Read the count. | A second strategy appends to the list (Total becomes 2) |

**Expected**: A second strategy appends to the list (Total becomes 2).
**Data**: office=1604

---

## TC-CPR-NPB-020: Add with an empty Strategy Name does nothing
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-016
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Strategy tab, the dialog open with an empty Strategy Name.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the New Pricing Strategy dialog and leave the Strategy Name empty. | The New Pricing Strategy dialog remains open with the Strategy Name field empty. |
| 2 | Observe the Add button. | While the Strategy Name is empty, the Add button is disabled (the empty-name guard) - no strategy can be added and the dialog stays open |

**Expected**: While the Strategy Name is empty, the Add button is disabled (the empty-name guard) — no strategy can be added and the dialog stays open.
**Data**: office=1604

---

## TC-CPR-NPB-021: Save is disabled on the empty create form
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-001
**Automatable**: Yes

**Preconditions**: On a freshly-loaded Equipment New Pricebook page (nothing entered).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the create page and leave all fields empty. | The create page loads with all fields empty and no strategies added. |
| 2 | Observe the Save button. | Save is disabled on the empty form |

**Expected**: Save is disabled on the empty form.
**Data**: office=1604

---

## TC-CPR-NPB-022: Save stays disabled without a strategy (≥1 strategy required)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-001
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with Name + Year filled and zero strategies.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter a valid Name and Year. | The Pricebook Name and Price Year fields hold the entered valid values. |
| 2 | Add no strategy. | The strategy list remains empty with zero strategies added. |
| 3 | Observe the Save button. | Save stays disabled until at least one pricing strategy is added (a strategy is required to save) |

**Expected**: Save stays disabled until at least one pricing strategy is added (a strategy is required to save).
**Data**: office=1604

---

## TC-CPR-NPB-023: Save enables with Name + Year + one strategy and no product groups
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-018
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter a valid Name and Year. | The Pricebook Name and Price Year fields hold the entered valid values. |
| 2 | Add one strategy. | The strategy list shows one added strategy (Total: 1). |
| 3 | Add no product groups. | The Pricing Detail grid remains empty with zero product groups added. |
| 4 | Observe the Save button. | With a Name, a Year, and at least one strategy - and zero product groups - Save is enabled (saving with no product groups is permitted) |

**Expected**: With a Name, a Year, and at least one strategy — and zero product groups — Save is enabled (saving with no product groups is permitted).
**Data**: office=1604

---

## TC-CPR-NPB-024: Save opens the confirmation dialog, and Cancel aborts without committing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-023
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a savable form (Name + Year + one strategy).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the enabled Save button. | The "Save Changes" confirmation dialog appears. |
| 2 | Click "Cancel" in the confirmation dialog that appears. | Clicking Save opens the "Save Changes" confirmation dialog, and Cancel closes it without saving. The test intentionally stops at the confirmation step and does not complete the save, because a created pricebook cannot be removed through the UI (so confirming would leave a permanent record) |

**Expected**: Clicking Save opens the "Save Changes" confirmation dialog, and Cancel closes it without saving. The test intentionally stops at the confirmation step and does not complete the save, because a created pricebook cannot be removed through the UI (so confirming would leave a permanent record).
**Data**: office=1604

---

## TC-CPR-NPB-025: Pricing Detail tab shows the Product Groups source list (Equipment catalog)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-007
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the "Pricing Detail" tab. | The Pricing Detail tab becomes active and its content is displayed. |
| 2 | Read the left "Product Groups" source list. | The Pricing Detail tab in create mode shows the Equipment product-group source list (assert presence / > 0, never an exact count) |

**Expected**: The Pricing Detail tab in create mode shows the Equipment product-group source list (assert presence / > 0, never an exact count per LR-022).
**Data**: office=1604, type=equipment

---

## TC-CPR-NPB-026: Double-clicking a product group adds it to the pricebook grid
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-025
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Detail tab, empty pricebook grid.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Double-click a known product group in the source list (e.g. "Balloon Light Decor"). | The double-clicked product group is added to the pricebook grid. |
| 2 | Read the grid. | Double-clicking a product group in the source list adds it to the new pricebook's grid with a starting price of 0.00 |

**Expected**: Double-clicking a product group in the source list adds it to the new pricebook's grid with a starting price of 0.00.
**Data**: office=1604, product group="Balloon Light Decor"

---

## TC-CPR-NPB-027: Adding multiple product groups appends rows
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-026
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Detail tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Double-click a first product group. | The first product group is added to the pricebook grid. |
| 2 | Double-click a second, different product group. | The second product group appends as a new row in the pricebook grid. |
| 3 | Read the grid by content. | Each double-click appends a distinct product-group row |

**Expected**: Each double-click appends a distinct product-group row.
**Data**: office=1604, product groups="Balloon Light Decor", "Analog Mixer 12 - 23 Ch"

---

## TC-CPR-NPB-028: New Pricebook (Labor) create page loads with Type read-only as Labor
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: Authenticated on office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the New Pricebook create page with the Labor type route param. | The New Pricebook create page loads with the Labor type parameter applied in the URL. |
| 2 | Read the Type control. | The Labor create page loads from ?type=labor (the Labor Pricing option of the + New menu); Type shows "Labor" and is read-only |

**Expected**: The Labor create page loads from `?type=labor` (the Labor Pricing option of the + New menu); Type shows "Labor" and is read-only.
**Data**: office=1604, type=labor

---

## TC-CPR-NPB-029: Labor flow header parity + Save gating
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-028
**Automatable**: Yes

**Preconditions**: On the Labor New Pricebook page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the header. | The header renders the Pricebook Name, Price Year, Currency, and Type fields. |
| 2 | Verify Save is disabled initially. | The Save button is disabled on the initial load. |
| 3 | Enter Name + Year + add a strategy via the dialog. | The Labor flow mirrors Equipment (same header fields, USD default, strategy dialog) and gates Save identically (Name + Year + ≥1 strategy) |

**Expected**: The Labor flow mirrors Equipment (same header fields, USD default, strategy dialog) and gates Save identically (Name + Year + ≥1 strategy).
**Data**: office=1604, type=labor

---

## TC-CPR-NPB-030: Labor Pricing Detail shows a Labor-specific product-group catalog
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-028
**Automatable**: Yes

**Preconditions**: On the Labor New Pricebook page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the "Pricing Detail" tab. | The Pricing Detail tab becomes active and displays the Labor product-group source list. |
| 2 | Read the Product Groups source list. | The Labor Pricing Detail source list contains Labor/service product groups (a different catalog than Equipment) - the ?type= route param selects the catalog. Assert by content/> 0, never exact count |

**Expected**: The Labor Pricing Detail source list contains Labor/service product groups (a different catalog than Equipment) — the `?type=` route param selects the catalog. Assert by content/`> 0`, never exact count.
**Data**: office=1604, type=labor

---

## TC-CPR-NPB-031: Saving a new pricebook persists it — created book reloads + is found by Search with its product group
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Automatable**: Yes (the ONE committing test — all other save-cycle TCs are no-commit)

**Preconditions**: On the Equipment New Pricebook page (office 1604). This environment is single-tenant (ours), so committing a real pricebook is accepted (user-authorized). A created pricebook is irreversible via the UI (no delete/deactivate), so this test leaves a permanent record by design.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Build a savable, non-empty pricebook: enter a unique Pricebook Name (fixed prefix + a passed-in run-stamp from the `PRICEBOOK_RUN_STAMP` env var, falling back to the test-runner pid — never a clock/random value), enter a Price Year, add one strategy via the dialog, switch to the Pricing Detail tab and add one product group (Balloon Light Decor). | The form now holds a unique Pricebook Name, a valid Price Year, one strategy, and one added product group, making it ready to save. |
| 2 | Confirm Save is enabled, click Save, and confirm the "Save Changes" dialog (COMMIT). | Confirming the "Save Changes" dialog commits the pricebook and redirects to its new Details page. |
| 3 | After the commit redirects to the new pricebook's Details page, reload that Details page and read the Pricing Detail grid. | The reloaded Details page displays the Pricing Detail grid with the previously added product group still present. |
| 4 | Open the Corporate Pricing Search screen, turn Active-Only off, filter by the unique name, and Search. | The commit redirects to /details/<new-guid> (the record now exists). On reload of the new book's Pricing Detail tab, the added product group (Balloon Light Decor) is still present (content-based, never a count). The new book is discoverable by its unique name on the Search screen. If this ever fails on "can't add", the likely cause is the unique source product groups have been used up (the UI has no delete to recycle them) - escalate then, not pre-emptively |

**Expected**: The commit redirects to `/details/<new-guid>` (the record now exists). On reload of the new book's Pricing Detail tab, the added product group (Balloon Light Decor) is still present (content-anchored, never a count). The new book is discoverable by its unique name on the Search screen. If this ever fails on "can't add", the likely cause is the unique source product groups have been used up (the UI has no delete to recycle them) — escalate then, not pre-emptively.
**Data**: office=1604, type=equipment, name=`QA-Persist-<run-stamp>`, productGroup="Balloon Light Decor"

---

## TC-CPR-NPB-032: Dragging a product group (real pointer sequence) adds it to the create grid
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-025
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Detail tab, empty pricebook grid.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Drag a known product group from the source list onto the pricebook grid using a real full pointer sequence — move to the source, press, move across in steps, then release. | Releasing the drag adds the product group as a new row in the pricebook grid. |
| 2 | Read the grid by content. | The dragged product group (Balloon Light Decor) is added to the new pricebook's grid. This is the create-mode drag baseline check - it proves the drag interaction works when adding is allowed (the same interaction proves no-add in the management-mode Detail tab) |

**Expected**: The dragged product group (Balloon Light Decor) is added to the new pricebook's grid. This is the create-mode drag positive control — it proves the drag interaction works when adding is allowed (the same interaction proves no-add in the management-mode Detail tab).
**Data**: office=1604, product group="Balloon Light Decor"

---

## TC-CPR-NPB-033: Drag-add → edit New Price + Max Discount (keyboard) → Save reachable (NO-COMMIT)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-032
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a valid Name + Year + one strategy already set.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On the Pricing Detail tab, drag a product group onto the grid (real pointer sequence). | The dragged product group drops into the pricebook grid as a new row. |
| 2 | Confirm the dragged row landed in the grid. | The newly dragged row remains visible in the grid on inspection. |
| 3 | Confirm Save is enabled (Name + Year + ≥1 strategy + the added group). | The Save button is enabled. |
| 4 | Click Save, then Cancel the "Save Changes" dialog. | The drag-added row lands in the grid; with a complete header the form is savable; clicking Save opens the confirmation dialog and Cancel aborts without committing (NO-COMMIT - a created pricebook is irreversible). New Price / Max Discount on a freshly-added create row start at 0.00 and are editable by keyboard (cell-level edit is covered by the Pricing Detail band TC-CPR-DET-*; the New-Pricebook angle here is the drag-add -> savable path) |

**Expected**: The drag-added row lands in the grid; with a complete header the form is savable; clicking Save opens the confirmation dialog and Cancel aborts without committing (NO-COMMIT — a created pricebook is irreversible). New Price / Max Discount on a freshly-added create row start at 0.00 and are editable by keyboard (cell-level edit is covered by the Pricing Detail band TC-CPR-DET-*; the New-Pricebook angle here is the drag-add → savable path).
**Data**: office=1604, product group="Balloon Light Decor"

---

## TC-CPR-NPB-034: New ▾ menu presents Equipment Pricing + Labor Pricing items
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Corporate Pricing Search screen (office 1604).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the toolbar "New" split-button to open its dropdown menu. | The New ▾ dropdown menu opens. |
| 2 | Read the menu items. | The New ▾ menu opens and presents exactly two items - "Equipment Pricing" and "Labor Pricing" (the two New-Pricebook create routes), driven via a real dropdown interaction (not a URL) |

**Expected**: The New ▾ menu opens and presents exactly two items — "Equipment Pricing" and "Labor Pricing" (the two New-Pricebook create routes), driven via a real dropdown interaction (not a URL).
**Data**: office=1604

---

## TC-CPR-NPB-035: New ▾ → Equipment Pricing navigates to the Equipment create route
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-034
**Automatable**: Yes

**Preconditions**: On the Corporate Pricing Search screen.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the New ▾ menu. | The New ▾ dropdown menu opens and displays its menu items. |
| 2 | Click "Equipment Pricing". | Selecting "Equipment Pricing" from the New ▾ menu navigates to the Equipment New Pricebook create page (add?type=equipment) - driven by the menu-item click, not by typing the URL |

**Expected**: Selecting "Equipment Pricing" from the New ▾ menu navigates to the Equipment New Pricebook create page (`/add?type=equipment`) — driven by the menu-item click, not by typing the URL.
**Data**: office=1604

---

## TC-CPR-NPB-036: New ▾ → Labor Pricing navigates to the Labor create route
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-034
**Automatable**: Yes

**Preconditions**: On the Corporate Pricing Search screen.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the New ▾ menu. | The New ▾ dropdown menu opens and displays its menu items. |
| 2 | Click "Labor Pricing". | Selecting "Labor Pricing" from the New ▾ menu navigates to the Labor New Pricebook create page (add?type=labor) - driven by the menu-item click, not by typing the URL |

**Expected**: Selecting "Labor Pricing" from the New ▾ menu navigates to the Labor New Pricebook create page (`/add?type=labor`) — driven by the menu-item click, not by typing the URL.
**Data**: office=1604

---

## TC-CPR-NPB-037: An existing pricebook opens in management mode (both tabs, Save disabled on clean load)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: A saved pricebook fixture exists (2021-PB6, the Pricing Detail fixture). Management mode is reversible (reload discards unsaved edits), unlike create.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the existing pricebook's Details page (management mode). | The existing pricebook's Details page loads in management mode. |
| 2 | Read the tab labels and the page heading. | The page displays the Pricing Strategy and Pricing Detail tab labels along with the page heading. |
| 3 | Read the Save button's enabled state on a clean (unedited) load. | An existing pricebook opens in management mode with both tabs (Pricing Strategy + Pricing Detail); the create-mode "New Pricebook" heading is absent (this is a managed record, not the create form); Save is disabled on a clean load. The deep inline-edit / save-cycle / persist-on-reload coverage for this surface is owned by the Pricing Detail band (TC-CPR-DET-*) and the Strategy band (TC-CPR-STR-*) - cited here, not duplicated |

**Expected**: An existing pricebook opens in management mode with both tabs (Pricing Strategy + Pricing Detail); the create-mode "New Pricebook" heading is absent (this is a managed record, not the create form); Save is disabled on a clean load. The deep inline-edit / save-cycle / persist-on-reload coverage for this surface is owned by the Pricing Detail band (TC-CPR-DET-*) and the Strategy band (TC-CPR-STR-*) — cited here, not duplicated.
**Data**: office=1604, pricebook=2021-PB6

---

## TC-CPR-NPB-038: Management-mode inline Max Discount edit enables Save (save-gate; NO-COMMIT)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-037
**Automatable**: Yes

**Preconditions**: On an existing pricebook's Pricing Detail tab (management mode), Save disabled on clean load.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Edit an anchored row's Max Discount via keyboard to a value different from the current one (Max Discount is the reliable dirty lever — a New-Price-only edit does not reliably enable Save, a known quirk). | The Max Discount cell accepts the new keyboard-entered value and displays it. |
| 2 | Observe the Save button. | The Save button becomes enabled. |
| 3 | Do NOT commit — discard by reloading (management-mode edits are reversible). | A management-mode inline Max Discount edit makes the form dirty and enables Save (the save-gate). The test stops at Save-enable and discards via reload - it does not commit, so the fixture is unchanged. (The full inline-edit / dirty-lever asymmetry / persist-after-save coverage is owned by TC-CPR-DET-*; this asserts only the create->manage save-gate transition.) |

**Expected**: A management-mode inline Max Discount edit makes the form dirty and enables Save (the save-gate). The test stops at Save-enable and discards via reload — it does not commit, so the fixture is unchanged. (The full inline-edit / dirty-lever asymmetry / persist-after-save coverage is owned by TC-CPR-DET-*; this asserts only the create→manage save-gate transition.)
**Data**: office=1604, pricebook=2021-PB6, anchor="Balloon Light Decor"

---

## TC-CPR-NPB-039: Empty Price Year shows a visible required/invalid indicator (Save disabled)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-004
**Automatable**: Yes

**Preconditions**: On a freshly-loaded Equipment New Pricebook page (Price Year empty).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On a fresh create page, read the Price Year field's invalid state with the year empty. | With the Price Year field empty, it reports an invalid state and shows a red/destructive border. |
| 2 | Enter a valid year and re-read the invalid state. | With Price Year empty the field reports is invalid AND renders a visible red/destructive border (it is NOT silently disabled with no indicator); entering a valid year clears the invalid state (is valid) and the red border. The current build clearly indicates the required/invalid state |

**Expected**: With Price Year empty the field reports `aria-invalid="true"` AND renders a visible red/destructive border (it is NOT silently disabled with no indicator); entering a valid year clears the invalid state (`aria-invalid="false"`) and the red border. The current build clearly indicates the required/invalid state.
**Data**: office=1604

---

## TC-CPR-NPB-040: An existing pricebook name raises no client-side inline uniqueness error
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-002
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page; an existing pricebook name is known.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter the name of an EXISTING pricebook into the Pricebook Name field. | The Pricebook Name field displays the entered existing pricebook name. |
| 2 | Blur the field and wait briefly for any async validation. | The field loses focus and the wait period elapses, allowing any asynchronous validation to run. |
| 3 | Read the Name field's invalid state and check for an inline uniqueness error. | Entering an existing pricebook name raises no client-side inline uniqueness error (validation error stays false, no "already exists" text) and does not block the form client-side - unlike strategy names, which DO validate uniqueness client-side. Pricebook-name uniqueness is not enforced client-side; the server-side rule cannot be exercised here without committing two duplicate pricebooks, which is irreversible, so this stays a no-commit client-side-only check |

**Expected**: Entering an existing pricebook name raises no client-side inline uniqueness error (`aria-invalid` stays false, no "already exists" text) and does not block the form client-side — unlike strategy names, which DO validate uniqueness client-side. Pricebook-name uniqueness is not enforced client-side; the server-side rule cannot be exercised here without committing two duplicate pricebooks, which is irreversible, so this stays a no-commit client-side-only check.
**Data**: office=1604, existingName="2022-NP Tier 1"

---

## TC-CPR-NPB-041: Search pricebook-name cells navigate to the pricebook Details (link-cell render-state)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Surface_Family**: render-state (QUICK)
**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Corporate Pricing Search screen with the pricebook list rendered.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read a known pricebook-name cell in the Search grid's first column. | The pricebook-name cell is visible in the grid's first column, rendered as a link/button affordance. |
| 2 | Click the pricebook-name cell. | The pricebook-name cell is a link affordance and clicking it navigates to that pricebook's Details page (details/<guid>) in management mode - the "pricebook links navigate" render-state check. A non-link where a link is expected would be investigated as a potential issue, never reported blindly |

**Expected**: The pricebook-name cell is a link affordance and clicking it navigates to that pricebook's Details page (`/details/<guid>`) in management mode — the "pricebook links navigate" render-state check. A non-link where a link is expected would be investigated as a potential issue, never reported blindly.
**Data**: office=1604

---

## TC-CPR-NPB-042: Every rendered pricebook-name cell is a navigable link + Currency renders (render-state DEEP)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Surface_Family**: render-state (DEEP)
**Depends_On**: TC-CPR-NPB-041
**Automatable**: Yes

**Preconditions**: On the Corporate Pricing Search screen with the pricebook list rendered.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enumerate every pricebook-name cell on the first page of the grid. | The enumeration returns the full set of pricebook-name cells rendered on the page. |
| 2 | Assert each carries the link/button affordance (structural — never a strict count, LR-022). | Every enumerated cell carries the link/button affordance with no plain-text exceptions. |
| 3 | Click a sample (the first) and confirm it navigates to Details. | Clicking the first pricebook-name cell navigates to that pricebook's Details page. |
| 4 | Read a row's Currency cell. | Every rendered pricebook-name cell carries the link affordance (no non-link where a link is expected); the Currency column renders a currency code (e.g. USD). Navigation of a link cell is proven by TC-CPR-NPB-041. Asserted by content/affordance, never an exact row count |

**Expected**: Every rendered pricebook-name cell carries the link affordance (no non-link where a link is expected); the Currency column renders a currency code (e.g. USD). Navigation of a link cell is proven by TC-CPR-NPB-041. Asserted by content/affordance, never an exact row count.
**Data**: office=1604

---

## TC-CPR-NPB-043: Search boolean columns render per the table's boolean format (render-state DEEP, LR-036)
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Surface_Family**: render-state (DEEP)
**Depends_On**: TC-CPR-NPB-041
**Automatable**: Yes

**Preconditions**: On the Corporate Pricing Search screen with the pricebook list rendered.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the grid headers (the 5 boolean columns: Is GSO / Is Internal / Is Labor / Is Active / Is Productions). | The grid header row displays all five boolean column labels: Is GSO, Is Internal, Is Labor, Is Active, Is Productions. |
| 2 | Read the boolean cell render for those columns across the visible rows. | The boolean columns render per the table's boolean format (Unicode -> for TRUE / empty for FALSE on this grid); a TRUE cell and a FALSE cell are distinguishable by their render, not assumed. No strict count |

**Expected**: The boolean columns render per the table's boolean format (Unicode ✔ for TRUE / empty for FALSE on this grid); a TRUE cell and a FALSE cell are distinguishable by their render, not assumed. No strict count.
**Data**: office=1604

---

## TC-CPR-NPB-044: Create-mode empty-state hint reads verbatim + a one-product grid renders (empty-vol QUICK)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Surface_Family**: empty-vol (QUICK)
**Depends_On**: TC-CPR-NPB-025
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Detail tab, empty pricebook grid.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the empty-state hint on the empty destination grid. | The empty destination grid displays its empty-state hint text. |
| 2 | Add one product group and read the grid. | The empty-state hint reads verbatim "No items added yet - Double-click or drag product groups from the sidebar"; after one add the grid renders exactly that one product group (content-based, the 1-item volume case) |

**Expected**: The empty-state hint reads verbatim "No items added yet — Double-click or drag product groups from the sidebar"; after one add the grid renders exactly that one product group (content-anchored, the 1-item volume case).
**Data**: office=1604, product group="Balloon Light Decor"

---

## TC-CPR-NPB-045: Create-mode 0/1/N volume + source-catalog virtualization integrity (empty-vol DEEP)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Surface_Family**: empty-vol (DEEP)
**Depends_On**: TC-CPR-NPB-044
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Detail tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Confirm the destination grid is empty (0 rows / empty-state). | The destination grid shows zero rows and its empty-state message. |
| 2 | Add a first product group (1 row), then a second distinct group (N rows) — content-anchored. | The grid shows one row after the first add, then two distinct rows after the second add. |
| 3 | In the (virtualized ~3707-item) source list, type a known off-screen group name into the source search and confirm it becomes reachable/visible by content. | The grid renders 0 -> 1 -> N states by content (never a strict count). The source catalog is virtualized; an off-screen product group not initially on the page is reachable by content once filtered via the source search - virtualization integrity holds (content-based reads, not a count) |

**Expected**: The grid renders 0 → 1 → N states by content (never a strict count). The source catalog is virtualized; an off-screen product group not initially in the DOM is reachable by content once filtered via the source search — virtualization integrity holds (content-anchored reads, not a count).
**Data**: office=1604, groups="Balloon Light Decor", "Analog Mixer 12 - 23 Ch"

---

## TC-CPR-NPB-046: Create-mode unsaved changes survives a Strategy ↔ Detail tab switch (persistence QUICK)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Surface_Family**: persistence (QUICK)
**Depends_On**: TC-CPR-NPB-026
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with one strategy added and one product group added (dirty, unsaved).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Add a strategy (Pricing Strategy tab) and a product group (Pricing Detail tab) — the form is now dirty. | The strategy list shows one strategy and the Pricing Detail grid shows one added product group. |
| 2 | Switch to the Pricing Strategy tab, then back to the Pricing Detail tab. | Each tab becomes active and displays its content as it is selected. |
| 3 | Read the strategy count and the grid. | The in-session unsaved changes survives the tab switch - the added strategy (Total: 1) and the added product-group row are both still present after switching tabs and back (no loss, no reset) |

**Expected**: The in-session unsaved changes survives the tab switch — the added strategy (Total: 1) and the added product-group row are both still present after switching tabs and back (no loss, no reset).
**Data**: office=1604, product group="Balloon Light Decor"

---

## TC-CPR-NPB-047: Create-mode dirty discards on navigate-away (beforeunload) → reload shows empty form (persistence DEEP)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Surface_Family**: persistence (DEEP)
**Depends_On**: TC-CPR-NPB-002
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with Name + Year + a strategy set (dirty, unsaved). The test fixture auto-accepts the beforeunload dialog.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Make the create form dirty (Name + Year + one strategy). | The form holds the entered Name, Year, and one added strategy, and is in a dirty (unsaved) state. |
| 2 | Navigate away (re-open the fresh create page) — the dirty form guards via beforeunload. | A beforeunload confirmation prompt appears when navigating away from the dirty form. |
| 3 | Read the create form fields after reload. | An unsaved create form is NOT persisted - navigating away triggers the beforeunload guard and, on reload of the create page, the form is empty (Name blank, zero strategies). NO-COMMIT discipline: nothing was saved |

**Expected**: An unsaved create form is NOT persisted — navigating away triggers the beforeunload guard and, on reload of the create page, the form is empty (Name blank, zero strategies). NO-COMMIT discipline: nothing was saved.
**Data**: office=1604

---

## TC-CPR-NPB-048: Removing the only strategy returns Save to disabled — no net change (persistence DEEP)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Surface_Family**: persistence (DEEP)
**Depends_On**: TC-CPR-NPB-023
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with Name + Year set.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | With Name + Year set, add one strategy → confirm Save enables. | The strategy list shows one added strategy and the Save button becomes enabled. |
| 2 | Remove that strategy (its in-session Remove control). | The strategy is removed and the strategy list returns to zero entries. |
| 3 | Observe the Save button. | Removing the only strategy returns the form to its pre-strategy state - Save goes back to disabled (≥1 strategy required; reverting the change leaves no net difference). The Save gate tracks the live precondition, not a one-way latch |

**Expected**: Removing the only strategy returns the form to its pre-strategy state — Save goes back to disabled (≥1 strategy required; reverting the change leaves no net difference). The Save gate tracks the live precondition, not a one-way latch.
**Data**: office=1604

---

## TC-CPR-NPB-049: Source-list search filters the product-group catalog to matches (result-fidelity QUICK)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Surface_Family**: result-fidelity (QUICK)
**Depends_On**: TC-CPR-NPB-025
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Detail tab, full source catalog rendered.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type a known product-group name fragment into the source "Search ID or Name..." box. | The source search box displays the typed text and the source list updates as it is typed. |
| 2 | Read the visible source rows. | The source-list search filters the product-group catalog to items matching the query (the searched group is present; the result set reflects the query - result-fidelity). content-based, never a strict count |

**Expected**: The source-list search filters the product-group catalog to items matching the query (the searched group is present; the result set reflects the query — result-fidelity). Content-anchored, never a strict count.
**Data**: office=1604, query="Balloon Light Decor"

---

## TC-CPR-NPB-050: Source search by exact name narrows then clears to restore the full catalog (result-fidelity DEEP)
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Surface_Family**: result-fidelity (DEEP)
**Depends_On**: TC-CPR-NPB-049
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Detail tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Record that the unfiltered source catalog has many items (> 1). | The unfiltered source catalog displays more than one product group. |
| 2 | Search the source list for an exact group name → the list narrows to the matching item(s). | The source list narrows to show only the matching product group. |
| 3 | Clear the source search. | Searching the source list by an exact name narrows it to the matching item(s); clearing the search restores the full catalog (> 1 item again). The result set faithfully reflects the query and its clearing - never a strict count |

**Expected**: Searching the source list by an exact name narrows it to the matching item(s); clearing the search restores the full catalog (> 1 item again). The result set faithfully reflects the query and its clearing — never a strict count.
**Data**: office=1604, query="Balloon Light Decor"

---

## TC-CPR-NPB-051: Labor Save opens the confirmation dialog, and Cancel aborts without committing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-029
**Automatable**: Yes

**Preconditions**: On the Labor New Pricebook page with a savable form (Name + Year + one strategy).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the enabled Save button. | The "Save Changes" confirmation dialog appears. |
| 2 | Click "Cancel" in the confirmation dialog that appears. | On the Labor route, clicking Save opens the same "Save Changes" confirmation dialog as Equipment, and Cancel closes it without saving - proving the Save action is reachable on the Labor route (not merely that the button enables). The test stops at the confirmation step because a created pricebook cannot be removed through the UI. This is the Labor counterpart of the Equipment dialog->Cancel test (TC-CPR-NPB-024); the Labor route previously had only a Save-enable check |

**Expected**: On the Labor route, clicking Save opens the same "Save Changes" confirmation dialog as Equipment, and Cancel closes it without saving — proving the Save action is reachable on the Labor route (not merely that the button enables). The test stops at the confirmation step because a created pricebook cannot be removed through the UI. This is the Labor counterpart of the Equipment dialog→Cancel test (TC-CPR-NPB-024); the Labor route previously had only a Save-enable check.
**Data**: office=1604, type=labor

---

## TC-CPR-NPB-052: Saving a new Labor pricebook persists it — created book reloads + is found by Search with its product group
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-028
**Automatable**: Yes (the Labor counterpart of the committing test TC-CPR-NPB-031 — leaves a permanent record by design)

**Preconditions**: On the Labor New Pricebook page (office 1604). This environment is single-tenant (ours), so committing a real Labor pricebook is accepted (user-authorized). A created pricebook is irreversible via the UI (no delete/deactivate), so this test leaves a permanent record by design.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Build a savable, non-empty Labor pricebook: enter a unique Pricebook Name (a distinct Labor prefix + a passed-in run-stamp from the `PRICEBOOK_RUN_STAMP` env var, falling back to the test-runner pid — never a clock/random value), enter a Price Year, add one strategy via the dialog, switch to the Pricing Detail tab and add one Labor product group (Banners Design). | The form holds a unique Labor Pricebook Name, a valid Price Year, one strategy, and one added Labor product group (Banners Design). |
| 2 | Confirm Save is enabled, click Save, and confirm the "Save Changes" dialog (COMMIT). | Confirming the "Save Changes" dialog commits the Labor pricebook and redirects to its new Details page. |
| 3 | After the commit redirects to the new pricebook's Details page, reload that Details page and read the Pricing Detail grid. | The reloaded Details page displays the Pricing Detail grid with the added Labor product group still present. |
| 4 | Open the Corporate Pricing Search screen, turn Active-Only off, turn the "Is Labor" filter ON, filter by the unique name, and Search. | The commit redirects to /details/<new-guid> (the record now exists). On reload of the new book's Pricing Detail tab, the added Labor product group (Banners Design) is still present (content-based, never a count). The new book is discoverable by its unique name on the Search screen "only when the "Is Labor" filter is turned on" - the Search hides Labor pricebooks by default (a Labor-vs-Equipment behavior the Equipment commit test does not exercise). If this ever fails on "can't add", the likely cause is the unique source product groups have been used up (the UI has no delete to recycle them) - escalate then, not pre-emptively |

**Expected**: The commit redirects to `/details/<new-guid>` (the record now exists). On reload of the new book's Pricing Detail tab, the added Labor product group (Banners Design) is still present (content-anchored, never a count). The new book is discoverable by its unique name on the Search screen **only when the "Is Labor" filter is turned on** — the Search hides Labor pricebooks by default (a Labor-vs-Equipment behavior the Equipment commit test does not exercise). If this ever fails on "can't add", the likely cause is the unique source product groups have been used up (the UI has no delete to recycle them) — escalate then, not pre-emptively.
**Data**: office=1604, type=labor, name=`QA-Persist-LAB-<run-stamp>`, productGroup="Banners Design"
