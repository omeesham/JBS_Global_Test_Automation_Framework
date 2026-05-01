# PLAN: Playwright CLI Gradual Adoption

**ID**: PLAN_PLAYWRIGHT_CLI_ADOPTION
**Created**: 2026-04-01
**Status**: pending
**Priority**: P2-CYCLE-3
**Post-Audit**: 2026-04-01 — 5 issues found, all incorporated below

---

## Context

Microsoft released `@playwright/cli` (v0.1.3) — a token-efficient CLI for AI coding agents. Our repo uses `@playwright/mcp@latest` across 6 agents (84+ MCP tool references, hard gates). Research shows CLI provides **4x token savings** (114K → 27K per session) and stable sessions at 50+ interactions vs MCP's degradation at 15.

CLI is **not a replacement** for MCP — Microsoft maintains both in parallel. CLI uses shell commands + disk-based YAML snapshots. MCP uses JSON protocol + in-context accessibility trees. Both use the same Playwright engine underneath.

**Why now:** Our agents do 15-50+ browser interactions per session — exactly where MCP's context degradation hurts and CLI's disk-based approach shines. The `show` dashboard provides live screencast visibility into agent sessions we currently lack.

**Why gradual:** 84+ MCP tool references, 6 agent files, hard gates (PLN-034, PF-G5, LR-007, LR-016) all reference MCP tool names. Full migration is months of work. Phased approach lets us measure before committing.

---

## Phase 1: Install + Verify Dashboard Interop (Day 1)

**Goal:** Get CLI installed and **verify** whether `show` dashboard can see MCP-launched browsers.

> **AUDIT FLAG (CRITICAL):** `show` displays CLI-managed sessions. MCP launches browsers separately via `--user-data-dir`. These are different session stores. Dashboard may NOT see MCP sessions. This must be verified BEFORE assuming Phase 1 has standalone value. If `show` cannot see MCP sessions, Phase 1 and Phase 2 must merge — dashboard only works once agents switch to CLI.

### Steps

1. Install globally: `npm install -g @playwright/cli@latest`
2. Install skills (HARD REQUIREMENT — without skills, agents hallucinate non-existent CLI commands): `playwright-cli install --skills`
3. **VERIFY interop:** Launch an MCP browser session → run `playwright-cli show` → check if it appears in dashboard
4. If YES → dashboard has immediate value for current MCP agents. Proceed with Phase 1 standalone.
5. If NO → Phase 1 only adds value after Phase 2 (agent switch). Merge Phases 1+2.
6. Add npm scripts to `package.json`:
   ```json
   "cli:show": "playwright-cli show",
   "cli:install": "playwright-cli install --skills"
   ```
7. Create CLI config: `.playwright/cli.config.json`
   ```json
   {
     "browser": { "browserName": "chromium" },
     "testIdAttribute": "data-testid",
     "outputDir": ".playwright-cli/",
     "timeouts": { "action": 10000, "navigation": 30000 }
   }
   ```
8. Update `.gitignore`: add `.playwright-cli/`
9. Document in CLAUDE.md: `npm run cli:show` to watch live agent sessions

### Dashboard Capabilities (if visible)
- **Session grid**: all active browser sessions with live screencast previews
- **Detail view**: full-size screencast of selected session with browser controls
- **Remote takeover**: click viewport to control mouse/keyboard, Escape to release
- **Multi-agent visibility**: watch Requirements, Planner, Generator working simultaneously

### Files to modify
- `package.json` — add scripts
- `.gitignore` — add `.playwright-cli/`
- `CLAUDE.md` — document new commands
- `.playwright/cli.config.json` — **NEW**

### Verification
- `playwright-cli show` opens dashboard in browser
- Interop test with MCP session (see step 3)
- No conflict with existing `@playwright/mcp` usage

### Rollback
- `npm uninstall -g @playwright/cli`
- Remove added npm scripts from `package.json`
- Delete `.playwright/cli.config.json`
- Remove `.playwright-cli/` from `.gitignore`

---

## Phase 2: Pilot — Requirements Agent on CLI (1-2 days)

**Goal:** Convert lightest agent to CLI, measure real token savings.

### Why Requirements Agent First
- Read-only (only `browser_navigate`, `browser_snapshot`, `browser_hover`, `browser_evaluate`)
- No test execution dependency (unlike Healer)
- Longest sessions (15-30+ interactions per page exploration)
- Simplest MCP tool set to map

### Pre-Gate (HARD REQUIREMENT)
- Skills MUST be installed (`playwright-cli install --skills`) — without skills, agents hallucinate non-existent commands and waste tokens on retries (documented by Microsoft + TestCollab)

### MCP → CLI Command Mapping

