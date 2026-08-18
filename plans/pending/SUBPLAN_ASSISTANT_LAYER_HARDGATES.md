# SUBPLAN — Assistant Layer HARD GATES: make every owner-ask enforced, not remembered

**Status**: Pending
**Priority**: P0-EMERGENCY
**Created**: 2026-07-13
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: tamper-proof control-plane design + cross-family adversarial gate audit + multi-rule (LR-069/LR-070) judgment at every gate = LR-041 max-tier trigger.
**PermissionMode**: auto
**Identity**: OWNER
**Parent**: PLAN_ASSISTANT_LAYER.md
**Depends on**: PLAN_ASSISTANT_LAYER.md (this hardens its soft asks into forcing functions; does not replace it)
**BrowserTool**: none (build/E2E legs drive the worker CLI, not a Claude browser session)

**Repo landing name**: `plans/pending/SUBPLAN_ASSISTANT_LAYER_HARDGATES.md` — git-excluded BEFORE write (verified 2026-07-13 via `git check-ignore`; `.git/info/exclude` entry added). Secrecy contract of the parent applies verbatim: ZERO vendor strings in any tracked file; all runtime artifacts live in `~/.claude/`, `~/.copilot/`, or git-excluded repo paths.

---

> **Execution note (2026-07-16)**: `SUBPLAN_LCD_02_ENFORCEMENT_HOLES.md` (DONE 2026-07-16) already wired the `/assistants` switch behavior via gate v5 (8/8 live probes). The G1 grant-broker built by this subplan must NOT re-gate the same switch path — wire G1 to complement gate v5, not replace it.

## Context — why this subplan exists (the origin sin)

The `/assistants` switch was **theater for ~2 days**. Source-proven 2026-07-13: `/assistants on|off` writes only `~/.claude/delegation/assistant-state.json`; the SOLE consumer is `delegation-primer.mjs` (SessionStart), which reads it *only to pick a printed reminder string*. No PreToolUse/Stop hook enforces assistant mode. The SKILL.md itself states OFF is *"byte-identical on flow"* — the smoking gun that ON/OFF change nothing mechanical. It rode ON changing nothing.

The parent plan (`PLAN_ASSISTANT_LAYER.md`) is directionally correct but its enforcement is **SOFT PROSE**: only two real hooks have teeth today (`delegation-gate.mjs` = Claude source-write deny; `ua-worker-guard.mjs` = unjustified Agent-spawn deny). Everything the owner actually asked for — delegate-by-default, rival fights, interrogate-every-hop, pre-exec audit, guilty-until-proven, closure-never-stops, all-agent scope, machine isolation — is prose Claude can skip. The owner's demand (2026-07-13, verbatim): *"hard as fuck gates for everything that needs them to function without my asswhoops."*

This subplan converts those soft asks into **tamper-proof forcing functions**, honoring the owner's simplicity governor: *"why cant we just teach claude to just delegate and be lazy from the start itself, only doing things on its own when the /innovation skill is invoked… why are we patching this shit up?"* — so the core is ONE primitive (the task envelope), not a sprawl of patches.

### Provenance — how this spec was produced (the council DID fight)

