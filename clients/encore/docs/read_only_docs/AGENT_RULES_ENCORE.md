# Encore — Client-Specific Agent Rules

Companion to `docs/read_only_docs/AGENT_SHARED_RULES.md` (framework). This file holds rules that name Encore product surfaces, Encore Jira IDs, or Encore-specific URLs — anything that would be wrong to apply to a non-Encore client.

Agents running against Encore load both files. Framework rules apply globally; rules here apply only when the active client is Encore.

---

## §E1. Encore Module Registry

**Application**: Navigator Cloud
**Base URL**: `cloudapps-e2e.encoreglobal.com` (E2E environment)
**Module registry**: `clients/encore/docs/MODULE_REGISTRY.md`
**Requirements**: `clients/encore/docs/REQUIREMENTS.md`

When framework rule §18 (Module Boundary Enforcement) says "the application's module registry", for Encore that resolves to `clients/encore/docs/MODULE_REGISTRY.md`. Every page in Navigator Cloud belongs to exactly ONE module defined there.

---

## §E2. Encore Jira / ID Conventions

| Convention | Used for | Example |
|---|---|---|
| `NM-NNNN` | Jira tickets (Navigator module) | `NM-1264` (Delivery ≥ Prep cross-field validator) |
| `TC-LOC-*` | Test Cases for Location Management/Settings specs | `TC-LOC-LI-003`, `TC-LOC-HIST-*` |
| `BUG-{MOD}-{NNN}` | Bug reports (from framework LR-034 bug filing protocol) | `BUG-LI-001` (Oracle required + Save silent no-op) |

When agents file escalations or reference prior incidents, use these prefixes so Encore-side tooling (queue, escalations, mistakes log) can route correctly.

---

## §E3. Encore Test Office Hardcode

Most Encore tests hardcode **Office 1604** as the execution office. This is documented in `clients/encore/docs/REQUIREMENTS.md` (search for "TEST_OFFICE" or "1604"). Fixme Category A (office-limited features) parameterizes this via `TEST_OFFICE` env var + per-office data.

When generating new specs or page objects for Encore: default to Office 1604 unless the test plan explicitly names a different office. Never introduce a new office hardcode without a matching entry in test-data.

---

## §E4. Encore Beforeunload Dialog (addendum to framework §12 ALL-052)

Framework rule §12 ALL-052 documents the generic "safe navigation pattern" for Angular apps with dirty form state. The Encore website specifically fires `beforeunload` **whenever form edits are made without clicking Save** — this includes:

- Any tab switch within Location Settings when a numeric/date offset field has been touched (LR-010 cross-field validation triggers even on identity edits)
- Page reloads during MCP walkthroughs after typing into any form input
- Navigating away from Local Office Settings after toggling any checkbox

Agents running MCP exploration against Encore must apply the ALL-052 safe navigation pattern (`browser_navigate("about:blank")` → `browser_handle_dialog(accept: true)` → target URL) more aggressively than on a "well-behaved" Angular app.

---

## §E5. Navigator URL Patterns

| Path pattern | Encore page |
|---|---|
| `/settings/location` | Location Settings (tabs: Basic Info, Local Information, Pricing, ECT, Notes, …) |
| `/settings/local-office` | Local Office Settings (different page — LR-017) |
| `/setup/locations/*/history` | Location Management History grid (Unicode ✔ boolean format — LR-036) |
| `/setup/local-office/*/history` | Local Office Settings History grid (SVG `lucide-check` boolean format — LR-036) |
| `/auth/*` (Microsoft SSO) | Login + TOTP flow |

These URL patterns are Encore-specific. Framework rules that say "navigate to the page" resolve to these paths when the active client is Encore.

---

## §E6. Encore-Specific §2 Path Additions

Framework §2 ownership table uses `clients/${ACTIVE_CLIENT}/...` placeholders. For Encore, those resolve to:

| Placeholder | Encore path |
|---|---|
| `clients/${ACTIVE_CLIENT}/tests/specs/**` | `clients/encore/tests/specs/**` |
| `clients/${ACTIVE_CLIENT}/tests/test-data/**` | `clients/encore/tests/test-data/**` |
| `clients/${ACTIVE_CLIENT}/src/pages/**` | `clients/encore/src/pages/**` |
| `clients/${ACTIVE_CLIENT}/src/common/base-page.ts` | `clients/encore/src/common/base-page.ts` |
| `clients/${ACTIVE_CLIENT}/src/selectors/index.ts` | `clients/encore/src/selectors/index.ts` |
| `clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md` | `clients/encore/docs/REQUIREMENTS.md` |
| `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-queue.json` | `clients/encore/specs_planning/_internal/agent-queue.json` |
| `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-activity-log.md` | `clients/encore/specs_planning/_internal/agent-activity-log.md` |
| `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md` | `clients/encore/specs_planning/_internal/agent-mistakes.md` |
| `clients/${ACTIVE_CLIENT}/specs_planning/test-cases/**` | `clients/encore/specs_planning/test-cases/**` |
| `clients/${ACTIVE_CLIENT}/specs_planning/test-plans/**` | `clients/encore/specs_planning/test-plans/**` |

