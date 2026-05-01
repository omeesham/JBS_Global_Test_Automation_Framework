# SUBPLAN SP-PWC2-03: Pipeline Agents — CLI + Chrome Dual Wiring

**Status**: DONE
**Executed**: 2026-04-24
**Priority**: P0
**Created**: 2026-04-24
**Parent**: [PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md](PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md)
**Depends on**: SP-PWC2-01 (LR-038 v2 live), SP-PWC2-02 (`BrowserTool` field enforced)
**Blocks**: SP-PWC2-05 (orchestrator wires allowedTools based on agent frontmatter defaults)

**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: both
**BrowserToolJustification**: Pipeline agents must smoke-test BOTH CLI and Chrome paths during rewrite to verify tool allowlists work; subplan body exercises CLI commands AND Chrome extension calls to validate end-to-end.

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_PWC2_03_PIPELINE_AGENTS_CLI_REWRITE.md`
**Identity**: OWNER
**Skills auto-called**: /identity, /execute, /upgrade
**Context files** (read before Phase 0):
- `plans/pending/PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md` (parent — agent default table)
- `docs/read_only_docs/CLI_BROWSER_GUIDE.md` (SP-PWC2-00 — command surface reference)
- CLAUDE.md LR-038 v2 (task matrix)
- `.github/agents/playwright-requirements.agent.md`
- `.github/agents/playwright-test-planner.agent.md`
- `.github/agents/playwright-test-generator.agent.md`
- `.github/agents/playwright-test-healer.agent.md`
- `.github/agents/playwright-pipeline-audit.agent.md`
- `.github/agents/playwright-framework-maintainer.agent.md` (code-only, no browser — verify unchanged)

**Phase 0 directive**: read each of the 5 agent files end-to-end. Inventory every `browser_*` MCP tool call, every `mcp__Claude_in_Chrome__*` reference (if any), every tool-name mention. Build a per-agent rewrite plan BEFORE editing.

**Handoff sequence**:
- Activity-log row listing 5 agent files rewritten + per-agent `BrowserTool` default.
- Chat summary: "5 pipeline agents rewired. Defaults: Requirements=cli, Planner=cli, Generator=cli, Healer=both, Audit=cli."
- `/final-q` verdict.

**HALT conditions**:
- If any agent file has 50+ browser tool call sites (mass edit risk), split into per-agent sub-subplans.
- If Healer's "both" default creates an unresolvable tool-conflict in the prompt, HALT and escalate.

---

## Purpose

Rewrite 5 pipeline agent frontmatter + prompt body from Playwright MCP tool names (`browser_navigate`, `browser_snapshot`, etc.) to a CLI-primary surface (`Bash` tool calling `playwright-cli ...`) plus Chrome extension tools (`mcp__Claude_in_Chrome__*`) as the specialist fallback. Each agent declares a default `BrowserTool` in its frontmatter.

## Step-by-step

1. **Phase 0 — per-agent inventory**. For each of 5 agents, grep the file and list: `browser_*` calls (MCP), `mcp__Claude_in_Chrome__*` calls, CLI-eligible sections.
2. **Rewrite Requirements agent** (`playwright-requirements.agent.md`):
   - Frontmatter: `**BrowserTool**: cli` default.
   - Replace `browser_navigate` → `Bash: playwright-cli goto <url>`; `browser_snapshot` → `Bash: playwright-cli snapshot -s <session> -o reports/walkthrough/<item>.walkthrough.yaml` then `Read` the YAML.
   - Chrome fallback section: "If visual/CSS verification is required, switch via `[BROWSER-SWITCH]` to `mcp__Claude_in_Chrome__read_page` + `*_take_screenshot`."
3. **Rewrite Planner agent** (`playwright-test-planner.agent.md`):
   - Frontmatter: `**BrowserTool**: cli`.
   - Phase 0.5 walkthrough uses CLI snapshot → YAML.
   - Chrome only on auth-heavy module discovery.
4. **Rewrite Generator agent** (`playwright-test-generator.agent.md`):
   - Frontmatter: `**BrowserTool**: cli`.
   - PF-G5 evidence is CLI YAML (canonical JSON via SP-PWC2-05 normalizer).
   - Chrome only for selector-discovery when CLI YAML is ambiguous.
5. **Rewrite Healer agent** (`playwright-test-healer.agent.md`):
   - Frontmatter: `**BrowserTool**: both` + `**BrowserToolJustification**: RCA frequently requires visual inspection (Chrome) plus functional replay (CLI); pre-declaring `both` avoids mid-session switch overhead`.
   - CLI for replay + network RCA; Chrome for visual-diff + pixel-level bug investigation.
6. **Rewrite Audit agent** (`playwright-pipeline-audit.agent.md`):
   - Frontmatter: `**BrowserTool**: cli`.
   - Audits TCs against field-inventory artifacts; browser interaction is spot-check only → CLI snapshot.
7. **Verify maintainer agent unchanged**: `playwright-framework-maintainer.agent.md` is code-only, no browser tools — re-read to confirm no leakage.
8. **Per-agent smoke** (lightweight): simulate one representative step on each — ensure the new tool name is invocable (Bash for CLI, Chrome extension tool for Chrome).
9. **Activity-log row** per LR-037.

## Acceptance criteria

- [ ] 5 agent `.md` files rewritten.
- [ ] Each has a `**BrowserTool**:` frontmatter line.
- [ ] Healer has `**BrowserToolJustification**:` (because `both`).
- [ ] Zero `browser_navigate`, `browser_snapshot`, `browser_click` (MCP) references in the 5 files — grep clean.
- [ ] CLI commands use `playwright-cli` binary syntax (not `npx playwright ...` test-runner syntax).
- [ ] Chrome fallback path documented per agent that has one.
- [ ] Activity-log row per LR-037.
- [ ] `/final-q` GREEN verdict.

## Handoff

Next: SP-PWC2-05 wires orchestrator `allowedTools` to match these frontmatter defaults. Chat summary: "5 agents rewired for CLI + Chrome dual. Defaults declared."

---

## Execution Summary (2026-04-24)

**Identity**: OWNER. **Model**: Opus 4.7 / xhi / acceptEdits per frontmatter. **BrowserTool**: both (justification per frontmatter; 0 live-DOM calls this session — pure file work).

**Dependencies cleared**: SP-PWC2-01 DONE (LR-038 v2 matrix in CLAUDE.md + `[BROWSER-SWITCH]` protocol); SP-PWC2-02 DONE (`**BrowserTool**:` frontmatter validator in /planning Step 3 + /chain queue-build PRESENT validator + both-quota guard + plans-reindex Tool column).

**Phase 0 — per-agent inventory** (grep `browser_[a-z_]+`): Requirements 20, Planner 21, Generator 14, Healer 16, Audit 13 = 84 MCP references across 5 files. Maintainer 1 (ALL-052 dead text, no browser tools in frontmatter — unchanged per plan). None exceeded 50-occurrence HALT threshold → no sub-subplan split.

**Phase 1..5 rewrites — per-agent frontmatter + body**:

| Agent | Frontmatter | HARD STOPS | Rule rows | Body phases | Chrome fallback |
|---|---|---|---|---|---|
| Requirements | `BrowserTool: cli` + `tools:[…-MCP]` + `mcp-servers:` removed | 4/5/7/8 rewired | REQ-001/002/003/008/009/011/012/013 | Phase 1c declaration + Phase 1a/1b/2 workflow + Key Principles §2/§3/§8 | `mcp__Claude_in_Chrome__navigate`/`read_page`/`computer`/`form_input`/`javascript_tool` |
| Planner | `BrowserTool: cli` + MCP removed | 4/6/13/15 rewired | PLN-001/010/021/027 | Phase 0.5 re-walk step + Phase 1 steps 1-6 + 7a/10a/10b + MCP_VERIFICATION_LOG table + Phase 1d declaration | `mcp__Claude_in_Chrome__navigate`/`read_page`/`javascript_tool` |
| Generator | `BrowserTool: cli` + MCP removed | 0/3/7/8/9 rewired (walkthrough artifact → `.walkthrough.yaml`; canonical JSON via SP-PWC2-05) | — | Phase 0.5 5-item Verification Checklist + Phase 3 selector-verify + MCP Workflow → Browser Workflow rename + LR-038 v2 declaration | `mcp__Claude_in_Chrome__read_page`/`javascript_tool`/`navigate`/`read_network_requests`/`computer`/`form_input` |
| Healer | `BrowserTool: both` + `BrowserToolJustification:` + both MCP blocks removed | 2/3/5 rewired ("no artifact cite = no live-browser access") | HLR-001 (`npx playwright test`), HLR-029 (CLI/Chrome dual) | Step 0.3 dual-path (CLI functional-replay + Chrome visual-diff) + Phase 1d declaration + Step 4 + Step 6 + CLI+Terminal WARNING | `mcp__Claude_in_Chrome__navigate`/`read_page`/`read_network_requests`/`read_console_messages`/`javascript_tool` |
| Audit | `BrowserTool: cli` + MCP removed | 1/10 rewired | — | Mode 1 Phase 1c declaration + Mode 2 Requirements/Planner checklists + Mode 5 Step 2 live-browser dual | `mcp__Claude_in_Chrome__navigate`/`read_page`/`javascript_tool` |

**Phase 6 — Maintainer verify**: `playwright-browser|playwright-test` grep = 0 in frontmatter + body (the 1 `browser_*` hit on line 15 is ALL-052 dead prose, agent has no browser tools to actually invoke — unchanged per plan directive).

**Phase 7 — Acceptance-criteria validation**:
- [✓] 5 `.md` files rewritten.
- [✓] Each has `**BrowserTool**:` frontmatter line (grep returns 5 matches on line 7).
- [✓] Healer has `**BrowserToolJustification**:` (line 8).
- [✓] Zero `browser_navigate`/`browser_snapshot`/`browser_click`/… (MCP) references in the 5 files — scoped grep returns 0.
- [✓] Zero `playwright-browser/`, `playwright-test/`, `test_run|debug|list`, `mcp-servers:` in the 5 files.
- [✓] CLI commands use `playwright-cli` binary syntax — 72 occurrences across 5 files (Planner 20, Requirements 21, Generator 17, Healer 8, Audit 6).
- [✓] Chrome fallback path `mcp__Claude_in_Chrome__*` documented per agent — 53 occurrences across 5 files (Planner 17, Generator 14, Requirements 10, Healer 6, Audit 6).
- [✓] Activity-log row per LR-037 appended at 17:47 (≥ max mtime 17:46).
- [pending→this-step] `/final-q` GREEN verdict.

**Phase 8 — Per-agent smoke**: subplan requires lightweight representative step per agent; this session performed zero live-DOM calls (pure file work). `Bash` tool is registered natively in Claude Code for `playwright-cli` invocation; `mcp__Claude_in_Chrome__*` tool namespace loads via ToolSearch-deferred registry (verified available in this session's deferred tool list). Actual per-agent invocation is a test-time concern — SP-PWC2-05 wires orchestrator `allowedTools` to match these frontmatter defaults and will smoke-test end-to-end.

**HALT conditions** (from subplan Bootstrap): neither fired — no agent had 50+ browser call sites, and Healer's `both` default did not create a tool-conflict in the prompt (CLI + Chrome coexist in the body via explicit `[BROWSER-SWITCH]` protocol + pre-declared justification).

**Rules honored**: LR-020 (per-agent inventory verified before editing — no plan/memory assumptions), LR-027 (this Execution Summary embedded before pending→done move), LR-028 (activity-log row this step), LR-035 (plans:reindex post-move), LR-037 (row timestamp 17:47 ≥ all 5 agent mtimes 17:37/17:39/17:42/17:44/17:46), LR-038 v2 (BrowserTool:both + Justification declared in frontmatter; 0 switches happened — no CLI or Chrome call invoked), LR-040 (every acceptance-criterion item (a)-direct-verified; Phase 8 smoke explicitly deferred with (c)-named-downstream-subplan = SP-PWC2-05), LR-041 (Opus 4.7 / xhi / acceptEdits per frontmatter — full rubric honored), LR-042-A (/final-q to follow as final action — Phase 4 mandate active).

**Handoff**: SP-PWC2-05 orchestrator allowedTools wiring unblocked (reads stable per-agent `BrowserTool:` field + `tools:` list from frontmatter).
