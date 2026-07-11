**Status**: DONE
**Executed**: 2026-07-11
**Priority**: P1
**Created**: 2026-07-11
**Audited**: 2026-07-11 (ultrathink adversarial audit + slop check + 5-probe web research + dual claim verification — all 14 file:line claims re-verified, 11 TRUE / 2 DRIFTED-fixed / 1 half-FALSE-fixed)
**Identity**: OWNER
**Type**: Framework hardening (delegation wrapper + hooks) — NOT a pipeline subplan
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: control-surface edits + multi-rule judgment (LR-069 ramp design, protected-file grants, empirical calibration decisions)
**PermissionMode**: auto
**BrowserTool**: none
**NOT-CHAIN-RUNNABLE**: protected control files require Rutvik's live in-chat go + scoped SELF_GRANT per phase — a chain session cannot satisfy that gate. Execution authorization for THIS plan was given in-chat 2026-07-11 ("i trust u, delegate the execution properly").

# PLAN_STATIC_TO_DYNAMIC — Convert hardcoded static constants to work-type-aware / adaptive values across the delegation + hook systems

## Bootstrap
- **Identity**: OWNER (no switch needed)
- **Skills**: /execute (orchestrator), /relevant (done pre-execution), /regression-guard (wrap hook edits), /reflect + /final-q (closure)
- **Context files**: this plan · `.claude/skills/ultra-agents/worker-ext.md` (PROTECTED list, dispatch how-to, Receipt v3) · `.claude/rules/guardrail-policy.md` (LR-069 ramp) · `.claude/rules/pipeline.md` (LR-020/027/028/041/048) · the local delegation routing policy + outcomes format (git-excluded, under the user-level delegation dir)
- **Delegation split**: workers BUILD repo-hook edits + DRAFT the wrapper patch; Claude APPLIES protected files under SELF_GRANT; cross-family review + T0 verify before any apply; acceptance dispatches through the NEW wrapper after apply.

## Origin
Trigger: a build worker (`tavily-mcp-build-01`) was **killed at the static 600s wall-clock ceiling** while it was actively producing output (exit 124, `secs:600` — ledger-verified). The retry with a 1100s ceiling **succeeded at 763s** (ledger-verified) — direct proof the kill was a configuration mismatch, not agent failure. Rutvik's insight: a static timeout that kills a *producing* agent is the worst waste — we pay the killed run **plus** the retry (double-spend), the opposite of the frugality prime directive. Generalized: **any static constant that does not scale to the work causes idle-burn (too loose) or kill-and-retry-doubling (too tight).**

**The thesis reproduced itself during this plan's own audit (2026-07-11)**: the claim-verification worker (`s2d-verify-claims-0711`, gpt-5-mini) was killed at an explicit 300s ceiling while actively producing (46 bytes emitted, err.txt empty); the retry at 900s passed in 170s. Two ledger-verified double-spend incidents, two different models, two different work types — the failure mode is structural, not anecdotal.

## The RCA (evidence-cited — from s2d-finderA, reworded per incident-analysis research)
Task floor for the build ≈ install (~90s) + write 6 TS files (~300s) + tsc (~60s) + 2 tests (~60s) = **~510s before any discovery overhead** — the 600s ceiling was near-certain to fire from the start.

> Wording note (audit 2026-07-11): percentage *blame* splits are rejected by modern incident-analysis practice (Howie post-incident guide; learningfromincidents.io) — multiple factors jointly necessary, none solely sufficient. The table ranks **contributing factors by remediation leverage**, not fault shares.

| Contributing factor | Remediation leverage | Evidence |
|---|---|---|
| Static under-provisioning | HIGH — this plan's flagship | `TIMEOUT="600"` (copilot-worker.sh L37 pre-fix) — one value for probes AND builds; no work-type branching existed |
| Under-specified ticket | HIGH — ticket-template fix, Phase 2b | Ticket omitted the MCP SDK import paths → agent's last output was "let me check the SDK structure" (discovery burn); worker-ext.md L98-99 mandates DOCTRINE supply that context |
| Agent execute strategy | MED — agent-profile lesson, not a wrapper fix | Explore-first instead of attempt→fix-on-tsc-error; produced zero `.ts` files before the kill |

