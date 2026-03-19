# PLAN 48D: Triage Classification & Bug Detection

## Status: PENDING
## Priority: P1-HIGH
## Depends On: 48A (diagnostics working), 48B (Healer can use MCP)

## Problem

The Healer treats every failure as "test is wrong" and fixes the automation to match current UI. Real application bugs (like the 500 on pricing API) get baked into passing tests. No concept of BUG vs FEATURE_CHANGE vs TEST_DEFECT.

---

## Changes

### File: `src/framework-contracts/diagnostics.ts` — Add new types

```typescript
export enum TriageDisposition {
  BUG = 'BUG',
  FEATURE_CHANGE = 'FEATURE_CHANGE',
  TEST_DEFECT = 'TEST_DEFECT',
  UNCERTAIN = 'UNCERTAIN',
}

export enum TriageConfidence { HIGH = 'HIGH', MEDIUM = 'MEDIUM', LOW = 'LOW' }
export enum BugSeverity { CRITICAL = 'CRITICAL', HIGH = 'HIGH', MEDIUM = 'MEDIUM', LOW = 'LOW' }

export interface TriageSignal {
  signalId: string;
  weight: 'strong' | 'moderate' | 'weak';
  direction: TriageDisposition;
  evidence: string;
}

export interface TriageResult {
  disposition: TriageDisposition;
  confidence: TriageConfidence;
  reasoning: string;
  signals: TriageSignal[];
  mcpVerified: boolean;
  tcExpectedValue: string | null;
  actualValue: string | null;
  changeDescription: string | null;
  bugSeverity: BugSeverity | null;
}

export interface BugReport {
  id: string;
  testCaseId: string;
  testFile: string;
  module: string;
  feature: string;
  severity: BugSeverity;
  title: string;
  description: string;
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  pageUrl: string;
  screenshotPath: string | null;
  failureCategory: FailureCategory;
  triageResult: TriageResult;
  status: 'open' | 'confirmed' | 'fixed' | 'wont_fix' | 'not_a_bug';
  createdAt: string;
  queueItemId: string;
}
```

### File: `src/utils/agent-reporter.ts` — Extend interfaces

```typescript
// Add to FailureEntry:
triage: TriageResult | null;
bugReportId: string | null;

// Add to FailureSummary:
triageStats: { bugs: number; featureChanges: number; testDefects: number; uncertain: number; } | null;
bugReportFiles: string[];
```

### File: `.github/agents/playwright-test-healer.agent.md` — Add Phase 0 Triage

New rules:

| ID | Rule |
|----|------|
| HLR-015 | TRIAGE BEFORE HEAL: Every failure must be triaged as BUG/FEATURE_CHANGE/TEST_DEFECT/UNCERTAIN before any code changes. |
| HLR-016 | BUG = NO HEAL: When triage = BUG, generate bug report, annotate test `test.skip('bug-blocked: BUG-XXX')`. Do NOT modify assertions. |
| HLR-017 | MCP VERIFY FOR BUG: Never classify as BUG without live MCP verification. Navigate to page, check actual state, run `browser_network_requests`. |
| HLR-018 | TC IS TRUTH: Compare against TC document + MCP_VERIFICATION_LOG. If test assertion differs from TC, test is wrong (TEST_DEFECT). |
| HLR-019 | UNCERTAIN = NO HEAL: Generate partial report for human review. Do NOT heal. |
| HLR-020 | FEATURE_CHANGE DOC: Document what changed, old vs new value, which TC values updated. |
| HLR-021 | EMPTY DIAGNOSTICS = RED FLAG: If ALL diagnostic fields empty, do NOT conclude "no errors." Use MCP `browser_network_requests` regardless. |
| HLR-022 | NEVER FABRICATE CONCLUSIONS: Missing data = "data unavailable", never invent explanations from absence of evidence. |
| HLR-023 | MCP NETWORK CHECK MANDATORY: ALWAYS run `browser_network_requests` after performing the failing action during triage. Non-negotiable. |

New Phase 0 Triage protocol (insert before Phase A):

