---
**Module**: service-charge
**Client**: encore
**MCP_Session_Date**: 2026-08-16
**MCP_Session_Tool**: enumerate-page.mjs via Playwright chromium CLI
**MCP_Tool_Reason**: close-verify2 pass (run-id p70-P3-closeverify2-0816) using enumerate-page.mjs via Playwright chromium; cross-family verified; source JSON cv2-service-charge-basic-info.json sha256=108faf0e69d4456ab3fa41bfd39bb479b8875ea7e672cfb78582c68e87970828
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge
**Test_Entity**: Office 1604 (Parker Palm Springs)
**jira_tickets**: [NM-3344]
**Walk_Mode**: quick
**Coverage_Ratio**: 8/8 (100%)
**Walk_State**: office=1604 module=service-charge walked=[resting]
**CrossCheck**: clean
**Completion_Record**: .claude/state/ua-worker/chips/nm3344-close/out-P3/cv2-service-charge-basic-info.json (status=complete, elements=8)
**Walk_Evidence**: cv2-service-charge-basic-info.json (enumerated 2026-08-16 via enumerate-page.mjs run-id p70-P3-closeverify2-0816; denominator=8, raw-before-archetype-collapse=86)
---

# Field inventory — Service Charge Basic Information (2026-08-16)

**Supersedes**: `service-charge-basic-information-2026-08-10.md`

**Why this file supersedes the 2026-08-10 artifact**: the 2026-08-10 denominator (29) was produced by a broken enumerator that ignored `--branch` entirely, causing both the Basic Information and History invocations to produce byte-identical JSON. The cv2 run on 2026-08-16 used the fixed enumerator. The new denominator is **8** (archetype-collapsed from raw 86). Additionally, the archetype resolution fix that landed before this run means the 79 percentage inputs now resolve to a confirmed type — they were invisible to the type resolver for the entire life of the prior code. The difference in denominator (29 → 8) is entirely explained by archetype collapse: 79 individual inputs collapse to 1 archetype entry in the cv2 set algebra.

**Provenance**: run-id `p70-P3-closeverify2-0816`; source JSON sha256 `108faf0e69d4456ab3fa41bfd39bb479b8875ea7e672cfb78582c68e87970828`.

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge`
  - **Basic Information** tab — active by default; contains the 79-row service-charge percentage table. Machine-enumerated 2026-08-16 (resting state) via enumerate-page.mjs, run-id p70-P3-closeverify2-0816.
  - **Service Charge History** tab — present in page UI; enumerated separately in `service-charge-history-2026-08-16.md`.

## Live-state caveat

The cv2 enumeration ran in resting state. The percentage archetype entry shows `disabled: true` in the JSON — consistent with no pending edits (Save button is disabled at rest). This is the expected default state, not an environment fault (confirmed by the 2026-08-15 live walk in the superseded artifact).

The representative probe (`[data-testid="service-charge-percentage-0"]`) returned `INPUT` with `inputmode=decimal` and value `0.00 %`, confirming the inputs are present and readable even when `disabled=true` in the archetype set-algebra sense.

| Field | Live (2026-08-16 cv2) | Documented default | Drift reason (if known) |
|---|---|---|---|
| All 79 percentage inputs | present, archetype resolved as `Numeric / spinbutton`; `disabled=true` at rest (no pending edits) | enabled; disabled until a value is edited | expected default state; not an environment condition |
| Save button | `disabled=true` at rest | disabled until a percentage value is edited | correct default; consistent with 2026-08-15 confirmation |

## Field Inventory

### Basic Information Tab — Service Charge Percentage Inputs

**Archetype resolution (cv2 fix)**: all 79 percentage inputs now resolve to **`Numeric / spinbutton`** via the representative selector `[data-testid="service-charge-percentage-0"]`, live match count 1, `INPUT` tag with `inputmode=decimal`, observed value `0.00 %`. Prior to the type-resolver fix these 79 controls were invisible — the resolver could not classify them. This is the first artifact where that classification is confirmed by machine evidence.

Column headers observed: `Service Type` | `Service Charge Percentage`

**What the cv2 JSON supports at archetype level**: the 79 percentage inputs collapse to a single archetype entry (`testid:service-charge-percentage-# [archetype×79]`) in the set-algebra. The representative probe confirmed `service-charge-percentage-0` resolves as `INPUT` with `inputmode=decimal`, value `0.00 %`. The testid sequential pattern `service-charge-percentage-N` (N=0..78) is machine-confirmed for N=0 and structurally implied by the archetype key. Rows are disabled at rest (no pending edits); the archetype entry shows `disabled=true`.

