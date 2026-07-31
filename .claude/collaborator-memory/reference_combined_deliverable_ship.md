---
name: reference_combined_deliverable_ship
description: "Runbook — combining ≥2 delivered encore-mock branches into one main via ship-branch.sh, with a scrub"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 8fa0bbdb-8480-4660-bab5-19263039f21e
  modified: 2026-07-21T17:03:54.854Z
---

Combining multiple already-delivered encore-mock branches into one `main` (or scrubbing a not-yet-delivered sprint out of a combined ship). Full worked runbook + evidence: `plans/done/PLAN_ENCORE_COMBINED_MAIN_DELIVERY.md` (2026-07-21, combined locations+corporate-pricing minus NM-2268/69/70).

Non-obvious traps that cost cycles — check these BEFORE building:
- **`ship-branch.sh --tcs` is a KEEP-list (`spec-trim.mjs --keep=`), NOT exclude, and it runs against EVERY surviving spec** (range endpoints must exist in each file) → `--tcs` FATALs on a multi-spec combined ship. To scrub TCs, pre-trim on a throwaway `delivery/*` branch, ship with NO `--tcs`.
- **`src/` ships WHOLE and the deny-list excludes `NM-####` by design** → a spec-only trim can leak an `NM-####` comment in a shipped page-object with the gate passing. Scrub the src/page/selector too.
- **A "sync" commit is often MIXED** (override work + unrelated team-sync of ~65 files). Revert ONLY the ticket-specific paths to `<commit>^`, never the whole commit. VERIFY the xlsx delta `<commit>^→HEAD` is exactly the target rows (exceljs) — else a file-level revert loses other modules' latest data.
- **`check:tc-parity` (ALL-071) blocks the commit unless spec↔MD↔XLSX agree** → the override MD files under `specs_planning/` (non-shipping, stripped by ship-branch) must still be reverted in lockstep or the commit aborts.
- **`grep` cannot see inside `.xlsx`** → verify workbook scrub with an exceljs cell-read, not grep.
- Reference for "delivered set" = the delivered BRANCHES, never the stale `encore-mock/main`. Prove no over/under-deliver with a per-spec TC-parity diff (OVER=∅/UNDER=∅) — don't assume the flagged ticket is the only delta.
- ship-branch archives committed HEAD (not the working tree) → uncommitted WIP is safe; leave the repo back on the user's original branch at the end. Related: [[feedback_ticket_literal_paths]], [[feedback_gate_push_on_denylist]].
