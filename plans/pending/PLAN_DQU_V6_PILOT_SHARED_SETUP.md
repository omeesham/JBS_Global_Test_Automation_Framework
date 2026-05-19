# PLAN_DQU_V6_PILOT_SHARED_SETUP — Execution Plan (v5 — Cleanup of v4; Nav4 Walk Dropped; TC-Inventory-First; Zero Fixme Assumption Inheritance)

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-05-12
**Updated**: 2026-05-15 (v5.1 — anti-loophole patch from external auditor review + restore of unauthorized-revert audit notes + chunked into 5 subplans; v5 cleanup of v4 preserved — see CHANGE LOG blocks below)
**Previous Update**: 2026-05-15 (v4 — Antigravity Council audit on v3 surfaced 9 flags; v4 applies them: corrects auth-state file path from invented `nav2-state.json`/`nav4-state.json` to actual single shared `clients/encore/.auth/encore-state.json`; explicit automation-user `s-prd-clickauto@psav.com` with NO MFA per LR-ENC-001 + CLAUDE.md provisioning checklist; explicit warning that page object is nav4-only (Nav2 walk uses raw CLI DOM queries on SlickGrid `name=`/`id=` selectors); correct bug-file path `reports/bugs/` not `clients/encore/reports/bugs/`; BUG-LOC-SHR-001 as schema template for new bug filings; TC-016 likely-RCA hint added; TC-010 assertion-weakness note; TodoWrite count claim removed to prevent drift. v3 changes (Antigravity audit verified) still in force: walks nav2 FIRST as baseline truth, treats every prior SSL artifact as INVALIDATED, removes the TC cap, treats "unlock ALL 6 fixme'd TCs" as a strict LR-046 line.)
**Parent**: PLAN_DQU_V6.md
**Identity**: OWNER (single-session, no identity switching)
**Model**: claude-opus-4-7
**Thinking**: max
**Justification**: Multi-rule judgment (LR-ENC-001 baseline-truth + LR-044 nav2 bug-verify + LR-046 strict-unlock + LR-013 mandatory walkthrough + LR-050 cleanup-in-scope) + RCA on invalidated artifact chain + closure gate over 6 fixme'd TCs + no-cap discovery scope = Opus max per LR-041.
**PermissionMode**: auto
**BrowserTool**: cli
**BrowserToolJustification**: catalog walkthrough (nav2 baseline for UNCOVERED probes + e2e nav2 LM History HIST cycles), unattended, no visual/CSS dimension — matches LR-038 v2 row 4 "Catalog walkthrough / locator discovery (>10 fields) → CLI"  <!-- [CHANGE 2026-05-15 — KEEP-CORRECT: dropped "nav4 observed truth" + "nav4 LM History" from justification — nav4 walk DELETED in v5; HIST runs on nav2 in e2e env (architectural) -->

---

> ## CHANGE LOG (v5 — 2026-05-15 cleanup of v4)
>
> v4 walked nav4 redundantly, ran 12 mechanical probes BEFORE diffing against existing TCs, and inherited stale 2026-05-12 fixme + bug assumptions. v5 fixes all three. Grep `CHANGE 2026-05-15` to list every change point inline.
>
> | # | Kind | Where | Why |
> |---|---|---|---|
> | 1 | **DELETE** | Step 2 (nav4 fresh walk) + Phase 2.0 setup + Phase 2 TodoWrite block + Step 2 narrative (lines 167–184, 299–321) | nav4 truth lives in spec + page-object + selectors — re-walking is wasted token-burn. Only nav2 is baseline per LR-ENC-001. |
> | 2 | **DELETE** | Step 1.5 (HUNTER retrospective diff) + lines 163–165 TodoWrite + lines 295–297 narrative | HUNTER 2026-05-12 artifacts already at `_internal/_archive/` — `_archive/` move + Step 0.6 verbal ack is enough. Step 2A gap-walk catches the same misses naturally. No diff value. |
> | 3 | **RESHAPE** | Step 1 (was: nav2 fresh walk with 12 probes FIRST) → **NEW Step 1: TC INVENTORY** (read 24 existing TCs, build surface-coverage map). Then **NEW Step 2A**: walk nav2 ONLY in UNCOVERED probes. | Inventory-first is far cheaper than 12 mechanical probes that re-cover surface the 24 TCs already encode. Find NEW, don't re-confirm. |
> | 4 | **NEW** | **Step 2B — Fixme re-verification** (after Step 2A) | All 6 fixme'd TCs re-verified live on nav2 with default hypothesis "works now". Zero inherited causal assumption from 2026-05-12 stated reasons. Classification: PASS-LIVE / FAIL-FRAMEWORK / FAIL-APP / CHANGED-SYMPTOM drives Step 6 unlock actions. |
> | 5 | **RESHAPE** | Step 2.5 BUG-LOC-SHR-001 re-verify — was dual-site (nav2 + nav4); now **nav2-only** | nav4 result already in spec as `test.fixme()` = code-truth. Re-verifying on nav2 alone tells us if the FEATURE works at baseline. LR-044 fresh sessionDate 2026-05-15 required — do NOT inherit 2026-05-12 verificationLog. |
> | 6 | **RESHAPE** | Step 2.6 (file new BUG-LOC-SHR-NNN) — drop nav2-vs-nav4 framing | Comparison is nav2-live (2026-05-15) vs spec-encoded assertion. No dual-site mention. |
> | 7 | **KEEP-CORRECT** | Step 3 HIST root-map — was "nav4-driven; LM History is nav4-only" | LM History is architectural to e2e env. Since nav2 IS the e2e UI per LR-ENC-001, HIST walks nav2 in e2e. Original "nav4 LM History" framing was wrong on both axes. Output path unchanged (`hist-root-map-location-management-shared-setup.md`). |
> | 8 | **RESHAPE** | Step 4 (gap analysis) — was "diff full nav2 walk vs 24 TCs"; now consolidates Step 2A (gaps) + Step 2B (fixme classifications) + Step 3 (HIST) → missing-TC list | New ordering eliminates the diff-at-Step-4 waste. HALT-gate at >30 missing TCs unchanged. |
> | 9 | **RESHAPE** | Step 6 unlock-6-fixme'd — was uniform per-TC protocol; now **4-classification table** driven by Step 2B + **6 FORBIDDEN LOOPHOLES** explicit list | User directive 2026-05-15: maximize unlocks, no skip-loopholes. Strict LR-046 line preserved. |
> | 10 | **REVERTED (v5-audit)** | TC count stays **24** (TC-LOC-SSL-001..024) — v4 was correct | Spec has 24 `test(` calls (TC-001..024); no TC-025 exists. `test.fixme()` marks inside existing TCs, not separate TCs. v5's "correction" to 25 was wrong — reverted by v5-audit 2026-05-15. |
> | 11 | **KEEP-CORRECT** | BUG-LOC-SHR-001 row (Invalidated Artifacts table) — bug bumped from "UNTRUSTED 2026-05-12" to "MUST RE-VERIFY fresh 2026-05-15 per LR-044" | 3 days have passed; cannot inherit prior verdict. Fresh evidence required. |
> | 12 | **DELETE** | Verification command 4 (grep PROBE count in nav4 walk-evidence file) | nav4 walk-evidence file is no longer produced (Step 2 deleted). |
>
> **Acceptance bumps**: target plan length ≤300 lines once v5 markers + deleted-section preservation are weighed (v4 = 508 lines; net executable scope reduced; file size grows slightly from annotations).
>
> **What did NOT change** (v4 force still in effect): OWNER identity discipline, automation-user no-MFA auth flow, single shared `.auth/encore-state.json`, raw-DOM-on-nav2 (no PO methods), strict LR-046 unlock line, BUG-LOC-SHR-001 as bug schema template, REQUIREMENTS.md contradiction protocol, parent-cascade closure, /reflect + /final-q exit gates.

> ## CHANGE LOG (v5.1 — 2026-05-15 anti-loophole patch + audit-notes restore + subplan chunking)
>
> External auditor surfaced 4 escape loopholes in v5; per-bullet verification against plan content confirmed all 4 valid (line numbers cited by auditor were off by ~15–20 vs current render, but every substance claim landed). Separately, an executing agent removed the `## Pre-Execution Audit Notes` section without authorization; user-directed per-bullet review found 5/8 bullets carry non-redundant content (most importantly bullet 4 catches a factual error in the plan body itself — TC-MD header `**Total**: 25` while spec has 24 `test(` calls — plan body line 134 wrongly claimed file reads `Total: 24`). Bullet 2's `npm run regression:snapshot` command was indeed hallucinated (grep confirms no such script exists in any `package.json`); restoration fixes this in-place. The full restored block lives in a new section below; the actionable points propagate into the 5 subplans authored alongside this CHANGE LOG.
>
> User authorized chunking the execution into subplans to release single-agent load (4–7 h single-session was unrealistic given 5+ live walk steps + 6-TC unlock + HIST catalog). 5 LR-048-compliant subplans created; parent plan becomes orchestration shell + strict-line registry.
>
> | # | Kind | Where | Why |
> |---|---|---|---|
> | v5.1-1 | **NEW (CLOSURE-1)** | Step 1 v5 marker block (COVERED definition + skip-Step-2A halt-gate) | UNCOVERED=0 bypass: agent maps 24 TCs across 12 axes loosely, claims all probes COVERED, skips Step 2A. Fix: COVERED requires verbatim assertion file:line cite + 60-sec smoke-pass evidence in Section A.1; skip-Step-2A path deleted. |
> | v5.1-2 | **NEW (CLOSURE-2)** | Step 6 per-TC table (TC-018/019/020/021/024 rows) | BUG-001 cascade free pass: single CONFIRMED verdict frees 83% of strict-line workload. Fix: per-TC alternate-search-query independence test (Chicago/Boston/Dallas/Denver/Atlanta), Section C evidence required to claim BUG-001 as blocker. |
> | v5.1-3 | **NEW (CLOSURE-3)** | Step 4 v5 marker block + Strict-line check | 31+ gap HALT exploitable by fabrication. Fix: 11-field gap evidence schema + Section A.Index; HALT-at-30 fires only when evidence index is complete. |
> | v5.1-4 | **NEW (CLOSURE-4)** | Step 2B narrative + Step 6 4-class table (FAIL-APP + CHANGED-SYMPTOM rows) | Unfalsifiable classification: FAIL-APP / CHANGED-SYMPTOM let agent dodge framework-leak debugging. Fix: isolated `--grep` ruling-out gate FIRST; 4-artifact manual-CLI repro required for FAIL-APP; CHANGED-SYMPTOM is code-update path (assertion update + x2 isolated runs), not halt-and-defer. |
> | v5.1-5 | **NEW (FORBIDDEN LOOPHOLES #7–10)** | After existing 6-row list | Explicit greppable fences for v5.1 CLOSURE-1..4 — every closure has a corresponding ❌ row in the loopholes list so chain-audit can grep for violations. |
> | v5.1-6 | **NEW (ACCEPTANCE v5.1)** | Coverage section | 4 new `⚠ **v5.1**` rows codifying the closures as strict-line acceptance criteria. |
> | v5.1-7 | **NEW (VERIFICATION 9–12)** | Verification section | 4 new grep verifications (`COVERED-SMOKE-PASS`, `Section C.TC-LOC-SSL-`, 11-field gap schema, 4-artifact FAIL-APP evidence). |
> | v5.1-8 | **RESTORE** | New `## Pre-Execution Audit Notes` section before Verification | 8 bullets restored after unauthorized revert; bullet 2's hallucinated `npm run regression:snapshot` replaced with `/regression-guard` skill invocation only. |
> | v5.1-9 | **NEW (CHUNK)** | New `## Subplan Decomposition` section before Verification | Parent becomes orchestration shell; 5 SUBPLAN_DQU_V6_PILOT_SSL_A..E files own execution. Strict lines propagate per subplan as `⚠ PARENT-STRICT-LINE` rows. |
>
> **What did NOT change** (v5 force still in effect, on top of v4): TC count = 24, OWNER identity, automation-user no-MFA, single shared `.auth/encore-state.json`, raw-DOM-on-nav2, strict LR-046 unlock line, parent-cascade closure, /final-q exit gate, all 12 v5 CHANGE LOG entries.

---

## ⚠ ORCHESTRATION-SHELL NOTICE (v5.1 SHELLIFY — read FIRST)

<!-- [CHANGE 2026-05-15 — v5.1 SHELLIFY: this notice resolves a second-pass auditor finding that the parent plan still contained an actionable TodoWrite payload + 9-step narrative even though `## Subplan Decomposition` (near end of file) declared it an orchestration shell. A fresh new-session agent reading top-down could legally either (a) execute the payload directly, defeating the chunking, or (b) cite the shell label and do nothing. This NOTICE block resolves the ambiguity. The `## Pre-Execution TodoWrite Payload` and `## Execution Steps` sections below are retained for audit trail / subplan-owner mapping but are NOT actionable in this file. The other 3 auditor counter-review claims (SP-A/SP-C/SP-D HALT gates as escape hatches) were REJECTED — those HALTs are LR-046 strict-line discipline working as designed, not escape hatches; the auditor's STRICT-OVERRIDE prompt would directly violate LR-046 + `feedback_strict_plan_lines_halt_not_rescope.md` + `feedback_stop_guessing.md`. -->

**This parent plan is an orchestration shell. Do NOT execute the TodoWrite payload or Execution Steps below directly.** Execution is owned by 5 subplans (`plans/pending/SUBPLAN_DQU_V6_PILOT_SSL_A..E.md` — see `## Subplan Decomposition` near end of file). The retained `## Pre-Execution TodoWrite Payload` and `## Execution Steps` sections are HISTORICAL REFERENCE for what work the subplans cover, NOT actionable in this file.

**If you are a fresh-session agent reading this**: pick the lowest-numbered unblocked subplan from `plans/INDEX.md` (#1 SP-A or #2 SP-B — they have no dependencies and may run in parallel sessions); execute that subplan's own Phase 0 → Acceptance Criteria; close per LR-027 parent-cascade. The parent auto-closes when SP-E does (last subplan triggers cascade).

**Subplan ownership map** (for navigation only — each subplan has its own authoritative Phase 0 + Step bodies):
- SP-A (`SUBPLAN_DQU_V6_PILOT_SSL_A.md`) — owns Step 1 (TC inventory) + Step 2A (nav2 gap walk + COVERED-SMOKE-PASS) + Step 2B (6-TC fixme reverify with isolated-grep gate) + Step 2.5 (BUG-001 re-verify) + Step 2.6 (file new bugs).
- SP-B (`SUBPLAN_DQU_V6_PILOT_SSL_B.md`) — owns Step 3 (HIST root-map catalog on e2e).
- SP-C (`SUBPLAN_DQU_V6_PILOT_SSL_C.md`) — owns Step 4 (gap consolidation) + Step 5 (write missing TCs).
- SP-D (`SUBPLAN_DQU_V6_PILOT_SSL_D.md`) — owns Step 6 (unlock 6 fixme'd with alternate-query rules) + Step 7 (run x2 + flake check + HIST migration grep).
- SP-E (`SUBPLAN_DQU_V6_PILOT_SSL_E.md`) — owns Step 8 (adjacent-sweep) + Step 9 (closure ceremonies + TC-MD header fix from 25 → 24+N).

**HALT gates in subplans are intentional, not escape hatches.** A second-pass auditor demanded removal of `HALT-and-ask` gates from SP-A (covered-probe-divergence, line 135), SP-B (LM History render failure, line 58), SP-C (incomplete-evidence ping-pong, line 77), and SP-D (2-cycle strict-line failure, line 124). All 4 were REJECTED. Per LR-046 ("Strict plan lines beat general rules — HALT-and-ask before rescoping"), `feedback_strict_plan_lines_halt_not_rescope.md`, `feedback_stop_guessing.md`, and `feedback_skip_discipline.md`: when a strict line cannot be met, the correct action is HALT-and-ask, NOT silent continue-with-blocked-item. Evidence-emission discipline (LR-042 + LR-044) prevents agents from fabricating a HALT condition without leaving an audit trail.

---

## Context

> [CHANGE 2026-05-15 — RESHAPE: v5 adds a third structural fault on top of v4's two: walking 12 mechanical probes FIRST then diffing at Step 4 re-confirms existing-TC surface for zero discovery gain. v5 inverts ordering: TC inventory FIRST (new Step 1), walk nav2 only in UNCOVERED probes (new Step 2A). Plus: zero fixme assumption inheritance — see CHANGE LOG #4. Plus: drop nav4 walk entirely — see CHANGE LOG #1.]

**v3 supersedes v2 (2026-05-15 audit failure).** v2 had two structural faults:

1. **Walk-target inversion**: v2 walked nav4 (`/navigator/locations/1604/settings/location`) as the discovery surface. Per **LR-ENC-001**, **nav2 (`navigator2.training.psav.com/#/setup/locationdetail/1604`) is baseline truth**; nav4 is observed truth. Test cases are derived from nav2 (what features should exist) and verified against nav4 (whether they do). v2 inverted this.

2. **Inherited untrusted artifacts**: v2 listed HUNTER's `old-site-baseline/shared-setup-2026-05-12.md`, GIVER's field-inventory, and the HUNTER intake A/B/C/D classifications as "YES still valid" in the "What's ALREADY done" table. User flagged the HUNTER session as lazy/incomplete. v3 treats every artifact in that contamination chain as **INVALIDATED** — read only for retrospective comparison, never as inheritable baseline.

**This pilot's job**: walk nav2 from scratch as if no prior baseline existed, find ALL test cases (assume the prior count of 24 + 14 gaps = 38 is LOW; real number is whatever nav2 actually has), then unlock the 6 fixme'd TCs (TC-016 + TC-018/019/020/021/024) as a strict line. No cap, no rescoping.

> [CHANGE 2026-05-15 — RESHAPE: "walk nav2 from scratch" → **inventory 24 TCs first (Step 1), walk nav2 ONLY in UNCOVERED surface (Step 2A)**. The 12-probe-mechanical-first approach is what v5 cleans up. Goal is to find NEW behaviors the spec doesn't encode, not to re-confirm 24 existing TCs. TC count is **24** (TC-LOC-SSL-001..024) — v4 was correct; v5's attempted "correction" to 25 was wrong (no TC-025 in spec).]

---

## Invalidated Artifacts (do NOT inherit — read for comparison only)

> [CHANGE 2026-05-15 — KEEP-WITH-RESHAPE: HUNTER 2026-05-12 artifacts are now physically at `_internal/_archive/` (Step 0.6 verbal ack confirms). The "How v3 uses it" column rows referencing **Phase 1.5 diff** are now DELETE — Phase 1.5 dropped in v5 (CHANGE LOG #2). The BUG-LOC-SHR-001 row is upgraded from "UNTRUSTED 2026-05-12" to **"MUST RE-VERIFY fresh 2026-05-15 per LR-044"** (CHANGE LOG #11) — see narrative Step 2.5 below for nav2-only verification protocol.]

| Artifact | Status | Why invalidated | How v3 uses it |
|---|---|---|---|
| `clients/encore/specs_planning/_internal/old-site-baseline/shared-setup-2026-05-12.md` | **INVALIDATED** | Produced by HUNTER session flagged as lazy/incomplete | Read-only orientation context; do not inherit any classification |
| `clients/encore/specs_planning/_internal/field-inventories/shared-setup-2026-05-12.md` | **INVALIDATED** | GIVER-produced from invalid HUNTER baseline (contamination chain) | Rebuild field inventory from fresh nav2 walk; old file is read-only retrospective |
| `clients/encore/specs_planning/_internal/_archive/shared-setup-hunter-2026-05-12.md` | **INVALIDATED** | Same HUNTER session | A/B/C/D Phase 0 classifications discarded; rebuild from fresh walk |
| HUNTER's 6 divergences (SHR-DIV-001..006) | **INVALIDATED** | Inherited from bad baseline | Re-classify every nav2-vs-nav4 divergence from fresh walk; do not pre-load with these IDs |
| GIVER gap list (G01-G12, D6-01..03 — 14 items) | **INVALIDATED** | Same contamination chain | Used in Phase 4 ONLY as an anti-checklist: confirm fresh walk found at least these 14; expect significantly more |
| Field-inventory's "Matrix D N/A cells from REQUIREMENTS.md" | **INVALIDATED** | Doc-derived, never live-verified | Every "N/A" must be live-verified on nav2 first, then nav4 |
| `reports/bugs/BUG-LOC-SHR-001.json` (Miami search 0 results) | **UNTRUSTED** | User reports Miami search works manually on 2026-05-15 — bug may be FALSE/RESOLVED/ENV-dependent | Re-verify per **LR-044** on BOTH nav2 and nav4 fresh, in independent tabs, with network capture; append verificationLog with new verdict |
| `reports/bugs/BUG-MGH-001.json` SSL row in `walk-evidence-location-settings-2026-05-14.md` | **UNTRUSTED** | Walk evidence was lazy per audit pattern | Re-verify Country populates on SSL save during Phase 2 |
| "Target 11-13 new TCs" cap in v2 | **REMOVED** | An assumption masquerading as scope | No cap. Discovered count is the count. |
| ARCH-013 + ARCH-014 archetypes | **PARTIAL TRUST** | General cross-module shape valid; SSL-specific completeness unverified | Use as mental checklist for save-cycle + cross-field shape; do not rely as sole gap source |
| Phase 0.5b CONDITIONAL requirement (LR-048) | **REQUIRED HERE** | This subplan's output drives TC corrections | Phase 0.5b consumes the FRESH nav2 walk-evidence (Phase 1's output), not the invalidated HUNTER artifact |

## Trusted Inputs (code-as-truth — verify exists, then use)

| Trusted | Why | Caveats |
|---|---|---|
| `clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts` (**24** TCs, TC-LOC-SSL-001..024) | Code that runs | Tells me what's currently asserted; does NOT tell me what's missing. 18 pass, 6 fixme'd (lines 188 / 209 / 243 / 279 / 308 / 376). Assume coverage is incomplete. |
| `clients/encore/src/pages/setup/locations/location-shared-setup-locations.page.ts` (375 lines) | Code that exists | Methods may be incomplete for nav2-discovered behaviors; rewrite/extend as walk reveals gaps |
| `clients/encore/src/selectors/setup/locations/shared-setup-locations.ts` (18 testids) | Code | Nav2 has zero testids (SlickGrid uses `name=`/`id=` per `OSB-ACCESS-VERIFY-2026-04-24.md`); nav2 selectors need name/id pattern, not testid |
| `clients/encore/tests/test-data/setup/locations/location-shared-setup-locations.data.ts` | Code | Values like Miami "~69 expected" are stale assumptions — re-derive from fresh nav2 walk |
| `.claude/rules/baseline.md` + `clients/encore/CLAUDE.md` LR-ENC-001 | Framework rule | Nav2 IS baseline truth; not negotiable |
| `clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md` | Framework rule | Nav2 access protocol; how to reach nav2 with refreshed auth |
| `reports/bugs/BUG-LOC-NTS-*.json` (Notes-pilot bugs) | Code | Pattern reference for LR-034 schema; not SSL-specific |
| `reports/bugs/BUG-LOC-SHR-001.json` | Code | Schema template for any new SSL bug filing — copy structure, replace content |
| `plans/done/PLAN_DQU_V6_PILOT_NOTES.md` | Plan | Pattern reference for v6 single-session execution shape |
| `clients/encore/config/environments/.env.e2e` | Config | Auth credentials (automation user) + BASE_URL |
| `clients/encore/tests/infra/auth-storage.ts` + `fixtures.ts:171-212` | Code | Auth state validator + file-locked refresh |

## Auth & Page Object Reality (audit-corrected, no assumptions)

**Automation user — no MFA, same creds on both sites**:
- Credentials: `NAVIGATOR_USERNAME=s-prd-clickauto@psav.com` + `NAVIGATOR_PASSWORD=<env>` from `clients/encore/config/environments/.env.e2e:42-43`.
- Per `clients/encore/CLAUDE.md` §"Automation User Provisioning Checklist" step 2: this account is provisioned with NO second-factor authentication. SSO completes without manual intervention.
- Per LR-ENC-001 line 46: SAME Microsoft SSO works on BOTH `navigator2.training.psav.com` (nav2) and `cloudapps-e2e.encoreglobal.com` (nav4) — proven by SP-OSB-01 ("CiC inherits the user's live Chrome session, no re-login needed").

**Auth state — single shared file (not per-site)**:
- Path: `clients/encore/.auth/encore-state.json` — the ONLY auth state file in this repo.
- ⚠ `nav2-state.json` and `nav4-state.json` DO NOT EXIST. Earlier plan drafts invented these names. Use the actual single file.
- Validator: `clients/encore/tests/infra/auth-storage.ts` exports `STATE_PATH`, `validateState`, `acquireLock`, `writeStateAtomic`.
- Auto-refresh: `fixtures.ts:171-212` runs pre-test guard, refreshes with file-lock (single re-login across workers).

**Auth flow for Playwright CLI walks (outside fixture — interactive)**:
1. Launch: `npx playwright open --load-storage=clients/encore/.auth/encore-state.json --save-storage=clients/encore/.auth/encore-state.json --save-trace=test-results/walk-trace-<site>-<date>.zip <URL>`
2. If page lands on the app → continue probes.
3. If page redirects to `login.microsoftonline.com` → state is stale. Run one-shot refresh script (Node-only, ~10 lines) that imports `clients/encore/src/pages/auth/login.page` and calls `lp.loginWithMicrosoft(process.env.NAVIGATOR_USERNAME!, process.env.NAVIGATOR_PASSWORD!)` against the target base URL; state auto-persists via `--save-storage`.
4. No MFA prompt expected (automation user has no second factor). If a 2FA challenge appears at runtime, HALT and surface to user — provisioning may have changed.
5. Log `[BROWSER-SWITCH] reason=auth-state-stale-refresh artifact=clients/encore/.auth/encore-state.json` per LR-028 if step 3 fired.

**Page object inapplicability for nav2 (HIGH-risk auditor flag)**:
- `clients/encore/src/pages/setup/locations/location-shared-setup-locations.page.ts` (375 lines) is built entirely around nav4 Radix UI + `data-testid` selectors.
- **Nav2 has ZERO `data-testid` attributes** (LR-ENC-001 §"Selector parity" — "ZERO"). Nav2 SSL uses **SlickGrid** with `editor-checkbox` class native checkboxes + cell classes like `l0 r0` for row/column positions + column ids `LocalOfficeId`/`LocalOfficeName`/`IsPrimaryOffice`/`IsSharesInventory` (per `old-site-baseline/shared-setup-2026-05-12.md` §6, read for retrospective only).
- **Mandate**: Phase 1 (nav2 walk) uses **raw Playwright CLI DOM queries only** — `name=`/`id=`/`.editor-checkbox`/SlickGrid cell-class selectors. Do **NOT** import or call any method from `location-shared-setup-locations.page.ts` during nav2 probes. The page object becomes usable again starting Phase 2 (nav4 walk).

**Bug filing — repo root, BUG-001 as template**:
- All bug JSONs live at `reports/bugs/BUG-<CATEGORY>-<NNN>.json` (**repo root**, NOT under `clients/encore/`).
- Use existing `reports/bugs/BUG-LOC-SHR-001.json` as the schema template for any new bug filing — already conforms to LR-034.

## What was NOT done (this plan's scope — strict lines marked ⚠)

> [CHANGE 2026-05-15 — RESHAPE: v5 scope corrections inline below. Lines 1, 2, 4, 5, 6, 7 changed; lines 3, 8, 9 unchanged.]

1. ⚠ **Step 1 — TC inventory** (was: "Fresh nav2 walk first"). Read 24 existing TCs, build surface-coverage map. <!-- [CHANGE 2026-05-15 — RESHAPE: was item 1 "Fresh nav2 walk must come before nav4"; nav4 walk is DELETED, ordering inverts to TC-inventory-first] -->
2. ⚠ **Step 2A — Nav2 gap walk** (was: "Fresh nav4 walk"). Walk nav2 ONLY in surface UNCOVERED by Step 1's coverage map. <!-- [CHANGE 2026-05-15 — DELETE-AND-RESHAPE: original line 2 "Fresh nav4 walk — same probe sequence for direct comparison" is DELETED; replaced with nav2-gap-walk] -->
3. ⚠ **All 6 fixme'd TCs UNLOCKED** — TC-016, TC-018, TC-019, TC-020, TC-021, TC-024. Zero exceptions per LR-046 strict line. If any can't unlock due to confirmed app bug, HALT-and-ask user; do not unilaterally rescope. <!-- [CHANGE 2026-05-15 — UNCHANGED: strict line preserved exactly. New Step 6 narrative adds 4-classification table + 6 FORBIDDEN LOOPHOLES below — see CHANGE LOG #9] -->
4. ⚠ **Every nav2-observed gap covered by a NEW TC; every existing TC re-verified live** — no cap on new TC count; no causal assumption inherits for fixme'd TCs. <!-- [CHANGE 2026-05-15 — RESHAPE: was "Every nav2-observed behavior covered by a TC"; v5 splits: gap-coverage at Step 5 + fixme-reverify at Step 2B] -->
5. **BUG-LOC-SHR-001 fresh nav2 re-verification** — per LR-044, on nav2 ONLY (nav4 truth = spec test.fixme), with 2026-05-15 verificationLog appended. <!-- [CHANGE 2026-05-15 — RESHAPE: was "dual-site BOTH nav2 and nav4"; now nav2-only per CHANGE LOG #5] -->
6. **HIST root-map for SSL parents → cols 59-61** — on e2e nav2 (LM History is architectural to e2e env; nav2 IS e2e UI per LR-ENC-001). <!-- [CHANGE 2026-05-15 — KEEP-CORRECT: dropped "nav4-driven (LM History is nav4-only)" — that framing was wrong on both axes; corrected per CHANGE LOG #7] -->
7. **New bug filings** — any nav2-live (2026-05-15) finding vs spec-encoded assertion mismatch (FAIL-APP class from Step 2B, or REGRESSION-suspected from Step 2A) gets a BUG-LOC-SHR-NNN with full LR-034 schema + minimal repro per LR-044. <!-- [CHANGE 2026-05-15 — RESHAPE: was "nav2-vs-nav4 regression"; now nav2-live-vs-spec-encoded comparison per CHANGE LOG #6] -->
8. **TC-MD header count fix** — currently "Total: 24", file has 24; new total after writes = 24 + N (where N = new TCs from Step 5). <!-- [CHANGE 2026-05-15 — v5-audit: v4 was correct at 24; v5 wrongly "corrected" to 25; reverted by audit 2026-05-15] -->
9. **REQUIREMENTS.md correction** — per LR-030, any nav2 finding that contradicts REQUIREMENTS.md flips to a documentation bug, not silent doc update <!-- [CHANGE 2026-05-15 — UNCHANGED] -->

---

## Bootstrap (LR-048 §3 — context files the executing agent MUST load)

- `.claude/context/navigation.md` (universal first-step + §B routing row 60 "Establish baseline truth for TC authoring (Encore)" + §C row "Location Settings → Shared Setup Locations tab")
- `clients/encore/CLAUDE.md` (LR-012, LR-036, **LR-ENC-001 — nav2 IS baseline truth**)
- `clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md` (nav2 access protocol — auth refresh, headed-mode fallback)
- `clients/encore/specs_planning/_internal/agent-mistakes.md` (grep "shared-setup|SSL|Miami|HUNTER")
- `.claude/rules/specs.md` (LR-024 clean-before-rca, LR-052 polling)
- `.claude/rules/browser-tool.md` (LR-038 v2 — CLI default, Gate 3 auth fallback)
- `.claude/rules/baseline.md` (LR-045 baseline-first; LR-013 mandatory walkthrough)
- `.claude/rules/pipeline.md` (LR-020/027/028/030/035/040/041/044/046/048/050 + TodoWrite Tagging Contract)
- `.claude/rules/inventory.md` (LR-029 testid coverage requires live DOM)
- `.claude/rules/angular.md` (LR-026 Angular dirty-state — nav4 only)
- `.claude/skills/relevant/SKILL.md` + `.claude/skills/execute/SKILL.md` + `.claude/skills/ultrathink/SKILL.md` + `.claude/skills/rca/SKILL.md`
- Parent: `plans/pending/PLAN_DQU_V6.md`
- Sibling: `plans/done/PLAN_DQU_V6_PILOT_NOTES.md` (pattern reference for v6 single-session shape; SSL scope is larger)
- **Read for comparison only (do NOT inherit)**: HUNTER's `old-site-baseline/shared-setup-2026-05-12.md`, GIVER's `field-inventories/shared-setup-2026-05-12.md`, archived HUNTER intake

---

## Pre-Execution TodoWrite Payload — HISTORICAL REFERENCE (v5.1 SHELLIFY — subplans own execution; do NOT paste verbatim into TodoWrite)

<!-- [CHANGE 2026-05-15 — v5.1 SHELLIFY: section retained for audit trail only. The 90+ TodoWrite entries below were authored when this plan was a single-session execution. After v5.1 chunking, each entry is now owned by one of SP-A..E (see Subplan ownership map in ORCHESTRATION-SHELL NOTICE at top of file). Direct paste-into-TodoWrite from this file is FORBIDDEN per the NOTICE. The retained payload below documents the LR-050 closed-taxonomy tag coverage achieved by the subplans collectively. ] -->

**Historical**: this payload was authored as a single-session pre-execution todo list before v5.1 chunking. Each subplan SP-A..E now owns the appropriate range as its own Phase 0 + Step bodies. Reading the entries below is fine for understanding what work each subplan does; pasting verbatim into TodoWrite is NOT (each subplan emits its own TodoWrite payload at its own Phase 0.5 start). <!-- v5-audit: payload updated in-place to v5 form — Phase 1.5 / Phase 2.0 / Phase 2 (nav4 walk) DELETED; Phase 1 RESHAPED to TC-inventory-first + gap-walk + fixme-reverify; Phase 2.5 RESHAPED to nav2-only; Phase 3 RESHAPED to e2e-nav2; Phase 6 applies 4-classification table + FORBIDDEN LOOPHOLES. See CHANGE LOG entries #1-#9 for full rationale. -->

```jsonc
// Paste into TodoWrite at Phase 0.5
[
  // ===== Phase 0 — bootstrap ceremonies (LR-050 obligations 1-3) =====
  {"content":"[ceremony] Phase 0 context load — read navigation.md §B/§C, LR-ENC-001, OSB-ACCESS-VERIFY-2026-04-24, agent-mistakes.md (grep 'shared-setup|SSL|Miami|HUNTER'), all LR-rules cited in Bootstrap","activeForm":"Loading context files"},
  {"content":"[ceremony] [/skill:wrap] Phase 0.1 — /identity gate confirms OWNER","activeForm":"Confirming OWNER identity"},
  {"content":"[ceremony] [/skill:direct] Phase 0.5 — /relevant skill scan confirms this plan's tags vs current rule set","activeForm":"Running /relevant"},
  {"content":"LR-020(verify plan claims) [manual] Verify referenced files exist on disk — spec, page object, selectors, test data, bug JSONs, OSB-ACCESS-VERIFY; abort if any path is wrong","activeForm":"Verifying file paths"},

  // ===== Phase 0.6 — explicit artifact invalidation acknowledgment =====
  {"content":"[manual](audit-trail) Explicitly read INVALIDATED artifacts table — confirm: HUNTER 2026-05-12 baseline, GIVER field-inventory, HUNTER intake, SHR-DIV-001..006, GIVER gap list G01-G12+D6-01..03 are NOT inheritable. Read for orientation only — no causal inheritance.","activeForm":"Acknowledging invalidated artifacts"},

  // ===== Phase 1.0 — pre-walk setup (LR-038 announce + LR-033 network tracing) =====
  {"content":"[manual](LR-038 first-output declaration) Announce 'Browser tool: Playwright CLI. Reason: nav2 baseline gap-walk + nav2 HIST catalog. Unattended.'","activeForm":"Announcing browser tool"},
  {"content":"LR-033(client-vs-server scope) [manual] Start Playwright CLI with --save-trace + console+network capture from t=0; one trace file per tab/site","activeForm":"Launching CLI with full tracing"},

  // ===== Step 1 — TC INVENTORY (encoded-truth pass — read 24 existing TCs, build coverage map) =====
  {"content":"[manual](tc-inventory) Read all 24 TCs in locations_shared_setup_locations_test_cases.md; for each capture: id, title, fixme?, surface-areas-touched. Build 12-axis surface-area coverage map (columns / self-row / add-flow / delete-flow / save-flow / non-self-row / dialog-search / dialog-select / persistence / cross-field / edges / history). Output: tc-coverage-map-shared-setup-2026-05-15.md with COVERED + UNCOVERED probe lists.","activeForm":"Building TC coverage map"},

  // ===== Step 2A — NAV2 GAP WALK (UNCOVERED probes only — baseline truth) =====
  {"content":"LR-ENC-001(baseline truth) [manual] Tab 1: load shared auth state clients/encore/.auth/encore-state.json + open https://navigator2.training.psav.com/#/setup/locationdetail/1604. Automation user s-prd-clickauto@psav.com has NO MFA — if state stale, run one-shot LoginPage.loginWithMicrosoft() refresh script; SSO completes without manual step","activeForm":"Opening nav2 in Tab 1"},
  {"content":"[manual](PO-disclaimer per FLAG-2) ⚠ Page object methods NOT applicable on nav2 — use raw Playwright CLI DOM queries (name=/id=/.editor-checkbox/SlickGrid cell classes); do NOT import location-shared-setup-locations.page.ts here","activeForm":"Acknowledging PO inapplicability for nav2"},
  {"content":"LR-024(clean-before-walk) [manual] Verify nav2 SSL starting state — open SSL section via raw DOM query, screenshot table, record row count + each row's checkboxes + name/id of every interactive element","activeForm":"Capturing nav2 starting state"},
  {"content":"[/skill:inform] [manual] Walk nav2 ONLY in UNCOVERED probes from Step 1 coverage map — strict scope: re-walking COVERED probes is FORBIDDEN. For each UNCOVERED probe: SlickGrid uses name=/id= not testid; click cells to activate edit mode; record DOM evidence + selectors + network.","activeForm":"Walking nav2 UNCOVERED probes"},
  {"content":"LR-046(strict zero unprobed) [manual] Emit walk-evidence Section A: Gaps — schema {id, probe, surface, repro-steps, observed-live, why-gap, proposed-TC}; zero 'NOT probed' for UNCOVERED probes","activeForm":"Emitting gap-walk evidence"},
  {"content":"[manual](walk-evidence) Write clients/encore/specs_planning/_internal/walk-evidence-shared-setup-2026-05-15.md Section A","activeForm":"Writing walk-evidence Section A"},

  // ===== Step 2B — NAV2 FIXME RE-VERIFICATION (6 fixme'd TCs, default hypothesis "works now") =====
  {"content":"[manual](fixme-reverify) For each of 6 fixme'd TCs (TC-016/018/019/020/021/024): default hypothesis 'this TC works now'; execute verbatim Steps live on nav2 (Office 1604); probe adjacent behavior; classify PASS-LIVE / FAIL-FRAMEWORK / FAIL-APP / CHANGED-SYMPTOM. Forbidden: assuming 2026-05-12 reason still applies; skipping a TC probe.","activeForm":"Re-verifying 6 fixme'd TCs on nav2"},
  {"content":"[manual](walk-evidence) Write walk-evidence-2026-05-15.md Section B: Fixme Re-Verification — one row per TC with classification + evidence","activeForm":"Writing walk-evidence Section B"},

  // ===== Step 2.5 — BUG-LOC-SHR-001 nav2 re-verification (LR-044) =====
  {"content":"LR-044(verify verbatim) [/skill:verify] Read BUG-LOC-SHR-001.json stepsToReproduce verbatim — follow exactly on nav2 (https://navigator2.training.psav.com/#/setup/locationdetail/1604); nav4 truth = spec test.fixme (code-truth, no re-walk needed)","activeForm":"Reading BUG-001 verbatim"},
  {"content":"LR-044(verify on baseline) [/skill:verify] On nav2: replicate steps, count Miami search results, capture network","activeForm":"Replicating BUG-001 on nav2"},
  {"content":"LR-044(classify verdict) [manual] Classify per LR-044: CONFIRMED | FALSE-RESOLVED | FALSE-ISOLATION | FALSE-HALLUCINATION | FALSE-MISREAD | FALSE-ENVIRONMENTAL | FALSE-STALE | ROLE-OFFICE-DEPENDENT","activeForm":"Classifying BUG-001 verdict"},
  {"content":"LR-044(minimize repro) [manual] If CONFIRMED: minimize repro (drop setup steps one at a time); update stepsToReproduce + preserve original in stepsToReproduceOriginal","activeForm":"Minimizing BUG-001 repro"},
  {"content":"LR-044(append verificationLog) [manual] Append verificationLog entry to reports/bugs/BUG-LOC-SHR-001.json (REPO ROOT, not clients/encore/reports) — {verifierAgent:OWNER, verifiedDate:2026-05-15, verdict:X, minimalRepro:N|null, RCA_category:Y|null, evidence:<nav2Count+network status>} + update status field per verdict","activeForm":"Updating BUG-001 verificationLog"},

  // ===== Step 2.6 — file new bugs for nav2-live-vs-spec-encoded mismatches =====
  {"content":"LR-034(schema) [manual] For every FAIL-APP (or CHANGED-SYMPTOM-as-APP) from Step 2A/2B: file new reports/bugs/BUG-LOC-SHR-NNN.json (repo root) using BUG-LOC-SHR-001.json as schema template — stepsToReproduce + expected (spec assertion) + actual (nav2 live) + minimal repro per LR-044 + 2026-05-15 verificationLog","activeForm":"Filing new SSL bugs"},

  // ===== Step 3 — HIST root-map catalog (e2e nav2, LR-040 closure for SSL parents) =====
  {"content":"[manual](fresh tab for state isolation) HIST-read tab: open Location Management → History tab on e2e nav2; confirm 87-col table per SUBPLAN_HISTORY_01_MCP_FINDINGS. Halt-gate: if LM History does NOT render for Office 1604, HALT-and-ask user.","activeForm":"Opening LM History in HIST-read tab"},
  {"content":"LR-036(boolean encoding per table) [manual] HIST cycle 1: SSL tab toggle self SI → save → HIST-read tab reload → diff cols 59-61","activeForm":"HIST cycle 1: SI toggle"},
  {"content":"[manual] HIST cycle 2: SSL tab add non-self row → save → HIST-read tab reload → diff cols 59-61","activeForm":"HIST cycle 2: row add"},
  {"content":"[manual] HIST cycle 3: SSL tab delete added row → save → HIST-read tab reload → diff cols 59-61","activeForm":"HIST cycle 3: row delete"},
  {"content":"LR-040(closure-gate (a) directly MCP-proven) [manual] Write clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md — parent→col map + state-space matrix + bidirectional proof cites","activeForm":"Writing HIST catalog"},
  {"content":"LR-024(restore state) [manual] Restore office 1604 SSL state — delete added rows, reset SI, save; verify net-zero data delta","activeForm":"Restoring office state"},

  // ===== Phase 4 — full gap analysis (no cap) =====
  {"content":"[/skill:wrap] /audit (review mode) [manual] Diff full nav2 walk-evidence behavior list vs all 24 existing TCs. Source of gaps = fresh nav2 walk (NOT plan text, NOT HUNTER artifact, NOT GIVER's G01-G12 list).","activeForm":"Running full gap analysis"},
  {"content":"[manual](anti-checklist) Cross-check fresh-walk gaps against HUNTER's GIVER G01-G12 + D6-01..03 — confirm fresh walk found at least all 14; flag any additional gaps fresh walk found that HUNTER missed","activeForm":"Cross-checking vs HUNTER gap list"},
  {"content":"[manual] List ALL missing TCs with one-line rationale + walk-evidence probe ID per TC. NO CAP — discovered count is the count.","activeForm":"Enumerating all missing TCs"},
  {"content":"LR-046(strict context-budget) [manual] If missing TC count > 30, HALT-and-ask user (multi-session split decision); do NOT unilaterally rescope or defer","activeForm":"Strict-line scope check"},

  // ===== Phase 5 — write tests + code quality + POM audit =====
  {"content":"[/skill:wrap] /regression-guard pre-snapshot before any spec/PO edit","activeForm":"Taking pre-edit snapshot"},
  {"content":"[manual] Write EVERY missing TC in location-shared-setup-locations.spec.ts — each cites walk-evidence probe ID from Section A","activeForm":"Writing all missing TCs"},
  {"content":"[/skill:direct] /simplify scan on all existing 24 + new TCs — tautology removal, private-access, boolean-collapse","activeForm":"Running /simplify"},
  {"content":"[/skill:verify] /slop binary DROP/KEEP audit on new TCs","activeForm":"Running /slop"},
  {"content":"[manual] POM violation grep — `grep -nE 'authenticatedSession\\.page\\.(locator|getByTestId|getByRole)' clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts` — any hit → add PO method, replace inline","activeForm":"Auditing POM violations"},
  {"content":"[manual] Page object honesty audit — new methods follow raw-vs-persistent naming","activeForm":"Auditing PO naming"},

  // ===== Phase 6 — UNLOCK ALL 6 FIXME'd TCs (STRICT — LR-046 line) =====
  {"content":"[/skill:direct] /rca on TC-LOC-SSL-016 — discardAndReturn serial-state defect; classify test defect vs app bug","activeForm":"RCA TC-016"},
  {"content":"[manual] TC-016 fix: if test defect → fix test; if app bug → file BUG, unfixme with annotation citing bug","activeForm":"Fixing TC-016"},
  {"content":"[manual] TC-018 unfixme: if BUG-001 verdict=FALSE-RESOLVED in Phase 2.5, unfixme + run; if CONFIRMED, file as APP BUG-blocked with annotation","activeForm":"Unlocking TC-018"},
  {"content":"[manual] TC-019 unfixme: same protocol as TC-018","activeForm":"Unlocking TC-019"},
  {"content":"[manual] TC-020 unfixme: same protocol","activeForm":"Unlocking TC-020"},
  {"content":"[manual] TC-021 unfixme: same protocol","activeForm":"Unlocking TC-021"},
  {"content":"[manual] TC-024 unfixme: same protocol","activeForm":"Unlocking TC-024"},
  {"content":"LR-046(strict-line gate) [manual] CHECKPOINT: all 6 fixme'd TCs unlocked? If yes → continue. If no → HALT-and-ask user; do NOT close plan with rescope","activeForm":"Strict-line unlock checkpoint"},

  // ===== Phase 7 — run tests x2 =====
  {"content":"LR-024(clean before run) [manual] Clean test-results/ + reports/, then run: npx playwright test location-shared-setup-locations.spec.ts --retries=0","activeForm":"Running test suite (run 1)"},
  {"content":"[/skill:verify] /bugfix on failures — max 2 cycles per TC; broken-after-2 → test.fixme('OBSTACLE: ...') + LR-046 HALT-and-ask if strict-line fixme'd TC fails","activeForm":"Fixing failures"},
  {"content":"LR-024(flake detection) [manual] Run 2 identical command — zero flakes required","activeForm":"Running test suite (run 2)"},
  {"content":"[manual] HIST migration grep-verify — `find clients/encore/tests/specs -name '*hist-*.spec.ts'` expect 0; `find ... -name '*-history.spec.ts'` expect 2","activeForm":"HIST migration grep"},

  // ===== Phase 8 — adjacent-sweep + REQUIREMENTS correction (LR-030 + LR-050 ceremony 4) =====
  {"content":"[ceremony] [/skill:wrap] /audit adjacent-sweep — DO-NOW / SPAWN / APPEND per SP00 Fix 1","activeForm":"Adjacent-sweep"},
  {"content":"LR-030(contradiction = bug) [manual] For every nav2 finding that contradicts REQUIREMENTS.md: file as BUG-DOC-NNN.json (not silent doc update); list in plan body","activeForm":"Filing doc-contradiction bugs"},
  {"content":"[manual] Update navigation.md §C row for Shared Setup — Last updated 2026-05-15; add nav2-first walk pattern + fresh-tab + HIST catalog pattern if novel","activeForm":"Updating navigation.md"},

  // ===== Phase 9 — closure (LR-050 ceremonies 5-7) =====
  {"content":"[manual] Update TC-MD count header (24 → final) + append new TC rows; re-export CSV with Tags column","activeForm":"Updating TC-MD + CSV"},
  {"content":"[manual] Update MODULE_REGISTRY.md row for Shared Setup — pass count + last-updated","activeForm":"Updating MODULE_REGISTRY"},
  {"content":"[ceremony] LR-028(activity-log) Append agent-activity-log.md row with all touched files","activeForm":"Activity-log row"},
  {"content":"[ceremony] LR-027(execution summary) Write Execution Summary in plan body — TCs implemented (count + IDs), all 6 fixme'd unlock outcomes, MCP findings (nav2 walk + nav2 HIST), bugs filed/closed/minimized, deviation log, hours-actual","activeForm":"Writing Execution Summary"},
  {"content":"[ceremony] LR-027(parent cascade) git mv plan to plans/done/; `npm run plans:reindex`; grep for sibling subplans under PLAN_DQU_V6; if none pending, close parent too","activeForm":"Moving plan + cascade"},
  {"content":"[/skill:wrap] /regression-guard post-snapshot — diff vs pre; flag silent breakage","activeForm":"Post-edit snapshot"},
  {"content":"[ceremony] [/skill:wrap] /reflect — capture mistakes (especially HUNTER-trust failure mode); graduate if 3+ recurrences","activeForm":"Running /reflect"},
  {"content":"[ceremony] [/skill:wrap] /final-q v2 evidence-emission — reconstruct todos, tag each done/partial/skipped, gate at 400k/500k","activeForm":"Running /final-q"}
]
```

**Tag coverage**: every entry above carries at least one tag from the LR-050 closed taxonomy (`[/skill:matchtype]` | `LR-NNN(reason)` | `[manual](reason)` | `[ceremony]`). All 7 LR-050 ceremony obligations covered. Count claim removed to prevent drift (auditor flagged v3's off-by-one — easier to audit by greppable tag presence than an aggregate number).

---

## Execution Steps — HISTORICAL REFERENCE (v5.1 SHELLIFY — subplans own execution; SP-A owns Steps 1/2A/2B/2.5/2.6 · SP-B owns Step 3 · SP-C owns Steps 4/5 · SP-D owns Steps 6/7 · SP-E owns Steps 8/9)

<!-- [CHANGE 2026-05-15 — v5.1 SHELLIFY: section retained for audit trail only. The 9 narrative steps below were authored when this plan was a single-session execution. After v5.1 chunking, each step is now owned by one of SP-A..E (mapping in section header above; full subplan ownership map in ORCHESTRATION-SHELL NOTICE at top of file). Direct execution from this file is FORBIDDEN per the NOTICE — agents execute the matching subplan's own Phase 0 → Acceptance Criteria. Reading the narrative below is fine for understanding what each subplan does; copy-pasting steps as todos is NOT (each subplan emits its own todos). ] -->

### Step 0 — Bootstrap + ceremony gate (Phases 0 / 0.1 / 0.5)

Load context files. Confirm OWNER. Run `/relevant`. Verify referenced files exist on disk per LR-020. **HALT condition (LR-046)**: if any cited rule has been superseded, stop and ask.

### Step 0.6 — Explicit invalidation acknowledgment

Read the **Invalidated Artifacts** table aloud (in narrative). Confirm in chat: "HUNTER 2026-05-12 baseline, GIVER field-inventory, HUNTER intake, SHR-DIV-001..006, G01-G12+D6-01..03 are NOT inherited. They are read-only orientation context."

### Step 1 — NAV2 FRESH WALK (BASELINE TRUTH)

> [CHANGE 2026-05-15 — RESHAPE: v5 splits this step into THREE sub-steps. Apply the v5 form below; the v4 narrative + probe-list immediately following this marker is preserved for context only — do NOT execute as written.]
>
> **v5 Step 1 — TC INVENTORY (encoded-truth pass; one grep + one read; HUNTER)** <!-- [CHANGE 2026-05-15 — v5.1 CLOSURE-1: COVERED criterion tightened; skip-Step-2A halt-gate removed] -->:
> Read all 24 TCs in `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md`. For each capture: id, title, fixme?, surface-areas-touched. Build a 12-axis surface-area coverage map (columns / self-row / add-flow / delete-flow / save-flow / non-self-row / dialog-search / dialog-select / persistence / cross-field / edges / history). Output: `clients/encore/specs_planning/_internal/tc-coverage-map-shared-setup-2026-05-15.md` with TC × surface matrix.
>
> **v5.1 COVERED criterion (replaces v5's "≥3 TCs encoding ≥3 cases")**: a probe is COVERED if and only if (a) ≥3 distinct TCs touch it, (b) each cited TC's spec line is quoted verbatim in the coverage map with `file:line + expect(...) assertion text`, (c) the assertion targets that surface's specific DOM signature (incidental touches don't count — must be an explicit Playwright `expect(...)`/`toHaveCount`/`toBeVisible`/`toHaveValue`/etc. against the surface). Probes failing any of (a)/(b)/(c) are UNCOVERED.
>
> **v5 Step 2A — NAV2 GAP WALK (HUNTER + Playwright CLI per LR-038 v2)** <!-- [CHANGE 2026-05-15 — v5.1 CLOSURE-1: COVERED probes also get 60-sec smoke-pass in Section A.1] -->:
> Walk nav2 LIVE. Two passes:
> 1. **Section A — UNCOVERED probes (deep walk)**: full probe per probe; emit Section A entries with the 11-field gap-evidence schema from v5.1 CLOSURE-3 (see Step 4).
> 2. **Section A.1 — COVERED-SMOKE-PASS (mandatory)**: 60 seconds per COVERED probe — load surface, screenshot, verify the asserted DOM signature still exists, record `{probe-id, timestamp, dom-screenshot-path, selector-hit, surface-exists: yes|no|divergent}`. Any `no` or `divergent` → flag as `covered-probe-divergence` and HALT-and-ask user (per LR-046 — could mean spec assertion is now wrong).
>
> **v5.1 — UNCOVERED-count = 0 is NOT a skip path**: even if all 12 probes are COVERED, Step 2A still runs as Section A.1 smoke-pass + adjacency walk. The v5 skip-Step-2A halt-gate is **DELETED**.
>
> **v5 Step 2B — NAV2 FIXME RE-VERIFICATION (HUNTER + Playwright CLI)** <!-- [CHANGE 2026-05-15 — v5.1 CLOSURE-4: isolated `--grep` framework-ruling-out gate FIRST + 4-artifact evidence per class — see Step 6 4-class table] -->:
> For each of the 6 fixme'd TCs (TC-016 / 018 / 019 / 020 / 021 / 024):
> 1. **FIRST — framework-ruling-out gate (mandatory v5.1 CLOSURE-4)**: run `npx playwright test clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts --grep "TC-LOC-SSL-XYZ" --retries=0` in absolute isolation. If isolated run PASSES, classification MUST be FAIL-FRAMEWORK regardless of any other evidence. Record isolated-run timestamp + verdict in walk-evidence Section B.<TC-id>.
> 2. **THEN** — default hypothesis "this TC works now"; execute verbatim Steps live on nav2 (Office 1604); probe adjacent behavior; classify outcome as PASS-LIVE / FAIL-FRAMEWORK / FAIL-APP / CHANGED-SYMPTOM **per the evidence requirements in Step 6 4-class table** (PASS-LIVE: x2 green isolated; FAIL-FRAMEWORK: isolated PASS + full-suite FAIL with leak signature; FAIL-APP: 4-artifact manual-CLI repro; CHANGED-SYMPTOM: spec-vs-live diff + assertion-update path).
> 3. Forbidden: assuming 2026-05-12 reason still applies; skipping a TC's probe; classifying FAIL-APP without the 4 evidence artifacts.
> Output: walk-evidence-2026-05-15.md **Section B: Fixme Re-Verification** (one row per of the 6 TCs).
>
> **The v4 narrative below (browser-tool announcement, launch command, auth flow, page-object disclaimer) STILL APPLIES for the nav2 walk portion of Step 2A.** Only the "12 probes regardless of coverage" probe-list discipline is RESHAPED to "UNCOVERED probes only".

**Browser tool announcement (LR-038 mandatory)**: first chat output:

> "Browser tool: Playwright CLI. Reason: nav2 baseline gap-walk + nav2 HIST catalog. Unattended."

**Launch command for Tab 1 (nav2)** — automation user, no MFA expected:

```bash
npx playwright open --load-storage=clients/encore/.auth/encore-state.json --save-storage=clients/encore/.auth/encore-state.json --save-trace=test-results/walk-trace-shared-setup-nav2-2026-05-15.zip https://navigator2.training.psav.com/#/setup/locationdetail/1604
```

**Auth (no MFA dance — automation user)**:
- Credentials in `clients/encore/config/environments/.env.e2e:42-43` — `s-prd-clickauto@psav.com` has no second-factor authentication per CLAUDE.md provisioning checklist.
- If launch above lands on the app → continue probes.
- If redirected to `login.microsoftonline.com` → state stale. Run one-shot Node refresh script: import `clients/encore/src/pages/auth/login.page` + call `lp.loginWithMicrosoft(process.env.NAVIGATOR_USERNAME!, process.env.NAVIGATOR_PASSWORD!)` against `https://navigator2.training.psav.com/`; state auto-persists. Re-launch the command above.
- If a 2FA challenge appears at runtime → HALT, surface to user (provisioning regressed; CLAUDE.md provisioning checklist step 2 violated).
- Log `[BROWSER-SWITCH] reason=auth-state-stale-refresh artifact=clients/encore/.auth/encore-state.json` per LR-028 if refresh ran.

**Page object disclaimer (HIGH-risk auditor flag — FLAG-2)**:
- `location-shared-setup-locations.page.ts` is nav4-only — built on `data-testid` + Radix selectors that don't exist on nav2.
- Nav2 walk uses **raw Playwright CLI DOM queries only**: `name=`/`id=` per LR-ENC-001 §"Selector parity"; SlickGrid native checkboxes via `.editor-checkbox` + cell classes (`l0 r0` row/column positions) + column ids (`LocalOfficeId`, `LocalOfficeName`, `IsPrimaryOffice`, `IsSharesInventory`).
- Do NOT call any PO method on nav2. The PO becomes usable again in Step 2 (nav4).

**Nav2 probe checklist** (12 probes; see TodoWrite payload for full text). Each probe: SlickGrid uses name=/id= not testid; click cells to activate edit mode; record everything. No assumptions about what HUNTER found. Find what nav2 actually has.

**Walk-evidence artifact**: `clients/encore/specs_planning/_internal/walk-evidence-shared-setup-nav2-2026-05-15.md`. Format: 12 probes + edge cases + missed-dimensions; each row with timestamp + DOM evidence + name/id selector + network call captured.

**Walk→evidence gate (LR-046 strict)**: zero "NOT probed" / "skipped" / "assumed" items. Any unprobed item → STOP, go probe.

> **[v5 DELETE]** Step 1.5 (HUNTER retrospective diff) DROPPED — see CHANGE LOG #2. Step 0.6 verbal ack + Step 2A gap-walk cover orientation naturally.

> **[v5 DELETE]** Step 2 (nav4 fresh walk) DROPPED — see CHANGE LOG #1. nav4 truth = spec + page-object + selectors (code-truth). Step 7 spec run IS the nav4 verification.

### Step 2.5 — BUG-LOC-SHR-001 nav2 re-verification (LR-044)

> [CHANGE 2026-05-15 — RESHAPE: nav2-ONLY re-verification in v5. The nav4 evidence already lives in the spec as `test.fixme()` on TC-018/019/020/021/024 (= code-truth). Re-verifying nav4 in MCP is redundant. Re-verifying nav2 alone tells us if the FEATURE works at baseline → drives Step 6 unlock decisions for the 5 BUG-LOC-SHR-001-cascading TCs.
>
> **v5 protocol**: Navigate `https://navigator2.training.psav.com/#/setup/locationdetail/1604` → Shared Setup tab → Add → type 'Miami' in dialog search → read row count + visible text. Append `verificationLog` entry to `reports/bugs/BUG-LOC-SHR-001.json` with `{sessionDate: "2026-05-15", sessionTool: "Playwright CLI MCP", findings, baselineComparison, outcome: STILL-CONFIRMED | RESOLVED | CHANGED-SYMPTOM}`. **Do NOT inherit the 2026-05-12 verificationLog conclusion** — fresh evidence required per LR-044. See CHANGE LOG #5 + #11.]

Read `BUG-LOC-SHR-001.json` `stepsToReproduce` VERBATIM. Follow exactly on nav2:

1. On nav2 fresh tab: replicate filed steps → record Miami search count + network request + response payload.
2. Classify verdict per LR-044: `CONFIRMED` | `FALSE-RESOLVED` | `FALSE-ISOLATION` | `FALSE-HALLUCINATION` | `FALSE-MISREAD` | `FALSE-ENVIRONMENTAL` | `FALSE-STALE` | `ROLE-OFFICE-DEPENDENT`.
3. If CONFIRMED: minimize repro (drop setup steps one-by-one), update `stepsToReproduce` to minimal, preserve original in `stepsToReproduceOriginal`.
4. Append `verificationLog`: `{verifierAgent: OWNER, verifiedDate: 2026-05-15, verdict, minimalRepro, RCA_category, evidence: {nav2Count, networkStatus}}`. Update `status` field per verdict.

**This verdict drives Step 6 unlock decisions**.

### Step 2.6 — File new bugs for nav2-live-vs-spec-encoded mismatches

For every FAIL-APP (or CHANGED-SYMPTOM classified as APP) from Step 2A or Step 2B: file `reports/bugs/BUG-LOC-SHR-NNN.json` per LR-034 schema (id/title/stepsToReproduce/expected:spec-assertion/actual:nav2-live/severity/category/baselineComparison/minimalRepro per LR-044 + 2026-05-15 verificationLog).

### Step 3 — HIST root-map catalog (e2e nav2; HIST-read tab)

> [CHANGE 2026-05-15 — KEEP-CORRECT: "nav4-driven; Tab 3" framing is WRONG on both axes. LM History is architectural to the e2e environment; since nav2 IS the e2e UI per LR-ENC-001, HIST walks **nav2** in e2e (NOT nav4). Tab discipline (separate tab for HIST reading) still applies — call it "HIST-read Tab" not "Tab 3 on nav4". Output path UNCHANGED: `clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md`. Mirror 6-section structure of `hist-root-map-local-office.md`. See CHANGE LOG #7.]
>
> Halt-gate (v5 addition): if LM History does NOT render in e2e for Office 1604 → HALT-and-ask user.

Same as v2 plan but emphasize independence from prior artifacts. Output: `clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md`. LR-040 (a) closure: every SSL parent directly MCP-proven with cited save-cycle timestamps. Restore office state at end (LR-024).

### Step 4 — Full gap analysis (NO CAP)

> [CHANGE 2026-05-15 — RESHAPE: v5 ordering inverts the gap-discovery flow. The gap-finding happens at Step 2A (walk-evidence Section A) and Step 2B (fixme classifications) and Step 3 (HIST). Step 4 is now **consolidation**, not **discovery**.
>
> **v5 protocol** <!-- [CHANGE 2026-05-15 — v5.1 CLOSURE-3: 11-field gap evidence schema + Section A.Index; HALT-at-30 fires only when index is complete] -->:
> 1. Aggregate Step 2A Section A findings + Step 2B classifications + Step 3 HIST findings.
> 2. **v5.1 — Per-gap evidence schema (mandatory 11 fields)**: every Section A gap entry MUST carry `{id, probe, surface, timestamp, dom-snippet, network-capture-row, repro-steps, observed-live, why-gap, proposed-TC-title, proposed-TC-assertion}`. Missing any field → entry is **incomplete-evidence**, does NOT count toward gap totals, and MUST be re-walked at Step 2A before Step 4 closes.
> 3. **v5.1 — Section A.Index (mandatory)**: emit a one-screen index at the top of Section A listing every gap ID with file:line pointer to the gap entry. Used by /final-q + user audit.
> 4. Produce missing-TC list with `{id, title, surface-area, source-evidence-pointer}` per missing TC.
> 5. HALT-gates (do NOT silent-defer):
>    - **Missing TCs > 30 → HALT, ask user to scope-cut top-N or split into subplan — v5.1: HALT fires ONLY when Section A.Index is complete (every listed gap has all 11 fields). Inflated counts from incomplete-evidence entries do NOT trigger HALT.**
>    - Any "covered-probe-divergence" from Step 2A (Section A.1 smoke-pass `surface-exists != yes`) → HALT, ask user (rewrite TC / file bug / accept divergence).
>    - Any Step 2B CHANGED-SYMPTOM unclassified as FRAMEWORK or APP → HALT, ask user.
>
> "Source of gaps = nav2 walk findings + fixme re-verify + HIST findings; NOT plan text, NOT HUNTER artifact, NOT GIVER's G01-G12". TC count baseline is **24** (v5-audit reverted v5's wrong correction to 25; see v5 CHANGE LOG #10). See CHANGE LOG #8 + #10.]

Diff full nav2 walk findings vs 24 existing TCs. **Source of gaps = your fresh walk** (NOT plan text, NOT HUNTER artifact, NOT GIVER's G01-G12). Cross-check against G01-G12 + D6-01..03 as anti-checklist (confirm fresh walk found at least those 14; expect more).

List every missing TC with rationale + walk-evidence probe ID per TC. No cap.

**Strict-line check** <!-- [CHANGE 2026-05-15 — v5.1 CLOSURE-3: HALT requires complete 11-field evidence per gap] -->: if missing TC count > 30 AND Section A.Index is complete (all listed gaps have all 11 evidence fields), HALT-and-ask user before continuing to Phase 5 (multi-session split is the question). If gap count > 30 with incomplete evidence, the agent MUST re-walk to complete the evidence first — partial-evidence counts do NOT trigger HALT. Do not unilaterally rescope or defer.

### Step 5 — Write tests + code quality

Write every missing TC. Each cites walk-evidence probe ID (e.g., `// Traces to walk-evidence-shared-setup-nav2-2026-05-15.md PROBE-3 + nav4 PROBE-3`). Use existing PO methods; add new methods only if walk reveals existing API can't handle a pattern. `/simplify` + `/slop` + POM grep + raw-vs-persistent naming honesty audit.

### Step 6 — Unlock ALL 6 fixme'd TCs (STRICT LR-046 line)

> [CHANGE 2026-05-15 — RESHAPE: v5 replaces the per-TC table below with a **classification-driven 4-row table** keyed off Step 2B outcomes, plus an **explicit 6-loophole FORBIDDEN list**. Strict LR-046 line ("all 6 unlocked or HALT-ask") is PRESERVED — the change is in HOW unlocks are determined (live re-verify, not inherited fixme reason) and how the executor is fenced against skip-loopholes. See CHANGE LOG #9.
>
> **v5 Step 6 protocol** — for each of the 6 fixme'd TCs, take Step 2B classification → apply table:
>
> | Step 2B class | Step 6 action | v5.1 evidence (CLOSURE-4) |
> |---|---|---|
> | **PASS-LIVE** | Remove `test.fixme()` at the line. Run TC x2 cycles isolated. Both green → keep unlocked. Either red → reclassify, retry per row below. | Two green isolated `--grep` run timestamps recorded in Section B.<TC-id>. |
> | **FAIL-FRAMEWORK** | Diagnose framework issue (state leak / wrong selector / wrong waiter / stale data). Fix code. Run TC x2 cycles. Both green → unlock. Persistent fail after 2 cycles → HALT, escalate to user (do NOT re-fixme silently). | Isolated `--grep` PASSES + full-suite run FAILS (proves state leak); both timestamps recorded; framework-leak signature identified (state retention / race / selector flake / waiter / stale data). |
> | **FAIL-APP** | **v5.1 — independence test required before keeping fixme'd**: cannot rely on shared BUG-001 cascade. Run TC's failing scenario with an ALTERNATE search query per CLOSURE-2 below (not "Miami"). If alternate works → reclassify, this is not FAIL-APP. If alternate also fails → file Section C.<TC-id> with both probes + both network captures; keep `test.fixme()` line with INLINE comment citing `walk-evidence-shared-setup-2026-05-15.md:Section C.TC-XYZ:line N` + 2026-05-15 evidence path. HALT-and-ask user for the FAIL-APP batch as a group — do NOT unilaterally defer. | **Mandatory 4 artifacts in Section B.<TC-id>** (missing any = inadmissible, reclassify): (a) isolated-grep ruling-out gate run output (must show test STILL fails in isolation — if it passes isolated, classification = FAIL-FRAMEWORK), (b) screenshot of failure state on manual nav2 CLI session (no test runner), (c) console-message capture, (d) network request/response capture. Plus the Section C alternate-query evidence required by CLOSURE-2. |
> | **CHANGED-SYMPTOM** | **v5.1 — code-update path, NOT halt-and-defer**: (a) update the TC's assertion to match new behavior, (b) run TC x2 cycles isolated, (c) confirm both green, (d) record diff (old assertion vs new assertion + DOM evidence for new) in Section B.<TC-id>. HALT-and-ask user ONLY if the new behavior is itself broken — then re-classify as FAIL-APP with all 4 artifacts above. | Section B.<TC-id> entry shows: old-assertion text, new-assertion text, old DOM screenshot, new DOM screenshot, two green isolated `--grep` run timestamps after the assertion update. |
>
> **Maximize**: count of fixme'd TCs unlocked. Goal = as many of the 6 unlocked as evidence permits.
>
> **FORBIDDEN LOOPHOLES** (any of these = LR-046 violation; chain audit will catch):
> 1. ❌ "Just keep it fixme'd because it was fixme'd before" — every TC MUST be re-verified at Step 2B; classification drives Step 6.
> 2. ❌ Substituting `test.skip` / `test.only(otherTC)` / `if (condition) return` for `test.fixme` — same skip, different syntax; LR-046 doesn't care about the keyword.
> 3. ❌ Adding a new `test.fixme()` to a Step 5 newly-written TC because it's flaky — new TCs MUST pass x2 cycles or NOT be added.
> 4. ❌ Citing 2026-05-12 `verificationLog` as current evidence — must be 2026-05-15 fresh per LR-044.
> 5. ❌ Scope-cutting to a future subplan silently — HALT-and-ask user, no unilateral deferral.
> 6. ❌ Appending a new step or relaxing the strict-N criterion — see LR-046 + `feedback_strict_plan_lines_halt_not_rescope.md`.
> 7. ❌ **v5.1 CLOSURE-1**: Marking probes COVERED without file:line spec-line cite + 60-sec smoke-pass evidence in Section A.1 COVERED-SMOKE-PASS. UNCOVERED-count = 0 is NOT a skip-Step-2A path — Section A.1 still runs.
> 8. ❌ **v5.1 CLOSURE-2**: Citing BUG-LOC-SHR-001 as blocker for 2+ TCs without per-TC alternate-search-query repro at Section C.<TC-id>. Each cascaded TC must independently prove BUG-001 is its blocker (Miami probe + alternate probe + both network captures).
> 9. ❌ **v5.1 CLOSURE-3**: Inflating gap count beyond agent's complete-11-field-evidence count to trigger HALT-at-30. Incomplete-evidence gaps don't count toward 30 and MUST be re-walked.
> 10. ❌ **v5.1 CLOSURE-4**: Classifying FAIL-APP without (a) isolated-`--grep` ruling-out gate PASSED AS STILL-FAILING + (b) Section B.<TC-id> 4-artifact manual-CLI evidence. HALTing on CHANGED-SYMPTOM instead of code-updating the assertion. The isolated-grep gate is structural: if isolated PASSES, classification is FAIL-FRAMEWORK regardless of any other evidence.
>
> The v4 per-TC table below (TC-016 / 018 / 019 / 020 / 021 / 024 with same protocol) is preserved as context — v5 replaces "blocked by BUG-001" assumptions with live Step 2B classification. TC-016 likely-RCA hint (discardAndReturn) + TC-010 assertion-weakness note still apply as auditor hints during Step 2B FAIL-FRAMEWORK diagnosis.]

**Strict line**: "all 6 fixme'd TCs UNLOCKED — zero exceptions". Process per TC:

| TC | Defect class | v5.1 Process (CLOSURE-2: per-TC alternate-search-query independence test) |
|---|---|---|
| TC-LOC-SSL-016 | discardAndReturn serial state | `/rca` → fix test (if test defect) OR file BUG + unfixme with annotation (if app bug). v5.1 CLOSURE-4: framework-ruling-out gate first (isolated `--grep`). |
| TC-LOC-SSL-018 | candidate BUG-001 cascade | **Run TC with alternate query "Chicago"** (NOT Miami). If alternate returns results → TC NOT BUG-001-blocked → unfixme + run x2 + confirm pass. If alternate also fails → file `walk-evidence-shared-setup-2026-05-15.md:Section C.TC-LOC-SSL-018` with Miami probe + Chicago probe + both network captures; only THEN can TC be annotated as BUG-blocked; annotation must cite `Section C.TC-LOC-SSL-018:line N`. |
| TC-LOC-SSL-019 | candidate BUG-001 cascade | **Alternate query "Boston"**. Same protocol as TC-018. |
| TC-LOC-SSL-020 | candidate BUG-001 cascade | **Alternate query "Dallas"**. Same protocol as TC-018. |
| TC-LOC-SSL-021 | candidate BUG-001 cascade | **Alternate query "Denver"**. Same protocol as TC-018. |
| TC-LOC-SSL-024 | candidate BUG-001 cascade | **Alternate query "Atlanta"**. Same protocol as TC-018. |

**v5.1 anti-cascade rule (CLOSURE-2)**: at most ONE TC may end Step 6 citing BUG-LOC-SHR-001 as its sole blocker without per-TC Section C evidence. If 2+ TCs claim BUG-001-blocked, every cascading TC MUST have its own Section C entry; absent that, the TCs MUST be unfixme'd and run.

**TC-016 likely-RCA (auditor hint — verify live, do NOT blind-fix)**:
- TC-013/014/015 form a serial coupling: TC-014 depends on TC-013's unsaved added row at row index 2; TC-015 depends on the same; TC-015 cleanup calls `discardAndReturn(OFFICE_NO)`.
- `discardAndReturn()` navigates to `/home` and back to SSL tab — but Angular SPA retains stale component state. The `beforeEach` (spec line 14-19) only checks URL, not sub-tab clean state.
- Most likely fix: replace `discardAndReturn()` cleanup in TC-015 with `reloadAndNavigateToSSLTab()` (full reload) OR strengthen `beforeEach` to force reload before every test.
- **Mandate**: verify the hypothesis on live DOM during `/rca`. Don't commit a fix from the hint alone.

**TC-010 assertion-weakness note (auditor code-level finding)**:
- spec line 116-117 uses `toBeLessThan(ADD_LOCATION.searchByNameMaxResults)` where `searchByNameMaxResults = 100`. If Miami returns 0 results (BUG-001 still open), this passes trivially (0 < 100).
- Tighten after BUG-001 verdict: combine `toBeGreaterThan(0)` AND `toBeLessThan(100)`. If verdict CONFIRMED (still 0), annotate TC-010 with the bug-block context instead of tightening (no assertion change).

**Strict-line gate**: at end of Phase 6, all 6 must be in a non-fixme'd state OR annotated as legitimate APP BUG-blocked with fresh verificationLog citation. If any cannot reach that state, **HALT and ask user** (LR-046 — do NOT close plan with rescope; do NOT use APPEND/SPAWN as escape hatch).

### Step 7 — Run tests x2 + flake check + HIST migration grep

Run 1: `npx playwright test clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts --retries=0`. Failures → `/bugfix` (max 2 cycles per TC). Past 2 → `test.fixme('OBSTACLE: <reason>')` — but if the failing TC is one of the strict-line 6, HALT-and-ask instead of fixme'ing.

Run 2: identical command. Any flake = HALT investigate.

HIST migration grep:
```
find clients/encore/tests/specs -name "*hist-*.spec.ts" → expect 0
find clients/encore/tests/specs -name "*-history.spec.ts" → expect 2
```

### Step 8 — Adjacent-sweep + REQUIREMENTS contradiction protocol

`/audit` adjacent-sweep per SP00 Fix 1.

**LR-030 contradiction protocol**: for every nav2 finding that contradicts REQUIREMENTS.md, file `BUG-DOC-NNN.json` — NOT a silent doc update. List in Execution Summary.

Update `navigation.md` §C SSL row + add nav2-first walk pattern + fresh-tab + HIST catalog pattern if novel.

### Step 9 — Closure (LR-050 ceremonies 5-7)

1. TC-MD count header (24 → final) + new TC rows; CSV re-export with Tags column.
2. MODULE_REGISTRY.md SSL row update.
3. Activity-log row per LR-028.
4. Execution Summary in plan body per LR-027 (TCs implemented, all 6 unlock outcomes, MCP findings (nav2 walk + nav2 HIST), bugs filed/closed/minimized, deviation log, hours-actual).
5. `git mv plan → plans/done/`; `npm run plans:reindex`.
6. Parent cascade per LR-027.
7. `/regression-guard` post-snapshot.
8. `/reflect`.
9. `/final-q` v2 evidence-emission.

---

## Deviation Log (pre-allocated — populate during execution)

Format:
```
[YYYY-MM-DDThh:mm] DEVIATION: <plan-line-affected> | REASON: <why> | IMPACT: <what changes>
```

(Empty at author time. Strict LR-046 lines may NOT be rescoped via this log — they trigger HALT-and-ask.)

---

## Context Budget Checkpoints (honest re-estimate)

This is bigger than Notes pilot (one site walk + 27 TCs → 32). SSL = ONE nav2 gap-walk + 24 TCs → unknown final count + 6 strict unlocks + nav2-only bug verify + HIST catalog.

- **Soft**: 200k tokens — pause + audit progress + decide if multi-session split is needed
- **Hard**: 290k tokens — HALT mid-step; emit handoff in chat; ask user to resume

**Honest estimate**: 4-7 hours single session if everything goes well; multi-session if nav2 walk surfaces 30+ missing TCs (HALT-and-ask gate in Phase 4).

---

## Acceptance Criteria

### Walk discipline (strict)

> [CHANGE 2026-05-15 — RESHAPE: v5 walk-discipline acceptance criteria. v4 rows preserved below for traceability; v5 rows take precedence.]

- [ ] **v5** Browser-tool announcement in first output (LR-038) <!-- unchanged from v4 -->
- [ ] **v5** Network tracing enabled from t=0 (LR-033) <!-- unchanged from v4 -->
- [ ] **v5** TC coverage map produced at `clients/encore/specs_planning/_internal/tc-coverage-map-shared-setup-2026-05-15.md` (TC × surface matrix, COVERED + UNCOVERED probe lists)
- [ ] **v5** Nav2 gap-walk evidence at `clients/encore/specs_planning/_internal/walk-evidence-shared-setup-2026-05-15.md` Section A (UNCOVERED probes only; zero entries for COVERED probes unless flagged "covered-probe-divergence")
- [ ] **v5** Fixme re-verification at walk-evidence-2026-05-15.md Section B (all 6 fixme'd TCs classified PASS-LIVE / FAIL-FRAMEWORK / FAIL-APP / CHANGED-SYMPTOM)
- [ ] **v5** No Step 1.5 HUNTER retrospective-diff artifact (DROPPED per CHANGE LOG #2) — Step 0.6 verbal ack satisfies orientation requirement

> v4 rows kept for traceability (mark N/A in v5 execution):
- [ ] ~~Nav2 fresh walk completed FIRST with `walk-evidence-shared-setup-nav2-2026-05-15.md` (12 probes regardless of coverage)~~ — RESHAPED to UNCOVERED-only in v5
- [ ] ~~HUNTER 2026-05-12 baseline retrospective diff written into nav2 walk-evidence~~ — DROPPED in v5
- [ ] ~~Nav4 fresh walk completed AFTER nav2 with `walk-evidence-shared-setup-nav4-2026-05-15.md`~~ — DROPPED in v5
- [ ] ~~Every nav4 probe classified against nav2~~ — DROPPED in v5

### Bugs

> [CHANGE 2026-05-15 — RESHAPE: drop dual-site framing in BUG-001 row + drop "REGRESSION from Phase 2" framing.]

- [ ] **v5** BUG-LOC-SHR-001 re-verified per LR-044 on nav2 ONLY (nav4 truth = spec test.fixme) with 2026-05-15 sessionDate
- [ ] **v5** BUG-001 verificationLog appended with `{sessionDate: "2026-05-15", sessionTool, findings, baselineComparison, outcome}` — do NOT inherit 2026-05-12 verdict
- [ ] **v5** Every FAIL-APP (or CHANGED-SYMPTOM-as-APP) from Step 2A or Step 2B filed as new BUG-LOC-SHR-NNN with LR-034 schema + minimal repro per LR-044 + 2026-05-15 verificationLog
- [ ] LR-030: every nav2 finding contradicting REQUIREMENTS.md filed as BUG-DOC-NNN (no silent doc updates) <!-- unchanged from v4 -->

> v4 rows kept for traceability:
- [ ] ~~BUG-LOC-SHR-001 re-verified per LR-044 on BOTH nav2 AND nav4 fresh~~ — RESHAPED to nav2-only in v5
- [ ] ~~Every REGRESSION class from Phase 2 filed as new BUG-LOC-SHR-NNN~~ — RESHAPED; "Phase 2" = nav4-walk-derived in v4, dropped in v5

### HIST
- [ ] `catalogs/hist-root-map-location-management-shared-setup.md` written with 3 save-cycle proofs + boolean encoding per LR-036
- [ ] LR-040 (a) closure: every SSL parent directly MCP-proven with timestamps
- [ ] Office 1604 SSL net-zero data delta confirmed (LR-024)

### Coverage (strict LR-046 lines)

> [CHANGE 2026-05-15 — RESHAPE: v5 adds explicit "all 6 fixme'd re-verified live + classified" line + "no skip-loopholes" line per CHANGE LOG #9.]

- [ ] ⚠ **v5** EVERY UNCOVERED-surface gap from Step 2A has a NEW TC at Step 5 (no skipped gaps); EVERY existing TC's surface either remains COVERED or is reclassified per Step 1 coverage map
- [ ] ⚠ NO cap on new TC count (discovered count is the count) <!-- unchanged from v4 -->
- [ ] ⚠ **v5** ALL 6 fixme'd TCs RE-VERIFIED LIVE on nav2 at Step 2B with classification recorded (PASS-LIVE / FAIL-FRAMEWORK / FAIL-APP / CHANGED-SYMPTOM)
- [ ] ⚠ ALL 6 fixme'd TCs UNLOCKED per Step 6 protocol: PASS-LIVE → unfixme'd + passing x2; FAIL-FRAMEWORK → code-fixed + passing x2; FAIL-APP → blocked with 2026-05-15 evidence in bug verificationLog + inline TC comment + user-acknowledged HALT-batch; CHANGED-SYMPTOM → Step 4 halt-and-ask resolved. If ANY can't reach a v5-acceptable state, plan HALTs at Step 6 strict-line gate.
- [ ] ⚠ **v5** NO `test.skip` introduced as fixme workaround (FORBIDDEN-LOOPHOLE #2); NO new `test.fixme()` on Step 5 newly-written TCs (FORBIDDEN-LOOPHOLE #3); NO citation of 2026-05-12 verificationLog as current evidence (FORBIDDEN-LOOPHOLE #4)
- [ ] ⚠ **v5.1 CLOSURE-1** Zero probes COVERED without (a) ≥3 distinct TCs (b) each cited TC's spec file:line + `expect(...)` assertion text quoted verbatim in `tc-coverage-map-shared-setup-2026-05-15.md` (c) 60-sec smoke-pass evidence in `walk-evidence-shared-setup-2026-05-15.md` Section A.1 COVERED-SMOKE-PASS. UNCOVERED-count = 0 is NOT a skip-Step-2A path.
- [ ] ⚠ **v5.1 CLOSURE-2** No more than ONE TC cites BUG-LOC-SHR-001 as its sole blocker without per-TC alternate-search-query repro at Section C.<TC-id>. Cascade TCs (TC-018/019/020/021/024) probed with Chicago/Boston/Dallas/Denver/Atlanta respectively; alternate-result → unfixme; alternate-fail → Section C evidence + annotation.
- [ ] ⚠ **v5.1 CLOSURE-3** Every Section A gap has 11-field evidence schema `{id, probe, surface, timestamp, dom-snippet, network-capture-row, repro-steps, observed-live, why-gap, proposed-TC-title, proposed-TC-assertion}`. Section A.Index lists every gap ID with file:line pointer. HALT-at-30 fires only when index is complete.
- [ ] ⚠ **v5.1 CLOSURE-4** Zero FAIL-APP classifications without (a) isolated-`--grep` ruling-out gate PASSED as STILL-FAILING + (b) Section B.<TC-id> 4-artifact manual-CLI evidence (screenshot + console + network + DOM). Zero CHANGED-SYMPTOM classifications that result in HALT — CHANGED-SYMPTOM is a code-update path (assertion update + x2 isolated green).
- [ ] TC-MD header count matches actual (baseline = 24, post-Step-5 count = 24 + N) <!-- v5-audit: v4 was correct at 24; v5 wrongly "corrected" to 25; reverted; v5.1 audit-note #4 catches that the actual TC-MD file still reads `**Total**: 25` and must be reset to 24+N by SP-E -->

> v4 row kept for traceability:
- [ ] ~~EVERY nav2-observed behavior has a TC~~ — RESHAPED to v5 "UNCOVERED-surface gap" framing (existing-covered surface skipped)

### Code quality
- [ ] /simplify scan run on all existing + new TCs
- [ ] /slop binary DROP/KEEP run on new TCs
- [ ] POM violation grep clean (no `authenticatedSession.page.locator(` in spec)
- [ ] New PO methods follow raw-vs-persistent naming
- [ ] HIST migration grep-verify passes (0 old-naming, 2 new-naming)

### Tests
- [ ] Run 1 + Run 2 both pass; zero flakes
- [ ] Every `test.fixme()` has explicit `OBSTACLE: <reason>` cite + bug ID

### Ceremony (LR-050 — 7 obligations)
- [ ] Phase 0 context loaded
- [ ] Phase 0.1 identity OWNER confirmed
- [ ] Phase 0.5 /relevant scan run
- [ ] Phase 8 adjacent-sweep ritual
- [ ] Phase 9 plan finalization (Status DONE + Execution Summary + git mv + reindex + parent cascade)
- [ ] Activity-log row per LR-028
- [ ] /final-q v2 evidence-emission exit gate

### Updates
- [ ] TC-MD + CSV + MODULE_REGISTRY.md updated
- [ ] navigation.md §C SSL row updated (Last updated 2026-05-15) + nav2-first walk pattern noted if novel
- [ ] Execution Summary written in plan body per LR-027 (TCs implemented, 6-unlock outcomes table, MCP findings (nav2 walk + nav2 HIST), bugs filed/closed/minimized, deviation log, hours-actual)

---

## Pre-Execution Audit Notes (OWNER, 2026-05-15 — user-invoked `/audit urself`; restored after unauthorized revert)

<!-- [CHANGE 2026-05-15 — v5.1 RESTORE: audit notes recovered after executing-agent revert. Per per-bullet verification: 5/8 bullets carry non-redundant content (most importantly #4 catches a factual error in plan body — TC-MD file `**Total**: 25` vs spec's 24 `test(`). Bullet #2's hallucinated `npm run regression:snapshot` (grep confirmed: no such script in any package.json) replaced with `/regression-guard` skill invocation only. Bullets #3 and #5 are partially redundant with payload entries but kept as defense-in-depth — agents skip Phase 0 ceremonies often enough that the explicit "do this BEFORE Step 2.5" hint is load-bearing.] -->

> **Restored 2026-05-15 by OWNER after an executing agent removed this section without authorization.** Per per-bullet review: all 8 findings concern execution-time behavior modifications; none rescope strict LR-046 lines. Bullet #2's hallucinated `npm run regression:snapshot` corrected to `/regression-guard` skill invocation; rest are verbatim.

Findings to address during execution (not deferred):

- **CLI semantic**: BrowserTool=cli per plan launch command (around line 312) = `npx playwright open` / `chromium.launch()` Node scripts. **NOT** `.spec.ts` files via `npx playwright test`. (Caught: an initial diagnostic spec was authored and deleted.) Distinct from the Page-Object disclaimer — that says "don't import the PO on nav2"; this says "don't write a diagnostic spec to run a walk."

- **Real /regression-guard, not stat**: pre-snapshot must be a structural fingerprint (exports/imports/routes/function sigs), not file mtimes. Use the `[/skill:wrap] /regression-guard` skill invocation end-to-end. (v5.1 RESTORE note: the original audit bullet referenced `npm run regression:snapshot` — grep confirmed no such script exists in any `package.json`; that reference was hallucinated and has been removed here.)

- **Phase 0 agent-mistakes grep is mandatory**: `grep -niE "shared-setup|SSL|Miami|HUNTER" clients/encore/specs_planning/_internal/agent-mistakes.md` — do this before Step 2.5, not after. (TodoWrite payload schedules it in Phase 0; this audit note enforces timing relative to Step 2.5.)

- **TC-MD header discrepancy**: file `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md` currently reads `**Total**: 25`; spec has 24 `test(` calls. Step 9.1's "24 → final" calculation must use the actual current value (25 stale header → reset to 24+N). **This contradicts plan body's earlier claim "currently 'Total: 24'" — the file IS at 25, not 24. SP-E owns the fix.**

- **Plan's "no causal assumption" rule + TC-016 RCA hint**: hint is acknowledged advisory, **not** prescriptive. Verify TC-016 discardAndReturn hypothesis live before applying any fix.

- **Token-budget reality**: plan estimates 4–7h. If single-session burn exceeds soft-budget (200k), execution narrows to the LR-046 strict line (`unlock 6 fixme'd TCs`) and surfaces the rest for follow-up. No silent rescoping — explicit at hand-off if it fires.

- **Coverage map arithmetic**: initial `tc-coverage-map-shared-setup-2026-05-15.md` had 6 axis-count miscounts (IDs correct, counts off by 1–2). Counts re-derived on consumption; map content is load-bearing for ID lists, not aggregate counts.

- **Probes L (rapid click), N (table at max)** in coverage map: KEEP-TENTATIVE — may downgrade during Step 2A if no observable behavior delta.

The above are findings about THIS plan's execution surface, not authored-after-the-fact rationalizations. They modify execution behavior; they do not rescope the strict LR-046 line.

---

## Subplan Decomposition (v5.1 — chunked per user authorization 2026-05-15)

<!-- [CHANGE 2026-05-15 — v5.1 CHUNK: execution split into 5 SUBPLAN_DQU_V6_PILOT_SSL_* files per user authorization "u are free to chunk it and save as subplans to release load on one agent". Parent becomes orchestration shell + strict-line registry. Acceptance/Verification/Handoff above are aggregate roll-ups; detailed acceptance lives in each subplan. Parent closure fires via LR-027 parent-cascade clause when all 5 subplans are at Status: DONE.] -->

Parent plan is now an **orchestration shell**. All execution work occurs in 5 subplans, sequenced via `**Depends on**:` chain.

| # | Subplan ID | Scope (parent plan steps) | Depends on | Identity / Model / Thinking / BrowserTool | Strict lines (LR-046) | Est. |
|---|---|---|---|---|---|---|
| 1 | `SUBPLAN_DQU_V6_PILOT_SSL_A` | Phase 0 + Step 1 (TC inventory) + Step 2A (nav2 gap walk + COVERED-SMOKE-PASS) + Step 2B (fixme reverify w/ isolated-grep gate) + Step 2.5 (BUG-001 verify) + Step 2.6 (file new bugs) | none | OWNER / Opus / max / cli | Zero gaps without 11-field evidence; zero probes COVERED without verbatim assertion cite + smoke-pass; all 6 fixme'd TCs classified at Section B; BUG-001 verificationLog fresh 2026-05-15 | 1–2h |
| 2 | `SUBPLAN_DQU_V6_PILOT_SSL_B` | Step 3 (HIST root-map catalog on e2e nav2) | none | OWNER / Opus / xhi / cli | Every SSL parent directly MCP-proven w/ save-cycle timestamp (LR-040(a)); Office 1604 net-zero data delta (LR-024) | 1h |
| 3 | `SUBPLAN_DQU_V6_PILOT_SSL_C` | Step 4 (gap consolidation w/ 11-field schema) + Step 5 (write missing TCs) | SP-A | OWNER / Opus / xhi / none | Every UNCOVERED-surface gap → NEW TC at Step 5; no cap; HALT-at-30 only when index complete | 1–2h |
| 4 | `SUBPLAN_DQU_V6_PILOT_SSL_D` | Step 6 (unlock 6 fixme'd TCs w/ alternate-query independence) + Step 7 (run x2 + flake check + HIST migration grep) | SP-A + SP-C | OWNER / Opus / max / cli | All 6 fixme'd TCs in non-fixme'd state OR APP-bug-blocked w/ Section C evidence; ≤1 TC may cite BUG-001 sole-blocker without per-TC Section C; zero flakes | 1–2h |
| 5 | `SUBPLAN_DQU_V6_PILOT_SSL_E` | Step 8 (adjacent-sweep + LR-030 contradiction) + Step 9 (closure ceremonies: TC-MD/CSV/MODULE_REGISTRY/activity-log/Execution Summary/git mv/reindex/parent-cascade/reflect/final-q) | SP-D | OWNER / Sonnet / hi / none | TC-MD header reset to `**Total**: 24 + N` (per audit-note #4 fix); plan in `plans/done/` w/ Execution Summary; LR-028 activity-log row; LR-027 parent-cascade evaluated | 0.5h |

**Strict-line propagation**: every subplan's Acceptance Criteria embeds the parent strict lines that fall within its scope as `⚠ **PARENT-STRICT-LINE**` rows. Closure of any subplan with an unmet PARENT-STRICT-LINE = automatic RED against the parent (per LR-046). Chunking does NOT relax strict lines, it just distributes them across smaller execution units.

**Parent closure**: this plan flips DONE only when all 5 subplans are at `Status: DONE` (LR-027 parent-cascade clause). At that point the executing agent of SP-E (or the user, if they take over) writes the parent's Execution Summary as the roll-up of the 5 subplans' summaries.

---

## Verification (how to test end-to-end)

1. `npx playwright test clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts --retries=0` — all non-blocked TCs pass
2. Re-run identical — zero flakes
3. **v5** `grep -c "GAP-" clients/encore/specs_planning/_internal/walk-evidence-shared-setup-2026-05-15.md` → matches Step 1 UNCOVERED-probe count <!-- v4 said "≥12 PROBE" but v5 walks only UNCOVERED probes, count is < 12 -->
4. **v5** `grep -c "TC-LOC-SSL-" clients/encore/specs_planning/_internal/walk-evidence-shared-setup-2026-05-15.md` Section B → 6 (all fixme'd TCs classified) <!-- [CHANGE 2026-05-15 — DELETE-REPLACE: v4 line "grep PROBE in walk-evidence-shared-setup-nav4-...md ≥12" DROPPED — nav4 walk-evidence file no longer produced per CHANGE LOG #1; replaced with Step 2B classification count verification] -->
5. `head -50 clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md` shows parent→col map + state-space matrix
6. `jq '.verificationLog[-1]' reports/bugs/BUG-LOC-SHR-001.json` returns 2026-05-15 entry with verdict (path is REPO ROOT, not under clients/encore/)
7. `jq '.fixme | length' < (grep -o 'test.fixme' spec | wc -l)` — count fixme'd in spec; expect 0 OR all annotated with `OBSTACLE:` + bug ID for strict-line 6
8. `ls plans/done/PLAN_DQU_V6_PILOT_SHARED_SETUP.md` exists; `ls plans/pending/PLAN_DQU_V6_PILOT_SHARED_SETUP.md` does NOT exist
9. **v5.1 CLOSURE-1** `grep -c "COVERED-SMOKE-PASS" clients/encore/specs_planning/_internal/walk-evidence-shared-setup-2026-05-15.md` matches COVERED-probe count in `tc-coverage-map-shared-setup-2026-05-15.md`
10. **v5.1 CLOSURE-2** `grep -c "^### Section C\.TC-LOC-SSL-" clients/encore/specs_planning/_internal/walk-evidence-shared-setup-2026-05-15.md` → ≤1 (only ONE TC may end Step 6 citing BUG-001 as sole blocker without per-TC Section C evidence; if 2+ cascading TCs are claimed BUG-blocked, all MUST have their own Section C entries)
11. **v5.1 CLOSURE-3** For every gap in Section A: all 11 evidence fields present. Verify with: `grep -cE "^- id:|^  timestamp:|^  dom-snippet:|^  network-capture-row:|^  proposed-TC-assertion:" walk-evidence-shared-setup-2026-05-15.md` — counts of each field should match (one of each per gap)
12. **v5.1 CLOSURE-4** For every FAIL-APP entry in Section B: 4 artifact files referenced by path (screenshot/console/network/dom) + isolated-grep run timestamp present + STILL-FAILING verdict. CHANGED-SYMPTOM entries: old-assertion + new-assertion + 2 green isolated `--grep` timestamps after update

---

## Handoff (LR-039 — describe outcome, no obstacle claims)

**GREEN** (/final-q passes): plan flips DONE. With Notes pilot also DONE, PLAN_DQU_V6.md closes per parent acceptance. User decides which frozen modules to thaw next under v6.

**YELLOW** (some strict-line items unmet but rest green): NOT acceptable for this plan per LR-046 — strict lines do not yield to YELLOW. If a strict line cannot be met, the plan stays PENDING and the executing agent surfaces the specific blocker to user in chat (LR-039 — describe outcome, no obstacle claims; just facts).

**RED** (walk gate violated / flake / strict-line breach / ceremony skipped / HUNTER inheritance accidentally crept back in): HALT, do NOT flip Status, write blockers in CHAT (not plan body), surface to user with concrete file:line evidence.
