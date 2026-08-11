---
artifact: jira-defect-crossref
module: service-charge
client: encore
session_date: 2026-08-10
author_identity: HUNTER
parent_subplan: PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK.md
rovo_available: true
jira_tickets: [NM-3344, NM-2207, NM-2209, NM-2210, NM-2211, NM-2215, NM-2208, NM-3097, NM-644, NM-3121, NM-3359, NM-3358, NM-3336, NM-3324, NM-3303, NM-3302, NM-3300, NM-3285, NM-3282, NM-3279, NM-1249, NM-3165]
scan_scope: "project = NM AND summary ~ 'service charge' (34 hits, all statuses) + Confluence CQL text ~ 'service charge' AND type = page (25 hits) + NM-3344 remote links (0)"
---

# Jira / Confluence cross-reference — Service Charge (NM-3344)

> **Every fact below is a LEAD (intent-truth), not a verdict.** Each must be re-verified against the
> live DOM (render-truth) during the baseline and new-site walks per ALL-024. A DOM-vs-Jira divergence
> is signal to classify (intentional-UX / app-bug / stale-ticket per REQ-014), never an automatic win
> for Jira.

## §1 — Scan performed

| Source | Query | Hits | Notes |
|---|---|---|---|
| Jira | `project = NM AND text ~ "service charge"` | oversized | Full-text hit set exceeded the response limit; narrowed to summary scope below |
| Jira | `project = NM AND summary ~ "service charge" ORDER BY created DESC` | **34** | All statuses (To Do / In Progress / QA / Code Review / Done / Rejected). Full list in §2 |
| Jira | remote issue links on NM-3344 | **0** | No linked external artifacts |
| Confluence | `text ~ "service charge" AND type = page` | **25** | **No Navigator-era Service Charge spec page exists.** 24 of 25 are legacy eOS / EMS-migration-era pages (2017–2019, spaces `EOS` / `ED` / `ETEM`) describing the *predecessor* product's service-charge tax/calculation behavior — not this module. The only current-era hit is `Sprint 2026-16` (space NM, 2026-08-06), a sprint-planning page with no field spec |

**Confluence disposition**: no usable Confluence spec for this module. The Jira story acceptance criteria
(§3) are the intent-truth source. The legacy eOS pages are deliberately NOT consulted as behavior
oracles — a spec carrying the product name may describe a predecessor system.

## §2 — Full Jira hit set (34), with relevance disposition

### Feature-build stories — the intent-truth spine

| Key | Type | Status | Summary | Disposition |
|---|---|---|---|---|
| NM-3344 | Story | In Progress | Automate → Setup → Service Charge | **THE TICKET** — our automation scope |
| NM-2207 | Epic | To Do | Service Charge | Parent epic of the build stories |
| NM-2209 | Story | QA | SC- UI: Service Charge Basic Information page | **ORACLE — Basic Information tab.** ACs in §3.1 |
| NM-2210 | Story | QA | SC- UI: Service Charge History page | **ORACLE — History tab.** ACs in §3.2 |
| NM-2211 | Story | QA | SC- UI: Service Charge Change Office Location Modal | **ORACLE — office selector.** ACs in §3.3. Scope discovery — see §5 |
| NM-2215 | Story | Code Review | SC- API: Update Service Charge | Save endpoint owner |
| NM-2208 | Story | Done | SC- UI: Create Standalone web component for Service Charge (Client) | Superseded by NM-3121 |
| NM-3121 | Story | Done | Remove Web component for Service Charge in Host | **The surface is MFE-only** — no legacy Host web component |
| NM-3097 | Story | Done | Core Service - Location Service Charge Percentage History | Backend feeding the History tab |
| NM-644 | Story | Done | Core- Service Charge Options endpoint | Service-type options source |

### QA defects — all resolved Done. Each is a fixed-behavior oracle AND a regression target.

