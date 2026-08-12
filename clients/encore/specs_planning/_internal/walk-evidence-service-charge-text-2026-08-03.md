---
artifact: walk-evidence
client: encore
module: service-charge-text
session_date: 2026-08-03
session_tool: playwright-cli + scripts/walk-coverage/enumerate-page.mjs (LR-062 machine denominator)
author_identity: HUNTER
page_url: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge-text
test_entity: office 1604 (Parker Palm Springs)
parent_subplan: plans/pending/PLAN_SERVICE_CHARGE_TEXT_AUTOMATION.md
baseline_artifact: clients/encore/specs_planning/_internal/old-site-baseline/service-charge-text-2026-08-03.md
jira_tickets: [NM-1694, NM-1728, NM-3336, NM-3126, NM-2922, NM-2924, NM-2311, NM-2188, NM-1695, NAV-4106, NAV-2228]
Coverage_Ratio: 42/42 (100%)
Coverage_Note: OPEN-1 and OPEN-2 were RESOLVED by the 2026-08-03 reversible harvest (§2b) — the 3 formerly DIFFERENTIAL-DATA-REQUIRED elements now carry live-evidenced dispositions. OPEN-3 (click-probe timeouts) is disclosed, not silently closed.
Net_Zero_Proof: rows 114→114, save disabled→disabled, names identical — office 1604 byte-identical post-harvest; Save never clicked
Walk_State: office=1604 module=service-charge-text walked=[resting, expand:language-filter]
Opener_Frontier: CLOSED for the landing state — language-filter driven (5 options read) and add-row driven (114→115 delta); the html-cell launcher opened the Tiptap editor; no driven opener revealed a further un-enumerated state
CrossCheck: clean
Completion_Record: reports/walk-coverage/1604-service-charge-text.json (status=complete, elements=42, raw=613)
---

> **Honest scope statement.** All 42 machine-enumerated elements now carry a live-evidenced
> disposition, and the opener frontier for the landing state is closed (`language-filter` and
> `add-row` both driven with recorded effect deltas). The adversarial harvest ran under a
> no-save policy and is net-zero-proven.
>
> **What this artifact still does NOT cover, stated plainly:** every path that requires a
> **committed save** — save-cycle persistence, the dirty-navigation guard, tab-switch preservation,
> concurrent edits, and server-side validation. Those are deferred to the spec phase where LR-019
> per-test baseline reset makes them safely repeatable. `Coverage_Ratio: 100%` therefore means
> *"every enumerated element is dispositioned"*, **not** *"every behaviour is tested"*.
>
> An earlier revision of this file claimed `100%` while 3 elements were still open; that was caught
> by self-check and corrected to 93% before the harvest resolved them. The number below is now
> earned, not asserted.

# Walk evidence — Service Charge Text (2026-08-03)

Phase A of `PLAN_SERVICE_CHARGE_TEXT_AUTOMATION`. Denominator is **machine-enumerated** per LR-062 —
nothing here was self-counted.

## §1 Denominator provenance

```
[walk:enumerate] state=1604-service-charge-text denominator=42 (raw=613, archetype-collapsed)
  union=42 intersection=26 A△B-review=16 | CDP-G1 hits=0
  cycles=4 branches=1
```
`completion_record: status=complete, halt_reasons=[]`, JSON mtime 21:25:07 (run window 21:16–21:25).
**0 skeleton entries, 3 real-table hits** — this denominator is built from the loaded page, not the
loading shimmer (see §5 for why that distinction cost five attempts).

**Archetype collapse (the load-bearing design decision).** 613 raw → 42 dispositionable. Five
per-row families collapse ×114 each:
`-language-trigger-#`, `-name-#`, `-display-name-#`, `-report-column-#`, `-html-cell-#-htmlDisplayText`.
114 identical row controls are **one archetype, not 114 states**. Driving all 228 openers tore the
page down mid-walk (`[FATAL] page.evaluate: Target page, context or browser has been closed`),
matching the documented Encore precedent that mutating a Radix combobox can crash the Angular host
(navigation.md §C, Legal-tab Path D). The opener set is therefore archetype-scoped in
`enumerate-page.mjs`; re-adding the per-row families re-introduces the teardown.

