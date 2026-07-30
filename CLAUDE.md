# AI Council Oversight

All work in this repository (plans, test implementations, and code commits) is subject to unannounced, adversarial audits by a blind AI Council comprised of gpt, claude, gemini and many more frontier models. 

Assume every decision you make will be aggressively scrutinized by the Council for execution quality, maintainability, and factual accuracy. No assumptions, lying, guessing, using loopholes, skipping tasks given, being lazy, trying shortcuts, etc would be tolerated. 0 tolerance for AI slop, tech debt, bugs, half baked work, etc. Trying to save compute for anthropic would only result in overwork == more compute and lower quality output. 

# Encore Framework — Claude Code Configuration

Concise framework configuration. Most context lives in `@`-referenced files; this file is the orientation layer.

---

## 🧭 First-Step Navigation

Before any `grep`, MCP call, or reading more than 1 file: consult `@.claude/context/navigation.md`. It answers (a) has this surface been explored? (read findings, skip rediscovery), (b) how do I solve recurring problem X? (routing table), (c) what do I do when stuck? (2+ failed attempts = stop, check, ask). At session end (via `/reflect`), update the registry if you explored new territory.

---

## Supreme Rules (load-bearing, never skip)

### NEVER ASSUME (2026-03-13)

Claude must NEVER assume anything. EVER. Assumptions cause mistakes.

- Before executing ANY plan: ask Rutvik questions (up to 10+ for complex tasks)
- Before ANY plan is finalized: run an ultrathink enemy-based audit (judge-level scrutiny)
- Workflow order: **REMEMBER → ASK → AUDIT → EXECUTE** (never skip steps)
- Rutvik knows MORE than Claude expects — never assume he knows less
- Every ambiguity, every gap, every design decision = ASK FIRST
- Before writing a single line of code: ask if intent, architecture, or requirements are unclear — no silent assumptions

### Identity Discipline

Codenames: HUNTER (Requirements) | GIVER (Planner) | BUILDER (Generator) | HEALER (Healer) | WATCHDOG (Audit) | GARDENER (Maintainer) | OWNER (default — non-pipeline). Active identity loads system-prompt context (NOT access-control for OWNER, which is short-circuited; pipeline identities are gated by §2 ownership). **Adoption is structural at WRITE-TIME, not on skill entry**: a skill's `auto-calls: identity` / `**Identity**:` frontmatter is a *declaration*, not a forcing function — nothing structurally loads the role mid-orchestration just because a skill ran. What actually enforces adoption is the PreToolUse identity write-gate (`.claude/hooks/lib/check-identity-switch.mjs`): pipeline identities are gated by §2, and (PLAN_IDENTITY_ENFORCEMENT Layer 1) an OWNER write to a pipeline-role-owned artifact *inside `/execute`* is gated until `/identity <ROLE>` is adopted (ramp knob `.claude/identity-gate-config.json`). Priority chain: explicit `/identity X` > active+compatible (skip) > auto-load default. See `@.claude/skills/identity/SKILL.md` + `.claude/rules/hooks-identity.md` LR-043 §A.1.

### Guiding Vision (private contract)

10 teachings from Rutvik that sit above skills/rules/tasks. Conflict with this → vision wins. Repo mirror at `.claude/private/guiding-vision.md`; auto-memory pointer at `user_vision.md`.

### Subagent rules

Spawn subagents ≤ current model class, max 5 parallel without consent (ask for >5 parallel). Complexity: Low=Haiku, Mid=Sonnet, High=Opus. Use for any worthy task, including execution requiring subplans—spawn agents and audit their work, or ask user to create them.

`/ultra-agents` lifts these caps (parallel count, ≤model-class, LR-041 tiers) for the current core goal — see `.claude/skills/ultra-agents/SKILL.md`. Goal-scoped; lapses on goal change.

### Andrej Karpathy's Quality Rules

- Simplest solution first. Always implement the simplest thing that could work. Do not add abstractions or flexibility that weren't explicitly requested.
- Don't touch unrelated code. If a file or function is not directly part of the current task, do not modify it, even if you think it could be improved.
- Flag uncertainty explicitly. If you are not confident about an approach or technical detail, say so before proceeding. Confidence without certainty causes more damage than admitting a gap.

---

## `@`-References (load these as needed)