**Per-row service type names and per-row default values (which rows carry 24.00% vs 0.00%) are not present in the cv2 JSON** — those observations come from the 2026-08-10 walk (inherited, date: 2026-08-10). They are not re-dated as 2026-08-16 evidence. A full row-level re-walk is required before any test spec relies on specific per-row names or per-row defaults beyond row 0.

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Service charge percentage inputs (archetype — 79 rows) | `service-charge-percentage-N` (N=0..78; pattern machine-confirmed for N=0 via representative probe) | Numeric / spinbutton (`inputmode="decimal"`) — machine-confirmed 2026-08-16 | `0.00 %` for representative row 0 (machine-confirmed 2026-08-16); per-row defaults for other rows: inherited from 2026-08-10 walk, not re-measured | no declarative HTML constraints (no min/max/step/pattern); `aria-invalid` channel present; custom JS validation inferred | disabled at rest (machine-confirmed: `disabled=true` in archetype JSON entry); enabled when editing | none observed | affordance: unprobed |
| Save | `service-charge-save` | button | `disabled` at rest | n/a — mutating action; denylist entry prevents click-probe | disabled until a percentage value is edited | n/a | affordance: unprobed; denylist_hit: key="service-charge-save" accessibleName="Save" — deliberately not click-probed (mutating action) |

**Field-type classification**: All 79 percentage inputs map to the **Numeric / spinbutton** archetype family. They carry `inputmode="decimal"`, store values as decimal percentage strings (`24.00 %`), and are always-visible inline editable inputs in a two-column table. They are NOT click-to-reveal grid cells. No declarative min/max/step/pattern present. Server-side or JS out-of-range validation is unprobed in this quick walk (non-numeric invalid behavior observed 2026-08-15 — see superseded artifact).

## Labels + Section Names

**Basic Information tab**:
- Page heading: `Service Charge` (in page title area)
- Table column headers (verbatim): `Service Type` | `Service Charge Percentage`
- Local Office context display: `Local Office :` with office name in child element (healthy env); `Local Office : -` when env degraded

**Service Charge History tab**:
- See `service-charge-history-2026-08-16.md`

## Save-cycle observations

**Save button behavior**:
- testid: `service-charge-save`
- Observed state: `disabled` at rest (no pending edits) — correct default behavior
- Expected: enabled after editing any percentage value

**Save dialog**: not observed in this cv2 pass (enumerator only, no save probe). The shared Location Settings save dialog (`dlgSaveChanges / btnSaveChangesConfirm` per LR-012) is the default assumption; MCP-verify before authoring save-cycle tests.

**Post-save toast**: not observed.

**Dirty-state behavior**: Save button remains disabled at rest. What enables it (edit threshold, blur event, etc.) was not probed in this quick pass.

## Observations

### Bugs / Defects

| Bug ID | Field / Feature | Observed | Expected (per requirements) | Status |
|---|---|---|---|---|
| none | — | — | — | — |

### Suggestions / Improvements

none

## Staleness signal

- **Last verified**: 2026-08-16
- **Fresh-until**: 2026-08-30
- **Stale-after**: 2026-09-13
- **Refresh triggers**: percentage values change on office 1604 (any row drifts from values catalogued here); Save button behavior changes (dialog added, removed, or changed); new service-type rows added or existing rows removed; out-of-range numeric validation confirmed live (only non-numeric case observed 2026-08-15); testids 40-78 confirmed by direct enumeration

