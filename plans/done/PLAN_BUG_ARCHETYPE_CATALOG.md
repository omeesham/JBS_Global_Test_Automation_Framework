# PLAN: Bug-Archetype Catalog — Persistent QA Memory Across Audits

> **To save into the repo**: `cp "C:\Users\rutvi\.claude\plans\expplain-the-need-of-adaptive-gizmo.md" plans/pending/PLAN_BUG_ARCHETYPE_CATALOG.md` then `npm run plans:reindex`. Then in a new session: `/execute PLAN_BUG_ARCHETYPE_CATALOG.md`.

**Status**: DONE
**Executed**: 2026-04-28
**Priority**: P0-EMERGENCY (must land BEFORE the /find-bugs LI follow-up handoff and BEFORE any of SP-DQU-12 through SP-DQU-20 module audits run)
**Created**: 2026-04-27
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-04 DONE (gives us evidence-backed seed archetypes — LANDED 2026-04-27)
**Blocks**: SP-DQU-11 (remaining-modules planner) + SP-DQU-12 through SP-DQU-20 (9 module audits) + the /find-bugs LI follow-up
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute PLAN_BUG_ARCHETYPE_CATALOG.md`
**Identity**: GARDENER (catalog authoring + template patching is hygiene/structural, not pipeline-execution)
**Skills auto-called**: /identity, /regression-guard (before + after)
**Browser tool**: none (file-ops only — zero browser interaction)
**Model + thinking**: Sonnet + hi (mechanical file creation + template patching; seed archetypes are pre-specified below — no judgment to delegate)
**Dependency gate**: SP-DQU-04 `Status: DONE`; LI findings doc exists; BUG-LI-001 verificationLog updated.
**Context files** (read before Phase 0):
- `clients/encore/specs_planning/_internal/neutral-eye-audits/local-information-2026-04-27.md` (SP-DQU-04 findings — source of ARCH-005 + ARCH-007 evidence)
- `plans/pending/PLAN_DELIVERABLE_QUALITY_UPGRADE.md` (parent plan §"The 11 locked reviewer defects" — source of ARCH-001/002/003/004/006 evidence)
- `reports/bugs/BUG-LI-001.json`, `reports/bugs/BUG-LOS-BAS-016.json`, `reports/bugs/BUG-LOS-ECT-010.json` (concrete bug instances backing the archetypes)
- `clients/encore/specs_planning/_internal/neutral-eye-audits/_TEMPLATE.md` (the template that gets patched)
- `.claude/rules/inventory.md` + `.claude/rules/pipeline.md` (path-scoped rule pattern reference for frontmatter design)
- LR-034 Bug Filing Protocol; LR-040 closure gate; LR-041 frontmatter
**Phase 0 directive**: file-ops only; no browser; no DOM.
**Handoff sequence**: activity-log row at session close.
**HALT conditions**:
- A pending audit subplan being patched (Step 4) is currently `**Status**: in-progress` per a chain-session log → STOP, ask user (avoid concurrent edit on a running session's plan file).
- Catalog file already exists with non-empty content → STOP, ask user (don't clobber prior archetype work from a sibling session).

---

## Context (why this plan exists)

Colleague review of LOS CSV flagged 11 defects in 6 categories (wrong-value, stale-default, stale-label, missing-assertion, APP-bug-input-format, APP-bug-broken-link, APP-bug-no-revert). SP-DQU-04 LI neutral-eye audit (2026-04-27) **missed those same categories** because it ran a v1-rule prescribed walk instead of an adversarial probe — same authoring-from-spec failure mode the colleague originally caught us on.

9 more module audits are queued (SP-DQU-12 through SP-DQU-20). Without a persistent catalog of "bug archetypes we've seen on Encore", each agent will start blind. Each module will repeat the LI miss. Each colleague review will flag the same categories.

**Goal**: every future module audit reads a single catalog file at Phase 0, probes their module against each archetype with concrete steps, appends any new archetype found. No archetype rediscovered from scratch. No category missed twice.

---

## Anti-slop boundaries (explicit — DO NOT exceed during execution)

- **1 new file** — the catalog. No YAML schema, no JSON manifest, no separate per-archetype files.
- **1 patch pattern** — bootstrap context-files + 1 new step + 1 new acceptance criterion. Apply to the 9 affected subplans + the audit-subplan template.
- **0 new tooling** — no hook, no skill, no validator. Greppability is the audit mechanism.
- **0 new pipeline phases** — fits inside existing `/execute` Phase 0 and Phase 3.5.
- Each archetype entry **= 4 lines max** (Pattern / First-observed / Probe steps / Severity-and-action). Not a manifest.
- **Seed with 12 evidence-backed archetypes** (7 bugs/drift/discussion + 5 TC-gap), not more. Let the catalog grow per audit, not per agent imagination.

The catalog covers FOUR severity classes (this is the structural mental model the executing agent must respect):
- **bug** — live app misbehaves; file `BUG-{MODULE}-NNN.json` per LR-034.
- **drift** — TC-MD says X but live DOM is Y; fix in TC-MD via the corresponding fix subplan, no BUG file.
- **gap** — a probe-able test case is MISSING from TC-MD entirely; add TCs in the fix subplan.
- **discussion-item** — pre-existing pattern present on baseline too (e.g., a11y); flag in findings, do NOT file BUG.

If executing agent finds itself adding a hook, a skill, a validator, or a 5th line per archetype → STOP, that's slop, ask user.

---

## Step-by-step

1. **Regression fingerprint snapshot** (BEFORE).
2. **Create `clients/encore/specs_planning/_internal/bug-archetypes.md`** with the exact content in §Files-to-create §1 below (frontmatter + 7 archetypes verbatim). No more, no less.
3. **Patch `clients/encore/specs_planning/_internal/neutral-eye-audits/_TEMPLATE.md`** — insert the §"Archetype probe results" section between `## Validation behavior` and `## Section names + labels` (verbatim text in §Files-to-modify §3 below).
4. **Patch the planner subplan + 8 module-audit subplans** — for each of the 9 files listed in §Files-to-modify §2 below:
   - Append one line to the Bootstrap **Context files** block.
   - Insert one step into Step-by-step (as the first probing step, after field-enumeration, before priority-rule walk).
   - Append two checkboxes to Acceptance criteria.
   - Verbatim text in §Files-to-modify §2.
