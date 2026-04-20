# PLAN_MT_AUDIT — Evidence-Based Audit of SP-MT-01..07 (Report Only, No Fixes)

**Status**: PENDING
**Priority**: P2 (deprioritized 2026-04-20 — `PLAN_BUNDLE_SMOKE_TEST.md` runs first; its outcome decides whether this audit still adds value or is superseded)
**Created**: 2026-04-17
**Patched**: 2026-04-20 (pre-exec audit by /ultrathink, OWNER session)
**Deprioritized**: 2026-04-20 (bundle smoke test is a stronger correctness proof than static checks)
**Parent**: PLAN_MULTI_TENANT_RESTRUCTURE (terminal — all 7 subplans executed)
**Scope**: **1 plan, 1 session.** Not parallelized across subplans — cross-SP findings correlate and must live in one report.

---

## Patch log (2026-04-20 — pre-execution audit)

Pre-exec adversarial audit of this plan (sidecar at `~/.claude/plans/audit-plans-pending-plan-mt-audit-md-ancient-raccoon.md`) found 7 skeptic bugs, 7 scope gaps, 3 user-intent drifts. Applied patches inline below; each change carries a `[PATCH-N]` marker. Ground-truth confirmed by Explore sweep: SMT06-A will find real "1604" active-directive FAILs at `playwright-requirements.agent.md:26` and `playwright-test-planner.agent.md:27,:114`; SMT05-C will find `LR-038/LR-039` forward-reference soft-overlap.

| # | Change | Why |
|---|---|---|
| P1 | SMT06-H rewritten → design-gap classifier | `grep -nE 'SYNC:(START\|END)' .github/**` returns zero hits; markers were never built, so a strict FAIL would be a false drift claim |
| P2 | SMT01-F shortened | `.test.ts` never existed; `.test.mjs` is canonical; avoids re-litigating a resolved question |
| P3 | SMT06-F `= 5` → explicit file allow-list + maintainer opt-out | 6 `.agent.md` files exist; plan's own Critical Files says 6, SMT06-F said 5 — inconsistency resolved |
| P4 | Shell snippets fixed for Windows/Git-Bash | SMT04-B escaped-pipe bug; SMT02-C brittle equality; SMT01-A whitespace-wc; CC-3 shell-check guard |
| P5 | CC-3 / SMT05-C greps broadened to `LR-(ENC-)?[0-9]+` | Missed `LR-ENC-*` namespace; numeric-only collision is a false-positive risk |
| P6 | CC-6 adds 4th scoring dimension (independent artifact) | 3-dim scorer gameable by rubber-stamp author |
| P7 | Session Checklist step 14 — explicit no-`git add`/no-`git commit` | Auditor could over-reach; leave changes for user review |
| P8 | 6 new CHECK-IDs inserted | SMT02-G barrel re-export drift; CC-4b LR-037 timestamp floor; SMT04-J npm-scripts smoke; SMT07-F-website `website/*` build; SMT06-I functional bootstrap path existence; SMT02-H test-id registry parity |
| P9 | CC-5 — 3-bucket rubric (A attributable / B pre-existing / C new-unexpected) | Prior prose was informational only; no FAIL condition defined |
| P10 | SMT06-A — tie-break rule for ambiguous hits | Plan gave no disambiguation; both 1604 HARD STOP cases now correctly classify as active-directive |
| P11 | Section 10 — trivial-fix appendix pattern | ≤3-line mechanical fixes should not bloat findings |
| P12 | Section 0 / Section 11 — PARTIAL is first-class | 50+ CHECKs in single Opus session is tight; explicit endorsement avoids rushed rubber-stamping |

No structural reshape. All patches additive or substitutional within existing sections.

---

## INVOCATION (copy-paste, fresh session)

**[CLARIFIED 2026-04-20]** — Earlier wording `/ultrathink audit plans/pending/PLAN_MT_AUDIT.md` was ambiguous (could be read as "audit THIS plan" — which was already done as the pre-exec patch pass logged above — vs "execute the audit OF SP-MT-01..07 DESCRIBED IN this plan"). The pre-exec audit of THIS plan is DONE. The remaining work is **execution** of the CHECK blocks against SP-MT-01..07 deliverables.

Open a **new** Claude Code session (NOT a session that executed any SP-MT-* AND NOT the session that patched this plan on 2026-04-20 — AUD-017 / CC-1). In that fresh session, paste exactly:

```
/identity watchdog
Execute plans/pending/PLAN_MT_AUDIT.md — run Sections 0 through 11 in order. Produce the audit report at clients/encore/specs_planning/audits/MT_01_07_AUDIT_<YYYY-MM-DD>_<slug>.md. Do NOT re-invoke /ultrathink on this plan — the pre-exec audit is already baked in (see Patch log). Follow the plan's Non-goals strictly.
```

This loads WATCHDOG identity, runs the audit workflow, and triggers `/reflect` at session end per WATCHDOG's defaults.

**Model**: Claude Opus, ultrathink thinking tier. Sonnet is HARD-blocked for this plan — the audit is reasoning-heavy (context-aware grep classification, LR-body diffing, retained-example vs active-directive discrimination). See `/sonnet` skill HALT gates.

**Do NOT run any other skill mid-session** unless blocked (e.g., `/rca` if a verification command errors). Audit is a single linear workflow: Sections 0 → 1 → 2 → ... → 11. PARTIAL is first-class per PATCH-12 — prefer 25 defended checks over 50 shallow ones.

---

## Context — why audit, not proceed to SP-REPO-02

