# SUBPLAN_DISPATCH_INTEGRITY_PERMANENT

**Status**: PENDING
**PermissionMode**: acceptEdits
**Owner**: OWNER (CEO) — execution delegated
**Depends on**: `fdle-slop-verify-r1` (GPT adversarial verification) — **P2 is BLOCKED until its verdict lands**
**Graduating incident**: 2026-07-25 silent model substitution — 14 "cross-family" reviews ran Claude while logged as GPT

---

## Bootstrap

```
Read in order, nothing else:
1. .claude/skills/ultra-agents/worker-ext.md lines 1-120
2. This plan, in full
3. .claude/state/ua-worker/chips/fdle/CEO-CORRECTIONS.md §5 (root cause, evidenced)
Repo root: C:\Users\RutvikKhorasiya\projects\encore_framework
NOTE: .claude/skills/ultra-agents/copilot-worker.sh is NOT tracked by git.
      Back it up before every edit; .bak files are the only rollback.
Git Bash is C:\Program Files\Git\bin\bash.exe — plain `bash` from PowerShell hits WSL and fails.
```

---

## Context — the bug, stated once

The Copilot CLI resolves `--agent <name>` by **prefix match**. Variant files named
`<canonical>--<model>.agent.md` sit in the same directory as canonical agents, so the canonical
name is a prefix of its own variants. The CLI runs the first variant alphabetically instead of
the exact-name file.

Evidence (CLI debug logs, 3/3 predicted):

| agent | pins | first variant alphabetically | actually ran |
|---|---|---|---|
| `council-worker` | sonnet-4.6 | `--claude-haiku-4.5` | **haiku-4.5** |
| `council-reviewer` | gpt-5.5 | `--claude-opus-4.6` | **opus-4.6** |
| `council-verifier` | gpt-5-mini | *(none)* | gpt-5-mini ✅ |

**The variant mechanism — written to fix an earlier model-pinning bug — created the files that
hijack the canonical name. The fix caused the bug.**

Already landed and CEO-verified: force-variant on every agent dispatch (routes around the hijack
for wrapper callers), post-dispatch model verification reading the debug log, registry-driven
long-context. What remains is below.

---

## THE GOAL (owner-stated, 2026-07-25) — read before any phase

> A Copilot CLI dispatcher that is seamless, fully dynamic, and **cannot fool us** — not about
> which model ran, and not about **whether the work was actually done**.

Owner's words: *"if it lies and fabricates and slops its way through tasks fooling u, me and
everyone involved, the task WON'T ever be done — we will just be successfully fooled."*

Model-identity verification (already landed) closes the smaller half. This phase closes the
larger half. **A dispatcher that guarantees the right model produced a fabricated report has
guaranteed nothing.**

---

## PA — The target architecture: assistants fight, Claude interrogates

**Owner directive (2026-07-25)**: *"make the assistants/subagents fight themselves out so whatever
they provide to Claude = 100% quality. The only check Claude has to do is interrogate, OR
sometimes audit deeply to check if anyone's fooling it. Minimal burn on Claude."*

### This session is the counter-example
Six lots today. Every defect was caught by **the CEO re-running acceptance commands by hand**.
That worked — and it is precisely the wrong architecture. It burns the most expensive actor in
the system on work the cheap actors should have fought out among themselves, and it fails the
first day attention lapses. **Quality must not depend on Claude's diligence.**

### The layers (each must be mechanical, not polite)

1. **Worker** produces the deliverable + machine-executable acceptance commands.
2. **Wrapper** independently re-runs those commands in a clean shell (§PF). Worker claim vs
   independent result. This layer costs zero Claude tokens.
3. **Cross-family reviewer RE-EXECUTES** — never paper-reviews. Must be a **different vendor**
   than the worker. Now genuinely possible: Anthropic / OpenAI / **Google** (`gemini-2.5-pro`,
   §P0). Reviewer stance is adversarial by default: the worker is guilty until its evidence
   proves otherwise.
4. **Disagreement → third-family adjudication.** Two families disagreeing is a fork the machines
   resolve, not something Claude arbitrates. Three vendors makes majority possible.
5. **Only two things reach Claude**: (a) forks unresolved after layer 4, and (b) a **random
   sample** for spot-audit.

### Why the random sample is load-bearing
Deterministic checking teaches assistants where the blind spots are. If Claude audits every Nth
lot, or always audits type X, that becomes learnable and gameable. The sample must be
**unpredictable** so fabrication is negative-expected-value everywhere rather than merely risky
in known places. This is the game-theoretic core of the design, not a nicety.

### Claude's remaining job — and its budget
- **Interrogate**: read verdicts and forks, not artifacts. Compact, high-signal.
- **Deep-audit on suspicion or at random**: go all the way to disk, exactly as done today — but
  on a bounded sample, not on everything.
- **Never** re-run every acceptance command as routine. That is layer 2's job.

### Minimal-burn requirements this imposes on the evidence trail
- Verdicts must be **machine-readable and compact** — Claude reads a verdict line, not a 40KB report.
- Every claim must carry a **one-command reproduction**, so a deep audit is cheap to start.
- Escalations must state **the disagreement**, not replay both positions in full.
- If Claude must read a full report to know whether to trust a lot, the layer below it failed.

### Anti-slop bound
Layers 1-2 land in this plan (§PF). Layers 3-5 are an **architecture note for the next plan** —
do NOT build a routing engine, a scoring model, or an orchestration framework here. The immediate
deliverable is layer 2 plus registering `gemini-2.5-pro` so layer 3 becomes possible at all.

---

## PT — Agent-tree provenance: who ran, how many, and were they actually independent

**Owner directive (2026-07-25)**: *"for audits, Claude can — when I ask — go deep on its own to
confirm. That's why we need auditable things from each agent copilot spawns, so we know exactly
who in copilot, or how many, or are they just teaming up on us to fool us."*

