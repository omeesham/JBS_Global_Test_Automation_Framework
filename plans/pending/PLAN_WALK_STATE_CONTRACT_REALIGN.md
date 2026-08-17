**Status**: Pending
**Created**: 2026-08-06
**Model**: opus
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli

> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_WALK_STATE_CONTRACT_REALIGN.md`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load /identity OWNER (no pipeline role — this is a cross-cutting infrastructure fix).
> 2. **Skills**: `/execute` (leading skill); auto-calls `/regression-guard` before+after.
> 3. **Model + thinking + permission-mode**: opus / xhi / auto (from frontmatter above).
> 4. **Dependency gate**: none — standalone plan.
> 5. **Context load**: read this plan in full, then the files listed in Phase 0.
> 6. **Browser tool**: `cli` — Playwright CLI for the live re-enumeration run in Phase 4.
> 7. **Execute Phase 0** (mandatory self-verification) before any edits.
> 8. **Execute Phases 1–5** sequentially.
> 9. **Handoff**: flip the Status field to the completed state, add the Executed date, append activity-log row, git mv to plans/done/, reindex.
>
> **HALT + ASK USER conditions** (never silently proceed):
> - Phase 0 grep contradicts the problem report → stop, re-diagnose.
> - Dated per-archetype probe artifact does NOT exist on disk → cannot satisfy evidence states; surface to user.
> - Files are cross-session locked → wait or hand the edit to the owning session.
> - F2 language-filter click times out on live re-run AND a second attempt also fails → HALT into `/rca` (2-failure rule).
> - Phase 0 discovers >30% scope extension beyond F1–F5.
> - Regression-guard shows unrelated changes.
> - Phase 0 cannot identify the exact language-filter trigger (testid/role/text/selector) from the executing machine's tree → HALT, cannot author F2 opener row without a verified selector.

---

## Absorbed from SUBPLAN_WALK_TOOLING_SILENT_GREEN

> Folded 2026-08-06 per LR-073 (one plan per initiative). The source subplan is archived at `plans/_archive/SUBPLAN_WALK_TOOLING_SILENT_GREEN.md`. Every finding is preserved intact below with its original evidence and acceptance criteria. Nothing has been summarised into vagueness.

### D1 — `contentMarker` is never awaited on a flat page (**LANDED 2026-08-03 — verify only**)

**Evidence**: `service-charge-text` (flat page, `activateTabs: []`) enumerated `denominator=30` where 7 entries were shimmer placeholders (`service-charge-text-skeleton*`) and **0** were real page content; `completion_record.status:"complete"`, `halt_reasons:[]`. Reproduced **3/3** — deterministic, not flaky.

**Mechanism**: `enumerate-page.mjs` — `main()` does `goto()` then `waitReady()`; `waitReady()` polls for a **stable testid count**, and a skeleton is stable. `cfg.contentMarker` is consulted **only** inside `activateTabByTestid()`, which is called only from the `if (cfg && cfg.activateTabs)` loop. Empty `activateTabs` ⇒ nothing ever waits for content.

**Fix** (dispatched 2026-08-03): await `cfg.contentMarker` after `waitReady()` when `activateTabs` is empty; on timeout record the condition and surface it as a halt reason so `status` cannot read `"complete"`.

**Acceptance**: a flat-page walk whose marker never appears must NOT produce `status:"complete"` with an empty `halt_reasons`.

### D2 — Prove the D1 fix against a real flat page

Re-run the enumerator on `service-charge-text` after D1 lands and assert the machine condition: `entries` contains ≥1 key matching `service-charge-text-table` AND **0** keys matching `skeleton`. A passing run must also show `openersClicked > 0` for at least one cycle, since this page has 4 opener families declared.

### D3 — `verify-denominator.mjs` exits 0 while verifying nothing

**Evidence**: run with no walk report present → exit 0, **0 bytes of output**, zero mention of the module being checked. A gate that cannot fail is not a gate.

**Fix**: when invoked with no report to evaluate, print what it did (or did not) check and exit non-zero, OR require an explicit `--module` / `--report` argument so a no-op invocation is impossible. Follow LR-069 §3.3 — land at `announce` first, ramp to `deny`.

**Also**: `PLAN_SERVICE_CHARGE_TEXT_AUTOMATION` Phase 0.6 lists "`verify-denominator.mjs` accepts the new module" as a closure criterion, but the command **cannot** evaluate a module until a walk report exists. That criterion is unsatisfiable at Phase 0.6 and belongs after Phase A1. Correct the ordering when this lands.

### D4 — LR-054 Table 2 lists a `network` command the installed CLI does not have

**Evidence**: `.claude/rules/browser-tool.md:86` — `| Network / console capture | \`network\` / \`console\` | … |`. Running `playwright-cli network` returns `Unknown command: network`. The real subcommands are **`requests`** (list) and **`request <index>`** (detail); `console` IS valid.

**Why it matters**: LR-054's own mandate tells sessions to trust Table 2 over their own judgement, so a wrong row actively manufactures the hallucination the rule exists to prevent. It cost a full dispatch on 2026-08-03.

**Fix**: correct the row to `requests` / `request <index>` / `console`, and add a dated note that the table is CLI-version-sensitive and must be re-checked against `playwright-cli --help` when the binary updates.

### D5 — `jira-defect-crossref-*` has no §2 ownership row

**Evidence**: `[IDENTITY-GATE] HUNTER cannot access clients/encore/specs_planning/_internal/jira-defect-crossref-service-charge-text-2026-08-03.md per no matching §2 row; default deny.`

`REQUIREMENTS.md` workflow step 2 **mandates** HUNTER emit this artifact for every module intake, yet the gate denies the only role required to produce it.