The 7-subplan multi-tenant restructure spanned multiple sessions. Drift signals already surfaced during design:

1. **Retroactive LR-027 compliance**: SP-MT-01..05 got bundled into `93e3d2c` (204 files); execution summaries were added in follow-up `c705101` *after* plans moved to `done/`. Compliance was post-hoc, not in-flight.
2. **Plan-claim vs filesystem gap**: two independent Explore agents disagreed by ~100% on whether SP-MT-05 and SP-MT-06 are actually done. Plain file reads show execution summaries saying "done"; grep shows `LR-038/LR-039 duplicated in both root and client CLAUDE.md` and `1604/Navigator/encoreglobal hardcodes present in all 6 agent files`. Whether those grep hits are genuine failures or intentional retained examples (GEN-* hybrid triage kept some) is unresolved — and that's exactly what this audit resolves.
3. **AUD-017 exposure**: SP-MT-06 wrapped itself with `/ultrathink` pre-execution (AUD-017-compliant). SP-MT-01..05 did not. The summary-follow-up commit `c705101` is an executor writing their own summary, not an auditor.
4. **User directive**: *"the audit should be done strongly without bugs in the audit itself"*. The plan bakes in anti-patterns (banlist in Section 8) to prevent predictable audit bugs.

If any finding is real, blindly running SP-REPO-02 layers new changes on a dirty multi-tenant base → exponentially harder to diagnose later. Auditing first costs one session.

---

## Non-goals (HARD — session must refuse these)

- **No fixes.** No edits to any SP-MT-01..07 deliverable. Specifically forbidden paths: `clients/encore/src/`, `clients/encore/tests/`, `.github/agents/*.agent.md`, `.github/copilot-instructions.md`, root `CLAUDE.md`, root `AGENT_SHARED_RULES.md`, root `HANDOFF_TO_COLLEAGUE.md`, `scripts/*`, `tsconfig.json`, `playwright.config.ts`, client rule files, client CLAUDE.md.
- **No follow-up plan creation.** The report may *recommend* follow-up scopes ("one-shot fix plan covering A/B/C" vs "per-SP fix plans") — does NOT create any plan file. User decides.
- **No pipeline runs beyond verification.** `npm run typecheck`, `npm run pipeline:preflight`, `npm run validate:activity-log:preflight`, `npm run plans:reindex:check`, `npm run sync:mistakes:dry`, `node scripts/shared-paths.test.mjs`, one `npm test -- tests/seed.spec.ts --project=chrome` smoke (only if a specific check needs it). Do NOT run full `npm test`.
- **No activity-log rewrites**, no retroactive execution-summary cleanup, no `git commit` of anything other than the audit report itself (if user later asks).
- **Skip WATCHDOG's usual Mode 1 Step 9 `sync:mistakes` run.** That's a pipeline-hygiene step; out of scope here. Note explicitly in report Section 0 that this is an override for MT audit scope.

---

## Session requirements (structural)

| Requirement | Why | Evidence in report |
|---|---|---|
| `/identity watchdog` loaded | File ownership gates block accidental edits to forbidden paths (AGENT_SHARED_RULES.md §2) | Banner in every response: `[WATCHDOG \| AUD-* ALL-* LR-*]` |
| **Fresh session** (not reused from any SP-MT-* executor) | AUD-017 — same-session self-audit = rubber-stamp | Section 0 ledger: grep `clients/encore/specs_planning/_internal/agent-activity-log.md` for this session's identity+timestamp — zero rows touching any MT deliverable |
| Opus + ultrathink tier | Classification-heavy reasoning | Section 0 model declaration |
| Single linear pass, Sections 0→11 | Avoids skipping | Report matches this template |

---

## Audit framework — every check uses this block (no free-form prose)

```
CHECK-ID: <short name>
  CLAIM (from plan's execution summary):
    <verbatim quote, ≤ 3 lines>
  METHOD:
    <exact shell command or file:line read, no approximations>
  PASS CRITERIA:
    <concrete, yes/no>
  EVIDENCE:
    <command output OR file:line excerpt, ≤ 20 lines, trimmed>
  VERDICT:
    PASS | PARTIAL | FAIL | DRIFT | N/A
  NOTES (if PARTIAL/FAIL/DRIFT):
    <≤ 3 lines — what's wrong, not how to fix>
```

Verdicts:
- **PASS** — claim matches reality fully.
- **PARTIAL** — claim mostly holds; specific sub-item missing. Enumerate.
- **FAIL** — claim is false. Quote claim, show contradicting evidence.
- **DRIFT** — claim was true at commit; state has drifted since. Quote commit sha + current state.
- **N/A** — dependency not met; cannot verify.

**Forbidden** verdicts: "looks good", "appears complete", "seems aligned". Every PASS requires evidence attached (command output or file:line quote) — per AUD-011.

---

## Section 1 — SP-MT-01 checks (Scaffold + Aliases)

Plan file: `plans/done/SUBPLAN_MT_01_SCAFFOLD_ALIASES.md` — read Execution Summary FIRST.

