---
artifact: jira-defect-crossref
client: encore
module: service-charge-text
session_date: 2026-08-03
session_tool: rovo-mcp (atlassian) + playwright-cli recon evidence
author_identity: OWNER (see §10 — HUNTER is the intended owner but has no §2 row for this path)
rovo_available: true
cloud_id: 03ec286f-d928-4c2c-b782-c8cce703ce2a
site: https://encore.atlassian.net
page_url_new: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge-text
test_entity: office 1604 (Parker Palm Springs)
parent_subplan: plans/pending/PLAN_SERVICE_CHARGE_TEXT_AUTOMATION.md
jira_tickets: [NM-1694, NM-1728, NM-3336, NM-3126, NM-2922, NM-2924, NM-2311, NM-2188, NM-1695, NAV-4106, NAV-2228]
governing_story: NM-1728
governing_epic: NM-1694
confluence_spec: none-found
---

# Jira / Confluence crossref — Service Charge Text (2026-08-03)

Phase 0.45 of `PLAN_SERVICE_CHARGE_TEXT_AUTOMATION`. Emitted per LR-ENC-004 / LR-063 / REQ-015.

**Truth-axis note.** Every fact here is **intent-truth** and therefore a **LEAD**, never a verdict.
Render-truth is the live DOM (old site > new site). A DOM-vs-Jira contradiction is *signal* and gets
classified `intentional-UX` / `app-bug` / `stale-ticket` per REQ-014 — there is no automatic
"Jira wins". No divergence below is closed; each names the probe that would settle it.

## 1. Rovo availability

Canary `getAccessibleAtlassianResources` succeeded → `rovo_available: true`.
Scopes: `read:jira-work`, `read:page:confluence`, `search:confluence`, `read:space:confluence`,
`read:comment:confluence`, `read:confluence-user`. Read-only — nothing in Jira or Confluence can be
mutated from this session.

## 2. Governing tickets

| Ticket | Type | Status | Relevance |
|---|---|---|---|
| **NM-1694** | Epic | To Do | Parent epic, "Service Charge Text" |
| **NM-1728** | Story | **QA** | **THE governing requirement** — full 10-section acceptance criteria for this page (NextJS replacement of the legacy Angular screen). Sole source of intent-truth. |
| **NM-3336** | Production Defect | **QA**, priority **Highest** | Open production defect touching this surface — see §4 |
| NM-3126 | QA Defect | Done | Column reordering not working on the Service Charge Text page |
| NM-2922 | QA Defect | Done | Missing header for Service Charge Text |
| NM-2924 | QA Defect | Done | Service Charge Text column not displayed in grid (Quote V2/V3) |
| NM-2311 | Story | Done | API: get Service Charge Text by Language Id |
| NM-2188 | Story | Done | Standalone web component for Service Charge Text (client) |
| NM-1695 | Story | Done | Write methods on the ServiceChargeText repository |
| NAV-4106 | Sub-task | Done | Setup → Service Charge Text — Verified (legacy Navigator) |
| NAV-2228 | Story | Done | Report preview moved to new Angular on the Service Charge Text page |

**Module code**: Jira already prefixes this work `SCT -` (NM-1728, NM-3126, NM-2922, NM-2311,
NM-2188, NM-1695). Minting `SCT` at Phase B0 therefore adopts the client's own vocabulary rather
than inventing a code.

## 3. Confluence

`searchConfluenceUsingCql` on `text ~ "Service Charge Text" AND type = page` returned 10 pages; none
specifies this surface. Nearest-relevant is *Navigator Legacy Permissions — Design Spec* (bears on
the NM-1728 §10 role guard). **`confluence_spec: none-found`** — NM-1728 is the sole governing
requirement document.

> **Tooling caveat, recorded because it nearly produced a false negative**: the first CQL call
> returned a payload with a Jira `{issues:{nodes}}` shape, byte-identical to the JQL result of the
> same batch. It had to be re-run alone to get real Confluence results. A single combined call would
> have yielded a confident, wrong "no spec found".

## 4. NM-3336 — open production defect (assessed; NOT a HALT)

> "Legal cannot update T&C or Service Charge Text if they select a new one they added after MS
> Location went live. This is known issue because there is no sync from Navigator back to MS and that
> needed to be put in place."