| Key | Status | Summary | Coverage relevance |
|---|---|---|---|
| NM-3359 | Done | Percentage field shows no validation message for invalid values | **Rejection-affordance "announced" oracle** — after the fix an invalid value must show a message, not just a red border. Detail in §3.4 |
| NM-3324 | Done | Percentage mishandles decimals below 1 vs Legacy (`0.001` → `0.00%`) | **Boundary cases + baseline comparison.** Detail in §3.5 |
| NM-3282 | Done | Percentage not editable for certain locations | **Primary-office eligibility rule.** Detail in §3.6 — gates whether office 1604 is usable at all |
| NM-3279 | Done | Service Types not in alphabetical order | **Sorting oracle** — expected A–Z list quoted in §3.7 |
| NM-3303 | Done | Duplicate Service Type entries displayed in the list | Duplicate-row check on the Basic grid |
| NM-3302 | Done | History grid columns overlap at 100% browser zoom on laptop display | Render/layout defect — visual observation check during the walk |
| NM-3300 | Done | Local Office name not displayed in the History header | History header must carry the office name (matches NM-2210 AC-5) |
| NM-3285 | Done | Unsaved-Changes modal not shown when navigating to the History tab | **Dirty-state oracle — cross-tab** |
| NM-3358 | Done | Unsaved-Changes dialog not shown when navigating via the Location selector | **Dirty-state oracle — office switch** |
| NM-3336 | Done | Update Service Charge or T&C to NEW text does not work (backend updates) | Adjacent — text update path shared with the Text module |
| NM-1249 | Done | Locations: Data Sync Issue for Service Charge | Historic data-sync defect; no current coverage action |

### Adjacent / not this module

| Key | Status | Summary | Why excluded |
|---|---|---|---|
| NM-3345 | In Progress | Automate → Setup → **Service Charge Text** | **Sibling automation ticket for the OTHER module** — confirms Service Charge ≠ Service Charge Text |
| NM-1694 / NM-1728 / NM-2188 / NM-2311 / NM-2922 / NM-2924 / NM-3126 | mixed | Service Charge **Text** epic, stories, defects | Different module — already covered by the existing service-charge-text suite |
| NM-3221 | **Rejected** | Legal-tab dropdowns for Service Charge Name and T&C not sorted | **Rejected = known non-bug.** Do NOT file a sorting bug against the Legal tab dropdowns |
| NM-825 / NM-664 / NM-582 / NM-710 | Done | Legal-tab and Account-Address terms/service-charge-name plumbing | Different tabs, already covered |
| NM-3165 | referenced | ARMS NAVOrderEntry permission migration | **Explicit out-of-scope** — see §4 |

## §3 — Acceptance criteria extracted (the walk oracles)

### §3.1 — NM-2209, Basic Information tab

1. Page loads with the Basic tab selected by default.
2. Displays the selected local office context.
3. Displays all returned service types with **service type name** and **service charge percentage**.
4. Users with edit permission can edit percentages **only when the selected office is a primary office**.
5. Users without edit permission can view but not edit.
6. **Percentage validation allows only values from 0 to 100 inclusive.**
7. Invalid percentages block save AND show validation feedback.
8. Editing any row marks the screen as having unsaved changes.
9. Save stays disabled when: no changes / form invalid / no edit permission / office is not primary.
10. Saving commits any active edit before submission.
11. On success, dirty state clears and updated data remains visible.
12. On save failure, an error message shows and unsaved changes remain.
13. On update, changes are saved into the local history (this is what feeds the History tab).

APIs: `GET /api/servicecharges/location/{locationNo}` · `GET /api/servicetypenames/{culture}` · update `/api/servicecharges` · location lookup.

### §3.2 — NM-2210, History tab

1. History tab sits alongside the Basic tab.
2. Opening it loads history for the currently selected local office.
3. Read-only data grid.
4. Columns: **Service type · Service charge percentage · Modified by · Modified on**. Action and Notes columns are explicitly "not needed and removed in MFE".
5. Heading reflects the currently selected office.
6. Basic → History preserves office context.
7. History records are not editable.
8. Load failure shows an error state.
9. Same office context as Basic without a page reload.

APIs: `GET /api/servicecharges/location/{locationNo}` · `GET /api/product/servicetypes/{culture}`.

### §3.3 — NM-2211, office selector / Change Office Location modal

1. Non-corporate users see their assigned local office read-only.
2. Corporate users can open the office selector modal and choose another office.
3. Selector lists offices from the location source (`/api/location-lookup`).
4. Selecting an office updates office context across the screen.
5. Basic tab data reloads for the selected office.
6. **Primary-office eligibility is re-evaluated for the selected office.**
7. Both tabs use the selected office context.
8. Office load failure shows an error state.
9. Dismissing without selection leaves the previous office unchanged.
10. Selected office name AND identifier are visible after selection.

### §3.4 — NM-3359 (validation message)

