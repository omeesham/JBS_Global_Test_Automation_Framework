# Copilot Instructions - Encore Playwright Framework

**Core**: Hybrid Playwright TypeScript framework for Navigator Cloud automation. POM + TypeScript selectors + Data Adapters + 5-agent pipeline.

**Your Role**: Framework development (src/, tests/, config/, scripts/). NOT test intake or pipeline orchestration.

---

## 1. Critical Rules

### File Access
- **READ-WRITE**: `src/**`, `tests/**`, `config/**`, `scripts/**`
- **READ-ONLY**: `docs/REQUIREMENTS.md`, `specs_planning/_internal/agent-queue.json`
- **NEVER**: `.env*`, `.github/agents/*.agent.md`
- **Delegate**: Test requests → `@playwright-requirements`

### Never Break
- Page objects MUST extend BasePage
- Selectors ONLY in `src/selectors/index.ts`
- NO direct `page` methods in tests → use page object methods
- NO hardcoded URLs/credentials → use `.env` via `config` fixture
- Tests MUST use fixtures (no `new LoginPage(page)`)

### Module Registry
All file paths for pages, selectors, specs, and test data are defined in `docs/MODULE_REGISTRY.md`.
Check the registry before creating any new files to ensure correct module placement.

### File Locations
- Test docs (.md): `specs_planning/test-cases/{module}/{module}_{submodule}_test_cases.md`
- Test plans (.md): `specs_planning/test-plans/{module}/{module}_{submodule}_test_plan.md`
- Test specs (.spec.ts): `tests/specs/{module}/`

---

## 2. Key Patterns

### Selectors
```typescript
// src/selectors/index.ts
export const LoginSelectors = { txtUsername: '#field-userName', btnLogin: '#btn-login' } as const;
```

### Selector Lookup Flow (All Agents)
```
1. READ CATALOG    → src/selectors/SELECTOR_CATALOG.md (single flat index)
2. SEARCH KEYWORDS → match user description against Where, Text, Keywords columns
3. DRILL INTO SOURCE → read partition file from File column for full context
4. NOT FOUND → DISCOVER:
   a. Tell user element not in catalog
   b. Offer MCP browser discovery (navigate → snapshot → identify)
   c. Add selector to partition file WITH full @where @el @text @keys annotation
   d. Run `npm run selectors:catalog`
5. NEVER create a selector without annotation
```

### Page Objects
```typescript
export class LoginPage extends BasePage {
  async login(user: string, pass: string): Promise<boolean> {
    await this.fillWithValidation('txtUsername', user);
    await this.clickWithRetry('btnLogin');
    return true;
  }
}
```

### Tests (concise, typically 2-10 lines)
```typescript
import { test, expect } from '../../setup/fixtures';
test('should verify link', async ({ loginPage }) => {
  expect(await loginPage.isForgotPwdLinkExist()).toBe(true);
});
```

### Fixtures
```typescript
test('example', async ({ loginPage, homePage, commonMethods, config, page }) => { /* ... */ });
```

---

## 3. Pipeline Agents

<!-- SYNC:PIPELINE:START -->
| Agent | Invoke | Creates |
|-------|--------|---------|
| Requirements | `@playwright-requirements` | REQUIREMENTS.md + queue entry |
| Planner | `@playwright-test-planner` | Test cases + test plans |
| Generator | `@playwright-test-generator` | .spec.ts files |
| Healer | `@playwright-test-healer` | Fixes failing tests |
| Audit | `@playwright-pipeline-audit` | Universal audit: pipeline, agents, framework, full repo |

**Stage flow**: `pending_requirements → requirements → pending_planning → planning → pending_generation → generation → testing → completed | pending_healing → healing → completed | fixme`
<!-- SYNC:PIPELINE:END -->

---

## 4. Commands

