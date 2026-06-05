---
**Status**: PENDING
**Priority**: P1
**Created**: 2026-06-02
**Identity**: OWNER
**Depends on**: (none — self-contained; consumes the 2026-06-02 live-walk triage in §3 + PLAN_LIVE_QA_VERIFICATION_2026_06_02 evidence)
**Model**: opus
**Thinking**: xhi
**PermissionMode**: acceptEdits
**BrowserTool**: cli
**Skills**: /execute (orchestrator), /rca (auto-loads on any item that fails to go green within its 2-cycle fix budget)
---

> 🤖 **SESSION BOOTSTRAP — invoke with `/execute PLAN_SPEC_FIX_HIST_SSL_ACC_REENABLE_2026_06_02.md`. All context below.**
>
> The session self-bootstraps from this file. On invocation, without further prompting:
>
> 1. **Identity**: load /identity → OWNER (per frontmatter).
> 2. **Skills**: /execute orchestrates; **/rca auto-loads the moment any item does not reach green within its documented 2-cycle fix budget** (per `.claude/skills/rca/SKILL.md` — artifact-first READ then HEADED `playwright-cli` live walk). RCA is not optional decoration: items 5 (ACC-030) and 6 (MGH-019) are RCA-gated by design; the four "deterministic" fixes fall through to /rca on any unexpected red.
> 3. **Model + thinking + permission**: Opus / xhi / acceptEdits. (Deterministic file-edit steps are marked `[SONNET-SAFE]`; live-walk + RCA steps are `[OPUS-ONLY]`. The whole plan runs on Opus, so no handoff — the tags only document which steps are adaptive.)
> 4. **Dependency gate**: none. Confirm `clients/encore/.auth/encore-state.json` exists (auth for live walks) and `CI` / `CI_ENV` are unset (LR-ENC-003 — never set `CI_ENV=e2e` locally).
> 5. **Context load**: read this plan in full + the four target spec files + their page objects (all cited at file:line in §5) + `.claude/rules/specs.md`, `angular.md`, `browser-tool.md`. Read the live-walk triage in §3 — it is the ground truth this plan executes against.
> 6. **Browser tool**: `cli` — live `playwright-cli` (Microsoft `@playwright/cli` 0.1.8, installed GLOBALLY; **NOT** `npx playwright`, the test runner — LR-054). All Phase-0.5 DOM forensics + all RCA live walks use `playwright-cli` with `-s=<session>` on every command and `state-load C:/Users/rutvi/projects/encore_framework/clients/encore/.auth/encore-state.json` (ABSOLUTE path). Office **1604** (the test office — it is the one office with paginated history + the seeded account, so 1604 is correct and required here; this is NOT the no-1604 campaign).
> 7. **Phase 0 FIRST**: dependency + browser gate + LR-024 clean. Then **Phase 0.5 — the mandatory CLI DOM-forensics walk** (do NOT edit a single line of page-object/spec code before Phase 0.5 has captured the live DOM each fix depends on). The 2026-06-01 fixme/bound decisions were made artifact-first WITHOUT a live walk; this plan corrects that by walking first.
> 8. **Execute Phases 1→6** per §5, each with its embedded run-twice + RCA gate.
> 9. **Handoff**: flip this plan's Status field to DONE + add the Executed date, write the Execution Summary (LR-027), update the deliverable + tracker (§7), append an activity-log row (LR-028 + LR-037 — timestamp ≥ every touched-file mtime), `git mv` to plans/done/, `npm run plans:reindex`, then `/final-q`.
>
> **HALT + ASK USER** if: (a) a Phase-0.5 walk shows a fix's DOM assumption is WRONG and the honest fix would materially change scope (e.g. the read-only check cannot be cleanly scoped without touching unrelated callers); (b) an item can only go green by weakening/deleting the assertion it was meant to prove (malicious green-force) — surface it RED, never force it; (c) MGH-019's live walk confirms the app-bug "first/last buttons vanish" — then REVERT to the verbatim `test.skip` line + report, do not delete assertions; (d) ACC-030's walk shows the seeded account is gone or the filter is genuinely broken (app bug) — surface, do not fabricate a green; (e) the file count or RCA fan-out exceeds this plan's enumerated scope by >30%.

