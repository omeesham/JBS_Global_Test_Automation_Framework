# PLAN — Orchestration-Efficiency Learning Layer (scorecard · probation · propose-only promotion · $-aware routing)

**Status**: DONE
**Executed**: 2026-07-11

**Repo landing name**: `plans/pending/PLAN_ORCH_EFFICIENCY_LEARNING.md` (vendor-neutral name; executor MUST add it to `.git/info/exclude` BEFORE writing the file — same secrecy pattern as `PLAN_ULTRA_AGENTS_COPILOT_WORKER.md`).

**Authorship trail**: masterminded by Fable (planner/advisor ONLY — Rutvik directive 2026-07-10: "fable only the mastermind planner advisor"). Ultrathink adversarial audit run in-session by Fable (3 angles, findings folded — see §Audit-folds). Execution belongs to a SEPARATE fresh orchestrator session (Opus, not Fable), which routes all building through the local worker fleet per the takeover doctrine and gets an independent cross-family review at build time.

---

## Frontmatter (LR-041)

- **Model**: Opus (orchestrator session; workers per routing ladder — build=T2, review=T4)
- **Thinking**: ultrathink at plan-audit + post-exec-audit gates; standard otherwise
- **PermissionMode**: default (two PROTECTED-file splices require Rutvik-approved SELF_GRANTs at execution time — grants are per-edit, logged, burned)
- **Identity**: OWNER (non-pipeline; no pipeline-owned files touched)

## Bootstrap (executor session MUST do this first, in order)

1. Read `.claude/skills/ultra-agents/worker-ext.md` END TO END (doctrine; also the file this plan modifies).
2. Read `DUTY_STACK.md`, `ticket-template.md`, `config.json`, `model-registry.json` (all in the home-dir delegation store).
3. `grep -q PLAN_ORCH_EFFICIENCY_LEARNING .git/info/exclude || echo "plans/pending/PLAN_ORCH_EFFICIENCY_LEARNING.md" >> .git/info/exclude` — THEN copy this plan there.
4. Secrecy contract (Swiss-Alps, absolute): zero vendor strings ("copilot", model ids, agent names) in ANY tracked file. All new artifacts live in `~/.claude/delegation/` (outside repo). The two in-repo files touched (`copilot-worker.sh`, `worker-ext.md`) are git-excluded — verify with `git check-ignore` before editing.
5. This session is subject to the SessionStart delegation primer: workers build, reviewer prosecutes, Claude dispatches/gates/splices-protected-files only.

---

## Context

The delegation system now self-discovers model *availability* and *think-tiers* (dynamic registry, shipped 2026-07-10). But **who gets which job** is still a hand-written static ladder (worker-ext.md lines 56–66), and nothing measures whether a model is getting better or worse at a job type, nor what each dispatch costs. Rutvik's ask (2026-07-10): "will it know how capable it is and how to use it efficiently… models get smarter… costs change… we need dynamic learning of how to orchestrate for efficiency."

Rutvik's two locked steering decisions (2026-07-10, in-chat):
1. **Rank changes are PROPOSE-ONLY** — the system computes promotions/demotions and presents evidence; Rutvik approves each one in chat before the rulebook changes. No auto-apply path may exist.
2. **Cost intent** — billing is unlimited (no monthly cap), but the standing goal is **100% deliverable quality while never burning more $ than needed**. Formalized selection rule: *quality floor first (only models PROVEN at that work type), then cheapest among those*. Cost never overrides quality.