<!-- SYNC:COMMANDS:START -->
```bash
npm test                                # All tests
npm run test:chrome                     # Chrome only
npm run test:headed                     # UI visible
npm run test:debug                      # Debug mode
npm run typecheck                       # TypeScript validation
CI_ENV=staging npm test                 # Environment switch
npm run build                           # Compile src/ -> dist/
npm run build:clean                     # Clean + rebuild
npm run client:package                  # Package client deliverable
npm run lint:testcases                  # Lint test case markdown
npm run pipeline:validate               # Full validation (sync + queue integrity + lint)
npm run planner:post-complete [id]      # Export CSV + validate checklist (hard gate: selfAuditPassed)
npm run planner:export-all              # Export all pending CSVs
npm run generator:post-complete [id]    # Validate spec output (hard gate: no --force bypass)
npm run queue:archive                   # Archive completed items, prune old log
npm run queue:compact                   # Also compact active item contexts
npm run queue:validate                  # Cross-check queue, activity log, performance
```
<!-- SYNC:COMMANDS:END -->

---

## 4b. Bug-Blocked Tests

When the Healer triages a failure as **BUG** (real application bug, not test defect):
- Test gets `test.skip('bug-blocked: BUG-XXX')` annotation — do NOT remove or heal
- Bug report stored in `reports/bugs/BUG-{MOD}-{NNN}.json`
- Bug-blocked tests re-enter pipeline only when bug is fixed (§10 Cat-D lifecycle)
- See `config/pipeline-config.json` triageConfig for triage settings
- Rules: ALL-032 (triage before heal), ALL-033 (bug-blocked immutable), ALL-034 (bug report storage)

---

## 5. Pitfalls

| Problem | Solution |
|---------|----------|
| `deviceScaleFactor` error | Remove `...devices['Desktop Chrome']` spread |
| Element not found | Add to `src/selectors/index.ts` |
| Env vars not loading | Check `CI_ENV` matches `config/environments/.env.{env}` filename |
| Agents not visible | Check MCP config in `.vscode/` |

---

## 6. RULES (Inline)
<!-- SYNC:NEVER_DO:START -->

| ID | Rule | Resolution |
|----|------|------------|
| ALL-001 | All .md edits: tables > prose, no filler, single source of truth, compress after edits | — |
| ALL-002 | Log activity start/end with HH:MM. Every task = activity log entry | — |
| ALL-003 | Before retrying: search agent-mistakes.md Resolution by category. After: log learning | — |
| ALL-004 | After writing rules: sync:mistakes + build:context + validate:sync. Capture novel patterns | — |
| ALL-005 | Before completing: answer 5-item checklist (§8). Evidence required (reconciliation table) | — |
| ALL-006 | Selector protocol: SELECTOR_CATALOG.md first. Annotations required. Verify HTML tag via DOM | — |
| ALL-007 | Diagnostics-first: read failure-summary.json before fix. Evidence checklist (§12). test:grep for single-TC | — |
| ALL-008 | MCP browser: never close, wait 3s after navigate, reuse sessions, never blanket-kill node | — |
| ALL-009 | ASCII-only in executable code. [OK], [ERR], [WARN], ->. No emoji in string literals | — |
| ALL-010 | Evidence before code edits: Phase A first, 10/13 checklist, MCP replication for SELECTOR/TIMING | — |
| ALL-011 | Pre-flight checks (§13) before work. Load own performance entry. Note defects/debt | — |
| ALL-012 | User explicit requests = top priority. Rules never override direct user instructions | — |
| COP-001 | Pipeline delegation: queue entry → delegate. Don't write specs. New items = pending_planning | — |
| COP-002 | TypeScript must compile: run typecheck, fix all errors | — |
| COP-003 | Research before answering: subagent, read source, verify. First response = comprehensive | — |
| COP-004 | Verify outputs: read files after generation, check encoding, test regex edge cases | — |
| COP-005 | TC sync: update to-csv.ts subMap + lint KNOWN_SUB_CODES + TAB_MAP for new codes | — |
| COP-006 | Check SELECTOR_CATALOG.md before declaring selector not found | — |
| COP-007 | Fix root causes, not symptoms. Read agent-mistakes.md first | — |
| COP-008 | Agent file edits: compare frontmatter side-by-side. No contradictions | — |
<!-- SYNC:NEVER_DO:END -->

---

## 7. Mistake Injection System