This table is the Encore-side resolution of framework §2 placeholders. When a new client is added, each client creates its own equivalent section in its own `AGENT_RULES_{CLIENT}.md`.

---

## §E-FORM-PATTERNS. Encore (Angular) form interaction patterns

Receives the Angular-specific form behavior patterns graduated from generator GEN-008/GEN-009 kernels (framework rules keep the generic directive; this section holds the Encore/Angular manifestation).

### E-FORM-001 — Fire Angular change events with Tab-after-fill

Angular form controls ignore programmatic `el.fill()` because `fill()` sets the DOM value but does NOT dispatch the `change` / `blur` events Angular listens for. Always follow `el.fill(value)` with `el.press('Tab')` to trigger blur and sync the Angular form model.

- Verify after: `await expect(el).toHaveValue(value)` is insufficient — Angular may still have stale internal state. Check with `await el.inputValue()` AND wait a tick for `FormControl` to mark dirty/touched.
- Example failure: LRN-013 (Legal spec — fill() alone left Save button disabled); LRN-007 (pricing inputValue returns `"4.00%"` not `"4.00"`).

### E-FORM-002 — Angular disables Save on boundary violation

Typing an invalid value into a numeric / bounded field triggers Angular's synchronous validator and immediately disables the Save button. Tests that expect Save to stay enabled after an invalid input will fail — this is correct app behavior.

- Pattern: type invalid → blur → expect `Save disabled` → type valid → blur → expect `Save enabled`.
- Recovery value MUST differ from server-saved value (LR-009) — otherwise Angular detects "no net change" and leaves Save disabled.
- Example: LRN-012 (Angular boundary violation disabled Save); LRN-010 (invalid test left dirty DB state for next run).

### E-FORM-003 — Encore forms stay dirty after revert

Changing a field and reverting to its original value does NOT mark the Angular form pristine. The form stays `dirty`. This is Angular's default `FormControl` behavior for Encore's pages (other apps may behave differently).

- Relevant generator rule: framework-level PLN-025 describes testing revert behavior; Encore-side observation is that Save stays enabled after revert because dirty != pristine.
- Cleanup between tests: reload after dirty-state interactions (see §E-FORM-BEHAVIOR).

---

## §E-FORM-BEHAVIOR. Encore Angular dirty-state lifecycle

Receives the Angular dirty-state behavior from generator GEN-026 / GEN-033 kernels.

### E-FB-001 — Save button disabled ≠ form pristine (GEN-033 encore manifestation)

After a save cycle on Encore tabs (ECT, Local Info, Legal), the app explicitly disables the Save button when the save API completes, but does NOT call `FormControl.markAsPristine()`. Consequences:

- Next `navigateToTab()` triggers the "Unsaved changes" `alertdialog` because `form.dirty === true`.
- `waitForSaveDisabled()` alone is insufficient proof of save-complete state.
- Handle by: (a) wait for Save disabled AFTER save click, (b) next tab click MUST handle `[role="alertdialog"]` and accept "Discard" if present, (c) between serial tests that save, reload the page.

Evidence: ECT-012 (2026-04-02) "no unsaved dialog after save" — first fix `waitForSaveDisabled` failed because dirty state survived. Fixed by `clickTab()` handling the dialog.

### E-FB-002 — Post-save state reset between tests (GEN-026 encore manifestation)

Between tests in a `describe.serial` block that modify and save data: reload the page. Angular dirty-state tracking does NOT reliably reset after a save cycle, so the next test inherits `dirty = true` and wrong assertions fire.

