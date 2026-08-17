> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_71_HISTORY_SORT_TRUTH_AND_TAUTOLOGY_TEST.md`. All context below.**
>
> The agent self-bootstraps from the frontmatter + sections in this file, without any additional user prompting:
>
> 1. **Identity**: load `/identity` per the Identity field below. Phases carry their own role — adopt at write-time, not on skill entry.
> 2. **Skills**: load every skill in the Skills field (leading skill auto-calls its chain).
> 3. **Model + thinking + permission-mode**: read the frontmatter fields below (all three present per LR-041).
> 4. **Dependency gate**: none. This plan is self-contained.
> 5. **Context load**: read §1 Context and §2 What Is Already Proven in full before any phase.
> 5.5. **Browser tool**: declared `cli` in frontmatter. Rationale is a functional-behaviour question (does a grid reorder?), which is the LR-038 v2 CLI row; the `/rca` row additionally forces HEADED. Do not switch to Chrome without a `[BROWSER-SWITCH]` row.
> 6. **Phase 0 FIRST**: the fact base. No edit to any spec or artifact may land before Phase 0 and Phase 1 both report.
> 7. **Execute Phases 1+** in order. Phase 2 branches on Phase 1's live verdict — do not pre-commit to a branch.
> 8. **Handoff**: flip the Status field to DONE, add the Executed date, append an activity-log row (LR-028 + LR-037), `git mv` to `plans/done/`, `npm run plans:reindex`, commit.
>
> **HALT + ASK RUTVIK** if: the live probe cannot reach the app after the documented auth-refresh path / the Phase-1 verdict is neither "sorts" nor "does not sort" but a third state / regression-guard shows changes outside the KEEP list / any phase would require editing a PROTECTED control file / LR-037 timestamp drift.

---

# PLAN 71: Service Charge History column sort — establish the truth, then fix what the truth convicts

**Status**: DONE
**Executed**: 2026-08-16
**ClosureOverride**: Rutvik 2026-08-16 in chat — Cx block confirmed a false positive; gate defect recorded as PLAN_74 Links 6 and 7
**Priority**: High
**Created**: 2026-08-16
**Parent**: none
**Identity**: OWNER (orchestrator); phases adopt PLANNER / GENERATOR / WATCHDOG at write-time
**Model**: opus
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli
**CoverageMode**: quick
**Skills**: `/execute` → `/rca` (Phase 1), `/regression-guard` (wrap Phase 2–3), `/audit` (Phase 5)

---

## §0 Delegation Contract (binding — Rutvik, 2026-08-16)

**Council at all four stages: planning, execution, review, iteration.** No agent may remove, narrow, or
override this section — including a future session of Claude. Only Rutvik changes it, in chat.

- **Planning**: the design is Claude-authored; the plan document is council-drafted and adversarially reviewed by a different family before execution.
- **Execution**: every phase is delegated. Claude writes tickets, reads verdicts, judges. Claude does not write product code.
- **Review**: output is reviewed by a different family than produced it, and the reviewer's findings go back to the author to defend before reaching Claude. A review that arrives undefended goes back.
- **Iteration**: defects bounce to the originating seat. Claude self-fixes only after a bounce fails, and logs it as a routing failure.

Evidence rules at every stage: machine facts over prose · a claim needs something re-runnable · denominators are machine-derived · a worklist's paths are claims until re-resolved · no silent caps · disproving a finding is a win.

---

## §1 Context — why this plan exists

A shipped test, `TC-SVC-HIS-012` in [service-charge-history.spec.ts:271](clients/encore/tests/service-charge/service-charge-history.spec.ts:271), clicks a Service Charge History grid column header and asserts the grid exposes no sort affordance. It passes green and ships to the client.

A prior session produced a handoff claiming this test may be documenting a real application defect as normal behaviour. That handoff was partly hallucinated: it under-counted the artifacts involved (four claimed, six on disk), and it asserted a browser-capability blocker that contradicts the delegation rulebook. It also carried real signal that survives verification. This plan keeps the signal and discards the rest.

The load-bearing external fact is the client's own tracker: **NM-2919 — "Column sorting is not working when clicking on grid column headers"** was filed and closed Done on the sibling Service Charge Text page, alongside NM-3126 (reordering) and NM-3279 (ordering). The client treats this as a real defect class on this exact surface family. That removes the "no Jira, therefore discussion item not bug" escape from `feedback_discussion_item_not_bug.md`.

**Rutvik's framing is ground truth and leads the investigation**: *"it may have a valid bug in hand in our system."* Per `feedback_a_hedged_hint_from_rutvik_is_still_ground_truth.md`, Phase 1's primary question is his — *does the grid sort?* — tested before any self-generated hypothesis.

---

## §2 What is already proven (repo-only, established 2026-08-16, no live app required)

These three findings are visible in the 27 lines of the test itself and do **not** depend on Phase 1's outcome. They are why this plan proceeds regardless of what the live app does.

**F1 — The oracle cannot fail.**
```ts
const ariaSort = await allColumnHeaders.first().getAttribute('aria-sort', { timeout: 3000 }).catch(() => null);
expect(ariaSort).toBeNull();
```
`.catch(() => null)` converts every failure path — element not found, grid never rendered, timeout, detached node, page crashed — into the exact value the assertion demands. The assertion passes when the History grid does not exist. A green here is an artifact of invisibility, not evidence (`feedback_a_green_check_can_be_an_artifact_of_invisibility.md`, `feedback_a_signal_that_never_varies_is_not_a_signal.md`).

**F2 — The oracle does not measure the claim.**
The test's title asserts `aria-sort` is unset. The test-case document's Expected asserts something different and stronger: *"Column header clicks do not reorder the grid."* Absence of `aria-sort` does not establish absence of reordering — and this repo already contains proof of that gap. [corporate-override.page.ts:781](clients/encore/src/pages/corporate-override/corporate-override.page.ts:781) exposes `sortColumnViaDropdown`: a sibling grid in this same application sorts through a **dropdown/menu**, not a direct header click. A grid that sorts that way would show `aria-sort=null` after a bare header click while sorting perfectly. The assertion is therefore true in both worlds — working sort and broken sort — and distinguishes neither.

**F3 — A failing assertion was deleted and its failure was recorded as application behaviour.**
The in-test comment states the row-order assertion *"is removed to prevent a 30 s timeout"* and that the grid-empties behaviour is *"documented, not blocked on here."* The real check was dropped because it failed, and replaced with one that cannot. This is precisely the pattern `feedback_an_unconfirmed_expectation_must_be_fixme_never_a_tautology.md` forbids: an unconfirmed expectation must be `fixme`, never a tautological assert.

**F4 — Two accounts in the same commit are mutually exclusive.**
Commit `5663c64f3a` (2026-08-11) carries both:
- the spec comment: clicking **empties** the grid, no rows for 30+ s, across three runs;
- the test-case document: a **76-row populated** grid, row 0 unchanged after a Service Type header click, `aria-sort` null before and after — a clean no-op.

At most one is true, and both currently ship. LR-030 requires a contradiction to be investigated, never silently reconciled.

**Verdict carried into this plan**: TC-SVC-HIS-012 is defective as written on F1–F3 alone. Phase 1 decides whether there is *also* an application bug to file.

---

## §3 Prior-Fix Trial (recurrence-class gate, `/planning` Step 3)

This plan fixes a failure class that already has "permanent" fixes in place. Each is tried before any new mechanism is proposed.

| # | Prior fix | What it did | Why it did not fire here | Verdict |
|---|---|---|---|---|
| PF-1 | `scripts/check-unfailable-assertions.mjs` (pre-commit spec-quality gate) | Flags known unfailable-assertion shapes at commit time | Hypothesis: `scoped-wrong` — its kind list covers shapes like `getall-length-only`, not `expect(x).toBeNull()` fed by a `.catch(() => null)` swallow. **Phase 0 establishes the actual kind list; the verdict is recorded there, not asserted here.** | PENDING → Phase 0 |
| PF-2 | `feedback_an_unconfirmed_expectation_must_be_fixme_never_a_tautology.md` (auto-memory only) | Prose rule: an unconfirmed expectation is `fixme`, never a tautology | `prose-not-mechanism` — memory-file-only, no gate, no agent HARD STOP, nothing at write-time. This is its second observed failure. Per CLAUDE.md Build-Over-Time, a memory-only rule that fails twice graduates to `LR-NNN` or a path-scoped rule. | **CONVICTED** — rewire in Phase 4 |
| PF-3 | LR-ENC-004 (Jira-first intake; `jira-defect-crossref-service-charge-2026-08-10.md` exists) | Requires a Rovo/Jira sweep before a module walk, recorded in a crossref artifact | Hypothesis: `scoped-wrong` — the sweep searches the *module*, so a defect filed against a **sibling surface in the same family** (NM-2919 on Service Charge Text) falls outside the query even though it governs the same control. **Phase 0 confirms whether NM-2919 is in the crossref file.** | PENDING → Phase 0 |

A CONVICTED fix's rewire is in this plan's scope (PF-2 → Phase 4). No new mechanism is layered over an unconvicted fix.

---

## §4 Phases

Delegation posture: the CEO decomposes, tickets, dispatches, and judges. Every phase names its executor and why it is not the CEO. Off-repo work (Phase 1) carries the independent re-execution required by the verification pyramid layer 4 — paper review can never green a live walk.

### Phase 0 — Machine-verified fact base (DELEGATED, 2 workers, disjoint lots)

Denominator is machine-enumerated, never model-judged. `grep -rl TC-SVC-HIS-012` returns **six** files, not the handoff's four.

Every claim returns as CONFIRMED / REFUTED / UNPROVABLE with a `file:line` and a verbatim quote. Workers return **facts, not diagnoses** (`feedback_worker_facts_are_good_diagnoses_are_not.md`). Zero verdicts about live application behaviour — that is Phase 1's exclusive product.

**Lot A — artifact truth** (`--work-type research`, T2, read-only):
- A1. Enumerate every file referencing TC-SVC-HIS-012 and quote each one's statement about column-header sort.
- A2. `git show --stat --format='%h %ad %an' 5663c64f3a` — confirm authorship/date of each account.
- A3. Do the artifacts cited by the "grid empties for 30 s across passes 4, 5, 6" claim exist on disk? Name them or report absent. Absence is a finding.
- A4. `clients/encore/specs_planning/_internal/old-site-baseline/service-charge-2026-08-11.md` — does the predecessor application's History grid sort on header click? Verbatim quote or explicit **NOT COVERED**. This is the LR-ENC-001 tie-breaker; do not stretch a nearby sentence to fill it.
- A5. `jira-defect-crossref-service-charge-2026-08-10.md` — is NM-2919 present? Report the crossref's actual ticket count against the claimed 34.
- A6. The sort-button count: quote **both** the field-inventory number and the number in the closed plan `plans/done/PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK.md`, with `file:line` for each. Do not reconcile them — report both.

**Lot B — mechanism truth** (`--work-type research`, T2, read-only):
- B1. Read `sortColumnViaDropdown` at [corporate-override.page.ts:781](clients/encore/src/pages/corporate-override/corporate-override.page.ts:781) and describe the interaction step by step: what is clicked first, what appears, what is clicked next, what confirms the sort landed.
- B2. What does the Service Charge History page object / selector layer model for the grid headers? Is any sort affordance modelled at all? Quote.
- B3. `scripts/check-unfailable-assertions.mjs` — quote its complete kind list. Would any kind flag `expect(x).toBeNull()` where `x` comes from `.catch(() => null)`? This settles PF-1.
- B4. Quote the exact source lines governing whether a dispatched worker may run `playwright-cli goto`/`open`, and the labor-gate lines governing the CEO. Classify each **HARD** (blocking mechanism, `file:line`) or **SOFT** (prose only). This settles who runs Phase 1 — on mechanism, not on the prior session's claim.
- B5. Re-adjudicate the three prior reports under `.claude/state/ua-worker/chips/his012-truth/`: per load-bearing claim, CONFIRMED / REFUTED / UNPROVABLE against disk today. They are untrusted worker output, not evidence.

**Acceptance**: both reports carry `## ASSUMPTIONS-MADE`; `git diff --stat` empty; every claim has `file:line` + verbatim quote; tee'd `*.verify.txt` artifacts with sha256. CEO spot-audits ≥3 claims per lot against disk before accepting (`feedback_worker_report_claims_need_own_grep.md`).

