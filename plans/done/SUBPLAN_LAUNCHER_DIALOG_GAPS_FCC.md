> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC.md`. All context below.**
>
> The agent self-bootstraps from this file's frontmatter + sections, with **zero additional user prompting**:
>
> 1. **Identity**: load `/identity` per the Identity field below (OWNER shell; per-phase `/identity HUNTER|WATCHDOG|GIVER|BUILDER|HEALER|GARDENER` at each phase boundary).
> 2. **Skills**: load every skill in the Skills line of §Bootstrap (leading skill auto-calls its chain).
> 3. **Model + thinking + permission-mode**: read the Model / Thinking / PermissionMode frontmatter fields (all three required per LR-041).
> 4. **Dependency gate**: verify every Depends-on item is DONE in plans/done/. HALT if blocked.
> 5. **Context load**: read PLAN_BIG_PIVOT_FCC_MASTER.md §Doctrine + §False-Green Sweep Doctrine + §Cascade closure rules, then every file in §Bootstrap Context-files. Missing context file = HALT.
> 5.5. **Browser tool**: declared `cli` in frontmatter per the LR-038 v2 matrix (dialog walkthroughs + unattended save-cycles; no visual/CSS assertion, no fresh-passkey need, no mid-execution `pause:` step). Announce choice + reason in first output. Mid-subplan switches → `[BROWSER-SWITCH]` log per LR-028.
> 6. **Phase 0 FIRST**: dependency + browser-tool + empirical-verification gate before any edits.
> 7. **Execute Phases 0 → 6** in order. Each phase covers BOTH workstreams (A = Pay To List / left panel; B = Master Bill To / account-address) before moving on. Phase boundaries = identity switches (clean re-load per feedback_identity_switch_protocol).
> 8. **Handoff**: flip the Status field to DONE + add the Executed date, append activity-log row (LR-028 + LR-037), annotate the master + BOTH DONE sibling subplans, `git mv` to plans/done/, `npm run plans:reindex`, `/final-q`.
>
> **HALT + ASK USER (in chat — never AskUserQuestion pop-ups, user instruction 2026-06-11)** if: dependency blocker / the Pay To launcher cannot be found on the live app at all (contradicts user screenshot — gather evidence first) / a restore anchor cannot be determined by any non-mutating means (A: office 1604's current payToId; B: the verbatim original Master Bill To address — NEVER save a change without a proven restore path) / a save-restore probe leaves 1604 on a non-original value (STOP all other work, restore manually, then report) / scope ambiguity beyond the KEEP list / Phase 0-1 discovers >30% scope extension / regression-guard shows unrelated changes / LR-037 timestamp drift / **LR-040 closure-completeness — any planned item not classifiable (a) MCP-proven, (b) grep-verifiable line item in a named existing recipient subplan, or (c) user-flagged discussion-item with named flag**.

---

# SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC

**Status**: DONE
**Executed**: 2026-06-11
**Priority**: P1
**Created**: 2026-06-11
**Identity**: OWNER (multi-identity by phase — HUNTER → WATCHDOG → GIVER → OWNER(RCA) → GIVER → BUILDER → WATCHDOG/HEALER → GARDENER → OWNER(prevention+closure))
**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md
**Depends on**: SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC.md (DONE 2026-06-03 — its Pay To miss is Workstream A), SUBPLAN_ACCOUNT_ADDRESS_FCC.md (DONE — its Master Bill To selection gap is Workstream B), SUBPLAN_NOTES_FCC_PILOT.md (DONE 2026-05-22 — `saveAndVerifyCase` runner infra at `clients/encore/src/utils/field-case-runner.ts`)
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**BrowserTool**: cli
**Author**: Rutvik (via Claude Fable 5)
**ActiveClient**: encore

co-doctrine: §False-Green Sweep Doctrine (PLAN_BIG_PIVOT_FCC_MASTER.md) — NOT a second parent (per LR-048 singular-Parent schema).

---

## Session 1 Execution Progress (2026-06-11) — Session 1 left Status PENDING; Session 2 closed it (see ## Execution Summary)

Executed under `/execute ultrathink`. The **discovery + RCA + prevention** half landed in Session 1; the **build + parity + closure** half (iterative live `npx playwright test` runs) landed in Session 2 (2026-06-11). Session 1 left Status PENDING by design — the full closure record is in the **## Execution Summary** below.

**DONE this session (all live evidence durably banked; office 1604 verified clean on both anchors):**
- **Phase 0** ✅ — gate PROCEED. `clients/encore/specs_planning/_internal/phase-0-verification-launcher-dialogs-2026-06-11.md`. Next-free IDs confirmed: **TC-LOC-LP-028**, **TC-LOC-ACC-032**.
- **Phase 0.5b** ✅ — both old-site baselines refreshed; **BL-DIV-4 re-classified** from evidence (old-site Pay To is interactive on BOTH sites → PARITY, NOT "intentional UX change to static"). `clients/encore/specs_planning/_internal/old-site-baseline/{left-panel-basic-information,account-address}-2026-06-11.md`.
- **Phase 0.5fg** ✅ — 12-pattern false-green sweep (incl. new UNPROBED-AFFORDANCE). 5 UNPROBED-AFFORDANCE findings, **0 strict false-greens** (all coverage-adds, no RED fix needed). `clients/encore/specs_planning/_internal/false-green-sweeps/launcher-dialogs-2026-06-11.md`.
- **Phase 1** ✅ — BOTH new-site live walks + supervised save-restore probes (1604 mutated then **verified restored**):
  - **A (Pay To)**: label launcher → "Pay To List" dialog (5 filters, 13-col sortable 7-row table, per-row checkbox, Select-disabled-until-checked, Cancel/Close-X, single page). Search endpoint `GET …/getLocationPayToList` (~4.7s); save endpoint `PUT …/update-properties`. **Pay To selection PERSISTS** (payToId 1→7→1 verified). Restore anchor `financial.payToId = 1`. `clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-2026-06-11.md` (incl. `## Launcher dialogs`).
  - **B (Master Bill To)**: `btnAccMasterAddress` → shared "Select Customer Address" dialog. Master select **updates Master `dd`s, leaves Venue unchanged, and PERSISTS** through save+reload — **diverges from the Venue launcher** (ACC-027 non-persist) → per-launcher gap proven. Restore anchor `billToAddress` = 8899 Beverly Blvd Ste 412 (id `8ad746d8-…`). `clients/encore/specs_planning/_internal/walk-evidence-account-address-master-bill-to-2026-06-11.md`. **No bug for B** (Master persists correctly; Venue non-persist is the account-address-audit's question).
- **Phase 1.5** ✅ — formal RCA covering both incidents + 2 `agent-mistakes.md` entries (both → LR-057). `clients/encore/specs_planning/_internal/rca-launcher-dialog-misses-2026-06-11.md`. Root cause: coverage reasoned from a field's *resting appearance* / *dialog identity*, not its *exercised affordance per entry point*.
- **Phase 5.5** ✅ — ALL 5 prevention items landed (the user's permanence mandate): **LR-057** (`.claude/rules/inventory.md`, with per-launcher + no-taxonomy-row clauses); `field-inventory-spec.md` amendment (§3 `affordance:` token mandate + `## Launcher dialogs` optional section + Revision-history entry); `field-case-generation.md` new §2 "Lookup launcher" row + stale `src/core/`→`src/utils/` path fix; **PLANNER HARD STOP #18 + REQUIREMENTS HARD STOP #9**; master `PLAN_BIG_PIVOT_FCC_MASTER.md` **Sweep 12** (`UNPROBED-AFFORDANCE`) + doctrine count 11→12.

**REMAINING for the continuation session (build entirely from the banked artifacts — no live walk needed except live spec runs):**
- **Phase 2** — coverage ledgers + `clients/encore/specs_planning/_internal/field-case-catalogs/launcher-dialogs-2026-06-11.md` + refresh LP TC MD (correct TC-LP-004 wording, keep ID; append net-new from TC-LOC-LP-028) + refresh ACC TC MD (extend TC-ACC-012; append net-new from TC-LOC-ACC-032) + both test plans + `npm run xlsx:build` + `npm run check:tc-parity` exit 0.
- **Phase 3** — A: LP dialog selectors (launcher = `label:has-text("Pay To Address")`, drive via force/dispatch click — standard click is blocked by the disabled-input association; dialog block on the Account-List pattern) + page-object methods + `PAY_TO_ORIGINAL {id:1,name:"Encore"}` / `PAY_TO_ALTERNATE {id:7,name:"Encore Bahamas"}` + verify-only Pay To guard in `ensureDefaultState` (name-read can't disambiguate → no auto-repair) + specs (blend at top, no `@fcc`). B: Master display readers + reuse existing dialog methods + `MASTER_BILL_TO_ORIGINAL` (5 values) + specs. Persistence via `saveAndVerifyCase`; restore-by-anchor in cleanup+finally. Each spec individually green `--workers=1 --retries=0`.
- **Phase 4** — completeness audit + combined ×2 + post-run restore checks (1604 = original on both).
- **Phase 5** — structural dedup sweep (shared lookup-dialog helper eval; honest `(skipped:…)` if none).
- **Phase 6** — closure: Status DONE + Execution Summary + sibling Post-Audit Corrections (both DONE siblings) + master annotation (cascade-SKIPPED) + closure gate C1-C6 + `git mv` + reindex + navigation §B/§C.

**Pagination/rows-per-page (both dialogs) = (c) not-applicable** (single page, ≤ page-size live). Address/Phone/Fax filters (A) = (c) unless BUILDER confirms live column data.

---

## Execution Summary

**Executed**: 2026-06-11 (Session 1 = Phases 0–1.5 + 5.5 discovery/RCA/prevention; Session 2 = Phases 2–6 build/parity/closure, this continuation). **Verdict: GREEN.** Both launcher gaps closed; both launchers proven to PERSIST through save+reload; office 1604 restored to its frozen anchors on both axes; zero bugs filed (no app divergence survived the old-site oracle); all five prevention items landed and permanent.

**A — Pay To Address launcher affordance found (verbatim):** Pay To Address is a **launcher**, not a plain disabled textbox. The disabled display input (`location-settings-input-pay-to-name`) shows the current Pay To NAME ("Encore"); the field's `<label>` opens the **"Pay To List"** search dialog (5 filters: Pay To ID / Pay To Name / Address / Phone / Fax; Search + Reset; a sortable results table with a per-row checkbox; Select disabled-until-checked; Cancel + close-X; single page). A standard Playwright `.click()` on the label is blocked (its `for=` points at the disabled input → "element is not enabled"), so the launcher is driven via `dispatchEvent('click')`. Search endpoint `GET …/getLocationPayToList`; save endpoint `PUT /navigator/api/location/update-properties`. The 2026-06-03 walk classified this field as static — the graduating miss (RCA below).

**Final TC counts + IDs per module:**
- **Workstream A (Pay To List, left panel):** 10 net-new — **TC-LOC-LP-028 … TC-LOC-LP-037** — blended at the top of `location-left-panel-basic-information.spec.ts`; LP spec total **27 → 37**. TC-LOC-LP-004 corrected in place (KEPT its ID; the input-disabled assertion stays true, the launcher affordance is now documented in steps/notes).
- **Workstream B (Master Bill To, Account & Address):** 2 net-new — **TC-LOC-ACC-032** (Master row select → Master display `dd`s update, Venue unchanged, Save enables) + **TC-LOC-ACC-033** (Master persistence: select-different → Save → reload → verify → restore-anchored-original → Save → reload → verify) — blended at the top of `location-account-address.spec.ts`; ACC MD total **31 → 33**. TC-LOC-ACC-012 (dialog-opens) + TC-LOC-ACC-014 (Master display read) notes extended to point select/persist at the new TCs.

**Per-cell (a)/(b)/(c) dispositions (both gap matrices — full ledgers in the catalog):**
- **A:** (a) the 10 implemented above; (c) Address/Phone/Fax filters (live rows carry no data for those columns), rows-per-page + pagination (single page ≤ page-size live), re-select-same net-zero probe (LR-009 — net-zero on this launcher leaves Save disabled, no authored assertion). No (b) cells.
- **B:** (a) the 2 implemented above; (b) Cancel / Esc / close-X discard from the Master dialog — discharged per-launcher by the existing shared-dialog TCs (the "Select Customer Address" dialog is identical post-open regardless of which launcher opened it; cited in the catalog). No (c) cells.
- Catalog: `clients/encore/specs_planning/_internal/field-case-catalogs/launcher-dialogs-2026-06-11.md`.

**Persistence verdicts:**
- **A (Pay To):** PERSISTS. Live save-restore probe drove payToId 1 → 7 → 1, each verified through reload. TC-037 exercises it via `saveAndVerifyCase` with ID-anchored restore in `cleanup` (the name "Encore" is ambiguous — IDs 1 and 4 both render "Encore", so restore is ID-anchored, never name-anchored).
- **B (Master Bill To):** PERSISTS — and **diverges from the Venue launcher** (TC-LOC-ACC-027 found Venue address selection does NOT persist). Per-launcher coverage proven: the same dialog behaves differently per entry point. TC-033 restores the frozen original (`8899 Beverly Blvd Ste 412`, billToId `8ad746d8-…`) via re-select + Save in `cleanup`, using re-navigate-each-poll to defeat the documented read-after-write race.
- **Zero bugs filed** — both launchers behave correctly; no divergence survived the LR-044 old-site picker oracle.

**RCA:** `clients/encore/specs_planning/_internal/rca-launcher-dialog-misses-2026-06-11.md`. Root cause (both incidents, one sentence each): **A** — coverage was reasoned from a field's *resting appearance* (disabled textbox) instead of its *exercised affordance*, so the BL-DIV-4 baseline divergence was closed as "intentional UX change" without a new-site click-probe; **B** — *shared-dialog conflation*: dialog-level coverage opened via the Venue launcher was silently treated as launcher-level coverage for the Master launcher. Two `agent-mistakes.md` entries appended; both point at LR-057.

**Prevention items 1–5 (Phase 5.5, all permanent):**
1. **LR-057** — `.claude/rules/inventory.md` (affordance-probe mandate + per-launcher coverage clause + no-taxonomy-row HALT backstop).
2. **field-inventory-spec amendment** — `clients/encore/specs_planning/_internal/field-inventory-spec.md` (§3 `affordance:` token mandate + `## Launcher dialogs` optional section + `## Revision history` entry).
3. **field-case-generation taxonomy** — `clients/encore/specs_planning/_internal/field-case-generation.md` (new §2 "Lookup launcher" row + stale `src/core/` → `src/utils/` path fix).
4. **Agent prompts** — `.claude/agents/PLANNER.md` HARD STOP #18 + `.claude/agents/REQUIREMENTS.md` HARD STOP #9 (affordance-probe; bounded non-mutating baseline interaction authorized).
5. **Master sweep** — `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` Sweep 12 (`UNPROBED-AFFORDANCE`) + doctrine count 11 → 12.
- Retro-sweep of other modules' inventories = explicitly OUT (user decision 2026-06-11), recorded as an LR-040(c) discussion item — user drives it manually later.

**Verification results (evidence-emission format):**
- ran `npm run check:tc-parity` → output: `Spec TCs: 542 | Markdown TCs: 646 | XLSX TCs: 646 … PASS` (exit 0; the FLAG title-divergence lines name other modules — neither LP nor ACC appears).
- ran `npx playwright test … location-left-panel-basic-information.spec.ts --workers=1 --retries=0` → output: `37 passed` (TC-028…037 green incl. TC-037 persistence).
- ran `npx playwright test … location-account-address.spec.ts --workers=1 --retries=0` → output: `31 passed, 1 skipped` (the skip = pre-existing TC-LOC-ACC-029 `test.fixme` for BUG-LOC-ACC-001; TC-032/033 green).
- ran combined both-spec run ×2 `--workers=1 --retries=0` → output run #2: `67 passed, 1 skipped` fully green; run #1 had 2 Phone2 read-after-write flakes (TC-020/022) that pass on retry and touch neither Pay To nor Master — pre-existing shared-office-1604 flake, not this work (honest deviation).
- ran `npx tsc --noEmit -p tsconfig.json` (from `clients/encore`) → output: `EXIT=0` (clean).
- ran `npm run xlsx:build` → output: workbook rebuilt (LP sheet 37 rows, ACC sheet 33 rows); xlsx-lint clean after TC-004 date moved out of the shipped Expected column into Notes.
- ran post-run API check `fetch('/navigator/api/location/1604')` → output: `payToId=1 | billTo=8899 Beverly Blvd Ste 412 | billToId=8ad746d8-ae4e-e611-abd6-005056ae089c` — office 1604 restored on BOTH anchors (a green suite that left the env dirty would be a FAIL; it is clean).
- `/regression-guard` before/after (`.playwright-cli/regression-guard/launcher-dialogs-before.txt`) → only the launcher-dialog files changed; unrelated prior-session working-tree edits (auto-addon, export_test_cases, scripts) predate this session and were untouched.

**Honest deviations (LR-046 — live pivots, inline):**
- **LP filter selectors pivoted from CSS to accessible-name.** The planned `div:has(> label:has-text("Pay To ID")) input` CSS keys timed out live (the filters derive their accessible name from a sibling label, with no stable CSS attribute). Removed the 5 CSS filter keys; the page object locates filters via `dlgPayToList.getByRole('textbox', { name, exact: true })`. Evidence-based pivot from the live a11y tree, not a scope change.
- **TC-033 persistence used re-navigate-each-poll.** A single reload served a stale Master value (read-after-write race; ACC-020 documented pattern — backend persists a beat after `clickSave()` returns, and the loaded page does not auto-refetch). `expectAfterReload` + `cleanup` re-navigate on each poll iteration. No bug — the API confirmed persistence; the race is a reader-timing artifact.
- **Combined run #1 Phone2 flake** (above) — documented, not masked; run #2 fully green confirms it.

**Parent-cascade check (Phase 7.3):** `LR-027 cascade SKIPPED per master plan §Cascade closure rules (user override 2026-05-21)`. The master `PLAN_BIG_PIVOT_FCC_MASTER.md` stays PENDING (auto-close exempted until its three acceptance gates fire); this child's DONE line is annotated into the master's §Roadmap and an activity-log row records the override. Both DONE siblings (`SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC.md`, `SUBPLAN_ACCOUNT_ADDRESS_FCC.md`) carry a Post-Audit Correction pointing at this subplan + the RCA.

---

## Context

Two launcher-dialog coverage gaps, fixed together (user decision 2026-06-11: one plan, both workstreams), plus permanent prevention.

**Workstream A — Pay To Address, left panel (TOTAL miss; user escalation 2026-06-11)**: the Left Panel FCC walk (2026-06-03) classified **Pay To Address** (`/navigator/locations/1604/settings/location`, office 1604) as a plain disabled textbox (testid `location-settings-input-pay-to-name`, value "Encore"). It is actually a **launcher** opening a **"Pay To List" search dialog** — filters Pay To ID / Pay To Name / Address / Phone / Fax, Search + Reset, results table (ID, Pay To Name, Address 1/2/3) with per-row checkbox selection, rows-per-page, pagination, Select / Cancel / close-X (user screenshot 2026-06-11; sample rows: ID 1 "Encore" 23918 Network Place, ID 4 "Encore" 1500 W Shure Dr, ID 7 "Encore Bahamas"). The dialog has ZERO inventory, ZERO TCs, ZERO selectors, ZERO page-object support.

**Workstream A RCA chain (verified 2026-06-11; full RCA formalized in Phase 1.5):**
- `clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-2026-06-03.md:43` correctly recorded old-site Pay To Address as "clickable label/link … (link, not a value field)".
- Its `BL-DIV-4` (line 84) closed the divergence as "(b) intentional UX change" **without a new-site click-probe** — assumption, not evidence.
- `locations_left_panel_basic_information_test_plan.md:39` contains the unescalated hint "Verify Pay To Address label may be clickable link (address picker)".
- TC-LOC-LP-004 asserts only that the *input* is disabled — true, but blind to the launcher.
- No process layer (field-inventory-spec.md, field-case-generation.md taxonomy, PLANNER.md, LR-013/014/015 spot-check oracle) required probing fields for hidden interactive affordances. **Structural gap → Phase 5.5 prevention encoding.**

**Workstream B — Master Bill To Address, Account & Address tab (PARTIAL miss; user-directed check 2026-06-11)**: of the tab's 3 launcher fields, Venue/Branch **Name** is GREEN (TC-LOC-ACC-003/004/005/006/025/026/028/030) and Venue/Branch **Address** is GREEN (TC-LOC-ACC-008/009/010/011/027/031), but **Master Bill To Address** is half-covered: launcher `btnAccMasterAddress` (`account-address.ts:40`) + `openMasterAddressDialog()` (page object :329) exist and TC-LOC-ACC-012 proves the shared "Select Customer Address" dialog OPENS — **no test selects an address from the Master dialog, verifies the Master display fields (Address/City/State/Zip/Country `dd` elements) update, or probes Master-side persistence**. ACC-027's selection/persistence flow is hardcoded to Venue. **B's root cause = shared-dialog conflation**: dialog-level coverage (via Venue) was silently treated as launcher-level coverage. Known app behavior to respect: ACC-027 (spec :371-388, comment :374) found Venue address selection does NOT persist through save+reload — the Master probe likely hits the same class; dedup against that documented behavior before filing anything new.

**User-provided facts (Rutvik, 2026-06-11 — treat as truth, cite this provenance):**
1. The Pay To launcher + dialog EXIST on the live app (screenshot evidence; exact launcher affordance — field click vs label click vs hidden button — determined live in Phase 1).
2. **Full save + restore authorized for both workstreams**: tests MAY select a different value and save, then MUST restore the original via a unique anchor — A: the Pay To **ID** (≥2 rows display the name "Encore"; name-anchored restore forbidden); B: the verbatim original Master Bill To address captured BEFORE any change.
3. Scope = **these two gaps only, office 1604 only**. Venue Name + Venue Address confirmed GREEN — no work. NO retro-sweep of other modules (user drives those manually later — record as LR-040(c) discussion item).
4. Prevention is mandatory and permanent: "from now on this mistake should not be caused" — including the no-taxonomy-row HALT backstop (all cases per field, never "call the walk as end" with unfilled cells).
5. HALT questions go in **chat only** — never AskUserQuestion pop-ups.
6. Adjacent pending plan `plans/pending/SUBPLAN_DQU_16_F1e_ACCOUNT_ADDRESS_AUDIT.md` (account-address audit) is **NOT absorbed** by this subplan (user not consulted on subsumption) — read it at Bootstrap for overlap awareness; where a Workstream-B finding duplicates one of its items, cross-reference in the catalog rather than duplicate work, and surface the overlap in the Execution Summary for a user triage decision.

**Precedent (template for A's dialog work — Account List dialog):** selectors `src/selectors/locations/account-address.ts:42-72` (launcher `btnAccName` :24), TCs `location-account-address.spec.ts` TC-LOC-ACC-003..007, 025-031. Binding trap precedents for BOTH workstreams:
- **ACC-027** (`:371-388`): dialog selection updated display + dirtied form but did **NOT persist** through save+reload — plan the bug/(c) branch, don't assume persistence works.
- **ACC-028** (`:390-422`): re-selecting the **same** account still dirtied the form — dialog selection may write the model regardless of net change (LR-009 interplay measured, not assumed).
- **ACC-007** (`:157-168`): dialog Reset tainted the Angular form model → defensive `reloadAndNavigate` after the Reset test.
- **ACC-030** (`:71-85`): server-side search measured ~29s → poll budget 45s, test timeout 90s for filter cases.

**Current code state (verified 2026-06-11):** left-panel spec `beforeEach` (:27-35) already has per-test `ensureDefaultState()` (LR-019) but its baseline check (page object :266-272) does NOT cover Pay To; `getPayToAddress()` (:70) is display-read only; no Pay To dialog selectors/methods exist. Account-address spec/PO/selectors fully exist; only the Master select/update/persist TCs are missing.

This subplan inherits the installed FCC paradigm (no re-installing runner/taxonomy). It carries the master's §False-Green Sweep Doctrine obligations and Doctrine items 1-8 (item 3 blend-at-top/no-`@fcc`-tag; item 6 save-first navigation; item 8 de-dup by proven outcome — **amended understanding: outcome-dedup operates per-LAUNCHER, not per-dialog**).

---

## Bootstrap

**Identity**: OWNER (sub-phases tagged via per-phase `/identity X`).
**Skills auto-called**: `/identity` (each phase boundary), `/relevant` (session start), `/regression-guard` (pre+post BUILDER), `/rca` (Phase 1.5 formal RCA + conditional Phase 4 RED), `/bugfix` (conditional), `/find-bugs` (Phase 4 adversarial pass), `/final-q` (closure, LR-042).
**Context files (load order):**
1. `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` — §Doctrine + §False-Green Sweep Doctrine (table :116-128) + §Cascade closure rules
2. `plans/done/SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC.md` + `plans/done/SUBPLAN_ACCOUNT_ADDRESS_FCC.md` — the two subplans being corrected (read Execution Summaries + any Post-Audit Corrections)
3. `clients/encore/tests/locations/location-account-address.spec.ts` + `src/pages/locations/location-account-address.page.ts` + `src/selectors/locations/account-address.ts` — Workstream B target AND Workstream A's dialog template (TC-ACC-003..012/025-031 + trap comments)
4. `clients/encore/tests/locations/location-left-panel-basic-information.spec.ts` + `src/pages/locations/location-left-panel-basic-information.page.ts` + `src/selectors/locations/left-panel-basic-information.ts` + `src/data/locations/location-left-panel-basic-information.ts` — Workstream A blend target
5. Test-cases MDs + test plans for BOTH modules: `clients/encore/specs_planning/test-cases/setup/locations/locations_left_panel_basic_information_test_cases.md`, `locations_account_address_test_cases.md` (+ matching `test-plans/setup/locations/` files) — A: TC-LP-004 + row 11 + line-39 hint; B: TC-ACC-012 block + Master scenarios
6. Flawed/partial prior artifacts (read SKEPTICALLY): `clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-2026-06-03.md`, `clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-2026-06-03.md`, `clients/encore/specs_planning/_internal/field-case-catalogs/left-panel-basic-information-2026-06-03.md`, `clients/encore/specs_planning/_internal/false-green-sweeps/left-panel-basic-information-2026-06-03.md`, `clients/encore/specs_planning/_internal/field-inventories/account-address-2026-05-29.md` (+ its old-site baseline / catalog siblings — glob for exact names)
7. `clients/encore/specs_planning/_internal/field-case-generation.md` §1+§2 + `clients/encore/specs_planning/_internal/field-inventory-spec.md` (incl. `## Revision history` :258) + `clients/encore/specs_planning/_internal/field-inventories/_TEMPLATE.md` — taxonomy + artifact contract (Phase 5.5 amendment targets)
8. `clients/encore/src/utils/field-case-runner.ts` — `saveAndVerifyCase()` runner
9. `export_test_cases/module-codes.json` — LP + ACC entries + bug grammar (`BUG-LOC-LP-NNN` / `BUG-LOC-ACC-NNN`)
10. `clients/encore/CLAUDE.md` — LR-ENC-001 (baseline truth + old-site quirks), LR-ENC-002 (parity structural), LR-ENC-003 (.env.local), LR-012/017/036
11. `.claude/rules/` — pipeline.md (LR-027/040/041/046/048/050/055), specs.md (LR-018/019/021/022/024/025/051/052/053/056), angular.md (LR-009/010/011/026), browser-tool.md (LR-038/054), inventory.md (LR-007/013/014/015/016/029 — Phase 5.5 LR-057 target), baseline.md (LR-045), data packs
12. `docs/read_only_docs/AGENT_SHARED_RULES.md` §2 ownership table + `.claude/agents/PLANNER.md` + `.claude/agents/REQUIREMENTS.md` — Phase 5.5 hard-stop targets (current numbering: PLANNER 0-17, REQUIREMENTS 0-8; REQUIREMENTS #4 "No clicks. No typing." at :19)
13. `clients/encore/specs_planning/_internal/agent-mistakes.md` — entry format (dated H3 + What/Why-it-slipped/Lesson) + any rows newer than this subplan's Created date
14. `.claude/context/navigation.md` — §B routing rows (Radix dialog, save dialog, LR-056 network filters)

**Missing context file = HALT.**

---

## Phase 0 — Dependency + browser-tool + empirical-verification gate (OWNER)

**[GATE-D0]** Before any work:
- [ ] All three Depends-on subplans DONE in `plans/done/`.
- [ ] `clients/encore/src/utils/field-case-runner.ts` exists and exports `saveAndVerifyCase` (grep).
- [ ] Both target specs / page objects / selectors / data exist at §Context paths; `npx playwright test --list` resolves the existing TC-LOC-LP and TC-LOC-ACC IDs (BLENDs, not net-new). Record the actual next-free numbers (expect LP-028+ and ACC-032+ — confirm, never assume).
- [ ] Local runs use `.env.local` — never `CI_ENV=e2e` (LR-ENC-003).
- [ ] **Browser tool: CLI** announced (LR-038 v2 — dialog walkthroughs + unattended save-cycles; LR-054 Table 2 covers click/fill/snapshot/state-save). Auth via `playwright-cli -s=e2e state-load clients/encore/.auth/encore-state.json` then re-`goto`; Gate 3 headed fallback on Entra redirect.
- [ ] **Empirical verification gate**: page-collision / context-options propagation / trace fidelity / per-TC baseline checks. Emit `clients/encore/specs_planning/_internal/phase-0-verification-launcher-dialogs-<YYYY-MM-DD>.md` with **PROCEED** verdict. PROCEED required to continue.

**HALT** if any gate fails → escalate in chat.

## Phase 0.5b — Old-site baseline refresh: open the pickers the prior walks never opened (HUNTER; LR-045 + LR-ENC-001)

`/identity HUNTER`. Visit `https://navigator2.training.psav.com/#/setup/locationdetail/1604` FIRST.
- **Bounded read-only interaction is explicitly authorized for these dialog walks** (supersedes the literal "No clicks. No typing." line of REQUIREMENTS HARD STOP #4 for these dialogs only): open each picker → type into search filters → observe → **Cancel/Esc only. NEVER click Select. NEVER save on the old site.** Zero mutation (LR-045 protects against mutation, not observation).
- **A — Pay To picker**: capture verbatim (i) what the link opens (dialog vs navigation; title verbatim); (ii) filter fields + labels; (iii) results-table column headers; (iv) selection semantics (radio/checkbox/row-click; is the current Pay To pre-indicated?); (v) button set + labels; (vi) pagination/page-size; (vii) what the left panel shows after selection (name only? ID anywhere?); (viii) server- vs client-side search. Emit refreshed `clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-<YYYY-MM-DD>.md` with `## Baseline diff` re-classifying BL-DIV-4 from evidence.
- **B — Master Bill To picker**: open the old-site Master Bill To equivalent; capture selection semantics + what selection is SUPPOSED to do to the Master fields + whether old-site persists it (observation of UI affordance only — no Select/save). This is the LR-044 oracle for judging the new-site non-persist question. Emit/refresh `clients/encore/specs_planning/_internal/old-site-baseline/account-address-<YYYY-MM-DD>.md` (Master picker section + `## Baseline diff`).
- Zero selector parity (LR-ENC-001 — old site has no data-testids; observation-only).

## Phase 0.5fg — False-green pre-audit, 12 patterns (WATCHDOG)

`/identity WATCHDOG`. Run the master's 11 sweeps **plus the new 12th pattern this subplan introduces** (UNPROBED-AFFORDANCE: a passing assertion on a field whose label/launcher affordance — or whose per-launcher select-cycle — was never exercised) against BOTH target specs + page objects, scoped to: A = Pay To assertions (TC-LP-001/004/023); B = Master Bill To assertions (TC-ACC-012 + the shared-dialog TCs). These two modules only — no others (user scope decision 2026-06-11).
- Known candidates: TC-LP-004's "click → no focus" oracle (defensive-only, launcher-blind); TC-ACC-012's open-only oracle (shared-dialog conflation) — classify honestly.
- Emit `clients/encore/specs_planning/_internal/false-green-sweeps/launcher-dialogs-<YYYY-MM-DD>.md` classifying every finding: FALSE-GREEN / PARTIAL / FLAKY-MASK / STALE-SKIP / INFLATED / STATE-LEAK / UNPROBED-AFFORDANCE / CLEAN.
- If the identity-gate hook denies a write, use the LR-043 OWNER short-circuit (clean `/identity OWNER` re-load), log the switch — do NOT hand-edit hook/ownership files mid-subplan.

## Phase 1 — Live walks + evidence artifacts (GIVER; LR-013/014/015)

`/identity GIVER` (field inventories are GIVER-created per §2 :93 and the `Author_Identity` enum `GIVER|OWNER|WATCHDOG` at field-inventory-spec.md:51 — deliberate divergence from the AUTO_ADDON sibling, whose executed run emitted `Author_Identity: HUNTER` in violation of the enum).

**A — Pay To (left panel, office 1604, `/navigator/locations/1604/settings/location`):**
1. **Probe the launcher**: click the input, click the label, inspect the field container for a hidden button — capture the exact affordance + testids via CLI snapshot. If NO launcher exists on the live app → HALT with snapshot evidence (contradicts user screenshot).
2. **Open the dialog; capture everything**: title verbatim; every filter's testid/label; Search/Reset/Select/Cancel/close-X testids + labels; table headers; row-selection control role (checkbox vs radio — single- or multi-select); rows-per-page options; pagination; total row count (≤ page size → pagination/rows-per-page cases are (c)); rows pre-load or require Search; whether the CURRENT Pay To is pre-indicated.
3. **Determine office 1604's current payToId (restore anchor — MANDATORY)**: from a pre-checked row, or the location payload via `playwright-cli network`. Freeze as an MCP-cited data constant. **Undeterminable → HALT before any save case is authored.**
4. **Exercise each filter once** (record server timing → poll budgets per ACC-030); Reset (form-model taint? ACC-007); empty-search state (verbatim text); Cancel and Esc; row check → Select → field updates? Save enables?
5. **One supervised save-restore probe (user-authorized)**: select a uniquely-named alternate (e.g. ID 7 "Encore Bahamas") → Save → reload → observe persistence → **immediately restore original by ID → Save → reload → verify**. Record the backend save endpoint from `playwright-cli network` (LR-056 — never page-URL substring). Persistence FAILS (ACC-027 class) → restore state, record bug-candidate, persistence case becomes (c)-blocked-by-bug. Probe leaves 1604 dirty → STOP all other work, restore manually, report.
6. Emit refreshed `clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-<YYYY-MM-DD>.md`: all 8 frontmatter keys (`MCP_Session_Date` = filename date; `Baseline_Artifact` → Phase-0.5b refresh per PLN-049); full 14-field roster re-read live (LR-015 — one snapshot pass); **corrected Pay To row** with `affordance: launcher → "<dialog title verbatim>"` in Notes; new `## Launcher dialogs` section (dialog internals verbatim + testids); LR-014 testid column complete.

**B — Master Bill To (Account & Address tab, same office):**
7. **Capture the restore anchor FIRST**: the verbatim current Master Bill To display values (Address/City/State/Zip/Country) BEFORE any interaction. Freeze as MCP-cited constants.
8. Open the dialog via the Master launcher; identify how the original address row is found in the dialog (search by the captured address text); check a DIFFERENT row → Select → do the **Master** display fields update (not Venue's)? Does Save enable? Record verbatim.
9. **One supervised save-restore probe (user-authorized)**: with a different address selected via Master → Save → reload → observe whether Master fields persisted (ACC-027 precedent says Venue's didn't — measure, don't assume) → **restore the original by re-selecting the anchored address → Save → reload → verify all five Master display values match the anchor**. Same HALT-on-dirty rule as A.
10. Emit `clients/encore/specs_planning/_internal/walk-evidence-account-address-master-bill-to-<YYYY-MM-DD>.md` (per feedback_walk_evidence_artifacts) with all B findings + timings + the anchor constants. If `node scripts/check-tc-mcp-citations.mjs` requires field-inventory-homed citations for the new ACC TC blocks, refresh `clients/encore/specs_planning/_internal/field-inventories/account-address-<YYYY-MM-DD>.md` instead (full artifact per spec — decided at execution, recorded inline; the account-address inventory is ≥14 days stale by execution date anyway, LR-013).

## Phase 1.5 — Formal RCA + lessons entries (OWNER; user mandate "find reason")

`/identity OWNER` (no §2 row covers `rca-*.md` → OWNER-only write; `/rca` skill structure, artifact-first).
- Emit `clients/encore/specs_planning/_internal/rca-launcher-dialog-misses-<YYYY-MM-DD>.md` (Classification / Evidence Chain / IS-IS-NOT / 5 Whys / Root Cause / Prevention) covering BOTH incidents: **A** — the BL-DIV-4 assumption-close (`clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-2026-06-03.md:84`), the unescalated test-plan hint (`...test_plan.md:39`), TC-LP-004's launcher-blind oracle, and the zero-affordance-probe process gap. **B** — shared-dialog conflation: TC-ACC-012 stops at dialog-opens; the select/update/persist cycle was assumed covered because the same dialog is tested via Venue. Per-phase-role accountability: HUNTER role (baseline divergence closed without probing), GIVER role (own hint never escalated; per-launcher coverage never demanded), WATCHDOG role (completeness audits passed both gaps) — noting honestly that the 2026-06-03 left-panel inventory's literal `Author_Identity` frontmatter reads `OWNER` (line 8), so accountability attaches to phase-roles, not the recorded identity. Cross-reference Phase-1 live findings as proof of what was missed.
- Append `agent-mistakes.md` entries matching the existing format (dated H3, keyed PLN/REQ, `**What:**` / `**Why it slipped (root cause):**` / `**Lesson / how to apply:**` → both point at LR-057): one for the affordance miss (A), one for the shared-dialog conflation (B).

## Phase 2 — Coverage ledgers + catalogs + TC parity, both modules (GIVER; LR-ENC-002)

`/identity GIVER`.
1. **Coverage ledgers** (doctrine item 8, per-LAUNCHER): A — what TC-LP-001/004/023 prove about Pay To (display value, input disabled — nothing else). B — what TC-ACC-012 + shared-dialog TCs prove about Master (dialog opens; dialog internals via Venue) vs what is unproven (Master selection → Master field update; Master persistence).
2. **Gap matrices**: classify EVERY cell (a) implement net-new / (b) already-covered-by-outcome (cite TC — per-launcher, a Venue TC can NOT discharge a Master cell) / (c) not-applicable-or-blocked (cite reason: walk evidence, row-count, bug ID, or user scope decision).
3. **Candidate case sets** (walk-gated; **final IDs assigned sequentially to AUTHORED cases only — contiguous from the Phase-0-confirmed next-free numbers (expect TC-LOC-LP-028+ / TC-LOC-ACC-032+); no pre-minted IDs for (c) dispositions**):
   **A (Pay To List dialog)**: launcher-opens-dialog render assert (title, 5 filters, Search/Reset, table headers, Select/Cancel) — the headline fix; Select disabled until row checked; Cancel discards; Esc/close-X discards; Pay To ID filter (proves the restore-anchor mechanism); Pay To Name filter ("Encore" → multiple rows, `toContain`, LR-022); Address filter; Phone/Fax filters ONLY if live rows carry data, else (c); Reset (with ACC-007 defensive reload if taint shown); empty-result state (verbatim text — announced rejection, not silence); row select → field updates + Save enables (no save); **full persistence** select-alternate→Save→reload→verify→restore-by-ID→Save→reload→verify via `saveAndVerifyCase` (compile-required baseline = LR-019), (c)-blocked-by-bug if Phase-1 probe found non-persistence; net-zero probe (re-select current → observe Save; LR-009 vs ACC-028, authored only from the live answer); rows-per-page/pagination/sort ONLY if walk showed >page-size rows / live sort controls, else (c).
   **B (Master Bill To)**: Master dialog row select → Select → **Master** display fields update + Save state (the missing core case); **Master persistence probe** select-different→Save→reload→measure→restore-anchored-original→Save→reload→verify — if Phase-1 confirmed ACC-027-class non-persistence, author as the documented-behavior assertion (mirror ACC-027's display-only pattern) + bug-candidate dedup vs the existing documented Venue behavior; Esc/close-X discard from Master IF not already discharged by a shared-dialog TC opened via Master (check which launcher each existing dialog TC actually opens — cite honestly).
4. Emit `clients/encore/specs_planning/_internal/field-case-catalogs/launcher-dialogs-<YYYY-MM-DD>.md` (both ledgers + gap matrices + final net-new lists; cross-reference the 2026-06-03 left-panel and 2026-05-29 account-address catalogs as prior art).
5. **Refresh the LP TC MD**: correct field-table row 11 (`:28`) + TC-LOC-LP-004 body (`:105-113`) — the input-disabled assertion stays TRUE and KEEPS its ID, but steps/notes must state the launcher affordance; bump header count (`:7`); append net-new TC blocks (every block carries `**Notes**:` — to-csv.ts parser) with `**MCP_VERIFICATION_LOG**` citations to the Phase-1 inventory §Launcher dialogs.
6. **Refresh the ACC TC MD**: correct/extend the TC-LOC-ACC-012 block notes (dialog-opens stays; Master select/persist now covered by new TCs); append net-new TC blocks with `**MCP_VERIFICATION_LOG**` citations to the Phase-1 walk-evidence (or refreshed inventory); bump header count.
7. **Update both test plans**: A — replace the line-39 throwaway hint with real scenarios; B — add Master selection/persistence scenarios.
8. Rebuild workbook: `npm run xlsx:build`; **`npm run check:tc-parity` must exit 0** (both sheets).
9. Bug CANDIDATES (filing = Phase 4 HEALER per §2): any live divergence surviving the LR-044 oracle (old-site picker evidence + REQUIREMENTS) — A: e.g. non-persistence, missing filters vs baseline; B: Master non-persistence (DEDUP first vs the documented ACC-027 Venue behavior — empty-everywhere + no-UI-path + no-Jira → discussion-item flag, not a bug). Grammar `BUG-LOC-LP-NNN` / `BUG-LOC-ACC-NNN` per module-codes.json.

## Phase 3 — Build, both modules (BUILDER)

`/identity BUILDER`. `/regression-guard` snapshot BEFORE.
**A — left panel:**
1. **Selectors** (`left-panel-basic-information.ts`): launcher selector (named per Phase-1 evidence — follow the walk, not assumption) + dialog block modeled on `account-address.ts:42-72` (`dlgPayToList`, `txtPTL*` filters, `btnPTLSearch/Reset/Select/Cancel/Close`, `tblPTLResults`, `chkPTLRowSelect`, rows-per-page) with real testids from Phase 1 (role+text fallback with FIXME notation if testids absent, per the `dlgSelectAddress` precedent); JSDoc `@where/@el/@keys` per file convention; no hardcoded env values.
2. **Page object** (`location-left-panel-basic-information.page.ts`): `openPayToDialog()`, `searchPayToById/ByName/...()`, `resetPayToSearch()`, `checkPayToRow()`, `confirmPayToSelect()`, `cancelPayToDialog()` (+ Esc/X variants), `getPayToDialogRows()` — mirror Account-Address method shapes; poll budgets from Phase-1 timing (ACC-030 precedent); LR-052 (no fixed sleeps in polls), LR-056 (network filters = Phase-1-recorded backend endpoint, never page-URL substring).
3. **ensureDefaultState guard**: add a **verify-only** Pay To check (`getPayToAddress() === LP_DEFAULTS.payToAddress`) that THROWS with guidance on drift — NO auto-repair (a name read cannot disambiguate the multiple "Encore" rows; honest detection beats wrong repair). ID-anchored restore lives in the persistence case's `cleanup`/`finally` only.
4. **Test data** (`location-left-panel-basic-information.ts`): `PAY_TO_ORIGINAL { id, name }` (frozen from Phase-1 MCP evidence) + `PAY_TO_ALTERNATE` (uniquely-named row — confirm live).
5. **Specs**: blend at TOP of the existing describe (after `beforeEach`, above TC-001), sequential IDs from the confirmed next-free number, same `@locations @left-panel-basic-information` tags (describe's verbatim tags, spec :25), **NO `@fcc` tag** (doctrine item 3). Persistence via `saveAndVerifyCase()`; restore-by-ID in `cleanup` + `finally`; defensive reload after the Reset case if Phase 1 confirmed taint. Existing TC bodies UNTOUCHED except TC-LP-004's comment/title alignment with its corrected MD wording (assertions unchanged — input-disabled remains true).
**B — account-address:**
6. **Page object** (`location-account-address.page.ts`): add Master display-field readers if missing (e.g. `getMasterCityText()` / generalized reader for the Master `dd` elements — reuse `isDisplayFieldReadOnly()`'s section-scoped pattern at :169); reuse ALL existing dialog methods (`openMasterAddressDialog`, `searchAddress`, `checkAddressFirstRow`, `selectAddressRow`, `cancelAddressDialog`) — no duplicate dialog code.
7. **Test data** (`location-account-address.ts`): `MASTER_BILL_TO_ORIGINAL` (the five anchored display values from Phase-1) + alternate-row search term.
8. **Specs** (`location-account-address.spec.ts`): blend the new Master TCs at top per the same doctrine, sequential IDs from the confirmed ACC next-free number, the describe's verbatim tags, restore-anchored cleanup + `finally`.
**Both:**
9. Anti-patterns honored: LR-051 (no OR-expr `.toBe(true)`), LR-022 (no exact row counts), LR-009/LR-026 (net-zero + dirty-state defensive), doctrine item 6 (save-first navigation — only discard cases may hold a dirty form, because discard IS their unit under test). No bare-`page` destructure.
10. First runs: each touched spec individually green `--workers=1 --retries=0` BEFORE any combined run (feedback_always_run_individual_first). `npx playwright test --list` resolves all IDs. `/regression-guard` snapshot AFTER.

## Phase 4 — Completeness audit + false-green fix + combined verification (WATCHDOG/HEALER)

`/identity WATCHDOG`. `/find-bugs` adversarial pass on both touched specs.
- FCC completeness audit: every gap-matrix cell (both matrices) classified (a)/(b)/(c) with evidence (LR-040) — (b) citations verified per-LAUNCHER; TC ↔ MD ↔ XLSX parity (LR-ENC-002) for both modules; the Phase-0.5fg sweep has no unresolved findings.
- **False-green fix** (`/identity HEALER` if needed): fix every confirmed finding from Phase 0.5fg. Sync MD Status on any fix. RCA any RED via `/rca` — artifact-first (LR-024: clean, run fresh, read failure artifacts BEFORE re-running).
- **Bug filing** (`/identity HEALER`): file surviving candidates as `clients/encore/reports/bugs/BUG-LOC-LP-<NNN>.json` / `BUG-LOC-ACC-<NNN>.json` per LR-034 + LR-044 (verbatim steps, baselineComparison vs Phase-0.5b old-site picker evidence, dedup first — especially vs the documented ACC-027 Venue non-persist).
- **Combined verification**: BOTH specs run `--retries=0 --workers=1` green **×2**. Post-run state checks: office 1604's Pay To = original (ID-verified) AND Master Bill To = anchored original (all five values) — a green suite that leaves the env dirty is a FAIL.

## Phase 5 — Structural sweep (GARDENER; LR-050 — honest scope)

`/identity GARDENER`. No renames. Enumerated sweep:

| Item | Action | File(s) |
|---|---|---|
| Pay To dialog handling vs Account List / Select Address dialog handling | extract a shared lookup-dialog helper ONLY if behavior-identical post-build (LR-012 spirit); else KEEP separate + 1-line comment why | both page objects |
| Dead/orphan selectors after Phase 3 | remove if provably unused (grep) | `left-panel-basic-information.ts`, `account-address.ts` |
| Typecheck + barrel consistency | `npx tsc --noEmit -p clients/encore/tsconfig.json` clean | — |

If an item yields nothing, record `(skipped: <reason>)` honestly — zero behavior change in this phase.

## Phase 5.5 — Prevention encoding (OWNER; user mandate "from now on this mistake should not be caused")

`/identity OWNER` (all five targets OWNER-writable per §2: rules packs/agent prompts/plans = OWNER; field-inventory-spec.md = OWNER RW :94; field-case-generation.md = GIVER+OWNER RW :95). Every edit gets an activity-log row (LR-028 keys on FILES).
1. **LR-057 in `.claude/rules/inventory.md`** (number verified free 2026-06-11): *Affordance probe is mandatory before classifying any field as read-only/static/disabled.* A field row may record a non-editable Control Type ONLY after a live click-probe of (1) the control, (2) its label, (3) its row/container — result recorded as an `affordance:` token in Notes (`affordance: none` | `affordance: launcher → "<dialog title>"` | `affordance: navigation → <target>` | `affordance: popover → <name>`). A baseline-vs-new divergence of class "interactive on baseline / static on new" may NEVER be closed as intentional-UX-change without a new-site click-probe — unprobed closes are audit findings. The LR-013 spot-check oracle gains a 4th check (affordance token present + probe-confirmed on sampled fields). **Per-launcher coverage clause**: when one dialog serves multiple launchers, coverage is dedup'd per-LAUNCHER, never per-dialog — every launcher needs its own select→field-update(→persist) proof. **No-taxonomy-row clause (case-completeness backstop)**: if an inventoried Control Type or `affordance:` value has NO matching case-template row in `field-case-generation.md` §2, the walk/catalog MUST HALT and flag it (append the new row per §4, or escalate) — a field kind without a template NEVER passes silently with zero cases. Graduating incidents: Pay To Address / BL-DIV-4 (total miss, 2026-06-03 walk) + Master Bill To shared-dialog conflation (partial miss); both user-discovered 2026-06-11.
2. **`field-inventory-spec.md` amendment** (validator-safe shapes verified — NO script parses columns/sections; 8-column header is a frozen contract, do NOT add a 9th column): §3 gains the Notes `affordance:` token mandate for non-editable Control Types (cites LR-057); the Optional-sections table gains `## Launcher dialogs`; §6 gains a reference-only grep for the token; append a `## Revision history` entry (:258 — additive precedent: the 2026-04-24 `Baseline_Artifact` entry).
3. **`field-case-generation.md`**: new §2 row `Lookup launcher (read-only field + search dialog)` — open/render, each filter, row-select→field-update, empty-result, pagination-if->pagesize, cancel/Esc no-change, Reset side-effects, select-different→save→reload→restore-by-anchor, re-select-same (LR-009 probe), **per-launcher application when dialogs are shared**. Fix the stale `src/core/` runner paths (lines 12, 54 → `src/utils/`) in the same edit.
4. **Agent prompts**: PLANNER.md HARD STOP **#18** + REQUIREMENTS.md HARD STOP **#9** — "AFFORDANCE PROBE (LR-057): a disabled/read-only classification is not 'covered' until field + label + container are click-probed; record `affordance:` per row; shared dialogs are covered per-launcher." The REQUIREMENTS stop explicitly authorizes bounded non-mutating baseline interaction (open dialog → observe → Cancel; never Select/Save on baseline) so it cannot collide with HARD STOP #4's literal "No clicks. No typing." line (:19).
5. **Master sweep table**: add Sweep 12 row (`UNPROBED-AFFORDANCE`) to the table at `PLAN_BIG_PIVOT_FCC_MASTER.md:116-128` + grep the §False-Green Sweep Doctrine section for every hardcoded 11-sweep count at execution time and update each to 12 + add `UNPROBED-AFFORDANCE` to the classification vocabulary (grep verified 2026-06-11: no file outside the master hardcodes the sweep count).
Retro-sweep of OTHER modules' inventories = explicitly OUT (user decision 2026-06-11, recorded as an LR-040(c) discussion item — user drives it manually later).

## Phase 6 — Closure (OWNER; LR-027 + LR-040 + LR-055)

`/identity OWNER`.
1. Flip the Status field to DONE + add the Executed date.
2. `### Execution Summary`: A's launcher affordance found (verbatim); final TC counts + IDs per module; per-cell (a)/(b)/(c) dispositions (both matrices); persistence verdicts A + B (works / documented-behavior / bug-filed); RCA artifact pointer; prevention items 1-5 each with file:line; verification results in evidence-emission format `ran '<cmd>' → output: '<snippet>'` (both spec runs ×2, typecheck, xlsx:build, check:tc-parity, --list, regression-guard before/after, both post-run restore checks); honest deviations log (LR-046; live pivots inline per the Plan-Deviation taxonomy, not D-rows).
3. **Per-Identity Matrix closure audit** — every cell a real path / `(skipped: ≥20 chars)` / `(none)` (C6).
4. **Parent cascade**: master stays PENDING — cite verbatim `LR-027 cascade SKIPPED per master plan §Cascade closure rules (user override 2026-05-21)` + activity-log row. Add this subplan's DONE line to master §Roadmap.
5. **Sibling annotations**: append `### Post-Audit Correction (2026-06-11) — Pay To Address launcher miss` to `plans/done/SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC.md` (precedent: it already carries one) AND `### Post-Audit Correction (2026-06-11) — Master Bill To per-launcher coverage gap` to `plans/done/SUBPLAN_ACCOUNT_ADDRESS_FCC.md` — each states the miss, cites the RCA artifact + this subplan. If the closure hook denies a DONE-file edit, HALT and surface — never bypass (LR-055).
6. Closure gate: `node scripts/validate-plan-closure.mjs --enforce` C1-C6 PASS.
7. Activity-log row (LR-028; LR-037 timestamp ≥ touched-file mtimes). `git mv` to `plans/done/` + `npm run plans:reindex`.
8. `/final-q` verdict block (GREEN | YELLOW | RED) per LR-042. Update `navigation.md` §C registry (launcher-dialog walks) + §B routing row (lookup-launcher dialog pattern + per-launcher coverage rule) per /reflect obligations.

---

## Per-Identity Satisfaction (LR-048 v3 — every cell a real path, `(skipped: ≥20 chars)`, or `(none)`)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline refreshes (the picker walks the prior baselines never did) | clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-2026-06-11.md<br>clients/encore/specs_planning/_internal/old-site-baseline/account-address-2026-06-11.md | `grep "Baseline diff"` present in both + A's dialog capture items (i)-(viii) present |
| GIVER | field-inventory refresh + walk evidence + catalog + both test-cases MDs + both test-plans + XLSX | clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-2026-06-11.md<br>clients/encore/specs_planning/_internal/walk-evidence-account-address-master-bill-to-2026-06-11.md<br>clients/encore/specs_planning/_internal/field-case-catalogs/launcher-dialogs-2026-06-11.md<br>clients/encore/specs_planning/test-cases/setup/locations/locations_left_panel_basic_information_test_cases.md<br>clients/encore/specs_planning/test-cases/setup/locations/locations_account_address_test_cases.md<br>clients/encore/specs_planning/test-plans/setup/locations/locations_left_panel_basic_information_test_plan.md<br>clients/encore/specs_planning/test-plans/setup/locations/locations_account_address_test_plan.md<br>clients/encore/test_cases_xlsx/encore_test_cases.xlsx | `npm run check:tc-parity` exit 0; `grep "affordance: launcher"` in the LP inventory |
| BUILDER | both specs + both page objects + LP selectors + both test-data files | clients/encore/tests/locations/location-left-panel-basic-information.spec.ts<br>clients/encore/tests/locations/location-account-address.spec.ts<br>clients/encore/src/pages/locations/location-left-panel-basic-information.page.ts<br>clients/encore/src/pages/locations/location-account-address.page.ts<br>clients/encore/src/selectors/locations/left-panel-basic-information.ts<br>clients/encore/src/data/locations/location-left-panel-basic-information.ts<br>clients/encore/src/data/locations/location-account-address.ts | `npx playwright test --list` resolves all TC-LOC-LP + TC-LOC-ACC IDs incl. net-new |
| HEALER | false-green fixes + bug filing + MD Status sync (conditional — see footnote) | (skipped: Phase 0.5fg found 0 false-greens to fix — all 5 UNPROBED-AFFORDANCE findings were coverage-adds not RED fixes; both launchers persist correctly so 0 bugs filed and no MD Status sync was needed) | both spec runs green ×2 (`--retries=0 --workers=1`) |
| WATCHDOG | false-green sweep (12 patterns, both modules) + phase-0 verification + Phase-4 FCC audit | clients/encore/specs_planning/_internal/false-green-sweeps/launcher-dialogs-2026-06-11.md<br>clients/encore/specs_planning/_internal/phase-0-verification-launcher-dialogs-2026-06-11.md | sweep emitted + Phase-0 verdict PROCEED + Phase-4 audit GREEN |
| GARDENER | structural dedup sweep (shared lookup-dialog helper evaluation, dead selectors; conditional — see footnote) | clients/encore/src/pages/locations/location-left-panel-basic-information.page.ts<br>clients/encore/src/pages/locations/location-account-address.page.ts | `npx tsc --noEmit -p clients/encore/tsconfig.json` clean |
| OWNER | RCA + lessons entries + prevention encoding + closure + sibling/master annotations | clients/encore/specs_planning/_internal/rca-launcher-dialog-misses-2026-06-11.md<br>clients/encore/specs_planning/_internal/agent-mistakes.md<br>.claude/rules/inventory.md<br>clients/encore/specs_planning/_internal/field-inventory-spec.md<br>clients/encore/specs_planning/_internal/field-case-generation.md<br>.claude/agents/PLANNER.md<br>.claude/agents/REQUIREMENTS.md<br>plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md<br>plans/done/SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC.md<br>plans/done/SUBPLAN_ACCOUNT_ADDRESS_FCC.md | `grep -n "LR-057" .claude/rules/inventory.md` ≥1 hit; `node scripts/validate-plan-closure.mjs --enforce` C1-C6 PASS |

**Conditional-row footnote (C6 cell-form discipline)**: the HEALER and GARDENER rows are conditional. If the honest outcome is that no work of that class occurred, REPLACE that row's Concrete-deliverable cell at closure with `(skipped: <reason ≥20 chars>)`. C6 validates the FINAL cell form: pure path(s), `(skipped:…)`, or `(none)` only.

---

## Acceptance Criteria

- [ ] Phase 0 gates passed; `phase-0-verification-launcher-dialogs-<DATE>.md` verdict = PROCEED; next-free TC numbers confirmed for both modules.
- [ ] Phase 0.5b BOTH old-site baselines refreshed WITH the pickers opened and captured (A: items (i)-(viii); B: Master selection semantics + persistence oracle); BL-DIV-4 re-classified from evidence; zero mutation on old site.
- [ ] Phase 0.5fg sweep emitted (12 patterns, these two modules only); zero unfixed confirmed findings at close.
- [ ] Phase 1A: Pay To launcher + dialog fully inventoried (`affordance: launcher` token, `## Launcher dialogs` section, testids complete); **payToId frozen as MCP-cited constant**; save-restore probe completed with 1604 verified back on original; backend save endpoint recorded.
- [ ] Phase 1B: Master Bill To original values anchored BEFORE interaction; Master select→update behavior + persistence measured; walk-evidence artifact emitted (or inventory refreshed per item 10); 1604 verified back on original.
- [ ] Phase 1.5: RCA artifact covers BOTH incidents (evidence chains + 5-whys + per-phase-role accountability) + two agent-mistakes.md entries appended.
- [ ] Phase 2: every cell of BOTH gap matrices (a)/(b)/(c) with per-launcher (b) citations; IDs contiguous for authored cases only; TC-LP-004 + LP field row 11 corrected (IDs kept); LP test-plan line-39 hint escalated; ACC-012 block extended; both MD header counts bumped; `npm run xlsx:build` OK; `npm run check:tc-parity` exit 0.
- [ ] Phase 3: A's dialog selectors + page-object methods landed (Account-List pattern); `PAY_TO_ORIGINAL`/`PAY_TO_ALTERNATE` + `MASTER_BILL_TO_ORIGINAL` anchored; verify-only Pay To guard in `ensureDefaultState`; persistence cases via `saveAndVerifyCase` with anchored restores in cleanup+finally; B reuses existing dialog methods (no duplicate dialog code); each spec individually green; regression-guard clean.
- [ ] Phase 4: FCC audit GREEN (per-launcher dedup verified); bugs filed/dedup'd for surviving candidates; BOTH specs green ×2; post-run Pay To = original (ID-verified) AND Master = anchored original.
- [ ] Phase 5: dedup table executed or honestly `(skipped:…)`; typecheck clean; zero behavior change.
- [ ] Phase 5.5: ALL FIVE prevention items landed (LR-057 incl. per-launcher + no-taxonomy-row clauses; spec amendment + Revision-history entry; taxonomy row + stale-path fix; PLANNER #18 + REQUIREMENTS #9; master Sweep 12 + count prose) — each with an activity-log row; retro-sweep recorded as user-deferred (c) discussion item.
- [ ] Phase 6: Execution Summary + C6 matrix audit + closure gate C1-C6 PASS; master annotated (cascade-SKIPPED citation verbatim) + Roadmap line added; BOTH sibling Post-Audit Corrections appended; activity-log row; `git mv` + reindex; `/final-q` verdict; navigation.md §B+§C updated.

## Handoff (chat-only per feedback_handoff_in_chat_only.md)

Describes outcomes only (LR-039 — no obstacle claims). On close, surface: A's launcher affordance found (verbatim), final TC counts + net-new IDs per module, both persistence verdicts (proven / documented-behavior / bug-filed), RCA root causes in one sentence each, the five prevention items with file:line, and the `/final-q` verdict.
