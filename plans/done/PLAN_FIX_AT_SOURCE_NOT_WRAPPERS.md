# PLAN_FIX_AT_SOURCE_NOT_WRAPPERS — Replace the step-wrapper Proxy with a @step decorator and guard against wrapper recurrence

**Status**: DONE
**Executed**: 2026-07-31
**Priority**: P1
**Created**: 2026-07-31
**Identity**: GARDENER
**Depends on**: none
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none
**BrowserToolJustification**: pure code refactor + typecheck + spec-list validation only; no live DOM walk. If a live HTML-report comparison becomes necessary, announce a `[BROWSER-SWITCH]` to `cli` per `.claude/rules/browser-tool.md`.

---

## Context

`clients/encore/src/fixtures/step-wrapper.ts` exports a `Proxy`-based `wrapWithSteps` that intercepts every page-object method call and derives a Playwright `test.step` label from the method name. The requirement it serves — LR-ENC-006: every public async page-object method renders as a plain-English step in the HTML report — is real and stays. The Proxy implementation is the problem:

1. Runtime sync/async detection (`value.constructor.name !== 'AsyncFunction'`, line 77).
2. `.apply(target, ...)` trick to prevent internal-call re-interception (line 80–84).
3. A dedicated unit test file (`tests/_unit/step-wrapper.spec.ts`, 6 tests) that shipped to the client.
4. Invisible wrapping — 19 `wrapWithSteps()` calls in `clients/encore/src/fixtures/pages.fixture.ts` (lines 335–425 as of authoring), completely decoupled from the method definitions.

The owner's ruling: "fix it properly, not thru a wrapper." This plan replaces the Proxy with a `@step` method decorator — declarative, per-method, visible at the definition site, no `ProxyHandler`, no sync/async detection, no unit test needed in client `tests/`. The decorator is still runtime interception (honest disclosure); if the owner considers any interception unacceptable, Phase 2B (explicit `test.step()` in 793 method bodies) is the fallback.

**Research**: `.claude/state/ua-worker/chips/deliv-audit/out-p1/P1-RESEARCH.md` (2026-07-31) — full evidence, method counts, option comparison, and recommendation.

**Method count rule**: one `@step` decorator per public async method DECLARATION across all 21 page-object files (excluding `login.page.ts`); inherited methods decorated at the base class only.

**The count is machine-derived at execution time, never read from this plan.** It was 793 on 2026-07-31; any method added or removed between authoring and execution changes it legitimately. The executing agent re-derives it as step one of Phase 2A and uses ITS number everywhere downstream:

```bash
node scripts/check-step-labels.mjs --count-decorator-targets
```

(Phase 1B adds that flag. Until it exists, the interim derivation is a `grep -rcE '^\s*(public\s+)?async\s+\w+\s*\(' clients/encore/src/pages/` summed across all files minus `auth/login.page.ts`.) A mismatch against 793 is **information, not a failure** — record the new number and continue. Do NOT halt on a count difference, and do NOT edit files to make the number match.

Prior cross-checks (764 / 748 / 1,074) came from different enumeration rules during research and are retained in `P1-RESEARCH.md`; they are not competing truths and must not be used to "verify" the machine count.

**Provenance**: Owner ruling 2026-07-31 ("fix it properly, not thru a wrapper! permanent fix. research how to fix things like this and put into a planning.").

---

## Audit-First Directive — the corrections below are CLAIMS, not authority

An audit on 2026-07-31 produced six corrections (AC-1 … AC-6), already folded into the phases below. **Every one is a claim made by one auditor reading this repo at one moment. None of them is authority.** Whoever executes a phase — Claude, a Copilot worker, a council reviewer — independently runs that phase's falsification command FIRST and acts on what it actually prints.

This is not ceremony. AC-1 rewrites the core mechanism of Phase 1; if AC-1 is wrong, this plan builds the wrong decorator 793 times. AC-6 is already the proof that auditors are fallible: it is the auditor's own earlier claim, refuted by the auditor's own follow-up check.

**Handling rules:**

- **CONFIRMED** — command prints the expected output → execute the phase as written, and paste the command plus its real output into the Execution Summary.
- **REFUTED** — output differs → **HALT and report**. Do not repair the plan mid-run. Do not fall back to the pre-correction text. A refuted claim means the plan is wrong and needs re-authoring by a session that can see the whole picture.
- **INCONCLUSIVE** — command errors, path missing, output ambiguous → treat as REFUTED. A missing file proves nothing.

Writing a verdict into a report without running the command is fabricated evidence, not a shortcut. Two agents confirming each other's prose is not verification — each runs the command itself.

