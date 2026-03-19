# PLAN 48L: Intelligent Failure Routing

## Status: PENDING
## Priority: P1-HIGH
## Depends On: 48K (artifact validation + gate execution must exist first)

## Problem

When a stage fails, the orchestrator routes based on a binary 'success'/'fail' outcome. The `matchRoutingCondition()` function (orchestrator.ts:107-114) only handles `failedCount == 0` and `failedCount > 0`. There is no concept of **why** something failed.

Result: Generator selector failures get routed to Healer, but Healer can't fix selectors the Planner got wrong. Healer wastes 3 retries before hitting convergence guard → `fixme`. The actual fix was always upstream in Planner.

### Evidence from Copilot Session

Every single Generator failure in the 2-hour session was caused by:
- Wrong selectors (Planner's job) → Generator tried to fix them itself → made them worse
- Missing behavioral documentation (Planner's job) → Generator discovered via trial-and-error
- Input mask behavior undocumented (Planner's job) → Generator's retry loop went infinite

If the pipeline had classified these failures, it would have routed back to Planner with a specific fix prompt instead of sending Generator into a 2-hour death spiral.

---

## Changes

### 1. Failure Classifier

**File**: `src/orchestrator/failure-classifier.ts` (NEW — ~100 lines)

```typescript
export type FailureClass =
  | 'selector_not_found'    // CSS selector doesn't match any DOM element
  | 'selector_ambiguous'    // Strict mode: selector matches multiple elements
  | 'assertion_mismatch'    // Value assertion failed (expected vs actual)
  | 'typescript_compile'    // TypeScript compilation error in generated code
  | 'missing_test_cases'    // No test cases found for module
  | 'missing_selectors'     // No selector file found for module
  | 'network_api_error'     // HTTP 4xx/5xx from application under test
  | 'auth_failure'          // SSO/auth failure
  | 'timeout'               // Agent timed out or test timed out
  | 'unknown';              // Unclassifiable

export interface ClassifiedFailure {
  failureClass: FailureClass;
  confidence: 'high' | 'medium' | 'low';
  evidence: string;            // The text that triggered classification
  upstreamBlame: string | null; // Which upstream stage is responsible (null = current stage)
}

const PATTERNS: Array<{
  pattern: RegExp;
  failureClass: FailureClass;
  upstream: string | null;
  confidence: 'high' | 'medium' | 'low';
}> = [
  // Selector issues → Planner
  { pattern: /strict mode violation.*resolved to (\d+) elements/i, failureClass: 'selector_ambiguous', upstream: 'planning', confidence: 'high' },
  { pattern: /waiting for (locator|selector).*to be visible/i, failureClass: 'selector_not_found', upstream: 'planning', confidence: 'high' },
  { pattern: /locator.*resolved to 0 elements/i, failureClass: 'selector_not_found', upstream: 'planning', confidence: 'high' },
  { pattern: /No element matches selector/i, failureClass: 'selector_not_found', upstream: 'planning', confidence: 'high' },

  // TypeScript → Generator
  { pattern: /TS\d{4}:/i, failureClass: 'typescript_compile', upstream: null, confidence: 'high' },
  { pattern: /error TS/i, failureClass: 'typescript_compile', upstream: null, confidence: 'high' },

  // Assertion → could be Generator (wrong assertion) or app bug
  { pattern: /expect\(received\)\.to(Equal|Be|Contain|Have)/i, failureClass: 'assertion_mismatch', upstream: null, confidence: 'medium' },
  { pattern:/Expected.*Received/i, failureClass: 'assertion_mismatch', upstream: null, confidence: 'medium' },

  // Network/API → app bug (neither agent's fault)
  { pattern: /net::ERR_/i, failureClass: 'network_api_error', upstream: null, confidence: 'high' },
  { pattern: /status (?:4\d{2}|5\d{2})/i, failureClass: 'network_api_error', upstream: null, confidence: 'medium' },
  { pattern: /ECONNREFUSED/i, failureClass: 'network_api_error', upstream: null, confidence: 'high' },

  // Auth
  { pattern: /login|sign.?in|sso|unauthorized|403/i, failureClass: 'auth_failure', upstream: null, confidence: 'medium' },

  // Timeout
  { pattern: /timeout.*exceeded/i, failureClass: 'timeout', upstream: null, confidence: 'high' },
  { pattern: /test.*timed out/i, failureClass: 'timeout', upstream: null, confidence: 'high' },
];

export function classifyFailure(resultData: Record<string, unknown>): ClassifiedFailure {
  // Extract searchable text from result
  const searchText = extractSearchableText(resultData);

  for (const { pattern, failureClass, upstream, confidence } of PATTERNS) {
    const match = searchText.match(pattern);
    if (match) {
      return {
        failureClass,
        confidence,
        evidence: match[0].slice(0, 200),
        upstreamBlame: upstream,
      };
    }
  }

  return {
    failureClass: 'unknown',
    confidence: 'low',
    evidence: searchText.slice(0, 200),
    upstreamBlame: null,
  };
}

function extractSearchableText(data: Record<string, unknown>): string {
  // Collect all string values from result, limited to 10k chars
  const parts: string[] = [];

  function collect(obj: unknown, depth: number) {
    if (depth > 5) return;
    if (typeof obj === 'string') { parts.push(obj); return; }
    if (Array.isArray(obj)) { obj.forEach(v => collect(v, depth + 1)); return; }
    if (obj && typeof obj === 'object') {
      Object.values(obj).forEach(v => collect(v, depth + 1));
    }
  }

  collect(data, 0);
  return parts.join('\n').slice(0, 10_000);
}
```

### 2. Integrate Classifier Into Complete-Task Handler

**File**: `src/server/routes/worker.ts` — complete-task handler (line 88-179)

Before calling `processStageCompletion`, classify the failure and inject the class into the outcome:

```typescript
// After line 168 (incrementRunCost), before processStageCompletion:

// Classify failure for intelligent routing
let routingOutcome = payload.success ? 'success' : 'fail';
if (!payload.success) {
  const { classifyFailure } = await import('../../orchestrator/failure-classifier');
  const classification = classifyFailure(payload.result);

  // Enrich result data with classification
  payload.result = {
    ...payload.result,
    _failureClass: classification.failureClass,
    _failureConfidence: classification.confidence,
    _upstreamBlame: classification.upstreamBlame,
    _failureEvidence: classification.evidence,
  };

  // Use specific outcome for routing if high confidence
  if (classification.confidence === 'high' && classification.upstreamBlame) {
    routingOutcome = `fail:${classification.failureClass}`;
  }
}

// Process stage completion with classified outcome
await processStageCompletion(
  pool,
  task.run_id,
  task.stage_id,
  routingOutcome,  // was: payload.success ? 'success' : 'fail'
  payload.result
);
```

### 3. Expand Routing Condition Matching

**File**: `src/orchestrator/orchestrator.ts` — `matchRoutingCondition()` (line 107-114)

Expand to handle failure class outcomes:

```typescript
function matchRoutingCondition(when: string, outcome: string): boolean {
  // Existing: binary pass/fail
  if (when.includes('== 0') && (outcome === 'tests_pass' || outcome === 'success')) return true;
  if (when.includes('> 0') && (outcome === 'tests_fail' || outcome === 'fail')) return true;

  // NEW: failure class matching
  // "failureClass == selector_not_found" matches outcome "fail:selector_not_found"
  const classMatch = when.match(/failureClass\s*==\s*(\w+)/);
  if (classMatch && outcome === `fail:${classMatch[1]}`) return true;

  // "failureClass in selector_not_found,selector_ambiguous"
  const inMatch = when.match(/failureClass\s+in\s+(\S+)/);
  if (inMatch) {
    const classes = inMatch[1].split(',');
    const outcomeClass = outcome.replace('fail:', '');
    if (classes.includes(outcomeClass)) return true;
  }

  // Catch-all fail (matches any fail:* outcome too)
  if (when === 'fail' && outcome.startsWith('fail')) return true;

  return false;
}
```

### 4. Add Upstream Routing Rules to Pipeline Definition

**File**: `config/pipeline-definition.json` — generation stage routing

```json
{
  "id": "generation",
  "routing": {
    "condition": "testResults",
    "rules": [
      { "when": "failedCount == 0", "then": "audit" },
      { "when": "failureClass in selector_not_found,selector_ambiguous,missing_selectors", "then": "planning" },
      { "when": "failureClass == typescript_compile", "then": "healing" },
      { "when": "failedCount > 0", "then": "healing" }
    ]
  }
}
```

**Healing stage routing** — add escalation to planning after repeated selector failures:

```json
{
  "id": "healing",
  "routing": {
    "condition": "testResults",
    "rules": [
      { "when": "failedCount == 0", "then": "audit" },
      { "when": "failureClass in selector_not_found,selector_ambiguous", "then": "planning" },
      { "when": "failedCount > 0", "then": "healing" },
      { "when": "fail", "then": "healing" }
    ]
  }
}
```

### 5. Upstream Blame Prompt Injection

**File**: `src/orchestrator/orchestrator.ts` — `buildStagePrompt()`

When routing back to an upstream stage due to failure classification, inject context about what went wrong:

```typescript
function buildStagePrompt(
  stage: StageDefinition,
  run: { feature: string; module: string; intent: string; target_url: string | null },
  previousResult: Record<string, unknown> | null,
): string {
  // ... existing code ...

  // If this is an upstream fix (routed back due to failure classification)
  if (previousResult?._upstreamBlame && previousResult._failureClass) {
    parts.push('');
    parts.push('--- UPSTREAM FIX REQUIRED ---');
    parts.push(`A downstream agent failed because of issues in YOUR output.`);
    parts.push(`Failure type: ${previousResult._failureClass}`);
    parts.push(`Evidence: ${previousResult._failureEvidence}`);
    parts.push(``);
    parts.push(`Fix the issue described above. Do not redo all work — only fix what caused the downstream failure.`);
  }

  // ... rest of existing code ...
}
```

---

## Files

| File | Change | Lines ~est |
|------|--------|------------|
| `src/orchestrator/failure-classifier.ts` | NEW — pattern-based failure classification | ~100 |
| `src/server/routes/worker.ts` | Classify failure before routing, enrich result data | ~15 |
| `src/orchestrator/orchestrator.ts` | Expand `matchRoutingCondition()` + upstream blame in prompts | ~30 |
| `config/pipeline-definition.json` | Add failure class routing rules to generation + healing | ~10 |

## Risks & Notes

1. **Classification accuracy**: Pattern-based classification will have false positives/negatives. Starting with high-confidence patterns only. Unknown failures fall through to existing 'fail' routing (no regression).
2. **Upstream routing loops**: If Planner can't fix selectors and Generator keeps failing → convergence guard (maxIterations) catches this. Planner retries should be bumped to 1 in 48K.
3. **Network/API errors**: These are classified but NOT routed upstream — they indicate app bugs, not agent failures. They should eventually feed into 48F (Bug Reporting).
4. **Pattern maintenance**: As new failure types are discovered, patterns need updating. This is a living classifier, not a one-time thing.

## Verification

1. Create a spec with intentionally wrong selector → run through pipeline → verify failure classified as `selector_not_found` with `upstreamBlame: 'planning'`
2. Verify routing: generation fails with selector issue → routes to planning (not healing)
3. Verify prompt: Planner receives "UPSTREAM FIX REQUIRED" with evidence of what went wrong
4. Verify convergence: if Planner can't fix after retry, convergence guard triggers → fixme (not infinite loop)
5. Existing 'success' path: run a passing pipeline → verify no regression in happy path routing