Core insight the design must state plainly (it answers Rutvik's question): **model version bumps arrive as new model ids** → they flow through the existing auto-probe → enter probation → earn their rank from measured results. "Opus gets smarter" and "mini gets cheaper+smarter" are both just evidence accumulating in the scorecard.

## Verified facts (explored 2026-07-10 — plan must not contradict)

- `ledger.jsonl`: **157 real rows** (151 at plan-authoring; +6 landed during execution — LR-020 recompute 2026-07-10); fields exactly `{run_id, mode, model, agent, effort, exit, ok}`. **No work-type, no ticket-id, no outcome field.** Drift: 4 rows lack `agent`; 6 rows have placeholder `model:"agent-pinned(...)"` (3 planner + 3 reviewer). `ok` means "dispatch completed with output", NOT "work was good".
- Wrapper flag set (11 flags, parser lines 41–56): `--task --mode --model --effort --agent --run-id --timeout --ticket --interrogate --questions --allow`. No work-type flag. Ledger printf at lines 207–208.
- Historical work-type is partially inferable from `agent`: council-reviewer→review (48), council-planner→draft (44), council-worker→build (13), council-verifier→verify (3), empty/absent (43)→legacy.
- `model-registry.json` rows are REBUILT by the auto-probe with a fixed 5-key schema → any extra key on a row would be silently dropped. **Cost data must live in its own file.**
- Ladder = worker-ext.md lines 56–66; quality dial = 87–90; Receipt v3 = 111–125. Receipt already promises work-type counts "reconcilable against ledger.jsonl" — currently unbackable (no field). This plan closes that gap.
- Fleet-side per-model $ multipliers are published by the vendor but NOT machine-readable via the CLI — verification is a docs/settings read at execution (LR-059: never assume the numbers).
- Dynamic-gap sweep (2026-07-10, all verified on disk): all 4 agent profiles hardcode exact model-id pins in frontmatter; `candidates.txt` is a hand-typed 5-id list (discovery = manual); the wrapper captures neither CLI version (1.0.70 today, self-updating) nor dispatch duration; `discover.sh` references a `_disc_source_guard` that registry-block.sh never checks (latent full-run defect).
- Second sweep (2026-07-10, disk-verified): duty/parity schema exists in ≥3 copies (DUTY_STACK.md canonical; council-worker.agent.md 65 lines/9 refs; ticket template) + primer hardcodes 3 doctrine-list summaries → sync-drift class. Git hooks are TRACKED at `.githooks/` but `core.hooksPath` + the 4 `.git/info/exclude` secrecy entries are LOCAL-ONLY (re-clone silently disarms both). 4 of 5 seed probe_dirs ABSENT (only gpt-5-mini-auto exists). `--effort` is decorative by design (registry-block.sh:150). Reviewer profile already carries 2 appended lessons (feedback loop live, growth unbounded).

## Design (what gets built)

All new files in `~/.claude/delegation/` (outside repo). No new hooks (LR-069: no new gates needed — "ask me each time" removes the auto-write surface).

### D1 — `outcomes.jsonl` (new, append-only event stream)
One row per REVIEWED dispatch, appended by the dispatcher at verdict-reading time:
`{ts, run_id, ticket_id, work_type, outcome, bounces}` where `outcome ∈ {green, bounced-then-green, refuted, env-blocked, failed}` (`green` = first-pass). Joined to `ledger.jsonl` on `run_id`.

### D2 — `scorecard.mjs` (new, node, zero deps, ≤~250 lines)
- `record --run-id X --ticket T --work-type W --outcome O [--bounces N]` — validates enums AND that run_id exists in ledger (fail loudly on typo; no orphan rows), appends to outcomes.jsonl.
- `report [--session <prefix>]` — per (model × work_type): dispatches, first-pass-green %, bounce %, refute %, est. $ burn (dispatches × multiplier × per-request price from model-costs.json). Human table + `scorecard.json`. Legacy rows (no outcome row) counted as dispatch-only with work_type inferred from the agent map above; bucket `untyped/unknown-outcome` shown explicitly — **the report NAGS when recent dispatches lack outcome rows** (structural reminder, closes the discipline gap).
- `propose` — applies the deterministic rules (D4) and PRINTS proposed rank changes with evidence. **Never writes the policy.**
- `commit --change <id>` — applies ONE proposed change to `routing-policy.json` + appends to `routing-changes.log` with `approved: in-chat <date>`. Only runnable after Rutvik's explicit in-chat yes; the receipt must show each commit.

### D3 — `routing-policy.json` (new — the living rulebook)
`{version, updated, work_types: {build|review|verify|draft|rca|walk|probe: [{model, status: proven|probation|benched, since, evidence}]}}`.
Seeded from the current T0–T4 ladder as `proven` (they earned it across 151 real dispatches). Dispatcher consults this file at ticket-writing time: **cheapest `proven` model for the work type; no proven → escalate per ladder + flag.** Two hard constraints on selection (2nd-sweep finds): (a) **cross-family rule is a CONSTRAINT, not a preference** — review/verify of model X's work must pick a different family than X (family = id prefix, derived dynamically); if the cheapest proven reviewer is same-family, take the next candidate; (b) **probation dispatches ALWAYS get the full review pyramid and never carry protected-file or publishing steps.** New registry models auto-appear in `propose` output as probation candidates for LOW-RISK types only (verify/draft/probe) — never review/judgment until proven.

### D4 — Deterministic rank rules (encoded in scorecard.mjs, shown in --help)
- Window: last 10 known-outcome dispatches per (model × work_type); **no rule fires under 5 samples** (small-N guard).
- probation → proven: ≥5 samples AND first-pass-green ≥80%.
- proven → probation: green <60% over window, OR ≥2 `refuted` in window.
- probation → benched: green <40% (min 5).
- benched → anywhere: MANUAL only (Rutvik/Claude decision, logged) — no auto-resurrection thrash.
- Hysteresis: max one status step per propose/commit cycle.
- All transitions are PROPOSALS (Rutvik-gated per locked decision 1).

### D5 — `model-costs.json` (new, manually verified — separate file so the auto-probe can't clobber it)
`{verified_date, source, per_request_usd, models: {id: {multiplier, verified_date}}}`. Executor seeds it by VERIFYING the vendor's published per-model multipliers (docs/settings page via WebFetch or Rutvik's settings screenshot — LR-059). Unverifiable → `"multiplier": null` + `"UNVERIFIED"` note; scorecard then falls back to ladder order as the cost proxy and the report says so. Staleness: `verified_date` >60 days → report + receipt warning line.

