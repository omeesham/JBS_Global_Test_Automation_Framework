# PLAN_COPILOT_HARNESS_PARITY_GAPS — force every Claude-harness capability onto the Copilot worker layer (hooks included)

**Status**: PENDING (evidence phases P0–P1 may run now; P2 design is Claude-authored; P3 build parks behind PLAN_COPILOT_INTEGRATION_ULTRAAUDIT clearance + Rutvik GO per protected file)
**Priority**: P0
**Created**: 2026-07-20
**Identity**: OWNER
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: cross-plan gap adjudication + enforcement-layer (Tier-2) design + LR-069 severity/ramp authoring across the whole delegation stack — max-tier per LR-041.
**PermissionMode**: auto
**BrowserTool**: none
**Depends on**: PLAN_COPILOT_INTEGRATION_ULTRAAUDIT.md (its Blocks line freezes integration EXECUTION; Rutvik's 2026-07-20 directive explicitly ordered this gap hunt + plan coverage now — research/design is read-only and exempt; the BUILD phase is not)
**Related, no overlap**: PLAN_DELEGATION_GOVERNOR_AND_STEERING (watchdog/steering = Stop-hook-adjacent, boundary layer), PLAN_UPLINK_PROTOCOL (ask-channel, boundary layer), SUBPLAN_ASSISTANT_LAYER_HARDGATES (gates CLAUDE's own behavior, not the worker runtime)

---

## Context — Rutvik directive (2026-07-20, verbatim intent)

"Claude is just a harness with LLM, similarly Copilot is a shittier harness with the same LLM... I want ABSOLUTE FUCKING PARITY — hooks, etc — make the shittier Copilot behave JUST like Claude by forcing it onto its shitty harness in any fucking way. Check EVERYTHING Claude has and Copilot doesn't in our repo, check the plans, FIND THE TOTAL GAPS — nothing covered yet, nothing in plans pending — like the hooks gap. Abuse the Copilot. Do not assume. Do not give up."

The prior recon (2026-07-14) concluded the worker CLI has "no hook mechanism inside its runtime." **That recon is now OUTDATED — machine-DISPROVEN 2026-07-20.** The INSTALLED CLI (`copilot v1.0.71`) config help states verbatim (evidence: `.claude/state/ua-worker/cphooks-probe-0720/help-config.verify.txt`):
- `:200` — **`hooks`: inline hook definitions, keyed by event name (same schema as `.github/hooks/*.json`)**
- `:201` — global config.json = user-level hooks; repo settings.json = repo-level hooks
- `:198` — `disableAllHooks` master switch (repo + user level)

Corroborated independently three ways: (1) web research (run `cphooks-research-0720`, gpt-5.5, 42 sources) — GA'd ~March 2026; (2) the probe reviewer's fresh alternate run (gpt-5.5); (3) **Claude's own live run 2026-07-20** — `copilot help config 2>&1 | grep -in hook` exit 0, returns the three lines above verbatim. So Copilot has native, event-keyed, user+repo-level hooks — directly analogous to Claude's `settings.json` PreToolUse/Stop wiring. **The parity path is NATIVE-FIRST**: map each Claude hook → Copilot's `.github/hooks/*.json` event schema and port it, falling back to external boundary chokepoints (PATH-shim / MCP-proxy / OS ACL / log-tail watchdog / git hooks) ONLY where a Claude hook has no native Copilot event. Rutvik was right: hooks are not impossible on Copilot — they already exist.

> **Command-shape trap (recorded 2026-07-20, cost one false refutation):** `copilot config --help` and `copilot help config` emit DIFFERENT help text — the hook lines appear only under `copilot help config`. A cross-family reviewer ran the `--help` form, got empty output, and wrongly "refuted" the hooks finding; Claude's own live run of the correct form settled it. Every probe of this CLI MUST try multiple command forms before concluding a feature is absent (absence-of-output ≠ absence-of-feature). Version reconciled: installed = `GitHub Copilot CLI 1.0.71` (the research report's `v0.0.423` was a stale/mis-sourced tag; hooks exist on the installed 1.0.71 regardless — verified live).

## Context addendum — Rutvik directive (2026-07-21): `/relevant` is a FORCING first-step on every dispatch

Second owner directive folded into this plan: the `/relevant` skill-scan must be a **forced first step** whenever ANY actor receives work — a Copilot worker, a Task-tool subagent, AUTO_SELF, or Claude itself on a `/relevant` request — never overlooked / skipped / rushed / bare-minimum'd, and the dispatcher must be GREEDY (inject every plausibly-relevant skill, never stingy). This lands as the **RS-1..RS-4 design in P2.3b**, which puts the prior P2.2 `relevant-injection` S3/observe-only posture on trial per LR-069 §3.5 (SURVIVES for application-quality, CONVICTED for the injection+acknowledgement axis).

## Bootstrap

- **Identity**: OWNER. **Skills**: /execute (orchestrator), /relevant (per phase), /innovation (P2 design core — Claude-authored), /regression-guard (WRAP on any hook/wrapper edit), /reflect + /final-q at close.
- **Context files**: `.claude/skills/ultra-agents/worker-ext.md` (doctrine-version 2 — the LIVE truth for worker capability), `.claude/skills/ultra-agents/copilot-worker.sh`, `~/.claude/delegation/DUTY_STACK.md`, `.claude/rules/guardrail-policy.md` (LR-069/LR-070), `plans/done/SUBPLAN_PARITY_INJECTION_SYSTEM.md`, `plans/done/PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY.md`, `plans/pending/PLAN_DELEGATION_GOVERNOR_AND_STEERING.md`, `plans/pending/PLAN_UPLINK_PROTOCOL.md`, `plans/pending/SUBPLAN_ASSISTANT_LAYER_HARDGATES.md`.
- **Evidence runs (P0 inputs, dispatched 2026-07-20 — literal run dirs)**:
  - `<repo>\.claude\state\ua-worker\cphooks-research-0720\` — web research: does the CURRENT CLI ship any native hook/policy surface + prior art for external enforcement on hook-less agent CLIs (PATH-shim, MCP-proxy, ACL, watchdog, git chokepoints).
  - `<repo>\.claude\state\ua-worker\cphooks-probe-0720\` — installed-CLI probe: version, full flag surface, config keys, tool-deny granularity, shell resolution, real-time log tail-ability.
  - `<repo>\.claude\state\ua-worker\cpgaps-enum-0720\` — two-sided machine inventory: every Claude-harness surface vs every channel a worker dispatch actually receives (verdict PARITY/PARTIAL/ABSENT per row).

---

## The Gap Register v0 (repo-verifiable today; P1 finalizes against the machine inventory — LR-020 re-verify every row at execute)

### Class A — ENFORCEMENT (the hooks class Rutvik caught — TOTAL GAPS, no pending plan builds these)

| # | Claude has | Worker has today | Gap verdict | Forcing candidates (P2 chooses) |
|---|---|---|---|---|
| A1 | **PreToolUse deny hooks** — tool call intercepted BEFORE execution (delegation-gate, identity gate, closure gate, todo gate) | **NATIVE HOOKS EXIST (machine-verified 2026-07-20, v1.0.71)** — `hooks` config key, event-keyed, `.github/hooks/*.json` schema, user+repo level, `disableAllHooks` switch. Not wired to our doctrine yet. | **NOT a gap in capability — a wiring gap.** Port Claude's PreToolUse gates → Copilot's native pre-tool event hooks | NATIVE-FIRST: enumerate Copilot's hook EVENT NAMES (P1 — from `.github/hooks/*.json` schema + `copilot config`/docs), map each Claude gate to its event, author the hook JSON. External chokepoints (PATH-shim / MCP-proxy / ACL) are the FALLBACK only for Claude hooks with no native Copilot event. |
| A2 | **Stop hooks** — session-end ceremony enforcement (mistake-ledger, execution-completion) | Wrapper post-exit checks only after process death; no in-flight equivalent | PARTIAL — split across UPLINK UW-4 (post-exit wires, pending) + GOVERNOR A2 watchdog (pending). The REAL-TIME variant (act while the worker runs, via log tailing) is covered by GOVERNOR; P1 verifies nothing falls between the two plans | (coverage-map row, not re-planned here) |
| A3 | **SessionStart injection** — primer asserts identity + rules every session | DUTY_STACK prepend + PINJ M1–M3 (DONE 2026-07-16) | PARITY (verify in P1 against enum evidence — the "1 of 18 layers" claim in `/delegation-temp` §Honest-Gaps predates PINJ landing and needs re-scoring) | — |
| A4 | **UserPromptSubmit injection** — per-turn rule/pattern/mistake scan re-injected on EVERY prompt | Workers are single-turn per dispatch, BUT multi-phase chains (bounces, interrogates, respawns) hand-carry context manually — nothing re-injects doctrine per hop | **TOTAL GAP** (bounce-hop injection) | Wrapper-side: bounce/interrogate builders re-run the doctrine splice + relevant-scan on every re-dispatch, mechanically |
| A5 | **Path-scoped rule auto-load** — `.claude/rules/*.md` `paths:` globs load rules the moment a matching file is edited | Dispatcher manually matches ticket SCOPE against rule globs (delegation-temp §Dispatch discipline — prose, skippable) | **TOTAL GAP** (mechanization) — VERIFY in P1 whether `ticket-skill-scan.mjs` already globs rules (it scans skills INDEX; rules matching is believed manual) | Extend `ticket-skill-scan.mjs`: SCOPE paths × rule `paths:` globs → auto-append DOCTRINE rows; wrapper refuses a build ticket whose SCOPE matches a rule glob absent from DOCTRINE |
| A6 | **Deny-capable write gates on protected paths** (Tier-2 safety layer, closure locks) | Worker is repo-confined (`-C`) but INSIDE the repo nothing distinguishes protected from free paths at write time | **TOTAL GAP** at worker layer | OS ACL per run · PATH-shim intercepting write-bearing commands · post-hoc envelope diff (exists — detective only, not preventive) |

### Class B — CONTEXT (P1 scores from enum evidence; every ABSENT row becomes a register row)

Claude's per-session layers (rules, skills index, memory pointers, lessons replay, navigation, patterns, client CLAUDE.md chain) vs the worker's actual received set (DUTY_STACK + ticket DOCTRINE + doctrine-index + PINJ splice). The enum run's PARITY/PARTIAL/ABSENT table is the denominator — **zero unreviewed rows** (LR-062 spirit).

### Class C — CAPABILITY (covered elsewhere; coverage-map rows, listed so nothing hides)

| Capability | Covering plan | State |
|---|---|---|
| MCP access (Jira read, web via --allow-url, add-dir grants) | PLAN_ASSISTANT_LAYER §A4 arms-and-legs | pending |
| Skills invocation for workers (skill-proxy) | SUBPLAN_ASSISTANT_LAYER_HARDGATES G4 | pending |
| Durable worker memory/hints | SUBPLAN_LCD_08_MEMORY_HINTS | parked P3 (deliberate) |
| Context governor (compaction/kill/digest/respawn) | PLAN_DELEGATION_GOVERNOR_AND_STEERING A1–A6 | pending |
| Mid-run steering (redirect a running worker) | PLAN_DELEGATION_GOVERNOR_AND_STEERING B1–B5 | pending |
| Ask-channel / assumptions surfacing | PLAN_UPLINK_PROTOCOL (+ WAVE2) | pending |
| Session resume/continuity | GOVERNOR P0.2 probe | pending |
| Model/effort registry parity | worker-ext registry | DONE |
| Prompt-injection defense (UNTRUSTED-CONTENT flag, Duty 9) | ticket-template + DUTY_STACK | DONE |
| Verify/acceptance machine gates (envelope, verify-run, scorecard) | CHEATPROOF machinery | DONE (ramping) |

## Staleness finding — PLAN_ULTRA_AGENTS_COPILOT_WORKER.md (Rutvik suspicion 2026-07-20, VERIFIED against the file's own lines)

The plan's vision layer is superseded by the live doctrine (`worker-ext.md` doctrine-version 2):

| Stale claim (file:line) | Live truth |
|---|---|
| `:7` "each model there is meaningfully dumber... Jr. Worker... audits everything" + `:12` "Copilot is DUMB... read only always" | worker-ext `:11` — workers "do the ENTIRE job per ticket — the full 8-duty stack, exactly what solo-Claude used to do"; edit mode is the ticket default |
| `:75-76` "Never delegate: RCA / debugging / hypothesis" | worker-ext `:32` — "RCA legwork → T2 worker with the rca SKILL.md cited in DOCTRINE" |
| `:96` model table lists `gpt-5.3-codex` | registry `:203` — `gpt-5.3-codex` NOT available on this account (hard CLI error, verified 2026-07-09) |
| `:29` "just another worker type plugged into /ultra-agents wave machinery" | `/ultra-agents` is now the cap booster only (worker-ext `:213`); the takeover replaced the wave-machinery framing |

**Disposition**: the file already carries the honest history (Takeover v3 sections appended 2026-07-09/10) — its EXECUTED parts are real; its VISION prose is stale. A dated staleness flag is added at the top of that file (2026-07-20). Formal supersession verdict = PLAN_COPILOT_INTEGRATION_ULTRAAUDIT Phase 1 (c) stale-anchor class. Do NOT execute its remaining un-executed prose as written; `worker-ext.md` v2 is the live truth.

---

## Phases

### P0 — Evidence intake (dispatched 2026-07-20, running)
1. Three worker runs land (research / probe / enum — run dirs in Bootstrap). CLARIFY rounds: all three returned `NO-QUESTIONS` (gate-checked, ledger rows green).
2. Cross-family reviews: T1 (gpt-5.5 executor) → claude-family reviewer; T2/T3 (claude executors) → gpt-5.5 reviewer. OFF-REPO discipline: reviewers RE-EXECUTE probe commands, never paper-review.
3. `verify-run.mjs` per return — key on the `verdict` field (GENUINE accept / FABRICATED bounce / UNPROVABLE → Claude judgment). Check ledger `exit`/`ok`/`exit_reason` before calling any run landed.
4. Every `## ASK` item dispositioned before acceptance. Research deliverable additionally gate-checked: `grep -c 'http' result.md` ≥ 8 + `## SEARCHES RUN` present (the 2026-07-16 lane-shrink lesson).

### P0.5 — NATIVE HOOK EVENT ENUMERATION — ✅ DONE 2026-07-20 (CONFIRMED)

Evidence: run `cphooks-events-0720` (sonnet, GitHub docs + CLI artifacts) + Claude's own WebFetch of `https://docs.github.com/en/copilot/reference/hooks-reference`. **Copilot CLI v1.0.71 has 14 hook events — a SUPERSET of Claude Code's 5** — and `preToolUse` is deny-capable and FAIL-CLOSED. This resolves all of Class A NATIVE-first (external chokepoints now needed for essentially nothing).

**Event-parity map (confirmed):**

| Claude Code event | Copilot native event | Parity | Enforcement |
|---|---|---|---|
| `PreToolUse` (deny gates) | `preToolUse` / `PreToolUse` | ✅ FULL | Deny-capable: `{"permissionDecision":"allow"\|"deny"\|"ask"}`; **fail-closed** — non-zero exit / crash = DENY (docs verbatim). True enforcement parity. |
| `PostToolUse` | `postToolUse` / `PostToolUse` | ✅ FULL | Fires post-success with tool name/args/result; can modify result. |
| `Stop` | `agentStop` | ✅ FUNCTIONAL | Fires when agent finishes a turn; can force continuation. |
| `SessionStart` | `sessionStart` / `SessionStart` | ✅ FULL | Injects `additionalContext`; also supports a `prompt` hook type. |
| `UserPromptSubmit` | `userPromptSubmitted` / `UserPromptSubmit` | ✅ FULL | Fires on prompt submit; observe. |

**Copilot has 9 events Claude does NOT**: `permissionRequest` (deny-capable, before the permission service — even stronger than preToolUse), `userPromptTransformed` (rewrite model-facing content), `subagentStart`/`subagentStop`, `postToolUseFailure`, `sessionEnd`, `notification`, `preCompact`, `errorOccurred`.

**Schema**: `.github/hooks/*.json` (repo) + `~/.copilot/hooks/*.json` (user) + inline `hooks` key in settings.json/config.json. Hook types: `command` (bash/powershell/command fields), `http`, `prompt` (sessionStart only). Payload delivered on **stdin as JSON** (same model as Claude Code). Windows shell = pwsh.

**Precedence (all sources' entries for an event ALL run, none override)**: (1) **policy hooks** `C:\ProgramData\GitHub\Copilot\policy.d\*.json` — machine-wide, admin-only, **immune to `disableAllHooks`**, works regardless of folder-trust → a Tier-2-equivalent enforcement layer; (2) repo `.github/hooks/`; (3) user `~/.copilot/hooks/`; (4) inline repo settings; (5) inline user config; (6) plugin hooks. `disableAllHooks` kills 2-6 only, never policy hooks.

**Consequence for this plan**: Class A "force hooks externally" is REPLACED by "port Claude's gate logic into Copilot's native hook JSON." The PATH-shim / MCP-proxy / OS-ACL fallbacks drop to near-zero use. Remaining un-driven claim (honest): the deny behavior is **documented + schema-confirmed + Claude-doc-read**, NOT yet LIVE-FIRE proven — P4 must actually create a `preToolUse` deny hook and watch it block a real Copilot tool call (gated on Rutvik GO — it starts touching real hook config).

### P1 — Gap table finalize (Opus judgment, machine denominator) — §0 RESOLVED 2026-07-20

0. **Enum home-blocked rows RESOLVED (Claude read the 6 protected surfaces directly).** The worker sandbox is `-C $REPO`-confined and cannot read `~/.claude`/`~/.copilot`; moreover it MUST NOT read the delegation-enforcement internals (secrecy) — so these 6 are correctly Claude-read, not worker-read (the plan sanctioned direct read; a Copilot `--add-dir` pass was rejected on secrecy + efficiency grounds). Evidence: `.claude/state/ua-worker/cpgaps-home-fill-0720/*.verify.txt`. Real verdicts overturn 2 assumed-ABSENT rows — **#13 is PARITY, not a gap** (Copilot has `~/.copilot/agents/*.agent.md`: chief/worker/planner/reviewer/verifier — mirrors Claude's `.claude/agents/{ROLE}.md`); **#7/#14 are PARTIAL** (workers have `~/.copilot/mcp-config.json` = `tavily-search`, narrower than Claude's many servers, NOT ABSENT). The enum's "no wrapper in repo" miss is corrected: `copilot-worker.sh` EXISTS (40KB, `.claude/skills/ultra-agents/`, git-excluded-but-on-disk) → #9/#10 PARITY. **The residual genuine gap this surfaced stands as a P2 design item: workers can't even SEE the home-side control surface without an explicit grant — the grant policy itself must be designed.**

**FINAL 16-class machine inventory (denominator — every row a verdict, zero unreviewed):**

| # | Claude surface (what it does) | Worker equivalent today | Verdict |
|---|---|---|---|
| 1 | **Home hooks** — 10 registered in `~/.claude/settings.json` (SessionStart `delegation-primer`; PreToolUse `ua-worker-guard`/`delegation-gate`/`check-config-liveness`/`check-delegation-envelope`/`check-weight-council`/`check-isolation-perimeter`/`check-agent-parity`/`check-closure-debt`/`labor-gate`/`delegation-nudge`) — govern CLAUDE-as-delegator | none as home hooks; Copilot supports `~/.copilot/hooks/*.json` natively | **NATIVE-CANDIDATE** (wiring gap) |
| 2 | **Repo hooks** — `.claude/hooks/*.sh` + `settings.json` (todo/closure/identity/mistake-ledger/execution-completion/bug-baseline/jargon/no-verify/browsertool) — govern WORK QUALITY | none; Copilot supports `.github/hooks/*.json` natively | **NATIVE-CANDIDATE** (wiring gap) |
| 3 | **Path-scoped rules** — `.claude/rules/*.md` `paths:` globs auto-load on matching edit (11 files) | dispatcher manually matches SCOPE→globs (prose, skippable) | **ABSENT** (mechanization gap) |
| 4 | **Skills router** — 35 skills, `/x` invocable | workers have NO Skill tool; DOCTRINE cites skill paths manually | **ABSENT** (skill-proxy → HARDGATES G4) |
| 5 | **Auto-memory** — `MEMORY.md` + ~150 memory files injected per session | none — single-turn; DUTY_STACK + ticket only | **ABSENT** (durable memory → SUBPLAN_LCD_08, parked) |
| 6 | **Per-turn context injectors** — `delegation-primer` (SessionStart) + `relevant-injection` (UserPromptSubmit) | DUTY_STACK prepend + PINJ M1–M3 (done) | **PARTIAL** |
| 7 | **MCP surface** — Claude: Jira/harvest/chrome/playwright/registry/scheduled/ccd… (many) | Copilot worker: `~/.copilot/mcp-config.json` = `tavily-search` only | **PARTIAL** (→ ASSISTANT_LAYER §A4) |
| 8 | **Gate libs** — `.claude/hooks/lib/*.mjs` (24) + home flat gates | none at worker layer | **ABSENT**; NATIVE-CANDIDATE via Copilot hooks |
| 9 | **Wrapper prompt construction** — `copilot-worker.sh` (EXISTS, 40KB) | this IS the worker dispatch layer | **PARITY** (corrects enum miss) |
| 10 | **Wrapper argv per mode** — read/edit, `--deny-tool`, `-C` confine, model/effort | same wrapper | **PARITY** |
| 11 | **DUTY_STACK headers** | prepended every dispatch | **PARITY** |
| 12 | **Ticket-template fields** | every ticket | **PARITY** |
| 13 | **Agent profiles** — Claude `.claude/agents/{ROLE}.md` | Copilot `~/.copilot/agents/*.agent.md` (5 roles) | **PARITY** |
| 14 | **mcp-config** | `tavily-search` | **PARTIAL** (= #7) |
| 15 | **PINJ injection artifacts** | present (M1–M3 done) | **PARITY** |
| 16 | **Post-run enforcement** — verify-run/envelope/scorecard/ledger | present (CHEATPROOF) | **PARITY** (ramping) |

**The TRUE gaps** (Claude has, worker lacks, not natively closed without wiring): **#1/#2** hooks (NATIVE-CANDIDATE — port to Copilot native hook JSON), **#3** path-rule auto-load (mechanize), **#4** skills router (skill-proxy), **#5** auto-memory (parked), **#7/#14** MCP breadth (PARTIAL). Everything 9–16 (minus 14) is already PARITY — the delegation PLUMBING is done; the gaps are the **ENFORCEMENT + CONTEXT + MEMORY** layers.

1. ✅ §0 done above. Remaining P1: cross-check vs the pending integration plans (run `cpinv-plans-0720`, dispatched 2026-07-20) so no gap double-lands — the coverage matrix resolves the Class C rows and the "covered by NO plan" residue that P2 must own.
2. Re-verify the two VERIFY-tagged rows (A3 "1 of 18" re-score vs PINJ-landed; A5 `ticket-skill-scan` rules-glob check) against evidence at P2 authoring.

### P2 — Hooks-parity DESIGN (Claude-authored /innovation core — Fable design brain 2026-07-20, Opus-integrated; cross-family GPT-5.5 review CONFIRMED the factual base, no refutation — see P2.8)

> **Scope guard:** Everything below is DESIGN ONLY. Nothing here authorizes creating any hook file, wrapper edit, or policy.d entry. P3 (build) + P4 (live-fire deny proof) stay gated behind PLAN_COPILOT_INTEGRATION_ULTRAAUDIT clearance **and** Rutvik's per-file GO. The one P4 candidate (a throwaway canary hook to prove deny semantics) is itself a build act behind the same gate.

#### P2.1 — The POSITION-based two-layer model (the architectural spine)

**Law: enforcement attaches to POSITION, not agent-type.** Two positions, each with a physical home:

| Layer | Governs | Physical home | Owner plan |
|---|---|---|---|
| **DELEGATOR-layer** | Whoever decomposes/tickets/dispatches (Claude-as-CEO today) | HOME `~/.claude/hooks/` reg. in `~/.claude/settings.json` | SUBPLAN_ASSISTANT_LAYER_HARDGATES (G0–G5, TP-1..5, grant-broker) — cite, never duplicate |
| **WORKER-layer** | Whoever executes a ticket — Copilot worker OR Claude-in-AUTO_SELF | REPO dual-registered: `.claude/hooks/` + `.claude/settings.json` (Claude sessions) **and** `.github/hooks/*.json` (Copilot sessions), plus `policy.d` for the Tier-2 subset | **THIS plan** |

**SHARED GATE CORE (parity is structural, not aspirational).** Every worker-quality gate is implemented exactly once as a predicate in `.claude/hooks/lib/`, reached by two thin adapters: the Claude adapter = existing `.claude/settings.json` registration (live); the Copilot adapter = a `.github/hooks/<gate>.json` `command` entry running `node .claude/hooks/copilot-adapters/<gate>.mjs`, which reads Copilot stdin JSON and emits `{"permissionDecision":"allow"|"deny"|"ask"}`. A new `lib/payload-normalize.mjs` maps both harnesses' stdin into one canonical shape `{position, harness, event, tool, args, cwd, ticketId, sessionId}` — one predicate, two registrations, cannot drift. (Copilot shell = pwsh; every adapter command is `node <abs-script>`, no shell-syntax dependence.)

**AUTO_SELF symmetry (closing the loophole).** Worker-position is detected by ENV, never brand: the wrapper sets `UA_POSITION=worker` + `UA_TICKET_ID` for every Copilot dispatch, and AUTO_SELF becomes a first-class target of the SAME wrapper (`copilot-worker.sh --self <ticket>` sets the identical env). Repo worker-layer gates check `UA_POSITION=worker` then apply the same predicates the Copilot adapters apply → the same jargon/closure/build-order/identity gates fire identically on a Copilot process AND on Claude-in-AUTO_SELF. **Trust-vector compliant:** every mechanism aims at the WORKER's claims/actions (or envelope integrity at ticket-time); nothing adds a blocking hook to Claude's dispatch path.

**Why `.github/hooks/` (repo) is the Copilot worker-layer home, not `~/.copilot/hooks/`:** repo hooks are versioned, reviewed, travel with the repo, fire for any Copilot session here regardless of machine/user. `~/.copilot/hooks/` is reserved for machine-personal concerns (the PINJ in-run twin); `policy.d` for the tamper-immune Tier-2 subset. Copilot precedence runs ALL matching layers additively (none override), so this layering is safe by construction.

#### P2.2 — Gate → Copilot-hook mapping (A1 + A6)

Fail-closed baseline for every deny row: `preToolUse` treats non-zero exit / crash as DENY (FLOOR-construction doctrine). S0 rows get a second registration on `permissionRequest` (fires before the permission service — an earlier, stronger choke).

| Claude gate | Copilot event | Hook location | deny/observe | JSON-shape sketch | Sev | Ramp |
|---|---|---|---|---|---|---|
| **A6 worker-write-gate** (NEW — worker-session analogue of `delegation-gate.mjs`: protected/dangerous paths during a worker run) | `preToolUse` + `permissionRequest` | `.github/hooks/worker-write-gate.json` + policy.d twin | DENY | `node …/copilot-adapters/worker-write-gate.mjs → {"permissionDecision":"deny"}` | **S0** | **deny-on-landing** |
| `check-no-verify` (ext. to full gate-evasion class: `--no-verify`, `disableAllHooks`, `core.hooksPath`, hook-dir edits) | `preToolUse` + `permissionRequest` | **policy.d primary** + `.github/hooks/no-verify.json` mirror | DENY | `node …/gate-evasion.mjs (regex corpus from policy-side file)` | **S0** | **deny-on-landing** |
| `plan-closure-gate` (Status:DONE machine-gate) | `preToolUse` (writes matching `plans/**`) | `.github/hooks/plan-closure.json` | DENY | `node …/plan-closure-adapter.mjs (reuses lib predicate)` | **S0** | **deny-on-landing** |
| `check-identity-switch` (identity write-gate) | `preToolUse` | `.github/hooks/identity-write-gate.json` | DENY (knob) | `node …/identity-adapter.mjs (ticket ROLE vs path-owner)` | S1 | reuse `.claude/identity-gate-config.json` |
| `check-jargon` (no internal jargon in shipped client source) | `preToolUse` (writes under `clients/*/src|tests`) | `.github/hooks/jargon-gate.json` | DENY after ramp | `node …/jargon-adapter.mjs (same term corpus)` | S1 | announce→deny |
| `todo-injection-gate` → **build-order-gate** (Copilot has no TodoWrite; positional equiv = deny build-writes until the ticket's recon/plan-ack sentinel exists in the LITERAL output dir) | `preToolUse` | `.github/hooks/build-order-gate.json` | DENY after ramp | `node …/build-order-adapter.mjs (sentinel in UA_TICKET dir)` | S1 | announce→deny |
| `check-bug-baseline` | `preToolUse` (bug-report paths) | `.github/hooks/bug-baseline.json` | observe→deny | `node …/bug-baseline-adapter.mjs` | S2 | long announce→deny |
| `check-browsertool` (LR-038 tool-selection) | `preToolUse` (Bash browser invocations) | `.github/hooks/browsertool.json` | DENY (deterministic) | `node …/browsertool-adapter.mjs (CLI-row allowlist)` | S2 | announce→deny |
| `execution-completion-gate` (no silent checkpoint) | `agentStop` (force-continue if required artifacts absent) | `.github/hooks/completion-gate.json` | observe + force-continue | `node …/completion-adapter.mjs → continuation naming missing artifact` | S1 | announce→enforce |
| `mistake-ledger-gate` (session mistake capture) | `agentStop` | `.github/hooks/mistake-ledger.json` | observe + force-continue | `node …/mistake-ledger-adapter.mjs (REPORT carries lessons block)` | S2 | announce→enforce |
| `relevant-injection` → **FORCING first-step (RS-1..RS-4, P2.3b)** — injection+ack axis is deny-capable; application-quality axis stays reviewer-netted (2026-07-21 directive) | `sessionStart` + `userPromptSubmitted` (inject) · `preToolUse` (RS-2 ack gate) | `.github/hooks/relevant-injection.json` + build-order sentinel | inject + DENY-until-ack | see P2.3b | S1 (ack) / S3 (quality) | announce→deny (ack) |
| PINJ in-run twin (dispatch-time PINJ is parity #15; this screens content arriving MID-run) | `userPromptTransformed` | `~/.copilot/hooks/pinj.json` (machine-personal) | modify/deny | `node …/pinj-adapter.mjs (rewrite/flag injected model-facing content)` | S1 | announce→deny |

#### P2.3 — Non-hook mechanisms

- **A4 — per-hop doctrine re-injection.** New `build-hop-prompt.mjs` called by `copilot-worker.sh` on EVERY dispatch (initial/bounce/interrogate/respawn — today only initial gets M1+M2+M3). Assembles M3 preamble → M1/M2 outputs → hop-context header (`hop N | prior verdict | unresolved findings`) → original ticket → hop delta. Wrapper refuses to dispatch (non-zero exit, names the defect) if the assembled prompt lacks the `<!-- DOCTRINE-STAMP vX -->` sentinel. Chokepoint: `copilot-worker.sh`. **S1, announce→refuse.**
- **A5 — path-scoped-rule mechanization.** Extend `ticket-skill-scan.mjs`: SCOPE paths × `.claude/rules/*.md` `paths:` globs → auto-append matching rules' DOCTRINE refs. Refuse-gate: wrapper re-runs the scan pre-dispatch, refuses any build ticket whose SCOPE matches a rule glob whose rule ID is absent from DOCTRINE (prints the missing list). Chokepoints: `ticket-skill-scan.mjs` + `copilot-worker.sh`. **S1, announce→refuse.**
- **Coordinate-only (cite, don't rebuild):** #4 skills-router — initial-dispatch inlining DONE via M2 (SUBPLAN_PARITY_INJECTION_SYSTEM); worker mid-run self-serve lookup deliberately NOT designed here (noted). #7/#14 MCP breadth → PLAN_ASSISTANT_LAYER §A4. #5 auto-memory → SUBPLAN_LCD_08_MEMORY_HINTS (parked P3, note only). A2 real-time steering → PLAN_DELEGATION_GOVERNOR_AND_STEERING.

#### P2.3b — `/relevant` FORCING first-step on EVERY dispatch (RS-1..RS-4, owner directive 2026-07-21)

**Directive (Rutvik, verbatim intent):** whenever ANY actor receives work — a Copilot worker, a Task-tool subagent, AUTO_SELF, or Claude itself on a `/relevant` request — the `/relevant` skill-scan MUST run FIRST and be *consumed*, never overlooked / skipped / rushed / bare-minimum'd. The dispatcher must be GREEDY, never stingy: every skill that plausibly helps the ticket is injected; pruning false-includes is the reviewer's job, never the dispatcher's. Skills become PART of the work (a gated artifact), not a mention in the prompt the actor can ignore.

**What becomes forcing vs. what stays reviewer-netted (the honest line, LR-069 §3.1):** you cannot mechanically grade *how well* a skill was applied — that axis stays S3, netted by the cross-family reviewer + the LR-070 assumptions-disposition, never a hook. What IS deterministic and therefore forced: (1) the scan ran, (2) EVERY matching skill is in DOCTRINE, (3) the actor dispositioned each before substantive writes, (4) the report carries the dispositions.

| Mech | What it forces | Chokepoint | Sev | Ramp |
|---|---|---|---|---|
| **RS-1 — greedy skill scan (dispatcher, "not stingy")** | `ticket-skill-scan.mjs` runs the `/relevant` decomposition over ticket SCOPE and auto-appends EVERY `INDEX.md`-trigger-matching skill as a DOCTRINE `SKILL` row, superset-biased. Wrapper refuses a build ticket whose SCOPE matches a skill trigger absent from DOCTRINE (symmetric to A5's rule-glob refuse-gate). | `ticket-skill-scan.mjs` + `copilot-worker.sh` | S1 | announce→refuse |
| **RS-2 — first-step ack gate ("first thing, no skip")** | build-order-gate extension: worker substantive build-writes DENIED until a `relevant-ack.json` sentinel exists in the ticket's LITERAL output dir listing each DOCTRINE skill with an applied / `(skipped: <reason ≥20 chars>)` disposition (C6-shaped honest-skip — no bare skips). | `.github/hooks/build-order-gate.json` (reuses P2.2 sentinel machinery) | S1 | announce→deny |
| **RS-3 — report skills-applied block (accept-path can't skip)** | acceptance gate keys on a `## Skills Applied` REPORT block dispositioning every DOCTRINE skill; missing / incomplete = FABRICATED-class bounce (LR-070 assumptions-disposition sibling — the accept path cannot green without it). | `verify-run.mjs` + envelope | S1 | announce→enforce |
| **RS-4 — Claude/delegator side ("when I ask claude to relevant, it does it")** | `delegation-gate` requires the greedy skill-DOCTRINE artifact (RS-1 output) present on the dispatch payload before ANY dispatch; a user `/relevant` request is answered by producing the tagged decomposition, not prose. Delegator-layer — cite SUBPLAN_ASSISTANT_LAYER_HARDGATES G4/broker, do NOT duplicate. | HOME `delegation-gate` (HARDGATES) | S1 | announce→deny |

**Prior-fix trial (LR-069 §3.5 — the observe-only choice on trial).** The P2.2 `relevant-injection` row was authored **S3 / observe-only** on the theory that skill *application quality* can't be mechanically judged. (1) What it did: injected the scan, denied nothing. (2) Why it fails THIS directive: `prose-not-mechanism` on the injection+ack axis — "scan ran, all matches present, each dispositioned, report carries it" ARE deterministic and were left ungated, so an actor could ignore the injected scan with zero consequence (the exact "overlook / bare-min" hole the directive names). (3) What's different: RS-1..RS-4 gate that axis. **Verdict: SURVIVES for the application-quality axis (kept — reviewer-netted); CONVICTED for the injection+acknowledgement axis (rewired to forcing, not merely re-labelled).**

**AUTO_SELF symmetry:** RS-2/RS-3 fire via the same `UA_POSITION=worker` predicate as every other P2.1 worker-layer gate — so Claude-in-AUTO_SELF is held to the identical `/relevant`-first bar as a Copilot worker. Trust-vector compliant: RS-4 gates the delegator's *dispatch payload* (does it carry the skill DOCTRINE), never Claude's reasoning.

#### P2.4 — Scoped home-dir grant policy (the residual gap — secrecy-aware)

Four principles, force-ranked:
1. **Default = ZERO home grants.** Workers stay `-C $REPO`-confined. Home unreadability is the structural floor, not a courtesy.
2. **EXPORT, don't MOUNT.** Home-side doctrine a worker legitimately needs is exported at ticket-write time as sanitized excerpts into `.claude/state/ua-worker/<ticket>/doctrine/` — the common case needs no `--add-dir` at all.
3. **Enforcement-opacity rule — a worker must never read the gate corpus that governs it.** Two HONEST tiers: *Structural (hard)* — `~/.claude/**`, `~/.copilot/**`, `C:\ProgramData\GitHub\Copilot\policy.d\**` are a wrapper-enforced NEVER-grant list (`copilot-worker.sh` refuses any `--add-dir` under them, unconditionally); since home is unreadable without a grant, read-protection here is structural. *Best-effort (stated honestly)* — repo-side `.claude/hooks/**` + `.github/hooks/**` are inherently in-repo-readable; you cannot hide in-repo files and pretending otherwise is slop. Mitigation: (a) the real guarantee is WRITE-integrity — A6 S0 deny + policy.d twin (disableAllHooks-immune) + HARDGATES TP-x tamper detection; (b) sharp trigger material (deny-regex corpora, tamper baselines, canary values) loads at hook-runtime from policy-side files OUTSIDE the repo, so the repo copy reveals mechanism but not full trigger surface. **Read-obscurity is best-effort; write-integrity is the floor.**
4. **Grant ladder for the rare genuine need:** rung 1 export-copy (default); rung 2 narrowest leaf-dir `--add-dir`, read intent, single-dispatch TTL, logged in envelope + scorecard (Tier-1: Claude may approve via HARDGATES broker); rung 3 = the NEVER list = Tier-2 = Rutvik-only, always.

#### P2.5 — policy.d Tier-2 layer

`C:\ProgramData\GitHub\Copilot\policy.d\encore-tier2.json` — admin-only, immune to `disableAllHooks`, folder-trust-independent. Carries ONLY the hardest, most stable denies (small, stable, brutal): **self-protection** (deny writes to `.github/hooks/**`, repo `.claude/hooks/**`, `.claude/settings*.json`, `~/.copilot/**`, policy.d itself); **gate-evasion** (`--no-verify`, `disableAllHooks`, `core.hooksPath`, hook-registration edits); **worker isolation perimeter** (deny writes outside `$REPO` + scratchpad + envelope-granted dirs). Craft/iterated gates stay repo-level (versioned/reviewable). Install: `scripts/install-policy-hooks.ps1` versioned in-repo but applied ONLY by Rutvik in an elevated shell — Claude never self-installs. Liveness: policy file carries a version stamp; a repo-side probe (same pattern as `check-config-liveness.mjs`, validation-surviving canary) verifies installed-version match + that a canary deny actually fires — **that probe IS the P4 live-fire item.**

#### P2.6 — LR-069 classing summary

Shared ramp state `.claude/state/ua-worker/gate-ramp.json` — per-gate `{mode, since, trip_count}`; flips logged, never silent. **S0 gates ignore the ramp — born deny** (the sole deny-on-landing exception per LR-069 §3.3).

| Mechanism | Sev | Ramp | Chokepoint |
|---|---|---|---|
| A6 worker-write-gate | S0 | deny-on-landing | `.github/hooks/worker-write-gate.json` (+ policy.d twin) |
| Gate-evasion (no-verify class) | S0 | deny-on-landing | `policy.d/encore-tier2.json` |
| plan-closure port | S0 | deny-on-landing | `.github/hooks/plan-closure.json` |
| Worker isolation perimeter | S0 | deny-on-landing | `policy.d/encore-tier2.json` |
| identity-write port | S1 | `.claude/identity-gate-config.json` knob | `.github/hooks/identity-write-gate.json` |
| jargon port | S1 | announce→deny | `.github/hooks/jargon-gate.json` |
| build-order-gate | S1 | announce→deny | `.github/hooks/build-order-gate.json` |
| completion-gate (agentStop) | S1 | announce→enforce | `.github/hooks/completion-gate.json` |
| A4 hop re-injection | S1 | announce→refuse | `copilot-worker.sh` |
| A5 rule-scan refuse-gate | S1 | announce→refuse | `ticket-skill-scan.mjs` + wrapper |
| PINJ in-run twin | S1 | announce→deny | `~/.copilot/hooks/pinj.json` |
| bug-baseline port | S2 | long announce→deny | `.github/hooks/bug-baseline.json` |
| browsertool port | S2 | announce→deny | `.github/hooks/browsertool.json` |
| mistake-ledger (agentStop) | S2 | announce→enforce | `.github/hooks/mistake-ledger.json` |
| RS-1 greedy skill scan (P2.3b) | S1 | announce→refuse | `ticket-skill-scan.mjs` + wrapper |
| RS-2 `/relevant` first-step ack gate (P2.3b) | S1 | announce→deny | `.github/hooks/build-order-gate.json` (relevant-ack sentinel) |
| RS-3 report skills-applied block (P2.3b) | S1 | announce→enforce | `verify-run.mjs` + envelope |
| RS-4 delegator skill-DOCTRINE gate (P2.3b) | S1 | announce→deny | HOME `delegation-gate` (HARDGATES) |
| relevant-injection port (application-quality axis) | S3 | observe-only, never deny | `.github/hooks/relevant-injection.json` |

#### P2.7 — Downstream plan updates (native-hooks flip — this plan coordinates, does not execute)

The native-hook confirmation makes any "Copilot has no hooks / enforce externally only" premise factually wrong. One-line flips needed (queued, not yet applied):
- PLAN_DELEGATION_GOVERNOR_AND_STEERING — keep watchdog as backstop; note native `agentStop` force-continuation + `notification` as first-class carriers.
- PLAN_UPLINK_PROTOCOL + SUBPLAN_UPLINK_WAVE2 — note `notification`/`userPromptTransformed` as native ask-channel hop points alongside file transport.
- SUBPLAN_ASSISTANT_LAYER_HARDGATES — note the Copilot worker analogue now exists natively (`preToolUse`/`permissionRequest` + policy.d); its Claude-side gates are one of two symmetric layers.
- PLAN_ASSISTANT_LAYER — note granted dirs/URLs can be hook-audited in-run (`preToolUse` observe on granted surfaces).
- PLAN_LAZY_CEO_DELEGATOR — note AUTO_SELF + Copilot lanes are now identically governed via the position-based worker layer.
- PLAN_ULTRA_AGENTS_COPILOT_WORKER — retire note cites native hooks as final supersession evidence.
- Doctrine (not plans, same flip): `worker-ext.md` + `worker-doctrine-index.md` — one line that native hooks now ENFORCE what was prose-only.
- PLAN_MEGA_AUDIT_COPILOT_ERA — add terminal checklist item: verify native hook liveness (on≠off canary) across repo + policy.d layers.

#### P2.8 — Cross-family review outcome + build-time caveats

**Cross-family review (GPT-5.5 / OpenAI — Fable is Anthropic; the Council anti-self-review rule is satisfied, reviewer-provider ≠ author-provider).** Two review dispatches (`cpgaps-p2design-review-0720`, `-a2`) both hit the reviewer's session budget before writing a final synthesized verdict, but their harvested evidence artifacts (`.claude/state/ua-worker/cpgaps-p2design-review-0720-a2/*.verify.txt`) independently CONFIRM the design's factual base and surface **no refutation**:
- Every repo-side chokepoint the design cites EXISTS (fresh `04-file-checks.verify.txt`): `check-no-verify.mjs`, `check-plan-closure.mjs`, `check-identity-switch.mjs`, `check-execution-completion.mjs`, `check-browsertool.mjs`, `copilot-worker.sh`, `ticket-skill-scan.mjs`, `.claude/settings.json`, `.claude/identity-gate-config.json`, `.claude/hooks/lib/`.
- **`check-no-verify.mjs` already implements the gate-evasion class** (`--no-verify`, `disableAllHooks`, `core.hooksPath` — `05-keyword-checks.verify.txt`) — so the S0 gate-evasion mechanism (P2.2) ports an EXISTING predicate, not a new one. This STRENGTHENS the design.
- Copilot hook facts re-confirmed by the reviewer's OWN fresh `copilot help config` + official-docs extraction: inline `hooks` keyed by event, `.github/hooks/*.json` schema, user+repo levels, `disableAllHooks`, `preToolUse`/`permissionRequest`/`policy.d`. (`copilot help hooks` = "Unknown topic"; hooks live under the `config` topic — the documented command-shape trap.)

**Build-time caveats (resolve during P3, not now — design stands):**
1. **Home-side reference clarity.** The design cites `check-config-liveness.mjs` + `check-isolation-perimeter.mjs` as PATTERN analogues — these are HOME files (`~/.claude/hooks/`, dispatcher-verified present this session), NOT repo files; a repo-confined reader cannot see them (caused a first-pass false-positive "ghost" flag). Build must reference them by their `~/.claude/hooks/` path.
2. **`sessionStart` prompt-hook in non-interactive mode.** The relevant-injection port (P2.2) uses a `sessionStart` prompt-type hook, but Copilot workers run non-interactive (`-p` / `--allow-all-tools`, confirmed in `03-copilot-hooks-help.verify.txt`). Prompt-type hooks may behave differently headless — P3 MUST validate that `sessionStart` additionalContext actually injects on a headless dispatch, else fall back to a `command`-type hook or the existing DUTY_STACK prepend (which already works). Build-validation item, not a design flaw.

### P3 — Build (GATED: ULTRAAUDIT clearance + Rutvik GO per protected file)
1. Council builds to Claude-authored specs (2 cross-family seats per build ticket); staged copies + battery proof before any apply.
2. Efficacy floor: LCD_03/04/05/06 batteries green pre AND post every apply (the ULTRAAUDIT Phase 5.2 floor, verbatim discipline).

### P4 — Live-fire proof (LR-059 — no green without driving the real thing)
1. Every new gate driven with a VIOLATING input → observed deny/kill/refusal + telemetry row (`gate-fires.log`). A gate proven only by reading its source is not proven.
2. One real end-to-end council dispatch through the full new enforcement stack.

## Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| OWNER | delegation stack (repo + home), this plan | plans/pending/PLAN_COPILOT_HARNESS_PARITY_GAPS.md (final gap table amended into body at P1) | grep '## The Gap Register' plans/pending/PLAN_COPILOT_HARNESS_PARITY_GAPS.md |
| HUNTER | (none) | (none) | (none) |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |

## Acceptance criteria

- [ ] All 3 evidence runs accepted per P0 discipline (verify-run verdicts + ASK dispositions logged).
- [ ] Final gap table: every enumerated Claude surface has a PARITY/PARTIAL/ABSENT/COVERED-BY(plan) verdict — zero unreviewed rows.
- [ ] Every TOTAL-GAP row has a Claude-authored mechanism design with LR-069 Sev + ramp + chokepoint file.
- [ ] No double-coverage: each gap lands in exactly one plan (this one or a named existing one).
- [ ] Build phase untouched until ULTRAAUDIT clears + Rutvik GO logged per Tier-2 file.
- [ ] P4 live-fire evidence per built gate (violating input → observed deny + telemetry row).
- [ ] RS-1..RS-4 (P2.3b) built + live-fired: a dispatch with a skill-matching SCOPE but a stingy DOCTRINE is refused (RS-1); a worker build-write is denied until `relevant-ack.json` exists (RS-2); a REPORT lacking `## Skills Applied` bounces FABRICATED (RS-3); a dispatch payload without the greedy skill-DOCTRINE is denied at `delegation-gate` (RS-4).

## Pending decisions (Rutvik — one-liners)

1. **Build sequencing**: P3 waits for full ULTRAAUDIT completion (my recommendation — it audits the exact wrapper we'd splice), or you GO specific low-risk lots earlier?
2. **PATH-shim scope**: shim ALL worker shell commands (max parity, some latency) or only write-bearing/protected-path commands (lean)? Evidence from cphooks-probe decides feasibility; your call decides appetite.

## Handoff

Evidence workers running in background (3 dispatches, all CLARIFY-cleared). Next session (Opus): wake on returns → P0 reviews → P1 final table → P2 design → present to Rutvik. Build stays parked.
