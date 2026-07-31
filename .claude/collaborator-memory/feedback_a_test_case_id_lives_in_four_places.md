---
name: feedback_a_test_case_id_lives_in_four_places
description: "A test-case ID lives in four artifacts, not three — markdown source, spec title, generated workbook, delivery manifest. And the deliverable builder archives HEAD, so uncommitted work is invisible to the payload"
metadata:
  node_type: memory
  type: project
  originSessionId: 97fc2a8f-d682-49e5-ad02-431273e486b4
  modified: 2026-07-31T05:13:27.776Z
---

Renumbering or renaming an Encore test-case ID touches **four** artifacts. Miss one and a gate stops you
several steps later, usually after other work has been layered on top:

1. **`clients/encore/specs_planning/test-cases/**/*.md`** — the **source**. `npm run xlsx:build` regenerates
   the workbooks from it. **Change this first.** Rebuilding from stale markdown silently reverts the ID in
   every workbook and looks like the renumber never happened.
2. **`clients/encore/tests/**/*.spec.ts`** — the ID leads the test title.
3. **`clients/encore/testcases/**/*.xlsx`** — the per-module workbook *and* the matching sheet inside
   `encore_test_cases.xlsx`. A `.xlsx` is a zip; use `exceljs`, never `grep`.
4. **`scripts/deliverable/delivery-manifest.encore.json`** — `tc_ids[]` per module. The delivery scope gate
   fails on any spec↔manifest mismatch in either direction.

Also required when a **prefix** changes: `export_test_cases/module-codes.json` must register the new
sub-code and own the sheet the case sits on, and `KNOWN_SUB_CODES` in the sibling `types.ts` must match.
Otherwise the pre-commit naming guardrail (G6e) rejects the commit — correctly; the registry is what is
stale, not the ID.

**The second trap, and it wastes more time than the first:** `scripts/ship-branch.sh` builds the payload
with `git archive HEAD`. **Uncommitted work does not exist to the deliverable.** A payload built against a
dirty tree carries the *old* content while the manifest carries the new, producing mismatches that look
like a broken renumber. Commit first, then build.

**Why:** on 2026-07-31 an owner-approved renumber (`TC-CPR-OVR-030..166` → `029..165`, one case out to
`TC-CPR-NAV-001`) was applied to three of the four artifacts. It then took six more worker dispatches to
finish: 22 phantom gate violations from the `HEAD` gap, a worker that "fixed" them by reverting the
renumber backwards to match stale `HEAD`, an orphaned ID left in the manifest, a sheet-ownership guardrail,
and finally the markdown. All of it avoidable by moving all four together, in source-first order.

**How to apply:**
- Enumerate all four (plus the two registry files if a prefix changes) **in the ticket**, before dispatching.
- Order: markdown → rebuild workbooks → specs → manifest → verify set-equality both directions:
  `comm -3 <(spec ids) <(manifest ids)` must be empty.
- **Commit before building any payload.** Related: [[feedback_prune_level_comes_from_the_delivered_branches]].
- A gate that fires after a data migration is usually pointing at the artifact you forgot, not at a bug in
  the gate. Never resolve it by moving data backwards —
  [[feedback_override_cannot_convert_missing_to_evidence]] is the same failure shape.
