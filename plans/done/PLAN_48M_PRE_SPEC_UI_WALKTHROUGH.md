# PLAN 48M: Pre-Spec UI Walkthrough & Bug Detection Protocol

## Status: PENDING
## Priority: P0-CRITICAL
## Depends On: 48B (Healer browser tools), 48H (Planner behavioral docs), 48K (MCP in autonomous pipeline)

## Problem

Real evidence (2026-03-17 Copilot session): Generator spent 2+ hours failing on `location-account-address.spec.ts`. When user forced it to "try out every step on the MCP before actually blindly putting them on specs," it found ALL root causes and fixed everything in one pass.

### Three root causes discovered ONLY through UI walkthrough:

1. **Reset button mutation**: Clicking Reset in Account List dialog clears Angular's `accountId` in the form model. Cancel exits with `accountId = null`. When TC-015 later calls Save, it writes null to DB — permanently wipes Parker Palm Springs venue association. Every subsequent run fails.
2. **403 API error**: Intermittent 403 on `getLocationDetail` causes tab to not load. No test detects this.
3. **Post-reload timing race**: After `page.reload()`, phone1 loads before phone2 in Angular change detection. Readiness gate waits for phone1 only, so phone2 reads `""` for TC-020.

### Why existing agent prompts didn't catch these:

- **Planner tests fields individually** (edit, save, reload, verify). Doesn't test **multi-step sequences** or **dialog side effects** (Reset+Cancel→later Save = mutation)
- **Generator uses MCP only for selector validation and "last resort" RCA** (GEN-005). Never walks through TC steps on UI BEFORE writing code
- **Healer treats MCP as "last resort" Step 6**. For selector/assertion failures, it should be the FIRST diagnostic tool

### Design Decision

"Should we give it as a first task to generator or a last task to planner?"

**Answer: Both, for different things.**
- Planner gets enhanced Phase 2 (deeper behavioral edge case testing — dialog side effects, API monitoring, form state tracking)
- Generator gets new Phase 0.5 (walk through TC steps in sequence on live UI BEFORE writing code)
- Healer gets mandatory MCP diagnostic for selector/assertion failures (promoted from "last resort")

**Why Generator, not Planner, owns the walkthrough**: Planner CAN'T walk through "spec test steps" because specs don't exist during planning. TCs describe SEQUENCES (do A, then B, then C). Side effects emerge from the SEQUENCE, not individual steps. Generator is the first agent that has the sequence.

**Why Planner still gets enhanced**: Planner CAN catch the building blocks ("Reset button clears form model" is discoverable during Phase 2 if you test dialog Cancel/Reset side effects). This feeds Generator higher-quality behavioral docs.

---

## Changes

### 1. Generator: Phase 0.5 — UI Step Walkthrough (GEN-029..032)

**File**: `.github/agents/playwright-test-generator.agent.md`
**Insert**: Between Phase 0 Gate and Phase 1

```
**Phase 0.5 — UI Walkthrough (MANDATORY — GEN-029)**

Before writing ANY spec code, walk through EVERY test case's steps on the live MCP browser.
You have TCs on paper. Verify each one matches reality BEFORE translating to code.

1. Navigate to the page URL from Planner's MCP_VERIFICATION_LOG
2. For EACH test case (in spec serial order):
   a. Read the TC steps from the test cases file
   b. Execute each step on MCP: click, type, select — exactly as TC describes
   c. After each step: browser_snapshot — does UI match TC expectation?
   d. Log result per TC step (see WALKTHROUGH_LOG format below)
   e. Classify any mismatch:
      - PLANNER_GAP: TC expected something undocumented (escalate to Planner)
      - APP_BUG: UI is broken/erroring (file finding per 48D protocol)
      - TC_CORRECTION: TC expected value wrong, actual is correct (fix TC)
      - SEQUENCE_SIDE_EFFECT: Prior TC step left state that breaks this TC
      - TIMING_RISK: Action works but takes >3s (use expect.poll, not direct assert)

3. For EACH dialog interaction: check form state BEFORE and AFTER
   - browser_evaluate to read form model values before Cancel/Reset/Close
   - browser_evaluate again after — did anything change?
   - Document any mutation as SEQUENCE_SIDE_EFFECT with mitigation (reload after)

4. Monitor network during walkthrough:
   - browser_network_requests after every navigation/save/dialog action
   - Flag 4xx/5xx as APP_BUG candidate
   - Flag >3s responses as TIMING_RISK

5. Produce WALKTHROUGH_LOG before Phase 1:

   | TC | Step | Expected | Actual | Status | Classification |
   |----|------|----------|--------|--------|----------------|
   | TC-001 | Navigate to tab | Tab loads | Loads in ~4s | VERIFIED | — |
   | TC-007 | Reset+Cancel | Form unchanged | accountId = null | MISMATCH | SEQUENCE_SIDE_EFFECT: add reload |
   | TC-015 | Save | Saves with venue | 403 intermittent | MISMATCH | APP_BUG: add API check |
   | TC-020 | Reload check phone2 | "111-222-3333" | "" for ~2s | MISMATCH | TIMING_RISK: use expect.poll |

**Phase 0.5 Gate**: Do NOT proceed to Phase 1 if:
- Any APP_BUG without finding filed
- Any PLANNER_GAP without escalation filed
- Any SEQUENCE_SIDE_EFFECT without documented mitigation
```

