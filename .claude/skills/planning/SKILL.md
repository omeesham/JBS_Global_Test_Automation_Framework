---
name: planning
description: Create a rigorously audited implementation plan — explores codebase, drafts plan, runs validation checklist, reviews against original intent, then saves to plans/pending/. Use when user says "plan", "design", "how should we".
user-invocable: true
auto-calls: identity, research
tools: Read, Glob, Grep, Write, Edit, Bash, Agent, TodoWrite, TaskCreate, TaskUpdate, TaskList
---

# /planning — Rigorous Plan Creation Workflow

When the user invokes `/planning`, follow this exact workflow. Do NOT skip steps.

## When to Use

**Identity**: OWNER. Auto-loaded via Identity Gate.

- User says "plan", "design", "how should we", "create a plan", "approach"
- User describes a feature or change without saying "just do it"
- Complex multi-file changes that need thought before execution

## Input
The user will describe what they want planned. If their description is vague, ask HIGH-IMPACT clarifying questions before proceeding.

## Identity Gate
Runs `/identity` Step 1.5 with caller=`/planning`. No-op if compatible identity active.

## Step 0: Research (if unfamiliar territory)

Auto-call `/research` if the topic involves:
- Technology or patterns not yet used in this codebase
- External APIs or services you haven't worked with
- Architecture decisions with multiple valid approaches
- Anything where "I think this is how it works" — look it up

**Skip** if the topic is purely internal refactoring of well-understood code.

## Step 1: Explore
- Use Explore agents (up to 3 in parallel) to understand the codebase areas relevant to the request
- Identify existing patterns, utilities, and conventions that must be respected
- Map out all files that would be affected

## Step 2: Draft the Plan
Write an initial plan covering:
- **Context**: Why this change is needed, what prompted it, intended outcome
- **Changes**: Specific files, specific lines, exact before/after where possible
- **NOT touched**: Files explicitly excluded and why
- **Verification**: How to test the changes end-to-end

## Step 3: Validation Pass

Complete this checklist in a single pass. Fix any issues found before proceeding to Step 4.