---

# PLAN: Re-enable / de-flake the 6 fixable tests from the 2026-06-02 live QA verification

## §1 Context & Goal

A 2026-06-02 live QA verification (`PLAN_LIVE_QA_VERIFICATION_2026_06_02.md`, now in `plans/done/`) and a follow-up honest triage established that of **12** tests flagged in the spec-fix brief, **6 need fixing** and **6 need no change**. The brief claimed all 6 fixable items were "OUR spec defects, fixable without any app change." The user explicitly distrusted that framing and demanded an evidence-based answer: *which can be made to genuinely run and pass — versus which would only go green by neutering an assertion (malicious green-force) or which hide a real app bug.*

This plan **executes the 6 honest fixes** and verifies each runs green (individually ×2 per LR-024, then full-file per LR-018) — **unless a live `playwright-cli` walk proves the failure is an Encore-side problem**, in which case the test is reverted verbatim and the app bug is reported with live evidence. No assertion is ever weakened below what it was authored to prove.

**The 6 fixes** (full triage in §3): TC-LOC-MGH-015, TC-LOS-HIS-006 (read-only scoping); TC-LOC-SSL-035 (relative assertion, LR-022); TC-LOC-ACC-020 (per-test baseline, LR-019); TC-LOC-ACC-030 (search-timing, RCA-gated); TC-LOC-MGH-019 (pagination, RCA-gated, conditional revert).