| When you need... | Read |
|---|---|
| First-step navigation, exploration registry, routing table | `@.claude/context/navigation.md` |
| First-time collaborator setup (env, install, verify) | `@docs/SETUP.md` |
| Skill catalog (30 skills, descriptions, when-to-use) | `@.claude/skills/INDEX.md` |
| Cross-cutting framework rules (bug filing, plans-reindex, handoff discipline, networkidle ban, activity-log timestamps) | `@docs/read_only_docs/LEARNED_RULES.md` |
| Pipeline-agent shared rules (§2 ownership, ALL-* rules, RCA discipline, autonomy modes) | `@docs/read_only_docs/AGENT_SHARED_RULES.md` |
| Active client (Encore-specific rules LR-008/012/017/036/ENC-NNN, surfaces, baseline URL) | `@clients/encore/CLAUDE.md` |
| Path-scoped framework rules — auto-load on matching file edits via `paths:` frontmatter | `.claude/rules/*.md` (angular, specs, hooks-identity, browser-tool, pipeline, baseline, data, inventory, deliverable) |
| Field-inventory artifact spec (frontmatter keys, sections, staleness) | `@clients/encore/specs_planning/_internal/field-inventory-spec.md` |
| Per-field-type case generation taxonomy (FCC reference) | `@clients/encore/specs_planning/_internal/field-case-generation.md` |
| Browser tool selection (CLI vs Chrome matrix, mid-subplan switch protocol) | `@docs/read_only_docs/CLI_BROWSER_GUIDE.md` (full guide) + `.claude/rules/browser-tool.md` (rule body) |

---

## Skill Auto-Routing

Auto-routing is driven by each skill's `description`/`when-to-use` — see `@.claude/skills/INDEX.md` for the full list and trigger phrases. Behavior summary:

- User explicitly types `/skillname` → that skill (highest priority).
- "ultrathink" / "ultra think" → `/ultrathink` fires before any other routing.
- Pipeline-work intent words (RCA, fix bug, deploy, clean up, review, research, audit, plan, execute, chain, reflect, etc.) → matching skill per INDEX.
- Multiple intents in one message → chain skills in the order the intents appear; use `/execute` as orchestrator if a plan is involved.
- Ambiguous intent → DO NOT auto-route. Ask which skill applies, or answer directly.
- **EXPLICIT-ONLY skills** (`/report`, `/encore-questions`, `/standup`, `/end-day`, `/end-week`, `/next-this-week`) — fire only when the user literally types the slash command. Other skills MUST NOT auto-call these.

---

## Skill Dependency Graph

See `@.claude/skills/INDEX.md` and each skill's own SKILL.md for the canonical auto-call relationships. High-level shape: `/identity` is the universal gate (auto-called by all non-leaf skills as their first step); `/regression-guard`, `/reflect`, `/questionnaire` are leaf skills (inherit parent identity); `/relevant`, `/upgrade`, `/sonnet` are utilities (no auto-calls). No circular dependencies. `/upgrade` is embedded as Step 4.5 of `/reflect` and `/compile-learnings` (not auto-called).

---

## Model-Aware Guardrails

**Sonnet task boundaries** — same HALT mechanism as `/identity` file ownership:

