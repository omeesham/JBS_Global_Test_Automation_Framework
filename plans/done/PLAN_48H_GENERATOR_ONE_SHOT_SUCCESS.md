# PLAN 48H: Generator One-Shot Success (Upstream Quality + Artifact Discovery)

## Status: PENDING
## Priority: P0-CRITICAL
## Depends On: Nothing
## Extended By: 48M (Pre-Spec UI Walkthrough — adds Generator Phase 0.5 walkthrough GEN-029..032 and Planner interaction-level behavioral QA PLN-032..036)

## Context

Generator (Copilot) spent 2+ hours failing to create location-account-address spec. Root cause analysis reveals **systemic upstream failures**, not Generator incompetence. Generator has ONE job — turn Planner's selectors + TCs into a running spec — and it can't because:

1. **Generator overwrote Planner's existing selector file** — searched barrel `index.ts` only, didn't find partition `account-address.ts`, concluded "selectors don't exist", created new file from scratch with WRONG selectors
2. **Planner didn't document critical behavioral details** causing every single failure:
   - Account List dialog inputs use `placeholder` not `name` → Generator assumed `input[name="accountNumber"]` (wrong)
   - Validation errors use `aria-invalid` + SVG icon, NOT `<p>` error text → Generator created selector for nonexistent element
   - Phone mask strips alpha chars ("test-temp" → "-") → `fillWithValidation` retry loop resets Angular dirty state
   - Client-side filtering REMOVES DOM rows (not CSS hide) → `getAddressRowCount` counted invisible rows
   - API loads panel empty first, content appears 3-5s later → assertions fire on empty panel
   - `[role="tabpanel"]` matches multiple panels → strict mode violation
   - No `<form>` element wraps save button → `form:has(...)` selector fails

**Evidence**: Every single iteration in the 2-hour Copilot session was caused by information the Planner SHOULD have documented but didn't.

---

## Problem A: Generator Can't Find Planner's Selector Files

Generator Phase 0 Step 2 says "Cross-check selectors in selector file" but only reads barrel `index.ts`. Planner creates partition files like `src/selectors/locations/account-address.ts` that ARE re-exported through the barrel, but Generator's search (`grep btnAcc index.ts`) misses them because the barrel uses wildcard re-exports.

## Problem B: Planner MCP_VERIFICATION_LOG Missing Critical Details

Current LOG format (PLN-022) captures: Date, URL, Office/Entity, Total fields, Save dialog, Column headers, Dropdown options, Cascade behaviors. **Missing**:
- Input attribute types (name vs placeholder vs aria-label)
- Validation error UI pattern per field (what renders on invalid? `<p>` text? aria-invalid only? SVG icon? toast?)
- Input masking/formatting behavior (phone strips alpha, date reformats, etc.)
- Client-side filtering mechanism (removes DOM rows vs CSS display:none)
- API loading behavior (panel renders empty → content appears after Ns)
- Strict mode risks (selectors matching multiple elements)
- Form structure (is there a `<form>` element? what wraps the save button?)

---

## Changes

### 1. Generator Phase 0 — Artifact Discovery Fix (GEN-027/028)

**File**: `.github/agents/playwright-test-generator.agent.md`

**Where**: Phase 0, replace step 1-2 with expanded discovery:

```
1. ARTIFACT DISCOVERY (GEN-027 — MANDATORY):
   a. List partition files: `ls src/selectors/{module}/` — check if selector file already exists
   b. If exists: READ the partition file directly. Do NOT create a new one.
   c. If NOT exists: flag as missing, escalate to Planner via agent-escalations.json. STOP.
   d. Read barrel export `src/selectors/index.ts` — verify partition is re-exported
   e. Read existing page objects: `ls src/pages/{module}/` — check if page object exists
   f. If page object exists: READ it, reuse methods. Do NOT create from scratch.

2. Cross-check: selectors in partition file match HTML structure in MCP_VERIFICATION_LOG
   - For each selector: verify the CSS pattern matches the documented HTML attribute type
   - Flag mismatches as Planner escalations (selector wrong) vs Generator fixes (selector key naming)
```

New rules:

| ID | Rule | Resolution |
|----|------|------------|
| GEN-027 | NEVER create selector/page object files without first checking if they already exist in partition directories (`src/selectors/{module}/`, `src/pages/{module}/`). Overwriting Planner's work = critical failure. | Generator overwrote Planner's 28-selector file with wrong selectors, wasted 2 hours |
| GEN-028 | If selector partition file is MISSING when queue says `pending_generation` with `selectors-completed` history: STOP. Escalate. Something is wrong. Do NOT improvise selectors. | Generator should never discover selectors — that's Planner's job |