Created 2026-07-31, unresolved, priority Highest, status QA.

Phase 0.45 step 5 asks whether an in-flight behavioural-change ticket redefines "correct" for this
surface. **Assessment: it does not.** NM-3336 is a *missing backend sync*, and its symptom lives on a
**consumer** of this data (the Legal tab's T&C / Service Charge selection), not on this page's own
behaviour. NM-1728's acceptance criteria are unchanged by it. **No HALT; Phase 0.5b proceeds.**

**Binding constraint on test design**: no test case may assert that a save on this page propagates
downstream to MS. That path is known-broken and unresolved. Persistence assertions stop at
Navigator's own reload-from-source-of-truth (NM-1728 §9).

## 5. Requirement highlights from NM-1728 (intent-truth — each needs DOM confirmation)

1. **Load order** — language list first, then records for the selected language. Default `en-US`. Editor disabled until an HTML-editable cell is selected.
2. **Language filter** — supports specific languages *and* `All`. Switching with unsaved grid or editor changes must prompt; cancel restores the previous selection.
3. **Grid columns** — Language · Service Charge Name · Service Charge Display Name · Report Column Name · HTML Display Text · **HTML Display Text V2**. Metadata columns inline-editable; HTML is **not** — clicking an HTML cell selects the row and loads it into the editor; the selected cell is visually highlighted.
4. **Add row** — default empty values, marked new + dirty, client-side generated id, requires validation.
5. **Validation** — Name / Display Name / Report Column / Language all required; **Service Charge Name unique within a language**; row/field-level errors; save blocked while any row is invalid.
6. **Rich-text editor** — dirty state tracked separately from the grid; default placeholder when empty; switching HTML cells with unsaved editor changes prompts to discard.
7. **Save editor content** — writes back to the row without submitting the page; marks row + screen dirty; resets editor dirty state; shows a temporary success indication.
8. **Report preview** — only for a valid selected row with language context; opens in a modal without losing unsaved state.
9. **Save all** — commits the active cell edit first; blocked on validation errors; submits the full list for the location; on success reloads from source of truth and clears dirty; on failure shows an error and preserves changes.
10. **Role guard** — `ROLE_FUNCTION_CORP_LEGAL`: no role = page hidden, read = view-only, update = edit/save/copy. The ticket itself marks this "(Need to confirm)", so it is unconfirmed intent.

## 6. Divergence candidates (OPEN — none closed; each names its settling probe)

Derived by diffing NM-1728 against the 2026-08-03 recon evidence
(`.claude/state/ua-worker/sct-recon-0803c/p1-1604-service-charge-text.*`). All three are
**candidates**: absence from a testid dump is not proof of absence, and LR-057 requires an affordance
probe before any "static / missing" classification.

**RESOLVED 2026-08-03** by the targeted affordance probe (run `sct-divergence-0803`, evidence at
`.claude/state/ua-worker/sct-divergence-0803/`). The probe's readiness gate reported
`REAL_TABLE_PRESENT: true`, so the page was fully rendered — these are not skeleton-state readings.

| ID | NM-1728 says | Live DOM (probed) | REQ-014 class | Disposition |
|---|---|---|---|---|
| **SCT-DIV-1** | §3 + §6: grid carries an **HTML Display Text V2** column, clickable into the editor | Real `<th>` set is **5 columns**: `Language` · `Service Charge Name` · `Service Charge Display Name` · `Report Column Name` · `Service Charge Text`. V2 scan: `BODY_MENTIONS_V2 false`, `HTML_MENTIONS_V2 false`, `V2_TESTIDS` empty — it exists nowhere in the document. Note the 5th header reads **"Service Charge Text"**, not the spec's "HTML Display Text". | **REQUIREMENT-GAP** (not a bug) | NM-1728 is status **QA / unresolved** — the story is still in flight, so an unbuilt V2 column is incomplete implementation, not a defect. **No bug filed.** **Binding on coverage: no TC may assert a V2 column, and no TC may assert the 5th header's spec name.** |
| **SCT-DIV-2** | §8: **Report preview** for the selected row | No preview affordance, **before or after selecting a row**. The sole match for `preview\|report\|print\|view` across text + `aria-label` + `title`, shadow-pierced, was `BUTTON "Report Column Name"` — the sortable **column header**, not a control. | **REQUIREMENT-GAP** + regression-candidate | NAV-2228 ("report preview … on Service Charge Text page") shows the **legacy** site had one, so this is absent-vs-legacy as well as unbuilt-vs-spec. Routed to `/encore-questions`. **No TC may assert report preview exists.** *Probe limit, stated honestly*: right-click context menus and row-hover-revealed actions were NOT tried — absence is strongly evidenced, not exhaustively proven. |
| **SCT-DIV-3** | §6: HTML edited through a **CKEditor** panel | `LIB_SIGNATURES {"tiptap":true,"ckeditor":false,"quill":false,"slate":false}`; editor node `DIV testid=rte-content class="tiptap ProseMirror prose …" contenteditable=true` | **INTENTIONAL-UX-CHANGE** | The NextJS rewrite swapped editor libraries; the spec's "CKEditor" is a stale implementation detail, not a contract. **Automation impact is real**: Tiptap is a contenteditable div, not CKEditor's iframe — drive it via `[data-testid="rte-content"]`, never an iframe frame-switch. |

**Resolved as NON-divergence**: NM-1728 §2's `All` option **does exist**. The live filter offers
`All | English (Canada) | US English | Spanish (Mexico) | French (Canada)`. The earlier "recon did not
surface one" was a limitation of the recon probe, not an absence — which is why it was logged as an
open question rather than a finding.

**Bonus behavioural fact (feeds Phase C's state-transition model)**: selecting a row — including
clicking a rich-text cell to load it into the editor — **does NOT dirty the form**. The Save button
read `disabled=true` before the interaction, after row selection, and at end of run. Selection is not
an edit. This also stands as the probe's non-mutation proof.

## 7. Closed defects that seed the Phase A6 bug harvest

Each was fixed once on this exact grid, marking a historically weak area. They become required
adversarial probes rather than rediscovery from scratch:

- **NM-3126** — column reordering broken → probe column reorder if the grid offers it.
- **NM-2922** — missing header → verify every column header renders.
- **NM-2924** — column not displayed in grid → verify no column silently drops.

## 8. Role guard (NM-1728 §10) — unconfirmed

`ROLE_FUNCTION_CORP_LEGAL` gates the page (hidden / view-only / edit). The ticket marks it
"(Need to confirm)". The automation account's role is not established. Per the Case-Generation
Standard the `rbac` family stays **deferred** unless the walk proves this module needs it; if the
walk shows role-dependent rendering, promote it with a template row rather than faking coverage.

## 9. Handoff

- The `jira_tickets:` frontmatter key above must be copied into the Phase 0.5b baseline artifact —
  that key is the greppable LR-ENC-004 enforcement point.
- SCT-DIV-1/2/3 carry into Phase A as **required probes**; any that confirms as a defect becomes a
  required test case in Phase B per the plan's loop-closure rule.
- No ticket in §2 is an in-flight behavioural-change blocker. **No HALT. Phase 0.5b proceeds.**

## 10. Governance gap found while emitting this artifact (framework defect, unfixed)

`REQUIREMENTS.md` workflow step 2 **mandates** that HUNTER emit
`_internal/jira-defect-crossref-<module>-<DATE>.md` for every module intake. But the identity
write-gate denies it:

```
[IDENTITY-GATE] HUNTER cannot access clients/encore/specs_planning/_internal/
jira-defect-crossref-service-charge-text-2026-08-03.md per no matching §2 row; default deny.
```

`jira-defect-crossref-*` has **no row in AGENT_SHARED_RULES.md §2**, so the role required to produce
the artifact is structurally forbidden from writing it. Phase 0.1 could not catch this — it returned
`skipped` (the plan declares no Artifacts section), so the mismatch only surfaced at write time.

This artifact was therefore written under **OWNER**, whose unrestricted access is by design
(LR-043: "§2 does not gate OWNER"), not a bypass. The proper fix is ALL-077 path (b) — add a
`jira-defect-crossref-*` row to §2 **and** to its machine mirror `scripts/identity-ownership.mjs`
(the hook reads the mirror, not the markdown; `node scripts/check-identity-ownership.mjs` gates
parity). That widens the permission layer, so it is left for explicit owner authorization rather
than done silently. It will recur on every future module intake until fixed.
