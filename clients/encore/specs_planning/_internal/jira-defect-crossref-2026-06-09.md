---
module: corporate-pricing
type: jira-defect-crossref
created: 2026-06-09
source: external AI "Corporate Pricing Frontend QA & Playwright Automation Blueprint" (Jira/Confluence agent, best-effort Jira text search — self-described non-exhaustive)
owner: OWNER (intel capture, not a filed-bug ledger)
---

# Corporate Pricing — Jira defect cross-reference (LEADS, not truth)

## What this is

An external AI agent searched Encore's Jira/Confluence for Corporate Pricing and returned a QA blueprint. The useful part — **a list of already-filed `NM-####` defect tickets for this exact module** — is captured below, mapped to our open items and the subplan that should confirm it. Our plan corpus previously linked only the *story* tickets (NM-1440/1441/1443/1444/1445); we had **zero** defect tickets.

## How to use it (do NOT skip this)

These are **leads to verify on the live site, not facts to copy**:

1. The source is one AI's text search — **self-admittedly representative, not exhaustive**, and the ticket *summaries are paraphrased*.
2. Tickets span **mixed environments**; **status is unreliable** — some are **"Not a bug" (NM-2094)**, **"FAD" (NM-2000)**, or possibly already fixed.
3. Per **LR-ENC-001** (nav2/live = baseline truth) + **LR-044** (reproduce-before-file): when an FCC case hits one of these, **reproduce it live first**, then cross-reference the `NM-####` in the `/encore-questions` clarification or `BUG-*.json` (LR-034) — **never file from this note alone, never re-discover what's already filed.**
4. Story-IDs inferred here (e.g. Override = NM-1463) are the AI's guess — **confirm against actual Jira** before citing as the owning story.

---

## ⚠ Live-proof gate — nothing here is taken as-is

Every `NM-####` below is an **UNVERIFIED claim** from an external text search, not a fact about our app. Before any item informs a test expectation, answers an `/encore-questions` clarification, or is filed as a `BUG-*.json`, the consuming subplan MUST record a **dated live verdict** on the e2e site:

- **`confirmed-live (YYYY-MM-DD + evidence)`** — reproduced live per LR-044 (cite timestamp / row-diff / network / screenshot). Only then may it become an assertion or a filing.
- **`not-reproduced (YYYY-MM-DD)`** — symptom absent on a faithful repro → env/version-specific or already fixed; do NOT encode, do NOT file (LR-044 FALSE verdict; LR-030 if it contradicts a doc).
- **`blocked-<reason>`** — cannot be exercised (RBAC / irreversible create) → classify `blocked-pending-question`, never a silent skip (LR-031).

No exceptions for the §A "answers" or the §B oracle — **NM-1463** (story ID), **NM-2126** (RBAC), **NM-1874** (Save spec) are leads to confirm on the live site / in actual Jira, not settled truth. Record each verdict in the consuming subplan's own artifact (dependency-map ledger / encore-questions draft / `BUG-*.json`), citing the `NM-#`.

---

## A. Resolves 3 of our open questions

| Our open item | Jira lead | Action |
|---|---|---|
| **Q-WV15-1** — Override screen story ID (we had a guess "NM-1442?") | **NM-1463** "Corporate PG Pricing Override Management & Context Filtering" — likely the real story | W15-A: confirm NM-1463 owns the screen; if so, retire the "NM-1442?" guess |
| **Q-WV15-1** — why Override cells don't react (edit-activation / permission-lock) | **NM-1463** (edit flow = select Location + Currency → drag/double-click to add a row → Override Price auto-sets Active, clearing it inactivates) **+ NM-2126** (a Revenue-Management role / `canEdit` gates editing; non-RM users wrongly retain export/import) | W15-A: try the documented edit flow; if cells still inert, the honest classification is **RBAC read-only for the automation user**, not a bug |
| **Q-WV15-2** — Export ▾ / Import ▾ variant behavior + format | **NM-1604** (4 export variants + locale), **NM-1625 / NM-1446** (import payload, dedupe, counts) | W15-B: confirm the 4 variants + CSV round-trip against these |

---

