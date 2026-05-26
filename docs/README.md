# Playwright TypeScript Framework

TypeScript + Playwright automation framework with 6-agent pipeline for test development. Pipeline agents live as model-agnostic sub-agent files at `.claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md` so any frontier agent (Claude / Codex / GPT) can adopt them unchanged.

## Quick Start

```bash
npm install && npx playwright install
cp config/environments/.env.example config/environments/.env.local

npm test                    # All tests
npm run test:chrome         # Chrome only
npm run test:headed         # Visible browser
npm run test:debug          # Debug mode
npm run report              # HTML report
```

## Adding Page Objects (per-client — see `clients/<id>/README.md`)

Per the post-rebuild layout, page objects, selectors, fixtures, and barrel exports
all live under the active client (e.g. `clients/encore/`):

1. Add selectors to `clients/<id>/src/selectors/index.ts`
2. Create `clients/<id>/src/pages/{name}.page.ts` extending `BasePage`
3. Add fixture to `clients/<id>/src/infra/fixtures.ts`
4. Export from `clients/<id>/src/pages/index.ts`

## References

- [CLAUDE.md](../CLAUDE.md) — framework rules, skill auto-routing, pipeline overview
- [AGENT_SHARED_RULES.md](read_only_docs/AGENT_SHARED_RULES.md) — shared rules across all pipeline agents
- [ARCHITECTURE.md](read_only_docs/ARCHITECTURE.md) — structure, class hierarchy
- [CLI_BROWSER_GUIDE.md](read_only_docs/CLI_BROWSER_GUIDE.md) — Playwright CLI vs Claude in Chrome selection matrix (LR-038 v2)

---

## Pipeline

`User → Requirements → Queue → Planner → Generator → .spec.ts → Pass? → Healer (if fail) → Audit`

Maintainer runs out-of-band on demand for code-quality sweeps.

See [.claude/agents/](../.claude/agents/) for each agent's system prompt, hard stops, and rule registry.
