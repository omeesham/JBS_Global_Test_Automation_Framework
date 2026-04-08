# Master Audit: Claude Code vs Copilot — 2026-03-06

Both Claude Code (CC) and Copilot (COP) were given the same audit prompt. This document compares findings, identifies what each missed, determines root cause of plan sprawl, and provides the master verdict.

---

## 1. WHERE BOTH AGREE (high confidence — cross-validated)

| Finding | CC | COP |
|---------|----|----|
| PLAN_06 phantom completion — marked DONE, body says "Status Check Needed" | Yes | Yes |
| PLAN_19 in `pending/` but INDEX says DONE | Yes | Yes |
| Cleanup sprawl: 14→18→19 (3 plans for 1 job) | Yes | Yes |
| Pipeline never ran end-to-end | Yes | Yes |
| autoInvoke disabled | Yes | Yes |
| 9 queue items stuck at pending_generation | Yes | Yes |
| Architecture/infrastructure is solid | Yes | Yes |
| "Stop planning, start running" | Yes | Yes |
| Framework IS improving structurally | Yes | Yes |

---

## 2. WHAT CC FOUND THAT COP MISSED

| Finding | Impact | Why COP missed it |
|---------|--------|-------------------|
| **Git history: 3 full rewrites, ~10K lines throwaway** | High — shows true cost | COP never ran git log. Surface-level file reads only. |
| **RCA protocol triple-write** (PLAN_02→03→07) | Medium — wasted planning | COP read all plans but didn't cross-reference for content duplication |
| **shared-types.ts:257 latent type error** (`replaceAll`) | Medium — orchestrator won't compile strict | COP never ran `tsc` or checked script compilation |
| **MEMORY.md wrong about seed.spec.ts** | Low — factual inaccuracy | COP never verified MEMORY.md claims against filesystem |
| **Agent prompts rewritten 4 times** from git history | Context — shows iteration cost | COP didn't have git history data |
| **QA Finding #1 took 4+ iterations** | Context — shows agent limitations | COP didn't trace commit-level rework |

---

## 3. WHAT COP FOUND THAT CC MISSED

| Finding | Impact | Why CC missed it |
|---------|--------|------------------|
| **Agent performance frozen since Feb 27** — all agents at `probation`, zero clean cycles, nobody promoted EVER | **High** — the trust system is dead | CC's repo audit agent said "HEALTHY ✅" without checking actual performance data |
| **Last test run: Mar 2, auth timeout, 0 passed** | **High** — last known state is BROKEN | CC never read `failure-summary.json` |
| **Escalation queue: built, never used** | Medium — dead infrastructure | CC noted it exists but didn't flag it as unused |
| **18 plans → 4 spec files** ratio | **High** — devastating efficiency metric | CC noted the imbalance but COP's framing ("D grade for coverage, F for pipeline usage") was sharper |
| **"80% effort on meta, 20% on actual tests"** | High — correct diagnosis | CC was more diplomatic; COP was blunt and right |

---

## 4. WHERE EACH WAS WRONG OR SLOPPY