An invalid percentage (e.g. `101` or `-1`) originally produced a red field border and a disabled Save
button but **no message**. Expected and now fixed: a clear validation message naming the accepted range
(the ticket's example wording is *"Service Charge Percentage must be between 0% and 100%."*).
**The exact live message text must be captured verbatim during the walk** — the ticket wording is an
example, not a guaranteed literal.

### §3.5 — NM-3324 (decimals below 1)

Values `0.001`, `0.01`, `0.1` displayed inconsistently versus Legacy; `0.001` rendered as `0.00%`.
Expected: the new site matches Legacy display. **The walk must capture the live post-save display for
each of the three values on both the new site and the baseline** — this is the strongest
baseline-comparison case on the surface.

### §3.6 — NM-3282 (edit eligibility is office-dependent)

Percentages display but do not enter edit mode for some locations (reported on
`1144 — Renaissance Baton Rouge Hotel`). Expected: editable for locations meeting "the configured edit
eligibility rules" — i.e. the primary-office rule from NM-2209 AC-4.

**This is the highest-risk unknown for our coverage**: if office 1604 is not a primary office, every
field-level edit and save case is un-runnable there. The walk must resolve this before any case
authoring, and the choice of an alternative office is a user decision, not an agent one.

### §3.7 — NM-3279 (alphabetical ordering) — expected Service Type list, verbatim from the ticket

Cancellation Fee · HSIA - Equipment · HSIA - Labor · Operator Labor · Reimbursed Expense ·
Rigging Equipment Rental · Rigging Equipment - Subrental · Rigging Labor · Rigging Labor - External ·
Sales & Consumables · Service Charge · Setup Charges · Sub-Rental Equipment · Venue Equipment Rental

**Treated as a LEAD, not a contract** — a quoted label list is a guess until the live set is read. The
walk enumerates the live service types itself; this list serves as the ordering oracle (ascending A–Z),
not as a frozen membership list.

## §4 — Explicit scope exclusion from the ticket authors

The NM-2209 QA note instructs: test everything but do NOT test edit-access based on the ARMS
NAVOrderEntry permission — permission migration into the MFE is in progress and is owned by **NM-3165**,
where it will be tested. Therefore **permission-based edit-access cases are OUT OF SCOPE** for this
coverage. Primary-office eligibility (a different gate) remains IN scope.

Both NM-2209 and NM-2211 also note the surface is **Cloud Navigator MFE only — there is no web
component in the legacy Host**, consistent with NM-3121 removing it. This has a direct consequence for
the baseline walk: a like-for-like legacy equivalent of this exact screen may not exist, even though
NM-3324 compares percentage formatting against "Legacy". The baseline walk resolves which is true.

## §5 — Scope discovery: the office selector is a third surface element

The plan modelled this page as two sub-tabs. NM-2211 establishes a **third element**: the local-office
selector/modal that owns the office context shared by BOTH tabs, and whose selection re-evaluates
primary-office edit eligibility.

**Disposition — no scope extension, no new spec file.** The selector is the office-context surface of
the Basic Information page and is covered as a launcher within the Basic Information spec (the
established per-launcher coverage pattern). The two-spec constraint holds. Recorded as plan
deviation **D-1**.

## §6 — Questions the walk must answer FIRST (blocking, in order)

1. **Is office 1604 a primary office?** If not, is the percentage grid read-only there (NM-3282 /
   NM-2209 AC-4)? If 1604 cannot edit, escalate before authoring edit/save cases.
2. Does the automation user see the surface as corporate (selector modal available) or non-corporate
   (office read-only)? Governs whether the NM-2211 modal path is reachable at all.
3. What is the verbatim live validation message for an out-of-range percentage (NM-3359 fix)?
4. What are the live Service Type rows and their live on-screen order (NM-3279 fix)?
5. Does the History tab populate after a Basic save (NM-2209 AC-13), and what are its live column
   headers (NM-2210 AC-4)?
6. Does a legacy equivalent of this Setup → Service Charge screen exist? NM-3324 compares against
   "Legacy", which implies yes, but NM-3121/NM-2209 say the component was removed from the Host. The
   baseline walk settles this; `baselineScope: baseline-absent` is a legitimate recorded outcome.

## §7 — HALT check (intake gate)

Are any in-flight behavioural-change tickets going to change what "correct" means for this module?

- NM-2209 / NM-2210 / NM-2211 sit in **QA** and NM-2215 in **Code Review** — the feature is built and
  under test, not mid-redesign. The 11 QA defects against it are all **Done**.
- NM-3165 (permission migration) will change edit-access behavior later, but its scope is explicitly
  excluded from this coverage by the ticket authors (§4).

**Verdict: no HALT on intake grounds.** The surface is stable enough to walk and cover. The one live
risk is the office-eligibility question in §6.1, which the walk resolves rather than assumes.

## §8 — Execution status of this artifact

The Jira/Confluence intake is COMPLETE. The walks that consume it (baseline and new-site) are
**BLOCKED on browser-session availability**, not on anything in this document — see the session-recon
evidence at `.claude/state/ua-worker/nm3344-recon-0810/step1-url.verify.txt`. No walk claim, no field
inventory, and no divergence classification exists yet; none may be written until the walks actually run.
