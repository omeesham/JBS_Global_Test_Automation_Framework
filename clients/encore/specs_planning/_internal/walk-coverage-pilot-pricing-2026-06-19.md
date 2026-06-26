---
Artifact: walk-coverage feasibility pilot
Plan: PLAN_EXHAUSTIVE_WALK_GUARANTEE (Phase 0)
Module: pricing (Location Settings → Pricing sub-tab) + nav2 baseline
MCP_Session_Date: 2026-06-19
MCP_Session_Tool: playwright-cli (0.1.8, global)
MCP_Tool_Reason: live shadow-DOM enumeration pilot on the hardest surfaces — unattended, no visual/CSS/MFA/pause need (LR-038 v2 / browser-tool.md)
Offices: 1604 (Parker Palm Springs, USD-only) + 1605 (multi-currency USD/CAD/MXN)
URLs:
  - new-site: https://cloudapps-e2e.encoreglobal.com/navigator/locations/{1604,1605}/settings/location
  - baseline: https://navigator2.training.psav.com/#/setup/locationdetail/1604
Author_Identity: OWNER
Verdict: PROCEED WITH REVISIONS (2 design revisions + 1 spec correction required before Phases 1–4; 4 operational hardening items for the Phase 1 enumerator)
---

# Walk-Coverage Feasibility Pilot — Pricing (new-site) + nav2 baseline — 2026-06-19

Phase 0 of PLAN_EXHAUSTIVE_WALK_GUARANTEE. Goal: prove the machine-enumerated-denominator approach is feasible on the hardest surfaces (shadow DOM + cmdk command palettes + a 32-row cascade grid + per-currency offices + a testid-less old site) **before** building the Phases 1–4 tooling, and settle the three design risks flagged in the pre-execution adversarial audit (F1/F2/F3).

All evidence is from a live `playwright-cli -s=e2e` session against the offices above. Reusable shadow-pierce idiom (`deepAll`) reused from `.playwright-cli/pricing-state-eval.js` per the plan's recon. Prototype enumerators: `.playwright-cli/enum-proto.js` (new-site, testid-rich key scheme) and `.playwright-cli/enum-proto-baseline.js` (old-site, name/id key scheme). Raw enumeration outputs: `.playwright-cli/enum-1604-*.json`, `enum-1605-pricing.json`, `enum-nav2-{1,2}.json`.

---

## 1. Denominator per Walk_State (machine-enumerated)

| Walk_State | Pass-A (Heuristic-A) | Pass-B (focusable) | A∖B | B∖A | Notes |
|---|---|---|---|---|---|
| 1604 · Basic Info / Local Information (default sub-tab) | 119 | 94 | 27 | 2 | resting load; 915 elements scanned, 1 shadow host (`<next-location-settings>`) |
| 1604 · Pricing sub-tab active | 83 | 58 | 27 | 2 | pricing content mounted; Local-Information content unmounted (tab swap) |
| 1604 · Pricing + cmdk dropdown open | 184 | — | — | — | +101 vs resting = 100 virtualized option-buttons + 1 search input |
| 1605 · Pricing sub-tab active | 93 | 68 | 27 | 2 | +10 vs 1604 pricing = the CAD+MXN primary dropdowns |
| nav2 baseline (testid-less) | 443 distinct keys / 444 interactive | — | — | — | 1 collision (0.2%); key-types name 5 / id 45 / struct 29 / path 364 |

**Fixpoint stability**: re-enumerating the 1604 Pricing state twice produced identical key sets (83 = 83, 0 new, 0 dropped) → the enumerator is deterministic on a fixed state.

**Per-state denominator is real and data-driven**: 1604 Pricing = 83 (5 USD primary dropdowns); 1605 Pricing = 93 (15 dropdowns = 5 USD + 5 CAD + 5 MXN, all testids confirmed). The +10 is office-atypical *data* (LR-061-A), not a missed element — exactly the per-state behavior M2 specifies.

---

## 2. Phase 0 acceptance criteria — results