- `SMT01-A` **[PATCH-4c — trim whitespace on `wc -l` output for Git-Bash]** `clients/encore/` tree has ≥15 leaf directories per SP-MT-01 scope §1 — `find clients/encore -maxdepth 3 -type d | wc -l | tr -d ' '` (or pipe through `awk '{print $1}'`). Git-Bash left-pads `wc -l` output; bare numeric compare can fail.
- `SMT01-B` `tsconfig.json` has three path aliases resolving to final client locations — read `tsconfig.json`, quote `compilerOptions.paths` block
- `SMT01-C` Both `scripts/shared-paths.ts` AND `scripts/shared-paths.mjs` exist AND export `activeClient`, `clientRoot`, `clientPath`, `frameworkRoot`, `frameworkPath` — `grep -E '^export' scripts/shared-paths.*`
- `SMT01-D` `ACTIVE_CLIENT=encore` in `clients/encore/config/environments/.env.example` AND `.env.development`
- `SMT01-E` `playwright.config.ts` reads `process.env.ACTIVE_CLIENT` — grep + read line
- `SMT01-F` **[PATCH-2 — shortened; prior framing re-litigated a resolved point]** Confirm `scripts/shared-paths.test.mjs` exists and `node scripts/shared-paths.test.mjs` exits 0. Confirm `.test.ts` absence is intentional by greping SP-MT-01 plan — if it promised `.ts`, flag as DRIFT; otherwise PASS. (Pre-exec audit 2026-04-20: `.test.mjs` present, `.test.ts` never existed — expected PASS.)

## Section 2 — SP-MT-02 checks (Move Test Content)

Plan file: `plans/done/SUBPLAN_MT_02_MOVE_TEST_CONTENT.md`.