5. **Phase 0 grep gate** — run the 5 verification commands (§Verification below). Every one must return the expected output. If any fails, STOP and fix before Phase 3.5.
6. **Regression fingerprint snapshot** (AFTER) — diff vs BEFORE; investigate any SUSPICIOUS / SILENT-BREAK rows.
7. **Activity-log row** at session close per LR-028, LR-037 timestamp ≥ all touched-file mtimes.
8. **Phase 3.5 finalize** — Status DONE + Execution Summary + `git mv` (or `mv` + `git add` if untracked) to `plans/done/` + `npm run plans:reindex`. Parent-cascade per LR-027 — this plan's parent is `PLAN_DELIVERABLE_QUALITY_UPGRADE.md`; ~20 DQU subplans remain pending → NOT last → leave parent in pending/.

---

## Files to create

### §1. `clients/encore/specs_planning/_internal/bug-archetypes.md`

**Verbatim content** (paste exactly — no embellishment, no extra archetypes, no extra fields):

```markdown
---
paths:
  - "clients/encore/specs_planning/_internal/neutral-eye-audits/**"
  - "plans/pending/SUBPLAN_DQU_*_NEUTRAL_EYE_*.md"
  - "plans/done/SUBPLAN_DQU_*_NEUTRAL_EYE_*.md"
---

# Bug Archetypes — Encore Audit Memory

> Append-only. New archetypes added at next free `ARCH-NNN`. Never renumber. Never reorder.
> Every neutral-eye audit subplan reads this file at Phase 0 and probes every archetype on its own module. Reproductions of `bug`-severity archetypes get filed as `BUG-{MODULE}-NNN.json` per LR-034. Reproductions of `discussion-item`-severity archetypes get flagged in findings, not filed.
> Drift archetypes (TC-MD vs live-DOM mismatches) get applied as TC-MD edits in the corresponding fix subplan, not bugs.

## ARCH-001 — save-enabled-on-invalid-form-no-feedback
- **Pattern**: Save button stays enabled when a required field is empty or invalid; clicking Save produces no toast, no dialog, no aria-invalid update — the form silently fails or silently submits an invalid POST.
- **First observed**: BUG-LI-001 (2026-04-10) primary symptom; reconfirmed SP-DQU-04 (2026-04-27); TC-LOS-BAS-016 colleague flag (Phone 1 accepts non-phone text, save stays enabled).
- **Probe steps**: For each required field on the module — (1) clear field via native value setter + input/change/blur events; (2) check Save button disabled state; (3) if Save enabled, click and watch network panel for POST + UI for toast/dialog; (4) record verbatim text of any feedback (or absence).
- **Severity / action**: bug — file `BUG-{MODULE}-NNN.json` per LR-034 if the symptom reproduces.

## ARCH-002 — non-numeric-doesnt-revert
- **Pattern**: Numeric/spinbutton field accepts non-numeric input without reverting; field shows the invalid value (or shows 0.00 silently) with Save still enabled. LR-011 violation pattern.
- **First observed**: TC-LOS-ECT-010 colleague flag (non-numeric input doesn't revert; shows 0.00 with save enabled).
- **Probe steps**: For each numeric/spinbutton field — (1) clear field; (2) type "abc"; (3) blur; (4) observe field value (reverted to prior? cleared? shows 0.00? shows "abc"?); (5) check Save state; (6) try paste of "1.2.3" / scientific notation / leading-zero strings.
- **Severity / action**: bug — file `BUG-{MODULE}-NNN.json` per LR-034.

## ARCH-003 — stale-default-vs-actual
- **Pattern**: TC-MD claims default value X for a field; live DOM on baseline office shows value Y. Test fires on wrong precondition.
- **First observed**: TC-LOS-BAS-032 (logo checkboxes default-on); SP-DQU-04 LI LDW=0.04 claim vs actual 0.00; SP-DQU-04 LI prompt-for-approval=unchecked claim vs actual checked.
- **Probe steps**: For each field on the module — (1) read TC-MD's claimed default for this field; (2) read live DOM rendered value on baseline office (1604 for Encore); (3) if mismatch, record actual value and which TCs are affected.
- **Severity / action**: drift — TC-MD edit in the corresponding fix subplan; no BUG file.

## ARCH-004 — stale-section-or-label
- **Pattern**: TC-MD references section names or field labels that no longer match live DOM.
- **First observed**: TC-LOS-BAS-025 (all sections active but section names different); TC-LOS-ECT-007 (sections "Event Profit Target" + "Labor Cost Assumption" do not match live).
- **Probe steps**: For each section/label referenced in TC-MD — (1) grep TC-MD for the literal label text; (2) read live DOM for that label; (3) if not found OR text differs, record actual text and TC IDs to update.
- **Severity / action**: drift — TC-MD edit in the corresponding fix subplan; no BUG file.

## ARCH-005 — parent-checkbox-doesnt-disable-children
- **Pattern**: A parent checkbox that should gate child fields/checkboxes (per the parent-enables-children pattern used elsewhere) leaves child controls enabled or checked when parent is unchecked.
- **First observed**: BUG-LI-002 candidate (SP-DQU-04, 2026-04-27) — Service Charge children active when allow-service-charge=unchecked.
- **Probe steps**: For each parent-child checkbox group on the module (identify by section grouping or naming convention) — (1) read parent state; (2) read each child state + disabled flag; (3) if parent=unchecked AND any child=checked OR enabled, record the violation.
- **Severity / action**: bug — file `BUG-{MODULE}-NNN.json` per LR-034.

## ARCH-006 — missing-verbatim-assertion-text
- **Pattern**: TC asserts that an error/toast/dialog appears, but does NOT include the verbatim text of the assertion. Test passes on any text, including misleading ones.
- **First observed**: TC-LOS-BAS-005 colleague flag (missing save dialog text + toast text).
- **Probe steps**: For each TC in the module's TC-MD that mentions "save dialog" / "toast" / "error message" / "validation" — (1) check whether the TC's Expected or Steps quotes the verbatim text; (2) if not, record TC ID + which assertion lacks verbatim text.
- **Severity / action**: drift — TC-MD edit in the corresponding fix subplan; capture verbatim text from live DOM during this audit.

## ARCH-007 — aria-required-or-aria-invalid-missing
- **Pattern**: Required fields render with no `aria-required` attribute; invalid fields render with `aria-invalid` either missing or set to "false" instead of "true". WCAG 2.1 / WAI-ARIA gap.
- **First observed**: BUG-LI-001 secondary symptom (2026-04-10, partial fix observed 2026-04-27 — aria-invalid now sets correctly; aria-required still null).
- **Probe steps**: For each required field on the module — (1) read aria-required attribute on default; (2) read aria-required after focus + blur of empty; (3) read aria-invalid before and after invalid input. Record nulls or wrong values.
- **Severity / action**: discussion-item — flag in findings § "Suspected APP bugs" with `discussion-item` label per `feedback_discussion_item_not_bug.md`. Do NOT file BUG-* (a11y is pre-existing on old site too per OSB-ACCESS-VERIFY-2026-04-24).

## ARCH-008 — tc-md-missing-fields-that-exist-in-live-dom
- **Pattern**: TC-MD's Field Inventory header claims N interactive fields; live DOM count is N+k. The k extra fields have ZERO TCs covering them — the audit walk would never have surfaced them.
- **First observed**: SP-DQU-04 LI (2026-04-27) — TC-MD claimed 52 fields, live count was 54; 3 newly-disabled checkboxes (use-esign, enable-product-group, discount-guidance) had no TCs at all.
- **Probe steps**: (1) Read TC-MD's Field Inventory header for claimed counts; (2) enumerate live DOM via `data-testid` selector audit + Radix `[role=checkbox]` + `[role=combobox]` + `[role=radiogroup]`; (3) compare counts and field-set; (4) for each field in live DOM but not in TC-MD, record: testid, default state, disabled flag.
- **Severity / action**: gap — list missing fields in findings § "Diff vs our CSV"; fix subplan adds TCs covering each missing field's default + interaction.

## ARCH-009 — missing-cascade-dependency-tc
- **Pattern**: A parent-child or cross-field dependency exists in live DOM (parent toggle changes child state) but no TC in TC-MD covers the cascade. Even if the dependency works correctly, regressions are uncaught.
- **First observed**: SP-DQU-04 LI (2026-04-27) — Service Charge parent/child relationship had no TC covering "uncheck parent, expect children disable+reset"; the cascade itself surfaced BUG-LI-002 candidate but was also a TC gap.
- **Probe steps**: For each parent-controllable group (parent checkbox + dependent fields/checkboxes/inputs) — (1) identify the group via section structure or naming convention; (2) grep TC-MD for any TC asserting parent-toggle → child-state-change; (3) if no TC found, record the group + the missing cascade behaviors.
- **Severity / action**: gap — list missing cascades in findings § "Diff vs our CSV"; fix subplan adds cascade TCs (toggle parent → assert child state on each child + assert reset on disable).

## ARCH-010 — missing-boundary-or-format-validation-tc
- **Pattern**: A field accepts text/numeric input but no TC covers boundary values (min, max, just-past-max), format violations (non-numeric in numeric, special chars, unicode, paste of multi-char strings), or length violations (max-length probe). Field's actual constraints are untested.
- **First observed**: SP-DQU-04 LI (2026-04-27) — Oracle Product (maxLength=25 per v1) had no TC for paste of 30-char strings or SQL chars; percentage spinbuttons had no TC for negatives, >100, decimals beyond step.
- **Probe steps**: For each input/spinbutton field — (1) grep TC-MD for boundary TCs by field name; (2) check if max-length / min-value / max-value / non-numeric / paste cases are covered; (3) record each field that lacks any of: boundary-min, boundary-max, format-violation, paste-overflow.
- **Severity / action**: gap — list missing boundary TCs in findings § "Diff vs our CSV"; fix subplan adds NEGATIVE-type TCs covering each field's boundary + format space.

## ARCH-011 — tc-assumes-stale-framework-or-architecture
- **Pattern**: TC-MD's Steps or Expected references framework constructs (Angular Reactive Forms, `if (!form.valid)`, ng-dirty/ng-touched, $scope, etc.) that no longer apply to the current live app architecture (e.g., Next.js + RHF + Server Actions). TC describes mechanism rather than user-observable behavior.
- **First observed**: SP-DQU-04 LI (2026-04-27) — multiple TCs reference Angular form-validity gating; live app is Next.js + RHF + Server Action POSTs. v1 requirements doc still uses Angular vocabulary.
- **Probe steps**: (1) `grep -iE "angular|ng-dirty|ng-touched|ng-valid|\\$scope|reactive form|formGroup|FormControl" {tc-md-path}` — record matches; (2) for each match, identify the underlying user-observable behavior the TC is trying to assert; (3) flag the TC for rewrite in user-observable terms.
- **Severity / action**: gap — record framework-assumption violations in findings § "Diff vs our CSV"; fix subplan rewrites affected TCs to user-observable assertions (DOM state, network, toast text) regardless of underlying framework.

## ARCH-012 — tc-encodes-bug-as-expected-behavior
- **Pattern**: TC's `Expected` or `Steps` validate what is actually a known bug as if it were the contract. The TC currently passes (or is marked Manual) because it asserts the wrong thing. Most dangerous archetype — TC actively legitimizes broken behavior, blocks regression detection, ships to client as "verified".
- **First observed**: SP-DQU-04 LI (2026-04-27) — TC-LOC-LI-008A asserts "Click Save button and verify save completes (no immediate validation)" on an invalid Oracle Product field — but per BUG-LI-001 + old-site baseline, Save SHOULD be disabled on invalid form. The TC encodes the BUG-LI-001 regression as the contract.
- **Probe steps**: (1) For each `BUG-{MODULE}-NNN.json` filed (or candidate from current audit), grep TC-MD for any TC asserting the bug's `actualBehavior` as Expected; (2) cross-reference TC Expected lines against old-site baseline (per LR-ENC-001) — if Expected matches new-site behavior but contradicts old-site baseline AND is on a non-baseline-absent feature, flag; (3) record TC ID + the offending Expected line + the documented correct behavior.
- **Severity / action**: gap (high-priority) — fix subplan rewrites affected TCs against documented expected behavior, adds `Status: Blocked by BUG-*` metadata. The bug must be filed/linked even if originally undocumented (audit obligation).
```

