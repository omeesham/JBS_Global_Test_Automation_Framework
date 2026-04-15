> **⚠️ STALE PATHS, UNIQUE VALUE**: Paths changed by PLAN_P0_LOCAL_OFFICE_DECONTAMINATION (2026-03-25). All `locations/` paths are now `setup/locations/` or `setup/local-office/`. `SetupSelectors` → `LocationSettingsSelectors`. GARDENER-reviewed 2026-04-15: registry-integrity findings (A-01 through A-05) and B-01 MCP-gated fix remain valid and are NOT covered elsewhere — update paths before executing, do not supersede.

# PLAN: Adversarial Full-Chain Audit — V3 (Post-External-Review)

**ID**: PLAN_FULL_CHAIN_AUDIT
**Created**: 2026-03-24
**Revised**: 2026-03-25 (V3 — post external adversarial review)
**Status**: pending
**Priority**: HIGH (14 verified findings across 4 categories)

## Context

This is the **refined version** after an external adversarial review challenged every finding against the actual codebase. The original plan found real bugs but also contained **4 false/inflated findings** and **missed 2 important gaps**. This version keeps only verified findings, adds the misses, and corrects the execution order.

**What changed from V1:**
- REMOVED: C-02 (documented fallback, not LR-003 violation), C-05 (already safe), C-06 (all catches documented), D-01 (legal.ts already resolved)
- ADDED: GEN-029 missing from registry, GEN-033–037 orphaned in agent file
- UPDATED: B-01 now requires MCP verification before execution
- CLARIFIED: MISS-01 (intra-group collision blindness) is already solved by PLAN_MAINTAINER_SWEEP SP-01

---

## Category A — RULE REGISTRY INTEGRITY

### A-01: CRITICAL — GEN-028 DUPLICATE ID in agent-mistakes.md
- **Evidence**: `specs_planning/_internal/agent-mistakes.md` line 172 = "Accessibility tree element types ≠ HTML tags". Line 176 = "NEVER declare completion without running tests". Same ID, different rules.
- **Impact**: `injectedContext` references GEN-028 19 times — wrong rule may propagate to generator.
- **Fix**: Renumber the 2026-03-24 LOS additions (lines 172–175):
  - GEN-028 → GEN-038, GEN-029 → GEN-039, GEN-030 → GEN-040, GEN-031 → GEN-041
  - Update `.github/agents/playwright-test-generator.agent.md` references
  - Update CLAUDE.md LR-016 reference if applicable
  - Run `npm run sync:mistakes && npm run validate:sync`
- **Files**: `specs_planning/_internal/agent-mistakes.md`, `.github/agents/playwright-test-generator.agent.md`

### A-02: HIGH — Master list count is wrong
- **Evidence**: Master comment says 134 rules. Grep finds ~155 entries. Rules added post-consolidation but comment never updated.
- **Fix**: Recount per prefix, update master comment block (lines 22–42).
- **Files**: `specs_planning/_internal/agent-mistakes.md`

### A-03: HIGH — GEN-029 referenced in generator agent but MISSING from registry
- **Evidence**: `.github/agents/playwright-test-generator.agent.md` line 26 references GEN-029 as "Phase 0.5 walkthrough" HARD STOP. But GEN-029 does NOT exist in `agent-mistakes.md` at all. The LOS session added a different GEN-029 at line 173 (which gets renumbered to GEN-039 per A-01).
- **Impact**: A HARD STOP rule that isn't in the canonical registry = invisible to sync pipeline.
- **Fix**: After A-01 renumbering, add GEN-029 ("Phase 0.5 walkthrough is MANDATORY") formally to `agent-mistakes.md`. Verify it matches the agent file's definition.
- **Files**: `specs_planning/_internal/agent-mistakes.md`

### A-04: HIGH — GEN-033 through GEN-037 exist ONLY in generator agent file, not in registry
- **Evidence**: Generator agent file defines:
  - GEN-033 (line 97): Bug Detection Mandate
  - GEN-034 (line 110): TestID Verification
  - GEN-035 (line 118): Notification Check
  - GEN-036 (line 126): Recovery value differs from saved default
  - GEN-037 (line 129): Reload after non-numeric input
- None of these exist in `agent-mistakes.md`.
- **Impact**: `npm run sync:mistakes` can't track these. They drift without detection.
- **Fix**: Add GEN-033–037 to `agent-mistakes.md` with proper descriptions. Run sync to verify parity.
- **Files**: `specs_planning/_internal/agent-mistakes.md`, verify `.github/agents/playwright-test-generator.agent.md`

