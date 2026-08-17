---
**Status**: PENDING — DEFERRED / DO-NOT-START. **TOP PRIORITY when it runs**, but it runs ONLY after the ENTIRE copilot initiative is complete (all sessions, parity + clash-fix + every copilot upgrade). Not tied to any one session. Do NOT begin until Rutvik explicitly declares "copilot done → run the mega-audit".
**Priority**: P0-FINAL (the terminal finalizer — highest priority in its slot, but its slot is LAST)
**Created**: 2026-07-13
**Identity**: OWNER
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: Repo-wide retrospective integrity audit across the whole copilot era via ultra-agent fan-out. Read-only discovery; every fix is gated. Highest-stakes correctness — no feature ever asked may be lost, and no good feature may be deleted under the name of "fuckup".
**PermissionMode**: read-only for the audit phase (fixes are a SEPARATE gated plan)
**BrowserTool**: none
---

# PLAN_MEGA_AUDIT_COPILOT_ERA — the final finalizer

## When this runs (hard gate)
ONLY after the complete copilot integration + upgrades are done — parity (worker=Claude), clash-fix (no more parallel loss), and everything else. Rutvik gives the explicit "run it" signal. Until then this plan sits PENDING and untouched. Running it earlier = auditing a moving target (new work could still land/clash after the audit), which defeats the purpose.

## Why it exists (Rutvik's intent, 2026-07-13)
Across the copilot era, work ran in parallel sessions with clash risk. Before declaring the whole thing done, prove that **nothing was ever lost or silently corrupted**: every feature ever asked for still exists and works, no slop crept in, and any real fuckups are found — WITHOUT deleting or flagging a legitimate feature as a "fuckup". This is the acceptance test for the entire copilot initiative.

## The two hard guardrails (non-negotiable)
1. **No false-accusation.** Default assumption = a feature is intended and correct. A "this is a fuckup / this is lost / this is slop" claim is GUILTY-UNTIL-PROVEN: it must be adversarially verified (cross-family) against the plan's original intent + the code + tests before it counts. Unfamiliar-but-correct code is NOT a defect. Removing a real feature under the banner of cleanup is the worst possible outcome and is explicitly forbidden.
2. **Read-only audit; every fix is gated.** The audit itself CUD-nothing — it produces a REPORT + a proposed remediation plan. No code is changed, no feature removed, nothing "fixed" without a separate explicit Rutvik go. Findings → report → Rutvik approves → a separate fix plan executes.

## Audit Dimension: Forcing-Function Integrity — the soft-gate sweep (Rutvik intent, 2026-07-13)

**The class defect.** Across the copilot era, features were shipped where the intent required a **structural forcing function** — a mechanism that CANNOT be skipped (PreToolUse `deny`, a non-zero exit-code gate, a pre-commit / pre-push hook, a CI required check, a default-behavior change) — but only **soft wording** was authored: a `must` / `should` / `note` / "remember to" line in a SKILL.md, a plan body, a doctrine `.md`, or a primer. **A soft-only gate is a gate that is not there.** The agent can skip it, and provably did: Rutvik caught Claude *agreeing it had skipped gates and left only soft wordings* on the gpt+opus adversarial-fight forcing-function (the fight was meant to fire automatically before work proceeds; it was a skippable note). One skippable enforcement point means the same authoring habit repeated — this is a **systemic sweep, not a one-off fix**.

**This dimension keys on machinery that already half-exists.** The framework already suspects this: `guardrail-policy.md` LR-069 §3.4 mandates fire telemetry (`gate-fires.log`) for every deny/announce gate, and its own **KNOWN-GAP note (2026-07-13)** records that ≥8 gate libs are **DARK** — `check-plan-closure`, `check-todo-injection`, `check-browsertool`, `check-graft-ship`, `check-bug-baseline`, `check-identity-switch`, `check-jargon`, `check-no-verify` never append to `gate-fires.log`. A gate that emits no telemetry cannot be **proven** to fire. Treat "claims to gate but is DARK" as SOFT-SUSPECT until proven by a live fire.