### D6 — Wrapper splice (PROTECTED — SELF_GRANT required)
`copilot-worker.sh`: add `--work-type <w>` flag (parser, one case line) + `"work_type":"%s"` into the ledger printf (lines 207–208). Empty when not passed (backward-compatible; scorecard buckets as untyped and nags). Convention: interrogations inherit `review`; registry auto-probes log `probe`.

### D7 — Doctrine splice (PROTECTED — SELF_GRANT required)
`worker-ext.md`:
- Ladder section (56–66): keep the T0–T4 table as the SEED/prior; add the living-policy paragraph — consult `routing-policy.json` at dispatch; pass `--work-type` on EVERY dispatch; `record` every verdict BEFORE composing the digest/receipt; quality floor first, then cheapest.
- Quality dial (87–90): add cadence — `scorecard.mjs report` at receipt time; `propose` when the report shows a rule would fire; commits only after Rutvik's in-chat yes.
- Receipt v3 (111–125): add two optional lines — `- Rulebook proposal: <model> ⇄ <status> on <work type> (<evidence>) — awaiting your yes` and `- Rulebook update (you approved): ...`; Waste line gains `≈$<burn> this goal` when cost data is verified.

### D8 — CLI-drift sentinel (new; gap verified 2026-07-10: wrapper records NO CLI version, assumes ~10 exact flags)
The CLI self-updates (1.0.70 today); a renamed/removed flag breaks every dispatch with zero warning. Fix (warn-early, not gate): wrapper captures `copilot --version` once per run; on version CHANGE vs the stored `cli-version.txt` (home-dir delegation store), it greps `copilot --help` for the required-flag list and prints a LOUD warning naming any missing flag + a receipt line. Never blocks — the CLI erroring on a truly-removed flag is already the fail-closed backstop; the sentinel is the early-warning layer. Also: add `"secs":<duration>` to the ledger printf (same D6 splice — dispatch duration is a free efficiency signal, collected now, tuning deferred).

### D9 — Agent-pin freshness (new; gap verified 2026-07-10: all 4 agent profiles hardcode exact model ids in frontmatter)
Pins go stale the day a model version-bumps. Two-part fix: (a) dispatch convention — the dispatcher passes `--model` explicitly from routing-policy on every agent dispatch; pins become fallback-only. (b) `scorecard.mjs report` cross-checks every `~/.copilot/agents/*.agent.md` pin against the registry + policy: pin not in registry → stale-pin warning; policy has a cheaper/better PROVEN model for that agent's work type → surfaces as a proposal (same Rutvik-gated propose flow). Model FAMILY (for cross-family review rules) is derived dynamically from the id prefix (`claude-*`/`gpt-*`/`gemini-*`/anything-new) — no hardcoded family map anywhere.

### D10 — New-model DISCOVERY (new; gap verified 2026-07-10: candidates.txt is a hand-typed 5-model list)
Auto-probe today only fires on *attempted* unknown models — a newly-ENABLED model is invisible until someone hand-adds it. Executor must VERIFY (not assume, either way — LR-059): does the CLI expose any model enumeration (help text, a models subcommand, or the not-available error listing alternatives)? If YES → wire `discover.sh` to it; registry-vs-catalog diff on `scorecard.mjs report` surfaces "new model enabled → probation candidate" proposals automatically. If NO → candidates.txt stays manual and the report NAGS when it is >30 days unrefreshed. Either outcome is recorded in the plan's log-of-record with the probe evidence.
**Latent defect to fix in the same ticket (verified)**: `discover.sh` sets `_disc_source_guard` and claims registry-block.sh checks it — the shipped registry-block.sh has NO such check, so a full discovery run would execute the main dispatch on a sentinel model and hit the exit-2 path. Worker must fix (honor the guard in registry-block.sh or inline the parse helpers in discover.sh) + prove with a real `--dry-run` AND one real full run.