**The 6 that need NO change** (do not touch — editing a sound/passing test to satisfy a mis-stated brief is itself a defect): TC-LOC-NTS-039/046/047/059 (read the Notes **form**, not history — the brief's "content-anchored history lookup" fix is a no-op for them; they are form-based and already sound) and TC-LOC-NTS-028/031 (**already** use content-anchored `getRowsSinceTimestamp`).

## §2 Out of scope (explicitly excluded)
- **The 6 Notes tests** (NTS-028/031/039/046/047/059). Confirmed correct by prior live walk; no edit. If a future run shows one flakes, that is a *different* cause (form-reload timing / Angular dirty-state per LR-026) — file it separately, do not retrofit the brief's wrong fix here.
- **No malicious green-forcing.** No relaxing an assertion below its intent, no deleting the failing part of a test, no asserting a constant that cannot be reached. An item that cannot pass honestly is surfaced RED with live evidence — never forced.
- **No new TCs.** This re-enables/repairs existing TC IDs only — parity IDs already exist in the deliverable, so `check:tc-parity` ID-existence is preserved.
- **No app-code changes.** This is a test-framework repo; the only Encore-side action available is *reporting* a bug + reverting the test.

## §3 Ground truth — the honest triage (live-walk evidence, 2026-06-02; NOT assumed)

| # | TC-ID | Brief's claim | Live-walk reality (evidence) | Fix class |
|---|---|---|---|---|
| 1 | TC-LOC-MGH-019 | "works, just un-skip" | `test.skip` comment claims app bug (first/last buttons vanish after Next→Prev). Prior 1604 walk found pagination **works**; the real page indicator is an **`input`**, not the `<span>` `getPaginationText()` looks for → `.toContain('2')` fails. App-bug claim is UNCONFIRMED and contradicted. | **RCA-gated conditional** — un-skip (LR-021), live-walk the exact Next→Prev→Last→First sequence; fix our stale selector if buttons stay; REVERT verbatim if they genuinely vanish. |
| 2 | TC-LOC-MGH-015 | exclude paginator input | `isReadOnly()` counts the paginator's "Current page number" `<input>` panel-wide → returns false. History DATA is read-only (sibling TC-016 proves cells non-interactive). | **Deterministic, CLI-confirmed** — scope the editable-field count to the data `<table>`; keep button checks panel-wide. |
| 3 | TC-LOS-HIS-006 | exclude paginator input | Same pattern: `isHistoryTabReadOnly()` counts the paginator input panel-wide. | **Deterministic, CLI-confirmed** — scope to `tblHistory`. |
| 4 | TC-LOC-SSL-035 | relative assertion | Asserts `getDialogRowCount() > 2000` (magic constant `SEARCH_BULK_LOWER_BOUND`) — LR-022 violation. Sibling **TC-LOC-SSL-040** already proves the relative pattern (capture filtered count → assert cleared > filtered). | **Deterministic** — mirror SSL-040's relative invariant; drop the constant. |
| 5 | TC-LOC-ACC-020 | per-test Phone-2 baseline | Asserts `getPhone2Value() === TEST_PHONE2_VALUE` at start, depending on TC-019 having set it in the same run — cross-test coupling (fails isolated/retried/parallel). Phone-2 is genuinely saveable (TC-019 proves it). | **Deterministic (LR-019)** — make the test arrange its own non-empty baseline (net-zero-safe), then assert persistence. |
| 6 | TC-LOC-ACC-030 | account doesn't exist → swap | Contradicts our data (`AC000107 → Parker Palm Springs`, verified 2026-05-29). Prior walk: account exists, search works, backend slow (~8-10s skeleton). `searchAccountByFilter` inner waits throw at **15s** before the test-level 20s poll can help. | **RCA-gated** — live-measure backend latency, raise inner waits to an evidence-based budget; surface RED if account is truly gone / filter truly broken. |

> Note (provenance): item 6 of the campaign (A4) recorded MGH-019 as `BLOCKED-environment` because it banned office 1604 and no other office has paginated history. **This plan runs on 1604** (the test's own office), so MGH-019 IS verifiable here — that ban was campaign-specific.

## §4 Bootstrap (context files every phase depends on)

- **This plan** (full) + **§3 triage**.
- **Rules**: `.claude/rules/specs.md` (LR-018/019/021/022/024/051/052/053/056), `.claude/rules/angular.md` (LR-009/026 dirty-state), `.claude/rules/browser-tool.md` + `docs/read_only_docs/CLI_BROWSER_GUIDE.md` (CLI auth, `-s=`, absolute `state-load`), `clients/encore/CLAUDE.md` (LR-012 shared save dialog, LR-036 boolean render, LR-ENC-003 no `CI_ENV=e2e`).
- **RCA**: `.claude/skills/rca/SKILL.md` (Phase-A artifact-first READ → HEADED CLI live walk).
- **Target code** (read before editing — cited at file:line in §5).
- **Known bug**: BUG-LOC-ACC-001 (clearing Phone 2 to empty does NOT persist; the prior value reappears) — governs the ACC-020 cleanup design.

## §5 Phases

### Phase 0 — Pre-flight + gate `[OPUS-ONLY]`
0.1 Confirm `.env.local` present; `CI`/`CI_ENV` unset (LR-ENC-003); `clients/encore/.auth/encore-state.json` valid (warm via `--project=setup` if a probe redirects to sign-in).
0.2 LR-024 baseline: `cd clients/encore`, `npm run clean` (or clear `test-results/`), so all later RCA reads fresh artifacts only.
0.3 Build the TodoWrite list with the 8 ceremony obligations (LR-028 activity row, /final-q, Per-Identity Matrix audit, etc.) tagged per the SP02B contract.

### Phase 0.5 — MANDATORY live CLI DOM-forensics walk (no code edits before this passes) `[OPUS-ONLY]`
One `playwright-cli` session on office 1604. **Do not skip — every fix below has a DOM assumption that must be confirmed live, not inferred.** Capture each finding to `clients/encore/specs_planning/_internal/walk-evidence-hist-ssl-acc-2026-06-02.md` (dated walk-evidence artifact per the walk-evidence rule).

- **0.5a — MGH read-only structure** (for fix 2): on Location Management History, determine whether `[data-testid="location-settings-table-management-history"]` is a **wrapper `<div>` containing a nested `<table>`** or **is itself the `<table>`** (strong prior signal: `hasHorizontalScroll()` does `el.querySelector('table')`). Locate the paginator "Current page number" `<input>` and confirm it lives **outside** the nested `<table>`. Record the exact locator that yields `0` editable inputs in the data region while excluding the paginator.
- **0.5b — MGH pagination DOM** (for fix 1): capture the FULL pagination bar — the current-page indicator element (tag, `aria-label`, value), how total pages is shown, and the four button `aria-label`s (`Go to first/previous/next/last page`). Then **walk the exact test sequence**: assert first/prev disabled + next/last enabled → click Next, read indicator → click Previous, read indicator → click Last, assert next/last disabled → click First, assert first/prev disabled. **Explicitly confirm whether first/last buttons remain in the DOM throughout** (the skip comment's "vanish" claim). This single walk decides fix 1's branch.
- **0.5c — LOS read-only structure** (for fix 3): on Local Office Settings → History, determine whether `[data-testid="local-office-settings-history-table"]` is a `<table>` or wrapper; locate its paginator input; record the locator that yields `0` editable inputs in the data region. (LR-036 spirit: do NOT assume LOS mirrors MGH — verify independently.)
- **0.5d — ACC-030 latency + account** (for fix 6): open the Account List dialog, fill Account Number `AC000107`, click Search, and **measure** time-to-first-result (via `network` / an eval timer). Confirm exactly one row "Parker Palm Springs" returns. Record the measured latency → drives the evidence-based timeout in fix 6.

If 0.5a or 0.5c shows the testid is the bare `<table>` with the paginator nested *inside* it, the simple scoping fix is unsafe → switch to scoping the count to `tbody`/`thead` (data region) and re-confirm `0`; if even that is impossible without gaming, HALT (§HALT-a).

### Phase 1 — TC-LOC-MGH-015 read-only scoping `[SONNET-SAFE]` (after 0.5a)
- File: `clients/encore/src/pages/locations/location-management-history.page.ts` `isReadOnly()` (lines 402-410). Change ONLY the input/textarea count from panel-wide to the data-table region confirmed in 0.5a (e.g. `this.getElement('tblMgmtHistory').locator('table')` — or `tbody`/`thead` per 0.5a). Keep Add/Edit/Delete/Save checks **panel-wide**. Assert in-region input count `=== 0` (no `<= 1`, no subtract-a-constant — that would be gaming; the count must be genuinely zero).
- Spec: `clients/encore/tests/locations/location-management-history.spec.ts` line 188 — `test.fixme(` → `test(`. Remove the FIXME comment block (lines 183-187).
- Run twice: `npx playwright test --grep "TC-LOC-MGH-015" --workers=1 --retries=0 --reporter=list` (from `clients/encore`). Green ×2 → keep. Red → /rca (read artifact → CLI walk) before any further edit; do not guess past 2 cycles (LR stop-guessing).

### Phase 2 — TC-LOS-HIS-006 read-only scoping `[SONNET-SAFE]` (after 0.5c)
- File: `clients/encore/src/pages/local-office/local-office-history.page.ts` `isHistoryTabReadOnly()` (lines 128-134). Scope the input count to the data table per 0.5c; keep the Save check panel-wide. Assert `=== 0`.
- Spec: `clients/encore/tests/local-office/local-office-history.spec.ts` line 60 — `test.fixme(` → `test(`. Remove the FIXME comment block (lines 55-59).
- Run twice (`--grep "TC-LOS-HIS-006"`). Same green-×2-or-/rca gate.

### Phase 3 — TC-LOC-SSL-035 relative assertion `[SONNET-SAFE]`
- File: `clients/encore/tests/locations/location-shared-setup-locations.spec.ts` TC-LOC-SSL-035 (lines 86-110). Rewrite `act`/`expectBeforeSave` to mirror the proven **TC-LOC-SSL-040** pattern (lines 217-244): capture `filteredCount` after the Atlanta search, then after clearing assert `getDialogRowCount() > filteredCount`. Remove the `SEARCH_BULK_LOWER_BOUND` import (line 18).
- Data: `clients/encore/src/data/locations/location-shared-setup-locations.data.ts` — delete the `SEARCH_BULK_LOWER_BOUND` export + its comment block (lines 68-87) **only if no other spec imports it** (grep first: `SEARCH_BULK_LOWER_BOUND` across `clients/encore`).
- Run twice (`--grep "TC-LOC-SSL-035"`). Green-×2-or-/rca.

### Phase 4 — TC-LOC-ACC-020 per-test baseline `[SONNET-SAFE]`
- File: `clients/encore/tests/locations/location-account-address.spec.ts` TC-LOC-ACC-020 (lines 273-285). Make it self-contained (LR-019): pick a target that DIFFERS from the current Phone 2 to guarantee a dirtying change (avoids the LR-009/LR-026 net-zero trap), fill + save, reload, assert persisted == target + Save disabled. Both candidate values are non-empty so BUG-LOC-ACC-001 (empty won't persist) never bites.
  ```ts
  const current = await pg.getPhone2Value();
  const target = current === TEST_PHONE2_VALUE ? ACCOUNT_TEST_PHONE : TEST_PHONE2_VALUE;
  await pg.fillPhone2(target);
  await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
  await pg.clickSave();
  await pg.reloadAndNavigate(OFFICE_NO);
  await expect.poll(() => pg.getPhone2Value(), { timeout: 5_000 }).toBe(target);
  expect(await pg.isSaveEnabled()).toBe(false);
  ```
  Drop `dependencyGate(['TC-LOC-ACC-001'])` → `dependencyGate([])` (no longer coupled). Cleanup: leave Phone 2 at the saved non-empty value (empty cannot persist per BUG-LOC-ACC-001 — document this in a comment; do NOT add a failing empty-restore).
- Run twice (`--grep "TC-LOC-ACC-020"`). Then run the **full file** (`--grep "@account-address"` or the file path) to confirm no sibling regression from the new starting Phone-2 state (esp. ACC-016 empty-Phone-2 check, ACC-018 save-enable). Green-×2-or-/rca.

### Phase 5 — TC-LOC-ACC-030 search-timing (RCA-embedded) `[OPUS-ONLY]` (after 0.5d)
- Clean + run twice first (`--grep "TC-LOC-ACC-030"`) to confirm the failure is deterministic and read the real failure artifact (LR-024). The fix is **evidence-based**, not a guessed number:
  - If 0.5d measured latency L: raise the two inner waits in `searchAccountByFilter()` (`clients/encore/src/pages/locations/location-account-address.page.ts` lines 269 + 280, currently `15_000`) to `max(30_000, ceil(L)+margin)` so the slow-but-correct backend has time. This method is shared by name/address/city/number searches (ACC-004/025/026/030) — raising it helps all; verify those still pass (run the full A&A file).
  - The test-level poll (line 77, `timeout: 20_000`) should be ≥ the inner budget so the test, not the page-object, owns the deadline — raise to match if needed.
  - If 0.5d showed the account is **gone/changed** → honest data fix: look up a real current 1604 account live, update `ACCOUNT_NUMBER_SEARCH` (number + expectedResult **together**) in the data file. If the **filter itself** is broken → app bug: file via `/bugfix` flow, leave the test RED with the BUG cite, do NOT force green (§HALT-d).
- Run twice. Green-×2 → keep. Persistent red with app-bug evidence → surface (do not fake).

### Phase 6 — TC-LOC-MGH-019 pagination (RCA-embedded, conditional) `[OPUS-ONLY]` (after 0.5b)
- Per LR-021: un-skip first. `clients/encore/tests/locations/location-management-history.spec.ts` line 216 — `test.skip('TC-LOC-MGH-019…'` → `test('TC-LOC-MGH-019…'`. Keep the body's assertions intact (first/last are the point of the test).
- Branch on the 0.5b walk evidence:
  - **Buttons stay + pagination works (our bug):** fix `getPaginationText()` (`location-management-history.page.ts` lines 367-372) to read the real current-page indicator confirmed in 0.5b (e.g. the `input` value combined with the total) so it returns a string the test's `.toContain('2')` and `.toMatch(/^1\s*\/\s*\d+$/)` accept. **Also verify `getApproximateTotalRowCount()` (lines 439-446) still parses the new return** (it regexes `/\d+\s*\/\s*(\d+)/`) — keep both callers working. If the live format is genuinely `value="2"` + a separate "of N" label and cannot yield `"2 / N"` cleanly, adapt the test's assertions to the REAL working format (assert indicator value `=== '2'` + total present) — this is matching reality, not weakening intent. Remove the stale skip comment (lines 214-215). Run twice green.
  - **First/last genuinely vanish after Next→Prev (app bug confirmed live):** REVERT line 216 to the exact original `test.skip('TC-LOC-MGH-019: …')` **verbatim** (grandfathered by the RCA Edit hook) + restore the original 2-line comment. Report the live evidence; ensure the bug is captured in the tracker/`encore-qa-tracker.csv`. Do NOT delete the first/last assertions to force green (§HALT-c).

### Phase 7 — Cross-file integrity (LR-018) `[OPUS-ONLY]`
After all kept fixes are green individually ×2, run each affected spec **full-file** at `--workers=1 --retries=0` to catch serial contamination:
`location-management-history.spec.ts`, `local-office-history.spec.ts`, `location-shared-setup-locations.spec.ts`, `location-account-address.spec.ts`. Any spec that passes individually but fails full-file → /rca for serial state/timing/auth (LR-018 step 6).

## §6 Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (no new behavior; baseline already established by PLAN_LIVE_QA_VERIFICATION_2026_06_02) | `(none)` | (none) |
| GIVER | per-TC status in the deliverable + the QA tracker | `clients/encore/test_cases_xlsx/encore_test_cases.xlsx`<br>`clients/encore/test_cases_xlsx/encore-qa-tracker.csv` | `npm run check:tc-parity` exit 0 |
| BUILDER | the 4 spec files + 2 page objects (re-enable + scope fixes) | `clients/encore/tests/locations/location-management-history.spec.ts`<br>`clients/encore/tests/local-office/local-office-history.spec.ts`<br>`clients/encore/tests/locations/location-shared-setup-locations.spec.ts`<br>`clients/encore/tests/locations/location-account-address.spec.ts`<br>`clients/encore/src/pages/locations/location-management-history.page.ts`<br>`clients/encore/src/pages/local-office/local-office-history.page.ts`<br>`clients/encore/src/pages/locations/location-account-address.page.ts`<br>`clients/encore/src/data/locations/location-shared-setup-locations.data.ts` | `npx playwright test --list` resolves all 6 TC IDs; each kept TC green ×2 |
| HEALER | per-fix RCA evidence (ACC-030 / MGH-019 + any item that misses its 2-cycle budget) | `clients/encore/specs_planning/_internal/walk-evidence-hist-ssl-acc-2026-06-02.md` | walk-evidence file exists with per-item live findings |
| WATCHDOG | `(none)` — no audit-findings table in this plan | `(none)` | (none) |
| GARDENER | `(none)` — no structural refactor | `(none)` | (none) |

## §7 After (closure obligations)
- **Deliverable + tracker sync** (GIVER): update the per-TC status for the re-enabled/repaired TCs in `encore_test_cases.xlsx` and the matching row in `encore-qa-tracker.csv` (the brief's "row INT3 — our-side fixes": record which items are now enabled-green vs reverted-with-bug-cite and why). Add/edit rows only — never remove. If the deliverable has no per-TC status column, mark this cell `(skipped: <reason ≥20 chars>)` in the matrix at closure. Run `npm run check:tc-parity` → exit 0.
- **Activity log** (LR-028 + LR-037): append one row to `clients/encore/specs_planning/_internal/agent-activity-log.md`, timestamp ≥ every touched-file mtime.
- **Plan closure** (LR-027 + LR-055): Status → DONE, add Executed date, write the Execution Summary (per-TC: green-and-kept | reverted-verbatim-and-why | data-fixed | app-bug-RED-with-cite), `git mv` to `plans/done/`, `npm run plans:reindex`.
- **/final-q** exit (LR-042 evidence-emission).

## §8 Acceptance criteria
- [ ] Phase 0.5 walk-evidence artifact exists with live DOM findings for 0.5a/b/c/d.
- [ ] Each KEPT fix is green individually ×2 (`--grep "<TC-ID>" --workers=1 --retries=0`).
- [ ] Each affected spec passes full-file (no serial regression) — `location-management-history`, `local-office-history`, `location-shared-setup-locations`, `location-account-address`.
- [ ] Any REVERTED item (MGH-019 if app-bug; ACC-030 if filter-broken) restored to its exact original `test.skip`/`test.fixme` line, with live evidence in the walk artifact and a tracker/bug cite.
- [ ] No assertion weakened below its original intent (re-read each touched assertion at closure; confirm it still proves what it proved before).
- [ ] `npm run check:tc-parity` exit 0; `npx playwright test --list` resolves all 6 TC IDs.
- [ ] Activity-log row appended; plan moved to done/ with Execution Summary.

## §9 HALT gates (never silently proceed)
- **(a)** Phase-0.5 shows a read-only fix cannot be cleanly scoped to exclude the paginator without touching unrelated callers → HALT + ask.
- **(b)** Any item can only go green by weakening/deleting its assertion → surface RED, do NOT force; ask.
- **(c)** MGH-019 live walk confirms first/last buttons vanish (app bug) → REVERT verbatim + report; do not delete assertions.
- **(d)** ACC-030 walk shows the account is gone or the filter is genuinely broken → surface (data-fix or app-bug RED); do not fabricate green.
- **(e)** RCA fan-out / file count exceeds enumerated scope by >30% → HALT + ask.

## §10 Rules applied
- **LR-018** (run-all is truth — Phase 7), **LR-019** (per-test baseline — ACC-020), **LR-021** (un-skip before rewrite — MGH-019), **LR-022** (no hardcoded structural counts — SSL-035), **LR-024** (clean + run twice before RCA — every phase), **LR-026/LR-009** (Angular dirty/net-zero — ACC-020 target≠current), **LR-051/052** (no opaque boolean OR / no fixed sleeps in polling — honor in any new assertion), **LR-036** (verify each table's structure independently — 0.5a vs 0.5c).
- **LR-ENC-003** (never `CI_ENV=e2e` locally), **LR-012** (shared save dialog), **LR-054** (`playwright-cli` ≠ `npx playwright`).
- **LR-027/LR-040/LR-055** (closure gate), **LR-028/LR-037** (activity log + timestamp), **LR-048** (this plan's structural minimum + Per-Identity matrix), **LR-ENC-002** (spec↔deliverable parity).

## §11 Verification artifact (re-runnable check of THIS plan's output)
On completion the following must hold (user/next-session can verify):
- `git grep -n "test.fixme('TC-LOC-MGH-015\|test.fixme('TC-LOS-HIS-006" clients/encore/specs` returns **nothing** (both un-fixme'd) — OR the item is documented REVERTED with a bug cite in the Execution Summary.
- `git grep -n "SEARCH_BULK_LOWER_BOUND" clients/encore` returns **nothing** (constant dropped).
- `cd clients/encore && npx playwright test --grep "TC-LOC-MGH-015|TC-LOS-HIS-006|TC-LOC-SSL-035|TC-LOC-ACC-020|TC-LOC-ACC-030" --workers=1 --retries=0 --reporter=list` → all green (or any red row matches a documented REVERT/app-bug in the summary).
- `clients/encore/specs_planning/_internal/walk-evidence-hist-ssl-acc-2026-06-02.md` exists.
- `npm run check:tc-parity` exit 0.
