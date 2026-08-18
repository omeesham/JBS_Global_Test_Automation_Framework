# PLAN 68 — Deliverable restructure to client format + permanent sync repair

**Status**: PENDING — **all ten decision gates ANSWERED 2026-08-14** (interrogation session with Rutvik). Not yet started; execution still needs a `/execute` and the Phase 3 client dependency (write-access TestRail API key).
**Priority**: P0 (Track A is client-facing)
**Created**: 2026-08-06 (drafted) · promoted to `plans/pending/` 2026-08-14
**Identity**: OWNER (orchestration + ship) · GIVER (test-case/xlsx authority) · BUILDER (spec edits) · WATCHDOG (audit gates)
**Parent**: (none — top-level initiative)
**Depends on**: nothing blocking; Track B overlaps `PLAN_REPO_SLOP_SWEEP.md` cleanup scope
**Blocks**: any further deliverable ship to `RutviK-JBS/encore_deliverables_test` main
**Model**: claude-opus-5
**Thinking**: ultrathink
**PermissionMode**: acceptEdits (Track A) — `default` for Phase 5.3 push
**BrowserTool**: Playwright CLI (Phase 5.1 real-environment spec run); no Chrome-MCP row

---

## Context

The client returned comments that our spec files and the xlsx workbooks are out of sync on steps, and shipped a zip ((a local Downloads folder file — never part of the repo), 167-file tree rooted at `tests/`) showing the structure they expect — TestRail-ready, no written instructions. This plan reshapes our deliverable into that shape, fixes every md↔xlsx↔spec↔manifest divergence **at the source**, and installs gates so the defect class cannot ship again.

**Provenance**: authored 2026-08-06 as `PLAN-DRAFT.md` in the evidence chip below; held unsaved pending Rutvik's interrogation. Recovered and promoted 2026-08-14 unchanged in substance — the ten decision gates are still open.

**Evidence base**: 12-lot audit council, cross-family-reviewed, fight-protocol-closed. Numbers below are reviewer-verified. Evidence root `.claude/state/ua-worker/chips/testrail-restructure/` (internal only, never ships): `PLAN-DRAFT.md`, `SYNTHESIS-DRAFT.md`, `tickets/`, `out/trr-A…trr-F`, `out/re-review-G1…G4`.

**Goal in one line**: reshape our deliverable into the client's `tests/` format (TestRail-ready), fix every spec↔xlsx↔source sync defect at the source, and install gates so this class of defect can never ship again.

> **PRE-EXECUTION AUDIT — 2026-08-15 (read before starting any phase).** A second, independent audit army (9 read-only lots, opus + gpt-5.5, every lot cross-family reviewed → defended → alignment-verified) re-checked this plan against the client's tree, our tree, and our gates. Findings, evidence and the killed-false-claims list live at `.claude/state/ua-worker/chips/plan68-preaudit/VERIFIED-CANON.md` (per-lot detail in that folder's `out/`). It corrects this plan in four load-bearing places — each is annotated inline at the phase below, and the four that change what an executor does first are:
> - **Phase 0.1/0.2 are already DONE** on disk (commit `414158ed5` tracked SCT/TNC and registered both module codes). `xlsx:freshness` today fails on *dirty service-charge MD sources*, so Phase 0.3's commit is the real unlock.
> - **Phase 1.2's "155 spec-TCs absent from xlsx" is 0 today** — canonical `npm run check:tc-parity` PASSES. Current counts: 1168 md / 1168 xlsx / 1058 spec, with 110 md-only ids (planned, not implemented) left for the 1.1b triage.
> - **Phase 3.2 is under-scoped**: our `clients/encore/playwright.config.ts` contains *zero* TestRail reporter wiring (theirs registers `./src/reporter/testrail-reporter.ts`). Porting reporter files without adding the registration ships a dead reporter.
> - **Phase 2.2's rename has a 202-literal blast radius**, and `scripts/step-labels.baseline.json` is PATH-keyed (106 `corporate-override` entries) — `check:step-label-parity` goes silently blind unless the baseline migrates in the same change.
>
> Also corrected there: D8's "37 bare refs → 0" is FALSE on disk (35 strict / 37 loose still present, no such commit exists); "they adopted our POM `src/` wholesale" is refuted (26 of 101 paired files really differ); and several worklist counts moved (171→172, 50→47, TNC 48/39→44/45, pending-automation 20→0).

**Executor assumption**: a low-context Claude agent (their side or a colleague) executing blindly. Every phase therefore carries exact commands, exact file lists, machine-checkable exit criteria, and zero internal-framework jargon in anything that ships. Our repo copy of this plan keeps the evidence pointers.

---

## Bootstrap (read before executing)

- **Identity**: `/identity OWNER` to start; `/identity GIVER` before any `test-cases/*.md` or xlsx write; `/identity BUILDER` before any `.spec.ts` write.
- **Skills auto-called**: `/execute` (orchestrator) · `/questionnaire` (the interrogation gate below) · `/delegation-temp` (dispatch discipline) · `/regression-guard` (before + after Phase 2) · `/push-encore-deliverables` (Track A ship) · `/push-repo` (Phase 5.3) · `/final-q` (closure).
- **Context files**:
  - `CLAUDE.md` · `clients/encore/CLAUDE.md`
  - `docs/read_only_docs/LEARNED_RULES.md` · `docs/read_only_docs/AGENT_SHARED_RULES.md`
  - `.claude/rules/pipeline.md` — LR-048 (this structure), LR-049 (ship via `git archive`, never `cp -r`), LR-050 (cleanup enumerated in-scope), LR-027/LR-028 (closure + activity log), LR-020 (verify claims), LR-060 (execution-completion discipline)
  - `.claude/rules/deliverable.md` · `.claude/rules/data.md` · `.claude/rules/inventory.md` · `.claude/rules/browser-tool.md` · `.claude/rules/guardrail-policy.md` (LR-069 — every new gate in Phase 4)
  - `clients/encore/specs_planning/_internal/field-inventory-spec.md`
  - This plan's evidence root (above)
- **Standing constraints**: Jira READ-ONLY. Ship only via `npm run client:ship` / `scripts/ship-client.sh`. Phase 5.3 push needs a fresh explicit in-chat GO from Rutvik.

---

## DELEGATION LAW (owner directive — governs every phase below)

This plan is large, and the way it is worked matters as much as what it produces. Everything here was
learned the expensive way — each law below cost a dead run, a wrong claim, or a wasted round before it
was written down. **This section is binding on every phase and may not be weakened by any agent,
including a future Claude.** If a phase seems to justify an exception, that is a finding to report, not
a licence to proceed.

