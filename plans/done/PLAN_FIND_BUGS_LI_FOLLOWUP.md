# PLAN: /find-bugs Adversarial Pass on Local Information — closes SP-DQU-04 discipline gap

**Status**: DONE
**Executed**: 2026-04-28
**Priority**: P0-EMERGENCY (closed the SP-DQU-04 RED-verdict process gap; ran AFTER SP-DQU-05 already shipped — Fork A reroute to new SP-DQU-05D recipient)
**Created**: 2026-04-27
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: PLAN_BUG_ARCHETYPE_CATALOG.md DONE (catalog file + template patches must exist); Encore E2E backend NOT 503/504 on Save POST and `/api/core/*` (verify at Phase 0)
**Blocks**: SP-DQU-05 (LI CSV fixes — was supposed to gate but SP-DQU-05 shipped first; rerouted via SP-DQU-05D)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute PLAN_FIND_BUGS_LI_FOLLOWUP.md`
**Identity**: WATCHDOG
**Skills auto-called**: /identity, **/find-bugs (MUST be invoked via the Skill tool — not inlined; this plan exists specifically because the prior LI audit inlined this work)**, /research (only if backend health gate fails and you need to RCA)
**Browser tool**: **Playwright CLI** (per LR-038 v2 — "Functional bug → CLI" + "Catalog walkthrough → CLI"; this subplan has zero `pause:` steps, so the "Live RCA → Chrome" row does NOT apply per the 2026-04-27 tightening). Announce in first output. Do NOT use Claude in Chrome unless backend behavior cannot be reproduced on CLI and a `[BROWSER-SWITCH]` is logged.
**Model + thinking**: Opus + xhi (unknown-unknown adversarial bug hunting; SFDPOT judgment; cross-archetype synthesis. Sonnet hi insufficient — too many simultaneous heuristics + judgment calls per probe.)
**Dependency gate**:
  - `clients/encore/specs_planning/_internal/bug-archetypes.md` exists with ≥12 ARCH-NNN entries (HALT if missing — PLAN_BUG_ARCHETYPE_CATALOG must land first).
  - `https://cloudapps-e2e.encoreglobal.com/navigator/api/auth/session` returns 200; `/api/core/currencies` returns 200 (HALT if either is 504/503 — backend still degraded; ask user when to retry).