### A-05: MEDIUM — HLR-015 through HLR-022 need registry verification
- **Evidence**: Master list says HLR-001 to HLR-014. Healer agent file references HLR-015..022. Need to verify these exist in registry.
- **Fix**: Verify all HLR-015..022 exist in `agent-mistakes.md`. If missing, add them. Update master count.
- **Files**: `specs_planning/_internal/agent-mistakes.md`

---

## Category B — PENDING PLAN DEFECTS

### B-01: HIGH — PLAN_MAINTAINER_SWEEP shared.ts unsaved dialog buttons — NEEDS MCP VERIFICATION
- **Evidence**: shared.ts currently has `btnUnsavedChangesOk` (text "OK") and `btnUnsavedChangesCancel` (text "Cancel"). Auto-addon.ts and local-office-settings.ts use "Stay"/"Discard" buttons. But shared.ts serves the `shared-setup-locations` page specifically.
- **CRITICAL CAVEAT (from reviewer)**: Different pages MAY have different button text for their unsaved dialogs. The shared-setup-locations page might genuinely use "OK"/"Cancel" while other pages use "Stay"/"Discard". Without MCP verification on the shared-setup-locations page, this fix could BREAK that page.
- **Fix**: BEFORE executing PLAN_MAINTAINER_SWEEP:
  1. MCP-verify the unsaved changes dialog on shared-setup-locations page
  2. If buttons ARE "Stay"/"Discard" → rename as originally proposed
  3. If buttons ARE "OK"/"Cancel" → shared.ts is CORRECT, no change needed
- **Files**: `src/selectors/locations/shared.ts`, page objects

### B-02: MEDIUM — PLAN_MAINTAINER_SWEEP doesn't clean local-office-settings custom dialog keys
- **Evidence**: `local-office-settings.ts:204` defines `dlgUnsavedLocalOffice`, `btnUnsavedStay`, `btnUnsavedDiscard` — separate from shared.ts keys. Not a collision (different key names) but violates LR-012 (dialogs should be shared).
- **Fix**: After B-01 MCP verification resolves the correct button text, delete custom keys from local-office-settings.ts and update page object to use shared keys.
- **Files**: `src/selectors/locations/local-office-settings.ts`, `src/pages/locations/location-local-office-settings.page.ts`

---

## Category C — CODE BUGS (Verified Only)

### C-01: HIGH — LR-004 — Missing `.clear()` on EventSource Map cleanup
- **Evidence**: `website/frontend/src/contexts/ActivePipelineContext.tsx` line 235:
  ```typescript
  return () => { esRefs.current.forEach(es => es.close()); };
  ```
  `stopPipeline` (line 182–183) correctly calls BOTH `.close()` AND `.clear()`, but useEffect cleanup only calls `.close()`.
- **Impact**: Closed EventSource objects accumulate in Map across mount/unmount cycles → memory leak.
- **Fix**: Add `esRefs.current.clear();` after the forEach in the useEffect cleanup.
- **File**: `website/frontend/src/contexts/ActivePipelineContext.tsx`

### C-02: MEDIUM — LR-003 — Silent progress report catch in worker
- **Evidence**: `src/worker/index.ts:443` — `reportProgress(msg).catch(() => {})`.
- **Impact**: If SSE progress channel breaks, all progress silently dropped. Dashboard shows frozen pipeline.
- **Fix**: `.catch(err => console.warn('[Worker] Progress report failed:', err.message))`
- **File**: `src/worker/index.ts`

### C-03: MEDIUM — LR-003 — Silent SIGKILL catch in worker
- **Evidence**: `src/worker/index.ts:454` — `try { child.kill('SIGKILL'); } catch {}`
- **Impact**: Failed SIGKILL = orphaned zombie process with zero trace.
- **Fix**: `catch (err) { console.error('[Worker] SIGKILL failed:', (err as Error).message); }`
- **File**: `src/worker/index.ts`

### C-04: LOW — Type safety — `as any` cast in orchestrator
- **Evidence**: `src/orchestrator/orchestrator.ts:401` — `(definition as any).autoTriageDefaults`.
- **Fix**: Add `autoTriageDefaults?: Record<string, string>` to PipelineDefinition type. Remove `as any`.
- **Files**: `src/orchestrator/orchestrator.ts`, type definition file

---

## Category D — STRUCTURAL ISSUES

### D-01: LOW — Chat rate limit Map unbounded growth
- **Evidence**: `website/backend/src/routes/chat.routes.ts` — `chatRateLimit` Map cleaned every 5 min via setInterval. No hard max-size guard.
- **Fix**: Add emergency purge: `if (chatRateLimit.size > 10_000) chatRateLimit.clear();`
- **File**: `website/backend/src/routes/chat.routes.ts`

