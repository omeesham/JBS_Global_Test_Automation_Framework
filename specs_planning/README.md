# Test Plans & Test Cases

## Directory Structure

```
specs_planning/
├── test-cases/{module}/     # Test case docs (Planner creates)
├── test-plans/{module}/     # Technical plans (Planner creates)
├── _internal/               # Templates
├── audits/                  # Audit reports
├── agent-queue.json         # Work queue
├── agent-activity-log.md    # Activity log
├── agent-mistakes.md        # NEVER-DO rules
└── agent-performance.json   # Trust tracking
```

## Agent Workflow

See [copilot-instructions.md §3](../.github/copilot-instructions.md) for pipeline table and stage flow.

## Agent Checklist

### Requirements Agent
- ✅ Update REQUIREMENTS.md with user approval
- ✅ Create queue entry with `intent` field
- ✅ Set `stage: pending_planning`
- ❌ Do NOT create test case files (Planner does that)

### Planner Agent
- ✅ Explore website with MCP browser tools
- ✅ Create `test-cases/{module}/{feature}-test-cases.md`
- ✅ Create `test-plans/{module}/{feature}-plan.md`
- ✅ Add selectors to `src/selectors/index.ts`
- ✅ Update queue artifacts

### Generator Agent
- ✅ Create `.spec.ts` files in `tests/specs/{module}/`
- ✅ Run tests before marking complete
- ✅ Update test case status to Automated

### Healer Agent
- ✅ Fix failing tests
- ✅ Run tests to verify fixes
- ✅ Update test results

## How to Request Tests

Delegate test requests to `@playwright-requirements`. See [copilot-instructions.md §1](../.github/copilot-instructions.md).

## Templates

- **Test case format**: `_internal/test-case-template.md`
- **Example test cases**: `_internal/example-login-test-cases.md`
- **Example plan**: `_internal/example-login-plan.md`
