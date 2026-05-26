# SUBPLAN_PARITY_04 — Spec Fixes (Easy Modules) [SUPERSEDED]

**Status**: SUPERSEDED
**Superseded by**: `SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md` (file-only items) + `SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md` (verdict-dependent items)
**Superseded date**: 2026-05-26
**Reason**: Split by verdict-dependency. File-only items (account_address comments, auto_addon typecheck, notes parity, LI-EXTRA verify) → W1-04. Verdict-dependent items (currency shady-pass, LGL-015/016/017, PRI rewrite) → W2-08.

### Execution Summary (LR-027)

- Tasks: 6 module spec fixes (currency, legal, pricing, account_address, auto_addon, notes)
- Implemented: 0 (none executed; restructured before run)
- Routed to W1-04: account_address TC-015/021/024 edits, auto_addon typecheck, notes count + GP-4 ID/FCC reconciliation, LI-EXTRA verify (already in MD/CSV/spec)
- Routed to W2-08: CUR shady-pass rewrite (post-W2-06 verdict), LGL-015 (Country selector discovery + implementation), LGL-016/017 (Jira citations), PRI TC-018/019/022 rewrite
- Traceability artifact: `plans/pending/_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md`

---

**Parent**: `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md`
**Phase**: 7 (partial — easy module group) of parent (SUPERSEDED)
**PermissionMode**: auto
**BrowserTool**: cli
**BrowserToolJustification**: Live-verify PRI TC-018/019/022 shady-pass classification before spec rewrite (was deferred from SUBPLAN_01 if not yet resolved).
**Skills**: /execute, /regression-guard, /bugfix (if PRI rows turn out to be real app bugs)
**Identity**: BUILDER (spec authoring/fixing) — Sonnet OK for deterministic edits; Opus required for shady-pass investigation
**Created**: 2026-05-20

## Change Log (for future audit)

- **2026-05-25 (same-day revert)** — Prior 2026-05-25 SP00 cross-thread additions reverted. SP00 was directionally reversed + consolidated in the same session: no `.fixme` stubs are added to specs at any time; SP04 has no stubs to MUTATE. Drift Check "SP00 awareness" subsection + Step 2a "per-module SP00 stub mutation pass" are no longer applicable and were removed. SP04's actual spec-fix work (6 modules: currency/legal/pricing/account_address/auto_addon/notes) is unaffected. Original pre-2026-05-25 SP04 content unchanged. Authoring task at `C:\Users\rutvi\.claude\plans\i-need-u-to-iterative-matsumoto.md`.

---

## Bootstrap (read first)