### 2. Planner MCP_VERIFICATION_LOG Expansion (PLN-023..028)

**File**: `.github/agents/playwright-test-planner.agent.md`

**Where**: After PLN-022 (Generator-Ready Package), add new rules + expand LOG format.

| ID | Rule | Historical Failure |
|----|------|-------------------|
| PLN-023 | For EVERY input field: document the actual HTML attribute used for identification (`name="X"` vs `placeholder="X"` vs `aria-label="X"` vs `data-testid="X"`). Run `browser_evaluate` to extract `input.name, input.placeholder, input.getAttribute('aria-label')`. Generator CANNOT guess. | Account List dialog inputs had no `name` — only `placeholder`. Generator assumed `name` → all selectors wrong |
| PLN-024 | For EVERY validation scenario: document the EXACT error UI pattern. What renders when field is invalid? Options: (a) `<p>` sibling text, (b) `aria-invalid="true"` + icon only, (c) toast notification, (d) dialog, (e) Save button silently disables. Run `browser_evaluate` to find the error element. | Phone 1 validation shows aria-invalid + SVG icon, no `<p>` text. Generator created selector for nonexistent `<p>` element |
| PLN-025 | For EVERY input with formatting/masking: type test values ("abc", "12345", special chars) and document transform. Example: Phone field "test-temp" → "-" (strips alpha). Document: mask pattern, which chars survive, final displayed value. | Generator used `fillWithValidation` which retries when value doesn't match — phone mask caused infinite retry loop |
| PLN-026 | For EVERY dialog with a table/list: test the search/filter mechanism. Document: does filtering REMOVE rows from DOM or HIDE them via CSS? Count visible rows before and after filter. Run `browser_evaluate(() => document.querySelectorAll('tbody tr').length)` before and after. | Address dialog filter removes DOM rows. Generator counted all `tbody tr` including removed ones |
| PLN-027 | Document API loading behavior for EVERY tab/section. After clicking tab: how long until content renders? Does panel appear empty first? What element signals "content loaded"? Document the reliable wait target (e.g., "wait for `input[name='accountAndAddress.contactPhone1']` to have a value, not just exist"). | Panel rendered empty → Generator's assertions fired on empty DOM → all failed |
| PLN-028 | For EVERY selector added: run `browser_evaluate(() => document.querySelectorAll('SELECTOR').length)` to verify UNIQUENESS. If count > 1, document which elements match and how to scope. Flag strict mode risks. | `[role="tabpanel"]` matched 2 panels → strict mode violation in Generator's spec |

**Expand MCP_VERIFICATION_LOG format** — add these rows:

```
| Input attribute types | fieldName: name="X" / placeholder="X" / aria-label="X" / data-testid="X" |
| Validation error patterns | fieldName: aria-invalid + SVG icon (no text) / <p> sibling "Required" / silent Save disable |
| Input masks/formatting | fieldName: "test-temp" → "-" (strips alpha) / "12345" → "123-45" |
| Filtering mechanism | dialogName: removes DOM rows / CSS display:none / data attribute filter |
| API loading | tabName: empty for ~Ns, wait for [element] to have value |
| Strict mode risks | selector: matches N elements, scope with [data-testid="X"] |
| Form structure | Save button: inside <form> / standalone [data-testid="X"] / in sidebar |
```

### 3. Planner Phase 2 — Add Step 7: Behavioral Edge Cases

**File**: `.github/agents/playwright-test-planner.agent.md`

**Where**: After Phase 2 Step 6 (Document Save Flow), before RESTORE.

```
### Step 7: BEHAVIORAL EDGE CASES (PLN-023..028)
For every field discovered in Phase 1:
7a. Input identification: `browser_evaluate` → extract name, placeholder, aria-label, data-testid
7b. Validation pattern: clear required field → Tab → what renders? Capture exact error element HTML
7c. Input masking: type "abc123!@#" → what survives? Document transform rule
7d. For dialogs with tables: filter → count DOM rows before/after → document removal vs hide
7e. For tabs/sections: click → time how long content takes → identify reliable "loaded" element
7f. For every new selector: verify uniqueness via querySelectorAll count
```

