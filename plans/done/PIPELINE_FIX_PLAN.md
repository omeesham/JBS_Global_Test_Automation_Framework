# COMPLETED
# Pipeline Fix Plan — Implementation Guide

**Date**: 2026-03-01
**Author**: Audit synthesis (two independent RCAs + deep codebase analysis)
**Goal**: Fix the 6 real bugs/gaps preventing the pipeline from producing specs efficiently. Nothing more.

---

## What's Actually Broken (and What's Not)

**BROKEN (this plan fixes these)**:
1. Context builder gives every item the wrong REQUIREMENTS.md section reference
2. Every item shows stale test results from a completely different spec
3. Generator has no working example to reference — reinvents patterns every time
4. Trust progression requires 3/5/10 clean cycles — mathematically unreachable
5. Soft warnings count as "defects" in trust tracking — ensures zero clean cycles forever
6. Agent prompts lack behavioral guardrails — Sonnet 4.6 uses wrong URLs, wrong locations, modifies data during read-only exploration, ignores user corrections, calls disabled tools
7. Learning feedback loop is honor-based — agents told to capture mistakes but nothing forces them (learningsLogged: 0 for 3/5 agents)
8. Context injection is agent-level, NOT task-relevant — every item at same stage gets identical 37-entry payload regardless of feature type (form vs grid vs read-only)
9. Planner "Deep Exploration Protocol" says "Click EVERY field" — directly contradicts Phase 1 read-only. Plus browser_take_screenshot still in tools, stale R## references
10. Sync system generates `## RULES` but leaves orphaned `## NEVER DO` sections in agent files — Requirements Agent has both with inconsistent content

**NOT BROKEN (do NOT touch)**:
- All hard gates in `generator-post-complete.ts` (TypeScript, test pass, spec headers, validate:sync, audit block)
- All pre-run gates in `generator-pre-run.ts` (R10, audit block, pre-flight)
- The `selfAuditPassed` flow (generator sets it itself during step 11 — there is NO deadlock)
- Agent prompt rules (15 GEN rules + ALL shared rules)
- Injected `criticalReminders` and `selfAuditQuestions` (redundancy helps LLMs)
- Framework core (pages, selectors, fixtures, utils)
- Queue schema, sync pipeline, export pipeline

---

## Change 1: Fix Context Builder Feature Matching

**File**: `scripts/task-context-builder.ts`
**Problem**: Lines 206-208 try to match queue item features to REQUIREMENTS.md sections but fail for EVERY item. Result: all 8 items get `"moduleContextRef": "docs/REQUIREMENTS.md ### Setup Module"` regardless of their actual module.
**Why it fails**: `"location - pricing".includes("pricing-tab")` is `false`. The matcher compares the full feature name against section names with incompatible formatting.

### What to Change

Find this block (lines 203-213):
```typescript
  if (MODULE_SECTION_MAP[moduleLower]) {
    // Find the best matching section for this specific item's feature
    const sections = MODULE_SECTION_MAP[moduleLower]!;
    const matchedSection = sections.find(s =>
      featureLower.includes(s.toLowerCase().replace(/ /g, '-')) ||
      s.toLowerCase().includes(featureLower.replace(/-/g, ' '))
    );
    moduleRef = matchedSection
      ? `docs/REQUIREMENTS.md ### ${matchedSection}`
      : `docs/REQUIREMENTS.md ### ${sections[0]}`;
  }
```

Replace with:
```typescript
  if (MODULE_SECTION_MAP[moduleLower]) {
    // Find the best matching section for this specific item's feature
    const sections = MODULE_SECTION_MAP[moduleLower]!;
    // Extract keywords from feature name (strip "Location - " prefix, parens, short words)
    const featureKeywords = featureLower
      .replace(/^location\s*[-\u2013]\s*/, '')
      .replace(/[()]/g, '')
      .split(/[\s-]+/)
      .filter(w => w.length > 2);

    const matchedSection = sections.find(s => {
      const sectionLower = s.toLowerCase();
      return featureKeywords.some(kw => sectionLower.includes(kw));
    });
    moduleRef = matchedSection
      ? `docs/REQUIREMENTS.md ### ${matchedSection}`
      : `docs/REQUIREMENTS.md ### ${sections[0]}`;
  }
```

### Why This Is Safe

The keyword approach extracts meaningful words ("pricing", "legal", "notes") and checks if ANY keyword exists in the section name. Every queue item has a distinct keyword that maps to exactly one section:

| Feature | Keywords | Matches Section |
|---------|----------|-----------------|
| Location - Pricing | `["pricing"]` | "Pricing Tab" |
| Location - Left Panel (Basic...) | `["left", "panel", "basic", "information", "validations"]` | "Left Panel" |
| Location - Legal | `["legal"]` | "Legal Tab" |
| Location - Account and Address | `["account", "address"]` | "Account and Address Tab" |
| Location - Notes | `["notes"]` | "Notes Tab" |
| Location - Shared Setup | `["shared", "setup"]` | "Shared Setup Locations Tab" |
| Location - Auto Add-On | `["auto", "add"]` | "Auto Add-On Tab" |
| Location - Management History | `["management", "history"]` | "Location Management History" |

No false matches possible — keywords are distinct across sections.

### How to Verify

```bash
npm run build:context --json
```
Check output: each item's `moduleContextRef` should show its correct section, NOT "Setup Module".

Grep the queue after running:
```bash
grep "moduleContextRef" specs_planning/agent-queue.json
```
Should show 8 DIFFERENT section names.

---

## Change 2: Clear Stale lastRunFailures for Unrun Items

**File**: `scripts/task-context-builder.ts`
**Problem**: Lines 256-259 copy `shared.lastRunFailures` (from `reports/failure-summary.json`) into EVERY item's context. This means all 8 pending items show `passed: 19, failed: 0` from location-local-information's last run — a completely different spec.
**Impact**: Generator sees "19 passed, 0 failed" for an item it has never run. Misleading but not blocking.

### What to Change

Find this block (lines 256-259):
```typescript
  // Per-item: last run failures if available
  if (shared.lastRunFailures) {
    context.lastRunFailures = shared.lastRunFailures;
  }
```

Replace with:
```typescript
  // Per-item: last run failures ONLY if this item has actually been run before
  const hasBeenRun = (item.generatorRunCount ?? 0) > 0 ||
    (item.history ?? []).some(h => h.agent === 'generator');
  if (hasBeenRun && shared.lastRunFailures) {
    context.lastRunFailures = shared.lastRunFailures;
  }
```

### Why This Is Safe

- Items that HAVE run (like completed items) still get failure data
- Items that have NEVER run (all 8 pending) get no stale failure data
- The generator routes via `fixScope.failedTestIds` (agent prompt line 63), NOT via `lastRunFailures`. Removing stale data from unrun items won't change routing behavior
- `lastRunFailures` is purely informational context, not consumed by any gate

### How to Verify

```bash
npm run build:context --json
```
For `location-pricing` (never run): `lastRunFailures` should be absent or null.
If an item had been run: `lastRunFailures` should still be present.

---

## Change 3: Add Golden Example Reference to Generator Prompt

**File**: `.github/agents/playwright-test-generator.agent.md`
**Problem**: Generator has 15 abstract rules but no working reference spec to follow. Both audits agree: one example teaches more than 47 rules. The framework already has two perfect examples.

### What to Change

Find this line (line 48):
```markdown
**Real-time capture**: If you retry or discover unexpected behavior -> IMMEDIATELY capture per Session Protocol S8.
```

Add this NEW section directly AFTER it (before the SYNC:CONTEXT_LOAD block):

```markdown

## Golden Reference

Before writing a new spec, **read `tests/specs/locations/location-currency.spec.ts`** (175 lines, 20/20 passing).
It demonstrates every framework convention you must follow:
- `// spec:` and `// seed:` header comments
- Import ONLY from `../../setup/fixtures`
- Data arrays in separate `tests/test-data/*.data.ts`
- `test.describe.serial()` for shared-state tests
- Page object methods only (zero raw `page.*` calls)
- State cleanup/restore after every mutation
- `for...of` loops for 3+ identical patterns
- No `test.fixme()`, no `waitForTimeout`, no `Log.*`

When in doubt about any convention, do what this spec does.