Verdict: the guard fired mechanically-correctly, but on a **non-hung (producing)** agent under a **structurally wrong budget**. The fix is not "bigger static number" — it is a guard that can tell *producing* from *hung*.

## FLAGSHIP — Stall-based guard + work-type-scaled ceilings (kills the double-waste mode)
A wall-clock guard cannot distinguish (a) productive-needs-more-time from (b) silently-hung — it kills both. A **stall guard** fires only on *absence of output for N seconds*. Industry precedent is exact and mainstream: **LangGraph `TimeoutPolicy` ships `run_timeout` + `idle_timeout` as a dual guard** (idle = no event emitted for N sec), and CI systems (Travis, CircleCI) have used no-output kills (default 600s) alongside wall ceilings for a decade. Temporal's `heartbeat_timeout` is the same pattern for activities. We are not inventing — we are adopting.

**Empirical correction (2026-07-11 audit — this REPLACES the v1 assumption)**: v1 assumed a producing agent "continuously streams" output and proposed N≈90s build / N≈30s probe. Live measurement during this plan's own audit refutes that: copilot `-p` stdout is **bursty** — healthy workers went silent for 3–4+ minutes mid-task (hooks-research worker: silent 217s+ and still healthy; result.md files frozen at 46–104 bytes for minutes while work continued). The `--log-dir` process log freezes after startup (not a liveness signal) and err.txt stays empty. v1's N values would have false-killed most healthy dispatches — the exact failure this plan exists to fix.

Design (revised):
- **Signal source (explicit)**: watchdog tails the dispatch's combined stdout+stderr capture file (byte-growth check) — result.md size as secondary. `--log-dir` process logs are NOT a liveness signal (verified frozen). Optional densifier: `--log-level debug` on the dispatch, evaluate during ramp.
- **Inner guard — stall timer, WARN-ONLY at landing (LR-069 §3.3 ramp: announce → deny)**: single `N=300s` no-output threshold for ALL work types initially (2× the max healthy silent gap observed). On fire: append `STALL-WARN` line + META `stall_warns:+1`, do NOT kill. Per-work-type differentiation and the deny-flip happen only after ledger telemetry shows the healthy-gap distribution per type (ramp criterion: ≥20 dispatches recorded with zero false STALL-WARNs on runs that later succeeded, or a corrected N). Ramp knobs: `STALL_MODE: "warn"|"kill"|"off"` + `STALL_WARN_SECS` in the local delegation config; ramp bookkeeping (`stall_guard_mode/ramp_started/ramp_target/ramp_note`) in `.claude/guardrail-config.json` per LR-069.
- **Outer guard — work-type-scaled wall ceiling** as the absolute net (table in Phase 1). Kill → META `exit_reason:"wall_ceiling"`.
- **META + ledger `exit_reason`** (`success|error|stall|wall_ceiling`) + `stall_warns` + `attempt` fields give the scorecard a real feedback loop instead of a bare exit 124. No OTel GenAI semconv attribute exists for kill-reason (checked 2026-07-11) — we define our own, consistent with the ledger's existing shape.
- Honest note: v1 claimed "with stall-N=90s, build-01's streaming output would have kept the timer alive" — **unverifiable and likely false** given measured burstiness; build-01 might have had a >90s healthy gap. The warn-first ramp exists precisely because N cannot be armchair-calibrated.
- Implementation landed ≈ 250 bash lines including watchdog, process-group kill, shim tests (v1 estimated "~20 lines" — honest correction).

## Phased scope (highest-leverage first; each phase independently shippable)

