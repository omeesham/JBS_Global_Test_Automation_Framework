# Fix-Diagnosis Template

Generator MUST write `reports/fix-diagnosis-<feature>.md` before completing any fix run. Gate 10 enforces this.

## Template

```markdown
# Fix Diagnosis — <feature>
**Date**: YYYY-MM-DD | **Queue Item**: <id> | **Session**: <sessionStartedAt>

## Failed TCs
| TC ID | Error | Category |
|-------|-------|----------|
| TC-XXX-YY-NNN | <error summary> | AUTH/SELECTOR/TIMING/... |

## Network Analysis
| URL | Status | Notes |
|-----|--------|-------|
| <url> | 4xx/5xx | <context> |

## Auth Chain
| Step | URL | Status |
|------|-----|--------|
| 1 | <oauth url> | 302/400/... |

## Console / Page Errors
- <error text>

## DOM Context
<relevant DOM excerpt from domSnippet — around failed selector or first 500 chars>

## URL History
1. <url> → 2. <url> → ...

## Research Findings
- Web search: "<query>" → <finding>
- Codebase grep: "<pattern>" → <match>

## Evidence Checklist
| # | Data Source | Checked | Finding |
|---|------------|---------|---------|
| A1 | failureCategory | | |
| A2 | fullError | | |
| A3 | networkFailures[] | | |
| A4 | consoleErrors[] | | |
| A5 | authChain[] | | |
| A6 | pageUrl + urlBreadcrumbs[] | | |
| A7 | domSnippet | | |
| A8 | screenshotPath | | |
| A9 | tracePath | | |
| A10 | per-spec diagnostics | | |
| A11 | agent-mistakes.md Resolution column | | |
| A12 | agent-mistakes.md | | |
| A13 | MCP browser replication | | |
| A14 | selector evaluation in live DOM | | |

## Hypothesis Verification
- **Hypothesis**: <what is wrong and why, citing evidence rows e.g. "Per A7 + A14: ...">
- **MCP verification**: <what you did in browser to confirm/deny>
- **Result**: CONFIRMED / DENIED

## Root Cause
<hypothesis citing evidence checklist rows, e.g. "Per A7 + A14: tabpanel tag doesn't exist in DOM, selector needs data-testid">

## Action
- [ ] Fix: <what changes>
- [ ] Skip: <why — log missing-coverage>

## Confidence
HIGH / MEDIUM / LOW
```

## Usage
- Referenced from Generator Phase 4 and §12 in AGENT_SHARED_RULES.md
- Gate 10 in `generator-post-complete.ts` enforces existence + freshness
- Only required for fix runs (fixScope.failedTestIds populated), not fresh creation