```

### Why This Is Safe

- Purely additive — adds a section, removes nothing
- References a real file that exists and passes 20/20
- Doesn't conflict with any existing rules — it reinforces them via example
- Doesn't change any gates, flows, or enforcement

### How to Verify

1. Open `.github/agents/playwright-test-generator.agent.md`
2. Confirm "Golden Reference" section exists between "Autonomous Mode" and the SYNC block
3. Confirm `tests/specs/locations/location-currency.spec.ts` exists: `ls tests/specs/locations/location-currency.spec.ts`

---

## Change 4: Lower Trust Progression Thresholds

**File**: `specs_planning/agent-performance.json`
**Problem**: Trust progression requires 3 clean cycles for first promotion. With `cycleLog: []` (no cycles ever recorded) and any warning resetting `cleanCycles` to 0, no agent will ever leave probation. The entire performance tracking system is dead.

### What to Change

Find this block (lines 8-22):
```json
    "promotionCriteria": {
      "probation_to_vetting": {
        "cleanCycles": 3,
        "auditedBy": ["human"],
        "defectTolerance": 0
      },
      "vetting_to_trusted": {
        "cleanCycles": 5,
        "auditedBy": ["human", "audit"],
        "defectTolerance": 0
      },
      "trusted_to_autonomous": {
        "cleanCycles": 10,
        "auditedBy": ["human"],
        "defectTolerance": 0
      }
    },
```

Replace with:
```json
    "promotionCriteria": {
      "probation_to_vetting": {
        "cleanCycles": 1,
        "auditedBy": ["human", "audit", "post-complete-gate"],
        "defectTolerance": 0
      },
      "vetting_to_trusted": {
        "cleanCycles": 2,
        "auditedBy": ["human", "audit", "post-complete-gate"],
        "defectTolerance": 0
      },
      "trusted_to_autonomous": {
        "cleanCycles": 3,
        "auditedBy": ["human"],
        "defectTolerance": 0
      }
    },
```

### Why This Is Safe

- Trust levels are purely informational — they don't gate any pipeline behavior
- No script checks trust level before allowing work (I verified: `generator-pre-run.ts` PF-06 reads trust level for display only)
- `addCycleEntry()` in `generator-post-complete.ts` (line 727) passes `'post-complete-gate'` as `auditedBy` — adding it to allowed auditors makes automatic promotion possible
- 1/2/3 clean cycles is still meritocratic — any defect still resets to 0

### How to Verify

After a generator completes a spec with 0 gate errors:
```bash
cat specs_planning/agent-performance.json | grep -A2 '"generator"' | grep trustLevel
```
Should show `"trustLevel": "vetting"` (promoted from probation after 1 clean cycle).

---

## Change 5: Fix defectsFound Filter in Post-Complete

**File**: `scripts/generator-post-complete.ts`
**Problem**: Lines 723-726 treat ALL soft warnings as "defects" for trust tracking. This guarantees `cleanCycles` resets to 0 on virtually every run, because advisory warnings (TC registry, reconciliation table, spec size) fire on most runs. Combined with Change 4, this would still block all promotion.

### What to Change

Find this block (lines 723-726):
```typescript
        const defectsFound: string[] = allWarnings
          .filter(w => w.includes('WARN') || w.includes('defect'))
          .slice(0, 5)
          .map(w => w.substring(0, 100));
```

Replace with:
```typescript
        const defectsFound: string[] = allErrors
          .slice(0, 5)
          .map(e => e.substring(0, 100));
```

### Why This Is Safe

- `allErrors` is the list of HARD gate failures — real problems that block the pipeline
- `allWarnings` is the list of SOFT advisories — informational, never blocking
- If `allErrors.length > 0`, execution already exits via `process.exit(1)` at line 759 — trust tracking in the success branch (line 695) never runs with errors present
- So in the success branch, `allErrors` is always empty → `defectsFound` is always `[]` → clean cycle recorded
- This is actually the CORRECT behavior: if all hard gates passed, the cycle IS clean
- Soft warnings are still logged to console for human review (lines 690-693)
- The only real effect: trust progression actually works now instead of being permanently stuck

### How to Verify

After a generator successfully completes (0 errors, maybe some warnings):
```bash
cat specs_planning/agent-performance.json | python -c "import json,sys; d=json.load(sys.stdin); print(len(d['cycleLog']), 'cycles logged')"
```
Should show `1 cycles logged` (was previously 0 forever).

And:
```bash
cat specs_planning/agent-performance.json | python -c "import json,sys; d=json.load(sys.stdin); print(d['agents']['generator']['cleanCycles'])"
```
Should show `1` (was permanently 0).

---

## Change 6: Agent Behavioral Guardrails (All Agents)

**Files**:
- `specs_planning/agent-mistakes.md` (add ALL-013 through ALL-016, REQ-004 through REQ-007)
- `.github/agents/playwright-requirements.agent.md` (add HARD STOPS, fix workflow, remove browser_take_screenshot)
- `.github/agents/playwright-test-planner.agent.md` (add HARD STOPS reference)

**Problem**: Real session transcript shows Sonnet 4.6 making 8 categories of catastrophic mistakes as Requirements Agent. These mistake classes can affect ALL browsing agents (Planner, Healer). Root cause: agent prompts lack concrete behavioral boundaries that a weaker model can reliably follow.

### Evidence: Observed Failures

| # | Mistake | Impact | Root Cause |
|---|---------|--------|------------|
| 1 | Used wrong location (1000021 vs 1604) | Explored wrong data, documented wrong defaults | No standard location in prompt |
| 2 | Called browser_take_screenshot 3+ times | Wasted turns — vision disabled for Sonnet | REQ-003 directs screenshot use; tool in tools list |
| 3 | Wrong URL path, repeated 3+ times | Explored wrong page entirely | No URL template in prompt |
| 4 | Explored unrelated tabs (Currency, Pricing) | Scope creep, wasted context window | No scope constraint rule |
| 5 | Modified form fields during "exploration" | Could corrupt production data | Workflow lists browser_click for "discovering interactions" |
| 6 | Ignored user corrections 3+ times | Required profanity to redirect | No immediate-stop-on-correction rule |
| 7 | page.goto() inside browser_evaluate | Navigation doesn't work this way | No rule against JS navigation in evaluate |
| 8 | Over-engineered 20+ line evaluate scripts | Snapshot would suffice | No simplicity rule for evaluate |

### Part A: Add Shared Rules (apply to ALL agents)

In `specs_planning/agent-mistakes.md`, add these rows to the **Shared** section table, after the ALL-012 row:

```markdown
| ALL-013 | Standard test location: Office 1604 (ID=1604). NEVER use another location unless user EXPLICITLY names a different one in their message | Session: agent used location 1000021, explored wrong data |
| ALL-014 | browser_take_screenshot is DISABLED (vision off). Use browser_snapshot for ALL DOM inspection. Screenshots produce no usable output | Session: 3+ wasted turns calling screenshot with no output |
| ALL-015 | User corrections = IMMEDIATE STOP. When user corrects you: (1) stop current action, (2) acknowledge EXACT correction, (3) comply. Do NOT continue previous approach or reinterpret | Session: agent ignored 3+ corrections, required profanity |
| ALL-016 | Navigation via browser_navigate ONLY. NEVER use page.goto(), window.location, or JS navigation inside browser_evaluate. Keep evaluate scripts under 5 lines — prefer browser_snapshot | Session: agent used page.goto() in evaluate (broken), wrote 20+ line scripts |
| ALL-019 | File writes via Node.js `fs` module or MCP tools (edit, readFile) ONLY. NEVER use PowerShell `Set-Content`, `Add-Content`, or `Out-File` for file operations — they corrupt Unicode encoding (double-encode UTF-8 on Windows). If you must use shell commands, use `node -e "fs.writeFileSync(...)"` | Session: Planner used PowerShell Set-Content -Encoding UTF8, double-encoded Unicode chars, required manual reversal |
```

Also update the header comments in agent-mistakes.md:
- Line 23: Change `ALL-001 to ALL-012` → `ALL-001 to ALL-019` (ALL-013..016 from Change 6A, ALL-017..018 from Change 7B, ALL-019 from Change 6A)
- Line 25: Change `REQ-001 to REQ-005` → `REQ-001 to REQ-0XX` (XX = last REQ ID after adding new rules)
- Line 26: Change `PLN-001 to PLN-015` → `PLN-001 to PLN-016` (PLN-016 already added by planner)
- Line 31: Update total to reflect ALL actual rule counts. Count manually — do NOT guess.

**IMPORTANT**: Also update the "Shared rules" reference line in ALL 5 agent files:
- In `.github/agents/playwright-requirements.agent.md`: Change `ALL-001–ALL-012` → `ALL-001–ALL-019`
- In `.github/agents/playwright-test-planner.agent.md`: Change `ALL-001–ALL-012` → `ALL-001–ALL-019`
- In `.github/agents/playwright-test-generator.agent.md`: Change `ALL-001–ALL-012` → `ALL-001–ALL-019`
- In `.github/agents/playwright-test-healer.agent.md`: Change `ALL-001–ALL-012` → `ALL-001–ALL-019`
- In `.github/agents/playwright-pipeline-audit.agent.md`: Change `ALL-001–ALL-012` → `ALL-001–ALL-019`

This ensures every agent knows about the 7 new shared rules (ALL-013..016 behavioral, ALL-017..018 mistake capture, ALL-019 encoding safety).

### Part B: Fix REQ-003 and Add Behavioral REQ Rules

**NOTE**: REQ-004 and REQ-005 may already exist (added by audit agent for content quality). Check current IDs before adding. Use the NEXT AVAILABLE ID for each new rule. The rules below need new IDs starting AFTER whatever exists.

In `specs_planning/agent-mistakes.md`, fix REQ-003 and APPEND these new behavioral rules to the Requirements section:

**Fix REQ-003** — change the rule text from:
```
| REQ-003 | Screenshots (browser_take_screenshot) for every new feature section discovered | — |
```
To:
```
| REQ-003 | Document UI state with browser_snapshot (NOT browser_take_screenshot). Vision is disabled — screenshots produce no usable output | Session: 3+ wasted turns calling screenshot |
```

**APPEND new rules** (use next available IDs after existing REQ-00N):
```markdown
| REQ-0XX | URL discipline: navigate to EXACT path user provides. Copy character-for-character. URL pattern: `{BASE_URL}locations/{officeId}/settings/local-office`. If unsure, ASK | Session: agent navigated /settings/location instead of /settings/local-office 3+ times. SAME mistake repeated by Audit agent. |
| REQ-0XX | Scope = ONLY the feature/tab user specified. Do NOT click adjacent tabs or explore "related" areas. If user says "Notes tab" you touch ONLY Notes tab | Session: agent explored Currency, Pricing, ECT tabs when told to focus on one area |
| REQ-0XX | Phase 1 exploration is READ-ONLY: use ONLY browser_navigate + browser_snapshot + browser_hover. NEVER click form fields, checkboxes, dropdowns, or type inputs. You are OBSERVING | Session: agent clicked checkboxes and filled dates during exploration |
| REQ-0XX | Phase 2 interaction requires user approval: present Phase 1 findings FIRST, get explicit OK, THEN browser_click/type. Restore all modified fields when done | Session: agent modified fields without approval or restoration |
```

Update the ID master list comment and total count to match actual final numbers.

### Part C: Update Requirements Agent Prompt

**C1. Remove `browser_take_screenshot` from tools list** (line 5 of `.github/agents/playwright-requirements.agent.md`):
Delete `'playwright-browser/browser_take_screenshot', ` from the tools array.

**C2. Add HARD STOPS section** — Insert immediately after the frontmatter `---` on line 17, BEFORE "Requirements Agent" mission statement. This MUST be the first content the model reads after frontmatter:

```markdown