Sources, for anyone who wants the long form: `.claude/skills/delegation-temp/SKILL.md`,
`.claude/skills/ultra-agents/worker-ext.md`, and the burn analysis in
`plans/pending/PLAN_75_DELEGATION_BURN_AND_LOSSLESS_GUARANTEE.md`. **PLAN_75 has not run yet.** It will
later replace some of the guidance here with measured numbers; until it does, this section is the
operating standard, and nothing below waits on it.

### §D1 — The one rule everything else serves

**Claude thinks. Workers do.**

The brain is never economised and the hands are never Claude's. Two ways to break it, and both are
failures regardless of what they save:

- Pushing **judgment** down to a worker — classification, disposition, accept/reject, "is this a bug",
  "does this coverage hold". A worker gathers evidence; it does not decide.
- Pulling **doing** up to Claude — running specs, walking surfaces, grepping the repo wide, drafting
  rows, reading artifacts to reconstruct what happened.

The test for any task: *does this need a decision, or does it need hands?* Decisions stay. Hands go out.

### §D2 — What Claude does itself, and nothing more

Claude's own work on this plan is exactly this list:

Talking to Rutvik · writing tickets and dispatching them · reading verdicts and deciding
accept/reject/bounce · identity switches, activity-log rows, plan-status ceremony · edits to protected
control files · the final judgment on any disputed finding · publishing — the git push, the Jira write,
the client ship.

**Everything else is delegated.** In particular, on this plan: the spec runs (Phase 5.1), the workbook
comparisons (Phase 1), the tree diffs (Phase 2.5), the gate live-fires (Phase 4.6), the dependency
reconciliation (Phase 2.1b), and every count in the "re-measure at execution" list.

**The Bash tripwire.** Stop and write a ticket before running any of these yourself: `npx playwright` ·
any `npm test|lint|check|run` of substance · `playwright-cli` · a pipe chain with two or more greps ·
a repo-wide grep · any command over ~200 characters carrying repo paths · reading more than two files
to understand something · drafting anything · reading logs or artifacts to work out what went wrong.

Free to run inline, always: a single `cat`/`head`/`grep` over one file · `git log|diff|status` ·
`ls`/`echo` · the dispatch commands themselves · reading a worker's report.

### §D3 — The seven moments you are about to do a worker's job

Each is a real moment where the discipline slips. Name it out loud when it fires:

1. **Just after a compaction** — the role erodes into rule-text. Re-read this section.
2. **Urgency** — "just quickly" is the tell.
3. **A worker has stalled** — the rescue urge. See §D7.
4. **The task looks small** — "it's one line."
5. **The third read in a row** — the first read was legitimate, the second borderline; the third *is*
   the investigation you should have ticketed.
6. **You have the technique loaded** — you just read how the worker does it, so you reach for it.
7. **The worker just came back** — and you want to redo it yourself rather than check it.

### §D4 — The fight protocol (review is never terminal)

**Required shape**: seat 1 works → seat 2 reviews → **seat 1 defends** → they go back and forth until
aligned → only the aligned result reaches Claude.

**Forbidden shape**: seat 1 works → seat 2 reviews → Claude acts on the review. A review that reaches
Claude without the author defending is a protocol defect — send it back.

Two further requirements:
- **Cross-provider.** The reviewer's provider must differ from the author's, recursively. No provider
  grades its own homework. Two seats from the same family that never disagree are not a council; that
  exact mistake wasted a full round on 2026-08-16 and was caught only on re-reading the skill.
- **Off-repo work gets re-executed, not read.** For anything not provable from the repo diff — a live
  walk, a spec run, a browser observation — the reviewer independently repeats the actions. Paper review
  can never green off-repo work. Reviewer stance: the worker is guilty until its evidence proves
  otherwise.

Applies to this plan's own phases too: Phase 1's divergence worklists, Phase 2's tree diff, and Phase 4's
gate live-fires each need an author seat and a defending fight, not a single pass.

### §D5 — Ticket mechanics that decide whether a run lives or dies

These are not style notes. Each one has killed a run.

**Paths and output**
- The output path is written **literally and absolutely** in the ticket. A worker does not know its own
  run id and cannot expand a variable you had in mind.
- Create the output directory at dispatch time. The wrapper refuses to start a run whose output
  directory already exists, and a duplicate run id hard-exits — that guard exists to stop two runs
  sharing a verdict file.
- **`ls` every path the ticket asserts exists.** A worklist's file column is a claim, not a fact.

**Commands the worker will run**
- `set -o pipefail` at the top of every verify block, or a failing command inside a pipe reports success.
- **Tee everything.** A worker that dies takes its unwritten report with it, and another session's
  cleanup can remove an untee'd file. Evidence has to outlive both the run and the repo.
- **No quoted payloads on the command line.** The ticket text rides the command line and Defender scans
  it; an exit 126 means the scanner ate it, and retrying in a loop will not help. Probes go in files, and
  never carry literal secrets.
- **One command must finish inside roughly twenty minutes.** Past that the worker is killed mid-flight
  and reports nothing, or worse, reports a misleading zero. Shard the work.

**Scope**
- **Edit exactly one file per dispatch, create none.** Multi-file tickets come back partial.
- Parallel tickets must not touch the same files *or run the same commands* — two Playwright runs share
  auth state and truncate each other.
- Split large work into disjoint lots, run in parallel; more than five parallel needs Rutvik's go.
- **Never edit `copilot-worker.sh` while a dispatch is in flight.**

**Sizing**
- `--max-credits` is **mandatory**, sized at **twice** your estimate. Credit exhaustion is the most
  common cause of a run that dies producing nothing at all. The wrapper enforces a per-work-type floor
  and will raise a cap it thinks is too low, but a floor is a backstop against a typo, not a sizing
  strategy.
- `--work-type` is mandatory — the wrapper hard-exits without it.
- Always pass `--session-id` and `--parent-run-id` so the run is traceable to this plan.

### §D6 — Dispatch discipline

- **Preflight every dispatch**: `node scripts/dispatch-preflight.mjs --ticket <t> --run-id <id>
  --model <m> --work-type <wt>`. It checks the output anchor, run-id uniqueness against both the ledger
  and disk, the work-type, the model/effort pairing, and the credit floor, then prints the canonical
  command. **Exit 1 means do not dispatch.** Use the command it prints — a hand-assembled variant with a
  swapped profile once burned four hours for zero output with credits untouched, and `--timeout` did not
  bound it.