- [x] **Denominator-delta vs the old PARTIAL walk recorded.** The 2026-06-18 `pricing-2026-06-18.md` self-labeled **~10** interactive pricing fields (2 checkboxes + currency + 5 dropdowns + grid-as-one + Save) and stamped `coverageScope: PARTIAL`. The machine enumerator surfaced the same fields **plus affordances the old walk never recorded**:
  - `location-settings-btn-toggle-settings-panel` ("Collapse pricing settings panel") — an **opener the old walk missed entirely**.
  - 7 testid'd grid **column-header** divs (`…col-pricing-strategy / pricebook / currency / is-alternate / use-effective-dates / start-date / end-date`).
  - It also resolved an open question the old walk left unresolved (§7): `location-settings-checkbox-enable-multiday-pricing` lives in **Local Information**, not Pricing.
  - Whole-state denominator: **83** (1604) / **93** (1605) vs the agent's self-selected ~10. This is the plan's thesis proven live: the agent-defined denominator ≠ the machine denominator.
- [x] **Cascade-parent detect → toggle → accumulate → restore observed + reported.** Grid row-0 "Is Alternate" detected as a cascade-parent. Read-only probe: at rest, Use-Effective-Dates checkbox + both date inputs + their pickers are **present but `[DISABLED]`**. Toggling Is-Alternate (`false→true`) flipped Use-Eff-Dates `disabled:true → disabled:false`. Restored via reload. **Finding: the grid cascade is ENABLE-state, not element-MOUNT** — children are always enumerable (just disabled), so the toggle accumulates **zero new keys** (contrast mount-cascades like tab-activation / cmdk-open, which do mount new DOM).
- [x] **Dynamic-load edge observed.** The only "growing" set is the cmdk dropdown option list (virtualized, capped ~100 visible) — correctly excluded from the denominator by M2 (see §3 / M2 validation). The grid is **fully rendered (32 rows, not windowed)** — row count stable at 32. No state grew unboundedly within bounded passes; no `N=6` cycle cap was hit.
- [x] **M2-Baseline key scheme stabilized on the testid-less site.** 443 distinct keys / 444 interactive elements (**1 collision, 0.2%**); **STABLE across two passes (0 drift)**. Form fields (the real disposition targets) are **61% name/id-keyed** (54/88); the path-fallback dominance globally (364/444) is mostly nav/chrome, not form fields. Verdict: **fit for the frozen baseline's observation-only re-walk** (LR-ENC-001), with a documented caveat that path-keyed chrome is brittle to structural change (acceptable — baseline is legacy/frozen).
- [x] **Pass-A vs Pass-B cross-check delta reported.** A∖B = 27, B∖A = 2 on **every** state (1604 + 1605) — see F2.

---

## 3. The three adversarial-audit risks — resolved live

### F1 — Pass-B "event-listener carriers" is INFEASIBLE from page eval → CONFIRMED
Probe on every state: `getEventListenersAvailable: false`, `inlineHandlerCount: 0`. `getEventListeners()` is a DevTools-only API; the DOM exposes no listener-enumeration API, and React/Angular attach via `addEventListener` (no inline `on*` attributes).
**Resolution (spec correction):** Heuristic-B = **focusable set only** (native-focusable ∪ `tabindex≥0`). Drop "elements carrying a click/pointer listener" from the M4 Pass-B definition — it cannot be implemented in the page context the enumerator runs in.