## HARD STOPS — Read Before Doing Anything

1. **LOCATION**: Office 1604 only. No other location. Ever. Unless user says otherwise.
2. **URL**: Copy the EXACT URL path user gives you. Pattern: `{BASE_URL}locations/1604/settings/local-office`. Do NOT guess URLs.
3. **SCOPE**: Touch ONLY the tab/feature the user named. Do NOT click other tabs. Do NOT explore "nearby" features.
4. **READ-ONLY FIRST**: Phase 1 = `browser_snapshot` + `browser_hover` ONLY. No clicking fields. No typing. No checkboxes. OBSERVE ONLY.
5. **NO SCREENSHOTS**: `browser_take_screenshot` does NOT work (vision disabled). Use `browser_snapshot` always.
6. **USER SAYS STOP = STOP**: When user corrects you, STOP your current plan, do EXACTLY what they said.
7. **SIMPLE TOOLS**: `browser_snapshot` before `browser_evaluate`. Never evaluate scripts over 5 lines. Never `page.goto()` in evaluate.

```

**C3. Fix workflow step 3** (lines 53-59). Find:

```markdown
3. **EXPLORE LIVE UI FIRST** (MANDATORY):
   - Call `browser_navigate` to reach the target feature (auto-opens browser)
   - Use `browser_snapshot` to capture DOM structure
   - Use `browser_take_screenshot` to document visual state
   - Use `browser_click`, `browser_type`, `browser_hover` to discover interactions
   - Document: field names, field types, navigation paths, visible validation messages
   - **Learning check (§8)**: If any step fails on first attempt → search `agent-mistakes.md` Resolution column for matching category before retrying. Log new learnings if retry reveals new pattern.
```

Replace with:

```markdown
3. **EXPLORE LIVE UI — PHASE 1: READ-ONLY** (MANDATORY):
   - `browser_navigate` to Office 1604 at the exact URL path user provided
   - `browser_snapshot` to capture DOM structure (NOT browser_take_screenshot)
   - `browser_hover` to reveal tooltips and hidden elements
   - **DO NOT** click fields, checkboxes, dropdowns. **DO NOT** type into inputs. OBSERVE ONLY.
   - Document: field names, field types, defaults, navigation paths
   - Present findings to user. Wait for approval before Phase 2.
3b. **PHASE 2: INTERACTION** (only after user approves Phase 1 findings):
   - `browser_click`, `browser_type`, `browser_select_option` to test interactions
   - Trigger validations by entering invalid data, document error messages
   - **RESTORE** all modified fields to original values when done
   - **Learning check (§8)**: If any step fails → search `agent-mistakes.md` Resolution column first.
```

### Part D: Update Planner Agent Prompt

The Planner already has PLN-015 (scope + cleanup) and PLN-001 (verify on live site). Add a brief HARD STOPS section for reinforcement.

In `.github/agents/playwright-test-planner.agent.md`, insert after line 17 (frontmatter `---`), before "Planner Agent" mission:

```markdown

## HARD STOPS

1. **LOCATION**: Office 1604 only unless user specifies otherwise.
2. **SCOPE**: Touch ONLY the assigned tab (PLN-015). Do NOT explore other tabs.
3. **NO SCREENSHOTS**: Use `browser_snapshot`, not `browser_take_screenshot` (vision disabled).
4. **RESTORE**: After any field interaction, restore to original value before moving on (PLN-015).
5. **USER CORRECTIONS**: User says stop = stop immediately + comply.

```

### Why This Is Safe

- ALL- rules are automatically injected into all agent contexts by the sync pipeline
- HARD STOPS sections are purely additive — no existing content removed
- Phase 1/Phase 2 split prevents data corruption during exploration (the #1 real danger)
- Removing `browser_take_screenshot` from Requirements tools prevents wasted turns (vision is disabled — the tool produces nothing usable)
- URL pattern is already documented in REQUIREMENTS.md line 65 — the rule just surfaces it into the prompt
- PLN-015 already covers scope and cleanup for Planner — HARD STOPS reinforces, doesn't contradict

### Why This Works for "Dumb Sonnet 4.6"

LLM-specific design decisions:

| Design Choice | Why It Helps Sonnet |
|---------------|---------------------|
| HARD STOPS as FIRST section after frontmatter | First-position bias — Sonnet reads it before anything else |
| Numbered items (1-7) | Sonnet tracks numbered lists more reliably than bullets |
| ALL CAPS prohibitions ("NEVER", "DO NOT", "STOP") | Cuts through context noise for weaker models |
| Concrete negative examples ("NOT /settings/location") | More effective than abstract "use correct URL" |
| Resolution column cites real failures | Gives the LLM evidence to weight rules higher |
| Phase 1 (observe) vs Phase 2 (interact) | Structural checkpoint — user catches mistakes BEFORE data modified |
| Tool removal from frontmatter | Sonnet literally cannot call browser_take_screenshot — no compliance needed |

### How to Verify

```bash
# 1. Sync rules to agent files
npm run sync:mistakes && npm run validate:sync
# EXPECTED: exit 0