- **Carry the doctrine in.** A worker starts with a fraction of Claude's context. Run
  `node scripts/ticket-skill-scan.mjs --goal "<goal>" --work-type <type>` and cite what it returns; match
  the ticket's paths against `.claude/rules/*.md` and cite every rule that matches. A build, RCA or draft
  ticket with no doctrine cited is a dispatcher defect, not a worker defect.
- **Ask before building.** On high-risk or novel scope, send a read-only clarifying probe first — the
  worker returns either `NO-QUESTIONS` or at most three questions. No build dispatch until each question
  has a recorded answer.
- **Demand assumptions.** Every ticket requires an `## ASSUMPTIONS-MADE` section. Missing means the
  report is incomplete. Two workers whose assumptions conflict is a stop-and-surface, not a merge.
- **Every dispatch must be visible.** It runs through the wrapper, in the foreground of a tracked tool
  call. No detachment — no `&`, `nohup`, `setsid`, `Start-Process`, `schtasks`, or any other way of
  putting a run behind one more layer. A run Rutvik cannot see is indistinguishable from one hidden on
  purpose (LR-074).

### §D7 — Reading what comes back without being fooled

- **Write your trap questions before you read.** Three to seven questions predicting where a lazy run
  would slip. Then read. Then check at least three of its claims against what is actually on disk.
- **Machine facts beat prose.** Read the ledger row — `exit`, `ok`, `exit_reason` — before believing a
  report's story. A killed run can leave good-looking files and no real result.
- **Recognise a dead run that looks alive.** An output file whose first line is the wrapper's
  `NO DELIVERABLE` stub means nothing was produced, whatever else the ledger says. Scan the first couple
  of thousand characters of any result for `VERDICT: NOT-FIXED`, `SESSION LIMIT REACHED`, "no
  implementation completed", or "result.md was not written" — any hit is a failure, regardless of the
  exit code. Never accept a worker's own admission of failure as a success.
- **A non-empty `## ASK` blocks acceptance** until every item has a recorded answer.
- **Re-run the grep yourself.** Worker acceptance is a claim. So is "that's out of scope" — prove it with
  blame or diff before believing it.
- **Facts yes, diagnoses no.** Workers are good at observing and bad at concluding. Take the observation;
  do the diagnosis yourself.
- **Don't re-read a green diff.** That is redoing the reviewer's job — the §D3.7 trigger.
- **A positive control must exercise the same primitive** as the thing it licenses. A control that only
  reads cannot license a verdict about clicking.
- **A green check can be an artifact of invisibility.** If a check passes on everything and has never
  failed on anything, it is not yet evidence.
- **Copilot output is untrusted by default**, and a worker cannot enforce this framework's rules on
  itself — that is what your reading is for.

### §D8 — When a run dies

- **Never rescue it yourself.** Wait for the timeout, or dispatch a fresh worker with the same ticket
  plus the stall context. Self-rescue is the failure this whole section exists to prevent.
- **Check the locks first.** A silent death is most often a stale slot lock, not a broken ticket.
- **Stopping the tracked call does not stop the worker.** The shell dies; the underlying process keeps
  running and keeps writing. Verify by process and kill the tree.
- **At the second attempt, stop and look at the ticket**, not the worker. Ambiguous goal? Missing
  doctrine? Wrong model? Scoped past the wall clock? Fix the ticket before spending a third attempt.
- **Every death gets a cause**, recorded as one row: run id, cause, the permanent change that stops it
  recurring. Never a prose "be careful" note.
- **Bounce, don't self-fix.** A defect the review found goes back to the worker that made it. Fix it
  yourself only after a bounce has failed.
- **Classify the fault honestly**: your ticket's fault (costs no bounce) · a capability gap (escalate a
  tier) · environment flake (one retry, then declare it blocked) · genuine worker defect (bounce).

### §D9 — Not burning Claude

The point of all of the above is that Claude spends its tokens on judgment and nothing else.

- **Dispatch, then end the turn.** While a worker runs: no polling, no sleeping, no "just checking", no
  filler analysis. Fire every dispatch you can in one turn and stop. You will be woken.
- **Fire independent dispatches together**, not one at a time.
- **Read for the verdict, not the story.** If a report's verdict line answers the question, that is the
  read. Reports that bury the verdict should be bounced for shape.
- **A solved workflow gets written down once**, as a short runbook, so the next session does not
  rediscover it. Rediscovery is pure burn.
- **Keep the worker's technique out of your own context.** When a worker errs, the technique goes into
  its profile and you keep a one-line pointer. When you err, that goes to memory. When the system errs,
  that becomes a plan.
- **Known tax to watch for on this plan**: test output is UTF-16, so a plain `grep` over a run log
  silently finds nothing and reads as "the test never ran". That exact mistake has already produced a
  wrong report. Read run output accordingly.

### §D10 — Where delegation is not the answer

Three of the most expensive things observed are caused by delegation going *wrong*, not by Claude doing
too much: oversized tickets that die on the clock, bad tool error messages that cost diagnosis turns, and
the wrong council shape. **Delegating harder makes all three worse.** Before prescribing "delegate it",
classify: is this Claude doing a worker's job, is it the delegation machinery failing, or is it a broken
tool? A finding can be more than one, and a fix has to address every class it carries.

And the standing limit, stated plainly: **delegating still costs quality today.** A worker gets a
fraction of Claude's context. That is why §D6 makes carrying the doctrine in mandatory — it is not a
reason to do the work yourself.

### §D11 — Close-out for this plan

At the end of the work, record:

```
Receipt
- Worker jobs: <N> total, <N> passed, <N> failed, <N> retried
- Agents dispatched: <N> — <model> ×<N> (<work type>), ...
- Reviewed by: <who, and their verdict in plain words>
- I did myself: <plain list + why each was non-substantive, or "nothing">
- Self-work incidents: <N>   |   Uncapped dispatches: <N>    (both should be zero)
- Waste: <"none — could not have been fewer runs", or the honest admission>
```

**"I did myself: nothing" is the target.**

---

## PHASE INT — INTERROGATION GATE (mandatory; nothing below starts until this closes)

Run `/questionnaire` in Decision Mode over D1–D10. Every gate needs a recorded answer written back into this file (answer + date + one-line rationale) before its downstream phase may run. A gate answered by assumption is a plan defect, not a shortcut.