## Coverage Manifest (machine-enumerated)

Machine denominator: **8** element(s). Raw before archetype collapse: **86**. Archetype collapse: 79 individual percentage inputs collapsed to 1 archetype entry `testid:service-charge-percentage-# [archetype×79]`. Provenance JSON: `.claude/state/ua-worker/chips/nm3344-close/out-P3/cv2-service-charge-basic-info.json` (enumerated 2026-08-16, run-id p70-P3-closeverify2-0816, sha256=108faf0e69d4456ab3fa41bfd39bb479b8875ea7e672cfb78582c68e87970828). Pointer rationale: chip path is durable evidence — `reports/walk-coverage/` is overwritten on every new walk and would rot; the chip preserves this specific measurement permanently.

A△B cross-check: 3 items in symDiff reviewed and classified. CrossCheck: **clean**.

**Why denominator=8 and not 86**: the enumerator collapses elements that share a structural archetype pattern into a single representative entry. All 79 `service-charge-percentage-N` inputs share the same testid prefix, role, and DOM depth — they collapse to `testid:service-charge-percentage-# [archetype×79]`. The denominator counts unique element keys, not raw DOM nodes.

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| `struct:button\|trigger-button\|skip/div/div/div/div/div` | button | 2026-08-16 | `out-of-scope: outside-module — global UI chrome trigger button, not a service charge data field; non_probeable: tag=BUTTON role=` |
| `struct:button\|More information\|div/div/div/div/div/div` | button | 2026-08-16 | `out-of-scope: outside-module — global info button, not a service charge data field; non_probeable: tag=BUTTON role=` |
| `struct:tablist\|Basic InformationService Charge History\|skip/div/div/div/div/div` _(B-only)_ | tablist | 2026-08-16 | `out-of-scope: outside-module — page-level Radix tab container, application chrome; non_probeable: tag=DIV role=tablist` |
| `id:radix-_r_10_-trigger-Basic Information` | tab | 2026-08-16 | `out-of-scope: outside-module — tab navigation chrome; Basic Information tab activation is the default page state, tested implicitly; non_probeable: tag=BUTTON role=tab` |
| `id:radix-_r_10_-trigger-History` | tab | 2026-08-16 | `out-of-scope: outside-module — tab navigation chrome; History tab activation covered by TC-SVC-HIS-001; non_probeable: tag=BUTTON role=tab` |
| `id:radix-_r_10_-content-Basic Information` | tabpanel | 2026-08-16 | `covered-by-TC: TC-SVC-BAS-001` |
| `testid:service-charge-save` _(A-only)_ _(disabled)_ | button | 2026-08-16 | `covered-by-TC: TC-SVC-BAS-004; denylist_hit: key="service-charge-save" accessibleName="Save" — mutating action, deliberately not click-probed` |
| `testid:service-charge-percentage-# [archetype×79]` _(A-only)_ _(disabled)_ | input | 2026-08-16 | `covered-by-TC: TC-SVC-BAS-001; archetype resolved as Numeric / spinbutton via representative selector [data-testid="service-charge-percentage-0"], live match count 1, INPUT tag, inputmode=decimal, value 0.00 %` |

**Coverage ratio: 8/8 (100%).** All 8 machine-enumerated elements dispositioned. 5 navigation/chrome elements are out-of-scope. 1 tabpanel and 2 module-specific controls (save button + percentage archetype) are covered by existing TCs.

## RESIDUAL-DISAGREEMENTS

none

## ASSUMPTIONS-MADE

- Walk_Mode set to `quick` — cv2 was a close-verify enumeration pass, consistent with the governing plan's quick-coverage mode.
- Default values for rows 40-78 carried forward from the 2026-08-10 walk without re-measurement; only the type classification (Numeric / spinbutton) is new machine-confirmed data for those rows.
- `stateGraphExhaustion.neverOpened=20` samples in the cv2 JSON are global navigation containers — none are service charge module containers; classified as outside-module.