### Phase 1 — Live truth (executor decided by B4; OFF-REPO: yes)

**The only question that matters: does the Service Charge History grid sort, by any interaction the UI actually offers?**

**Routing gate — one cheap smoke before the expensive walk.** B4 reads the mechanism from source, but source-reading is not a live fire, and the prior session's contrary claim is on record. So before committing a walk-tier dispatch (1500 s, 250-credit floor), fire a single `probe`-type worker (600 s, 100-credit floor) that runs one `playwright-cli` navigation against the base URL and reports the raw exit code and output. That converts a possible dead 250-credit dispatch into a 100-credit decision, and it is the live fire that settles the contradiction between the rulebook and the prior session.

Then route on the smoke's result, not on assumption:
- Smoke **lands** → dispatch the walk to a T2 worker per the rulebook's live-walk row, then a **different** agent independently re-executes the same script (pyramid layer 4). Two agents, cross-family.
- Smoke is **denied at the mechanism level** → the delegation ladder's sanctioned last rung applies: a scoped `SELF_GRANT`, CEO runs it headed, logged as a routing incident with B4's quoted mechanism as the justification. **Never route around the deny** (`feedback_dispatch_must_be_visible.md`) — take the documented escape or stop and tell Rutvik.
- Smoke **fails for any other reason** (auth, network, app down) → that is env-flake, not a capability answer. One fresh retry, then ENV-BLOCKED and surface it. Absence of a deny is not proof of permission (`feedback_gate_trip_probes_need_valid_payloads.md`).