**The check — per enforcement point, across every copilot-era feature/plan:**
1. **Locate the intended enforcement.** For each behavior a plan/feature said must happen "every time" / "before X" / "always" / "never" — find the mechanism that enforces it.
2. **Classify HARD vs SOFT.** HARD = a structural mechanism that blocks on breach (hook `deny`/exit-code/CI required check/default change), cited at `file:line`. SOFT = prose only (`must`/`should`/`note` in a `.md`/SKILL/primer), cited at `file:line`, with NO blocking mechanism behind it.
3. **Prove every HARD claim by a LIVE FIRE (LR-059).** Reading the hook source is NOT proof — drive the gate against a violating input and observe the `deny` / non-zero exit / telemetry row. A DARK gate (no `gate-fires.log` row on fire) is downgraded to SOFT-SUSPECT until a fire is observed.
4. **For every SOFT point, decide (guilty-until-proven, symmetric with guardrail 1):** `DEFECT — should-be-hard` (intent demanded un-skippable enforcement → remediation) **vs** `OK — deliberately prose` (an S3 judgment/false-positive-prone call per LR-069 §3.1 that legitimately cannot be mechanized — MUST carry the explicit "deliberately no gate" note; absence of that note on an S1/S0-severity behavior is itself the defect). Do NOT flag a legitimately-prose S3 point as a defect — over-accusation here is the same failure as guardrail 1.

**Deliverable — the FORCING-FUNCTION LEDGER** (part of `MEGA_AUDIT_REPORT.md`): one row per enforcement point — `feature/plan | intended-behavior | current mechanism (hook file:line OR "prose-only @ file:line") | HARD / SOFT / SOFT-SUSPECT-dark | live-fire evidence (or "none — unproven") | breach severity (LR-069 §3.1 S0–S3) | verdict (OK / DEFECT-should-be-hard / OK-deliberately-prose) | remediation`.

**Remediation follows LR-069 ramp discipline** (this dimension does NOT itself author gates — the audit is read-only; the fix plan is separate + gated). Each soft→hard upgrade is severity-classed with a graduating incident: S0 = deny-on-landing (+CI required check); S1/S2 = **announce-first**, never straight-to-deny; S3 = stays prose with the explicit no-gate note. The DARK-telemetry gap itself (LR-069 §3.4 KNOWN-GAP) is a candidate remediation row (wire `fireTelemetry()` into the 8 dark libs) so future audits run on real fire signal, not partial.

## Audit Dimension: Slop Integrity — the massive `/slop` sweep (Rutvik intent, 2026-07-13)

**This plan is ALSO a massive slop-check plan.** Beyond "was anything lost?" the audit runs the flip side across the whole copilot era: **was anything ADDED that shouldn't exist?** Over-engineering, redundant infrastructure, dead code, no-reader artifacts, config keys nobody reads, wrapper-on-wrapper gate layers, scope the plan invented that Rutvik never asked for. The copilot era shipped fast and parallel — the same conditions that lose features also breed slop. Hunt both.

**Run the framework's own `/audit --mode=slop` discipline at corpus scale** (per `.claude/skills/audit/SKILL.md` §SLOP — do not reinvent the vocabulary):
- **Sub-mode AUDIT** on every landed copilot-era artifact (hooks, LR rules, skills, doctrine `.md`, config keys, worker/agent profiles, scripts); **Sub-mode MIXED** on any plan that references both landed code and un-executed proposals.
- **Binary verdicts only — DROP / KEEP** (no "maybe", no tiers). Fix by SHRINKING, never by wrapping — this dimension NEVER proposes new infrastructure to "manage" slop.
- **Every enumerated item gets a verdict — sampling is FORBIDDEN** (N items → N verdicts; the same machine-enumerated-denominator discipline as LR-062).