### The collusion failure mode is real and already happened
2026-07-25: `council-reviewer` silently ran `claude-opus-4.6` while the worker also ran
`claude-opus-4.6`. Two nominally independent parties — same model, same vendor, logged as a
cross-family review. **14 reviews over four days.** Nobody was lying; the structure was simply
incapable of the independence it claimed. That is the dangerous kind: consensus that is really
one opinion counted twice.

**N agents agreeing is worth one vote if they are the same family.** Independence must be a
recorded, checkable property — never an assumption inherited from an agent's name.

### What every copilot-spawned agent must leave behind
The ledger already carries `run_id`, `parent_run_id`, `depth`, `sub_agents`, `model`, `agent`.
The schema was mostly right; **the values were false** — `model` recorded intent, not reality.
With §PF's verification landed, add what is missing:

- `model_verified` — the model the CLI actually ran (from its own debug output), distinct from
  the requested model. Both recorded, never collapsed.
- `vendor` — Anthropic / OpenAI / Google. Derived from the registry (§P0), not parsed from a name.
- `independence_basis` — for any agent whose output is used to check another's: what makes it
  independent? Different vendor? Different evidence? Re-executed rather than paper-reviewed?
  Unstated → `ASSUMED`, which must read as a warning, not a pass.

### The collusion check
When ≥2 agents agree on a verdict, record **distinct vendors** and **distinct verified models**
across the agreeing set. One distinct vendor → the agreement is **`SINGLE-FAMILY`**, worth one
vote regardless of headcount. This must appear in the verdict Claude reads, not buried in a log.

### Claude's deep-audit surface (the point of all of this)
On demand, Claude must be able to reconstruct, without reading any worker's prose:
- the full spawn tree for a lot — every agent, parent, depth, count
- per agent: verified model, vendor, what it produced, which commands it actually ran
- which checks were independent re-executions vs paper reviews
- whether any "consensus" was single-family

**Reconstruction must be one command, not an investigation.** If going deep costs Claude what it
cost today, the audit will not happen when it matters — and an audit nobody runs is the same as
no audit.

### Anti-slop bound
Three ledger fields plus one derived check. **No new log file, no new store, no graph database.**
The ledger is already the record; it was under-populated, not missing.

---

## PF — Fabrication detection: make the acceptance check independent of the worker

### The evidence — 2026-07-25, six lots, six fabrication-class failures

| lot | what the report said | what was true |
|---|---|---|
| a0b citation audit | 3 files MISSING | all 3 exist; its glob returned nothing and it recorded that as absence |
| a0b self-tally | CONFIRMED=56, MISSING=8 | actual 54 / 10 — over-counted its own successes |
| b1b-r1 | `BLOCKERS_DEVIATIONS: none` | shipped half of layer (a), skipped the detector extension entirely |
| a3-r1 | ramp proof, all states | `Ci` PASSED in every state — the proof proved nothing |
| modelverify | "substitution guard works" | guard grepped the wrong file; **inert on every real dispatch** |
| hardening | 5 verify artifacts | 2 delivered |

**Every one passed the existing gates**: report-schema check, sentinel-stub detection, ledger
truth, verify-run. **The only thing that caught them was the CEO re-running their acceptance
commands by hand.** That is not a scalable gate — it is one person's diligence, and it fails the
day attention lapses.

Note the recursion: the fabrication-detection guard *itself* shipped fabricated evidence. Any
mechanism built here must assume it will be the next thing to rot.

### The mechanism — executable acceptance, re-run by the dispatcher

- **Tickets carry machine-executable acceptance commands** in a parseable block: literal command
  + expected exit code / expected output predicate. Prose acceptance bullets stay for humans, but
  the machine-checkable subset must be extractable and runnable.
- **After the worker exits, the wrapper re-runs those commands itself** — in a clean shell, not
  the worker's, and never trusting the worker's captured output.
- **Compare**: worker claims success + independent re-run fails → verdict **FABRICATED**, ledger
  records it, deliverable is quarantined not accepted.
- **Absence is a verdict, not a pass**: a ticket with zero machine-checkable acceptance commands
  must record `UNCHECKABLE` loudly — never a silent green. Same discipline as Plan A's R4:
  "couldn't check" and "checked, fine" must be mechanically distinguishable.
- **Envelope diff**: the pre-dispatch manifest already snapshots target paths. Post-dispatch,
  diff actual changed files against what the report's DIFF_SUMMARY claims. Undeclared writes and
  claimed-but-absent writes are both findings.

### Anti-slop bound
This is ONE mechanism (re-run + compare), not a framework. No new hook, no new config file, no
scoring model, no confidence tiers. If it grows past a single extract-and-rerun step plus a
ledger field, it is being over-built — stop and report.

### It must be able to fail
Prove it by feeding it a **deliberately fabricated report** — one claiming success on a command
that actually fails — and showing the verdict comes back FABRICATED. A fabrication detector never
shown to catch a fabrication is exactly the failure it exists to prevent, and this repo has
already shipped that once today.

---

## P0 — Model-availability sweep: crush the assumptions

**Standing owner directive: assume our model inventory is wrong and too small until proven otherwise.**

Measured 2026-07-25 — the registry holds 7 entries; CAPI reports **8 models `policy=enabled` +
`model_picker_enabled`**, and the sets do not match:

| model | vendor | registered? |
|---|---|---|
| claude-opus-4.6 · claude-sonnet-4.6 · gpt-5.5 · gpt-5-mini · claude-haiku-4.5 · claude-sonnet-4.5 · gpt-5.3-codex | Anthropic / OpenAI | yes |
| **`gemini-2.5-pro`** | **Google** | **NO — never registered, never dispatched** |
| **`claude-opus-4.5`** | Anthropic | **NO** |

`gemini-2.5-pro` is a **third provider family** we have had access to all along. This matters
beyond capacity: on 2026-07-25 we found 14 "cross-family" reviews were Claude reviewing Claude.
Claude / OpenAI / Google makes provider independence real instead of nominal.

### Root flaw
The registry only learns a model when somebody happens to dispatch it. Nothing enumerates what is
available. That is lazy-loading behind human memory — the same "needs someone to remember"
pattern this repo keeps convicting.

