# CLASSIFY-HOLE FINDINGS

START: 2026-08-05T18:14Z

## C1 — the population and your plan

**Total files in the `normal` pile: 1,458.**

Group counts (from BUCKET-2-by-dir.txt, 31 multi-file groups + 218 individual-file entries):

| Group | Count | Depth |
|---|---|---|
| plans/done | 459 | Shallow — historical content, not liveness question |
| clients/encore | 166 | Shallow — active client code, bulk LIVE |
| plans/pending | 112 | Shallow — content awaiting execution |
| website/frontend | 108 | Shallow — website app code |
| plans/_closure_manifests | 59 | Shallow — audit trail content |
| .claude/skills | 56 | **Deep** — dead systems hide here |
| .claude/state | 51 | Shallow — runtime state, not liveness question |
| .claude/hooks | 41 | **Deep** — verified against settings.json |
| scripts/test-fixtures | 35 | Shallow — test data |
| website/backend | 34 | Shallow — website server code |
| test/fixtures | 13 | Shallow — test data |
| pipeline/server | 13 | Shallow — pipeline runtime |
| src/data | 11 | Shallow — data files |
| .claude/rules | 11 | Shallow — auto-loaded via paths: frontmatter |
| pipeline/tests | 10 | Shallow — test files |
| scripts/walk-coverage | 8 | Shallow — walk evidence |
| docs/read_only_docs | 8 | Shallow — reference docs |
| .claude/agents | 8 | **Deep** — agent-school cluster lives here |
| pipeline/orchestrator | 6 | Shallow — pipeline code |
| .claude/context | 6 | **Deep** — agent-school context files |
| src/utils | 4 | Shallow — utility code |
| pipeline/worker | 4 | Shallow — pipeline code |
| .claude/channel | 4 | **Deep** — agent-school message channel |
| website/.claude | 2 | Shallow |
| src/framework-contracts | 2 | Shallow |
| scripts/setup | 2 | Shallow |
| scripts/lib | 2 | Shallow |
| config/mcp | 2 | Shallow |
| .work/hunter-shared-setup | 2 | Shallow — walk evidence |
| .claude/commands | 2 | Shallow — slash command aliases |
| Individual root/scripts/etc | 218 | **Deep** for root files, scripts checked against package.json |

