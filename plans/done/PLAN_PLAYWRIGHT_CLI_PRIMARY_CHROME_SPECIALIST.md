# PLAN: Playwright CLI Primary + Claude-in-Chrome Specialist (hybrid)

**ID**: PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST
**Created**: 2026-04-24
**Status**: DONE
**Executed**: 2026-04-24
**Priority**: P0 (top — user-prioritized 2026-04-24, blocks waste of Chrome/CLI tokens across pipeline)
**Supersedes**: [PLAN_PLAYWRIGHT_CLI_FULL_SWITCH.md](PLAN_PLAYWRIGHT_CLI_FULL_SWITCH.md) (thesis change: Chrome retained as specialist, not retired)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: plan
**BrowserTool**: none
**Identity**: OWNER

---

## Context

The existing [PLAN_PLAYWRIGHT_CLI_FULL_SWITCH.md](PLAN_PLAYWRIGHT_CLI_FULL_SWITCH.md) (P3, 2026-04-20, 209 lines, 6 phases, no subplans) commits to retiring Playwright MCP **and** treats Playwright CLI as the sole browser tool after Phase 6. User directive 2026-04-24:

- MCP retirement stays (good).
- CLI-only is **wrong**. Claude in Chrome must remain first-class for tasks it genuinely wins: visual/CSS bugs, MFA/SSO auth, interactive RCA, "feel"-checking UX.
- Selection must be **structural** — every new subplan declares a `**BrowserTool**` frontmatter flag (parity with LR-041's `Model`/`Thinking`/`PermissionMode`). Agents consume the flag, don't re-decide per turn.
- "Adaptive and nimble" — a single subplan may use CLI for 90% of work and Chrome for one visual check. Mid-subplan switches are allowed but logged.
- Never waste Chrome on what CLI could do (4× token cost). Never waste CLI when Chrome wins (visual bugs, live MFA).

This is a thesis change, not a delta. V1's "CLI for everything" framing would sabotage visual QA and make MFA/SSO re-auth loops expensive. Playwright CLI's own README says MCP "still has its place" for persistent state and long agentic loops; V2 replaces that niche with **Claude in Chrome**, not with nothing.

---

## Researcher claim validation (WebSearch, 2026-04-24)

| Claim | Verdict | Source |
|---|---|---|
| `@playwright/cli` — Microsoft, early 2026, binary `playwright-cli` | **CONFIRMED** | playwright.dev/agent-cli + github.com/microsoft/playwright-cli |
| MCP 114K → CLI 27K tokens (~4×), some teams report 10× on long sessions | **CONFIRMED** (Playwright team's own benchmark) | testcollab, scrolltest (Pramod Dutta), morphllm |
| YAML snapshot on disk; agent gets file path, reads on demand | **CONFIRMED** | playwright.dev/agent-cli |
| `playwright-cli show` multi-session dashboard | **CONFIRMED** | playwright.dev, testdino |
| Claude in Chrome: no headless, Chrome/Edge only | **CONFIRMED** | code.claude.com/docs/en/chrome |
| Claude in Chrome inherits live browser session (SSO/MFA win) | **CONFIRMED** | claude.com/claude-for-chrome |
| Version floor: Claude Code 2.0.73+ + extension 1.0.36+ | **CONFIRMED** (as of 2026-04-07) | code.claude.com |
| MCP degrades after ~15 interactions | **NOT INDEPENDENTLY CONFIRMED** — folk wisdom; don't cite as fact |
| Outpost 2–3× slower wall-clock | **NOT RE-CONFIRMED this pass** — flag as UNVERIFIED in CLI_BROWSER_GUIDE (V1 cited it; V2 must re-fetch) |
| CLI wins functional / Chrome wins visual | Heuristic (reasoning, not measured). Adopt as design rule, don't cite as benchmark |

---

## Shape — V2 supersedes V1

Not edit-in-place, not delta. V1's "full retirement" decision is load-bearing history; editing destroys provenance. Delta plan would create two sources of truth with conflicting `/chain` order.

**Action on V2 Phase 0**: `git mv plans/pending/PLAN_PLAYWRIGHT_CLI_FULL_SWITCH.md plans/done/` with "SUPERSEDED (thesis change: Chrome retained as specialist)" appended. V1's MCP-retirement phases stay valid and are reused verbatim by SP-PWC2-07.

---

## Subplan breakdown (8 subplans, LR-041-compliant)

Each subplan will be authored as a separate file at execution time. Frontmatter template: `**Model** / **Thinking** / **PermissionMode** / **Depends on** / **Identity** / **Skills** / **BrowserTool**` (new field — bootstraps itself).

| # | File | Model | Think | PermMode | Scope |
|---|---|---|---|---|---|
| **SP-PWC2-00** | [SUBPLAN_PWC2_00_RESEARCH_AND_VERIFY_CLAIMS.md](SUBPLAN_PWC2_00_RESEARCH_AND_VERIFY_CLAIMS.md) | opus-4-7 | xhi | auto | WebFetch every researcher claim; write `docs/read_only_docs/CLI_BROWSER_GUIDE.md` with inline citations; UNVERIFIED claims explicitly labeled. `BrowserTool: none` |
| **SP-PWC2-01** | [SUBPLAN_PWC2_01_LR038_V2_CHROME_VS_CLI_MATRIX.md](SUBPLAN_PWC2_01_LR038_V2_CHROME_VS_CLI_MATRIX.md) | opus-4-7 | max (**Justification**: multi-rule judgment affecting 24 downstream files) | auto | Rewrite LR-038 as Chrome-vs-CLI 2-way matrix; retire MCP column; add `[BROWSER-SWITCH]` log format. `BrowserTool: none` |
| **SP-PWC2-02** | [SUBPLAN_PWC2_02_PLANNING_SKILL_BROWSERTOOL_FIELD.md](SUBPLAN_PWC2_02_PLANNING_SKILL_BROWSERTOOL_FIELD.md) | opus-4-7 | xhi | auto | Extend `/planning` Step 3 validator + Step 6 bootstrap to require `**BrowserTool**:`; grandfather pre-2026-04-24 subplans. `BrowserTool: none` |
| **SP-PWC2-03** | [SUBPLAN_PWC2_03_PIPELINE_AGENTS_CLI_REWRITE.md](SUBPLAN_PWC2_03_PIPELINE_AGENTS_CLI_REWRITE.md) | opus-4-7 | xhi | acceptEdits | Rewrite 5 agent frontmatter; per-agent default `BrowserTool`. `BrowserTool: both` (**BrowserToolJustification**: smoke-test both paths) |
| **SP-PWC2-04** | [SUBPLAN_PWC2_04_SHARED_RULES_10_IDS_REWRITE.md](SUBPLAN_PWC2_04_SHARED_RULES_10_IDS_REWRITE.md) | sonnet-4-6 | hi | acceptEdits | Rewrite R09/R16/R19/ALL-042/ALL-043/ALL-048/ALL-052/GEN-029/HLR-015/PLN-027 with Chrome carve-outs. `BrowserTool: none` |
| **SP-PWC2-05** | [SUBPLAN_PWC2_05_HARD_GATES_ORCHESTRATOR.md](SUBPLAN_PWC2_05_HARD_GATES_ORCHESTRATOR.md) | opus-4-7 | xhi | acceptEdits | PF-G5 canonical-JSON normalizer; `Stage.mcpConfig` → `cliConfig` + `browserTool`; worker `allowedTools`; pipeline-def stages. `BrowserTool: none` |
| **SP-PWC2-06** | [SUBPLAN_PWC2_06_BROWSERTOOL_GATE_HOOK.md](SUBPLAN_PWC2_06_BROWSERTOOL_GATE_HOOK.md) | opus-4-7 | xhi | auto | Opt-in PreToolUse hook; ships disabled; parity test; LR-043-lesson applied. `BrowserTool: none` |
| **SP-PWC2-07** | [SUBPLAN_PWC2_07_MCP_RETIREMENT_AND_PILOT.md](SUBPLAN_PWC2_07_MCP_RETIREMENT_AND_PILOT.md) | sonnet-4-6 | hi | acceptEdits | Delete `.vscode/mcp.json`; archive `MCP_BROWSER_GUIDE.md`; move V1 → done/; pilot `BrowserTool: both` on one module; measure token delta; decide on hook enablement. `BrowserTool: both` (**BrowserToolJustification**: pilot requires measuring both in one run) |

**Execution order**: 00 → 01 → (02 ‖ 04) → 03 → 05 → 06 → 07. `/chain` cap = 3 per batch (protects against cascading rewrite errors).

---

## LR-038 v2 — task→tool matrix (core content for SP-PWC2-01)

| Task class | Primary | Rationale |
|---|---|---|
| Functional bug (500s, broken link, silent no-op, API 4xx) | **CLI** | `playwright-cli network` + `eval` give structured request logs; ~4× token savings |
| Visual / CSS / layout bug (z-index, overlap, truncation, responsive) | **Chrome** | CLI YAML cannot see rendered pixels; `read_page` + screenshot is pixel-aware |
| Auth-heavy exploration (SSO + MFA + TOTP + Entra FedAuth renewal) | **Chrome** | Inherits live user session. CLI needs one-time `state-save`; fresh MFA/TOTP is Chrome-only |
| Catalog walkthrough / locator discovery (>10 fields) | **CLI** | Repeated snapshots dominate; YAML-on-disk + `Read` beats 4K-token inline dumps |
| Spec generation Phase 0.5 walkthrough (PF-G5 evidence) | **CLI** | Walkthrough → `reports/walkthrough/{itemId}.walkthrough.yaml` |
| Batch regression (unattended, >5 pages) | **CLI** | Headless + multi-browser; Chrome extension has no headless |
| Live RCA (user at machine, "what happens when I click") | **Chrome** | Interactive speed > token cost when human-in-loop |
| MFA / OTP / passkey flow | **Chrome (mandatory)** | CLI cannot solve fresh MFA |
| Spec execution (`npm test`) | Neither — `@playwright/test` runner | Not a browser-tool choice |

**Mid-subplan switch protocol** (mandatory announcement):

```
[BROWSER-SWITCH] from=cli to=chrome reason=<one-line> tokens_so_far=<n> artifact=<file-if-any>
```

Logged via LR-028 activity-log row. `/final-q` audits presence when initial `BrowserTool` was `both` or a switch occurred.

---

## `BrowserTool` frontmatter field spec (for SP-PWC2-02)

- **Allowed values**: `cli` | `chrome` | `both` | `none`
- `none` = subplan does zero live-app interaction (pure refactor / docs).
- `both` **REQUIRES** `**BrowserToolJustification**:` frontmatter line (parity with Opus-max `**Justification**:`). Validator rejects `both` without it.
- **Missing field** = `/planning` Step 3 HALT (no silent defaults — identical posture to LR-041).
- **Agent-file defaults** (in `.github/agents/*.agent.md` frontmatter): Generator=`cli`, Healer=`both`, Planner=`cli`, Requirements=`cli`, Audit=`cli`.
- **Mid-subplan switch**: permitted without re-authoring **if** logged. ≥2 switches → `/final-q` YELLOW (should have been `both`). ≥3 switches → `/audit` RED.
- **`both` quota**: `/chain` queue-build refuses to proceed if >30% of pending subplans are `both` — forces authors to actually decide.

---

## Enforcement strategy

**Prose + skill-time validator for v2.0; PreToolUse hook as opt-in in SP-PWC2-06.**

Tradeoffs:

- Wrong-tool blast radius = **wasted tokens**, not data loss — unlike LR-043 (identity write-gate) where wrong identity writes wrong files. Hard hook isn't justified initially.
- LR-041 precedent: soft gate at authoring time (`/planning` Step 3) has held. Mirror that.
- SP-PWC2-06 hook ships **disabled** in `.claude/settings.json`. Enable only after pilot proves the field is reliable. Avoids repeating the LR-043 self-sabotage (CLAUDE.md L712 remediation notice).

---

## Verification plan

1. **SP-PWC2-00 smoke**: `CLI_BROWSER_GUIDE.md` exists with ≥6 WebFetch-cited claims; UNVERIFIED claims labeled.
2. **LR-038 v2 smoke**: `grep LR-038` across 24 referencing files — every hit still resolves.
3. **BrowserTool field smoke**: author 1 test subplan missing the field → `/planning` Step 3 HALTs.
4. **Pilot** (SP-PWC2-07): one real module, `BrowserTool: both`, CLI for catalog + Chrome for one visual assertion. Measure tokens + wall-clock + `[BROWSER-SWITCH]` count. Target: ≤1 switch, ≥50% token reduction vs MCP baseline.
5. **Full pipeline chain run**: Requirements→Planner→Generator→Audit end-to-end green on pilot module.
6. **Token delta recorded to activity log**. If <2×, re-evaluate before SP-PWC2-06 hook enablement.
7. **Hook validation** (post-enable): deliberately call `mcp__Claude_in_Chrome__*` with `BrowserTool: cli` → deny; override-handshake path works.

---

## Risks + rollback

| # | Risk | Mitigation | Rollback |
|---|---|---|---|
| 1 | `BrowserTool: both` becomes default dumping-ground | Mandatory `BrowserToolJustification`, 30% chain quota, `/audit` rule | Tighten validator in SP-PWC2-02 iter 2 |
| 2 | SP-PWC2-00 finds researcher claims inflated (4× → 1.5× on our workload) | Stop at SP-PWC2-00, re-plan | Nothing downstream touched |
| 3 | SP-PWC2-06 hook self-sabotages like LR-043 did on 2026-04-23 | Ship disabled; parity test + pilot before enable | Flip settings flag off |
| 4 | Chrome extension API changes / connection drops mid-unattended-run | LR-038 v2 sub-clause: on drop, mandatory `[BROWSER-SWITCH]` to CLI | Flip agent default to `cli`, re-run |
| 5 | PF-G5 format drift (Chrome .md vs CLI .yaml) | SP-PWC2-05 normalizer → canonical JSON schema | Revert to CLI-only walkthroughs |
| 6 | Mid-session switches become lazy escape hatch | `/final-q` YELLOW ≥2, RED ≥3 | Author re-flags subplan `both` |

---

## Adversarial self-audit (6 failure modes of this design)

1. **`both` as silent default** — authors reach for `both` to avoid thinking. Fix: `BrowserToolJustification` greppable + 30% chain quota + `/audit` rule ("boilerplate justification = YELLOW").
2. **Mid-session switches encourage lazy authoring** — "I'll switch mid-way" defeats the field. Fix: `/final-q` YELLOW ≥2, RED ≥3; spec'd not aspirational.
3. **Chrome connection drop with no recovery protocol** — researcher flagged it; v2 must address. Fix: LR-038 v2 clause: on drop during unattended run, agent MUST `[BROWSER-SWITCH]` to CLI; failure = RED. Log to `reports/browser-drops/*.json`.
4. **PF-G5 walkthrough format divergence** — Chrome produces .md, CLI produces .yaml; gate accepts either → downstream hallucinates schema. Fix: SP-PWC2-05 canonical normalizer (`walkthrough.canonical.json`). One format downstream.
5. **SP-PWC2-06 hook reads stale parent-plan frontmatter** — orphan-frontmatter trap. Fix: hook reads current `.claude/state/chain-sessions/<plan>.log` subplan pointer, not ancestor. Parity test required (mirror `identity-ownership.mjs` pattern).
6. **Token-savings claim is load-bearing** but we never measure our own workload. Fix: SP-PWC2-07 pilot MUST log actual delta to activity log. If <2×, V2 re-evaluated before SP-PWC2-06 enablement.

---

## Critical files

- `plans/pending/PLAN_PLAYWRIGHT_CLI_FULL_SWITCH.md` → move to `plans/done/` in SP-PWC2-07 Phase 0
- `plans/pending/SUBPLAN_PWC2_00..07_*.md` — 8 subplan files to author at execution time
- `CLAUDE.md` L577–627 (LR-038 rewrite) + LR-041 cross-ref
- `.claude/skills/planning/SKILL.md` — Step 3 validator, Step 6 bootstrap L5.5
- `docs/read_only_docs/AGENT_SHARED_RULES.md` — 10 rule IDs (R09/R16/R19/ALL-042/ALL-043/ALL-048/ALL-052/GEN-029/HLR-015/PLN-027)
- `.github/agents/playwright-{requirements,test-planner,test-generator,test-healer,pipeline-audit}.agent.md`
- `scripts/generator-pre-run.ts` L207–277 (PF-G5 + canonical walkthrough normalizer)
- `src/worker/index.ts:63` (allowedTools), `src/orchestrator/types.ts` (Stage.cliConfig + browserTool)
- `config/pipeline-definition.json` (5 stage entries)
- `.vscode/mcp.json` (DELETE in SP-PWC2-07)
- `docs/read_only_docs/MCP_BROWSER_GUIDE.md` (ARCHIVE) + new `CLI_BROWSER_GUIDE.md`
- `.claude/hooks/browsertool-gate.sh` + `.claude/hooks/lib/check-browsertool.mjs` (SP-PWC2-06, ships disabled)
- `.claude/settings.json` (add hook entry, disabled by default)

---

## Sources (claim validation)

- [playwright.dev/agent-cli Introduction](https://playwright.dev/agent-cli/introduction)
- [microsoft/playwright-cli GitHub](https://github.com/microsoft/playwright-cli)
- [Playwright CLI token-efficiency benchmark — TestCollab](https://testcollab.com/blog/playwright-cli)
- [MCP 114K vs CLI 27K — Pramod Dutta / Medium](https://scrolltest.medium.com/playwright-mcp-burns-114k-tokens-per-test-the-new-cli-uses-27k-heres-when-to-use-each-65dabeaac7a0)
- [morphllm — CLI 4× cheaper](https://www.morphllm.com/playwright-mcp)
- [Claude for Chrome — Anthropic](https://claude.com/claude-for-chrome)
- [Claude Code with Chrome docs](https://code.claude.com/docs/en/chrome)

---

## Execution Summary (2026-04-24, parent-cascade close)

All 8 subplans landed and moved to `plans/done/` in order: SP-PWC2-00 → 01 → 02 → 04 → 03 → 05 → 06 → 07. MCP retired (`.vscode/mcp.json` deleted, `MCP_BROWSER_GUIDE.md` archived, V1 plan → done/). CLI_BROWSER_GUIDE.md published with LB1–LB7 claim-verification trail. LR-038 v2 matrix live. `BrowserTool` frontmatter field validator live in `/planning` + `/chain`. 5 pipeline agents rewired CLI-primary + Chrome-fallback. Canonical walkthrough-schema normalizer + `Stage.browserTool` + `applyBrowserToolGate` worker helper. `browsertool-gate.sh` PreToolUse hook landed DISABLED, then enabled 2026-04-24T22:40 after SP-PWC2-07 v2 pilot measurements + /slop PASS verdict. SP-PWC2-07 v2 pilot produced 3 LR-038 v2 amendments (Visual/CSS + Catalog + Spec-gen rationale columns) landed 2026-04-24T22:35, reflecting measured 1.74× CLI heavier on whole-file reads + both-AX-trees-pixel-blind finding + grep-over-disk discipline. BUG-LOC-BI-001 filed (unknown-route silent redirect). Parent closed via LR-027 parent-cascade clause (added same session, 2026-04-24T22:45).

Outcome: HIGH confidence on our Navigator workload — CLI/Chrome selection is now structurally enforced, measured, and documented.

---

## Execution Summary (2026-04-24)

All 8 subplans landed (SP-PWC2-00 through 07, all in `plans/done/`). Parent cascade-closed per new LR-027 clause because SP-PWC2-07 was the last pending subplan under this parent and I was the subplan-executor this session.

**Subplan chain**:
- SP-PWC2-00 — research + claim validation (LB1-LB7 verdicts, 0 UNVERIFIED)
- SP-PWC2-01 — LR-038 v2 matrix landed in CLAUDE.md
- SP-PWC2-02 — `**BrowserTool**:` frontmatter field validator in `/planning` + `/chain` + plans-reindex
- SP-PWC2-03 — 5 pipeline agents rewritten CLI-primary + Chrome-fallback
- SP-PWC2-04 — `AGENT_SHARED_RULES.md` 10 rules rewired
- SP-PWC2-05 — canonical walkthrough schema + PF-G5 rewrite + orchestrator (Stage type / applyBrowserToolGate)
- SP-PWC2-06 — `browsertool-gate.sh` hook + fixtures + parity check (shipped disabled)
- SP-PWC2-07 — MCP retirement (`.vscode/mcp.json` deleted, V1 guide archived) + live pilot

**Pilot outcome** (2026-04-24, two passes):
- Pass 1 (`SP-PWC2-07-pilot-2026-04-24.md`) — flawed N=1 single-snapshot measurement; verdict downgraded post-self-audit.
- Pass 2 (`SP-PWC2-07-pilot-v2-2026-04-24.md`) — full-rigor: tokens (cl100k_base), multi-step 10-field walkthrough, controlled depth/filter, wall-clock per op, expanded CLI surface (hover/screenshot/network/console/-s/--raw), visual-disqualifier test via overlay injection, state-load round-trip on fresh session.

**Post-pilot deliverables**:
1. LR-038 v2 matrix — 3 amendments landed in CLAUDE.md (Visual/CSS row corrected to "both AX trees pixel-blind"; Catalog + Spec-gen Phase 0.5 rows corrected to "CLI wins with grep-over-disk discipline, not Read-whole-file").
2. `browsertool-gate.sh` hook — ENABLED in `.claude/settings.json` after /slop PASS audit + dogfood verification (parity 19/19 + 3-scenario live test).
3. BUG-LOC-BI-001 filed + amended (unknown-route silent redirect — Basic Info is a tab, not a route).

**Key empirical finding**: Playwright team's 4× token reduction benchmark does NOT reproduce on Navigator. CLI is ~1.7-1.8× HEAVIER than Chrome on whole-tree reads; CLI wins only with grep-over-disk discipline.

**LR-027 cascade clause** (graduated from this closure): parent plans left rotting in `pending/` after all subplans are done = structural pattern now fixed by the cascade rule.
