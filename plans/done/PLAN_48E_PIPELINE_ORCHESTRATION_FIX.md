# PLAN 48E: Pipeline Orchestration Fix

## Status: PENDING
## Priority: P2-MEDIUM
## Depends On: 48D (triage adds new routing paths)

## Problem

autoInvoke disabled, conditional routing logic unclear, no agent reads `conditionalAgents` config, `loop` field is dead config, Generator doesn't explicitly document how it detects pass/fail for routing.

---

## Changes

### File: `config/pipeline-config.json` — Restructure

```json
{
  "autoInvoke": {
    "enabled": true,
    "stages": {
      "requirements": { "next": "planning" },
      "planning": { "next": "generation" },
      "generation": {
        "onPass": "audit",
        "onFail": "healing"
      },
      "healing": {
        "next": "audit",
        "onBugFound": "audit"
      }
    }
  },
  "triageConfig": {
    "enabled": true,
    "bugReportDir": "reports/bugs",
    "bugRegistryFile": "reports/bug-registry.json",
    "requireMcpVerification": true,
    "uncertainAction": "skip-and-report"
  }
}
```

### File: `.github/agents/playwright-test-generator.agent.md` — Add explicit pass/fail detection

```
After test run completes:
1. Read failure-summary.json
2. IF failed === 0: stage = "completed", invoke Audit
3. IF failed > 0: stage = "pending_healing", invoke Healer
```

### File: `website/frontend/src/types/index.ts` — Add triage stage

```typescript
export type PipelineStage = ... | 'triage';
```

---

## Files

- `config/pipeline-config.json` — restructure autoInvoke
- `.github/agents/playwright-test-generator.agent.md` — explicit routing logic
- `website/frontend/src/types/index.ts` — add triage stage