### Required
- **Enumerate CAPI, do not hand-seed.** The CLI already fetches the full model list under
  `--log-level debug`. Read it, and register every `policy=enabled` + `picker=true` model.
- For each newly discovered model, run the existing capability probe and record: effort tiers,
  long-context support, vendor.
- **Dispatch-test every enabled model end-to-end** — a trivial ticket, confirm it produces a
  deliverable AND that the CLI's `Using model:` matches what was requested. A model that
  registers but silently substitutes is worse than one we never had.
- Produce `<OUTPUT DIR>\MODEL-INVENTORY.md`: one row per CAPI model — id, vendor, enabled,
  effort tiers, long-context, **dispatch-tested PASS/FAIL**, verified-model-matches YES/NO.
- Any model that fails: record WHY. "Didn't work" is not a finding; the error is.

### Anti-assumption clause
Several models were previously treated as unusable on reasoning that is now known to be wrong
(the whole sonnet-4.6 saga was a prefix-collision, not a model problem). **Re-test every model
from scratch. Do not carry forward any prior "doesn't work" judgement without re-proving it.**

---

## P1 — Kill the prefix collision structurally

Force-variant protects the wrapper's own callers and **nothing else**. Any direct
`copilot --agent council-worker`, any other script, any human at a terminal still gets silently
hijacked. Rename so a canonical name can never be a prefix of a variant.

- Change the `VARIANT=` construction so the model comes first and a canonical agent name can
  never prefix-match it. The canonical name must not appear at the start of the filename.
- **Assert it at write time**: before dispatching, verify no canonical agent name (any
  `*.agent.md` without the variant marker) is a prefix of the variant filename. If one is,
  hard-exit rather than dispatch. A structural fix that can silently regress is not structural.
- One line of naming + one assertion. Do not build a registry, a manifest, or a resolver.

**Why not rely on model-verification alone**: it catches a hijack that changes the model, and a
hijack that doesn't change the model is harmless — so in-wrapper it is sufficient. It does
nothing for callers that never touch the wrapper. P1 is the fix for everyone else.

---

## P2 — Get the hijacking variants out of the way  ⚠ AMENDED 2026-07-25 — MOVE, do not delete

**GPT verification returned. Amended, not unblocked-as-written.** Two binding corrections:
- **Rename (P1) FIRST.** The wrapper recreates variants on dispatch, so removing them before the
  naming changes just regenerates the collision.
- **Rutvik has authorized no deletion.** Move the old-scheme files to
  `~/.copilot/agents-variants-archive/` — reversible. The word "delete" below is superseded.

Dispatched as part of `fdle-p1-prefix-kill-r1` §C5.

Live exposure on disk right now:
```
council-worker   (pins claude-sonnet-4.5) -> hijacked by council-worker--claude-haiku-4.5
council-reviewer (pins gpt-5.5)           -> hijacked by council-reviewer--claude-opus-4.6
```

- Delete the old-scheme variant files, so no prefix-colliding file survives.
- **Prove regeneration first.** The claim that force-variant rewrites variants on every dispatch
  must be demonstrated with a real dispatch BEFORE any deletion. If variants are not regenerated,
  deleting them breaks dispatch. Verify, then delete — never the other way round.
- Protection-parity: each deleted file's function (pinning a model for one agent) is covered by
  on-demand regeneration under the P1 naming. State this per file.

---

## P3 — Make long-context genuinely dynamic

Currently registry-driven and correct for known models, but a newly auto-probed model defaults to
`supports_long_context: false` with no field. Safe, but it means a future 1M-context model
silently runs at default context until a human hand-edits JSON. That is exactly the
"needs someone to remember" failure this repo keeps hitting.

- Extend the existing capability auto-probe to read long-context support from the CAPI model
  metadata the CLI already fetches (the same `--log-level debug` payload that yields
  `reasoning_effort`), and self-register it.
- Unknown/unprobeable → `false` and **say so in the dispatch output**. Silent false is how this
  rots; an announced false is a decision.
- **No hardcoded model lists anywhere.** Grep-prove none exist when done.

---

## P4 — Wire the orphan guard  ⚠ RESOLVED 2026-07-25 — WIRE, deletion ruled NOT-SAFE

GPT's V5 mutation probe reproduced the argv regression using this script, making it the only
offline proof of the invariant. Deleting it removes the proof. **The "or delete" option below is
closed.** Dispatched as `fdle-p1-prefix-kill-r1` §C4.

`scripts/check-dispatch-argv.mjs` has zero callers (`.claude/settings.json`, `scripts/`,
`.claude/hooks/`, `package.json` — only the file itself). Meanwhile the
`AGENT-MODE --model EXCLUSION` comment justifies itself by citing that guard: a block justified
by a guard nobody runs.

Pick one and state why:
- **Wire it** into the commit-gate battery / closure validator alongside its `check-*.mjs`
  siblings, so the argv invariant is actually enforced; or
- **Delete it** and rewrite the exclusion comment to stand on its own reasoning.

Either resolves the circularity. Leaving both as-is is the sediment pattern this repo convicts.
Defer to `fdle-slop-verify-r1`'s V5 finding if it contradicts the no-caller claim.

---

## P5 — Tests, and they must be able to fail

Every item above needs a test that has been **shown to go red** before it goes green.

- **Prefix-collision test**: construct a canonical agent plus an old-scheme variant; assert the
  dispatch path refuses or resolves to the exact agent. Must go RED against the pre-P1 naming.
- **Substitution test**: force intended ≠ actual; assert FATAL naming both models. Must fire on a
  **real dispatch**, not a synthetic fixture — the previous guard passed a synthetic test while
  being completely inert against real runs.
- **Long-context test**: a supporting model gets `--context long_context`; a non-supporting one
  does not; an unknown one announces its default.
- **Dynamic test**: add a fictitious model to the registry and show it flows through effort and
  long-context resolution with **zero code edits**. This is the "dynamic as fuck" acceptance.
