---
module: item-search
date: 2026-08-31
identity: HUNTER
scope: PRS (Product Search) · PCD (Product Code) · PGR (Product Groups) — NM-2253 "Automate Item Search", office 1101 only
out_of_scope: Asset Information screen internals (NM-1506 launcher target) · Smart Search ranking quality (NM-2031 In Progress) · venue/warehouse availability permission matrix (NM-1388 sc.1–4, single-account framework)
rovo_available: true
source: Atlassian MCP, cloudId 03ec286f-d928-4c2c-b782-c8cce703ce2a (encore.atlassian.net), read-only; full NM-4 child sweep (193 children, 2 pages) read 2026-08-31 during plan authoring — digest in PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md Appendix A; spot-re-verified this session: NM-2253 (To Do, scope text unchanged incl. the 1101-only ruling), NM-1495 (Done), NM-2449 (To Do)
jira_tickets: [NM-2253, NM-4, NM-3650, NM-2254, NM-2255, NM-2256, NM-2257, NM-2258, NM-2259, NM-1385, NM-1386, NM-1387, NM-1388, NM-1433, NM-1492, NM-1493, NM-1494, NM-1495, NM-1506, NM-1509, NM-1574, NM-1616, NM-1702, NM-1750, NM-1765, NM-1787, NM-1789, NM-1790, NM-1791, NM-1792, NM-1794, NM-1801, NM-1802, NM-1804, NM-1817, NM-1826, NM-1827, NM-1828, NM-1833, NM-1834, NM-1835, NM-1846, NM-1903, NM-1904, NM-1906, NM-1908, NM-1921, NM-1982, NM-1983, NM-2031, NM-2042, NM-2085, NM-2144, NM-2318, NM-2139, NM-2140, NM-2169, NM-2274, NM-2275, NM-2449, NM-877]
---

# Jira defect crossref — Item Search (PRS / PCD / PGR), 2026-08-31

**LEAD discipline (ALL-024 / LR-ENC-004)**: every row below is a *lead*, not a fact. Jira is intent
truth; the DOM is render truth. Nothing here enters a test case, field inventory or spec until it has
been re-verified against the live DOM on office 1101. A Jira-vs-DOM divergence is signal,
classified per REQ-014 (intentional-UX / app-bug / stale-ticket) — never an automatic "Jira wins".

**Parent automation ticket**: NM-2253 *Automate Item Search* (To Do, Highest, assignee vikas yadav;
parent epic NM-3489 E2E Test Automation) — the ticket this branch serves. Scope line (re-read
2026-08-31, verbatim): *"Tool: Playwright / Scope: Field Validation, save / Environments: E2E /
Outcome: Included in regression suite / This feature work for `1101 - Corporate Office Encore USA
SGA` only. Will test for this location only."* Seven sub-tasks: NM-3650 + NM-2254 + NM-2256 (PRS),
NM-2255 + NM-2257 (PCD), NM-2258 + NM-2259 (PGR). Dev epic: NM-4 "Products" (193 children read).

## PRS — Product Search (search panel · filters · dates · results grid · availability · calendar)

