# PLAN: Playwright CLI Full Switch — MCP Retirement

**ID**: PLAN_PLAYWRIGHT_CLI_FULL_SWITCH
**Created**: 2026-04-20
**Status**: PENDING
**Priority**: P3 (low — parked; other work takes precedence)
**Supersedes**: [PLAN_PLAYWRIGHT_CLI_ADOPTION.md](PLAN_PLAYWRIGHT_CLI_ADOPTION.md) (gradual-adoption plan is replaced by this full-switch plan)
**Healer decision**: Option A locked — full CLI via shell-out to `npx playwright test` + artifact reads. No MCP anywhere in the repo after Phase 6.

---

## Context

We are **going all-in on Playwright CLI**. MCP (`playwright-browser`, `playwright-test`) is being retired as the primary exploration transport for our 5-agent pipeline. Goal: cut tokens on UI exploration, stabilize long sessions, gain the `show` multi-session dashboard.

Decision is made. This plan covers: what to install, what to rewrite, what to delete, what can silently break, and how to verify the repo still works after.

---

## What the CLI actually is (verified against official docs)

- **`@playwright/cli`** (binary: `playwright-cli`) — separate npm package from `@playwright/test`, purpose-built for AI agents. Launched early 2026 by Microsoft. Source: [playwright.dev/agent-cli](https://playwright.dev/agent-cli/introduction).
- **`playwright-cli install --skills`** — real feature. Installs a local manifest of valid commands so agents don't hallucinate flags. Microsoft's "skills" is unrelated to Claude skills despite sharing the `SKILL.md` filename.
- **Command surface** replaces every MCP primitive we use: `open/goto`, `click/fill/type/hover/select/drag/upload/press`, `snapshot` (YAML ARIA tree to disk), `screenshot`, `console/eval/run-code`, `network`, `state-save/state-load`, sessions via `-s=<name>`, `--persistent --profile=<dir>`.
- **`playwright-cli show`** — live multi-session dashboard with remote-takeover. MCP has no equivalent.
- **Benchmark**: Microsoft ~114K → ~27K tokens (4×); Pramod Dutta reproduced ~89K → ~24K.
- **Counter-evidence** (must address): Outpost measured CLI **2-3× slower** in wall-clock (90-120s MCP → 180-600s CLI) because CLI forces 40-50 discrete tool calls vs MCP's 14-17. Cache re-reads can equalize cost. Mitigation = read snapshot YAML from disk, don't re-invoke for same state.

Sources: [TestCollab](https://testcollab.com/blog/playwright-cli), [Test-Lab.ai](https://www.test-lab.ai/blog/playwright-mcp-vs-cli-agentic-testing), [Outpost](https://outpost.ranger.net/post/the-hidden-cost-of-fewer-tokens/), [Pramod Dutta](https://scrolltest.medium.com/playwright-mcp-burns-114k-tokens-per-test-the-new-cli-uses-27k-heres-when-to-use-each-65dabeaac7a0).

---

## Deliverables (phased, with rollback points)

### Phase 1 — Install + baseline (half day)
- `npm install -g @playwright/cli@latest` then `playwright-cli install --skills` in repo root.
- Add scripts to `package.json`: `cli:install`, `cli:show`, `cli:snapshot`, `cli:state:save`, `cli:state:load`.
- Create `.playwright-cli/` dir; commit `.playwright-cli/config.json`; add `.playwright-cli/sessions/` and `.auth/` to `.gitignore`.
- Create `docs/read_only_docs/CLI_BROWSER_GUIDE.md` (replaces MCP_BROWSER_GUIDE.md).
- One-time headed SSO login: `playwright-cli open --persistent --profile=.auth/nav4-profile <NAV4_URL>`, manual SSO, then `playwright-cli state-save -s=nav4`. Document in CLAUDE.md onboarding Step 6.

**Rollback**: `npm uninstall -g @playwright/cli`, `git revert`. MCP untouched.

### Phase 2 — Rewrite pipeline agent frontmatter (1 day)
Replace MCP tool lists with CLI command references. Five files:

| Agent file | Current | After |
|---|---|---|
| `.github/agents/playwright-requirements.agent.md` | 17 `browser_*` + `mcp-servers:` block | `Bash` (for `playwright-cli ...`), `Read`, `Write`, `Grep` |
| `.github/agents/playwright-test-planner.agent.md` | 18 `browser_*` + `mcp-servers:` | Same as above |
| `.github/agents/playwright-test-generator.agent.md` | 18 `browser_*` + both MCP servers | `Bash` + test-runner via `npx playwright test` |
| `.github/agents/playwright-test-healer.agent.md` | 8 `playwright-test/*` + 9 `playwright-browser/*` | `Bash` (CLI + test runner), artifact-first I/O |
| `.github/agents/playwright-pipeline-audit.agent.md` | 12 `browser_*` | `Bash` + `Read` |

Framework-maintainer agent has no MCP deps — untouched.

**Rollback**: `git checkout HEAD -- .github/agents/`.

### Phase 3 — Rewrite shared rules & enforcement (1 day)
Update `docs/read_only_docs/AGENT_SHARED_RULES.md`:

| Rule | Current (MCP) | Action |
|---|---|---|
| R09 | "Verify selectors via MCP browser tools" | Rewrite → "Verify selectors via `playwright-cli eval`" |
| R16 | "NEVER call `browser_close`" | **Delete** — CLI has no equivalent, rule is vacuous |
| R19 | "No TC without `browser_snapshot` evidence" | Rewrite → `playwright-cli snapshot -s=nav4 -o <file>` |
| ALL-042 | `browser_network_requests` after API interactions | Rewrite → `playwright-cli network -s=nav4` |
| ALL-043 | Walkthrough-vs-verification contradiction | Rewrite tool names only |
| ALL-048 | MCP replication = last resort | Rewrite → CLI replication |
| ALL-052 | Beforeunload: `browser_navigate → browser_handle_dialog` | Rewrite → `playwright-cli goto` + `run-code` with `page.on('dialog')` |
| GEN-029 | Phase 0.5 walkthrough via `browser_snapshot` | Rewrite → `playwright-cli snapshot` chain |
| HLR-015 | Healer Phase 0 Triage → MCP optional | Rewrite tool names only |
| PLN-027 | Planner verify via `browser_evaluate` | Rewrite → `playwright-cli eval` |

### Phase 4 — Update hard gates & orchestrator (1 day)

**Hard gates that will silently break if skipped:**

1. `scripts/generator-pre-run.ts` — PF-G5 gate checks for `reports/walkthrough/{itemId}.walkthrough.md`. CLI snapshot output goes elsewhere. Update gate to accept either path, OR standardize output location via `playwright-cli snapshot -o reports/walkthrough/{itemId}.walkthrough.yaml`.
2. `src/worker/index.ts:63` — hardcoded `allowedTools: [..., 'mcp__*']`. Remove `'mcp__*'` entry, ensure `Bash` is present so agents can invoke `playwright-cli`.
3. `src/orchestrator/types.ts` — `mcpConfig?: string` field on Stage. Remove or rename to `cliConfig`.
4. `config/pipeline-definition.json` lines ~49, 70, 105, 126 — `mcpConfig: "browser-only"` / `"browser-and-test"`. Delete field or swap to `cliConfig: "nav4"`.
5. `loadAgentFile()` in worker — strip MCP server parsing for agents that no longer declare them.
6. Other pre-run scripts: `scripts/planner-pre-run.ts`, `scripts/requirements-pre-run.ts`, `scripts/healer-pre-run.ts`, `scripts/audit-pre-run.ts` — grep for MCP tool names, replace.

### Phase 5 — Skill & doc cleanup (half day)
- `.claude/skills/rca/SKILL.md` — replace MCP replication examples with CLI.
- `.claude/skills/identity/SKILL.md` — update agent → tool mapping table.
- `docs/read_only_docs/MCP_BROWSER_GUIDE.md` — archive to `docs/archive/` (history, not deletion — future reference).
- `cli and mcp in our repo.md` at root — rewrite decision section to reflect full switch, keep comparison as historical record.
- `plans/pending/PLAN_PLAYWRIGHT_CLI_ADOPTION.md` — move to `plans/done/` with "SUPERSEDED by PLAN_PLAYWRIGHT_CLI_FULL_SWITCH.md" note.

### Phase 6 — MCP removal (half day)
- Delete `.vscode/mcp.json` — no more `playwright-browser` / `playwright-test` server entries.
- Document in CLAUDE.md that MCP is retired for pipeline agents (keep note explicit; colleagues will pull and wonder).
- Final grep sweep: `grep -rn "browser_\|mcp__playwright\|playwright-browser\|playwright-test/" .github .claude docs src scripts` — must return zero hits outside `docs/archive/`.

---

## Self-audit — "would the repo still work?"

### Q1. Do the production tests (`npm test`, `npm run test:chrome`) still run?
**Yes, unaffected.** `@playwright/test` (test runner) is untouched. `tests/setup/fixtures.ts` and `playwright.config*.ts` use `storageState` — which is already the mechanism the CLI uses under the hood. Only the agent exploration layer changes.

### Q2. Does SSO auth still work?
**Yes, with a one-time setup step.** One headed `playwright-cli open --persistent --profile=.auth/nav4-profile` + manual SSO + `state-save -s=nav4`. Thereafter every CLI call uses `-s=nav4`. Refresh cycle: Entra FedAuth cookie = 7 days → document a `refresh-auth` npm script.

### Q3. What breaks on Day 1 if we skip any gate update?
- **PF-G5 walkthrough gate** — halts Generator silently if walkthrough file path is wrong. **Must fix in Phase 4.**
- **`mcp__*` allowlist in worker** — agents attempting to call `Bash` for `playwright-cli` will fail permission check if `Bash` not in allowlist. **Must fix in Phase 4.**
- **Rule R16 citation in agent RULES:[...] emission** — audit will flag missing rule. **Delete in Phase 3.**

### Q4. Will agents get slower? (Outpost's 2-3× finding)
**Yes, likely, for interactive exploration.** Mitigation: (a) CLI writes snapshots to disk — agent should `cat` the file once, not re-snapshot, (b) batch interactions in a single `run-code` block where possible, (c) accept slower wall-clock for the token savings. Flag this as a known tradeoff in CLI_BROWSER_GUIDE.md.

### Q5. Does Phase 0.5 walkthrough still produce equivalent evidence?
**Yes, but format differs.** MCP's inline AX tree → YAML file on disk. GEN-029 must be rewritten to accept the YAML path as evidence. PF-G5 gate validates presence of file, not inline content.

### Q6. Healer's dual MCP config — does CLI cover both sides?
**Partially.** `playwright-test/*` MCP tools (test_run, test_debug) had no direct CLI mirror — replace with `npx playwright test --headed --debug` plus artifact reads. For UI replication, `playwright-cli` is a full swap. Healer prompt must be restructured to "run test via shell, read trace/failure-summary.json, replicate via CLI only when artifact-insufficient" (LR-033 already covers the artifact-first RCA path).

### Q7. Storage state leakage risk?
**Real and severe.** storageState contains session cookies + bearer tokens. Verizon 2025 DBIR: 50% of leaked CI/CD secrets were tokens. Mitigation: `.auth/` and `.playwright-cli/sessions/` in `.gitignore` (Phase 1); pre-commit hook rejects commits that include auth files; strip `origins[]` field before any storageState is referenced in CI secrets.

### Q8. What about `plans/INDEX.md`?
Auto-generated by `scripts/plans-reindex.mjs` (LR-035). After moving old CLI plan to `plans/done/`, run `npm run plans:reindex`.

### Q9. Colleague onboarding impact?
New Step 6 in CLAUDE.md onboarding: `npm run cli:install` + one-time SSO login to create session. Existing `npm test` smoke test stays. Everyone gets own `.auth/nav4-profile` (gitignored).

### Q10. Can we partially roll back if it goes sideways?
**Yes per phase.** Phases 1-5 are additive (CLI added, old refs updated but MCP config still on disk until Phase 6). Before Phase 6, a single `git revert` on the rewrite commits restores MCP as fallback. After Phase 6, restoring MCP requires replacing `.vscode/mcp.json`.

---

## Risk register (top 5)

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | PF-G5 gate silent halt (walkthrough path mismatch) | High if Phase 4 rushed | Generator blocked | Update gate BEFORE rewriting agent frontmatter |
| 2 | `storageState` accidentally committed | Medium | Credential leak | `.gitignore` + pre-commit hook + secrets scan |
| 3 | CLI wall-clock 2-3× slower for Planner/Requirements | High | Longer runs, more cache misses | Disk-snapshot-first pattern, batched `run-code`, documented tolerance |
| 4 | CLI v0.x breaking changes | Medium | Pipeline break on upgrade | Pin version in `package.json`, stage upgrades on a branch |
| 5 | Session expiry mid-chain-run (FedAuth 7-day) | Medium | Chain run aborts | `refresh-auth` script + session-age check in pre-run gates |

---

## Verification plan

1. **Install verification**: `playwright-cli --version` prints; `playwright-cli install --skills` completes; `ls .playwright-cli/skills/` non-empty.
2. **Auth verification**: `playwright-cli goto <NAV4_URL> -s=nav4` reaches authed landing page; `snapshot` produces YAML with expected top-level roles.
3. **Pipeline smoke (per agent)**: after each Phase 2 rewrite, run one representative task (e.g., Requirements on a known module) and diff output against the MCP baseline saved beforehand.
4. **Gate verification**: deliberately delete a walkthrough file and confirm PF-G5 halts; re-create via CLI and confirm it passes.
5. **Full pipeline run**: one complete Requirements → Planner → Generator → Audit chain on a small module, end-to-end green.
6. **MCP removal final check**: `grep -rn "browser_\|mcp__playwright\|playwright-browser\|playwright-test/" .github .claude docs src scripts` returns zero outside `docs/archive/`.
7. **Production tests untouched**: `npm test -- --project=chrome tests/seed.spec.ts` still passes.
8. **Token measurement** (record for later): one agent run on same page, token count logged to activity log — reality check against Microsoft's 4× claim.

---

## Critical files inventory (changes required)

**Delete:**
- `.vscode/mcp.json`

**Rewrite:**
- `.github/agents/playwright-requirements.agent.md`
- `.github/agents/playwright-test-planner.agent.md`
- `.github/agents/playwright-test-generator.agent.md`
- `.github/agents/playwright-test-healer.agent.md`
- `.github/agents/playwright-pipeline-audit.agent.md`
- `docs/read_only_docs/AGENT_SHARED_RULES.md` — 10 rules
- `scripts/generator-pre-run.ts` — PF-G5 gate
- `scripts/planner-pre-run.ts`, `scripts/requirements-pre-run.ts`, `scripts/healer-pre-run.ts`, `scripts/audit-pre-run.ts`
- `src/worker/index.ts:63` — allowedTools
- `src/orchestrator/types.ts` — Stage.mcpConfig field
- `config/pipeline-definition.json` — mcpConfig entries
- `.claude/skills/rca/SKILL.md`
- `.claude/skills/identity/SKILL.md`
- `cli and mcp in our repo.md` — decision section

**Create:**
- `docs/read_only_docs/CLI_BROWSER_GUIDE.md`
- `.playwright-cli/config.json`
- `scripts/refresh-auth.ts` (or .mjs)

**Archive (don't delete):**
- `docs/read_only_docs/MCP_BROWSER_GUIDE.md` → `docs/archive/MCP_BROWSER_GUIDE.md`
- `plans/pending/PLAN_PLAYWRIGHT_CLI_ADOPTION.md` → `plans/done/` with "SUPERSEDED" note

**Update .gitignore:**
- `.auth/`
- `.playwright-cli/sessions/`
- `**/storageState.json`

---

## Total effort

- Phase 1 (install): 0.5 day
- Phase 2 (agent frontmatter): 1 day
- Phase 3 (shared rules): 1 day
- Phase 4 (gates & orchestrator): 1 day
- Phase 5 (skills & docs): 0.5 day
- Phase 6 (MCP removal): 0.5 day
- Verification: 0.5 day

**Total: ~5 working days of focused work.** Not counting discovery of edge cases during Phase 2 rewrite (budget +1 day buffer).