```
## Phase 0: TRIAGE (Mandatory before any healing)

### Step 0.1: Read Failure Data + TC Expected Values
- Read failure-summary.json entry (failureCategory, networkFailures, consoleErrors, pageErrors)
- Find TC document in specs_planning/test-cases/ — read expected values
- Read MCP_VERIFICATION_LOG from top of TC file (planner-verified truth)

### Step 0.2: Collect Triage Signals

| Signal | Fires When | Points To | Weight |
|--------|-----------|-----------|--------|
| SIG-CONSOLE-ERROR | unhandled/Uncaught JS error | BUG | strong |
| SIG-PAGE-ERROR | pageErrors[] non-empty | BUG | strong |
| SIG-NETWORK-500 | 5xx in networkFailures | BUG | strong |
| SIG-NETWORK-4XX | 4xx non-auth | BUG | moderate |
| SIG-VALUE-MISMATCH | TC expected != actual AND TC matches LOG | BUG | strong |
| SIG-SELECTOR-GONE | Element was in LOG but not found now | BUG or FEATURE_CHANGE | moderate |
| SIG-SELECTOR-MOVED | Element exists with different selector | FEATURE_CHANGE | moderate |
| SIG-LABEL-CHANGE | 1-2 char diff = typo | BUG | moderate |
| SIG-LABEL-CHANGE | Meaningful rewording | FEATURE_CHANGE | moderate |
| SIG-LAYOUT-CHANGE | Multiple selectors fail in same region | FEATURE_CHANGE | moderate |
| SIG-TIMING-FLAKE | Passed before, fails intermittently | TEST_DEFECT | moderate |
| SIG-BAD-SELECTOR | Fragile selector pattern | TEST_DEFECT | moderate |
| SIG-INFRA | Browser crash, context closed | TEST_DEFECT | strong |

### Step 0.3: MCP Live Verification (REQUIRED for BUG)
WARNING: Close playwright-test before opening playwright-browser.
1. browser_navigate to pageUrl
2. browser_wait_for(time:3) → browser_snapshot
3. Locate failing element, compare against TC expected
4. browser_network_requests — check for 4xx/5xx
5. browser_console_messages — check for JS errors

### Step 0.4: Classify & Route

| Disposition | Action |
|-------------|--------|
| BUG | Bug report → reports/bugs/BUG-{MOD}-{NNN}.json. test.skip('bug-blocked: BUG-XXX'). Do NOT heal. |
| FEATURE_CHANGE | Phase A + B. Document change. Update TC expected values. |
| TEST_DEFECT | Phase A + B. Normal healing. |
| UNCERTAIN | Phase A for more evidence. Re-triage. If still uncertain → partial report, no heal. |
```

### File: `.github/agents/playwright-pipeline-audit.agent.md` — Add rules

| ID | Rule |
|----|------|
| AUD-017 | TRIAGE ACCURACY: Verify every healed failure's triage was correct. Did a BUG get healed away as FEATURE_CHANGE? |
| AUD-018 | BUG REPORT QUALITY: Every bug report needs evidence, expected vs actual with TC source, MCP verification. |
| AUD-019 | NO SILENT HEALING: DATA or APPLICATION category failures healed without triage = critical finding. |
| AUD-020 | UNCERTAIN HANDLING: Verify UNCERTAIN dispositions NOT healed. Partial reports exist. |
| AUD-021 | BUG REGISTRY INTEGRITY: All bug-blocked annotations match registry entries. |

### File: `docs/read_only_docs/AGENT_SHARED_RULES.md` — Add

| ID | Rule | Violation = |
|----|------|-------------|
| ALL-032 | Triage before healing: classify every failure before code changes | Bug laundering |
| ALL-033 | Bug-blocked tests use `test.skip('bug-blocked: BUG-XXX')`. Must NOT be removed. | Lost regression detection |
| ALL-034 | `reports/bug-registry.json` = single source of truth for discovered bugs | Bug tracking |

Update §10 — add Cat-D (Bug-blocked: app bug, test correct, exit = bug fixed by human).
Update §12 — note Phase 0 triage precedes Phase A for Healer.

---

## Verification

1. Run pricing spec (known 500 bug) with diagnostics fix from 48A
2. Invoke Healer — should triage as BUG (SIG-NETWORK-500), generate report, NOT heal
3. Check `reports/bugs/BUG-LOC-PRI-001.json` exists with evidence
4. Check test now has `test.skip('bug-blocked: BUG-LOC-PRI-001')` annotation

## Files

- `src/framework-contracts/diagnostics.ts` — add triage types
- `src/utils/agent-reporter.ts` — extend FailureEntry/FailureSummary
- `.github/agents/playwright-test-healer.agent.md` — Phase 0 triage + HLR-015..023
- `.github/agents/playwright-pipeline-audit.agent.md` — AUD-017..021
- `docs/read_only_docs/AGENT_SHARED_RULES.md` — ALL-032..034, §10 Cat-D, §12 update
- `config/pipeline-config.json` — add triageConfig section
- `.github/copilot-instructions.md` — add bug-blocked test section
