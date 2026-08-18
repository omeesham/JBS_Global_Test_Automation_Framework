# Plan — Copilot CLI as Claude Code's free, unlimited "Jr. Worker" (via `/ultra-agents`)

> **LOCAL-ONLY / SECRET** — git-excluded via `.git/info/exclude`. Never tracked, never pushed, never shipped. Lives only on this PC. Do NOT add to `plans/INDEX.md` (tracked) or run `plans:reindex` against it.

> ## ⚠ STALENESS FLAG (2026-07-20, Rutvik-directed, verified against this file's own lines)
> The VISION prose below is superseded by the live doctrine (`worker-ext.md` **doctrine-version 2**). Do NOT execute any remaining un-executed prose as written. Verified stale anchors: `:7`/`:12` "Copilot is DUMB / read only always / Jr. Worker" vs worker-ext:11 (workers do the ENTIRE job, full 8-duty stack, edit-mode ticket default) · `:75-76` "Never delegate RCA" vs worker-ext:32 (RCA legwork is delegable) · `:96` `gpt-5.3-codex` in the model table vs the verified registry (NOT available on this account, hard CLI error 2026-07-09) · `:29` wave-machinery framing vs `/ultra-agents` = cap-booster only (worker-ext:213). The EXECUTED sections (Takeover v3, splices, registry) remain honest history. Formal supersession verdict lands in PLAN_COPILOT_INTEGRATION_ULTRAAUDIT Phase 1(c); the capability-gap successor is `plans/pending/PLAN_COPILOT_HARNESS_PARITY_GAPS.md`.

## Context

