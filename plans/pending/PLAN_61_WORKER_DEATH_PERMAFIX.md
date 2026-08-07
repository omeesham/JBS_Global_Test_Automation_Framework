> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_61_WORKER_DEATH_PERMAFIX.md`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: OWNER (this is delegation-infra work; no pipeline identities are invoked anywhere in this plan).
> 2. **Skills**: load `/delegation-temp` (on) + `/execute`. All build legwork routes through Copilot workers per §Delegation-Split; wrapper edits are Claude-inline (R-532: the wrapper is un-delegable-through-itself).
> 3. **Model + thinking + permission-mode**: read the `**Model**:`, `**Thinking**:`, `**PermissionMode**:` fields below.
> 4. **Dependency gate**: none — this plan depends on no pending plan. It deliberately does NOT wait for GOVERNOR / LEDGER_TRUTH / UPLINK (see §NOT-touched for the boundary).
> 5. **Context load**: read this file in full + the four evidence artifacts under `.claude/state/ua-worker/chips/wdeath/` (out-A, out-B, out-Arev, out-Brev).
> 5.5. **Browser tool**: none — no live-app interaction anywhere in this plan.
> 6. **Phase 0 FIRST**: drain gate + baseline freeze before any edit.
> 7. **Execute Phases 1–8** in order. Phases marked **[GO-GATE]** touch Tier-2 protected state (`~/.claude/delegation/DUTY_STACK.md`, `~/.copilot/agents/*.agent.md`) — they require Rutvik GO in chat + SELF_GRANT per the G1 hardgate; HALT at each such phase until the grant exists. Phases touching `copilot-worker.sh` require the Phase-0 drain gate re-checked immediately before the edit (R-532 interlock will deny otherwise).
> 8. **Handoff**: flip the Status field to DONE + add the Executed date only after the closure gate passes, append activity-log row (LR-028 + LR-037), git mv to plans/done/, `npm run plans:reindex`, commit.
>
> **HALT + ASK USER** if: any [GO-GATE] phase lacks a grant / a live dispatch exists at wrapper-edit time / any trip-test in Phase 8 fails twice (LR-069: no second hypothesis without an instrument-and-observe ticket) / scope extends >30% beyond the files named in §Changes.

---

# PLAN_61: WORKER DEATH PERMAFIX — permanent structural fixes for every worker-death class

**Status**: Pending
**Priority**: P0
**Created**: 2026-08-07
**Identity**: OWNER
**Parent**: (standalone; feeds PLAN_LAZY_CEO_DELEGATOR / GOVERNOR when they land)
**Model**: claude-opus-4-6
**Thinking**: xhi
**PermissionMode**: default (PROTECTED files need owner go + SELF_GRANT)
**BrowserTool**: none

## Objective

759 death-candidate runs existed in the corpus (2,222 runs); adversarial cross-family review corrected that to **473 hard deaths (~21% of all runs)** plus 286 disputed "no oracle armed" rows. Detection is already strong (the wrapper's wall-ceiling, stall-warn, deliverable-oracle and report-schema guards are HARD-PROVEN — 41, 372, 58 and 166 ledger firings respectively). **Prevention is the hole.** This plan fixes each death class at the layer where it actually occurs — dispatch preflight, wrapper, per-dispatch injected doctrine — so no class can recur silently, and every future death self-classifies in the ledger.

Evidence base (all machine-enumerated, cross-family reviewed 2026-08-07):
- `.claude/state/ua-worker/chips/wdeath/out-A/death-census.{md,jsonl}` — census, 759 candidates
- `.claude/state/ua-worker/chips/wdeath/out-Arev/census-review.md` — corrected counts, C3 split, C8 scan
- `.claude/state/ua-worker/chips/wdeath/out-B/prior-fixes.md` — 36-fix inventory
- `.claude/state/ua-worker/chips/wdeath/out-Brev/priorfix-review.md` — live-fire verdicts per guard

## Corrected death taxonomy (what actually kills workers)

| Class | Corrected count (post-07-24) | Where it dies | Current strongest guard |
|---|---|---|---|
| C3 batch-write / no-deliverable | 164 (139) | worker behavior | detection HARD-PROVEN; prevention SOFT prose only |
| C4 stall | 81 (74) | worker session | warn HARD-PROVEN; bounce landed 07-16, unconsumed in production |
| C2 wall-timeout | 67 (24) | ticket shape | kill+record HARD-PROVEN; prevention = nothing. Honest residual: C2 prevention stays ADVISORY (preflight warn on suite-shaped tickets + shard doctrine) — a wall ceiling that kills is the hard backstop; ticket shape is CEO judgment and cannot be fully mechanized without banning legitimate long runs |
| C1 budget exhaustion | 47 (33) | dispatch sizing | pass-through cap; SOFT |
| C9 network outage | 8 (5) | copilot CLI ↔ API | nothing |
| C5 arg rejection | ≥7 (memory: 2026-07-24 ×2, 07-30 ×4+1 corpus) | dispatch layer — **invisible to ledger/census** (exits before any row) | validation exists; silent when backgrounded |
| C8 provenance FATAL | ≥4 (memory: 07-27 ×2, 07-30 ×2 = q123-rh-A/C) | recording step — **erases its own ledger row** | guard fires but destroys the record |
| C6/C7 resolver/registry flakes | 0 corpus recurrence since 07-24 wrapper fixes | dispatch layer | wrapper fixes SURVIVE |
| C10/C11 preamble / end-of-turn kill | detected via report-schema (166 firings) | worker session | detection HARD-PROVEN |
| C12 evidence purge | 0 real (3 census rows were test dirs) | cross-session | detection only — acceptable |
| UNCLASSIFIED | 102 no-ledger-row dirs; 84 pre-ledger-era | historical | accept as history |

## Prior-Fix Trial (recurrence-class gate, LR-069 §3.5)

| Prior fix | What it did | Why it failed to fire | Verdict | Consequence in this plan |
|---|---|---|---|---|
| WRITE-AS-YOU-GO ticket contract (worker-doctrine-index.md:35-48, 2026-07-17 + 07-21) | told dispatcher to paste stub-first/append rules into each ticket | `prose-not-mechanism` — depends on the CEO remembering per ticket; 139 post-07-24 C3 deaths | **CONVICTED** | Phase 1 moves the contract into DUTY_STACK (injected into EVERY dispatch by the wrapper) + agent profile + a wrapper-created STEP-0 stub |
| 2×-credits sizing law (delegation-temp §Dispatch, memory fact 0, 2026-07-17→24) | prescribed estimate×2, floor 250-400 | `prose-not-mechanism` — 33 post-07-24 C1 deaths; caps still hand-typed | **CONVICTED** | Phase 2 wrapper-enforced per-work-type credit floor (auto-raise + warn, never a dead dispatch) |
| Stall warn+bounce (SUBPLAN_LCD_04, landed 2026-07-16, probe-proven) | warns (372 firings), pre-writes bounce ticket | `scoped-wrong` — bounce file queues but nothing surfaces it; CEO never consumes it; 74 post-07-24 stall deaths ran to terminal | **CONVICTED (bounce half)** | Phase 3 surfaces the bounce as a ready-to-fire command in the dispatch log tail + `exit_reason=stall` + preflight pickup |
| Effort-tier / registry validation (wrapper :303-329, 2026-07-24) | hard-exits invalid model×effort | n/a — 0 corpus recurrences of C6/C7 since | **SURVIVES** | kept; Phase 6 adds the same matrix BEFORE dispatch so a rejection costs zero |
| Fresh-file guarantee (wrapper :168-176) | refuses reused run-id | n/a — 0 reuse deaths since | **SURVIVES** | kept; preflight duplicates the check pre-dispatch |
| Model-provenance guard (wrapper :650-698) | FATALs on multi-model debug log | `rubber-stampable` in reverse — guard is *over-hard*: a permitted nested spawn erases a successful run's ledger row (4 known C8 hits, all false-positive kills of good work) | **CONVICTED** | Phase 5 records a `model_verdict:"SUSPECT"` row instead of refusing to record; FATAL retained only for true substitution |
| Deliverable oracle + sentinel (wrapper :700-736, :897-923, LEDGER_TRUTH A1/A4) | detects missing output, writes sentinel | n/a — HARD-PROVEN (58 + 68 firings) | **SURVIVES** | kept; Phase 1's stub interacts with it (stub-only file counts as missing) |

No prior fix is layered over without its rewire: every CONVICTED row's replacement is in scope below.

## Changes

### Phase 0 — Drain gate + baseline freeze
1. Confirm zero live dispatches: no fresh locks under `~/.claude/delegation/locks/`, no running `copilot-worker.sh` processes. HALT if any.
2. `sha256sum .claude/skills/ultra-agents/copilot-worker.sh` → record in this plan's Execution Summary.
3. Re-run `node .claude/state/ua-worker/chips/wdeath/out-Arev/review-script.mjs` → freeze corrected baseline numbers (the "before" for Phase 8).

### Phase 1 — Kill C3 at the source (structural write-as-you-go) **[GO-GATE for 1a/1b]**
- **1a** `~/.claude/delegation/DUTY_STACK.md` (Tier-2): add a standing duty block — FIRST tool action = create the declared OUTPUT file with section headings; append every finding immediately; on low budget STOP and flush partial (partial-on-disk = success, empty = failure); one blocking foreground command per long step; never end a turn "waiting".
- **1b** `~/.copilot/agents/council-worker.agent.md` (Tier-2): same duty in the profile's standing rules (wrapper re-materializes `v--*` variants from the base on every dispatch — base edit propagates; verify one variant regenerates).
- **1c** `copilot-worker.sh`: after ticket parse (post fresh-file check ~:176), wrapper itself creates the declared OUTPUT path containing exactly one line: `<!-- STEP-0 stub: run <run-id> — worker must replace/append; stub-only at exit = no-deliverable -->`. Extend the deliverable oracle (~:700-736) so a file whose content is only the stub line classifies as missing (sentinel path unchanged). Side benefit: stub mtime is the universal launch-proof for the CEO (closes the silent-C5 trap from the dispatch side too).

### Phase 2 — Kill C1 (budget floors as mechanism)
- `copilot-worker.sh` (~:331-378): per-work-type credit floors — build/research/rca/walk ≥ 250, verify/probe/draft ≥ 100 (floors from the corrected census: every post-07-24 C1 death was dispatched below these). If `--max-credits` is absent or below floor → auto-raise to floor + print `BUDGET-FLOOR: raised <given>→<floor>` + write `budget_floored:true` to the ledger row. Never a dead dispatch, never silent.

### Phase 3 — Kill C4's terminal-ness (stall bounce becomes consumable)
- `copilot-worker.sh` stall-kill path (~:605-637): on stall-kill, (i) set `exit_reason=stall` (today it blurs into generic failure), (ii) print to the dispatch log tail a READY-TO-RUN re-dispatch command block referencing the pre-written bounce ticket, (iii) ledger field `bounce_ready:<path>`.
- Root-cause note honored (memory: stale slot lock): `acquire_slot` stale-lock cleanup already structural; Phase 8 trip-tests it explicitly.

### Phase 4 — C9 network gets a mechanism
- `copilot-worker.sh`: post-run, if err.txt matches `ENOTFOUND|dns error|No such host|ECONNRESET|error sending request` → `exit_reason=network` (not `error`), and if the worker produced zero output AND the run died in <120s, auto-retry ONCE after 60s backoff with `attempt` unchanged and `network_retry:true` in the row. The retry re-invokes ONLY the inner copilot command inside the same wrapper invocation (same run dir, same slot, no re-entry through the fresh-file guarantee). Bounded, no loops.

### Phase 5 — C8 stops eating ledger rows
- `copilot-worker.sh` provenance guard (~:650-698): the discriminator is the PRIMARY `Using model` line, not model count. Primary = pinned model + extra models present → record the row with `model_verdict:"SUSPECT-nested"` instead of FATAL-no-row. FATAL (refuse to record) remains ONLY when the primary `Using model` line itself ≠ the pinned model (true substitution). Rationale: nearly every ticket permits ≤3 sub-agents, so "multi-model = fraud" is the false-positive engine that erased 4 successful runs' rows. A row that exists with a flag beats a vanished row every time (ledger under-report was the real damage).

### Phase 6 — C5/C6/C7 die before dispatch (preflight)
- NEW `scripts/dispatch-preflight.mjs` (in-repo, unprotected): validates before any dispatch — ticket file exists; `OUTPUT (LITERAL ABSOLUTE):` anchor present in exact form; run-id unused (ledger + disk); model×effort matrix legal (omit-effort recommended); work-type in wrapper enum; credits ≥ floor. Anti-drift rule: preflight PARSES the enum/matrix/floor values out of `copilot-worker.sh` at runtime — it never hardcodes a second copy of them; warns if ticket VERIFY contains a full-suite run without shard/`--retries=0` (C2 shape). On pass, prints the canonical dispatch command (pipefail + tee + `DISPATCH_EXIT=${PIPESTATUS[0]}` + post-launch stub-check). Exit 1 on any failure with the exact reason.
- CEO doctrine line added to `.claude/skills/delegation-temp/SKILL.md` §Dispatch discipline: every dispatch goes through preflight (one line; the skill already mandates the components).

### Phase 7 — Every future death self-classifies
- `copilot-worker.sh` recording step: derive `death_class` (C1-C12 signature regexes, from the reviewed classifier) whenever `ok=false` and write it to the ledger row.
- NEW `scripts/death-census.mjs`: the reviewed census script, with the ESM `require()` defect fixed (out-Arev found it inflating result.md-empty signals), checked in as the permanent re-runnable auditor.

### Phase 8 — Trip-test battery (no gate is believed until it fires; valid payloads + positive controls)
| Trip | How | Expected |
|---|---|---|
| C3 stub | dispatch a probe ticket whose worker is told to do nothing | ledger `deliverable:missing`, stub-only detected |
| C1 floor | dispatch with `--max-credits 40` on work-type rca | `BUDGET-FLOOR: raised 40→250` + `budget_floored:true` |
| C5 preflight | run preflight against a ticket with a bad effort tier + a reused run-id | exit 1, both reasons named; positive control: a valid ticket passes |
| C4 stall | re-run the LCD_04 stall probe | `exit_reason=stall` + `bounce_ready` + ready-to-run block in log |
| C8 suspect | dispatch an opus probe that spawns 1 permitted sub-agent | ledger row EXISTS with `model_verdict:"SUSPECT-nested"` |
| C9 | cannot be forced safely → announce-mode: verify regex against the 8 known network rows in the census jsonl | classifier matches 8/8 |
Then re-run `scripts/death-census.mjs` and record the after-baseline. Update delegation-temp §Honest-Gaps rows that this plan flips from PENDING/UNPROVEN to PROVEN-FIRING.

## Delegation-Split (who does what at execution)
- Copilot BUILD tickets: Phase 6 + 7 scripts, Phase 8 probe tickets, doc rows. One file per ticket, cross-family review each.
- Claude-inline (un-delegable): all `copilot-worker.sh` edits (R-532 — drain first, minimal-diff Edit, never full-file Write), Tier-2 [GO-GATE] edits under GO + SELF_GRANT, final judgment.

## NOT touched
- `~/.claude/hooks/*` (delegation-gate, labor-gate) — separate Tier-2 surface; nothing here needs them changed.
- Auto-RCA dispatch on death, respawn-once, context governor — PLAN_DELEGATION_GOVERNOR_AND_STEERING scope; this plan only makes deaths visible + classified so GOVERNOR has clean inputs.
- Richer ledger (tokens/costs), uplink ASK channel — PLAN_DELEGATION_LEDGER_TRUTH / PLAN_UPLINK_PROTOCOL scope.
- The 102 pre-ledger-era unclassified dirs — historical, no action.
- `verify-run.mjs`, scorecard, ticket-template body (template already carries the oracle contract; DUTY_STACK injection supersedes per-ticket prose).

## Verification (closure)
1. Phase 8 table fully green, each row's ledger/log evidence quoted in the Execution Summary.
2. `bash -n .claude/skills/ultra-agents/copilot-worker.sh` clean after every wrapper phase; wrapper sha before/after recorded.
3. 5 consecutive real production dispatches post-landing with zero deaths of classes C1/C3/C5 (C4/C9 exempt — environment-dependent), verified from ledger rows.
4. `node scripts/death-census.mjs` runs clean and reproduces the corrected baseline ±the new probe rows.

## Rollback
Every wrapper phase is an independent minimal diff; revert = `git checkout` the wrapper + delete the two new scripts. Tier-2 edits: DUTY_STACK/agent-profile blocks are delimited `<!-- PLAN_61 -->` … `<!-- /PLAN_61 -->` for clean removal.

## Plan-Deviations log

| # | Deviation | Resolution |
|---|---|---|
| D1 | Phase 3 planned to "set `exit_reason=stall`" — the wrapper already did this (`:613`). | Scope narrowed to the half that was actually missing: making the queued bounce consumable (`bounce_ready` + runnable command). |
| D2 | Phase 1a (`~/.claude/delegation/DUTY_STACK.md`) is denied by the G1-TP1 gate with **no SELF_GRANT bypass** — the grant only unlocks the repo-side wrapper. | Staged as an idempotent script (`.claude/state/ua-worker/chips/wdeath/duty0-patch.mjs`); Rutvik ran it, injection verified on disk. |
| D3 | Phase 4's in-wrapper retry would have required restructuring the dispatch+watchdog loop — the highest-blast-radius edit in the plan, for the smallest class (8 deaths). | Implemented at the tail via `exec` + a loop-proof env guard: ~15 lines, zero restructuring, first run keeps its truthful ledger row. |
| D4 | Phase 6's doctrine line in `.claude/skills/delegation-temp/SKILL.md` is outside the grant's `paths[]`. | NOT applied — listed under Remaining below. Mechanisms are live regardless; this is documentation only. |

## Execution Summary — 2026-08-07

**Wrapper** `.claude/skills/ultra-agents/copilot-worker.sh`: sha `5fa71a48…` → `8ac92ae0…`, 935 → 1079 lines, `bash -n` clean after every edit. All six phases landed (P1c stub + hoisted parser + stub-only oracle, P2 credit floors, P3 bounce surfacing, P4 network classify + bounded retry, P5 provenance SUSPECT-nested, P7 death_class). Five new ledger fields: `budget_floored`, `model_verdict`, `death_class`, `bounce_ready`, `network_retry`.

**New scripts**: `scripts/dispatch-preflight.mjs` (8 checks, 16/16 self-test) and `scripts/death-census.mjs` (census + `--classify-one`, 16/16 self-test). Both built by Copilot workers, cross-family reviewed, bounced once each, re-verified by the dispatcher.

**Phase 8 trip-test battery — what actually fired live:**

| Trip | Evidence | Verdict |
|---|---|---|
| C3 stub + stub-only | `p61-trip-stub-0807` → `STEP-0 stub written`, `stub was never replaced`, row `deliverable:missing` | **PROVEN** |
| C3 append-below-stub reads present | `p61-trip-nested-0807` → stub still line 1, 41 lines appended, row `deliverable:present` | **PROVEN** |
| C1 credit floor | same run → `BUDGET-FLOOR: raised 40→100`, row `budget_floored:true` | **PROVEN** |
| C7 death_class | same run → row `death_class:"C3"` | **PROVEN** |
| C5 preflight | blocked a reused run-id, a bad effort tier, an invalid mode, and a below-floor budget against the real wrapper | **PROVEN** |
| C8 SUSPECT-nested | `p61-trip-nested-0807` → haiku+opus in one debug log, `WARN … RECORDING`, row exists with `model_verdict:"SUSPECT-nested"` | **PROVEN** |
| C4 stall bounce | `p61-trip-stall-0807` → `STALL-WARN at elapsed=335s`, `STALL-BOUNCE READY`, runnable command printed, row `bounce_ready:"…/p61-trip-stall-0807-bounce.md"`, `stall_warns:1` | **PROVEN** |
| C9 classifier | `--classify-one` returns `C9` for both known network deaths (previously misfiled C3) | **PROVEN** |
| C9 auto-retry | coded and syntax-clean; a real DNS outage cannot be forced safely | **NOT LIVE-FIRED — do not claim green** |

**Honest residuals**: the C9 auto-retry path has never executed. C2 prevention remains advisory by design (a wall ceiling that kills is the hard backstop; ticket shape is dispatcher judgment). C6/C7 guards remain never-seen-firing — zero corpus recurrences since the 2026-07-24 wrapper fixes, so there is nothing to fire against.

**Remaining (needs a grant path)**: the `.claude/skills/delegation-temp/SKILL.md` doctrine lines for preflight + the floor backstop, and its §Honest-Gaps rows that this plan flips to PROVEN-FIRING.