End of catalog file content.

---

## Files to modify

### §2. Audit-subplan template + 9 affected subplans

**Find the template + 8 module-audit subplans**:
```
plans/pending/SUBPLAN_DQU_11_F0_REMAINING_MODULES_PLANNER.md   (template + planner)
plans/pending/SUBPLAN_DQU_12_*.md                              (Pricing audit)
plans/pending/SUBPLAN_DQU_13_*.md                              (Legal audit)
plans/pending/SUBPLAN_DQU_14_*.md                              (Currency audit)
plans/pending/SUBPLAN_DQU_15_*.md                              (Notes audit)
plans/pending/SUBPLAN_DQU_16_*.md                              (Account & Address audit)
plans/pending/SUBPLAN_DQU_17_*.md                              (Shared Setup audit)
plans/pending/SUBPLAN_DQU_18_*.md                              (Auto Add-On audit)
plans/pending/SUBPLAN_DQU_19_*.md                              (ECT audit)
plans/pending/SUBPLAN_DQU_20_*.md                              (LM History audit)
```

(NOTE: only patch subplans whose body contains `**Identity**: WATCHDOG` AND `/find-bugs` in Skills auto-called — i.e., neutral-eye audit subplans. If a SUBPLAN_DQU_NN file is something else like a tag rollout, SKIP it.)