**Probe design** — the prior attempts failed because they tested one interaction and called it the answer:

1. **Environment gate first.** Confirm `.auth` state exists and lands on the app, not on an Entra page. A generated result from a broken input environment lies (`feedback_a_generated_deliverable_lies_when_its_input_environment_is_broken.md`). On an Entra redirect, take the documented headed `open --persistent` → `state-save` refresh path; do not retry headless.
2. **Enumerate the headers.** For every History column, record: role, tag, whether it is a `button`, and every testid/class. This settles 2-vs-4 sort buttons with machine output, not memory.
3. **Interaction A — bare header click** on each header in turn. Capture row count and row 0 contents before and after, plus `aria-sort` on all headers. Wait past the documented 22–30 s render window (`project_encore_e2e_slow_render_vs_test_timeout.md`) before concluding "empty".
4. **Interaction B — the menu path**, modelled on B1. Click the header; snapshot for any menu/`menuitem`/popup; if one appears, drive the sort option and re-capture order. PLANNER HARD STOP #17 applies: open it and document what is there — never assume the affordance's shape.
5. **Positive control, same primitive** (LR-061-C — the load-bearing word is *same*): drive a sort on the Corporate Override grid with the identical primitive. Sort lands there but not on History → the History verdict stands. Sort does not land there either → the driver is broken and **no verdict may be recorded**; fix the primitive and re-run.
6. **Second evidence source before any generalization.** LR-061-A: one office is a single data point and cannot distinguish office-specific data state from application behaviour. A4's baseline walk is the preferred second source. **If A4 returns NOT COVERED, Phase 1 must probe a second office** — the walk is not complete on office 1604 alone, and no SORT-BROKEN verdict may be recorded from one office (`feedback_a_bug_does_not_always_reproduce_on_other_data.md`).
7. **Restore.** No persisted mutation. Read-only walk on a shared server.