| MCP Tool | CLI Command | Notes |
|----------|-------------|-------|
| `browser_navigate(url)` | `playwright-cli goto <url>` | |
| `browser_snapshot` | `playwright-cli snapshot` | YAML to disk, agent reads file |
| `browser_hover(ref)` | `playwright-cli hover <ref>` | Same refs (e21, e35) |
| `browser_evaluate(code)` | `playwright-cli run-code <code>` | Or `--filename=f` for complex JS |
| `browser_console_messages` | `playwright-cli console` | |
| `browser_network_requests` | `playwright-cli network` | |
| `browser_click(ref)` | `playwright-cli click <ref>` | If Requirements ever needs it |
| `browser_take_screenshot` | `playwright-cli screenshot` | Saves PNG to disk |

### Steps

1. Create CLI variant: `.github/agents/playwright-requirements-cli.agent.md`
   - Replace MCP server config with Bash tool access to `playwright-cli` commands
   - Map all MCP tool references to CLI commands
   - Add skills reference for syntax training
   - Add `--persistent` flag for auth persistence across browser restarts
2. Create CLI browser guide: `docs/read_only_docs/CLI_BROWSER_GUIDE.md`
   - Mirror structure of `MCP_BROWSER_GUIDE.md`
   - CLI-specific session management, snapshot reading, error handling
   - Document `--persistent` vs in-memory session behavior
3. Run BOTH variants on same page (e.g., Location Settings):
   - Measure token consumption per session
   - Measure session stability (does MCP degrade after 15 interactions?)
   - Compare output quality (FIELD INVENTORY, testid-inventory artifacts)
4. Document findings in `plans/done/` with metrics

### Success Criteria
- CLI variant produces equivalent-quality artifacts
- Token savings >= 2x (conservative — expecting 4x based on benchmarks)
- No session degradation at 25+ interactions
- Agent doesn't hallucinate non-existent CLI commands

### Files to create
- `.github/agents/playwright-requirements-cli.agent.md` — **NEW**
- `docs/read_only_docs/CLI_BROWSER_GUIDE.md` — **NEW**

### Rollback
- Delete CLI agent variant
- Delete CLI browser guide
- No changes to existing MCP agent needed (it stays untouched throughout pilot)

---

## Phase 3: Expand to Planner + Generator Walkthrough

**Prerequisite:** Phase 2 shows >= 2x token savings with equivalent quality.

### Planner Agent (heaviest MCP user — 21+ tool references across 6 agents total)

| MCP Tool | CLI Command |
|----------|-------------|
| `browser_navigate(url)` | `playwright-cli goto <url>` |
| `browser_snapshot` | `playwright-cli snapshot` |
| `browser_click(ref)` | `playwright-cli click <ref>` |
| `browser_evaluate(code)` | `playwright-cli run-code <code>` |
| `browser_select_option(ref, val)` | `playwright-cli select <ref> <val>` |
| `browser_wait_for(time)` | No direct equivalent — use `sleep N` in shell between CLI commands |
| `browser_fill_form(ref, val)` | `playwright-cli fill <ref> <val>` |
| `browser_type(text)` | `playwright-cli type <text>` |

**Planner-specific concerns:**
- PLN-034 selector verification gate: `browser_evaluate(() => !!document.querySelector(...))` → `playwright-cli run-code "!!document.querySelector(...)"`
- Save dialog documentation: click Save → snapshot → verify dialog → CLI handles this fine
- MCP_VERIFICATION_LOG: would become CLI_VERIFICATION_LOG, same structure

### Generator Phase 0.5 Walkthrough

- Currently uses MCP for UI walkthrough before code generation
- CLI would save significant tokens (walkthrough = 10-20 interactions minimum)
- Map: `browser_snapshot` → `playwright-cli snapshot`, `browser_evaluate` → `playwright-cli run-code`
- WALKTHROUGH_LOG format unchanged

### Codegen Evaluation (AUDIT FINDING — was missing from original plan)

CLI can auto-generate Playwright test code from browser sessions. This is directly relevant to our Generator agent:
- Evaluate if CLI-generated code is usable as a starting point for Generator's Phase 1 (build shell)
- Compare CLI codegen output vs Generator's current spec code quality
- If useful: integrate as Phase 0.75 between walkthrough and shell building

### Files to modify
- `.github/agents/playwright-test-planner.agent.md` — replace MCP with CLI
- `.github/agents/playwright-test-generator.agent.md` — Phase 0.5 only + codegen eval
- `docs/read_only_docs/AGENT_SHARED_RULES.md` — add CLI rules alongside MCP rules

---

## Phase 4: Snapshot Diffing for Healer + Flaky Test RCA

**Goal:** Use CLI's disk-based snapshots for better failure diagnosis.

### Value
- CLI snapshots save to disk as YAML → can diff between passing/failing runs
- `diff snapshot-run1.yaml snapshot-run2.yaml` reveals exact state differences
- Current MCP snapshots vanish after session — no diffing possible
- Directly supports LR-018 (spec-fixing workflow — run-all is the only truth)