**Patch A — append to Bootstrap Context files** (verbatim line):
```
- `clients/encore/specs_planning/_internal/bug-archetypes.md` (REQUIRED — probe every ARCH-NNN on this module; append new archetypes if found)
```

**Patch B — insert as the first probing step in Step-by-step** (renumber subsequent steps as needed):
```
N. **Archetype probe**: Read `bug-archetypes.md`. For each ARCH-NNN: run the listed Probe steps on this module's live DOM; record verdict (`reproduces` / `does not reproduce` / `N/A`) in findings doc § "Archetype probe results". File new `BUG-{MODULE}-NNN.json` per LR-034 for each `bug`-severity reproduction. Flag `discussion-item` reproductions in § "Suspected APP bugs" without filing.
```

**Patch C — append to Acceptance criteria** (two checkboxes):
```
- [ ] Every ARCH-NNN in `bug-archetypes.md` has been probed; findings doc § "Archetype probe results" has one row per archetype.
- [ ] Any new archetype found during this audit has been appended to `bug-archetypes.md` at the next free ARCH-NNN before Phase 3.5 (status flip).
```

### §3. Findings-doc template `_TEMPLATE.md`

**Find**: `clients/encore/specs_planning/_internal/neutral-eye-audits/_TEMPLATE.md`