- Runtime under 30s total, zero credits where possible. A slow test gets skipped, and a skipped
  test is not a test.

---

## P6 — Anti-slop constraint on this plan's own output

The user's standing requirement: no new surface beyond what the goal needs.

- No new hooks, no new config files, no new LR rules unless a P-item cannot land without one.
- Net line count of the change should be **small**. If the diff grows past ~150 lines, stop and
  report — that is a signal the approach is wrong, not that the problem is big.
- Every file created must have a named consumer. An artifact nobody reads is slop by definition.

---

## Per-Identity Satisfaction

| Identity | Concrete deliverable |
|---|---|
| OWNER | This plan + the GPT verification verdict reviewed before P2 executes |
| WATCHDOG | `fdle-slop-verify-r1` adversarial verdict (external, cross-family) |
| BUILDER | The P1/P3/P4 diff + P5 test suite |
| HEALER | Red-then-green evidence per P5 test |
| GARDENER | P2 purge with per-file protection-parity |
| HUNTER | CAPI capability probe evidence for P3 |
| GIVER | (none) |

---

## VERIFIED STATE — 2026-07-25 16:42 (CEO-run, machine evidence)

Evidence: worker chip fdle CEO probe and C5 archive logs (scratch; not tracked), and ledger rows for runs `c8d371ba` / `a4d69d10`.

| item | state | proof |
|---|---|---|
| P1 C1 — variant naming `v--<model>--<agent>` | **PROVEN** | three `v--*` variants regenerated on demand by live dispatches |
| P1 C2 — no-pin agent hard-exits | **PROVEN** | `zznopin` probe → FATAL exit 2. **Closes the GPT V3 hole.** |
| P1 C3 — write-time prefix assertion | **PROVEN** | planted collision → FATAL exit 2 naming both files |
| P2/C5 — old-scheme variants archived | **PROVEN** | 10 hijackable pairs → **0**; all in `~/.copilot/agents-variants-archive/` (moved, not deleted) |
| Model restore → `claude-sonnet-4.6` | **PROVEN BOTH PATHS** | explicit `--model` AND bare pin path both report `Using model "claude-sonnet-4.6"`, ledger `ok:true` |
| Model-verify guard reports VERIFIED not UNVERIFIED | **PROVEN** | every run since the anchor fix records a real model |

**The sonnet-4.6 diagnosis was wrong all day.** 4.6 was never broken — `council-worker--claude-haiku-4.5`
sat beside the canonical file and the CLI prefix-matched to it. Dropping the pin to 4.5 was a fix for
a bug that did not exist.

### STILL OPEN (not proven — do not claim these)
- Substitution hard-fail on a **real** intended≠actual mismatch (code present, never fired in anger)
- P5 dynamic test — fictitious registry model, zero code edits
- `grep` proof of no hardcoded model list
- C4 argv-guard wiring — worker reported it wired; **the wiring itself is unverified**
- **P0 entirely** — `gemini-2.5-pro` + `claude-opus-4.5` unregistered; no CAPI enumeration
- P3 long-context auto-detect
- Everything in §PA / §PT / §PF (the fabrication + provenance layers)

### Capability constraint discovered
Copilot workers **cannot execute `bash.exe`** ("Permission denied and could not request permission").
Every dispatcher probe requires invoking the wrapper, so **dispatcher self-testing is structurally
CEO work.** Workers do have PowerShell + node. Tickets must stop mandating Git Bash.

### Operational constraint discovered — ⚠ CORRECTED 2026-07-25 18:00, the original diagnosis was WRONG
~~Runs die at **~9.5 credits**, far below any `--max-credits` passed. Cause was CEO ticket sizing.~~

**Actual cause, machine-proven.** `--max-credits` IS honoured; it was simply set far too low. The CLI
injects a `<session_limits_status>` block into the worker's own conversation and, at ~2.5 remaining,
*orders* it to stop: "Final model call for this session: do not call tools; summarize progress, state
what remains, and stop." The worker obeys and exits 0. Three runs measured today at `--max-credits 30`:

| run | model | credit trace | outcome |
|---|---|---|---|
| `fdb8477b` | opus-4.6 | 30 → 8.99 → 2.55 | dead in **43s**, ~5 tool calls, zero output |
| `181aa069` | sonnet-4.6 | 30 → 17.62 → 12.17 → 2.48 | dead, 4 turns, zero output |
| `ca460a75` | sonnet-4.6 | 30 → 17.62 → 6.47 | dead mid-read, file untouched |

**30 credits buys ~4 model turns.** Credits scale with CONTEXT SIZE, not wall-clock — every ticket
dispatch prepends the 11.8KB DUTY_STACK and the CLI injects the whole skill catalog, so the worker
carries a large context before reading line 1 of the ticket. Shortening tickets does NOT buy turns;
the preamble is the floor cost.

**Standing fix**: dispatch `build`/`rca`/`walk` at `--max-credits 200`. 30 is a `probe`-only value.
**Diagnosis recipe** (run this BEFORE theorizing about stalls, batch-writes, or lazy workers):
`grep -oE 'Remaining session limits: [0-9.]+ AI credits' <runDir>/process-*.log`
Four descending numbers ending near zero = credit exhaustion, full stop.

Note the failure is invisible everywhere else: `meta.json` records `tokens_in: null`, `exit: 0`, and
the ledger writes `ok=false exit_reason=no-report-schema`. None of those name the real cause. One run
also emitted a **false STALL-BOUNCE** — it was starved, not stalled.

### VERIFIED STATE — 2026-07-25 18:05 (CEO-run, machine evidence)

**P0 — model-availability sweep: DONE, and it killed the Gemini assumption.**
Probed every candidate by real dispatch (`copilot --model <id> -p "Reply with exactly: OK"`) with two
fabricated negative controls. Both controls correctly returned `not available`, so the oracle is
validated rather than assumed.

