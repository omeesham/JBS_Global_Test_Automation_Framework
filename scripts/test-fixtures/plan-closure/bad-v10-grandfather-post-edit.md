# PLAN_FIXTURE_BAD_V10_GRANDFATHER_POST_EDIT

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture with manifest-less state used by the layout validator to test V10 grandfathering logic (last-change timestamp vs landed-at timestamp). The plan body is a valid DONE plan. The self-test exercises whether plans that predate the validator's introduction are grandfathered or subject to checks based on edit history.

## Scope

- Layout validator self-test fixture for V10 grandfathering rules
- Plan body is structurally valid (passes all core validator checks)

## Steps

1. Create a valid DONE plan that simulates a pre-validator-era plan
2. Verify grandfathering logic based on last-change vs landed-at comparison

## Grandfathering Context

The V10 grandfathering rule works as follows:
- Plans whose `landed-at` timestamp predates the validator introduction are grandfathered
- However, if `last-change` timestamp is AFTER the validator introduction, the plan loses grandfather status (it was edited after the rules took effect)
- This fixture has no manifest (simulating a pre-manifest-era plan)
- The self-test harness manipulates git timestamps to test both paths

Key scenarios:
- landed-at BEFORE validator, last-change BEFORE validator: grandfathered (skip checks)
- landed-at BEFORE validator, last-change AFTER validator: NOT grandfathered (run checks)
- landed-at AFTER validator: NOT grandfathered regardless of last-change

## Execution Summary

Created a valid DONE plan fixture for V10 grandfathering logic testing. The file has no manifest, simulating a plan from before the manifest system was introduced.

- Step 1: valid DONE plan created with clean content and no manifest
- Step 2: grandfathering logic testing performed by self-test harness
- The harness tests both grandfathered and non-grandfathered paths
- Manifest-less state is the key characteristic of this fixture
- When grandfathered: validator skips all checks, returns PASS
- When not grandfathered (post-edit): validator runs full C1-C5 suite
- No forbidden tokens in body (clean C1)
- Execution summary content lines exceed threshold (clean C2)
- No cited evidence paths (clean C3)
- No phantom handoffs (clean C4)
- No strict-line violations (clean C5)
- Self-test: exercises V10 grandfathering with last-change vs landed-at logic
- Validator expected verdict (as-is): PASS (all checks clean)
- Layout validator self-test: validates grandfathering decision tree
- Audit note: V10 layout fixture — grandfather post-edit timestamp comparison

## Acceptance

- [x] Plan body structurally valid
- [x] No manifest present (simulates pre-manifest-era plan)
