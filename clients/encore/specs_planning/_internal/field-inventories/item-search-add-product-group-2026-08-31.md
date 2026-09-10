# Field Inventory — Item Search: Add Product Group page (APG)

**Module**: item-search-add-product-group
**Client**: encore
**MCP_Session_Date**: 2026-08-31
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Unattended catalog walk (machine enumeration + agent probes) with grep-over-disk YAML snapshots; no visual/CSS assertion and no fresh-auth need, so LR-038 v2 selects the Playwright CLI path (`playwright-cli`, session isr2, state-load of the shared auth).
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups/add
**Test_Entity**: Office 1101 - Corporate Office Encore USA SGA (admin-only feature; plan-pinned)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/item-search-2026-08-31.md
**Walk_Mode**: quick

Coverage_Ratio: 24/24 (100%) — the `dialog:add-group` state denominator, every row dispositioned below. Read the denominator caveat under **Coverage Manifest** before using this number: the enumerator's 24 keys are the LIST page's control set, because the run's snapshot fired before the route change. The Add page's OWN form carries no machine denominator; it is agent-walked per §20-Q with snapshot evidence, and every one of its fields is inventoried below.
Completion_Record: reports/walk-coverage/isr-pgr--dialog-add-group.json (status=complete, elements=24)
Walk_State: module=item-search-add-product-group walked=[dialog:add-group]
CrossCheck: clean — no A△B review-set elements were flagged by the enumerator for this run; every key sits in the union denominator and is dispositioned.
jira_tickets: [NM-2253, NM-2259]
Provenance: SPLIT from `clients/encore/specs_planning/_internal/field-inventories/item-search-product-groups-2026-08-31.md` on 2026-09-08 when NM-2259 became its own deliverable (ISR.APG) — the same treatment `item-search-add-product-code-2026-09-03.md` received when NM-2257 split from the shared Product Code artifact. **No new walk was run for this split.** Every field row, disposition, caveat and evidence pointer below is carried over verbatim from the 2026-08-31 walk and the 2026-09-02 create session; nothing was re-derived, re-dated or upgraded. The sibling artifact keeps the list page (NM-2258).
baselineScope: baseline-absent (environment-blocked — see Baseline_Artifact; 6 access attempts, TLS reset for automated browsers, curl 200)

---

## URL(s) visited