**The DROP bar is HARD and is the SAME coin as guardrail 1** (no false-accusation). A DROP is GUILTY-UNTIL-PROVEN exactly like a "lost feature" claim — "nothing breaks on the happy path" is absence of evidence, NOT evidence of absence, and is not a valid DROP. Each DROP must pick exactly ONE typed proof class and supply it (per §SLOP Step 4):
- **REDUNDANT-WITH(X)** — paste the 1:1 text pair.
- **DEAD-PATH** — name the gated path + cite the section/commit/session that removed the gate.
- **NO-READER** — name the artifact produced + grep-prove zero readers (show the zero-hit output).
- **DUPLICATE-OF-FRONTMATTER** — paste the side-by-side.
- **MANUFACTURED-BLOCKER** (LR-054/ALL-077) — a prose block that authors a HALT around a capability that documented tools already provide.

**Two mandatory guards that STOP over-DROP** (symmetry with guardrail 1 — deleting a real feature under the banner of "slop cleanup" is the worst outcome, explicitly forbidden):
1. **Family-contract check (§SLOP Step 4.5)** — before any DROP finalizes, grep the repo for the item's distinctive token. A hit in sibling files + documented intentional parity (a `feedback_*` family contract) → PROMOTE TO KEEP-CONTRACT; a hit with no documented parity → UNCERTAIN, surface to Rutvik, never DROP unilaterally.
2. **Prompt-archaeology cross-check (Phase A oracle)** — a feature is "slop" ONLY if Rutvik's VERBATIM prompts (resolved in Phase A) never asked for it AND it fails a typed remove-test. A feature Rutvik explicitly asked for is NEVER slop, however heavy it looks. This binds the slop sweep to the same oracle as every other finding.

**Deliverable — the SLOP LEDGER** (a section of `MEGA_AUDIT_REPORT.md`): one row per enumerated item — `feature/plan/artifact | core-goal-it-serves (one sentence) | KEEP / DROP / KEEP-CONTRACT / KEEP-TENTATIVE / UNCERTAIN | DROP-proof class + evidence (or "n/a — KEEP") | asked-by-Rutvik? (Phase-A cite or "never asked") | remediation (the SHRINK, never a wrap)`.

**Read-only, like every other dimension.** The slop sweep produces DROP recommendations in the report + the gated `SUBPLAN_MEGA_AUDIT_REMEDIATION.md`; it deletes NOTHING during the audit. Every DROP is cross-family adversarially verified before it counts (the cross-plan pass below). This dimension itself adds no hook, LR rule, memory file, or config key — it reduces surface, never grows it (the §SLOP dogfood rule).

## Scope bounding (so "all plans" is finite — settle these at run time)
- **Copilot-era start**: pin a concrete start (date or commit) — the audit covers plans executed since the copilot takeover began. (Derivable from `worker-ext.md` creation / doctrine-version stamp / first `ledger.jsonl` rows.)
- **Plan corpus**: `plans/pending/`, `plans/done/`, scratch plans, `~/.claude/plans/`, and any chain-spawned subplans — every plan touched in the era.
- **Blast radius per feature**: the files each plan touched + their DIRECT dependents (importers/callers) — NOT infinite transitive closure. Bound it explicitly.

## Method — ultra-agent fan-out: ONE Opus↔GPT fight PER PLAN (Rutvik intent, 2026-07-13)
This is a **very big task** → `/ultra-agents` (caps lifted for this goal) + heavy, **BATCHED** parallel dispatch. Queue the fights; a concurrency ceiling still applies (machine + cost) — not every plan's fight fires at once. No single agent carries the corpus, and **no single agent audits a plan alone**.

**The unit of work is ONE PLAN, audited by ONE Opus + ONE GPT fighting** — adversarial dual-model, a fresh fight *per plan*, NOT one fight for the whole corpus. Each fighter may **delegate to nested sub-agents** to get the legwork done (read the plan, trace git history, resolve + read the creating session, run greps / live-fires), and **those sub-agents may themselves delegate further** when the work demands it — depth is NOT capped at 2 for this audit. The full nested chain must be tracked (who / model / work-type / when / files-touched, TOP-LEVEL AND NESTED — the observability requirement from `PLAN_LAZY_CEO_DELEGATOR` §observability applies here). The two fighters produce independent verdicts; a **referee synthesizes** them into that plan's report row. Guilty-until-proven (guardrail 1) governs every negative finding, on both sides of the fight.