**Insert between `## Validation behavior` and `## Section names + labels`** (verbatim):

```markdown
---

## Archetype probe results

Every ARCH-NNN from `bug-archetypes.md` was probed on this module. One row per archetype.

| Archetype | Reproduces? | Evidence | Action taken |
|---|---|---|---|
| <!-- ARCH-NNN — name --> | yes / no / N/A | <!-- live-DOM observation, network panel, BUG-{MODULE}-NNN.json --> | filed BUG-{MODULE}-NNN.json | flagged as discussion-item | not-applicable | drift recorded in §Diff |

If a NEW archetype was found during this audit not yet in `bug-archetypes.md`: list it here, AND append it to `bug-archetypes.md` at the next free ARCH-NNN BEFORE declaring DONE (acceptance criterion).
```

---

## Acceptance criteria (this plan's own — gates DONE)

- [ ] `clients/encore/specs_planning/_internal/bug-archetypes.md` exists with the path-scoped frontmatter + exactly 7 ARCH-NNN entries (no more, no less in seed).
- [ ] `_TEMPLATE.md` patched with the new "## Archetype probe results" section.
- [ ] All 9 affected audit subplans (planner + 8 modules — minus any that aren't neutral-eye type) have Patches A/B/C applied. Verified by grep (§Verification below).
- [ ] Regression fingerprint before/after matches (no unintended file changes).
- [ ] Activity-log row appended.
- [ ] No new tooling, no new skill, no new hook introduced.

---

## Verification (runnable — re-run after execution to confirm)

```bash
# 1. Catalog file exists with frontmatter + 12 archetypes (7 bug/drift/discussion + 5 gap)
ls clients/encore/specs_planning/_internal/bug-archetypes.md
grep -c "^## ARCH-" clients/encore/specs_planning/_internal/bug-archetypes.md
# expected: 12

# 2. Path-scoped frontmatter present
grep -A4 "^paths:" clients/encore/specs_planning/_internal/bug-archetypes.md
# expected: paths array with neutral-eye-audits/** + SUBPLAN_DQU_*_NEUTRAL_EYE_*.md globs

# 3. Audit-subplan template patched (planner subplan)
grep -F "bug-archetypes.md" plans/pending/SUBPLAN_DQU_11_F0_REMAINING_MODULES_PLANNER.md
# expected: 1+ hit in Bootstrap context-files

# 4. Findings-doc template patched
grep -F "## Archetype probe results" clients/encore/specs_planning/_internal/neutral-eye-audits/_TEMPLATE.md
# expected: 1 hit

# 5. Acceptance criterion present in 9 affected subplans
grep -lF "Every ARCH-NNN" plans/pending/SUBPLAN_DQU_1[1-9]*.md plans/pending/SUBPLAN_DQU_20*.md 2>/dev/null | wc -l
# expected: 9 (or fewer only if some SUBPLAN_DQU_1X / 20X files are NOT neutral-eye types — verify per-file before declaring done)
```

---

## What this plan does NOT include (anti-scope-creep)

- No new skill.
- No new hook.
- No script / validator / CI gate.
- No modification to existing skill files (other than the audit-subplan template steps).
- No imagined archetypes — seed only from evidence already in our bug + colleague files.
- No JSON / YAML version of the catalog. Markdown table + 4-line entries are greppable, append-friendly, human-readable.
- No backfilling LOS or LI audits — they're already done. Forward-applies to SP-DQU-12+ only.
- No /find-bugs LI follow-up handoff — that's a separate handoff, queued AFTER this plan lands.

---

## Order of operations (downstream dependency)

This plan **must land first**, then:

1. The /find-bugs LI follow-up handoff runs (uses ARCH-001 through ARCH-007 to probe LI on healthy backend — backfills LI's archetype probe results, files any reproductions).
2. SP-DQU-11 remaining-modules planner runs (with archetype-aware template).
3. SP-DQU-12 through SP-DQU-20 each run with the catalog auto-loaded at Phase 0.

Skipping this plan → 9 module audits run blind → same authoring-from-spec failure mode the colleague originally caught us on, repeated 9 times.

---

### Execution Summary (2026-04-28)

**Identity**: GARDENER (catalog authoring + template patching).
**Model**: claude-opus-4-7 + xhi (overrode plan's claude-sonnet-4-6 + hi at user invocation; plan content was deterministic so either model would land identical bytes).
**Browser tool**: none (file-ops only).

**Delivered**:
- ✅ `clients/encore/specs_planning/_internal/bug-archetypes.md` — 12 archetypes (ARCH-001 through ARCH-012), path-scoped frontmatter targeting `neutral-eye-audits/**` + `SUBPLAN_DQU_*_NEUTRAL_EYE_*.md` (pending + done). 84 lines. Verbatim per plan §1.
- ✅ `clients/encore/specs_planning/_internal/neutral-eye-audits/_TEMPLATE.md` — patched with `## Archetype probe results` section between `## Validation behavior` and `## Section names + labels`. Section count 9 → 10. 93 → 105 lines. Verbatim per plan §3.

**Descoped** (user-authorized 2026-04-28 — "they are superseded, they havent run yet, u are green to go"):
- Step 4: Patches A/B/C to 9 audit subplans (SP-DQU-11 planner + SP-DQU-12 through SP-DQU-20). Reality at execution time: ALL 10 subplans were already in `plans/done/` (named `SUBPLAN_DQU_11_F1_REMAINING_MODULES_PLANNER.md` ... `SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md`). Plan body assumed they would be in `plans/pending/`. Per user clarification they have been superseded by future replacements that have not been authored yet. Forward-apply value preserved via the catalog's path-scoped frontmatter glob `plans/pending/SUBPLAN_DQU_*_NEUTRAL_EYE_*.md` — when successor neutral-eye audit subplans are authored, they will auto-load the catalog without per-subplan patching.

**Verification gate** (plan §Verification, 5 commands):
- ✅ #1 Catalog file exists + 12 archetypes (`grep -c "^## ARCH-"` = 12).
- ✅ #2 Path-scoped frontmatter present (3-glob array per plan §1).
- ⏭️ #3 Planner subplan patched — N/A per descope (subplan in `done/` as `SUBPLAN_DQU_11_F1_*.md`).
- ✅ #4 `_TEMPLATE.md` patched with `## Archetype probe results`.
- ⏭️ #5 9 affected subplans patched — N/A per descope.

**Plan-vs-AC drift noted**: Plan §Acceptance criteria line 243 said "exactly 7 ARCH-NNN entries" — stale plan text. §1 verbatim content has 12 entries, §Anti-slop boundaries says "12 evidence-backed archetypes (7 bugs/drift/discussion + 5 TC-gap)", §Verification expects 12. The verbatim content + verification gate are the executable contract; AC line 243 was inherited from an earlier draft (when only ARCH-001 through ARCH-007 existed) and not updated when ARCH-008 through ARCH-012 were added. 12 archetypes is the intended seed.

**Anti-slop boundaries respected**:
- 1 new file (catalog).
- 1 patch pattern (template only — descope reduced, didn't expand scope).
- 0 new tooling (no hook, no skill, no validator, no CI gate).
- 0 new pipeline phases.
- Each archetype = 4 lines (Pattern / First-observed / Probe steps / Severity-and-action).

**Regression fingerprint**:
- BEFORE: bug-archetypes.md non-existent; _TEMPLATE.md md5=c2b707e7, 9 sections, 93 lines.
- AFTER: bug-archetypes.md md5=4ad2b009, 12 archetypes, 84 lines; _TEMPLATE.md md5=e5cc2222, 10 sections, 105 lines.
- Diff = +1 catalog file, +1 section in template. No SUSPICIOUS / SILENT-BREAK rows.

**Parent-cascade check** (per LR-027): Parent = `PLAN_DELIVERABLE_QUALITY_UPGRADE.md`. Pending DQU subplans remaining: SP-DQU-05C, 07, 08, 09, 10, 21–35 (~20+). NOT last → leave parent in `pending/`.

**Forward-apply value**: future neutral-eye audit subplans (whoever authors them next) will auto-load `bug-archetypes.md` via path-scoped rules + see the patched `_TEMPLATE.md` § "Archetype probe results" requirement. Catalog is append-only and grep-friendly; new archetypes go at next free `ARCH-NNN`.