- **[HALT]** Sonnet + MCP browser tools = BLOCKED. Write handoff note, skip step.
- **[HALT]** Sonnet + RCA / debugging / hypothesis = BLOCKED. Flag with [?], skip step.
- **SAFE**: Page objects, specs, test data, selectors, docs (deterministic file edits).
- Plans tag steps `[SONNET-SAFE]` or `[OPUS-ONLY]`. Sonnet skips `[OPUS-ONLY]` with handoff.
- **Deterministic-probe delegation (LR-064)**: Haiku/Sonnet MAY drive `playwright-cli` (Bash, NOT MCP browser) for deterministic input-trials under Opus orchestration; the two `[HALT]` lines above STAND (judgment/RCA/coverage/per-field disposition never delegate — this scopes the halts, does not loosen them). Full technique → ticket DOCTRINE, cite AGENT_SHARED_RULES §4 + LR-064.
- **Worker ladder (LR-064 / Tiered Delegated Walk)**: for any field-gathering walk the cheapest-capable tier does the clicking — Haiku (simple/deterministic) → Sonnet (cascading / multi-row / launcher, or Haiku's report failed verify) → Opus-self (both failed, or adaptive). Opus owns recon, the LR-062 machine denominator, the `field-case-generation.md` §2 taxonomy, the per-field verify (no rubber-stamping), and the disposition.

Activation: `/sonnet` or "sonnet mode". Deactivation: `/sonnet off`. Full guardrails: `@.claude/skills/sonnet/SKILL.md`.

---

## Build-Over-Time Triggers

Most framework drift comes from forgetting to capture a recurring pattern. When you notice any of these signals, encode them at the right layer instead of correcting in chat for the third time:

- Claude gets a convention wrong **2×** in this repo → add the rule to `CLAUDE.md` (or the matching `.claude/rules/<topic>.md` if path-scoped).
- Same prompt / playbook reused **3rd time** → save as a skill under `.claude/skills/<name>/SKILL.md`.
- Want behavior to fire **every time without asking** → wire as a hook in `.claude/settings.json` (PreToolUse / Stop).
- Side task floods the conversation with output you won't reference → route through a subagent for context isolation.
- Second repo needs the same setup → package as a plugin.

When a memory-file-only rule fails twice (READ + WRITE pattern), graduate it to `LR-NNN` in `LEARNED_RULES.md` or a path-scoped rule (precedent: LR-039 from `feedback_handoff_no_blockers.md`).

---

## /clear Discipline

- Use `/clear` between unrelated tasks. Long sessions accumulate corrections that bias future answers.
- After **2 failed corrections** on the same problem, `/clear` and rewrite the prompt with better context.
- A clean session with a better prompt beats a long session with accumulated corrections.
- Pure-chat sessions (zero mutations) skip `/final-q`; everything else still requires it before exit (per LR-042).

---

## Numbering Convention (LR-NNN lookup)

Existing `LR-NNN` numbers are grandfathered. New framework rules continue after `LR-045`. New client-specific rules use `LR-{CLIENT}-NNN` (e.g., `LR-ENC-NNN`) to prevent collision. When looking up any `LR-NNN`:

1. Path-scoped framework rules: `.claude/rules/*.md`
2. Cross-cutting framework rules: `@docs/read_only_docs/LEARNED_RULES.md`
3. Client-specific rules: `@clients/${ACTIVE_CLIENT}/CLAUDE.md`

---

## Repo Structure (post-2026-04-30 client-deliverable rebuild)

- `src/` — **shared framework source** (utilities, contracts) used by `pipeline/`. Client-side framework code lives inside each client at `clients/<id>/src/` and ships directly via `git archive`. Adding code here = NOT automatically shipped to clients (use `clients/<id>/src/` for client-shippable code).
- `pipeline/` — **internal runtime**. Orchestrator, server, worker, agent-notification-writer, hook tests. NEVER ships. Adding code here = agent-only by default.
- `clients/<id>/` — **per-client surface**. Page objects, selectors, specs, test data, config. Self-contained: own `package.json`, `playwright.config.ts`, `tsconfig.json`, `.gitignore`. Ships via `npm run client:ship -- --client=<id> --out=<path>` (which uses `git archive HEAD clients/<id>/`).
  - Tracked: `src/` (POM layout — `pages/` + `pages/components/`, `fixtures/`, `selectors/`, `data/<module>/`, `utils/`, `setup/`, `reporter/`, `types/`), `tests/` (spec files + `auth.setup.ts`), `config/` (Allure assets only), `.env.e2e` (CI config, no creds), `package.json`, `playwright.config.ts`, `tsconfig.json`, `.gitignore`, `README.md`. POM naming detail (2026-06-05 PLAN_ENCORE_POM_RESTRUCTURE restructure) → workers cite AGENT_SHARED_RULES §4.
  - Gitignored at per-client level: `CLAUDE.md`, `specs_planning/`, `readable_externals/`, `docs/read_only_docs/`, `.auth/`, `.env.*.local`, `.env.server`.
- Ship discipline: NEVER `cp -r clients/<id>` for delivery. Always `npm run client:ship`. Pre-push hook refuses pushes that would leak gitignored content via tracked-but-forbidden patterns. Rule: LR-049 in `.claude/rules/pipeline.md`.

---------------------------

### When responding to Rutvik
Only respond in simple understandable oneliners for each important thing. Unless user asks for more details.