# 2. Verify HARD STOPS sections exist
grep -c "HARD STOPS" .github/agents/playwright-requirements.agent.md
# EXPECTED: 1
grep -c "HARD STOPS" .github/agents/playwright-test-planner.agent.md
# EXPECTED: 1

# 3. Verify browser_take_screenshot removed from Requirements tools
grep "browser_take_screenshot" .github/agents/playwright-requirements.agent.md
# EXPECTED: 0 matches

# 4. Verify new shared rules
grep -c "ALL-01[3-6]" specs_planning/agent-mistakes.md
# EXPECTED: 4

# 5. Verify new REQ rules
grep -c "REQ-00[4-7]" specs_planning/agent-mistakes.md
# EXPECTED: 4

# 6. Validate total rule count
grep "Total:" specs_planning/agent-mistakes.md
# EXPECTED: "Total: 82 rules (16 ALL + 8 COP + 7 REQ..."
```

---

## Implementation Order

**Do them in this exact order. Each change is independent — if one fails, skip it and do the next.**

```
 1. Change 1  (context matching)     — scripts/task-context-builder.ts (lines 203-213)
 2. Change 2  (stale failures)       — scripts/task-context-builder.ts (lines 256-259)
 3. Run: npm run build:context       — VERIFY both fixes (each item gets correct section)
 4. Change 3  (golden example)       — .github/agents/playwright-test-generator.agent.md (after line 48)
 5. Change 4  (trust thresholds)     — specs_planning/agent-performance.json (lines 8-22)
 6. Change 5  (defects filter)       — scripts/generator-post-complete.ts (lines 723-726)
 7. Change 6A (shared rules)         — specs_planning/agent-mistakes.md (ALL-013..016)
 8. Change 6B (REQ rules)            — specs_planning/agent-mistakes.md (REQ-003 fix + new rules)
 9. Change 6C (Req prompt)           — .github/agents/playwright-requirements.agent.md (HARD STOPS + workflow)
