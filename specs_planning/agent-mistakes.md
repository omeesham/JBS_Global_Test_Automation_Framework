# Agent Rules Registry
<!-- CANONICAL REGISTRY: All agent behavioral rules live here.
     AUTOMATED SYNC: Run `npm run sync:mistakes` to inject rules into agent files.
     VALIDATION: Run `npm run validate:sync` to check for drift.
     
     ID ASSIGNMENT: IDs are permanent. Never reassign. Add new IDs at end of section.
     CONTEXT INJECTION: Queue items receive relevant rules via task-context-builder.
     
     CONSOLIDATED: 2026-03 audit reduced 204 → 71 rules. Learnings merged into Resolution column.
     Former agent-learnings.md entries integrated here. One registry, one lookup.
     
     FORMAT: | ID | Rule (positive framing) | Resolution (linked learning/evidence, or — if none) | -->

<!-- === R## RULE SUBSETS PER AGENT ===
     AGENT_RULES:requirements = R01,R06,R07,R11,R15,R16,R17,R21
     AGENT_RULES:planner = R01,R04,R06,R07,R09,R11,R13,R15,R16
     AGENT_RULES:generator = R01,R06,R07,R09,R10,R12,R13,R14,R15,R16
     AGENT_RULES:healer = R01,R06,R07,R08,R09,R10,R12,R14,R15,R16
     AGENT_RULES:audit = R06,R07,R15,R16
-->

<!-- === ID MASTER LIST ===
     ALL-001 to ALL-012: Shared rules (all agents)
     COP-001 to COP-008: Copilot rules
     REQ-001 to REQ-003: Requirements Agent rules
     PLN-001 to PLN-015: Planner rules
     GEN-001 to GEN-015: Generator rules
     HLR-001 to HLR-008: Healer rules
     AUD-001 to AUD-010: Audit rules
     
     Total: 71 rules (12 ALL + 8 COP + 3 REQ + 15 PLN + 15 GEN + 8 HLR + 10 AUD)
     
     MIGRATION: See specs_planning/agent-mistakes.md.bak for original 204-rule version.
     ID mapping: Old IDs → new consolidated IDs documented in SYSTEMS_AUDIT_RCA.md.
-->

