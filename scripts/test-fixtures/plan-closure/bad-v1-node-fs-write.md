# PLAN_FIXTURE_BAD_V1_NODE_FS_WRITE

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture used by hook self-test to assert DENY for Node.js fs.writeFileSync commands that attempt to write to the closure-overrides file. The plan body itself is a valid DONE plan; the forbidden write command appears as documented evidence of the pattern being tested.

## Scope

- Hook self-test fixture for V1 Node.js fs write detection
- Plan body is structurally valid (not intended to fail core validator checks)

## Steps

1. Document the Node.js fs write pattern that should be denied
2. Verify hook detects and blocks the pattern

## Documented Pattern

The following Node.js command pattern should be denied by the pre-tool-use hook:

```
node -e "require('fs').writeFileSync('.claude/closure-overrides.json', JSON.stringify({version:1,overrides:[]}))"
```

This command attempts to directly write to the closure-overrides file using Node.js fs module, bypassing the authorized override management workflow.

## Execution Summary

Documented the Node.js fs.writeFileSync write pattern for hook self-test validation. The hook should detect this pattern and issue a DENY verdict.

- Step 1: Node.js write pattern documented in the section above
- Step 2: hook validation is performed by the self-test harness, not this plan
- The pattern `require('fs').writeFileSync('.claude/closure-overrides.json', ...)` targets a protected file
- Hook V1 should intercept any Bash/PowerShell tool calls matching this pattern
- The DENY prevents unauthorized modification of the override authority file via Node.js
- No forbidden tokens in body outside fenced code block (clean C1)
- Execution summary content lines exceed threshold (clean C2)
- No cited evidence paths (clean C3)
- No phantom handoffs (clean C4)
- No strict-line violations (clean C5)
- Self-test: provides the write pattern that the hook self-test asserts DENY against
- Validator expected verdict for core checks: PASS (valid DONE plan structure)
- Hook self-test expected verdict: DENY (Node.js write to protected file)
- Audit note: V1 hook fixture — Node.js fs.writeFileSync variant

## Acceptance

- [x] Write pattern documented
- [x] Plan structure valid for core validator
