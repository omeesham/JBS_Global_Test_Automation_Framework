# PLAN: Bug Hunting Rulebook v2 — Detection Fixes + data-testid Hard Rule

**Status**: PENDING

## Context

The original PLAN_BUG_HUNTING_RULEBOOK delivered working foundation code (types, classifier, notification system, 20+ agent rules). An external audit found **5 critical bugs** in the detection logic and **80% scope bloat** (DB tables, frontend components, SSE events that don't improve detection). This v2 strips to detection-only fixes plus a new cornerstone rule: **Encore's AI agent generates data-testid for every element — missing = bug from Encore's side, not ours.**

Current selector analysis: 82% data-testid, 18% exceptions (SSO login external, dialogs, dynamic grids). The 18% exceptions are legitimate only for external pages.

---

## What Already Exists (DO NOT REBUILD)

| Item | File |
|------|------|
| `BugHuntCategory` enum (7 values) | `src/framework-contracts/diagnostics.ts:222` |
| `classifyBugHuntCategory()` | `src/utils/bug-hunt-classifier.ts:80` |
| `computeErrorHash()` | `src/utils/bug-hunt-classifier.ts:212` |
| `classifyChangeSize()` | `src/utils/bug-hunt-classifier.ts:184` |
| `checkFlakePromotion()` | `src/utils/bug-hunt-classifier.ts:243` |
| `findExistingBug()` | `src/utils/bug-hunt-classifier.ts:218` |
| `BUG_HUNT_TO_DISPOSITION` mapping (compile-time exhaustive via `Record<>`) | `src/framework-contracts/diagnostics.ts:259` |
| Per-file notification system | `src/utils/agent-notification-writer.ts` |
| Agent rules HLR-018..022, REQ-014..015, GEN-033..035, PLN-033..036, AUD-023..026 | `.github/agents/*.agent.md` |
| Shared rules ALL-053..058 | `docs/read_only_docs/AGENT_SHARED_RULES.md` |
| `pipeline-config.json` bugHuntingRulebook section | `config/pipeline-config.json:25` |
| Bug lifecycle state machine | Already in BugReport interface |
| `BugReport`, `AgentNotification`, `BugHuntEscalation` interfaces | `src/framework-contracts/diagnostics.ts` |

---

## Phase 1: Detection Fixes (8 items)

### FIX-1: errorHash dedup produces different hashes for same bug

**Problem**: `computeErrorHash(testName, failureCategory, errorMessage.slice(0,200))` hashes truncated error text. Playwright errors embed timeouts, element text, stack frames — same bug = different hash each run.

**Changes**:

`src/utils/bug-hunt-classifier.ts` line 212:
- Change signature: `computeErrorHash(testName: string, selectorKey: string, pageUrl: string): string`
- Hash input: `${testName}::${selectorKey}::${new URL(pageUrl).pathname}` (strip query params)
- `selectorKey` = the data-testid value that failed. If no selector (e.g. console error), use `"no-selector"`
- Keep old function as `computeErrorHashV1()` (deprecated) for matching existing bug reports

`src/utils/bug-hunt-classifier.ts` — `ClassifierInput` line 43:
- Add `selectorKey: string` (the data-testid being tested)
- Add `pageUrl: string` (the page URL during failure)

`src/utils/bug-hunt-classifier.ts` — `findExistingBug()` line 218:
- Try v2 hash first, then v1 hash as fallback for old reports

**Verify**: Unit test — same test failing on same selector with different error messages = identical hash.

---

### FIX-2: FEATURE_CHANGED_BIG threshold fires on routine changes

**Problem**: Threshold is 3 files / 5 selectors. A label rename touches selector partition + page object + spec + fixture = 4 files → BIG → false escalation.

**Changes**:

`config/pipeline-config.json` lines 27-31:
- `maxFilesForSmall`: 3 → **6**
- `maxSelectorsForSmall`: 5 → **10**
- Add `"requireStructuralSignal": true` — BIG requires at least one structural signal

`src/utils/bug-hunt-classifier.ts` — `classifyChangeSize()` line 184:
- Add 3rd param: `signals: TriageSignal[]`
- BIG requires BOTH (a) exceeding file/selector threshold AND (b) at least one structural signal (`SIG-LAYOUT-CHANGE`, `SIG-SELECTOR-GONE`, `SIG-SELECTOR-MOVED`)
- File count alone + only `SIG-LABEL-CHANGE` signals = SMALL regardless of count

`src/utils/bug-hunt-classifier.ts` line 108:
- Update caller: `classifyChangeSize(input.affectedSelectors, input.affectedFiles, thresholds, changeSignals)`

**Verify**: Unit test — 7 files affected + only SIG-LABEL-CHANGE = SMALL. 7 files + SIG-LAYOUT-CHANGE = BIG.

---

### FIX-3: REQ-016 wording contradiction with REQ-008

**Problem**: Original plan's REQ-016 said "after every interaction" but REQ-008 says Requirements is READ-ONLY.

**Changes**:

`.github/agents/playwright-requirements.agent.md` — REQ-016:
- Ensure wording says "After every **navigation** (browser_navigate)" not "interaction"
- Add note: "browser_network_requests is a passive read, not an interaction (REQ-008 compatible)"

**Verify**: Grep for "interaction" near REQ-016 in requirements agent prompt. Should find zero.

---

### FIX-4: Compile-time safety for disposition mapping (already done!)

**Disposition typing**: `BUG_HUNT_TO_DISPOSITION` is typed as `Record<BugHuntCategory, TriageDisposition>` — TypeScript already enforces that every enum value is mapped at compile time. Adding a new `BugHuntCategory` without updating the mapping = TS error.
**Priority**: P2-CYCLE-3

**No work needed.** MISS-3 from the audit was wrong about the mapping being incomplete.

**Verify**: Confirmed at `diagnostics.ts:259`. The `Record<>` type handles this.

---

### FIX-5: data-testid HARD RULE (NEW — cornerstone)

**The rule**: Encore's AI agent generates `data-testid` for every interactive element. **For all NEW test cases going forward**, missing data-testid on any Encore-owned page = bug filed against Encore. We do NOT create workaround selectors for new specs. **Existing selectors that work are NOT retroactively converted** — they stay as-is until naturally touched.

**Scope**:
- **NEW specs/TCs**: MUST use data-testid. Missing = file bug, skip test. No workaround selectors.
- **EXISTING selectors**: Keep working as-is. Convert opportunistically when files are touched for other reasons.
- **Exceptions** (workarounds always allowed): `login.microsoftonline.com` / `login.windows.net` (Microsoft SSO), browser-native dialogs, Angular Material shared dialogs that pre-date testid policy.

**Changes**:

`docs/read_only_docs/AGENT_SHARED_RULES.md` — add ALL-059:
> **ALL-059: DATA-TESTID FORWARD RULE (ENCORE-SPECIFIC)**
> Encore's AI agent generates `data-testid` for every element. For ALL NEW test cases and selectors, if an interactive element on an Encore-owned page lacks `data-testid`, this is an APPLICATION BUG from Encore's side. File as `TESTID_MISSING`. Do NOT create workaround selectors (aria-label, text content, CSS combinators) in new code.
> Existing working selectors are grandfathered — convert opportunistically when files are touched.
> Exceptions: Microsoft SSO (`login.microsoftonline.com`, `login.windows.net`), browser-native dialogs, Angular Material shared dialogs.

`.github/agents/playwright-requirements.agent.md` — update REQ-014:
- Add: "Per ALL-059, when documenting NEW pages/features, flag missing data-testid as `[MISSING_TESTID_BUG]` (Encore application bug)"

`.github/agents/playwright-test-generator.agent.md` — update GEN-034:
- Add: "Per ALL-059, for NEW specs: do NOT fall back to aria-label or text selectors for Encore pages. File TESTID_MISSING bug and skip test. Existing specs are grandfathered."

`.github/agents/playwright-test-planner.agent.md` — update PLN-034:
- Add: "Per ALL-059, for NEW test cases: absent data-testid on Encore element = bug. Do NOT create TC with non-testid workaround. Existing TCs are grandfathered."

`src/utils/bug-hunt-classifier.ts` — add helper:
```ts
export function isEncoreOwnedPage(url: string): boolean {
  const externalDomains = ['login.microsoftonline.com', 'login.windows.net'];
  try {
    const hostname = new URL(url).hostname;
    return !externalDomains.some(d => hostname.includes(d));
  } catch { return true; } // If URL parse fails, assume Encore-owned (safe default)
}
```

`src/selectors/SELECTOR_CATALOG.md` — add section:
- "Non-testid selectors on Encore pages" audit table: list the 18% of selectors that don't use data-testid, categorize as (a) external page exception or (b) needs data-testid bug filed

**Verify**: Read ALL-059 in AGENT_SHARED_RULES.md. Grep GEN-034, PLN-034, REQ-014 for ALL-059 reference.

---

### FIX-6: Generator cannot dedup pre-run bugs

**Problem**: Generator finds bugs during Phase 0.5 (before test runs). No error string exists. `computeErrorHash` required error text.

**Fix**: FIX-1's new signature `(testName, selectorKey, pageUrl)` solves this — Generator already knows all three during walkthrough.

`.github/agents/playwright-test-generator.agent.md` — update GEN-033:
- Change dedup guidance: "Use `computeErrorHash(testCaseId, selectorKey, pageUrl)` — works for pre-run detection because it uses stable identifiers, not error text."

**Verify**: Generator walkthrough detects missing testid → computes hash → second run finds existing bug via same hash.

---

### FIX-7: Remove premature escalationSLA config

**Problem**: `escalationSLA` in pipeline-config.json references SLA timers and alerts that have no backend implementation. Dead config that creates false expectations.

**Changes**:

`config/pipeline-config.json` lines 46-50:
- Remove the `escalationSLA` object entirely
- Add comment in `bugHuntingRulebook`: `"_phase2_note": "SLA timers, SSE alerts, and escalation UI are Phase 2 when backend exists"`

**Verify**: No code references `escalationSLA`. Grep confirms zero usage.

---

### FIX-8: Selector catalog documentation (forward-only)

**Problem**: No documentation of which selectors use data-testid vs alternatives, making it hard to track progress toward full coverage.

**Changes** (documentation only, NO code changes, NO bug filing):

`src/selectors/SELECTOR_CATALOG.md` — add section "Selector Strategy Audit":
- List current breakdown: 82% data-testid, 18% alternatives
- Categorize the 18%: (a) external page exceptions (~10 SSO), (b) Angular Material dialogs (~25), (c) dynamic grids (~12)
- Mark categories (a) and (b) as permanent exceptions
- Mark category (c) as "convert when Encore adds data-testid to grid elements"
- Note: "All NEW selectors must use data-testid per ALL-059"

**Verify**: SELECTOR_CATALOG.md has the audit section documenting current state.

---

## Phase 2: Future (OUT OF SCOPE)

Acknowledged, deferred until backend/frontend exists:
- DB tables for bug_reports, test_id_registry, failure_history (file-based works for v1)
- Frontend: TriagePanel 4-category grouping, BugDetailModal, TestIdChangePanel, EscalationBanner
- SSE events for real-time notifications
- SLA timers and auto-alerts
- DOM diff utility, HAR capture, historical correlation
- Escalation rework API chain
- Chat actions for bug lifecycle

---

## Files to Modify

| File | FIX | Change |
|------|-----|--------|
| `src/utils/bug-hunt-classifier.ts` | 1,2,5,6 | New errorHash signature, classifyChangeSize signal check, isEncoreOwnedPage helper |
| `src/framework-contracts/diagnostics.ts` | 1 | Add `selectorKey`, `pageUrl` to ClassifierInput |
| `config/pipeline-config.json` | 2,7 | Thresholds 6/10 + requireStructuralSignal, remove escalationSLA |
| `docs/read_only_docs/AGENT_SHARED_RULES.md` | 5 | Add ALL-059 data-testid hard rule |
| `.github/agents/playwright-requirements.agent.md` | 3,5 | REQ-016 wording fix, REQ-014 upgrade to BUG |
| `.github/agents/playwright-test-generator.agent.md` | 5,6 | GEN-033 dedup, GEN-034 testid hard rule |
| `.github/agents/playwright-test-planner.agent.md` | 5 | PLN-034 testid hard rule |
| `src/selectors/SELECTOR_CATALOG.md` | 8 | Selector strategy audit documentation |

---

## Verification Checklist

| # | What | How |
|---|------|-----|
| V1 | errorHash stable across runs | Unit test: same bug + different error text = same hash |
| V2 | BIG requires structural signal | Unit test: 7 files + SIG-LABEL-CHANGE only = SMALL |
| V3 | REQ-016 says "navigation" | Grep .agent.md files |
| V4 | ALL-059 in shared rules | Read AGENT_SHARED_RULES.md |
| V5 | GEN-034, PLN-034, REQ-014 ref ALL-059 | Grep agent prompts |
| V6 | isEncoreOwnedPage helper exists | Read bug-hunt-classifier.ts |
| V7 | escalationSLA removed | Read pipeline-config.json |
| V8 | Selector strategy documented | Read SELECTOR_CATALOG.md audit section |
| V9 | `npx tsc --noEmit` passes | Run command |
| V10 | Existing tests still pass | `npm test` |

---

## Replaces

This plan **replaces** `plans/pending/PLAN_BUG_HUNTING_RULEBOOK.md`. After execution, move the old plan to `plans/done/` and this becomes the active record.