1. `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — per-module rows in §B for: currency, legal, pricing, account_address, auto_addon, notes
2. `clients/encore/specs_planning/_internal/shady-pass-verdicts-2026-05-20.md` (from SUBPLAN_PARITY_01) — read CUR + PRI + LGL verdicts
3. Each module's MD, CSV (post-SUBPLAN_03), spec, page object — full read for the 6 modules
4. `.claude/rules/specs.md` — LR-019 (baseline state), LR-021 (un-skip before rewrite), LR-022 (no hardcoded counts)
5. `.claude/rules/angular.md` — LR-009..011, LR-026 (dirty-state discipline)

## Drift Check (MANDATORY FIRST STEP — do not skip)

**Evidence discipline binding (per parent §rule 4)**: every claim needs proof — fresh Read/Grep/playwright-cli output, cited with file:line or run-output excerpt. Banned: "I assume", "should be", "probably", "seems to". Every TC "implemented" claim requires actual `--grep "TC-..."` PASS line (not `--list`). Re-Read spec before Edit; spot-Read after. 2-failure stop → artifact-first RCA. Closure requires an Evidence Audit table.

Authored 2026-05-21. Other plans may have landed since. Before any spec edit:

1. **Re-Glob** the 6 specs in scope: currency, legal, pricing, account_address, auto_addon, notes — confirm all still at `clients/encore/specs/locations/` (could have moved or been merged by another restructure).
2. **Re-Grep** for each parent §B claim per module:
   - legal TC-LOC-LGL-015 absent in spec?
   - pricing TC-018/019/022 still assert readOnly+popover (vs invalid-date)?
   - notes spec still has 32 main + 5 HIST tests (37 total)?
3. **Cross-check SP01's shady-pass-verdicts artifact** at `clients/encore/specs_planning/_internal/shady-pass-verdicts-2026-05-20.md` (or whatever date) — confirm the CUR/PRI/LGL verdicts are still applicable to current spec contents.
4. **Read activity log** since 2026-05-21 for sessions touching these 6 specs.
5. **Emit a Drift Note** per module. If >30% of scope is stale → HALT and request re-planning.

---

## Scope (IN)

- **currency**: verify spec assertions honor MD intent per CUR verdict (from SUBPLAN_01); fix any title that's misleading
- **legal**: implement TC-LOC-LGL-015 in spec (currently missing); for TC-016/017 cite Jira ticket inline in MD per LGL verdict
- **pricing**: act on PRI verdict — if SHADY, rewrite TC-018/019/022 to test invalid-date entry; if HONEST, document adaptation in MD
- **account_address**: reconcile TC-015 wording (already MD-edited in SUBPLAN_03); spec assertion must match the chosen wording. Verify TC-021 + TC-024 DROPPED comments exist in spec or are intentionally absent
- **auto_addon**: spec already automates 20/20; verify after MD/CSV re-export, no spec change needed unless new MD edits surface drift
- **notes**: verify spec covers all 37 MD TCs (32 main + 5 HIST sub-spec) — count `test()` per TC ID; implement any missing
- LR-050: enumerate stale-slop IN-SCOPE for these 6 specs — outdated comments, dead imports, etc.

## Scope (OUT)

- management_history, shared_setup_locations, local_information (SUBPLAN_PARITY_05)
- local_office_* (SUBPLAN_PARITY_06)
- left_panel new spec (SUBPLAN_PARITY_07)
- smoke_seed (SUBPLAN_PARITY_06)
- CI guardrails (SUBPLAN_PARITY_08)

## Step-by-step

1. **`/regression-guard` snapshot** before any edit
2. **Read shady-pass verdicts** for CUR, PRI, LGL rows
3. **currency**: spot-check 3 spec assertions per CUR verdict; if "downgraded paraphrase" flagged, replace with content-anchored assertions matching MD intent (e.g., assert column header NAMES, not just count). Per LR-019, baseline TC-001 must stay first.
4. **legal**: implement TC-LOC-LGL-015 in `specs/locations/location-legal.spec.ts`. Use existing page object methods; mirror neighboring TC patterns. Add `// Test case: <MD title>` comment.
5. **legal cont.**: for TC-016/017 OMITTED rows in spec, append `// OMITTED-BUG: NM-NNNN` comment (where NNNN comes from SUBPLAN_01's Jira filing)
6. **pricing**: if SHADY per PRI verdict, rewrite TC-018/019/022 to do `await page.fill(dateInput, '13/45/2026')` + assert error indicator (per MD). If HONEST, leave spec; ensure MD documents the adaptation.
7. **account_address**: verify TC-015 spec uses the precise wording chosen in SUBPLAN_03; adjust if drifted. For TC-021/024: add inline `// DROPPED: <reason from MD>` comment near where they would have lived.
8. **auto_addon**: type-check + run spec; confirm green after MD/CSV re-export
9. **notes**: count `test('TC-LOC-NTS-` and `test('TC-LOC-NTH-` occurrences across main spec + hist sub-spec; cross-check vs MD TC IDs (37 expected). Implement any missing.
10. **Per-spec local run**: `npx playwright test --grep "TC-LOC-{CUR,LGL,PRI,ACC,AAO,NTS}-"` — confirm green
11. **Full module run** for these 6 specs: `npx playwright test clients/encore/specs/locations/location-{currency,legal,pricing,account-address,auto-addon,notes}.spec.ts`
11a. **Comment sanity + exhaustive discovery** (per parent §"In-depth quality" + §"Mission: find all + permanent prevention"): for each of the 6 specs touched:
  - **(A)** Run `node clients/encore/scripts/ci/check-comment-sanity.mjs clients/encore/specs/locations/location-{currency,legal,pricing,account-address,auto-addon,notes}.spec.ts` — catalog catches
  - **(B)** Manual scan for NOVEL patterns beyond catalog (agent prompt fragments, console.log/debug leftovers, commented-out blocks without ticket, unprofessional dev humor, AI-generated phrasing tics)
  - **(C)** Every new pattern → append to `clients/encore/scripts/ci/red-flag-patterns.json` with `{discovered_by_subplan: "SP04", discovered_date}`
  - **(D)** Re-run scripts — confirm catches
  - **(E)** Clean inline
  - **(F)** Re-run — must exit 0
  - **Closure**: report `Catalog growth: +N patterns`.
12. **`/regression-guard` diff**: expected: 6 spec edits (some larger than others), 0 broken imports, 0 dead exports, 0 comment-sanity findings

## Verification

- All 6 specs run green individually
- All 6 specs run green together (run-all)
- TC-LOC-LGL-015 has a passing `test()` in spec
- TC-LOC-LGL-016/017 carry `// OMITTED-BUG: NM-NNNN` comments
- Pricing TC-018/019/022 either tests invalid-date (SHADY→fixed) or carries adaptation comment (HONEST)
- Notes spec has `test()` for every MD TC ID (37 total)
- No `test.skip` / `test.fixme` in these 6 specs without adjacent Jira comment
- `/regression-guard` post-snapshot matches expectation

## Reflect + Graduate (mandatory before /final-q)

Per parent §rule 5. Workflow per root-cause mistake found:

1. **Reflection seed for SP04** — likely mistakes to investigate:
   - Why did spec titles drift from MD/CSV titles? No existing convention/rule? Or one exists and didn't fire?
   - Why did legal TC-015 get skipped during original automation pass? No existing rule that says "every MD TC must have a spec test"? — that's what D5/D6 CI checks add structurally.
   - Why did pricing TC-018/019/022 spec adapt without documenting the adaptation in MD? Existing rule: feedback_browser_interaction_verify_first.md / GEN-021 ("if test case wrong, raise it" pattern). Did GEN-021 fire? If yes, why no MD doc?

2. **Pre-graduate check** — Grep agent-mistakes.md / LEARNED_RULES.md / .claude/rules/ / feedback_*.md / clients/encore/CLAUDE.md.

3. **Decision**:
   - Title-drift: likely no existing learning → add new LR-NNN, but the structural fix is D5/D6 CI checks (already scoped to SP08). New learning cross-links to those.
   - TC-015 skip: likely covered by ALL-071 / COP-009 (spec-markdown TC parity). Did either fire? If yes → structural escalation (sharper trigger + CI). If no → tighten trigger.
   - Pricing adaptation undocumented: likely existing GEN-021 covers it → structural escalation (force "test adapted because X" comment via D8 CI check?).

4. **Emit Reflection table** in `/final-q`:

   | Root-cause mistake | Already-existing learning? | Action taken |
   |---|---|---|

5. **Anti-duplicate check** — Grep similarity; >70% → rollback + structural escalation.

Closure-gate rejects if Reflection table missing, near-duplicate added, or mistake mapped to "more reading" actions.

## Closure

- LR-028 activity log entry
- LR-050 stale-slop cleanup roster
- `/final-q` GREEN required