| ID | Claim | Falsification command | CONFIRMED looks like | Gates |
|---|---|---|---|---|
| AC-1 | Playwright compiles decorators as **modern TC39 (2023-05)** via its own bundled Babel and ignores tsconfig `experimentalDecorators` at runtime. A legacy-signature decorator typechecks green and misbehaves at runtime. | `grep -c '{version:"2023-05"}' node_modules/playwright/lib/transform/babelBundleImpl.js` | `1` | Phase 1, 1C |
| AC-2 | Four artifacts still name the file this plan deletes. | `grep -rn "step-wrapper\|wrapWithSteps" scripts/deliverable/delivery-manifest.encore.json scripts/lib/label-derivation.mjs .githooks/pre-commit clients/encore/CLAUDE.md` | hits in all four files | Phase 3, 7 |
| AC-3 | A new gate must declare its severity class and graduating incident in its own source header. | `grep -n "Every gate proves its rent" .claude/rules/guardrail-policy.md` | one hit (LR-069 §3.4) | Phase 5a |
| AC-4 | 793 is a snapshot, not a contract; the count is re-derived at execution. | the count command in Context above | any integer; record it | Phase 2A |
| AC-5 | Root `tsconfig.json` compiles `**/*.ts`, so a `.ts` negative fixture under `scripts/` enters the typecheck net and will fail it by design. | `grep -A3 '"include"' tsconfig.json` | shows `"**/*.ts"` | Phase 1B |
| AC-6 | **REFUTED BY ITS OWN AUTHOR.** The earlier audit claimed the 19 `LocationFormHelpers` methods are unlabeled today and would "gain" labels. False: that class is abstract and `LocationLocalInfoPage` extends it, and that page IS wrapped — so all 793 methods are labeled today. Phase 6 therefore expects **identical** labels, and any difference is a regression, not an improvement. | `grep -rn "extends LocationFormHelpers" clients/encore/src/pages/` then confirm that subclass appears in `pages.fixture.ts` | one subclass, present in the fixture wrap list | Phase 6 |

---

## Bootstrap

**Identity**: GARDENER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (wrap — BEFORE + AFTER per touched file)
- `/relevant` (Phase 0.5)
- `/final-q` (Phase 4 — LR-042)

