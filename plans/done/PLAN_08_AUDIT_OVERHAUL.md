# Plan 08: Audit Agent Overhaul

**Status**: DONE 2026-03-03 -- All changes applied, sync clean

**Core Identity: Audit = COMPREHENSIVE WATCHDOG** — Audit agent must know HOW to audit every single agent type, the pipeline, the framework, and itself. It's not enough to check structure — it must verify content, verify against live DOM, and produce actionable remediation prompts. It must also audit its own audits.

**Problem**: Audit agent checks surface-level compliance but misses substantive issues. It doesn't know agent-specific quality criteria (e.g., planner's MCP_VERIFICATION_LOG, generator's artifact-first RCA). It delivered findings without remediation prompts. It didn't audit its own methodology.

**Root Cause**:
1. Mode 2 (Agent Audit) is generic — same checklist for all agents, doesn't know what to look for per agent
2. No mandate to verify planner's MCP_VERIFICATION_LOG when auditing planner output
3. No mandate to check generator used artifact-first RCA (not MCP-first)
4. Audit agent found 5 issues but didn't deliver remediation prompts to user (violated its own AUD-005)
5. Zero self-findings while creating 3+ findings for others — didn't catch its own violations

---

## Changes to Audit Agent Prompt

### 1. Agent-Specific Audit Checklists (NEW — add to Mode 2)

When auditing a specific agent, use that agent's checklist IN ADDITION to the generic checks:

```markdown
## Agent-Specific Audit Checklists (Mode 2)

### Auditing Requirements Agent
- [ ] Did it explore the page independently (HUNTER), or just verify prompt data?
- [ ] For every field documented: is there browser_snapshot proof?
- [ ] For every dropdown: are ALL options listed (exact text from DOM)?
- [ ] For every checkbox: are cascade effects documented?
- [ ] Did it click Save and document the dialog behavior?
- [ ] Did it verify HTML tag structure via browser_evaluate (dt/dd vs div/span)?
- [ ] Are there any "~N rows", "TBD", or "(observed)" entries? → finding

### Auditing Planner Agent
- [ ] Does MCP_VERIFICATION_LOG exist at top of test cases file? → if missing, CRITICAL finding
- [ ] Is every editable field its own TC (not lumped)? → grep for "any option", "select a value"
- [ ] Are column headers EXACT from DOM (not from REQUIREMENTS.md)?
- [ ] Are dropdown options EXACT and complete (all options listed)?
- [ ] Are row/field counts EXACT (not approximate — no "~")?
- [ ] Is save dialog behavior documented (dialog text, buttons, or "No dialog")?
- [ ] Were selectors verified via browser_evaluate against actual HTML structure?
- [ ] Does every TC have specific expected values (not generic)?
- [ ] Is "Generator-Ready Package" complete? (PLN-022)

### Auditing Generator Agent
- [ ] Did it create Phase 0 execution plan before writing code? (GEN-016)
- [ ] Did it verify planner's MCP_VERIFICATION_LOG first?
- [ ] During RCA: did it read failure artifacts BEFORE MCP? (GEN-017)
  - Check: failure-summary.json read? error-context.md read? screenshot read?
  - If MCP was used before reading artifacts → finding
- [ ] Did it use `--grep "TC-ID"` during debug, not full spec? (GEN-018)
  - Count test execution commands in transcript/logs
  - Full spec runs during debug = finding
- [ ] Did it check BasePage before creating page object methods? (GEN-019)
- [ ] Are there duplicated methods across page objects? → grep for patterns
- [ ] Does spec match golden reference pattern? (location-currency.spec.ts)
<!-- SURGICAL EDIT 2026-03-03 by Copilot — Added 4 checklist items for surgical rules
     WHY: Reviewer 1 caught that PLAN_08 only covers up to GEN-019. The new rules
     (ALL-024 truth hierarchy, ALL-026 spec DRY, GEN-018 dependency analysis, ALL-027 MCP
     stability) had zero audit coverage. Without these checks, audit agent won't catch violations. -->
- [ ] Truth hierarchy respected? If MCP showed different data than TC, did agent report discrepancy via GEN-021 (push queue to pending_planning + log reason) instead of forcing spec to match wrong TC? (ALL-024, GEN-021)
- [ ] Spec-level DRY followed? No copy-pasted test blocks across specs. Patterns used 2+ times extracted to fixtures/helpers (ALL-026, GEN-022)
- [ ] Full dependency analysis for --grep? Agent read spec to identify setup deps, not just blindly added TC-001 (GEN-018 updated)
- [ ] MCP stability: no concurrent `npx playwright test` + MCP browser? No heavy evaluate scripts? No process kills? (ALL-027)

### Auditing Healer Agent
- [ ] Did it read failure artifacts before MCP replication? (HLR-009)
  - Same check as generator: failure-summary → error-context → screenshot → THEN MCP
- [ ] Did it use `--grep "TC-ID"` during fix loop? (HLR-010)
- [ ] When replicating on MCP: did it read the spec code first and follow exact steps? (HLR-011)
  - Or did it browse randomly on MCP?
- [ ] Evidence checklist completed before any code edit?
- [ ] Max 2 fix cycles respected? If exceeded → finding
- [ ] Learning entries logged for every fix attempt? (HLR-008)
<!-- SURGICAL EDIT 2026-03-03 by Copilot — Same 4 items as Generator (AUD-013 coverage) -->
- [ ] Truth hierarchy respected? If MCP replication showed TC was wrong, did agent report via GEN-021 mechanism instead of patching the spec? (ALL-024)
- [ ] Full dependency analysis for --grep? Read spec to find minimum dep set, not blind TC-001? (HLR-010 updated)
- [ ] MCP stability: no concurrent test + MCP browser? No process kills? (ALL-027)

### Auditing Self (Audit Agent)
- [ ] Did I read ALL relevant files before forming findings?
- [ ] Did I verify findings via MCP when possible (not just file reads)?
- [ ] Did I produce remediation prompts for EVERY finding? (AUD-005)
  - Each finding → specific agent + copy-pastable fix prompt
- [ ] Were my findings evidence-backed (file:line, grep output, snapshot)?
- [ ] Did I find issues in my OWN methodology? (AUD-011)
  - Zero self-findings while creating 3+ findings for others = statistical impossibility
- [ ] Did I update agent-mistakes.md with genuinely new patterns?
- [ ] Did I deliver remediation prompts TO THE USER (not just file them)?
```

