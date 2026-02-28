# Playwright TypeScript Framework

TypeScript + Playwright automation framework with 5-agent pipeline for test development.

## Quick Start

``bash
npm install && npx playwright install
cp config/environments/.env.example config/environments/.env.local

npm test                    # All tests
npm run test:chrome         # Chrome only
npm run test:headed         # Visible browser
npm run test:debug          # Debug mode
npm run report              # HTML report
``

## Adding Page Objects

1. Add selectors to `src/selectors/index.ts`
2. Create `src/pages/{name}.page.ts` extending `BasePage`
3. Add fixture to `tests/setup/fixtures.ts`
4. Export from `src/pages/index.ts`

## References

- [copilot-instructions.md](../.github/copilot-instructions.md) — Pipeline, commands, patterns
- [ARCHITECTURE.md](read_only_docs/ARCHITECTURE.md) — Structure, class hierarchy
- [MCP_BROWSER_GUIDE.md](read_only_docs/MCP_BROWSER_GUIDE.md) — Browser tool guide

---

## Agent Setup

MCP: Add `playwright-test` server (`npx playwright run-test-mcp-server`) in GitHub > Settings > Copilot > MCP. See [copilot-instructions.md §3](../.github/copilot-instructions.md) for pipeline agents.

| Issue | Solution |
|-------|----------|
| Agents not showing | Add MCP config, reload VS Code |
| Tests fail | Check `src/selectors/index.ts` |

---

## Pipeline

`User → Requirements → Queue → Planner → Generator → .spec.ts → Pass? → Healer (if fail) → Audit`

See [copilot-instructions.md](../.github/copilot-instructions.md) for agent details, commands, and stage flow.