| Ticket | Status | Claim (verbatim intent, one line) |
|---|---|---|
| NM-1385 | Done | Any Field search matches item name / description / category / product group; result columns Category, Sub Category, Class, Product Group, Sub Class, Item, Description, Available, Owned, Out Of Service, In Sequence, Location (number + name); Country criteria + Price column removed vs legacy |
| NM-1494 | Done | Barcode search: Code 39, ≤42 chars, charset A–Z 0–9 `$ - / + %` space; field not required |
| NM-1493 | Done | Location defaults to logged-in location; Region defaults to none; selecting one clears the other; both blank = all locations |
| NM-1495 | Done | Active + Qty>0 filters both default ON; qty>0 limits to owned>0; unchecked returns all matches |
| NM-1903 | Done | "Active filter — when unselected" story — later redefinition of the Active/unselected contract (suspect for the D1 default divergence) |
| NM-1388 | Done | Per-visible-row SearchAvailability POST (LocOffID + PrepDate/ReturnDate) → Avail + QtyInSequence; "-" masks rows the viewer's location may not see |
| NM-1492 | Duplicate→NM-1388 | Prep/return dates drive availability |
| NM-1616 | Done | Search criteria persist via URL query params |
| NM-1702 | Done | Any Field search is exact-string semantics |
| NM-1794 | Done | Changing the search text must not retain prior results (no stale results) |
| NM-1787 | Done | Region search must still honor Qty>0 |
| NM-1789 | Done | Result columns sortable |
| NM-1790 | Done | Legacy-like default sort |
| NM-1826 | Done | Sorted-state reset affordance (return to default sort) |
| NM-1791 | Done | Grid shows the current-search location indicator |
| NM-1802 | Done | Criteria reset when switching locations |
| NM-1828 | Done | Direct-URL access works |
| NM-1833 / NM-1834 | Done | Owned column correctness + clickability (owned-count cell editable for non-barcoded items owned at the searched location) |
| NM-1906 / NM-2274 / NM-877 | Done / Done / To Do | Owned-count editing shipped via defect fixes (2274: update when not owned); NM-877 story itself still To Do |
| NM-1908 | Done | A no-op owned-count edit must NOT trigger a save |
| NM-2169 | Done | Shared-inventory owned counts |
| NM-1846 | Done | Availability calendar from a row must show availability details (NM-2256 sub-task target) |
| NM-2042 | Done | Legacy availability 500 fixed |
| NM-2318 / NM-2144 | Done | ProductCodeID visible in results (+ in Product Code UI) |
| NM-2031 | **In Progress** | Smart Product Search enhancements — ranking non-deterministic; QUICK covers deterministic contract only |
| NM-1801 | Done | Product-group segment participates in product search results |
| NM-1827 | Done | "Product Group" column label |

**Live cross-check 2026-08-31 (own observation, office 1101 e2e, fresh navigation)** — D1: Qty>0
renders UNCHECKED + Active CHECKED at fresh load (contradicts NM-1495 "both ON"; NM-1903 is the
suspected redefinition → classify stale-ticket vs intentional-UX at walk close, read ×2 required).
D2: Location pre-fills `1101 - Corporate Office Encore USA SGA`, Region empty — NM-1493 CONFIRMED;
the owner-screenshot divergence (empty location + Atlanta region) is NM-1616 URL-param persistence,
not a fresh default. Grid paginates (rows-per-page 50; page textbox `1 / 318` on the unfiltered
15,874 set) — pagination family IN SCOPE. A `Product Organization` combobox (None/None) renders in
the Filters card — present in no Appendix-A UI story; inventory it as a live-discovered control
(leads NM-2077/2100/2111 "product-org All semantics" + NM-1982/83 org propagation are PCD-side).

## PCD — Product Code (View / Add / Edit dialogs, 5-level hierarchy)

| Ticket | Status | Claim (verbatim intent, one line) |
|---|---|---|
| NM-1386 | Done | Add Product Code from search after selecting an item + product-manager role; add item/sub-class/class/sub-category/category cascade; translations optional (blank-translation save clean); ticket's 256-char limits SUPERSEDED by NM-1433/NM-1835 (50) |
| NM-1387 | Done | View Product Code per segment shows that segment's section + ancestors; Translations tab; Product Code History tab; view is role-free |
| NM-1433 | Done | Edit level N saves N-and-below; names ≤50; item description ≤50; only items have descriptions; history read-only; dropdowns cascade-filter |
| NM-1750 | Done | Add gated by selection + "Corp Asset Item Maintenance"-class role |
| NM-1765 | Done | Oracle Item Number NOT required (supersedes NM-1386 "all required") |
| NM-1835 | Done | 50-char limit + invalid-char enforcement |
| NM-1921 | Done | Service Type dropdown empty until Product Type chosen |
| NM-1982 / NM-1983 | Done | Product-org propagation + validation messages |
| NM-2085 | Done | Barcodeable read-only on Item segment in edit |
| NM-2144 / NM-2318 | Done | ProductCodeID visible for item+subclass |
| NM-1804 / NM-1966 / NM-2139 / NM-2140 | Done | Grid refreshes edited names/descriptions without a second search |
| NM-1904 | Done | Activate-item-with-inactive-subclass handling (deactivate-only lifecycle lead — no delete path) |
| NM-2449 | **To Do** | Duplicate subclass/item name warning NOT yet built — record observed behavior, assert nothing, file nothing against it (re-verified To Do 2026-08-31) |
| NM-2275 | Done | Product-type per segment |
| NM-1389 / NM-1390 / NM-1425 | Won't Do | PC history view + translations views — content depth out of scope |

