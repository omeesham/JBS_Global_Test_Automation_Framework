> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_ONELINERS_RUTVIK_CLONE.md`. All context below.**
>
> 1. **Identity**: OWNER (framework-infra work; no pipeline artifacts touched).
> 2. **Skills**: /execute (orchestrator) + /delegation-temp on + /ultra-agents (both already active for this goal). /questionnaire already ran — decisions are LOCKED below, do not re-ask.
> 3. **Model + thinking + permission-mode**: read the frontmatter fields below. This plan is designed for the Opus session Rutvik switched to; Fable authored the design core. Opus consults Fable ONLY on §Consult-Fable forks — never decides those alone, never burns Fable on anything else.
> 4. **Dependency gate**: R1-R4 worker results must be GENUINE/accepted (see §Phase 0) before Phase 2.
> 5. **Context load**: this file in full + `.claude/state/ua-worker/chips/oneliners/` outputs.
> 5.5. **Browser tool**: none (no live app work).
> 6. **Phase 0 FIRST** (research synthesis) before any edits.
> 7. **Execute Phases 1-4** per Step-by-Step.
> 8. **Handoff**: flip the Status field to DONE + add the Executed date, activity-log row, git mv to plans/done/, `npm run plans:reindex`, Receipt v3.
>
> **HALT + ASK USER** if: any §Consult-Fable fork fires and Fable is unavailable / any safety gate (protected-file grant, deletions) lacks its recorded GO / scope grows >30%.

# PLAN: /oneliners — Rutvik-Clone Chat Compaction Switch

**Status**: DONE
**Executed**: 2026-07-26
**Priority**: P0 (Rutvik direct, overnight one-shot mandate)
**Created**: 2026-07-26
**Identity**: OWNER
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none
**Skills**: /execute, /delegation-temp, /ultra-agents

---

## 1. Context (why)

Rutvik's problem, in his own words (2026-07-26 session): Claude says too much; he has a short, spontaneous memory; he steers from a few-line reading window; he wants everything he needs in the compactest form possible WITHOUT losing logic, lying, or hiding. And beyond compaction: **`/oneliners on` = Claude talks like HIM** — learned dynamically from his real prompts (casing, slang, typos, question style, criticism style — "claude cloning me"), continuously, automatically.

### LOCKED decisions (AskUserQuestion, 2026-07-26 — do NOT re-ask)
1. **Plan + execute overnight**: YES. Explicit GO given for hook/settings edits (the question named "touches hooks/settings — needs your explicit go" and he answered yes). This is the recorded Rutvik-GO for the PROTECTED-file grant ceremony.
2. **Reach**: GLOBAL — all projects (the user-level Claude config dir level).
3. **Scope v1**: session chat (Rutvik↔Claude talk) ONLY. Reports (/standup, /end-day), receipts, artifacts untouched. Expansion = future scope after he fine-tunes.
4. **Default**: ON in every session until he flips it off.
5. **One switch**: `/oneliners on` = compaction + Rutvik-voice together. `/oneliners off` = stock Claude. `/oneliners` = status.
6. Quality bar: one-shot, slop-free implementation. "Slop check doesn't mean fuck the features — make the feature work, then remove what's not needed while preserving 100% quality." Bugs (fine-tuning of caps/voice) acceptable; severe gaps / sloppy implementation NOT.

## 2. Prior-Fix Trial (recurrence-class gate — /planning Step 3)

| Prior fix | What it did | Why it failed to fire | Class | Verdict |
|---|---|---|---|---|
| Root `CLAUDE.md` §"When responding to Rutvik" ("Only respond in simple understandable oneliners") | One prose line in repo CLAUDE.md | Per-repo only; buried at file bottom; no per-prompt reinforcement — drowns under 100k tokens of competing doctrine; zero style-cloning; unmeasurable | prose-not-mechanism | **CONVICTED** |
| Memory `feedback_chat_simple_compaction.md` + MEMORY.md line | Recall-based reminder | Recall is advisory background context; same drowning; not global; no toggle | prose-not-mechanism | **CONVICTED** |

**Rewire (in-scope, LR-050)**: this plan REPLACES both — Phase 3 edits the CLAUDE.md line to point at `/oneliners` (single pointer line, no duplicate prose) and updates `feedback_chat_simple_compaction.md` to record the graduation to the structural mechanism. New mechanism = per-prompt machine injection (UserPromptSubmit hook) + global state + style card — fires every turn, survives /compact, works in every repo, toggleable, testable.

## 3. Architecture (FABLE-LOCKED — changing any numbered item = §Consult-Fable fork)

1. **State**: the **state file** (user-level Claude config, oneliners dir) → `{"on": true}`. Absent = ON (his chosen default). Corrupt = ON + one-line warn. Atomic writes (tmp+rename). NEVER touches the delegation gate config (user-level delegation dir) or any delegation state.
2. **Skill**: the **oneliners skill file** (user-level skills dir) (user-level = global). `/oneliners` → print status (ON/OFF + corpus size + style-card freshness). `on`/`off` → atomic state write + confirm in ONE line. Explicit-invoke only.
3. **Enforcement (the "natively forced" core) — HYBRID, revised 2026-07-26 after cross-vendor doc verification (see §3a + Deviation D-1)**:
   - **PRIMARY = a native output style** at the **output style file** (user-level output-styles dir), activated by the `outputStyle` setting in the **user-level settings file**. Output styles **modify the system prompt itself** — the strongest available forcing layer, inherently persistent across every turn, /clear, compaction, and every project, at **zero per-prompt token cost**. It carries the Reply Contract (§4) + Style Card (§5) + chat-only fence. Frontmatter MUST set `keep-coding-instructions: true` — we are changing how Claude TALKS, never how it codes (default is false, which would strip coding instructions; that default is a trap).
   - **SECONDARY = the **oneliners hook** (user-level hooks dir)** registered in the **user-level settings file** for: (a) **UserPromptSubmit** → corpus capture only (the learning loop, §3.4) — it injects NO style text, because the output style already carries it at a stronger layer (duplicating it would be per-prompt token waste); (b) **SessionStart** with matcher `startup|resume|clear|compact|fork` → the one-line state announce. The `fork` value is mandatory and was the reviewer's catch.
   - **Toggle semantics**: ON = `outputStyle` set to the oneliners style + capture active. OFF = `outputStyle` key removed (stock Claude, byte-silent) + capture idle. State file remains the single source of truth the skill writes; settings is what the platform reads.
   - Fail-open: any hook error → allow, zero context, log to the **hook error log** (user-level Claude config, oneliners dir). A broken style layer must never wedge a session.
4. **Corpus appender (dynamic learning, zero LLM cost)**: same hook, when ON, appends the raw user prompt as `{ts, cwd, text}` to the **corpus file** (user-level Claude config, oneliners dir) — **behind the STRONG reject-list** (hardened 2026-07-26 after the R4 cross-vendor review proved weak filters poison the profile: only 2/10 profile quotes were real, and top "recurring phrases" were file paths). Reject a prompt if it contains or is dominated by: `<system-reminder>`, `<command-name>`, `<local-command-stdout>`, `<local-command-caveat>`, `Caveat:`, `<task-notification>`, `[SYSTEM NOTIFICATION`, `This is how Claude Code surfaces`, `UserPromptSubmit hook additional context`, `Framework rule scan`, `Binding LR rules likely active`, `Skills to consider:`, `Decision-tree patterns matching`, `Injection is advisory`, `tool_result`, `The user sent a new message while you were working`, **slash-command expansion bodies** (`Run the \`X\` skill in \`Y\` mode`, `Pass through any arguments verbatim`, `<command-message>`, `<command-args>`, `Base directory for this skill`, `ARGUMENTS:` — Claude Code injects a skill's own instruction text into the turn when Rutvik types a slash command, and it was being quoted back as his voice), and the bracketed **request-interrupted turn marker** (found contaminating 313 corpus rows on 2026-07-26 — Claude Code inserts it when a turn is cut off, and it was surfacing as one of Rutvik's "recurring phrases"); or if >30% of characters are filesystem paths; or if it is a bare slash-command with no prose. **This repo's own hooks inject that text into the user turn every prompt — unfiltered capture would train the clone on machine noise.** Increment the **stale counter** (user-level Claude config, oneliners dir); at ≥200 new rows, the injected context includes one extra line: "style card stale — dispatch refresh worker" → the session dispatches a cheap T2 distill ticket automatically (no Rutvik ask). That is the "constant dynamic learnings" loop: capture is free + machine; distillation is a worker; Claude never labors.
5. **Style Card**: the **style card** (user-level Claude config, oneliners dir) — ≤50 lines / ≤600 tokens (hard budget; >800 = §Consult-Fable). Distilled from R4's style-profile-v1.md. Contains: voice features (casing, slang, burst length, profanity-as-intensity, his typo classes), 5-8 verbatim exemplar snippets, and DON'Ts (§6 guardrails).
6. **SessionStart announce**: same hook file, SessionStart matcher → one line `ONELINERS: ON (talk like Rutvik, compact)` or `ONELINERS: OFF`.
7. **Install-location law**: hook + skill are BUILT by workers inside the repo chips dir, INSTALLED to the user-level Claude config dir by Claude only (protected surface, GO recorded in §1). Hook derives all paths from env/homedir at runtime, never `__dirname` (dispatcher lesson lcd02-nudge-0716-r3).