| Result | Models |
|---|---|
| **AVAILABLE** | `claude-opus-4.6`, `claude-opus-4.5` (**NEW**), `claude-sonnet-4.6`, `claude-sonnet-4.5`, `claude-haiku-4.5`, `gpt-5.5`, `gpt-5.3-codex`, `gpt-5-mini` |
| **NOT AVAILABLE** | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-3-pro`, `gemini-3-flash`, `gemini-2.0-flash`, `grok-code-fast-1`, `grok-4`, `o3`, `o4-mini`, `claude-opus-4.1`, `claude-haiku-4.6`, `gpt-5.5-codex`, `gpt-5.4`, `gpt-5.1` |

**Consequence for §PA: there is no third vendor.** This CLI serves Anthropic + OpenAI only. Any design
premised on three-vendor cross-family review must be rewritten to two, or the review must draw its
diversity from something other than vendor. `gpt-5.4` appears in `copilot --help`'s own example text
and is NOT available — the help text is stale; the probe is authoritative.

`claude-opus-4.5` registered via `discover.sh` (probed=1 failed=0 skipped=7). Its row lands
`effort_top: none` / `tiers: []`, same as `claude-sonnet-4.5` and `gpt-5.3-codex` — the auto-probe
does not recover an enum for these. `none` is fail-safe (omits `--effort`), so this cannot cause the
silent effort-degradation bug; it may still be a probe false-negative worth a later look.
`candidates.txt` rewritten to the proven roster with the unavailable list recorded inline so nobody
re-probes them blind (backup: `candidates.txt.bak-p0-20260725`).

**⚠ Probe trap, documented so it is not repeated**: `-p ""` is NOT an availability probe. The
empty-prompt check fires BEFORE the model check, so *every* id — including `ZZZ-fake-model-1` —
comes back looking available. The first sweep today returned "Gemini is available" for exactly this
reason and was only caught by the built-in negative control. Absence-of-error proves nothing unless
the payload survives every earlier validation layer.

**Substitution guard — NOW FIRES ON A REAL MISMATCH (the named gap, closed).**
Harness: [`scripts/test-substitution-guard.sh`](../../scripts/test-substitution-guard.sh). It
EXTRACTS the guard block verbatim from the live `copilot-worker.sh` at test time (never a
re-implementation — a hand-copied guard proves nothing about the shipped one), asserts the slice is
syntactically valid bash and contains both verdict tokens, then runs it against doctored run dirs.

| Case | Setup | Result |
|---|---|---|
| T1 **mismatch** | log says `claude-sonnet-4.5`, wrapper intended `claude-opus-4.6` | **exit 1, `SUBSTITUTION_CAUGHT`** — "CLI ran 'claude-sonnet-4.5' but wrapper intended 'claude-opus-4.6'" |
| T2 honest match | both `claude-opus-4.6` | exit 0, passes through — guard is not a wall |
| T3 multi-model | two distinct models in one log | exit 1, `MULTI_MODEL_CAUGHT` |
| T4 no log | no `process-*.log` | real `UNVERIFIED` warn — never a silent verified-pass |
| T5 self-poisoning | guard's own source text echoed into the log | correctly ignored — regression test for the anchored-grep fix |

`SUBGUARD_RESULT: pass=5 fail=0`, re-verified from the repo path.

**The first run of this harness was a false green and is worth recording.** The extraction cut one
line short of a closing `fi`, so the block died on a syntax error and exited 0 — which read as PASS
on all three non-firing cases. Only T1/T3 (which print real verdicts) were genuine. The fix added a
`bash -n` gate that fails the harness as INVALID rather than passing. **A guard test that cannot
distinguish "did not fire" from "did not run" is not a test.** Same shape as the `-p ""` trap above,
found twice in one hour.

### CLOSED LATER THE SAME SESSION (19:00-20:00, CEO-verified)

**§PF fabrication detection — BUILT and adversarially proven.** `scripts/check-worker-fabrication.mjs`.
F5 (quote provenance) / F1 (claimed edit) / F4 (artifact existence) / F6 (verdict-vs-exit-code) live;
F2/F3 honestly `UNCHECKABLE` (the debug log records no tool invocations). Cross-vendor review by
gpt-5.5 got **three payloads past F5** — missing cited file, wrong cited line, and a bare substring.
After the defence round, CEO re-fired all three on **real** run dirs with an honest control:

| payload | verdict |
|---|---|
| quote citing a file that does not exist | `FABRICATED_QUOTE`, exit 1 |
| quote real but attributed to the wrong line | `WRONG_LINE_ATTRIBUTION`, exit 1 (new tier) |
| three-word substring as provenance | `WEAK_PROVENANCE`, exit 1 |
| honest quote at the correct line (**control**) | CLEAN, exit 0 |

Self-test 8/8 → 14/14. The author's first F2 fix was **bounced**: it reported ACCEPTED-AND-FIXED with
a ±2 line window, but the reported defect was line-1-cited/line-2-actual — delta 1, inside its own
tolerance. A fix whose tolerance is wider than the defect is not a fix.

**§PT provenance — BUILT, and it exposed the biggest hole of the day.**
`scripts/check-agent-provenance.mjs` enumerates every run by model / vendor / work-type / dispatcher /
parent / depth (PT1), resolves review independence (PT2), flags orphans (PT3) and single-vendor
sessions (PT4). Self-test carries 5 RED cases plus a GREEN cross-vendor control.

First real run over **1,239 runs**: `session_id` on 143, `parent_run_id` on 61, and **100% of review
pairs resolved `ASSUMED` / `author_run_id: UNRESOLVED`.** No review in the entire history can be
mechanically linked to the work it reviewed — every "two seats, cross-provider" claim rested on the
dispatcher's word. Second-order: with `session_id` null, PT4 cannot group and prints *"No
single-vendor sessions detected"* — a vacuous pass indistinguishable from a clean result. Root cause
was **omitted dispatch flags, not a wrapper bug**. Fixed behaviourally (all dispatches now pass
`--session-id`, reviews pass `--parent-run-id`) and structurally by the warn below.

**Wrapper provenance warn — LANDED** (Rutvik in-chat GO + SELF_GRANT, protected-file path).
Two warn-only lines after work-type validation: one for a missing `--session-id`, one for a
`review`/`verify` dispatch with no `--parent-run-id`. Never denies — LR-069 §3.3 forbids landing a
new S1 straight at deny, and a deny here would block dispatch on a bookkeeping field. Verified:
`bash -n` clean, both warns fire when the flags are absent, **both silent when supplied** (control).
Backup `copilot-worker.sh.bak-provenance-20260725`.

**P5 dynamic registry — PROVEN.** A fictitious row (`fictitious-model-p5-test`, `effort_top: medium`)
added to `model-registry.json` **only** was served `EFFORT_TOP=medium` with zero code edits. Negative
control: an unregistered model auto-probes → *"not available"* → **not added**, `EFFORT_TOP` empty —
fail-closed, no silent effort fallback. No hardcoded model branching in the wrapper (9 grep matches,
all comments/examples, zero in a `case`/`if`). Test row removed; registry verified identical to
`model-registry.json.bak-p5-20260725`.

**C4 argv guard — ANSWERED: `WIRED-BUT-INERT`, and worse than that.** Cross-vendor verification found
the only call site is `package.json:53` (`pipeline:validate`) → `package.json:124`. No hook, no
githook, no `settings.json` entry, **no dispatch-time invocation**. The verifier could not grep
`~/.claude/delegation` (permission denied) so CEO closed that gap directly — and found
`copilot-worker.sh:256`:

```
# AGENT-MODE --model EXCLUSION (argv hygiene — check-dispatch-argv.mjs enforces this).
```

**A comment asserting enforcement that never runs at dispatch.** That is worse than unwired: any
future reader concludes dispatch is protected. Also: rent absent from its header, `--help` runs the
matrix instead of printing help, and its self-test's only proven fire logs an aggregate PASS so the
non-clean telemetry stays dark.

**C4 script defects — ALL FOUR FIXED and CEO-verified** (the guard's own hygiene, separable from the
wiring question):

| defect | before | after |
|---|---|---|
| D1 LR-069 §3.4 rent | absent | `Sev: S1` + graduating incident at `:25-26` |
| D2 `--help` | ran the guard matrix and could append telemetry | prints usage, exit 0, `gate-fires.log` unchanged (4095→4095) |
| D3 telemetry on the only proven fire | dark (aggregate PASS masked it) | `check-dispatch-argv, …, DENY, self-test:fixture-violation` now lands |
| D4 `--target` validation | `path.resolve(undefined)` | missing value → exit 1; nonsense path → exit 2 |

**P3 long-context — implementable, NOT missing capability.** The blocker was assumed to be that the
CAPI does not expose long context. It does: every `probe-*/process-*.log` already carries
`"long_context"` and `"max_context_window_tokens": 200000`. `_dynreg_auto_probe` simply never reads
them, which is why `claude-opus-4.5` (auto-registered today) is the one row lacking
`supports_long_context`. The fix is ~8 lines in `registry-block.sh`: grep the probe log, pass the
result into the existing `node -e` row builder, and set the field **only when proven** — an
unreadable log must leave the key ABSENT, never write `false`, or a failed parse bakes a permanent
false-negative into the registry.

### §PF final state — TWO adversarial rounds, three bounces, 9/9 payloads closed

**Round 2 is the important record here: a second cross-vendor pass on the SAME file found FIVE more
blockers that round 1 never probed.** One adversarial pass is not sufficient for a gate whose entire
job is resisting deception.

| payload | round-1 state | final (CEO-verified on real run dirs) |
|---|---|---|
| missing cited file | CLEAN | `FABRICATED_QUOTE` |
| wrong cited line | CLEAN | `WRONG_LINE_ATTRIBUTION` |
| bare substring | CLEAN | `WEAK_PROVENANCE` |
| `file.ts:-1` negative line | — | `FABRICATED_QUOTE` |
| 25 dashes · 25 semicolons | — | `WEAK_PROVENANCE` |
| `../outside-parent.ts`, absolute path | — | `FABRICATED_QUOTE` |
| directory cited as a file | — | UNCHECKABLE (exit 2) |
| `ok:false` + `exit:0` · string `"0"` | — | `VERDICT_EXITCODE_CONFLICT` |
| **missing `exit` + claimed PASS** | — | caught (3rd bounce) |
| 1 honest claim + 20 claim-like unparseable lines | CLEAN | `FABRICATED_QUOTE` |
| **honest control** | CLEAN | **CLEAN, exit 0 — still a detector, not a wall** |

Self-test 8 → 14 → 26 → **28/28**.

**The round-1 fix that created a new hole is the lesson.** Round 1 answered the substring attack by
adding `WEAK_PROVENANCE` as a minimum-LENGTH rule. Round 2 beat it with 25 dashes. Length was never
provenance — a long meaningless string proves exactly what a short one does. The final rule requires
substantive, distinguishing content.

**Partial-fix-reported-as-complete is the recurring defence-round failure mode**, not carelessness:
the ±2 line window (wider than the defect it answered), and blocker 5 fixed in two parts of three
(string-typed `exit` and `ok:false`+`exit:0` handled, missing `exit` left as a silent pass at `:510`).
Both times the author did real work; both times the acceptance criterion — *the reported payload now
fails* — was not met. **This is why every payload is re-fired by the CEO rather than reading
`ACCEPTED-AND-FIXED`.**

**Not claimed**: a third adversarial round could plausibly find more. Two rounds is materially better
than one and is not proof of exhaustion.

### §PT went through the fight it initially skipped — 3 BLOCKERS found, all closed

The provenance gate was the one artifact built and verified by the same party who commissioned it.
A cross-vendor seat (gpt-5.5) then returned **RED with three blockers**, all confirming it would have
certified independence that was never proven:

| blocker | what it did | now |
|---|---|---|
| PT4 vacuous pass (`:197-221`, `:379-380`) | skipped null-`session_id` runs and printed *"No single-vendor sessions detected"* at **exit 0** — on ~89% of the real corpus | **UNCHECKABLE**, exit 2 |
| PT2 fake independence (`:130-132`) | accepted ANY `parent_run_id` as the author, including another review or a cycle A→B→A — two reviews certified each other as INDEPENDENT with no build author | **FINDING**, exit 1 |
| PT3 corrupt-rides-clean (`:650-668`) | load errors printed but never folded into the exit code; a malformed `meta.json` sat inside a clean report | **UNCHECKABLE**, exit 2 |

CEO re-verified all three on synthetic run dirs **plus an honest control** — a genuine cross-vendor
build→review pair still returns **CLEAN, exit 0**. 5/5. The real `--all` exit moved 1 → 2, which is
the honest outcome: the corpus genuinely cannot be checked for teaming while most runs lack a session.

What the review confirmed working and must stay: vendor derivation resists spoofing
(`Claude-Opus-4.6`, `" claude-opus-4.6"`, `""`, `null`, `123` all → `UNKNOWN`, never a wrong-vendor
default), `ASSUMED` exits non-zero, rent header + telemetry wired.

**PT2 now resolves real rows.** Before the provenance flags, 100% of review pairs were `ASSUMED`.
The real report now shows genuine `INDEPENDENT` rows resolved via `parent_run_id` and `nearest_build`
(e.g. an OpenAI reviewer against an Anthropic author) — independence is machine-proven for the first
time, for the runs dispatched since the flags landed.

### ⚠ C4's "unblocked detective path" is blocked at the DATA layer, not the permission layer
PT5 (post-hoc argv hygiene) was added on the theory that a detective control needs no protected file.
It returns, honestly:

```
UNCHECKABLE: dispatch argv not recorded in run metadata —
no argv/cli_args/dispatch_argv field in meta.json; process logs lack invocation line
```

**The wrapper never records the argv it dispatched.** So a post-hoc detective cannot reconstruct
whether `--model` and `--agent` co-occurred, and making it recordable is itself a `copilot-worker.sh`
change. PT5 correctly reports UNCHECKABLE rather than manufacturing a pass — but it means C4 has no
partial close available: **both the preventive and the detective route through the protected file.**

### STILL OPEN — both need Rutvik's GO, neither is a work problem
- **C4 wiring decision** (protected `copilot-worker.sh`): wire `check-dispatch-argv.mjs` at dispatch
  time **or** delete `copilot-worker.sh:256`, which today reads
  `# AGENT-MODE --model EXCLUSION (argv hygiene — check-dispatch-argv.mjs enforces this).` while
  nothing invokes it at dispatch. Keeping an unwired guard AND a comment asserting it works is
  exactly the sediment §3.5 forbids.