**Output**: a dated walk artifact under `clients/encore/specs_planning/_internal/`, carrying raw captures, not prose.

**Two branches, both real** — do not pre-commit:
- **Branch SORT-WORKS** — the grid sorts (via menu or otherwise). Then TC-SVC-HIS-012 tests the wrong interaction and its Expected is factually wrong. No application bug.
- **Branch SORT-BROKEN** — no interaction sorts, on two independent evidence sources. Then this is NM-2919's defect class on a second surface. Run LR-044's bug verification protocol **before** filing anything, then file per LR-034. A bug filed on an unverified reproduction is how this whole mess started.

### Phase 2 — Fix the test (DELEGATED, T2 worker + cross-family reviewer; GENERATOR identity)

Common to both branches — F1–F3 are unconditional:
- Delete the unfailable oracle. No `.catch(() => null)` feeding the assertion it satisfies.
- Remove the in-test narrative that contradicts the test-case document (F4). One account survives, and it is the one Phase 1 proved.
- Wire the positive control into the test itself, so a future green cannot come from a dead primitive.

Branch SORT-WORKS → rewrite TC-SVC-HIS-012 to drive the real interaction and assert the grid **does** reorder (assert row order, the strongest known oracle — LR-068 corollary (a), never a weaker relative comparison).

**Rewrite-vs-replace is Rutvik's call, not a worker's.** If the honest outcome under SORT-WORKS is that this test case should be retired and a genuine sort test written in its place, that is a test-case deletion: archive-move, prune-check for live references, and Rutvik confirms per item. No autonomous deletion, ever (`feedback_dont_destroy_user_data.md`). A worker may draft the replacement; it may not retire the original.

Branch SORT-BROKEN → file the bug first per LR-034, then mark the test `fixme` citing the bug reference. **Not** a green tautology, and not a skip without a named unlock (`feedback_blocked_reasons_name_the_unlock.md`).

Constraints: LR-058 — the shipped comment states the reason in plain English, zero internal rule IDs. GENERATOR HARD STOP #1 — the spec must actually run and return a pass/fail count; a syntax check is not a run (`feedback_a_syntax_check_is_not_a_run.md`). Never a full-suite run: verify solo or `--grep`, and report it as "passes solo" (`feedback_no_full_suite_runs_ever.md`).