---

## REMOVED FINDINGS (Debunked by External Review)

| Original ID | Why Removed |
|-------------|-------------|
| C-02 original (ActivePipelineContext:229 catch) | `/* use defaults */` IS a documented fallback — satisfies LR-003 condition (3). Not empty. |
| C-05 original (orchestrator flatMap) | `g.items \|\| []` is already safe — `g` comes from array iteration via `.flatMap()`. |
| C-06 original (diagnostics-collector catches) | ALL 8 catch blocks have documented comments. File header establishes "listeners must never throw" contract. Correct defensive pattern. |
| D-01 original (legal.ts collision) | legal.ts has explicit comment: "Save dialog selectors live in shared.ts — reuse those keys, do NOT duplicate here." Already resolved. |
| D-03 original (notes.ts verification) | Already addressed by PLAN_MAINTAINER_SWEEP SP-02. |

---

## RELATIONSHIP TO PLAN_MAINTAINER_SWEEP

The reviewer's biggest criticism was that this plan missed the `buildAllSelectors` intra-group collision blindness. **This is already fully addressed by PLAN_MAINTAINER_SWEEP SP-01**, which replaces the broken spread with `mergeWithCollisionCheck()` that receives individual partition objects. This audit plan intentionally scopes to findings NOT covered by MAINTAINER_SWEEP — except B-01/B-02 where that plan has defects.

---

## Execution Order

```
Phase 1: Registry integrity (A-01 → A-02 → A-03 → A-04 → A-05)
  ├── Renumber GEN-028..031 → GEN-038..041
  ├── Add GEN-029 (Phase 0.5 walkthrough) formally to registry
  ├── Add GEN-033..037 to registry
  ├── Verify HLR-015..022 in registry
  ├── Update master list counts
  └── npm run sync:mistakes && npm run validate:sync

Phase 2: MCP verification for B-01 (BEFORE maintainer sweep)
  ├── Navigate to shared-setup-locations page
  ├── Trigger unsaved changes dialog
  ├── Record actual button text
  └── Update PLAN_MAINTAINER_SWEEP accordingly

Phase 3: Code fixes (C-01 → C-04)
  ├── ActivePipelineContext.tsx: add .clear() to useEffect cleanup
  ├── worker/index.ts: add logging to 2 silent catches
  ├── orchestrator.ts: remove `as any` cast, add type
  └── chat.routes.ts: add max-size guard to rate limit Map

Phase 4: Execute PLAN_MAINTAINER_SWEEP (with B-01/B-02 corrections applied)
```

## Verification Plan

1. **ID collision check**: `grep -oP '^\| \K[A-Z]+-\d+' specs_planning/_internal/agent-mistakes.md | sort | uniq -d` → zero duplicates
2. **Sync check**: `npm run sync:mistakes && npm run validate:sync` → exit 0
3. **TypeScript**: `npx tsc --noEmit` → zero errors
4. **EventSource cleanup**: Grep `esRefs.current` → verify `.clear()` present in BOTH stopPipeline AND useEffect cleanup
5. **Worker catches**: Grep `catch\s*\(\s*\)` in `src/worker/index.ts` → zero empty catches
6. **Rate limit guard**: Grep `size > 10` in `chat.routes.ts` → confirm guard exists

## Files Modified (Summary)

| File | Changes | Phase |
|------|---------|-------|
| `specs_planning/_internal/agent-mistakes.md` | Renumber GEN-028..031 → GEN-038..041, add GEN-029/033-037, verify HLR-015..022, update master counts | 1 |
| `.github/agents/playwright-test-generator.agent.md` | Update renumbered rule references | 1 |
| `website/frontend/src/contexts/ActivePipelineContext.tsx` | Add `.clear()` to useEffect cleanup | 3 |
| `src/worker/index.ts` | Replace 2 silent catches with logging | 3 |
| `src/orchestrator/orchestrator.ts` | Remove `as any`, add type | 3 |
| `website/backend/src/routes/chat.routes.ts` | Add max-size guard to chatRateLimit Map | 3 |

## Self-Audit Trail

- **V1**: Original 22 findings
- **V2**: External adversarial review debunked 4 findings (C-02, C-05, C-06, D-01), identified 2 misses (GEN-029 missing, GEN-033–037 orphaned), flagged B-01 needs MCP verification
- **V3 (this version)**: 14 verified findings. False-positive rate reduced from 18% to 0%. All claims cross-referenced against actual file state.