**New rules:**

| ID | Rule |
|----|------|
| GEN-029 | Phase 0.5 UI Walkthrough MANDATORY: walk through every TC's steps on MCP browser BEFORE writing spec code. Execute in serial spec order. No code without walkthrough. |
| GEN-030 | During walkthrough: `browser_network_requests` after every navigation/save/dialog. Flag 4xx/5xx as APP_BUG. Flag >3s as TIMING_RISK. |
| GEN-031 | During walkthrough: for every dialog Cancel/Reset/Close, verify form model BEFORE and AFTER. Document mutations. Design reload/restore strategy. |
| GEN-032 | WALKTHROUGH_LOG must exist before Phase 1 starts. Remove from spec before final commit. |

**Update GEN-005**: Change from "Pre-flight selector validation and last-resort RCA" → "Phase 0.5 walkthrough, pre-flight selector validation, and RCA. MCP used in THREE phases."

---

### 2. Planner: Enhanced Phase 2 — Behavioral Interaction QA (PLN-032..036)

**File**: `.github/agents/playwright-test-planner.agent.md`
**Insert**: After Phase 2 Steps 8-9 (from 48I), as new Step 10

NOTE: 48H reserves PLN-023..028, 48I reserves PLN-029..031. This plan uses PLN-032+.

```
### Step 10 — BEHAVIORAL INTERACTION QA (PLN-032..036)

Test interactions that create SIDE EFFECTS beyond the field being tested.

10a. DIALOG SIDE EFFECTS (PLN-032):
     For EVERY dialog on the page:
     - Open → interact → Cancel → verify NO parent form state changed
     - Open → interact → Reset → Cancel → verify NO form state changed
     - Open → Escape → verify NO form state changed
     - If ANY mutates parent form: document as DIALOG_SIDE_EFFECT in MCP_VERIFICATION_LOG
     - Use browser_evaluate to check form model values before and after

10b. API MONITORING (PLN-033):
     For EVERY tab navigation:
     - browser_network_requests immediately after navigation
     - Document: endpoint, expected status, actual status, timing
     - Reload 2x to catch intermittent errors

10c. POST-RELOAD TIMING (PLN-034):
     For EVERY save+reload cycle:
     - After reload: do ALL fields load simultaneously or asynchronously?
     - Document which field loads LAST and how long
     - Add "Readiness signal" to MCP_VERIFICATION_LOG

10d. SEQUENTIAL INTERACTIONS (PLN-035):
     Test 3+ multi-step sequences crossing field/dialog boundaries:
     - Modify field → open dialog → cancel → is field change still pending?
     - Open dialog → select → save → reload → is selection reflected?
     - Clear required field → save attempt → error → fill → save → works?

10e. READINESS SIGNALS (PLN-036):
     For EVERY form/tab: what element confirms ALL data loaded?
     - NOT the first field to appear — the LAST field to populate
     - Add to MCP_VERIFICATION_LOG: "Readiness: wait for [element] to have [value]"
```

