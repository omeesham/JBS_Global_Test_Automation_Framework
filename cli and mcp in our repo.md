# Playwright CLI vs MCP — Where Our Repo Stands

## What We Use Today

We use **`@playwright/mcp`** (MCP server) across our entire 6-agent pipeline.

| Agent | MCP Tools Used | Interactions/Session |
|-------|---------------|---------------------|
| Requirements | navigate, snapshot, hover, evaluate | 15-30 |
| Planner | navigate, snapshot, click, evaluate, select, wait, fill | 20-40 |
| Generator | snapshot, evaluate, navigate (Phase 0.5 walkthrough) | 10-20 |
| Healer | test_run, test_list, snapshot, evaluate, click | 5-15 |
| Audit | navigate, snapshot, evaluate, click | 5-10 |
| Framework Maintainer | navigate, snapshot, evaluate | 3-5 |

**Total MCP footprint:** 84+ tool references across 6 agent files, 2 MCP server configs, hard gates (PLN-034, PF-G5, LR-007, LR-016).

---

## What Playwright CLI Is

Microsoft's new `@playwright/cli` (v0.1.3, Apr 2026) — same Playwright engine, different transport.

**MCP:** Streams full accessibility tree into the AI's context window on every interaction. Rich but expensive.
**CLI:** Saves snapshots to disk as YAML files. Agent reads on-demand via shell commands. Lean.

Microsoft maintains **both** in parallel. Neither replaces the other. From their docs:
> "CLI = high-throughput, low-context agents. MCP = rich-introspection, long-running exploratory agents."

---

## The Real Numbers

| Metric | MCP (what we use) | CLI (what's new) | Source |
|--------|-------------------|------------------|--------|
| Tokens per session | ~114,000 | ~27,000 | Microsoft benchmarks, TestCollab |
| Token savings | — | **4x reduction** | Same |
| Long session savings | — | Up to **10x** reported | Community reports |
| Session stability | Degrades after 10-15 interactions | Stable at 50+ | TestDino analysis |
| Commands available | Subset (selectively enabled) | 50+ full command set | GitHub README |
| Monthly cost impact (est.) | — | **60-75% reduction** on heavy automation | TestCollab |

---

## What CLI Adds That We Don't Have

| Feature | What It Does | Value for Us |
|---------|-------------|--------------|
| **4x token savings** | Snapshots to disk, not context window | Direct cost reduction on our 15-50 interaction sessions |
| **Session stability at 50+** | No context degradation | Our agents hit MCP's weak spot (15+ interactions) |
| **`show` dashboard** | Live screencast grid + remote takeover | Watch agents work in real-time (currently impossible) |
| **Snapshot diffing** | YAML files on disk → `diff` between runs | Better flaky test RCA — compare passing vs failing DOM |
| **`state-save`/`state-load`** | Granular storage state management | Simpler auth persistence vs Chrome profile dir |
| **`--persistent`** | Profile saved to disk across browser restarts | Auth survives crashes |
| **Codegen** | Auto-generates Playwright test code from sessions | Potential Generator Phase 0.75 input |
| **50+ commands** | Full surface vs MCP subset | Broader automation (PDF export, video chapters, etc.) |

---

## What We Already Cover (No Change Needed)

| Capability | Our Implementation |
|------------|-------------------|
| Browser navigation, clicks, typing | MCP tools (browser_navigate, browser_click, etc.) |
| DOM snapshots | browser_snapshot (same output format, same element refs) |
| Console/network monitoring | browser_console_messages + DiagnosticsCollector (richer than CLI) |
| Tracing/video | Automatic via playwright.config.ts (retain-on-failure) |
| Test execution | `npx playwright test` — CLI does NOT replace this |
| Session persistence | `--user-data-dir .auth/chrome-profile` |
| Diagnostics & RCA | failure-summary.json, error-context.md, agent-reporter (CLI has nothing like this) |
| Pipeline gates & learning | Hard gates, agent-mistakes.md, LR rules (unique to our framework) |

---

## Open Risk

The `show` dashboard displays **CLI-managed sessions**. Our current agents use **MCP-managed sessions** (separate browser instances via `--user-data-dir`). Whether `show` can see MCP sessions is **unverified** — they likely use different session stores. This must be tested before assuming the dashboard works with our current setup. If it can't, the dashboard only works after agents switch to CLI.

---

## Decision

**Gradual adoption alongside MCP. Not a replacement.**

| Action | When | Why |
|--------|------|-----|
| Install CLI + verify `show` interop | Phase 1 | Test if dashboard sees MCP sessions |
| Pilot CLI on Requirements agent | Phase 2 | Measure real token savings in our env |
| Expand to Planner + Generator if pilot wins | Phase 3 | Biggest token savings (heaviest sessions) |
| Snapshot diffing for Healer RCA | Phase 4 | CLI supplements MCP (Healer stays MCP) |
| Auth persistence via `state-save` | Phase 5 | Simpler than Chrome profile dir |
| Keep Healer on MCP | Always | Needs `playwright-test` MCP server |

Full plan: `plans/pending/PLAN_PLAYWRIGHT_CLI_ADOPTION.md`

---

## References

- [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) — v0.1.3 (6 releases, Feb-Apr 2026)
- [CLI vs MCP — TestDino](https://testdino.com/blog/playwright-cli-vs-mcp/) — Technical breakdown
- [Token-Efficient Alternative — TestCollab](https://testcollab.com/blog/playwright-cli) — Benchmarks
- [CLI README](https://github.com/microsoft/playwright-cli/blob/main/README.md) — Full command reference
- [Playwright Coding Agents Docs](https://playwright.dev/docs/getting-started-cli) — Official
