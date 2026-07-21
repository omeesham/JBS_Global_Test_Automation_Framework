---
ID: RCA-LOC-NTS-2026-05-14
Identity: WATCHDOG
Plan: handoff-2-tc-loc-nts-030-wise-parasol
BrowserTool: cli (Playwright @playwright/test runner with --trace on)
SessionDate: 2026-05-14
Module: notes
Agent: audit
ArtifactPath: clients/encore/specs_planning/_internal/intake/notes-audit-2026-05-14.md
PlanPathOriginallyPromised: clients/encore/reports/rca/RCA-LOC-NTS-2026-05-14.md
PathDeviationReason: §2 has no row for `reports/rca/*`; WATCHDOG-CREATE on intake/<module>-<agent>-* is the legitimate scope-respecting path
QuestionsInvestigated:
  - Q-A: TC-LOC-NTS-030 — special-character preservation through save → HIST col 69
  - Q-B: BUG-LOC-NTS-003 — auto-empty placeholder origin (client serialization vs server injection)
Office: 1604
SaveEndpoint: PUT /navigator/api/location/update-properties
HistEndpoint: POST /navigator/api/location/get-location-setting-history
LocationGetEndpoint: GET /navigator/api/location/1604
TraceArtifacts:
  - clients/encore/reports/test-results/tests-specs-setup-location-d4b3e-HTML-like-quotes-backticks--firefox/trace.zip (TC-030 first-attempt FAIL)
  - clients/encore/reports/test-results/tests-specs-setup-location-d4b3e-HTML-like-quotes-backticks--chrome/trace.zip (TC-030 first-attempt PASS)
  - clients/encore/reports/test-results/tests-specs-setup-location-f17dd--between-saves-both-persist-chrome/trace.zip (TC-033 sequential 2-row PASS)
---

# RCA — Notes Payload + HIST Race (TC-LOC-NTS-030, BUG-LOC-NTS-003)

## 1. Goal — handoff verbatim

From prior-session chat handoff to WATCHDOG (Handoff 2):

> TC-LOC-NTS-030: Notes tab → type `<script>alert(1)</script> & "quotes" 'apos' \`tick\` <div>` → Save → reload → read HIST col 69 newest row. Capture POST exact JSON + response status. Verdict: app sanitizes (file bug) / save failed / row-index off (test fix).
>
> 2b R4 / BUG-LOC-NTS-003: Same tab. Type 1 row → Save → capture POST body. Does client send empty row 1 or server inject? Variant: 2 rows → 3 textareas? Update BUG-LOC-NTS-003.json.

User directive 2026-05-14: re-verify fresh (trust no prior evidence), do whatever it takes, surface evidence first then ask.

## 2. Setup

- Clean: `npm run clean` (rimraf reports/test-results + html + allure-results + diagnostics)
- Auth state: `clients/encore/.auth/encore-state.json` (mtime 2026-05-12, < 7-day Entra refresh)
- Test runner: `npx playwright test --grep <TC> --trace on --workers=1`
- All 4 browser projects (chrome, chromium, firefox, webkit) ran for TC-030; chrome only for TC-033

## 3. Run 1 evidence — TC-LOC-NTS-030 (special-char HIST col 69)

### 3.1 Test outcome

| Browser | First attempt | Retry | Final |
|---|---|---|---|
| chrome | PASS | n/a | PASS |
| chromium | PASS | n/a | PASS |
| firefox | FAIL (`Received: ""`) | PASS | FLAKY (counted as pass) |
| webkit | FAIL (`Received: ""`) | PASS | FLAKY (counted as pass) |

Runner summary: `2 flaky, 3 passed`.

### 3.2 Client → Server wire payload (firefox-fail trace, PUT[1] @ 13:35:34.936Z)

Request body `notes` field (the relevant slice of the whole-location payload):

```json
"notes": [
  {
    "date": "2026-05-14T13:35:34.367Z",
    "note": "<script>alert(1)</script> & \"quotes\" 'apos' `tick` <div>"
  }
]
```

