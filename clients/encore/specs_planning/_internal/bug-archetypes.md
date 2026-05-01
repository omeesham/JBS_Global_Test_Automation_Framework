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
- **Probe steps**: Two distinct behaviors to test [catalog-refinement 2026-04-28]: **(A) Pure-non-numeric** — type pure alpha ("abc") or special chars + Tab; expected: field reverts to last valid value, aria-invalid stays false. **(B) Ambiguous-numeric** — paste multi-decimal ("1.2.3"), scientific notation ("1e5"), leading-zero strings ("000123"), pure negative ("-5"); expected: field accepts partial parse, boundary check fires (aria-invalid=true if value outside min/max). For each numeric/spinbutton field on the module: (1) clear field; (2) test (A) — type "abc", blur, observe; (3) test (B) — paste "1.2.3", blur, observe; (4) check Save state in each scenario; (5) record both behaviors per field.
- **Severity / action**: bug — file `BUG-{MODULE}-NNN.json` per LR-034. NOT a bug if (A) reverts AND (B) partially-accepts-with-aria-invalid. IS a bug if (A) leaves invalid value with Save enabled (LR-011 violation) OR (B) accepts out-of-range value silently (no aria-invalid, no error).

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
- **Pattern**: A parent checkbox that should gate child fields/checkboxes (per the parent-enables-children pattern used elsewhere) leaves child controls enabled or checked when parent is unchecked. **Sibling-modifier subtype** (LDW/C&C/Service Charge variant): the percentage input child is correctly gated by the parent, but a "calc-on-net-amount" / behavioral-modifier sibling checkbox is NOT — it stays checked + enabled when parent unchecked. This subtype is missed if the probe only enumerates the percentage input as a child.
- **First observed**: BUG-LI-002 (SP-DQU-04, 2026-04-27) — Service Charge children active when allow-service-charge=unchecked. **Sibling-modifier subtype** (PLAN_FIND_BUGS_LI_FOLLOWUP, 2026-04-28) — BUG-LI-003: Apply LDW + Apply C&C calc-on-net sibling checkboxes stay active when parent unchecked (same systemic pattern across 3 LI groups).
- **Probe steps**: For each parent-child checkbox group on the module (identify by section grouping or naming convention) — (1) read parent state; (2) **enumerate ALL siblings within the group, not just the obvious percentage/value child** — include calc-on-net-amount checkboxes, "show-as-X" modifier checkboxes, "include-in-Y" toggles, etc.; (3) read each sibling's state + disabled flag in parent-checked AND parent-unchecked states (toggle the parent if needed); (4) if parent=unchecked AND any sibling=checked OR enabled, record the violation. **Catalog-refinement 2026-04-28** [catalog-refinement]: explicitly enumerate sibling-modifier checkboxes when scanning a parent group; the SP-DQU-04 audit and the SP-DQU-05 fix both missed BUG-LI-003 because their probe only looked at the percentage input child.
- **Severity / action**: bug — file `BUG-{MODULE}-NNN.json` per LR-034. If multiple parent groups in the same module exhibit the same subtype, file ONE bug covering all instances rather than per-group; cite the systemic pattern in `relatedBugs`.

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
