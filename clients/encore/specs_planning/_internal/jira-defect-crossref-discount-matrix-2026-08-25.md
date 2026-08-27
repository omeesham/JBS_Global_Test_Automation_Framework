---
module: discount-matrix
date: 2026-08-25
identity: HUNTER (adopted), written under OWNER (§2 jira-defect-crossref-* = Req CREATE / Owner RW)
scope: CRT (Search Criteria) · RWP (Region Weekly Peaks) · LOA (Location Activation)
out_of_scope: CMX (Company Matrix) — owned by NM-3343
rovo_available: true
source: Atlassian MCP, cloudId 03ec286f-d928-4c2c-b782-c8cce703ce2a, read:jira-work
jira_tickets: [NM-3530, NM-3485, NM-3475, NM-3441, NM-3440, NM-3435, NM-3391, NM-3294, NM-3293, NM-3275, NM-3256, NM-3253, NM-3238, NM-3234, NM-3232, NM-3230, NM-3229, NM-3062]
---

# Jira crossref — Discount Matrix (CRT / RWP / LOA)

**LEAD discipline (ALL-024 / LR-ENC-004)**: every row below is a *lead*, not a fact. Jira is intent
truth; the DOM is render truth. Nothing here enters a test case, field inventory or spec until it has
been re-verified against the live DOM on an authorized office. A Jira-vs-DOM divergence is signal,
classified per REQ-014 (intentional-UX / app-bug / stale-ticket) — never an automatic "Jira wins".

**Parent automation ticket**: NM-3530 *Automate → Setup → Discount Matrix (Part2)* (In Progress,
Highest) — this is the ticket the current branch serves.

## CRT — Search Criteria bar (Country · Currency · Business Tier · GAV Discount Threshold · Save)

| Ticket | Status | Claim (verbatim intent, one line) |
|---|---|---|
| NM-3441 | Done (Blocker) | GAV Discount Threshold incorrectly rounds discount percentages when a decimal threshold value is used |
| NM-3440 | Done (Blocker) | GAV Discount Threshold shows a validation error for valid numeric input until the field is left |
| NM-3391 | Done (Blocker) | Discard does not revert an unsaved GAV Discount Threshold when switching Business Tier |
| NM-3294 | Done (Highest) | GAV Discount Threshold value is rounded after page refresh |
| NM-3435 | Done (Blocker) | Duplicate Revenue Tiers and Region values are displayed |
| NM-3256 | Done (Highest) | Export is not triggered after clicking Discard on the Unsaved Changes popup |
| NM-3062 | Done (Highest) | Discount Matrix: Export returns 500 |

## RWP — Region Weekly Peaks (Select Year · Region · Add Year · Export · Import · week grid)

| Ticket | Status | Claim (verbatim intent, one line) |
|---|---|---|
| NM-3485 | Done (Blocker) | Cancel reverts previously saved values and leaves Save enabled |
| NM-3475 | Done (High) | Exported file contains an invalid region that cannot be re-imported |
| NM-3275 | Done (Highest) | Exported file contains an invalid/unrecognized region that cannot be imported (earlier instance) |
| NM-3293 | Done (Highest) | UI does not display data for the 'LA / AL' region despite data being present |
| NM-3238 | Done (Medium) | A selected Peak/Standard/Non-Peak checkbox cannot be unchecked |
| NM-3234 | Done (Highest) | 'Add Year' is enabled when Year and Region are not selected |
| NM-3230 | Done (Highest) | Record count does not match the total number of weeks displayed |
| NM-3229 | Done (Highest) | Export and Import buttons display incorrect (swapped) icons |

**Live cross-check 2026-08-25 (own observation, office 1604 e2e)** — NM-3234 appears FIXED: with Year
and Region unselected, `Add Year`, `Export` and `Import` all render `[disabled]`. Treat the fix as the
expected behaviour and cover it; do not re-file.

**NM-3238 caution**: exactly one of Non-Peak / Standard / Peak was checked per week row in the
2026-08-19 evidence (radio-like). Because NM-3238 is Done, that mutual exclusivity is plausibly the
*fix*, not the bug. Confirm the intended model live before authoring any uncheck case — do not encode
either reading on assumption.

## LOA — Location Activation (search box · Location | Workflow Start Date | Active grid)

| Ticket | Status | Claim (verbatim intent, one line) |
|---|---|---|
| NM-3253 | Done (Medium) | Save is allowed while the grid contains a row with an invalid Workflow Start Date; invalid row silently reverts and a success message still shows |
| NM-3232 | Done (Highest) | Stay/Discard dialog reappears when navigating back to Location Activation after discarding |

**Population-path evidence (HARD STOP #12 c.1)** — NM-3253's reproduction steps target office **1101 on
`cloudapps-dev.encoreglobal.com`** and describe editing `Workflow Start Date` on existing location
rows. That is proof the surface *does* populate and is not feature-blocked. Per LR-ENC-007 a
`cloudapps-dev` URL is a surface pointer, never a build target, so this does not license testing there.

## Out of scope — CMX (Company Matrix), owned by NM-3343

Recorded for the next reader only. No test content is derived from these here, and no Company Matrix
spec, page object, selector, fixture, workbook row or test ID is read or touched by this execution:
NM-3235, NM-3296, NM-3390, NM-3233. Company Matrix registration is NM-3343's to make.

## Open question routed to /encore-questions

Location Activation returns `0 matching locations` on **both** authorized e2e offices (1604 and 1101)
with its search box, Save and Cancel all disabled, while NM-3253 shows populated rows on the dev
environment. What associates locations to this grid on e2e, and is any authorized office expected to
carry them? Until answered, no LOA case may assert row-level behaviour.