**Exit criteria**: all ten gates carry an `**ANSWER (YYYY-MM-DD)**:` line in this document, and no phase step still reads `[D#]` without a resolved branch.

**STATUS: CLOSED 2026-08-14.** All ten answered in an interrogation session with Rutvik. Four gates had a stale or wrong premise and were corrected against disk before answering (D3 file naming, D5 root workbook, D8 spec ids, D10 ticket column) — each correction is recorded inside its gate. One defect was found and fixed during the interrogation (D8's comment references). Downstream phase steps still carrying a `[D#]` marker now read against the answers below; Phase 2.2's directory-prefix residual is the only item deliberately left for execution time.

### DECISION GATES

- **D1.** Expected-result philosophy: ours verbatim vs theirs summary — governs the locations divergences + all future authoring. → **ANSWER (2026-08-14): OURS.** Our literal, self-contained expected-result text is the standard everywhere; their sample's phrasing is adapted to ours, not the reverse. Rationale: an expected result must stand on its own for a reader who did not write the case. No per-row merge — this is a blanket rule, so Phase 1 rewrites their side of the divergence, never ours.
  - **Measured 2026-08-14 (supersedes the plan's earlier 136)**: **171** expected-result divergences on matched case+step pairs across the locations workbooks. Method: forward-fill `TC ID` down step-expanded rows, join on `TC ID` + `Steps (Step)`, normalise CRLF before comparing.
  - **Structure finding**: their workbooks and ours share the identical 13-column step-expanded layout (`TC ID | Title | Module | Submodule | Test Data | Type | Priority | Coverage Status | Automation Status | Preconditions | Steps (Step) | Steps (Expected Result) | Notes / Reason`), id on the first row of each case. D1 is therefore a wording decision only — it carries no format work.
  - **Noted counter-evidence (do not lose in execution)**: theirs is not uniformly thinner. On `TC-LOC-ACC-005` theirs reads "Select button only enables after a row is checked via row checkbox" where ours reads "The Select button is now enabled." Where their text names a behaviour ours merely restates, Phase 1 folds that behavioural detail into our wording — keeping our style, not their sentence.
- **D2.** Modules with no client counterpart (locations: currency/local-info/mgmt-history/pricing ≈ 204 TCs; local-office; service-charge-text; terms-conditions): ship in their format anyway / hold back / ask client. → **ANSWER (2026-08-14): SHIP THEM ALL.** Our module set is authoritative; their zip is a demo subset, not a scope statement. Every module we own ships, reshaped into their tree format, flagged to the client as additive coverage.
  - **Binding consequence**: no module is ever dropped, held back, or deferred because their sample lacks a counterpart. Absence from their zip is not evidence of anything.
  - **Scope reaches D7**: the additive modules need TestRail case ids too — they cannot ship unmapped. D7's answer must cover them, not just the modules their sample already maps.
  - **Re-measure at execution**: the ≈204 figure is an as-of-2026-08-06 snapshot; count from the workbooks at Phase 1 start.
- **D3.** Corporate-override cut: adopt their 6-file feature cut vs keep our 7-file cut. → **ANSWER (2026-08-14): OURS — keep the 7-file cut, unchanged.** Their 6-file cut is not adopted, and no file is merged or split to approach it.
  - **Verified on disk 2026-08-14** — our 7 files are already ticket-free after PLAN_65: `corporate-override-core` · `-export` · `-filters` · `-grid-sort` · `-import` · `-labor-grid` · `-location-picker`. Theirs: `corporate-pricing-override-export` · `-filters` · `-grid-equipment-labor` · `-grid-filters` · `-import` · `-location-search`. The substantive delta is that we carry a `core` file they have no counterpart for, and we split grid work as sort/labor where they split it as equipment-labor/filters.
  - **Ships alongside**: a mapping table (our file → their nearest feature file, `(none)` where we have no counterpart) so the client can trace our cut against the sample they sent. Mapping is documentation only — it never drives a file move.
  - **Left open, resolved at Phase 2.2**: whether the shipped directory and filename prefix adopt their `corporate-pricing-pg-override` / `corporate-pricing-override-*` naming while the *cut* stays ours. Cosmetic rename only, zero content impact — decide before Phase 2 starts, do not let it block Phase 1.
- **D4.** The 50 EDITED TC bodies in their recut: adopt theirs / keep ours / merge per-row (list: `trr-C2` findings 07–56). → **ANSWER (2026-08-14): KEEP OURS — but read all 50 first.** Our text ships. The read-through is mandatory and blocking, not advisory.
  - **Why the read is not optional**: an edited body is the only channel in the whole zip where the client stated something. If any of the 50 corrects a factual error of ours, discarding it blind ships that error. The read exists to catch corrections, not to reopen wording.
  - **Disposition rule — every one of the 50 gets exactly one label, recorded with the row id**: `wording` (their phrasing, ours wins per D1 — discard) · `correction` (ours is factually wrong about the application — fix ours at the md source, cite the row) · `unclear` (cannot tell from the row alone — escalate to Rutvik, never guess).
  - **This is not a D1 exception.** D1 governs style; D4 governs facts. A `correction` changes what our case asserts, then gets rewritten in our voice — their sentence never ships verbatim.
  - **Exit criteria**: a disposition table covering all 50 row ids with zero blanks, plus every `correction` traced to the md source edit that closed it. Any `unclear` still open blocks Phase 1 sign-off for corporate-override.
  - **Re-measure**: "50" is the as-of-2026-08-06 count from `trr-C2`; re-derive the edited-row set from the workbooks at execution time before treating it as the worklist.
- **D5.** Root `encore_test_cases.xlsx`: keep + add missing module sheets, or demote to generated-index-only. → **ANSWER (2026-08-14): KEEP IT FULL.** The root workbook stays a real deliverable carrying every case, one full sheet per module plus `Overview`. Not demoted, not thinned to an index.
  - **Verified on disk 2026-08-14**: theirs ships 22 full sheets (Overview + one per module, 13 columns, same layout as the per-module files) — a real deliverable, not an index. Ours already ships **35** sheets in that same shape. We are ahead of their sample here, not behind it; there is nothing to adopt.
  - **Anti-drift is generation, not demotion**: the root workbook must be rebuilt from the same md source as the per-module workbooks on every `xlsx:build`, never hand-maintained. Drift is what a hand-maintained duplicate does — theirs drifted too (stale sheet name, wrong pgo total, per Phase 2.3).
  - **Phase 1.9 stands unconditionally**: SCT + TNC sheets get added. With D2 shipping every module, the root workbook must reach one sheet per shipped module — that count is the Phase 1 exit check, not the current 35.
- **D6.** Step mechanism: adopt their `step-wrapper` fixture contract vs keep our `@step` decorators and align only the OUTPUT. → **ANSWER (2026-08-14): KEEP OURS — `@step` decorators stay.** Their `step-wrapper.ts` is not ported. Only the OUTPUT is aligned; TestRail is unaffected either way because their reporter keys off the test title, not step objects (`trr-F`).
  - **Read on disk 2026-08-14** — their `wrapWithSteps` is a Proxy over async page-object methods: `resolveLabel(className, methodName)` returns a `handLabels[class][method]` override when present, else `camelToLabel(methodName)`; `safeStep` pre-checks `test.info()` so worker-scoped calls outside a test do not reject; `.apply(target)` avoids re-intercepting internal `this.x()` calls. Competent code — the rejection is about fit, not quality.
  - **Decisive reason**: a derived label (`openBasicInfo` → "Open basic info") can never equal the documented step sentence ("Switch to the Basic Information tab"). Our deliverable's value rests on spec step labels matching the workbook `Steps (Step)` text, and `check:step-label-parity` gates exactly that. Their own `handLabels` override map concedes the point — they hand-write the labels that matter anyway, paying our cost without our guarantee.
  - **Their one real advantage, and how we close it**: their wrapper cannot forget a method; our decorator can be omitted on a new one. Phase 4 therefore adds a lint rule failing any public async page-object method with no `@step`. That is the cheap half of their benefit without porting a proxy across every page object we own. Gate authored per LR-069 (announce-ramp first).
  - **`handLabels` / `jargonMap` migration**: D6 keeping ours means their label data is the loser schema in Phase 3.3 — their `handLabels` entries are read as a source of better step wording where ours is thin, then discarded. The schema does not ship.
- **D7.** TestRail case-id allocation: client exports ids to us vs we submit cases and generate the mapping. → **ANSWER (2026-08-14): WE SUBMIT, TESTRAIL RETURNS THE IDS.** One script pushes every case in via `add_case` with `refs = <our TC code>`, captures the server-assigned `id` from each response, and writes (the referenced TestRail config was a proposed path that was never created). Same script re-runs for future cases, new codes only. Covers **all** modules, including every D2 additive one.
  - **Research provenance**: a scratch/ephemeral file (not tracked in git) (run `testrail-ids-0814`, 2026-08-14, official TestRail docs cited throughout; verified non-stub, 9 citations, ASSUMPTIONS-MADE present).
  - **Why ids cannot be pre-agreed**: TestRail case ids are **server-assigned**. `add_case` has no `id` parameter and mints the integer itself, returning it in the response body. Any plan premised on choosing or reserving ids is invalid.
  - **The `refs` field is what makes this durable**: `refs` is a writable free-text system field, settable at create time (API *and* the CSV import wizard), returned on every `get_case`/`get_cases`, filterable via `get_cases?refs=`, and tracked in case history. Storing our TC code there means `case-mapping.json` is **regenerable from TestRail alone** — a lost or stale mapping file is recoverable, not fatal. This is the anti-drift mechanism; do not skip writing `refs`.
  - **Operating assumption (Rutvik, 2026-08-14)**: the collaborator resets TestRail and we load all our cases fresh. Under a reset there is no duplicate risk and the bulk create is unconditional.
  - **CONDITIONAL — check before the first write call**: their current `case-mapping.json` already carries **282** corporate-pricing ids (99703–99985), i.e. those cases exist today. **If the reset does not actually happen**, creating them again duplicates all 282. Phase 3 therefore starts with a `get_cases` read of the target project: empty → bulk-create everything; non-empty → harvest existing ids by matching on `refs`/title and create only the remainder. Never assume the reset occurred — verify it.
  - **Client dependency (blocks Phase 3, surface early)**: an API key with **write** access to the target project, plus the correct `section_id` per module. A read-only key fails with 403 and the whole route dies. The exact minimum TestRail role is UNCONFIRMED in the research — confirm with the client rather than assume.
  - **Why this matters beyond bookkeeping**: their reporter **silently ignores** any test whose code is absent from the mapping — no error, no log. Unmapped cases do not fail loudly, they vanish from the client's TestRail. With D2 shipping every module, an incomplete mapping would quietly drop roughly 700 cases.
- **D8.** Stale short-form TC ids in `location-local-information.spec.ts`: full rename now vs quarantine the spec. → **ANSWER (2026-08-14): PREMISE WAS WRONG — no rename was needed, and the real issue is now FIXED.**
  - **What the plan claimed**: ~60 stale short-form ids putting test *titles* out of TestRail's reach.
  - **What was actually on disk (verified 2026-08-14)**: all 22 test titles already carry canonical ids (`TC-LOC-LI-001`, `-032`, `-074`, …). Nothing was unreachable; nothing would have vanished from TestRail. The earlier count came from a whole-file grep that swept **code comments**, not titles.
  - **⚠ REOPENED BY AUDIT 2026-08-15 — the fix below is NOT on disk.** Independent re-measure (cross-family verified, then owner-verified): the spec still carries **35** bare refs under `\bTC-\d{3}\b` (**37** under the looser `TC-\d{3}`, the extra two being `TC-008A` / `TC-007A`), on BOTH the working tree and HEAD, and `git log` shows no commit carrying the 14-insertion/14-deletion comment-only diff described below. Treat the paragraph that follows as an INTENT that was lost, not as completed work: redo it in Phase 1, keeping its verification method (prove every bare ref resolves to a real workbook id before rewriting).
  - **The genuine defect, and the fix applied**: 37 bare `TC-NNN` references lived in comments (`// TC-074 supersedes TC-007`, FIXME lists). Every one of the 34 unique refs was first proven to resolve to a real workbook id (`TC-LOC-LI-<NNN>` present in `location-local-information.xlsx`, 34/34, zero missing) — the mapping was *verified*, never derived from position. All 37 rewritten to canonical form. Evidence: bare refs 37 → 0; diff is 14 insertions / 14 deletions, **zero non-comment lines changed**; `npx tsc --noEmit` exit 0 from `clients/encore`.
  - **Not run**: the spec-list check is labor-gated to a worker. Not needed here — the diff proves the change is comment-only, so no test title, id, or assertion moved.
  - **CARRIED INTO PHASE 1 — the real finding this gate uncovered**: the spec automates **22** tests while the workbook documents **115** cases for the same module. That is a coverage gap, not an id problem, and it runs opposite to Phase 1.2 (which chases spec-TCs absent from xlsx). Phase 1.3 must disposition all 115: automated / pending / retired. Do not let the D8 correction bury it.
- **D9.** `.auth/encore-state.json`: ship live session state like their zip does? → **ANSWER (2026-08-14): NO — and no change is required; our current behaviour is already correct.** Their `.auth` handling is explicitly NOT copied.
  - **Verified on disk 2026-08-14** — `clients/encore/.gitignore:25` ignores `.auth/`, and `git ls-files clients/encore/.auth` returns **nothing tracked**. Since ship is `git archive` (LR-049), the client receives **no `.auth` file at all** — not a live session, and not a placeholder either. Six local state files sit on disk (`encore-state.json`, `r2-`, `s1-`, `v8b-`, `bv-a-`, `.lock-target`); none can ship.
  - **Precision on the earlier framing**: this plan and I both described our behaviour as "ship a placeholder". That is not what happens — we ship *nothing*, which is strictly safer. Recorded so no future step "fixes" a placeholder that was never there.
  - **The client is not left stranded**: `clients/encore/tests/auth.setup.ts` is tracked and ships, and `clients/encore/README.md` carries the login/setup walkthrough (step 3 "Confirm login and setup are working") plus credential guidance via `NAVIGATOR_USERNAME` / `NAVIGATOR_PASSWORD`. They run setup once and generate their own session locally.
  - **What their zip actually contained (why this gate existed)**: a live logged-in state — 27 cookies including `__Secure-next-auth.session-token` chunked across three cookies, plus a localStorage entry. Anyone holding that file is authenticated as that account without a password. Adopting their pattern would commit our automation account's working session into a repository we do not control.
  - **Phase 2.4 consequence**: no work item. The `.auth` row is closed as "already correct, verified" — do not open it as a task.
- **D10.** Old client-Jira ticket numbers (`NM-####`) preserved inside sheets/columns when re-cutting? → **ANSWER (2026-08-14): NO — do not add a ticket-number column. No change.**
  - **Premise was stale, verified 2026-08-14**: the gate was written as "keep or drop the column". There is no column. Machine check across the root workbook `encore_test_cases.xlsx`: **0** occurrences of `NM-####` in any cell of any sheet, and `git ls-files clients/encore | grep NM-` returns **0** shipped paths. PLAN_65 removed the ticket ids from names and no column was ever introduced to carry them.
  - **The real decision taken**: whether to ADD a ticket-number column that does not exist today. Answer is no — the client has not asked for one, and their own sample workbooks carry no such column either (same 13-column schema, no ticket field).
  - **Consistent with LR-073**: ticket ids are content, not structural names. This gate does not reopen that; it simply declines to invent a new content column nobody requested.
  - **If the client later asks for traceability**, the correct home is the existing `Notes / Reason` column or a TestRail `refs` value — not a new schema column that would break parity with their layout. Not in scope now.

---

## SEQUENCING LAW (owner directive, 2026-08-06 — governs everything below)

**Track A — DELIVERABLE FIRST, SHIP FIRST.** Everything the client sees, in this order: Phase 0 (track + register missing modules, commit) → Phase 1 (sync repair) → Phase 2 (restructure to their tree) → Phase 3 (TestRail layer) → Phase 5.1/5.2 verification → **ship to the deliverables repo `main`**. Verification for this ship uses the EXISTING battery (tc-parity, freshness, step-label-parity, spec-quality, jargon sweep) — all of it already exists and the audit worklists are the fix lists, so shipping fast is not shipping unverified.

**Track B — FRAMEWORK AFTER.** Only after Track A ships: Phase 4 (new permanent gates), internal cleanup, and anything else that does NOT change the shipped tree. Reason: client satisfied as soon as possible; framework hardening then raises delivery speed without holding the deliverable hostage.

**Rule for the executor**: if a task would delay the Track-A ship and does not change the shipped tree, it is Track B by definition — defer it.

---

## PHASE 0 — Dependency + browser-tool gate, then make the tree truthful

0.0 **Gate**: confirm PHASE INT is closed (all ten `**ANSWER**` lines present). Confirm browser tool = Playwright CLI per `.claude/rules/browser-tool.md`; no Chrome-MCP work is scheduled before Phase 5.1. Confirm `node -v`, `npm ci` clean at repo root.
0.1 ~~Track the two untracked modules~~ — **ALREADY DONE (audit 2026-08-15)**: commit `414158ed5` tracked both modules' xlsx, src and specs. Replace with a verify line: `git ls-files clients/encore/testcases/service-charge-text clients/encore/testcases/terms-conditions` returns both workbooks.
0.2 ~~Register module codes `SCT`, `TNC`~~ — **ALREADY DONE (audit 2026-08-15)**: both are registered in `export_test_cases/module-codes.json` (lines 8-9 and 42-45). Verify by grep; do not re-add.
0.3 Commit the dirty working tree deliberately (xlsx edits are intentional per session evidence; re-measure `git status` at commit time — the audit's counts are as-of-run snapshots). **This is the real Phase-0 unlock (audit 2026-08-15)**: `xlsx:freshness` currently fails on *uncommitted service-charge MD sources*, not on missing module codes.
0.4 **Exit criteria**: `git status --short` clean for `clients/encore/**` AND `npm run xlsx:freshness` exits 0.

## PHASE 1 — Sync repair at the SOURCE (md → xlsx → spec → manifest all agree)

Per module, worst first: locations → terms-conditions → corporate-pricing → service-charge-text → local-office → corporate-override.

1.1 Authority rule: the md test-case file under `clients/encore/specs_planning/test-cases/` is the source of truth; xlsx is generated; specs implement. [D1 governs expected-result text.]
1.1b **Triage before regeneration**: md carries 1123 ids vs 948 xlsx vs 998 spec — the md surplus includes pending/retired cases. Classify every md-only id (implemented / pending / retired) BEFORE any xlsx rebuild, so regeneration cannot resurrect dead cases into client-visible workbooks.
1.2 ~~Fix the 155 spec-TCs-absent-from-xlsx~~ — **worklist is EMPTY today (audit 2026-08-15)**: canonical `npm run check:tc-parity` PASSES ("All spec TCs are present in both markdown and XLSX"). Keep only the 1.10 exit assertion. The remaining real work is 1.1b's triage of the 110 md-only ids.
1.3 locations: reconcile the 305 DIVERGED rows (`comparison-rows.json` = the worklist); [D8] for the ~60 stale ids; add the 2 malformed-title spec fixes + wrong-module NTS-053.
1.4 terms-conditions: fix 48 md↔xlsx + 39 xlsx↔spec title divergences + all 72 step-text divergences (`comparison-rows.json` in `trr-C6`); implement or explicitly defer the 20 pending-automation ids.
1.5 service-charge-text: 4 title divergences; keep 300-step parity green.
1.6 local-office: implement `TC-LOS-ECT-018` + `TC-LOS-BAS-068` (or mark pending in xlsx); replace runtime-interpolated ECT-014/015 titles with literal ids (TestRail static matching requires it).
1.7 corporate-pricing: C1 worklist (numbers land with C1's final round; 19+ findings incl. 4-segment id regex gaps).
1.8 Rebuild xlsx via `npm run xlsx:build`; empty Step/Expected columns are forbidden — the TNC pattern (steps in Preconditions) gets migrated into real Step/Expected columns [TestRail import requirement].
1.9 Add SCT + TNC sheets to the root workbook (or per [D5]).
1.10 **Exit criteria (machine)**: `check:tc-parity` 0 · `xlsx:freshness` 0 · `check:step-label-parity` 0 · `check:spec-quality` 0 (incl. the 14 TC-LOC-PRI reject-oracle receipts) · coverage-manifest ratio 100%.

## PHASE 2 — Restructure to their tree shape

2.1 Target layout = their zip (167-file tree, root `tests/`): keep our POM `src/` wholesale (they did), adopt their dirs `config/testrail/`, `scripts/` (their 5 js utilities), `src/reporter/`, fixtures per [D6]. **PRESERVE our env-config/baseUrl story** — their config may point at their demo; ours must keep working against the real test environment.
2.1b **Dependency reconciliation**: align `package.json` + lockfile with what their scripts/reporters import, using the `trr-A` pkg-diff artifact as the worklist; `npm ci` must pass in the restructured tree before anything else counts. **AUDIT 2026-08-15 additions**: `tsconfig.json` joins this reconciliation scope (their strict-flag deltas cause real compile errors, not cosmetics — owner ruling); and 2.1's "keep our POM `src/` wholesale (they did)" is **REFUTED** — 26 of 101 paired files differ for real after CRLF normalisation (20 page/component objects + 6 fixtures/selectors/setup/utils), 5 are theirs-only, 13 ours-only, and `label-jargon.json` differs by SCHEMA (theirs `jargonMap`/`handLabels`, ours `approvedTerms`). This phase therefore needs an explicit file-by-file reconciliation, plus the **owner ruling 2026-08-15: OUR `pages.fixture.ts` ships** (theirs imports the D6-rejected `wrapWithSteps`).
2.2 Module dir mapping: `corporate-override` → `corporate-pricing-pg-override` [D3]; their workbook names win where a counterpart exists; no-counterpart modules per [D2].
2.2a **ADDED BY AUDIT 2026-08-15 — rename blast radius (do not run 2.2 without it)**: 202 old-name literal lines live outside the module dirs. `scripts/step-labels.baseline.json` is PATH-keyed (`scripts/verify-step-label-parity.mjs:107-124`) with 106 `corporate-override` entries — migrate them in the SAME change or `check:step-label-parity` passes while checking nothing. Also carrying old-name literals: `export_test_cases/to-xlsx.ts`, `scripts/deliverable/delivery-manifest.encore.json`. Two mapping gaps the audit found: theirs keeps `corporate-pricing-override-link.xlsx` (and its spec) under `corporate-pricing/`, not under the override dir; and theirs NESTS override src inside `corporate-pricing/` while we keep a separate dir — **owner ruling 2026-08-15: our separate renamed dir stands, their nesting is NOT adopted.**
2.3 Their-side content deltas: 50 EDITED corporate-override TCs per [D4]; their root workbook Overview has a stale sheet name and a pgo total of 166 (fix on our side of the merge, do not inherit).
2.4 **Never ship**: `CLAUDE.md`, `specs_planning/`, internal docs — ship path stays `scripts/ship-client.sh` (it strips `.env.local`; the ps1 path injects template only — verified). [D9] for `.auth`. LR-049: `git archive` only, never `cp -r`.
2.5 **Exit criteria**: shipped-tree diff vs their tree = only intended deltas (`git archive | tar -t` diff vs `theirs-list.txt`, reviewed line-by-line) AND `verify-no-forbidden.mjs --target=<extract>` exits 0 (no internal jargon ships — applies to ported files and edited xlsx alike).
2.6 **Cleanup enumeration (in-scope per LR-050, not deferred)**: per decision branch — old corporate-override workbook files if [D3] adopts their cut; superseded step-label baseline entries for renamed TCs; any md-source entries triaged as retired in 1.1b; stale Overview rows in the root workbook. Nothing is left idling.

## PHASE 3 — TestRail layer

3.1 `config/testrail/case-mapping.json`: extend from CPR-only to ALL shipped modules [D7]; every spec title's TC code must resolve (their reporter regex `/TC-[A-Z]+(?:-[A-Z]+)*-\d+/` — our titles already comply; 4-segment ids like `TC-CPR-OVR-LINK-001` are valid).
3.2 Reporter wiring per [D6]: either port their `testrail-reporter.ts` + `agent-reporter.ts` into our config, or adapt ours to emit the same `add_results_for_cases` payload; env keys documented in `.env.e2e` (names only, values via client).
3.2a **ADDED BY AUDIT 2026-08-15 — the registration step 3.2 assumes but never states**: `clients/encore/playwright.config.ts` contains ZERO TestRail wiring today (grep `testrail` → 0 hits), while theirs registers `['./src/reporter/testrail-reporter.ts']` in its reporter array. Porting the files without adding that registration ships a reporter that never runs. Two behaviours the audit read out of their code and this phase must respect: their reporter DROPS unmapped tests silently (`testrail-reporter.ts:88-89`, bare `return`, no log; `onEnd` logs only the aggregate-empty case at :125-127), and their `case-mapping.json` holds 282 ids spanning 99703–99985 **non-contiguously** (99772 absent) — no script may assume a contiguous range.
3.3 Label/jargon reconciliation: our `approvedTerms`/`deniedJargon` vs their `jargonMap`/`handLabels` — one schema wins [D6], the loser's data migrates.
3.4 **Exit criteria**: dry-run `testrail-check.js` against the mapping = 0 unmapped implemented TCs; a sample spec run produces a well-formed results payload (no live posting without client env).

## PHASE 4 — Permanent gates (Track B; ALL gates live in OUR repo — the shipped tree carries only their runtime scripts)

Every gate authored here follows LR-069: severity rubric, announce-ramp before enforce, and a bloat-governor justification.

4.1 Promote to pre-commit (`.githooks/pre-commit`): `check:tc-parity`, `check:step-label-parity` (today manual), root-vs-module workbook parity (NEW — UNENFORCED today), manifest ⊇ spec ids (NEW — UNENFORCED today).
4.2 Ship gate: content-equality check shipped-xlsx vs committed-xlsx (NEW — today presence-only, `scripts/ship-client.sh:112-115`).
4.3 New-module gate: a `testcases/<module>` dir without a `module-codes.json` entry fails freshness loudly at commit (today it fails only when freshness runs manually).
4.4 TestRail gate: an unmapped TC id in any spec title fails the battery.
4.5 Empty Step/Expected column gate for xlsx rows marked implemented.
4.6 **Exit criteria**: each new gate proven by a deliberate violating input (live-fire), then green on the real tree — and the battery must pass in a clean environment WITHOUT `.env.local` present (their CI uses `.env.e2e` only; a gate that needs local env is a broken gate).

## PHASE 5 — Verify + ship

5.1 Full spec run of the RESTRUCTURED tree against OUR real test environment (not their demo config) + the entire gate battery green ×2 — the restructure is proven by real execution, not by structure diff alone. Runs are sequential (`--workers=1`); parallel Playwright runs corrupt shared auth.
5.2 Blind parity proof: re-extract the shipped archive, re-run structure diff vs their tree, zero unexplained deltas.
5.3 `/push-repo` to the team remote and `/push-encore-deliverables` to the client repo — **ONLY** after Rutvik's fresh explicit in-chat GO.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline / REQUIREMENTS.md | `(none)` — no new behavior is discovered here; this is a format + sync restructure of already-baselined modules | `(none)` |
| GIVER | `clients/encore/specs_planning/test-cases/**/*.md`, `clients/encore/testcases/encore_test_cases.xlsx`, per-module workbooks | `clients/encore/testcases/encore_test_cases.xlsx`<br>`clients/encore/specs_planning/test-cases/` (Phase 1.1b triage classification written into the md sources) | `npm run check:tc-parity` exit 0 |
| BUILDER | `clients/encore/tests/**/*.spec.ts` | `clients/encore/tests/` (Phase 1.3–1.7 title/id fixes + 1.6 new implementations) | `npx playwright test --list` resolves all TC ids |
| HEALER | per-fix md Status sync | `(skipped: no RCA-driven fixes in scope; every Phase 1 edit is a source-sync correction, not a failure repair)` | `(none)` |
| WATCHDOG | findings table / false-green sweep | worker chip output (ephemeral — not tracked in git)<br>worker chip output (ephemeral — not tracked in git) | per-mode acceptance (already closed by the 2026-08-06 council) |
| GARDENER | structural refactor citation | `clients/encore/` restructured tree (Phase 2 dir moves only; no spec logic changes) | `npm run typecheck` clean |
| OWNER | `export_test_cases/module-codes.json`, `.githooks/pre-commit`, `scripts/ship-client.sh` | `export_test_cases/module-codes.json`<br>`.githooks/pre-commit`<br>`scripts/ship-client.sh` | `npm run xlsx:freshness` exit 0 |

---

## Explicitly NOT in scope (flag, do not touch)

- Their PowerBI dashboard build (their side; we only guarantee TestRail data quality).
- Live TestRail posting (needs client credentials; we deliver dry-run-proven tooling).
- Rewriting page objects/selectors (they adopted ours unchanged).

## Known risks

- Their zip is a demo tree on their demo site — 2.5's diff review is the guard against over-fitting to demo quirks.
- The 204+ no-counterpart TCs: a wrong call here loses real coverage — that is why it is D2, not a default.
- Any md-vs-xlsx authority flip [D1] rewrites text at scale — reversible only via git, so it lands as its own commit.
- The audit counts (1123/948/998, 305, 155, 72, 50) are as-of-2026-08-06 snapshots. Re-measure at execution time before treating any number as a worklist length. **Re-measured by the audit 2026-08-15** (use these, then re-measure again at execution): md/xlsx/spec = **1168 / 1168 / 1058** via canonical `check:tc-parity` (110 md-only, planned-not-implemented) · spec-absent-from-xlsx = **0** · D1 expected-result divergences = **172** across 1057 matched pairs · corporate-override edited TCs = **47** (was 50; the old count included source filenames in the row signature) · terms-conditions = **44** md↔xlsx / **45** xlsx↔spec, pending-automation = **0**.
- **Unsized backlog found by the audit 2026-08-15 (Phase 1.8 must scope it)**: empty `Steps (Expected Result)` cells in OUR workbooks — `terms-conditions-core` **93** (92 of them carrying the placeholder Step `1. (no steps defined)`), `service-charge-text-core` **84**, `service-charge-basic-info` **31**. Related: 1.8's premise that TNC keeps its steps in `Preconditions` matches **0** rows — the real pattern is placeholder-Step + empty-Expected.
- **Their-side content to handle that no phase currently names (audit 2026-08-15)**: (the referenced dashboard plan was a proposed file that was never created) is theirs-only and Phase 2.1 adopts no `docs/` content; their non-TestRail scripts (`test-cli.js`, `clean-run.js`, `share-for-debugging.js`) are adopted by 2.1 unread (never content-diffed by any lot); their root workbook's Overview carries a dead hyperlink to a `corporate_pricing_override` sheet that does not exist (actual sheets are `pgo_*`) — do not inherit it, alongside the already-noted stale pgo total of 166.
- **Execution-environment note (audit 2026-08-15)**: run the Phase 2.5 / 5.2 `git archive … | tar -t` verification under Git Bash. A PowerShell-native binary pipeline corrupts the tar stream (bsdtar reports "Damaged tar archive"); Git Bash GNU tar lists all 629 entries cleanly. Not a plan defect — an invocation constraint.
- **Open owner decision (audit 2026-08-15, unresolved)**: `clients/encore/testcases/encore-qa-tracker.xlsx` is tracked, matches no deny-glob, and has no disposition anywhere in this plan — so it ships today by default. Decide keep-or-exclude before the Track-A ship.