**Live cross-check 2026-08-31 (own observation, 1101)** — role probe: after selecting an item row,
`View Availability`, `View Product Code`, `Add Product Code` all render ENABLED for the automation
account → NM-1750 role gate clear; PCD add/edit flows are automatable. Item-name cell renders a
`locations.product.selectItem` button (raw i18n key as accessible name — selector consequence, not
a bug per LR-ENC-009); single click SELECTS the row (toolbar appears), it does NOT navigate to
Asset Information — NM-1506's "hyperlink opens asset info" is UNRESOLVED as a lead (walk Stage 2
probes the actual Asset-Info affordance).

## PGR — Product Groups (tab · search · create)

| Ticket | Status | Claim (verbatim intent, one line) |
|---|---|---|
| NM-2258 / NM-2259 | To Do (sub-tasks) | Group search returns groups; create-new-group flow; newly created group findable |
| NM-1603 / NM-1801 | Done | Product-group segment in search results; group list behavior |
| NM-1707 | Done | Product-group table height |

**Live cross-check 2026-08-31 (own observation, 1101)** — the `Product Group` toolbar button
navigates to `/navigator/locations/1101/products/product-groups` (own URL): "Search Product
Groups..." textbox + Active checkbox (checked) + Reset/Search + `Add` button (enabled) + grid
Name/Description/Service Type/Status; 0 groups at rest (no auto-search) — same at-rest contract as
the products page.

## Owner rulings (2026-08-31, in-chat — intent-truth, override conflicting Jira leads)

| # | Ruling (owner's words, condensed) | Effect on coverage |
|---|---|---|
| OR-1 | "dates are not functional yet — test on field level verification only" | Prep/Return Date Time: §2 field-level cases only (defaults, popover opens, selection renders, format); NO availability-window behavioral assertions; NO bugs filed against date-driven behavior (known-not-functional, NM-2449-class do-not-assert) |
| OR-2 | "feed something under region dropdown → it will override location section" | Region→Location override direction confirmed (NM-1493 pair); assert region selection clears/overrides location |
| OR-3 | "any field = any word we feed; if it exists in the product section it filters those" | Any-Field result-fidelity oracle: every returned row carries the query word in some field |
| OR-4 | "for barcode verification I will provide few barcode numbers; it should filter those products" | Barcode positive filter cases = owner-data-pending (charset/length field cases proceed per NM-1494); TCs authored with a data placeholder consumed when numbers arrive |
| OR-5 | "there is a grid option that need to be tested too" | Grid Options menu explicitly in scope (§5 class 7 — enumerate items, toggle effect + restore, persistence) |
| OR-6 | "check all the tooltips available on the page or under any option, appear properly" | Tooltip sweep: every info icon / help control / tooltip-bearing element probed in walk Stage 2 + render-state TCs assert tooltips appear (NM-1829 location-tooltip lead folds in) |

## Shared / host

| Ticket | Status | Claim |
|---|---|---|
| NM-1509 / NM-1574 | Done | Standalone web component, Angular host via Module Federation (inputs canEdit/authToken/theme) |
| NM-1828 | Done | Direct-URL access |
| NM-2384 | To Do | Canada products — not asserted |
| NM-3623 | In Progress | Hot-list — adjacent, out of scope |
