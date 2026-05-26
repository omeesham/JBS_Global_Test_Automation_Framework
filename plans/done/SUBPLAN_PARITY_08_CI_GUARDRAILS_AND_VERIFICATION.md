# SUBPLAN_PARITY_08 — CI Guardrails + Full-Suite Verification [SUPERSEDED]

**Status**: SUPERSEDED
**Superseded by**: `SUBPLAN_PARITY_W1_05_CI_LOCAL_VALIDATORS.md` (D3-D10/D12-D14 script authoring) + `SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md` (D11/D15/D16/D17 + CI wire + Phase 9 + final report + parent closure)
**Superseded date**: 2026-05-26
**Reason**: Split per auditor R2-P2-3 — script authoring (file-only) vs CI wiring + cron + PR enforcement + repo-wide drift-back sweep (e2e + full-suite). Allows local validators to be authored immediately while e2e is down.

### Execution Summary (LR-027)

- Tasks: D3-D17 CI checks + Phase 9 full-suite run + final parity report + parent plan closure
- Implemented: 0 (none executed; restructured before run)
- Routed to W1-05: D3-D10 (header count, automation path, MD↔spec bijection, unjustified skip, bare count, no-op asserts, assertionless tests) + D12 D13 D14 (CSV + MD + comment sanity script bodies — script reused from W1-02 + multi-file invokers)
- Routed to W2-09: D11 (weekly cron), D15 (PR template), D16 (catalog growth tracking), D17 (drift-back sweep on entire deliverable), CI wiring (pre-commit + GH Actions PR check), Phase 9 (`npx playwright test clients/encore/specs/`), final parity report, parent plan closure per LR-027
- Traceability artifact: `plans/pending/_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md`

---

**Parent**: `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md`
**Phase**: 8 + 9 of parent (SUPERSEDED)
**PermissionMode**: auto
**BrowserTool**: none (CI authoring) + cli (only for the final full-suite run if needed)
**Skills**: /execute, /regression-guard
**Identity**: GARDENER (CI + framework hygiene)
**Created**: 2026-05-20

## Change Log (for future audit)

- **2026-05-25 (same-day revert)** — Prior 2026-05-25 SP00 cross-thread additions reverted. SP00 was directionally reversed + consolidated in the same session: no `.fixme` stubs added to specs, no `BLOCKED-BY-PARITY-PATCH-SP00` markers anywhere, no SP00-stub-lifecycle to enforce. D7 restored to pre-2026-05-25 form (no SP00 transitional marker in accepted set). NEW D18 (zero-leftover-stub gate) and NEW D19 (git-blame mutate-not-delete enforcement) removed entirely — both guarded nonexistent stubs. D5 + D6 fixme-counting clarification removed (no fixme stubs from SP00). Step-by-step Step 10a + Step 10b removed. Step 12 + Verification + Phase 9 references to D18 / SP00 markers removed. SP08's actual CI guardrail work (D3-D17) unaffected. Original pre-2026-05-25 SP08 content unchanged. Authoring task at `C:\Users\rutvi\.claude\plans\i-need-u-to-iterative-matsumoto.md`.

---

## Bootstrap (read first)

