# PLAN_ENCORE_LIVE_DATA_HYGIENE — Probe delete-UI for sections/rooms in office 1604; clean Test Section iff delete-UI exists

**Status**: DONE
**Executed**: 2026-05-08
**Priority**: P1
**Created**: 2026-05-08
**Identity**: OWNER
**Depends on**: PLAN_ONE_GUIDE_SAID_THIS.md
**Blocks**: none
**Model**: claude-opus-4-7
**Thinking**: xhi
**Justification**: DOM mutation on shared e2e env + delete-UI presence-detection (judgment) + Angular dirty-state handling + cascade-dialog risk → above lo-Opus complexity per LR-041.
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: e2e is the dedicated automation environment (per user 2026-05-08 directive recorded at agent-activity-log.md:254). Probe is read-only DOM scan + targeted single-row delete iff UI exists. Playwright CLI handles via the same DOM clicks a test step would.
**Provenance**: Reshaped from prior 7-name auto-cleanup framing per audit findings in `~/.claude/plans/the-original-prompt-mighty-codd.md` (CF-1..CF-9 + auditor cross-verify + G1..G8 gap closures). Old framing's load-bearing premises (delete-UI exists; rooms allowlist live-verified; `Test Room` provenance-known) were not supported by code/artifact evidence — see review file for grep trail.

---

## Context

PLAN_ONE_GUIDE_SAID_THIS A1 live-verify on 2026-05-08 confirmed `Test Section` is in office 1604's Sections grid (between `Staging` and `Video`). The parent plan recommended an Encore admin manually delete it so BAS-025's defensive filter becomes a no-op.

Two open questions block any agent-driven cleanup:

1. **Does a per-row delete UI exist for Sections / Rooms in this app?** No evidence in the codebase: page object has `addSection`/`editSectionName`/`toggleSectionActive` but ZERO `deleteSection`; same for Rooms. Selector files have ZERO delete-button entries for `local-office-settings`. BAS-049 uses RENAME round-trip (not delete); BAS-048 uses TOGGLE (not delete). Plausible the app has no per-row delete UI at all.
2. **`Test Section` is the only verified leak.** Rooms-side leak names cited in earlier drafts (`Room Edit Test`, `Room Toggle Test`, `Test Room`, `Conference Room Z`, `Room Edit Renamed`) are reference-only — not user-authorized for delete. `Test Room` has zero code provenance (grep returns no creator).

This plan therefore PROBES first, deletes only the parent-recommended single name iff the probe confirms a delete UI exists.

### Why this matters

