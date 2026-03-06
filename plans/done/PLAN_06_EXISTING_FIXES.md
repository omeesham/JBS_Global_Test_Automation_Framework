# Plan 06: Apply Existing Fixes from PIPELINE_FIX_PLAN.md

**Status**: Done as per plan 00 index

**Problem**: PIPELINE_FIX_PLAN.md was created 2026-03-01 with 10 code fixes. Unclear how many have been applied. These fix real infrastructure bugs that affect every agent.

---

## Status Check Needed

Before implementing, verify which fixes are already applied:

### Fix 1: Context Builder Feature Matching
**File**: `scripts/task-context-builder.ts` (lines 203-213)
**Bug**: All queue items get `"moduleContextRef": "docs/REQUIREMENTS.md ### Setup Module"` regardless of feature
**Check**: Read the file, see if keyword-based matching is already implemented
**Impact**: Every agent gets wrong REQUIREMENTS.md section reference

### Fix 2: Stale Test Results
**File**: `scripts/task-context-builder.ts`
**Bug**: Shows test results from a completely different spec
**Check**: See if `lastRunFailures` filtering is already fixed
**Impact**: Generator sees misleading pass/fail data

### Fix 3: Generator Example Reference
**Bug**: Generator has no working example spec to reference
**Check**: See if `injectedContext` includes example spec path
**Impact**: Generator reinvents patterns every time

### Fix 4: Trust Progression Thresholds
**File**: `scripts/task-context-builder.ts` or `agent-performance.json`
**Bug**: 3/5/10 clean cycles required — mathematically unreachable
**Check**: See if thresholds were reduced
**Impact**: No agent ever gets promoted

### Fix 5: Soft Warnings as Defects
**Bug**: Lint warnings count as defects → zero clean cycles forever
**Check**: See if warning classification was changed
**Impact**: Agents stuck at lowest trust level

### Fix 6: Agent Prompt Guardrails
**Bug**: Agents use wrong URLs, modify read-only data, ignore corrections
**Check**: See if behavioral guardrails were added to prompts
**Impact**: Agents waste time on preventable errors

### Fix 7: Learning Feedback Loop
**Bug**: learningsLogged: 0 for 3/5 agents — honor-based, nothing forces capture
**Check**: See if learning capture is enforced
**Impact**: Agents repeat same mistakes

### Fix 8: Context Injection Relevance
**Bug**: Every item gets identical 37-entry payload regardless of feature type
**Check**: See if context is filtered by task relevance
**Impact**: Agents get noisy, irrelevant context

### Fix 9: Planner Deep Exploration Contradictions
**Bug**: "Click EVERY field" contradicts Phase 1 read-only. browser_take_screenshot in tools
**Check**: See if exploration protocol was clarified
**Impact**: Planner confused about what's allowed

### Fix 10: Sync System Orphaned Sections
**Bug**: `## RULES` and `## NEVER DO` sections inconsistent
**Check**: See if sync system was fixed
**Impact**: Agent files have contradictory sections

---

## Implementation Order

1. Read `scripts/task-context-builder.ts` to check Fix 1, 2, 3, 4, 5, 8
2. Read agent prompt files to check Fix 6, 9, 10
3. Read `agent-performance.json` to check Fix 4, 5, 7
4. Apply any un-applied fixes using the exact diffs from PIPELINE_FIX_PLAN.md
5. Run validation: `npm run build:context && npm run validate:sync`

---

## VAULT_PASSPHRASE Fix (ALREADY APPLIED)

During the generator session, this was found and fixed:
- `.env.development` had empty `VAULT_PASSPHRASE=` overriding `.env.local`'s valid value
- Fix: Commented out the empty override with warning comment
- **Status**: APPLIED (2026-03-02)

---

## Dependencies

- Fix 1 (context builder) must be applied BEFORE Plan 01 (planner overhaul) — planner needs correct REQUIREMENTS.md references
- Fix 3 (example spec) must be applied BEFORE Plan 02 (generator overhaul) — generator needs working example
- Fix 10 (sync system) must be applied BEFORE Plan 05 (shared rules update) — new rules need clean sync