### The per-plan audit unit — TWO phases, IN ORDER (audit the PLAN before its EXECUTION)
You may NOT audit a plan's execution until you have first audited the PLAN ITSELF against the original human intent. For each plan the Opus↔GPT fight runs:

**Phase A — Prompt archaeology + plan-correctness audit (the plan is suspect FIRST).**
1. **Find the session that created this plan.** Resolve provenance: `git log --follow --diff-filter=A -- <plan-path>` → the add-commit + date; cross-reference the `**Created**:` frontmatter + every `agent-activity-log.md` row naming the plan; match that timestamp to the session transcript(s) under `C:\Users\RutvikKhorasiya\.claude\projects\C--Users-RutvikKhorasiya-projects-encore-framework\*.jsonl`.
2. **Read Rutvik's VERBATIM prompts from that session.** Extract his user-role turns — his ACTUAL asks, the ground-truth intent — NOT the plan's self-declared "why it exists". The plan's stated intent is a paraphrase and may have DRIFTED from what he actually said; **his prompts are the oracle, the plan is the suspect.** (If a plan spans multiple sessions, read all of them; if provenance genuinely cannot be resolved after a real dig, that unresolved-provenance is itself a finding — never silently skip the archaeology.)
3. **Audit the plan against those prompts.** Did the plan capture EVERYTHING he asked? Did it add scope he never asked for (slop)? Did it soften a hard ask into a soft one (the forcing-function class)? Did it mis-read, drop, or half-answer a requirement? Every gap between "what Rutvik asked" and "what the plan says" is a finding.

**Phase B — Execution audit (ONLY after Phase A passes).** Audit whether the execution delivered what the prompt-validated plan promised, measured against BOTH the plan AND the original prompts. A feature the plan delivered that Rutvik never asked for, AND a feature Rutvik asked for that neither the plan nor the code carries, are BOTH findings. Phase B covers three dimensions per plan:
- **Presence + health** — each feature: still EXISTS in current code + WORKS (structurally present + covered by a passing test / driveable)? Classify PRESENT-OK / DEGRADED / LOST / SLOP-ADDED.
- **Clash** — did an overlapping-file plan clobber this one? (The specific loss mode we hunt.)
- **Forcing-function** — per the Forcing-Function Integrity dimension above: classify each enforcement point HARD / SOFT / SOFT-SUSPECT-dark, prove HARD by LIVE FIRE (LR-059), mark SOFT `DEFECT-should-be-hard` or `OK-deliberately-prose`.
- **Slop** — per the Slop Integrity dimension above: run `/audit --mode=slop` (AUDIT/MIXED) over every landed artifact this plan touched; binary DROP/KEEP with a typed proof for every DROP; family-contract + prompt-archaeology guards before any DROP counts; emit the SLOP LEDGER rows for this plan.

### Corpus-level orchestration
1. **Enumerate** — list every copilot-era plan (the corpus above). One machine-enumerated index = the fan-out denominator (LR-062: fully dispositioned, none skipped).
2. **Dispatch one Opus↔GPT fight per plan (batched, nested delegation allowed)** — each fight runs Phase A → Phase B → per-plan referee synthesis.
3. **Cross-plan adversarial pass (guilty-until-proven)** — every surviving LOST/DEGRADED/SLOP-DROP/SOFT-DEFECT/plan-drift finding is re-checked against code + tests + the original prompts (+ live-fire evidence for any HARD claim; + the typed DROP-proof, family-contract grep, and Phase-A "never asked" cite for any SLOP DROP). False accusations — including flagging a legitimately-prose S3 point, DROPping a KEEP-CONTRACT family member, or calling a Rutvik-asked feature "slop" — die here.
4. **Completeness critic** — "which plans got a shallow fight? whose creating-session was never read? what did the fan-out skip?" — so nothing is silently un-audited (Guard-B principle).
5. **Report + gated remediation plan** — one consolidated report (per-plan: prompt-vs-plan drift + execution verdict + forcing-function ledger) + a PROPOSED fix plan. Nothing executes without Rutvik's go.