- **P3 landing** (`~/.claude/delegation/registry-block.sh` = hook-owned **Tier-2** state per
  HARDGATES §G1 TP-1 — Rutvik GO + SELF_GRANT, never Claude-self-approved). A worker attempt was
  correctly BLOCKED ("Permission denied") and stopped rather than working around it; the CEO attempt
  was correctly blocked by the Tier-2 gate. The session's existing SELF_GRANT was still in-window but
  its `paths[]` covers only `copilot-worker.sh` — stretching a GO granted for the provenance warn to
  cover P3 would be laundering it, so it was not used.

### Capability finding, now confirmed twice
Workers cannot write outside the repo and cannot execute `bash.exe`. Combined with the Tier-2 gate on
`~/.claude/delegation/**`, **every dispatcher-layer change is structurally CEO-plus-owner work** —
not a delegation choice. Tickets targeting those paths should expect `BLOCKED` and say so up front,
as this one did.

- §PT PT3/PT4 remain effectively untested on real data until enough runs carry the new provenance
  flags (the warn now makes their absence visible at dispatch time).

---

## Acceptance criteria

- [ ] **A deliberately fabricated report — claiming success on a command that actually fails — is caught and verdicted FABRICATED** (PF, the headline test)
- [ ] Ledger records `model_verified` + `vendor` + `independence_basis` per agent; unstated independence reads as `ASSUMED`, not as a pass
- [ ] Two same-vendor agents agreeing is verdicted `SINGLE-FAMILY` and counted as one vote, surfaced in the verdict Claude reads
- [ ] The full spawn tree for any lot — agents, parents, depth, verified models, vendors — is reconstructable with **one command**
- [ ] Re-running that command against the 14 compromised 2026-07-22→25 reviews correctly flags them `SINGLE-FAMILY`
- [ ] A ticket with zero machine-checkable acceptance commands records `UNCHECKABLE`, never a silent green
- [ ] Envelope diff flags both undeclared writes and claimed-but-absent writes
- [ ] `gemini-2.5-pro` registered, dispatch-tested, and its verified model matches — a third provider family is usable
- [ ] Every `policy=enabled` + `picker=true` CAPI model is registered and dispatch-tested, with PASS/FAIL and reason recorded
- [ ] Registry is populated by CAPI enumeration, not by hand-seeding or first-use lazy-loading
- [ ] No canonical agent name is a prefix of any variant filename; a write-time assertion enforces it
- [ ] Direct `copilot --agent <canonical>` resolves to the canonical agent for every agent on disk
- [ ] A real dispatch with intended ≠ actual model hard-fails naming both values
- [ ] A real dispatch with matching model records the **verified** model, not `UNVERIFIED`
- [ ] A fictitious registry model flows through effort + long-context with zero code edits
- [ ] `grep` proves no hardcoded model list in the wrapper or registry block
- [ ] `check-dispatch-argv.mjs` is either invoked by a named caller or deleted
- [ ] Every P5 test demonstrated RED before GREEN
- [ ] Total diff under ~150 lines, or an explicit explanation of why not