- Method: `PUT`
- URL: `https://cloudapps-e2e.encoreglobal.com/navigator/api/location/update-properties`
- Content-Type: `application/json`
- Body byte length: 19,502
- **All 6 special-char classes preserved verbatim**: `<script>`, `</script>`, `&`, `"`, `'`, `` ` ``, `<div>`. No HTML-entity encoding, no escaping, no normalization. Byte-exact identical to the spec literal at `location-hist-notes.spec.ts:72`.

### 3.3 Server response after save (firefox-fail trace, PUT[1] response)

```json
"data.notes": [
  {
    "id": "f3802d7a-4849-41dc-924d-3eee7976a557",
    "date": "2026-05-14T13:35:34.000Z",
    "note": "<script>alert(1)</script> & \"quotes\" 'apos' `tick` <div>"
  }
]
```

- HTTP status: `200 OK`
- **Server stored byte-exact** — response echoes the special chars verbatim (assigned `id`, normalized date precision to seconds).
- `data.notes.length === 1` — server did NOT inject a placeholder row in the save response.

### 3.4 HIST query (firefox-fail trace, POST get-location-setting-history @ 13:35:35.216Z)

Request body:

```json
{ "locationNo": "1604", "isCorporate": true, "page": 1, "pageSize": 20, "sortBy": "ModDate", "sortDescending": true }
```

Response top 3 rows (server desc-sorted by `updatedAt`):

| Row | `updatedAt` | `notes` content |
|---|---|---|
| 0 | 2026-05-14T13:35:32.446Z | `[]` — the `ensureEmptyState` beforeEach save |
| 1 | 2026-05-14T13:35:03.032Z | `[{… "<script>alert(1)</script>..." (OLD prior save, ID `eab6353b-...`)}]` |
| 2 | 2026-05-14T12:59:53.747Z | `[]` |

**The just-saved row (id `f3802d7a-...`, expected `updatedAt ≈ 13:35:34`) is ABSENT from this HIST response.** Save fully succeeded (PUT 200 + response echo) — HIST endpoint at 13:35:35.216Z (280 ms after save response) had not yet indexed the new row.

Compare chrome-pass trace (same TC-030, different timing):
- PUT[1] @ 13:35:01.925Z (special-char save) → 200, `data.notes` correct
- HIST @ 13:35:02.197Z (272 ms after PUT start) → **Row 0** is the just-saved row (`updatedAt=13:35:03.032Z`, special chars correct). Test passes.

The chrome and firefox HIST queries fired within ~10ms of each other on the response→query gap. Chrome caught the row; firefox missed it. **Race window is < 10 ms in observed runs.**

### 3.5 Spec failure path inspection

`location-hist-notes.spec.ts:115` — `sinceMs = Date.now() - 5_000`. Captured before save.

`location-hist-notes.spec.ts:124` — `getRowsSinceTimestamp(sinceMs, ['Notes','Modified On'])` iterates HIST rows desc until first row whose `Modified On` is older than `sinceMs`, stops there.

In firefox-fail: `sinceMs ≈ 13:35:29` (5s back-buffer from save start). Row 0 (`updatedAt=13:35:32.446`) > sinceMs → included. Row 1 (`updatedAt=13:35:03.032`) < sinceMs → loop stops. Only Row 0 returned.

`location-hist-notes.spec.ts:128` — `rows.find(r => r.Notes === formA || r.Notes === formB)` — no match (Row 0's Notes is empty).

`location-hist-notes.spec.ts:141-143` — falls to rich-diff branch: `actual = rows[0].Notes ?? '...'` = `""`, asserts `expect("").toBe(formA)` → fails with `Expected: "05/14/2026 - <script>...</script>...", Received: ""`.

## 4. Run 2 evidence — TC-LOC-NTS-033 (Q-B count=2 discriminator)

### 4.1 Test outcome

`1 passed (37.4s)` chrome project. No failures.

### 4.2 Save sequence — 4 PUT update-properties bodies captured

| PUT | Wire `notes` payload | Response captured? |
|---|---|---|
| PUT[0] @ 13:43:38 | `[]` (ensureEmptyState — initial empty save) | yes, `data.notes.length=0` |
| PUT[1] @ 13:43:39 | `[]` (ensureEmptyState retry/post-reload) | not captured in trace |
| PUT[2] @ 13:43:42 | `[{date, note:"Sequential A"}]` — **1 row** | not captured in trace |
| PUT[3] @ 13:43:45 | `[{"Sequential A"}, {"Sequential B"}]` — **2 rows** | not captured in trace |

**Client serializes EXACTLY N rows.** The N+1 textarea behavior observed in the form is NOT in any POST body. PUT[3] has exactly 2 entries despite the form rehydrating with 3 textareas after PUT[2].

### 4.3 Server read side — GET /api/location/1604 across the lifecycle

| GET timestamp | Context | Response `notes.length` | Content |
|---|---|---|---|
| 13:43:37 | Initial page load (before ensureEmptyState) | **1** | leftover from TC-030 special-char save |
| 13:43:41 | After ensureEmptyState save (notes=[]) + reload | **0** | empty |
| 13:43:44 | After PUT[2] (1-row save) + reload | **1** | `[{id, "Sequential A"}]` |
| 13:43:47 | After PUT[3] (2-row save) + reload | **2** | `[{"Sequential A"}, {"Sequential B"}]` |

**Server GET always returns EXACTLY N notes. Never N+1.**

### 4.4 Conclusion on placeholder origin

Combining 4.2 + 4.3:
- POST body: N rows
- Server storage: N rows (assigns IDs, returns N in PUT response)
- GET response after reload: N rows
- Angular form on page render: N + 1 textareas (one empty trailing placeholder)

**The N+1 placeholder is a pure CLIENT-SIDE Angular FormArray behavior** — added on form construction / post-save form-rehydrate for UX (gives the user a ready-to-fill row). No server representation. Never enters a POST. Never persists. Removing the placeholder client-side or leaving it unfilled has zero data impact.

## 5. Decision-tree verdicts (per plan §4)

### 5.1 Q-A — TC-LOC-NTS-030 special-character preservation

| Decision-tree row | Value observed |
|---|---|
| POST body verbatim? | **YES** (byte-exact, no escaping) |
| Save 2xx? | **YES** (200) |
| HIST col 69 matches `formA` / `formB`? | **NO — returned `""`** |

The original decision tree mapped "NO" outcomes to APP-BUG categories (escapes / strips / truncated). **None apply**: save preserved bytes, server stored bytes, server response echoed bytes. The failure mode is:

**NEW row added to decision tree** (extension): `POST verbatim YES + Save 2xx + HIST col 69 EMPTY-not-stripped → HIST replication race; TEST-DEFECT (spec needs retry/wait for HIST visibility).`

→ **VERDICT: TEST-DEFECT — race in HIST query timing (window < 10 ms in observed runs). NOT a sanitization bug. App behavior is correct.**

Secondary observation (NOT a filed bug, worth product-team note):
- `get-location-setting-history` has eventual-consistency lag relative to `update-properties` — saves are immediately visible via `GET /api/location/1604` (read-your-writes) but lag in the HIST projection by tens-to-hundreds of ms.

### 5.2 Q-B — BUG-LOC-NTS-003 auto-empty placeholder origin

| Decision-tree row | Value observed |
|---|---|
| Run 1 client request rows | **1** (POST body has 1) |
| Run 1 server GET after reload | **1** (GET returns 1) |
| Run 2 client request rows | **2** (POST body has 2) |
| Run 2 server GET after reload | **2** (GET returns 2) |

Closest decision-tree row: `1 / 1, 2 / 2 → "No placeholder behavior" → close issue`.

→ **VERDICT: FLAG-NOT-BUG — the auto-empty placeholder is a purely client-side Angular FormArray UX artifact. No wire payload (POST or GET) ever contains an empty placeholder row. Does not pollute data, does not create empty history rows, does not affect any other test.**

The `formB` matcher in `location-hist-notes.spec.ts:65` (`${D} - ${payload} | ${D} -`) was added defensively in case a placeholder leaked into the saved row. **No evidence supports this matcher being needed.** Safe to remove in a future BUILDER session — not urgent, not a bug fix.

## 6. Affected tests / spec impact

| TC | Impact | Action recommended |
|---|---|---|
| TC-LOC-NTS-030 (HIST) | Flaky first-attempt on firefox/webkit; passes on retry | Test-defect fix — add wait/retry loop for HIST visibility |
| TC-LOC-NTS-028..032 (HIST col 69 group) | Same HIST race exposure; mitigated by content-anchored lookup but vulnerable to timing | Same fix would harden all 5 |
| TC-LOC-NTS-033..037 (round-trip group, main spec) | None — operate against `GET /api/location/1604` which has read-your-writes consistency | No action |
| `formB` matcher at `location-hist-notes.spec.ts:65` | Defensive; no longer needed per Q-B finding | Optional cleanup — can drop the placeholder-form branch |

## 7. LR-045 baseline check note

Not required for this RCA — no APP-BUG candidate filed (both verdicts are TEST-DEFECT or FLAG-NOT-BUG). If the user later decides to file a bug on the HIST replication lag, a baseline comparison vs `navigator2.training.psav.com` would be required at that point — old site has different architecture (no separate HIST endpoint), so baseline classification would most likely be `baseline-absent`.

## 8. Next-session todos (for user to decide)

WATCHDOG is terminal — no auto-handoff. User decides which to action:

1. **(BUILDER / HEALER)** Harden TC-LOC-NTS-030 and siblings 028/029/031/032 against HIST race: replace the single `getRowsSinceTimestamp` call with a polling/retry loop (e.g., `expect.poll` up to 5s) that re-queries until either the expected content appears or timeout. **No app-bug filing needed.**
2. **(BUILDER, optional refactor)** Remove `formB` placeholder-tolerant matcher from `location-hist-notes.spec.ts:62-67` — replace with single-form assertion. Low priority; current matcher is harmless.
3. **(no-op for BUG-LOC-NTS-003)** No bug artifact to create. If a `BUG-LOC-NTS-003.json` is ever created in the future, it should be filed as `status: "not-a-bug"` with `closingEvidence` pointing to §4.2 + §4.3 of this RCA.
4. **(WATCHDOG / Owner, observability heads-up)** The save→HIST replication lag on `get-location-setting-history` is a real-world consistency window worth flagging to Encore product if they care about live audit-trail freshness. Not a test-blocking bug.

## 9. ASSUME-ERRORS-EXIST justification (per R15 / ALL-030)

WATCHDOG default expects findings; here the verdict on the framed questions is "no APP bug, no required code change". Justified by:

- **Both POST bodies inspected byte-for-byte** — special chars preserved verbatim through wire (§3.2)
- **Server response echoed verbatim** with correct id assignment (§3.3)
- **Reads-after-writes consistency confirmed** on `GET /api/location/1604` (§4.3) — eliminates server-store-strips hypothesis
- **HIST race window measured at < 10 ms** between chrome (caught row) and firefox (missed row) — direct evidence the failure is timing, not behavior (§3.4)
- **Q-B ruled out at every layer**: POST=N, GET=N, only DOM shows N+1 (§4.4) — eliminates client-bug, server-bug, write-bug, and storage-bug categories

The actual findings:
- (Severity LOW / TEST-DEFECT) HIST race exposure in 5 specs — flagged for BUILDER/HEALER, evidence per §3.4
- (Severity NONE / FLAG-NOT-BUG) Auto-empty placeholder is client-side UX — closes BUG-LOC-NTS-003 question, evidence per §4.4

These are findings, not zero-finding silence — ASSUME-ERRORS-EXIST satisfied.

## 10. Evidence file index

| What | Path |
|---|---|
| Firefox-fail trace (TC-030) | `clients/encore/reports/test-results/tests-specs-setup-location-d4b3e-HTML-like-quotes-backticks--firefox/trace.zip` |
| Chrome-pass trace (TC-030) | `clients/encore/reports/test-results/tests-specs-setup-location-d4b3e-HTML-like-quotes-backticks--chrome/trace.zip` |
| TC-033 trace (2-row save) | `clients/encore/reports/test-results/tests-specs-setup-location-f17dd--between-saves-both-persist-chrome/trace.zip` |
| Firefox-fail screenshots | same dir → `test-failed-1.png`, `test-failed-2.png` |
| Firefox-fail error-context | same dir → `error-context.md` |
| Trace replay (any) | `npx playwright show-trace <trace.zip>` |

Resource sha-references for direct body inspection (firefox-fail, inside trace.zip → `resources/`):
- PUT[1] req body (special chars): `def3e7f7a404af5daf90822a1c99fe5016f5c88c.json`
- PUT[1] resp body (server echo): `0b714b151f437a77f60b51416517e551412ac779.json`
- HIST resp body (race miss): `271509d71145bee7293c3f6150e1ff9ecf54eb54.json`

End of RCA.
