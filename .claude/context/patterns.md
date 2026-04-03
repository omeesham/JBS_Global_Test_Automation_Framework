# Decision Tree Patterns

Graduated from agent-mistakes.md. Practical decision trees for recurring situations.

## Pattern: Spec-Fixing Session Start
**When you see**: User says "fix failing spec", "spec broken", "tests failing"
**Do**:
1. `npm run clean` + `rm -rf .auth/chrome-profile`
2. Run failing spec fresh (headed) — observe actual failure
3. Run it AGAIN — confirm consistent vs intermittent
4. THEN read diagnostics and do RCA from fresh evidence
**Because**: Stale diagnostics from accumulated runs point to wrong root causes. Session 2026-04-02: stale data said SSO reload issue, reality was Radix dropdown instability.
**Graduated from**: LR-024, session 2026-04-02

## Pattern: Radix UI Large-Option Dropdown Interaction
**When you see**: Combobox/Select with 50+ options, `getByRole('option')` click, "not stable" or "detached from DOM"
**Do**: Wrap open+click in retry loop (max 3). On failure: Escape → wait hidden → re-open → `scrollIntoViewIfNeeded()` → click. 5s per-attempt timeout.
**Because**: Radix auto-scrolls to checked item on open. Options above scroll position shift (not stable) then detach during portal re-render.
**Graduated from**: LR-025, GEN-032, session 2026-04-02

## Pattern: Angular Save → Tab Navigation Race Condition
**When you see**: "Unsaved changes" alertdialog appearing AFTER a successful save (toast visible, save button disabled)
**Do**:
1. Save methods: wait for save button to disable (confirms API done), but DON'T assume form is pristine
2. Any `clickTab()` or tab navigation: check for `[role="alertdialog"]` after click, dismiss with "Discard" if visible
3. Retry loops (e.g. navigateToEctTab): always check state AFTER the last retry, not only at loop start
**Because**: Angular doesn't always call `markAsPristine()` after save. Button disables because save handler explicitly disables it — but `FormControl.dirty` is separate. Tab navigation dirty guard fires → dialog. The dialog auto-resolves if save response arrives later (explaining "box removed from frontend for some reason").
**Graduated from**: GEN-033, session 2026-04-02

## Pattern: Don't Over-Plan Spec Fixing — Just Run It
**When you see**: User says "fix failing spec" and you want to write a formal plan
**Do**: Skip the /planning ceremony. Just: clean → run → run again → RCA from evidence → fix → verify.
**Because**: Session 2026-04-02 — user corrected "the plan is to run the fucking spec". Elaborate planning delays action and the root cause is unknown until you see the actual failure. Plan AFTER you have evidence, not before.
**Graduated from**: User correction, session 2026-04-02