## B. CPR-DETAIL-BUG-A — check Jira BEFORE filing

Our candidate: *New-Price-only edit doesn't reliably enable Save* (Detail tab). Adjacent already-filed tickets — confirm whether ours is net-new or a facet of these:

- **NM-1874** "Corporate Pricing Save Button" — **the spec/oracle**: Save enables only when the form is *dirty AND valid*; New Price / Max Discount numeric-only. Use it to decide whether our symptom is a bug or expected dirty-tracking.
- **NM-2094** "New Price Value Disappears After Saving Price Book" — **marked "Not a bug"** (New Price is a staging field that clears on save). Confirms our CPR-DETAIL-Q2; **do not file the disappearing-value as a defect.**
- **NM-2095** "Previously Saved Product Group New Price Is Lost After Updating and Saving Another Product Group" — a **distinct, likely-real** cross-row data-loss bug. Check it's not what we're actually seeing.

---

## C. New defect leads by screen → owning subplan

| Screen / subplan | `NM-####` | Symptom (paraphrased — verify live) |
|---|---|---|
| **Search → 1445** | NM-2137 | Sort applies to current page only, not the full result set |
| | NM-2078 | Search criteria not retained when navigating Back from a pricebook |
| | NM-2029 | "All" currency filter returns no results |
| **Strategy → 1441** | NM-2047 | Strategy flags mutually exclusive via disabled checkbox (confirms our *Is Productions → disables Is Internal/Is GSO*); **IsLabor + Currency become non-editable after create** |
| | NM-2059 | Duplicate strategy names allowed (should be unique) |
| **Detail → 1443** | NM-1874 / NM-2094 / NM-2095 | (see §B) |
| | NM-1967 | Max Discount focus bug — entering 100 becomes 1% |
| **Override → W15-A** | NM-1463 / NM-2126 | (see §A — story + edit flow + RBAC) |
| | NM-1932 | PG override saves Max Discount % without the required Override Price |
| | NM-1961 | Newly added override rows not shown in grid until refresh |
| | NM-1870 | Current Price not displayed |
| | NM-1889 | Override search matches unintended columns |
| **Toolbar I/O → W15-B** | NM-1604 / NM-1625 / NM-1446 | (see §A — export/import variant + locale + payload) |
| | NM-2164 | Max Discount import rounds decimal percentages to whole numbers (MFE) |
| | NM-2126 | Non-Revenue-Management users can still export/import (RBAC gap) |
| | NM-1986 | Import only works under ~50 rows / single pricebook |
| | NM-1997 / NM-1998 / NM-2005 | Export/UI include duplicate product groups; max-discount export shows wrong dataset / missing pricebooks |
| **New Pricebook → done 1440, carried to EDGE_P3** | NM-2022 | Name uniqueness should be (name + strategy), not name alone |
| | NM-2057 | Price Year required but not indicated (Save silently disabled, no hint) |

---

## D. New cross-page dependencies → PRE_EDGE must map these

- **NM-1675** — Override **Current Price is NOT stored; it is computed** at read time (LocationPricebook → PricingStrategy → pricebook/productGroup). Editing a location's default pricebook **changes the Current Price** shown on the Override screen. → a cross-page edge PRE_EDGE must record.
- **NM-2068** — Assigning a pricebook to a location is supposed to add that location to the strategy's "Locations Using Pricing As Default" list — **known bug: it doesn't reflect the new assignment.** → cross-page edge + a live bug to confirm.

> Scope note (pending user decision): the *trigger* for both lives on the **Location Settings > Pricing tab**, a screen outside the 5 Corp Pricing screens. PRE_EDGE either reaches that bridge or records these as `blocked-pending-question` per the user's scope call.

---

## E. Deliberately excluded (not new / not useful to our FCC tests)

Architecture internals (Module Federation, Next.js, Cosmos/SQL, APIM, Sentry, Turborepo); **orders / billing / discount-optimization integration** (NM-1334, NAV-2378 — cross-module, out of scope); CI/CD + observability; the environments table; translation validation (NM-2098/2099/2103/2106). The `data-testid` names in the report are the AI's **guesses** ("expected to follow patterns such as…") — do not adopt.