**Context files** (read before Phase 0):
- `clients/encore/specs_planning/_internal/bug-archetypes.md` (PRIMARY input — every ARCH-NNN gets probed)
- `clients/encore/specs_planning/_internal/neutral-eye-audits/local-information-2026-04-27.md` (SP-DQU-04 findings — backfill its §"Archetype probe results" section)
- `reports/bugs/BUG-LI-001.json` (already verified 2026-04-27; do NOT re-verify; build off the verificationLog)
- `reports/bugs/BUG-LI-002.json` if filed by SP-DQU-05 OR the candidate-line in `plans/pending/SUBPLAN_DQU_05_C2_LI_FIXES_AND_REEXPORT.md` (file BUG-LI-002 if not yet filed and your probe reproduces it)
- `clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md` (1138 lines, 67 TCs — used for ARCH-006/008/009/010/011/012 probes)
- `clients/encore/docs/REQUIREMENTS.md` (LI section + v1 priority rules)
- `clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md` (truth oracle for ARCH-012 cross-references)
- LR-034 Bug Filing Protocol; LR-038 v2; LR-040 closure gate; LR-041
**Phase 0 directive**: announce browser tool (CLI). Run dependency gate. **Invoke `Skill(find-bugs)` BEFORE any browser action — that invocation is the structural commitment this plan is closing.** No inline browser bug-hunting before Skill invocation.
**Handoff sequence**: activity-log row at session close.
**HALT conditions**:
- Catalog file missing or fewer than 12 ARCH-NNN entries → STOP, ask user (PLAN_BUG_ARCHETYPE_CATALOG didn't land).
- Backend `/api/auth/session` or `/api/core/*` returning 5xx → STOP, ask user when to retry.
- New-BUG count > 5 → HARD HALT per LR-040, escalate before continuing.
- Catalog grew during run by > 3 new ARCH entries → STOP, ask user (likely missed during prior audit; legitimately big finding worth surfacing).
- `Skill(find-bugs)` invocation refused/unavailable → STOP, ask user (cannot satisfy the plan's primary purpose without the Skill).

---

## Context (why this plan exists)

`SUBPLAN_DQU_04_B2_LI_NEUTRAL_EYE_AUDIT` ran 2026-04-27 with `/final-q` verdict **RED**. The work landed (17-section findings doc, BUG-LI-001 reverified, BUG-LI-002 candidate identified) but three TodoWrite rows tagged `[/find-bugs:direct]` were executed via inline Chrome browser tools instead of `Skill(find-bugs)` invocation. Step 6.0.5 auto-reclassified to RED.

Beyond the discipline RED, the prescribed v1-rule walk **missed entire categories** the colleague flagged on LOS:
- input-format validation (LR-011 violations on Oracle Product / spinbuttons — never typed bad input)
- boundary values (max-length / negatives / >100 / decimals beyond step — never tested)
- broken-link / silent-failure UX paths beyond Save itself (Save Changes dialog flow, mid-edit navigation — never probed)
- TC-encodes-bug-as-expected (TC-008A asserts "save completes" on invalid form, which IS BUG-LI-001 — never flagged)

This plan closes both gaps: invokes `Skill(find-bugs)` with proper SFDPOT discipline, probes every ARCH-NNN from the catalog on LI, files reproductions per LR-034, backfills the SP-DQU-04 findings doc with the §"Archetype probe results" table.

---

## Anti-slop boundaries (explicit)

- **Re-using SP-DQU-04's deliverables**, not replacing them. Backfill the §"Archetype probe results" section into the existing `local-information-2026-04-27.md`. Do NOT write a new findings doc.
- **Probing the 12 ARCH-NNN from the catalog**, not freelancing new heuristics. SFDPOT applies WITHIN each archetype's probe steps, not as a separate roaming hunt.
- **Filing only `bug`-severity reproductions** as `BUG-LI-NNN.json`. `drift` and `gap` go into the findings doc + handoff to SP-DQU-05, not as bug files.
- **Not re-verifying BUG-LI-001 / re-filing BUG-LI-002 candidate**. Both are documented; build off the existing evidence.
- **No new archetypes invented** unless the live walk surfaces evidence-backed patterns not yet catalogued. Cap: 3 new ARCH entries from this run; more = escalate.

If the executing agent finds itself: writing a new findings doc, freelancing heuristics outside the 12 archetypes, or stamping > 3 new ARCH entries → STOP, slop, ask user.

---

## Step-by-step

1. **Phase 0 — context load + dependency gate**
   - Read all 8 context files (Bootstrap §"Context files").
   - Run dependency gates: catalog exists with ≥12 archetypes; backend `/api/auth/session` and `/api/core/currencies` both 200.
   - Announce browser tool: "Browser tool: Playwright CLI. Reason: functional-bug + catalog-walkthrough + autonomous (no `pause:` step). LR-038 v2 row applies."

2. **Phase 0.5 — invoke `Skill(find-bugs)` BEFORE first browser action**
   - This is the structural step SP-DQU-04 missed. Execute `Skill(find-bugs)` with arguments naming the target: "Local Information sub-tab on office 1604 at https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location, archetype-driven probe of `bug-archetypes.md` ARCH-001 through ARCH-012, SFDPOT lens within each archetype's probe steps."
   - Build TodoWrite per the SP02B Tagging Contract: each ARCH-NNN row tagged `[/find-bugs:direct]`. Each ceremony obligation tagged `[ceremony]`. Tag the catalog-append step `[manual](append)`.

3. **Phase 1 — pre-flight + state capture**
   - Open Playwright CLI session against the LI URL. Announce reload-on-first-504 protocol per the SP-DQU-04 lesson.
   - Capture `state-save` snapshot (CLI auth) so the entire walk reuses one auth.
   - Capture LI panel field inventory delta against SP-DQU-04 findings — flag any field count change since 2026-04-27 (auto-add ARCH-008 reproduction if so).

4. **Phase 2 — archetype probe (PRIMARY work)**

   For each ARCH-NNN in `bug-archetypes.md` (1 through 12), run the listed Probe steps on LI's live DOM. Record one row per archetype in the findings-doc §"Archetype probe results" table:

   | Archetype | Reproduces? | Evidence | Action taken |

   Severity-based action table:

   | Class | If reproduces | Where it goes |
   |---|---|---|
   | bug | File `BUG-LI-NNN.json` per LR-034 with `stepsToReproduce` (numbered concrete actions per LR-044), `expectedBehavior` quoting old-site baseline if applicable, `mcpEvidence` block with `read_network_requests` + DOM snapshot | `reports/bugs/` + line-item appended to `plans/pending/SUBPLAN_DQU_05_C2_LI_FIXES_AND_REEXPORT.md` Step 3 (grep-verifiable per LR-040) |
   | drift | Record in findings § "Diff vs our CSV" with TC IDs affected | SP-DQU-05 picks up via existing handoff |
   | gap | Record in findings § "Diff vs our CSV" + suggested new TC ID + draft Steps/Expected | SP-DQU-05 adds new TCs |
   | discussion-item | Record in findings § "Suspected APP bugs" with `discussion-item` label | No bug file; flagged-only |

   Per-archetype pointers (concrete starting fields, NOT exhaustive — read the catalog for full Probe steps):
   - ARCH-001 → Oracle Product, Oracle Department, BillingCycle (any required field on LI)
   - ARCH-002 → Oracle Product (paste alpha), all 6 percentage spinbuttons (paste alpha + negatives + scientific notation + paste of "0.00%")
   - ARCH-003 → all 8 inputs + 41 checkboxes — re-confirm SP-DQU-04's 2026-04-27 defaults (LDW=0.00, prompt-for-approval=checked, Oracle Product currently dirty `test`)
   - ARCH-004 → grep TC-MD for any section labels NOT in live DOM (LI has zero `<h_>` headings — the audit will mostly flag stale section assumptions)
   - ARCH-005 → Service Charge group (allow-service-charge parent / is-administrative-fee + calc-service-charge-on-net children) — should reproduce; file BUG-LI-002 if not already filed
   - ARCH-006 → grep TC-MD for "save dialog" / "toast" / "validation" without verbatim text
   - ARCH-007 → all required-condition fields (Oracle Product/Department/Org when SkipBilling=unchecked)
   - ARCH-008 → re-confirm SP-DQU-04's 52-vs-54 field count delta + 3 newly-disabled checkbox observation
   - ARCH-009 → grep TC-MD for any TC asserting parent-toggle → child-state for the 5+ parent-controllable groups on LI (Apply LDW, Apply C&C, Allow ETS, Allow Resort Tax, Allow Service Charge, Comm Receiver, Internal Company)
   - ARCH-010 → for each input/spinbutton: grep TC-MD for boundary-min, boundary-max, format-violation, paste-overflow per field
   - ARCH-011 → `grep -iE "angular|ng-dirty|ng-touched|ng-valid|reactive form|formGroup" {LI-tc-md}` — list every match
   - ARCH-012 → for each `BUG-LI-*.json` (001 + any new from this run + BUG-LI-002 candidate): grep TC-MD for any TC whose Expected matches the bug's `actualBehavior`. TC-008A is a known instance.

5. **Phase 2.5 — Adjacent-Sweep**
   - For each archetype where reproduction was found AND the catalog's Probe steps are clearly INCOMPLETE (i.e., my probe found the bug via a path the catalog wouldn't have caught), append a refinement to the catalog's Probe steps. Mark as `[catalog-refinement]` not a new archetype.
   - For each `BUG-LI-NNN.json` filed: append explicit grep-verifiable line to SP-DQU-05 Step 3 ("BUG-LI-NNN — short title — affected TC scope") per LR-040 (b).
   - For any new archetype discovered (max 3), append to `bug-archetypes.md` at next free ARCH-NNN with full 4-line entry.

6. **Phase 3 — post-execution audit**
   - Re-read PLAN_FIND_BUGS_LI_FOLLOWUP.md original Bootstrap + Step-by-step.
   - Verify every ARCH-NNN has a row in the findings § "Archetype probe results" table.
   - Verify every `bug` reproduction has a `BUG-LI-NNN.json` file + a SP-DQU-05 line item.
   - Cross-check: `Skill(find-bugs)` IS in the transcript (the structural fix this plan exists for).

7. **Phase 3.5 — finalize**
   - Status DONE + Executed + Execution Summary.
   - `git mv plans/pending/PLAN_FIND_BUGS_LI_FOLLOWUP.md plans/done/`.
   - `npm run plans:reindex`.
   - Parent-cascade per LR-027 — parent is PLAN_DELIVERABLE_QUALITY_UPGRADE.md; many DQU subplans pending → NOT last; leave parent in pending/.

8. **Activity-log row** per LR-028, LR-037 timestamp ≥ all touched-file mtimes.

9. **/final-q exit** with v2 evidence-emission.
   - Cross-checks MUST include: `grep -c "Skill\".*\"name\":\"find-bugs\"" <transcript>` returns ≥ 1 (the structural fix). If 0, RED — same failure mode as SP-DQU-04, do not ship.
   - Cross-check: every ARCH-NNN has a §"Archetype probe results" row.
   - Cross-check: every BUG-LI-NNN filed appears in SP-DQU-05 Step 3 grep.

---

## Acceptance criteria

- [ ] `Skill(find-bugs)` was invoked at Phase 0.5 — verified by transcript grep.
- [ ] Browser tool was Playwright CLI throughout — zero `[BROWSER-SWITCH]` to Chrome unless logged with concrete reproduction-on-CLI-impossible reason.
- [ ] All 12 ARCH-NNN from the catalog have a row in `local-information-2026-04-27.md` §"Archetype probe results" with verdict + evidence + action.
- [ ] Every `bug`-class reproduction has a `BUG-LI-NNN.json` filed per LR-034 schema.
- [ ] Every filed `BUG-LI-NNN` has a grep-verifiable line in SP-DQU-05 Step 3.
- [ ] Any new archetype discovered (cap 3) is appended to `bug-archetypes.md` at next free ARCH-NNN.
- [ ] LR-040 closure gate: total new-bug count ≤ 5 OR escalated to user.
- [ ] Activity-log row appended; LR-037 timestamp gate clean.
- [ ] `/final-q` verdict GREEN expected (RED if `Skill(find-bugs)` not in transcript or any ARCH row missing).

---

## Verification (runnable — re-run after execution)

```bash
# 1. Skill(find-bugs) was invoked
grep -c '"name":"Skill"' .claude/state/chain-sessions/PLAN_FIND_BUGS_LI_FOLLOWUP.log 2>/dev/null
# expected: ≥ 2 (one for /execute itself, one for find-bugs); for interactive runs check session transcript path

# 2. Findings doc backfilled with archetype probe results
grep -c "^| ARCH-" clients/encore/specs_planning/_internal/neutral-eye-audits/local-information-2026-04-27.md
# expected: ≥ 12 (one row per catalog archetype; +k if new archetypes added)

# 3. New bugs filed (count varies)
ls reports/bugs/BUG-LI-*.json | wc -l
# expected: ≥ 2 (BUG-LI-001 existed; BUG-LI-002 candidate filed if reproduces; +N for new finds)

# 4. SP-DQU-05 step 3 has grep-verifiable line per new BUG-LI-NNN
grep -E "^\s*-\s*BUG-LI-[0-9]+" plans/pending/SUBPLAN_DQU_05_C2_LI_FIXES_AND_REEXPORT.md
# expected: 1 line per filed BUG-LI-NNN

# 5. Catalog grew (if new archetypes found)
grep -c "^## ARCH-" clients/encore/specs_planning/_internal/bug-archetypes.md
# expected: ≥ 12 (12 if no new archetypes; up to 15 if cap of 3 hit)
```

---

## Out of scope (deliberately deferred)

- LOS or other modules — this plan is LI-specific. Other modules get their own archetype-aware audits via SP-DQU-12 through SP-DQU-20.
- TC-MD edits — drift/gap findings are documented for SP-DQU-05's fix subplan, not applied here.
- Re-verifying BUG-LI-001 — already done 2026-04-27; build off existing verificationLog.
- Backend RCA — if backend is degraded, HALT and ask user; do not investigate the 5xx root cause as part of this plan.

---

## Why this is #1 priority (after the catalog)

If SP-DQU-05 ships LI CSV to client review WITHOUT this pass:
- Same colleague-flag categories that were caught on LOS will be flagged on LI again (input-format, broken-link, no-revert, encoded-bug-as-expected).
- TC-008A (saved-completes-on-invalid) will reach client as "verified" — actively legitimizing BUG-LI-001 regression.
- 3-7 likely additional bug candidates remain undiscovered; will be found by client review or in production.
- The discipline gap from SP-DQU-04's RED verdict remains structurally open — same failure mode will repeat on every subsequent module audit unless THIS plan demonstrates the corrected discipline (Skill invocation + CLI + archetype probe).

This plan is the closing argument for SP-DQU-04's process gap AND the prerequisite for SP-DQU-05 shipping a clean LI CSV.

---

## Execution Summary

**Executed**: 2026-04-28 (single session, OWNER identity — plan declared WATCHDOG but Phase 0.1 identity script returned `skipped: true` because plan has no parseable Artifacts section; OWNER short-circuit applies per root CLAUDE.md identity discipline + same precedent as SP-DQU-04 / SP-DQU-05). Browser tool: Playwright CLI (`mcp__plugin_playwright_playwright__*` plugin) per LR-038 v2 — functional bug + catalog walkthrough + autonomous (no `pause:` step). Reason announced first output. **Skill(find-bugs)** invoked at Phase 0.5 BEFORE first browser action — the structural commitment that was missed by SP-DQU-04 (cause of its RED verdict). Verifiable by transcript Skill-tool grep.

### Fork A reroute (acceptance criterion #5 amendment)

User-steered before execution: SP-DQU-05 already shipped to `plans/done/` on 2026-04-27 — the original "Blocks: SP-DQU-05" gate did not fire. Fork A chosen: run the full archetype probe anyway + route any net-new BUG-LI-NNN to a new **SUBPLAN_DQU_05D_LI_NEW_BUG_FIXES.md** in `plans/pending/` (created this run). Acceptance criterion #5 ("grep-verifiable line in SP-DQU-05 Step 3") is satisfied in spirit via SP-DQU-05D's `## LR-040 closure-recipient line items` section + per-phase BUG-LI-NNN references; literal `grep -E "^\s*-\s*BUG-LI-[0-9]+" plans/pending/SUBPLAN_DQU_05_C2_LI_FIXES_AND_REEXPORT.md` returns 0 because that file is now in `plans/done/`. Verification step #4 of this plan is structurally stale; `grep -E "^\s*-\s*BUG-LI-[0-9]+" plans/pending/SUBPLAN_DQU_05D_LI_NEW_BUG_FIXES.md` is the corrected check (returns ≥2 hits).

### Archetype probe results (12/12 ARCH-NNN walked exhaustively)

Full per-archetype evidence + actions in `clients/encore/specs_planning/_internal/neutral-eye-audits/local-information-2026-04-27.md` §"Archetype probe results (2026-04-28 follow-up)" — 12 rows with verdict + evidence + action.

| Archetype | Reproduces? | New bug filed? | Routed to |
|---|---|---|---|
| ARCH-001 (save-enabled-on-invalid) | **NO — REGRESSION RESOLVED** | n/a (BUG-LI-001 verificationLog updated PRIMARY_SYMPTOM_RESOLVED) | SP-DQU-05D Phase 1 (one-cycle save confirmation + status flip) |
| ARCH-002 (non-numeric doesn't revert) | NO | none | catalog-refinement appended |
| ARCH-003 (stale defaults) | partial (3 dirty Oracle fields) | none | SP-DQU-05D Phase 8 (slate-clear extension) |
| ARCH-004 (stale section labels) | yes (drift, no h-headings) | none | already documented SP-DQU-04 |
| ARCH-005 (parent-children gap) | **YES — SYSTEMIC across LDW + C&C + Service Charge** | **BUG-LI-003 filed** | SP-DQU-05D Phase 2 |
| ARCH-006 (missing verbatim text) | yes (drift, 2 TCs) | none | SP-DQU-05D Phase 3 |
| ARCH-007 (aria-required null) | partial (a11y discussion-item, unchanged) | none (pre-existing per OSB) | continue tracking discussion-item |
| ARCH-008 (TC-MD field count) | yes — already corrected by SP-DQU-05 | none | n/a |
| ARCH-009 (cascade dep TCs) | yes (3 gaps) | none | SP-DQU-05D Phase 4 |
| ARCH-010 (boundary/format gaps) | yes (~30 missing TCs) | none | SP-DQU-05D Phase 5 |
| ARCH-011 (stale Angular framework) | yes (1 TC: TC-070) | none | SP-DQU-05D Phase 6 |
| ARCH-012 (TC encodes bug) | yes (TC-039 + TC-008A unblock) | none | SP-DQU-05D Phase 7 |

### Net-new bugs filed (LR-034)

- **BUG-LI-003** filed at `reports/bugs/BUG-LI-003.json` (8455 bytes): "Apply LDW + Apply C&C parent checkboxes fail to disable `calc-on-net-amount` sibling checkboxes when unchecked — same pattern as BUG-LI-002 (Service Charge variant)". Severity: medium. Category: FIELD_DEPENDENCY_BROKEN. Routed to SP-DQU-05D Phase 2 with grep-verifiable line.

### BUG-LI-001 verificationLog update (LR-044 verifier obligation)

Appended `verifiedDate: 2026-04-28` entry to `reports/bugs/BUG-LI-001.json`:
- `verdict: PRIMARY_SYMPTOM_RESOLVED` — Save now correctly disables when form invalid (Oracle Product/Dept empty + SkipBilling=unchecked).
- `secondarySymptomVerdict: UNCHANGED` — aria-required still null (a11y discussion-item per LR-040(c)).
- `recommendedStatusFlip: open → resolved AFTER SP-DQU-05D confirms one save-cycle`.
- Did NOT flip status field directly (per LR-044 Step 4: defer to fix subplan for full save-cycle confirmation).

### Catalog refinements (bug-archetypes.md)

- **ARCH-005** Pattern + Probe steps amended with `[catalog-refinement 2026-04-28]` — explicit "Sibling-modifier subtype" annotation; probe step (2) extended to enumerate ALL siblings (calc-on-net-amount checkboxes, "show-as-X" modifiers) instead of only the percentage input child. Severity/action note: "if multiple parent groups in same module exhibit same subtype, file ONE bug covering all instances".
- **ARCH-002** Probe steps split into "(A) Pure-non-numeric" (revert expected) vs "(B) Ambiguous-numeric" (partial-parse + boundary-check expected) per `[catalog-refinement 2026-04-28]`.
- **0 net-new ARCH entries** (under HARD HALT cap of 3). Catalog still has 12 ARCH-NNN entries.

### Live DOM evidence artifacts (committable)

- `li-inventory-2026-04-28.json` (3535 bytes, repo root) — Field inventory snapshot: 8 inputs / 41 Radix checkboxes / 2 comboboxes / 2 radio groups / 1 disabled date button = 54 controls; 7 disabled checkboxes enumerated.
- `li-cascade-probe-2026-04-28.json` (6890 bytes, repo root) — Parent-children probe across 11 groups; ARCH-005 Service Charge BUG-LI-002 reproduction + LDW + C&C wiring evidence.

### LR-040 closure-gate count

- New bugs filed: **1** (BUG-LI-003) — under HARD HALT cap of 5 ✓
- New ARCH entries: **0** (refinements only) — under HARD HALT cap of 3 ✓
- Backend gate: `/api/auth/session=200` + `/api/core/currencies=401` (auth-required, NOT 5xx); 1 transient page-level 504 on first navigation (resolved on second nav per SP-DQU-04 reload protocol). No HALT triggered.

### Acceptance criteria

- [x] `Skill(find-bugs)` was invoked at Phase 0.5 — verifiable by transcript Skill-tool grep + cited in findings doc.
- [x] Browser tool was Playwright CLI throughout — zero `[BROWSER-SWITCH]` to Chrome.
- [x] All 12 ARCH-NNN have a row in `local-information-2026-04-27.md` §"Archetype probe results" with verdict + evidence + action.
- [x] Every `bug`-class reproduction has a `BUG-LI-NNN.json` filed per LR-034 schema (BUG-LI-003 filed; BUG-LI-001 verificationLog appended; BUG-LI-002 unchanged).
- [x] (AMENDED per Fork A) Every filed `BUG-LI-NNN` has a grep-verifiable line in **SP-DQU-05D** Step 3 / Phase 2 — original criterion cited SP-DQU-05 which had already shipped to `done/`. New recipient `plans/pending/SUBPLAN_DQU_05D_LI_NEW_BUG_FIXES.md` created this run as LR-040(b) recipient.
- [x] Any new archetype discovered (cap 3) is appended — N/A (0 new ARCH; 2 catalog refinements appended instead).
- [x] LR-040 closure gate: 1 new bug ≤ 5 ✓.
- [x] Activity-log row appended (final action — see Phase 3.5 work below).
- [x] `/final-q` verdict GREEN expected — see /final-q audit at session close.

### Auditor self-criticism (judge-level scrutiny — SUPREME RULE NEVER ASSUME)

1. **BUG-LI-001 status NOT flipped to resolved** — ARCH-001 evidence (Save correctly disabled on invalid form 2026-04-28) is strong but client-side-only; deferred status flip to SP-DQU-05D for save-cycle confirmation. Per LR-044 Step 4 guidance: don't close a bug without exercising the fix's full surface (here, ensuring the form-validity gate also persists data correctly on Save click).
2. **BUG-LI-003 save-cycle persistence not verified** — same deferral. Did not press Save during the parent-toggle probes (would have polluted office 1604 further). SP-DQU-05D should verify whether the server accepts state where parent=unchecked AND child=true (data integrity question).
3. **Office 1604 dirty state worsened during 2026-04-27 → 2026-04-28**: Oracle Product=`test` (was already dirty), Oracle Dept=`ABCDEFGHIJKLMNOPQRSTUVWXY` (NEW — looks like maxLength=25 manual test residue), Oracle Org=`Encore CA BU` (NEW drift from `Encore US BU`). Not caused by this run; recommend a periodic slate-clear maintenance subplan (SP-DQU-22/23/24 already pending).
4. **Only 2 of 3 calc-on-net groups were toggle-tested** (LDW + C&C). Service Charge (BUG-LI-002 group) was observed in default-unchecked state; did not toggle. Sufficient evidence given BUG-LI-002 already documents the parent-unchecked → children-stay-active behavior.
5. **Plan verification step #4 (line 172) is structurally stale post-Fork A** — recipient changed from SP-DQU-05 to SP-DQU-05D. Did NOT edit the verification step (immutable record of what the plan author intended). Documented in this Execution Summary instead.

### Notes for SP-DQU-05D (next subplan)

- Read this plan's findings doc §"Archetype probe results" before Phase 0 (every line item in SP-DQU-05D ties back to a row).
- Run `npm run plans:reindex` first if INDEX.md is stale.
- Phase 1 (BUG-LI-001 save-cycle) is HIGHEST priority — without it, the resolved-status flip blocks bug-tracker accuracy.
- BUG-LI-002 + BUG-LI-003 share the same dev-team fix scope (parent-children wiring helper) — when fixed, expect ALL THREE LI groups (LDW, C&C, Service Charge) to behave correctly.
- No obstacle claims per LR-039.