1. `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — sections D3..D11, Phase 9 verification
2. SUBPLANs 01..07 closure notes (all 7 must be GREEN before this subplan runs)
3. Existing CI config: `.github/workflows/*.yml`, `.husky/`, pre-commit hooks at `clients/encore/scripts/preflight.*`
4. `plans/CONVENTIONS.md` — house style for new CI checks

## Drift Check (MANDATORY FIRST STEP — do not skip)

**Evidence discipline binding (per parent §rule 4)**: every claim needs proof. "SP01..07 all closed" requires reading each `/final-q` GREEN artifact, not assumption. "Every parent §B row resolved" requires per-row Grep evidence in the post-fix codebase. Phase 9 "full suite green" requires actual `npx playwright test clients/encore/specs/` run output (with `0 failed` line), not `--list`. Every CI check authored requires a unit test that exercises both pass + fail input. Banned: "I assume", "should be", "probably", "seems to". 2-failure stop → artifact-first RCA. Closure requires an Evidence Audit table.

Authored 2026-05-21. Other plans may have landed since. Before authoring any CI script:

1. **Confirm SP01–SP07 are ALL closed** — read each subplan's `/final-q` artifact. If any subplan is still pending, HALT (Phase 9 verification can't reach `0 failed` if upstream work isn't done).
2. **Re-Glob** `.github/workflows/`, `.husky/`, `clients/encore/scripts/preflight.*` — confirm CI host paths still valid (could have moved).
3. **Re-Grep** existing scripts for the D3–D11 checks — any may have been added by another plan; deduplicate before authoring.
4. **Re-Read parent's Findings table** — confirm every row is now RESOLVED (implemented / Jira-cited / MD-documented-honest); if any row is still open, route back to its owning SUBPLAN before continuing.
5. **Read activity log** for entries since 2026-05-21 touching `.github/`, `scripts/ci/`, or any CI surface.
6. **Emit a Drift Note**. If any upstream subplan incomplete or scope stale → HALT and request re-planning.

---

## Scope (IN)

- **D3**: CI check — MD header `Test Cases: N` must equal body `## TC-` count
- **D4**: CI check — MD `**Automation File**:` path must point at an existing `.spec.ts`
- **D5**: CI check — every MD `## TC-XXX-NNN:` has a matching `test('TC-XXX-NNN:` in the named spec
- **D6**: CI check — every spec `test('TC-XXX-NNN:` has a matching MD entry
- **D7**: CI check — forbid `test.skip` / `test.fixme` without an adjacent comment `// BLOCKED-BY: NM-NNNN` (Jira ticket) or `// OMITTED-BUG: NM-NNNN`. Scan: `clients/encore/specs/**/*.spec.ts`. Script: `clients/encore/scripts/ci/check-no-unjustified-skip.mjs`
- **D8**: CI check — forbid bare `toBeGreaterThan(0)` / `toBeLessThan(99999)` count assertions on TCs where MD declares exact count
- **D9**: CI check — forbid empty `catch {}` + `expect(true).toBe(true)` no-op asserts
- **D10**: CI check — every `test('TC-...` must have ≥1 `expect(` or `expect.poll(` in its body
- **D11**: Coverage-drift weekly cron — diff MD TC-count vs spec test-count per module; flag silent removals
- **D12**: **CSV cleanliness CI check** — wire `clients/encore/scripts/ci/check-csv-sanity.mjs` (authored in SP03) into pre-commit + PR CI. Must run on every change to `clients/encore/test_cases_csv/**/*.csv` OR `clients/encore/specs_planning/test-cases/**/*.md` (MD edits regenerate CSVs). Blocks merge on any content leak (agent strings, plan refs, framework paths, `cloudapps-e2e.encoreglobal.com`), character red flag (BOM, smart quotes, mojibake, mixed CRLF/LF), formatting leak (markdown leftover, HTML entities), or structural red flag (empty required cells, duplicate TC IDs, schema mismatch).
- **D13**: **MD cleanliness CI check** (companion to D12) — run the same content + character + formatting checks on `clients/encore/specs_planning/test-cases/**/*.md` source files, since CSVs re-export from MDs. Catches leaks at the source.
- **D14**: **Code-comment sanity CI check** — wire `clients/encore/scripts/ci/check-comment-sanity.mjs` (authored in SP03) into pre-commit + PR CI. Must run on every change to `clients/encore/specs/**/*.spec.ts`, `clients/encore/src/pages/**/*.page.ts`, `clients/encore/src/selectors/**/*.ts`, `clients/encore/src/data/testdata/**/*.ts`, and `clients/encore/scripts/**/*.mjs`. Blocks merge on any code-comment red flag per parent §"In-depth quality" list (agent identity strings, plan/subplan refs in body, LR-NNN cites in code, framework jargon, personal names, untracketed TODOs, casual language, AI self-references, internal path leaks, debug markers, stale dates, hardcoded env URLs).
- **D15**: **In-depth quality gate (PR template)** — add a PR checklist requiring authors confirm: (a) every artifact touched in the PR was scanned for the parent §"In-depth quality" red flags, (b) any findings were cleaned inline (not deferred), (c) CSV + MD + comment sanity scripts all exit 0 locally. CI fails the PR if the checklist boxes are unchecked AND any scan finds findings.
- **D16**: **Catalog-growth tracking** — `clients/encore/scripts/ci/red-flag-patterns.json` is append-only. CI check that fails any PR which DELETES an entry from the catalog (entries can only be added). Per-PR diff inspector reports `Catalog growth: +N patterns`. Weekly review log emitted at `clients/encore/reports/red-flag-catalog-growth-<YYYY-WW>.json` so the team sees what new patterns subplans discovered.
- **D17**: **Drift-back prevention sweep** — final action of Phase 9 verification: run both sanity scripts against the ENTIRE `clients/encore/` deliverable (not just files touched in this plan) to confirm zero residual red flags ANYWHERE. If any old file outside this plan's scope has a red flag, file a follow-up subplan to clean it. Goal: at parent-plan close, the entire client deliverable is sanity-clean and the catalog catches any future regression permanently.
- **Phase 9**: full-suite verification — every check above green; full `npx playwright test clients/encore/specs/` green; final parity report at `clients/encore/specs_planning/audits/parity-final-2026-MM-DD.md` summarizing the post-fix state.

## Scope (OUT)

- Any spec / MD / CSV / page-object / selector / test-data edits (those landed in SUBPLANs 02–07)
- Investigative work — anything that requires re-classifying a shady-pass must have been resolved upstream

## Step-by-step

1. **`/regression-guard` snapshot**
2. **Locate CI host**: GitHub Actions vs Husky vs pre-commit — pick the right home for each check
3. **D3**: script `scripts/ci/check-md-header-count.mjs` — reads each MD's `Test Cases: N` and counts `## TC-` sections; exit 1 on mismatch
4. **D4**: script `scripts/ci/check-md-automation-path.mjs` — parses every `**Automation File**:` line; `fs.existsSync` each path; exit 1 on missing
5. **D5 + D6**: script `scripts/ci/check-md-spec-bijection.mjs` — bijective check between MD TC IDs and spec `test()` IDs per module
6. **D7**: script `scripts/ci/check-no-unjustified-skip.mjs` — regex scan for `test\.(skip|fixme)\(` + check next 3 lines or preceding line for `// (BLOCKED-BY|OMITTED-BUG): NM-\d{4}`. Hard-fail with "unjustified skip" message on missing marker.
7. **D8**: script `scripts/ci/check-no-bare-count-asserts.mjs` — flag `toBeGreaterThan(0)` / `toBeLessThan(99999)` paired with TC-IDs whose MD declares exact count (cross-reference)
8. **D9**: script `scripts/ci/check-no-no-op-asserts.mjs` — regex scan for empty `catch {}` and `expect(true).toBe(true)`
9. **D10**: script `scripts/ci/check-test-has-assertion.mjs` — parse each `test(` body, require ≥1 `expect(` or `expect.poll(`
10. **D11**: GitHub Actions workflow at `.github/workflows/parity-drift-weekly.yml` — cron `0 13 * * 1` (Monday 1pm UTC); runs D3–D6 + diffs spec count vs prior commit
11. **Wire all D3–D11 into pre-commit + CI**: `.husky/pre-commit` or `clients/encore/scripts/preflight.mjs`; also a GH Actions job that runs on PR.
12. **Phase 9 full-suite verification**:
   - Run `npx playwright test clients/encore/specs/` (all modules)
   - Run every D3–D11 script — all green
   - Emit final parity report at `clients/encore/specs_planning/audits/parity-final-<YYYY-MM-DD>.md` with: pre-fix vs post-fix counts, every gap closed, residual blockers (with Jira)
13. **`/regression-guard` diff**: expect new scripts (D3-D11) + workflow + final-report artifact; zero spec edits

## Verification

- All CI scripts (D3-D11 + D12-D17 sanity wiring) exist + green on current state
- Pre-commit + CI workflow run all scripts on every PR
- Weekly drift workflow scheduled
- `npx playwright test clients/encore/specs/` reports `0 failed`
- Final parity report exists; cross-checks every parent §B row to a closed state (implemented / Jira-cited / MD-documented-honest)
- LR-027 execution summary appended to parent PLAN before move to `plans/done/`

## Reflect + Graduate (mandatory before /final-q)

Per parent §rule 5. Workflow per root-cause mistake found:

1. **Reflection seed for SP08** — likely mistakes to investigate (SP08 is itself the structural prevention layer for many earlier mistakes, but its OWN reflections matter too):
   - Why did D3–D11 CI checks not exist already? Process gap: no rule that says "every parity/quality claim worth tracking needs a machine-checkable CI guardrail". Likely new LR-NNN: "Every learning that has failed twice must escalate from memory to CI/hook, not stay in memory".
   - **Cross-subplan duplicate sweep**: SP08 is the LAST subplan before parent-plan close — its reflection MUST cross-check all SP01–SP07 reflections for near-duplicate learnings added. If SP02 and SP07 both added LR-NNN about "module structural integrity", consolidate into ONE rule. Anti-duplicate is enforced PER-SUBPLAN, but SP08 does the FINAL cross-subplan dedupe.
   - Why did the existing learning layers (CLAUDE.md "Build-Over-Time Triggers", LR-NNN graduation pattern) not catch these earlier? Audit whether the graduation pattern itself needs a structural trigger (e.g., a /reflect skill check that runs at every session end and detects 2× repetitions automatically — does it exist? is it firing?).

2. **Pre-graduate check** — Grep agent-mistakes.md / LEARNED_RULES.md / .claude/rules/ / feedback_*.md / clients/encore/CLAUDE.md. For SP08 specifically: ALSO grep SP01–SP07's `/final-q` Reflection tables for any new learnings added — dedupe across subplans.

3. **Decision**: SP08's primary contribution is structural (CI checks). Any reflection-seed mistakes that have existing learnings → hardening note appended to that learning's body. Any net-new → add ONCE.

4. **Emit Reflection table** in `/final-q`, INCLUDING a "Cross-subplan dedupe" subsection that lists every learning SP01–SP07 added + confirms no duplicates remain after SP08's consolidation pass:

   | Root-cause mistake | Already-existing learning? | Action taken |
   |---|---|---|

   | New learning added by SP01..07 | Canonical location | Survived SP08 dedupe? |
   |---|---|---|

5. **Anti-duplicate check** — for SP08 specifically: Grep similarity against the union of `{existing registries} ∪ {SP01–SP07 new additions}`. >70% similarity → consolidate, do not duplicate.

Closure-gate rejects if Reflection table missing, Cross-subplan dedupe missing, near-duplicate survived, or mistake mapped to "more reading" actions. Parent PLAN's `/final-q` cannot pass if SP08's Cross-subplan dedupe section is missing.

## Closure

- LR-028 activity log
- LR-027 execution summary in parent + this subplan
- `/final-q` GREEN
- Move parent PLAN + 8 SUBPLANs from `plans/pending/` to `plans/done/` together (atomic completion)