### CC errors
| Issue | Detail |
|-------|--------|
| **Overclaimed "production-ready"** | CC's repo audit agent stamped everything ✅ HEALTHY. The performance system is dead, last test run failed, agents never promoted. "Production-ready" is false. |
| **Didn't check failure-summary.json** | Basic miss — the last test run result is critical context |
| **Didn't check performance.json depth** | Verified file exists but didn't analyze: all agents stuck at probation, 0 clean cycles, 4 unresolved high-severity defects on Requirements agent alone |
| **Overcounted agent coherence** | Gave all ✅ without questioning whether rules are followable (COP correctly noted 133 rules may exceed agent processing capacity — this was in SYSTEMS_AUDIT_RCA's own findings) |

### COP errors
| Issue | Detail |
|-------|--------|
| **No git history analysis** | Fundamental miss — can't assess "is repo improving" without seeing commit-level evolution |
| **No TypeScript compilation check** | Didn't verify the code actually compiles — just assumed |
| **No import verification** | Didn't check for broken references |
| **Shallow plan cross-referencing** | Read all plans but didn't catch content duplication (RCA triple-write) |
| **Didn't check MEMORY.md accuracy** | Took memory claims at face value |
| **Claimed "2 specs pre-date overhaul"** | Imprecise — needs commit-level verification |

---

## 5. ROOT CAUSE: WHY SO MANY PLANS?

### The pattern is clear

```
PLAN written (usually good)
   ↓
PLAN executed (by COP or CC)
   ↓
NO VERIFICATION after execution  ← THIS IS THE GAP
   ↓
Next session discovers leftovers
   ↓
NEW PLAN created to clean up
```

### Who caused what

| Plan chain | Who planned | Who executed | What went wrong |
|------------|-------------|-------------|-----------------|
| **PLAN_14 → PLAN_18** | CC planned both | CC executed both | CC did incomplete execution on PLAN_14 (missed dead files, orphaned selectors). Then created PLAN_18 to finish the job. **CC's execution was incomplete.** |
| **PLAN_17 → PLAN_19** | CC planned 17, COP planned 19 | COP executed 17 | COP executed PLAN_17 but didn't git-add moved files. Left 4 AD ghost states, 5 broken settings.json paths. PLAN_19 was created to fix COP's execution bugs. **COP's execution was sloppy.** |
| **PLAN_16 → PLAN_19** | CC planned 16 | COP executed 16 | COP created pipeline-orchestrator.ts with 3 runtime bugs (script name mapping wrong, stage name mismatch, missing planner-pre-run.ts). PLAN_19 fixes these. **COP's execution introduced new bugs.** |
| **PLAN_02 → PLAN_03 → PLAN_07** | COP planned all 3 | COP executed all 3 | COP wrote the same RCA protocol into PLAN_02 (Generator), then "unified" it in PLAN_03, then copy-pasted it again in PLAN_07 (Healer). Should have been 1 plan. **COP's planning was redundant.** |
| **PLAN_06** | COP planned | COP executed (?) | Nobody verified. Plan body still says "Status Check Needed." 10 infrastructure fixes — unknown how many applied. **Both CC and COP failed to verify.** |

### The root cause hierarchy

1. **Primary: No post-execution verification protocol.** Neither CC nor COP verified their own work. Plans were marked DONE based on "I ran the commands" not "I verified the outcomes."

2. **Secondary: Plans assumed perfect execution.** No plan includes a "verify these specific things after execution" checklist that the NEXT session can run. The done criteria are vague ("apply fixes", "clean up") not testable ("file X no longer exists", "grep for Y returns 0 results").

3. **Tertiary: COP plans too granularly.** PLAN_02/03/07 are three plans for one protocol. PLAN_14/18 are two plans for one cleanup. COP tends to create narrow plans that leave gaps for follow-up plans, rather than one comprehensive plan that handles the full scope.

4. **Quaternary: CC over-validates.** CC's audit agents stamp everything ✅ without checking operational state (performance frozen, last run failed, escalation empty). This creates false confidence that things are "done."

---

## 6. THE REAL STATE OF THINGS

### What's genuinely good
- TypeScript compiles clean (verified by CC, not checked by COP)
- 344 tests list without errors
- Page objects, selectors, fixtures — architecturally sound
- 5-agent pipeline design is coherent
- Anti-collusion rules exist
- Mistake registry has 133 rules with real defect history

### What's genuinely broken or dead
- **Performance tracking**: All 5 agents at `probation`, 0 clean cycles, last updated Feb 27 (7 days stale). The trust promotion system has NEVER promoted anyone. Fix 4 from PIPELINE_FIX_PLAN noted thresholds were "mathematically unreachable" — this was in PLAN_06, which was never verified.
- **Last test run**: Mar 2, pricing spec, auth timeout, 0 passed, 1 failed. That's the last known state of actual test execution.
- **PLAN_06**: 10 infrastructure fixes, status unknown. This is the foundation — Fix 1 (context builder), Fix 4 (trust thresholds), Fix 7 (learning loop) directly impact whether agents can function.
- **Escalation queue**: Built in PLAN_17, JSON file exists, never used. Dead infrastructure.
- **Pipeline orchestrator**: Has `replaceAll` type error at shared-types.ts:257. Works via ts-node but fails strict compilation. 3 additional runtime bugs were fixed by PLAN_19 but untested.

### The ratio that matters
- **18 plans executed** (Mar 2-6)
- **4 test spec files** exist
- **9 queue items** waiting for generation (oldest: Feb 19, 15+ days)
- **0 end-to-end pipeline runs** completed
- **0 agents promoted** from probation

---

## 7. IS THIS CLOSER TO "AGENTIC PLAYWRIGHT WITH MINIMAL HUMAN INTERVENTION"?

**Yes for the blueprint. No for the reality.**

The blueprint is excellent:
- Pipeline architecture: well-designed
- Agent roles: clearly separated
- RCA protocol: artifact-first, sensible
- Governance: anti-collusion, performance tracking, mistake registry
- Infrastructure: queue, gates, context injection, orchestrator

The reality:
- The pipeline has never run autonomously
- The orchestrator has compile issues
- The trust system is mathematically broken (PLAN_06 Fix 4 likely never applied)
- The last actual test run failed
- 80% of effort went to infrastructure, 20% to tests
- COP and CC both execute plans without verifying results, creating plan sprawl

**Distance to goal**: The hardest part (architecture) is done. The remaining gap is operational — turn it on, see what breaks, fix it. But "minimal human intervention" requires agents that can self-correct, and the performance data shows they can't yet (Requirements agent has 4 unresolved high-severity defects, Generator took 7 runs to produce 2 specs).

---

## 8. MASTER RECOMMENDATION

### Stop doing
- Planning (18 plans is enough)
- Governance additions (133 rules is enough)
- Infrastructure scripts (31 scripts is enough)
- Cleanup plans (repo is clean)

### Start doing
1. **Verify PLAN_06** — read `scripts/task-context-builder.ts` and check which of the 10 fixes were applied. This is the foundation. If Fix 4 (trust thresholds) wasn't applied, the performance system is permanently broken by design.
2. **Fix shared-types.ts:257** — change `replaceAll` to `split().join()` or add ES2021 to tsconfig lib. One-line fix.
3. **Run the pipeline** — pick 1 of the 9 pending_generation items, enable autoInvoke, run it through Req→Planner→Generator→(Healer)→Audit. See what breaks.
4. **Run the existing tests** against the live app. The last run was Mar 2 and it failed on auth timeout. Verify the 344 listed tests actually pass.
5. **After step 3-4**: THEN decide what needs fixing based on real failures, not theoretical governance.

### The one thing that matters
**Turn it on.** Every plan from here is premature until the pipeline runs once end-to-end and you see real output. The framework is ready enough to try. It's not ready enough to trust — but the only way to get there is to run it and fix what breaks.