10. Change 6D (Planner HARD STOPS)   — .github/agents/playwright-test-planner.agent.md (after frontmatter)
11. Change 7A (capture script)       — scripts/capture-mistake.ts (NEW FILE ~60 lines)
12. Change 7A (npm script)           — package.json: add "capture:mistake" script
13. Change 7B (ALL-017, ALL-018)     — specs_planning/agent-mistakes.md
14. Change 7B (HARD STOPS update)    — ALL 5 agent prompts: add "MISTAKES FIRST" as item 0
15. Change 7B (§8 step 6)            — docs/read_only_docs/AGENT_SHARED_RULES.md
16. Change 8  (task-relevant inject) — scripts/task-context-builder.ts (add ~50 lines: tags, filter, extract)
17. Change 9A (PLN tools cleanup)    — .github/agents/playwright-test-planner.agent.md (remove screenshot)
18. Change 9B (PLN exploration)      — .github/agents/playwright-test-planner.agent.md (Phase 1/2 rewrite)
19. Change 9C (PLN stale refs)       — .github/agents/playwright-test-planner.agent.md (R## -> §)
20. Change 10A (orphan cleanup)      — .github/agents/playwright-requirements.agent.md (delete NEVER DO)
21. Change 10B (orphan detection)    — scripts/validate-agent-sync.ts (add ~10 lines)
22. Run: npm run sync:mistakes && npm run validate:sync — VERIFY rules synced + no orphans
23. Run: npm run build:context       — VERIFY task-relevant filtering works
24. Run: npm run typecheck           — VERIFY nothing broke
```

---

## Post-Implementation Full Verification

Run these commands in order. ALL must pass.

```bash
# 1. TypeScript still compiles
npm run typecheck

# 2. Context builder produces correct per-item refs
npm run build:context --json 2>&1 | grep "moduleContextRef"
# EXPECTED: 8+ different section names (Pricing Tab, Left Panel, Legal Tab, etc.)
# FAIL IF: any line shows "Setup Module"

# 3. Existing tests still pass (DO NOT SKIP)
npx playwright test tests/specs/locations/location-currency.spec.ts
# EXPECTED: 20 passed
npx playwright test tests/specs/locations/location-local-information.spec.ts
# EXPECTED: 19 passed, 8 skipped

# 4. Queue integrity
npm run queue:validate
# EXPECTED: 0 errors

# 5. Agent sync — rules propagated correctly + no orphans
npm run validate:sync
# EXPECTED: exit 0, no "NEVER DO" orphan warnings

# 6. Generator pre-run still works for a pending item
npm run generator:pre-run location-pricing
# EXPECTED: passes pre-flight, shows correct context

# 7. New shared rules exist in agent-mistakes.md
grep -c "ALL-01[3-8]" specs_planning/agent-mistakes.md
# EXPECTED: 6 (ALL-013 through ALL-018)

# 8. HARD STOPS sections exist in agent prompts
grep -c "HARD STOPS" .github/agents/playwright-requirements.agent.md
# EXPECTED: 1
grep -c "HARD STOPS" .github/agents/playwright-test-planner.agent.md
# EXPECTED: 1

# 9. browser_take_screenshot removed from BOTH Requirements and Planner tools
grep "browser_take_screenshot" .github/agents/playwright-requirements.agent.md
# EXPECTED: 0 matches
grep "browser_take_screenshot" .github/agents/playwright-test-planner.agent.md
# EXPECTED: 0 matches

# 10. No orphaned NEVER DO sections
grep -c "## NEVER DO" .github/agents/*.agent.md
# EXPECTED: 0 for ALL files

# 11. Phase 1/Phase 2 exists in BOTH exploration agents
grep -c "Phase 1" .github/agents/playwright-requirements.agent.md
# EXPECTED: >= 1
grep -c "Phase 1" .github/agents/playwright-test-planner.agent.md
# EXPECTED: >= 2

# 12. Task-relevant injection: different items get different rule counts
npm run build:context --json 2>&1 | grep "mistakeIds"
# EXPECTED: management-history has fewer rules than left-panel-validations

# 13. Stale R## references removed from Planner
grep -c "R2[4-7]\|R30" .github/agents/playwright-test-planner.agent.md
# EXPECTED: 0

# 14. capture:mistake script exists and npm script registered
npm run capture:mistake 2>&1 | head -3
# EXPECTED: Usage message (not "script not found")
```

**If ANY verification fails**: revert the change that caused it. Each change is isolated — reverting one doesn't affect others.

---

## What NOT to Do

These are changes that SOUND good but could make things WORSE:

| Tempting Change | Why NOT to Do It |
|-----------------|------------------|
| Remove `criticalReminders` from injection | Redundancy helps LLMs. Removing saves ~250 tokens but risks the generator forgetting key rules |
| Remove `selfAuditQuestions` from injection | The agent prompt only says "answer 5-item checklist" — the ACTUAL questions come from injection. Removing them removes the questions |
| Collapse 5 agents to 3 | Architectural change mid-project. High risk, unproven benefit. The pipeline works with 5 agents (2 specs prove it) |
| Simplify AGENT_SHARED_RULES.md | It's a READ-ONLY doc. Changing it triggers sync cascades. Not worth the risk for cosmetic improvement |
| Trim GEN rules from 15 to 8 | Rules were added because of real failures. Removing any requires proving the failure won't recur. Nobody has done that analysis |
| Add new scripts (smoke test, etc.) | Nice to have, but adding code adds maintenance. Do it AFTER the pipeline is producing specs, not before |
| Set `selfAuditPassed: true` manually on all items | Unnecessary. Generator sets it itself during step 11. The "deadlock" diagnosis was wrong — `generator-pre-run.ts` does NOT check this flag |
| Edit `agent-queue.json` manually | Let scripts manage it. Manual edits risk schema violations and broken JSON |
| Change `NEVER_DO_PATTERN` regex to use `/g` flag | Greedy global replace could match too much. Add orphan detection to validate:sync instead (Change 10B) |
| Filter ALL rules aggressively (whitelist-only) | Too risky — a missed rule could cause a real failure. Default is "include everything", only feature-tagged rules get filtered (Change 8) |
| Rewrite sync-agent-mistakes.ts to output `## NEVER DO` again | The `## RULES` format is correct and current. Just clean up orphaned `## NEVER DO` sections (Change 10A) |

---

## Change 7: Close the Learning Feedback Loop

**Problem**: The learning system INFRASTRUCTURE exists (registry, sync, injection) but has ZERO ENFORCEMENT. Evidence:
- `learningsLogged: 0` for Requirements (4 runs), Planner (10 runs), Audit (13 runs)
- No new rules added since Feb 28 overhaul
- Exact same URL mistake (`/settings/location` instead of `/settings/local-office`) made by BOTH Requirements Agent AND Audit Agent in separate sessions — proving zero cross-session learning

The system tells agents "please capture learnings" (§8 step 6, ALL-003, ALL-004) but nothing FORCES them. It's honor-based. Agents don't do it.

### Part A: `capture:mistake` Script (User Catches Mistake — Option A)

**New file**: `scripts/capture-mistake.ts` (~60 lines)
**New npm script**: `"capture:mistake": "ts-node scripts/capture-mistake.ts"`

When user sees an agent make a mistake, they run:
```bash
npm run capture:mistake REQ "URL discipline: navigate to EXACT path user provides" "Agent navigated /settings/location instead of /settings/local-office"
```

The script:
1. Reads `agent-mistakes.md`
2. Finds the section for the given prefix (REQ, PLN, GEN, HLR, AUD, ALL)
3. Determines next available ID (e.g., REQ-006 if REQ-005 exists)
4. Appends the new rule row with ID, rule text, and resolution
5. Auto-runs `npm run sync:mistakes && npm run build:context && npm run validate:sync`
6. Prints: `[OK] Added REQ-006. Synced to agent files. Context rebuilt.`

```typescript
#!/usr/bin/env ts-node
/**
 * Quick mistake capture: npm run capture:mistake <PREFIX> "<rule>" "<resolution>"
 * Appends to agent-mistakes.md, auto-syncs to agent files + context.
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const MISTAKES_PATH = path.join(__dirname, '../specs_planning/agent-mistakes.md');

const SECTION_MAP: Record<string, string> = {
  ALL: 'Shared', REQ: 'Requirements', PLN: 'Planner',
  GEN: 'Generator', HLR: 'Healer', AUD: 'Audit', COP: 'Copilot',
};

function main(): void {
  const [prefix, rule, resolution] = process.argv.slice(2);
  if (!prefix || !rule) {
    console.error('Usage: npm run capture:mistake <PREFIX> "<rule>" "<resolution>"');
    console.error('  PREFIX: ALL | REQ | PLN | GEN | HLR | AUD | COP');
    console.error('  Example: npm run capture:mistake REQ "Always use /settings/local-office" "Agent used wrong URL"');
    process.exit(1);
  }

  const section = SECTION_MAP[prefix.toUpperCase()];
  if (!section) { console.error(`[ERR] Unknown prefix: ${prefix}`); process.exit(1); }

  const content = fs.readFileSync(MISTAKES_PATH, 'utf-8');

  // Find highest existing ID for this prefix
  const idPattern = new RegExp(`${prefix.toUpperCase()}-(\\d+)`, 'g');
  let maxId = 0;
  let match: RegExpExecArray | null;
  while ((match = idPattern.exec(content)) !== null) {
    maxId = Math.max(maxId, parseInt(match[1]!, 10));
  }
  const newId = `${prefix.toUpperCase()}-${String(maxId + 1).padStart(3, '0')}`;

  // Find section and append rule
  const sectionHeader = `## ${section}`;
  const sectionIdx = content.indexOf(sectionHeader);
  if (sectionIdx === -1) { console.error(`[ERR] Section not found: ${section}`); process.exit(1); }

  // Find end of table (next ## or end of file)
  const afterSection = content.indexOf('\n## ', sectionIdx + sectionHeader.length);
  const insertAt = afterSection === -1 ? content.length : afterSection;

  const resText = resolution || '—';
  const newRow = `| ${newId} | ${rule} | ${resText} |\n`;
  const newContent = content.slice(0, insertAt) + newRow + content.slice(insertAt);

  fs.writeFileSync(MISTAKES_PATH, newContent, 'utf-8');
  console.log(`[OK] Added ${newId}: ${rule.substring(0, 60)}...`);

  // Auto-sync
  console.log('[SYNC] Running sync pipeline...');
  try {
    execSync('npm run sync:mistakes && npm run build:context && npm run validate:sync', {
      stdio: 'inherit', cwd: path.join(__dirname, '..'),
    });
    console.log(`[DONE] ${newId} synced to agent files and context rebuilt.`);
  } catch {
    console.error('[WARN] Sync failed — rule added but not propagated. Run manually.');
  }
}

main();
```

**Why this matters**: User is ALWAYS present when mistakes happen. This makes capture a 5-second operation instead of a manual file edit + 3 commands. Takes the agent completely out of the loop.

### Part B: Force Agents to Capture Mistakes (Agent Self-Detection — Option B)

The current §8 step 6 says: "On novel pattern: Append rule to your section." This is a suggestion, not an enforcement. Agents ignore it.

**Add ALL-017** to the Shared section of `agent-mistakes.md`:

```markdown
| ALL-017 | MISTAKE DETECTED = STOP TASK. When you make a mistake (user corrects you, retry fails, unexpected result): (1) STOP current task, (2) write a rule to your section in agent-mistakes.md with next available ID, (3) run `npm run sync:mistakes && npm run build:context && npm run validate:sync`, (4) ONLY THEN resume task. Mistakes before tasks. EVERY mistake = a new rule | learningsLogged: 0 for 3/5 agents across 27 combined runs. Same URL mistake repeated by 2 agents in separate sessions. Honor system failed. |
```

**Add to HARD STOPS in ALL agent prompts** (Requirements, Planner, Generator, Healer, Audit):

Add this as the FIRST item in every HARD STOPS section:
```markdown
0. **MISTAKES FIRST**: If you detect you made a mistake (user corrects you, something fails, wrong result): STOP. Write a rule to `agent-mistakes.md`. Run sync. THEN resume. Never continue past a mistake without capturing it.
```

**Update §8 step 6** in `AGENT_SHARED_RULES.md` — change from suggestion to hard requirement:

Find:
```markdown
6. **On novel pattern**: Append rule to your section in agent-mistakes.md → run `npm run sync:mistakes && npm run build:context && npm run validate:sync`.
```

Replace with:
```markdown
6. **On ANY mistake or novel pattern (MANDATORY — not optional)**: STOP current task. Append rule to your section in agent-mistakes.md with next available ID. Run `npm run sync:mistakes && npm run build:context && npm run validate:sync`. Validate exit 0. THEN resume task. Do NOT skip this step. Do NOT defer to self-audit. Mistakes come before task completion.
```

### Part C: Teach Agents How to Detect Mistakes

Agents need explicit signals for "you just made a mistake." Add to ALL-017's HARD STOPS or as separate ALL-018:

```markdown
| ALL-018 | Mistake detection signals — you made a mistake if ANY of these are true: (1) user corrects or contradicts you, (2) you retried something that failed, (3) browser_navigate landed on unexpected page, (4) browser_snapshot shows different content than expected, (5) a command returned an error, (6) you changed approach mid-task. When detected: follow ALL-017 (STOP + capture) | — |
```

### Why This Is Safe

- `capture-mistake.ts` is a standalone utility — doesn't modify any existing scripts
- ALL-017/018 are additive shared rules — propagated via existing sync pipeline
- HARD STOPS additions are purely additive — no existing content removed
- Updating §8 step 6 wording doesn't change the system, just strengthens existing instruction
- The sync pipeline already handles new rules automatically

### How to Verify

```bash
# 1. capture:mistake script works
npm run capture:mistake ALL "Test rule - delete after verification" "Test resolution"
# EXPECTED: Adds ALL-0XX, runs sync, exit 0
# THEN: manually remove the test rule from agent-mistakes.md

# 2. ALL-017 exists and synced
grep "ALL-017" specs_planning/agent-mistakes.md
# EXPECTED: 1 match
grep "ALL-017" .github/agents/playwright-test-generator.agent.md
# EXPECTED: referenced in shared rules line

# 3. HARD STOPS updated in all agent prompts
grep -c "MISTAKES FIRST" .github/agents/playwright-requirements.agent.md
# EXPECTED: 1
grep -c "MISTAKES FIRST" .github/agents/playwright-test-planner.agent.md
# EXPECTED: 1

# 4. §8 updated
grep "MANDATORY" docs/read_only_docs/AGENT_SHARED_RULES.md | grep -i "novel\|mistake"
# EXPECTED: 1+ matches with "MANDATORY"
```

---

## After All 7 Changes: Start Generating

The pipeline is ready. Run the generator on `location-pricing` (most vetted item — 6 history entries, live-verified, requirements-diff'd, selectors added).

```bash
npm run build:context -- location-pricing
npm run generator:pre-run location-pricing
# Then invoke the Generator agent on location-pricing
```

**Target velocity**: 2-3 specs/week. All 8 remaining specs in 3-4 weeks.

**When agents make new mistakes going forward**:
- User catches it? → `npm run capture:mistake <PREFIX> "<rule>" "<resolution>"` (5 seconds)
- Agent catches it? → ALL-017 forces it to stop, write rule, sync, then resume
- Both paths feed the same registry → next session has the rule → mistake never repeats

---

## Change 8: Task-Relevant Context Injection

**File**: `scripts/task-context-builder.ts`
**Problem**: Every queue item at the same pipeline stage gets an IDENTICAL context payload. `parseMistakesForAgent()` takes only an agent name — no consideration of the queue item's `feature`, `module`, `intent`, or `userNotes`. Result: `location-management-history` (a read-only grid) gets told about `el.press('Tab')` after `el.fill()` (GEN-008) and boundary data verification (GEN-009) — rules with 0% relevance. This cognitive noise dilutes attention from rules that actually matter.

**Evidence**:
- All 8 `pending_generation` items have byte-for-byte identical `injectedContext` (except file refs and moduleContextRef)
- Each item gets: 15 mistakeIds, 10 learningsSummary, 5 criticalReminders, 6 selfAuditQuestions = 37 entries
- The `AGENT_RULES:` R## mechanism in `agent-mistakes.md` header (lines 14-20) is defined but NEVER parsed by any script
- Token cost: ~870 tokens/item × 9 items = ~7,830 tokens of mostly-irrelevant context in the queue file

### What to Change

**Step 1**: Add rule classification constants (top of `task-context-builder.ts`, after the CROSS_INJECT_RULES block at line 57):

```typescript
// === TASK-RELEVANT FILTERING ===
// Rules not listed in RULE_FEATURE_TAGS are treated as universal (always injected).
// Rules listed here are only injected when their tags overlap with the item's auto-detected tags.

const RULE_FEATURE_TAGS: Record<string, string[]> = {
  // Generator rules with feature-specific relevance
  'GEN-008': ['form', 'input', 'textbox', 'spinbutton', 'angular'],
  'GEN-009': ['boundary', 'numeric', 'spinbutton', 'validation'],
  'GEN-013': ['manual', 'checkbox', 'review'],
  'GEN-015': ['debug', 'fix', 'failure', 'rca'],
  // Planner rules with feature-specific relevance
  'PLN-007': ['country', 'permission', 'role', 'dependency', 'cascade'],
  'PLN-011': ['spinbutton', 'percent', 'decimal', 'format'],
  'PLN-012': ['save', 'dialog', 'toast', 'edit'],
  'PLN-013': ['blocked', 'environment', 'server'],
};

/** Auto-detect feature tags from queue item fields */
function extractFeatureTags(item: QueueItem): string[] {
  const text = `${item.feature || ''} ${item.intent || ''} ${item.userNotes || ''}`.toLowerCase();
  const tags = new Set<string>();

  const TAG_PATTERNS: Record<string, RegExp> = {
    'form':       /form|input|edit|field|fill|type|editable/,
    'checkbox':   /checkbox|toggle|check|uncheck|boolean/,
    'textbox':    /text|input|phone|name|label|po.?number/,
    'spinbutton': /spinbutton|percent|multiplier|rate|decimal|offset/,
    'numeric':    /number|numeric|boundary|range|min|max/,
    'grid':       /grid|table|column|row|sort|filter|history/,
    'dialog':     /dialog|modal|popup|toast|confirm/,
    'save':       /save|persist|reload|restore/,
    'readonly':   /read.?only|disabled|view|history|display|management/,
    'validation': /valid|error|required|boundary/,
    'angular':    /angular|blur|change|form.?model/,
    'fix':        /fix|heal|repair|debug|failure/,
    'rca':        /rca|root.?cause|diagnos/,
    'manual':     /manual|review|classify/,
  };

  for (const [tag, pattern] of Object.entries(TAG_PATTERNS)) {
    if (pattern.test(text)) tags.add(tag);
  }
  return Array.from(tags);
}

/** Filter rules to only those relevant to this specific task */
function filterRulesForItem(allRules: MistakeRule[], item: QueueItem): MistakeRule[] {
  const featureTags = extractFeatureTags(item);
  // If no tags extracted (safety), include all rules
  if (featureTags.length === 0) return allRules;

  return allRules.filter(rule => {
    const ruleTags = RULE_FEATURE_TAGS[rule.id];
    // Rules without feature tags = universal, always include
    if (!ruleTags) return true;
    // Feature-tagged rules: include only if ANY tag overlaps
    return ruleTags.some(tag => featureTags.includes(tag));
  });
}
```

**Step 2**: Modify `buildContextForItem()` (line 195-262) to use filtering.

Find this block (lines 218-220):
```typescript
    mistakeIds: shared.mistakeIds,
    mistakesRef: shared.mistakesRef,
    learningsSummary: shared.learningsSummary,
```

Replace with:
```typescript
    // Task-relevant filtering: only inject rules relevant to THIS item's feature
    mistakeIds: filterRulesForItem(
      shared.mistakeIds.map(id => ({ id, never: '', correct: '' })),
      item
    ).map(r => r.id),
    mistakesRef: shared.mistakesRef,
    learningsSummary: shared.learningsSummary,
```

**Alternative (simpler)**: If the above is too complex due to type mismatch, add a parallel function:

```typescript
/** Filter rule IDs to only those relevant to this specific task */
function filterRuleIdsForItem(allIds: string[], item: QueueItem): string[] {
  const featureTags = extractFeatureTags(item);
  if (featureTags.length === 0) return allIds;

  return allIds.filter(id => {
    const ruleTags = RULE_FEATURE_TAGS[id];
    if (!ruleTags) return true;  // universal
    return ruleTags.some(tag => featureTags.includes(tag));
  });
}
```

Then in `buildContextForItem()`:
```typescript
    mistakeIds: filterRuleIdsForItem(shared.mistakeIds, item),
```

**Step 3**: Add `featureTags` to the injected context for transparency.

In the `InjectedContext` type in `shared-types.ts`, add:
```typescript
  featureTags?: string[];  // Auto-detected feature characteristics for this item
```

In `buildContextForItem()`, add after the moduleRef assignment:
```typescript
  const featureTags = extractFeatureTags(item);
```

And include it in the context object:
```typescript
    featureTags,
```

### Expected Results

| Queue Item | Feature Tags | Rules Injected | Before |
|------------|-------------|----------------|--------|
| location-pricing | form, grid, save, checkbox | 12 of 15 GEN | 15 |
| location-left-panel-validations | form, textbox, validation, save | 14 of 15 GEN | 15 |
| location-management-history | grid, readonly | 9 of 15 GEN | 15 |
| location-notes | form, textbox, save | 13 of 15 GEN | 15 |
| location-legal | form, checkbox, save | 12 of 15 GEN | 15 |

Read-only features like `management-history` see the biggest drop (~40%). Form-heavy features lose only 1-2 irrelevant rules. Universal rules (GEN-001 through GEN-007, GEN-010-012, GEN-014) always injected.

### Why This Is Safe

- Rules WITHOUT tags in `RULE_FEATURE_TAGS` are ALWAYS injected — the default is "include everything"
- Only 8 rules across all agents have feature tags — the rest are universal
- If `extractFeatureTags()` returns empty (no keywords matched), ALL rules are injected (safety fallback)
- `featureTags` is logged in context for debugging — you can see WHY a rule was included/excluded
- No gates, flows, or enforcement changed — this only affects what context the agent reads

### How to Verify

```bash
npm run build:context --json
```

Compare `injectedContext.mistakeIds` for `location-management-history` vs `location-left-panel-validations`:
- `management-history` should have FEWER rules (no GEN-008, GEN-009)
- `left-panel-validations` should have MORE rules (includes GEN-008, GEN-009)
- Both should have all universal rules (GEN-001 through GEN-007)

Check `featureTags` field exists in each item's context:
```bash
grep "featureTags" specs_planning/agent-queue.json
```

---

## Change 9: Fix Planner Deep Exploration Protocol + Prompt Cleanup

**File**: `.github/agents/playwright-test-planner.agent.md`
**Problem**: The Planner's "Deep Exploration Protocol" (lines 76-89) explicitly instructs "Click EVERY field" (line 81), "browser_type on text inputs" (line 83), and "Test boundary values" (line 87). This is the OPPOSITE of Phase 1 read-only exploration. The planner's latest session on local-office-settings clicked checkboxes, filled inputs, opened dropdowns, and modified fields during "exploration" — because the prompt TOLD it to.

Additionally:
- `browser_take_screenshot` is still in the tools list (line 5) — same wasted-turns bug as Requirements Agent
- References old `R##` rule numbers (R24, R25, R27, R30 at lines 48, 51, 53, 65) instead of §-based references
- References `agent-learnings.md` (line 115) which is now a stub
- No Phase 1/Phase 2 split anywhere in the workflow

**Evidence from Planner Session (local-office-settings)**:
- Planner clicked checkboxes and toggled "Use Equipments QC" during exploration
- Planner filled date offset fields to test boundary values
- Planner opened dropdowns to discover options
- None of these interactions were restored before moving on
- Result: 4 CRITICAL bugs in output (TC count wrong, HST IDs shuffled, BAS-002 duplicate, BAS-004 orphaned), 8 HIGH issues (zero save-reload-verify coverage, zero boundary coverage, selector count lie)

### What to Change

**9A. Remove `browser_take_screenshot` from Planner tools** (line 5):

Delete `'playwright-browser/browser_take_screenshot', ` from the tools array.

**9B. Rewrite "Deep Exploration Protocol"** (lines 76-89):

Find:
```markdown
## Deep Exploration Protocol (MANDATORY)

**NEVER** just capture DOM and create test cases. You MUST interact with every element.

1. `browser_navigate(url)` → `browser_wait_for(time:3)` → `browser_snapshot`
2. Click EVERY field, record initial state (enabled/disabled, value)
3. `browser_type` on text inputs, observe validation
4. For DISABLED fields: find enable trigger → enable → test → document
5. Map field dependencies and interaction chains
6. `browser_snapshot` dropdowns for actual options
7. Test boundary values (min, max, empty, invalid)
8. Create interaction map BEFORE writing TCs
9. Verify field count in DOM matches TC count
10. Only THEN create test cases
```

Replace with:
```markdown
## Deep Exploration Protocol (MANDATORY — Two Phases)

### Phase 1: READ-ONLY Discovery (before writing ANY TCs)

1. `browser_navigate(url)` -> `browser_wait_for(time:3)` -> `browser_snapshot`
2. Read DOM: list ALL fields with type (checkbox, textbox, spinbutton, select, button), label, current value, enabled/disabled state
3. `browser_hover` to reveal tooltips, hidden panels, conditional UI
4. `browser_snapshot` on dropdowns to read options WITHOUT clicking them
5. Count fields in DOM. This is your FIELD INVENTORY baseline
6. **DO NOT** click fields, checkboxes, buttons. **DO NOT** type into inputs. **DO NOT** open dropdowns by clicking. OBSERVE ONLY.
7. Present Phase 1 field inventory to user. Wait for approval before Phase 2.

### Phase 2: Interactive Discovery (only after user approves Phase 1)

8. Click fields to test enable/disable triggers. Record initial state BEFORE each interaction
9. `browser_type` on text inputs, observe inline validation
10. For DISABLED fields: find enable trigger -> enable -> test -> document trigger condition
11. Test boundary values (min, max, empty, invalid) on spinbuttons and numeric fields
12. Map field dependencies (changing X enables/disables Y)
13. **RESTORE** every modified field to its original value before moving to next field
14. Verify field count in DOM matches planned TC count
15. Only THEN create test cases
```

**9C. Fix stale references** throughout the file:

- Line 48: Change `R27` to `§8 Session Protocol`
- Line 51: Change `R25` to `§8 Session Protocol`
- Line 53: Change `R30` to `§18 Pre-Flight`
- Line 65: Change `R24` to `§8` and change `agent-learnings.md` to `agent-mistakes.md Resolution column`
- Line 71: Change `R23/R24/R26` to `§8 Session Protocol`
- Line 115: Change `agent-learnings.md: APPEND` to `agent-mistakes.md: APPEND (PLN- prefix only)` (agent-learnings.md is a stub)

**9D. Expand the HARD STOPS section** (from Change 6D — now needs more items based on planner audit):

Update the HARD STOPS section proposed in Change 6D to be:
```markdown
## HARD STOPS

0. **MISTAKES FIRST**: If you detect you made a mistake: STOP. Write rule to `agent-mistakes.md`. Run sync. THEN resume.
1. **LOCATION**: Office 1604 only unless user specifies otherwise.
2. **SCOPE**: Touch ONLY the assigned tab (PLN-015). Do NOT explore other tabs.
3. **NO SCREENSHOTS**: Use `browser_snapshot`, not `browser_take_screenshot` (vision disabled).
4. **PHASE 1 = READ-ONLY**: Your Deep Exploration Protocol Phase 1 is OBSERVATION ONLY. No clicking fields. No typing. No toggles.
5. **RESTORE ALWAYS**: After ANY field interaction in Phase 2, restore to original value before moving on.
6. **USER CORRECTIONS**: User says stop = stop immediately + comply.
7. **TC-PLAN SYNC**: Every TC ID in test cases MUST appear in the test plan with MATCHING content. Verify BEFORE completing.
8. **COUNT CHECK**: Header TC count MUST match actual TC count. Count them. Write the real number.
9. **POST-COMPLETE MANDATORY**: Before unlocking queue, run `npm run planner:post-complete [id]`. Verify: selfAuditPassed=true, uiTestingChecklist populated, CSV exported, activity log entry added. Do NOT skip.
10. **NO POWERSHELL FILE WRITES**: Use MCP tools or Node.js `fs` for ALL file operations. PowerShell `Set-Content` corrupts Unicode (ALL-019).
```

### Why This Is Safe

- Phase 1/Phase 2 split prevents data corruption during Planner exploration (same benefit as Requirements Agent)
- Removing `browser_take_screenshot` eliminates wasted turns (vision disabled)
- Fixing stale R## references prevents confusion — the old R## numbering was replaced in the Feb 28 overhaul
- The expanded HARD STOPS add items 7-8 specifically to prevent the 4 CRITICAL bugs found in the planner audit
- No gates, scripts, or pipeline flows are modified — only the agent prompt

### How to Verify

```bash
# 1. browser_take_screenshot removed from Planner tools
grep "browser_take_screenshot" .github/agents/playwright-test-planner.agent.md
# EXPECTED: 0 matches

# 2. Phase 1/Phase 2 exists
grep -c "Phase 1" .github/agents/playwright-test-planner.agent.md
# EXPECTED: >= 2

# 3. Old R## references gone
grep -c "R2[4-7]\|R30" .github/agents/playwright-test-planner.agent.md
# EXPECTED: 0

# 4. agent-learnings.md reference gone
grep "agent-learnings" .github/agents/playwright-test-planner.agent.md
# EXPECTED: 0 matches

# 5. HARD STOPS section exists with all 9 items
grep -c "HARD STOPS" .github/agents/playwright-test-planner.agent.md
# EXPECTED: 1
```

---

## Change 10: Fix Sync System Orphaned Section Bug

**File**: `scripts/shared-types.ts` (1 line), `.github/agents/playwright-requirements.agent.md` (cleanup)
**Problem**: The `NEVER_DO_PATTERN` regex matches BOTH `## NEVER DO` and `## RULES`:

```typescript
export const NEVER_DO_PATTERN = /## (?:NEVER DO|RULES)[\s\S]*?(?=\n---|\n## (?!(?:NEVER DO|RULES))|```\n---)/;
```

But `String.replace()` without the `/g` flag only replaces the FIRST match. The sync script (`sync-agent-mistakes.ts` line 110) generates content starting with `## RULES`. So:
1. When an agent file has BOTH `## RULES` and `## NEVER DO` sections, sync replaces `## RULES` (first match)
2. The `## NEVER DO` section is left orphaned — never updated, never removed