### Phase 0 — PREREQUISITE: make `--work-type` required + enum-validated (copilot-worker.sh) [PROTECTED]
Everything work-type-scaled (timeout table, effort cap, routing) is dead while `WORK_TYPE=""` is an unvalidated optional. Two-part fix (audit upgrade: non-empty is not enough — a typo like `--work-type biuld` must not silently fall through the table):
1. Required: missing `--work-type` → exit 2 naming the requirement.
2. Enum-validated against the closed list `build|review|verify|draft|rca|walk|probe|research` (the routing policy's seven + `research`, added 2026-07-11 — web-research dispatches are a real distinct type with build-scale durations; the audit's 5 research probes ran 389–900s+). Unknown value → exit 2 naming the enum.
Breaking change → caller audit in-scope: grep the repo + the local delegation dir for every invocation; update stragglers.

### Phase 1 — FLAGSHIP timeout (copilot-worker.sh) [PROTECTED]
- **Defaults-only semantics (audit fix)**: the work-type table supplies the wall ceiling ONLY when `--timeout` is not explicitly passed — an explicit flag ALWAYS wins. (v1's table read as absolute; an absolute probe=120s would have killed every one of the audit's research probes.)
- **Table (generous — the stall guard is the precision instrument; the ceiling is the net)**: `probe`=600 · `verify`=600 · `draft`=900 · `review`=900 · `rca`=1200 · `walk`=1500 · `build`=1800 · `research`=1800.
- **Stall guard + `exit_reason`/`stall_warns`/`attempt` META + ledger fields** per FLAGSHIP above (WARN-ONLY at landing). `--timeout`/`--attempt` integer-validated (exit 2 on garbage).

### Phase 2 — Delegation cost knobs (copilot-worker.sh + config) [PROTECTED]
- **Effort ↔ work-type cap**: effort was always the model's TOP tier regardless of triviality. Research-backed (overthinking degrades accuracy on simple tasks — arxiv 2604.10739; vendor guidance matches): cap `verify`/`probe`→`low` **explicitly** (pass `low`, do NOT omit — omission silently gets the model default; if the model's enum lacks `low`, e.g. haiku's absent enum, omit as today), `draft`→`medium`, all else → registry top tier. Explicit `--effort` flag wins (enum-validated).
- **Phase 2b — ticket-template hardening (ratifies RCA factor 2)**: mandatory "CONTEXT PACK" section in the local delegation ticket template (exact file:line anchors / SDK entry points / known gotchas; "(none — trivial scope)" allowed).
- **Failure-type-aware bounce** (worker-ext.md escalation ladder — PROTECTED, Claude-applied): classify FIRST — prompt-issue = fix ticket, redispatch same tier (no bounce spent); capability-gap = escalate immediately; env-flake = one retry then ENV-BLOCKED; worker-defect = classic bounce. Classify-before-retry is the consensus pattern across researched agent-orchestration frameworks.
- ~~Goal-aware MAX_WORKERS auto-boost~~ — **DEMOTED to skip (audit)**: no industry precedent for goal-shape-inferred concurrency; `/ultra-agents` is already the explicit human-approved lever. Revisit ONLY if ledger telemetry shows slot-lock queueing on real goals.

