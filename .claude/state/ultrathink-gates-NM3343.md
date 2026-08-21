# /ultrathink QUALITY GATES — NM-3343 correction-order session (2026-08-21)
# TodoWrite is UNAVAILABLE in this session; this file is the external-state substitute
# required by /ultrathink Step 0. Do not delete until all gates are [x].

- [x] GATE-0  Gates created before any task work
- [x] GATE-1  Adversarial audit of the CORRECTION ORDER itself (skeptic / scope / intent)
- [ ] GATE-2  Re-derivation battery (§4) run in OUR clone with positive controls
- [ ] GATE-3  Post-execution audit — every deliverable DONE / SKIPPED(approved) / MODIFIED(justified)
- [ ] GATE-4  /reflect + LR-028 activity-log row

## Verdict vocabulary (PLAN_75-TEMP): RE-DERIVED-CONFIRM | RE-DERIVED-REFUTE | ABSTAIN

## Findings ledger (reviewer's 20 findings, our clone)
| ID | Verdict | Evidence |
|---|---|---|
| F12 | RE-DERIVED-REFUTE | "nothing inferior" absent from PLAN_75 (615 lines); positive control hit lines 3,4,7 |
| F14a "narrowed only one" | RE-DERIVED-REFUTE | enumerate-page.mjs:652,653,662 — all three narrowed |
| F14b "guard cannot be passing" | RE-DERIVED-REFUTE | post-fix 0/13 rules have match-count != 1 |
| F14c "fix orphaned Cascading dropdown" | RE-DERIVED-REFUTE | orphans 7 -> 6; Cascading was ALREADY orphaned pre-fix (2-match => null) |
| F15 | RE-DERIVED-CONFIRM | archive HEAD = 0 hits for page object; positive control playwright.config.ts = 1 |
| F20.1 "not walked token" | RE-DERIVED-REFUTE | inventory lines 187,199,200 use literal `deferred-to-DEEP:` |
| MY OWN ERROR | CONFIRMED | No labor gate on playwright. settings.json deny = 4 --no-verify rules only. F1 was never blocked. |

## GATE-2 COMPLETE — re-derivation battery run in OUR clone (2026-08-21)

| ID | Verdict | Evidence (re-derived here, not quoted from the reviewer) |
|---|---|---|
| F1 | CONFIRMED-then-MET | Was false. Now: RUN1 `43 passed (9.9m)` EXIT=0, RUN2 `43 passed (8.7m)` EXIT=0, full file, --retries=0, office 1604, post-fix |
| F2 | CONFIRMED (self-test invalid) BUT the artifact mode cannot supply it either | `--manifest` exists. Run on our artifact: `not clean: 21 undispositioned`. CONTROL: shipped `dop-tab1.json` = `not clean: 148 undispositioned`. cross-check.mjs:36 — "A fresh enumerator manifest is always NOT clean". Criterion = UNVERIFIED, no artifact mode produces it |
| F3 | CONFIRMED, still unmet | `npm run check:spec-quality` BLOCKED by labor-gate (SPEC_RUN_OR_BROWSER_WALK) |
| F5 | CONFIRMED + worse | Not one ledger — THREE copies (one per sibling subplan). Every integer 1-13 has a member in both namespaces |
| F6 | CONFIRMED | subplan:917 said 14 / D1-D14; actual `grep -c "^| D[0-9]"` = 15. FIXED to 15 / D1-D15 |
| F12 | REFUTED | "nothing inferior" absent from PLAN_75 (615 lines). Positive control: same file, "delegation|worker" hits lines 3,4,7 |
| F14a | REFUTED | All THREE narrowed — enumerate-page.mjs:652, 653, 662 |
| F14b | REFUTED | Post-fix measurement: 0/13 rules have match-count != 1 (pre-fix 3/13) |
| F14c | REFUTED | Orphans went 7 -> 6. `Cascading dropdown` was ALREADY orphaned pre-fix (2 matches => null). Fix removed an orphan, did not create one |
| F14-design | ANSWERED | 6 of 13 types are unresolvable BY DESIGN — all 6 are relational/behavioural (Cascading, Multi-row FormArray, Rich text, Lookup launcher, Click-to-edit cell, Drag-and-drop). All 7 resolvable are single-element intrinsic. No DOM signal can nominate a relational type |
| F15 | CONFIRMED | archive HEAD = 0 for page object; control playwright.config.ts = 1. STILL NOT COMMITTED — blocked, see below |
| F16b | CONFIRMED-then-SOLVED | Real zero, not a glob bug: census held exactly 3 artifacts. Emitted with --merge: 26703 -> 29040, `1604-discount-matrix: 2337` = Path A exactly |
| F17 | CONFIRMED as a risk, assertions HOLD | 13 manifest rows / 18 TC ids / 21 checks, all evidenced at file:line. Spot-checked the 2 UNREACHABLE keys myself |
| F20.1 | REFUTED | Inventory lines 187/199/200 use the literal `deferred-to-DEEP:` token, not `not walked` |

