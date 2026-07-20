# SUBPLAN_CORP_PRICING_NM2268_LOC_SEARCH — Location Search picker narrowing + dependency-map artifact + RBAC access-gating

**Status**: DONE
**Executed**: 2026-07-18
**Priority**: P1
**Created**: 2026-07-17
**Identity**: BUILDER
**Depends on**: none (first of the six sprint tickets)
**Blocks**: SUBPLAN_CORP_PRICING_NM2269_OVERRIDE_FILTERS.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli

> Superseded-by-the-six: this plan, together with NM2269–NM2273, absorbs and replaces the remaining
> work tracked by `PLAN_CORP_PRICING_JIRA_DELIVERY.md` for the Override module. Each plan is a
> standalone sprint deliverable (one Jira ticket, one branch, something new).

---

## Context

NM-2268 covers the "Change Local Office" picker search-narrowing behavior on the Override page.
Existing TCs (OVR-029/030) cover picker navigation and Select-gating but do NOT assert the
search-narrowing effect (typing a partial office name/number and verifying the picker table narrows).
This plan adds that effect-assertion plus absorbs two cross-cutting concerns: (1) the module-wide
dependency-map artifact from SHADOW_INTEGRATION (the story-point meat — mapping every field/page
dependency in Corporate Pricing Override, plus bug filing per doctrine), and (2) the RBAC/NM-2126
access-gating edge family from SHADOW_EDGE (Revenue Management role gate — read-only vs edit).

**Walk-certified data beds**: office 1105 (9 Equipment / 2 Labor rows, walk-A 2026-07-17); picker
search confirmed live on 1105 ("Search by Location Name, Number" textbox).

**Gap provenance**: `.claude/state/ua-worker/chips/delegation-temp/out-override-rca/RCA-MATRIX.md`.

**Bug findings (live-confirmed 2026-07-17)**: NM-2011 — office 1604 dup-key 4543 HTTP 500 LIVE, wrongly closed "could not recreate" (evidence C). NM-1940 — export file fails re-import on empty-Override-Price row LIVE (evidence E). NM-2186 — import UI stuck "Uploading… 50%", applies in background LIVE (evidence E). Dialog Active checkbox — `activeOnly` param appears server-side ignored, BUG-CANDIDATE (evidence C Job 3).

---

## Bootstrap

**Identity**: BUILDER (primary); WATCHDOG for the dependency-map audit slice; GIVER conditional for
the dependency-map artifact authoring.

**Skills auto-called**:
- `/identity` (Step 1.5 gate, fires on subplan launch)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/final-q` (Phase 4 — mandatory exit per LR-042)

**Context files**:
- `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-A.md` + `-B.md`
- `.claude/state/ua-worker/chips/delegation-temp/out-override-rca/RCA-MATRIX.md`
- `.claude/rules/specs.md` (LR-019, LR-066, LR-067, LR-068)
- `.claude/rules/angular.md`
- `clients/encore/CLAUDE.md` (LR-ENC-002 FCC parity, LR-036)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`
- `docs/read_only_docs/LEARNED_RULES.md`

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. No predecessor plans (first of the six). Verify walk-evidence files A + B and RCA-MATRIX.md exist.
2. Read `.claude/context/navigation.md` — check Exploration Registry for Override surface.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter by BUILDER prefix.
4. Read `.claude/context/patterns.md` — match decision-tree patterns.
5. LR scan: LR-019 (per-test baseline), LR-066 (save-route parity), LR-067 (save honesty), LR-068
   (effect assertions), LR-ENC-002 (FCC parity), LR-036 (boolean render).
6. `BrowserTool=cli` — headless Playwright CLI for all live probes.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

Consumed from the 2026-07-17 walk fleet (walk-evidence-corporate-pricing-override-A.md + B.md).
`baselineScope: baseline-absent` — Corporate Pricing Override is net-new on e2e (no nav2 equivalent).
No separate re-walk required.

---

## Phase 1 — Picker search-narrowing TC (BUILDER)

1. Author NEW TC: type a partial office number into the "Search by Location Name, Number" textbox in
   the "Change Local Office" picker, assert the picker table narrows to matching rows, clear restores
   the full list. Data bed: any office that loads the picker (e.g. start on 1105, search for "1107").