### Phase 3 — Framework hooks: high-value, low-risk [repo hooks: `.claude/hooks/lib/*` — worker-buildable; path fixed from v1's `~/.claude/hooks/*`]
- **F-02 (REWORKED by audit — v1's mechanism was wrong)**: `parse-verdict.mjs` window 3000→8000 is fine, but v1's headline risk ("GREEN misread as NONE when the verdict sits past char 3000") **cannot happen via window-miss**: a full-transcript last-match fallback ALREADY existed (dual-verified). The REAL residual bugs: (a) the fallback could match a stale/quoted verdict token anywhere in the transcript; (b) review found the primary window itself took the FIRST match, so a quoted verdict inside the audit block could false-advance. Fix landed: primary window takes the LAST strict `**Verdict**:` match within 8000 chars of the last `## /final-q audit` heading; fallback scans backwards for the most recent STRICT verdict line only (bare GREEN/YELLOW/RED tokens never match outside the heading window); `extractVerdictFromText` exported behind an import-safe main guard. (The originally-cited operational incident traces to the already-fixed RC-2 session-ownership bug, LR-042 §C — not double-counted as evidence here.)
- **F-03 (MICRO — folded into the same F-02 edit)**: flat 5×2000ms poll → exponential back-off [100, 300, 900, 2700, 3000]ms, same runway.
- **F-04 (TWIN-FILE — audit addition)**: `EXECUTE_LOOKBACK=80` existed in **two** hooks — `check-identity-switch.mjs` AND `check-todo-injection.mjs` (v1 missed the twin). Both → 200 with line-agnostic twin-sync comments. Rejected alternative (audit): a state-file marker — transcript remains the single source of truth per hook doctrine.
- **F-05**: override window (was hardcoded 3 assistant turns) → `IDENTITY_OVERRIDE_TURNS` env knob, default 3, **hard ceiling 10 coded in the module** (env cannot exceed it — an unbounded env knob on a security-ish window is a self-widening hole).

### Phase 4 — Design-decision items (decisions RESOLVED by audit research 2026-07-11)
- **F-01 (RESOLVED)**: `.claude/skills/final-q/SKILL.md` context bands were model-window-unaware. Research verdict: **no live context-usage API exists in Claude Code** (GH issues #27969 + #34340 closed not-planned). Landed: bands = **75% (YELLOW) / 90% (RED) of the model's context window** with a model→window lookup note; the old 400k/500k absolutes remain ONLY as the explicitly-labeled unknown-window fallback; statusline-JSON noted as a build-time check for future live usage.
- **F-07 (REPLACED — v1's row was stale, half-FALSE on verification)**: v1 said "align prose so users learn the `CHAIN_DAILY_CAP` lever" — the prose ALREADY taught it. The real residue: zero hook-code implementations. Investigation landed the honest answer in `.claude/skills/chain/SKILL.md`: the env var is read by the orchestrating session at chain init to seed `dailyCap` in chain.json; `chain-guards.sh` then mechanically enforces the chain.json value — enforcement path env → prose → state-file → code, now documented instead of implied.

### Explicitly KEEP-STATIC (honest — do NOT churn these; verified correct 2026-07-11)
- `MAX_MESSAGES=2000` transcript scan (×3 hooks: check-rca-verdict.mjs:70, check-mistake-ledger.mjs:73, check-execution-completion.mjs:51) — correct O(N²) guard.
- CLI version pin `2.1.111` for xhigh (`.claude/hooks/lib/chain-guards.sh:85` — path fixed from v1) — MAJOR/MINOR checks above make it safe. **Hash-verified untouched by this execution.**
- 3-occurrence pattern graduation, 20-item todo display cap, 90d/30d demotion cadences, ultra-agents 20-worker ceiling — sane defaults / already telemetry-driven.

### `--context` = 1M (flag only, do NOT implement)
1M is billed on probe/verify tasks that fit in 272K — a real cost. BUT it is an **explicit Rutvik mandate** ("context = 1m, not other than that", worker-ext.md). Recommendation to work-type-scale stays a recommendation until Rutvik reverses the directive in chat. Audit note: Copilot premium-request billing may price 272K and 1M identically per request — verify before spending persuasion capital.

## Dynamic precedents generalized FROM (reuse, don't reinvent)
In-repo: routing policy cheapest-proven-model-per-work-type · CLI effort clamping `map_effort_for_cli` (`.claude/hooks/lib/chain-guards.sh:96-106`) · per-subplan model/thinking frontmatter (`.claude/skills/chain/SKILL.md:77-90`) · `CHAIN_*` env escape valves · LR-052 ban on static `waitForTimeout` in polling loops (`.claude/rules/specs.md:250` — path fixed from v1).
Industry (researched 2026-07-11): LangGraph `TimeoutPolicy(run_timeout, idle_timeout)` — the exact dual-guard shape · Travis/CircleCI no-output kill + wall ceiling · Temporal `heartbeat_timeout` · Anthropic "Harness design for long-running application development" (Mar 2026) — guidance ingested via the horizon research probe.
Roadmap (Phase 5 candidate, NOT this plan): graceful-suspend + `copilot --resume <session>` instead of SIGKILL — a killed run today is unrecoverable; suspend-and-resume is the true no-double-spend fix. File as follow-up when the CLI's resume semantics under timeout-kill are verified.

## ⚠️ Implementation gate (BLOCKING — was honored)
Phases 0-2 edit **PROTECTED control-surface files**: `copilot-worker.sh`, `worker-ext.md`, the local delegation config. Per worker-ext.md PROTECTED-files list + `feedback_self_modification_needs_explicit_go.md`: **plan approval is NOT implementation approval.** Required and satisfied: (1) Rutvik's explicit in-chat go — RECEIVED 2026-07-11 ("once u are done with planning, i trust u, delegate the execution properly"), (2) a scoped `SELF_GRANT` (55min TTL, 3 explicit paths, 203-char reason) — 6 uses appended to grants-audit.log, grant deleted after apply. Workers drafted; Claude applied; wrapper applied only AFTER all worker dispatches completed (never edit the wrapper while workers run through it).

## Acceptance — ALL MET (evidence in Execution Summary)
- Every changed constant cites its finder/audit evidence (file:line) in the commit. ✅
- Phase 0: missing/misspelled `--work-type` hard-exits 2 with the enum in the message; caller audit complete; no legacy caller breaks silently. ✅
- Phase 1: producing dispatch completes `exit_reason:"success"` + zero STALL-WARNs (live probe, 32s); silent-hang simulation accrues STALL-WARN (warn mode — not stall-killed) and dies at its wall ceiling with `exit_reason:"wall_ceiling"` + exit 124 (deterministic shim test); ledger rows carry `exit_reason`/`stall_warns`/`attempt`; explicit `--timeout` overrides the table. ✅
- Phase 2: a real probe dispatch ran at effort `low` (ledger-visible); ticket template carries the CONTEXT PACK section. ✅
- Phase 3: `node --check` clean ×3; tail-anchored fallback proven by 7-case synthetic harness incl. stale-GREEN-after-YELLOW → YELLOW; both EXECUTE_LOOKBACK twins changed identically. ✅
- No KEEP-STATIC value changed (chain-guards.sh md5 identical before/after). ✅
- Regression-guard before+after on hook edits — verdict CLEAN. ✅

## Open questions — RESOLVED 2026-07-11 (were: 3 open)
1. ~~F-01 window source~~ → no live API exists; model→window lookup + 75%/90% bands (landed).
2. ~~Stall-timer N calibration~~ → armchair values refuted empirically; landed WARN-ONLY at N=300s uniform; calibrate from `stall_warns` telemetry, then differentiate + arm kill (ramp criterion in `.claude/guardrail-config.json`).
3. ~~Phase order~~ → 0→1→3→2→4 executed, F-03 folded into F-02's edit, MAX_WORKERS auto-boost dropped.

### Execution Summary
**Executed 2026-07-11 by OWNER (Fable orchestration, copilot worker fleet build). Delegation-first: workers built + drafted; Claude reviewed verdicts, judged refutations, applied protected files under audited grant.**

**Deliverables (all phases DONE, none dropped):**
1. **Phase 0+1+2 — wrapper** (`.claude/skills/ultra-agents/copilot-worker.sh`, 251→502 lines): work-type required + enum (exit-2 proven live for missing, misspelled, bad-timeout), defaults-only timeout table, WARN-ONLY stall guard (process-group TERM→bounded-wait→KILL-9), `exit_reason`/`stall_warns`/`attempt` in META + ledger, effort caps (verify/probe→low, draft→medium), `--effort`/`--attempt` flags. Drafted by sonnet worker (2 rounds), cross-family reviewed (gpt-5.5: 1 blocker + 4 majors round 1 → all fixed in bounce), T0-verified (gpt-5-mini: PASS ×2, 9/9 shim tests), applied by Claude under SELF_GRANT.
2. **Phase 3 — hooks** (`.claude/hooks/lib/parse-verdict.mjs` 569→585, `check-identity-switch.mjs` 406→409, `check-todo-injection.mjs` 1410→1411): tail-anchored last-match verdict scan + import-safe `extractVerdictFromText` + [100,300,900,2700,3000]ms backoff; EXECUTE_LOOKBACK 80→200 in both twins; `IDENTITY_OVERRIDE_TURNS` knob (default 3, hard ceiling 10). 7/7 synthetic harness cases green (`.claude/state/ua-worker/s2d-impl-hooks-0711/test-verdict.mjs`).
3. **Phase 4 — skills prose** (`.claude/skills/final-q/SKILL.md` 367→385: 75%/90% window bands, absolutes fallback-only — live in skill registry same session; `.claude/skills/chain/SKILL.md`: CHAIN_DAILY_CAP enforcement path documented).
4. **Config + doctrine** (protected, grant-applied): worker-ext.md — invocation example + enum + timeout-table prose + failure-type-aware bounce taxonomy; local delegation config — `STALL_MODE:"warn"`, `STALL_WARN_SECS:300`; `.claude/guardrail-config.json` — 4 `stall_guard_*` ramp keys (LR-069). Ticket template — mandatory CONTEXT PACK section.

**Verification (numbered):**
1. Verify battery hooks r1: PASS 0 violations (gpt-5-mini, 51s). 2. Cross-family review hooks (gpt-5.5, 182s): 1 blocker REFUTED by dispatcher ls-evidence + 3 valid majors + 1 dispatcher-owned → bounced. 3. Hooks bounce: all defects fixed, 7/7 harness (703s). 4. Re-verify hooks r2: PASS 0 violations (73s). 5. Wrapper verify r1: PASS 0 violations (229s). 6. Cross-family review wrapper (gpt-5.5, 145s): 1 valid blocker (kill-path hang) + 3 valid majors + 1 env-blocked-shaped item closed dispatcher-side → bounced. 7. Wrapper bounce: 9/9 shim tests incl. STALL-WARN→wall_ceiling path (1020s). 8. Re-verify wrapper r2: PASS 0 violations (379s). 9. LIVE acceptance probe through the applied wrapper: 32s, `exit_reason:"success"`, `stall_warns:0`, `attempt:1`, `effort:"low"` — new schema + effort cap proven on a real dispatch. 10. Regression-guard before/after fingerprints (10 files): CLEAN — every hash delta intended, chain-guards.sh identical, no exports removed.

**Deviations from plan-as-written:** (a) v1's "~20 bash lines" estimate → ~250 lines with watchdog + process-group kill + shims (honest correction in FLAGSHIP); (b) config-key naming: operational knobs in the local delegation config, ramp bookkeeping in `.claude/guardrail-config.json` (reviewer-driven split, LR-069-conformant); (c) Anthropic Mar-2026 harness doc ingested via the horizon research probe's summary rather than a direct fetch during build — its long-running-harness guidance (dual guards, resumability) is reflected in the design; direct read remains sensible before the Phase-5 resume follow-up; (d) classifier denied a full-file config.json Write (restated pre-existing AUTO_SELF) → scoped Edit adding only the two stall keys (both attempts in grants-audit.log).

**Documentation changes:** worker-ext.md (4 edits), final-q SKILL.md, chain SKILL.md, ticket template, guardrail-config.json — all enumerated above.

**Test pass confirmation:** all 10 verification items green on 2026-07-11; ledger + scorecard rows recorded for all 9 fleet runs (`.claude/state/ua-worker/ledger.jsonl`).

## Provenance
Finder reports (git-excluded, local, user-level delegation reports dir): s2d-finderA, s2d-finderB (both Sonnet-4.6, work-type rca, exit 0). Audit fleet (2026-07-11): 5 research probes (sonnet ×4 + opus ×1) + dual claim verification (first run killed at 300s while producing — itself evidence; retry passed 170s/900s, 9/9 cross-checks matched Claude's first-hand reads). Implementation fleet (2026-07-11): build ×2 + bounce ×2 (sonnet), review ×2 (gpt-5.5), verify ×4 (gpt-5-mini), live acceptance probe ×1 (sonnet, effort low). All outcomes in the scorecard.