### Architecture
- **Single source of truth**: `specs_planning/_internal/agent-mistakes.md` (rules + resolutions, learnings merged)
- **Autonomous sync**: Every agent runs sync:mistakes after writing rules — no human gatekeeping
- **Context injection**: Queue items receive `injectedContext` with relevant rules + reminders

### Commands
```bash
npm run sync:mistakes       # Inject registry rules into agent files
npm run sync:mistakes:dry   # Preview changes without writing
npm run validate:sync       # Check for drift between registry and agents
npm run build:context       # Build injectedContext for all queue items
npm run metrics:agents      # Generate metrics dashboard
npm run pipeline:validate   # Full validation (sync + queue integrity + lint)
```

### Autonomous Sync (No Human Steps)
Agents write their own rules and run sync themselves. No manual steps required.
If you (Copilot) add a rule to `agent-mistakes.md`, YOU must also run the sync pipeline:
`npm run sync:mistakes && npm run build:context && npm run validate:sync`.

### Queue Item Context
Each queue item has `injectedContext` containing:
- `generatedAt`: ISO timestamp of context generation
- `targetAgent`: Which agent this context is for
- `mistakeIds`: Agent-specific rule IDs with Resolution column for linked learnings
- `moduleContextRef`: Reference to REQUIREMENTS.md section for this module
- `recentDefects`: Unresolved defects to avoid repeating
- `criticalReminders`: High-priority behavioral reminders
- `selfAuditQuestions`: Agent-specific 5-item checklist questions (§8)

---

## 8. References

- **RCA Protocol**: `docs/read_only_docs/AGENT_SHARED_RULES.md` §12 — artifact-first debugging, decision trees (ALL-045..051), evidence-based fixes, Pareto-ordered investigation
- **Shared Rules**: `docs/read_only_docs/AGENT_SHARED_RULES.md`
- **Architecture**: `docs/read_only_docs/ARCHITECTURE.md`
- **Commenting**: `docs/read_only_docs/COMMENTING_STANDARDS.md`
- **Agent Setup**: `docs/README.md` (MCP config section)
- **Queue Schema**: `specs_planning/_internal/agent-queue.schema.json`
- **Rules Registry**: `specs_planning/_internal/agent-mistakes.md` (includes merged learnings)
- **Agent Performance**: `specs_planning/_internal/agent-performance.json`

---

## 9. Agent Editing Standards

### All Documentation & Markdown
When creating, editing, or reviewing ANY `.md` file in the workspace: non-verbose, no redundancies, token-efficient, tables over prose. Single source of truth — link to canonical doc, never copy content. No beginner hand-holding unless doc is explicitly client-facing. Review for compression after every edit. See R22 + ALL-001..004.

### Mistakes Registry
When editing `specs_planning/_internal/agent-mistakes.md`: concise entries only. No verbose explanations, no redundant patterns. One line per mistake where possible.

### MCP Playwright Sessions
<!-- SYNC:MCP_CRITICAL:START -->
- `browser_navigate` auto-opens a browser if none exists — no manual setup needed
- **NEVER** call `browser_close` unless user explicitly requests it
- **REUSE** same browser context to avoid Microsoft auth/2FA re-prompts
- **User explicit requests override ALL agent rules** — always obey the user
- Always `browser_wait_for(time:3)` between navigate and snapshot (PLN-045)
- **Full MCP guide**: `docs/read_only_docs/MCP_BROWSER_GUIDE.md`
<!-- SYNC:MCP_CRITICAL:END -->

---

## 10. Self-Audit Protocol

All agents (including Copilot) must self-audit before responding. See `AGENT_SHARED_RULES.md §8` for the 3-layer protocol.

**Copilot self-audit checklist**:
- Framework changes compile (`npm run typecheck`)?
- No file ownership violations (§2)?
- Pipeline delegated correctly (not bypassed)?
- NEVER DO rules respected?
- New mistake patterns discovered → captured in `agent-mistakes.md`? (ALL-013)
- Log: `self-audit | L1:N→L2:N→L3:N` to activity log

---

**Updated**: 2026-02