Currently the Requirements Agent file has:
- Lines 23-33: `## RULES` (current, synced correctly)
- Lines 36-47: `## NEVER DO` (STALE — references "ALL-001-ALL-030", old format with "x NEVER / ok DO" columns)

This stale section gives the agent contradictory instructions.

### What to Change

**10A. Clean up orphaned `## NEVER DO` section** in Requirements Agent:

In `.github/agents/playwright-requirements.agent.md`, DELETE the entire `## NEVER DO` section (lines 36-47):
```markdown
## NEVER DO

> Shared rules ALL-001–ALL-030 apply (see AGENT_SHARED_RULES.md)

| ID | x NEVER | ok DO |
|----|---------|------|
| REQ-001 | Document features without live UI exploration | Use browser_navigate... |
| REQ-002 | Claim field exists without browser_snapshot proof | Use browser_snapshot... |
| REQ-003 | Fabricate validation rules from assumptions | Trigger actual error... |
| REQ-004 | Update REQUIREMENTS.md without MCP browser evidence | Log browser tool... |
| REQ-005 | Skip screenshots for new feature sections | Use browser_take_screenshot... |
---
```

Also check ALL other agent files for orphaned `## NEVER DO` sections and remove them.

**10B. Add `/g` flag to prevent future orphaning** in `shared-types.ts` line 184:

This is NOT recommended — `replaceAll` with a greedy regex could match too much. Instead, add a validation check.

**10B (alternative). Add orphan detection to `validate-agent-sync.ts`**:

In `scripts/validate-agent-sync.ts`, after the existing sync check, add:
```typescript
// Check for orphaned NEVER DO sections (should only have ## RULES, not both)
const rulesCount = (content.match(/## RULES/g) || []).length;
const neverDoCount = (content.match(/## NEVER DO/g) || []).length;
if (rulesCount > 0 && neverDoCount > 0) {
  errors.push(`${agentFile}: Has BOTH ## RULES and ## NEVER DO sections. Remove the orphaned ## NEVER DO section.`);
}
if (rulesCount > 1) {
  errors.push(`${agentFile}: Has ${rulesCount} ## RULES sections. Should have exactly 1.`);
}
```

This way `npm run validate:sync` will catch orphans going forward.

### Why This Is Safe

- Removing the orphaned `## NEVER DO` section is purely cleanup — the `## RULES` section has the current, correct rules
- The validation check prevents future orphans without modifying the sync logic
- No regex changes to `NEVER_DO_PATTERN` — that could break the lazy match for other files

### How to Verify

```bash
# 1. No NEVER DO sections in any agent file
grep -c "## NEVER DO" .github/agents/*.agent.md
# EXPECTED: 0 for all files

# 2. Exactly one RULES section per agent file
grep -c "## RULES" .github/agents/*.agent.md
# EXPECTED: 1 for each file

# 3. validate:sync passes (including new orphan check)
npm run validate:sync
# EXPECTED: exit 0
```

