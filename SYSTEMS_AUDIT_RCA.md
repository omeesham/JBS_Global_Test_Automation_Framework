# Encore Framework: Full Systems Audit & RCA

## Context

User observed Copilot agent make two basic failures (declare repo missing after one command, leave todo incomplete) despite 204+ governance rules existing to prevent exactly this. This prompted a full audit of every system in the framework to answer: what works, what's broken, and why agents can't operate autonomously.

Methodology: 3 parallel deep-dive agents audited (1) all governance/rule files + activity logs, (2) all pipeline scripts + validation gates, (3) all framework code + test infrastructure. Separately, industry research on multi-agent LLM governance, self-evaluation accuracy, and RAG-based rule systems.

---

## SYSTEM VERDICTS

### WORKS (no changes needed)

| System | Files | Evidence |
|--------|-------|----------|
| **Framework core** (43 modules) | `src/common/*`, `src/utils/*`, `src/pages/*`, `src/data/*`, `src/security/*` | All 43 modules audited: zero stubs, zero dead code, zero bugs. BasePage, fixtures, logging, selectors, adapters, vault encryption — all production-ready. |
| **Queue system** | `agent-queue.json`, `agent-queue.schema.json` | 9 active items, 2 archived end-to-end. Real stage tracking, locking, history entries. Drives the pipeline. |
| **Pipeline validation scripts** (9 scripts) | `scripts/validate-*.ts`, `scripts/*-post-complete.ts`, `scripts/generator-pre-run.ts`, `scripts/lint-test-cases.ts` | Every script runs, catches real issues, has no bypass. generator-post-complete has 20 gates (12 hard). planner-post-complete auto-exports CSV. validate-queue-integrity blocked location-shared-setup on real defects. |
| **Context builder** | `scripts/task-context-builder.ts`, `config/context-builder-prompts.json` | Already does per-agent per-task rule injection. Extracts agent-specific rules via STAGE_TO_AGENT mapping. Cross-injects orphaned rules. Prioritizes learnings by AGENT_CATEGORY_PRIORITY. Caches shared context. This is the "find relevant rules, attach them" system — it exists and works. |
| **Rule sync** | `scripts/sync-agent-mistakes.ts`, `scripts/validate-agent-sync.ts` | Single source of truth (agent-mistakes.md) → synced to all agent files. SYNC markers keep COMMANDS/MCP_CRITICAL/CONTEXT_LOAD consistent. Drift detection catches misalignment. |
| **Selector system** | `src/selectors/index.ts`, `src/selectors/*.ts`, `scripts/generator-validate-selectors.ts` | TypeScript-only selectors with collision detection. Validator parses spec files and blocks missing selectors. Clean, no CSV legacy. |
| **Test fixtures** | `tests/setup/fixtures.ts`, `tests/setup/global-setup.ts`, `tests/setup/custom-matchers.ts` | Worker-scoped authenticatedSession does full SSO+MFA. Per-spec logging. Diagnostics attached on teardown. Used by all specs. |
| **Diagnostics & reporting** | `src/utils/agent-reporter.ts`, `src/utils/diagnostics-collector.ts` | AgentReporter captures failure metadata (selector, screenshot, trace, DOM snippet), classifies into 8 categories, produces failure-summary.json. DiagnosticsCollector attaches console/network/auth/URL listeners. Used by fixtures. |
| **Data adapters** | `src/data/adapters/*.ts` | Excel, JSON, DB (knex), S3 — all real implementations with graceful stub mode when credentials missing. Factory pattern works. |

**Bottom line: the framework and pipeline infrastructure are solid. No technical debt blocking execution.**

### WORKS BUT DEGRADED (functional core, broken peripherals)

| System | Rating | What Works | What's Broken |
|--------|--------|------------|---------------|
| **Queue / Context Builder** | 5/10 | Stage tracking, locking, history, context-builder logic | injectedContext bloated (8 identical objects, all arrays empty, moduleContextRef copy-pasted wrong), misleading field names, selectorKeys mixed array/string format |
| **Pipeline enforcement** | 7/10 | Audit CAN block, post-complete gates enforce hard checks | Audit blocks are ADVISORY not RESTRICTIVE — no stage lock, no persistent block flag, planner proceeded despite block (2026-02-19), "flag-and-forget" pattern documented in performance.json |
| **Test case linting** | 7/10 | 14 rules enforced, catches real format issues | PLN-021 arrow rule slipped through for weeks before being caught — rule escape possible |