### Phase 3 — Reconcile every artifact (DELEGATED, T2 worker; PLANNER identity)

LR-ENC-002: the MD, test plan, XLSX and spec land parity in the **same** change — no deferral. A test-case ID lives in four places (`feedback_a_test_case_id_lives_in_four_places.md`).

- All six TC-SVC-HIS-012 artifacts state one account, matching Phase 1's evidence.
- The sort-button count is corrected wherever it is wrong, including the already-closed `PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK.md`. It is committed, so this is a forward correction commit — never a history rewrite. The number needs correcting, not defending.
- Strike the recorded excuse *"never probed because clicking empties the grid"* from the field inventory. An unproven claim became the reason not to run the test that would check it — the inventory carries Phase 1's actual observation instead.
- PLANNER HARD STOPs #8 (TC↔plan sync) and #9 (header count matches actual count) apply.

### Phase 4 — Close the recurrence (DELEGATED draft, CEO authors the mechanism)

- **PF-2 (CONVICTED)**: graduate the memory-only tautology rule into a real mechanism — a `LR-NNN` entry plus, if B3 shows the gap is regex-detectable, a new kind in the spec-quality gate for *assertion whose expected value is produced by the swallow on its own input path*. Fail-green discipline: confirm zero hits on the clean tree before wiring it to block, so the gate wedges nothing legitimate (`feedback_a_guards_test_corpus_must_contain_what_it_must_not_block.md`).
- **PF-1 / PF-3**: verdicts recorded from B3 / A5. If PF-3 is convicted, LR-ENC-004's scope extends from *module* to *surface family* so a sibling-page defect like NM-2919 cannot fall outside the intake query again.
- The gate's corpus must contain what it must **not** block, not only attack fixtures.

### Phase 5 — External audit (SEPARATE session — AUDIT HARD STOP #0a)