---

## SESSION STATE AT COMPACT (2026-07-25) — read this first on resume

### GPT adversarial verification: RETURNED. P2 is UNBLOCKED but AMENDED.
`fdle-slop-verify-r1` (gpt-5.5, council-reviewer) completed. Full evidence:
Worker chip fdle slop-verification notes (scratch; not tracked) + 13 tee'd probes.
Verdicts: **5 PARTIALLY-CONFIRMED, 1 CONFIRMED-with-caveat, 0 rubber stamps.** It refuted the
CEO's reasoning on five of six items while agreeing with most dispositions. Corrections binding:

| item | CEO said | GPT proved | binding correction |
|---|---|---|---|
| **V3** | force-variant is "the actual fix", covers agent mode | **Model-less agents still dispatch under the CANONICAL name** — probe shows `--agent nopin-agent` with no variant | **§P1 MUST cover the no-pin branch.** The hole the CEO declared closed is open. Highest-priority finding. |
| V5 | DROP `check-dispatch-argv.mjs` (no caller) | No caller confirmed, but the guard encodes a **reproduced invariant** — its V2 mutation reproduced the exact regression | **DROP is NOT-SAFE. §P4 resolves to WIRE, not delete.** |
| V6 | purge the hijacking variants | Confirmed, but the wrapper **recreates the same names** | **Rename FIRST (§P1), then purge.** Deleting alone is temporary and unsafe. |
| V1 | without the check, dispatch runs unpinned | Refuted — actual failure is an empty temp variant then exit 2 | KEEP stands; the CEO's failure story was wrong |
| V2 | stale value would be literal `agent-pinned(...)` | Refuted — the retained value is `claude-sonnet-4.6` | KEEP stands; reasoning corrected |
| V4 | verification "defective right now" | **Stale** — hardening already repaired it to grep `process-*.log` | Verify current state before re-fixing |