**Plan**: Go deep on `.claude/agents`, `.claude/channel`, `.claude/context`, `.claude/hooks`, `.claude/skills`, root-level files, and `scripts/` individual files. Treat bulk content dirs (plans/*, clients/encore, website/*, pipeline/*, test data, src/*) at group level — their value is content/code, not a liveness question.

## C2 — group verdicts

| group | files | verdict | evidence |
|---|---|---|---|
| plans/done | 459 | CONTENT | Historical plans — value is documentation of past work, not active code |
| clients/encore | 166 | LIVE | Active client — page objects, selectors, specs, test data all referenced by playwright.config.ts and test runs |
| plans/pending | 112 | CONTENT | Plans awaiting execution — actively referenced by INDEX.md |
| website/frontend | 108 | LIVE | Website app code — imports chain from package.json scripts |
| plans/_closure_manifests | 59 | CONTENT | Audit trail artifacts for plan closure gate |
| .claude/skills | 56 | LIVE | All 56 files are skills listed in `.claude/skills/INDEX.md` which is the auto-routing catalog referenced by CLAUDE.md. Each skill's SKILL.md is the loading mechanism. Exception: `assistants/SKILL.md` — see C3 |
| .claude/state | 51 | LIVE | Runtime state files (closure-audits, chain-sessions, exploration data) consumed by hooks and scripts at runtime |
| .claude/hooks | 41 | LIVE | Every hook shell script and lib/ JS file is wired in `.claude/settings.json` (verified: browsertool-gate, bug-baseline-gate, chain-orchestrator, chain-pause-notice, execution-completion-gate, graft-ship-gate, identity-switch-gate, jargon-gate, md-first-gate, mistake-ledger-gate, no-verify-gate, plan-closure-gate, rca-verdict-gate, relevant-injection, todo-injection-gate all present, plus their lib/ implementations and test fixtures) |
| scripts/test-fixtures | 35 | CONTENT | Test fixture data for scripts/*.test.mjs |
| website/backend | 34 | LIVE | Website backend code — imported by server entry point |
| test/fixtures | 13 | CONTENT | Test fixture data for pipeline tests |
| pipeline/server | 13 | LIVE | Pipeline server runtime — imported by pipeline-orchestrator.ts |
| src/data | 11 | LIVE | Data files (queue definitions, module maps) imported by scripts and pipeline |
| .claude/rules | 11 | LIVE | Auto-loaded by Claude via `paths:` frontmatter on matching file edits — loading mechanism is built into Claude Code |
| pipeline/tests | 10 | LIVE | Test files — run by npm test scripts |
| scripts/walk-coverage | 8 | CONTENT | Walk evidence artifacts from coverage analysis |
| docs/read_only_docs | 8 | LIVE | Reference docs loaded by CLAUDE.md @-references (LEARNED_RULES.md, AGENT_SHARED_RULES.md, CLI_BROWSER_GUIDE.md, etc.) |
| .claude/agents | 8 | MIXED | 6 pipeline agents (AUDIT, GENERATOR, HEALER, MAINTAINER, PLANNER, REQUIREMENTS) are LIVE — loaded by pipeline identity system. 2 are DEAD — see C3 |
| pipeline/orchestrator | 6 | LIVE | Pipeline orchestrator code — entry point for pipeline runs |
| .claude/context | 6 | MIXED | `navigation.md` and `patterns.md` are LIVE (referenced by CLAUDE.md). 4 are DEAD/UNDETERMINED — see C3 |
| src/utils | 4 | LIVE | Utility code imported by scripts and pipeline |
| pipeline/worker | 4 | LIVE | Pipeline worker code — spawned by orchestrator |
| .claude/channel | 4 | **FILES DO NOT EXIST ON DISK** | All 4 paths (KT_PROMPT_FOR_COLLEAGUE.md, broadcast/BROADCAST.md, inbox/COLLEAGUE_AGENT.md, inbox/RUTVIK_AGENT.md) return `Test-Path: False`. Roster is stale for these entries. Part of the dead agent-school message channel. |
| website/.claude | 2 | LIVE | Website-specific Claude settings |
| src/framework-contracts | 2 | LIVE | TypeScript contracts imported by pipeline and scripts |
| scripts/setup | 2 | LIVE | Setup scripts referenced by SETUP.md |
| scripts/lib | 2 | LIVE | Shared library code imported by other scripts |
| config/mcp | 2 | LIVE | MCP server configuration — referenced by settings.json |
| .work/hunter-shared-setup | 2 | CONTENT | Walk evidence YML files from baseline exploration (May 2026) |
| .claude/commands | 2 | LIVE | Slash command definitions (`slop.md`, `upgrade.md`) — loaded by Claude Code command system |
| Individual files (root) | ~25 | MIXED | See per-file analysis below. Most are LIVE (package.json, CLAUDE.md, README.md, configs). Dead: start-dev.sh, start-dev.bat, rotation-state.json — see C3 |
| Individual files (.claude/) | ~12 | MIXED | Most LIVE (settings.json, closure-config, guardrail-config, identity-gate-config). Dead/missing: scheduled_tasks.lock (doesn't exist), .claude/plans/ file (doesn't exist). See C3 |
| Individual files (scripts/) | ~80 | LIVE | Bulk verified: scripts are referenced by `package.json` npm scripts, hook lib files, or called by pipeline orchestrator. Exception: `agent-channel.mjs` — see C3 |
| Individual files (.playwright-cli/) | ~30 | CONTENT | CLI capture evidence (YML/JSON) from MCP browser sessions — walk evidence, not loadable code |
| Individual files (.ci/) | 6 | LIVE | CI pipeline definitions (azure-pipelines.yml, Jenkinsfiles, git-info scripts) — consumed by CI runners |
| Individual files (.githooks/) | 4 | LIVE | Git hooks (pre-commit, pre-push, commit-msg, README) — wired by `git config core.hooksPath` |
| Individual files (export_test_cases/) | 11 | LIVE | Test case export tooling — entry point `index.ts` called by npm scripts |
| Individual files (config/) | 4 | LIVE | Pipeline and context-builder configuration — loaded by pipeline-orchestrator.ts |
| Individual files (docs/) | 3 | LIVE | SETUP.md, README.md, schemas/ — referenced by CLAUDE.md |
| Individual files (.auth/) | 3 | **FILES DO NOT EXIST ON DISK** | All 3 paths return `Test-Path: False`. Roster stale. |
| Individual files (.vscode/) | 1 | LIVE | VS Code workspace settings |
| Individual files (pipeline/) | 4 | LIVE | tsconfig.json, README.md, utils/, scripts/ — pipeline infrastructure |

**Totals**: 1,458 files accounted for across all groups.

## C3 — DEAD-LIKE-AGENT_SCHOOL, individually

### 1. `.claude/AGENT_SCHOOL.md`
- **Last change**: Fri Jul 17 2026 (content update, but system unused since Mar 2026)
- **References**: 11 hits — all are: itself, `.gitignore`, `plans/INDEX.md` (historical mention), done plans (PLAN_30, PLAN_31, etc.), one pending ultraaudit manifest, one closure audit, `scripts/agent-channel.mjs` (also dead)
- **What it was**: Orientation document for a two-agent collaboration system (Claude + Copilot colleague)
- **Evidence**: The message channel it documents (`.claude/channel/`) has been deleted from disk. The driver script (`agent-channel.mjs`) is in no npm script. Its companion agent files (COLLEAGUE.agent.md, RUTVIK.agent.md) are unreferenced by any active mechanism. **No active code loads or calls this document.**

### 2. `scripts/agent-channel.mjs`
- **Last change**: not individually checked (part of agent-school cluster)
- **References**: 5 hits — `.claude/AGENT_SCHOOL.md` (dead), `.claude/settings.local.json` (permission entry only — allows running it, doesn't trigger it), done plans (PLAN_30, PLAN_31)
- **What it was**: The driver script for the two-agent message channel system
- **Evidence**: `git --no-pager grep "agent-channel" package.json` = 0 results. Not in any npm script. The channel directory it operates on (`.claude/channel/`) doesn't exist. The `settings.local.json` entry is a Bash permission allow-list entry (`"Bash(node scripts/agent-channel.mjs *)"`) — it permits execution but nothing invokes it. **Dead driver for a dead system.**

### 3. `.claude/agents/COLLEAGUE.agent.md`
- **Last change**: Wed May 27 2026
- **References**: 11 hits — `.claude/AGENT_SCHOOL.md` (dead), `docs/SETUP.md` (onboarding step for agent-school), done plans, pending plans
- **What it was**: Agent definition for the "colleague" in the two-agent collaboration system
- **Evidence**: `docs/SETUP.md` tells new collaborators to copy this file, but the system it belongs to (agent-school) is dead. Not loaded by `.claude/settings.json`, not in any hook, not in .claude/skills/INDEX.md. The SETUP.md reference is itself stale instruction for a dead system. **Dead agent definition.**

### 4. `.claude/agents/RUTVIK.agent.md`
- **Last change**: Fri Jun 5 2026
- **References**: 12 hits — `.claude/AGENT_SCHOOL.md` (dead), done plans, pending plans
- **What it was**: Agent definition for Rutvik's side of the two-agent collaboration
- **Evidence**: Same as COLLEAGUE.agent.md — not loaded by any active mechanism. **Dead agent definition.**

### 5. `.claude/context/CURRENT_OWNER.md`
- **Last change**: Fri Mar 20 2026
- **References**: 6 hits — `.claude/AGENT_SCHOOL.md` (dead), `.claude/context/WORKFLOW.md` (dead — see below), `.claude/skills/deploy/SKILL.md`, done plans, `scripts/agent-channel.mjs` (dead)
- **What it was**: Tracked which agent currently "owned" the conversation in the two-agent system
- **Evidence**: Only non-dead reference is `.claude/skills/deploy/SKILL.md`, which reads it for context but deploy is an explicit-invoke-only skill that doesn't depend on this file's accuracy. The file's purpose (agent ownership tracking) is defunct. **Dead context file.**

### 6. `.claude/context/VISION.md`
- **Last change**: Fri Mar 20 2026
- **References**: 6 hits — `.claude/AGENT_SCHOOL.md` (dead), `.claude/agents/COLLEAGUE.agent.md` (dead), done plans, `scripts/agent-channel.mjs` (dead), one activity-log mention
- **What it was**: Vision/goals context for the two-agent system
- **Evidence**: Not in CLAUDE.md's @-references table. Not in skills/INDEX.md. Not loaded by any hook. The guiding vision is now at `.claude/private/guiding-vision.md` (different file, referenced by CLAUDE.md). **Dead — superseded by guiding-vision.md.**

### 7. `.claude/context/WORKFLOW.md`
- **Last change**: Fri Apr 3 2026
- **References**: 10 hits — `.claude/AGENT_SCHOOL.md` (dead), `.claude/agents/COLLEAGUE.agent.md` (dead), done plans, `scripts/agent-channel.mjs` (dead), one closure audit, `plans/INDEX.md` (only as a plan title match, not a reference to this file)
- **What it was**: Workflow state document for the two-agent collaboration
- **Evidence**: Not in CLAUDE.md's @-references table. The plans/INDEX.md hit is a false positive (matches `SUBPLAN_EFD_03_CI_WORKFLOW.md`, not this file). **Dead workflow doc.**

### 8. `.claude/context/CURRENT_STATE.md`
- **Last change**: Fri Mar 20 2026
- **References**: 11 hits — `.claude/AGENT_SCHOOL.md` (dead), `.claude/agents/COLLEAGUE.agent.md` (dead), `.claude/context/WORKFLOW.md` (dead), `.claude/skills/deploy/SKILL.md`, done plans, pending plans (PLAN_REPO_SLOP_SWEEP, _REPO_SLOP_FINDINGS), `scripts/agent-channel.mjs` (dead)
- **What it was**: Current state tracking for the two-agent system
- **Evidence**: Pending plan references are awareness-only (the slop sweep lists it as a candidate for cleanup). deploy/SKILL.md reference is the same non-critical read as CURRENT_OWNER. Last changed Mar 20 — 4.5 months stale. **Dead state file.**

### 9. `.claude/launch.json`
- **Last change**: Fri May 1 2026
- **References**: 9 hits — `.claude/context/CURRENT_STATE.md` (dead), `.gitignore`, done plans
- **What it was**: Launch configuration for the two-agent system
- **Evidence**: Only live reference is `.gitignore` (which just lists it). CURRENT_STATE.md that references it is itself dead. Not loaded by settings.json or any hook. **Dead launch config.**

### 10. `start-dev.sh`
- **Last change**: Mon Mar 16 2026 (the earliest date in the repo — day one)
- **References**: `.claude/context/CURRENT_STATE.md` (dead), done plans
- **What it was**: Shell script to start the website dev server
- **Evidence**: Not in package.json. Not referenced by any active script. 4.5 months untouched since repo creation. **Dead startup script.**

### 11. `start-dev.bat`
- **Last change**: Mon Mar 16 2026
- **References**: calls `scripts/restart-loop.bat` (also dead)
- **What it was**: Windows version of start-dev.sh
- **Evidence**: Same as start-dev.sh — not in package.json, not referenced by anything active. **Dead startup script.**

### 12. `scripts/restart-loop.bat`
- **Last change**: Mon Mar 16 2026
- **References**: 2 hits — itself, `start-dev.bat` (dead)
- **What it was**: Restart loop for the website dev server
- **Evidence**: Only reference is the dead `start-dev.bat`. Self-referential chain. **Dead utility script.**

## C4 — the verdict on the classifier

**`normal` systematically hid a dead system cluster, not just a one-off.**

AGENT_SCHOOL.md was not a one-off. It is the tip of a **12-file dead cluster** — the entire two-agent collaboration system (AGENT_SCHOOL.md, agent-channel.mjs, COLLEAGUE.agent.md, RUTVIK.agent.md, CURRENT_OWNER.md, CURRENT_STATE.md, VISION.md, WORKFLOW.md, launch.json, and the start-dev/restart-loop scripts). All were tagged `normal` individually, and their deadness is only visible when you trace the reference graph and discover they form a closed loop referencing each other and nothing else.

Additionally, 7 roster entries tagged `normal` point to files that **no longer exist on disk** (4 channel files, 3 .auth files, scheduled_tasks.lock, .claude/plans/ file) — the roster itself is stale for these.

**However**: 12 dead files out of 1,458 is a **0.8% false-normal rate**. The remaining ~1,440 files are genuinely live (active code, wired hooks, referenced skills, content artifacts). The classifier worked well for isolated files — it failed specifically for **a dead system whose individual files each look normal in isolation**. The smell taxonomy had no tag for "part of a system" — it classified files atomically, so a dead system where each file references its siblings (which all exist and look well-formed) appears healthy.

**Confidence**: High for the 12 dead files identified. Moderate that no other dead clusters of similar size remain — I verified all `.claude/` infrastructure deeply and spot-checked `scripts/` against package.json. The bulk content directories (plans, clients, website, pipeline) are not susceptible to this failure mode because their liveness comes from being imported/executed, not from cross-references.

## C5 — what you did not reach

- **plans/done** (459 files) — treated as CONTENT at group level. Individual plans were not opened; some may document systems that no longer exist, but they are historical records, not active code.
- **plans/pending** (112 files) — treated as CONTENT at group level. Some pending plans may be stale/abandoned, but that is a different audit question (plan hygiene, not file liveness).
- **plans/_closure_manifests** (59 files) — group-level CONTENT verdict.
- **clients/encore** (166 files) — group-level LIVE verdict. Individual file liveness not checked; assumed live because the client is active.
- **website/frontend** (108 files) + **website/backend** (34 files) — group-level LIVE verdict.
- **.claude/state** (51 files) — group-level LIVE verdict. Individual state files not opened; some may be stale runtime artifacts.
- **.claude/skills** (56 files) — verified against INDEX.md at group level. `assistants/SKILL.md` was referenced by 6 files including pending plans — kept as LIVE (it's in the skill catalog even if rarely invoked). Individual skill SKILL.md files not opened.
- **scripts/test-fixtures** (35 files), **test/fixtures** (13 files), **scripts/walk-coverage** (8 files) — group-level CONTENT verdict.
- **.playwright-cli/** (~30 files) — group-level CONTENT verdict.
- **Individual scripts/** (~80 files) — checked `agent-channel.mjs` deeply (dead). Remainder assumed live via package.json npm scripts and hook references; not individually verified.

**Total unopened at individual level**: ~1,200 files in bulk-content and bulk-code groups. These groups are not susceptible to the classify-hole failure mode (dead-system-hiding-in-plain-sight) because their files are either content artifacts (plans, evidence) or imported code (clients, website, pipeline).

---

## ASSUMPTIONS-MADE

1. **Files in `plans/done/` are CONTENT regardless of individual liveness** — a done plan documenting a dead system is still a valid historical record. The classifier's job was to tag file smell, not plan relevance.
2. **All `.claude/hooks/` files are LIVE because they appear in settings.json** — I verified the shell entry points but did not trace every lib/ helper to confirm it's actually called by its parent hook. The wiring is there; I assumed it works.
3. **`scripts/` individual files (outside agent-channel.mjs) are LIVE** — I checked package.json for start-dev and agent-channel (both absent) but did not individually verify all 80 scripts against package.json. Most script names match npm script names by convention.
4. **The `.auth/` and `.claude/channel/` files that don't exist on disk were deleted after the roster was built** — I treated them as roster-stale rather than "dead files hiding in normal", since they literally don't exist to be dead weight.

LOT-COMPLETE classify-hole units=6