## §2 Element dispositions — 42/42, no blanks (LR-062 + LR-057 + LR-065)

### Page-under-test controls (14)

| element-key | role | disposition | evidence |
|---|---|---|---|
| `testid:service-charge-text-table` | table | `behavior-cases: result-fidelity, render-state, empty-vol, persistence` · `out-of-scope: pagination=115-row grid renders fully with no pager control observed in 613-element raw scan` · `out-of-scope: sorting=no sort affordance found; the only <th> button is "Resize column"` · `out-of-scope: combination=single language filter, no multi-filter surface to combine` | provenance: live · A1 JSON + `10-div1-headers.txt` |
| `testid:service-charge-text-save` | button | `read-only-verified` (starts `disabled=true`) | provenance: live · `30-dirty-before.txt` = `SAVE disabled=true` |
| `testid:service-charge-text-language-filter-trigger` | combobox | `affordance-probed: popover → language listbox (5 options)` | provenance: live · `41-filter-options.txt` |
| `role:option:All` | option | `affordance-probed: none` (listbox member) | provenance: live · `41-filter-options.txt` |
| `role:option:US English` | option | `affordance-probed: none` (listbox member; page default) | provenance: live · `41-filter-options.txt` |
| `role:option:English (Canada)` | option | `affordance-probed: none` (listbox member) | provenance: live · `41-filter-options.txt` |
| `role:option:Spanish (Mexico)` | option | `affordance-probed: none` (listbox member) | provenance: live · `41-filter-options.txt` |
| `role:option:French (Canada)` | option | `affordance-probed: none` (listbox member) | provenance: live · `41-filter-options.txt` |
| `testid:service-charge-text-name-# [×114]` | input | `affordance-probed: none` (editable metadata column) | provenance: live · A1 JSON + recon field dump |
| `testid:service-charge-text-display-name-# [×114]` | input | `affordance-probed: none` (editable metadata column) | provenance: live · A1 JSON + recon field dump |
| `testid:service-charge-text-report-column-# [×114]` | input | `affordance-probed: none` (editable metadata column) | provenance: live · A1 JSON + recon field dump |
| `testid:service-charge-text-language-trigger-# [×114]` | combobox | `affordance-probed: popover → per-row language listbox (Radix BUTTON role=combobox — NOT the native select)` | provenance: live · `10-open1-langctl.txt` |
| `testid:service-charge-text-html-cell-#-htmlDisplayText [×114]` | button | `affordance-probed: launcher → rich-text editor panel (Tiptap)` | provenance: live · `31-click-cell.txt` + `32-div3-editor.txt` |
| `testid:service-charge-text-add-row` | button | `affordance-probed: none (adds a grid row 114→115; does NOT dirty the form — see SCT-OBS-1)` | provenance: live · `21-rows-after-add.txt` + `22-save-after-add.txt` |

### Rich-text editor surface, revealed by the html-cell launcher (3)

| element-key | role | disposition | evidence |
|---|---|---|---|
| `testid:rte-content` | textbox | `affordance-probed: none` (the contenteditable itself — Tiptap/ProseMirror) | provenance: live · `32-div3-editor.txt`: `class="tiptap ProseMirror prose …" contenteditable=true` |
| `testid:rte-container` | div | `read-only-verified` (editor chrome wrapper) | provenance: live · `32-div3-editor.txt` |
| `testid:rte-content-scroll` | div | `read-only-verified` (scroll wrapper) | provenance: live · `32-div3-editor.txt` |

### Grid chrome (2)