### 2. Pipeline Infrastructure Audit (NEW — add to Mode 1/4)

```markdown
## Pipeline Infrastructure Checks

### Context Builder Verification
- [ ] Run `npm run build:context` — does it succeed?
- [ ] Check moduleContextRef for each queue item — does it point to the correct REQUIREMENTS.md section (not "Setup Module")?
- [ ] Check lastRunFailures — are failure data only shown for items that have actually been run?
- [ ] Check injectedContext size — is it reasonable (not 37 identical entries for every item)?

### Trust Progression Verification
- [ ] Read promotionRules in agent-performance.json — are thresholds achievable?
- [ ] Check defectsFound filter in generator-post-complete.ts — are soft warnings counted as defects?
- [ ] Any agent ever promoted? If not → thresholds may be mathematically unreachable

### Sync System Verification
- [ ] Run `npm run validate:sync` — zero drift?
- [ ] Check agent prompt RULES tables match agent-mistakes.md entries
- [ ] Check for orphaned sections (## RULES and ## NEVER DO inconsistencies)

### Queue Integrity
- [ ] Run `npm run queue:validate` (if exists)
- [ ] All items have valid stage progression in history
- [ ] No stale locks (lockedAt > timeout)
- [ ] Blocked items have documented reasons
```

### 3. New AUD Rules to Add to agent-mistakes.md

```
| AUD-011 | Audit agent must audit ITS OWN audits. Check: did I read all relevant files? Did I verify via MCP when possible? Did I surface remediation prompts in chat (not just file them)? Were my findings evidence-backed? | Audit agent caught itself violating AUD-018 — remediation prompts not delivered to user |
| AUD-012 | When auditing planner output: verify MCP_VERIFICATION_LOG exists and is complete. Check every TC has a specific (not generic) expected value. Flag any "any option" or "~N rows" language | Pricing planner output had 7 missing TCs and multiple approximate values |
```

### 4. Update NEVER DO Table

Add to audit agent NEVER DO:
```
| AUD-028 | Audit an agent without using that agent's specific checklist | Use the agent-specific audit checklist from Mode 2 — generic checks miss agent-specific quality issues |
| AUD-029 | Approve planner output without verifying MCP_VERIFICATION_LOG exists | MCP_VERIFICATION_LOG is mandatory (PLN-022). Missing = automatic CRITICAL finding |
| AUD-030 | Approve generator output without checking artifact-first RCA was followed | Check: were failure-summary.json and error-context.md read before MCP? Were tests run with --grep during debug? |
```

---

## What This Fixes

| Before | After |
|--------|-------|
| Generic checklist for all agent audits | Agent-specific checklists that know what to look for |
| Doesn't check planner's MCP_VERIFICATION_LOG | Mandatory check — missing = CRITICAL finding |
| Doesn't verify generator used artifact-first RCA | Checks artifact reading order and --grep usage |
| Doesn't audit pipeline infrastructure | Context builder, trust progression, sync system all checked |
| Doesn't audit its own methodology | Self-audit checklist mandatory (AUD-011) |
| Findings without remediation prompts | Every finding → agent + copy-pastable fix prompt (enforced) |
| Surface-level structure checks only | Content verification against live DOM via MCP |

---

## Implementation Steps

1. Add Agent-Specific Audit Checklists to Mode 2 section in `playwright-pipeline-audit.agent.md`
2. Add Pipeline Infrastructure Checks to Mode 1/4 section
3. Add AUD-011, AUD-012 to `specs_planning/agent-mistakes.md`
4. Add AUD-028, AUD-029, AUD-030 to NEVER DO table in audit prompt
5. Update Self-Audit section to reference new self-audit checklist
6. Run `npm run sync:mistakes && npm run build:context && npm run validate:sync`
