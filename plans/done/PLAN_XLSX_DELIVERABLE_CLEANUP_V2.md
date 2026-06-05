# PLAN — Workbook cleanup V2: kill the leak classes the green lint was blind to

**Status**: DONE
**Executed**: 2026-06-05
**Identity**: OWNER
**PermissionMode**: acceptEdits
**Parent**: PLAN_XLSX_DELIVERABLE_CLEANUP.md (V1)

## Context

After V1 drove the generated deliverable `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` to a green lint, a fresh no-assumptions, line-by-line `/audit` of the **rebuilt** workbook (484 rows, every cell) against an external IEEE-829/ISTQB review found the V1 token-denylist lint was **structurally blind** to several leak classes still shipping in client cells while `npm run xlsx:lint` reported clean:

1. Terse / code-identifier reasons in the "If Failed Reason" column (8 LI rows: `ServiceCharge`, `JobCosting`, `eSignature`, `multi-invalid`, `batch isolation`, `Threshold step`, `Oracle required`, `Skip Billing one-way lock`).
2. ARIA / framework tokens in shipped cells: `tabpanel` ×5, `Radix` ×2, `listbox`, `role="checkbox" aria-label="…"`, raw `aria-label`/`aria-valuenow`.
3. A humanize-mangled cell (LGL-019) full of code identifiers + broken prose.
4. Internal title tags `[FIXME]` (SSL-031/032), `(FCC)` (LGL-019).
5. Typos: `a table with is visible` (SSL-001), `the the` (NTS-017/033/034).
6. Raw E2E env URL (NTS-001).
7. Overview banner `(mode: list-only)`.
8. Two 100%-empty columns (`Specific Field`, `Tags`).
9. Disposition inconsistency: environment/data-dependency rows marked `Blocked` (connotes app-bug) instead of `Pending Automation` + blank.

## Locked decisions (with Rutvik)

- **All safe fixes** (items 2–9 + the documented subset of item 1).
- **Remove both empty columns.**
- **Leave-as-is (no fabrication)**: the undocumented terse LI reasons + the Skip-Billing behavior contradiction (LI-008 "disables Oracle fields" vs LI-SKIP-BILLING "does NOT disable Oracle Product"). Grandfathered in the widened guard.

## Execution Summary

**Goals met**: the deliverable is clean under a **widened** guard (`npm run xlsx:lint` → 0 vocab / 0 integrity / 0 warnings on 497 rows), 484 TC rows + parity intact (`check:tc-parity` PASS — 380 spec / 484 MD / 484 XLSX), ship-gate clean, and a negative test proves the new C5 guard trips the build.

**What was built**
- **humanize.ts** (`scrubInternalVocab`, single point): `tabpanel`→panel, `Radix`→stripped, `listbox`→dropdown, `role="…"`/`aria-*` markup stripped, full e2e app URL → relative path, internal tags `[FIXME]`/`(FCC)` stripped, `the the` typo backstop.
- **MD source rewrites**: LGL-019 garbled cell rewritten to clean prose + its internal `Implementation rationale`/`Runner`/`FCC group`/`Live finding`/`Future-flip path` sections wrapped in HTML comments (stripped at emit); NTS-022 a11y reworded to professional language; SSL-012 `role=` step + SSL-001 `data-testid` step cleaned; `the the` fixed in NTS-017/033/034.
- **to-xlsx.ts**: dropped `Specific Field` + `Tags` columns (13→11), removed the Overview `(mode: …)` suffix.
- **blocked-reasons.json**: 12 environment-dependency LI rows (LI-022/023/024/024A/044/046/047/048/054/058/059/060) flipped `Blocked`→`Pending Automation` + blank execution + an environment reason, matching AAO-016/LI-057.
- **xlsx-lint-rules.mjs** (the fail-green backstop): added the 8 new vocab bans; new integrity check **C5** (reason must be ≥4 words / not a single code token) + `TERSE_REASON_ALLOWLIST` (8 grandfathered LI rows); Overview banner scan (bare-date rule excluded); trimmed `CHECKED_COLS`.
- **Docs**: LR-ENC-004 extended (clients/encore/CLAUDE.md) with the V2 classes, C5, the allowlist rationale, column removal, and disposition rule.

**Deviations from the plan (evidence-driven, all logged)**
1. **LI-028 is NOT the documented parent-child bug the plan assumed.** Reading the MD (line 501) showed LI-028 = "Service Charge Checkbox Default State" (`Automatable: Yes`, no app-bug); the parent-child bug lives in a different TC (already covered by LI-065/NE-011/012 in V1). **Consequence**: ALL 8 terse LI reasons turned out undocumented (all `Status: Manual` + `Automatable: Yes`, no written blocking cause — the spec author's `// FIXME permanently blocked` labels were never backed by a reason). Per NEVER-ASSUME + the owner's leave-as-is decision + the plan's explicit conditional, **zero terse reasons were reworded**; all 8 were allowlisted. Phase 4 reduced to the env-dependency reclassification only.
2. **CUR-003/004 + PRI-004 "with is" were FALSE POSITIVES** — the cells read "…unselected **with Is** Default disabled" (a legitimate field name). Only SSL-001 was a real artifact. No change made to currency/pricing.
3. **LGL-019 needed 3 build cycles** — my Steps rewrite shifted what the parser's cleanup-extraction captures into Notes, surfacing two nested internal sections (`Live finding`, then `Future-flip path` with `test.fixme()`) that the build self-check caught one at a time (GEN-034 working as intended). Both wrapped in HTML comments.

**NOT done / flagged**
- The 8 terse LI reasons + the Skip-Billing LI-008 vs LI-SKIP-BILLING contradiction **ship as-is per owner decision** (no fabrication; no live walk).
- LI-035/037 "the application disables Save on a maximum-value violation" reason reads like correct behavior yet is `Blocked` — left as-is (flipping needs a judgment call not authorized).
- Field-inventory staleness (SP-AAE-02 / LR-013): the legal/notes/ssl MD edits changed Steps/Expected prose, so the commit hook may demand a ≤14-day field-inventory for those modules. Flagged for the owner at commit time (prose-only — no field facts changed).
- No git commit (owner commits; working tree carries unrelated in-flight `client_deliverable` changes + an untracked `encore-qa-tracker.xlsx` not part of this work).

## Files
- **New**: `plans/done/PLAN_XLSX_DELIVERABLE_CLEANUP_V2.md`.
- **Modified**: `export_test_cases/{humanize.ts,to-xlsx.ts,blocked-reasons.json}`, `scripts/xlsx-lint-rules.mjs`, `clients/encore/specs_planning/test-cases/setup/locations/{locations_legal,locations_notes,locations_shared_setup_locations}_test_cases.md`, `clients/encore/CLAUDE.md`, `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` (rebuilt), `clients/encore/specs_planning/_internal/agent-activity-log.md`.

## Verification
```
npm run xlsx:build          # builds AND self-checks (exit 0, 0/0/0)
npm run xlsx:lint           # PASS — 0 vocab / 0 integrity / 0 warnings (widened rules)
npm run check:tc-parity     # PASS — 380 spec / 484 MD / 484 XLSX
node scripts/verify-no-forbidden.mjs --client=encore   # ship gate clean
# audit re-scan: 0 tabpanel/Radix/listbox/aria/role=/[FIXME]/(FCC)/hostname/the-the/with-is; columns gone; env dispositions consistent
# negative test: inject terse reason → C5 fails the build → reverted
# 8 new BANNED patterns assert-fire on their tokens, 0 false-positives on legit content
```
