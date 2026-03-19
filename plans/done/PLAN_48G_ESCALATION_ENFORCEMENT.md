# PLAN 48G: Cross-Agent Escalation Enforcement

## Status: PENDING
## Priority: P1-HIGH
## Depends On: Nothing

## Problem

The escalation system (agent-escalations.json, task-context-builder injection, ALL-028/031 rules) is fully designed but 100% dormant. Zero escalations have ever been created. Agents skip the "create escalation" step every time because there's no enforcement. When Agent B finds Agent A's mistake, it either silently fixes it (if in scope) or ignores it (if not in scope). The responsible agent never learns, never fixes their own files, and the mistake repeats.

**What already exists** (leverage, don't rebuild):
- `specs_planning/_internal/agent-escalations.json` — storage with schema (empty)
- `scripts/shared-types.ts` — `EscalationEntry` type with pendingFor, severity, category, evidence
- `scripts/task-context-builder.ts` — reads escalations, injects into agent's `injectedContext.pendingEscalations`
- `config/context-builder-prompts.json` — tells agents to check escalations at startup
- `docs/read_only_docs/AGENT_SHARED_RULES.md` ALL-028/031 — the protocol rules

**What's missing** (this sub-plan):
1. Pre-flight gate that BLOCKS agents from proceeding until pending escalations are resolved
2. Mandatory escalation creation when agent finds upstream mistake in inherited work
3. Post-complete gate that validates escalations were addressed
4. Audit agent verification that escalations are being created (not skipped)

---

## Changes

### 1. Pre-flight gate: agents MUST resolve their pending escalations first

**File: `scripts/healer-pre-run.ts`** — Add after existing PF checks:
```typescript
// PF-ESC: Check pending escalations assigned to this agent
const escFile = path.join(process.cwd(), 'specs_planning/_internal/agent-escalations.json');
if (fs.existsSync(escFile)) {
  const escData = JSON.parse(fs.readFileSync(escFile, 'utf-8'));
  const pending = escData.escalations.filter(
    (e: any) => e.pendingFor === 'healer' && e.status === 'open'
  );
  if (pending.length > 0) {
    console.log(`[PF-ESC] ${pending.length} open escalation(s) assigned to healer:`);
    for (const esc of pending) {
      console.log(`  - ${esc.id}: ${esc.summary} (from ${esc.createdBy}, severity: ${esc.severity})`);
    }
    console.log('[PF-ESC] RESOLVE these before proceeding with new work.');
  }
}
```

Same pattern for: `generator-pre-run.ts`, `planner-pre-run.ts` (if exists), `requirements-pre-run.ts` (if exists).

### 2. Mandatory escalation creation in agent prompts

**File: `.github/agents/playwright-test-healer.agent.md`** — Update Inherited Work Protocol:
```markdown
### Inherited Work Protocol (ALL-028..031) — ENFORCED
- When receiving work from another agent: READ fully, VERIFY 3+ claims
- If something is WRONG and NOT in your file ownership scope:
  **MANDATORY**: Create escalation in `specs_planning/_internal/agent-escalations.json`:
  {
    "id": "ESC-{NNN}",
    "createdBy": "healer",
    "createdAt": "<ISO timestamp>",
    "pendingFor": "<owning agent>",
    "severity": "error|warning",
    "category": "stale-tc|wrong-selector|missing-coverage|wrong-requirement|logic-error|outdated-artifact",
    "summary": "<one-line: what's wrong>",
    "evidence": "<file:line or MCP result proving it>",
    "affectedArtifacts": ["<file paths>"],
    "status": "open",
    "resolvedBy": null,
    "resolvedAt": null,
    "resolution": null
  }
- NEVER silently fix another agent's owned files without escalation
- NEVER ignore a mistake in upstream work — escalate or fix, never skip
```

Same pattern for ALL agent files.

### 3. File ownership → escalation routing map

Add to `docs/read_only_docs/AGENT_SHARED_RULES.md`:

```markdown
### §15. Escalation Routing by File Ownership

| Mistake Found In | Owner (pendingFor) | Category |
|-----------------|-------------------|----------|
| REQUIREMENTS.md wrong | requirements | wrong-requirement |
| Test cases (specs_planning/test-cases/) | planner | stale-tc |
| Test plan (specs_planning/test-plans/) | planner | stale-tc |
| Selectors wrong in index.ts | planner (if new) or healer (if fix) | wrong-selector |
| Spec file (.spec.ts) logic wrong | generator | logic-error |
| Page object method wrong | generator (if new) or healer (if fix) | logic-error |
| MCP_VERIFICATION_LOG outdated | planner | outdated-artifact |
| Agent rules wrong | audit | logic-error |
| Framework code (base-page, utils) | maintainer | logic-error |

Rule: ALWAYS escalate to the agent who OWNS the file, not the one who last touched it.
```

New shared rules:

| ID | Rule | Violation = |
|----|------|-------------|
| ALL-035 | MANDATORY ESCALATION: When finding upstream agent's mistake that is NOT in your file scope, you MUST create an escalation entry. Skipping = collusion. | Agent coverup |
| ALL-036 | RESOLVE FIRST: At session start, check pending escalations. Fix ALL open items assigned to you BEFORE new work. | Ignored feedback |
| ALL-037 | ESCALATION EVIDENCE: Every escalation must include file:line or MCP evidence proving the issue. No hearsay. | False accusation |

### 4. Post-complete gate: validate escalations were addressed

**File: `scripts/healer-post-complete.ts`** — Add:
```typescript
const escFile = path.join(process.cwd(), 'specs_planning/_internal/agent-escalations.json');
if (fs.existsSync(escFile)) {
  const escData = JSON.parse(fs.readFileSync(escFile, 'utf-8'));
  const stillOpen = escData.escalations.filter(
    (e: any) => e.pendingFor === 'healer' && e.status === 'open'
  );
  if (stillOpen.length > 0) {
    console.warn(`[POST-ESC] WARNING: ${stillOpen.length} escalation(s) still open after session:`);
    for (const esc of stillOpen) {
      console.warn(`  - ${esc.id}: ${esc.summary}`);
    }
  }
}
```

Same for all agent post-complete scripts.

### 5. Audit agent: verify escalation discipline

**File: `.github/agents/playwright-pipeline-audit.agent.md`** — Add rules:

| ID | Rule |
|----|------|
| AUD-022 | ESCALATION DISCIPLINE: Check agent-escalations.json. If an agent found upstream mistakes but created ZERO escalations = skipped ALL-035. Critical finding. |
| AUD-023 | ESCALATION RESOLUTION: Check all resolved escalations — verify the fix actually addresses the issue. |
| AUD-024 | ORPHANED ESCALATIONS: Any escalation open > 7 days with the owning agent having run since creation = agent ignored it. Critical finding. |

### 6. Escalation counter in agent self-audit

Update §8 Self-Audit Checklist for ALL agents — add item:
```
- Escalations created for upstream issues found? (ALL-035)
- Pending escalations assigned to me resolved? (ALL-036)
```

---

## Example Flow

1. **Healer** runs, reads pricing spec failure
2. **Healer** does Phase 0 triage, finds 500 API error = BUG
3. **Healer** also notices TC-LOC-PRI-001 expected value doesn't match live state
4. **Healer** creates BUG report for the 500 (48D)
5. **Healer** creates ESCALATION for Planner: `{pendingFor: "planner", category: "stale-tc", summary: "TC-LOC-PRI-001 expected value stale"}`
6. Next time **Planner** is invoked, pre-flight gate shows: `[PF-ESC] 1 open escalation`
7. **Planner** resolves: verifies live state, updates TC, marks escalation resolved
8. **Audit** verifies: escalation created (ALL-035), resolved (ALL-036), fix matches (AUD-023)

---

## Verification

1. Run Healer on a known upstream mistake
2. Check `agent-escalations.json` — new entry created with correct `pendingFor` agent
3. Run the target agent — verify pre-flight shows the escalation
4. After target agent fixes — verify escalation status is `resolved`
5. Run Audit — verify AUD-022/023/024 checks pass

## Files

- `scripts/healer-pre-run.ts` — add PF-ESC check
- `scripts/healer-post-complete.ts` — add POST-ESC validation
- `scripts/generator-pre-run.ts` — add PF-ESC check
- `scripts/generator-post-complete.ts` — add POST-ESC validation
- `.github/agents/playwright-test-healer.agent.md` — enforced escalation protocol
- `.github/agents/playwright-test-generator.agent.md` — enforced escalation protocol
- `.github/agents/playwright-test-planner.agent.md` — enforced escalation protocol
- `.github/agents/playwright-requirements.agent.md` — enforced escalation protocol
- `.github/agents/playwright-pipeline-audit.agent.md` — AUD-022/023/024
- `docs/read_only_docs/AGENT_SHARED_RULES.md` — §15 escalation routing, ALL-035/036/037, updated §8 self-audit
