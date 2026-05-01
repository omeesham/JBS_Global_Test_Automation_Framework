# SUBPLAN: Neutral-Eye Audit — Local Information (Chrome Claude)

**Status**: DONE
**Executed**: 2026-04-27
**Priority**: P0-CYCLE-1
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-03 (LOS fixes landed — proves the loop)
**Blocks**: SP-DQU-05 (LI fixes)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_DQU_04_B2_LI_NEUTRAL_EYE_AUDIT.md`
**Identity**: WATCHDOG
**Skills auto-called**: /identity, /find-bugs, /research
**Model + thinking**: Opus + high
**Dependency gate**: SP-DQU-03 `Status: DONE`
**Context files** (read before Phase 0):
- `plans/pending/PLAN_DELIVERABLE_QUALITY_UPGRADE.md`
- `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` (cross-reference — LI has 8 known v1 gaps + 3 APP-bug candidates already catalogued; do NOT duplicate this existing work — extend it)
- `clients/encore/docs/REQUIREMENTS.md` (Local Information section + v1 extracted rules embedded in above plan)
- `clients/encore/specs_planning/_internal/neutral-eye-audits/_TEMPLATE.md`
- `reports/bugs/BUG-LI-001-*.json` if already filed (Oracle Product silent no-op)
- **DO NOT** read the LI TC MD until the diff step.
**Phase 0 directive**: announce browser tool (LR-038: Chrome Claude, auth-heavy, exploration). Then proceed.
**Handoff sequence**:
- Activity-log row on close.
- Hard gate per LR-040: if >5 new APP bugs surfaced, STOP and escalate to user before continuing to SP-05.
**HALT conditions**:
- Auth fails — ask user.
- >5 new APP bugs — HARD HALT, ask user before proceeding to fixes.
- Chrome Claude tools unavailable — fallback to Playwright MCP + re-announce.

---

## Purpose

Independently catalog Local Information tab on office 1604. Local Information has the highest known defect density (8 v1-requirement gaps + 3 existing APP-bug candidates). Expected output: authoritative findings doc with prioritized TC corrections + new bugs filed.

## Step-by-step (Chrome Claude session)

1. `navigate` to `/navigator/locations/1604/settings/location` (Local Information tab).
2. `read_page` — capture all tab names, heading, URL.
3. `javascript_tool` — enumerate every input/select/textarea/button on Local Information tab. Log name, id, data-testid, value, checked, disabled, label.
4. Record defaults per field.
5. **Priority fields** (from `PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` v1 extracted rules):
   - Oracle Product + SkipBilling conditional-required — confirm BUG-LI-001 still reproduces (clear Oracle Product → click Save → watch network → expect silent no-op).
   - BillingCycleID required validation + localBillingRan disable state.
   - EnableIDCBilling dependency on InternalCompany.
   - DisplayTax auto-set behavior with CompanyRemitTax / HRIRemitTax2.
   - EnableMultidayPricing checkbox default + round-trip.
   - ThresholdAmount dual-dependency (AllowDPCD OR !PromptForApproval).
   - C&C%, ETS%, Resort Tax% reset behaviors.
6. For each priority field: run the negative case (invalid input, cleared required, conflicting dependency). Capture save-state, toast, dialog, network requests verbatim.
7. Record all visible buttons, links, cascading menus. Click each non-destructive one once; record outcome.
8. Switch to any adjacent tabs touched by Local Information (BillingWay change, SkipBilling cascade). Confirm cascading behavior.
9. Write findings to `clients/encore/specs_planning/_internal/neutral-eye-audits/local-information-2026-04-22.md` per template.
10. **Only now** — open LI MD at `clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md` (confirm exact filename first).
11. Produce `## Diff vs our CSV` section with ranked fix list (high-impact first).
12. Produce `## Suspected APP bugs` — new candidates beyond BUG-LI-001.
13. LR-040 gate: if new-bug count ≤ 5, proceed to write handoff. If > 5, flag to user and halt.
14. Append activity-log row.

## Acceptance criteria

- [ ] Findings doc exists + all 11 template sections filled.
- [ ] BUG-LI-001 reproduction status documented (still open / resolved / changed).
- [ ] All 8 v1-gap items from `PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` cross-referenced with live-DOM observation.
- [ ] Network-request evidence attached to every "nothing happens" scenario.
- [ ] New APP-bug candidates ≤ 5 OR escalated to user.
- [ ] Activity-log row appended.

## Handoff to next subplan

Next: SP-DQU-05 (LI fixes + re-export + file bugs). Chat summary: findings file path, new-bug count, gap count, any LR-040 escalations.

---

## Execution Summary (2026-04-27)

**Executed by**: WATCHDOG (subplan-declared identity, no mid-session switches needed) under Claude in Chrome (LR-038 v2 row "MFA + Live RCA + auth-heavy → Chrome").

**14-step walk**:

- Steps 1-5 (navigate, read_page, enumerate, defaults, priority-field walk): **DONE** — see findings doc §Field inventory, §Default values.
- Step 6 (negative-case save with toast/dialog/network per priority field): **PARTIAL — 1 of 7 priority cases exercised end-to-end (Oracle Product clear, BUG-LI-001 repro). Remaining 6 INCONCLUSIVE due to backend 503 on Save POST + 504 on /api/core/* (env degradation throughout audit window 21:18-21:30 PT).**
- Step 7 (visible buttons/links/cascading menus, click + record): **DONE** — only one LI-panel button (`btn-effective-date`, disabled, click is no-op). Recorded in findings §Links + actions.
- Step 8 (adjacent tabs cascade): **INCONCLUSIVE — env-blocked**. Cascade verification depends on save success which the backend rejected. Handed off to SP-DQU-05 per LR-040 (b).
- Step 9 (findings doc): **DONE** — `clients/encore/specs_planning/_internal/neutral-eye-audits/local-information-2026-04-27.md` (12 sections incl. auditor caveat).
- Step 10 (open LI TC MD only after findings committed): **DONE** — confirmed filename `locations_local_information_test_cases.md` (1138 lines, 67 TCs).
- Step 11 (Diff vs our CSV ranked): **DONE** — 11 structural/header drift items + 5 individual TC defects (TC-002, 005, 007, 008, 008A) inline in findings doc §Diff. Per-line diff of remaining 62 TCs is SP-DQU-05's scope.
- Step 12 (Suspected APP bugs): **DONE** — 1 candidate (BUG-LI-002 — Service Charge children active when allow-service-charge=unchecked).
- Step 13 (LR-040 closure gate): **PASS** — 1 candidate + 1 BUG-LI-001 update + 1 a11y discussion-item = under 5-bug HALT threshold; no escalation.
- Step 14 (activity-log row): **DONE** at session close.

**Acceptance criteria**:

- [x] Findings doc exists with all 11 template sections filled (12 actually — added §Auditor caveat for env-blocked items, §v1 8-gap cross-reference, §Adjacent-tab cascade, §Open items, §Auditor self-criticism).
- [x] BUG-LI-001 reproduction status documented: primary symptom **still reproduces** on new site (Save enables on invalid form, no error feedback on click); aria-invalid='true' is now set on Oracle Product after clear (a11y partial fix observed since 2026-04-10 file date). BUG-LI-001 verificationLog appended with minimal repro per LR-044.
- [x] All 8 v1-gap items cross-referenced — 4 verified by DOM observation, 4 INCONCLUSIVE due to env. Findings §v1 8-gap items cross-reference.
- [x] Network-request evidence attached: Save→503, /api/core/*→504 (×9), console errors captured. Findings §Auditor caveat.
- [x] New APP-bug candidates ≤ 5: 1 candidate (BUG-LI-002 Service Charge) — under threshold; no escalation.
- [x] Activity-log row appended.

**Adjacent-Sweep (Phase 2.5)** — 3 DO-NOW items completed and grep-verified:

1. `reports/bugs/BUG-LI-001.json` — appended verificationLog entry (verifierAgent=WATCHDOG via SP-DQU-04, verdict=PRIMARY_SYMPTOM_STILL_REPRODUCES_PARTIAL_A11Y_FIX_OBSERVED, minimal-repro added per LR-044).
2. `plans/pending/SUBPLAN_DQU_05_C2_LI_FIXES_AND_REEXPORT.md` — fixed stale findings filename reference (`local-information-2026-04-22.md` → `local-information-2026-04-27.md`) + added BUG-LI-001 to context-files list.
3. Same SP-DQU-05 file — appended BUG-LI-002 candidate explicit line item to Step 3 (grep-verifiable per LR-040: `grep -F "BUG-LI-002 candidate" plans/pending/SUBPLAN_DQU_05_C2_LI_FIXES_AND_REEXPORT.md` returns the line).

**Files touched**:
- Created: `clients/encore/specs_planning/_internal/neutral-eye-audits/local-information-2026-04-27.md`
- Modified: `reports/bugs/BUG-LI-001.json`, `plans/pending/SUBPLAN_DQU_05_C2_LI_FIXES_AND_REEXPORT.md`, this file (status flip + Execution Summary).

**Browser tool log**: Claude in Chrome only; zero `[BROWSER-SWITCH]` events (auth-heavy + bug-repro + cascade-test were the declared use case, no need to switch to CLI). Switch budget per LR-038 v2: GREEN.

**Handoff to SP-DQU-05** (chat-only per `feedback_handoff_in_chat_only.md`):
- Findings: `clients/encore/specs_planning/_internal/neutral-eye-audits/local-information-2026-04-27.md`.
- New-bug count: **1 candidate** (BUG-LI-002 Service Charge) + **1 verificationLog update** on existing BUG-LI-001 + **1 a11y discussion-item** (aria-required=null on Oracle fields, pre-existing on old site too).
- Gap closure: 4 v1 gaps verified, 4 inconclusive (env). SP-DQU-05 should re-run save-cycle probes on healthy backend.
- LR-040 escalation: **none**.
- Env caveat: backend 503 on Save POST + 504 on /api/core/* throughout audit window 21:18-21:30 PT 2026-04-27. Document in SP-DQU-05 Phase 0; if persisting at SP-DQU-05 start, escalate to user.