2. Author NEW TC — **the picker dialog's own "Active" checkbox** (owner-flagged 2026-07-17; this is a
   DISTINCT control from the main-page "Active only" filter owned by NM-2269, and from the per-row
   Active cell owned by NM-2271 — do not conflate the three):
   - **Live-verified oracle (evidence C, `walk-evidence-corporate-pricing-override-2026-07-17-C.md`,
     Job 3, 2026-07-17)**: toggling the checkbox fires `POST /api/location/location-lookup` (200) on
     every toggle — the original assumption "no API call" is REFUTED. However, the returned location
     set is IDENTICAL regardless of checkbox state: 2,651 locations returned, all with `active:true`,
     `inactive-count:0`. The list shows NO visible change on toggle.
   - Assert: toggle Active checkbox → new `POST location-lookup` fires (network assert) → location
     list count remains **unchanged** (assert against the API response count, NOT DOM row count;
     the list is virtualized — only ~2 DOM rows are rendered at a time — so DOM-row counting is
     unreliable and must NOT be used as the assertion target per evidence C).
   - **BUG-CONFIRMED-B (upgraded from BUG-CANDIDATE 2026-07-17, evidence F,
     `walk-evidence-corporate-pricing-override-2026-07-17-F.md`)**: the "no inactive data exists"
     branch is ELIMINATED — office 1222 ("Hyatt Fairfax at Fair Lakes") is confirmed inactive via the
     app's own `GET /api/location/1222` (`active:false`), yet searching "1222" in the dialog returns
     "No results." in BOTH checkbox states (screenshots in raw-EA4), while positive-control "4107"
     appears. Root cause: the server returns the same 2,651 active-only set for `{activeOnly:true}`
     and `{activeOnly:false}` — the request fires correctly, the server ignores the flag. Reported to
     Encore 2026-07-17 (awaiting by-design-vs-fix answer). Do NOT assert "filters to active only".
     Mark the TC comment: "BUG-CONFIRMED-B — activeOnly ignored server-side (1222 evidence F);
     assert no-list-change per live evidence until Encore rules by-design or fixes; on fix, flip the
     oracle to: unchecked → inactive offices (1222-class) appear, checked → they hide."
   - Assert default state on open: checkbox is UNCHECKED (aria-checked=false, evidence C Job 3a).
   - Assert it composes with the search box (search "1107" + toggle Active → list stays consistent).
   - Assert Cancel discards any picker state change (no office applied to the grid).
   - Evidence: `walk-evidence-corporate-pricing-override-2026-07-17-C.md` (Job 3).
3. Spec implementation: extend the existing Override page object with a `searchLocalOffice(query)`
   method + a `toggleLocalOfficePickerActive()` helper + assertion helpers. LR-019 per-test baseline in
   `beforeEach`. LR-ENC-006 step labels.
4. MD + test-plan + XLSX parity in the same change (LR-ENC-002).

---

## Phase 2 — Dependency-map artifact (from SHADOW_INTEGRATION — WATCHDOG audit slice)

1. Build the master field roster for Override from the existing field-inventory
   (`corporate-pricing-override` dated 2026-06-08) — extract every enumerated field/control/column.
2. Seed the map from already-documented relations (from walk-evidence A+B): `Select a location` gates
   the whole grid; Equipment/Labor tab resets grid; Active-only filters rows; Currency narrows;
   Filter Product Groups client-side filter; Override Price/Max Discount %/Active editable cells;
   Export is tenant-wide; Import dialog controls.
3. Walk any remaining unclassified fields live (CLI) — assign `depends-on:[list]`,
   `independent-verified`, or `blocked-pending-question:<Q-ID>` per the SHADOW_INTEGRATION contract.
4. Emit `clients/encore/specs_planning/_internal/corporate-pricing-override-dependency-map-<date>.md`
   with completeness header (`fields mapped = N == inventory total`).
5. Bug doctrine: any suspicious behavior → `/encore-questions` clarification or file per LR-034/044.

---

## Phase 3 — RBAC/NM-2126 access-gating edge (from SHADOW_EDGE)

1. Author NEW TC(s): RBAC Revenue Management role gate — verify that a non-RM user (if testable with
   current credentials) sees read-only Override grid (no edit activation, no Save, no Import).
   If the automation user cannot switch roles, record as `blocked-pending-question: RBAC-role-switch`
   with the test case authored but `.skip`-annotated (LR-031 explicit gap, not silent skip).
2. Cross-ref NM-2126 (non-RM users wrongly retaining export/import) — prove live before filing.

---

## Phase 4 — PARKED: Office alignment (from PLAN_LEGACY_OFFICE_MIGRATION_AND_GAP_RETROFIT)

