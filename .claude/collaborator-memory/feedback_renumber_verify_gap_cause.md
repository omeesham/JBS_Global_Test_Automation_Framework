---
name: feedback_renumber_verify_gap_cause
description: "Before renumbering \"gaps\" in a multi-sheet/multi-file deliverable, verify WHY each gap exists — relocated cases keep old IDs and a naive renumber mints duplicates."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 933ccebd-b06f-40d8-a219-060d5c22fe0f
---

When a deliverable spans multiple sheets/files (e.g. the Encore `encore_test_cases.xlsx`
per-module sheets), a missing ID in one sheet's sequence is **NOT proof the case was deleted**.
It may have been **relocated** to another sheet/spec while keeping its original prefix.

**Why:** On 2026-06-05 (PLAN_TESTRAIL_DEMO_EXCEL_AND_DELIVERABLE_RETITLE) the plan asserted
`TC-LOC-NTS-028/029/030/031/032/038` were "deleted HIST-notes gaps" to be reused by renumbering
survivors `033→028…`. They were actually **live HIST col-69 tests moved to the
management_history sheet** (still carrying the `TC-LOC-NTS-` prefix). A naive
"renumber survivors into the gaps" would have minted **duplicate IDs** in the deliverable —
the exact defect the client reviewer would flag first. Caught only because the sanity-check
grepped every `TC-LOC-NTS-` reference repo-wide (incl. the MGH spec) before touching anything.

**How to apply:** before any renumber that "closes gaps", for EACH gap classify the cause —
(a) genuine deletion (ID exists in NO spec, NO other sheet, NO xlsx), (b) relocated (live under
another sheet/spec → leave it, or re-ID to the host module's prefix with user sign-off), or
(c) intentional reserved/sub-series. Only close genuine-deletion gaps, and HALT-and-ask if a
close would collide with a live ID anywhere (LR-046). Grep the WHOLE repo (ripgrep skips
gitignored `specs_planning/` — use a non-gitignore-aware grep for the MD source). Graduation
candidate → agent-mistakes.md (ALL-*) / a renumber-discipline LR. Embedded in
`plans/pending/SUBPLAN_TESTRAIL_DEEP_SWEEP.md` Phase 1 for the next renumber pass. Related:
[[feedback_consult_artifacts_before_asking]].