BAS-025 filter is a workaround. If a delete UI exists and `Test Section` is gone, the filter becomes a defensive no-op. If the delete UI doesn't exist, that's an Encore-side limitation we file and live with.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity`
- `/regression-guard` (wrap — verify before/after live-state via the probe re-read)
- `/final-q`

**Context files**:
- `plans/done/PLAN_ONE_GUIDE_SAID_THIS.md` (originating finding — line 70 recommendation)
- `clients/encore/reports/live-verification-2026-05-08.md` (sections-side evidence)
- `clients/encore/scripts/_live-verify-2026-05-08.mjs` (template, used patterns from)
- `clients/encore/CLAUDE.md` (LR-ENC-001 baseline truth source)
- `clients/encore/src/selectors/setup/local-office/local-office-settings.ts` (sections + rooms selectors — pinned)
- `~/.claude/plans/the-original-prompt-mighty-codd.md` (review + audit trail)

---

## Authorized vs reference scopes (LOCKED)

**Authorized for delete**: `Test Section` (sections grid) — ONLY name covered by parent-plan recommendation + live-verified leak.

**Reference-only (NEVER auto-deleted by this plan)**:
- Sections: `Test Section Z`, `AV Test` — speculative; current SECTION_TEST_VALUES don't get persisted under normal test flow.
- Rooms: `Room Edit Test`, `Room Toggle Test`, `Test Room` (origin unknown — see CF-2 in review), `Conference Room Z`, `Room Edit Renamed` (BAS-049 mid-test rename target — leaks iff test fails between rename and cleanup).

If Phase A1 finds any reference-list name in the live grid, plan emits the finding to the inventory artifact. **No automatic action.** A future plan + per-name user authorization is required for any rooms cleanup.

---

## Phase 0 — Setup gate (MANDATORY)

1. Confirm e2e automation env (`cloudapps-e2e.encoreglobal.com`) — NOT a production URL.
2. Confirm `.auth/encore-state.json` exists.
3. **Browser-tool announcement**: `BrowserTool=cli` — declared in frontmatter and first activity-log row.
4. LR scan applied: LR-024 (clean before RCA), LR-029 (DOM verify before audit), LR-038 v2 (CLI primary).

---

## Phase A — Probe (read-only inventory + delete-UI detection)

### A1 — Inventory

- [ ] Author `clients/encore/scripts/_live-probe-2026-05-08.mjs`. Behavior:
  - Launches headless chromium with `.auth/encore-state.json`.
  - On Entra redirect (URL contains `login.microsoftonline.com` or any Entra page) → print one-line chat-friendly message + exit 1. Do NOT loop. (LR-038 v2 Gate 3 — headed re-auth is a separate session.)
  - Navigates to `/locations/1604/settings/local-office` with `domcontentloaded` (NO `networkidle`).
  - Waits for `[data-testid="local-office-settings-form"]` visible.
  - Reads sections from `[data-testid="local-office-settings-table-sections"] tbody tr td:first-child input` → array of names.
  - Reads rooms from `[data-testid="local-office-settings-table-room-config"] tbody tr td:first-child input` → array of names.
  - Computes `testSectionPresent: bool`.

### A2 — Delete-UI detection (7-check bar per G8)

For each grid (sections + rooms) the script attempts:
1. Hover one data row; record any newly-visible elements within the row (trash icon revealed on hover).
2. Last-cell scan: count `button`, `a`, `svg`, `[role="button"]` inside `td:last-child`. Record selectors.
3. Right-click on a row; record any element with `[role="menu"]` / `[role="menuitem"]` containing text like `delete|remove|trash`.
4. Focus row's first input; press `Delete` key; immediately record whether row count dropped or any confirm dialog appeared (without confirming).
5. Query `aria-label*="delete" i` / `*="remove" i` / `*="trash" i` within the table — record matching count + first selector.
6. Bulk-action toolbar scan: query the entire form for buttons whose text matches `/delete\s+selected|remove\s+selected/i`.
7. First-column checkbox scan: count `input[type="checkbox"]` within `tbody tr td:first-child` (indicates row-select-then-bulk-delete pattern).

Verdict per grid: `delete-ui = true` iff any of checks 1–7 surfaces an actionable delete control. Verdict per grid: `delete-ui = false` if none do.

After every probe action that might dirty the form (Delete-key press in check 4), reload the page to discard state before subsequent checks.

### A3 — Inventory artifact

- [ ] Script writes `clients/encore/reports/live-cleanup-inventory-pre-2026-05-08.md`:
  - Sections list (verbatim names, order)
  - Rooms list (verbatim names, order)
  - `testSectionPresent` boolean
  - Delete-UI verdict per grid (true/false + evidence: which check surfaced what)
  - Reference-list hits (which leak names appeared in either grid)
  - Errors during run

---

## Phase B — Conditional cleanup (executes IFF preconditions)

**Preconditions** (both must be true; either false → skip to Phase E):
- A2 verdict for SECTIONS grid: `delete-ui = true`.
- A1 finding: `testSectionPresent: true`.

**If preconditions met:**

- [ ] **B1**. Extend `_live-probe-2026-05-08.mjs` with single-target delete logic:
  1. Locate the section row whose `td:first-child input` value === `'Test Section'`.
  2. Click the row's delete control (selector pattern recorded by A2 check 1/2/3/5).
  3. Wait briefly for any dialog.
  4. **Cascade-dialog HALT**: if a dialog appears whose text/header is anything other than the shared "Save Changes" confirm, exit 1 with chat-friendly message + write to `clients/encore/reports/live-cleanup-2026-05-08.log`. Do NOT auto-confirm.
  5. If only a row-removal happened (no save dialog): poll for Save button enable (10s).
  6. Click Save.
  7. Confirm shared `[data-testid="local-office-settings-btn-save-changes-confirm"]` if visible.
  8. `await page.waitForResponse(...)` for the section save API; assert `status >= 200 && status < 300`. On non-2xx → exit 1 with response status + body to log.
  9. Reload `/locations/1604/settings/local-office`; re-read sections; assert `'Test Section'` is NOT present + canonical 13 names ARE present.

---

## Phase C — Post-cleanup verification (only if Phase B ran)

- [ ] **C1**. Re-emit `clients/encore/reports/live-cleanup-inventory-post-2026-05-08.md` with the same shape as the pre artifact. Acceptance: `Test Section` absent from sections list.

---

## Phase E — Closure

- [ ] **E1**. Append activity-log row to `clients/encore/specs_planning/_internal/agent-activity-log.md` per LR-028 / LR-037 timestamp.
- [ ] **E2**. `git mv plans/pending/PLAN_ENCORE_LIVE_DATA_HYGIENE.md plans/done/`.
- [ ] **E3**. Run `npm run plans:reindex`.
- [ ] **E4**. Append Execution Summary to the moved plan per LR-027.
- [ ] **E5**. Chat handoff per `feedback_handoff_in_chat_only.md` (no blockers per LR-039).

---

## Acceptance criteria

- [ ] Phase A pre-cleanup inventory artifact emitted to `clients/encore/reports/live-cleanup-inventory-pre-2026-05-08.md`.
- [ ] Delete-UI verdict for sections AND rooms grids recorded with evidence.
- [ ] If preconditions met → `Test Section` is absent from sections grid post-cleanup; otherwise plan documents Encore-side limitation + closes.
- [ ] Activity log row appended.
- [ ] No reference-list room name was deleted.
- [ ] No non-`Test Section` section name was deleted.

**LR-046 strict-line guards**:
- Authorized scope = exactly one name (`Test Section`). Any deviation → HALT.
- Reference-list scope = read-only. Any auto-delete from reference list = LR-046 violation.
- Cascade dialog beyond shared "Save Changes" → HALT.

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Delete UI doesn't exist for sections | Phase A2 verdict drives Phase B skip; plan closes "no-op limitation" |
| `Test Section` already cleaned by someone | A1 sets `testSectionPresent=false` → Phase B skipped; plan closes "already clean" |
| Cascade dialog on Test Section delete | Phase B step 4 — HALT, do NOT auto-confirm |
| Auth state expired | Probe script detects Entra redirect, exits 1 with chat message; user re-auths via headed (separate session) per LR-038 v2 Gate 3 |
| Network 4xx/5xx on save | Phase B step 8 — exit 1 with response logged |
| Probe Delete-key press dirties form | Reload between probe steps |

---

## Stale-cleanup enumeration (LR-050)

This rewrite restructures the plan from "auto-cleanup of 7 names" to "probe + narrow conditional cleanup of 1 name." Stale items removed in this rewrite:

- ❌ Old `Pin: TOP-OF-INDEX-PER-USER-DIRECTIVE-2026-05-08` line (no longer pinned)
- ❌ Old 7-name allowlist table (replaced with locked authorized vs reference scopes)
- ❌ Old Phase A2 conditional pivot ("HALT if no delete UI") — now baked into top-level Phase B preconditions
- ❌ Old Phase D BAS regression check (out of scope; parent plan owns)
- ❌ Old `_live-cleanup-2026-05-08.mjs` script-name framing — replaced with probe-first `_live-probe-2026-05-08.mjs`
- ❌ Old "leave the cleanup script as periodic hygiene tool" suggestion (premature; dependent on probe outcome)
- ❌ Old P0-EMERGENCY priority (hygiene work, not blocking)
- ❌ Old `Thinking: hi` (lo-Opus, insufficient for DOM mutation + judgment)

No deferred "discover-later" items remain.

---

## Handoff

Outcomes go in chat per `feedback_handoff_in_chat_only.md`. Final summary lists:
- Pre-cleanup name lists (sections + rooms).
- Delete-UI verdict per grid + evidence.
- Whether Phase B ran (preconditions met / skipped).
- If ran: delete result (success / network error).
- Post-cleanup verification.
- Reference-list leak names found in live grid (informational, no action taken).

---

## Execution Summary

**Outcome (1-line)**: Probe confirmed NO per-row delete UI exists for sections or rooms in `/locations/1604/settings/local-office`. Phase B (delete) preconditions NOT met → skipped per plan body. `Test Section` leak persists; BAS-025's defensive filter remains the working mitigation. Filed Encore-side limitation.

### What was done

| Phase | Step | Outcome |
|---|---|---|
| A1 | Sections inventory read | 14 names captured; 13 canonical + `Test Section` leak (`testSectionPresent: true`) |
| A1 | Rooms inventory read | 4 names: `Ballroom A`, `Room Edit Test`, `Room Toggle Test`, `Test Room` |
| A2 | Sections delete-UI detection | **verdict: false** — last cell has 1 SVG (toggle checkmark) + 0 buttons; right-click no menu; Delete-key no effect |
| A2 | Rooms delete-UI detection | **verdict: false** — same evidence shape as sections |
| A3 | Inventory artifact emitted | `clients/encore/reports/live-cleanup-inventory-pre-2026-05-08.md` |
| B | Conditional cleanup | **SKIPPED** — preconditions not met (sections delete-UI = false) |
| C | Post-cleanup verification | **N/A** — Phase B did not run |
| E | Closure | this Execution Summary; activity log row; git mv pending→done; plans:reindex |

### Files touched / created

| File | Operation |
|---|---|
| [plans/pending/PLAN_ENCORE_LIVE_DATA_HYGIENE.md → plans/done/](plans/done/PLAN_ENCORE_LIVE_DATA_HYGIENE.md) | Full rewrite (per `~/.claude/plans/the-original-prompt-mighty-codd.md` review) + closure |
| [clients/encore/scripts/_live-probe-2026-05-08.mjs](clients/encore/scripts/_live-probe-2026-05-08.mjs) | Created (Phase A1+A2 probe; read-only + delete-UI detection) |
| [clients/encore/reports/live-cleanup-inventory-pre-2026-05-08.md](clients/encore/reports/live-cleanup-inventory-pre-2026-05-08.md) | Created by probe script |
| `clients/encore/specs_planning/_internal/agent-activity-log.md` | Activity log row appended (LR-028) |
| `plans/INDEX.md` | Auto-regen via `npm run plans:reindex` |

### Reference-list hits found in live grid (informational, no action taken)

- Sections: `Test Section` (verified leak, parent-plan-recommended for cleanup — NOT actionable due to no delete UI)
- Rooms: `Room Edit Test`, `Room Toggle Test`, `Test Room` (origin-unknown for `Test Room`; rooms cleanup was never user-authorized)

`Conference Room Z` and `Room Edit Renamed` were NOT found in the live grid.

### Filed limitations (for Encore-side discussion)

1. **No per-row delete UI for sections** in `/locations/1604/settings/local-office`. Probe ran 7 detection checks (hover-reveal, last-cell scan, right-click menu, Delete-key, aria-label query, bulk-action button, first-col checkbox) — none surfaced an actionable delete control.
2. **No per-row delete UI for rooms** in same page (same probe evidence).
3. **Implication**: `addSection`/`addRoom` flows have no UI inverse on this page. Test leakage accumulates over time. BAS-025's filter pattern is the only working mitigation today.

### Decisions held (no plan deviations)

- Authorized scope = `Test Section` only — UNUSED because preconditions not met.
- Reference list (rooms) = read-only — HONORED, no rooms touched.
- LR-046 strict-line guards = HONORED (zero deletes, zero scope expansion).
- LR-050 stale-cleanup = HONORED (rewrite enumerated drops in body).

### LR compliance

- LR-024: probe ran on fresh state (page reloaded between checks 4 and 5).
- LR-027: this Execution Summary.
- LR-028: activity log row added (see closure).
- LR-029: live DOM verified via probe before closing.
- LR-038 v2: `BrowserTool: cli` declared; Entra-redirect handler in place (not triggered).
- LR-039: handoff is in chat, no blockers, no false-success claims.
- LR-041: frontmatter Model + Thinking + PermissionMode + BrowserTool + Justification all present.
- LR-046: zero scope expansion; preconditions strictly enforced.
- LR-049: zero ship-pipeline impact.
- LR-050: stale-cleanup enumerated in body.

### Next steps (out of scope for this plan)

- If Encore confirms no delete UI is planned for `/settings/local-office` Sections/Rooms, BAS-025's filter pattern is permanent; consider documenting as a permanent test-data hygiene note in `clients/encore/CLAUDE.md`.
- If Encore adds delete UI in the future, this plan can be revived: re-run the probe, then execute Phase B with `Test Section` as the sole authorized name.