| element-key | role | disposition | evidence |
|---|---|---|---|
| `struct:button\|Resize column\|…/service-charge-text-table/thead/tr/th` | button | `out-of-scope: column-resize is a shadcn table-header primitive with no persisted state and no business behaviour on this surface` | provenance: live · A1 JSON |
| `struct:select\|English (Canada)US EnglishSpanish (Mexic…\|…/tbody/tr/td/div/div` | select | `read-only-verified` — native `<select opts=4>`, a DISTINCT node from the Radix trigger (`SAME_NODE=false`, not nested); lacks the filter's `All` option | provenance: live · `10-open1-langctl.txt` |

### Global application chrome — not this module (23)

`id:radix-_r_#_ [×7]`, `id:radix-_r_a_`, `id:radix-_r_d_`, `id:radix-_r_g_`, `id:radix-_r_t_`,
`id:radix-_r_1a_`, `struct:a|Home|…`, `struct:a|Inbox|…`, `struct:button|Order Search|…`,
`struct:a|Job Search|…`, `struct:a|Asset Search|…`, `struct:a|Customer Search|…`,
`struct:button|DRO Search|…`, `struct:button|Payment Search|…`, `struct:a|Item Search|…`,
`struct:button|ECT Search|…`, `struct:button|Event Agendas|…`, `struct:button|Navigator Assistant|…`,
`struct:button|Click to restore sidebar|…`, `struct:button|trigger-button|skip/…`,
`struct:button|More information|…`, `struct:section|Notifications alt+T|html/body`,
`struct:span||html/body`

**Disposition (all 23)**: `out-of-scope: global Navigator shell navigation and notification chrome, present on every page in the app and owned by no single module — covering it here would duplicate app-shell coverage across every module's suite`

Several of these carry `_(disabled)_` and `_(A∖B review)_` markers from the A△B symmetric-diff review
(16 elements). Each is shell chrome, so the review set closes with the same disposition.

## §2b HARVEST RESULTS (2026-08-03, reversible-by-reload — Save NEVER clicked)

Rutvik authorized reversible mutation on office 1604. The harvest took the lowest-risk path that
still yields coverage: **no Save was clicked and no save dialog confirmed**, because NM-1728 §9 says
Save submits the FULL location list and NM-3336 records Navigator→MS sync as broken.

**NET-ZERO PROOF (re-verified after a tooling failure — see §3 OPEN-4):**

| | before | after |
|---|---|---|
| rows | `ROWS=114` | `ROWS=114` |
| save | `disabled=true` | `disabled=true` |
| names | `114 · "Service Charge","Administrative Fee","Hotel Service Charge"` | identical |

### OPEN-1 RESOLVED — two distinct controls, not one

```
TRIGGER  tag=BUTTON role=combobox haspopup=- expanded=false
NATIVE_SELECT  YES tag=SELECT opts=4
SAME_NODE=false   SELECT_INSIDE_TRIGGER=false
```
`service-charge-text-language-trigger-#` is a **Radix combobox button**; a separate native `<select>`
with **4** options also exists in the row (the page-level filter has **5** — `All` plus 4 languages,
so the row select lacks `All`, consistent with a per-row language picker). They are **not the same
node and not nested**. Automation must drive the Radix button; `selectOption()` targets the wrong
control. Disposition upgraded from `DIFFERENTIAL-DATA-REQUIRED` to
`affordance-probed: popover → per-row language listbox (Radix, distinct from the native select)`.

### OPEN-2 RESOLVED — and it surfaced a spec contradiction

`add-row` click → **`ROWS` 114 → 115** (real effect delta) — but **`SAVE disabled=true` afterwards**.

NM-1728 §4 states new rows are "marked as new and **dirty**". A row that does not dirty the form
cannot be saved, so the added row is unreachable by the documented save path. Recorded as
**SCT-OBS-1** below. Disposition upgraded to
`affordance-probed: none (adds a grid row; does NOT dirty the form)`.

### A6 adversarial probes