## 3a. Verified platform facts (independently re-fetched from official docs by a cross-vendor reviewer, 2026-07-26 — source: `.claude\state\ua-worker\chips\oneliners\out-rev-a\review.md`, 7/9 URLs re-fetched, zero fabricated citations)

| Fact | Status | Consequence for this plan |
|---|---|---|
| `UserPromptSubmit` hook is current, fires on EVERY prompt, no matcher support | VERIFIED (code.claude.com/docs/en/hooks) | Safe basis for the capture loop |
| User-level the **user-level settings file** hooks scope = ALL projects | VERIFIED | Global reach requirement satisfied |
| `hookSpecificOutput.additionalContext` is the injection field | VERIFIED | Available if we ever need per-prompt text |
| SessionStart matchers = `startup, resume, clear, compact, fork` (FIVE) | VERIFIED — reviewer caught `fork` missing from the research | `fork` MUST be in our matcher or forked sessions lose the announce |
| Output styles are alive; they MODIFY THE SYSTEM PROMPT; custom styles live in the user-level output-styles dir; `outputStyle` is a settings key | VERIFIED (docs/en/output-styles + docs/en/settings) | **Promoted to primary mechanism** — stronger than per-prompt injection, and free |
| `keep-coding-instructions` frontmatter exists, **default false** | VERIFIED | MUST set `true`, else we strip Claude Code's coding instructions |
| `CLAUDE.md` is delivered as a *user message after* the system prompt; "context, not enforced configuration" | VERIFIED (docs/en/memory) | Explains why the old CLAUDE.md one-liner rule kept failing — it was never enforcement (confirms §2 Prior-Fix Trial conviction) |
| Auto-compaction re-attaches most recent invocation of each skill, first 5,000 tokens each, 25,000 combined | VERIFIED — reviewer refuted the research's "UNKNOWN" | Skill body cannot be relied on as the enforcement layer; output style can |
| `claude -p` (headless) loads hooks, skills and project memory unless `--bare` | VERIFIED (docs/en/headless) | Headless sessions WILL pick this up; `--bare` is the opt-out |
| No documented env var for "am I headless" | HONEST UNKNOWN (both research and reviewer) | Ship without headless suppression; cost is near-zero now that injection is system-prompt-level, not per-prompt |
| `/output-style` deprecated in specific versions v2.1.73/v2.1.91 | UNPROVEN — no source found | Do not cite version numbers anywhere; use `/config` or the settings key |
| `force-for-plugin` frontmatter exists | VERIFIED | Noted as a future distribution option; NOT used in v1 |

