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

**Blast radius**: ~31–36% of a systematic done-plan sample cites at least one unreachable path, and the retro audit at `.claude/state/closure-audits/_closure_audit_2026-08-13.md` shows a large majority of `plans/done/*.md` failing C2/C3 — much of it unrelated typos and deleted files. The corpus, not the gate, is the defect.

## Evidence (council, read-only, 2026-08-17)

- Verify lane: hook invokes `node scripts/validate-plan-closure.mjs --staged --enforce` (`.githooks/pre-commit:309`); `runStaged()` (`validate-plan-closure.mjs:1450`) evaluates **every** staged plan `.md` with zero author/committer awareness; C1–C5 fold into the verdict unconditionally (no knob); of the ramp-gated checks only `coverage_mode: deny` currently enforces; both config files are tracked so all machines agree.
- Refute lane: live A/B on the real merge repo under `chips/g76/rca-actlog/merge-repro/scratch2` — `PLAN_67` FAILs C3 there on `reports/diagnostics/fieldinventory-skips.log`, `.auth/encore-state.json`, and two `chips/p67-visibility-0814/*.md`; PASSes here. Also proved the merge-exemption fix is forgeable and would blind Cx to the real `PLAN_NM3344` coverage gap.
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

## Phases

**Phase 2 — the three mechanical piles** (worklist is machine-derived, archived under `.claude/state/ua-worker/chips/g77/`):
- **Track (162 S-DURABLE)**: un-ignore by targeted rule, not blanket — the 2026-08-12 `specs_planning/` precedent is the model (its real cost: 342 files / ~2 MB tracked, and it ended a five-day gate outage). Per-file force-add is explicitly rejected as the mechanism: force-adds are what that precedent died to remove.
- **Reword (501 S-BROKEN)**: fix the prefix (131 already-tracked targets are pure wins), and for genuinely-deleted or never-existed targets, remove the citation — never silently; a removed citation that carried a real claim drops the plan to the honesty pass below.
- **Stop citing (337 S-SCRATCH + 127 S-CHURN + 6 S-SECRET)**: these are run byproducts and credentials. The durable summary that belongs in evidence is the walk-evidence / field-inventory MD, which is already tracked.

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

- [ ] Phase-1 census reproduced by re-running the ported extractor and matching the recorded counts (1,854 / 1,264 / 501-337-293-127-6) — a census nobody can re-derive is not evidence.
- [ ] Zero S-SECRET path is tracked by the diff; `git ls-files` over `.auth/` and `.playwright-cli/storage-state-*` stays empty — pasted.
- [ ] Every class (a)/(b)/(c) citation repaired; a re-run of the gate over the repaired plans shows the previously-unreachable citations resolved — pasted output.
- [x] **Withdrawn** — was: "both re-opened plans carry a `## Remaining Work` section …". No plan is re-opened by PLAN_77; the Cx count that motivated it is a settled false positive owned by PLAN_74. Retained as a struck line rather than deleted, so the reversal stays visible in the record.
- [ ] The 5 colleague-blocking plans specifically: each dispositioned and named in the closing report — `PLAN_65`/`66`/`67` repaired and re-verified in a clean HEAD worktree; `PLAN_71`/`PLAN_NM3344` handed to PLAN_74 with the false-positive evidence, not re-opened.
- [ ] Phase-4 check flags a gitignored/untracked citation on a deliberately-planted test plan and stays silent on a clean one — both outputs pasted.
- [ ] No gate exemption, allowlist entry, or threshold change anywhere in the diff (`git diff` review of the NOT-touched list).
- [ ] Council fight protocol honored per phase (worker → cross-family reviewer → defense → alignment).
- [ ] Push only on Rutvik's explicit GO.

## Council fight log

- 2026-08-17 verify lane + refute lane (both read-only, Claude fleet — copilot ENV-BLOCKED by GitHub 503 ×5): mechanism CONFIRMED live A/B; the proposed merge-exemption fix REFUTED as forgeable and defense-disabling; CEO's own earlier recommendation (teach the gate about merges) withdrawn as a result. Root cause re-classified from "gate defect" to "evidence-authoring defect + pre-existing corpus rot + two genuinely unfinished plans".
- 2026-08-17 CEO self-refutation, before any Phase-3 edit landed: the third clause of that re-classification — "two genuinely unfinished plans" — is itself REFUTED. It was inherited from the gate's own failure text and never traced to its computing line. `PLAN_74` Links 6–8 had already settled the question a day earlier (2026-08-16, two-seat cross-family fight) and PLAN_71 carries the owner's `ClosureOverride` recording the same verdict; `verify-denominator.mjs:221-248` proves the count ignores markdown dispositions by construction. Phase 3 withdrawn before execution. Lesson recorded in Phase 3's replacement text: read a gate's computing line before promoting its number to a work item.

## Plan-Deviations log

(populated during execution)

## Handoff

Chat only, outcome-language per LR-039.
