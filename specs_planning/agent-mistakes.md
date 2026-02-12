# Agent Mistakes Registry
<!-- ALL agents MUST read this file before starting ANY work -->
<!-- QA Agent is the ONLY agent that writes to this file -->
<!-- Last updated: 2026-02-11 by initial seeding -->

## How This File Works
1. QA Agent verifies pipeline outputs and identifies mistakes
2. Verified mistakes are added here with NEVER-DO rules
3. All agents read this file at startup (mandatory)
4. Agents must check their section before doing work

---

## Copilot Agent Mistakes

### MISTAKE-COP-001: Bypassed 3-agent pipeline
- **What happened:** Copilot created .spec.ts files directly, skipping Planner and Generator
- **NEVER DO THIS:** Copilot MUST NOT create .spec.ts files. Copilot's job is intake ONLY: create test cases, add queue entries, update REQUIREMENTS.md with user approval.
- **Correct behavior:** Create test case file + queue entry with stage "pending_planning". Stop.

### MISTAKE-COP-002: Skipped Planner entirely
- **What happened:** Copilot went straight from user request to code generation
- **NEVER DO THIS:** Every test must go through Planner first for selector discovery and plan creation.

### MISTAKE-COP-003: Marked tests as automated prematurely
- **What happened:** Test cases marked "Automated" before any test was run
- **NEVER DO THIS:** Only Generator marks tests as Automated, and only AFTER tests pass.

### MISTAKE-COP-004: Created code without agent invocation
- **What happened:** Copilot wrote page object code and spec files itself
- **NEVER DO THIS:** Code generation is Generator's job. Copilot creates documentation only.

### MISTAKE-COP-005: Missing mandatory spec headers
- **What happened:** Generated spec files lacked // spec: and // seed: header comments
- **NEVER DO THIS:** Every .spec.ts MUST start with // spec: and // seed: comments.

### MISTAKE-COP-006: Wrong queue stage on creation
- **What happened:** Queue item created with stage "completed" instead of "pending_planning"
- **NEVER DO THIS:** New queue items MUST start at stage "pending_planning".

### MISTAKE-COP-007: Marked completed without test execution
- **What happened:** Queue item marked "completed" after code changes, citing "TypeScript compilation" as verification. Tests were never run. Terminal showed last test run FAILED (exit code 1).
- **NEVER DO THIS:** Even with user override to do Generator/Healer work, you MUST run tests and verify they PASS before marking completed. TypeScript compilation proves syntax correctness, NOT functional correctness. User override gives PERMISSION to write code, NOT exemption from QUALITY standards.
- **Correct behavior:** Run `npx playwright test {spec-file}`, verify all tests pass, add test results to queue history, THEN change stage to "completed". If tests fail, stage should be "pending_healing" with failure details.

---

## Planner Agent Mistakes

### MISTAKE-PLN-001: Never invoked (pipeline skipped)
- **What happened:** Copilot bypassed Planner entirely
- **NEVER DO THIS:** Planner must be invoked for every feature. If Planner finds itself with no pending_planning items but sees test cases without plans, flag the issue.

### MISTAKE-PLN-002: No selector discovery
- **What happened:** Selectors were assumed rather than discovered via browser exploration
- **NEVER DO THIS:** Planner MUST use browser tools to discover actual selectors. Never assume selectors from documentation alone.

---

## Generator Agent Mistakes

### MISTAKE-GEN-001: Never invoked (Copilot did its work)
- **What happened:** Generator was bypassed because Copilot created spec files directly
- **NEVER DO THIS:** Generator must be the sole creator of .spec.ts files.

### MISTAKE-GEN-002: Dual repo violation
- **What happened:** Selectors added to TypeScript but not CSV (or vice versa)
- **NEVER DO THIS:** Every selector MUST exist in BOTH src/selectors/index.ts AND object_repository/*.csv.

### MISTAKE-GEN-003: Tests never run before marking complete
- **What happened:** Queue item marked completed without running npx playwright test
- **NEVER DO THIS:** Tests MUST be executed. Queue item can only be "completed" if tests PASS.

### MISTAKE-GEN-004: Wrong auth approach
- **What happened:** Used complex auth method (UiCommon.navigateToAuthenticatedPage) when EspoCRM demo uses simple passwordless login
- **NEVER DO THIS:** Always verify the actual login mechanism by reading the live page. EspoCRM demo: goto URL, wait for #btn-login, click it. No MFA needed.

---

## Healer Agent Mistakes

### MISTAKE-HLR-001: Fake signoff without test execution
- **What happened:** Healer claimed tests were complete without running any tests
- **NEVER DO THIS:** Healer MUST run test_run tool and show actual pass/fail output before any completion claim.

### MISTAKE-HLR-002: Zero test execution with skipped tests
- **What happened:** 0 tests executed, 28 skipped, but healer reported as if work was done
- **NEVER DO THIS:** If tests are being skipped, investigate WHY. Skipped tests are not passing tests.

### MISTAKE-HLR-003: Environmental excuse without code verification
- **What happened:** Healer blamed environment issues without verifying code was correct first
- **NEVER DO THIS:** Always verify code correctness (selectors, imports, page objects) before attributing failures to environment.

### MISTAKE-HLR-004: Activity log shows "completed" but queue shows "pending_healing"
- **What happened:** Healer added activity log entry "completed" at 19:10:00Z claiming "HEALING COMPLETE" but queue still shows stage="pending_healing", TC-DOC-003 still failing with strict mode violation, and healer restarted work at 20:00:00Z
- **Evidence:** Activity log 19:10 says "completed", queue 19:06 shows "healing_attempt_1" with "TC-DOC-003 pending", junit results show TC-DOC-003 FAILED with strict mode violation on lnkDocuments selector, activity log 20:00 shows healer started AGAIN for "manual MCP browser verification"
- **NEVER DO THIS:** Mark work "completed" in activity log when queue stage is NOT "completed" and tests are still failing. Activity log MUST match queue reality.
- **Correct behavior:** (1) Fix code, (2) Run tests and verify ALL PASS, (3) Update queue stage to "completed", (4) THEN add activity log "completed" entry. Activity log should reflect actual completion status.

---

## QA Agent Mistakes
(None recorded yet -- QA agent is new)