- `SMT02-A` Old roots gone — `test ! -d src/pages && test ! -d src/selectors && test ! -f src/common/base-page.ts && test ! -f src/utils/app-constants.ts`
- `SMT02-B` New locations populated, expected counts — `find clients/encore/src/pages -name '*.page.ts' | wc -l` ≥ 13; `find clients/encore/src/selectors -name '*.ts' | wc -l` ≥ 17
- `SMT02-C` **[PATCH-4b — `≥ 12` tolerance + seed name check; nested-dir-safe]** Specs discovered under client — `npx playwright test --list 2>&1 | grep -c 'clients/encore/tests/specs/'` must be `≥ 12` (was exact-equal, brittle to future spec additions/nested dirs). Separately confirm `tests/seed.spec.ts` appears by name in the list output.
- `SMT02-D` **Zero** stale relative imports pointing at old roots — `grep -rE '\.\./\.\./\.\./src/(pages|selectors)\b|\.\./\.\./src/utils/app-constants\b' clients/encore/tests/ clients/encore/src/`
- `SMT02-E` `src/utils/index.ts` does NOT re-export `AppConstants` — read file, grep `AppConstants`
- `SMT02-F` `playwright.config.ts` `testDir`, `globalSetup`, `globalTeardown` all resolve via `ACTIVE_CLIENT` — read lines, quote
- `SMT02-G` **[PATCH-8 — barrel re-export drift]** Zero stale re-exports of moved items from root barrels — `grep -nE "^export .* from ['\"]\\.\\./(\\.\\.\\/)?\\.\\./?src/(pages|selectors|common)" src/utils/index.ts src/index.ts` expect zero hits outside framework-owned paths. Stale re-exports compile green but break consumers at runtime.
- `SMT02-H` **[PATCH-8 — test-id registry parity]** `npm run check:tc-parity` exit 0 (or document NOT-APPLICABLE if script doesn't exist on this branch). Catches silent drift between moved selector files and `clients/encore/specs_planning/_internal/test-id-registry.json`.

## Section 3 — SP-MT-03 checks (Move Docs + specs_planning + Exports + Client Config)

Plan file: `plans/done/SUBPLAN_MT_03_MOVE_DOCS_AND_PLANNING.md`.

- `SMT03-A` Old roots gone — `test ! -f docs/REQUIREMENTS.md && test ! -f docs/MODULE_REGISTRY.md && test ! -d exports && test ! -d config/allure`
- `SMT03-B` New locations populated — `test -s clients/encore/docs/REQUIREMENTS.md`, `ls clients/encore/exports/*.csv | wc -l` ≥ 11, `test -f clients/encore/config/allure/categories.json`
- `SMT03-C` `specs_planning/_internal/*` live files moved to client: `agent-mistakes.md`, `agent-queue.json`, `agent-activity-log.md`, `agent-performance.json`, `agent-escalations.json`, `agent-learnings.md`, `test-id-registry.json` — `ls clients/encore/specs_planning/_internal/`
- `SMT03-D` Root `specs_planning/_internal/` either removed OR contains ONLY framework templates (`test-case-template.md`, `agent-queue.schema.json`, `example-*`) — `ls specs_planning/_internal/` if dir exists
- `SMT03-E` Agent + skill docstring refs use placeholders — `grep -lrE 'docs/REQUIREMENTS\.md\b|specs_planning/_internal\b' .github/agents/ .claude/skills/`; for each hit, read line and verify prefix `clients/${ACTIVE_CLIENT}/`
- `SMT03-F` Historical activity-log rows untouched — `git log --oneline -- clients/encore/specs_planning/_internal/agent-activity-log.md` (rename commit should be the only bulk touch pre-audit)

## Section 4 — SP-MT-04 checks (Client-Aware Pipeline Scripts)

Plan file: `plans/done/SUBPLAN_MT_04_CLIENT_AWARE_SCRIPTS.md`.

- `SMT04-A` `SHARED_PATHS` object complete — read `scripts/shared-paths.ts`/`.mjs`, confirm 20+ keys per plan §1 (queue, mistakes, activityLog, performance, escalations, testIdRegistry, testCases, testPlans, audits, learnings, exports, requirementsDoc, moduleRegistry, specs, pages, selectors, fixtures, testData, reports, notifications)
- `SMT04-B` **[PATCH-4a — escaped-pipe fix for `-E` / ERE]** Zero hardcoded MT-03 paths in scripts — `grep -rnE 'specs_planning/_internal|docs/REQUIREMENTS\.md\b|docs/MODULE_REGISTRY\.md\b' scripts/ src/utils/agent-notification-writer.ts | grep -vE 'shared-paths\.(ts|mjs):|//|^.*\*'` — expect zero hits outside shared-paths.ts itself. (Note: earlier draft escaped `\|` under `-E` which was literal-pipe instead of alternation.)
- `SMT04-C` `npm run pipeline:preflight` → exit 0 (capture tail 20 lines)
- `SMT04-D` `npm run validate:activity-log:preflight` → exit 0
- `SMT04-E` `npm run typecheck` → exit 0
- `SMT04-F` `npm run sync:mistakes:dry` clean — no missing-path errors
- `SMT04-G` `npm run plans:reindex:check` clean
- `SMT04-H` `node scripts/shared-paths.test.mjs` passes for both `ACTIVE_CLIENT=encore` and `ACTIVE_CLIENT=acme`
- `SMT04-I` Pick 3 random scripts from SP-MT-04 §3 refactor list (e.g., `generator-pre-run.ts`, `healer-post-complete.ts`, `capture-mistake.ts`) — read each, confirm they import/use `SHARED_PATHS`, not literal path strings
- `SMT04-J` **[PATCH-8 — npm-scripts smoke post-path-moves]** Sample 5 non-destructive `npm run` scripts that touched moved paths (e.g., `registry:build --dry` if supported, `check:tc-parity`, `lint:test-cases --dry`, `validate:activity-log:preflight`, `plans:reindex:check`) and confirm exit 0 or documented NOT-APPLICABLE. A broken `npm run X` is a silent latent bug that typecheck won't catch.

## Section 5 — SP-MT-05 checks (Split CLAUDE.md + AGENT_SHARED_RULES)

Plan file: `plans/done/SUBPLAN_MT_05_SPLIT_RULES.md`.

- `SMT05-A` Encore LRs present in `clients/encore/CLAUDE.md` — read plan's LR-move list from its Execution Summary (SP-MT-05 §D1..D4); verify each named LR is present in client file
- `SMT05-B` Same LRs absent from root `CLAUDE.md` — for each moved LR, `grep -E "^#+ .*LR-008\b" CLAUDE.md` etc., expect zero hits on the full-rule heading (inline references in prose are fine and must be kept)
- `SMT05-C` **[HIGHEST PRIORITY CHECK — Agent-2 flagged LR-038/LR-039 duplicated]** **[PATCH-5 — regex broadened to cover `LR-ENC-NNN` namespace]** Zero-overlap assertion: `comm -12 <(grep -oE 'LR-(ENC-)?[0-9]+' CLAUDE.md | sort -u) <(grep -oE 'LR-(ENC-)?[0-9]+' clients/encore/CLAUDE.md | sort -u)` must be empty. `LR-001` ≠ `LR-ENC-001` (different namespaces). If non-empty, for each duplicate LR: read both rule bodies, compare word-for-word. Classify as:
  - **Pure duplicate** (same rule text in both files) — FAIL
  - **ID collision** (different rules under same ID) — FAIL (worse, requires renumbering in fix)
  - **Cross-ref** (one file contains the rule body, other has a pointer line like "See clients/...") — PASS
  - **Forward-ref placeholder** (ID mentioned in numbering-convention prose only, no rule body anywhere) — PARTIAL; expected at audit time for `LR-038`/`LR-039`
- `SMT05-D` `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md` exists with encore-specific §E sections
- `SMT05-E` `docs/read_only_docs/AGENT_SHARED_RULES.md` at root: `grep -iE '1604|encoreglobal|cloudapps-e2e|TC-LOC-' docs/read_only_docs/AGENT_SHARED_RULES.md` — for each hit, classify Active-directive vs Retained-example (same rule as SMT06-A)
- `SMT05-F` Skill files that read LRs point at both root + client — spot-check 3 SKILL.md files for dual-source read directive

## Section 6 — SP-MT-06 checks (Parameterize Pipeline Agents)

Plan file: `plans/done/SUBPLAN_MT_06_PARAMETERIZE_AGENTS.md`.

- `SMT06-A` **[HIGHEST PRIORITY CHECK — context-aware]** **[PATCH-10 — tie-break rule added]** Run `grep -nE '1604|Navigator|encoreglobal|cloudapps-e2e|TC-LOC-|TC-ECT' .github/agents/*.agent.md .github/copilot-instructions.md`. Agent-2 found ≥ 10 hits across 6 files. For EACH hit, read ≥ 3 lines of surrounding context AND the enclosing section heading. Classify:
  - **Active directive** — inside a HARD STOP, a rule body (e.g., ALL-013 middle column), a prompt instruction, a checklist item. VIOLATES SP-MT-06. **FAIL**.
  - **Retained example** — inside a fenced code block, a "BAD example" illustration, a rule explicitly kept per the GEN-* 5H hybrid triage (GEN-008/009/015/026/035) or explicitly allowed in SP-MT-06's triage table (2E: GEN-032/033). **PASS**.
  - **Tie-break rule (ambiguous hits)**: if a hit is inside any `HARD STOP` section AND the rule body references a literal value (e.g. "1604"), classify as **active-directive** UNLESS the literal is inside a fenced code block OR explicitly labeled `example:` / `e.g.`. Under this rule, `playwright-requirements.agent.md:26` and `playwright-test-planner.agent.md:27`/`:114` are **active-directive FAIL** (confirmed pre-exec 2026-04-20).
  Report table columns: `file:line | surrounding section heading | hit text | classification | verdict`. **Do NOT report "N hits found" as a finding. Classify every single hit.**
- `SMT06-B` CONTEXT_LOAD Client Context Bootstrap block references `clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md` and `.../MODULE_REGISTRY.md` — grep sentinel, read § body
- `SMT06-C` 3 new REQUIREMENTS.md sections exist — `grep -E '^##?  *(Auth Protocol|Authorized Test Data|Module Naming Conventions)' clients/encore/docs/REQUIREMENTS.md` — expect 3 headings
- `SMT06-D` 6 new §E sections in `AGENT_RULES_ENCORE.md` — `grep -E '^##?  *§E-' clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md` — expect at minimum: E-UI-LIBRARY, E-FORM-BEHAVIOR, E-FORM-PATTERNS, E-MCP-EVENT-TRIGGERING, E-REQ-EXAMPLES, E-MODULE-BOUNDARIES
- `SMT06-E` ALL-013 text — read canonical row in `clients/encore/specs_planning/_internal/agent-mistakes.md`. Middle column must reference `clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md#authorized-test-data` (parameterized). Still hardcoding "Office 1604" = FAIL
- `SMT06-F` **[PATCH-3 — explicit allow-list; prior `= 5` conflicted with 6 actual agent files]** Sync propagation: the CONTEXT_LOAD bootstrap sentinel string appears in all 5 pipeline agents — run `grep -l 'Client Context Bootstrap' .github/agents/playwright-*.agent.md` and confirm the output set equals exactly `{playwright-requirements, playwright-test-planner, playwright-test-generator, playwright-test-healer, playwright-pipeline-audit}` (5 files). Then sub-check: `playwright-framework-maintainer.agent.md` MUST be either (a) bootstrapped (6 total) OR (b) explicitly opt-out with a frontmatter/comment note explaining why it doesn't need client context. If neither, FAIL (ambiguous design).
- `SMT06-G` Triage discipline per user-approved table (29F / 2E / 5H, with GEN-025 reclassified pure framework):
  - GEN-032 (Radix 50+ options retry) — moved to `AGENT_RULES_ENCORE.md §E-UI-LIBRARY`, removed from root/generator file
  - GEN-033 (Angular save button disabled ≠ form pristine) — moved to `§E-FORM-BEHAVIOR`, removed from root/generator
  - GEN-008, GEN-009, GEN-015, GEN-026, GEN-035 (hybrids) — kernel stays in generator file, encore example points to client via §E reference or REQUIREMENTS.md anchor
  - GEN-025 (combobox exact-match) — **stays pure framework** in generator file (user reclassified this from hybrid)
- `SMT06-I` **[PATCH-8 — functional bootstrap path existence]** For each bootstrapped agent file, extract the exact path strings listed in its "Client Context Bootstrap" block (e.g., `clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md`, `MODULE_REGISTRY.md`, `CLAUDE.md`, `AGENT_RULES_ENCORE.md`) and run `ACTIVE_CLIENT=encore test -f <resolved-path>` on each. Report any missing path. A typo (e.g. `REQUIREMNTS.md`) passes every static grep but breaks at runtime.
- `SMT06-H` **[PATCH-1 — design-gap classifier, not strict drift]** SYNC-marker integrity. First run `grep -nE 'SYNC:(START|END)' .github/copilot-instructions.md .github/agents/*.agent.md` — pre-exec audit (2026-04-20) confirmed **zero hits**. If still zero at audit time, classify as **DESIGN-GAP** (SP-MT-06 shipped without the drift-protection guard the plan intended) rather than FAIL against SP-MT-06 deliverables. If any markers now exist, run the original check: every START has a matching END at the next marker; post-SP-MT-06 edits are outside those blocks (spot-check 2 edits named in SP-MT-06 execution summary — read lines at those offsets, confirm no SYNC marker within ±5 lines).

## Section 7 — SP-MT-07 checks (Handoff Readiness)

Plan file: `plans/done/SUBPLAN_MT_07_DELIVERY_PACKAGER.md` (note: file named `DELIVERY_PACKAGER` but scope was rewritten to handoff doc — verify this intent is preserved).

- `SMT07-A` `HANDOFF_TO_COLLEAGUE.md` exists at repo root
- `SMT07-B` 8 sections present, each non-empty — `grep -nE '^## ' HANDOFF_TO_COLLEAGUE.md`; cross-check against the plan's 8-section contract (repo boundary, what we hand over, IP inventory, client-consumable inventory, existing client-package.ts status, env vars, second-client onboarding, pipeline state)
- `SMT07-C` **`scripts/client-package.ts` untouched by SP-MT-07 session** — `git log --oneline scripts/client-package.ts | head -5`. Expect NO commit matching SP-MT-07's session timestamp (verify via activity-log row for SP-MT-07)
- `SMT07-D` IP inventory lists at minimum: `.claude/`, `.github/agents/`, `.github/copilot-instructions.md`, `plans/`, `docs/read_only_docs/AGENT_SHARED_RULES.md`, `specs_planning/_internal/` or client equivalent, pipeline-internal scripts, `src/orchestrator/`, `src/worker/`, `website/`
- `SMT07-E` **Scope discipline** — `git diff <SP-MT-06-sha>..HEAD -- scripts/` shows NO new packager files. Zero `encore_delivery/` directory. Zero new CI workflow. Zero scrub routines. If any appear → FAIL (SP-MT-07 drifted back into packager scope)
- `SMT07-F-website` **[PATCH-8 — website/ compilation]** SP-MT-07 IP inventory includes `website/`. Confirm `website/` is either (a) buildable post-MT: `cd website/frontend && npx tsc --noEmit` exit 0 AND `cd website/backend && npx tsc --noEmit` exit 0, OR (b) explicitly declared out-of-scope for this audit in SMT07-F-website NOTES. Silent breakage here ships green audit + broken website.

---

## Section 8 — Cross-cutting checks

### CC-1 AUD-017 ledger
Read `clients/encore/specs_planning/_internal/agent-activity-log.md`. For each SP-MT-0N, locate the execution row. Extract identity + timestamp. Confirm THIS audit session's identity + timestamp are absent from those rows.
Report table: `SP | executor-session-id | executor-timestamp | audit-session-id | collision? (must all be "no")`.
If any collision → abort audit, ask for fresh session.

### CC-2 Bundle commit integrity
- `git show --stat 93e3d2c` — file list must be union of SP-MT-01..05 scopes, no SP-MT-06 / SP-MT-07 work.
- `git show --stat c705101` — expected to touch only `plans/done/SUBPLAN_MT_0[1-5]_*.md` + `plans/INDEX.md`. Any extra path = DRIFT finding.
- `git show --stat <sha of SP-MT-06 commit>` — touches `.github/agents/*.agent.md`, `docs/read_only_docs/AGENT_SHARED_RULES.md`, `clients/encore/docs/`, `specs_planning/_internal/` synced files. No SP-MT-07 bleed.
- `git show --stat <sha of SP-MT-07 commit or diff if uncommitted>` — touches only `HANDOFF_TO_COLLEAGUE.md` + `README.md` pointer + plan-move.

### CC-3 LR inventory diff (pairs with SMT05-C)
**[PATCH-4d + PATCH-5 — bash-verification guard + `LR-ENC-NNN` namespace coverage]**

Pre-check: confirm shell is bash (`echo $BASH_VERSION`). Process substitution `<(...)` fails silently in PowerShell, producing empty intersection that LOOKS like a clean PASS.

- Root LR set: `grep -oE 'LR-(ENC-)?[0-9]+' CLAUDE.md | sort -u`
- Client LR set: `grep -oE 'LR-(ENC-)?[0-9]+' clients/encore/CLAUDE.md | sort -u`
- Intersection: `comm -12 <(root) <(client)`. Must be empty. If bash-unavailable, fall back to `grep -oE '...' CLAUDE.md | sort -u > /tmp/r.txt; grep -oE '...' clients/encore/CLAUDE.md | sort -u > /tmp/c.txt; comm -12 /tmp/r.txt /tmp/c.txt`.
- **CC-3b namespace rule**: `LR-001` in root + `LR-ENC-001` in client = ALLOWED (different namespaces, not a duplicate). Only token-equal matches are true collisions.
- For each true-collision member: diff rule bodies (is it pure duplicate, ID collision, or acceptable cross-ref).
- **Expected at audit time (per pre-exec 2026-04-20)**: `LR-038`, `LR-039` forward-referenced in both files as numbering-convention placeholders — no rule bodies on either side; classify as PARTIAL (claim of zero-overlap overstated) rather than FAIL.

### CC-4 Activity-log baseline
`npm run validate:activity-log` full run. Any violations on rows dated ≥ `93e3d2c` commit date = finding. Older rows are archival — validator should skip via baseline flag; if it doesn't, that's a SP-MT-04 validator-extension gap.

### CC-4b LR-037 timestamp floor per SP-MT-0N row
**[PATCH-8 — explicit per-SP backdating check; preflight only covers last 5 rows]**

For each SP-MT-0N execution row in `clients/encore/specs_planning/_internal/agent-activity-log.md`:
1. Parse the row's `When` timestamp and the comma-separated `Files` column.
2. For every file listed, compute `mtime` (prefer `git log -1 --format=%at -- <path>` when tracked; fall back to `stat -c %Y`).
3. Assert: row timestamp ≥ max(mtimes). Tolerance: 60 seconds.
4. Any SP whose row timestamp is more than 60s BEFORE the latest file it claims to touch → FAIL with delta in minutes/hours.

LR-037 is a known historical violation area (see CLAUDE.md LR-037 and the expressive-booping-fountain audit). The preflight validator only scans the last 5 rows, so SP-MT-01..05 bundled-in-follow-up rows are NOT covered by the fast preflight.

### CC-5 Dirty-tree inventory
**[PATCH-9 — 3-bucket rubric with an explicit FAIL condition]**

`git status --short` — categorize every dirty path into exactly one bucket:
- **Bucket A — Plan-execution-attributable**: the 4 paths allowed by Session Checklist step 14 (new audit report, activity-log diff, plan move of PLAN_MT_AUDIT.md, INDEX.md regen). These are EXPECTED.
- **Bucket B — Pre-existing uncommitted from prior work**: e.g., the 32 `.claude/skills/*/SKILL.md` modifications, the `plans/done/SUBPLAN_MT_06_PARAMETERIZE_AGENTS.md` diff, README.md diff, etc. Determine by `git log -1 --format=%at <file>` being older than this audit session. These are NOT attributable to this audit — inform user but do not FAIL.
- **Bucket C — New-to-this-session unexpected**: any path touched during this audit that is not in Bucket A. **Any Bucket C entry with a code change = FAIL** (auditor violated non-goals). Bucket C entries that are read-only sidecars (e.g., notes/scratch files in `~/.claude/plans/`) are OK.

Report counts per bucket. Bucket C > 0 with code changes = auditor non-goal violation.

### CC-6 Rubber-stamp sniff on execution summaries
**[PATCH-6 — 4th dimension added; 3-dim scorer was gameable]**

For each SP, score the Execution Summary 0–4:
- +1 if it names specific files with line numbers (not "moved files")
- +1 if it quotes command outputs (not "all checks passed")
- +1 if it acknowledges deviations from the original plan scope
- +1 if it references an artifact the auditor can independently verify (commit SHA, test run ID, validator exit code, report path) AND the auditor actually examines that artifact

Any SP scoring ≤ 2 → flag `rubber-stamp-risk`. Report scores in Section 9 table. Auditor MUST examine at least one referenced artifact per SP — if no artifact is referenced, that SP auto-scores 0 on dim-4 regardless of summary quality.

### CC-7 INDEX integrity
- `npm run plans:reindex:check` clean
- All 7 SP-MT-*.md in `plans/done/` with Status: DONE and Executed: date ≥ 2026-04-17
- PLAN_MULTI_TENANT_RESTRUCTURE.md — if all subplans done, master should arguably move to done/ too. Report as PARTIAL (discretionary finding, user decides)

---

## Section 9 — Anti-patterns the auditor is banned from (self-protect — sign in report Section 0)

- [ ] I read each plan's Execution Summary BEFORE running grep, to know what claim the grep is checking. (Prevents aimless greps.)
- [ ] For every SMT06-A and SMT05-E hit, I read ≥ 3 surrounding lines AND the enclosing section heading. I classified every hit Active-directive vs Retained-example EXPLICITLY. I did NOT report "N hits found" as a finding. (Prevents Agent-2's over-broad-grep trap.)
- [ ] For SMT05-C / CC-3, if intersection is non-empty I fetched BOTH rule bodies and diffed word-for-word before classifying. (Prevents false duplicate call.)
- [ ] For SMT07-C and SMT06-H, I ran `git log --oneline <path>` + `git show --stat <sha>`, not just `git diff`. (Catches renames and partial commits.)
- [ ] Every PASS has evidence attached — command output OR file:line quote. No "looks good" / "appears complete" anywhere. (AUD-011 enforcement.)
- [ ] I did NOT fix anything. Any follow-up is text-only in Section 10. (Non-goals enforcement.)
- [ ] If I found zero findings overall, I justified explicitly — an audit with 3+ checks and zero findings is a statistical outlier (AUD-001). Either I strip fabricated findings OR I defend the clean-chain verdict.
- [ ] I ran AUD-017 CC-1 BEFORE any other check. If my session's identity touched any MT deliverable, I aborted.

---

## Section 10 — Deliverable

**Report path**: `clients/encore/specs_planning/audits/MT_01_07_AUDIT_2026-04-<DD>_<slug>.md`
(under `clients/encore/` per multi-tenant classification — audits are encore-specific content)

**Report structure** (copy this template):

```
# MT-01..07 Audit — <date>, <slug>

## Section 0 — Session credentials & signatures
- Identity: WATCHDOG
- Model: Claude Opus, ultrathink tier
- Session ID / timestamp: <from activity log>
- Anti-pattern checklist (all 8 items, each explicitly signed)
- Prior writes to MT deliverables: NONE (verified via CC-1 activity-log grep)
- Non-goal override: `sync:mistakes` skipped per plan

## Sections 1–7 — Per-SP findings
(one per SP-MT-0N, with CHECK blocks)

## Section 8 — Cross-cutting (CC-1..CC-7)

## Section 9 — Summary table
| SP | PASS | PARTIAL | FAIL | DRIFT | N/A | Rubber-stamp score | Net verdict |
|---|---|---|---|---|---|---|---|
| MT-01 | ... |
| MT-02 | ... |
| ... | ... |
| Cross | ... |

## Section 10 — Recommended follow-up (TEXT ONLY — NO PLAN FILES CREATED)
Per the plan's non-goals, recommendations only. Patterns:
- If 0 FAIL across all SPs: "Multi-tenant restructure clean. Proceed to SP-REPO-02."
- If FAILs concentrated in 1 SP: "One-shot fix plan scoped to SP-MT-0N."
- If FAILs span ≥ 2 SPs: "Per-SP fix plans, run in scope-minimal order."
- If only PARTIAL/DRIFT: "Accept findings, document in HANDOFF_TO_COLLEAGUE.md §<N>."
Do NOT create any plan file. User decides.

**[PATCH-11 — trivial-fix appendix pattern]** If a finding is a ≤3-line mechanical fix (typo, path correction, missing close-brace, literal value → parameterized reference), append a `### Trivial Fix Appendix` subsection listing exact line edits in before/after form. User can copy-paste into a follow-up session. Auditor STILL does not edit the file — this is a pre-packaged patch for user review, not an edit.

## Section 11 — Audit self-audit (AUD-011)
- Did I find zero issues? If yes, defend.
- Did I stop at grep or reason about retained examples per hit?
- Would a different WATCHDOG session corroborate? Name 2 findings I'd defend under cross-examination.
```

---

## Section 11 — Budget management (session running low)

Budget is finite. If the session is approaching token/time limit before Sections 1–8 complete, prioritize in this exact order:
1. **Section 0** (credentials, AUD-017 check — CC-1 is here in effect)
2. **CC-3 + SMT05-C** (LR overlap — Agent-2 highest-confidence drift finding)
3. **SMT06-A** (agent hardcode classification — Agent-2 second-highest drift finding)
4. **CC-2** (bundle commit integrity)
5. **SMT04-C,D,E,G** (fast exit-code checks)
6. Remaining per-SP checks
7. **CC-4..7** (lower-impact)

If session ends before 4 — file the report as `PARTIAL` with Section 9 summary table showing which checks were deferred. A second audit session picks up the rest. This is LR-024-compliant: don't rush through to rubber-stamp.

**[PATCH-12 — PARTIAL is first-class]** A single Opus-ultrathink session has a realistic budget for ~20–30 high-context CHECKs, not 50+. **PARTIAL is not a failure mode — it is the expected outcome for a thorough single-session run.** Auditor must NOT rush Sections 6–11 to claim a complete pass. Prefer 25 deep checks with defended verdicts over 50 shallow ones. A second session picks up the rest with this session's report as input; the CC-1 fresh-session rule applies recursively — the second session must also not have touched any MT deliverable.

---

## Session checklist (paste into TodoWrite on session start)

1. [ ] `/identity watchdog` loaded, banner visible
2. [ ] Grep activity log, confirm AUD-017 (CC-1) — no prior writes by this session
3. [ ] `git status --short` + `git log --oneline -20` captured as baseline
4. [ ] Section 0 signatures + anti-pattern checklist signed
5. [ ] Sections 1–7 per-SP checks run, each CHECK block filled with evidence
6. [ ] Section 8 cross-cutting checks run
7. [ ] Section 9 summary table populated
8. [ ] Section 10 follow-up recommendation written (TEXT ONLY, no plan files created)
9. [ ] Section 11 audit-self-audit answered
10. [ ] Report saved to `clients/encore/specs_planning/audits/MT_01_07_AUDIT_<date>_<slug>.md`
11. [ ] Activity-log row appended per LR-028 + LR-037 (timestamp ≥ mtime of every referenced file, use current wall clock)
12. [ ] Move this audit plan `plans/pending/PLAN_MT_AUDIT.md` → `plans/done/` with Execution Summary per LR-027
13. [ ] `npm run plans:reindex`
14. [ ] `git status --short` shows ONLY: new report file + activity-log diff + plan move + INDEX regen. Nothing else. If extra → investigate before closing. **[PATCH-7]** Do NOT `git add` or `git commit` — leave the 4 changes uncommitted for user review in a follow-up session. Auditor session ends at "report written + activity-log appended + plan moved"; committing is a separate user-triggered action.

---

## Critical files

**Read-only during audit**:
- 7 × `plans/done/SUBPLAN_MT_0*.md`
- `plans/pending/PLAN_MULTI_TENANT_RESTRUCTURE.md`
- `CLAUDE.md`, `clients/encore/CLAUDE.md`
- `docs/read_only_docs/AGENT_SHARED_RULES.md`, `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md`
- `.github/agents/*.agent.md` (6), `.github/copilot-instructions.md`
- `scripts/shared-paths.{ts,mjs}`, `scripts/shared-paths.test.{ts,mjs}`, `tsconfig.json`, `playwright.config.ts`
- `clients/encore/specs_planning/_internal/agent-mistakes.md`, `agent-activity-log.md`
- `HANDOFF_TO_COLLEAGUE.md`
- `git log` + `git show` outputs for `93e3d2c`, `c705101`, SP-MT-06 commit, SP-MT-07 commit

**Write (exactly these, nothing else)**:
- `clients/encore/specs_planning/audits/MT_01_07_AUDIT_<date>_<slug>.md` (new, the report)
- Append 1 row to `clients/encore/specs_planning/_internal/agent-activity-log.md`
- `plans/pending/PLAN_MT_AUDIT.md` → `plans/done/PLAN_MT_AUDIT.md` (with Execution Summary)
- `plans/INDEX.md` (auto-regenerated, don't hand-edit per LR-035)

**Forbidden**: all SP-MT-01..07 deliverables, `scripts/*` non-read, agent files, CLAUDE.md (either), AGENT_SHARED_RULES.md (either), HANDOFF_TO_COLLEAGUE.md.

---

## Risks

- **Opus budget** — 7 SPs × ~6 checks + 7 cross-cutting ≈ 50 CHECKs with context-aware classification. Budget accordingly. Section 11 defines fallback.
- **Grep false negatives** — clever string concat / template literals can hide hardcodes. The banlist requires ≥ 3 lines of context per hit; still not perfect. Mitigation: for SMT06-A, also grep for `encoreglobal.com|1604\b|Office 1604` case-insensitive; for SMT05-C use `LR-\d{3}` not `LR-\d+` to avoid matching `LR-1` in prose.
- **Retained-example misclassification** — false-positive FAIL if auditor miscalls a retained example as an active directive. Mitigation: report quotes enclosing section heading + fence state per hit.
- **AUD-017 leak** — if user accidentally reuses a session that touched MT files, CC-1 catches it. If they ignore and proceed anyway, the report's PASS verdicts lose credibility. CC-1 is non-negotiable first check.
- **"Clean-chain" bias** — if the first few checks PASS, auditor may relax vigilance. Mitigation: SMT05-C and SMT06-A are both known-drift hot-spots (from design-time Explore agent). Schedule them early; a PASS here earns trust, not relaxation.