**Fix** (ALL-077 path (b)): add a `jira-defect-crossref-*` row to `AGENT_SHARED_RULES.md` §2 **and** to its machine mirror `scripts/identity-ownership.mjs` `OWNERSHIP_ROWS`, then `node scripts/check-identity-ownership.mjs` to confirm parity.

**Gate**: this widens the permission layer — requires explicit owner authorization before landing (`feedback_self_modification_needs_explicit_go.md`).

### D6 — The ticket template's `## CLARIFY` field can stop a build worker dead

**Evidence**: ticket `sct-recon-0803b` carried the template's CLARIFY prose — *"Return ONLY the bare token `NO-QUESTIONS` … You may NOT start the work"* — inside the ticket body. The build worker obeyed it literally and returned a 14-byte `NO-QUESTIONS` file having run nothing. The identical text sat in the prior ticket and that worker ran normally, so this is a **latent** defect that fires on model nondeterminism — the dangerous kind.

**Fix**: make `## CLARIFY` a bare flag (`yes` / `no`) in `~/.claude/delegation/ticket-template.md`, with all clarify-round imperatives living ONLY in the separate `-clarify.md` task file. Optionally have the wrapper strip or neutralise worker-facing imperatives from the CLARIFY field on a build dispatch.

### D7 — The wrapper accepts uncapped dispatches silently

**Evidence**: two dispatches on 2026-08-03 went out with no `--max-credits`; the wrapper accepted both without complaint. `/delegation-temp` §Dispatch calls an uncapped dispatch a structural defect, and credit exhaustion is a documented worker-death cause.

**Fix**: have the wrapper warn (then, after a ramp, refuse) when `--max-credits` is absent — same `--work-type` treatment, which already hard-exits 2 when missing.

### D8 — `moduleName` silently defaults to `'pricing'`, contaminating any unregistered walk

**Evidence**: `scripts/walk-coverage/enumerate-page.mjs` ~line 465:
```js
const moduleName = args.module || 'pricing';
const cfg = MODULE_CONFIG[moduleName];
if (!cfg && !args.url) { … process.exit(2); }
```
Because `MODULE_CONFIG['pricing']` always resolves, a `--url`-only invocation does **not** exit. It proceeds with the **pricing** config applied to a completely different page, **and still prints a success line**.

**Fix**: make the module explicit. Either require `--module` whenever `--url` is absent (no silent default), or — if a default must remain — emit a loud `[MODULE-DEFAULTED]` warning AND record it in `completion_record.halt_reasons` so a contaminated run can never read as clean.

**Acceptance**: a `--url`-only invocation against a non-pricing page must either refuse to run or produce a run whose report states, machine-readably, that the pricing config was applied by default.

### D9 — The D1 marker guard runs BEFORE the login-redirect check (ordering defect in the fix itself)

**Found by review of the D1 fix diff, 2026-08-03.** The fix is otherwise correct and is accepted; this is a follow-up ordering nit.

In `enumerate-page.mjs` `main()` the order is now:
```
await page.goto(...)  →  await waitReady(page)
→  [NEW] flat-page contentMarker wait (30s)
→  if (isLoginRedirect(page.url())) { ABORT-S1 }
```
When the saved session is stale, the new guard blocks for a full **30 seconds** before the correct `ABORT-S1` message is reached. A future debugger chases a render-timing ghost instead of a stale-auth problem.

**Fix**: move the `isLoginRedirect(page.url())` check to immediately after `waitReady(page)` and before the flat-page marker guard.

**Acceptance**: with a deliberately stale auth state, a flat-page module aborts with `ABORT-S1` and emits **no** `[CONTENT-MARKER-ABSENT]` line.

### D10 — `cross-check.mjs` has the same two silent-green holes as D3

**Evidence (2026-08-04, service-charge-text walk closure)**:

1. **Bare invocation verifies nothing.** `node scripts/walk-coverage/cross-check.mjs` with no arguments prints its usage banner and **exits 0**. `PLAN_SERVICE_CHARGE_TEXT_AUTOMATION` acceptance **A1** invokes it exactly that way and expects `CrossCheck: clean`, which that invocation can never emit. A1 as written is unsatisfiable; the real command needs `--manifest <path>`.

2. **The verdict is rubber-stampable.** `crossCheckVerdict()` (`cross-check.mjs:41`) classifies an entry as dispositioned iff `disposition` is a **non-empty string**. Typing `"x"` into every entry produces `CrossCheck: clean`. The gate proves the blanks were filled, never that they were filled truthfully.

**Fix**: require an explicit manifest argument (mirrors the D3 fix), and constrain `disposition` to a recognised vocabulary — the tokens the walk artifacts already use (`covered-by-TC:`, `affordance-probed:`, `read-only-verified`, `behavior-cases:`, `out-of-scope:`) — with a required non-empty payload after the prefix. Land at `announce` per LR-069 §3.3.

---

## Preconditions

This plan depends on two artifacts that must already exist on the executing machine before Phase 0 begins. If either is absent, Phase 0 HALTs and the two excluded states (`expand:row-language`, `edit:html-cell`) cannot be satisfied by this plan alone.

1. **Dated per-archetype probe artifact** — a JSON file conforming to the F4-v2 schema (see Phase 1), with entries keyed by state label for `expand:row-language` and `edit:html-cell`. Phase 0 step 9 searches for this file; if absent, the plan cannot proceed past Phase 0.
2. **Per-archetype probe runner** — the script or command that produces the artifact above. If the runner does not exist, the artifact cannot be regenerated, and this plan's evidence-state coverage depends on an external deliverable not within its scope.

**If these preconditions are not met**: Phase 0 HALTs. Relay Question 1 explicitly asks the colleague for confirmation. The executing agent must NOT improvise, hand-write, or skip the probe evidence requirement.

---

# PLAN: Walk-State Contract Realignment (terms-conditions + service-charge-text)