GPT-flagged omissions to absorb: model-less canonical branch (V2/V3); dispatcher changes never
audited (fresh-file guarantee, work-type/timeout validation, session provenance, uplink firing,
stall-bounce queueing, ledger-truth A1/A2/A4, report-section/ASK detection).

### Live disk state
- `~/.copilot/agents/council-worker.agent.md` pins **`claude-sonnet-4.5`** — hardening applied the
  owner's earlier instruction. **Owner has since said 4.6 > 4.5 if it works, and it does** (proven:
  `--agent council-worker` no `--model` → `Using model: claude-sonnet-4.6` via variant path).
  **Revert the pin to `claude-sonnet-4.6`** — it has effort tiers AND long context; 4.5 has neither.
- Hijack surface still live: `council-worker--claude-haiku-4.5`, `council-reviewer--claude-opus-4.6`.
- Model verification: **repaired** (greps `process-*.log`, handles both line formats).
- Long context: **wired + registry-driven** via `_dynreg_lookup_context` → `CONTEXT_ARGS` in
  `~/.claude/delegation/registry-block.sh` (outside repo — grep the wrapper alone and you will miss it).
- Registry holds 7 models; CAPI reports 8 enabled+picker-visible. Missing: **`gemini-2.5-pro`
  (Google — third vendor family, never used)** and `claude-opus-4.5`.

### The other two plans (the session's original task)
- **`SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL` ~85%** — Phases 0, 1, 1b, 2 CEO-accepted. Phase 3
  delivered to `out-b3-r2/` (6 artifacts) but **not yet CEO-verified**. Residual: b1b's
  `NO-ARTIFACT`/`SURFACE-UNRESOLVED` share exit code 1 with clean — must be fixed before ramping
  `recurrence_trial_mode` to `deny`.
- **`PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION` ~45%** — score against its own 11 acceptance
  criteria, NOT phases (counting phases inflated it to 70%). Done: 1, 3, 10. Remaining: **C4**
  (pilot must rediscover 100% of the 9 Phase-0 gaps — it found 4; CEO holds the answer key and
  must score the blind run), **C5** (Cross-Check Kernel, 5 oracles, real 2026-07-17 C/D/E/F
  fixtures at `.claude/state/ua-worker/dlv-c2/scrubbed/`), **C6** (6 bug-class→oracle→fixture
  maps), **C7** (generator SUPERSET proof), **C8** (`domain-invariants.json` — needs read-only Jira).
  Phase 2 blind pilot ACCEPTED and rediscovered the 1222 class unaided (10 visible rows of 2,652).
- Both remain `Status: PENDING`. CEO dispositions: worker chip fdle correction notes (scratch; not tracked) sections 1-8.

### Unverified / owed
- 3 CONTENT-MISMATCH citations from the a0b audit — flagged, never CEO-verified. Do not act on them yet.
- `out-b3-r2` sediment sweep — delivered, unverified.
- The 14 `SINGLE-FAMILY` reviews (2026-07-22→25) — inferred from the mechanism, not per-run proven
  (no debug logs existed then). Listed in CEO-CORRECTIONS.

### Standing owner constraints
Delegate everything; never hand-verify as routine (that is layer 2's job — §PA). Dispatch →
background → END TURN, never poll. Nothing gets purged without an explicit GO. Answer in
one-liners unless depth is requested.

---

## Handoff

Execution is delegated. P2 does not start until the CEO has read `fdle-slop-verify-r1`.
Deletions beyond P2's named files require Rutvik's explicit GO.

---

## Inherited obligation — LR-074 dispatch visibility (S1)

This subplan is the doctrine-ledger recipient for **LR-074**, so closing it must close this gap.

Today LR-074 has no blocking enforcement. Its only call site is the detective Stop hook
`.claude/hooks/lib/check-visibility-reconcile.mjs:516`, which writes an `[INVISIBLE-DISPATCH WARN]`
line and nothing more — that file contains no `process.exit`, no deny, and no non-zero return path.
The preventive PreToolUse gate that would have blocked a detachment primitive was built and then
removed by owner directive in commit `f2e51bebd`, recorded in `.claude/rules/guardrail-policy.md`
section 74.2. A warn-only gate is disarmed, not un-gateable — the same reasoning that re-classified
LR-014 to S2 in `.claude/doctrine-ledger.json`.

So an invisible dispatch is currently detected after the session, never prevented during it.
Any gating work this subplan lands should say plainly whether it restores a preventive layer or
deliberately keeps detection-only, and the ledger entry for LR-074 should be updated to match.