## Output
- `MEGA_AUDIT_REPORT.md` — per plan: the resolved creating-session + Rutvik's verbatim prompts (or an explicit unresolved-provenance finding), the **prompt-vs-plan drift** verdict (Phase A), the **execution** verdict (Phase B: PRESENT-OK / DEGRADED / LOST / SLOP per feature), and the Opus + GPT fighters' independent verdicts + referee synthesis. Every negative finding adversarially verified against the original prompts + code + tests.
- **FORCING-FUNCTION LEDGER** (a section of `MEGA_AUDIT_REPORT.md`) — one row per enforcement point: feature/plan · intended-behavior · current mechanism (hook `file:line` or "prose-only @ `file:line`") · HARD / SOFT / SOFT-SUSPECT-dark · live-fire evidence (or "none — unproven") · breach severity (LR-069 S0–S3) · verdict (OK / DEFECT-should-be-hard / OK-deliberately-prose) · remediation.
- **SLOP LEDGER** (a section of `MEGA_AUDIT_REPORT.md`) — one row per enumerated copilot-era item (no sampling): feature/plan/artifact · core-goal (one sentence) · KEEP / DROP / KEEP-CONTRACT / KEEP-TENTATIVE / UNCERTAIN · DROP-proof class + evidence (or "n/a — KEEP") · asked-by-Rutvik? (Phase-A cite or "never asked") · remediation (the SHRINK, never a wrap). Read-only — DROP recommendations only; nothing deleted during the audit.
- `SUBPLAN_MEGA_AUDIT_REMEDIATION.md` (proposed, gated) — the fixes, for a SEPARATE go. Every soft→hard upgrade is severity-classed + ramped per LR-069 §3.3 (S1/S2 announce-first, never straight-to-deny).

## Acceptance
- [ ] Every copilot-era plan enumerated + its features extracted (none skipped — completeness critic ran).
- [ ] **Every plan got its own Opus↔GPT fight** (1 Opus + 1 GPT, independent verdicts + referee synthesis) — no plan audited by a single agent; nested sub-agent delegation tracked top-level AND nested.
- [ ] **Phase A ran before Phase B for every plan** — the plan itself was audited against the original intent BEFORE its execution was judged.
- [ ] **Prompt archaeology done for every plan** — the creating session was resolved (git-add-commit + activity-log + transcript match) and Rutvik's VERBATIM prompts were read and used as the oracle; every prompt-vs-plan drift is a recorded finding; any unresolved-provenance is itself recorded (never silently skipped).
- [ ] Every feature has a verified verdict; every LOST/DEGRADED/SLOP/plan-drift finding is cross-family adversarially verified against the original prompts + code + tests (no unverified accusation; no Rutvik-asked feature mislabeled slop).
- [ ] FORCING-FUNCTION LEDGER complete: every copilot-era enforcement point classified HARD/SOFT/SOFT-SUSPECT-dark; every HARD claim backed by a LIVE-FIRE observation (LR-059 — no read-only "the hook exists" pass); every SOFT point marked DEFECT-should-be-hard or OK-deliberately-prose (with the explicit no-gate note); no legitimately-prose S3 point flagged as a defect.
- [ ] SLOP LEDGER complete: every landed copilot-era artifact enumerated + given a binary KEEP/DROP verdict (no sampling — N items, N verdicts); every DROP carries exactly one typed proof class (REDUNDANT-WITH / DEAD-PATH / NO-READER / DUPLICATE-OF-FRONTMATTER / MANUFACTURED-BLOCKER) + a passing family-contract grep + a Phase-A "never asked" cite; every KEEP-CONTRACT / UNCERTAIN surfaced not dropped; no Rutvik-asked feature labeled slop.
- [ ] Zero CUD during the audit — `git status` clean of code changes; only the report + proposed remediation plan written.
- [ ] No legitimate feature deleted or flagged as slop without hard evidence (guardrail 1 provably honored).
- [ ] Blast-radius + copilot-era-start were explicitly pinned before the sweep (no unbounded scope).

## Dependencies
- Runs after: parity initiative complete + clash-fix implemented & proven + all other copilot upgrades done. Rutvik's explicit go is the trigger.