### D12 — Drift & integrity sentinels (2nd sweep, all disk-verified 2026-07-10)
Three cheap self-checks, no new hooks (they ride existing surfaces):
- **Doctrine-copy sync**: the duty/parity schema lives in ≥3 copies (canonical DUTY_STACK.md; council-worker.agent.md embeds it — 65 lines, 9 schema refs; ticket template) and the SessionStart primer hardcodes 3 doctrine-list summaries. When the canonical changes, the copies silently lie. Fix: a `doctrine-version: N` stamp in worker-ext.md; primer + scorecard `report` compare their expected N and the report greps the canonical schema field-names against each embedded copy — mismatch → loud warning naming the stale file.
- **Re-clone disarm**: `core.hooksPath=.githooks` (verified: hooks themselves are TRACKED) and the 4 secrecy entries in `.git/info/exclude` are both LOCAL-ONLY — a fresh clone silently loses the leak-gate wiring AND the exclusions. Fix: the primer (already runs every session) verifies both and prints a loud warning line into its injection when either is missing. (Primer edit = protected → rides the D11 grant session.)
- **Lesson lifecycle**: the feedback loop appends lessons to agent profiles unboundedly (reviewer profile already carries 2). `report` nags when a profile exceeds a line-threshold (default 100) or holds near-duplicate lessons → consolidation proposal (Rutvik-gated like everything else).

### D11 — Protect the decision files (new hardening, small)
Add `scorecard.mjs` + `routing-policy.json` to the delegation-gate PROTECTED list (one hook edit, under grant, covered by this plan's approval): direct hand-edits then require a logged grant, while the deterministic `commit` path (Bash) remains the designed writer — Claude cannot silently rig the rules or the rulebook. `model-costs.json` stays unprotected deliberately (routine 60-day re-verification would make grants pure friction; staleness is receipt-surfaced instead).

### Non-goals (cut deliberately — simplest-first; 2nd-sweep items marked ②)
Decay-weighted scoring, per-task difficulty normalization, auto-benching resurrection, cost auto-scraping, timeout auto-tuning (duration data collected via D8, tuning deferred), learning the CLI's quota-warning string patterns (grep list stays static — accepted limit), restructuring the 8 loose TICKET-*.md files in the delegation root (noticed → executor's adjacent-sweep gets a disposition line, default LEAVE).
② **Effort-per-work-type tuning** — `--effort` is currently decorative BY DESIGN (registry-block.sh:150 always overrides to the model's top tier; deliberate anti-silent-degrade floor). Executor must NOT "fix" this as a bug; revisit only when duration data shows top-effort waste on trivial work types.
② **Multi-repo gate scope** — delegation-gate hardcodes this one repo; CLAUDE.md's own trigger ("second repo → package as plugin") hasn't fired. Config-driven repo list deferred until a second repo exists.
② **Guard allowlist of pipeline agent types** (ua-worker-guard) — internal, deliberate, rarely changes; hand-edit under grant is the right ceremony. Swept and accepted.
② **Ledger rotation** — 151 rows today; revisit at >10MB, trivial then.
② **Per-model context-tier capture** — verify-both-ways at execution: if the probe capability block exposes per-model context tiers, capture them in the registry and make `--context long_context` conditional; if it doesn't (likely — today's evidence shows it only in the CLI agent-schema region), the hardcoded flag stands with the CLI's own loud-fail as backstop. Record which way it went in the log-of-record.

## Execution steps (fresh Opus orchestrator session)

