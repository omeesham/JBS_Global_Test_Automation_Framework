# SUBPLAN: Copilot Accountability Audit

**Status**: SUPERSEDED
**Executed**: 2026-04-27
**Superseded by**: PLAN_CC_ANTHROPIC_ALIGNMENT.md (Phase 0 — Copilot evict; rules LR-030..LR-034 + ALL-030 graduated; verified DONE 2026-04-27; structural field added by 2026-04-28 supersession-integrity sweep)
**Priority**: P1-CYCLE-2
**Parent**: MASTER_REPO_CLEANUP
**Created**: 2026-04-16
**Absorbs**: PLAN_AUDIT_COPILOT.md (Copilot session paste from 2026-04-10)
**Excludes**: website/, node_modules/ — out of scope per user directive.

### Execution Summary

Substance superseded by [PLAN_CC_ANTHROPIC_ALIGNMENT.md](PLAN_CC_ANTHROPIC_ALIGNMENT.md) Phase 0. The audit-Copilot-accountability premise ("prove our rules covered the gaps so we can't be blamed when Copilot fails again") is moot once Copilot is no longer part of our pipeline (SP1 Phase 0.3 deletes `.github/copilot-instructions.md` and the 6 `playwright-*.agent.md` files). The graduated rules from the 2026-04-10 Copilot session (LR-030..LR-034 + ALL-030 repeat-offense logging) remain in CLAUDE.md and protect future Claude / frontier-agent runs unchanged. No unique work remains.

---

## Goal

Determine whether Copilot session mistakes were because (A) Copilot is dumb and ignored our rules, (B) our rules/infrastructure weren't ready for Copilot, or (C) both. Make sure WE are clean so we can't be blamed for any repeat mistakes if Copilot improves or company switches to Claude CLI.

## Why This Matters

Company people will use Copilot CLI (cheaper) for production orchestration. If Copilot botches it again, we need to prove: "our rules covered this, Copilot ignored them." If we can't prove that, WE get blamed. This audit builds that evidence.

## Source Material

1. **PLAN_AUDIT_COPILOT.md** — full Copilot session paste (Local Information MCP session, 2026-04-10)
2. **LR-030 through LR-034** in CLAUDE.md — rules graduated from that session's mistakes
3. **COP-001 through COP-009** in agent-mistakes.md — Copilot-specific rules
4. **ALL-030** in agent-mistakes.md — rubber-stamp self-audit (repeat offense)

## Known Mistakes from Copilot Session

| # | Mistake | Category |
|---|--------|----------|
| 1 | Skipped TC-079 (SkipBilling→Oracle) without testing the error condition | Lazy SKIP |
| 2 | Skipped TC-078 without changing BillingCycle to "--Select--" | Lazy SKIP |
| 3 | Had MCP browser open but wrote "Steps to Replicate" instead of testing live | Theory over investigation |
| 4 | Never checked network activity during Save investigation | Missing RCA technique |
| 5 | Didn't trace Oracle required validation to source document (v1.docx) | Incomplete requirement tracing |
| 6 | Didn't detect the silent no-op bug (Save button enabled but form.valid = false) | Missed app bug |
| 7 | Rubber-stamp self-audit (ALL-030 repeat offense) | Process failure |

## Direction

For EACH mistake above:

### Step 1: Did a rule exist at the time?
- Check agent-mistakes.md for rules that should have prevented this
- Check CLAUDE.md LR-* rules
- Check copilot-instructions.md ALL-* rules
- Check AGENT_SHARED_RULES.md

### Step 2: Classify
- **COPILOT FAULT**: Rule existed, was injected into context, Copilot ignored it → strengthen COP-* rule enforcement
- **OUR GAP**: No rule existed at the time → graduate into LR-* or ALL-*
- **BOTH**: Rule existed but was too vague to be actionable → rewrite rule with clearer enforcement

### Step 3: Fix
- For COPILOT FAULT: ensure the rule is in COP-* with unmistakable language, verify `npm run sync:mistakes` injects it into Copilot agent prompts
- For OUR GAP: graduate into appropriate rule (LR-* for Claude learned rules, ALL-* for shared)
- For BOTH: rewrite the rule at the source AND add a COP-* specific version

### Step 4: Evidence file
Create `reports/COPILOT_ACCOUNTABILITY_AUDIT.md` documenting: each mistake, classification, rule that should have prevented it, fix applied. This is our proof that we did our due diligence.

## After Processing

- Move PLAN_AUDIT_COPILOT.md to `plans/done/` with execution summary per LR-027
- Run `npm run validate:sync` to confirm all new/updated rules are synced

## Verification

- Every mistake classified as A, B, or C with evidence
- Every OUR GAP has a new rule graduated
- Every COPILOT FAULT has strengthened COP-* enforcement
- `npm run validate:sync` passes
- PLAN_AUDIT_COPILOT.md moved to done/