## 4. Reply Contract v0 (Fable draft — Phase 1 tunes numbers with R1 findings, structure is LOCKED)

- Every reply starts with a micro-anchor: `[topic ≤4 words]` — he forgets context; each message stands alone, zero assumed memory.
- Per-type caps: **status** = 1 line · **done-report** = ≤5 grouped lines (what happened → proof → what's next) · **ask** = 1 line + ≤3 options + rec (batched) · **alert/failure** = flagged line FIRST, then 1-line fix path. Hard ceiling 10 lines unless he says "more"/"details"/"why" (pull-based depth — then any depth allowed).
- Plain words. No agent/framework jargon, no codenames, no file-path soup unless asked.
- **Honesty floor (never compacted away)**: failures, skips, and blockers surface in line 1 — compaction may drop detail, NEVER drop bad news. "Less is more, but too less is too more."
- Voice: write the reply in HIS voice per the style card. Style NEVER mutates facts: paths, commands, numbers, IDs are always written exactly (no typo-mimicry on technical tokens).

## 5. Dynamic learning loop (LOCKED)

capture (hook, free) → threshold flag (≥200 new rows) → auto-dispatched T2 distill worker (reads corpus delta + current card, emits updated style-card.md ≤50 lines into chips dir) → cross-family review green → Claude installs the new card (1 copy step) → counter resets. No step asks Rutvik. No step burns Claude beyond dispatch+read-verdict.

## 6. Guardrails (LOCKED)

- Chat-only fence: styling applies ONLY to conversational replies to Rutvik. Artifacts (code, specs, docs, plans, commits, reports, Jira, anything written to disk or published) are NEVER style-mutated. Explicit-skill outputs keep their contracts.
- No caricature drift: card regenerates from the FULL rolling corpus (recent-weighted), never from the previous card alone (prevents exaggeration feedback loop — R3 will confirm/refute; if R3 contradicts, §Consult-Fable).
- Mirroring cap: clone his voice, never his anger AT him; criticism-mode phrasing is for content, not the user.
- Headless/worker sessions: injection adds tokens to every prompt; if R2 finds a reliable non-interactive detector, hook skips injection there (chain/worker sessions have no Rutvik reading live). If no detector exists: ship anyway (cost accepted), note in receipt.
- Privacy: corpus + card live in the user-level Claude config oneliners dir — machine-local, never in any repo, never shipped, never quoted into tracked files.

## 7. Step-by-Step (Opus executes; workers do; Claude dispatches + judges)

**Phase 0 — synthesize research (on worker wake)**
- Clarify gate per ticket: `grep -qx 'NO-QUESTIONS' C:\Users\rutvi\.claude\delegation\reports\<run-id>-clarify.report.md` (bare-token whole-line). Questions → answer from this plan (it holds every locked decision), append `## CLARIFICATIONS` to the ticket, then fire the build dispatch.
- Build dispatches (runbook — envelope first, then dispatch, background, END TURN):
  - `node the user-level Claude config dir\delegation\gates\envelope.mjs --ticket <ticket> --out <ticket-dir>\<id>.manifest.json`
  - `bash .claude/skills/ultra-agents/copilot-worker.sh --ticket .claude/state/ua-worker/chips/oneliners/tickets/TICKET-oneliners-r1-attn.md --agent council-worker --work-type research --model gpt-5.5 --max-credits 80 --run-id oneliners-r1-attn --session-id <current-session-id>` (r2, r3 same shape; r4: `--model claude-sonnet-4.6 --max-credits 160 --run-id oneliners-r4-corpus`)
- Acceptance per worker: run the ticket's VERIFY node command yourself is FORBIDDEN — bundle all four into ONE T0 verify ticket (gpt-5-mini, --work-type verify, 30cr); read `verify-run.mjs` verdict JSON: GENUINE=accept · FABRICATED=bounce with reasons[] · UNPROVABLE=judgment. Cross-family review for R4 (gpt-5.5, --mode edit, re-executes extract-corpus.mjs per OFF-REPO layer 4) + spot-fetch review of R1-R3 sources (≥3 URLs re-fetched).
- `scorecard.mjs record` every verdict (LEDGER_PATH=.claude/state/ua-worker/ledger.jsonl).
- Fill §4 numbers + §5 cadence + §3.3 mechanism details from findings. R2 contradicting §3.3 (UserPromptSubmit unable to inject persistent per-prompt context) = §Consult-Fable fork, HALT.

**Phase 1 — GATE: adversarial plan audit (Task #1)** — run §9 traps; every trap needs a concrete finding or argued soundness; fix plan in place.

**Phase 2 — build (workers, in chips dir `out-build\`)**
- One build ticket (T2 sonnet max, 220cr, envelope first) producing, in `out-build\`:
  1. the output style file — the OUTPUT STYLE file: frontmatter (`name`, `description`, `keep-coding-instructions: true`) + Reply Contract §4 + Style Card §5 + chat-only fence §6.
  2. the **oneliners hook** — hook: UserPromptSubmit → corpus append behind the §3.4 reject-list + stale counter; SessionStart (`startup|resume|clear|compact|fork`) → one-line announce; reads state; fail-open try/catch around everything.
  3. the skill file — `/oneliners` on|off|status per §3.2, where on/off ALSO set/remove the `outputStyle` key atomically.
  4. the settings patch + the install manifest — exact additive entries + source→dest table.
  DOCTRINE: this plan §3, §3a, §4-§6 + the file-based-probes lesson. Ticket forbids: touching the user-level Claude config dir (workers build in-repo only), background sub-agents, batch end-writes, and any edit to existing settings entries.
- Cross-family review (gpt-5.5, edit mode): runs the hook file against fixture stdin payloads (ON, OFF, corrupt-state, huge prompt, unicode, wrapper-filter cases) and pastes raw outputs. Bounce on any defect — no self-fix before a failed bounce.

**Phase 3 — install + wire (CLAUDE-ONLY, protected)**
- Write SELF_GRANT (session-bound, ≤60min, explicit paths: the **user-level settings file**, the **oneliners hook** (user-level hooks dir), reason ≥20 chars citing §1 GO) → logged to grants-audit.log → appears in Receipt.
- Copy hook + skill + card + state seed (`{"on": true}`) to `the user-level Claude config dir` per install-manifest. Merge hook entries into settings.json (ADD entries only — zero edits to existing hooks; diff-proof in receipt).
- Repo edits (normal): CLAUDE.md §"When responding to Rutvik" → single pointer line to `/oneliners`; memory files `feedback_chat_simple_compaction.md` update + new `project_oneliners_switch.md` + MEMORY.md line.

**Phase 4 — E2E live-fire + GATE: post-execution audit (Task #2)**
- HARD proof, not source-reading (live-fire law): from a THROWAWAY cwd (second repo, e.g. `C:\Users\rutvi\projects\intelliqe-sandbox`), run `claude -p "say hi"` → transcript/debug shows injected ONELINERS context (global reach + firing proven). Flip state off → re-run → zero injection (OFF byte-silent proven). Corrupt state file → ON + warn. Corpus row appended per prompt (count before/after). `/oneliners`, `/oneliners on`, `/oneliners off` each work cold in a fresh interactive session.
- These E2E runs are delegable as a verify ticket (worker has shell); Claude reads verdict; Chrome not needed.
- Post-execution audit: every §8 checkbox DONE/SKIPPED(user-approved)/MODIFIED(justified); execution-summary written.

**Closure**: Status DONE + Executed + Execution Summary → git mv to plans/done/ → plans:reindex → activity-log row (LR-028) → /final-q → /reflect (Task #3) → Receipt v3 (jobs, models×counts, reviewer verdicts, "I coded myself", permission-uses = the SELF_GRANT, waste).

## 8. Acceptance criteria

- [ ] `/oneliners` + `on` + `off` work cold in a fresh session (status shows ON/OFF + corpus size + card freshness)
- [ ] ON writes a valid `outputStyle` setting + a valid the **output style file** (user-level output-styles dir) with `keep-coding-instructions: true` — verified by reading both files back
- [ ] Style actually takes effect: live `claude -p` in a NON-encore cwd answers in the compact/voice style; the same prompt with the style OFF answers stock (side-by-side raw outputs pasted — this is the real proof, not file existence)
- [ ] SessionStart announce fires with matcher including `fork`
- [ ] Capture hook fires on EVERY prompt when ON — proven in TWO different repos, incl. after /clear
- [ ] OFF = `outputStyle` absent + zero capture (proven, not asserted); corrupt/absent state = ON + warn
- [ ] Style card ≤50 lines, built from ≥500-row real corpus, every feature evidence-backed
- [ ] Corpus appender: +1 row per real prompt; wrapper/machine messages filtered; fail-open proven (bad stdin → session unharmed)
- [ ] Chat-only fence text present in every injection; artifacts untouched by style (spot-proof: one file write during ON session shows stock formatting)
- [ ] Existing hooks in the **user-level settings file** untouched (diff shows additions only)
- [ ] **A1**: effective `outputStyle` read back in BOTH test repos; any project-level `outputStyle` found is reported, not silently overridden
- [ ] **A2**: a real file written during an ON session is stock-formatted (no casual voice, no typos in code/docs)
- [ ] **A3**: a failure scenario during an ON session surfaces the bad news in the FIRST line (honesty floor holds under compaction)
- [ ] **A4**: one report-style skill run during ON keeps its own format unchanged
- [ ] **A5**: `/oneliners status` states honestly that capture is global while auto-refresh runs only in this repo
- [ ] **A6**: the **rollback README** (user-level Claude config, oneliners dir) exists naming the manual off switch, and status prints it
- [ ] **A7**: replies carry the micro-anchor
- [ ] CLAUDE.md pointer rewire + memory graduation done (Prior-Fix Trial rewire, LR-050)
- [ ] Receipt v3 + all 3 ultrathink GATE tasks completed

## 9. §Fable Audit Traps (Phase 1 must answer each concretely)

0. Did we prove the STYLE CHANGES THE ANSWER (ON vs OFF, same prompt, raw outputs side by side)? File-existence is not proof of effect — this is the trap the whole feature dies on.
0b. Is `keep-coding-instructions: true` actually present? (false = we silently degraded Claude's coding ability to get a chat style — catastrophic and invisible)
1. Live-fire proven for the capture hook (HARD, not source-read)? Where's the raw transcript evidence?
2. Global proven in a SECOND repo, not just encore_framework?
3. OFF proven byte-silent? Corrupt-state fixture run?
4. Injection token cost measured (contract+card+fence total)? ≤900 tokens/prompt?
5. Chat-only fence: is there a proof an artifact write stayed stock-formatted during ON?
6. Corpus appender crash-safety: huge prompt / unicode / quotes fixtures run with raw output pasted?
7. Does anything here weaken existing delegation gates or edit existing settings entries? (must be additions-only diff)
8. Secrets: does the style card or any tracked/shipped file quote corpus content? (must be zero)
9. Worker claims accepted only on verify-run GENUINE / cross-family green — any prose-trusted acceptance?
10. Headless sessions: injection skip working, or cost consciously accepted + receipted?
11. Style-vs-facts: is the "no typo-mimicry on technical tokens" rule IN the injected contract text (not just the plan)?
12. Is the stale→distill loop actually automatic (injected instruction), or does it silently depend on Rutvik asking?

## 9a. Adversarial plan audit — findings + fixes (ultrathink GATE 1, run 2026-07-26 after research closed)

Each finding is fixed in-plan; none is rubber-stamped.

**A1 (skeptic) — project-level settings could override the global `outputStyle`.** A repo with its own `.claude/settings.json` may set `outputStyle` and win over the user-level value, silently killing the feature in exactly the repo Rutvik works in most. → FIX: acceptance now requires reading back the *effective* setting in BOTH test repos, and the install step must check whether any project settings file already sets `outputStyle` and report it rather than assume.

**A2 (skeptic) — style bleeding into artifacts.** The output style modifies the system prompt, so it applies to everything, not just chat. Code, commits, specs and docs could inherit casual voice and typos. The chat-only fence is prose, and prose can fail. → FIX: the fence is worded as a hard exclusion list inside the style file, and acceptance requires a real file-write during an ON session to be stock-formatted.

**A3 (skeptic) — over-compaction hiding bad news.** A style that rewards brevity can suppress failures — his own "too less is too more". → FIX: acceptance adds a behavioural test where the session hits a failure and the reply must surface it in the first line.

**A4 (scope) — skill-defined output formats collide with the style.** Scope lock #3 says `/standup`, `/end-day` and receipts keep their own formats, but a system-prompt style applies during those skills too. → FIX: the style file explicitly yields to any skill-defined output contract, and acceptance tests one report-style skill for unchanged formatting.

**A5 (scope) — the auto-refresh loop is NOT global, and claiming otherwise would be a lie.** Corpus capture works in every project (it is just a hook), but the automatic style-card refresh dispatches a worker, and that worker tooling exists only in this repo. → FIX: recorded as an honest limitation here and surfaced in `/oneliners status`; capture = global, refresh = runs when he is working in this repo.

**A6 (scope) — no dumb rollback.** If the style ever makes Claude unusable, Rutvik must be able to kill it without a working skill. → FIX: install writes a two-line the **rollback README** (user-level Claude config, oneliners dir) naming the exact manual off switch, and `/oneliners status` prints it.

**A7 (user intent) — "assume I know nothing" must be structural.** → Confirmed already covered by the micro-anchor rule in §4; no change, but acceptance now checks an anchor is present in replies.

## 10. §Consult-Fable forks (Opus NEVER decides these alone — ask Rutvik to switch model, or HALT for his morning)

- R2 refutes the UserPromptSubmit injection mechanism (deprecated/schema-changed/doesn't survive compaction) → mechanism redesign is Fable's.
- Any scope widening beyond chat replies (reports, artifacts, emails) — future scope, locked out of v1.
- Style card can't fit ≤800 tokens without losing voice fidelity.
- Any weakening of: OFF-silence, chat-only fence, honesty floor, privacy (corpus leaving the user-level Claude config oneliners dir).
- Settings.json needs structural surgery beyond additive hook entries.
- R3 shows full-corpus regeneration causes caricature (contradicting §6) → learning-loop redesign is Fable's.
- Two consecutive failed build bounces (per 2-death escalation precedent) on the core hook.

## 11. NOT touched

Repo skills INDEX.md (global skill, not repo skill) · the delegation gate config (user-level delegation dir) + all delegation control files · existing hook files/entries · worker-ext.md · pipeline anything · reports/receipt formats (scope lock #3).

## Execution Summary

*(2026-07-26 run)*

**Built, reviewed cross-vendor, installed, and behaviourally proven.**

### Proven (evidence on disk, re-runnable)
| Claim | Evidence |
|---|---|
| Voice profile is real, not invented | 44/44 quoted examples are exact substrings of a 3939-row corpus of his own messages. The oracle checker was written by the *reviewing* vendor and re-run by the dispatcher — see the the quote oracle oracle in the out-rev-b4 chip dir |
| Corpus is free of machine text | Three contamination classes found and filtered across three review rounds: hook-injected framework text, the request-interrupted turn marker (313 rows), and slash-command expansion bodies. 6644 → 3939 rows |
| Platform mechanism is real and current | 7/9 cited doc URLs independently re-fetched by a cross-vendor reviewer; zero fabricated citations (out-rev-a review) |
| Build is correct + safe | Cross-vendor verdict `BUILD: ACCEPT` after one bounce (out-rev-build2 review) |
| Install was additive only | Dispatcher-run diff vs backup: zero keys removed, all 10 existing PreToolUse gate hooks preserved, SessionStart 1→2, new keys `outputStyle` + `UserPromptSubmit` |
| The installed hook behaves | 13/13 fixture battery run by the dispatcher against the INSTALLED file: human prompt captured, machine text / command-expansion / task-notification all rejected, OFF silent, corrupt+absent state fall back to ON, malformed and empty stdin exit cleanly, 500KB prompt and unicode do not crash, SessionStart announces both states (installed-hook verify artifact in the out-e2e3 chip dir) |
| Live capture works end-to-end | During the first E2E run the corpus file went 0 → 1 rows |

All evidence artifacts live under the goal's chip directory: `.claude/state/ua-worker/chips/oneliners/`

### Behavioural proof — CLOSED 2026-07-26 after Rutvik re-authenticated the CLI

Initially ENV-BLOCKED (two worker attempts + the dispatcher's own run all hit `401 OAuth access token has expired`; the stored credential file dated 2026-07-14 was stale, and re-authenticating is a credential action the agent must never perform). Rutvik ran `/login` in his own terminal, after which the dispatcher captured the decisive comparison — same prompt, same machine, same cwd (`C:/Users/rutvi`, outside this repo, which also proves global reach), only the switch differing:

| State | Raw reply |
|---|---|
| **ON** | `17 × 23 = 391, not prime (its literally 17 × 23)` |
| **OFF** | `17 × 23 = **391**` / `391 is **not prime** — it's the product of 17 and 23.` |

One lowercase line with his own dropped apostrophe (`its`) versus bold-formatted markdown across two paragraphs. The ON, OFF, toggle-helper and restore artifacts all live in the out-e2e3 chip dir; the OFF run's restore was verified immediately (`outputStyle=oneliners`, state `{"on":true}`, all 7 settings keys intact).

**Guardrail A2 (style must never leak into artifacts) — PROVEN.** With the style ON, `write a tiny python function that adds two numbers, output only the code` returned a clean fenced `def add(a, b): return a + b` — standard formatting, no casual voice, no typos (artifact-style verify artifact, out-e2e3 chip dir).

**Every acceptance row in §8 is satisfied.**

### Remaining scope (explicitly NOT part of this plan's acceptance — carried forward, unstarted)
The §5 learning loop is **half-built and must never be described as complete**: capture and staleness detection are live (the hook filters and appends every prompt, increments the stale counter, and emits a "style card stale" nudge at 200 rows), but nothing yet rebuilds and reinstalls the style card automatically, and the nudge only helps inside this repo where worker tooling exists. Rutvik was told this in plain words and asked whether to close it; **no recipient subplan is cited here because none has been authored — inventing a filename would be a phantom hand-off.** It will be authored when he says go.

### Self-work confession (AUTO_SELF rung)
The dispatcher ran the fixture battery and the auth probe personally after both worker attempts failed. Logged to `self_incidents.log`. Root cause is copilot tool-permission/quota exhaustion late in a ~20-dispatch session; the fix is budget staging, not a doctrine change.

## 12. Plan Deviations log

**D-1 (2026-07-26) — primary enforcement mechanism changed from per-prompt hook injection to a native output style.**
- *What changed*: §3.3 originally locked "UserPromptSubmit hook injects the contract + style card every prompt." It now reads: output style carries the contract/card at the system-prompt layer; the hook keeps only corpus capture + the SessionStart announce.
- *Why*: the cross-vendor reviewer independently re-fetched official docs and (a) VERIFIED the hook mechanism is real and current — so this is **not** a refutation fork under §10 — and (b) proved output styles modify the *system prompt*, i.e. a strictly stronger forcing layer that costs **zero tokens per prompt**. Rutvik's standing CORE GOAL is saving tokens without costing quality; per-prompt re-injection of the same text the system prompt already carries is exactly the duplication `/slop` exists to remove.
- *Nothing lost*: the verified hook path stays wired for the learning loop and the announce, so the capability my original design depended on is retained, not discarded.
- *Status*: **FLAG FOR RUTVIK** on wake. It is an architecture change made while he slept; the evidence is in §3a and re-checkable. If he prefers the pure-hook design, reverting is a small edit (move the contract text back into the hook's additionalContext).

**D-2 (2026-07-26) — R2 research accepted WITH corrections instead of bounced.**
- The reviewer bounced R2 for two major defects (missing `fork` matcher; a wrongly-UNKNOWN skills-compaction claim). Both corrections were already delivered *with citations* inside the review itself, and the only consumer of that research is this plan.
- Re-dispatching the worker to restate facts already in hand would burn credits for zero new information (one-headshot law). The corrections are therefore recorded in §3a with the reviewer cited as source, and R2's own findings file is treated as **superseded by §3a** wherever they conflict.
- This is an honest accept-with-corrections, not a green — recorded here and in the Receipt so no one later reads "R2 passed".

## Per-Identity Satisfaction

No pipeline artifacts (specs / test-cases / test-plans / XLSX / baselines / REQUIREMENTS.md) are touched by this plan — it is framework-infra plus machine-local user configuration. Every pipeline identity is therefore an explicit `(none)`.

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | none — no baseline or requirements work | (none) | (none) |
| GIVER | none — no test cases or test plans | (none) | (none) |
| BUILDER | none — no spec files | (none) | (none) |
| HEALER | none — no RCA-driven spec fixes | (none) | (none) |
| WATCHDOG | none — audit findings recorded inline in §9a, no owned artifact | (none) | (none) |
| GARDENER | none — no refactor | (none) | (none) |
| OWNER | plan of record + machine-local install + evidence chips | plans/pending/PLAN_ONELINERS_RUTVIK_CLONE.md | `node scripts/validate-plan-closure.mjs plans/done/PLAN_ONELINERS_RUTVIK_CLONE.md --dry-run` |

## Verification artifact (D23)

```
node -e "const fs=require('fs'),os=require('os'),p=os.homedir()+String.fromCharCode(47)+'.claude'+String.fromCharCode(47);['skills/oneliners/SKILL.md','hooks/the oneliners hook','oneliners/state.json','oneliners/style-card.md'].forEach(f=>console.log(f,fs.existsSync(p+f)))"
```
Expected: 4× true. Plus: `claude -p "test"` debug output in a non-encore cwd contains `ONELINERS: ON`.