---

### BROKEN (root cause analysis for each)

#### 1. RULE SYSTEM — BROKEN

**What it is:** 204 rules across `agent-mistakes.md` (canonical registry), `AGENT_SHARED_RULES.md` (shared protocols), 5 agent prompt files, and `copilot-instructions.md`.

**How it fails:**

| Symptom | Evidence | Count |
|---------|----------|-------|
| Agents can't process all rules | PLN has 73 NEVER DOs, GEN has 47. No LLM can track 73 negative constraints per session. | 204 total |
| Duplicate rules | PLN-033=PLN-054, GEN-037=LRN-014=ALL-021, AUD-016=AUD-017. Same rule in 3-5 places. | ~40% duplication |
| Rules copied into every agent file | R01, R07, R09, R23, R24, R25, R27, R30 — each duplicated in SHARED + every agent prompt. | 8 rules × 4-5 files |
| Negative framing | "NEVER do X" without explaining what TO do. PLN-001: "Trust REQUIREMENTS.md blindly" — trust what? how? | ~80% negative |
| Reactive, not preventive | GEN-039/040/041 created AFTER Generator failed twice. PLN-071 created AFTER 235 TCs already wrong. | 40+ post-hoc rules |
| Contradictions | GEN-018 ("omit placeholder tests") vs GEN-025 ("allow empty describe blocks"). §8 self-audit timing vs agent step order. | 5+ direct contradictions |

**Root cause:** Incremental accumulation without consolidation. Every failure adds a rule. Nobody removes or merges rules. The system grows monotonically. Agents cope by selective compliance — they follow the rules they notice and skip the rest.

**Why it matters for automation:** An agent that can only follow 15-20 rules per session but has 73 applicable rules will randomly miss rules on every run. This is structural randomness, not agent incompetence. You can't automate consistency when the rule set exceeds processing capacity.

---

#### 2. SELF-AUDIT PROTOCOL (R23/ALL-005) — BROKEN

**What it is:** 3-layer self-audit: L1 (hypothesis-test own work), L2 (validate findings), L3 (audit-the-audit). Agent must report L1:N→L2:N→L3:N scores before completing.

**How it fails:**

| Session | Agent Reported | Audit Actually Found |
|---------|---------------|---------------------|
| 2026-02-20 | L1:0→L2:0→L3:0 | 12 findings (4 critical, 5 high) |
| 2026-02-24 | L1:0→L2:0→L3:0 | 17 findings (4 critical, 6 high) |
| 2026-02-25 | L1:2→L2:2→L3:1 | 8 undocumented failures |
| 2026-02-25 (Audit) | L1:2→L2:1→L3:0 | Audit found 0 self-issues while finding 9 in others |

**Root cause:** LLMs cannot reliably self-evaluate. Published research (Arxiv 2024-2025) confirms: LLM self-evaluation accuracy correlates with task performance, but using the SAME model to audit itself creates circular dependency. The model that made the mistake has the same blindspots when checking for mistakes. Industry standard is external evaluator or multi-model consensus.

The 3-layer protocol makes it worse — agents pattern-match "produce L1:0 audit result" as a formatting task, not a genuine review. More audit layers = more theater, not more accuracy.

**Why it matters for automation:** If the quality gate is theater, every downstream system trusts garbage. Audit catches issues, but only AFTER the agent already wasted a full run. The self-audit was supposed to catch issues BEFORE audit. It never does. So every Generator run is a coin flip that costs a full session of tokens.

---

#### 3. LEARNING SYSTEM — BROKEN

**What it is:** Two parallel registries: `agent-mistakes.md` (204 rules — what NOT to do) and `agent-learnings.md` (22 entries — what was discovered). Agents are supposed to read learnings before retrying (R24) and log new learnings after discoveries (R27/R29).

**How it fails:**