**New MCP_VERIFICATION_LOG rows** (in addition to 48H's):
```
| Dialog side effects | dialogName: Cancel=safe / Reset+Cancel=MUTATES accountId |
| API calls | tabName: GET /api/endpoint → 200 (occasional 403) ~2s |
| Post-reload timing | phone1: ~1s, phone2: ~3s (LAST to load) |
| Readiness signal | Wait for phone2 to have non-empty value |
| Sequential interactions | Reset→Cancel→Save = DANGEROUS (writes null) |
```

---

### 3. Healer: Mandatory MCP for Selector/Assertion Failures (HLR-028..031)

**File**: `.github/agents/playwright-test-healer.agent.md`
**Change**: Replace "Step 6: MCP replication (LAST RESORT)" with category-dependent routing

```
#### Step 6: MCP Replication (Category-Dependent — HLR-028)

| Failure Category | MCP Required? | When in RCA |
|-----------------|---------------|-------------|
| SELECTOR | MANDATORY | Step 3 (before hypothesis) |
| ASSERTION | MANDATORY | Step 3 (before hypothesis) |
| TIMING | RECOMMENDED | After hypothesis |
| APPLICATION | RECOMMENDED | After hypothesis |
| AUTH/NETWORK/INFRA | LAST RESORT | Only if Steps 1-5 inconclusive |

For SELECTOR/ASSERTION failures, reorder to:
3. Read screenshot
3b. MCP walkthrough: navigate, reproduce EXACT spec steps, browser_network_requests
4. Identify failing line (with MCP evidence)
5. Hypothesis (citing artifact + MCP evidence)
```

**New rules:**

| ID | Rule |
|----|------|
| HLR-028 | For SELECTOR/ASSERTION failures: MCP walkthrough is MANDATORY Step 3, not last-resort Step 6. Navigate, execute exact failing steps, observe DOM. |
| HLR-029 | During MCP diagnostic: `browser_network_requests` after failing steps. If network error exists, reclassify as NETWORK/APP_BUG, not SELECTOR. |
| HLR-030 | Walk through ENTIRE multi-step sequence, not just the failing step in isolation. Side effects compound across steps. |
| HLR-031 | When walkthrough reveals cause is in a PRIOR TC (dirty state), document as SEQUENCE_DEPENDENCY and fix the sequence — don't just fix the assertion. |

---

### 4. Shared Rules: Universal Bug Detection (ALL-042..044)

**File**: `docs/read_only_docs/AGENT_SHARED_RULES.md`
**Insert**: After ALL-041

| ID | Rule |
|----|------|
| ALL-042 | Any agent using MCP MUST check `browser_network_requests` after API-triggering interactions. 4xx/5xx = potential APP_BUG. Never silently ignore. |
| ALL-043 | When walkthrough reveals behavior contradicting MCP_VERIFICATION_LOG: classify (PLANNER_GAP / APP_BUG / TC_CORRECTION / SEQUENCE_SIDE_EFFECT) and escalate. Never silently proceed. |
| ALL-044 | Bug detection is EVERY agent's responsibility. Planner finds 500 error → file it. Generator finds form mutation → file it. Healer finds broken API → file it. All go to `agent-escalations.json`. |

**Update §11 Exploration Scope**: Generator row changes from "Pre-flight check only" → "Phase 0.5 TC walkthrough + pre-flight selector validation." Healer row changes to "SELECTOR/ASSERTION: mandatory MCP. Others: artifact-first."

---

## Cross-Plan References

**48H** (Generator One-Shot Success): 48H covers Planner field-level behavioral docs (PLN-023..028) and Generator artifact discovery (GEN-025..028). 48M adds interaction-level behavioral QA (PLN-032..036) and Generator Phase 0.5 walkthrough (GEN-029..032). Non-overlapping, complementary.

**48B** (Agent MCP Fix): 48B gives Healer full browser tools. 48M DEPENDS on 48B — Healer can't do mandatory MCP walkthrough without those tools. 48M adds the PROTOCOL; 48B adds the CAPABILITY.

**48D** (Triage Classification): 48D's Phase 0 triage classifies WHAT the failure is (BUG/TEST_DEFECT). 48M's enhanced Step 6 defines HOW to diagnose it on MCP. Different phases, complementary.

**48K** (Worker MCP Bridge): 48K gives agents MCP tools in autonomous pipeline. Without 48K, Phase 0.5 only works in Copilot mode.

---

## Files Modified

| File | Change | Rule IDs |
|------|--------|----------|
| `.github/agents/playwright-test-generator.agent.md` | Phase 0.5 walkthrough, update GEN-005 | GEN-029..032 |
| `.github/agents/playwright-test-planner.agent.md` | Phase 2 Step 10 behavioral interaction QA | PLN-032..036 |
| `.github/agents/playwright-test-healer.agent.md` | Category-dependent MCP routing | HLR-028..031 |
| `docs/read_only_docs/AGENT_SHARED_RULES.md` | Bug detection rules, §11 scope update | ALL-042..044 |
| `plans/pending/PLAN_48_AGENT_PIPELINE_OVERHAUL.md` | Add 48M to master index | — |
| `plans/pending/PLAN_48H_GENERATOR_ONE_SHOT_SUCCESS.md` | Cross-reference note | — |

---

## Verification

1. **Planner**: Run on module with dialog → verify MCP_VERIFICATION_LOG has "Dialog side effects" row, "API calls" row, "Readiness signal" row
2. **Generator**: Run on TCs with dialog interaction → verify WALKTHROUGH_LOG produced before any code → verify SEQUENCE_SIDE_EFFECT flagged for Reset+Cancel
3. **Healer**: Trigger SELECTOR failure → verify MCP walkthrough happens at Step 3 (not Step 6) → verify `browser_network_requests` called
4. **End-to-end**: Run full pipeline on location-account-address module → Planner catches Reset mutation + phone2 timing → Generator walkthrough confirms → spec passes first run