**PARKED** — do NOT execute until Rutvik explicitly green-lights. Migrate this ticket's tests to
designated offices {4104, 4107, 9220, 9311, 2463, 8843} when triggered. Note: 9311/2463 currently
have ZERO override data (walk-certified); 4104/4107/8843 are thin — data seeding is a prerequisite.
Provenance: Rutvik 2026-07-17 "put that as a separate plan not to be done right now."

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Adjacent fixes noticed during Phases 1–3 → DO-NOW (<30 min, same identity/file) or APPEND a
grep-verifiable line to a named pending recipient. Bare "out of scope" with no recipient = HALT + ask.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | test-cases MD + XLSX | clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md<br>clients/encore/test_cases_xlsx/encore_test_cases.xlsx | `npm run check:tc-parity` exit 0 |
| BUILDER | corporate-pricing-override.spec.ts + page object + selectors | clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts<br>clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts<br>clients/encore/src/selectors/corporate-pricing/override.ts | `npx playwright test --list` resolves new TC IDs; spec run green ×2 |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | dependency-map artifact | clients/encore/specs_planning/_internal/corporate-pricing-override-dependency-map-2026-07-18.md | `ls clients/encore/specs_planning/_internal/corporate-pricing-override-dependency-map-*.md` |
| GARDENER | (none) | (none) | (none) |

---

## Acceptance criteria

- [ ] Picker search-narrowing TC implemented + green: type partial query → rows narrow → clear restores
- [ ] Dependency-map artifact emitted with `fields mapped == inventory total` (strict equality)
- [ ] RBAC edge TC authored (runnable or `.skip`-annotated with explicit blocker per LR-031)
- [ ] MD + test-plan + XLSX parity in same change (LR-ENC-002); `npm run check:tc-parity` exit 0
- [ ] Per-test baseline per LR-019 on every new save-capable test
- [ ] Full override spec run green ×2
- [ ] `/regression-guard` snapshot before/after = no silent breakage
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042

---

## Verification

```bash
# 1. New TCs resolve
npx playwright test --list corporate-pricing-override   # expect: new TC IDs present

# 2. Dependency-map artifact exists
ls clients/encore/specs_planning/_internal/corporate-pricing-override-dependency-map-*.md

# 3. Parity clean
npm run check:tc-parity   # expect: exit 0
```

---

## Handoff (post-execution)

Chat-only summary per LR-039. Picker search-narrowing effect-TC + dependency-map artifact + RBAC edge
coverage for the Override module. NM2269 inherits as the next sprint ticket in the chain.

---

## Execution Summary

**Executed**: 2026-07-18

### Deliverables

| Deliverable | Status | Notes |
|---|---|---|
| TC-CPR-OVR-039 search-narrowing TC | DONE | Green ×2; typing a partial office number narrows picker rows; clearing restores the full list |
| TC-CPR-OVR-040 Active checkbox oracle | DONE — oracle MODIFIED | Original plan assumed toggle fires `POST location-lookup`; live evidence (evidence F, office 1222) refuted this — toggle is client-side, no POST fires on toggle. BUG-CONFIRMED-B: server returns identical 2,651-location set regardless of `activeOnly` flag |
| TC-CPR-OVR-041 RBAC TC | DONE (.skip) | Authored but `.skip`-annotated per LR-031; blocked: single automation account (NM-2126) |
| Page object picker methods | DONE | `clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts` extended with `searchLocalOffice`, `toggleLocalOfficePickerActive`, `{postFired, locationCount}` probes |
| Selector additions | DONE | `clients/encore/src/selectors/corporate-pricing/override.ts` — `ovrChangeLocationTrigger`, `ovrLocationPickerActiveCheckbox` added |
| Dependency-map artifact | DONE | `clients/encore/specs_planning/_internal/corporate-pricing-override-dependency-map-2026-07-18.md` — 27 fields == inventory total |
| MD parity | DONE | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md` — TC-039/040/041 added, header updated 38→41 |
| XLSX parity | DONE | `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` — 823 rows, 41 override TCs |

### Verification Evidence

- Spec run green ×2 (TC-039, TC-040 pass; TC-041 `.skip` RBAC-blocked per NM-2126)
- `npm run check:tc-parity` exit 0
- LR-058 ship-gate clean (`npm run check:step-labels` 0 errors)
- `tsc` 0 errors

### Deviations

- **TC-040 oracle correction**: the subplan's Phase 1, step 2 specification ("toggle Active checkbox → new POST location-lookup fires") was REFUTED by live evidence F (`walk-evidence-corporate-pricing-override-2026-07-17-F.md`, office 1222). Toggle is client-side only; no POST fires. The TC asserts no-list-change per the live oracle and carries a comment documenting the flip condition when Encore fixes the server-side `activeOnly` ignore bug (BUG-CONFIRMED-B).
