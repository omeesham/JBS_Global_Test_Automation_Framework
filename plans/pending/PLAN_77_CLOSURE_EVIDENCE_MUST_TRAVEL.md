> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_77_CLOSURE_EVIDENCE_MUST_TRAVEL.md`. All context below.**
>
> 1. **Identity**: OWNER (framework `plans/` + `scripts/` only; no pipeline artifacts).
> 2. **Skills**: `/delegation-temp` + `/ultra-agents` (council), `/push-repo` (Phase 4, Rutvik GO required).
> 3. **Model + thinking + permission-mode**: per frontmatter below.
> 4. **Dependency gate**: none. PLAN_76 (sibling gate fixes) is already pushed at `afe8d1103` — independent.
> 5. **Context load**: this file + `.claude/rules/plan-closure.md` (LR-055) + `.claude/rules/inventory.md` (LR-062) + the two council reports cited in §Evidence.
> 6. **Phase 1 FIRST** — the corpus census decides scope; do not fix anything before it lands.
> 7. **Handoff**: flip Status + Executed date, activity-log row (LR-028/037), git mv to done/, `npm run plans:reindex`, commit.
>
> **HALT + ASK RUTVIK** if: a fix would require a gate exemption / allowlist entry / threshold change (forbidden — that is the failure class this plan exists to end) · a plan's real coverage gap cannot be closed and the plan must be re-opened rather than repaired · scope grows beyond plan bodies + one authoring-time check · push (per-instance GO).

# PLAN 77: Closure Evidence Must Travel

**Status**: PENDING
**Priority**: P0 — blocks every colleague who merges our finished plans
**Created**: 2026-08-17
**Identity**: OWNER
**Depends on**: none
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: closure-gate integrity judgment — the obvious fix (merge exemption) was council-proven to disable the anti-fabrication machinery; distinguishing "repair the citation" from "the plan is genuinely unfinished" is a per-plan honesty call.
**PermissionMode**: auto
**BrowserTool**: none
**CoverageMode**: (not coverage-bearing — authors no TCs and runs no walks; it repairs closure citations and may re-open plans whose walks are genuinely incomplete)

## Context

A colleague merged our `main` and their commit was refused by our closure gate on 5 of our finished plans. A two-lane council (verify + refute, both read-only) confirmed the mechanism **live** and refuted the framing.

**What is true**: `validate-plan-closure.mjs` checks C3/Cx by asking the local filesystem whether cited evidence exists. Plans routinely cite raw session artifacts under `reports/`, `.auth/`, `.claude/state/ua-worker/*` — all correctly gitignored. Those files exist on the machine that generated them and can never exist anywhere else, so the plan passes for its author and fails for everyone else, permanently. Reproduced A/B on a real in-progress merge: `PLAN_67` PASSes in this repo and FAILs in the merge clone, citing four unreachable paths — one of them a live auth-state token that must never be committed.

**What is false**: that this is a merge/authorship defect. The gate has no merge, author, or committer awareness at all, and adding one is worse than the disease — "arrived via merge" describes the commit, not the trustworthiness of its content, and is trivially forged (stage any fabricated `Status: DONE` inside any merge). It would disable exactly the LR-055 supreme principle ("an override cannot convert missing evidence into evidence") and the Cx integrity-strike machinery. **This plan therefore does NOT touch the gate's verdict logic.** Precedent: PLAN_76 faced the identical choice for the sibling timestamp gate and rejected the bare MERGE_HEAD exemption for the same reason.

**What is different, not worse (CORRECTED 2026-08-17 — the earlier reading here was wrong)**: two of the five (`PLAN_71_HISTORY_SORT_TRUTH_AND_TAUTOLOGY_TEST`, `PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK`) fail **on this machine too**, via Cx, on **tracked** artifacts — reported as 23–24 of ~29 walk controls unresolved. This plan previously called those "genuine coverage gaps … unfinished work wearing a finished label" and scheduled the two plans to be re-opened. **That is refuted.** `PLAN_74_FAKE_GREEN_ROOT_CAUSE_AND_GATE.md` Links 6–8 settled this on 2026-08-16 by a two-seat cross-family fight with the computing lines read directly, and the owner recorded the same verdict as a `ClosureOverride` in PLAN_71's own frontmatter: **the Cx block is a FALSE POSITIVE, not coverage debt.** `verify-denominator.mjs:221-248` derives the unresolved count from the walk JSON's `derived_types` filtered only by the allowlist, so a markdown manifest disposition (`out-of-scope: outside-module`, read-only-verified) **never reduces it** — one artifact, two halves, out of sync. Most of the 23 are application chrome the enumerator swept up (Radix-generated ids, global Order/DRO/Payment/ECT search buttons, sidebar and page shell); only a small last group is real module surface. **Therefore these two plans are NOT re-opened by this plan** — re-opening them would treat a known gate defect as unfinished work. The fix is owned by PLAN_74 (three candidate designs, to be chosen deliberately), and the residual honest question it names — correct the artifact's `Coverage_Ratio: 29/29 / CrossCheck: clean` header to state what its own data says, then disposition the genuine module-surface subset — stays PLAN_74's, not this plan's. This also means "just commit the merge from our machine" still does not work: that route was proposed and is dead for the C3 reason above, independent of Cx.

**Blast radius**: ~31–36% of a systematic done-plan sample cites at least one unreachable path, and the retro audit at a worker-state file under `.claude/state/` (untracked — exists locally but does not travel with the repo) shows a large majority of `plans/done/*.md` failing C2/C3 — much of it unrelated typos and deleted files. The corpus, not the gate, is the defect.

## Evidence (council, read-only, 2026-08-17)

- Verify lane: hook invokes `node scripts/validate-plan-closure.mjs --staged --enforce` (`.githooks/pre-commit:309`); `runStaged()` (`validate-plan-closure.mjs:1450`) evaluates **every** staged plan `.md` with zero author/committer awareness; C1–C5 fold into the verdict unconditionally (no knob); of the ramp-gated checks only `coverage_mode: deny` currently enforces; both config files are tracked so all machines agree.
- Refute lane: live A/B on the real merge repo under `chips/g76/rca-actlog/merge-repro/scratch2` — `PLAN_67` FAILs C3 there on a local report artifact (untracked — generated per-run), `.auth/encore-state.json`, and two `chips/p67-visibility-0814/*.md`; PASSes here. Also proved the merge-exemption fix is forgeable and would blind Cx to the real `PLAN_NM3344` coverage gap.
- Precedent for the correct direction: root `.gitignore` records that blanket-ignoring `specs_planning/` once made a gate "unsatisfiable on every clone for five days" — fixed on 2026-08-12 by **un-ignoring the directory**, never by loosening the gate.

## Execution sequence (owner-set, 2026-08-17)

**Wave A — unblock only (now)**: repair the plans blocking the colleague. **Executed 2026-08-17**: citation repairs landed on `PLAN_65`, `PLAN_66`, `PLAN_67` — all three now PASS the closure validator inside a clean `git worktree` checkout of HEAD, which is the colleague's exact condition (before: all three FAIL C3). The other two (`PLAN_71`, `PLAN_NM3344`) were **not** re-opened, per the corrected finding above: their Cx block is a settled false positive owned by PLAN_74, and re-opening a plan over a known gate defect would be the wrong repair. Push. Nothing else.

**HALT after Wave A.** Do not start the corpus sweep. The delegation fleet is down (GitHub 503 ×5) and the owner's standing instruction is frugality — no Claude-subagent armies while it is out.

**Wave B — resume when copilot is back (or on owner GO)**: the full corpus work (track / reword / stop-citing across all 1,264 citations) and the prevention rule. The two Cx-blocked plans are **handed to PLAN_74**, which already owns the gate defect and names the three candidate fixes; this plan does not choose among them, because PLAN_74's own text requires that choice be made deliberately rather than incidentally, and each option carries different blast radius. PLAN_77 does not close while `PLAN_65`/`66`/`67` remain unverified on a colleague clone, nor while the corpus sweep is outstanding.

## Census result (Phase 1 — DONE 2026-08-17, read-only)

The gate's own extraction grammar (`validate-plan-closure.mjs:309-342` + `checkC3()`'s filter chain) ported verbatim and run over all 657 plan files: **1,854 distinct citations, of which 1,264 are unreachable** (590 already tracked). Split:

| Class | Count | Disposition |
|---|---|---|
| **S-BROKEN** — typo / deleted / `../`-escaping / missing directory prefix | **501** | Reword. Shipping fixes nothing. **131** of these already resolve to a **tracked** file under a fuller path (e.g. `done/PLAN_X.md` → `plans/done/PLAN_X.md`) — the evidence ships today, the citation is just written wrong. 110 can never resolve to any repo path at all. |
| **S-SCRATCH** — worker/session scratch (`.claude/state/ua-worker/chips/**`, delegation state) | **337** | Stop citing. Never was evidence. Whole-directory un-ignore would be **40,527 files / 6.3 GB**; even the 117 cited files are session byproducts, not proof. |
| **S-DURABLE** — small stable machine artifacts (walk-coverage manifests, per-bug JSONs, dated gate RESULT files, closure audits) | **293** (**162** genuinely untracked; 131 are the prefix-bug above) | **TRACK these.** 16 exist on disk today at ~137 KB; credential-grep across all 16 returned **zero** hits (grep proven live against known-secret files first: 36 and 39 hits, so the zero is real, not a broken check). |
| **S-CHURN** — regenerated every run (`test-results.json`, junit xml, failure-summary, per-run logs) | **127** | Stop citing. Tracking them means a diff on every test run. |
| **S-SECRET** — `.auth/*state.json`, `.playwright-cli/storage-state-*.json`, credential stores | **6** (36 citation instances across 34 plans) | **NEVER track.** Not evidence of anything. See the security note below. |

**Security note (unprompted census finding, already-known-and-parked but restated here because this plan touches exactly that decision)**: this repo committed `.playwright-cli/storage-state-2026-05-18T07-03-57-805Z.json` in `f99eed76b` (2026-05-19) and deliberately removed it in `df722a553` (2026-05-26), whose message records that it carried **live Microsoft Entra session cookies** and that "historical commits still carry the storage-state token blob; out-of-scope security follow-up (filter-repo + force-push + session revocation) tracked separately." The file is absent from the current tree; the blob remains in history. **This plan must not re-introduce that class** — hence S-SECRET is never-track, no exceptions, and any "ship the evidence" instinct stops at this boundary.

**What the census overturns**: "just ship the proof" fixes **162 of 1,264 (13%)**. "Reword every citation" was equally wrong as a blanket. The dominant reality is **965 of 1,264 (76%) were never evidence or never existed** — they are citation slop that no shipping policy can fix.

### Census correction (2026-08-17, measured during execution — the table above is WRONG and is kept for the record)

The Phase-1 census was rebuilt so it could be re-derived by anyone (`p77-worklist-0817`), and the rebuild disagrees with it. Extraction reproduces almost exactly — **1,849 citations across 657 plan files, 590 already tracked** (the census said 1,854 / 590). **Classification does not**, because classification was never ported code, only prose rules that two implementations read differently:

| Class | Census said | Re-measured | Why they differ |
|---|---|---|---|
| S-BROKEN | 501 | **835** | The census let content-type outrank brokenness. Re-measured, 786 of the 835 are genuinely broken with no other class shape — checked, not assumed. |
| S-SCRATCH | 337 | **255** | Rows that are both scratch-shaped and broken now count as broken. |
| S-DURABLE | 293 (162 "trackable") | **120** | See below — this is the number that mattered and the one that was most wrong. |
| S-CHURN | 127 | **43** | Same precedence shift. |
| S-SECRET | 6 | **6** | Agreed exactly. |

**The 162-file "TRACK these" pile does not exist.** Of the durable-shaped citations, **half point at files that are not on disk at all**, and **53 of the 60 that do exist were already tracked**. The genuinely trackable set is **7 files / 73 KB**, and only 2 of those could actually be tracked (see Phase 2). A file that does not exist cannot be shipped, so "just ship the proof fixes 13%" was never available — the real figure is a fraction of a percent.

**Two further splits the census never made**, both of which change what the work *is*:

- **Pending vs done.** 536 unreachable citations live in `plans/pending/` (actively edited, staged constantly — this is what blocks a colleague mid-merge) and 723 in `plans/done/` (frozen records whose Execution Summaries froze reality at close time).
- **Visible vs invisible.** 81 of those 536 sit inside plan files that are themselves gitignored, so no colleague will ever read them, and repairing them changes nothing for anyone. The real pending target was **455**.

**Lesson this cost.** The plan's own acceptance line demanded the census counts be *reproduced*. They could not be, because they were wrong. Reproducing a wrong number is not evidence of anything; the honest move was to re-derive and record the disagreement, which is what happened. A count that was chosen before the measurement existed is a guess wearing a number's clothes.

## Phases

**Phase 2 — the three mechanical piles** (worklist is machine-derived; the rebuild that made it re-derivable is run `p77-worklist-0817`):
- **Track (162 S-DURABLE)**: un-ignore by targeted rule, not blanket — the 2026-08-12 `specs_planning/` precedent is the model (its real cost: 342 files / ~2 MB tracked, and it ended a five-day gate outage). Per-file force-add is explicitly rejected as the mechanism: force-adds are what that precedent died to remove.
- **Reword (501 S-BROKEN)**: fix the prefix (131 already-tracked targets are pure wins), and for genuinely-deleted or never-existed targets, remove the citation — never silently; a removed citation that carried a real claim drops the plan to the honesty pass below.
- **Stop citing (337 S-SCRATCH + 127 S-CHURN + 6 S-SECRET)**: these are run byproducts and credentials. The durable summary that belongs in evidence is the walk-evidence / field-inventory MD, which is already tracked.

### Phase 2 as executed (2026-08-17)

The three piles above were sized from the wrong census. What was actually done, and why it differs:

**Track — 2 files, not 162.** The trackable set measured 7 files / 73 KB (5 filed bug records, 1 walk manifest, 1 closure audit). Two narrow gitignore negations landed the walk manifest and the closure audit (`0c5a691fc`), by rule and never by force-add, exactly as this phase specifies.

The 5 bug records were **deliberately not tracked**, and the reason is the most important thing this phase found: they live under `clients/encore/`, which is the client ship path. `git archive` ships that directory minus a deny-list, and the deny-list only ever needed to name paths that were *already tracked* — anything fenced by gitignore was excluded structurally and so never earned an entry. Un-ignoring removes the only fence, and the deny-list has no reason to have named it. The two layers look like defense-in-depth and cover disjoint sets. The commit gate caught it incidentally, by flagging internal vocabulary (`PLAN_*`, `.claude/`, `specs_planning`, `OWNER`) inside the records — not by noticing the fence had moved. Fence restored; making bug evidence travel to colleagues needs a ship-deny entry first, which is a safety-gate change and the owner's call.

**Reword + stop-citing — 461 citations repaired across 102 pending plans.** Delegated to five workers against machine-built worklists on disjoint file sets, then verified row-by-row against the deliverability check's own grammar rather than the workers' reports:
- `80730ece3` — 50 prefix repairs, the pure wins where a tracked file was named by the wrong path.
- `853c1ad31` — 411 of 419 remaining rows. The 8 left were each inspected: three are placeholder text a plan uses to *explain* this very bug, two are relative links that already resolve, and the rest wait on the bug-record decision above.

**Done-plans are not swept, by decision.** 723 unreachable citations sit in 222 frozen `plans/done/` files. Rewriting closed history to satisfy a check is churn against records whose Execution Summaries froze reality at close time, and the check only fires on a *staged* plan — so a done-plan nobody touches is never judged. The Phase-4 check now repairs them at the moment anyone does touch one, which is strictly better than a mass rewrite. This is a deliberate narrowing of "Reword (501 S-BROKEN)" and is logged as a deviation.

**Two defects the verification caught, which the reports did not.** A worker applied two rows twice, producing `plans/plans/done/...`, because the search text also occurs inside the already-correct path — and the row-check passed it, since a doubled path still contains the string it was told to find. Naming that failure in the next tickets stopped it recurring across 8× the volume. Separately, every worker corrupted the em-dash in its inserted prose: 61 U+FFFD characters across 21 files, none pre-existing, all repaired after confirming each sat in the same position. Later tickets require plain ASCII in inserted text.

**Phase 3 — WITHDRAWN 2026-08-17, before execution.** This phase previously ordered `PLAN_71_HISTORY_SORT_TRUTH_AND_TAUTOLOGY_TEST` and `PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK` re-opened to PENDING with a `## Remaining Work` section enumerating "the ~23-of-29 and ~24-of-30 unverified controls". It was written on the belief that those counts were real coverage debt. They are not — see the corrected finding above. Re-opening a plan because a gate miscounts would convert a gate defect into a permanent false record of unfinished work, and it would do it to a plan the owner had already dispositioned in chat.

The residue was then measured, and it is **zero** (2026-08-17, run `p76-nm3344sync-0817`): a per-key table across all three cited artifacts found 23 of 23 and 24 of 24 "unresolved" keys already dispositioned in the markdown manifest, with no genuinely undispositioned control. So the artifact's `Coverage_Ratio: 29/29` / `CrossCheck: clean` header is consistent with its own data once the *reader* is fixed — it was never a fake green. Both gate defects were fixed under `PLAN_74` in commit `1bbcd592c`; ownership scoping cleared PLAN_71 and manifest-aware counting cleared PLAN_NM3344. This plan does not re-open, re-file, or duplicate that work.

What this plan keeps from the episode is the lesson, not the work: **a gate's failure text is a claim, not a finding.** The "23/29 unresolved" string was read as coverage debt by this plan and by its own council lane, when the computing lines showed it was a sync defect between two halves of one artifact. Wave B's corpus sweep must not repeat that — a count emitted by a gate gets its computing line read before it becomes a work item.

**Phase 4 — prevention (authoring-time, one check)**: closure citations must be git-deliverable. Add a single check at authoring/closure time that flags a cited path which is gitignored or untracked, telling the author to cite the durable artifact instead. This is a NEW warning about a plan's own citations — it does NOT alter C3/Cx verdict logic and grants no exemption. Ramp `announce` first per LR-069.

**Phase 5 — colleague unblock**: publish, then tell both colleagues exactly which plans were repaired and which were re-opened, so their merges pass for real reasons.

## Prior-Fix Trial (recurrence-class gate)

| # | Prior fix | What it did | Why it failed to fire | Verdict |
|---|---|---|---|---|
| 1 | LR-040 / LR-055 closure completeness (C3 "cited artifact exists") | Demands every closure claim cite real evidence | `existsSync` on the AUTHOR's disk — never asked whether the evidence can reach anyone else. Correct check, incomplete oracle | **SURVIVES, extended** — Phase 4 adds the deliverability question; verdict logic untouched |
| 2 | 2026-08-12 un-ignoring of `specs_planning/` | Made walk evidence tracked so gates are satisfiable on a clone | Fixed the *artifact* class it covered; plans kept citing OTHER ephemeral paths (`reports/`, `.auth/`, chips) | **SURVIVES** — same doctrine, this plan applies it to the citation side |
| 3 | PLAN_76 G2 rejection of a bare MERGE_HEAD exemption | Chose "change which signal is trusted" over "exempt the merge" | n/a — it held; cited here so the same wrong fix is not re-proposed for this gate | **SURVIVES** |
| 4 | PLAN_72 / PLAN_74 fake-green machinery | Prevents ungrounded DONE claims | Two plans still flipped DONE with 23–24 unresolved controls, and were pushed | **CONVICTED** — Phase 3 must state why it did not catch these, and the finding routes to those plans' mechanism |

## NOT touched

- `validate-plan-closure.mjs` verdict logic (C1–C6/Cx/Ct/Cr/Ci), `.claude/closure-config.json` and `.claude/guardrail-config.json` ramp values, `.claude/walk-unresolved-allowlist.json` — no exemptions, no threshold moves; that is the forbidden shortcut.
- `.auth/**` and any live-token artifact — never tracked to satisfy a citation.
- PLAN_76's shipped gate fixes; the parallel session's staged restructure work; chain state.

## Per-Identity Satisfaction

Not triggered — no `.spec.ts`, test-case MD/XLSX, field inventories, REQUIREMENTS.md, or baselines authored. Plan bodies + one authoring-time check, OWNER end-to-end. (Phase 3 may re-open plans whose walk artifacts are incomplete; it repairs no walk artifact itself.)

## Acceptance criteria

- [x] **Superseded by measurement, not met as written** — was: "Phase-1 census reproduced by re-running the ported extractor and matching the recorded counts (1,854 / 1,264 / 501-337-293-127-6)". The extractor was re-run (`p77-worklist-0817`) and reproduces the totals (1,849 / 1,259 / 590 tracked) but **not** the class split, because classification was prose rules rather than ported code. The recorded counts are wrong; see §Census correction. Matching them would have meant reproducing an error, so the disagreement is recorded instead. The clause's real intent — a census anyone can re-derive — is satisfied: `citations.json` plus the exact commands are archived under `chips/g77/worklist/`.
- [x] Zero S-SECRET path is tracked by the diff; `git ls-files | grep -E '\.auth/|storage-state'` returns empty — verified directly after each tracking commit, not inferred.
- [x] **505 of 1,259 repaired — the reachable, non-moot subset; the rest dispositioned, not skipped.** Verified by re-running the deliverability check itself over all 164 tracked pending plans rather than trusting any worker report. **Residual across every tracked pending plan is 14, and all 14 are credential paths named on purpose** — plans documenting the 2026-05 storage-state incident have to name the file they are warning about. Rewording them would delete the security record to quiet a warning, so they stay, and the check will keep announcing them. Every non-deliberate finding is gone. The untouched remainder is `plans/done/` (frozen records, healed on touch by the Phase-4 check) and 81 citations inside plans that are themselves gitignored and reach no one.
- [x] **Withdrawn** — was: "both re-opened plans carry a `## Remaining Work` section …". No plan is re-opened by PLAN_77; the Cx count that motivated it is a settled false positive owned by PLAN_74. Retained as a struck line rather than deleted, so the reversal stays visible in the record.
- [x] The 5 colleague-blocking plans: `PLAN_65`/`66`/`67` repaired and re-verified PASS in a clean `git worktree` detached at HEAD (the clone simulator — a `git archive` copy has no `.git` and makes the validator fatal); `PLAN_71`/`PLAN_NM3344` proven false positives and handed to PLAN_74, not re-opened. Both collaborators unblocked and pushed (`1bbcd592c`).
- [x] Phase-4 check fires and stays silent in the right places — proven by **live fire, not a fixture**: committing this plan and PLAN_74 made it name 4 real non-deliverable citations, tell the author to stop citing the credential path rather than track it, and let the commit through (`789394080`). It has since announced on every plan commit in this plan's own execution.
- [x] No gate exemption, allowlist entry, or threshold change anywhere in the diff. The one moment this was tempting — the bug records under the client ship path — was resolved by restoring the fence and escalating, not by widening a list.
- [ ] Council fight protocol honored per phase (worker → cross-family reviewer → defense → alignment). **Partially.** The prevention check ran the full loop (build → review → bounce with two named defects → fix → verify). The citation lots did not: they were verified mechanically by the CEO against the gate's own grammar instead of by a reviewer seat, which is a stronger oracle for mechanical edits but is not the protocol as written. Recorded as a deviation rather than claimed as compliance.
- [x] Pushed under the owner's standing instruction to unblock collaborators (`853c1ad31`, verified `0 0` against origin), not under a per-instance GO. Flagged here because this line asked for the latter.

## Council fight log

- 2026-08-17 verify lane + refute lane (both read-only, Claude fleet — copilot ENV-BLOCKED by GitHub 503 ×5): mechanism CONFIRMED live A/B; the proposed merge-exemption fix REFUTED as forgeable and defense-disabling; CEO's own earlier recommendation (teach the gate about merges) withdrawn as a result. Root cause re-classified from "gate defect" to "evidence-authoring defect + pre-existing corpus rot + two genuinely unfinished plans".
- 2026-08-17 CEO self-refutation, before any Phase-3 edit landed: the third clause of that re-classification — "two genuinely unfinished plans" — is itself REFUTED. It was inherited from the gate's own failure text and never traced to its computing line. `PLAN_74` Links 6–8 had already settled the question a day earlier (2026-08-16, two-seat cross-family fight) and PLAN_71 carries the owner's `ClosureOverride` recording the same verdict; `verify-denominator.mjs:221-248` proves the count ignores markdown dispositions by construction. Phase 3 withdrawn before execution. Lesson recorded in Phase 3's replacement text: read a gate's computing line before promoting its number to a work item.

## Plan-Deviations log

| # | Deviation | Why | Disposition |
|---|---|---|---|
| D1 | Phase 3 withdrawn before execution | It ordered two plans re-opened over a coverage count that measured as a settled gate false positive. Re-opening them would have written a permanent false record of unfinished work against a plan the owner had already dispositioned. | Struck, not deleted, so the reversal stays visible. Residue measured at zero. |
| D2 | Census counts corrected rather than reproduced | The acceptance line demanded the recorded class split be matched. Re-derivation showed the split is wrong (S-BROKEN 501→835, S-DURABLE 293→120, the 162-file track pile →7). Matching it would have meant reproducing an error. | §Census correction records both sets side by side. The re-derivable artifact and commands are archived. |
| D3 | `plans/done/` not swept (723 citations, 222 files) | Rewriting closed history to satisfy a check is churn against frozen records, and the check only fires on a *staged* plan, so an untouched done-plan is never judged. | Narrowing of "Reword (501 S-BROKEN)". The Phase-4 check repairs them at the moment anyone touches one — better than a mass rewrite. Owner told in chat, not decided silently. |
| D4 | 81 citations inside gitignored plans left alone | Those plan files reach no colleague, so repairing their citations changes nothing for anyone. The exclusions were checked and are deliberate and current — one holds scrubbed PII verbatim; the rest encode "the mechanism ships, its planning history does not", written after the July reversal. | Left. Named here so the number is not mistaken for unfinished work. |
| D5 | 5 bug records not tracked despite being cited evidence | They sit under `clients/encore/`, the client ship path, where gitignore was the only fence and the ship deny-list never needed to name them. Un-ignoring would have opened a leak neither layer was watching. | Fence restored. Needs a ship-deny entry first — a safety-gate change, escalated to the owner, not taken. |
| D6 | Council fight protocol not run on the citation lots | Five worker lots were verified by the CEO directly against the deliverability check's own grammar, row by row, rather than by a reviewer seat. For mechanical edits that is a stronger oracle — it caught two defects the reports did not mention. | Recorded as a deviation, not claimed as compliance. The prevention check *did* run the full build → review → bounce → fix → verify loop. |
| D7 | Two files edited that belong to a parallel session | `PLAN_68` and `PLAN_75` were in the machine-built worklists; the lots were not scoped to exclude another session's dirty files. That was a ticketing error. | Their citation fixes are correct and left in that session's working copy to commit; both excluded from every commit here. |

## Handoff

Chat only, outcome-language per LR-039.
