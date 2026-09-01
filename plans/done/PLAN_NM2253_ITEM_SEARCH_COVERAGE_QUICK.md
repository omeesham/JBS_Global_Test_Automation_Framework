> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md`. All context below.**
>
> The agent self-bootstraps from the frontmatter + sections in this file, with no additional user prompting:
>
> 1. **Identity**: OWNER shell. Adopt `/identity HUNTER` before the crossref / baseline / walk-evidence artifacts, `/identity GIVER` before any catalog / test-case / test-plan / field-inventory write, `/identity BUILDER` before any selector / page-object / spec write, `/identity WATCHDOG` for Phase 3. The PLAN_IDENTITY_ENFORCEMENT Layer-1 write-gate enforces this at write time — declaring is not adopting.
> 2. **Skills**: load every skill in the Skills field below (each leading skill auto-calls its own chain).
> 3. **Model + thinking + permission-mode**: read the Model / Thinking / PermissionMode fields below (all three required per LR-041).
> 4. **Dependency gate**: Depends on `none`. Phase 0 verifies the live preconditions (surface exists on e2e office 1101; role probe) instead.
> 5. **Context load**: read `.claude/context/navigation.md`, `clients/encore/specs_planning/_internal/agent-mistakes.md`, `.claude/context/patterns.md`, and this plan in full — including Appendix A (Jira digest), which replaces a fresh Rovo sweep unless Phase 0.1 finds it stale.
> 6. **Browser tool**: declared in frontmatter — announce the choice and the reason in the first output per LR-038 v2, classified against the matrix (not copied blindly).
> 7. **Phase 0 FIRST** — the disposition + live-precondition gate. No case may be authored before it closes: it retires the stale 2026-06-22 Products plan trio and proves the 1101 surface + role assumptions live.
> 8. **Execute Phases 0.1 → 4** in order. Sub-surface wave order: PRS → PCD → PGR (each wave lands GIVER + BUILDER green before the next starts).
> 9. **Handoff**: flip the Status field to DONE + add the Executed date, replace every `<EXEC-DATE>` placeholder in the Per-Identity matrix with the real dated filename, append the activity-log row (LR-028 + LR-037), `git mv` to `plans/done/`, run `npm run plans:reindex`.
>
> **HALT + ASK USER** if: the 1101 surface probe fails (LR-ENC-007 #4 — never silently retarget) / scope ambiguity beyond the Scope fence / Phase 0 extends scope by >30% / `/regression-guard` shows unrelated changes / LR-037 timestamp drift / **LR-040 closure-completeness — any planned item not classifiable as (a) machine-proven, (b) a grep-verifiable line item in a named recipient plan, or (c) a user-flagged discussion-item / bug-candidate.**

---

# PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK — NM-2253: QUICK coverage for Item Search (Product Search · Product Code · Product Groups)

**Status**: DONE
**Executed**: 2026-08-31 → 2026-09-01 (branch NM-2253; commits 8cd3a355 · 0c375154 · 55611cc8 · 9f6418f6 · dee425df + closure)
**Priority**: P1
**Created**: 2026-08-31
**Identity**: OWNER (multi-identity by phase — HUNTER → GIVER → BUILDER → WATCHDOG → OWNER)
**Parent**: none
**Depends on**: none
**Blocks**: SUBPLAN_PRODUCTS_DQU.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**CoverageMode**: quick
**Skills**: /identity, /relevant, /coverage, /regression-guard, /find-bugs, /rca, /encore-questions, /audit, /reflect, /final-q
**Jira**: NM-2253 — "Automate Item Search" (Story, Highest, To Do, assignee vikas yadav; parent epic NM-3489 E2E Test Automation). Ticket scope: *"Tool: Playwright / Scope: Field Validation, save / Environments: E2E / Outcome: Included in regression suite / This feature work for `1101 - Corporate Office Encore USA SGA` only. Will test for this location only."* Seven sub-tasks: NM-2254 (Product Search Filters), NM-2255 (View Product Code), NM-2256 (Check Availability Calendar Button), NM-2257 (Add Product Code), NM-2258 (Product Groups search), NM-2259 (Product Groups create), NM-3650 (Product Search). Dev epic: NM-4 "Products" (193 children read 2026-08-31 — digest in Appendix A).
**ActiveClient**: encore

---

## Context

The Item Search module (left-nav **Search › Item Search**; page heading **Products**; URL `/navigator/locations/1101/products` on `cloudapps-e2e.encoreglobal.com`) has **zero automated coverage**: no page object, selector file, test data, spec, field-inventory, walk-evidence, baseline, or crossref artifact anywhere in `clients/encore/` (verified by directory listing + repo-wide grep, 2026-08-31; `NM-2253` has zero repo hits). It is a Next.js MFE web component hosted inside legacy Angular Navigator (NM-1574: inputs `canEdit`/`authToken`/`theme`) — the same hosting pattern class as other `next-*` surfaces, but this exact component is unverified in-repo (the string `next-product` appears nowhere; the walk confirms the real tag).

The module is **office-1101-scoped by ticket ruling**: NM-2253 says the feature works for `1101 - Corporate Office Encore USA SGA` only and will be tested there only. Per LR-ENC-007, office carve-outs are legitimate within e2e (1101 is the sanctioned corporate-only office per LR-ENC-005); the environment stays `cloudapps-e2e` + `navigator2` and nothing else. Every artifact, selector, data constant, and TC precondition in this plan pins **office 1101** — with zero hardcoded env hosts in selectors (per `feedback_no_hardcoded_env_in_selectors`).

The module splits into three sub-surfaces, mapped 1:1 onto the seven NM-2253 sub-tasks:

| Sub-surface | Submodule code | Jira sub-tasks | What it is |
|---|---|---|---|
| Product Search | `PRS` | NM-3650, NM-2254, NM-2256 | Left panel (search-type selector, Any Field text, barcode, Qty>0 + Active checkboxes, Location + Region selects, Prep/Return date-times) + results grid (12 documented columns, sort, selection, owned-count edit, item-name link, availability cells) + Check Availability calendar button |
| Product Code | `PCD` | NM-2255, NM-2257 | View / Add / Edit Product Code dialogs — 5-level hierarchy (Category → Sub-Category → Class → Sub-Class → Item), cascading dropdowns, Translations + History tabs, role-gated Add/Edit (NM-1750) |
| Product Groups | `PGR` | NM-2258, NM-2259 | Product Groups tab — group search + create-new-group flow |

**Delivery intent**: QUICK (L1) per LR-072 — Axis-1 FCC floor for every claimed field + the L1 must-assert per applicable Axis-2 family, executed as three sequential waves (PRS → PCD → PGR), each wave green before the next. This is a large module (three surfaces + launcher dialogs); honest wall-clock is 3–4 working sessions, not same-day — the QUICK profile removes BFS-fixpoint, full-SFDPOT and re-walk overhead, never the per-field L1 floor.

### Provenance of the depth and scope decisions

1. **Depth = QUICK**: the owner invoked `/coverage` (not `/ultracoverage`) and directed "finish NM-2253 quickly while still providing complete and meaningful coverage" (2026-08-31). L2/L3 defer to `SUBPLAN_PRODUCTS_DQU.md` (already GATED as the DEEP recipient).
2. **Office = 1101 only**: NM-2253 ticket text + owner instruction + owner screenshot (2026-08-31) agree. LR-ENC-001's default 1604 does not apply to this module; the old-site baseline walk also runs against office 1101 on nav2.
3. **Ticket-fenced scope**: the owner directed "do not cover functionality unrelated to NM-2253". The Scope fence (below) and the `### Not touched` carve-outs implement that; anything outside goes to the DQU seed list, never silently.
4. **Supersession of the 2026-06-22 Products trio**: decided at authoring (table below) — mirrors the NM-3530 precedent of retiring the overlapping plan so no two pending plans claim the same work.
5. **Module code `ISR` (not the trio's `LOC`/`PRD` reservation)**: follows the DSM precedent — a separate top-level URL surface with multiple sub-surfaces gets its own module code + per-surface submodules, giving per-sub-task TC namespaces (`TC-ISR-PRS-*` / `TC-ISR-PCD-*` / `TC-ISR-PGR-*`) that map cleanly onto the seven Jira sub-tasks. `ISR` verified free in `export_test_cases/module-codes.json` 2026-08-31 (taken: LOC, LOS, CPR, COR, TNC, SCT, SVC, DSM).

### Supersession & disposition of the 2026-06-22 Products plan trio (executed in Phase 0)

Not LR-069 §3.5 territory: this plan puts no earlier remediation on trial, so the SURVIVES/CONVICTED ceremony does not apply. The trio is retired for **staleness against five rule epochs**, not for having failed:

| Plan | Disposition | Why |
|---|---|---|
| `SUBPLAN_PRODUCTS_00_FOUNDATION.md` | Flip its Status field to SUPERSEDED + provenance line pointing here | Targets office 1604 (`/locations/1604/products`) — contradicted by NM-2253's 1101-only ruling (ticket updated 2026-08-31). Its discovery/scaffolding phases are absorbed by Phases 0.3–0.75 + 2 here |
| `SUBPLAN_PRODUCTS_FCC.md` | Flip its Status field to SUPERSEDED + provenance line pointing here | Pre-dates the two-axis Case-Generation Standard (Axis-2 surface families absent), LR-072 (no CoverageMode), and the current LR-014 (it mandates `test.fixme` for missing testids; current LR-014 mandates next-best locator + testid-gap-report note). Its FCC scope is absorbed by Phase 1 here |
| `SUBPLAN_PRODUCTS_DQU.md` | KEEP (already GATED) — repoint its Depends-on field to this plan; append an office note (1101) + an LR-ENC-009 note against its a11y seed item | Remains the LR-040(b) deferred-to-DEEP recipient; its seed list is exactly the vehicle for this plan's `deferred-to-DEEP` rows |
| `PLAN_BIG_PIVOT_FCC_MASTER.md` | Annotate its "Location Products (distinct surface)" roadmap subsection + §closure checkbox: Products wave superseded-for-NM-2253 by this plan; DQU retained | Keeps the master's roadmap truthful without rewriting history |

### Not touched

- **Asset Information screen internals** (NM-1506): the item-name link-cell must navigate/open it (that is the `render-state` L1 must-assert) — but the legacy Asset Information screen's own fields, history grid, and status-change flows are a separate legacy module, out of NM-2253's sub-task list. Deferred-to-DEEP with the launcher id.
- **Smart Search semantic quality**: NM-2031 (Smart Product Search — Enhancements) is In Progress; AI-ranked results are non-deterministic. QUICK covers the deterministic contract only (a smart query executes, renders results or a graceful empty state, no console/network error). Relevance/ranking assertions → DQU, gated on NM-2031 closing.
- **Venue/warehouse availability permission matrix** (NM-1388 scenarios 1–4, the `"-"` masking): requires venue and warehouse logins; the framework has exactly one SSO service account and no role-switching infrastructure (auth.setup.ts, verified 2026-08-31). What IS asserted from 1101: availability cells render per the prep/return window. The cross-location permission matrix → DQU + `/encore-questions` if the client wants it automated (needs credentials).
- **Translations content depth**: NM-1390/NM-1425 are Won't Do; NM-2096/NM-2101 translation-validation defects were Rejected. QUICK asserts the Translations tab renders and (on Add) saving with translations blank succeeds (NM-1386 scenario 6). Per-culture content round-trips → DQU.
- **Product Code History content depth**: NM-1389 is Won't Do. QUICK asserts the History tab renders read-only (NM-1433 scenario 7). Row-content assertions (NM-1805/06/07 fixed defects) → DQU.
- **CMX-style L2/L3 everything**: math/matrices, pairwise filter grids, date-BVA exotica, volume/virtualization stress, file I/O, RBAC matrix, keyboard-only operation — named in the DQU seed list.
- **Jira writes**: no status transitions, no comments (read-only Jira discipline). The owner moves NM-2253/sub-tasks himself.
- **Commit/push of client deliverables**: closure commits the repo plan/artifacts locally per house discipline; `/push-encore-deliverables` stays owner-explicit.

---

## Jira intake digest (LR-ENC-004 — leads, not truth)

Full per-ticket digest: **Appendix A**. Every Jira fact below is a **LEAD** — re-verified against live DOM (old site > new site) before it enters a TC; divergence is classified per REQ-014 (intentional-UX / app-bug / stale-ticket), never auto-resolved. Two divergences are already visible between Jira ACs and the owner's 2026-08-31 screenshot and MUST be resolved by the walk from a **fresh state** (PLANNER HARD STOP #12/#14 — defaults from DOM only):

| # | Jira says (LEAD) | Screenshot 2026-08-31 shows | Resolve by |
|---|---|---|---|
| D1 | NM-1495: Qty>0 AND Active filters both default ON | Qty>0 checked, **Active unchecked** | Fresh-navigation default read ×2; classify per REQ-014 (NM-1903 "Active filter — when unselected" may have redefined the default) |
| D2 | NM-1493: Location defaults to the logged-in location; Region defaults to none | **Location empty ("Select Location"), Region pre-filled "Atlanta"** | Fresh-navigation default read ×2; check whether 1101 carries a home-region; classify per REQ-014 (NM-1817/NM-1792 nearby) |

Key behavioral contracts the TCs assert (ticket-sourced, walk-verified):

- **Search** (NM-1385): Any Field search matches item name / description / category / product group; result columns Category, Sub Category, Class, Product Group, Sub Class, Item, Description, Available, Owned, Out Of Service, In Sequence, Location (number + name). Exact-string semantics per NM-1702. Changing the search text must not retain prior results (NM-1794).
- **Barcode** (NM-1494): Code 39, ≤42 chars, charset A–Z 0–9 `$ - / + % space`; field not required.
- **Location ⊕ Region mutual exclusion** (NM-1493): selecting one clears the other; both blank = all locations; region search ignores location and vice versa. Region search must still honor Qty>0 (NM-1787).
- **Filters** (NM-1495): Qty>0 checked → only owned>0 rows; unchecked → all matches; Active → active-only.
- **Dates** (NM-1388/NM-1492): Prep/Return date-times drive per-row availability; defaults observed = current-month window (verify). Return ≥ Prep constraint class per LR-008 (Return/end-side ≥ 0 offset family) — the §2 date-row Negative set with the §2.1 oracle decides what the UI actually enforces.
- **Grid**: sortable columns (NM-1789), legacy-like default sort (NM-1790), current-search-location indicator (NM-1791), criteria reset when switching locations (NM-1802), URL query-param persistence (NM-1616), sorted-state reset affordance (NM-1826), owned-count cell editable for non-barcoded items owned at the searched location (NM-1833/NM-1834/NM-1906/NM-1908 — no-op edit must NOT trigger a save), Availability calendar from a row (NM-2256; NM-1846 says the calendar must show availability details).
- **Product Code** (NM-1386/NM-1387/NM-1433 + defects): Add gated by selection + "Corp Asset Item Maintenance"-class role (NM-1750); all fields required EXCEPT Barcodeable, translations, and Oracle Item Number (NM-1765 supersedes NM-1386's "all required"); name/description limit **50 chars** (NM-1433 + NM-1835 supersede NM-1386's 256); invalid-char restrictions (NM-1835); Service Type dropdown empty until Product Type chosen (NM-1921); higher-level dropdowns filter lower levels; editing level N saves N-and-below; Barcodeable read-only on Item segment in edit (NM-2085); ProductCodeID visible for item+subclass (NM-2144/NM-2318); grid refreshes edited names without a second search (NM-1804/NM-1966/NM-2139/NM-2140 fixed this class).
- **Product Groups** (NM-2258/NM-2259 + NM-1603/NM-1801): search returns groups; newly created group is findable; product-group segment participates in product search results.
- **Known-open behavior NOT to assert as expected**: NM-2449 (duplicate subclass/item name warning) is To Do — a duplicate-name add currently has no warning contract; record the observed behavior, file nothing against it, seed it to DQU pending the ticket.

---

## Surface map & module registration

- **Module code**: mint `ISR` (name `item-search`, display `Item Search`, dir `item-search`) + submodules `PRS` (`item_search_product_search` sheet), `PCD` (`item_search_product_code`), `PGR` (`item_search_product_groups`) in `export_test_cases/module-codes.json` — **mirror the DSM entry's exact JSON shape for both the module and its submodule registrations** (read the file first; do not invent structure — LR-020). All sheet names ≤31 chars (Excel cap). Mint BEFORE the first TC ID exists (`check-tc-parity` G6a/G6c).
- **Directories** (LR-017 — own namespace, mirroring `discount-matrix/`): `clients/encore/src/selectors/item-search/`, `src/pages/item-search/`, `src/data/item-search/`, `tests/item-search/`. Test-case/test-plan MDs under `specs_planning/test-cases/setup/item-search/` + `test-plans/setup/item-search/` — `setup/` is the fixed tree root for ALL modules regardless of nav group (`check-tc-parity.ts` G6b hardcodes `test-cases/setup/<dir>/`, verified 2026-08-31; all 8 existing module dirs live there).
- **Playwright routing**: `tests/item-search/**` lands in the `chromium` catch-all project (its testIgnore only excludes `tests/locations/**` + `tests/local-office/**`) — same as discount-matrix. No config edit (config files are human-controlled, AGENT_SHARED_RULES §2).
- **Page-object instantiation**: follow the DSM pattern — `new <X>Page(authenticatedSession.page, config)` in `test.beforeEach` (no `pages.fixture.ts` entry; the newest modules don't add fixtures).
- **Page objects** (BUILDER, Phase 2): `product-search.page.ts`, `product-code.page.ts` (dialog complex), `product-groups.page.ts` — navigation via direct `navigateTo(`${baseURL}locations/1101/products`)` (top-level URL; `navigateToSubTab()` does not apply).

---

## Bootstrap

**Identity**: OWNER shell (adopt HUNTER / GIVER / BUILDER / WATCHDOG per phase as annotated).

**Skills auto-called**: `/identity` (gate), `/relevant` (Phase 0.5 injection), `/regression-guard` (BEFORE + AFTER), `/find-bugs` (walk Observations discipline — QUICK profile: pattern sweep on CRITICAL/HIGH only), `/rca` (any red or contradictory probe), `/encore-questions` (role/data escalations), `/audit` (Phase 3), `/reflect` + `/final-q` (closure).

**Context files**:
- `clients/encore/CLAUDE.md` (LR-ENC-001/004/005/006/007/008/009, LR-008/012/017/036)
- `clients/encore/specs_planning/_internal/field-case-generation.md` (§2 rows + §2.1 oracle + §3 families + §5 interaction classes)
- `docs/read_only_docs/CASE_GENERATION_STANDARD.md` (two axes, depth model, TC namespaces, ALL-091)
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` (8 frontmatter keys + 7 sections + Coverage Manifest + `Walk_Mode`)
- `.claude/rules/inventory.md` (LR-062 dispositions, LR-064 TDW + TDW-Q, LR-072, LR-013, LR-014, LR-057)
- `.claude/rules/specs.md`, `.claude/rules/angular.md`, `.claude/rules/data.md`, `.claude/rules/baseline.md`, `.claude/rules/browser-tool.md`
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, §20/§20-Q walk doctrine, ALL-045/052/091/092/093)
- `docs/read_only_docs/LEARNED_RULES.md` (cross-cutting LR-NNN incl. LR-040/046/060/061/062/065/069/072)
- `clients/encore/specs_planning/_internal/agent-mistakes.md` (binding hits: CEO-M1/M2/M10/M11/M12/M13, R-536, ALL-091/092/093, LR-057 pair, LR-061 verify-before-blocked)

**Anti-Assumption Gates** (binding):
- [ ] Old-site baseline walk EXECUTED before any behavior classification or bug filing (Gate 1 — LR-045 / LR-ENC-001).
- [ ] No "corrupt / atypical / regression" claim on <2 evidence sources; for lazy surfaces independence comes from varying the WAIT, not the entity (Gate 2 — LR-061 + LR-ENC-008).
- [ ] No control marked un-drivable without overlay-clear + reload + selector-vs-live-DOM diff + DOM-inspect (Gate 3 — LR-061/LR-021).
- [ ] No env-rationalized deferral of env-independent work (Gate 4 — LR-060).
- [ ] Un-skip + LR-019 harden atomic (Gate 5 — n/a net-new until a skip exists).
- [ ] All phases complete OR a user-signed `## Deferral Authorization` block (Gate 6 — LR-060).
- [ ] Machine-enumerated denominator, every row dispositioned, Coverage_Ratio 100% per surface (Gate 7 — LR-062; `deferred-to-DEEP` counts as dispositioned per LR-072).

---

## Phase 0 — Disposition + live-precondition gate (OWNER)

1. **Trio disposition (EARLY, before any authoring)** — execute the Supersession table above: flip the two subplans' Status fields to SUPERSEDED with a one-line provenance pointer to this plan; repoint `SUBPLAN_PRODUCTS_DQU.md`'s Depends-on field here + add its office/LR-ENC-009 notes; annotate `PLAN_BIG_PIVOT_FCC_MASTER.md` roadmap + closure checkbox; `npm run plans:reindex`.
2. Read `.claude/context/navigation.md` §C (no Item Search row expected — first explore; adding the row is Phase 4), agent-mistakes (identity-filtered), `.claude/context/patterns.md`; run the LR trigger scan.
3. **Browser-tool announcement** (LR-038 v2): classify against the matrix and announce with reason in first output.
4. `/regression-guard` BEFORE snapshot over every path this plan will touch.
5. **Live probe A — surface exists on e2e/1101** (LR-ENC-007 #4): navigate `locations/1101/products`; the Products panel renders. Owner screenshot 2026-08-31 is prior evidence; re-prove headlessly. FAIL → HALT + ask (never retarget offices silently).
6. **Live probe B — hydration profile** (LR-ENC-008): measure time-to-functional for the search panel and the results grid (skeletons → rows-with-text → footer/count → handlers wired). Record measured ceilings in the walk evidence; these numbers parameterize every readiness helper in Phase 2 (no invented thresholds — `feedback_invented_thresholds_are_the_next_defect`).
7. **Live probe C — role gate** (NM-1750): run one search, select an item row, read the Add Product Code + View Product Code button states. If Add stays disabled/absent for the automation account → PCD add/edit flows become `blocked: role` → escalate via `/encore-questions` with the exact permission name; the rest of the plan proceeds (View flows are role-free per NM-1387).
8. **Live probe D — owned-count cell**: identify one non-barcoded item owned at 1101 (search Qty>0, locate an editable Owned cell per NM-1833). If none found, walk the LR-040-D data ladder (SELF-PRODUCE via an added product code if role allows / SELF-SERVE another item / ESCALATE) before declaring the editable-cell family data-blocked.

## Phase 0.1 — Materialize the Jira crossref (HUNTER)

Write `clients/encore/specs_planning/_internal/jira-defect-crossref-item-search-2026-08-31.md` from **Appendix A** (the 2026-08-31 MCP read of NM-2253 + NM-4's 193 children — this session's Rovo pass; LR-ENC-004 satisfied). If the Atlassian MCP is reachable, spot-re-verify 2–3 tickets (NM-2253 scope text; NM-1495 defaults; NM-2449 still open) and stamp `rovo_available: true`; if unreachable, stamp `rovo_available: false` + consume the appendix as-is (degrade, don't fake). Each entry is a LEAD classified by-design / open / resolved; the baseline artifact carries `jira_tickets: [NM-2253, NM-4, NM-1385, NM-1386, NM-1387, NM-1388, NM-1433, NM-1492, NM-1493, NM-1494, NM-1495, NM-1506, NM-1574, ...]`.

## Phase 0.3 — Old-site baseline walk (HUNTER — observation only)

Nav2 (`https://navigator2.training.psav.com/#/`) carries the legacy **item search** (baseline PRESENT per the 2026-06-22 recon; NM-1385/1493/1494/1495 all say "behaves the same as Navigator"). Walk it **for office 1101**, observation-only (zero mutations — LR-ENC-007), and emit `clients/encore/specs_planning/_internal/old-site-baseline/item-search-<EXEC-DATE>.md` with the `## Baseline diff` section. Classify every old-vs-new divergence (a) regression / (b) intentional (cite the Appendix-A ticket — e.g. Price column removed, Country removed per NM-1385) / (c) baseline-absent (`baselineScope: baseline-absent` for net-new pieces like Smart Search — not a HALT). If 1101 cannot be reached on nav2, record the blocker + fall back to observation on the default office for the SHARED chrome only, marking 1101-specific reads baseline-absent — never fabricate.

## Phase 0.75 — New-site TDW-Q walk, all three sub-surfaces (HUNTER)

LR-064 quick profile (LR-072):

1. **Stage 1 — machine enumeration (UNCHANGED)**: `scripts/walk-coverage/enumerate-page.mjs` against `locations/1101/products` in each walked state — Products tab at rest, post-search grid, an item selected, View Product Code open (per hierarchy segment reachable), Add Product Code open (if role allows), Availability calendar open, Product Groups tab, create-group dialog. The union JSON at `reports/walk-coverage/` is the denominator; never re-derive by hand. The enumerator is shadow-piercing (LR-062) — confirm it reaches inside the MFE web component; if it returns a near-empty set on a visibly populated page, that is an enumerator-vs-surface gap to resolve BEFORE any disposition (re-snapshot after hydration per LRN-002, LR-ENC-008 settle rules).
2. **Stage 2 — probes, quick scope**: probe only elements needed for L1 §2 cases + applicable §3 QUICK families + the Phase 0 probe list; everything else → `deferred-to-DEEP: <element/launcher id> (<reason ≥20 chars>)` (G1: a deferral row carries NO classification claim). Mandatory probe classes: LR-057 affordance-probe on every non-editable/display control (the item-name link, owned cells, availability cells, calendar button, group rows); dirty-state guard probe (§5 class 5 — QUICK-depth, both Stay/Leave) on Product Code dialogs; defaults from fresh state ×2 for divergences D1/D2; LR-036 boolean render probe per table before any boolean-reading helper.
3. **Stage 3 — blind re-drive**: floor min(3, live-row count) per grid.
4. **Stage 4 — disposition**: every manifest row exactly one of `covered-by-TC:` / `affordance-probed:` / `read-only-verified` / `out-of-scope: <reason ≥20c>` / `deferred-to-DEEP: <id> (<reason ≥20c>)`. No blanks. Claimed rows keep FULL LR-062 condition-5 provenance + LR-057 rigor (G2).

**Binding walk rules**: LR-ENC-008 — prove functional settle before recording any contract; any NEGATIVE claim ("does nothing", "filters nothing") requires the identical interaction re-run after +60s and +120s idle before it may be recorded. LR-ENC-009 — no DOM/markup accessibility observations; selector constraints go to the LR-029 missing-testid report. ALL-045 — `## Observations` with both buckets (Bugs/Defects + Suggestions) per surface, `none` allowed, absence = incomplete walk. §20-Q — openers hosting in-scope fields walked fully; other openers enumerated + deferred. Emit `walk-evidence-item-search-<EXEC-DATE>.md` with per-field TDW tier + raw evidence + verdicts. Delegation per the worker ladder: Haiku/Sonnet may drive deterministic `playwright-cli` probes; every disposition, verify, and verdict stays Opus (LR-064; judgment never delegates).

## Phase 1 — Case catalog, test cases, test plan, workbook (GIVER — adopt `/identity GIVER` first)

Executed per wave (PRS → PCD → PGR); each wave's 1a–1d complete before its Phase-2 wave starts.

### 1a — Field inventories (one per sub-surface, matching each test-case file — DSM D-22 precedent)

`field-inventories/item-search-product-search-<EXEC-DATE>.md`, `item-search-product-code-<EXEC-DATE>.md`, `item-search-product-groups-<EXEC-DATE>.md` — all 8 frontmatter keys + `Walk_Mode: quick` (must match CoverageMode or Cx fails) + `Baseline_Artifact` + all 7 sections + Coverage Manifest (`Coverage_Ratio: N/N (100%)`, `CrossCheck: clean`, `Walk_State` listing every walked state). Per-row `affordance:` + `evidence:` tokens; Test_Entity = office 1101.

### 1b — Axis 1: field cases (`field-case-generation.md` §2 + §2.1)

One TC per (field × applicable §2 column: Positive / BVA / Negative / Save-cycle), citing §2 by **row name** (no invented template IDs). Expected §2 row per control (walk-corrected):

| Control | §2 row | Plan-specific notes |
|---|---|---|
| Search-type selector ("Any Field" chip/dropdown) | Dropdown/combobox | Each documented option + each-option search executes; smart-search option = deterministic contract only |
| Any Field text | Plain text | Exact-string semantics (NM-1702); changed-text-no-stale-results (NM-1794); Save-cycle column n/a (search criteria, not persisted field) — persistence rides Axis-2 |
| Barcode | Plain text (constrained) | Code-39 charset/length leads (NM-1494): valid ≤42, 42-char boundary, lowercase/invalid-char handling per §2.1 oracle |
| Qty>0 / Active checkboxes | Checkbox | Default-state TCs resolve D1; filter EFFECT rides Axis-2 result-fidelity |
| Location / Region selects | Dropdown/combobox | Mutual-exclusion pair (NM-1493) as cross-field cases; default TCs resolve D2; LR-025 retry if option list large |
| Prep / Return date-times | Date/offset | Defaults (current-month lead), valid change, boundary (same-minute prep=return), Return<Prep negative with §2.1 oracle; LR-008 sign discipline for any offset math |
| Owned count cell (non-barcoded) | Click-to-edit grid cell | Commit paths per §2 row 12; no-op edit fires NO save (NM-1908); restore by reload-and-read (CEO-M2) |
| Product Code dialog fields (name, description per level) | Plain text | 50-char limit BVA (NM-1433/NM-1835 supersede 256), invalid-char negatives, §2.1 oracle |
| PC dialog dropdowns (Product Type, Service Type, Org, hierarchy parents) | Cascading dropdown | Service Type empty until Product Type (NM-1921); parent filters child; Org propagation leads (NM-1982/83) at L1 = one propagation case |
| Barcodeable | Checkbox | Read-only on Item segment in edit (NM-2085) — state assertion, not toggle |
| View/Add/Edit launchers, calendar button, item-name link | Lookup launcher | §2 row 11 template: open/content/select/cancel/Esc discipline, per-LAUNCHER dedup (LR-057) |
| Product Groups search + create fields | Plain text + per-walk | Create flow save-cycle = the PGR save contract (NM-2259) |

Every Negative/out-of-range BVA carries the **§2.1 rejection-affordance oracle** — (a) announced (poll per LR-010) AND (b) escapable via natural blur recorded BEFORE any cleanup Escape.

**Irreversibility gate (before any mutating positive case)**: Add Product Code and Create Product Group write to the shared 1101 corporate catalog with no observed delete path (deactivate-only — NM-1904 lead). Data discipline: `AUTO-`-prefixed unique names (self-produced), deactivate-after where possible, restore owned counts by captured-original reload-proof. LR-ENC-007 pre-authorizes e2e mutations — no permission pauses; collision discipline only (no concurrent runner).

### 1c — Axis 2: surface/behavior cases, QUICK only (§3, LR-065)

Ordinary 3-segment IDs + `**Surface_Family**: <family> (QUICK)` body line. No `-SBC-` infix (G6); marker NEVER on the heading (ALL-091). Applicability per sub-surface — each applicable family gets ≥1 QUICK TC; inapplicable = `out-of-scope:<family>=<reason ≥20 chars>`:

| Family | PRS grid | PCD dialogs | PGR grid |
|---|---|---|---|
| result-fidelity | ✔ search/filter/region queries return matching rows (exact-string; qty>0 honored under region NM-1787) | out-of-scope (no result grid inside dialog; hierarchy dropdown filtering rides 1b cascading row) | ✔ group search returns the named group |
| pagination | walk decides (footer/virtualization unknown) — TC or out-of-scope with reason | out-of-scope expected | walk decides |
| sorting | ✔ one column asc↔desc content-anchored (NM-1789); default-sort read (NM-1790) recorded not assumed | out-of-scope expected | walk decides |
| combination | ✔ text+filters+region coherent set; location⊕region exclusion; blank-both = all | out-of-scope | out-of-scope expected |
| render-state | ✔ item-name link opens Asset Information (smoke); availability cells render numbers-or-dash post-settle; location column shows number+name (NM-1791); ProductCodeID presence (NM-2318) | ✔ view-per-segment renders correct section stack (NM-1387 scenarios 1–5); History tab read-only; Translations tab renders | ✔ created group renders in grid |
| empty-vol | ✔ no-results state verbatim (impossible-string search); content-anchored reads, never strict row-count (LR-022/LR-053) | out-of-scope | ✔ no-results state |
| persistence | ✔ criteria/sort survive reload via URL params (NM-1616); criteria RESET on location change (NM-1802); dirty-guard on dialogs per §5 class 5 | ✔ unsaved-changes guard Stay/Leave on dirty dialog close | walk decides |

Zero-delta discipline (LR-040-D): any mandatory-effect probe (filter/sort) returning no delta → `DIFFERENTIAL-DATA-REQUIRED` + the SELF-PRODUCE → SELF-SERVE → ESCALATE ladder by name; never author the zero-effect as expected.

### 1c-bis — Expected size (estimates, not targets — the walk's denominator decides)

| Sub-surface | Axis 1 | Axis 2 | Band |
|---|---|---|---|
| PRS | ~28–38 | ~10–14 | 38–52 |
| PCD | ~30–45 | ~4–6 | 34–51 |
| PGR | ~10–16 | ~4–6 | 14–22 |
| **Plan** | | | **~86–125** |

### 1d — Artifacts and data discipline

- Catalog: `field-case-catalogs/item-search-<EXEC-DATE>.md`.
- Test cases: `clients/encore/specs_planning/test-cases/setup/item-search/item_search_product_search_test_cases.md` + `..._product_code_...` + `..._product_groups_...` — 9-field header incl. `Coverage mode` QUICK (L1), Test Entity office 1101, `Verified against` citing the inventories + machine JSONs.
- Test plans: `specs_planning/test-plans/setup/item-search/` (matching basenames, `_test_plan.md`).
- Workbook: `npm run planner:post-complete <id>` rebuild → `clients/encore/testcases/encore_test_cases.xlsx`; `npm run check:tc-parity` exit 0 per wave.
- TC bodies: plain-English step tables with per-step Expected Result, no internal jargon (heading = client-facing Title; ALL-091 / xlsx-lint deny-list).
- Data: `src/data/item-search/` constants `as const`, office-1101-scoped, `AUTO-` prefixes for created entities, no env values in selectors/data.

## Phase 2 — Selectors, page objects, specs (BUILDER — adopt `/identity BUILDER` first; HARD STOP #11 blocks any spec before the wave's GIVER artifacts exist)

1. Selectors `src/selectors/item-search/{product-search,product-code,product-groups}.ts` — `as const`, own namespace (LR-017), testid-first; missing testid = next-best locator + `(MISSING — using <locator-kind>; tracked in testid-gap-report)` per current LR-014 (NEVER `test.fixme` for this) + LR-029 report rows.
2. Page objects `src/pages/item-search/` ×3 extending BasePage: direct navigation to `locations/1101/products`; readiness helpers gated on the Phase-0 measured hydration ceilings + skeleton-zero (never row-count — grid-skeleton trap; never `networkidle` LR-023); `@step` plain-English labels on every public action (LR-ENC-006, `npm run check:step-labels`).
3. Reuse mandate: grep navigation.md §B before writing any helper — `fillAndTab`/`clearAndTab`, `setRadixCheckbox`, dialog confirm patterns (LR-012 — verify shared-vs-custom on THIS surface, don't assume), `clickSortColumn` retry (LR-025), content-anchored history/grid lookups. NOT-reusable expected: `navigateToSubTab` (top-level URL).
4. Specs `tests/item-search/{product-search,product-code,product-groups}.spec.ts` — FCC describe at TOP then `SBC — <sub-surface>` describe (blend-at-top), tags `@item-search @<sub>`; DSM instantiation pattern in beforeEach; per-test baseline restore (LR-019); every TC ID resolves via `--list`.
5. Numeric/formatted inputs typed char-by-char, never `fill()` (formatted-input corruption trap); downloads re-fed to uploads via `saveAs()` if any I/O appears (expected none at QUICK).
6. Save proofs: reload-and-read is the only persistence proof (optimistic Save-disable lies; DSM page-route sync-POST precedent — capture the real save endpoint from the walk network evidence, filter listeners on the API endpoint never the page URL per LR-056/ALL-086).
7. Structured-record asserts cover-or-explain every field of the asserted record (LR-068 — no silent partial coverage).
8. Availability cells: assert post-settle rendered contract (number or "-"); never assert during the hydration window (LR-ENC-008); R-536 — re-baseline row counts after any filter mutation via readiness helper, never immediately.
9. Render-fail rule: a failing surface assertion (link doesn't navigate, wrong boolean) → RCA → classify regression-from-baseline (file `BUG-ISR-<SUB>-NNN` with `baselineComparison` per LR-034) / baseline-absent (`/encore-questions`) / by-design (documented skip). Never blind auto-file; LR-ENC-009 bars markup-only findings.
10. Wave exit: spec green ×2 (`--retries=0 --workers=1`), `npm run check:spec-quality` clean on the working tree (LR-060 ob. 4), `/regression-guard` AFTER clean.

## Phase 3 — Audit (WATCHDOG — fresh session, AUD-017; adopt `/identity WATCHDOG`)

Emit `clients/encore/specs_planning/_internal/audit-item-search-<EXEC-DATE>.md`: (1) FCC-completeness — every inventory field × §2 applicable columns covered-or-dispositioned; (2) surface-completeness — every applicable §3 family ≥1 QUICK TC or reasoned out-of-scope; (3) walk completeness — Coverage_Ratio 100%, CrossCheck clean, opener frontier empty, G1-clean deferrals; (4) bug-loop closure — every walk Observation bucket item dispositioned (bug filed / discussion-item / suggestion logged); (5) divergence ledger D1/D2 + any new — resolved with classification; (6) `npm run check:tc-parity` + `check:spec-quality` + suite green ×2 re-run evidence; (7) LR-ENC-008 spot-audit — no contract recorded from an unsettled read (sample 3 lazy-surface TCs).

## Phase 4 — Closure (OWNER)

1. Append every `deferred-to-DEEP` row as a grep-verifiable seed line item in `SUBPLAN_PRODUCTS_DQU.md` (LR-040(b) — grep each before closing).
2. navigation.md §C Exploration Registry row (Item Search / Products, findings files, date); MODULE_REGISTRY.md + REQUIREMENTS.md entries.
3. Activity-log row (LR-028, LR-037 timestamp ≥ touched mtimes); `/reflect` (graduation scan — MFE/shadow-DOM walk lessons are a known gap worth capturing); Adjacent-Sweep ritual (DO-NOW / SPAWN / APPEND with grep verify).
4. LR-027 Execution Summary; replace `<EXEC-DATE>` placeholders; flip the Status field to DONE + Executed date; `git mv` to `plans/done/`; `npm run plans:reindex`; `/final-q`.
5. **Not in this plan's scope**: no push to any remote; no Jira transitions/comments (owner does those); no XLSX ship.

---

## Per-Identity Satisfaction

> **Closure instruction**: at DONE-flip, replace every `<EXEC-DATE>` with the real dated filename. C6 greps literal cell paths; a placeholder DENIES the flip.

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | Jira crossref · old-site baseline · walk evidence | `clients/encore/specs_planning/_internal/jira-defect-crossref-item-search-2026-08-31.md`<br>`clients/encore/specs_planning/_internal/old-site-baseline/item-search-2026-08-31.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-item-search-2026-08-31.md` | `ls clients/encore/specs_planning/_internal/walk-evidence-item-search-*.md` |
| GIVER | field inventories (one per sub-surface) · catalog · test-case MDs · test plans · XLSX | `clients/encore/specs_planning/_internal/field-inventories/item-search-product-search-2026-08-31.md`<br>`clients/encore/specs_planning/_internal/field-inventories/item-search-product-code-2026-08-31.md`<br>`clients/encore/specs_planning/_internal/field-inventories/item-search-product-groups-2026-08-31.md`<br>`clients/encore/specs_planning/_internal/field-case-catalogs/item-search-2026-08-31.md`<br>`clients/encore/specs_planning/test-cases/setup/item-search/item_search_product_search_test_cases.md`<br>`clients/encore/specs_planning/test-cases/setup/item-search/item_search_product_code_test_cases.md`<br>`clients/encore/specs_planning/test-cases/setup/item-search/item_search_product_groups_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/item-search/item_search_product_search_test_plan.md`<br>`clients/encore/specs_planning/test-plans/setup/item-search/item_search_product_code_test_plan.md`<br>`clients/encore/specs_planning/test-plans/setup/item-search/item_search_product_groups_test_plan.md`<br>`clients/encore/testcases/encore_test_cases.xlsx` | `npm run check:tc-parity` |
| BUILDER | selectors · page objects · data · specs | `clients/encore/src/selectors/item-search/products.ts`<br>`clients/encore/src/selectors/item-search/product-code.ts`<br>`clients/encore/src/selectors/item-search/product-groups.ts`<br>`clients/encore/src/pages/item-search/item-search.page.ts`<br>`clients/encore/src/pages/item-search/item-search-grid.page.ts`<br>`clients/encore/src/pages/item-search/product-code.page.ts`<br>`clients/encore/src/pages/item-search/product-groups.page.ts`<br>`clients/encore/src/data/item-search/item-search.ts`<br>`clients/encore/tests/item-search/product-search.spec.ts`<br>`clients/encore/tests/item-search/product-code.spec.ts`<br>`clients/encore/tests/item-search/product-groups.spec.ts` | `npx playwright test clients/encore/tests/item-search --list` |
| HEALER | (none) — net-new module, no pre-existing failing specs; fires only if a wave goes red past BUILDER's fix budget | (none) | (none) |
| WATCHDOG | completeness + bug-loop-closure audit | `(skipped: AUD-017 §19 bars self-grading — the producing session may not audit its own delivery; deep audit deferred to plans/pending/PLAN_NM2253_ITEM_SEARCH_EXTERNAL_01_AUDIT.md with a 10-claim verification table; in-session WATCHDOG ran the machine gates only — tc-parity PASS, spec-quality 73/73 OK, module 42 passed — and closed the Observations bug-loop: BUG-ISR-PCD-001 + BUG-ISR-PRS-001 filed)` | `npm run check:spec-quality` |
| GARDENER | (none) — net-new module; no structural refactor of existing code | (none) | (none) |
| OWNER | trio disposition · module-code mint · registries · index | `plans/pending/SUBPLAN_PRODUCTS_00_FOUNDATION.md`<br>`plans/pending/SUBPLAN_PRODUCTS_FCC.md`<br>`plans/pending/SUBPLAN_PRODUCTS_DQU.md`<br>`plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md`<br>`export_test_cases/module-codes.json`<br>`.claude/context/navigation.md` | `node scripts/plans-reindex.mjs --check` |

### Duty-coverage note (`/planning` Step 3 Layer-0 gate)

- **HUNTER** HARD STOPS: #1/#2 location+URL (1101 pinned, URL fenced) — Phase 0.5; #4 read-only-first + #10 baseline-first — Phase 0.3 executes before classification; #9 affordance probe — Phase 0.75 stage 2; #11 walk completeness LR-062/LR-064 — stages 1–4; #12 empty-surface — LR-040(c) ladder wired into probes C/D + zero-delta rule; #13 observations ALL-045 — mandatory buckets per surface.
- **GIVER** HARD STOPS: #4 read-only-first / #5 restore-always — 1b data discipline + reload-proof restores; #8/#9/#10 TC-plan sync, count check, post-complete — 1d; #12 fresh-state defaults + #14 defaults-from-DOM — divergences D1/D2 protocol; #15 save-button scope + #16 revert behavior — save-cycle cases; #17 dropdown features — §2 dropdown rows; #18 LR-057 — launcher templates; #19 LR-062/064 — inherited manifest; #20 Jira-first PLN-051 — Phase 0.1 crossref consumed into 1b/1c; #21 verify-before-blocked — Gate 3; #22 empty-surface — 1c empty-vol + LR-040(c); #23 observation/error-render capture — §2.1 oracle evidence.
- **BUILDER** HARD STOPS: #0 walkthrough-first — consumes dated inventories (SP-AAE-04); #1 tests must run — wave green ×2; #7 verify planner claims LR-007 — spot-check inventory rows before spec use; #11 no spec without GIVER artifacts — wave ordering; #12 no jargon LR-058 — Phase 2.4/1d; #13 atomic un-skip — Gate 5; #14 unknown-expected-value — GEN-045 routes to crossref/questions; #15 no red-to-task-chip — LR-060 ob.3; #16 per-test baseline — LR-019 restores.
- **WATCHDOG** HARD STOPS: #0a no self-audit — Phase 3 fresh session; #3 assume errors exist; #5 pre-escalation self-help — crossref before questions; #11/#11b walk-coverage + doctrine audit — Phase 3 items 1–3; #12 observation-trail — item 4.
- **Known rule interplay surfaced (not silently resolved)**: DQU's original seed list includes "a11y (keyboard/aria)" — LR-ENC-009 (2026-08-28) bars markup/a11y findings as bugs/TCs/observations for this client. The Phase 0 DQU note records that its a11y seed must be re-scoped to behaviour-only at activation.

---

## Acceptance criteria (LR-040 closure gate)

- [ ] Phase 0 trio disposition landed: two SUPERSEDED flips + DQU repoint + master annotation + reindex clean.
- [ ] 1101 surface probe + hydration profile + role probe + owned-cell probe recorded in walk evidence (probes A–D).
- [ ] Jira crossref exists with `rovo_available` stamped honestly; baseline artifact carries `jira_tickets:` key (LR-ENC-004 structural proof).
- [ ] Old-site baseline artifact exists with `## Baseline diff`; every divergence classified (a)/(b)/(c); D1/D2 resolved with REQ-014 classification.
- [ ] Three field inventories: 8 keys + `Walk_Mode: quick` + 7 sections + Coverage Manifest each — `Coverage_Ratio 100%`, `CrossCheck: clean`, no blank dispositions, G1-clean deferrals.
- [ ] Axis 1: every claimed field's applicable §2 columns covered; every Negative/BVA carries the §2.1 oracle (both prongs).
- [ ] Axis 2: every applicable §3 family per sub-surface has ≥1 QUICK TC or `out-of-scope:<family>=<reason ≥20c>` (LR-065); no `(QUICK)` on any TC heading (ALL-091).
- [ ] Location⊕Region exclusion, region+Qty>0, criteria-reset-on-location-change, URL persistence, no-stale-results each have a TC (the Jira-AC combination floor).
- [ ] `TC-ISR-*` IDs only after `ISR`/`PRS`/`PCD`/`PGR` minted in module-codes.json (G6a/G6c); `npm run check:tc-parity` exit 0; XLSX rows == MD count.
- [ ] All three specs green ×2 (`--retries=0 --workers=1`); `npm run check:spec-quality` clean on the working tree BEFORE any green claim (LR-060 ob. 4).
- [ ] Every mutating TC restores state by reload-and-read proof; created entities `AUTO-`-prefixed; no leaked live-data changes (CEO-M2).
- [ ] Every walk Observation item dispositioned; any bug filed carries `baselineComparison` (LR-034) and is behaviour-class (LR-ENC-009).
- [ ] Every deferred-to-DEEP row grep-verifiable in `SUBPLAN_PRODUCTS_DQU.md` before DONE-flip (LR-040(b)).
- [ ] `/regression-guard` before/after = no unrelated changes; activity-log row per LR-028/LR-037; `/final-q` verdict block per LR-042.

---

## Verification

```bash
# Trio disposition + index integrity
grep -l "SUPERSEDED" plans/pending/SUBPLAN_PRODUCTS_00_FOUNDATION.md plans/pending/SUBPLAN_PRODUCTS_FCC.md && node scripts/plans-reindex.mjs --check
```

```bash
# Registry, test-case, workbook and type parity — the gate everything downstream rides
npm run check:tc-parity && npm run lint:testcases && npm run xlsx:lint && npm run typecheck
```

```bash
# Every authored TC ID resolves to a real test
npx playwright test clients/encore/tests/item-search --list
```

```bash
# Working-tree spec quality — LR-060 obligation 4, must pass BEFORE any green claim
npm run check:spec-quality
```

```bash
# The module's own suite, no retries — run twice, both green
npx playwright test clients/encore/tests/item-search --retries=0 --workers=1
```

```bash
# Deferred-to-DEEP hand-off is real (LR-040(b))
grep -n "deferred-to-DEEP" clients/encore/specs_planning/_internal/field-inventories/item-search-*.md && grep -c "ISR" plans/pending/SUBPLAN_PRODUCTS_DQU.md
```

---

## Deferral Authorization

(Deliberately empty at authoring — Gate 6: any deferral recorded here requires the owner's quoted chat authorization; the agent may not self-author one.)

---

## Plan-Deviations log

| # | Date | Deviation | Why | Disposition |
|---|---|---|---|---|
| D1 | 2026-08-31 | Owner in-chat rulings during execution: dates field-level-only (feature not functional yet — drops the NM-1388 availability-window behavioral assertions from QUICK), barcode filter data owner-provided (pending), Grid Options + full tooltip sweep explicitly in scope, region-overrides-location direction confirmed | Owner scope clarification mid-execution (recorded as OR-1..OR-6 in jira-defect-crossref-item-search-2026-08-31.md) | Case set narrowed/extended accordingly; availability-cell render-state assertion (numbers-or-dash) RETAINED (not date-coupled) |
| D2 | 2026-08-31 | Phase 0.3 nav2 baseline walk env-blocked: host TLS-rejects all Playwright browser engines (Chromium ×2, Edge; curl/schannel 200 OK; TLS-1.2-only legacy server) — access drift since the 2026-08-26 DSM baseline | Environment, outside repo control | Blocker + evidence in clients/encore/specs_planning/_internal/old-site-baseline/item-search-2026-08-31.md; divergences classified (c) baseline-absent-this-execution; one varied-wait retry before GIVER close; LR-060 ob.2 — only this step defers |
| D3 | 2026-09-01 | Owner extended the date-block scope mid-execution: "yes add the month-cycling probe" + the pair-validation screenshot question → TC-ISR-PRS-020 (pair validation, green) + TC-ISR-PRS-021 (12-month render integrity, expected-fail) added beyond the D1 field-level-only ruling; PRS 19→21 TCs | Owner directive in chat (2026-09-01); the probe surfaced the value-overspill defect a single-month read had missed | Both TCs landed with page-object date helpers; plan/MD/XLSX synced; defect filed as BUG-ISR-PRS-001; result-side date behavior stays excluded per the unchanged OR-1 core |
| D4 | 2026-09-01 | TC-ISR-PRS-006 correction cycle: an interim same-day rescope to "never truncates" (from a td-level census — a blind instrument returning a never-varying zero) was WITHDRAWN; the original truncation-tooltip contract was restored with the measurement pinned to the cell's inner element (positive control: 192 clipped cells) | The td always reports fitting (sw==cw); only the inner span clips — the first census measured the wrong node | All three artifacts (TC MD, test plan, inventory) carry dated withdrawn/rescind notes, no silent rewrites; spec asserts both tooltip halves with stage-clearing |
| D5 | 2026-09-01 | Phase 3 restructured at execution: AUD-017 (AUDIT.md HARD STOP 0a) bars same-session self-grading, and §2 makes WATCHDOG READ-only on the bug register — so bugs filed under the spec-generation identity (which holds CREATE), in-session WATCHDOG limited to machine gates + Observations closure, deep audit deferred to PLAN_NM2253_ITEM_SEARCH_EXTERNAL_01_AUDIT.md (fresh session) | The plan's own Phase 3 header already said "fresh session, AUD-017"; the walk-evidence note "file at GIVER" contradicted §2 and was corrected with a dated note | LR-040(b): deep audit = grep-verifiable named recipient; bug-loop closed in-session (both bugs filed + back-referenced in walk-evidence, both inventories, both TC MDs) |

---

## Open decisions locked at authoring (owner may veto at approval)

1. **Supersede the 2026-06-22 trio** (vs. amending it in place) — chosen for the five staleness epochs table above; DQU survives as DEEP recipient.
2. **Module code `ISR` + submodules `PRS`/`PCD`/`PGR`** (vs. the trio's `LOC`/`PRD` single flat namespace) — chosen for DSM-precedent consistency + per-Jira-sub-task traceability.
3. **Smart Search = deterministic smoke only** at QUICK (NM-2031 In Progress).
4. **Mutating flows run with `AUTO-`-prefixed self-produced data on the shared 1101 catalog** (LR-ENC-007 pre-authorizes; deactivate/restore discipline applies; no deletion path assumed).

---

## Execution Summary

*(LR-027 — closed 2026-09-01)*

**Delivered (all machine-verified at closure):**
- **41 TCs** across 3 sub-surfaces (PRS 21 · PCD 10 · PGR 10), each an FCC/SBC-QUICK case per the catalog; `check:tc-parity` PASS (spec↔MD↔XLSX; ISR workbook sheets 21/10/10 rows).
- **3 specs green as a module**: final full run **42 passed (6.1m, 2026-09-01)** after the wave-2 date TCs — plus the earlier ×2 module runs (7.8m/6.8m, 40 passed) pre-wave-2. TC-ISR-PRS-021 is a deliberate expected-fail pinning BUG-ISR-PRS-001 (verified failing on the intended spills assertion, not an incidental crash).
- **BUILDER stack**: 3 selector files, 3 page objects (+ shared ItemSearchPage helpers: keystroke-debounce-safe `typeByKeys` 800ms settle, popover index anchors around the accessible-name trap, tooltip stage-clearing, cmdk Enter-commit, inner-element truncation measurement with positive control, collapse name-flip oracle, calendar month-cycling + overflow measurement + pair-validation readers), 1 data file.
- **HUNTER stack**: Jira crossref (193-child NM-4 sweep + OR-1..OR-6 owner rulings), nav2 baseline attempt (env-blocked, evidenced), walk evidence with TDW-Q stages 1–4 complete, 2 machine-bound coverage manifests verifyDenominator-green; Coverage_Ratio 100% with 42 G1-clean `deferred-to-DEEP` rows.
- **Bugs filed (LR-034, baseline-absent)**: `BUG-ISR-PCD-001` (View→Category segment silent no-op; 4 sibling positive controls) + `BUG-ISR-PRS-001` (date value overspill, 7/12 months Prep up to +30px, Return +23px; screenshot + expected-fail TC pin). Both back-referenced in walk-evidence Observations, both inventories, both TC MDs. Discussion-items (not bugs): PGR empty-search 0-vs-all divergence; Labor blank-Category projection. Held under owner ruling OR-1: View Availability inert button (enabled-state TC only).
- **Closure artifacts**: 42 DQU seeds appended + full-42 grep-verified (`SUBPLAN_PRODUCTS_DQU.md`); AUD-017 external audit plan `PLAN_NM2253_ITEM_SEARCH_EXTERNAL_01_AUDIT.md` (10-claim verification table); registries + navigation updated; D1–D5 deviations logged.

**NOT done, honestly, with recipients:**
- Deep audit (plan Phase 3 judgment half) — barred in-session by AUD-017; handoff-target: PLAN_NM2253_ITEM_SEARCH_EXTERNAL_01_AUDIT.md recipient-required-token: 10-claim
- nav2 baseline walk — env-blocked (TLS middlebox); evidence + retry protocol in `clients/encore/specs_planning/_internal/old-site-baseline/item-search-2026-08-31.md`; unlock = infra allowing Playwright ClientHello, or a human-driven manual baseline pass.
- Barcode positive-filter TC — awaits owner-supplied numbers (OR-4); recipient: DQU seed section "Carried context".
- Date RESULT-side behavior + View Availability behavior — owner ruling OR-1 (feature not functional yet); recipient: DQU "Carried context" + walk-evidence Observations item 2.
- L2/L3 depth (42 elements) — quick-tier by design; → DQU seed list.
- No push / no PR / no Jira transition — house rule, owner-only actions.

**Known pre-existing signals NOT introduced here** (verified against gate output): tc-parity title-divergence FLAGs in CPR/LOS/LOC families; `check:spec-quality` reject-oracle announce for TC-SVC-HIS-012 (Service Charge module).

---

## Handoff (post-execution)

Chat-only summary per `feedback_handoff_in_chat_only.md`. On close: Item Search is QUICK-covered end to end (three green specs, parity-clean workbook, dispositioned denominators), the stale Products trio is retired with DQU repointed as the DEEP recipient, and NM-2253's seven sub-tasks each map to named green TCs the owner can cite when transitioning the ticket.

---

## Appendix A — Jira digest (read 2026-08-31 via Atlassian MCP; every fact is a LEAD)

**NM-2253** "Automate Item Search" — Story, Highest, assignee vikas yadav, parent epic NM-3489. Playwright / Field Validation, save / E2E / regression suite / 1101-only. Sub-tasks NM-2254..2259 + NM-3650 (all To Do, same scope line).

**NM-4** "Products" — the dev epic; 193 children read across 2 pages (complete). UI stories (built the module):

- **NM-1385** UI: Product Search — Text Search (Done): Smart Search (plain language, `/api/product/search/smart`) + Any Field search (name/description/category/product group, `/api/product/search`). Result columns: Category, Sub Category, Class, Product Group, Sub Class, Item, Description, Available (→NM-1388), Owned (incl. OOS + in-sequence), Out Of Service, In Sequence, Location Name (number+name). Removed vs legacy: Country (criteria), Price (results).
- **NM-1386** UI: Add a Product Code (Done): from search after selecting an item + product-manager role; add item/sub-class/class/sub-category/category cascade; translations optional, blank-translation save clean; ticket says 256-char limits — superseded by NM-1433/NM-1835 (50). APIs: `/api/product`, `/api/product/servicetypes/{culture}`, `/api/producttypes/{culture}`.
- **NM-1387** UI: View Product Code (Done): view per segment shows that segment's section + ancestors; Translations tab; Product Code History tab.
- **NM-1388** UI: Availability for results (Done): per-visible-row `SearchAvailability` POST (LocOffID + PrepDate/ReturnDate + item/owner pairs) → Avail + QtyInSequence; "-" when the viewer's location may not see it (venue↔warehouse rules).
- **NM-1433** UI: Editing the Product Code (Done): edit level N saves N-and-below; names ≤50, item description ≤50, only items have descriptions; history read-only; dropdowns cascade-filter; `/api/product/status` for active flips.
- **NM-1492** (Duplicate→NM-1388): prep/return dates drive availability.
- **NM-1493** UI: Location and Region Search (Done): location default = logged-in location; region default = none; selecting one clears the other; blank both = all; APIs same as search.
- **NM-1494** UI: Barcode Search (Done): Code 39, ≤42 chars, A–Z 0–9 `$-/+%` space; not required.
- **NM-1495** UI: Active + Qty>0 filters (Done): both default ON per ticket (see divergence D1); qty>0 limits to owned>0; unchecked returns all matches.
- **NM-1506** UI: Asset Information integration (Done): item-name hyperlink opens legacy asset info (history + asset status changes).
- **NM-1509** UI: standalone web component; **NM-1574** UI: Angular host via Module Federation, inputs canEdit/authToken/theme; **NM-1707** UI: product-group table height.
- Won't Do: NM-1389 (PC history view), NM-1390/NM-1425 (translations views), NM-877 still To Do (non-barcode owned qty story) though owned-count editing shipped via defect fixes (NM-1906/NM-2274 Done).

Behavior-defining QA/Production defects (all Done unless noted — regression-suite seeds): NM-1616 URL query-param persistence; NM-1645/46/47/48 search panel/results fixes; NM-1702 Any Field exact-string; NM-1750 Add-PC role restriction ("Corp Asset Item Maintenance"); NM-1765 Oracle Item Number not required; NM-1787 region honors Qty>0; NM-1789 sortable columns; NM-1790 legacy-like default sort; NM-1791 show searching-location; NM-1792 location list validity; NM-1794 no stale results; NM-1798/1799 footer/location-click UX; NM-1801 product-group segment in results; NM-1802 criteria reset on location change; NM-1804 edited desc refresh; NM-1805/06/07 PC history records; NM-1817 region availability vs home location; NM-1819 filters section; NM-1820/1911 Save-enable on first open; NM-1826 return-to-default sort; NM-1827 "Product Group" column label; NM-1828 direct-URL access; NM-1829 location tooltip; NM-1830/1832 asset info display; NM-1833/1834 Owned column correctness/clickability; NM-1835 50-char + invalid-char enforcement; NM-1846/1914 calendar shows availability; NM-1865/1950(Rejected)/1984(Rejected) smart-search quality; NM-1878/1942/1926 column width/resize; NM-1901 dark-mode label; NM-1903 Active-filter-unselected story; NM-1904 activate-item-with-inactive-subclass; NM-1908 no-op owned edit fires no save; NM-1918 service types match product type; NM-1921 Service Type empty until Product Type; NM-1954 unit tests; NM-1964/1965/1966 PC translations/name-save/refresh; NM-1975 segment dropdowns above edited level; NM-1982/1983 org propagation + validation msgs; NM-2028 smart-search intent; **NM-2031 smart-search enhancements (In Progress)**; NM-2042 legacy availability 500; NM-2056/2177 PC history org/name records; NM-2063 location label consistency; NM-2077/2100(CannotRepro)/2111 product-org "All" semantics; NM-2085 barcodeable read-only; NM-2091 toaster duration; NM-2119 grid-options column state; NM-2127 availability issues; NM-2139/2140 grid refresh after edit; NM-2144/2318 ProductCodeID in UI + results; NM-2145/2236 org rules; NM-2169 shared-inventory owned counts; NM-2274 owned-count update when not owned; NM-2275 product-type per segment; **NM-2384 Canada products (To Do)**; **NM-2449 duplicate-name warning (To Do — do not assert)**; NM-3623 hot-list (In Progress, adjacent).

## Appendix B — Seed control map (leads from the 2026-08-31 screenshot + tickets; the machine walk owns the real denominator)

Left panel: PRODUCT card — search-type selector chip ("Any Field"), Any Field text input, barcode input ("Enter barcode"); FILTERS card — Quantity Greater Than Zero checkbox, Active checkbox, Location select ("Select Location"), Region select ("Atlanta" observed); PREP/RETURN DATE TIME card — Prep Date Time ("August 1st, 2026 12:00 AM" observed), Return Date Time ("August 31st, 2026 11:59 PM" observed). Info icons on Products header + PRODUCT card. Expected but not in frame (walk confirms): Search/Reset actions, results grid + footer, row selection, Add/View Product Code buttons, Check Availability calendar button, Product Groups tab, grid-options/column menu.