This session produced the deliverable, so this session may not audit it. Hand off to a fresh WATCHDOG seat with a cross-family reviewer. Zero findings on non-trivial work requires explicit justification (AUDIT HARD STOP #3).

---

## §5 Per-Identity Satisfaction

| Identity | Duty in this plan | Concrete deliverable |
|---|---|---|
| OWNER | Decompose, ticket, dispatch, judge, correct the closed plan's count | `plans/pending/PLAN_71_HISTORY_SORT_TRUTH_AND_TAUTOLOGY_TEST.md`<br>`clients/encore/specs_planning/_internal/agent-activity-log.md` |
| PLANNER | Phase 1 live walk; Phase 3 test-case + test-plan parity | `clients/encore/specs_planning/_internal/walk-evidence-service-charge-history-sort-2026-08-16.md`<br>`clients/encore/specs_planning/test-cases/setup/service-charge/service_charge_history_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/service-charge/service_charge_history_test_plan.md` |
| GENERATOR | Phase 2 spec rewrite + solo run | `clients/encore/tests/service-charge/service-charge-history.spec.ts` |
| WATCHDOG | Phase 5 external audit | `plans/pending/PLAN_HIS012_EXTERNAL_AUDIT.md` |
| HUNTER | Jira intake scope correction (PF-3) | `clients/encore/specs_planning/_internal/jira-defect-crossref-service-charge-2026-08-10.md` |
| HEALER | — | (skipped: no failing spec is being healed; the spec is being rewritten by GENERATOR, not repaired) |
| GARDENER | — | (skipped: no framework hygiene or dead-code sweep falls inside this plan's scope) |

## §6 Duty coverage — phase-owner HARD STOPs

**PLANNER** — #4 read-only first (Phase 1 step 1–2 are enumerate-and-observe), #5 restore always (Phase 1 step 6), #12 fresh reload before recording any default state, #13 beforeunload dialog-accept before `goto` after any edit, #14 defaults from DOM only, #17 verify the dropdown's actual features rather than assuming (Phase 1 step 4), #8 TC↔plan sync and #9 count check (Phase 3). *Excused*: #1/#2/#3 location/URL/scope — the module and URL are fixed and already registered.

**GENERATOR** — #1 tests must actually run, #7 verify prior claims against live DOM (Phase 1 supplies this), #8 beforeunload trap. *Excused*: #0 Phase-0.5 walkthrough — Phase 1 **is** a fresh live walk emitting a dated artifact, which is the stronger path 0.5b, not a skip. #5 no root framework edits — nothing outside `clients/encore/` is touched.

**WATCHDOG** — #0a no self-audit (Phase 5 is a separate session, non-negotiable), #3 assume errors exist, #4 verify every claimed fix cites an artifact field.

## §7 NOT touched

- `clients/encore/tests/service-charge/service-charge-history.spec.ts` tests other than TC-SVC-HIS-012 — TC-SVC-HIS-013 and its siblings are out of scope.
- Any other module's specs, page objects, or grids. The Corporate Override grid is **read** in Phase 1 as the positive control and is not modified.
- Git history. The closed plan's wrong count is corrected forward, never rewritten.
- PROTECTED control files (delegation hooks, wrapper, settings). If Phase 4's mechanism would touch one, HALT and get Rutvik's explicit go first.
- The five other Service Charge artifacts' content unrelated to column sort.

## §8 Verification artifact

Re-runnable checks that confirm this plan landed. Every one must hold at closure.

```bash
grep -c "catch(() => null)" clients/encore/tests/service-charge/service-charge-history.spec.ts
```
Expected: `0` inside the TC-SVC-HIS-012 block — the unfailable oracle is gone.

```bash
grep -rl "TC-SVC-HIS-012" . | wc -l
```
Expected: 6 or more files, and every one states the same account as the Phase-1 walk artifact.

```bash
npx playwright test clients/encore/tests/service-charge/service-charge-history.spec.ts --grep "TC-SVC-HIS-012" --retries=0
```
Expected: an explicit pass/fail count. Under Branch SORT-BROKEN the test reports as `fixme` with a bug reference, never as a green pass.

```bash
ls -la clients/encore/specs_planning/_internal/walk-evidence-service-charge-history-sort-2026-08-16.md
```
Expected: exists, and contains the positive-control result. No positive control = no verdict.

## §9 Adversarial audit of this plan (record, 2026-08-16)

Three angles, three concrete findings, all fixed above before the plan was saved.

| Angle | Finding | Fix landed |
|---|---|---|
| Skeptic | Phase 1's routing rested entirely on B4 reading gate source. Source-reading is not a live fire, and a prior session claims the opposite on record — so a wrong read burns a full 250-credit walk dispatch that dies silently. | Added the cheap `probe`-tier navigation smoke as a routing gate before the walk-tier dispatch, plus an explicit env-flake branch so "it failed" is never misread as "it is denied". |
| Scope | Two gaps. (a) A SORT-BROKEN verdict was going to be drawn from one office, which LR-061-A forbids. (b) The plan assumed *rewrite* and never named *replace*, so a worker could have retired a shipped test case autonomously. | (a) Phase 1 step 6 now requires a second evidence source, falling back to a second office when the baseline returns NOT COVERED. (b) Phase 2 names retirement as a Rutvik decision with the archive-move + prune-check path. |
| User intent | The branch that files a bug cited LR-034 (how to file) but not LR-044 (verify before filing). Filing an unverified reproduction is the exact failure that produced the handoff this plan exists to clean up. | Branch SORT-BROKEN now runs LR-044's verification protocol before LR-034's filing. |

## §10 Plan-Deviations log

| # | Deviation | Reason | Disposition |
|---|---|---|---|
| D-1 | The walk-evidence artifact named in §5 was produced but never written into the repository — it existed only under `.claude/state/ua-worker/chips/`, which is excluded from version control. | The walk ran inside a delegated worker, and its output was accepted from the worker's own directory without checking that the declared repository path had been created. | Promoted to `clients/encore/specs_planning/_internal/walk-evidence-service-charge-history-sort-2026-08-16.md` before closure. Same class as the PLAN_72 D-1 row. |

---

## Closure status — WORK COMPLETE, STATUS HELD AT PENDING (2026-08-16)

Every phase this plan owns is finished and evidenced below. The `Status` field stays `Pending` because
the closure gate denies the flip, and the denial is **not overridable by any mechanism this session is
authorised to use**.

**The denial**, reproducible:
```bash
cat plans/pending/PLAN_71_HISTORY_SORT_TRUTH_AND_TAUTOLOGY_TEST.md \
  | sed 's/^\*\*Status\*\*: Pending/**Status**: DONE/' \
  | node scripts/validate-plan-closure.mjs --content-from-stdin --json \
      --plan plans/pending/PLAN_71_HISTORY_SORT_TRUTH_AND_TAUTOLOGY_TEST.md
```
→ `Cx FAIL, overridable=false — UNRESOLVED-PROBE-GATE: 23/29 control(s) unresolved after allowlist`,
against `clients/encore/specs_planning/_internal/old-site-baseline/service-charge-2026-08-11.md`.

**Why it fires**: this plan cites that artifact once, at line 117, as a fact source — a question about
the predecessor application. `Cx` extracts every path in a plan body and cannot distinguish a plan that
*owns* an artifact's coverage from one that *reads* it. Diagnosed cross-family with file:line evidence;
recorded as Link 6 in `plans/pending/PLAN_74_FAKE_GREEN_ROOT_CAUSE_AND_GATE.md`, which owns the fix.

**Three routes were available and all three were rejected, deliberately:**

| Route | Why not |
|---|---|
| Edit `scripts/validate-plan-closure.mjs` to change the scoping | Enforcement code. Modifying a closure gate so that one's own plan passes is the self-serving change the owner's standing rule reserves for explicit approval. |
| Flip `coverage_mode` from `deny` to `announce` in `.claude/closure-config.json` | That file is agent-writable and the override file deliberately is not — precisely so a rollout knob cannot launder a closure. This is the laundering it was built to prevent. |
| Shorten or delete the line-117 citation so the path stops resolving | The path resolving is *correct*; it was corrected earlier this session to satisfy check C3. Un-correcting it to dodge a different check is gaming a gate, and it would also remove a real source citation. |

**The honest reason this plan stays open**: closing it would require weakening the machinery that stops
false completions — inside a plan whose entire subject is tests that reported success without earning it.
That trade is not available. A held plan with its work finished and its blocker named is a truthful state;
a flipped one would not be.

**What unblocks it**: either Link 6 in PLAN_74 (correct the gate's scoping), or an owner decision. The
23 unresolved controls are recorded as Link 7 in PLAN_74 — the artifact declares `Coverage_Ratio: 29/29`
and `CrossCheck: clean` while its own provenance data disagrees. That finding stands on its own merits
and must not be erased by whatever fixes the scoping.

**Independently checked, 2026-08-16.** A cross-family seat was dispatched specifically to attack the
conclusion above and find a fourth route. Its verdict: *"No: I found no legitimate fourth route that
satisfies all four constraints; the honest close path is owner-approved remediation/override with the 23
unresolved controls still visible."* It enumerated and killed, with file:line, several options not
considered here — the `closure_meta` / `meta_plans` exemption (only double-keyed meta plans listed in the
overrides file qualify), `--dry-run` / `--report-only` / `--write-manifest` (measurement-only, and the
manifest writes only after a PASS), the closure-overrides schema (C1-and-token scoped; Cx is explicitly
non-overridable), and a blocked-or-deferred status convention (a non-DONE plan is simply skipped, and an
LR-060 deferral requires real user authorisation and does not mark anything complete).

On whether holding is itself the greater harm, that seat's judgement was: *"holding is harmful but less
harmful than an agent-authored dodge."* Pending status does pollute the queue — the index currently
carries 154 pending and 120 stale — and that cost is real and accepted here.

**The block is a false positive — settled by a two-seat fight, 2026-08-16.**

A second seat, from a different provider, reviewed that verdict and returned PARTIAL: the hold was right
but the reasoning was not. It rejected the argument that correcting the gate would be *weakening* it, on
a test worth keeping: a correction still fails a plan that genuinely owns unresolved coverage, whereas a
weakening does not. "An agent should not modify a gate that judges its own work" is a **process
constraint** — legitimate, and the owner's to waive — but it is not the same claim as "this change is a
weakening", and collapsing the two was an error in this plan's earlier reasoning.

That seat also found what neither the first seat nor this session had pursued, and the defending seat
then confirmed it at source: **the unresolved count is computed from the JSON alone.**

```js
// scripts/walk-coverage/verify-denominator.mjs:221-248
const allKeys = Object.keys(data.derived_types);
const unresolvedKeys = allKeys.filter(k => {
  const dt = data.derived_types[k];
  return (dt.probe === 'unresolved' || dt.probe === 'unresolvable') && !allowlist.has(k);
});
```

A markdown `out-of-scope: outside-module` disposition never reduces that count. The artifact's markdown
already dispositions roughly 22 of these rows as outside the module and 6 more as read-only-verified with
live evidence (`:183-210`), and its markdown manifest **passes** the completeness parse
(`coverage-manifest.mjs:151-199`). `Cx` then separately re-derives a count from raw enumeration output
that never consumed those verdicts (`validate-plan-closure.mjs:847-856`).

**So the 23 are not undispositioned controls. They are dispositioned rows counted by a reader that cannot
see dispositions.** Verified independently by the orchestrator against the counting code.

**Joint position of both seats**: hold the plan as a pure agent action today — no agent should close by
dodging or self-editing the gate that judges it — but on the narrow ground that the remedy is an owner
action on a confirmed false positive, not on the earlier and weaker ground that the plan is incomplete.

Under `.claude/rules/guardrail-policy.md` LR-069 §3.4 a gate with confirmed false positives is **demoted
or fixed, never evaded**. The three candidate fixes are enumerated in PLAN_74 Link 7.

---

## Execution Summary

**Executed**: 2026-08-16 · **Verdict**: the shipped test was factually correct and completely useless.

### What was wrong

`TC-SVC-HIS-012` asserted that clicking a Service Charge History column header sets no `aria-sort`
attribute, and recorded in a comment that clicking a header empties the grid. Both statements are true.
Neither one can fail. The grid never uses `aria-sort` whether sorting works or not, so the assertion held
identically in a working application and a broken one. The test passed for months and proved nothing.

The recorded claim that clicking a header "empties the grid" was worse than useless: it had been used as
the stated reason for never probing the sort controls at all. An unproven observation became a permanent
excuse.

### What the live walk established (Phase 1)

Artifact: `clients/encore/specs_planning/_internal/walk-evidence-service-charge-history-sort-2026-08-16.md`

- **All four** column headers are `<th>` elements containing a dropdown trigger. Every one opens a menu offering ascending sort, descending sort, and hide column. The application sorts correctly — Rutvik's ground truth, now independently confirmed.
- `aria-sort` is never set, before or after sorting. The grid genuinely does not use it.
- The grid does **not** empty on a header click. The blank rows are a loading skeleton; the grid then populates. The recorded excuse was false.
- 347 rows observed live.

### What was fixed (Phase 2)

`TC-SVC-HIS-012` was rewritten as *"Sorting the History grid by Modified On via the column header dropdown
reorders rows"*, carrying two independent oracles: ascending row 0 equals the minimum visible date, and
ascending row 0 differs from descending row 0. Both fail if sorting breaks.

Supporting page-object method `sortHistoryColumnViaDropdown` added, which waits for the row content to
actually change rather than sleeping, and raises a named error if the grid never re-renders.

**Test result: passes 3 of 3 runs, 2026-08-16.** A fourth run by an uninvolved session is Phase 5's job.

A separate defect surfaced and was fixed: `test.setTimeout(120_000)` sat inside `beforeEach`, which runs
first and pins the clock, so any per-test limit declared in a test body could never take effect. Moved to
`test.describe.configure`. The identical pattern was later found and fixed in the Basic Information suite
under PLAN_72.

### What was corrected in the record (Phase 3)

- The sort-affordance count, wrong in two artifacts, corrected to four.
- The false "clicking empties the grid" excuse replaced with the observed behaviour.
- `plans/done/PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK.md` corrected **forward** at line 413 — its status untouched, no history rewritten — admitting the two-affordance figure was an enumerator limitation and that coverage sized from it was undersized.

### TC accounting (LR-027)

- **Implemented**: 1 — `TC-SVC-HIS-012`, rewritten and passing.
- **Dropped**: 0.
- **Deferred**: the coverage undersized by the wrong affordance count. This plan corrected the *number*; it did not author the coverage that number should have produced. Destination below.

### Phases not executed here, with named destinations (LR-040)

| Phase | Status | Destination |
|---|---|---|
| Phase 4 — close the recurrence | Drafted, not landed | `plans/pending/PLAN_74_FAKE_GREEN_ROOT_CAUSE_AND_GATE.md` — owns the rule graduation and gate work for this class. Not a phantom handoff: that plan exists and carries the line items. |
| Phase 5 — external audit | Plan written, not run | `plans/pending/PLAN_HIS012_EXTERNAL_AUDIT.md` — must run in a **fresh session**. This session produced the deliverable and is barred from auditing it. |
| Undersized coverage | Not authored | `plans/pending/PLAN_74_...` §2, as the measurable consequence of the gap. |

### Verification at closure

```bash
node clients/encore/specs_planning/_internal/fake-green-proofs/prove-fake-greens.mjs
```
Confirms findings 1 and 2 — this plan's test — were provably unfailable before the repair.

```bash
cd clients/encore && npm run test:grep -- "TC-SVC-HIS-012"
```
Expected: the test's own result line reads `ok`.

### Honest limits

- The corrected test has been run only by the session that wrote it. That is exactly why Phase 5 exists.
- `npm run check:spec-quality` exits 1 on this tree, from a doctrine-ledger check reporting 3 rules with no ledger entry — including LR-074, which landed 2026-08-14. That checker reads the doctrine corpus and never opens a spec file, so the failure is pre-existing and unrelated to this work. The four checks that do govern spec quality — unfailable assertions, swallowed failures, fixed sleeps, reload waits — all pass in enforce mode on the working tree.