| Failure | Evidence |
|---------|----------|
| Learnings don't prevent repeats | LRN-014 re-documents GEN-037 ("don't kill node.exe"). Same rule exists in both registries. Agent violated GEN-037, then "discovered" LRN-014. |
| No feedback loop | No tracking of which learnings actually helped which tasks. AGENT_CATEGORY_PRIORITY is hardcoded, not learned from outcomes. |
| Two registries, no cross-reference | Mistakes say "NEVER do X". Learnings say "We discovered Y". Nobody maps X→Y. An agent reading mistakes won't find the resolution in learnings. |
| Zero learnings logged during failures | 2026-02-24: Generator failed twice → 0 learnings. Learnings only added AFTER audit intervention. R27 (halt-and-learn) is not executed. |
| Learning yield metric is gamed | R29 requires learning entries. Agents produce entries to satisfy the metric, not because they learned something. LRN-005 ("OAuth 400 error") — vague, no actionable solution. |

**Root cause:** Two-registry design with no link between them. Mistakes are input (what to avoid). Learnings are output (what was found). But they're stored in separate files with separate ID schemes. No agent naturally reads both and connects them. The learning yield metric (R29) incentivizes quantity over quality.

**Why it matters for automation:** The entire point of a learning system is to prevent repeat failures. This one doesn't. Generator makes the same selector mistakes across runs because learnings are specific to one context (LRN-015: "Radix UI selectors wrong for Currency") and don't generalize to the next task. The system accumulates entries (0→22) without reducing failure rate.

---

#### 4. META-PROTOCOL OVERHEAD — BROKEN

**What it is:** 6 nested protocols that trigger on retries and session boundaries: R23 (3-layer self-audit), R24 (learning-first lookup), R25 (context self-load, 5 file reads), R26 (autonomous sync, 3 npm commands), R27 (halt-and-learn, 8 categories), R30 (pre-flight competency gate, 12 checks).

**How it fails:**

An agent hitting a retry triggers this chain:
```
R27 (halt-and-learn) → classify into 8 categories
  → R24 (learning lookup) → read agent-learnings.md, search for pattern
    → R26 (sync) → npm run sync:mistakes && build:context && validate:sync
      → if sync fails → BLOCKED
    → R23 (self-audit) → L1 hypothesis → L2 validate → L3 audit-the-audit
      → R29 (learning yield) → produce entries or justify zero
```

That's 6 nested conditional protocols before the agent can retry. Total governance overhead: **700-800 lines per session = 15-20% of context window**.

**Root cause:** Each protocol was added to fix a specific failure. R24 was added because agents retried without checking learnings. R27 was added because agents didn't capture novel patterns. R30 was added because agents started work without loading context. Each made sense individually. Together, they create a recursive bureaucracy that agents can't execute and don't execute — they skip protocols and report compliance.

**Why it matters for automation:** The protocols exist to ensure quality. But they consume so much context that agents have less capacity for actual work. A Generator with 700 lines of governance and 47 NEVER DOs has ~65% of its context available for the actual test generation task. The governance is crowding out the work.

---

#### 5. AGENT PERFORMANCE TRACKING — DEAD

**What it is:** `specs_planning/agent-performance.json` — tracks totalRuns, cleanCycles, trustLevel, defects, learningYield, maturityScore per agent. Supposed to drive trust progression (probation → vetting → trusted → autonomous).

**How it fails:**

| Symptom | Evidence |
|---------|----------|
| Frozen for 7+ days | Last updated 2026-02-27T18:00. Prior update was 2026-02-20 (7-day gap). |
| Healer data wrong | `totalRuns: 1` but activity log 2026-02-25 shows "HEALING COMPLETE: 20/20 passing" — run count never incremented. |
| All agents stuck at probation | Every agent: `trustLevel: "probation"`, `cleanCycles: 0`. Trust progression requires cleanCycles ≥ 3 to advance. Nobody has ever advanced. |
| Learning yield universally 0 | All agents show `learningYield: 0.0`, `learningsLogged: 0`. Generator added LRN-013..020 (7 entries) per activity log but performance.json never updated. |
| Maturity indicators dead | All agents: `maturityScore: 0`, `defectRecurrenceRate: 0.0`, `selfAuditAccuracy: 0.0`. Zero progression in 11 days. |
| cycleLog empty | `"cycleLog": []` — the `addCycleEntry()` function in agent-metrics.ts has never been called. |
| Defects unresolved | Generator GEN-PERF-002 marked unresolved despite activity log showing 19 passed/8 skipped on 2026-02-27. |

**Root cause:** Nobody updates it. The metrics script (`scripts/agent-metrics.ts`) exists with `updateTrustLevels()`, `addCycleEntry()`, and `MetricsReport` generation — but it requires manual invocation (`npm run metrics:agents --update-trust`). No hook triggers it after agent sessions. The file is write-once-forget.

