---
name: Angular save button disabled ≠ form pristine
description: After Angular save, button disables but form dirty flag persists — tab navigation triggers Unsaved dialog
type: feedback
---

Angular save button disabling does NOT mean the form is pristine.
The app disables the button explicitly after save API completes, but doesn't call `markAsPristine()`.
Navigating to another tab triggers Angular's dirty guard → "Unsaved changes" alertdialog.

**Why:** Session 2026-04-02 ECT-012 — first fix attempt (waitForSaveDisabled) didn't work because it assumed button disable = form pristine. Had to add alertdialog handling to `clickTab()` as the real fix.

**How to apply:**
1. Save methods: still wait for button disabled (confirms API done) — useful signal
2. BUT never assume form is pristine just because button disabled
3. Any tab navigation after save: always check for and dismiss `[role="alertdialog"]`
4. Retry loops: always check state AFTER the last retry iteration, not only at loop start (off-by-one bug)