- [ ] **Reference check** — Open the most recent completed plan in `plans/done/` for the same category. Compare section-by-section. Flag any section present in the reference that's missing in yours. If no reference exists, use the most complex completed plan as baseline.
- [ ] **Rules applied** — For each rule listed in your plan's "Active Rules" section (or equivalent), verify it's actually reflected in the plan body (implementation steps, code snippets, or explicit exclusion with reason). Rule listed but not applied = gap.
- [ ] **Mistakes check** — Grep for the target page/module name in `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md`. Read every hit. Verify none of the documented mistakes are repeated in your plan. Also grep for any function names or patterns your plan proposes to use.
- [ ] **Slop check (advisory)** — Run `/slop review` on the drafted plan file. Surface the findings alongside the plan before Step 4 so the user sees them. Advisory only: do NOT auto-edit the plan, do NOT HALT. User decides what to drop. Skip for trivial plans (≤3 items, all load-bearing — the skill itself will short-circuit and report TRIVIAL).
- **[GATE] Prior-Fix Trial on recurrence-class plans (owner law 2026-07-17, LR-069 §3.5)** — if the plan fixes a failure class that has ALREADY been "permanently" fixed before (its body cites an existing LR rule / gate / HARD STOP / taxonomy mandate as failed-or-insufficient, or the same area+class appears in agent-mistakes.md or a prior done-plan's fix), the plan body MUST contain a `## Prior-Fix Trial` section: per prior fix, (1) what it did, (2) why it failed to fire this time (`scoped-wrong` | `prose-not-mechanism` | `rubber-stampable` | `dead/never-fired` | `different-sub-class`), (3) what the new mechanism does differently, verdict `SURVIVES`/`CONVICTED`. A CONVICTED fix's rewire-or-removal MUST be in this plan's scope (LR-050 style — no sediment left idling). Recurrence-class plan proposing new mechanisms with no trial section = HALT; layering over unconvicted failed fixes is forbidden. Machine layer: `plans/pending/SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL.md`.
- **[GATE] LR-048 v3 matrix delivery format** — if the plan contains a `## Per-Identity Satisfaction` matrix, every "Concrete deliverable" cell MUST be a repo-relative file path, `(skipped: <reason ≥20 chars>)`, or `(none)`. Reject any **vague-prose Concrete Deliverable** cell — forbidden phrase set (case-insensitive regex): `spot-check log`, `inline claims`, `typecheck.*outputs`, `verification logs`, `proof of work` — and, more generally, any cell that is neither a path that will exist at closure nor `(skipped:…)`/`(none)`. Multi-deliverable cells may list several paths separated by `<br>`. If a vague cell is detected → HALT; ask the author to convert it to a real file path or `(skipped: <reason>)`. Catching it here is cheaper than at DONE, where closure-check C6 (`.claude/rules/plan-closure.md` LR-055) enforces the same rule and blocks the Status flip.
- **[GATE] Model + Thinking + PermissionMode declared and valid** (LR-041 / D17 rubric) — **hard gate, NOT a checkbox**. Execute this validator on every new subplan file you just authored before proceeding to Step 4. HALT (do not proceed) if any step fails; report the violation to the user verbatim.

  **Tier vocabulary** — accept both authoring form and CLI form as the same tier:
  - Opus 4.7 (5 tiers): `lo`/`low`, `mid`/`medium`, `hi`/`high`, `xhi`/`xhigh`, `max`
  - Sonnet 4.6 (4 effective tiers): `lo`/`low`, `mid`/`medium`, `hi`/`high`, `max` (probe-confirmed supported; freely usable, no `**Justification**:` line required)

  **Validator** — run in order, HALT on first failure:
  1. grep `^\*\*Model\*\*:\s*(\S+)` in the subplan → capture `MODEL`. If absent → HALT: "LR-041: missing `**Model**:` field in <file>."
  2. grep `^\*\*Thinking\*\*:\s*(\S+)` → capture `THINKING`. If absent → HALT: "LR-041: missing `**Thinking**:` field in <file>."
  3. grep `^\*\*PermissionMode\*\*:\s*(\S+)` → capture `PERM`. If absent → HALT: "LR-041: missing `**PermissionMode**:` field in <file>."
  4. If `MODEL` matches `sonnet` AND `THINKING` ∈ {`lo`, `low`} → HALT: "LR-041 forbidden combo: Sonnet + `$THINKING` (under-thinks). Promote to Sonnet `hi`."
  5. If `MODEL` matches `opus` AND `THINKING` ∈ {`lo`, `low`, `mid`, `medium`} → HALT: "LR-041 forbidden combo: Opus + `$THINKING`. If `mid` is enough, task is Sonnet `hi`."
  6. If `MODEL` matches `opus` AND `THINKING` == `max` → require `^\*\*Justification\*\*:` line in the subplan frontmatter. If absent → HALT: "LR-041: Opus `max` requires `**Justification**:` frontmatter line explaining why (e.g. RCA / closure gate / multi-rule judgment)."
  7. If `MODEL` matches `sonnet` AND `THINKING` ∈ {`mid`, `medium`} → require `^\*\*Justification\*\*:` line in the subplan frontmatter. If absent → HALT: "LR-041: Sonnet `mid` requires `**Justification**:` frontmatter line explaining why the task is purely mechanical."
  8. If `PERM` == `bypassPermissions` → require `^\*\*RiskAcknowledged\*\*:\s*true` in the subplan frontmatter. If absent → HALT: "LR-041 / D26: `bypassPermissions` requires `**RiskAcknowledged**: true` frontmatter line. Orchestrator will refuse to spawn without this."
  9. **[LR-038 v2 — BrowserTool field]** grep `^\*\*BrowserTool\*\*:\s*(\S+)` → capture `BTOOL`. Allowed: `cli` | `chrome` | `both` | `none`.
     - If absent AND `**Created**:` ≥ 2026-04-24 → HALT: "LR-038 v2: missing `**BrowserTool**:` field in <file>. Allowed: `cli` | `chrome` | `both` | `none`. See LR-038 v2 task→tool matrix in CLAUDE.md."
     - If absent AND (`**Created**:` < 2026-04-24 OR Created missing) → WARN ("LR-038 v2: <file> grandfathered — no BrowserTool, Created pre-2026-04-24"); do not HALT.
  10. If `BTOOL` is present AND ∉ {`cli`, `chrome`, `both`, `none`} → HALT: "LR-038 v2: invalid BrowserTool=`$BTOOL` in <file>. Allowed: `cli` | `chrome` | `both` | `none`."
  11. If `BTOOL` == `both` → require `^\*\*BrowserToolJustification\*\*:` line in the subplan frontmatter. If absent → HALT: "LR-038 v2: BrowserTool=both requires `**BrowserToolJustification**:` frontmatter line (one-sentence reason — same posture as Opus `max` requiring `**Justification**:`)."
  12. **[LR-072 CoverageMode gate]** — if the subplan is coverage-bearing (its phases author TCs, run walks, or cite walk artifacts): grep `^\*\*CoverageMode\*\*:\s*(\S+)` → capture `CMODE`. If absent → HALT: "LR-072: coverage-bearing subplan missing `**CoverageMode**:` field in <file>. Declare `quick` (authored by /coverage) or `deep` (authored by /ultracoverage or hand-authored exhaustive)." If present AND value ∉ {`quick`, `deep`} → HALT: "LR-072: invalid CoverageMode=`$CMODE` in <file>. Allowed: `quick` | `deep`."

  **Do not tick this step as "done" on vibes.** Run the greps. Report the captured values to the user. If all 12 steps pass, explicitly state: "LR-041 + LR-038 v2 gates passed: MODEL=<x> / THINKING=<y> / PERM=<z> / TOOL=<b> / CMODE=<x|n/a>."

- **[GATE] Duty-coverage — each phase-identity's HARD STOPs are reflected in the plan body** (Layer 0, PLAN_IDENTITY_ENFORCEMENT) — **advisory HALT, same posture as the LR-041 gate above**. The framework already enforces *what each role delivers* (LR-048 Per-Identity Matrix + closure-check C6 → file exists) but never *that each role's HARD STOPs governed the work*. Close it at authoring time:

  1. List every **pipeline identity** the plan's phases invoke (HUNTER / GIVER / BUILDER / HEALER / WATCHDOG / GARDENER — skip OWNER; OWNER carries no agent-file HARD STOPs).
  2. For each, **read `.claude/agents/<ROLE>.md`** and extract its `## HARD STOPS` header list (the numbered items).
  3. For each applicable HARD STOP, confirm the plan body either **reflects** it (an implementation step / case-set decision / explicit acceptance line honors it) OR **explicitly excuses** it (`out-of-scope: <reason>` — e.g. "no live walk this plan, baseline reused per LR-013").
  4. A HARD STOP that is **neither reflected nor excused** → emit it in an advisory list and **HALT** until the author dispositions it. This is an author-resolved checklist, NOT a brittle fuzzy-matcher — surface the unaddressed HARD STOP headers and let the author decide reflect-vs-excuse.

  Why this is here and not a new script (slop-reduced): it reuses the Step 3 HALT gate that already greps-and-HALTs on Model/Thinking/PermissionMode — proving the framework already hard-gates *some* fields; this extends the same gate to *duties*. Structural enforcement of the duties themselves fires later, at `/execute` time, via the Layer-1 write-gate (the role phase physically cannot write its artifacts as OWNER with HARD STOPs unloaded). The Step-3 gate is the planning-time companion: it proves the plan *covered* each role's duties before the plan flips PENDING.

## Step 4: Intent Review
- Re-read the user's original request word by word
- Compare every claim in the plan against the actual codebase (verify, don't assume)
- Confirm the plan actually delivers what was asked — not more, not less

## Step 5: Save
- Determine the next plan number by checking `plans/pending/` and `plans/done/` for the highest existing PLAN_XX number
- Save the final plan to `plans/pending/PLAN_XX_<DESCRIPTIVE_NAME>.md`
- Present a concise summary to the user

## Step 6: MANDATORY — Embed SESSION BOOTSTRAP block at top of every subplan

**User preference (absolute rule)**: every subplan file must be executable cold with ONLY `/execute <filename>` — zero additional prompting. The user should never have to tell a session "remember to load identity, check dependencies, do Phase 0 first, etc."

For every subplan file you author, the FIRST content (before the `# SUBPLAN SP-XX: Title` heading) must be a SESSION BOOTSTRAP blockquote containing:

1. Explicit statement: "To run: `/execute <this-filename>` — that is all."
2. Numbered bootstrap sequence the agent follows on load:
   - Load identity (per `**Identity**` frontmatter field)
   - Load skills (per `**Skills**` frontmatter field, including auto-calls)
   - Resolve model + thinking tier (from master plan's execution-order table, or inline in the subplan)
   - Dependency gate — verify every `**Depends on**` item is DONE or N/A; HALT if blocked
   - Read required context files (master plan sections, catalogs, etc.)
   - Resolve browser tool (Playwright CLI vs Claude in Chrome) per LR-038 v2 if subplan interacts with a live app; declare via `**BrowserTool**:` frontmatter (`cli` | `chrome` | `both` | `none`)
   - Execute Phase 0 (if present) before any edits
   - Execute remaining Step-by-Step phases
   - Handoff: flip Status/Executed, append activity-log row, git mv, reindex
3. HALT + ASK USER conditions (never silently proceed):
   - Dependency blocker
   - Scope ambiguity beyond KEEP list
   - Phase 0 discovers >30% scope extension
   - Regression-guard shows unrelated changes
   - Activity-log LR-037 preflight would fail

**CRITICAL PARSER NOTE**: Do NOT put the literal strings `**Status**: DONE` or `**Executed**: <date>` (with markdown bold + colon) inside the bootstrap block — the `plans-reindex.mjs` regex parses these as frontmatter fields and will incorrectly mark the subplan as DONE. Use paraphrased language: "flip the Status field to DONE", "add the Executed date", etc. Same for any other labels the reindex watches: Status, Priority, Created, Executed, Parent.

**Template to adapt** (starting point — customize per subplan's specifics):

```markdown
> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute <this-filename>`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load /identity per the Identity field below.
> 2. **Skills**: load every skill in the Skills field below (leading skill auto-calls its chain).
> 3. **Model + thinking + permission-mode**: read `**Model**:`, `**Thinking**:`, `**PermissionMode**:` from this subplan's frontmatter (all three required per LR-041). If absent (grandfathered file), defaults are Sonnet → `hi`, Opus → `xhi` (clamped to `high` on CLI < 2.1.111 — see chain-orchestrator header), permission-mode `auto`. If Phase 0 is present in Step-by-Step, bump thinking tier one notch.
> 4. **Dependency gate**: verify every item in the Depends-on field is DONE in plans/done/ or N/A. HALT if blocker.
> 5. **Context load**: read master plan §1-§3 + this subplan in full.
> 5.5. **Browser tool selection (REQUIRED in frontmatter for subplans Created ≥ 2026-04-24)**: classify per **LR-038 v2** task-class matrix, then announce. **Default = `cli`** unless the task cleanly matches a named Chrome row. Decision tree (run in order — first match wins):
>     - Does this subplan browse a live app at all? **No** → `BrowserTool: none`. STOP.
>     - Visual / CSS / layout / pixel-level assertion? → `BrowserTool: chrome`.
>     - Fresh passkey flow that no `state-save` can solve? → `BrowserTool: chrome` (mandatory).
>     - Subplan body contains an explicit `pause:` / `await user input` step that fires DURING execution (not a verdict gate, not a YELLOW/RED handoff between phases)? → `BrowserTool: chrome` (live RCA / human-in-loop).
>     - Anything else (functional / catalog / unattended / >10 fields / Phase 0.5 / network-evidence / silent no-op bug)? → `BrowserTool: cli`. This is the default — ~4× token savings.
>     - Genuinely mixed within one subplan (one Chrome-only assertion inside otherwise CLI work)? → `BrowserTool: both` + `BrowserToolJustification: <one-sentence reason>` (escape hatch — overuse = LR-038 v2 design smell).
>
>     **Anti-priming rule**: when authoring Phase-0 directives or any prose inside the subplan that mentions LR-038, DO NOT pre-name a tool (e.g. "(LR-038: Chrome Claude, auth-heavy)"). Reference the matrix only. Pre-naming biases the executor before classification — that's how the SUBPLAN_DQU_04_B2_LI_NEUTRAL_EYE_AUDIT 2026-04-27 over-cautious-Chrome incident happened.
>
>     Frontmatter syntax (place alongside Model/Thinking/PermissionMode):
>     ```
>     **BrowserTool**: cli | chrome | both | none
>     **BrowserToolJustification**: <one-sentence why>   # ONLY if BrowserTool=both
>     ```
>     Announce choice + reason in first output. Mid-subplan switches → log via `[BROWSER-SWITCH]` per LR-028 (≥2 = `/final-q` YELLOW; ≥3 = `/audit` RED).
> 6. **Phase 0 FIRST (if present)**: execute Phase 0 date-forensic self-discovery before any edits.
> 7. **Execute Phases 1+** per Step-by-Step.
> 8. **Handoff**: flip Status field to DONE + add Executed date, append activity-log row (LR-028 + LR-037), git mv to plans/done/, npm run plans:reindex, commit.
>
> **HALT + ASK USER** if: dependency blocker / scope ambiguity / Phase 0 >30% scope extension / regression-guard unrelated changes / LR-037 timestamp drift / **LR-040 closure-completeness gate — any planned item not classifiable as (a) MCP-proven, (b) grep-verifiable line item in a named recipient subplan, or (c) user-flagged discussion-item / bug-candidate with Pending-decision entry. Phantom hand-offs = audit finding.**

---

# SUBPLAN SP-XX: ...
```

This is non-negotiable. Every subplan gets this. Every plan summary must cite this pattern. Missing bootstrap = defect.

## Plan Deviation taxonomy

**Plan Deviation taxonomy**: reserve `D-N` rows (in the plan's Plan-Deviations log) for genuine scope/process surprises — queue gates, identity collisions, blocked dependencies, app-bug-discovered-during-execution. Do NOT log a D-row for "Path X designed → Path Y discovered live → in-line pivot" — that is the normal mode of test cases probing novel mechanics (FCC or otherwise). Pivots are recorded inline in the relevant Phase's narrative, not as deviations. (Graduated from PLAN_DONE_MEANS_DONE finding #6, 2026-05-28: SUBPLAN_LEGAL_FCC logged a legitimate live-engineering pivot as "Deviation D1", which is misleading framing — the pivot was the test doing its job, not a deviation from contract.)

## Auto-Calls

- `/identity` — Identity Gate, before all steps (no-op if compatible identity active)
- `/research` — Step 0, before exploration, when unfamiliar territory is involved

## Output

- Saved plan file in `plans/pending/PLAN_XX_<NAME>.md`
- Concise summary presented to user (context, key changes, verification approach)

## Rules
- NEVER skip the validation pass checklist — all 3 items are mandatory
- NEVER assume — verify by reading actual files
- Internal variable names are NOT user-facing — don't change them unless explicitly needed
- Keep the plan surgical — minimum changes for maximum effect
- If the plan touches more than 10 files, ask the user if the scope is right before saving


## Verification Artifact (D23)

Before declaring this skill done, emit one runnable / readable check the user (or next session) can re-run to confirm the output:

- File path + expected content (e.g., `plans/pending/X.md exists with **Status**: Pending`)
- Bash command + expected output (e.g., `git diff --stat ...` shows N files)
- Test command (e.g., `npm run typecheck`, `npx tsc --noEmit`)
- Or a structured expected-output template (≤10 lines)

Verification artifact ≠ prose summary. It is a runnable / readable check that confirms the skill's output. Without it, the work is unaudítable. Anthropic cupcake §786-793 — single highest-leverage tactic for AI-built artifacts.