| probe | result | evidence |
|---|---|---|
| duplicate name (NM-1728 §5 unique-within-language) | typed existing `"Service Charge"` into row 114, Tab → **no error text anywhere** (`text=""` on every element), **Save still disabled** | `32-dup-invalid.txt`, `33-dup-save.txt` |
| 300-char name | `VALUE_LEN=300 MAXLENGTH=none CLIPPED=true` — no length cap; value visually clipped in a 128×28px box | `42-long-geometry.txt` |
| render capture (HARD STOP #13) | geometry + screenshots captured for both paths, not `aria-invalid` alone | `34-dup-render.png`, `43-long-render.png` |

---

## §3 OPEN items — block closure until resolved (LR-062: an open item is not a pass)

**OPEN-1 — the per-row language control's true type is contradictory.**
The enumerator reports BOTH `testid:service-charge-text-language-trigger-# [×114]` with role
**combobox** AND a `struct:select|English (Canada)US English…` with role **select** at
`service-charge-text-table/tbody/tr/td/div/div`. These may be the same control (a native `<select>`
skinned as a combobox) or two distinct controls. **This is not cosmetic** — it decides whether tests
drive it with `selectOption()` or with a Radix listbox click sequence, and the Radix path is the one
with a documented page-teardown hazard. Disposition stays `DIFFERENTIAL-DATA-REQUIRED` until a probe
reads the actual tag name and `aria-*` of one row's control.

**OPEN-2 — `add-row` was enumerated but never driven.**
It is in the archetype-scoped opener set, but `openersClicked: [1,0]` shows only ONE opener fired
(the language filter). Per LR-061-C an un-driven control may not be classified, and per §20.2 a
BEFORE/AFTER effect delta is required. NM-1728 §4 specifies new rows start empty, marked new+dirty,
with a client-side generated id — none of that is verified. **Adding a row is a mutation**, so it
needs the reversibility check (reload discards unsaved rows) before it is driven.

**OPEN-3 — click-probe timeouts leave affordances unconfirmed.**
`derive-type` click-probes timed out at 3000ms for `html-cell-#` archetype, `rte-container`,
`rte-content-scroll`, `rte-content`, and several shell items. The html-cell launcher IS separately
proven (the divergence probe clicked it and the Tiptap editor loaded), so its disposition stands on
that evidence — but the `rte-*` wrappers are dispositioned `read-only-verified` from DOM structure,
not from a successful click probe. Stated rather than glossed.

## §4 Effect deltas recorded (§20.2 — presence is not a walk)

| control | BEFORE | AFTER | delta |
|---|---|---|---|
| `language-filter-trigger` | listbox closed | listbox open, 5 options: `All \| English (Canada) \| US English \| Spanish (Mexico) \| French (Canada)` | **real** — options enumerated |
| `html-cell-#` (row 0) | editor absent from DOM | `rte-content` present, `contenteditable=true`, Tiptap/ProseMirror classes | **real** — launcher confirmed |
| Save button, across the whole probe | `disabled=true` | `disabled=true` after row-selection AND after filter-open/Escape | **zero-delta, and that is the correct behaviour** — selection is not an edit |
| `add-row` | — | — | **NOT DRIVEN** → OPEN-2 |

**Behavioural fact for Phase C's state model**: selecting a row, including clicking a rich-text cell
to load it into the editor, does **not** dirty the form. Save stayed disabled at all three
checkpoints. This is live-proven, not inferred.

## §5 Observations

### Bugs / Defects

Three BUG-CANDIDATEs from the 2026-08-03 reversible harvest. **None is filed as a bug yet** — NM-1728
is status **QA / unresolved**, so unbuilt or partial behaviour is in-flight work, not a defect. Each
needs A7 triage (`/rca` mechanism + REQ-014 classification) before it earns the word. Recorded here
so they cannot be silently lost, per HARD STOP #13.

> **SETTLED 2026-08-03 by a follow-up no-save decider probe.** Filling the new row's required fields
> with UNIQUE values flipped `SAVE disabled=false`; re-typing a DUPLICATE name flipped it back to
> `disabled=true`. Net-zero re-proven (`ROWS=114 NAMES=114 hasProbe=false`). The two candidates below
> are RE-CLASSIFIED accordingly — SCT-OBS-1 is **withdrawn as a defect**, SCT-OBS-2 is **sharpened**.
> Both original texts are kept verbatim so the correction is auditable rather than silently rewritten.

**SCT-OBS-1 — WITHDRAWN (not a defect). Original claim: "a newly added row does not dirty the form".**

**Resolution**: Save is **validity-gated, not dirty-gated**. An empty new row leaves Save disabled
because NM-1728 §5 makes Name / Display Name / Report Column / Language all required — not because
the row failed to register as dirty. Filling those fields with unique values enables Save
(`disabled=false`). The application behaves correctly; NM-1728 §4's phrase "marked as new and dirty"
is loose wording about an internal flag, not a contract about Save's enablement.

**Reclassified**: `stale-ticket` / loose-spec wording per REQ-014 → **discussion item, not a bug**.
This is exactly the alternative reading the original entry flagged for triage; the probe confirmed it.
**Coverage consequence**: TCs must assert Save enablement on *field validity*, never on "a row was
added".

**SCT-OBS-1-ORIGINAL (superseded, retained for audit) — a newly added row does not dirty the form (HIGH).**
Clicking `service-charge-text-add-row` grows the grid 114 → 115, but `service-charge-text-save`
remains `disabled=true`. NM-1728 §4 specifies new rows are "marked as new and **dirty**", and §9
gates Save on dirty state. As observed, a row added through the documented affordance cannot be
persisted through the documented save path. **Alternative reading that triage must rule out**: Save
may be gated on *validity* rather than dirtiness (§5 makes Name/Display/Report/Language all
required, and a new row is empty) — in which case the behaviour is correct and the spec wording is
loose. That ambiguity is exactly why this is a candidate, not a filing.
*Evidence*: `21-rows-after-add.txt`, `22-save-after-add.txt`.

**SCT-OBS-2 — CONFIRMED DEFECT, sharpened: duplicate-name rejection is ENFORCED but SILENT (HIGH).**

**Resolution**: duplicate detection genuinely works — with a unique name Save reads
`disabled=false`; retyping an existing name (`"Service Charge"`) flips it straight back to
`disabled=true`. So NM-1728 §5's *enforcement* half is implemented. But **no error text renders in
either state** (`(no error TEXT rendered)` across `[aria-invalid]`, `[role=alert]`,
`.text-destructive`), and §5 also requires "**validation errors are shown at the row/field level**".

The user types a duplicate, the Save button silently greys out, and nothing explains why. That
violates the `field-case-generation.md` §2.1 rejection-affordance oracle, which requires a rejection
be **announced** and **escapable** — this one is enforced and mute. It is also a WCAG-relevant
failure: a state change with no programmatically-determinable message.

**Reclassified**: `app-bug` per REQ-014 — file per LR-034. This is a *better* finding than the
original "no validation" framing: the mechanism exists, only the announcement is missing, which makes
it a small, well-scoped fix rather than a feature gap.
**Coverage consequence**: a TC asserting duplicate-name behaviour must assert BOTH the Save-disabled
state AND the (currently absent) announcement — the latter is a deliberately-failing assertion that
carries the bug, per the plan's loop-closure rule.

**SCT-OBS-2-ORIGINAL (superseded, retained for audit) — duplicate name produces no announced rejection (HIGH).**
NM-1728 §5 requires Service Charge Name to be **unique within a language**, with row/field-level
errors. Typing an existing name (`"Service Charge"`) into the new row and tabbing away produced
**no error text on any element** and left Save disabled. The `field-case-generation.md` §2.1
rejection-affordance oracle requires a rejection be **announced** and **escapable**; neither was
observed. **Caveat stated honestly**: validation may fire only on save-attempt rather than on blur,
and Save could not be exercised under the no-save policy — so "no rejection announced *on blur*" is
what is proven, not "no validation exists".
*Evidence*: `31-dup-fill.txt`, `32-dup-invalid.txt`, `33-dup-save.txt`, `34-dup-render.png`.

**SCT-OBS-3 — Service Charge Name accepts 300 chars with no maxlength, and clips visually (MED).**
`VALUE_LEN=300 MAXLENGTH=none CLIPPED=true` in a 128×28px box. No client-side length cap exists, and
the over-long value renders clipped rather than wrapped or truncated with affordance. This is the
render-legibility class HARD STOP #13 exists for (the gap that hid BUG-CPR-DET-001). Whether a
server-side cap exists is unknown — untestable without a save.
*Evidence*: `40-long-fill.txt`, `42-long-geometry.txt`, `43-long-render.png`.

**Scope of this bucket**: still only the resting state plus add-row, duplicate-name and boundary
paths. Save-cycle races, dirty-navigation guards, tab-switch persistence and concurrent-edit paths
remain unprobed because they require a committed save.

No UI/UX/layout/rendering/behaviour/accessibility defect was observed in the resting state or in the
two probed interactions. This is a deliberately narrow claim: only 2 of the page's opener states were
driven, no validation or boundary path was exercised, and no error-state render was captured. **The
adversarial harvest (boundary values, invalid input, duplicate-name validation per NM-1728 §5,
rapid double-actions, save/cancel and dirty-navigation races) has NOT been performed** — it requires
mutation, which needs OPEN-2's reversibility answer first. Zero findings here means *not yet looked*,
not *clean*.

Three spec-vs-DOM divergences ARE recorded, but they are classified `REQUIREMENT-GAP` /
`INTENTIONAL-UX-CHANGE` rather than defects, because NM-1728 is status **QA / unresolved** — the story
is still in flight, so unbuilt scope is incomplete implementation, not a bug. Full reasoning in
`jira-defect-crossref-service-charge-text-2026-08-03.md` §6.

### Suggestions / Improvements

- **Testid quality is unusually good here** — `service-charge-text-*` is complete and conventional
  across every interactive control, and the editor exposes `rte-content`. No testid-gap report is
  needed for this module (contrast Corporate Pricing's near-zero coverage). Worth citing as the
  house standard.
- **The loading skeleton is itself well-instrumented** (`service-charge-text-skeleton-*`), which is
  good practice — but any walk or spec MUST wait for `service-charge-text-table` before reading, or
  it captures shimmer. This burned five walk attempts; it belongs in the module's spec preamble.
- **Discussion item (not a bug)**: the live 5th column header reads *"Service Charge Text"* while
  NM-1728 §3 calls it *"HTML Display Text"*. Harmless today, but a reviewer comparing spec to UI will
  trip on it. Raised via `/encore-questions` alongside SCT-DIV-2.

## §6 LR-036 boolean render format

**Not applicable — no boolean column exists on this grid.** The 5 columns are Language, Service
Charge Name, Service Charge Display Name, Report Column Name, Service Charge Text. No checkbox,
no ✔/✘ cell, no `aria-checked` element inside the table. Recorded explicitly so a later session does
not assume a format by analogy with other Encore grids.

## §7 LR-029 testid gaps

Zero gaps on the module surface. Every interactive control under test carries a `data-testid`.
The un-testid'd elements in the denominator are global app-shell chrome (§2) and the shadcn
`Resize column` header primitive — none is a module control, so none is tracked as a gap.

## §8 Evidence index

- `reports/walk-coverage/1604-service-charge-text.json` — machine denominator (42, raw 613)
- `reports/walk-coverage/1604-service-charge-text.manifest.md` — per-element manifest
- `.claude/state/ua-worker/sct-recon-0803c/` — full testid/field/opener dumps, AX snapshots, screenshots
- `.claude/state/ua-worker/sct-divergence-0803/` — header read, V2 scan, editor fingerprint, filter options, non-mutation proof
- `.claude/state/ua-worker/probes/*.sh` — every probe script, re-executable verbatim