- Pattern: in `afterEach` or at start of next test, `await page.reload({ waitUntil: 'domcontentloaded' })` + `waitForAngularStable()`.
- Evidence: Legal TC-012/013 (dirty state persisted from prior test's save cycle).

---

## §E-UI-LIBRARY. Encore UI library quirks (Radix, large-option selects)

Receives GEN-032 (full relocation — Radix UI library is Encore's choice, not universal). REQ-013's Pricing-Radix / Local-Info-dt/dd example also documented here.

### E-UI-001 — Radix UI Select with 50+ options requires retry loop (GEN-032 full relocation)

Radix UI's `Select` component (used across Encore for dropdowns like "Administrative Fee", currency pickers) auto-scrolls to the checked item on open. With 50+ options, target options above the scroll position become "not stable" (bounding box shifts during scroll animation) then "detached from DOM" (portal re-render). Intermittent — timing/browser-load sensitive.

Fix pattern (wrap open+click in retry, max 3):

```ts
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    await combobox.click();
    const option = page.getByRole('option', { name: exactName, exact: true });
    await option.scrollIntoViewIfNeeded();
    await option.click({ timeout: 5000 });  // short per-attempt
    break;
  } catch (e) {
    if (attempt === 3) throw e;
    await page.keyboard.press('Escape');
    await listbox.waitFor({ state: 'hidden' });
  }
}
```

Evidence: Legal LGL-010/LGL-013 (2026-04-02) — "Administrative Fee" option intermittent failures. Graduated to LR-025 at framework level; this section carries the Encore/Radix-specific manifestation.

### E-UI-002 — Radix vs native HTML tag verification (REQ-013 example)

Different Encore pages use different element types — NEVER assume tag structure by page name:

- **Pricing tab**: Radix components → `div`/`span`/`button` (not native `<table>`, not native `<select>`)
- **Local Info tab**: native HTML → `dt`/`dd` definition lists, native inputs
- **Location Management History grid**: native `<tr>`/`<td>`
- **Local Office Settings History grid**: shadcn/lucide SVG — `textContent` returns empty for booleans (see LR-036 in `clients/encore/CLAUDE.md`)

Framework rule REQ-013 tells agents to verify HTML tag structure via `browser_evaluate(() => el.tagName)`. This §E-UI-002 is the Encore-specific catalog of known divergences.

---

## §E-MCP-EVENT-TRIGGERING. MCP click behavior vs Angular/React save flows

Receives GEN-035 kernel-plus-example. Framework-side kernel: "verify the framework actually fired its change events after an MCP click." Encore manifestation:

### E-MCP-001 — `evaluate(el => el.click())` DOES NOT trigger Angular save API

MCP `browser_evaluate` using `button.click()` is a DOM-level click. Angular's save buttons are bound via Angular event handlers which require a REAL pointer event (mousedown → mouseup → click sequence with trusted flag). Consequence:

- Dialog appears to close (button's local click handler runs)
- But no API call fires (Angular's submit flow depends on form state transition triggered by user event)
- Test sees "save succeeded" in UI but data is not persisted

Correct MCP approach: `browser_click` (not `browser_evaluate`) — this generates a trusted pointer event.

Evidence: MCP-3 delete+save of location 1099 (2026-04-07) — used `evaluate`-based OK click, dialog closed, but Oracle Product was not actually deleted because no API call fired. Rutvik had to manually test via real click to confirm the bug (BUG-LI-001).

Applies to: any Encore page using Angular forms (Local Info, Legal, Pricing, ECT). React pages may have similar issues — verify per-framework.

---

## §E-REQ-EXAMPLES. Encore concrete examples for Requirements Agent

Receives H5/H6 encore-specific intake examples (generic versions live in the framework agent prompt).

### Example: Location — Local Information intake

```
User: "Test Location Local Information page. Verify left panel read-only, make random editable changes, verify save."

Queue entry:
{
  "id": "location-local-information",
  "feature": "Location - Local Information",
  "stage": "pending_planning",
  "intent": "Test Local Information form — left panel read-only, right panel editable, save persistence",
  "userNotes": "Office from REQUIREMENTS.md#authorized-test-data (currently 1604). Random field modifications. Verify save."
}
```

### Example: Location — Event Cost Type (ECT)

Similar pattern, module = `local-office`, feature = `Event Cost Type`, TC prefix `TC-ECT-*` per REQUIREMENTS.md#module-naming-conventions.

---

## §E-MODULE-BOUNDARIES. Encore module-boundary examples

Receives H13 MOD-001 encore example. Framework-level rule (module-boundary enforcement) is in generator/maintainer prompts; the specific Encore manifestation lives here.

### E-MB-001 — Local Office Settings is NOT part of the Locations module

- URL: `/settings/local-office` — separate module from `/settings/location`
- File location: `clients/encore/src/pages/setup/local-office/local-office-settings.page.ts` (NOT under `locations/`)
- Test spec: `clients/encore/tests/specs/setup/local-office/local-office-settings.spec.ts`
- TC prefix: `TC-LOS-*` or `TC-ECT-*` — NOT `TC-LOC-*`
- Selector partition: `clients/encore/src/selectors/setup/local-office/local-office-settings.ts`

Evidence: LR-017. 3 pending plans previously put Local Office Settings under `locations/` — all rejected at audit. Planner, generator, and all agents must check MODULE_REGISTRY.md before creating any file.

For any new module in Encore: check `clients/encore/docs/MODULE_REGISTRY.md` first. If the page is at a different URL, it is a different module — no exceptions.