### F2 — M4 cross-check as-specified would PERMANENTLY DENY → CONFIRMED, REVISION REQUIRED
A∖B = 27, B∖A = 2, on **both offices** (structural + office-independent). The divergence is by-construction:
- **A∖B (in Heuristic-A, not focusable):** testid'd `<div>` containers (`location-settings-page/tabs/section-details`), the **disabled** Save button (disabled ⇒ not focusable), and `role=button`-without-`tabindex` nav items.
- **B∖A (focusable, not Heuristic-A):** `role=tablist` containers (tablist isn't an interactive role).

The plan's M4 says "if A≠B by key … the gate DENIES until reconciled" and "`CrossCheck: clean` is required to pass." With 29 permanent structural divergences, `CrossCheck: clean` is **unreachable** — the non-overridable gate would block **every** walk forever.
**Resolution (DESIGN REVISION — required before Phase 3/4):** the two heuristics are *different lenses*, not a redundancy check. Treat the **union (A ∪ B) as the denominator**, the **intersection (A ∩ B) as high-confidence**, and the **symmetric difference (A △ B) as a per-element REVIEW set** — each divergent key gets a disposition/classification (covered-by-TC / read-only / out-of-scope), NOT an automatic hard-DENY. The gate then keys on "every union element dispositioned + every A△B element reviewed", which is reachable. (Alternative: redefine Pass-B as a strict superset of Pass-A so divergence is one-directional — but the union-with-review model is more honest and matches what the heuristics actually measure.)

### F3 — grid-cell enumeration would explode the denominator → CONFIRMED, M2 EXTENSION REQUIRED
The 32-row Secondary Pricing grid contains **186 interactive role-elements** (62 checkboxes + 62 inputs + 62 buttons; row 0 alone = 8). Per-cell enumeration would push the Pricing-state denominator from 83 → ~269, and make it **data-volume-dependent** (a 100-row office → ~600), breaking the per-state reproducibility M2 wants.
**Resolution (DESIGN REVISION — required before Phase 1/2):** extend M2's existing "dropdown option-sets are NOT denominator elements" to **homogeneous grid-body cell-sets** — the grid = 1 structural element + its **per-column control archetypes** (here 4: Is-Alternate checkbox / Use-Eff-Dates checkbox / Start picker / End picker), dispositioned once per archetype; the 32 rows are data instances, not separate denominator elements. (The prototype keys *incidentally* collapse them via empty-name + shared-ancestor-path — passA stayed 83, not 269 — but the Phase 1 enumerator must do this **intentionally**: detect repeating-row structures and key by column, not by cell.)

---

## 4. Operational hardening required for the Phase 1 enumerator (live-discovered)

- **O1 — Readiness-gate after EVERY state transition, not just first load.** Enumerating immediately after `goto` captured only **115** shell elements; the Angular shadow content hydrated seconds later → **915**. The enumerator must poll a stable testid count (LR-052 poll-not-sleep, LR-023 no-networkidle) after every navigation / tab-switch / opener-activation before reading.
- **O2 — Use native `click`/`check` for Radix controls, never synthetic events.** A hand-rolled `PointerEvent` dispatch did NOT activate the Radix sub-tab (`aria-selected` never flipped). `playwright-cli click` (a trusted Playwright click, which pierces shadow DOM) worked. Radix listens for trusted event sequences.
- **O3 — Register a dialog handler for the beforeunload / unsaved-changes modal.** Navigating away from a dirty form fired a native `beforeunload` confirm that put the session in a "modal state" and **blocked all eval** until `dialog-accept`. The enumerator must register an auto-handler (accept beforeunload; record/dismiss app dialogs per policy) so state transitions don't wedge.
- **O4 — Restore a toggled cascade-parent to baseline BEFORE navigating.** The O3 modal was self-inflicted: a cascade toggle left the form dirty, and the next navigation triggered beforeunload. M1's "restore the parent to its baseline state" must happen *before* the next state transition, not after.

---

## 5. What the enumerator found that the old walk did not (concrete miss list)

| Element | testid | Old walk (2026-06-18) | Why it matters |
|---|---|---|---|
| Toggle settings-panel opener | `location-settings-btn-toggle-settings-panel` | not recorded | an opener / affordance — the exact "missed button/opener" class the plan targets |
| 7 grid column headers | `location-settings-table-pricing-col-*` | not recorded (grid = 1 line) | testid'd, sort-candidate controls |
| Enable Multiday Pricing placement | `location-settings-checkbox-enable-multiday-pricing` | "unresolved (Pricing vs Local Information)" | resolved: it is in **Local Information** |
| Per-state dropdown count | 5 (1604) vs 15 (1605) | "no CAD/MXN" → later corrected by user | enumerator gets it right by construction, per-state |

---

## 6. VERDICT — PROCEED WITH REVISIONS

**The core mechanism is feasible and proven on the hardest surfaces.** The enumerator self-expands (tab + cmdk mount new DOM), reaches a deterministic fixpoint, produces an objective per-state denominator that beats the agent's self-defined count, pierces shadow DOM, handles the cascade grid, scales across offices, and the M2-Baseline key scheme stabilizes on the testid-less old site.

**Two design revisions + one spec correction are required before building Phases 1–4** (catching these now is exactly why the pilot ran first — building the gate on the as-written M4 would have produced a gate that DENIES every walk forever):

1. **M4 (F2)** — replace "hard-DENY on any A≠B" with **union-denominator + symmetric-difference-as-review**. *(Blocks Phase 3/4.)*
2. **M2 (F3)** — extend option-set exclusion to **homogeneous grid-body cells → per-column archetypes**. *(Blocks Phase 1/2.)*
3. **M4 Pass-B (F1)** — Heuristic-B = **focusable-set only**; drop the infeasible event-listener clause. *(Spec correction.)*

Plus operational hardening O1–O4 baked into the Phase 1 `enumerate-page.mjs`.

**Recommendation to the user**: approve Phases 1–6 to proceed **with the three revisions folded into the plan first** (I will edit M2/M4 in the plan body and re-confirm before building). No revision is fatal; all are refinements the pilot was designed to surface.

---

## 7. Element-discovery completeness — research-backed Heuristic-A v2 (post-pilot, 2026-06-19)

Driven by the user directive: *"look for checkboxes, buttons, etc — whatever a user can use but an AI agent can skip; the walk has to find anything a user could touch."* A `/review` of our current discovery + a `/research` pass (3 parallel agents; sources: axe-core `is-focusable.js`/`is-natively-focusable.js`, the `tabbable` library, MDN/W3C WAI-ARIA 1.2 widget roles, Playwright `getByRole`/CDPSession docs, Chrome DevTools Protocol `DOMDebugger.getEventListeners`).

### 7.1 Gap-closure map (the classes a user can touch that the v1 walker would skip)

| Gap | Class | Closing technique | Closes? | Cost / FP |
|---|---|---|---|---|
| **G1** | click-handler `<div>`/`<span>` (no role/testid/tabindex) | `cursor:pointer` page-eval pre-filter → **CDP `DOMDebugger.getEventListeners` confirm** (Phase 1 Playwright script) | **YES via CDP** (page-eval NO) | cursor FP (inheritance/rows) filtered by CDP; **delegated** listeners (on document/ancestor) residual FN; Chromium-only |
| **G2** | contenteditable | `[contenteditable]:not([="false"])` + editor signatures (`.ProseMirror`/`.ql-editor`/…), run **inside frames** | YES | cheap; attribute to **host** not descendants |
| **G3** | draggable | `[draggable="true"]` (free) + handle signatures (`aria-roledescription="sortable"`, `data-rbd-drag-handle`, `cursor:grab`) | attr YES; library-DnD heuristic | attr zero-FP; library DnD medium-FN (delegated listeners) |
| **G4** | hover-reveal + context menus | trigger (**trusted** `hover()`/right-click) → DOM-diff → attribute delta; narrow triggers by `aria-haspopup`/`aria-expanded`/overflow-button/`cursor:pointer` | YES (interaction) | **expensive** — gate behind pre-filter; tooltip FP (filter delta to interactive nodes); **synthetic events = FN** |
| **G5** | iframe content | `page.frames()` per-frame re-scan (shadow walk runs INSIDE each frame); frame walk = **outer loop** | YES | frame-switch overhead; skip `about:blank`/0-size; de-dupe by URL |
| **G6** | ARIA roles missing from v1 | add `menuitemradio, searchbox, treeitem, gridcell` (+ `scrollbar`); EXCLUDE containers + non-interactive | YES | medium FP if landmark/container roles counted — exclude them |
| **G7** | LR-057 launcher (label/disabled-input affordance) | enumerator auto-flags every `<label>`, disabled input, and `cursor:pointer` container as an LR-057 probe-candidate | YES (flagging) | the click-probe is the existing LR-057 step |
| **G8** | virtualized / scroll-only rows | scroll the **real scroller** by `clientHeight`, harvest stable-ID set until it stops growing; record the row **archetype**, not every cell | YES | tunable; cap iterations; settle-wait **not** `networkidle` (LR-023) |
| **G9** | `<summary>`/`<details>` | add `summary:first-of-type` + `details`(no-summary) | YES | cheap, near-zero FP |

### 7.2 F1 REVISION (material — changes the M4 design)
The pilot's F1 ("Pass-B listener detection infeasible") is **correct only for page-context eval**. Via **CDP** — `page.context().newCDPSession(page)` → resolve objectId (`DOM.resolveNode`) → `DOMDebugger.getEventListeners({objectId})` — listener `type` IS enumerable (only the existence of `click`/`pointerdown`/… matters for G1, not the handler body). The **Phase 1 enumerator is a Playwright *script*** (`enumerate-page.mjs`), which HAS CDP; only the pilot's playwright-cli `eval` lacked it. ⇒ **M4 may use a real "has-interaction-handler" signal** (cursor:pointer pre-filter → CDP confirm) as a G1-recovery pass, not just focusable. Chromium-only; residual FN = event-delegation (honestly budgeted, not claimed-away).

### 7.3 Live v1→v2 measurement (1604 pricing, page-eval additions only)
- v1 Pass-A = **83** → v2 core = **86** (+3, all `tabindex`: 2 tablists [the F2 `B∖A` set, now in core] + 1 "Notifications alt+T" region).
- **cursor:pointer candidates = 1 → the "Pay To Address" label** = the LR-057 launcher v1 misclassifies as a static disabled input. The heuristic isolated exactly the one real historically-missed affordance on an otherwise fully-instrumented page.
- Taxonomy adds (contenteditable/draggable/summary/treeitem/gridcell) = **0 on this surface** (pricing is testid/role-rich) — but they are by-construction insurance; e.g. corp-pricing detail (~3,707 draggables, nav-registry row) would exercise `draggable` heavily. **Honest conclusion: v2 is the right complete net; marginal gain is surface-dependent, largest on under-instrumented / DnD / click-div surfaces.**

### 7.4 Heuristic-A v2 predicate (spec for Phase 1 `enumerate-page.mjs`)
```
INTERACTIVE = data-testid
  OR native{ button, input:not([type=hidden]), select, textarea, a[href], area[href],
             summary:first-of-type, details(no-summary), audio[controls], video[controls],
             iframe, object, embed }
  OR attr{ [tabindex](parseable), [contenteditable]:not([="false"]), [draggable="true"] }
  OR role{ button,checkbox,combobox,textbox,searchbox,radio,switch,tab,link,menuitem,
           menuitemcheckbox,menuitemradio,slider,option,spinbutton,treeitem,gridcell,scrollbar }
  AND NOT ([disabled] | aria-disabled=true | hidden | inert)
  AND NOT non-interactive landmark/structure role (banner,navigation,main,region,heading,
           list,img,tooltip,status,alert,progressbar,tabpanel)
  AND NOT bare composite container (menu,menubar,tablist,tree,grid,listbox,treegrid,radiogroup → walk children)
+ G1-recovery: cursor:pointer (outermost, pointer-events≠none) → CDP getEventListeners confirm
```

### 7.5 Architectural recommendations for the Phase 1 enumerator
1. **Frame walk (G5) = outer loop** — every scan (shadow-pierce, attr, role, G1-recovery) runs per-frame, else iframe-hosted rich-text editors (TinyMCE/CKEditor) slip through.
2. **Cheap attribute/role pass first** (one `$$eval` per frame) — closes G2/G3-attr/G6/G9 for free.
3. **G1-recovery** = cursor:pointer pre-filter → CDP `getEventListeners` confirm (shrinks N before the per-node CDP cost; reuse ONE CDPSession).
4. **Gate expensive interaction passes (G4 hover/contextmenu, G8 scroll) behind cheap pre-filters** (`aria-haspopup`/`aria-expanded`/overflow/`cursor:pointer`); **collapse homogeneous results to archetypes** (extends F3/M2 to virtualized rows).
5. **Trusted Playwright actions over synthetic `dispatchEvent`** — confirmed by pilot O2 (a synthetic PointerEvent did NOT activate the Radix tab; only the native `click` did). Synthetic events are the #1 false-negative source.
6. **Honest FN budget**: event-delegation (a single listener on `document`/an ancestor, e.g. react-dnd) is not cleanly enumerable from page-eval OR per-node CDP — document the residual, never claim 100%.

These feed: **M1** (self-expand adds hover/contextmenu/frames/scroll-sampling, trusted-action discipline), **M2** (archetype-collapse extends to virtualized rows), **M4** (Pass-B = focusable + the CDP G1-recovery signal; F1 revised).