## Context

The `requiredStates` contract in `module-config.mjs` (and mirrored in `enumerate-page.mjs MODULE_CONFIG`) for modules `terms-conditions` and `service-charge-text` declares five states: `resting`, `expand:language-filter`, `expand:row-language`, `edit:html-cell`, `row-added`. Currently, only `resting` is emitted among those five labels. Two states (`expand:row-language`, `edit:html-cell`) are deliberately excluded from BFS by architectural decision (page-teardown risk), covered instead by a targeted per-archetype probe. The cascade click for the language-filter trigger emits label `cascade:alt-on` instead of the required `expand:language-filter` string (and in the recorded run timed out with `ok:false`). The self-expand loop clicks openers matching `*-add-row` but never pushes a `report.branches` record for `row-added`. This plan adds first-class emit paths for `expand:language-filter` (F2) and `row-added` (F3), extends the verifier with machine-checked probe evidence for the two excluded states (F4-v2), realigns the contract (F1), and proves end-to-end closure (F5).

## Execution Venue

**Venue A (recommended)**: Colleague's clone, pre-ship. Rationale: the Cx gate blocks THEIR plan closure (`PLAN_TERMS_CONDITIONS_AUTOMATION.md`); shipping an unclosable plan exports the defect to our tree. Executing there avoids grafting a fix that should have been authored at source.

**Venue B (fallback)**: Our clone at graft-time, per `/graft` discipline (splice → verify → prove → sync-index). Use if Rutvik rules the ship goes ahead as-is and we absorb the fix at graft. Phases are venue-identical; Phase 0 re-anchors everything by content-match, not line numbers.

## Prior-Fix Trial

**Prior fix**: The five-state `requiredStates` contract itself (authored ahead of enumerator capability), wired to Cx via `verify-denominator.mjs` check #6.

**Why it failed**: `scoped-wrong` — the contract was authored to represent the *intended* walk surface, but two of the five states contradict a deliberate, documented BFS exclusion (in-file comment: "same page-teardown risk as SCT; covered by a targeted per-archetype probe"). The enumerator was intentionally built NOT to produce these labels via BFS. Additionally, `expand:language-filter` was triggerable but mislabeled (`cascade:alt-on`), and `row-added` was clickable but never emitted a branch record.

**Verdict**: CONVICTED.

**Rewire**: F1–F4 in this plan's scope — realign the contract to what the enumerator can emit (F1), instrument the two genuinely walkable states (F2, F3), extend the verifier to accept structured probe evidence for the two excluded states (F4-v2). No layering a second contract on top.

## Forbidden Non-Fixes

The following approaches are explicitly rejected — they hide the check rather than fixing the contract:

1. **Delete `Coverage_Ratio` / `CrossCheck` / `Completion_Record`** from the field inventory so `coverageVerdict` returns `applicable:false` and Cx skips — hides the check.
2. **Hand-write the `Walk_State` line** into the manifest — bypasses machine-enumeration (LR-062).
3. **Make Cx overridable** — weakens the gate for all modules, not just these two.
4. **Drop the two excluded states** (`expand:row-language`, `edit:html-cell`) without probe evidence — removes verification coverage with no replacement mechanism.

## Phases

### Phase 0: Self-Verification (MANDATORY FIRST — no edits until all pass)

Before touching anything, the executing agent must grep/verify EVERY claim against its OWN tree by content match:

1. **Confirm walkedStateLabels assembly** — grep for `walkedStateLabels` in `enumerate-page.mjs`; verify it is assembled only from `_restingObserved` + `report.branches` entries with `ok===true`.
   - Content anchor: `...report.branches.filter(b => b.ok && b.branch).map(b => b.branch)`
2. **Confirm cascade label is hardcoded** — grep for `cascade:alt-on` in `enumerate-page.mjs`; verify the cascade path pushes `branch: 'cascade:alt-on'`, never `expand:language-filter`.
   - Content anchor: `report.branches.push({ branch: 'cascade:alt-on'`