1. Bootstrap (above) + create ultrathink gates (adversarial audit of THIS plan vs reality drift; post-exec audit; reflect).
2. **Ticket A (T2 build, OFF-REPO: no)**: build D1-format doc, D2 scorecard.mjs (incl. D9 pin-freshness check + D10 catalog-diff/nag), D3 policy seed, D5 costs skeleton, D10 discover.sh fix (source-guard defect) + candidates wiring. ACCEPTANCE (machine-checkable): `node --check scorecard.mjs` clean; `record` rejects a bad run_id AND a bad enum; `report` runs on the REAL 157-row ledger and its per-model dispatch counts EQUAL the recomputed known truth (gpt-5.5=58, opus=49, sonnet=36, mini=4, haiku=4, agent-pinned=6 [planner 3 + reviewer 3]; 4 rows agent-absent — LR-020 recompute 2026-07-10); legacy inference maps agent→work_type exactly as §Verified-facts; `propose` on real data proposes ZERO changes (all seeds proven + insufficient outcome samples — proves the small-N guard); `discover.sh --dry-run` exits 0 (defect fixed); report shows the 4 real agent pins as FRESH (they match the registry today — proves the check reads real files, not hardcoded).
3. **Ticket B (T4 cross-family prosecutor review)** of Ticket A — presumption of guilt; must independently re-run the acceptance commands. Defect → bounce to worker (never self-fix first).
4. Promotion/demotion path test (REAL data replayed, not invented): copy real ledger+outcome rows into a labeled scratchpad fixture dir; filter/duplicate to trip exactly one promotion and one demotion; assertions written BEFORE the run (blind-parity spirit); verify hysteresis + audit-log lines; verify `commit` refuses without `--change` id.
4b. **D10 verification leg**: executor tests whether the CLI enumerates models (help text / subcommand / error-listing) — real probe, evidence in log-of-record — then wires discover.sh accordingly (auto-diff) or arms the 30-day nag (manual).
4c. **Probe-evidence backfill (closes a carried blocker)**: run the FIXED discover.sh for real across all 5 seed models — 4 of 5 seed `probe_dir`s are ABSENT on disk (verified 2026-07-10; only gpt-5-mini's exists). One run backfills real capability evidence for every seed row AND exercises the auto-probe live-dispatch path that the registry work shipped unexercised. Assert: 5 probe dirs exist after; registry rows unchanged in effort_top (probes must CONFIRM the seeds, not silently alter them — any mismatch = HALT and investigate, it means a tier changed upstream).
4d. **D12 sentinels**: doctrine-version stamp pair written; scorecard cross-copy check green on today's files; lesson-count nag threshold set; primer integrity check added (rides the D11 grant — primer is protected).
5. **D6+D8 wrapper splice** (ONE grant, one edit session): `--work-type` flag + `work_type` and `secs` ledger fields + CLI-version sentinel. `bash -n` + one REAL trivial dispatch with `--work-type verify` → ledger row carries both new fields → `record` its outcome → `report` reflects it end-to-end; simulate a version change (edit cli-version.txt) → sentinel warns loudly.
6. **D7 doctrine splice** — second SELF_GRANT, same ceremony. **D11 gate-hook edit** — third SELF_GRANT (delegation-gate.mjs is itself PROTECTED): add the two decision files to the PROTECTED list; live-test with a real stdin fixture (Edit on routing-policy.json → deny without grant).
7. Post-exec audit (every deliverable DONE/SKIPPED-approved/MODIFIED-justified) + secrecy sweep (`git status --porcelain` shows no new tracked files; vendor-string grep on anything tracked = unchanged) + Receipt v3 with the new lines exercised + log-of-record append to the git-excluded plan + /reflect + /final-q.

## Verification (D23 — runnable checks)

- `node ~/.claude/delegation/scorecard.mjs report` → table; per-model totals = 57/48/33/4/3/6; untyped bucket visible; zero crash on the 4 agent-less legacy rows.
- `node scorecard.mjs propose` on untouched real data → exactly 0 proposals.
- Fixture run → exactly 1 promotion + 1 demotion proposed, matching pre-written assertions; `commit` writes policy + audit line; second `commit` of same id refuses (idempotence).
- `grep -c work_type .claude/state/ua-worker/ledger.jsonl` ≥1 after step 5's real dispatch; same row carries `secs`.
- `bash ~/.claude/delegation/discover.sh --dry-run` → exit 0, lists 5 candidates, probes nothing (defect fixed).
- Sentinel test: change `cli-version.txt` → next dispatch prints the version-change warning naming the checked flags.
- Pin-freshness: `scorecard.mjs report` lists all 4 agent pins as fresh TODAY; hand-edit one pin to a fake id in a scratch COPY of the agent dir → report flags it stale (test against the copy, never the live profile).
- Gate fixture: stdin Edit-event on `routing-policy.json` → DENY without grant (D11 live-proof).
- Backfill: all 5 `probe-<model>*` dirs exist after the discovery run; registry effort_top values unchanged (probes confirm seeds).
- D12: bump the doctrine-version stamp in a scratch copy → sentinel warns; remove a line from a scratch `.git/info/exclude` copy scenario → primer integrity check warns (test harness may simulate via env/paths — never disarm the real exclusions).
- Cross-family constraint: unit-style check — fixture where cheapest proven reviewer shares the worker's family → selection returns the next family, never same-family.
- `git check-ignore plans/pending/PLAN_ORCH_EFFICIENCY_LEARNING.md` = ignored; `git status --porcelain` clean of new tracked files.
- `grants-audit.log` shows exactly 3 new entries (D6+D8 wrapper, D7 doctrine, D11 gate-hook), all burned.

## Audit-folds (adversarial findings already incorporated)

- *Skeptic*: outcome-recording drift → report NAGS on missing outcome rows + doctrine orders `record` before digest (D2/D7). run_id typo orphans → `record` validates against ledger. Tiny mini/haiku sample (7 rows) → system honestly learns forward, no fake bootstrap.
- *Scope*: untyped dispatches (probes/interrogations) get conventions (D6); over-engineering cut list explicit (§Non-goals); loose-ticket hygiene deferred with disposition.
- *Intent*: "ask me each time" → propose/commit split, NO auto-write path exists; version-bump-as-new-model stated as the core mechanism; quality-floor-then-cheapest encodes "100% quality while not burning more than we need"; execution NOT by Fable.
- *Second sweep (Rutvik: "find other missing dynamic stuff — don't assume, don't give up")*: four gaps found + verified (agent pins D9, discovery D10, CLI-drift+duration D8, decision-file protection D11) + one latent defect (discover.sh source-guard). Sentinel deliberately warns-not-blocks (CLI's own unknown-flag error is the fail-closed backstop — no new gate, LR-069 bloat governor). Pin-freshness tested against a COPY of the agent dir, never live profiles. D10 written verify-both-ways: neither "CLI can enumerate" nor "CLI cannot" is assumed.
- *Third pass (same mandate, deeper — interactions + my own design)*: caught a gap in MY OWN D3 (cross-family must be a hard constraint on reviewer selection, else "cheapest proven" could one day assign a same-family reviewer); doctrine-copy sync drift (D12) incl. the primer's hardcoded list summaries; re-clone disarm of hooksPath+exclusions (D12 — initially misdiagnosed as "pre-push missing", corrected by checking `core.hooksPath` before concluding); lesson-growth lifecycle (D12); probe-evidence backfill closing the carried auto-probe live blocker (4c). Every ② non-goal is listed with its evidence rather than silently dropped.

## Honest limits

- Learning is only as good as outcome discipline — the nag + doctrine order mitigate, not guarantee.
- $ figures are estimates (multiplier × per-request price) and go stale; 60-day staleness warning is the control.
- 151 historical rows carry no outcomes — the scorecard starts life mostly "unknown-outcome"; real ranking power accrues over the next weeks of dispatches.
- Probation for genuinely-new models still requires Claude to actually route low-risk tickets to them — `propose` surfaces candidates, it cannot force dispatches.

---

## Execution Log of Record (Opus orchestrator — resumed session 2026-07-11)

**Reconciliation on resume (disk-truth beat the compaction summary).** Grants-audit + file mtimes proved a pre-compaction turn already completed: Ticket-A build (scorecard.mjs + D1/D3/D5/D10), Ticket-B cross-family review (orch-reviewB2, 13/14 VERIFIED), the 8-file promotion to `~/.claude/delegation/` (scorecard.mjs byte-identical to sandbox), the fixture promote/demote test (real `commit` line in routing-changes.log), and all THREE protected splices — D6+D8 wrapper (`--work-type` + `work_type`/`secs`/CLI-sentinel; live-tested via ledger rows `orch-d6test`/`orch-d6test2`), D7 doctrine, D11 gate (scorecard.mjs + routing-policy.json now in PROTECTED) + D12 primer re-clone-disarm. Grants for all logged in `grants-audit.log`.

**Ticket-B (orch-reviewB2) BOUNCE was a ticket-check defect, not a code defect.** Items 1–13 VERIFIED (cross-family `select` works both directions + exhausted-case; path-resolution env overrides work; regression clean; 254 lines; propose=0; commit refuses; record rejects bad run_id). Item 14 (`git status --porcelain` proves only scorecard.mjs changed) was UNPROVABLE as authored because `.claude/state/ua-worker/` is git-ignored → status is empty by design. Re-verified myself with the git-ignore-aware command: `git status --porcelain --ignored` → `!! .claude/state/ua-worker/` = nothing tracked changed. Substantively GREEN → promotion stands.

**D10 verify leg (task #76): the CLI does NOT machine-enumerate models.** Verified — no `models` subcommand; `candidates.txt` stays the manual 5-id list; `discover.sh` arms the >30-day nag path (the "NO" branch of the plan's verify-both-ways). D10 source-guard latent defect is FIXED: `registry-block.sh:133` now honors `_disc_source_guard`; `discover.sh --dry-run` → exit 0, lists 5, dispatches nothing.

**4c probe-evidence backfill (task #77) — the one genuine gap the resume closed.** Finding: a plain `discover.sh` run SKIPS every already-registered model (`_dynreg_lookup` hit → `SKIP++`), so the earlier "5 live probes" run exited 0 while probing NOTHING and creating no probe dirs — a misleading exit-0. The `_dynreg_auto_probe` live path was still UNEXERCISED (its own comment said so). Closed via blind-parity: copied `discover.sh`+`registry-block.sh`+an EMPTY registry into a scratch dir → `_dynreg_lookup` misses → all 5 probed live (smoke-tested gpt-5-mini first, 22.8s, then the other 4, 68s) → real 200KB+ debug logs written to `~/.claude/state/ua-worker/probe-<model>-auto` → results appended to the SCRATCH registry (production untouched). Blind-parity diff: **all 5 effort_top MATCH production** — opus=max, sonnet=max, gpt-5.5=xhigh, gpt-5-mini=high, haiku=none — zero drift, no HALT; probes CONFIRM the seeds. Then materialized the audit anchors: production `model-registry.json` `probe_dir` fields updated to the real evidence paths + "live-probe-confirmed 2026-07-11" notes; effort_top verified UNCHANGED for every row (only probe_dir + note touched). Live end-to-end proof: `scorecard.mjs report` under production topology (`LEDGER_PATH`/`AGENTS_DIR` overrides) shows real per-model counts, `gpt-5-mini verify: 3 disp / 100% green` (the D6/D8 rows flowing record→report), the discipline NAG firing, D9 all-4-pins-FRESH, D10 catalog clean.

**Secrecy invariant HOLDS.** `git ls-files` for the secret artifacts (worker-ext.md, copilot-worker.sh, DUTY_STACK, delegation-gate, council-*.agent) = EMPTY; this session added zero tracked files (all artifacts in `~/.claude/delegation` or git-excluded `.claude/state/ua-worker`). The 105 tracked "copilot" hits are pre-existing PUBLIC-SAFE cover (the tracked `_migration_global_claude/…/feedback_copilot_vs_claude_code.md` says "use Claude Code, not Copilot" — the old public framing, opposite of the takeover doctrine).

**Honest limit surfaced (D11 protection strength).** The delegation-gate gates only `Edit|Write|MultiEdit|NotebookEdit` — Bash is intentionally ungated (pattern-detection false-positived, reverted 2026-07-09). So a Bash `cp`/`>`/`tee` to a protected file bypasses the lock; the protection holds only against tool-writes + Claude's own discipline to never `cp` into a protected path. Protected-engine promotions this session go via the Write tool (gate fires → logged SELF_GRANT), never `cp`.

**Pre-existing out-of-scope items FLAGGED (not fixed — Adjacent-Sweep disposition):** (1) `_migration_global_claude/` is a 699-file tracked snapshot of global `~/.claude` (entered 2026-07-03, commit d1c1ad69) — bulky, though its copilot content is public-safe. (2) 3 tracked files (agent-activity-log.md + 2 done-plans) match a broad takeover-tell pattern — likely legit generic "delegation/worker" pipeline terms, warrants a targeted read. Both predate this plan.

**D12 scorecard-side sentinels (task #78) — remaining, in flight.** doctrine-version stamp ✓ (worker-ext.md:5) + primer compare ✓ + primer re-clone-disarm ✓; the two scorecard-side sections (doctrine cross-copy grep + lesson-count nag) were NEVER added to scorecard.mjs. Since scorecard.mjs is now the PROTECTED engine, these go through worker-build (sandbox) → cross-family review → Write-tool promotion under logged grant — NOT a self-edit of the anti-abuse lock. [Ticket dispatched; log to be extended on completion.]

**D12 completion arc (2026-07-11, closes #78).** Build (sandbox, worker green 254→287 lines) → cross-family review BOUNCE (real defect: cross-copy sentinel silently skipped a MISSING expected doctrine copy → false CLEAN possible) → bounce-fix by the original worker (287→290 lines, generic DOCTRINE-MISSING warning branch; evidence in the local run store, run `orch-D12fix`) → cross-family T0 re-verify 6/8 PASS with 2 items env-blocked in the verifier's shell (its raw report in the local run store, run `orch-D12verify2`) → orchestrator re-executed both disputed items personally (290 lines exact; warning fires; clean line suppressed) → PROMOTED to the production delegation store via Write tool under logged grant `orch-D12promote` after Rutvik's verbatim in-chat approval ("approved: write the SELF_GRANT and promote scorecard.mjs") → live production report verified: 4 pins FRESH, catalog clean, cross-copy CLEAN on real files, lesson budget clean, propose/commit/record guards regression-green. Worker-profile lesson appended (missing-input ≠ skip). This arc also served as the FIRST LIVE TRIAL of the assistant pattern (see `plans/pending/PLAN_ASSISTANT_LAYER.md`): a drafting seat produced the closure digest, was interrogated against 5 pre-written traps + 1 held-back anchor, scored 4.5/6 with zero fabrications and one honest retraction under interrogation.

### Execution Summary

**Deliverables (all 12):**
- D1 outcomes stream — DONE: append-only event stream live in the delegation store (15 rows recorded, enum + run_id validated against the ledger; the outcomes-format note in the local run store, ticket `ticket-orch`).
- D2 scorecard engine — DONE: 290-line engine live in the delegation store (sandbox source `.claude/state/ua-worker/ticket-orch/scorecard.mjs`); report/record/propose/commit/select all exercised on real data this session.
- D3 routing policy — DONE: seeded rulebook live; cross-family `select` returns `claude-opus-4.6` for review-excluding-gpt (fixture `.claude/state/ua-worker/ticket-orch/xfam-fixture` proven).
- D4 rank rules — DONE: thresholds + hysteresis + small-N guard encoded; `propose` on real data = zero proposals (guard proven); fixture promotion+demotion cycle tested earlier (#75).
- D5 model costs — DONE (designed fallback): multipliers UNVERIFIED/null, report prints "— (unverified)" per the plan's own fallback clause; 60-day staleness warning armed.
- D6 wrapper work-type splice — DONE: `--work-type` flag + `work_type` ledger field live (real dispatch rows carry it).
- D7 doctrine splice — DONE: living-policy paragraph in worker-ext.md (consult policy, --work-type every dispatch, record-before-receipt, quality-floor-then-cheapest).
- D8 CLI-drift sentinel + duration — DONE: version-change flag check + `secs` ledger field live.
- D9 pin freshness — DONE: live production report shows all 4 agent pins FRESH against the registry.
- D10 discovery — DONE: source-guard defect fixed (`_disc_source_guard` honored), dry-run + real full-run proven, CLI does NOT enumerate models → manual candidates.txt + 30-day nag armed; probe evidence backfilled for all 5 seed models (#77, effort tiers confirmed unchanged).
- D11 decision-file protection — DONE and battle-proven: the gate DENIED this session's own promotion attempts until session-correct logged grants existed (4 denials/approvals in the audit log).
- D12 drift/integrity sentinels — DONE: doctrine-version stamp + primer doctrine/hooksPath/exclusions checks + scorecard cross-copy & lesson-hygiene sections live in production (verified this session against the real agents dir).

**Deviations (all user-visible, none silent):**
1. Grants = 4, not the "exactly 3" verification line — D12 promotion required a 4th grant because D11 (this plan's own hardening) made the engine PROTECTED mid-plan; Rutvik approved verbatim in-chat. Verification line disposition: MODIFIED-JUSTIFIED to 4 burned entries.
2. Ledger denominator drifted 151→157→170 across execution (later dispatches append); per-model acceptance counts recomputed at check-time rather than pinned (#71).
3. D12 landed via a bounce-fix cycle rather than first-pass — the review layer catching a real defect is the system working as designed.
4. Review-dispatch `orch-reviewB2` outcome adjudicated `green` (its BOUNCE stemmed from a dispatcher ticket defect — an unprovable git-status check on a git-ignored dir — not reviewer fault, per the environmental-failure doctrine).
5. T0 re-verify items 2+4 were env-blocked in the verifier's PowerShell context; orchestrator re-execution stands as the adjudicating evidence (recorded env-blocked, not failed).

**Verification results:** production report sections all green on real files (pins/catalog/cross-copy/lesson-budget); guards regression-tested (propose=0, commit refuses without --change, record rejects unknown run_id); secrecy sweep clean (zero new tracked files, zero fleet-model strings in tracked files, all exclusions present); syntax gates clean on wrapper + all three hooks.

**Documentation changes:** worker-ext.md living-policy + doctrine-version stamp; council-worker profile lesson appended; OUTCOMES-FORMAT.md shipped; this Execution Log of Record.

**Test pass confirmation:** live production runs of report/propose/commit/record/select on 2026-07-11, outputs quoted in the log above.