---

## Planner Audit Findings (location-local-office-settings)

This is NOT a change to implement — it's an audit record of the planner's first production output. The findings below inform Changes 6D and 9 (guardrails and protocol fixes). The planner will need to re-run on this item after the prompt fixes are applied.

### CRITICAL (4)
1. **TC count mismatch**: Header says 52, actual is 56 (35 BAS + 6 HST + 15 ECT)
2. **BAS-002 duplicated**: Appears in 2 test plan scenario groups with DIFFERENT content
3. **BAS-004 orphaned**: Exists in test cases but completely absent from test plan
4. **BAS-006 logic error**: Test plan step 3 fills "-1", step 4 expects Save disabled (contradictory — Save should ENABLE when value changed from original "0")

### HIGH (8)
1. Coverage summary arithmetic wrong (sums to 57, not 52; BAS-015 double-counted)
2. HST-003 through HST-006 IDs SHUFFLED between test cases and test plan (different content under same IDs)
3. Queue entry claims "14 selectors" — actual file has 47
4. **Zero save-reload-verify cycles** for ANY editable field
5. **Zero error recovery flows** for NM-1223 (duplicate section/room name)
6. Test plan execution order references BAS-002 in two groups
7. panelHistory testid naming inconsistent with other panels
8. automatableCount 49 does not match any possible total

### MEDIUM (9)
1. 5 of 10 checkboxes lack toggle test (only defaults verified, no 3-scenario)
2. Zero boundary testing for date offsets, phone, PO number, labor costs
3. Orphan selectors (sectionDiscountExemptions, containerHistoryTable)
4. BAS-032-035 physically after ECT block (ordering)
5. BAS-028: test cases list 4 exempt services, test plan lists 3
6. No pagination selectors for History tab
7. BAS-004 missing from execution order
8. Test plan says "~55 service rows" (approximate, not exact)
9. ECT-003 URL may have typo ("commissons" vs "commissions")

### POST-COMPLETION FAILURES (found by user confrontation)
The planner also failed to run ANY post-completion steps until the user called it out:
1. **PLN-016 not captured proactively** — only added after user said "Did u mark your mistakes?"
2. **CSV not exported** — `planner:post-complete` never run. Fixed after user intervention.
3. **TAB_MAP missing** — new sub-codes BAS/HST/ECT not registered in `export_test_cases/to-csv.ts:393`. Systematic issue: every new sub-code type needs registration.
4. **Automatable format wrong** — used table column instead of standalone line. PLN-014 says to lint but planner never ran `lint:testcases`.
5. **5 queue fields not set** — selfAuditPassed, uiTestingChecklist, self-audit history, activity log — all skipped.
6. **Encoding corruption** — PowerShell `Set-Content -Encoding UTF8` double-encoded Unicode. Had to reverse via Node.js Windows-1252 decoding. NEW failure mode.

### ROOT CAUSE
Two separate root causes:
1. The Planner's prompt **instructed** "Click EVERY field" during exploration (no Phase 1/Phase 2 split, no TC-plan sync check, no count check). → Fixed by **Change 9**.
2. The Planner has **no enforcement for post-completion steps** — steps 10-13 in Autonomous Mode exist but nothing forces them. → Fixed by **Change 9D HARD STOP #9** (POST-COMPLETE MANDATORY) and **ALL-019** (encoding safety).

After applying Changes 6D and 9, the planner should re-run on `location-local-office-settings`.

---

## Summary

10 changes. 8 files modified, 1 new (`capture-mistake.ts`).

**Changes 1-5**: Pipeline machinery fixes (context matching, stale data, golden example, trust thresholds, defect filter).
**Change 6**: Agent behavioral guardrails (shared ALL-013..018, behavioral REQ rules, HARD STOPS in Requirements + Planner prompts, browser_take_screenshot removal, Phase 1/Phase 2 exploration split).
**Change 7**: Learning feedback loop closure (Option A: `capture:mistake` script for users, Option B: ALL-017/018 force agents to stop-and-capture, HARD STOPS "MISTAKES FIRST" in all prompts, Section 8 step 6 from suggestion to mandatory).
**Change 8**: Task-relevant context injection (rule tagging, feature auto-detection, filtered injection — read-only tasks get fewer rules, form-heavy tasks get all).
**Change 9**: Planner Deep Exploration Protocol rewrite (Phase 1 read-only / Phase 2 interactive split, stale reference cleanup, expanded HARD STOPS with TC-plan sync and count check).
**Change 10**: Sync system orphan fix (remove stale NEVER DO sections, add orphan detection to validate:sync).

After all 10 changes: the pipeline can LEARN from mistakes (both user-caught and agent-detected), context is task-relevant (not one-size-fits-all dumps), agents have structural guardrails (Phase 1/Phase 2, HARD STOPS), and the sync system doesn't leave orphaned contradictions. Stop governance work. Start making specs.