**Context files**:
- `.claude/state/ua-worker/chips/deliv-audit/out-p1/P1-RESEARCH.md` (research backing this plan)
- `clients/encore/CLAUDE.md` (LR-ENC-006 — the requirement this plan preserves)
- `clients/encore/src/fixtures/step-wrapper.ts` (the Proxy being replaced)
- `clients/encore/src/fixtures/label-jargon.json` (label machinery — survives)
- `clients/encore/src/fixtures/pages.fixture.ts` (19 `wrapWithSteps` call sites to remove)
- `clients/encore/tests/_unit/step-wrapper.spec.ts` (unit test to retire)
- `clients/encore/tsconfig.json` (`experimentalDecorators: true` — already enabled)
- `.claude/rules/pipeline.md` (LR-020/027/040/048/050/055)
- `.claude/rules/deliverable.md` (LR-058 — plain English in client artifacts)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`
- `docs/read_only_docs/LEARNED_RULES.md`

---

## Phase 0 — Dependency + context gate (MANDATORY)

1. Read `.claude/context/navigation.md` — pull step-wrapper / fixture / decorator findings.
2. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — GARDENER `MNT-*` entries.
3. Read `.claude/state/ua-worker/chips/deliv-audit/out-p1/P1-RESEARCH.md` — the research backing this plan.
4. LR scan — LR-ENC-006, LR-058, LR-020, LR-027, LR-048.
5. **Baseline**: `cd clients/encore && npx tsc --noEmit` — must pass before any changes.
6. **Baseline**: `cd clients/encore && npx playwright test --list` — capture the full test list. No test should disappear after migration.
7. **Baseline**: `npm run check:step-labels` (root) — capture current output for comparison.

---

## Phase 1 — Create the `@step` decorator (1 file created, 1 config modified)

**Gated on AC-1 — run its falsification command before writing a line of this file.**

**File**: `clients/encore/src/fixtures/step-decorator.ts`

Create a single file exporting:

1. `step(label?: string)` — a **modern TC39 method decorator**, NOT the legacy `experimentalDecorators` form. The signature is `(originalMethod, context: ClassMethodDecoratorContext)` and it RETURNS a replacement function; there is no `PropertyDescriptor` and no third parameter. Playwright's own Babel is what actually compiles these files at runtime and it uses the modern proposal (AC-1) — a legacy-form decorator would pass `tsc` and then receive the wrong arguments at runtime, which is exactly the class of failure this plan exists to stop. Implementation (~25 lines):
   - Method name comes from `String(context.name)`, not a `propertyKey` parameter.
   - If `label` is provided, use it as the step name.
   - Otherwise call `resolveLabel(this.constructor.name, String(context.name))` inside the replacement function, so `this` is the live instance (reuses existing `resolveLabel` + `camelToLabel` + `label-jargon.json`).
   - Module-level `stepDepth` counter: if `stepDepth > 0` (call originates from another decorated method), bypass `test.step()` and call the original directly — preserving the Proxy's suppression of nested duplicate steps (`step-wrapper.ts`:80–84). Increment on entry, decrement in `finally`. Safe because a Playwright worker runs one test at a time; note in the file that a single test awaiting two decorated page-object calls concurrently (`Promise.all`) would over-suppress. No spec does that today — verify with `grep -rn "Promise.all" clients/encore/tests/` before relying on it.
   - Wrap the call in `safeStep` logic: try `test.info()`; if it throws (outside a test context), call the original directly; otherwise wrap in `test.step(label, fn)`.

2. Re-export `camelToLabel`, `resolveLabel` from `step-wrapper.ts` temporarily (Phase 1 only — these functions move here in Phase 3).

**Config change**: in `clients/encore/tsconfig.json`, set `experimentalDecorators` and `emitDecoratorMetadata` to `false` (currently both `true` at lines 38–39). TypeScript 5.3 typechecks standard decorators only when the legacy flag is OFF; leaving it on makes `tsc` validate a dialect Playwright will never run. Before flipping, confirm nothing else in the client depends on legacy decorators:

```bash
grep -rnE "^\s*@[a-zA-Z]" clients/encore/src clients/encore/tests --include=*.ts | grep -v "@param\|@returns\|@example\|@fcc"
```

Expect zero hits other than the `@step` lines this plan adds. Any other hit → HALT and report.

**Acceptance**: `npx tsc --noEmit` passes with the new file. **This is a necessary and NOT a sufficient gate — proceed to Phase 1A before touching a second file.**

---

## Phase 1A — Runtime smoke gate (1 method, 1 spec run) — MANDATORY BEFORE MIGRATION

**This phase exists because a typecheck cannot detect the AC-1 failure.** The decorator must be proven by a real Playwright run on ONE method before the same edit is repeated hundreds of times.

1. Pick one public async method on `LocationCurrencyPage` that a short existing spec already exercises. Add `@step()` to that one method and its import. Change nothing else.
2. Run the spec that covers it: `cd clients/encore && npx playwright test tests/locations/location-currency.spec.ts --reporter=html`.
3. Open `clients/encore/reports/html-report/index.html` and find the step for that method.
4. Three outcomes, and only one of them continues:
   - **Label renders in plain English, test passes** → decorator dialect is right. Proceed to Phase 1B.
   - **Test errors** (decorator applied wrong, `this` undefined, method not a function) → the dialect or the `this` binding is wrong. HALT and report the error verbatim.
   - **Test passes but the step label is missing or shows the raw method name** → the decorator is being applied but not producing labels. HALT and report; do NOT "fix it while migrating."
5. Additionally confirm the method is not double-stepped: at this point the Proxy is still active and the decorator is also live, so this one method may render twice. **That is expected and harmless during the migration window** (nothing ships until Phase 3 removes the Proxy). Record what you saw so Phase 6 knows the baseline.

**Acceptance**: a passing spec run whose HTML report shows the decorated method as a plain-English step, with the report path and the observed label recorded in the Execution Summary.

---

## Phase 1B — Rewrite and prove `check:step-labels` (1 file modified, 1 fixture created)

**Moved from Phase 5c and expanded.** The checker must be rewritten and proven BEFORE migration begins (Phase 2A). Without it, removing the Proxy in Phase 3 leaves decorator presence as opt-in discipline with no structural enforcement.

**File**: `scripts/check-step-labels.mjs`

Rewrite to support the decorator model:

1. **Check 1: DECORATOR-MISSING** (replaces FIXTURE-UNWRAPPED) — every public async method in page-object files (except excluded classes like `LoginPage`) must have `@step` or `@step('...')`. Regex: `@step\(` on the line immediately preceding `async methodName(`.
2. **Check 2: LABEL-JARGON** (unchanged) — method-name tokens checked via `untranslatedJargon()`.
3. **Check 3: SPEC-RAW-PAGE** (unchanged).
4. **Check 4: DECORATOR-LABEL-JARGON** (new) — parse `@step('...')` string arguments from page-object files (regex: `@step\(\s*['"]([^'"]+)['"]\)`). Split label into whitespace-separated words, lowercase each. Any word in the `deniedJargon` list → DECORATOR-LABEL-JARGON violation. Extends to `test.step('...')` calls in page-object files (not spec files). Closes the bad-label-string hole: `@step('Open SSL tab')` is rejected because `ssl` is in `deniedJargon`.

5. **New flag: `--count-decorator-targets`** — prints the machine-derived count of decorator targets (public async method declarations in page-object files, excluding the excluded classes) and exits 0. This is the count source for Phase 2A per AC-4; it removes the frozen-number trap by making the denominator machine-owned.

**Negative fixture**: `scripts/test-fixtures/negative-step-label.fixture.txt` — contains `@step('Open SSL tab')` on a public async method (must fail: DECORATOR-LABEL-JARGON) and `@step('Open Shared Setup Locations tab')` (must pass).

**Gated on AC-5 — the extension is `.txt`, not `.ts`, deliberately.** Root `tsconfig.json` compiles `**/*.ts` repo-wide, so a `.ts` fixture holding intentionally-broken code would fail the repo typecheck forever. Run AC-5's command before creating the file; if the root include has changed, report it rather than guessing a new extension. The checker reads fixtures by explicit path, so the extension is irrelevant to it — but note that the checker's normal discovery only walks `clients/*/src/pages`, so it must accept an explicit fixture path (e.g. a `--self-test` mode) rather than relying on discovery to find it.

**Acceptance**: `node scripts/check-step-labels.mjs --self-test` proves Check 4 flags the jargon fixture line and passes the clean one, with the actual output recorded. Check 4 (DECORATOR-LABEL-JARGON) enforced immediately. Check 1 (DECORATOR-MISSING) gates Phase 3 (runs on the full codebase after Phase 2A completes all decorators).

---

## Phase 2A — Migrate page objects to `@step` (21 files modified, one line per decorator target)

For each of the 21 files in `clients/encore/src/pages/**/*.ts` (excluding `login.page.ts` which is excluded from wrapping):

1. Add `import { step } from '../fixtures/step-decorator';` (adjust relative path per file depth).
2. Add `@step()` above every public async method. For methods with `handLabels` entries in `label-jargon.json` (4 classes, 7 methods total), use `@step('Explicit Label')` instead.
3. Do NOT modify method bodies. The decorator wraps externally.
4. Do NOT add `@step` to `private` or `protected` async methods (44 methods across 11 files — they are not user-visible actions).

**Phasing**: migrate one module directory at a time in this order (smallest → largest, so failures surface early):
1. `local-office/` (3 files, 72 methods) — `local-office-ect.page.ts`, `local-office-history.page.ts`, `local-office-settings.page.ts`
2. `components/` (1 file, 19 methods) — `location-form-helpers.component.ts`
3. `locations/` (10 files, 362 methods) — all `location-*.page.ts`
4. `corporate-pricing/` (5 files, 224 methods) — all `corporate-pricing-*.page.ts`
5. `corporate-override/` (1 file, 106 methods) — `corporate-override.page.ts`
6. `base.page.ts` (1 file, 10 methods) — inherited by all; migrate last to verify subclass decorators work independently.

**After each module**: `npx tsc --noEmit` — must pass.

**Non-delivery gate**: no client report deliverable is generated until Phase 3 (Proxy removal) is complete. The phased migration is for development typecheck safety; all phases land in a single atomic PR.

**Total**: one `@step()` line per decorator target, count re-derived per AC-4 at the start of this phase (793 as of 2026-07-31; the per-module figures above carry the same caveat). Zero method bodies changed. Record the derived number in the Execution Summary and use it — not 793 — in the acceptance check.

---

## Phase 2B — FALLBACK: explicit `test.step()` (only if owner rejects decorator)

If the owner rules that the decorator is still a wrapper and unacceptable:

1. For each of the 793 public async methods, wrap the method body in:
   ```typescript
   async methodName(...): Promise<ReturnType> {
     const fn = async () => { /* original body */ };
     let hasContext = false;
     try { test.info(); hasContext = true; } catch { hasContext = false; }
     if (!hasContext) return fn();
     return test.step('Label', fn);
   }
   ```
2. Extract the `safeStep` helper into a new module under the client's `src/utils/` directory to avoid 793× duplication of the `test.info()` guard. (Proposed only — this phase was not executed, so no such file exists.)
3. Same phasing as 2A. Same typecheck gate per module.

**Cost**: 793 method body rewrites (indent shift + step call). Larger diff. Higher ongoing authoring burden (every new method must remember to add `test.step()`).

This phase is mutually exclusive with Phase 2A. Execute one, not both.

---

## Phase 3 — Remove proxy machinery (3 files modified, 1 file created/refactored)

1. **`pages.fixture.ts`**: remove all 19 `wrapWithSteps(...)` calls (lines 335–425). Each page object is instantiated directly: `const locationCurrencyPage = new LocationCurrencyPage(authenticatedSession.page, config);`. Remove the `import { wrapWithSteps } from './step-wrapper';` line.

2. **`step-decorator.ts`** (or `step-wrapper.ts` if reusing the file): move `camelToLabel`, `resolveLabel`, `splitCamel` into `step-decorator.ts` as the canonical home. Remove the Phase 1 re-export bridge. Keep the `label-jargon.json` import.

3. **`step-wrapper.ts`**: delete entirely. The `wrapWithSteps`, `WrapOptions`, `safeStep`, `Proxy`, and `ProxyHandler` code are dead after Phase 2A + Phase 3 step 1.

4. **`label-jargon.json`**: survives unchanged. It is label data, not proxy machinery.

5. **Stale references to the deleted file — gated on AC-2.** Deleting `step-wrapper.ts` without these leaves four artifacts pointing at a file that no longer exists. Run AC-2's command, then fix every hit it reports. As of the audit those were:
   - `scripts/deliverable/delivery-manifest.encore.json` — a `path` entry for `src/fixtures/step-wrapper.ts` plus two entries covering the unit test Phase 4 deletes. Update the manifest to name `step-decorator.ts`, and coordinate with `plans/pending/PLAN_DELIVERABLE_SCOPE_LOCK.md`, which separately tracks that unit test as a leak — read it before editing so the two plans do not contradict each other.
   - `scripts/lib/label-derivation.mjs` — its header declares that `camelToLabel` mirrors the runtime copy in `step-wrapper.ts`. Re-point that contract at `step-decorator.ts`. The mirroring itself stays: the checker needs a Node-side copy of the label logic.
   - `.githooks/pre-commit` — the failure message instructs committers to "wrap the fixture in `wrapWithSteps()`". Rewrite it to name the decorator, since the old advice will now be actively wrong at the moment someone reads it.
   - `clients/encore/CLAUDE.md` — a pointer comment near LR-ENC-006 citing `step-wrapper.ts`. Update alongside the rule text in Phase 7.

   If AC-2's command reports a hit this list does not mention, that is a real finding — fix it and note it; do not treat this list as complete.

**Acceptance**: `npx tsc --noEmit` passes. `npx playwright test --list` output is identical to Phase 0 baseline (no tests lost). AC-2's command re-run reports zero `step-wrapper` / `wrapWithSteps` hits outside `plans/`.

---

## Phase 4 — Retire the unit test (1 file deleted or moved)

**File**: `clients/encore/tests/_unit/step-wrapper.spec.ts` (6 tests).

This file tests proxy-specific behavior (sync passthrough, async wrapping, `.page` identity through the proxy). Under the decorator approach, these concerns do not exist.

**Action**:
1. Delete `clients/encore/tests/_unit/step-wrapper.spec.ts`.
2. If the `tests/_unit/` directory is now empty, delete it.
3. Optionally: add a minimal smoke test for the `@step` decorator in a framework-owned location (NOT in `clients/encore/tests/`). Candidate location: `src/tests/` or a new `clients/encore/src/__tests__/step-decorator.test.ts` (gitignored from client delivery). This is optional because the decorator is trivial (~15 lines) and its behavior is proven by the full spec suite's HTML report showing step labels.

**Where `tests/_unit/` should live**: the unit test existed because the Proxy needed behavioral verification. Framework-owned tests belong in the framework's test directory (`src/tests/` or a gitignored `_internal` dir), not in the client's shipped `tests/` folder. The `tests/_unit/` directory was one of two leaks the owner identified.

**Acceptance**: `npx playwright test --list` shows no `step-wrapper` test. Client `tests/` contains only spec files.

---

## Phase 5 — Recurrence guard (1 script updated, 1 rule created)

### 5a. Lint rule: no `new Proxy` in client code

**Gated on AC-3.** Preferred implementation is to add `new Proxy(` and `ProxyHandler` as patterns in `scripts/lib/forbidden-patterns.mjs` rather than to create a new script. That file already feeds all three enforcement layers (write-time hook, pre-commit, ship-time), so one entry buys the whole defense chain and adds no new gate to maintain. Before adding, confirm zero hits on the shipped tree so the gate cannot wedge existing work — a new pattern that fires on landing is a broken gate, not a strict one.

If a standalone `scripts/check-no-proxy.mjs` is used instead, it must carry in its source header the severity class and the graduating incident (the 2026-07-31 owner ruling), per the rule AC-3 verifies. A gate without a named incident does not ship. Then:

- Grep `clients/*/src/**/*.ts` for `new Proxy(` and `ProxyHandler`.
- Exit non-zero if any match is found.
- Add to root `package.json` scripts: `"check:no-proxy": "node scripts/check-no-proxy.mjs --enforce"`.
- Wire into the pre-commit hook chain alongside `check:step-labels`.

Whichever form is chosen, say which one in the Execution Summary and why — the acceptance criteria below accept either.

**Honesty**: this guard is **mechanically enforceable** — `new Proxy(` is a greppable token. It catches the exact pattern (runtime Proxy interception) that this plan retires. It does NOT catch all possible wrapper patterns (higher-order functions, middleware, etc.), but those patterns are legitimate in many contexts. The guard is narrowly scoped to the specific anti-pattern.

**Guard hierarchy**: `check:no-proxy` is the SECONDARY recurrence guard. The PRIMARY guard is `check:step-labels` (Phase 1B), which enforces `@step` on every public async page-object method — structurally preventing any wrapper from replacing per-method decoration. The TERTIARY guard is `.claude/rules/no-wrappers.md` (5b). Together: decorator presence catches any pattern that bypasses per-method intent; the `new Proxy(` grep catches the specific retired mechanism; the rule file prevents agent recurrence.

### 5b. Rule file: `.claude/rules/no-wrappers.md`

Create a path-scoped rule:

```markdown
---
description: No Proxy wrappers in client code — fix at the source
paths:
  - "clients/*/src/**"
---

# No Proxy Wrappers in Client Code

When you need many call sites to share a behavior (step labels, logging, retries), add the behavior to each call site explicitly or use a TypeScript method decorator. Do NOT create a Proxy that intercepts method calls from the outside.

Graduated from: PLAN_FIX_AT_SOURCE_NOT_WRAPPERS (2026-07-31).
Enforced by: `npm run check:no-proxy` (pre-commit).
```

### 5c. ~~Update `check:step-labels`~~ — moved to Phase 1B

The checker rewrite is now Phase 1B (before migration), including new Check 4 (DECORATOR-LABEL-JARGON) for string-literal scanning and the negative fixture requirement. See Phase 1B for full specification.

Phase 5 acceptance is limited to `npm run check:no-proxy` passing.

---

## Phase 6 — HTML report verification (proof of non-regression)

**This is the acceptance gate.** The client-readable report must show the same or better step labels.

1. Run a targeted spec suite: `cd clients/encore && npx playwright test tests/locations/location-currency.spec.ts --reporter=html` (choose a module with both auto-derived and hand-labeled methods).
2. Open `clients/encore/reports/html-report/index.html`.
3. Verify: every test shows plain-English step labels (no raw method names, no selectors, no `data-testid`).
4. Compare against a pre-migration run of the same spec (captured in Phase 0).
5. **The expected result is IDENTICAL labels — gated on AC-6.** Every method in scope is already labeled today, including the abstract-class methods, because the concrete page that inherits them is Proxy-wrapped. So a label that appears, disappears, or changes wording is a regression to investigate, not an improvement to celebrate. The only legitimate differences are the `@step('...')` hand-label overrides, which are copied verbatim from `label-jargon.json` `handLabels` and should therefore also match. Run AC-6's command before this comparison so you know which class inherits from which; a "new" label almost certainly means a method lost its label somewhere else.

**Command**: `cd clients/encore && npx playwright test tests/locations/location-currency.spec.ts --reporter=html 2>&1 | tee <RUN_DIR>/report-comparison.verify.txt`

---

## Phase 7 — Closure

1. Update `clients/encore/CLAUDE.md` LR-ENC-006: replace "via the `wrapWithSteps` fixture Proxy + `label-jargon.json` map" with "via the `@step` method decorator + `label-jargon.json` map". Update the pointer comment two lines below it as well (it cites `step-wrapper.ts` — AC-2's fourth hit).
1b. Record every AC verdict in the Execution Summary: the ID, the command as run, its actual output, and CONFIRMED / REFUTED. A summary that asserts verdicts without outputs fails closure.
2. `npx tsc --noEmit` — clean.
3. `npx playwright test --list` — identical to Phase 0 baseline.
4. `npm run check:step-labels` — passes.
5. `npm run check:no-proxy` — passes.
6. Activity log entry per LR-028.
7. `/final-q` per LR-042.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | `step-decorator.ts` (created), `step-wrapper.ts` (deleted), `pages.fixture.ts` (modified), `tsconfig.json` (decorator flags flipped), 21 page objects (modified), `step-wrapper.spec.ts` (deleted), Proxy guard (added), `.claude/rules/no-wrappers.md` (created) | `clients/encore/src/fixtures/step-decorator.ts`<br>`clients/encore/tsconfig.json`<br>`scripts/lib/forbidden-patterns.mjs`<br>`scripts/check-step-labels.mjs`<br>`.claude/rules/no-wrappers.md` | `npx tsc --noEmit` clean + Phase 1A smoke run green + `npx playwright test --list` identical to baseline + `npm run check:step-labels` pass + Proxy guard pass |

---

## Acceptance criteria

- [ ] `clients/encore/src/fixtures/step-wrapper.ts` deleted — `ls clients/encore/src/fixtures/step-wrapper.ts` returns "No such file"
- [ ] `clients/encore/tests/_unit/step-wrapper.spec.ts` deleted — `ls clients/encore/tests/_unit/step-wrapper.spec.ts` returns "No such file"
- [ ] `clients/encore/src/fixtures/step-decorator.ts` exists and exports `step` decorator + `camelToLabel` + `resolveLabel`
- [ ] 0 occurrences of `wrapWithSteps` in `clients/encore/src/` — `grep -r "wrapWithSteps" clients/encore/src/` returns 0 matches
- [ ] 0 occurrences of `new Proxy(` in `clients/encore/src/` — `grep -r "new Proxy(" clients/encore/src/` returns 0 matches
- [ ] `@step` decorator count across 21 page-object files equals the number `--count-decorator-targets` derives at execution time (793 as of 2026-07-31) — record both numbers; a legitimate drift is recorded, not forced back to 793
- [ ] `clients/encore/tsconfig.json` has `experimentalDecorators: false` and `emitDecoratorMetadata: false`
- [ ] Phase 1A smoke run recorded: spec path, HTML report path, and the observed plain-English label for the single decorated method
- [ ] Every AC-1 … AC-6 verdict recorded with its command and actual output
- [ ] `npx tsc --noEmit` (in `clients/encore/`) exits 0
- [ ] `npx playwright test --list` (in `clients/encore/`) lists identical tests to pre-migration baseline (no tests added or removed)
- [ ] `npm run check:step-labels` (root) exits 0
- [ ] `npm run check:no-proxy` (root) exits 0
- [ ] HTML report for at least one spec shows plain-English step labels (visual verification)
- [ ] LR-ENC-006 in `clients/encore/CLAUDE.md` updated to reference `@step` decorator instead of `wrapWithSteps` Proxy
- [ ] Negative fixture `scripts/test-fixtures/negative-step-label.fixture.txt` rejected by `check:step-labels --self-test` with a DECORATOR-LABEL-JARGON violation (proves string-label jargon scanning works)
- [ ] No `deniedJargon` token can leak through hand-written `@step('...')` or `test.step('...')` labels in page-object files
- [ ] Zero `step-wrapper` / `wrapWithSteps` references remain outside `plans/` — AC-2's command returns no hits
- [ ] HTML report labels are IDENTICAL to the Phase 0 baseline (per AC-6); any difference investigated and explained in writing

---

## Execution Summary

**Executed**: 2026-07-31 · **Executed by**: OWNER (CEO) orchestrating a Copilot council; every substantive edit was performed by a delegated worker and independently re-verified by the CEO against disk.

### Outcome

The `wrapWithSteps` Proxy is retired. All 793 public async page-object methods now carry a `@step()` annotation at their definition. The customer-facing report is unchanged: a same-hour differential against the pre-change code produced a **byte-identical ordered step-title stream** (142 steps, 16 unique labels, zero nesting on either side).

### AC verdicts — all six CONFIRMED

| ID | Verdict | Command as run → actual output |
|---|---|---|
| AC-1 | CONFIRMED | `grep -c '{version:"2023-05"}' node_modules/playwright/lib/transform/babelBundleImpl.js` → `1` (Playwright 1.58.2). Decorators compile as modern TC39; tsconfig `experimentalDecorators` does not govern runtime. |
| AC-2 | CONFIRMED | Stale references found in all four cited artifacts: `delivery-manifest.encore.json:37,1354,1579,1587`; `scripts/lib/label-derivation.mjs:3,4`; `.githooks/pre-commit:273,281`; `clients/encore/CLAUDE.md:90,92`. All four repaired in Phase 3. |
| AC-3 | CONFIRMED | `grep -n "Every gate proves its rent" .claude/rules/guardrail-policy.md` → one hit at line 48 (LR-069 §3.4). |
| AC-4 | CONFIRMED — count re-derived as **793**, unchanged from the plan's snapshot | `node scripts/check-step-labels.mjs --count-decorator-targets` → `793`; `grep -rc '@step()' clients/encore/src/pages/` summed → `793`. Both machine-derived, independently. |
| AC-5 | CONFIRMED | Root `tsconfig.json` `include` is `**/*.ts`. The negative fixture was therefore authored as `scripts/test-fixtures/negative-step-label.fixture.txt` (`.txt`, not `.ts`) to stay outside the typecheck net. |
| AC-6 | CONFIRMED (the auditor's self-refutation was correct) | `location-form-helpers.component.ts:15` declares `export abstract class LocationFormHelpers`; `location-local-info.page.ts:15` is its only subclass; that page was wrapped at `pages.fixture.ts:340`. All 793 methods were already labelled pre-change, so Phase 6 correctly expected identical labels. |

### Deviations from the plan as written

1. **`step-wrapper.ts` was split, not deleted outright.** The plan's Phase 3 instruction to delete the file would have broken the build: two of its four exports (`camelToLabel`, `resolveLabel`) are imported by `step-decorator.ts` and are what make the new labels identical to the old ones. Those two functions were moved **verbatim** into `clients/encore/src/fixtures/label-derivation.ts` (bodies byte-identical, verified by line-for-line comparison against `git show HEAD:…/step-wrapper.ts`); only `wrapWithSteps` and `safeStep` were removed. The file itself is gone as the plan required.

2. **Phase 4's unit-test retirement was folded into Phase 3.** The two are typecheck-coupled — deleting the module breaks its spec in the same commit. `tests/_unit/step-wrapper.spec.ts` was retired via `git rm`; its two label-derivation tests survive verbatim in `clients/encore/tests/_unit/label-derivation.spec.ts` (2 passed). The four tests that exercised Proxy behaviour died with the Proxy, as intended.

3. **The Proxy guard took the pattern-file form, not a standalone script** — the plan explicitly permitted either and asked which was chosen and why. `new Proxy(` and `ProxyHandler` were added to `scripts/lib/forbidden-patterns.mjs`, which already feeds the write-time hook, the pre-commit gate, and the ship-time check. One entry buys all three layers and adds no new gate to maintain, satisfying the LR-069 §3.4 bloat governor. The entry carries its Sev class (S1) and graduating incident inline, per AC-3. Consequently **`npm run check:no-proxy` does not exist** and its two acceptance lines are N/A by design; the equivalent proof is the live-fire below.

4. **An obsolete gate check was retired.** `check-step-labels.mjs` check 1 (`FIXTURE-UNWRAPPED`) asserted that every fixture *is* wrapped in `wrapWithSteps()` — it guarded the mechanism this plan removes, and fired 19 violations the moment the Proxy came out. It was removed and the remaining checks renumbered. Check 5 (`DECORATOR-MISSING`), deliberately left announcing-only during migration, was promoted to enforcing by default and the now-redundant `--enforce-decorators` flag removed.

5. **Phase 6's acceptance evidence is a JSON step-stream differential, not a visual HTML comparison.** This is stronger, not weaker — see below.

### Phase 1A runtime smoke gate

`@step()` was placed on `LocationCurrencyPage.reloadAndNavigateToCurrencyTab` (a method the suite provably invokes repeatedly) while the Proxy was still live, and `tests/locations/location-currency.spec.ts` was run whole. Result: **15 self-nested step pairs out of 170 total steps**, all 15 being that one method — the decorator's step nested inside the Proxy's, exactly as predicted. Every other step stayed flat at depth 0. The decorator's label was character-identical to the Proxy's. Control (before the annotation) was 0 nested pairs. This is what proved the modern-TC39 decorator dialect actually executes, rather than merely typechecking.

### Phase 6 acceptance — report parity

The plan called for comparing against the Phase 0 baseline. That baseline (29/29 passing, 10:34) turned out not to be a valid comparator: by 12:05 eleven tests in the same spec had begun failing. A control run was therefore taken against a clean `git worktree` at `HEAD` (Proxy present, zero annotations, dependencies and env wired), and it failed **the identical eleven tests with an identical failing-test set** — proving those failures are external to this work. That control is the better comparator: same hour, same test outcomes, differing only in the labelling mechanism.

| Measure | Pre-change (Proxy) | Post-change (decorator) |
|---|---|---|
| Total steps | 142 | 142 |
| Unique labels | 16 | 16 |
| Ordered title stream | — | **byte-identical** (`diff` exit 0) |
| Self-nested pairs | 0 | 0 |
| Tests | 18 passed / 11 failed | 18 passed / 11 failed |

The eleven failures are **NOT-OURS** and are out of this plan's scope. They are handed off with full evidence — see "Out-of-scope finding" below.

### Verification battery (all re-run by the CEO against disk, not accepted from worker prose)

| Check | Command | Output |
|---|---|---|
| Annotation count | `grep -rc '@step()' clients/encore/src/pages/` summed | `793` |
| Machine denominator | `node scripts/check-step-labels.mjs --count-decorator-targets` | `793` |
| Client typecheck | `cd clients/encore && npx tsc --noEmit` | exit `0` |
| Label gate | `node scripts/check-step-labels.mjs --enforce` | `PASS — 22 page files, 30 spec files scanned, 0 violations` (exit 0) |
| Gate self-test | `node scripts/check-step-labels.mjs --self-test` | `SELF-TEST PASS` (exit 0) |
| Proxy absent from client source | `grep -rn 'new Proxy(\|ProxyHandler\|wrapWithSteps' clients/*/src/` | `0` matches |
| Stale name gone | `grep -rn 'step-wrapper' clients/ scripts/ .githooks/` (excluding `reports/` run artifacts and the activity log) | `0` matches |
| Decorator flags flipped | `grep -n 'experimentalDecorators\|emitDecoratorMetadata' clients/encore/tsconfig.json` | both `false` (lines 38–39) |
| Manifest integrity | `node scripts/validate-delivery-manifest.mjs` | `PASS — manifest is valid (30 modules)` (exit 0) |
| Surviving unit tests | `npx playwright test tests/_unit/label-derivation.spec.ts` | 2 passed |

### Live-fire proofs (a gate nobody has watched fire is not a gate)

- **Decorator gate**: removed one `@step()` from `base.page.ts` → gate exited non-zero naming `base.page.ts:67 DECORATOR-MISSING async navigateTo()`; restored → exit 0; count back to 793.
- **Proxy guard**: wrote a throwaway file containing `new Proxy(` under `clients/encore/src/utils/` → `verify-no-forbidden` rejected it by name; deleted the throwaway → clean. Throwaway confirmed absent afterwards.

### Files changed

Created: `clients/encore/src/fixtures/label-derivation.ts`, `clients/encore/src/fixtures/step-decorator.ts`, `clients/encore/tests/_unit/label-derivation.spec.ts`, `scripts/test-fixtures/negative-step-label.fixture.txt`, `.claude/rules/no-wrappers.md`.
Deleted (`git rm`): `clients/encore/src/fixtures/step-wrapper.ts`, `clients/encore/tests/_unit/step-wrapper.spec.ts`.
Modified: `clients/encore/src/fixtures/pages.fixture.ts` (19 fixtures unwrapped), 21 page-object files (793 annotations + 20 imports), `clients/encore/tsconfig.json`, `scripts/check-step-labels.mjs`, `scripts/lib/forbidden-patterns.mjs`, `scripts/deliverable/delivery-manifest.encore.json`, `scripts/lib/label-derivation.mjs` (comments only), `.githooks/pre-commit`, `clients/encore/CLAUDE.md` (LR-ENC-006).

### Out-of-scope finding — eleven pre-existing test failures (NOT-OURS)

`TC-LOC-CUR-014, 015, 017, 021, 022, 023, 024, 025, 026, 027, 028` fail deterministically as of 2026-07-31 ~12:05, all with the same shape: check a checkbox, assert `isSaveEnabled()` is true, receive false. They passed 29/29 at 10:34 the same morning. Attribution was established by control run (above): pre-change code fails the identical eleven. Cause lies between 10:34 and 12:05 and is external to this refactor — candidates are a live application change, test-data drift, or another session's concurrent edits to `clients/encore`. Handed off as a standalone task with all three run artifacts cited. **No test was modified, skipped, or weakened by this plan.**

### Uncommitted-state caveat for whoever ships next

The new source files are staged but **not committed**. `npm run client:ship` archives from `HEAD`, so a ship before commit would deliver a tree whose page objects import a `step-decorator` that is not present. Commit before shipping.

---

## Handoff

Chat-only, per framework handoff discipline. Report, in plain English: which AC claims were confirmed and which were refuted (with the actual command output for each); the machine-derived decorator count and how it compares to 793; what the Phase 1A smoke run showed; whether the HTML report labels came back identical to baseline; and which form the Proxy guard took (pattern file vs standalone script) and why.

If any AC claim was REFUTED, the handoff is a HALT report and nothing after that phase was executed — say so in the first line rather than burying it.