### 4. Generator Phase 0 — Reuse Audit (GEN-025/026)

**File**: `.github/agents/playwright-test-generator.agent.md`

- Phase 0 Step 4b: REUSE AUDIT block (documented grep results for BasePage methods, existing interfaces, cross-spec patterns, shared constants, data-driven candidates)
- Post-Write Quality Self-Check (5 greps before post-complete)

| ID | Rule | Resolution |
|----|------|------------|
| GEN-025 | Phase 0 MUST include REUSE AUDIT block documenting: BasePage methods checked, existing interfaces grepped, cross-spec patterns found, data-driven candidates identified. No audit = no code. | Maintainer found 6 duplicate methods across pages that Generator should have caught |
| GEN-026 | Post-write quality self-check (5 greps) before post-complete. Each check = command + result. Duplication found = fix before proceeding. | Prevents Maintainer cleanup runs entirely |

### 5. Healer Quality Rules (HLR-024..027)

**File**: `.github/agents/playwright-test-healer.agent.md`

**Where**: After HLR-014. NOTE: HLR-015..023 reserved for Plan 48D triage.

| ID | Rule | Resolution |
|----|------|------------|
| HLR-024 | Before adding a new method to a page object: `grep "async methodName" src/common/base-page.ts`. If equivalent exists, delegate. If it SHOULD exist but doesn't, escalate to maintainer (ALL-035). | Healer reimplemented checkbox helpers that existed in FormHelpers |
| HLR-025 | Before creating a new interface/type: `grep -rn "interface TypeName" src/pages/ src/common/`. If same shape exists, import it. | CheckboxState defined 4x across codebase |
| HLR-026 | After fix: if same fix pattern was needed in another spec/page, note as escalation to maintainer for shared utility extraction. 2+ identical fixes = BasePage candidate. | Prevents "fix in one place, forget the others" |
| HLR-027 | Do NOT introduce per-test `test.setTimeout()` during fix. Set at describe level. Do NOT add `waitForTimeout()` — use proper waits. | 12+ scattered setTimeout calls in pricing spec |

### 6. Post-Complete Gates

**File**: `scripts/generator-post-complete.ts` — Gate 21: validateCodeQuality (soft warnings)
**File**: `scripts/healer-post-complete.ts` — Gate 6: quality checks (soft warnings)

### 7. AGENT_SHARED_RULES.md Updates

**File**: `docs/read_only_docs/AGENT_SHARED_RULES.md`

| ID | Rule | Violation = |
|----|------|-------------|
| ALL-038 | Code-producing agents must prove reuse search before creating methods/interfaces/constants | Duplicate code |
| ALL-039 | Post-write quality self-check mandatory for .spec.ts or .page.ts modifications | Quality regression |
| ALL-040 | Generator MUST use Planner's existing selector files. Creating new selectors from scratch when Planner already delivered them = critical pipeline failure | 2-hour waste, wrong selectors |
| ALL-041 | Planner MUST document input attribute types, validation error UI patterns, input masks, filtering mechanisms, API loading behavior, strict mode risks for EVERY field/dialog | Generator flies blind without this |

### 8. Maintainer Role Redefinition

**File**: `.github/agents/playwright-framework-maintainer.agent.md`

Redefine from cleanup crew to periodic auditor. If Maintainer finds issues Generator/Healer should have caught, it files escalations against those agents citing the specific rule violated.

---

## Files

- `.github/agents/playwright-test-generator.agent.md` — GEN-025..028, Phase 0 artifact discovery rewrite
- `.github/agents/playwright-test-planner.agent.md` — PLN-023..028, Phase 2 Step 7, expanded MCP_VERIFICATION_LOG
- `.github/agents/playwright-test-healer.agent.md` — HLR-024..027
- `scripts/generator-post-complete.ts` — Gate 21
- `scripts/healer-post-complete.ts` — Gate 6
- `docs/read_only_docs/AGENT_SHARED_RULES.md` — ALL-038..041
- `.github/agents/playwright-framework-maintainer.agent.md` — Role redefinition

## Verification

1. Run Planner on a new module → verify MCP_VERIFICATION_LOG has all new fields (input attrs, validation patterns, masks, filtering, loading, strict mode)
2. Run Generator after Planner → verify Phase 0 finds existing selector file, does NOT create new one
3. Run Generator → verify spec passes on FIRST run (no iteration needed)
4. Check post-complete Gate 21 output — no warnings