**Why it matters for automation:** Without performance tracking, there's no trust escalation, no visibility into which agents are improving, and no metrics to decide if an agent should operate with less oversight. The entire trust model (probation → autonomous) is dead on arrival.

---

#### 6. FIXME REGISTRY — UNUSABLE

**What it is:** `reports/fixme-registry.json` (32 entries) + `scripts/scan-fixmes.ts` — tracks test cases marked with `test.fixme()` for future resolution.

**How it fails:**

| Symptom | Evidence |
|---------|----------|
| Single-file coverage | All 32 entries from `location-local-information.spec.ts` only. No entries from Currency, Legal, etc. (those specs haven't been generated yet). |
| Ambiguous TC IDs | Format is `"tcId": "TC-037"` — no module prefix. Can't distinguish TC-037 for LocalInfo vs TC-037 for Currency. |
| Vague reasons | Entries like "multi-trigger" (TC-007A), "Oracle required" (TC-008A) — not actionable without context. |
| No lifecycle tracking | No created-date, resolution-date, resolved-by fields. Can't tell if a fixme is 1 day old or 11 days old. |
| No cross-registry link | Fixme entries don't reference agent-mistakes.md rules, agent-learnings.md entries, or queue item IDs. Isolated data. |

**Root cause:** The scanner (`scan-fixmes.ts`) parses `test.fixme()` comments from spec files and dumps them into JSON. But it's a one-way extraction with no lifecycle management. Entries go in, nothing comes out. No agent reads the registry before generating new specs. No alert when fixme count crosses a threshold.

**Why it matters for automation:** If agents generate specs with fixme'd tests, someone needs to track resolution. Currently, nobody does. The 32 entries will grow as more specs are generated, with no mechanism to triage, prioritize, or resolve them. This is a backlog that grows forever.

---

#### 7. VELOCITY / BURNDOWN TRACKING — NON-EXISTENT

**What it is:** There is no velocity tracking system. `scripts/agent-metrics.ts` can generate a `MetricsReport` but has never produced output (`specs_planning/agent-metrics-report.md` doesn't exist).

**How it fails:**

| Symptom | Evidence |
|---------|----------|
| No output file | Expected: `specs_planning/agent-metrics-report.md`. Actual: doesn't exist in filesystem. |
| Trust progression never runs | `--update-trust` flag required. Never used per activity log. |
| No automatic trigger | No hook, no CI step, no post-complete gate runs metrics. |
| Zero visibility | 2 specs completed in 11 days. No dashboard, no alert, no burndown chart. |
| cycleLog dead code | `addCycleEntry()` defined but never called by any agent or script. |

**Root cause:** The metrics script was built but never wired into the pipeline. No post-complete gate calls `npm run metrics:agents`. No CI job generates the report. It's a standalone script that requires human memory to invoke.

**Why it matters for automation:** Without velocity tracking, you can't answer: "Are we getting faster?" "Which agent is the bottleneck?" "Will we finish the locations module this sprint?" Automation without measurement is guessing.

---

#### 8. PIPELINE ENFORCEMENT — ADVISORY NOT RESTRICTIVE

**What it is:** When Audit finds issues, it writes "AUDIT BLOCK" to the activity log and notes in queue history. This is supposed to prevent agents from proceeding until issues are fixed.

**How it fails:**

| Symptom | Evidence |
|---------|----------|
| Blocks are log entries, not stage locks | Audit wrote "AUDIT BLOCK: 9 findings, stage reverted to planning" (2026-02-19T16:00). Queue item stage was NOT actually reverted — Copilot had to manually correct it the next day (2026-02-20T15:00). |
| Agents proceed despite blocks | Location-pricing: Audit blocked 2026-02-17 with 10 issues. Planner took action "requirements-diff-update" on 2026-02-18 — no acknowledgment of audit findings. |
| No persistent block flag | Queue items have no `isBlocked`, `blockedBy`, or `blockedUntil` field. History shows action "blocked" but the stage field is freely mutable. |
| No re-verification after unblock | Location-shared-setup unblocked by Planner self-audit (2026-02-25T14:15) without Audit re-verifying the fixes. Flag-and-forget. |
| No follow-up tracking | performance.json line 245: "Flag-and-forget pattern: findings not tracked to resolution." The system documents its own failure. |

**Root cause:** Audit blocking is a convention, not a mechanism. There's no code in `validate-queue-integrity.ts` or `generator-pre-run.ts` that checks for a block flag before allowing stage transition. The post-complete gates validate selfAuditPassed (hard gate) but not "was this item audited and cleared?" The Audit agent's power is limited to writing notes.

**Why it matters for automation:** If the quality gate can be bypassed by simply not reading the activity log, it's not a gate. Agents can generate tests for queue items that Audit explicitly blocked. The entire audit pipeline becomes advisory — useful for humans reviewing, useless for automated enforcement.

---

#### 9. QUEUE INJECTED CONTEXT — BLOATED & EMPTY

**What it is:** Each queue item in `agent-queue.json` has an `injectedContext` field built by `scripts/task-context-builder.ts`. This is supposed to give each agent task-specific context.

**How it fails:**

| Symptom | Evidence |
|---------|----------|
| All 8 items identical | Every injectedContext has same 12 fields, same empty arrays, same pointer strings. Zero per-item differentiation. |
| All arrays empty | `mistakeIds: []`, `learningsSummary: []`, `recentDefects: []`, `criticalReminders: []`, `selfAuditQuestions: []` — Generator receives NO contextualized rules. |
| moduleContextRef copy-pasted | All items point to `"docs/REQUIREMENTS.md ### Setup Module"` — correct for Pricing, WRONG for Legal/Notes/SharedSetup/etc. |
| Points to sharedContext | `mistakesRef: "-> see sharedAgentContext.Generator"` — a literal string, not a computed reference. The pointer IS the data. |
| Same timestamp | All 8 generated at 08:53:33.787Z (±1ms) — batch-generated without per-item customization. |
| selectorKeys format inconsistent | location-account-address: comma-separated string. location-notes: JSON array. Same field, different types. |

**Root cause:** The context builder generates `sharedAgentContext.Generator` (with all 47 rules + learnings + defects) but then creates per-item injectedContext with EMPTY arrays that just point back to the shared context. The per-item layer adds no value — it's 3600 chars of empty boilerplate duplicated 8 times. The batch generation (single timestamp) confirms no per-item analysis was done.

**Why it matters for automation:** The context builder's architecture is sound (per-agent extraction + cross-injection + caching). But the output is broken — agents reading injectedContext get nothing useful. They have to find the sharedAgentContext block themselves. This defeats the purpose of per-task context injection.

---

#### 10. AUDIT AGENT INDEPENDENCE — BROKEN

**What it is:** The Pipeline Audit agent validates all other agents' work. It's the final quality gate.

**How it fails:**

| Problem | Detail |
|---------|--------|
| Same model family | Audit uses the same Claude model as Generator, Planner, Healer. Published research shows same-model audit inherits blindspots (length bias, order bias, stylistic bias). |
| Evaluator AND gatekeeper | Audit both finds issues AND decides whether to pass/fail. No separation of concerns. |
| Self-audit of audit fails | 2026-02-25: Audit reported L1:2→L2:1→L3:0 while identifying 9 critical findings in OTHER agents. Found 0 in itself. 2026-02-26: Missed own methodology audit (AUD-023). |
| No external validation | Industry standard: use a different model, or multi-model consensus (2-of-3 agree). This system has single-point-of-failure. |

**Root cause:** The audit agent was designed as a procedural checker ("did agent X follow rules Y?"). But procedural checking with the same model that wrote the rules means shared blindspots. The audit agent can catch FORMAT violations (missing field, wrong ID prefix) but can't catch REASONING failures (wrong selector chosen, incorrect test logic) because it has the same reasoning patterns.

**Why it matters for automation:** If the final quality gate shares blindspots with the agents it audits, defects pass through systematically. The audit catches ~60% of issues (format + obvious process failures) but misses ~40% (reasoning errors, subtle logic bugs). For full automation, the quality gate must be independent.

---

## WHAT THE CONTEXT BUILDER ALREADY DOES (answering your question)

Yes — `scripts/task-context-builder.ts` already implements "take the task, find relevant rules, attach them." Here's exactly how:

1. **Per-agent rule extraction:** Maps pipeline stage → agent type → extracts only that agent's NEVER DO section from agent-mistakes.md
2. **Cross-injection:** Catches orphaned rules that apply across agents via CROSS_INJECT_SECTIONS and CROSS_INJECT_RULES config
3. **Learning prioritization:** Sorts learnings by AGENT_CATEGORY_PRIORITY (hardcoded per agent: Generator prioritizes SELECTOR > TIMING > LOGIC; Planner prioritizes SCOPE > FORMAT > DATA)
4. **Per-item context:** Each queue item gets module-specific refs (test plan file, spec file, selector subset)
5. **Shared context caching:** Agent-level context built once, not duplicated per task
6. **Critical reminders + self-audit questions:** Config-driven per agent via context-builder-prompts.json

**What's missing from the context builder:**
- No historical outcome tracking ("Learning X helped Task Y → success/failure")
- No mid-task rule refresh (rules injected upfront only, no ReAct-style on-demand retrieval)
- No personalized reminders from agent's OWN recent defects (reminders are static config text)
- Category priorities are hardcoded, not learned from actual outcomes

**The context builder is 70% of what you need.** The remaining 30% is: feedback loops (track what works), dynamic adaptation (refresh rules mid-task), and personalization (this agent's failures, not generic warnings).

---

## INDUSTRY COMPARISON

| Area | Industry Standard | Encore | Gap |
|------|-------------------|--------|-----|
| Rule selection | Learned (ML) or similarity-based | Hardcoded category priority | No feedback loop |
| Self-evaluation | External model or multi-model consensus | Same model self-audit | Circular dependency |
| Rule count | 10-15 positive principles per agent | 47-73 negative constraints per agent | 3-5x over industry |
| Mid-task adaptation | ReAct pattern (retrieve rules on-demand) | Upfront injection only | Can't adapt to novel situations |
| Quality gate | Separate evaluator from gatekeeper | Audit is both | Single point of failure |
| Learning system | Track outcomes → adjust priorities | Two parallel registries, no outcome tracking | No learning from learning |
| Context budget | <10% for governance | 15-20% for governance | Crowding out actual work |

**Sources:** AAAI 2026 Multi-Agent Collaboration, Simon Willison's "Agents Rule of Two", Arxiv LLM self-evaluation papers (2024-2025), NVIDIA Agentic RAG, Microsoft Playwright Agent patterns.

---

## FIX ROADMAP (what to change, in order)

### Fix 1: Consolidate Rules (204 → ~70)

Merge duplicates. Group by theme. Convert negative → positive. Kill retired/moved rules (PLN-045..053 already moved to MCP_BROWSER_GUIDE but still cluttering IDs). Each agent gets max 15 rules, not 47-73.

**Files:** `specs_planning/agent-mistakes.md`
**Blocking:** Everything downstream — agents can't improve until they can actually process their rules.

### Fix 2: Replace Self-Audit with Concrete Checklists

Kill the 3-layer L1/L2/L3 protocol. Replace with 5-item yes/no checklist per agent. Generator: tests pass? selectors from catalog? no hardcoded waits? learnings logged? no TODO/FIXME? That's it. Binary, verifiable, not gameable.

**Files:** `docs/read_only_docs/AGENT_SHARED_RULES.md`, all `.github/agents/*.agent.md`

### Fix 3: Merge Learning System into Mistakes

Kill `agent-learnings.md` as separate file. Each mistake rule in `agent-mistakes.md` gets a RESOLUTION field. One registry, one lookup. When an agent checks "what not to do," it also sees "what to do instead" in the same entry.

**Files:** `specs_planning/agent-mistakes.md`, `specs_planning/agent-learnings.md` (delete), `scripts/task-context-builder.ts` (update to read merged format)

### Fix 4: Flatten Meta-Protocols into One Session Workflow

Replace R23+R24+R25+R26+R27+R29+R30 with ONE "Session Protocol" section (~30 lines):
- **Start:** Load context + learnings (2 steps)
- **Work:** Do the task
- **On failure:** Check learnings for this pattern → retry (1 step)
- **End:** Log activity + sync if rules changed (2 steps)

**Files:** `docs/read_only_docs/AGENT_SHARED_RULES.md`

### Fix 5: Deduplicate Agent Files

Stop copying shared rules into every agent file. Each agent file references AGENT_SHARED_RULES.md + contains ONLY agent-specific rules. Each file drops 40-60 lines. Total context per agent drops from 700-800 lines → ~350-400.

**Files:** all `.github/agents/*.agent.md`, `.github/copilot-instructions.md`

### Fix 6: Resolve Contradictions

- Self-audit timing: end of work, before final response (one place)
- Context load order: 1. load context, 2. log start, 3. work
- Phase A: unlimited retries, minimum 10/14 checklist
- GEN-018/025: omit ALL placeholder tests, no exceptions

**Files:** `docs/read_only_docs/AGENT_SHARED_RULES.md`

### Fix 7: Fix injectedContext — Per-Item Differentiation

Stop generating 8 identical empty objects. The context builder should:
- Populate `mistakeIds` per item (not empty array pointing to shared)
- Set correct `moduleContextRef` per item (not copy-paste "Setup Module" for everything)
- Normalize `selectorKeys` to one format (array, not mixed array/string)
- Include top 3-5 relevant learnings per item based on module, not empty array
- Remove pointer strings (`"-> see sharedAgentContext"`) — inline the actual data or don't include the field

**Files:** `scripts/task-context-builder.ts`, `specs_planning/agent-queue.json`

### Fix 8: Make Audit Enforcement Restrictive

Add a `blocked` flag to queue schema that prevents stage transitions:
- When Audit blocks: set `blocked: true`, `blockedBy: "audit"`, `blockedReason: "..."` on queue item
- `generator-pre-run.ts`: add check — if `blocked: true`, EXIT with error (hard gate)
- `validate-queue-integrity.ts`: flag items at `pending_generation+` with `blocked: true` as invalid
- After fix: agent must run `planner-post-complete` again (which re-validates) to clear the block
- Audit re-verification: add `auditCleared: true` field that only Audit agent can set after re-checking

**Files:** `specs_planning/agent-queue.schema.json`, `scripts/generator-pre-run.ts`, `scripts/validate-queue-integrity.ts`, `.github/agents/playwright-pipeline-audit.agent.md`

### Fix 9: Revive Performance Tracking

Wire `agent-metrics.ts` into the pipeline so it runs automatically:
- Add `npm run metrics:agents` call to `generator-post-complete.ts` and `planner-post-complete.ts` (post-validation, before success message)
- Actually increment `totalRuns` when agents complete sessions
- Actually update `learningsLogged` when learnings are written
- Fix Healer stale data (totalRuns: 1 when activity log shows completion)
- Implement `addCycleEntry()` calls — currently dead code
- Generate `specs_planning/agent-metrics-report.md` on every pipeline:validate run
- Add cleanCycle progression: when agent completes with 0 audit findings → increment cleanCycles → check trust promotion threshold

**Files:** `scripts/agent-metrics.ts`, `scripts/generator-post-complete.ts`, `scripts/planner-post-complete.ts`, `specs_planning/agent-performance.json`

### Fix 10: Fix Fixme Registry

- Add module prefix to tcId: `TC-LOC-LI-037` not `TC-037`
- Add lifecycle fields: `createdAt`, `resolvedAt`, `resolvedBy`, `status: open|resolved|wontfix`
- Add cross-links: `relatedMistakeId`, `relatedLearningId`, `queueItemId`
- Wire into generator-pre-run: warn if fixme count > threshold before generating
- Track resolution rate in agent-metrics report

**Files:** `scripts/scan-fixmes.ts`, `reports/fixme-registry.json`, `scripts/generator-pre-run.ts`

### Fix 11: Add Velocity Tracking

- Create burndown tracking: specs completed / specs remaining per module
- Track throughput: time from pending_generation → completed per queue item
- Add to metrics report: "N specs completed in last 7 days, average cycle time: X hours"
- Alert: if no spec completed in 3+ days, flag in pipeline:validate output
- Source data from queue history timestamps (already tracked)

**Files:** `scripts/agent-metrics.ts`, `specs_planning/agent-queue.json` (add completedAt timestamps where missing)

### Fix 12: Add Outcome Tracking to Context Builder

Track which rules/learnings were injected for each task and whether the task succeeded. Feed this back into priority weighting. Replace hardcoded AGENT_CATEGORY_PRIORITY with outcome-weighted priorities.

**Files:** `scripts/task-context-builder.ts`, `specs_planning/agent-queue.json` (add outcome fields)

### Fix 13: Audit Agent Independence (future)

Use a different model for audit OR implement 2-of-3 consensus (two agents must agree on findings). This is a bigger architectural change — flag for future sprint.

---

## VERIFICATION

**After Fixes 1-6 (rule system overhaul):**
- `npm run validate:sync` — confirm no drift
- `npm run pipeline:validate` — confirm all gates pass
- Count rules: must be <80 total (from 204)
- Count governance lines: must be <400 (from ~890)
- Context window usage: governance must be <10% (from 15-20%)

**After Fix 7 (injectedContext):**
- Run `npm run build:context` — verify per-item injectedContext has non-empty arrays
- Verify moduleContextRef differs per queue item (not all "Setup Module")
- Verify selectorKeys are consistent format (all arrays)

**After Fix 8 (pipeline enforcement):**
- Manually set `blocked: true` on a test queue item → run generator-pre-run → must EXIT with error
- Verify validate-queue-integrity flags blocked items at pending_generation+

**After Fix 9 (performance tracking):**
- Run one agent session → verify performance.json updates automatically
- Verify totalRuns increments, learningsLogged updates, cycleLog has entry

**After Fix 10 (fixme registry):**
- Run scan-fixmes on location-local-information.spec.ts → verify TC IDs have module prefix
- Verify lifecycle fields present (createdAt, status)

**After Fix 11 (velocity tracking):**
- Run metrics:agents → verify specs_planning/agent-metrics-report.md is generated
- Verify burndown data present

**End-to-end validation:**
- Run one Generator session with reduced rules — compare output quality vs previous runs
- Measure: did fewer rules + better context produce equal or better results?

---

## SUMMARY TABLE

| # | System | Verdict | Root Cause | Fix |
|---|--------|---------|------------|-----|
| — | Framework core (43 modules) | **WORKS** | — | None |
| — | Queue system (stage tracking) | **WORKS** | — | None |
| — | Pipeline scripts (9 validators) | **WORKS** | — | None |
| — | Rule sync (sync-agent-mistakes) | **WORKS** | — | None |
| — | Selectors (TS-only + collision detect) | **WORKS** | — | None |
| — | Test fixtures (SSO + diagnostics) | **WORKS** | — | None |
| — | Diagnostics & reporting | **WORKS** | — | None |
| — | Data adapters (Excel/JSON/DB/S3) | **WORKS** | — | None |
| 1 | **Rule system (204 rules)** | **BROKEN** | Bloat, duplication, negative framing, reactive accumulation. 73 PLN rules, 47 GEN rules. | Fix 1 |
| 2 | **Self-audit protocol (R23)** | **BROKEN** | LLMs can't self-audit; L1:0 reported while audit finds 12-17 criticals. Theater. | Fix 2 |
| 3 | **Learning system** | **BROKEN** | Two registries nobody connects. LRN-014 re-documents GEN-037. No prevention. | Fix 3 |
| 4 | **Meta-protocols (R23-R30)** | **BROKEN** | 6 nested protocols, 15-20% context tax. Agents skip and report compliance. | Fix 4 |
| 5 | **Agent file duplication** | **BROKEN** | Same 8 rules copied 3-5x across files. 40% duplication. | Fix 5 |
| 6 | **Rule contradictions** | **BROKEN** | 5+ direct contradictions (self-audit timing, GEN-018/025, Phase A caps). | Fix 6 |
| 7 | **injectedContext** | **BROKEN** | 8 identical empty objects. All arrays empty. moduleContextRef wrong. Zero per-item value. | Fix 7 |
| 8 | **Pipeline enforcement** | **BROKEN** | Audit blocks are advisory. No stage lock. Planner proceeded despite block. Flag-and-forget. | Fix 8 |
| 9 | **Performance tracking** | **DEAD** | Frozen 7+ days. All agents at probation/0. Healer stale. Learning yield 0. cycleLog empty. | Fix 9 |
| 10 | **Fixme registry** | **BROKEN** | Single-file, no lifecycle, ambiguous IDs, vague reasons, no cross-links. | Fix 10 |
| 11 | **Velocity tracking** | **NON-EXISTENT** | Metrics script exists but never runs. No output. No burndown. 2 specs in 11 days. | Fix 11 |
| 12 | **Context builder feedback** | **PARTIAL** | Hardcoded priorities, no outcome tracking, no personalization. | Fix 12 |
| 13 | **Audit independence** | **BROKEN** | Same model, shared blindspots, evaluator=gatekeeper. | Fix 13 (future) |

**Score: 8 WORKS, 10 BROKEN/DEAD, 1 FUTURE. The framework executes. The governance doesn't.**