### Implementation
- Add snapshot capture to healer's RCA protocol (Phase A step 5.5)
- Save snapshots to `reports/diagnostics/{specName}/` alongside existing artifacts
- Add `snapshot-diff` utility script to `scripts/`

### Files to create/modify
- `scripts/snapshot-diff.ts` — **NEW** diff utility
- `.github/agents/playwright-test-healer.agent.md` — add snapshot capture step
- Healer stays on MCP for `playwright-test` server (test execution context) — CLI supplements, doesn't replace

---

## Phase 5: CLI Session Auth Persistence

**Goal:** Use `state-save`/`state-load` and `--persistent` to simplify auth for exploration sessions.

### Current Problem
- MCP uses `--user-data-dir .auth/chrome-profile` for cookie persistence
- Works but brittle — cookies expire, Chrome profile can corrupt
- Re-login required when cookies expire

### CLI Solution (two mechanisms — AUDIT FINDING, was conflated in original plan)

**Mechanism 1: `--persistent` flag**
- Saves browser profile to disk automatically (cookies, localStorage survive browser close)
- Equivalent to MCP's `--user-data-dir` but CLI-managed
- Use for: long-running agent sessions that may need browser restart

**Mechanism 2: `state-save` / `state-load`**
- Explicit storage state snapshots (JSON files)
- Granular: `cookie-list`, `cookie-set`, `localstorage-get/set`, `sessionstorage-get/set`
- Use for: sharing auth state between sessions, restoring after crashes
- More portable than Chrome profile directory

### Steps
- Add `--persistent` to CLI agent configs (Phase 2+)
- Add `state-save` to post-login flow in agent guides
- Add `state-load` to session initialization
- Add auth state files to `.gitignore`

---

## What Does NOT Change

| Component | Reason |
|-----------|--------|
| `@playwright/mcp` stays installed | Healer needs `playwright-test` MCP server; MCP is fallback for debugging |
| `playwright.config.ts` | Test execution is `npx playwright test`, not CLI |
| `tests/setup/fixtures.ts` | `authenticatedSession` fixture is test-runner-level, not CLI |
| Existing hard gates (PLN-034, PF-G5, LR-007) | Rules stay — just the tool names in agent files change |
| Test execution in CI/pipeline | `npm test` stays unchanged |
| Framework Maintainer agent | Low interaction count (3 MCP refs) — not worth converting |

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| CLI v0.x breaking changes | MEDIUM | Pin version, don't use in CI-critical paths |
| Agent hallucinating CLI commands | MEDIUM | `playwright-cli install --skills` is HARD pre-gate for Phase 2+ |
| `show` dashboard can't see MCP sessions | HIGH | Verify in Phase 1 step 3 BEFORE assuming value |
| MCP and CLI session conflicts | LOW | Different session stores (MCP = user-data-dir, CLI = .playwright-cli/) |
| Planner/Generator quality regression | MEDIUM | A/B test before committing (Phase 2 methodology) |
| Need to rollback | LOW | Each phase has explicit rollback steps; MCP untouched throughout |

---

## Token Savings Projection (ESTIMATES — not measured in our environment)

> These numbers extrapolate from Microsoft/TestCollab benchmarks on generic web apps. Our SSO-authenticated Angular app may differ. Phase 2 measures actuals.

| Agent | Interactions/Session | MCP Tokens (est.) | CLI Tokens (est.) | Monthly Savings (10 runs, est.) |
|-------|---------------------|-------------------|-------------------|---------------------------|
| Requirements | 15-30 | ~60K | ~15K | ~450K tokens |
| Planner | 20-40 | ~80K | ~20K | ~600K tokens |
| Generator (Phase 0.5) | 10-20 | ~40K | ~10K | ~300K tokens |
| Healer | 5-15 | ~30K | Keep MCP | — |
| Audit | 5-10 | ~20K | ~5K | ~150K tokens |
| **Total** | | | | **~1.5M tokens/month (est.)** |

---

## References

- [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) — GitHub repo (v0.0.62 → v0.1.3)
- [CLI vs MCP Comparison](https://testdino.com/blog/playwright-cli-vs-mcp/) — TestDino technical breakdown
- [Token-Efficient Alternative](https://testcollab.com/blog/playwright-cli) — TestCollab analysis (114K vs 27K benchmark)
- [CLI Releases](https://github.com/microsoft/playwright-cli/releases) — 6 releases, Feb 2026 → Apr 2026
- [Playwright Coding Agents Docs](https://playwright.dev/docs/getting-started-cli) — Official docs
- [@playwright/cli npm](https://www.npmjs.com/package/@playwright/cli) — v0.1.3 (latest)