1. **First fight (gate-design, blind gpt-5.5 × opus-4.6):** both converged VERDICT=HOLES on the same 3 S0 killers of a naive design — `STATE-ARTIFACT-FORGE`, `CLASSIFIER-BYPASS`, `BINDING-TOCTOU-REPLAY`. This proved the **tamper-proof principle** now baked into every gate below.
2. **Second fight (this plan's gap-audit, blind gpt-5.5 × opus-4.6, run-ids `fight-gapaudit-{gpt,opus}-0713`):** both audited the parent plan against the owner's asks-ledger A–N. Both converged, independently, on the SAME architecture (≈5 gates over ONE envelope) AND the SAME over-patch warning. Opus additionally caught the **config-liveness** meta-gap (G0 below) — the structural antidote to the dead flag that started this. No contradiction between seats → Claude adjudicated directly (no tiebreaker round; credits conserved). Both seat reports on disk: `.claude/state/ua-worker/fight-gapaudit-{gpt,opus}-0713/result.md`.

---

## The tamper-proof principle (converged S0 — the law every gate obeys)

**A hard-gate the controlled assistant can itself forge / flip / self-attest around is theater.** Concretely, the assistant could `Bash`-write a fake `converged:true` artifact, flip the mode file off, or emit a self-authored `[I0-TRIVIAL]` tag to skip the gate. Therefore EVERY gate below has five mandatory properties:

- **TP-1 Protected, non-self-authorable state.** Gate state/config/artifacts live where the assistant's own tools cannot write them. Only the hook process (and a verified fight/envelope runtime) may mint or consume them. Arbitrary `Bash`/`Write`/`Edit`/`powershell`/`apply_patch` **touching gate state denies**.
- **TP-2 Deterministic DEFAULT-DENY for unknown mutating actions.** Allowlist the deterministically-trivial (read-only probes, doc-only edits); NEVER blocklist the heavy. Unknown/mutating Bash and any worker dispatch lacking trusted low-risk metadata = weight-worthy by default.
- **TP-3 Full task-envelope binding.** Approval binds to `{session_id, user_turn, git_head/base, pathset, tool_intent_sha, work_type, mode}` — hook-derived, NEVER caller-supplied — and is **consumed/invalidated on scope change** (defeats TOCTOU-replay: a fight for "fix auth" cannot license a later "rewrite auth+routing+tests").
- **TP-4 Whole-tool-surface coverage.** Every mutation/dispatch tool this runtime exposes: `Bash | Edit | Write | apply_patch | powershell | Task | Agent | MCP-write | gh | curl | copilot-worker dispatch`. A gate that checks `Bash|Edit|Write` only is bypassed via `Task`/`powershell`/`apply_patch`.
- **TP-5 Self-authored tags never count.** `[I0-TRIVIAL]`, `converged:true`, `handoff-ok` emitted by the model are LOGGED, never TRUSTED. An I0 escape is honored only when a deterministic classifier (tool/path/diff/work-type against a strict allowlist) agrees, else user override is required.

---

## The approval-authority model — recursive delegation of approval (Rutvik 2026-07-13, LOCKED)

Today Rutvik holds one power over Claude: when Claude wants to touch a protected file or go out of repo, Claude **asks** and Rutvik critically decides. **That same power now flows down one level** — the assistants (and their subagents) hold that relationship to Claude: they **ask**, Claude critically **approves** *"only if not fucked up in any way or form."* This is what unblocks the two things Claude structurally could NOT delegate before: **(1)** protected-file / self-modification edits, **(2)** out-of-repo access. Claude becomes the approver, never the doer.

**But the power stops at the safety layer (Rutvik decision 2026-07-13 — "everything EXCEPT the safety layer").** Two tiers of protected:

- **Tier 1 — ordinary protected + out-of-repo (Claude-approvable).** Operational control-plane that shapes behavior but is NOT the enforcement/privacy wall: `routing-policy.json`, `scorecard.mjs`, `DUTY_STACK.md`, `worker-ext.md`, `copilot-worker.sh`, worker/agent profiles, out-of-repo reads (Jira, `--add-dir`, `--allow-url`). Assistant/subagent **REQUESTS** → Claude critically checks → Claude mints a **scoped grant** → the gate allows.
- **Tier 2 — the safety layer itself (Rutvik-only, ALWAYS — even for Claude).** The permission/privacy/enforcement core: every gate hook (`check-*.mjs`, `delegation-gate`, `ua-worker-guard`), `settings.json` (hook wiring), the grant-broker/approval logic, the isolation/privacy perimeter + its manifest, the gate mode-knob configs, `config.json` kill-switch, `config-liveness-registry`. Neither an assistant NOR Claude may self-approve these — they require Rutvik's direct in-chat GO + SELF_GRANT. Preserves the invariant the whole layer exists for: **Claude cannot silently weaken its own enforcement — and cannot launder that through an assistant.**

**G1b — the grant-broker (new component, itself Tier 2, built under Rutvik GO).** A request→approve channel: an assistant/subagent emits a structured REQUEST `{target, action, scope, why}`; Claude critically checks and — for a **Tier-1** target — mints the scoped grant the gates already consume; for a **Tier-2** target the broker CANNOT mint → it escalates to Rutvik. **Secure-by-default:** every protected path is Tier-2 until the broker's Tier-1 allowlist explicitly opens it (so the running G0/G1 build, which defaults everything to strict, is forward-compatible — the broker only ever RELAXES a known subset). Out-of-repo grants stay subject to the **G3 isolation perimeter** — an approval can NEVER authorize a bleed to the personal machine or an account-bound surface (the "most important ask" is not brokerable away).

**Depth-2 chain:** subagent → assistant → Claude. A subagent's request bubbles through its assistant to Claude; Claude is terminal approver for all Tier-1; Rutvik is terminal for all Tier-2. No deeper nesting. The Tier-1/Tier-2 file partition above is the proposed default — the exact per-file mapping is surfaced to Rutvik at broker-build time for confirmation.

---

## The converged asks-ledger → gate map (what each owner-ask gets)

| Ask | What the owner wanted | Today | Verdict | Lands in |
|---|---|---|---|---|
| **A** | assistant mode ON must *change behavior* | dead flag | SOFT→HARD | **G1** (+G0 liveness) |
| **B** | rival-fight every weight-worthy task | prose + decision-log | SOFT→HARD | **G2** |
| **C** | interrogate every hop, pre-written traps | prose | SOFT→HARD | **G2** |
| **D** | 2nd-pass /slop+ultrathink before execute | prose | SOFT→HARD | **G2** |
| **E** | guilty-until-proven-right for plan changes | prose | SOFT→HARD | **G2** |
| **F** | one-liner comms after execution | behavioral | **prose-ok** (both seats) | — (text-policing = over-patch) |
| **G** | closure never stops; auto-run unasked | Stop-hook WARNS only | SOFT→HARD | **G5** |
| **H** | isolation contract ("most important ask") | verified once | SOFT→HARD | **G3** |
| **I** | give council every grantable arm | partial (Jira read-only) | SOFT→HARD (dispatch-time) | **G4** |
| **J** | ALL-AGENTS scope, not just Claude | Claude-side only | MISSING→HARD | **G1+G4** |
| **K** | default-delegate-be-lazy; /innovation sole exception | not the enforced model | SOFT→HARD | **G1** (THE core) |
| **L** | copilot council can use Claude skills (/execute) | no Skill tool | MISSING→HARD | **G4** (skill-proxy) |
| **M** | lightning-fast low-friction delegation | file-tax | **prose/telemetry-ok** (both seats) | — (latency gate slows what it protects) |
| **N** | lesson-capture for ALL agents | partial | SOFT→HARD | **G5** |
| **O** | tamper-proof / no-leak control state *(seat-added, both found)* | partial | MISSING→HARD | **TP-1 across all + G3** |
| **P** | untrusted external content = hostile *(seat-added, both found)* | templates only | SOFT→HARD | **G4** (untrusted-content flag) |
| **S** | config-liveness — no cosmetic mode flag *(Opus-added)* | none | MISSING→HARD | **G0** (the dead-flag antidote) |
| keep-alive/compaction cost *(Opus P/Q)* | reuse context, budget per goal | design/splice | **telemetry-first** | folded into G4 budget field |

**Over-patch verdict (simplicity governor K, both seats):** 18 asks → **6 load-bearing gates sharing ONE envelope primitive.** Do NOT build a gate per ask. Do NOT hard-gate F (one-liner prose) or M (speed). Do NOT run rival fights on true I0 trivial work.

---

## Bootstrap (executor session MUST do first, in order)

1. Read `.claude/skills/ultra-agents/worker-ext.md` END TO END (delegation doctrine).
2. Read the parent `plans/pending/PLAN_ASSISTANT_LAYER.md` END TO END (this hardens it; do not contradict its verified-facts §).
3. Read both council reports: `.claude/state/ua-worker/fight-gapaudit-{gpt,opus}-0713/result.md`, and the gate-design fight reports `.claude/state/ua-worker/fight-gatedesign-{gpt,opus}-0713/result.md`.
4. Read `.claude/rules/guardrail-policy.md` (LR-069 severity/ramp/bloat + LR-070 uplink) and `.claude/rules/plan-closure.md` (LR-055).
5. Read the two enforced hooks that already have teeth (the pattern to copy): `~/.claude/hooks/lib/` delegation-gate + ua-worker-guard, and their `settings.json` registrations.
6. Verify `git check-ignore plans/pending/SUBPLAN_ASSISTANT_LAYER_HARDGATES.md` = ignored.
7. **Protected-file law**: every gate below writes to a PROTECTED control file (`~/.claude/hooks/*`, `settings.json`, `config.json`, `copilot-worker.sh`, `worker-ext.md`). NONE may be built without Rutvik's explicit in-chat GO **per file** + a logged `SELF_GRANT` (reason ≥20 chars, ≤60 min) per `feedback_self_modification_needs_explicit_go`. Plan approval ≠ build authorization.

---

## Phase 0 — Dependency + reality gate (MANDATORY, before any build)

- **STALE-REALITY precheck (LR-020):** for EACH gate G0–G5, read live disk FIRST. Has a sibling plan or a landed implementation already built this? Any gate reality already satisfies → mark **ALREADY-DONE (skip)**; any assumption reality contradicts → **STALE flag** with evidence. No agent builds a gate whose current reality it did not just re-confirm.
- **Envelope-primitive probe (LR-059):** the whole design rests on a hook-owned, non-caller-supplied task envelope derivable in **≤200ms on the PreToolUse hot path** (both seats flagged `HOT-PATH` S2). Probe: can the hook derive `{session, turn, git_head, pathset, tool_intent_sha}` via O(1) bounded reads of a tiny precomputed state file (NO transcript scan, NO per-call hashing of large briefs) inside budget on Windows? Works → proceed. Fails → the envelope is precomputed by a cheap UserPromptSubmit/PostToolUse writer and the PreToolUse gate only READS it. Record outcome in the log-of-record.
- **Tool-surface enumeration (TP-4):** enumerate every mutation/dispatch tool the live runtime exposes; prove (with a test) no write/dispatch path bypasses the gate. A gap here = the whole layer is bypassable.

---

## Phase 1 — The gates (build order = criticality; each is tamper-proof per TP-1..5)

### G0 — Config-Liveness Guard (S1) — the dead-flag antidote *(Opus's unique catch, ask S)*
**Build FIRST — cheapest, highest-leverage, and it guards every other gate from becoming theater.**
- **Trigger:** any config/flag/mode change (`assistant-state.json`, `guardrail-config.json`, `assistant-fight-config.json`, any future toggle) + a periodic liveness audit at `/compile-learnings` cadence.
- **Deny logic:** a mode flag may not ship/flip unless a registered **executable assertion** proves ON enforces *different observable behavior* than OFF (e.g. "with mode=on a protected write DENIES; with mode=off it ALLOWS — both proven by a dry-run harness"). A flag with no liveness proof = **DENY the flag's introduction** (not the work).
- **Protected state:** `~/.claude/delegation/config-liveness-registry.json` — hook-owned; each entry `{flag, assert_cmd, on_behavior_sha, off_behavior_sha, last_proven}`.
- **Tool coverage:** config writes, skill-toggle writes, guardrail-config edits.
- **Ramp:** applies immediately to NEW gates (G1–G5 each register a liveness assertion at build); back-fills existing flags at first touch.
- **Why S1 not S0:** it prevents cosmetic flags, not irreversible damage; but it is the structural reason "ON was theater for 2 days" can never recur.

### G1 — The Delegation Envelope Gate (S0) — THE core *(asks A, K, J-claude-side; both seats' #1)*
- **Trigger:** PreToolUse on EVERY mutation/dispatch tool (TP-4 full surface).
- **Deny logic (DEFAULT-DENY, TP-2):** deny substantive self-work UNLESS one holds:
  (a) a hook-minted **delegate/chief envelope** binds THIS action to a real dispatch, OR
  (b) an owner-invoked **`/innovation` envelope** is active (the SOLE self-work exception — the owner's simplicity core), OR
  (c) the action matches a **tiny deterministic read-only/trivial allowlist** (reads, doc-only edits, searches).
  Unknown/mutating Bash, `git apply`, `node scripts/*.mjs`, worker dispatch without trusted `--work-type` → weight-worthy → deny (defeats `CLASSIFIER-BYPASS`).
- **Protected state (TP-1):** envelope store `~/.claude/state/task-envelopes/` — hook-written only; assistant `Bash`/`Write` touching it denies (defeats `STATE-ARTIFACT-FORGE`).
- **Binding (TP-3):** envelope bound to `{session, turn, git_head, pathset, tool_intent_sha}`, consumed on scope drift (defeats `BINDING-TOCTOU-REPLAY` + `SELF-I0-BYPASS`: self-authored `[I0]` never overrides a source/protected/mutating signal — TP-5).
- **Effect:** makes assistant-mode REAL (ask A), enforces default-delegate-be-lazy with /innovation as the only escape (ask K), and covers Claude's side of all-agents (ask J).

### G2 — The Weight-Worthy Council Gate (S0) — *(asks B, C, D, E; both seats' #2/#3)*
- **Trigger:** when G1 classifies an action weight-worthy (I1+), the envelope must carry the council receipts before the action proceeds.
- **Deny logic:** deny the weight-worthy mutation/dispatch unless the envelope contains ALL of:
  - **(B) cross-family convergence artifact** — two DIFFERENT-family rival run-ids + a converged result, each converged point citing the oracle/artifact that settled it (no evidence → rejected + auto-interrogate; hardened vs "The Consistency Illusion").
  - **(C) pre-read trap ledger** — trap questions timestamped BEFORE any worker result was read (defeats "read first, rationalize after").
  - **(D) pre-exec audit receipt** — `/slop` + `/ultrathink` verdict bound to the current plan/diff hash.
  - **(E) for plan/rule/control edits** — a guilty-until-proven-right unanimous reviewer verdict binding `old_hash → new_hash`; default = plan text stands.
  - **handoff binding (both seats' F6/F4):** the receipt names the selected executor + reconciled decision hash; the next delegation must match it (defeats "fight converges on plan A, execute plan B").
- **Protected state (TP-1):** hook-owned convergence/trap/audit ledgers; non-self-authorable; consumed on scope change.
- **Descendant token (both seats' F5/anti-deadlock):** a verified `fight_run_id` propagates to all child seat/reviewer tool calls; only fight-owned commands/paths are allowlisted during that run (a seat writing its trail must NOT deadlock on "no converged artifact yet").
- **Effect:** rival-fight + interrogate + pre-exec audit + guilty-until-proven become STRUCTURAL, not remembered.

### G3 — The Isolation / Secrecy Perimeter (S0) — *("most important ask" H + seat-added O)*
- **Trigger:** every file/network/config mutation, commit, ship, and dispatch grant.
- **Deny logic:** DEFAULT-DENY writes/commits/ship that (a) target synced/account-bound/personal-machine paths, (b) would leak gitignored assistant artifacts / vendor / control strings into TRACKED surfaces, or (c) lack account-switch parity. Known-bleed paths deny immediately; unknowns ramp.
- **Protected state:** `~/.claude/delegation/isolation-manifest.json` — allowed-root list + account-invariant snapshot + machine fingerprint + gitignore/forbidden-pattern oracle (reuses `scripts/verify-no-forbidden.mjs` per LR-049).
- **Tool coverage:** Bash/Edit/Write/apply_patch/powershell/git/ship/settings + MCP.
- **Effect:** nothing bleeds to the personal PC; personal→company account switch changes nothing behavioral (both parent decision-5 invariants become a STANDING gate, not a one-time verification).

### G4 — The All-Agent Wrapper Parity Gate (S1) — *(asks J, L, I, P, + budget Q)*
- **Trigger:** every worker/chief/subagent launch (via `copilot-worker.sh` / `Task` / `Agent`) + every worker-result accept.
- **Deny logic:** deny a raw agent launch OUTSIDE the envelope; every agent invocation must inherit `{duty-stack, tool-denylist, evidence-schema, nested-depth cap, cost cap}`. Deny result-accept on missing proof. **Skill-proxy (L):** skill-governed tickets must carry a methodology bundle compiled from the SKILL.md (workers can't invoke `/execute` directly — parity via proxy + evidence signatures). **Arms (I):** deny Claude self-research when a grantable worker limb exists but the ticket lacks the grant (or an explicit owner-disabled reason). **Untrusted-content (P):** external-content-consuming dispatches carry `UNTRUSTED-CONTENT: yes`; undisclosed consumption found on disk = auto-bounce. **Budget (Q):** each dispatch carries `--max-ai-credits` from a goal budget; warn at 70%, deny at 100%.
- **Protected state:** wrapper-owned per-run envelope + run ledger; skill-proxy registry keyed to SKILL.md hashes; arms/capability registry with read/write boundary.
- **Effect:** enforcement covers Claude + workers + subagents equally (ask J), council gets skill parity (L) and every grantable arm (I), hostile external content is contained (P), credits are leashed (Q).

### G5 — The Closure + Lesson-Capture Debt Gate (S1) — *(asks G, N)*
- **Trigger:** any opened goal mints closure-debt; checked at Stop / UserPromptSubmit / next PreToolUse.
- **Deny logic:** deny the NEXT prompt/tool/status-flip/accept until the debt clears — `/final-q` verdict + Receipt + a routed lesson (or explicit `none:<reason>`) recorded to the correct agent lane. Where the Stop hook cannot block (LR-060), the next PreToolUse enforces (converts detective → forcing).
- **Protected state:** `~/.claude/delegation/closure-debt.json` (goal → debt) + the A9 lesson-router ledger.
- **Effect:** closure never stops (ask G — *"never make me remind you each damn time"*); every agent's mistake is captured, not just workers' (ask N).

---

## Ramp reconciliation (LR-069 §3.3 vs the owner's "hard-gate NOW")

Both seats flagged `RAMP-CONFLICT` (S2): straight-to-deny risks a classifier false-positive hard-stopping all Edit/Write/Bash. The owner wants hard gates now; LR-069 says S1 lands announce-first. **Reconciliation (converged):** ship each gate **deny-capable** but gated behind a per-gate mode knob in `.claude/guardrail-config.json` (`off | announce | deny`, same shape as the proven `c6_mode`), with:
- a **tested kill switch** + **instant config dial-back** (one file edit flips deny→announce),
- a **preflight self-test** the gate runs on load (if its own classifier fails the self-test, it fails OPEN + logs, never wedges the session),
- **G0/G1/G3 (S0 core) MAY land directly at `deny`** with the kill switch as the safety valve (owner's explicit hard-gate directive = the recorded emergency-acceptance LR-069 §3.3.1 allows), while **G2/G4/G5 land `announce` first** and ramp to `deny` after the trip-rate calibrates with zero false fires. This gives the owner teeth on day one where it matters most, without a classifier bug bricking the repo.

Every gate's source header names its Sev class + this graduating incident (the 2-day dead flag), per LR-069 bloat-governor. Every deny/announce appends to `.claude/state/gate-fires.log` (closes the known-gap the guardrail-policy flags).

---

## Non-goals (slop-guard — cut deliberately, both seats agree)

One-liner-comms text policing (F — brittle over-patch) · latency/friction denial gate (M — slows the path it protects) · rival fights on true I0 trivial work · a gate per ask (18→6 is the point) · keep-alive/compaction as a hard gate (telemetry-first; gate only if reburn recurs) · new bespoke per-skill gates (generic skill-proxy covers it) · trusting ANY self-authored tag · duplicating the two hooks that already have teeth.

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |
| OWNER | protected control-plane hooks/config (all gate builds) | `~/.claude/hooks/lib/check-delegation-envelope.mjs`<br>`~/.claude/hooks/lib/check-weight-council.mjs`<br>`~/.claude/hooks/lib/check-isolation-perimeter.mjs`<br>`~/.claude/hooks/lib/check-agent-parity.mjs`<br>`~/.claude/hooks/lib/check-closure-debt.mjs`<br>`~/.claude/hooks/lib/check-config-liveness.mjs`<br>`~/.claude/delegation/config-liveness-registry.json` | each gate's registered liveness assertion (G0) passes ON≠OFF + `gate-fires.log` shows a real deny in the supervised E2E |

*(OWNER-only matrix: this subplan touches only the delegation control plane — no pipeline artifacts, per parent decision-5 machine/repo isolation. All pipeline-identity rows explicit `(none)` per LR-048.)*

---

## Acceptance criteria

- [ ] Phase 0 reality precheck done: each G0–G5 marked ALREADY-DONE / STALE / BUILD with live-disk evidence.
- [ ] Envelope-primitive probe passed (≤200ms O(1) hot path) OR fallback wired (precompute-then-read).
- [ ] Tool-surface enumeration proves NO mutation/dispatch tool bypasses the gate (TP-4).
- [ ] G0 config-liveness: assistant-state ON vs OFF proven to enforce *different* behavior by an executable assertion (the dead-flag can never recur).
- [ ] G1 delegation envelope: a forged `converged:true`/`[I0]` and a scope-expanded replay both DENY in a real test (TP-1/3/5).
- [ ] G2 council gate: a weight-worthy action with a missing/uncited convergence artifact DENIES; a genuine converged+trap+audit+handoff-bound envelope PASSES.
- [ ] G3 isolation: a write to a personal-machine/account-bound path AND a vendor-string leak into a tracked file both DENY; account-switch parity proven.
- [ ] G4 parity: a raw worker launch outside the envelope DENIES; skill-proxy + arms + untrusted-content + budget fields enforced on a real dispatch.
- [ ] G5 closure-debt: an attempt to start new work with open closure-debt DENIES until `/final-q`+Receipt+lesson clear it.
- [ ] Every gate: Sev header + liveness assertion + `gate-fires.log` append + kill-switch dial-back verified; S0 core at `deny`, G2/G4/G5 at `announce` with ramp criterion recorded.
- [ ] **Supervised E2E (LR-059, the real proof):** ONE real goal run fully gated — a genuine deny observed on each S0 gate — while Rutvik watches; then each protected splice re-verified to DENY without its SELF_GRANT.
- [ ] Secrecy sweep: zero new tracked vendor strings (`scripts/verify-no-forbidden.mjs` on a clean `git archive` extract).

## Handoff

Chat-only, oneliners per the owner comms contract. Build is BLOCKED on Rutvik's per-protected-file in-chat GO + SELF_GRANT (build order G0→G1→G3→G2→G4→G5). No gate lands without its liveness assertion (G0) and a real deny in the supervised E2E — a gate that never fires is theater, exactly what this subplan exists to end.
