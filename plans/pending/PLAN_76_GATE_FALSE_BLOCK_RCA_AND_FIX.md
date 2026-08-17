> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_76_GATE_FALSE_BLOCK_RCA_AND_FIX.md`. All context below.**
>
> This plan is being executed by its authoring session (2026-08-17, CEO/OWNER, delegation-temp + ultra-agents active). A cold session picking it up follows:
>
> 1. **Identity**: OWNER (no pipeline identity — framework `scripts/` work only).
> 2. **Skills**: `/delegation-temp` + `/ultra-agents` (council execution), `/push-repo` (Phase 5, Rutvik GO required).
> 3. **Model + thinking + permission-mode**: read `**Model**:` / `**Thinking**:` / `**PermissionMode**:` below.
> 4. **Dependency gate**: none — verify `origin/main == fb58ffed6` ancestry before trusting the line anchors in §Suspects.
> 5. **Context load**: this file + `.claude/rules/inventory.md` (LR-062/064) + worker-ext.md.
> 5.5. **Browser tool**: `cli` — off-repo live probe is delegated to a copilot worker driving `playwright-cli` headless (LR-064 pattern); no Chrome need.
> 6. **Phase 1 FIRST** — no fix design is final until the Phase-1 council facts land. The candidate designs in §Designs are OPTIONS, not decisions.
> 7. **Handoff**: flip the Status field to DONE + add the Executed date, activity-log row (LR-028/LR-037), git mv to plans/done/, `npm run plans:reindex`, commit.
>
> **HALT + ASK RUTVIK** if: any fix design would relax LR-062 denominator integrity / push to origin (Phase 5 GO is per-instance) / scope grows past `scripts/walk-coverage/**` + `scripts/validate-activity-log.mjs` / a council fight deadlocks after interrogation.

# PLAN 76: Gate False-Block RCA and Permanent Fix

**Status**: PENDING
**Priority**: P0 — a collaborator's finished work is frozen behind these two gates
**Created**: 2026-08-17
**Identity**: OWNER
**Depends on**: none
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: RCA of two live collaborator-blocking gates + multi-rule judgment (LR-062 denominator integrity vs. unblocking pressure); wrong call either bricks collaborators or licenses fabricated walks.
**PermissionMode**: auto
**BrowserTool**: cli
**CoverageMode**: (not coverage-bearing — no TCs, no walk artifacts authored; the live probe is diagnostic evidence, not a walk)

## Context

A fresh collaborator (own Claude, no copilot) finished work on `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1607/settings/discount-optimization-settings` (2 submodules) and is frozen at commit time by two of our gates:

1. **Page scanner** — `scripts/walk-coverage/enumerate-page.mjs` `waitReady()` demands ≥8 `data-testid`s before declaring the page loaded; their page reportedly renders ~1. The wait times out (`WAIT_READY_TIMEOUT`) on a page that loaded fine.
2. **Date check** — `scripts/validate-activity-log.mjs` computes file time as `max(fs mtime, git %cI)`. Their merge checkout bumped every mtime to "now", so 15 honest historical activity-log rows read as backdated.

Rutvik's mandate (2026-08-17, verbatim intent): remove ALL assumptions; establish whether each blocker is a **real defect of ours**, a **false alarm / their misuse**, or **mixed**; then fix permanently — through the council (workers fight reviewers, seat-1 defends, aligned results up; CEO judges). Gates must stop blocking honest work without losing what they exist to catch.

## Suspects — known facts (chain of custody)

Line anchors verified in source by the prior session at commit `fb58ffed6`; `origin/main == HEAD == fb58ffed6` re-confirmed 2026-08-17 this session. Phase 1 re-verifies every anchor from disk (LR-020) — the council trusts nothing from this section without re-derivation.

- `enumerate-page.mjs:191` — `waitReady(page, { minTestids = 8, stableReads = 2, interval = 300, timeout = 120000 })`, throws `WAIT_READY_TIMEOUT`.
- `enumerate-page.mjs:783-786` — per-branch escape hatches exist (`branchPattern.contentGate` → `waitReadyContent`; `branchPattern.minTestids` override) but only for branch-level loads.
- `enumerate-page.mjs:234, 275, 743` — top-level page loads call bare `waitReady(page)`; no override can reach them. A testid-poor ROOT surface can never start its walk.
- `validate-activity-log.mjs` — file time = `max(fs mtime, git log -1 %cI)`; no clean/dirty distinction; a `GENERATED_FILE_PATHS` exemption already exists for commit-regenerated files (the in-file precedent for principled exemptions).
- **Council correction (T1d review, 2026-08-17)**: the CURRENT commit/preflight gates invoke `validate-activity-log.mjs --staged` (`.githooks/pre-commit:294-297`, `package.json:36,54`), and staged mode checks only NEWLY ADDED rows (`validate-activity-log.mjs:13-21`); the script also carries a point-in-time history check (`git log -1 --until=<rowWhen>`) and staged-file discrimination (`:23-36`, `:249-260`). LIVE HYPOTHESES for the collaborator's block (T1b fight must discriminate): (H1) their merge staged our 15 historical rows as "newly added" → checked with fresh mtimes → flagged; (H2) stale hook / different invocation on their machine; (H3) genuine full-scan defect. The plan no longer assumes H3.
- E2e renders controls 22–30s after nav (project memory) — the late-render threat that motivates a readiness floor is REAL; any fix must not reintroduce premature-ready.

## No-assumption questions (the council answers; nobody asserts)

- Q1 — What does the page ACTUALLY render? Testid census over time (0→120s), root + both submodules, at the real URL.
- Q2 — What ACTUALLY fails? Run the real enumerator against the URL; capture the exact error + exit code. (Their agent's report is a claim, not evidence.)
- Q3 — Where did `8` come from? `git log -S` provenance: measured from real surfaces, or invented? (Invented thresholds are the next defect.)
- Q4 — Whose defect? Unreachable knob = OURS. Reachable + documented knob unused = THEIRS. Reachable + undocumented = MIXED (doc defect).
- Q5 — **Integrity constraint**: LR-062 makes the enumerator the machine denominator precisely so agents don't define what counts. Any fix that lets an agent hand-tune readiness per surface is a new hole (false-small denominator on a late-rendering page = fabricated-complete walk). Designs are scored against this FIRST.
- Q6 — What ELSE blocks a testid-poor surface? Census every abort path in the walk — numeric thresholds AND non-threshold aborts (e.g. the `TOOTHLESS-SURFACE` exit at `enumerate-page.mjs:721-728` when a module has no non-resting requiredStates/opener patterns, whose deny-vs-warn behavior rides `.claude/guardrail-config.json`) — fix the class, not the instance (no whack-a-mole for the next collaborator).
- Q7 — Does the date-check false positive reproduce mechanically? Fresh clone → run validator → observe flags on honest rows. Does the real threat (backdated row + freshly-touched file) still get caught by every candidate design? Corpus must contain BOTH directions (what it must block AND what it must not block).
- Q8 — Blast radius: every `waitReady`/`waitReadyContent` caller, every validator consumer (hooks), unchanged-green after fix.

## Execution — council phases (fight protocol per /delegation-temp)

**Phase 0 — preconditions (DONE at authoring)**: delegation infra verified on disk (ticket-template, envelope.mjs, routing-policy, dispatch-preflight, ticket-skill-scan, copilot-worker.sh, council agents); `origin/main == HEAD == fb58ffed6`; agent-mistakes grep for `discount|waitReady|minTestids` → 4 hits read, none about these gates (a Pricing focus-trap oracle miss + an xlsx parser miss — unrelated, no repeated-mistake conflict).

**Phase 1 — investigation council (3 lanes, parallel, background)**:
- **T1a** `g76-rca-enum` (rca, T2 sonnet-max): in-repo census — every readiness call site + which config reaches it; provenance of `8`; full threshold census (Q6); ≥3 candidate designs analyzed against Q5. Facts + options only; no verdicts.
- **T1b** `g76-rca-actlog` (rca, T2 sonnet-max): scripted false-positive repro (local `file://` clone → validator → flags on honest rows), planted-cheat probe (backdated row MUST still be flagged), blame + LR-037 intent, ≥2 designs vs the dual-direction corpus. All evidence tee'd + sha256.
- **T1c** `g76-probe-page` (probe→walk, OFF-REPO — clarify round first per uplink §2, then T2 sonnet-max): live testid timeline + testid inventory + role-based interactive-element count for root + both submodules; then the real enumerator run with full error capture. Steps/oracles recorded for reviewer replay.
- **T1d** `g76-plan-review` (review, T4 gpt-5.5 xhigh, read mode): cross-family adversarial review of THIS plan file — attack the RCA questions, the design options, the acceptance criteria. Rutvik's mandate says the plan itself goes through the council; the CEO's solo audit is not a fight. Findings folded in before Phase-2 verdicts.
- Every lane: worker → cross-family reviewer (gpt-5.5 xhigh) → worker DEFENDS → iterate to alignment → only aligned results reach CEO. T1c review re-executes off-repo actions (pyramid layer 4, edit-mode reviewer).

**Phase 2 — CEO verdict (non-delegable)**: pre-written trap questions fired at each digest; then per gate a named verdict — `REAL-DEFECT-OURS` / `FALSE-ALARM-THEIRS` / `MIXED` — with evidence pointers, and a fix-design pick from §Designs (or a council-proposed better one). One-liner to Rutvik with both verdicts before build fires.

**Phase 3 — build council**: one build ticket per gate (edit mode, envelope manifest pre-dispatch, SCOPE = the named file(s) only, `## ASSUMPTIONS-MADE` demanded); guard corpus lands WITH each fix (both directions, runnable); each fix ships a short plain-English usage note in the script's own header (what readiness means / what a collaborator does on a label-poor surface; what the date check trusts) so the NEXT new surface never hits an undocumented wall; cross-family review + defense; then one bundled verify ticket re-runs the full battery + the two D23 artifacts below.

**Phase 4 — CEO acceptance + commit**: verify-run verdicts read as machine facts (GENUINE/FABRICATED/UNPROVABLE dispositions per Acceptance Law); commit through the full gate battery, never `--no-verify`; LR-028 activity-log row.

**Phase 5 — publish**: `/push-repo` full 6 steps. Push fires only on Rutvik's GO (per-instance authority; outward-facing).

**Phase 6 — closure**: reply prompt for the collaborator naming the fix commit; `/reflect`; Receipt v3; Status flip + git mv + reindex.

## Designs (OPTIONS — Phase 2 picks with Phase-1 facts; none pre-decided)

**G1 (enumerator readiness)**:
- (a) Per-surface readiness registry (machine-consumed config file, owner-reviewed entries) threaded through ALL loads incl. top-level — honest but adds an agent-adjustable dial (Q5 risk unless entries are gated).
- (b) Replace fixed floor with stability-based readiness: testid-count stable across N reads AND DOM-mutation-quiet window AND count ≥ 1 — no per-surface dial at all; must prove it survives the 22–30s late-render trap (T1c timeline is the evidence).
- (c) Content-gate default (`waitReadyContent`) for top-level loads.
- (d) Hybrid: floor = f(observed stability), hard minimum elapsed wait before ready can be declared.

**G2 (activity-log time source)**:
- (a) Clean file (per `git status`) → git commit time ONLY; dirty file → mtime. Principled: mtime only means something for uncommitted work. Kills clone/merge/checkout false positives universally. **MUST preserve** the script's existing point-in-time history check (`git log -1 --until=<rowWhen>`) and staged-file discrimination (`:23-36`, `:249-260`) — a clean/dirty split that drops either reintroduces false positives or weakens same-commit backdating detection (T1d finding 4).
- (b) Merge-detection exemption (MERGE_HEAD / recent-checkout marker) — narrower, leaves the clone case open.
- (c) Extend `GENERATED_FILE_PATHS`-style exemption — wrong shape (per-path, not per-cause); listed to be argued against.

## Prior-Fix Trial (recurrence-class gate — LR-069 §3.5)

| # | Prior fix | What it did | Why it failed to fire this time | Verdict |
|---|---|---|---|---|
| 1 | `branchPattern.minTestids` / `contentGate` escape hatches | Per-branch readiness override | `scoped-wrong` — reachable only from branch-level loads (:783-786); the top-level loads (:234/:275/:743) call bare `waitReady(page)`, so a testid-poor ROOT surface can never begin | **CONVICTED** — rewire in THIS plan's scope: readiness config reaches every load, or the floor design is replaced outright |
| 2 | The `minTestids = 8` floor itself | Guards against premature-ready on e2e's 22–30s late render | Suspected `invented-threshold` calibrated on label-rich form modules; Q3 blames it. If invented → replaced by a measured/stability design; if measured → survives as default with a principled (non-agent-tunable) path for label-poor surfaces | **PENDING Phase-1** (CONVICTED if invented) |
| 3 | `GENERATED_FILE_PATHS` exemption (validate-activity-log) | Exempts commit-regenerated files from time checks | `different-sub-class` — silent on checkout-bumped mtimes of ordinary files | **SURVIVES** — untouched; G2 fixes time-source selection, not path exemptions |
| 4 | Untracked slowenv config (e2e slow render vs test timeout) | Fixed the timeout side of late-render | `different-sub-class` — test timeouts, not readiness thresholds; cited as evidence the late-render threat is real (Q5) | **SURVIVES** — untouched |

## NOT touched

- `.claude/walk-unresolved-allowlist.json` — owner-gated, unrelated.
- `.claude/guardrail-config.json` ramp keys — owner-gated; EXCEPTION (T1d finding 3): if the Q6 census proves a config-controlled abort (e.g. `TOOTHLESS-SURFACE` deny mode) blocks this surface, that specific key enters scope by evidence, with the change named to Rutvik before push.
- **Conditional IN-scope (T1d finding 5, CEO-authorized)**: `.githooks/pre-commit` + `package.json` validator invocation lines — ONLY if Phase-1 evidence shows invocation drift (stale hook / wrong entrypoint) is the real activity-log blocker; a class-level fix must be allowed to reach the load-bearing file.
- `copilot-worker.sh`, `worker-ext.md`, home hooks — PROTECTED control surface.
- `plans/done/PLAN_ENCORE_NM2269_DELIVERY.md`, `SUBPLAN_CORP_PRICING_NM2271_*` (stale done-plans) and `.claude/skills/graft/classify-incoming.sh` — parked owner decisions from 2026-08-16, not this plan.
- Chain state (NM2305 PAUSED) — untouched; no auto-fire.
- Everything outside `scripts/walk-coverage/**` + `scripts/validate-activity-log.mjs` + this plan file + ticket/evidence dirs under `.claude/state/ua-worker/chips/g76/`.

## Per-Identity Satisfaction

Not triggered — this plan touches no pipeline artifacts (no `.spec.ts`, no test-case MD/XLSX, no field inventories, no REQUIREMENTS/baselines). Framework `scripts/` only, OWNER end-to-end.

## Acceptance criteria

- [ ] Per gate, a named RCA verdict (`REAL-DEFECT-OURS` / `FALSE-ALARM-THEIRS` / `MIXED`) backed by council evidence — reported to Rutvik in plain words.
- [ ] **D23-1**: `node scripts/walk-coverage/enumerate-page.mjs` (canonical invocation) against the discount-optimization URL exits 0 AND its denominator cross-checks against the live interactive-element census from the T1c probe — every element kind the census found is represented; a bare `> 0` denominator is NOT acceptance (T1d finding 1: `>0` would green a false-small denominator on a late-rendering page, the exact LR-062 hole this plan exists to avoid). Command + tee'd output archived under `chips/g76/`. (Honest branch: if Phase-2 evidence proves the page itself is defective — not our gate — this line is instead satisfied by the archived evidence naming the app defect, and the collaborator report says so plainly.)
- [ ] **D23-2**: repro harness — fresh clone + validator exits 0 on honest historical rows AND exits non-zero on a planted backdated-row probe — both outputs archived under `chips/g76/`.
- [ ] Q6 threshold census shows no OTHER gate still blocks a testid-poor surface (or each remaining one is dispositioned with a reason).
- [ ] Q8 blast radius: existing callers/consumers unchanged-green; commit-gate battery passes without `--no-verify`.
- [ ] LR-062 integrity argued explicitly in the chosen G1 design (Q5) — no agent-tunable weakening dial introduced.
- [ ] Fight protocol honored per lane (worker → reviewer → defense → alignment); receipts reconcile against `ledger.jsonl`.
- [ ] Push to origin only on Rutvik's explicit GO.

## Council fight log

- 2026-08-17 T1d `g76-plan-review` (gpt-5.5, cross-family): VERDICT **BOUNCE**, 5 findings. Author defense: all 5 CONCEDED, zero counters — plan amended in place (D23-1 hardened; Q6 widened to non-threshold aborts; G2(a) invariants pinned; guardrail-config exception + conditional (the hooks package.json path was incorrect — hooks live under `.githooks/`) scope added; H1/H2/H3 hypotheses replace the H3 assumption). Reviewer ASK-1 (exact blocking invocation on the collaborator's machine) → pending T1b + its fight round; if still ambiguous, Rutvik relays one question to the collaborator. ASK-2 (may Phase 3 touch (the hooks package.json path was incorrect — hooks live under `.githooks/`)) → YES, conditional, recorded above. Alignment: reached by concession.

## Execution record (running — Status flips only after Phase 5/6)

- **Phase-2 verdicts (2026-08-17)**: G1 = `REAL-DEFECT-OURS` (live counts 1/0 testids vs 135+ controls, twice-measured; floor 8 INVENTED per blame; 10 unreachable bare call sites; MODULE_CONFIG empty for the surface; live WAIT_READY_TIMEOUT observed by reviewer re-run). G2 = `REAL-DEFECT-OURS` (merge-staged repro: 252 honest rows staged as new, 10 flagged vs checkout-fresh mtimes, exit 1 — current code, no misuse; staged-file discriminator wrongly treats merge staging as committer-edit evidence).
- **G1 fix (AUTO_SELF)**: `waitReady` rebuilt as a stability contract (interactive census ≥1 + identical across 3 polls + DOM count settled ±2 + min elapsed; testid ≥8 stable kept only as fast-path accelerator; `minTestids` param inert; no per-surface knob — LR-062 clean). Falsification: 9 new tests red on old code → 61/61 green post-change (`chips/g76/build-enum/tests-pre|post.verify.txt`). **D23-1 live**: fixed enumerator on the discount-optimization URL → exit 0, denominator 92 (80 button / 2 tab / 2 input / 5 th / tablist / tabpanel / div), setAlgebra clean, artifacts `reports/walk-coverage/discount-optimization-settings.*`.
- **G2 fix (AUTO_SELF)**: mtime-evidence law — mtime convicts only files locally modified by the committer; merge staging (MERGE_HEAD) yields an empty evidence set; full mode passes the porcelain dirty set. Point-in-time git checks and non-merge staged discrimination preserved verbatim. **D23-2 corpus**: merge-staged scratch2 exit 1/10 → **exit 0**; fresh-clone full scan exit 1/97 → **1 violation = the planted CHEAT row only**; staged backdated row (non-merge) still convicts (exit 1); validator unit tests 44/44 (`chips/g76/rca-actlog/*postfix.verify.txt`). Honest residual documented in-code: a row backdated during a merge commit about a never-committed file escapes the mtime check.

## Plan-Deviations log

- **D-1 (2026-08-17)**: Copilot fleet ENV-BLOCKED — 3 consecutive GitHub-503 auth deaths (`g76-rca-actlog-review-b1`, `-b2`, `g76-build-enum`); death classes C2 (wall-ceiling, dispatcher ticket over-scoped — cause row: review window 900s < 2-scratch re-execution workload, fixed via `--timeout 1500` before the 503s made it moot) then 2× auth-503. Escalation ladder exhausted → AUTO_SELF under scoped SELF_GRANT (55 min, paths pinned), incident logged to `self_incidents.log`. Consequence: Phase-3 builds + Phase-4 verification executed by the CEO directly; the planned build-review fight round could not run (no reviewers available). Compensation: falsification-first tests + dual-direction corpus stand as the machine check; a cross-family post-hoc review of the diff is queued for when the fleet returns.
- **D-2 (2026-08-17)**: A parallel claude session on this machine is mid-execution of PLAN_68-shaped work (staged `**Steps**:` MD edits 18:08, `scripts/xlsx-lint-rules.mjs` rewrite 18:55, xlsx rebuilds 19:00; 3 claude processes started today). NOT this session's work. Consequence: commits use explicit `--only` pathspec so their staged half-done work is never swept; push report must disposition the dirty gate script per /push-repo Step 2.
- **T1b lane review note**: the cross-family review of the actlog lane died twice (D-1); its two mandatory checks were executed by the CEO instead — validator re-runs in both scratches (recorded above) and the staged-mode pre-existing-file question (answered from code: point-in-time `git log --until` covers committed history; the documented staged-mode give-up for pre-existing files is unchanged by this fix).

## Handoff

Chat only. Outcome-language per LR-039.