**Why:** The Claude Code subscription (Opus, this session) is quota-metered. GitHub Copilot CLI runs unlimited agents (Sonnet 4.6 / Opus 4.6 / GPT-5.3-Codex, etc.) but each model there is meaningfully *dumber* (Copilot's own system prompt measurably degrades any model — never trusted). The goal: let the main Opus session offload **well-defined, low-risk, easy-to-proofread grunt work** — above all **deep, in-depth reading/summarization to clear assumptions and save Opus context** — to a Copilot "Jr. Worker," while Opus stays the orchestrator and **audits everything that wasn't a pure read.**

**Primary purpose (user's words):** *"its to save context mainly"* and *"used to clear assumptions — we do not want a single agent on Claude Code to assume something to give answers fast."* This directly serves the SUPREME **NEVER-ASSUME** rule: instead of Opus guessing to save context, it sends a Copilot worker to read deeply and report back evidence.

**Hard constraints from the user:**
- **Copilot is DUMB — never assume competence.** *"read only always, edit when need, but heavily guarded prompts and audits mandatory for anything that was not just read."*
- **Reads must be DEEP** — *"make sure these agents go deep, that's why they're being used."*
- **Reuse + minimal + surgical** — *"don't do too much, reuse whatever is possible… minimal surgical approach."* → Extend the existing `/ultra-agents` skill; do not build a parallel apparatus.
- **Secret / local-only** — stays on this PC; never pushed even if the whole repo is pushed to prod. All Copilot-specific operational content lives in **git-untracked** files; the tracked footprint is one oblique pointer.
- **Opt-in only** — Copilot enters the picture *only* when `/ultra-agents` is invoked. Default behavior is unchanged.

**Verified facts (this session):**
- Copilot CLI headless mode is real and stable (GA Feb 2026): `copilot -p "<prompt>" -s --no-ask-user --model <id>` prints the agent's answer and exits. Flags `--allow-tool` / `--deny-tool` / `--add-dir` / `--log-dir` / `--output-format` confirmed against docs.github.com.
- Model IDs are **lowercase** (`claude-sonnet-4.6`, `claude-opus-4.6`, `gpt-5.3-codex`, `claude-haiku-4.5`); wrong-case silently falls back. Family aliases exist (`sonnet`/`opus`/`gpt`/`haiku`).
- **Current machine state:** `@github/copilot` is **NOT installed** (not in npm global, not on PATH). `pwsh` (PowerShell 7, required by Copilot CLI on Windows for its shell tool) is **absent** (only 5.1). `gh` IS installed + authed as `RutviK-JBS` (gives Copilot CLI a usable token). → **Phase 0 must install + verify before anything else.**
- The repo already has the exact orchestration precedent: `/chain` shells out to `nohup claude -p "/execute …" &` via `chain-orchestrator.sh`, with scratch under `.claude/state/` (gitignored). We mirror that pattern with `copilot -p`.
- Secrecy precedent: `.claude/skills/end-day/` + `end-week/` are gitignored skills that still work (discovery is filesystem-based, not git-based). We go one better with **`.git/info/exclude`** (local-only; never appears in any tracked file, so even the *names* don't leak).

---

## Recommended approach — surgical extension of `/ultra-agents`

The Copilot Jr. Worker is just **another worker type** plugged into `/ultra-agents`'s existing wave machinery (`fan out → dedup → completeness-critic → loop-until-dry → adversarially verify`). Maximum reuse, minimal new surface.

### Tracked change (minimal, oblique — the only thing git sees)
**`.claude/skills/ultra-agents/SKILL.md`** — add ≤3 lines in the worker section:
> *Local worker extension: before fanning out, if `.claude/skills/ultra-agents/worker-ext.md` exists on disk, Read it first — it may add machine-local worker-delegation options for this environment. Absent file = ignore.*

No mention of "copilot." Reveals nothing actionable if the repo is ever pushed.

### Local-only files (git-untracked via `.git/info/exclude` — never pushed, never shipped)
1. **`.claude/skills/ultra-agents/worker-ext.md`** — the Jr. Worker playbook (the brains): delegation gate, read-only-default rule, heavy-prompt rule for edits, mandatory-audit rule, model table, invocation reference, anti-assumption purpose. (Detailed below.)
2. **`.claude/skills/ultra-agents/copilot-worker.sh`** — thin (~40-line) deterministic invocation wrapper (below). Makes the *invocation itself* foolproof since the model is dumb.
3. **`.claude/state/ua-worker/<run-id>/`** — scratch per delegation: `task.md` (spec in), `result.md` (answer out), `err.txt`, `meta.json`.

### `.git/info/exclude` additions (local, invisible)
```
plans/pending/PLAN_ULTRA_AGENTS_COPILOT_WORKER.md
.claude/skills/ultra-agents/worker-ext.md
.claude/skills/ultra-agents/copilot-worker.sh
.claude/state/ua-worker/
```
(`.claude/state/*.json`/`*.log` are already ignored; the subdir needs an explicit line.)

### Optional: local memory pointer
One memory file in `~/.claude/…/memory/` (outside the repo → never pushed) so future sessions know the capability exists. Honors secrecy; aids recall.

---

## Phase 0 — Prerequisites (install + REAL smoke test, per LR-059)

1. `npm install -g @github/copilot` → confirm `copilot --version` resolves (restart shell / use full npm-global path if PATH is stale).
2. `winget install Microsoft.PowerShell` → `pwsh` available (needed for Copilot's shell tool in edit mode; harmless for read mode).
3. **Auth check:** Copilot CLI authenticates via the existing `gh` token or its own device-flow. Confirm a Copilot subscription is active on `RutviK-JBS`.
4. **Capture `copilot --help` verbatim** → confirm the EXACT control flags available on the installed version (permission/tool allow-deny, `--model`, any reasoning/effort flag, `--add-dir`, `--max-autopilot-continues`, `--log-dir`). Wire only verified flags — NEVER-ASSUME a flag exists.
5. **Smoke test (no "works" claim without this — LR-059):** `copilot -p "reply with exactly: READY" -s --no-ask-user --model claude-sonnet-4.6` must return `READY`. If it errors (no subscription / model unavailable), STOP and report — do not build on an unverified CLI.

---

## The Jr. Worker playbook (`worker-ext.md` content)

### Delegation gate — what Copilot may receive
**✅ Delegate (suits a dumb-but-tireless worker, cheaply verifiable):**
- **Deep reading + summarization** (PRIMARY): read a file/dir/subsystem *in depth* and return structured evidence so Opus doesn't assume. Go deep — depth is the whole point.
- Repo-wide search/trace sweeps ("find every place X is referenced/used/configured").
- Boilerplate / test-data generation from a precise spec *(edit mode — audited)*.
- Mechanical refactors verifiable by `tsc`/build *(edit mode — audited)*.

**❌ Never delegate (keep on Opus):**
- RCA / debugging / hypothesis (Copilot is dumber than Sonnet, which the repo already HALT-bars from these).
- Architecture / design / judgment / "decide what to build."
- Anything not verifiable in O(seconds) without redoing the work.
- Browser / MCP interaction.

### Read-only is the default; edits are gated
- **Read mode (default):** worker only reads/searches/summarizes/drafts. Opus makes every real file change. Invoked with mutation tools **denied** and cwd confined.
- **Edit mode (only when needed):** requires a **heavily guarded prompt** (self-contained, exact file paths, the precise transformation — not a goal, an output schema, explicit success criteria, "return ONLY …", constraints, an example). Vague prompt = forbidden. Every edit is **mandatorily audited** by Opus before acceptance (see below).

### Heavy-prompt contract (mandatory for any non-read task)
Per weak-model best practice: the worker must never need to ask a clarifying question (`--no-ask-user` is always on). Opus embeds *all* context. If Opus can't write a fully self-contained spec, the task isn't delegable — Opus does it.

### Verification / audit protocol (anti-slop core — reuses ultra-agents' "adversarially verify")
- **Read outputs** → treated as **evidence to verify, not fact.** Opus anchor-checks ≥1 specific claim against the real source before propagating. Never quote a Copilot summary as truth unverified.
- **Edit outputs** → **MANDATORY hard audit:** `git diff` the change, run `npx tsc --noEmit` (baseline-compare) + relevant build/lint/tests, Opus reads the full diff. Always diff against the original (weak models corrupt ~25% over iterative edits — DELEGATE-52). Max **2 repair rounds**, then Opus takes the task over. Never accept an unaudited edit.

### Model table (lowercase IDs)
| Task | Model |
|---|---|
| General deep reads / summaries / sweeps (default) | `claude-sonnet-4.6` |
| Pure code generation / mechanical refactor | `gpt-5.3-codex` |
| Cheap high-volume bulk reads | `claude-haiku-4.5` |
| Harder-but-still-verifiable | `claude-opus-4.6` |

### Fan-out (capped per model)
Multiple workers run in parallel (each its own `<run-id>` dir) via the existing wave pattern. Per-model parallel ceilings: **opus ≤5, sonnet ≤10, codex ≤10, haiku unlimited** (resource/rate sanity still applies). "As many as needed, never more." Opus dedups + runs the completeness-critic + loop-until-dry, then verifies per above.

---

## Invocation wrapper (`copilot-worker.sh`) — behavior spec

Inputs: `--task <file>` (the spec), `--mode read|edit`, `--model <id>`, `--run-id <id>`. Behavior:
- Builds: `copilot -p "$(cat task)" -s --no-ask-user --model <id> --add-dir <repo> --log-dir <run-dir>`
  - **read mode:** append mutation-tool denies (e.g. `--deny-tool 'write' --deny-tool 'shell'`) — worker can read/search but not change anything.
  - **edit mode:** scoped allows (e.g. `--allow-tool 'write' --allow-tool 'shell(npm:*)'`), cwd confined to repo.
- Captures stdout → `result.md`, stderr → `err.txt`.
- **Windows-safe:** invoke `copilot` directly from Git Bash (NOT PowerShell `Start-Process` — known stdout-capture bug #2525). Wrap in a `timeout` so a hung worker never blocks.
- Exit signal: success = exit 0 **AND** non-empty `result.md` (Copilot exit codes are under-documented — check both). Writes `meta.json` `{run_id, mode, model, exit, ok}`.

---

## Guardrails & controls — every run mirrors Claude Code's (enforced at the CLI/wrapper layer, NOT by trusting the dumb worker)

| Claude Code control | Copilot Jr. Worker equivalent | Enforced by |
|---|---|---|
| **Plan / read-only mode** | **read mode = hard sandbox:** mutation tools denied (`--deny-tool 'write'`, `--deny-tool 'shell'`, …), no `--allow-all-paths`, cwd confined via `--add-dir <repo>`. Worker *structurally cannot* mutate — stronger than plan mode (tool-layer, not prompt-layer). | wrapper `--mode read` (default) |
| **Permission mode** | edit mode = **scoped** allows only (`--allow-tool 'write'`, `--allow-tool 'shell(npm:*)'`); never `--allow-all`/`--yolo`; `--no-ask-user` always on (no unattended hang) | wrapper `--mode edit` |
| **Model selection** | `--model <lowercase-id>` per the model table; wrong-case silently falls back, so always pin | wrapper `--model` (default `claude-sonnet-4.6`) |
| **Max thinking / effort** | Phase 0 step 4 confirms whether the CLI exposes a reasoning/effort flag. If yes → wrapper `--effort`; if no → **model choice IS the effort lever** (codex/opus harder, haiku bulk). No assumption either way. | wrapper `--effort` (TBD Phase 0) |
| **Concurrency cap** | per-model parallel ceilings: **opus ≤5, sonnet ≤10, codex ≤10, haiku unlimited** (resource/rate sanity still applies) | wrapper `--max-parallel` + orchestrator discipline |
| **Hang guard** (not a usage cap) | single-turn `-p` (no autopilot); each run wrapped in `timeout` so a stuck/no-output worker is killed + reported, never blocks the orchestrator | wrapper |
| **Audit trail** | per-run `--log-dir` + a local ledger row `{run-id, mode, model, parallel, exit, accepted?}` | wrapper → `.claude/state/ua-worker/ledger.jsonl` |

**No extra caps:** beyond the per-model parallel ceilings above, Copilot usage is unthrottled. If GitHub emits its own weekly-usage warnings on stderr, the wrapper just surfaces them for visibility — it does not self-limit.

---

## Chain Skill v2 (the pasted P2P-58 plan) — decision: **SKIP the port**

**One-line answer — ours vs theirs:**
> **Ours:** each plan runs in its *own separate background Claude session* (like opening a fresh terminal per plan); a Stop-hook watchman reads each one's pass/fail and launches the next — you can close the laptop and it keeps going. **Theirs:** *one* open session runs the plans one-by-one as inline helper calls — if that session ends, the chain dies, and all plans share one context.
>
> **Example — "run plans A, B, C":** Ours spawns 3 independent background sessions in turn (A done → watchman spawns B → B done → spawns C), each a clean slate. Theirs does A→B→C as subagent calls inside your single open conversation, carrying accumulated context, dying if you close it.

**Which is more advanced (execution quality + guarantees):** **Ours.** Clean full context per plan (no bleed/compaction drift) + survives session death are the two biggest drivers of correct, finished multi-plan runs — both ours. Theirs is *simpler* and has one nicer detail (atomic commit-or-nothing framing). Their "v2 fixes" (no commit step, no INDEX upkeep on `git mv`, prose-only "isolation", counter conflict, missing recursion guard) are problems **our chain already solved**: commits + INDEX reindex + activity log happen inside each spawned `/execute` (Phase 3.5); isolation is *real* (separate processes); no counter conflict because chain doesn't run `/execute` inline. **Porting theirs would be a regression** (loses background-session isolation) and would collide with our separate `/chain_audit` pass (+ AUD-017 no-self-grade). → **No changes to `/chain`.**

**Optional cherry-picks** (only genuinely-better bits, if wanted): theirs' (a) atomic commit-or-nothing per plan, (b) optional inline auditor. Everything else = downgrade.

**Notification gap (out of scope unless requested):** our `/chain` is **pull-based** — on YELLOW/RED it writes `PAUSE_NOTICE.md`; the user checks via `/chain status`. No active desktop/sound/phone ping today. Takeover flow: fix → `/chain resume` (continues from next in queue) or `/chain skip` then `/chain resume`. A real "ping me on pause/finish" is a small optional add.

---

## Files to create / modify
| Path | Tracked? | Change |
|---|---|---|
| `.claude/skills/ultra-agents/SKILL.md` | tracked | +≤3 oblique lines (local-worker-extension pointer) |
| `.claude/skills/ultra-agents/worker-ext.md` | **local-only** | NEW — Jr. Worker playbook |
| `.claude/skills/ultra-agents/copilot-worker.sh` | **local-only** | NEW — invocation wrapper |
| `.git/info/exclude` | local (never tracked) | +4 ignore lines (incl. this plan) |
| `.claude/state/ua-worker/` | local-only | scratch dir (runtime) |
| `plans/pending/PLAN_ULTRA_AGENTS_COPILOT_WORKER.md` | **local-only** | this plan (git-excluded) |
| `~/…/memory/…copilot_jr_worker.md` | outside repo | OPTIONAL recall pointer |
| `/chain` | — | **no change** (decision above) |

---

## Verification (acceptance)
1. **Prereqs (LR-059):** `copilot -p "reply READY" -s --no-ask-user --model claude-sonnet-4.6` → `READY`.
2. **Secrecy:** `git status --porcelain` shows **only** the `SKILL.md` edit; `git check-ignore -v` returns a `.git/info/exclude` hit for the plan + both skill files; `git add -A && git status` stages none of the local-only files (then unstage).
3. **Read-mode E2E:** `/ultra-agents` → delegate a deep read of a real file (e.g. a long SKILL.md) → worker returns a structured summary → Opus anchor-verifies one claim against the source. Confirms context-saving works and the audit step fires.
4. **Edit-mode E2E (guarded):** delegate one trivial, fully-specified mechanical edit → Opus `git diff` + `tsc` audit → accept only if clean; demonstrate the 2-repair-then-take-over path.
5. **Opt-in proof:** with `/ultra-agents` NOT invoked, nothing calls `copilot` — default behavior unchanged.

## Risks & mitigations
- **Stale PATH after install** → wrapper resolves the npm-global path explicitly; Phase 0 verifies before use.
- **No Copilot subscription / model unavailable** → Phase 0 smoke test STOPS the build (no silent failure).
- **Dumb-worker slop** → read-only default + heavy-prompt contract + mandatory diff/tsc audit + max-2-repair + always-diff (DELEGATE-52).
- **Secret leak** → all Copilot specifics + this plan in `.git/info/exclude`; tracked footprint is one non-naming pointer; `.claude/` never ships to clients via `git archive`.
- **Unattended hang** → `--no-ask-user` always on + `timeout` wrapper.

---

## Phase 0 Execution Log — 2026-06-22 (INSTALLED, then BLOCKED on account policy)

**STATUS: DONE (2026-06-22)** — CLI access restored; built + verified end-to-end. See `## Execution Summary` at the bottom.

**Done (verified):**
- `@github/copilot` **v1.0.63** installed globally → resolves at `~/AppData/Roaming/npm/copilot` (on PATH).
- PowerShell 7 installed via winget (exit 0). PATH refresh pending in-session; verify in a fresh shell with `pwsh --version`. Non-blocking — only needed for edit-mode shell tool.

**Verified real flags (`copilot --help`, v1.0.63 — wire THESE, no assumptions):**
- Headless: `-p/--prompt "<text>"` + `-s/--silent`. `--allow-all-tools` is **required** for non-interactive mode (or a tool allowlist). `--no-ask-user` for full autonomy.
- Effort: `--effort/--reasoning-effort none|low|medium|high|xhigh|max` ← the "max think" lever is REAL.
- Mode: `--mode interactive|plan|autopilot` (+ `--plan` shorthand). **`plan` mode = won't apply edits** — clean built-in for read/research delegation.
- Tools: `--allow-tool[=…]`, `--deny-tool[=…]` (deny wins), `--available-tools[=…]` (allowlist), `--excluded-tools[=…]`.
- Dir confinement: `--add-dir <dir>` (repeatable), `-C <dir>` (cwd), `--disallow-temp-dir`.
- Misc: `--model <id>`/`auto`, `--output-format text|json` (JSONL), `--log-dir`, `--log-level`, `--context default|long_context`, `--share[=path]`, `--secret-env-vars=…`, `--no-remote`, `--no-color`.

**Grounded command templates (use at build time):**
- **read mode** (non-mutating): `copilot -p "<spec>" -s --no-ask-user --model <id> --effort <lvl> -C <repo> --add-dir <repo> --allow-all-tools --deny-tool 'write' --deny-tool 'shell' --no-remote --no-color --log-dir <run>` — VERIFY exact mutating-tool names at build; fallback = `--available-tools` read/search allowlist, or `--mode plan` (won't apply edits).
- **edit mode** (Opus-audited): `copilot -p "<heavy spec>" -s --no-ask-user --model <id> --effort <lvl> -C <repo> --add-dir <repo> --allow-all-tools --no-remote --log-dir <run>` → Opus diffs + `tsc`/build/lint before accept.

**BLOCKER (2026-06-22):** smoke test with `--model claude-sonnet-4.6` AND `--model auto` → `Error: Access denied by policy settings`. Account `RutviK-JBS` authenticates (`gh api user` OK) but Copilot CLI is policy-blocked (org restriction / plan excludes CLI / admin policy off). Resolve at https://github.com/settings/copilot, or JBS admin enables the "Copilot CLI" policy, or `copilot login` to a personal-Copilot account. **Re-run smoke test; `READY` → build tasks #5–13.**

---

## Execution Summary — DONE 2026-06-22

**Built (all local-only / git-excluded except the pointer):**
- `.claude/skills/ultra-agents/copilot-worker.sh` — deterministic, Windows-safe invocation wrapper (read/edit modes, per-run dir, exit+non-empty check, `timeout`, `meta.json` + `ledger.jsonl`).
- `.claude/skills/ultra-agents/worker-ext.md` — the Jr. Worker playbook (gate, read-default, heavy-prompt contract, audit protocol, model table, caps, guardrail parity).
- `.claude/skills/ultra-agents/SKILL.md` — **only tracked change**: +5-line oblique "Local worker extension" pointer (no "copilot" string).
- `.git/info/exclude` — 4 local-only paths (this plan + 2 skill files + `.claude/state/ua-worker/`).

**Verification evidence (LR-059 — real CLI driven end-to-end):**
- **G1 smoke** — `copilot -p "reply READY" … --model auto` → `READY`, exit 0.
- **G2 structural read-only** (differential, isolates sandbox from content-refusal): read mode + benign write → file absent, worker: `BLOCKED: 'create' tool denied by 'write' permission rule`; edit mode + same write → `CREATED` (file present, correct contents). Deny-precedence sandbox proven.
- **G3 wrapper** — exit codes, per-run dirs, result path return, ledger, timeout all exercised.
- **G4 deep-read E2E anchor-verified** — worker listed LR headings of `.claude/rules/pipeline.md`: **11 returned = 11 by `grep -c '^## LR-'`**, all titles exact, incl. LR-048/049 deep in the file (proves full read, not skim). Verified in seconds via grep.
- **G5 secrecy** — `git status` shows ONLY `SKILL.md`; `git check-ignore` confirms plan + both skill files ignored.
- **G6 pointer** — `git diff` = +5 additive lines, zero removals, zero "copilot".

**Model confirmed:** `claude-sonnet-4.6` valid on this account (no fallback warning in err.txt).

**Deliberate deviations (local-only meta plan — justified, not slop):**
- No `git mv` to `done/` + no `npm run plans:reindex` — plan is git-excluded; reindex would leak its name into tracked `INDEX.md`. → Status DONE marked in-place.
- No LR-028 activity-log row — touches `.claude/skills/*` + `.git/info/exclude`, none of which are pipeline artifacts (specs/POMs/selectors/test-data/cases/plans). Trigger not met.
- No `validate-plan-closure.mjs` — designed for tracked pipeline plans.

**Known caveats (honest, non-blocking):**
- **pwsh for edit-mode shell**: PowerShell 7 installed (winget exit 0) but not confirmed on PATH in-session. Read mode + edit-mode *file writes* need no pwsh (verified). Edit-mode *shell commands* (e.g. `npm`) on Windows may need pwsh on PATH — verify on first such use.
- **Per-model availability**: only `claude-sonnet-4.6` smoke-verified. `gpt-5.3-codex` / `claude-opus-4.6` / `claude-haiku-4.5` unverified on this account; the wrapper surfaces any fallback warning via `err.txt` on first use.

**How to use:** invoke `/ultra-agents` → it reads `worker-ext.md` → delegate deep reads (default) or guarded+audited edits to free Copilot workers via `copilot-worker.sh`. Opus verifies every non-read output. Opt-in only; default behavior unchanged when `/ultra-agents` is not invoked.

---

## Council (v2) — Execution Summary — DONE 2026-06-22

Cross-brand adversarial council on top of the Jr. Worker. **Claude = orchestrator + final gate only;** Copilot Opus 4.6 drafts → GPT-5.5 (different vendor) adversarially reviews → loop to consensus → Claude gates once.

**Settings confirmed (from user's GitHub Copilot Business page):** "No usage limit"; CLI enabled. Panel = `claude-opus-4.6`, `gpt-5.5`, `claude-sonnet-4.6` — all verified valid (no fallback). Dropped Haiku/Gemini/GPT-5-mini (too old/weak); `gpt-5.3-codex` **not enabled at all** (v1 table bug — fixed).

**Built:**
- `~/.copilot/agents/council-planner.agent.md` (opus-4.6 rigorous drafter) + `council-reviewer.agent.md` (gpt-5.5 adversarial, emits `VERDICT:` line) — **OUTSIDE the repo** (home dir, never pushed).
- `.claude/skills/ultra-agents/copilot-worker.sh` — added `--agent` passthrough; when set, keeps custom-instructions ON (priming loads) + lets agent's pinned model win unless `--model` explicit; meta/ledger record `agent`. `bash -n` clean.
- `.claude/skills/ultra-agents/worker-ext.md` — model table → 3-model panel; added `## Council mode` (loop, who-commits, convergence cap = 3 rounds, caps opus≤5/gpt-5.5≤5/sonnet≤10).
- `SKILL.md` pointer — unchanged (still the only tracked footprint).

**Verification (real CLI end-to-end, LR-059):**
- Priming loads — `--agent council-reviewer` on a buggy `add()` → `[SEVERITY: blocker] … VERDICT: MATERIAL_ISSUES`.
- **Full council E2E** producing a real `parse_verdict` helper: Opus draft → GPT-5.5 caught a spec-compliance slip (`MATERIAL_ISSUES`) → Opus revised → GPT-5.5 `NO_MATERIAL_ISSUES` (consensus, round 2) → **Claude final gate ran it → 5/5 tests pass → ACCEPT**. The cross-brand catch (GPT caught a Claude-family slip) is the whole thesis, proven.
- Secrecy — git sees only the pre-existing v1 `SKILL.md` line; agents outside repo; worker files git-excluded; ledger has the full 4-call council trail.

**Deviations (same as v1, justified):** local-only meta plan — no `git mv`/reindex/activity-log (would leak into tracked INDEX / not pipeline artifacts).

---

## Audit 2026-07-06 — drift check (user-triggered) + remediation R1–R6

**Trigger:** Rutvik asked a fresh session "does /ultra-agents enforce copilot?" → it flatly denied (cited the stale pipeline-era memory). Full-chain /audit verdict: 🟡 YELLOW — no slop (§SLOP PASS, 0 DROP), secrecy intact, council E2E real, but 3 gaps:
- **F1 (drift)**: SKILL.md pointer fired only "Before fanning out" → an inline-handled critical artifact silently skipped the council (blind clean-context probe confirmed).
- **F2 (missing item)**: v1's optional memory pointer was never created → fresh sessions denied the capability in Q&A.
- **F3 (claim discipline)**: "runs automatically" was claimed before any fresh-session invocation was driven (LR-059).

**Fixes landed 2026-07-06:**
- **R1 DONE** — SKILL.md pointer now "load on EVERY invocation / FIRST ACTION" (still oblique; `grep -ci copilot` = 0; only tracked mutation).
- **R2 DONE** — memory scope note in `feedback_copilot_vs_claude_code.md` + MEMORY.md index line now points fresh sessions at worker-ext.md before answering delegation questions.
- **R4 DONE** — worker-ext.md: "Critical artifact ⇒ council — 'inline for trivial' never exempts a critical artifact."
- **R6a DONE** — worker-ext.md: mandatory `Delegation receipt` block (ledger run_ids + Claude-spawn count + per-spawn justification) in every /ultra-agents goal summary.
- **R6b DONE (user said "GO")** — `~/.claude/hooks/ua-worker-guard.mjs` built + registered as a user-level PreToolUse hook on the `Agent` tool matcher (`~/.claude/settings.json`), both outside the repo. Logic: DENY a Claude `Agent` spawn iff (a) `<cwd>/.claude/skills/ultra-agents/worker-ext.md` exists on disk AND (b) the session transcript shows a `Skill` tool_use with `input.skill === "ultra-agents"` — unless the Agent prompt carries `[UA-SPAWN-JUSTIFIED: <reason>]`. Fail-open on internal errors. Live-tested 4/4 real outcomes via direct stdin invocation: inactive-transcript→ALLOW, active+no-token→**DENY** (exact reason string emitted), active+token→ALLOW ("UA-SPAWN-JUSTIFIED token present"), other-project-no-worker-ext→ALLOW (confirms harmless no-op everywhere else on the machine). Secrecy re-checked post-build: `git status` shows only the pre-existing unrelated `.claude/settings.local.json` diff (an Excel-read PowerShell allow-entry from an earlier session, 0 copilot/ultra-agents/ua-worker string hits) + the same `SKILL.md` line — nothing new leaked into tracked files.
- **Effort-floor directive (2026-07-06)** — user: "minimum extra high OR max, no high ever." Wrapper default `EFFORT` changed `high`→`xhigh` (`copilot-worker.sh:22`); `worker-ext.md` "Effort lever" section rewritten to a hard floor (xhigh/max only, none/low/medium/high banned even for "shallow bulk") — justification: Copilot is free/unlimited so there's no cost tradeoff to economize against. `bash -n` clean; grep confirms zero remaining "default high" references.
- **Effort bug caught + fixed (2026-07-06, user screenshots + "do not assume anything")** — the initial blanket `--effort xhigh` default was WRONG for Claude models. User's GUI screenshots showed Opus 4.6/Sonnet 4.6 menus have no "Extra High" (only Low/Medium/High/Max), while GPT-5.5's menu has no "Max" (only up to Extra High). Verified via real CLI `--log-level debug` request logs (not assumed): `claude-opus-4.6 --effort xhigh` silently resolved to `defaultReasoningEffort=medium` — a silent degrade below even `high`, with zero error/warning. The CLI's own model_capabilities schema confirms: claude-opus-4.6/claude-sonnet-4.6 support `low,medium,high,max` only (no xhigh/none); gpt-5.5/gpt-5.3-codex support `none,low,medium,high,xhigh` only (no max). Fixed `copilot-worker.sh`: resolves the real model (reading the agent file's `model:` frontmatter for `--agent` calls, since `--model` isn't CLI-passed there) BEFORE picking effort, then always uses that family's top tier (`max` for claude-*, `xhigh` for gpt-5.5/gpt-5.3-codex) — auto-corrects with a stderr warning on any mismatch, never silently degrades. Live-verified: council-planner (opus-4.6) → resolved `max`; council-reviewer (gpt-5.5) → resolved `xhigh` (both confirmed via meta.json). Also added `--context long_context` (1M) as a hardcoded, non-overridable default per user directive + GUI screenshot — confirmed real via `copilot --help`.
- **Nested sub-agents (2026-07-06, user: "make sure copilot subagents are allowed to spawn their own subagents for its own help (max 3)")** — verified real, not assumed: Copilot's CLI ships its own `task` tool (its Agent-tool analog); neither of our two agent files restricts `tools:` and the wrapper's deny-list (write/shell) doesn't touch `task`, so nested spawning was **already allowed** — no structural change needed for the "allowed" half. Added "max 3, never more" to both `council-planner.agent.md` and `council-reviewer.agent.md` operating rules for the cap. **Honest limitation, confirmed live**: this is a soft/prompt-layer cap only — no CLI flag exists to hard-enforce a nested-spawn count (checked `--help`: only `--max-autopilot-continues` and `--max-ai-credits`, both unrelated). Real test with a task explicitly demanding 5 independent threads → council-planner spawned **5**, ignoring its own "max 3" instruction. Mitigation documented in `worker-ext.md`: (1) Claude-authored task specs never request >3 threads, (2) a post-run check flags (doesn't block) any result implying >3 spawns as a Delegation-receipt anomaly.
- **R3 STILL PENDING (env-blocked)** — fresh-session E2E (`claude -p "/ultra-agents <critical task>"`): attempt failed with `API Error: Rate limit reached` (account-level). Ledger unchanged (8 rows — no false green). Re-run after rate-limit reset, or user runs interactively in a new session. "Automatic in fresh sessions" remains UNCLAIMED until this passes.

**Regression-guard diff review:** SKILL.md (pointer block only), worker-ext.md (2 intended additions), memory file (+scope note; frontmatter normalized by memory tooling), MEMORY.md (1 line). No unintended changes. `git status` on `.claude/skills/ultra-agents/` = pre-existing `SKILL.md M` only.

---

## Takeover v3 Execution — 2026-07-09 (Claude-CEO / Copilot-workforce)

**Intent**: COPILOT_TAKEOVER_SPEC v1 adapted to verified reality. Claude = final-verdict reader + oneliner converter; Copilot = entire workforce (full 8-duty stack); enforcement moved from instructions to hooks. Dogfooded: council drafted every buildable file, GPT cross-reviewed, Claude applied+gated.

**Delivered (all outside repo — Swiss-Alps secret; zero new tracked files, SKILL.md still 0 vendor strings)**:
- A4 registry probes (LR-059): claude-haiku-4.5 (NO effort enum → flag omitted), gpt-5-mini (low|medium|**high**). gpt-4.1/gemini-2.5-pro HARD-unavailable (real CLI error, not silent fallback). Evidence was in `.claude/state/ua-worker/probe-*` (cleaned post-record).
- A1-A3: `~/.claude/delegation/{DUTY_STACK.md, config.json (AUTO_SELF=on,GATE=on,MAX_WORKERS=5), ticket-template.md, tickets/, reports/, locks/, self_incidents.log}`.
- A5: agent profiles — new `council-verifier` (gpt-5-mini, strict JSON), `council-worker` (sonnet-4.6, 8-duty); planner+reviewer gained ticket mode + depth-2 sub-agent rule; reviewer DIGEST resolved as ticket-mode-only exception (fixes GPT review's VERDICT-contradiction finding).
- A6: `copilot-worker.sh` — exact verified model registry (unknown → hard exit 2, kills silent effort-fallback), `--ticket` mode (DUTY_STACK prepend + report routing), global MAX_WORKERS atomic mkdir slot-lock, `--interrogate`/`--questions` channel, effort omitted for no-enum models.
- B1/B2: `~/.claude/hooks/delegation-gate.mjs` — DENYs Claude repo-source writes (Edit-family + Bash write-patterns) when GATE=on; scoped SELF_GRANT (session+expiry+explicit-paths, segment-boundary), pipeline-identity exemption, fail-closed-when-scoped.
- B3: `ua-worker-guard.mjs` v2 — GATE=on global activation (skill latch kept as OR) + pipeline subagent_type exemption.
- B4: `worker-ext.md` v3 — takeover doctrine (CEO reads final verdict only, never reviews by default), T0-T4 ladder, delegated verification chain + suspicion ladder (interrogate via GPT, personal review only on trust-collapse), quality dial + feedback loop, one-headshot frugality, receipt v2, verified registry table.

**LR-059 real-run evidence (6 ledger rows, all ok:true)**:
- Council drafted 2 file-sets (opus/max) → GPT cross-reviewed (gpt-5.5/xhigh, 13 findings) → Claude folded fixes + applied.
- Registry: unknown-model dispatch → exit 2 (FATAL); gpt-5-mini xhigh → warn + auto-correct to high (meta effort:high).
- Full ticket chain: council-worker fixed a real sandbox bug (9→10) + full parity report + auto-routed to reports/ → council-verifier returned `{"pass":true,...}`. Independent re-run confirmed the fix.
- delegation-gate: 10 stdin outcomes green (source-deny, md-allow, sed-deny, npm-test-allow, valid-grant-allow, wrong-session-deny, expired-deny, boundary-deny, pipeline-GIVER-allow, OWNER-deny). ua-worker-guard v2: 4 outcomes green.

**Deviations (flagged for veto)**:
- C1 "5 tickets" → **1** end-to-end ticket. Reason: user's explicit same-session directive ("one headshot not AK47; don't call max qty as drill") + 3 real council dispatches already proved draft→review this session; the only unproven path was `--ticket` mode + verifier JSON, both now proven with 1. Running 4 more purely as drill = the exact AK47 waste the directive targets.

**Blocked on Rutvik's GO (self-modification rule — NOT silently skipped, per LR-060 env-defers-only-the-blocked-step)**:
- settings.json registration of delegation-gate.mjs (hook FILES built + stdin-proven; only the `~/.claude/settings.json` edit that makes it intercept live Edits awaits explicit GO).
- C2 fresh NORMAL-session E2E (needs the gate registered + a fresh session).

**Honest limits**: reviewer DIGEST format is unproven (only VERDICT proven this session — proving it = a gpt-5.5 dispatch on a trivial fix = AK47, deferred to first real ticket review); 5-slot lock code executed on every dispatch but concurrent >5 contention not stress-tested; SELF_GRANT auto-write flow (AUTO_SELF creating a grant on ladder-exhaustion) not exercised, though the grant FORMAT is validated by 4 real gate tests.

**Post-registration fix (2026-07-09, Rutvik-approved live)**: on registering delegation-gate.mjs the Bash matcher false-positived on trigger keywords (`>`, `sed -i`) inside echo/printf STRING literals — an unfixable pattern-vs-parser problem. Decision (approved): DROP Bash gating entirely; matcher = Edit|Write|MultiEdit|NotebookEdit only. Rationale: Claude authors source via Edit/Write (fully gated); `echo code > src.ts` is a bypass Claude never uses. Edit-family gate proven live this session (all ~/.claude edits pass, source .ts denies). Self-modification correctly blocked by the auto-mode classifier until Rutvik approved in chat.

**Loophole-hardening v2 (2026-07-09, Rutvik standing approval "yes for all things necessary")** — adversarial self-audit found 5 holes; all closed + 12/12 fixture-proven live:
1. Kill-switch flip (config.json GATE=off) → config.json now PROTECTED, denied even when GATE is off.
2. Self-lobotomy (editing hook/settings/wrapper/worker-ext/DUTY_STACK to weaken rules) → all 6 control files PROTECTED; escape only via Rutvik-approved SELF_GRANT (reason ≥20 chars) with every use appended to ~/.claude/delegation/grants-audit.log + surfaced in the Delegation receipt.
3. Substring path tricks (src/plans/evil.ts, src/.claude/evil.ts) → allow-paths now repo-root-anchored.
4. cwd-dodge (session in another project edits repo source ungated) → scoping is now TARGET-based, any session.
5. Eternal grant (expires 2099) → grant TTL hard-capped at 60 min.
Honest limits (documented in worker-ext): Bash ungated (approved trade) so tool-layer tamper-resistance = friction + mandatory audit visibility, not cryptography; auto-mode classifier = independent second layer (caught a live self-mod attempt today); pipeline-identity exemption remains a Phase-1 boundary (any identity adoption unlocks pipeline paths — closes at Phase D).

**/ultra-agents repurposed as worker-cap booster (2026-07-09, Rutvik-directed)** — old job (lift Claude-subagent caps) obsolete under the takeover (spawn guard). New job: explicit invocation = approval to boost MAX_WORKERS 5 → ≤20 for the current goal via `UA_MAX_WORKERS=<N>` dispatch prefix; wrapper clamps at 20 (verified live: 25→20 on a real gpt-5-mini dispatch, stderr proof); base config stays 5; goal lapse = cap reverts. Protected-file edits (wrapper + worker-ext) done via the new grant flow — 2 uses in grants-audit.log under UA-CAP-BOOST, grant deleted after. SKILL.md updated (still 0 vendor strings).

**Receipt v3 (2026-07-09, Rutvik-approved)** — supersedes v2. Newcomer-readable: jobs (count/pass/fail/model/plain line) → reviewer → self-work → permission-uses → waste. Internal codenames/run-ids/tier codes move to this log, never the chat receipt. worker-ext updated via audited grant RECEIPT-V3 (grants-audit.log); memory feedback_receipt_newcomer_format.md saved.

**Skill routing baked in (2026-07-09, Rutvik-directed)** — skills remain Claude-run ceremony (workers have no Skill tool; editing tracked skill files to reference the worker system would leak secrecy). The routing lever: ticket DOCTRINE field MUST cite the governing SKILL.md / rules paths; duty #1 forces the worker to read+follow+list them in DOCTRINE_READ. worker-ext (grant SKILL-DOCTRINE-LINE, audited) + ticket-template updated. Zero tracked-file edits.

**Audit of escaped session (2026-07-10 CORP_PRICING_MISSING_TESTID_XLSX run)** — that session executed AFTER go-live with 0 delegation + no receipt. Root causes: (1) its work shape (md/plans/Bash-script writes) fits entirely through the gate's designed allow-holes, so the gate never fired = never taught it; (2) Receipt contract lived only in worker-ext with no exit-side enforcement; (3) MEMORY.md still said "gate registration awaits GO" — actively told fresh sessions the system wasn't live. Fixes: /final-q SKILL.md oblique Local-extension section (read worker-ext before audit block, emit Receipt, inline-work-that-should-be-delegated = finding; 0 vendor strings), MEMORY.md line rewritten to LIVE + every-session contract. Residual honest gap: a session that never runs /final-q and never touches gated paths can still slip — memory line is now the catch-net; next escape = graduate to a SessionStart surface.

---

## 2026-07-10 — Delegation-maximization hardening (Rutvik: "laziest but smartest delegator")

**Trigger**: Rutvik pasted two live sessions under-delegating: (1) testid-report session personally ran ~13 playwright-cli surface dumps (didn't know the system existed — started before the MEMORY.md LIVE fix landed); (2) PW-config-hardening session delegated 1 implementation ticket but personally ran the whole verification battery, personally line-reviewed the worker's diff ("Reviewed by: nobody external needed"), and personally SELF_GRANT-fixed the worker's indentation defect instead of bouncing. He also pasted the GitHub Copilot settings page (model policy toggles).

**Root cause**: doctrine said "Claude doesn't labor" but never enumerated WHAT is delegable — sessions treated verification/review/browser-walks as CEO work by habit. And nothing at session START teaches the system (gate only fires on denied paths; final-q only fires at the end).

**Changes (all under grant DELEGATION-MAXIMIZATION-2026-07-10, in grants-audit.log)**:
1. `worker-ext.md` — new section "Delegation-first decision rule": the could-a-worker-do-this test, DEFAULT-DELEGATE table (browser walks, verify batteries, drafting, diff review, RCA legwork, defect-bounce), the complete CLAUDE-ONLY list, simple-case fast path (1 worker + 1 cross-family reviewer, both green = accept), self-work = confession. Also amended: pyramid layer 1 (worker runs the battery, not Claude), guardrails table (T4 reviewer audits diff, not Claude), gemini re-probe note.
2. `~/.claude/delegation/delegation-primer.mjs.STAGED` — SessionStart primer drafted + staged INERT. Live install (into ~/.claude/hooks/ + settings.json SessionStart entry) blocked by the auto-mode classifier + self-modification rule → awaiting Rutvik's explicit GO in chat.
3. Model probe: `gemini-2.5-pro` re-probed (settings page shows policy "Enabled") → CLI still hard-rejects: `Model "gemini-2.5-pro" from --model flag is not available` (probe-gemini-2.5-pro-r2). GitHub policy toggle ≠ CLI availability. Registry unchanged (5 verified models). Older enabled models (opus-4.5 / sonnet-4.5) deliberately NOT probed — strictly dominated by 4.6 at the same tier, no routing use.
4. Cross-family review of these very changes dispatched to council-reviewer (gpt-5.5) — run `review-delegation-first` (dogfooding the 1-worker+1-reviewer rule on the rule itself).

**Capability map from the settings paste (for the record)**: Copilot CLI enabled; cloud agent DISABLED (no remote delegation); web search DISABLED (workers cannot web-research — stays with Claude or is skipped); MCP-in-Copilot policy enabled but no MCP servers configured for the CLI locally; models actually CLI-served remain the verified 5.

**Cross-family review reconciliation (run `review-delegation-first`, gpt-5.5, VERDICT: MATERIAL_ISSUES — 5 major / 3 minor, ALL addressed)**:
- Inline-work loophole → tightened to an objective exception: ONE read-only command feeding a dispatch decision; anything more = ticket + incident. (major 1 + minor 6)
- Fast-path under-verification / verifier single-point-of-failure → "green presupposes evidence" line: real pasted VERIFY_OUTPUT mandatory (missing = auto-bounce), reviewer checks authenticity, surprising-green costs one --interrogate round. Partly already designed (DUTY_STACK real-paste rule + reviewer ticket-mode authenticity check) — now explicit at the fast path itself. (majors 2+3)
- "Never runs battery" vs AUTO_SELF contradiction → explicit ladder line: delegate → bounce → escalate → AUTO_SELF; "never" = never-as-first-resort. (major 4)
- Primer silent no-op = invisible bypass → STAGED primer now logs every failure to delegation-gate-failures.log (can't fail-closed: SessionStart can't block sessions). (major 5)
- Missing CEO-only externals → item 8 added: git commit/push, /deploy, Jira/Confluence writes, anything leaving the machine — workers never publish. (minor 7)
- Overbroad CEO-only → drafting/authority split: workers may draft ceremony content, Claude performs the authoritative action. (minor 8)
Grant DELEGATION-MAXIMIZATION-2026-07-10 consumed and deleted (uses in grants-audit.log). Primer install still awaiting Rutvik GO.

**Live-walk parity rule (Rutvik mandate, 2026-07-10 mid-ultrathink)**: "if worker walks, council reviewer walks the e2e too". Encoded as verification-pyramid layer 4 (worker-ext.md, grant LIVE-WALK-PARITY-2026-07-10): any ticket whose work drove the live app can never be greened by paper review — an independent agent (verifier for deterministic re-runs per LR-064, second worker for adaptive) re-executes the same walk fresh in a shell-enabled dispatch; reviewer verdict diffs claims vs re-walk evidence; mismatch = bounce. Fast path explicitly excludes live-walk tickets until the re-walk passes. Ticket-template VERIFY section now demands exact walk script + auth-state path (re-walk = one verbatim command). Discovered constraint: read-mode dispatches deny shell → re-walks must use edit mode or narrow --allow shell(...). Round-2 cross-family review dispatched (review-r2-delegation) covering round-1 fold-ins + this rule (AUD-017: no self-grading).

**Round-2 reconciliation (review-r2-delegation, gpt-5.5, VERDICT: MATERIAL_ISSUES — 4 points, ALL folded in)**: (1) CLAUDE-ONLY item 8 reworded to PUBLISHING/outward-persistence only — worker app-traffic (walks/probes) explicitly not publishing (was contradicting re-walk dispatches); (2) LIVE-WALK classification is dispatcher-owned (`LIVE-WALK: yes|no` ticket field added to template) — workers can't self-classify out of a re-walk, reviewer flags browser activity on `no` tickets; (3) adaptive re-walks REPLAY the first walk's recorded steps/oracles, never a free second adaptive walk; (4) env/auth re-walk failure = one fresh retry then ENV-BLOCKED to Claude, not auto-bounce. Round-3 skipped: fixes are verbatim incorporations of the reviewer's own prescriptions (council max-rounds precedent). Fixes 1-6+8 from round-1 confirmed sufficient by round-2. Grant LIVE-WALK-PARITY-2026-07-10 consumed + deleted.

**Primer INSTALLED (2026-07-10, Rutvik explicit "go")**: delegation-primer.mjs live at ~/.claude/hooks/, registered as SessionStart in ~/.claude/settings.json (grant PRIMER-INSTALL-GO-2026-07-10, both protected uses in grants-audit.log, grant burned). Live-tested: this-repo cwd → injects doctrine block (incl. live-walk parity line); other cwd → silent; settings.json parses. STAGED draft deleted. All three enforcement layers now live: session START (primer) + during (delegation gate + spawn guard) + session END (final-q Receipt).

**Off-repo parity + prosecutor-reviewer (Rutvik mandate, 2026-07-10)**: "anything that aint on repo and worker does it → reviewer ALSO moves out of repo; reviewer = death-sworn enemy, worker guilty until proven not". Encoded under grant OFF-REPO-PARITY-2026-07-10: (1) pyramid layer 4 generalized live-walk→OFF-REPO parity (walks, network calls, env mutations, untracked artifacts, ran-X-saw-Y observations — independent shell-enabled re-execution mandatory; hardening (d) added: unreproducible one-shot observations = UNPROVEN → escalate, never accept); (2) pyramid layer 3 + council-reviewer.agent.md got PRESUMPTION OF GUILT (starting verdict MATERIAL_ISSUES, claims = unreliable witness, only independently-verified evidence acquits, verified claims settled — no eternal bounce loops) + ticket-mode step 3 off-repo reproduction duty (no-shell dispatch = blocker + stop, never paper review); (3) ticket-template LIVE-WALK field → OFF-REPO; (4) dispatch guide: off-repo reviews use --mode edit; (5) primer line updated + re-tested (injects "OFF-REPO tickets... guilty until its evidence proves otherwise"). Stress-test round dispatched (review-r3-offrepo): cost, bounce-loops, under-reporting incentive, in-repo/off-repo definition line, contradiction sweep.

**Round-3 reconciliation (review-r3-offrepo, gpt-5.5, VERDICT: MATERIAL_ISSUES — 3 points, ALL folded in)**: (1) omission > error — reviewer actively hunts UNDISCLOSED external-state activity (report vs diff/scripts/traces); hiding off-repo work = auto-bounce + worker-profile lesson, harsher than honest mistakes (worker-ext hardening (f) + reviewer brief rule); (2) boundary pinned: off-repo = EXTERNAL-state interaction only — in-repo command re-runs (npm test/greps/typecheck) stay layer-1 mechanical verify (hardening (e)); (3) claim-level statuses VERIFIED/UNPROVEN/ENV-BLOCKED — partial evidence never blurs into a whole-report verdict, bounces re-review only changed/UNPROVEN claims (layer-3 stance + reviewer brief). Round-4 skipped: mechanical incorporations of the reviewer's own prescriptions (council max-rounds precedent). Grant OFF-REPO-PARITY-2026-07-10 consumed + deleted (2 protected uses in grants-audit.log: worker-ext.md, delegation-primer.mjs).

**⏸ HALTED 2026-07-10 (Rutvik: usage limits — retry on his word).** Dynamic model-registry build ~70%. State: worker built registry-block.sh + model-registry.json + discover.sh, parse tested by worker as PASS(high) against real probe log probe-gpt-5-mini-auto. BUT prosecutor (review-dynreg) INDEPENDENTLY re-ran the parser and got `none` — UNRESOLVED CONTRADICTION (worker=high vs reviewer=none). Reviewer also (correctly) blocked on missing parity-report fields — artifact of Claude passing raw deliverables instead of the worker's report, not a real defect; reframe on resume. RESUME HERE: (1) resolve parser high-vs-none on the real pretty-printed multiline log (likely the awk/node regex vs multiline array — the reviewer's `none` is the credible one, parser probably needs the multiline-array fix); (2) resolve exit-2-in-command-substitution propagation (charge #4, unconfirmed); (3) transient-brick hardening for seed rows; (4) then splice into copilot-worker.sh under grant + live 3-path E2E (known→registry, unknown→auto-probe, fake→exit2). No grant live, no background task running, nothing spliced into the wrapper yet (copilot-worker.sh untouched — safe).

## ▶ RESUMED 2026-07-10 — contradiction RESOLVED (supersedes the ⏸ HALTED "UNRESOLVED" marker above)

Root cause of worker=`high` vs reviewer=`none`: **dispatch copy-drift, not a parser defect.** The prosecutor
review ticket was pointed at the STALE scratchpad copy (`scratchpad/dynreg/registry-block.sh`, node regex
`"reasoning_effort":\[` — no space), while the real bounced deliverable lives in
`.claude/state/ua-worker/ticket-dynreg/dynreg/registry-block.sh` (awk `"reasoning_effort": \[` — with space).

Deterministic proof against the real log (`probe-gpt-5-mini-auto/process-1783669002380-4484.log`,
capability array at line 319 = low/medium/high; decoy schema `{`-form at line 948 mentions xhigh):
- awk (real deliverable) → `high` ✓   |   node no-space regex (stale) → `none` (never matches: `nospace-match:false withspace-match:true`)
- exit-2 propagation: `return 2`/`return 1` inside `$(...)` + `|| exit 2` on the assignment → parent exits 2 (both proven)
- transient-brick: seeded `claude-opus-4.6` → `max` with NO probe branch; only unknown models auto-probe (proven)
- prosecutor charge #1 (probe_dir report/code contradiction) was also a stale-copy artifact — the real deliverable does NOT gate on probe_dir (line 15), consistent with its own BLOCKERS.

Also (binary-detection lesson): the 136KB debug log trips ripgrep's binary skip — only `grep -a` / node `readFileSync` read it.

Corrective: deleted the stale scratchpad `registry-block.sh` landmine. Canonical deliverable in ticket-dynreg is CORRECT on all 3 counts.

REMAINING (single step, HARD-GATED): splice ticket-dynreg/dynreg/registry-block.sh over lines 117-139 of
copilot-worker.sh (PROTECTED control file — needs Rutvik's explicit in-chat GO + SELF_GRANT) + live 3-path E2E
(known→registry no-probe · unknown-available→probe+register · fake→exit 2). Nothing spliced yet; wrapper untouched.

## ✅ SPLICE COMPLETE 2026-07-10 — dynamic model-registry is LIVE
- copilot-worker.sh lines 117-139 (static `case "$MODEL"`) replaced with a FAIL-CLOSED source of
  ~/.claude/delegation/registry-block.sh (verified awk block; +`timeout 120` hang-guard added at install, fix-and-log).
- model-registry.json seeded with 5 verified rows at ~/.claude/delegation/ (outside repo — secret).
- Protected edit done under a session-scoped SELF_GRANT; audit-logged (grants-audit.log 2026-07-10T11:43:56Z, kind=protected, target=copilot-worker.sh); grant BURNED after use.
- E2E on the ACTUAL spliced code path (deterministic): PATH1 all 5 known models resolve from registry with no probe (opus/sonnet=max, gpt-5.5=xhigh, gpt-5-mini=high, haiku=none→omits --effort) — exact parity with old static table; PATH2 fake→exit2 chain proven (empty lookup → not-available detected in real fixture → return 2 → `|| exit 2` guard); PATH3 parse(real gpt-5-mini log)=high.
- CARRIED BLOCKER: live copilot-dispatch leg of auto-probe unexercised — no spare terminal-available model (gemini-2.5-pro is IDE-catalog only, terminal-rejected). Exercise when a genuinely-new enabled model appears.
- Secrecy: git status clean of delegation artifacts; copilot-worker.sh git-ignored. Feature complete.