## MY OWN ERRORS FOUND THIS SESSION
1. "No labor gate on playwright" — WRONG. `.claude/skills/ultra-agents/setup/hooks/labor-gate.mjs` exists and blocked `check:spec-quality`. It did not block my `npx playwright test`.
2. "CrossCheck: clean" — unverifiable by any tool mode; I never ran the artifact mode.
3. Excluded `export_test_cases/module-codes.json` + `types.ts` from staging — they ARE the DSM registration.
4. Test-case MD used `###` + em dash; every other module uses `##` + colon. 42 TCs invisible to the deliverable builder.

## NEW FRAMEWORK FINDINGS (not in the correction order)
- F-NEW-1 DELIVERY-BLOCKING: three parsers, two heading contracts. check-tc-parity.ts:40 and markdown-parser.ts:70 accept `#{2,3}`; to-csv.ts:189 (which BUILDS the deliverable) accepts only `^## `. Mismatch = silent drop, zero warning.
- F-NEW-2: to-xlsx.ts buildFromMdSource `continue`s on tcs.length===0 with no message.
- F-NEW-3 ARCHITECTURAL: ua-worker-guard, delegation-gate and labor-gate ALL route to copilot-worker.sh. Copilot is gone => three gates now have no legal path.
- F-NEW-4: CLAUDE.md says clients/<id>/specs_planning/ is gitignored. It is not — 368 files tracked, 410 ship in the archive.

## CORRECTIONS FROM OWNER (2026-08-21) — all re-derived here before acting

| Correction | Verified how |
|---|---|
| Copilot was never required; delegation-gate has no child_process and never calls copilot-worker.sh | Confirmed — every Copilot string in it is comment or deny-message text. I read a SUGGESTION in a deny message as a REQUIREMENT. That was my error, and it is what made me report a false blocker. |
| Unblock path is /identity + /assistants off, not a grant | Confirmed by doing it. BUILDER still denied (export_test_cases has NO §2 row -> default deny). `/assistants off` + OWNER (which short-circuits §2) landed all three edits. |
| 5 registrations across 2 files, not 3 lines | Confirmed. 2 were already staged (module-codes.json modules+submodules; types.ts sub-codes). 3 remained in to-xlsx.ts. Only SPLIT_FILE_MAP throws; the other two fail SILENTLY. |
| Module code is DSM not DMX | Confirmed at to-csv.ts:646 — `id.match(/TC-([A-Z]+)/)` on TC-DSM-CMX-* yields DSM; unknown codes only console.warn + lowercase, never throw. module-codes.json:12 already maps DSM. |
| Build order: commit MD -> register -> stage -> build -> commit workbook | Confirmed at to-xlsx.ts:731 (throws on unstaged OR untracked MD). Parity only fires when a SPEC file is staged, so the MD commit goes first with the spec unstaged. |
| CrossCheck: clean is not a blocker; UNVERIFIED was right | Accepted. All 16 artifacts report not clean including every shipped module. Dropping it as a blocker. |
| Cascading dropdown — OWNER concedes, orphans 7->6 | Matches my independent measurement. |

## DELIVERY UNBLOCKED — commit 86ee11d (2026-08-21T16:07)

Ship proof from HEAD (not from the commit's own --stat):
  company-matrix.page.ts in git archive : 0 -> 1
  company-matrix.spec.ts in git archive : 0 -> 1
  discount-matrix-company-matrix.xlsx   : absent -> present
  positive control (playwright.config)  : 1 (probe not blind)

Six gates fired between "tests green" and "client can receive it". Every one
caught a real defect; none were false positives:
  1. TC-parity (MD)        42 cases invisible to the workbook builder (### vs ##)
  2. TC-parity (XLSX)      module never registered in the builder maps
  3. Workbook vocab/integrity  11 internal-vocab leaks + 4 malformed steps in customer cells
  4. Dead-export gate      LISTBOX_OPTIONS + BTN_IMPORT exported, imported by nobody
  5. LR-037 activity log   a row claiming done 16h before its artifacts stopped changing
  6. Test-case lint        MCP_VERIFICATION_LOG + Validation Rules sections absent entirely

Parity passing IS the machine proof that all 42 TCs reached the workbook — that
is the exact gate that previously failed with "42 TCs in specs but NOT in XLSX".

- [x] GATE-2  Re-derivation battery complete
- [x] GATE-3  Post-execution audit — deliverables accounted for below