- `…/products/product-groups/add` — the Add Product Group PAGE, reached by the Add button on the group list page. It is a **route, not a dialog**. Left: sub-class item picker (search box + long list). Right: Name* / Description* / Service Type* / Active + Sub Classes dual-list ("Drag or double-click items from the left to add sub-classes") + Cancel + Save.
- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups` — the group list page, visited only as the entry point and as the search-back oracle for the create case. Its own controls are inventoried in the sibling artifact (NM-2258).

## Live-state caveat

| Field | Live (2026-08-31) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Every form field | empty / placeholder / Active checked | same | The Add page is a route with no storage persistence — each arrival is a fresh empty form. Cancel discards typed input silently, so no dirty state survives to the next visit (probed live with Name="X"). |

## Field Inventory

### Add Product Group page (agent-walked, §20-Q — snapshot `.playwright-cli/isr-2026-08-31/pgr-add-page.yml`)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Name | `(none) — placeholder "Enter Product Group Name"` | Plain text | empty | required (Save stays disabled with it empty; typed value alone did not enable Save) | enabled | n/a | `affordance: none`. |
| Description | `(none) — placeholder "Enter Product Group Description"` | Plain text | empty | required | enabled | n/a | `affordance: none`. |
| Service Type | `(none) — trigger shows "Service Type"` | Dropdown / combobox (Radix) | placeholder | required | enabled | n/a | Options unenumerated at this tier (deferral). |
| Active | `(none) — checkbox in the form` | Checkbox (native + Radix) | checked | n/a | enabled | n/a | |
| Sub Classes | `(none) — dual-list region` | Drag-and-drop source row (dual-list picker) | empty; instruction "Drag or double-click items from the left to add sub-classes" | required (starred) | enabled | picker search box filters the left list | Left list is very large (whole sub-class catalog). Drag path is deep-tier; the double-click add path is covered by TC-ISR-APG-004. |
| Cancel | `(none) — text "Cancel"` | *(action)* | n/a | n/a | enabled | returns to the list page; typed input discarded silently (no unsaved-changes prompt — probed live with Name="X") | |
| Save | `(none) — text "Save"` | *(action)* | n/a | n/a | **disabled** at rest and with only Name filled; **enabled** once Name, Description, Service Type and ≥1 Sub Class are all set | validity-gated | Clicked on 2026-09-02 — see Save-cycle observations. |

## Labels + Section Names

- Page sections: the left sub-class picker (its own search box over the catalog list) and the right form. The form's starred labels are Name, Description, Service Type and Sub Classes; Active is unstarred.
- Instruction text under Sub Classes: "Drag or double-click items from the left to add sub-classes" — rendered with non-breaking hyphens, so any assertion on it must be hyphen-agnostic.

## Save-cycle observations

### Save button behavior
Disabled at rest and while required fields are incomplete (Name alone did not enable it). Enables once Name, Description, Service Type and at least one Sub Class are set — proven live 2026-09-02.

### Save dialog
None. Save commits directly with no confirmation dialog (2026-09-02).

### Post-save toast
"Product Group created successfully", followed by a redirect to the group list page (2026-09-02).

### Dirty-state behavior
No unsaved-changes guard: Cancel with a typed Name returned to the list silently, input discarded (probed live). Consistent with the module-wide guard absence (3 probes across surfaces).

## Observations

### Bugs / Defects
- none for this surface. (The empty-search semantics discussion item belongs to the list page and is recorded in the sibling artifact.)

### Suggestions / Improvements
- The dual-list picker advertises drag as the primary path but double-click is the reliable one; drag frequently never fires the drop. Worth confirming with the product team whether drag is intended to be dependable.

## LR-029 missing-testid report

Verified against live DOM by the enumerator (2026-08-31 runs), not from a static grep.

| Control | Surface | Has testid | Next-best stable anchor |
|---|---|---|---|
| Name, Description | add page | no | placeholders ("Enter Product Group Name" / "Enter Product Group Description") |
| Service Type, Active, Cancel, Save | add page | no | text content / accessible name |
| Sub-class picker search + list rows | add page | no | placeholder "Search"; `[draggable="true"]` for the rows |

## Staleness signal

- **Last verified**: 2026-08-31 (structure) · 2026-09-02 (create path)
- **Fresh-until**: 2026-09-14
- **Stale-after**: 2026-09-30
- **Refresh triggers**: Add becomes a dialog instead of a route · the required-field set changes · Save gains a confirmation dialog · the Sub Classes picker gains testids · the create endpoint changes.

## Coverage Manifest (machine-enumerated)

Machine denominator: **24** — the `dialog:add-group` state. Provenance: `reports/walk-coverage/isr-pgr--dialog-add-group.json` (24). All 24 rows dispositioned. **Coverage_Ratio: 24/24.**

**Denominator caveat (carried over verbatim — do not read this number as Add-page form coverage)**: the branch clicked Add, but the run's snapshot preceded the route change, so the enumerated key set is the LIST page's, not the Add form's (the state label "dialog" is a recorded misnomer — Add is a page route). All 24 keys therefore duplicate the list-page manifest dispositions held in the sibling artifact `item-search-product-groups-2026-08-31.md`; they are not re-listed here, because re-listing list-page keys under an Add-page artifact would misreport what the enumerator counted.

**What actually covers this page**: the Add form is agent-walked per §20-Q with snapshot evidence (`.playwright-cli/isr-2026-08-31/pgr-add-page.yml`) and every field is inventoried in the Field Inventory table above — covered by TC-ISR-APG-001 (required-empty form, held-back Save), TC-ISR-APG-002 (picker structure), TC-ISR-APG-003 (silent discard on Cancel) and TC-ISR-APG-004 (real create + search-back). Two deferrals ride the picker fields:

| element/launcher | disposition |
|---|---|
| `pgr-add-duallist-drag` | deferred-to-DEEP: drag-to-add mechanics on the sub-class picker are deep-tier work; the reliable double-click path is covered by TC-ISR-APG-004 |
| `pgr-add-servicetype-options` | deferred-to-DEEP: option-set enumeration for the add-form dropdown is deep-tier here |

### §3 surface families (LR-065)

The Add page is a form, not a result surface. The dual-list picker's left panel is a list —
- **render-state** → TC-ISR-APG-002 (QUICK — the picker renders its two panels and its instruction)
- `out-of-scope:result-fidelity=the picker's own search over the sub-class catalog is a deep-tier filter check, not a result grid this tier asserts`
- `out-of-scope:pagination=the picker list scrolls; it renders no pagination control`
- `out-of-scope:empty-vol=no empty state is reachable at this tier — the catalog is always populated on 1101`
- `out-of-scope:persistence=the page is a route with no stored criteria; Cancel discards and each arrival is a fresh form`
- `out-of-scope:sorting=the picker list exposes no sort affordance`
- `out-of-scope:combination=the form has one validity gate over its required set; no multi-criteria intersection exists to combine`

### Opener frontier (state-graph exhaustion)

- **Sub-class picker**: opened + walked (snapshot evidence); its drag path and the full catalog list are deferred.
- **Service Type dropdown**: opened during the 2026-09-02 create (one option chosen); the full option set is deferred.
- **Cancel / Save**: both driven — Cancel on 2026-08-31, Save on 2026-09-02.

## Save & cleanup disposition (2026-09-02)

- **Create Product Group save is covered** by TC-ISR-APG-004: a completed Add page (Name / Description / Service Type / ≥1 Sub Class added by double-click) saves via `POST /navigator/api/location/add-update-product-group` — verified live, product group id 4581 — and is confirmed by a Product Groups search-back per LR-067.
- **Cleanup**: there is no hard delete for a product group, and the deactivate-via-edit path was **not** pinned this pass, so the create case leaves its per-run-unique group on 1101. This accumulation is accepted test residue on the fully-writable e2e environment (LR-ENC-007), stated here rather than hidden.
- **Sub-class add path**: the reliable **double-click** path is covered; the drag path is a deferral (flaky, frequently never fires the drop).