## Shared
| ID | Rule | Resolution |
|----|------|------------|
| ALL-001 | All .md edits: tables > prose, no filler, single source of truth (link don't copy), compress after edits. Extend existing files > create new | — |
| ALL-002 | Log activity start/end with HH:MM timestamps. Every agent, every task = activity log entry. No silent completions | — |
| ALL-003 | Before retrying: search agent-mistakes.md Resolution column by failure category. Apply documented solution if match. After retrying: log what was learned (specific trigger + root cause + fix) | LRN-014: Blanket node kill destroys MCP — use targeted process filter |
| ALL-004 | After writing rules: `npm run sync:mistakes && npm run build:context && npm run validate:sync`. Capture novel patterns discovered during any task before completing | — |
| ALL-005 | Before completing: answer agent-specific 5-item checklist (see §8). All claims require evidence. Reconciliation table with min 3 rows | — |
| ALL-006 | Selector protocol: check SELECTOR_CATALOG.md first. New selectors need @where @el @text @keys annotation. Verify HTML tag via DOM — role="button" on `<a>` ≠ `<button>` tag | LRN-015: Radix UI checkbox = `<button role="checkbox">` not `<input>`. LRN-017: Playwright auto-pierces shadow DOM |
| ALL-007 | Diagnostics-first debugging: read failure-summary.json (failureCategory, fullError, networkFailures, consoleErrors, authChain) BEFORE any fix. Complete evidence checklist (§15). Use test:grep for single-TC runs | LRN-005: White page = OAuth 400 — check networkFailures before blaming selectors |
| ALL-008 | MCP browser: never call browser_close (auto-opens on navigate). Wait 3s after navigate before snapshot. Reuse sessions. Never blanket-kill node processes | LRN-002: Snapshot too fast → stale DOM. LRN-014: Stop-Process -Name node kills MCP |
| ALL-009 | ASCII-only in executable code output. Use [OK], [ERR], [WARN], ->. No emoji/Unicode in string literals, Log.*, console.log. Comments exempt | — |
| ALL-010 | Evidence before code edits: no code during Phase A. Complete evidence checklist (10/14 min). MCP replication mandatory for SELECTOR/TIMING. Cite evidence rows in hypothesis | — |
| ALL-011 | Pre-flight checks (§18) before any work. Load own performance entry. Note unresolved defects and learning debt | — |
| ALL-012 | User explicit requests = top priority. Agent rules never override direct user instructions | — |

## Copilot
| ID | Rule | Resolution |
|----|------|------------|
| COP-001 | Pipeline delegation: create queue entry → delegate to appropriate agent. Don't bypass pipeline. Don't write spec files (Generator's job). New items = pending_planning | — |
| COP-002 | TypeScript must compile: run `npm run typecheck`, fix all errors before commit | — |
| COP-003 | Research before answering: run subagent, read source code, verify claims. First response = comprehensive | — |
| COP-004 | Verify outputs: read output files after generation, check encoding/format. Test regex on double-digits, nested patterns, edge cases | — |
| COP-005 | TC submodule sync: update to-csv.ts subMap AND lint-test-cases.ts KNOWN_SUB_CODES AND to-csv.ts TAB_MAP for new TC codes | — |
| COP-006 | Check SELECTOR_CATALOG.md before declaring selector not found | — |
| COP-007 | Fix root causes, not symptoms. Read agent-mistakes.md before starting. Verify full resolution | — |
| COP-008 | Agent file edits: compare full frontmatter side-by-side. Rules must not contradict each other | — |

## Requirements
| ID | Rule | Resolution |
|----|------|------------|
| REQ-001 | Live UI exploration required: browser_navigate to app FIRST, explore, then update REQUIREMENTS.md. Log browser tool usage | — |
| REQ-002 | Evidence-backed documentation: browser_snapshot proof for every field/selector. Trigger actual error messages on live UI | — |
| REQ-003 | Screenshots (browser_take_screenshot) for every new feature section discovered | — |

## Planner
| ID | Rule | Resolution |
|----|------|------------|
| PLN-001 | Verify everything on live site: navigate to URL, browser_snapshot, verify defaults/selectors/fields BEFORE writing any TC. Cross-reference against REQUIREMENTS.md. Never fabricate URLs — read BASE_URL from .env | LRN-001: Fabricated URL → ERR_NAME_NOT_RESOLVED |
| PLN-002 | Selector validation: all TC-referenced selectors must exist in src/selectors/index.ts. Each selector unique — scope tab-specific selectors to container | LRN-003: Wrong sub code → check KNOWN_SUB_CODES |
| PLN-003 | TC format: TC-XXX-YY-NNN IDs, Updated date, FIELD INVENTORY section, Automatable field, `N. Action -> Expected` format. UI labels in Steps (not code names). Error text in Steps, keys in Notes. "from X to Y" not arrows | — |
| PLN-004 | Test scenario completeness: checkboxes need 3 scenarios (enabled+click, disabled+non-click, label). Inputs need 4-5 (alpha, special, inbound boundary, outbound boundary, non-numeric for spinbuttons). Dates need boundary + cross-field. Every editable field needs save-reload-verify | — |
| PLN-005 | Error recovery flows: trigger error → fix cause → save succeeds for every validation. Document both success and error paths | — |
| PLN-006 | Test plan ↔ test case sync: every TC has matching test plan Scenario. CSV verified after adding TCs (grep for new IDs; re-export if missing) | — |
| PLN-007 | Domain logic coverage: country branches (USA vs intl), permissions/roles, field dependencies (cascading/dual), conditional defaults (IsUnion → ETS), trigger conditions for disabled fields, required field validation | — |
| PLN-008 | No contradictory/vague TCs: cross-reference all TCs for consistency. No absolute language ("always", "permanently") without evidence. Explicit preconditions. Update stale status labels. Concrete expected values (not "record for baseline") | — |
| PLN-009 | Checklist self-certification requires evidence: each true field needs ≥1 supporting TC. False + notes when N/A. Don't repeat certification mistakes after prior audit block | — |
| PLN-010 | MCP browser reuse: never open new sessions. browser_navigate auto-opens. Use planner_setup_page for bootstrap only | LRN-002: Wait 3s between navigate and snapshot |
| PLN-011 | Spinbutton format verification: type boundary values to confirm stored vs display format. Document both (e.g. input: 0.04 decimal, display: 4.00%) | LRN-007: inputValue() returns "4.00%" not "0.04" |
| PLN-012 | Save flow documentation: click Save in MCP, document every dialog/toast (selector + exact heading/text). Undocumented dialogs = clickSave() never commits | — |
| PLN-013 | Environment-blocked TCs: flag as `Status: Blocked (Cat-A: reason)` at TC creation time. Don't omit, don't leave as Manual. 0 TCs for blocked functionality = incomplete | LRN-020: Office 1604 silently rejects persistent changes |
| PLN-014 | Parser/lint compatibility: run lint:testcases before complete. Test regex on separators, double-digits, format variants. Re-export ALL CSVs after any to-csv.ts change | — |
| PLN-015 | Cleanup and data hygiene: restore fields after exploration. Cleanup steps for data-mutating tests. Field count reconciliation (DOM ↔ TCs). No data anomalies without explanatory notes. Scope = assigned tab only | — |

## Generator
| ID | Rule | Resolution |
|----|------|------------|
| GEN-001 | All selectors from src/selectors/index.ts. No inline selectors in spec or page object files | — |
| GEN-002 | Data-driven patterns: data arrays in .data.ts + batch page methods. One file per concern. 300-line advisory (refactor, never split). One test.describe.serial per spec. Navigate once, reuse state | — |
| GEN-003 | Architecture: use fixtures only (no constructors). No raw page.* in specs. No Log/CredentialLoader imports in specs. Import only from ../../setup/fixtures. Page interactions through page object methods only | — |
| GEN-004 | Test execution workflow: typecheck → test → generator:post-complete. No marking complete without passing all gates. Use existing auth (vault + CredentialLoader + authenticatedSession fixture) | — |
| GEN-005 | MCP browser: never open/close. Snapshot only for pre-flight selector validation. No exploratory browsing beyond Phase 1 | — |
| GEN-006 | No placeholder tests: no test.fixme(), no empty describes with only comments, no stubs. Omit unimplementable TCs silently + log action: missing-coverage. Every describe must have ≥1 executable test | — |
| GEN-007 | Targeted test runs: test:grep for single TC during fix loop. Full run for initial baseline and final verification only. Headed runs (--headed) for diagnostics | — |
| GEN-008 | Angular form model: always el.press('Tab') after el.fill() to trigger blur/change. Verify inputValue() format via MCP before writing assertions. Input format ≠ display format for spinbuttons | LRN-013: fill() alone doesn't fire Angular change events. LRN-007: inputValue() returns "4.00%" not "0.04". LRN-008: Triple-click fails on Angular re-render → use Ctrl+A |
| GEN-009 | Boundary data verification: MCP-test each value before committing data files (type → blur → check). Angular may disable Save for client-side boundary violations — test inline error only, not DB persistence | LRN-012: Angular disables Save on boundary violation. LRN-010: Invalid test leaves dirty DB state for next serial test |
| GEN-010 | Process cleanup: kill ONLY stale Playwright runners via `Get-CimInstance Win32_Process -Filter "Name='node.exe'" \| Where { CommandLine -match 'playwright.*test' }`. NEVER blanket-kill node or user browser processes | LRN-014: Stop-Process -Name node kills MCP server |
| GEN-011 | Escalation: AUTH/INFRASTRUCTURE → escalate immediately (don't fix). Web search unfamiliar errors. No human input requests. Search → learnings → web → skip. Don't create new auth infrastructure (already solved) | — |
| GEN-012 | Pre-classified skip: auto-skip fixme-registry/skippedTcIds TCs. Log missing-coverage. Move on | — |
| GEN-013 | Review all Manual TCs before marking complete. Classify each: automatable (implement), Cat-A/B (FIXME), covered-by (update), not-automatable (document). Checkbox 3-scenario and textbox 4-5 scenario coverage required | — |
| GEN-014 | No framework file edits: don't modify base-page.ts, src/common/*, src/utils/*, scripts/*. Log action: escalate-tooling and proceed | — |
| GEN-015 | RCA protocol: never declare "confirmed" mid-sequence. MCP replication required before code fix (§15 Phase A). State hypotheses as hypotheses. Only confirm after full flow (type → save → dialog → reload → verify) | LRN-019: Same-URL goto in Angular may reuse component — navigate away first |

## Healer
| ID | Rule | Resolution |
|----|------|------------|
| HLR-001 | Run tests first, show actual test_run output. No fake signoff. Activity log must match queue reality | — |
| HLR-002 | Investigate all test skips. Verify code correctness first — don't blame environment without evidence | — |
| HLR-003 | Read historical diagnostics (failure-summary.json enriched data: network, console, auth chain) BEFORE launching MCP tools | — |
| HLR-004 | Use all 8 failure categories: selector, timing, assertion, application, auth, network, infrastructure, data | — |
| HLR-005 | No test.fixme(): remove unfixable tests entirely, log missing-coverage with reason. Never escalate to human | — |
| HLR-006 | Verify exact failing TC from terminal output. Run spec first, read output. User description ≠ test title | LRN-011: "0.01" and "-0.01" are different tests |
| HLR-007 | DB-state sensitive tests need ≥2 passing runs. Evidence checklist (§15) before any code edit. Serial test state leakage = restore both target + dependent fields | LRN-010: Invalid test corrupts DB state for next serial test. LRN-016: Currency Selected/IsDefault cascade |
| HLR-008 | Learning entries required for every fix attempt. Healing without learning = wasted session | — |

## Audit
| ID | Rule | Resolution |
|----|------|------------|
| AUD-001 | Assume errors exist (R15). Zero findings requires explicit justification. Zero self-findings while creating 3+ findings for others = re-audit own methodology | — |
| AUD-002 | Content audit, not just structure: read test steps critically. Catch logic conflicts, validation timing ("on save" vs "on load"), navigation errors, uncertain language ("may be", "TBD") | — |
| AUD-003 | Field/selector reconciliation: count fields DOM ↔ TCs ↔ test plan. Check all TC-referenced selectors exist. Grep for DISCOVER_ placeholders. Re-check selectors file before claiming "missing" | — |
| AUD-004 | Mandatory registry update: new patterns found → add to agent-mistakes.md before responding. Mode 1 step 7 is not optional | — |
| AUD-005 | Remediation prompts: every finding maps to specific agent + copy-pastable fix prompt. Stage revert must include which agent + what prompt + expected fix scope | — |
| AUD-006 | Scope verification: all TCs test correct tab/feature. Flag scope creep. Use "unverified" not "fabricated" (implies intent). Focus on actionable current issues | — |
| AUD-007 | Rule quality validation: check agent-mistakes.md for contradictions, duplicates, ID collisions, sync drift. Test plan vs test case wording must match | — |
| AUD-008 | Temporal anchoring: read activity log, find last audit entry, scope all checks to work AFTER that timestamp. Don't re-audit covered periods | LRN-022: No temporal anchor → agent re-scans all history |
| AUD-009 | Learning yield verification: check learnings proportional to retries. Zero learnings on retry session = critical finding | — |
| AUD-010 | Trust promotion verification: all §7 thresholds (maturityScore, learningYield, defectRecurrenceRate, selfAuditAccuracy). Check checkbox 3-scenario and textbox 4-5 scenario coverage | — |