3. **Confirm no emit paths for the four missing labels** — grep for `expand:language-filter`, `expand:row-language`, `edit:html-cell`, and `row-added` across BOTH `enumerate-page.mjs` and `module-config.mjs`; expect zero hits in our tree for emit paths (config entries may exist in the colleague's tree only). This confirms the diagnosis: currently only `resting` is emitted.
4. **Confirm BFS-exclusion comment** — grep for `page-teardown risk` or `per-archetype probe` in `enumerate-page.mjs`; confirm the documented architectural exclusion for `expand:row-language` and `edit:html-cell`.
5. **Confirm Item 1(c) evidence mechanism** — read `verify-denominator.mjs` lines containing "Item 1(c)"; verify the existing resting-only evidence check pattern exists at the content anchor:
   ```javascript
   // Item 1(c): a resting-only declaration must cite evidence (enumeration run reference).
   // A hand-written justification comment is not evidence.
   const nonResting = requiredStates.filter(s => s.label !== 'resting');
   if (nonResting.length === 0) {
   ```
6. **Confirm `openerRoleTextPatterns` table structure** — grep for `openerRoleTextPatterns` in `enumerate-page.mjs`; verify the table uses `role`/`text`/`branch` keys (optional `selector`).
   - Content anchor: `{ role: 'tab',      text: 'Labor', branch: 'tab:labor' }`
7. **Check for existing `terms-conditions` / `service-charge-text` entries** — grep for these strings in `module-config.mjs`; expect ZERO hits in our tree (they exist only in the colleague's tree).
8. **Identify the exact language-filter trigger** — grep the executing machine's tree for the language-filter opener. Look for a button/element whose role/text/testid/selector triggers the language filter dropdown. Record the EXACT trigger (testid/role/text/selector) — this is required for the F2 opener row. **If not found → HALT**: cannot author F2 without a verified selector from the executing machine's own tree.
9. **Check dated per-archetype probe artifact** — search for files matching `*probe*archetype*` or `*per-archetype*probe*` under `reports/` or `scripts/walk-coverage/` or `clients/`. The artifact must be a JSON file (or contain JSON blocks) conforming to the F4-v2 schema (see Phase 1). **If not found → HALT**: the two evidence states cannot be satisfied without the artifact; surface to user.
10. **Check cross-session lock state** — verify no `.lock` files or lock markers exist on `module-config.mjs` or `enumerate-page.mjs`. If locked → **HALT**: hand the edit to the owning session.
11. **Confirm self-expand loop structure** — grep for `for (const e of openerKeys)` in `enumerate-page.mjs`; verify the loop variable is `e` with `e.key` property, clicked via `e.key.slice(7)` as testid selector. Content anchor (line 592-598 of our tree):
    ```javascript
    for (const e of openerKeys) {
      const sel = e.key.startsWith('testid:') ? `[data-testid="${e.key.slice(7)}"]` : null;
      if (!sel) continue;
      try {
        const loc = page.locator(sel);
        if (await loc.count()) { await loc.first().click({ timeout: 5000 }); await waitReady(page); clicked++; activated.add(e.key); }
      } catch { activated.add(e.key); }
    }
    ```

**If ANY Phase 0 grep contradicts the problem report** → STOP. Re-diagnose before proceeding.

### Phase 1: Extend verify-denominator.mjs — Per-State Structured Probe Evidence (F4-v2)

**Goal**: A non-resting required state carrying `evidence: 'probe:<relpath>#<label>'` is satisfied if and only if the artifact at `<relpath>` is a machine-produced JSON receipt that passes ALL of the following checks. This is forgery-RESISTANT, not forgery-PROOF — it raises the cost of a fake from two lines of markdown to fabricating a DOM key inventory that agrees with an independently-produced walk artifact. No invented thresholds: freshness is enforced by the `walk_artifact` binding, not by a number someone made up.

**Probe receipt JSON schema** (per state label within the file):
```json
{
  "module": "<module name>",
  "state_label": "<the required state label>",
  "walk_artifact": "<repo-relative path to the walk artifact this probe belongs to>",
  "trigger": "<exact testid/role/text/selector acted on>",
  "observed_keys_before": ["<array of DOM keys before action>"],
  "observed_keys_after": ["<array of DOM keys after action>"],
  "generated_by": "<exact command that produced this receipt>",
  "generated_at": "<ISO timestamp>",
  "git_head": "<sha at run time>"
}
```

**Verifier checks** (all must pass or the state FAILS with a named reason):
1. The cited path resolves on disk — a dangling citation is a FAIL, never a skip.
2. It parses as JSON and every field above is present and non-empty — a missing field is a FAIL, not a warning.
3. `module` equals the module being verified, and `state_label` equals the required label being satisfied.
4. `walk_artifact` names the SAME artifact currently under verification — this is the binding that stops a probe from one module/run being recycled into another.
5. **The delta is non-empty**: `observed_keys_after` must contain at least one key absent from `observed_keys_before`. An action that revealed nothing did not happen.
6. **Cross-artifact consistency — subset check**: every key in `observed_keys_before` must exist in the walk artifact's resting-state element inventory (`data.entries.map(e => e.key)`). The probe started from the resting page, so every key it saw before acting must be a key the independently-produced walk artifact also recorded. A forger does not write the walk artifact, so they cannot invent `before` keys freely.
7. **Cross-artifact consistency — novelty check**: at least one key in `observed_keys_after` must be ABSENT from the resting inventory. The whole justification for this state being excluded from BFS is that opening it reveals something the walk cannot reach. A probe that revealed only keys the walk already had did not prove the excluded state exists.
8. **Missing/unparseable resting inventory is a FAIL**: if the walk JSON has no `entries` array, or it is empty, or `data.entries` cannot be mapped to keys, the check FAILS with reason `"resting inventory missing/unparseable in walk artifact — cannot verify probe consistency"`. This is an explicit branch that returns a named failure, never a skip and never a pass. A green produced by the check being invisible is the failure mode this whole plan exists to kill.

**Content-match edit anchor** (in `verify-denominator.mjs`, file: `scripts/walk-coverage/verify-denominator.mjs`):
```javascript
// Item 1(c): a resting-only declaration must cite evidence (enumeration run reference).
// A hand-written justification comment is not evidence.
const nonResting = requiredStates.filter(s => s.label !== 'resting');
if (nonResting.length === 0) {
```

**Edit**: After the existing Item 1(c) block (after its closing `}` on the line following `reasons.push(...RESTING-ONLY TAUTOLOGY...)`), insert:

```javascript
// Item 1(d): a non-resting required state with a `probe:` evidence field is satisfied
// by a structured JSON probe receipt existing on disk, passing schema + cross-artifact
// consistency checks against the walk JSON's resting inventory.
// Forgery-RESISTANT, not forgery-PROOF: raises the cost of a fake from two lines of
// markdown to fabricating a DOM key inventory that agrees with an independently-produced
// walk artifact. No invented thresholds.
for (const state of requiredStates) {
  if (!state.evidence || state.label === 'resting') continue;
  const probeMatch = state.evidence.match(/^probe:([^#]+)#(.+)$/);
  if (!probeMatch) {
    reasons.push(`malformed probe evidence format for "${state.label}": ${state.evidence}`);
    continue;
  }
  const [, relpath, probeLabel] = probeMatch;
  const artifactPath = resolve(REPO_ROOT, relpath);
  if (!existsSync(artifactPath)) {
    reasons.push(`probe evidence artifact not found: ${relpath} (required for state "${state.label}")`);
    continue;
  }
  let probeData;
  try {
    probeData = JSON.parse(readFileSync(artifactPath, 'utf-8'));
  } catch (e) {
    reasons.push(`probe evidence artifact is not valid JSON: ${relpath} (${e.message})`);
    continue;
  }
  // Support both top-level object (single label) and keyed-by-label object
  const entry = probeData[probeLabel] || (probeData.state_label === probeLabel ? probeData : null);
  if (!entry) {
    reasons.push(`probe evidence label "${probeLabel}" not found as key or state_label in: ${relpath}`);
    continue;
  }
  const requiredFields = ['module', 'state_label', 'walk_artifact', 'trigger',
    'observed_keys_before', 'observed_keys_after', 'generated_by', 'generated_at', 'git_head'];
  const missing = requiredFields.filter(f => !entry[f] || (Array.isArray(entry[f]) && entry[f].length === 0));
  if (missing.length > 0) {
    reasons.push(`probe receipt for "${probeLabel}" missing/empty fields: ${missing.join(', ')} in: ${relpath}`);
    continue;
  }
  if (entry.module !== moduleName) {
    reasons.push(`probe receipt module mismatch: expected "${moduleName}", got "${entry.module}" in: ${relpath}`);
    continue;
  }
  if (entry.state_label !== probeLabel) {
    reasons.push(`probe receipt state_label mismatch: expected "${probeLabel}", got "${entry.state_label}" in: ${relpath}`);
    continue;
  }
  if (entry.walk_artifact !== jsonPath) {
    reasons.push(`probe receipt walk_artifact binding mismatch: expected "${jsonPath}", got "${entry.walk_artifact}" in: ${relpath}`);
    continue;
  }
  // Check 5: Delta check — observed_keys_after must contain at least one key absent from observed_keys_before
  const beforeSet = new Set(entry.observed_keys_before);
  const newKeys = entry.observed_keys_after.filter(k => !beforeSet.has(k));
  if (newKeys.length === 0) {
    reasons.push(`probe receipt for "${probeLabel}" shows no new keys after action (empty delta) in: ${relpath}`);
    continue;
  }
  // Check 6-8: Cross-artifact consistency against walk JSON resting inventory.
  // The walk JSON's data.entries array IS the resting-state element inventory.
  // This is the load-bearing direction: the forger does not write the walk artifact.
  if (!data || !Array.isArray(data.entries) || data.entries.length === 0) {
    reasons.push(`resting inventory missing/unparseable in walk artifact — cannot verify probe consistency for "${probeLabel}" (module: ${moduleName})`);
    continue;
  }
  const restingInventory = new Set(data.entries.map(e => normalize(e.key)));
  // Check 6: observed_keys_before ⊆ resting inventory
  const beforeNotInResting = entry.observed_keys_before.filter(k => !restingInventory.has(normalize(k)));
  if (beforeNotInResting.length > 0) {
    reasons.push(`probe receipt for "${probeLabel}" has observed_keys_before not in resting inventory: [${beforeNotInResting.slice(0, 5).join(', ')}] (module: ${moduleName})`);
    continue;
  }
  // Check 7: observed_keys_after \ resting inventory ≠ ∅
  const afterNotInResting = entry.observed_keys_after.filter(k => !restingInventory.has(normalize(k)));
  if (afterNotInResting.length === 0) {
    reasons.push(`probe receipt for "${probeLabel}" reveals no keys absent from resting inventory — state exclusion not justified (module: ${moduleName})`);
    continue;
  }
  // All checks pass — state satisfied by structured probe evidence.
}
```

**Additionally**: modify the walked-set check loop. Content anchor (file: `scripts/walk-coverage/verify-denominator.mjs`):
```javascript
for (const { label } of requiredStates) {
  if (!walkedLabels.has(label)) {
    reasons.push(`required walk state missing: "${label}" (module: ${moduleName})`);
  }
}
```

Replace with:
```javascript
for (const { label, evidence } of requiredStates) {
  if (evidence && evidence.startsWith('probe:')) continue; // satisfied by Item 1(d)
  if (!walkedLabels.has(label)) {
    reasons.push(`required walk state missing: "${label}" (module: ${moduleName})`);
  }
}
```

**Unit fixture**: Create file `scripts/walk-coverage/tests/verify-probe-evidence.fixture.mjs` — a self-contained Node script that:
1. Creates a temporary JSON probe receipt in a temp dir.
2. Imports `verifyDenominator` from `../verify-denominator.mjs`.
3. Asserts these cases: (a) missing file → FAIL with reason containing "not found"; (b) valid receipt with empty delta → FAIL with "no new keys"; (c) valid receipt with non-empty delta but observed_keys_before not in resting inventory → FAIL with "not in resting inventory"; (d) valid receipt with non-empty delta and observed_keys_after all in resting → FAIL with "no keys absent from resting inventory"; (e) valid receipt with non-empty delta, before ⊆ resting, after has novelty → PASS (zero reasons).
4. Run: `node scripts/walk-coverage/tests/verify-probe-evidence.fixture.mjs`

**Compliance**: no empty catch blocks (LR-003); `resolve`/`existsSync`/`readFileSync` imports already present at top of file — verify, add if missing.

### Phase 2: Instrument Enumerator — language-filter opener + row-added branch (F2 + F3)

#### F2: First-class language-filter opener

**Precondition**: Phase 0 step 8 identified the exact trigger (testid/role/text/selector) for the language-filter opener from the executing machine's own tree. If that step HALTed, this phase cannot proceed.

**Content-match edit anchor** (in `enumerate-page.mjs`, inside the module config for `terms-conditions`):
```javascript
openerRoleTextPatterns: [
```
(within the `terms-conditions` module config block — which exists only in the colleague's tree; in our tree this is a NEW entry, so the anchor is the end of the existing MODULE_CONFIG or the insertion point for the new module.)

**Edit**: Add the language-filter trigger to the `openerRoleTextPatterns` table for `terms-conditions` (and identically for `service-charge-text`), using the EXACT trigger discovered in Phase 0 step 8:
```javascript
{ role: '<PHASE0_DISCOVERED_ROLE>', text: '<PHASE0_DISCOVERED_TEXT>', branch: 'expand:language-filter', selector: '<PHASE0_DISCOVERED_SELECTOR_IF_NEEDED>' },
```
The branch label MUST be exactly `expand:language-filter` to match the contract. The existing `openerRoleTextPatterns` loop (content anchor below) automatically pushes a `report.branches` record when the click succeeds:
```javascript
report.branches.push({ branch, openerText: pattern.text, addedKeys: inlinePortals.length, ok: true });
```
(File: `enumerate-page.mjs`, within the `openerRoleTextPatterns` iteration block.)

**Live re-run requirement**: After this edit, a fresh enumeration MUST be run (Phase 4). If the language-filter click times out (`ok: false`) on the first attempt, retry once. If it fails again → **HALT into `/rca`** (2-failure rule). A label fix cannot masquerade as a walk fix — the click must succeed.

**Phase 4 assertion**: The emitted `report.branches` entry must contain `{ branch: 'expand:language-filter', openerText: '<PHASE0_DISCOVERED_TEXT>', ok: true }`. Explicitly FAIL if the only `expand:language-filter` source in the output is the old `cascade:alt-on` path renamed — the cascade path must remain labeled `cascade:alt-on` and the language-filter branch must come from its own dedicated opener row.

#### F3: row-added instrumentation

**Real self-expand loop structure** (content-match anchor in `enumerate-page.mjs`):
```javascript
for (const e of openerKeys) {
  const sel = e.key.startsWith('testid:') ? `[data-testid="${e.key.slice(7)}"]` : null;
  if (!sel) continue;
  try {
    const loc = page.locator(sel);
    if (await loc.count()) { await loc.first().click({ timeout: 5000 }); await waitReady(page); clicked++; activated.add(e.key); }
  } catch { activated.add(e.key); }
}
```

**Problem**: This loop clicks openers matching `openerTestidPatterns` but never emits a branch record. The `after` state (content anchor: `const after = await enumerateState(page);`) is computed AFTER the entire opener loop, so per-opener row-count delta is not captured.

**Edit**: Replace the body of the `for (const e of openerKeys)` loop to capture row-count before/after each add-row click. Locate the loop by content match (the executing machine's tree is AHEAD — locate by content, never by line number). Replace:
```javascript
for (const e of openerKeys) {
  const sel = e.key.startsWith('testid:') ? `[data-testid="${e.key.slice(7)}"]` : null;
  if (!sel) continue;
  try {
    const loc = page.locator(sel);
    if (await loc.count()) { await loc.first().click({ timeout: 5000 }); await waitReady(page); clicked++; activated.add(e.key); }
  } catch { activated.add(e.key); }
}
```

With:
```javascript
for (const e of openerKeys) {
  const sel = e.key.startsWith('testid:') ? `[data-testid="${e.key.slice(7)}"]` : null;
  if (!sel) continue;
  const testid = e.key.slice(7);
  const isAddRow = testid.endsWith('-add-row');
  let rowCountBefore;
  if (isAddRow) {
    const snap = await enumerateState(page);
    rowCountBefore = snap.entries.length;
  }
  try {
    const loc = page.locator(sel);
    if (await loc.count()) {
      await loc.first().click({ timeout: 5000 });
      await waitReady(page);
      clicked++;
      activated.add(e.key);
      if (isAddRow) {
        const snap = await enumerateState(page);
        const rowCountAfter = snap.entries.length;
        const ok = rowCountAfter > rowCountBefore;
        report.branches.push({ branch: 'row-added', openerTestid: testid, ok });
      }
    }
  } catch { activated.add(e.key); }
}
```

The `ok` field is a REAL post-condition (row count increased after the click), not merely "click didn't throw". This keeps the numerator machine-owned.

### Phase 3: Contract Edits — module-config.mjs + enumerate-page.mjs MODULE_CONFIG (F1)

**For BOTH modules** `terms-conditions` and `service-charge-text`, set `requiredStates` to:

```javascript
requiredStates: [
  { label: 'resting' },
  { label: 'expand:language-filter' },
  { label: 'row-added' },
  { label: 'expand:row-language', evidence: 'probe:<dated-per-archetype-probe-artifact-relpath>#expand:row-language' },
  { label: 'edit:html-cell', evidence: 'probe:<dated-per-archetype-probe-artifact-relpath>#edit:html-cell' },
],
```

Where `<dated-per-archetype-probe-artifact-relpath>` is the actual repo-relative path to the per-archetype probe artifact discovered in Phase 0 step 9 — a JSON file conforming to the F4-v2 schema with entries keyed by state label. If Phase 0 did not find it → this phase cannot execute (HALT should have fired).

**File 1 — `scripts/walk-coverage/lib/module-config.mjs`**:

Content-match edit anchor (end of existing entries, before closing `};`):
```javascript
  'corporate-pricing-new-pricebook': {
    requiredStates: [{ label: 'resting', evidence: 'enumeration:2026-06-05:zero-openers-found' }],
  },
```
Insert AFTER this block (before the closing `};` of MODULE_CONFIG) the two new module entries.

**File 2 — `scripts/walk-coverage/enumerate-page.mjs`**:

The mirrored MODULE_CONFIG (or per-module config block) must carry the identical `requiredStates`. Content-match edit anchor: the module's config object within enumerate-page (in the colleague's tree this exists; in our tree it will be a new entry). The anchor for insertion is determined by Phase 0 exploration of the existing module configs in that file.

**Both files must stay in sync** (per the header comment in module-config.mjs line 4-5).

### Phase 4: Live Re-Enumeration + Gate Runs (F5)

1. **Re-enumerate `terms-conditions`**:
   ```bash
   node scripts/walk-coverage/enumerate-page.mjs --module=terms-conditions --out=<planned terms-conditions walk-coverage JSON output> 2>&1 | tee phase4-enumerate-tc.log
   ```
   Verify: the generated manifest for terms-conditions (planned output from the enumeration run) contains `Walk_State` with the expected walked labels (`resting`, `expand:language-filter`, `row-added`). The two probe-evidence states are NOT expected in the walked set — they are satisfied by artifact, not enumeration. Additionally inspect the JSON output's `branches` array for `{ branch: 'expand:language-filter', ..., ok: true }` sourced from the language-filter opener row (NOT from cascade), and `{ branch: 'row-added', ..., ok: true }`. **Explicitly FAIL if the only `expand:language-filter` branch is the old cascade path renamed.**

2. **Re-enumerate `service-charge-text`**:
   ```bash
   node scripts/walk-coverage/enumerate-page.mjs --module=service-charge-text --out=<planned service-charge-text walk-coverage JSON output> 2>&1 | tee phase4-enumerate-sct.log
   ```

3. **Run `verify-denominator`** — since `verify-denominator.mjs` exports functions without a CLI dispatcher, invoke via inline script:
   ```bash
   node -e "
     import { verifyDenominator } from './scripts/walk-coverage/verify-denominator.mjs';
     import { readFileSync } from 'fs';
     const manifest = readFileSync('reports/walk-coverage/terms-conditions.manifest.md', 'utf-8');
     const result = verifyDenominator(manifest, 'reports/walk-coverage/terms-conditions.json');
     console.log(JSON.stringify(result, null, 2));
     process.exit(result.reasons?.length ? 1 : 0);
   " 2>&1 | tee phase4-verify-tc.log
   ```
   Expected: PASS (zero reasons).
   (Parser source: `verify-denominator.mjs` exports `verifyDenominator(artifactText, jsonPath)` at line 93; no CLI dispatcher exists — file has no `process.argv` usage.)

4. **Run `validate-plan-closure.mjs`** for `PLAN_TERMS_CONDITIONS_AUTOMATION.md` — use the real CLI interface:
   ```bash
   node scripts/validate-plan-closure.mjs --plan plans/pending/PLAN_TERMS_CONDITIONS_AUTOMATION.md --enforce --coverage-mode=deny --json 2>&1 | tee phase4-closure.log
   ```
   Expected: exit 0, JSON output shows all checks PASS including Cx (coverage/walk-state).
   (Parser source: `validate-plan-closure.mjs:1561-1635` — accepts `--plan <path>`, `--enforce`, `--coverage-mode=<mode>`, `--json`; no `--check` flag exists.)

5. **`service-charge-text` verify-denominator**: run the same inline-script pattern for SCT. Expected: PASS after step 2.

**If F2 click times out**: retry once. If second attempt also fails → HALT into `/rca`. Do NOT relabel the cascade click as a substitute.

### Phase 5: Closure Ceremony

Per the plan's own closure rules:
1. Verify all VERIFY commands pass.
2. Flip the plan's status field to the completed state; add the executed date.
3. Append activity-log row.
4. `git mv` to `plans/done/`.
5. Run `plans-reindex`.

## Verification

```bash
# After Phase 2+3 edits:
grep -n "expand:language-filter" scripts/walk-coverage/lib/module-config.mjs
grep -n "expand:language-filter" scripts/walk-coverage/enumerate-page.mjs
grep -n "row-added" scripts/walk-coverage/enumerate-page.mjs

# After Phase 1:
grep -n "Item 1(d)" scripts/walk-coverage/verify-denominator.mjs
grep -n "probe evidence" scripts/walk-coverage/verify-denominator.mjs

# After Phase 4 — invoke verifier via inline script (no CLI dispatcher):
# Parser: verify-denominator.mjs:93 exports verifyDenominator(artifactText, jsonPath)
node -e "
  import { verifyDenominator } from './scripts/walk-coverage/verify-denominator.mjs';
  import { readFileSync } from 'fs';
  const manifest = readFileSync('reports/walk-coverage/terms-conditions.manifest.md', 'utf-8');
  const result = verifyDenominator(manifest, 'reports/walk-coverage/terms-conditions.json');
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.reasons?.length ? 1 : 0);
"

# Closure gate — real invocation per parser at validate-plan-closure.mjs:1566-1620:
node scripts/validate-plan-closure.mjs --plan plans/pending/PLAN_TERMS_CONDITIONS_AUTOMATION.md --enforce --coverage-mode=deny --json
```

Expected: all greps return ≥1 hit; all node commands exit 0 with PASS.

## NOT Touched

- Field-inventory artifacts (no edits to inventory content).
- Coverage manifest content (machine-generated; re-generated by enumeration).
- Cx overridability (stays non-overridable).
- Unrelated modules' `requiredStates` (pricing, corporate-override, etc.).
- Any file outside `scripts/walk-coverage/` except the probe artifact (read-only reference).

## Relay Questions

For Rutvik to pass to the colleague's Claude (answerable self-serve in Phase 0):

1. **Does the dated per-archetype probe artifact exist on disk, and does it conform to the F4-v2 JSON schema?** — What is its full repo-relative path? If absent, the probe runner that produces this receipt must be built first — that is a Phase 0 HALT, not an improvisation. (Phase 0 step 9 searches for it; if absent, the two evidence states cannot be satisfied and Phase 3 cannot complete.)
2. **What is the exact language-filter trigger?** — The testid, role, text, or selector that opens the language filter dropdown on the terms-conditions page. Phase 0 step 8 must discover this from the executing machine's own tree. Without it, F2 cannot be authored.
3. **Is the cascade-click timeout reproducible on a fresh run?** — The recorded run showed `ok:false` for the cascade path. Is this a flake (network/timing) or a persistent selector issue? (Determines whether F2 can succeed or needs `/rca` first.)
4. **Does their `verify-denominator.mjs` already carry any per-state evidence support beyond Item 1(c)?** — If they already extended it, Phase 1 may be a no-op or need merge rather than insertion.

## Limitations

**F4-v2 is forgery-resistant, not forgery-proof.** The cross-artifact consistency check makes a forged receipt require fabricating a key set that agrees with a separately machine-produced walk artifact, which is meaningfully harder than a hand-written file. Specifically: `observed_keys_before` must be a subset of the walk JSON's resting element inventory, and `observed_keys_after` must contain at least one key absent from that inventory. This means a forger must know the exact resting keys the enumerator independently recorded AND invent a plausible key that does not appear in that set.

**This is not cryptographic proof.** A determined author who has the walk artifact in hand could read its resting keys and construct a passing fake — choosing `before` keys from the real inventory and inventing an `after` key that is absent. The check makes single-source forgery (writing a probe receipt without reading the walk artifact) detectable, but does not eliminate coordinated forgery by someone with access to both artifacts. This is accepted as sufficient for the trust model (same-team, good-faith pipeline agents with audit trail).

## Review Defense Log

| # | Finding | Disposition | Evidence / Fix Pointer |
|---|---------|-------------|----------------------|
| 1 | [BLOCKER] F4 rubber stamp — any file with label+PASS satisfies | **FIXED** | F4 entirely replaced by F4-v2 (Phase 1): structured JSON schema with 8 verifier checks including `walk_artifact` binding, non-empty delta, cross-artifact consistency against resting inventory. See Phase 1 "Verifier checks" list. |
| 2 | [BLOCKER] F3 edit anchors invented — no `opener.testid`, no `before.entries` | **FIXED** | F3 rewritten against real loop: `for (const e of openerKeys)` with `e.key.slice(7)` for testid, per-click `enumerateState()` snapshots for row count. See Phase 2 → F3 content-match anchor quoting lines 592-598. |
| 3 | [BLOCKER] `verify-denominator.mjs --module=...` is a no-op — no CLI dispatcher | **FIXED** | All verify-denominator invocations replaced with `node -e` inline scripts importing `verifyDenominator(artifactText, jsonPath)`. Parser evidence: file exports at line 93, no `process.argv` usage. See Phase 4 step 3 and Verification section. |
| 4 | [BLOCKER] `validate-plan-closure.mjs --check=Cx` unsupported | **FIXED** | Replaced with real invocation: `--plan <path> --enforce --coverage-mode=deny --json`. Parser evidence: `validate-plan-closure.mjs:1566` (`args.indexOf('--plan')`), `:1587` (`--coverage-mode=`), `:1573` (`--enforce`), `:1580` (`--json`). See Phase 4 step 4 and Verification section. |
| 5 | [MAJOR] Output JSON doesn't contain `walked=[...]` — Walk_State is in .manifest.md | **FIXED** | Phase 4 step 1 now verifies `.manifest.md` for `Walk_State` AND inspects JSON `branches` array for `ok:true` records. See Phase 4 step 1. |
| 6 | [MAJOR] Diagnosis says "can only emit three" but only resting is emitted | **FIXED** | Context section rewritten: "Currently, only `resting` is emitted among those five labels" + explicitly states F2/F3 ADD the emit paths. See Context paragraph. |
| 7 | [MAJOR] F2 opener selector is a guess | **FIXED** | Phase 0 step 8 now REQUIRES identifying the exact trigger from the executing machine's own tree, with HALT if not found. Relay Question 2 added. Phase 2 F2 uses `<PHASE0_DISCOVERED_*>` placeholders filled by Phase 0. |
| 8 | [MAJOR] Relabeled cascade could satisfy label check | **FIXED** | Phase 4 step 1 now explicitly FAILS "if the only `expand:language-filter` branch is the old cascade path renamed". Phase 2 F2 section adds assertion that the branch must come from its own dedicated opener row, not cascade. |
| 9 | [MAJOR] Per-archetype probe artifact has no schema/producer/fallback | **ACCEPTED AS PRECONDITION** | Promoted to `## Preconditions` section at plan top. Phase 0 step 9 HALTs if absent. Relay Question 1 asks explicitly. The dispatcher accepts this as a declared precondition — only the executing machine can answer whether the artifact exists. |
| 10 | [MAJOR] Unit fixture has no runner/filename/command specified | **FIXED** | Phase 1 now names exact file (`scripts/walk-coverage/tests/verify-probe-evidence.fixture.mjs`), command (`node scripts/walk-coverage/tests/verify-probe-evidence.fixture.mjs`), and five test cases including the cross-artifact checks. |
| 11 | [MINOR] Phase 0 omits explicit grep for the four missing labels | **FIXED** | Phase 0 step 3 added: grep for all four labels across both files, expect zero emit-path hits. |
| 12 | [MINOR] Structural gates pass | **DEFENDED** | No fix needed — reviewer confirmed structural sections present. |
| 13 | [BLOCKER] Cross-artifact consistency check was comment-only — code is prose wearing a mechanism's clothes | **FIXED** | Phase 1 code now implements the REAL comparison: harvests resting inventory from `data.entries`, checks `observed_keys_before ⊆ restingInventory` (check 6), checks `observed_keys_after \ restingInventory ≠ ∅` (check 7), and explicitly FAILs with a named reason when resting inventory is missing/unparseable (check 8). No postponed steps — the comment-only placeholder is gone. See Phase 1 code block, lines starting at "Cross-artifact consistency against walk JSON resting inventory". |
