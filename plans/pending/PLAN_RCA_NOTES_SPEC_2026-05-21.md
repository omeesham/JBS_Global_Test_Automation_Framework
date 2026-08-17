# PLAN: /rca on the failing Notes spec(s) — 2026-05-21

**Status**: PENDING
**Priority**: P1 (user-flagged failing spec)
**Created**: 2026-05-21
**Identity**: OWNER (mama). Spawns Subagent A + Subagent B per `/rca` mama-led orchestration.
**Depends on**: none
**Blocks**: any further notes spec work until root cause is proven and fix proposed
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli (HEADED — per `.claude/rules/browser-tool.md` Gate 2 "RCA context" row; no override)
**Author**: Rutvik (via Claude Opus 4.7, /rca + /planning + /ultrathink)
**ActiveClient**: encore

---

## Context

User request: "apply this skill on the notes spec, its failing" — `/rca` invocation with `/ultrathink` + `/planning` modifiers. No specific TC given; user says "the notes spec" singular but two specs exist:

- `clients/encore/tests/locations/location-notes.spec.ts` — 53 tests total (28 FCC-paradigm tests at canonical IDs `TC-LOC-NTS-039..064` per SUBPLAN_XLSX_PREP_01 rename 2026-05-26 + 25 legacy `TC-LOC-NTS-001..037`). Describe tag: `@locations @notes @fcc` retained as paradigm marker; TC IDs no longer carry `-FCC-` segment.
- `clients/encore/tests/locations/location-management-history.spec.ts` — the 6 Notes col-69 HIST tests (`TC-LOC-NTS-028..032, 038`) in the `@notes-hist` describe (consolidated 2026-06-05 from the former `history/location-hist-notes.spec.ts`). Describe tag: `@locations @management-history @notes-hist`.

Per LR-018 ("run-all is the only truth"), run BOTH and let the failures self-identify which spec the user meant.

### Known APP bugs already filed (do NOT re-RCA these — recognize them as expected)

- `BUG-LOC-NTS-001` — delete-only no-persist (workaround: `ensureEmptyState()` clear+delete+save+reload)
- `BUG-LOC-NTS-002` — dialog button = "Ok" not "Save" (workaround landed in `shared.ts:41`)
- `BUG-LOC-NTS-003` — auto-empty placeholder row (handled via dual-form acceptance + content-anchored lookup)

If RCA finds a NEW symptom that matches these, the bug is already filed — verify via LR-044 protocol; do not re-file.

### Today's prior session evidence (2026-05-21)

`PLAN_FCC_NOTES_COMPLETION_2026-05-21.md:65` confirmed FCC-001 passed at 14:09 on `encore-locations` + `chromium` + `firefox` + `webkit` projects. Means: as of ~14:09 today, FCC-001 was green. User now reports failure → something changed since 14:09 OR a different TC is failing OR the user is referring to the hist spec.

### Discovery already done (skip rediscovery)

`.claude/context/navigation.md:87` registry row says Notes surface is **Complete** — field-inventory at `clients/encore/specs_planning/_internal/field-inventories/notes-2026-05-11.md`, HIST catalog at `clients/encore/specs_planning/catalogs/hist-root-map-location-management-notes.md`, baseline at `clients/encore/specs_planning/_internal/old-site-baseline/notes-2026-05-11.md`. **Mama and subagents must consult these BEFORE re-exploring DOM.**

---

## Bootstrap

**Identity**: OWNER (mama). A + B subagents inherit caller's model tier (opus-4-7 xhi) per `/rca` uniformity rule.

**Skills auto-called**:
- `/identity` (mama is OWNER; A + B run as task-scoped subagents — no identity switch)
- `/rca` (this plan's whole point)
- `/regression-guard` (only if fix is proposed in Phase 7 and lands)
- `/final-q` (session close)

**Context files (already loaded — re-cite for traceability)**:
- `.claude/skills/rca/SKILL.md` (orchestration framework)
- `.claude/rules/specs.md` (LR-018, LR-019, LR-024, LR-051, LR-052, LR-053)
- `.claude/rules/browser-tool.md` (CLI HEADED mandatory for `/rca`; LR-054 binary distinction)
- `.claude/rules/angular.md` (LR-009, LR-010, LR-011, LR-026)
- `.claude/rules/pipeline.md` (LR-044 Bug Verification Protocol)
- `clients/encore/CLAUDE.md` (LR-ENC-001 baseline, LR-012, LR-017, LR-036)
- `clients/encore/specs_planning/_internal/field-inventories/notes-2026-05-11.md`
- `clients/encore/specs_planning/catalogs/hist-root-map-location-management-notes.md`
- `clients/encore/playwright.config.ts:159` (`encore-locations` project — auth-wired)
- `reports/bugs/BUG-LOC-NTS-001.json` / `BUG-LOC-NTS-002.json` / `BUG-LOC-NTS-003.json`

**Browser tool announcement**: **CLI HEADED** for subagent B. Reason: `/rca` context (`.claude/rules/browser-tool.md` Gate 2 row "RCA context") — no exception. Mama uses no browser; subagent A is artifact-only (no browser); subagent B uses `playwright-cli open --persistent --profile=.auth/e2e-profile`.

---

## Phase 0 — Clean + run fresh (LR-024)

**[IDENTITY: OWNER / mama]**

1. **Clean artifacts** — from `clients/encore/`: `npm run clean` (removes `reports/test-results`, `reports/diagnostics`, `reports/failure-summary.json`, etc.). Per LR-024: never diagnose from stale data.
2. **Run notes specs fresh** — from `clients/encore/`:
   ```
   npx playwright test tests/locations/location-notes.spec.ts tests/locations/location-management-history.spec.ts --project=encore-locations --workers=2
   ```
   Per LR-018: run all together first to identify failures. `fullyParallel: false` per spec preserves LR-019 baseline order.
3. **Capture exit code + failing TC IDs** from `reports/test-results.json` + `reports/failure-summary.json`.
4. **If failures exist** → proceed to Phase 1. **If green** → user-feedback row in chat; ask whether the failure was transient or whether they meant a different spec.

Acceptance: `reports/failure-summary.json` exists (failures) OR run exits 0 (green — RCA terminates with surprise-result chat).

---

## Phase 1 — Phase 0 artifact collection (per /rca SKILL.md Phase 0)

**[IDENTITY: OWNER / mama]**

For each failing TC (worst case = all 58, expected case = small subset):

1. Read `reports/failure-summary.json` — extract `testName`, `failureCategory`, `selector`, `pageUrl`, `fullError` (≤500 chars), `consoleErrors`, `networkFailures`, `authChain`, `duration`, `lastActions`, `workerIndex`, `retryAttempt`.
2. Read `reports/test-results/{test-slug}-{browser}/error-context.md` — structured DOM analysis at failure moment.
3. View `reports/test-results/{test-slug}-{browser}/test-failed-1.png` — visual confirmation.
4. Read failing spec lines + page object method.
5. Route per failure category table in `/rca` SKILL.md.

**Decision branch**:
- 1 failing TC → spawn A + B once.
- 2–5 failing TCs → group by failure category; spawn A + B per group (parallel if 2 groups, sequential if 3+).
- 6+ failing TCs → likely systemic (auth chain broken, page object regression, env). Spawn A first on the systemic signal, then decide if B is needed.

---

## Phase 2 — Mama-led orchestration: spawn A + B (parallel, blind)

**[IDENTITY: OWNER / mama]**

Per `/rca` SKILL.md Mama-Led Orchestration section. **Both subagents inherit Opus 4.7 xhi.**

**Subagent A (artifact forensics)** — Agent tool, `general-purpose` subagent_type, NO browser tools used:
- Goal: characterize the failure envelope from artifacts alone. Re-read failure-summary.json, error-context.md, trace.zip (`npx playwright show-trace`), failing spec line, page object method, and any prior test in the serial block that touched the same surface.
- Output: structured JSON per `/rca` SKILL.md schema (`goalReceived`, `rootCauseTheory`, `classification`, `evidenceChain[]` with `source` = file path, `stepsToReproduce`, `variationsExplored` = `[]`, `workarounds`, `selfAssessment`, `blindSpots`).

**Subagent B (live HEADED CLI walk)** — Agent tool, `general-purpose` subagent_type, MUST use `playwright-cli` HEADED:
- Goal: walk the failing TC live against `cloudapps-e2e.encoreglobal.com`. Reproduce the recorded steps as the FLOOR; perturb to find the breakage envelope; hunt the workaround direction.
- Auth: try headless first using `.auth/encore-state.json`; on Entra redirect, switch to `playwright-cli open --persistent --profile=.auth/e2e-profile` per Gate 3 of `browser-tool.md`.
- Output: same JSON schema; `evidenceChain[].source` = live URL + DOM/network capture; `variationsExplored[]` MUST be non-empty (B's job is exploration); `workarounds[]` SHOULD be non-empty unless B genuinely tried obvious directions and none worked (must say so in `selfAssessment`).

Both subagents:
- Receive verbatim goal from mama (no synthesis).
- Are blind to each other — communicate ONLY through mama.
- Emit structured JSON; mama refuses incomplete outputs and re-spawns.

---

## Phase 3 — Mama judges + (re-spawn if shallow)

**[IDENTITY: OWNER / mama]**

Per `/rca` SKILL.md "Mama's judgment + audit trail":

1. Read both JSONs. Read `selfAssessment` FIRST to judge honesty.
2. Substance-gate B's `variationsExplored[]`: each entry needs surface, hypothesis written BEFORE running, change distinct from prior, outcome+evidence. Vague entries don't count.
3. **Verdict per subagent**:
   - HONEST + COMPLETE → accept; write audit note "Accepted: [agent] explored [X]; flagged [Y] not relevant because [Z]."
   - LAZY / SHALLOW / SKIPPED OBVIOUS BRANCHES → re-spawn with concrete missing directions. Write audit note "Re-spawned [agent]: '[verbatim missing-direction prompt]'."
4. **Compare accepted outputs**:
   - AGREE on classification + steps → proceed to Phase 4 evidence summary.
   - DISAGREE → interrogate each with the other's verbatim findings; force confrontation; surface hallucinations; continue until movement or plateau.

**Pre-cry-for-help self-check** (mandatory before any cry per `/rca` SKILL.md):
- (a) B judged honest in variation-space exploration? YES/NO.
- (b) A re-prompted with B's findings until no new movement? YES/NO.
- (c) Mama considered whether mama itself is the bias point? YES/NO.
- All three YES (with recorded reasoning in chat) → cry allowed.
- Any NO → re-spawn instead.

Cry format if used: `[CRY FOR HELP — RCA-NOTES-2026-05-21] What we saw: <1 sentence>. What we can't conclude: <1 sentence>. Ask: <≤3 yes/no OR ≤5 numbered steps>.` ≤200 words total. Banned phrases per `/rca` SKILL.md + LR-054 + ALL-077.

---

## Phase 4 — Evidence summary (mama composes)

**[IDENTITY: OWNER / mama]**

Mama writes per `/rca` SKILL.md Phase 6 template:

```
## RCA: TC-XXX (and / TC-YYY / TC-ZZZ if multiple)

### Classification
SELECTOR | TIMING | ASSERTION | DATA | APPLICATION | AUTH | NETWORK | INFRA | BLOCKING

### Evidence Chain
1. failure-summary.json: [field = value]
2. error-context.md: [element state]
3. screenshot: [observation]
4. trace.zip: [before/after diff]
5. spec code: [line N does X, expects Y]
6. live-walk: [URL clicked, DOM state, network observed, variations tried (count + 1-line each), workarounds found (count + steps)] — REQUIRED, populated from B's variationsExplored[] + workarounds[]. EMPTY = summary rejected, cycle back.

### IS / IS-NOT
| IS | IS-NOT | Delta |
|----|--------|-------|

### 5 Whys
1–5

### Root Cause
"The failure is caused by X because Y (evidence: Z)."

### Mama's judgment trail
[One line per subagent accept/reject + reason]
[One line per re-spawn + verbatim missing-direction prompt]

### Fix (proposed — REJECT-bucket-screened)
[Specific code change OR file-bug-and-skip OR no-action recommendation]
```

---

## Phase 5 — Fix proposal (REJECT-bucket-screened)

**[IDENTITY: OWNER]** (mama may propose; user approval required for substantive edits)

Per `/rca` SKILL.md REJECT bucket:

- **Class 1 (spec drift)**: no assertion weakening, no removed assertions, no selector loosening, no pre-mutating setup to dodge.
- **Class 2 (failed-experiment crud)**: no unused imports, no orphan helpers, no `// TODO`, no debug `console.log`, no defensive code paths "just in case."
- **Class 3 (standard hides)**: no `test.skip()` / `test.fixme()` without `BUG-LOC-NTS-NNN` cite (hook-enforced too); no `try/catch` swallowing the failing action; no timeout bumps > 2× without recorded justification; no retry loops in test code to mask a race; no hardcoded waits without DOM-state reason.

**Branches**:
- **APP bug (new, not BUG-LOC-NTS-001/002/003)** → file a bug report file (path does not resolve — file was never committed) per LR-034 protocol. Do NOT fix test code. Verify uniqueness via dedup grep against existing bug files.
- **APP bug (matches existing)** → verify via LR-044 protocol (`stepsToReproduceOriginal` capture, append to `verificationLog`). Confirm workaround in spec is still effective; if not, propose workaround upgrade.
- **Test-code bug** → propose minimal edit. Surface in chat with diff preview. Wait for user approval before Edit.
- **Env / auth / infra** → escalate, do not patch in code.

---

## Phase 6 — Verify fix (if landed)

**[IDENTITY: OWNER]**

1. Run ONLY the formerly-failing TC: `npx playwright test --grep "TC-XXX" --project=encore-locations`
2. PASS → run the affected describe block + adjacent serial block to check for regression.
3. FAIL same error → one more fix cycle (max 2 cycles per `/rca` Phase 7).
4. FAIL different error → mini Phase 0 (Steps 0.1–0.3).
5. Persistent failure after 2 cycles → `test.skip()` with `BUG-LOC-NTS-NNN` cite + documented RCA.

---

## Phase 7 — Close (LR-027 + LR-028)

**[IDENTITY: OWNER]**

1. Activity-log row at `clients/encore/specs_planning/_internal/agent-activity-log.md`: `| YYYY-MM-DDThh:mm | OWNER | done | <files touched> | RCA notes spec: <classification>, <fix outcome> |`.
2. Plan Status flip per LR-055 close-gate (will need override or full validator pass — handled at close time, not pre-emptively).
3. Move plan from `plans/pending/` to `plans/done/` via `git mv`; `npm run plans:reindex`; parent-cascade per LR-027.
4. `/final-q` session-end audit.

---

## Acceptance Criteria

- [ ] `reports/failure-summary.json` from Phase 0 fresh run is the source of truth (no stale-artifact diagnosis per LR-024).
- [ ] Both subagents (A + B) emitted structured JSON per `/rca` schema; B's `variationsExplored[]` non-empty unless honest no-perturbation-possible reason recorded.
- [ ] Mama's judgment trail recorded in chat (one line per subagent accept/reject + each re-spawn).
- [ ] Evidence Chain has all 6 slots populated, including `live-walk:` from B (or honest no-walk reason if all failures were AUTH/INFRA per the SKILL.md table).
- [ ] If APP bug → BUG file exists at `reports/bugs/BUG-LOC-NTS-NNN.json` per LR-034 schema OR existing BUG verificationLog appended per LR-044.
- [ ] If test-code fix → diff preview surfaced in chat, user approval received before Edit; REJECT bucket screening cited; post-fix verification ran (Phase 6).
- [ ] No `test.skip()` / `test.fixme()` lands without `BUG-LOC-NTS-NNN` cite (hook-enforced too).
- [ ] Cry-for-help (if used) ≤200 words, ≤3 yes/no or ≤5 steps, pre-cry self-check (a)(b)(c) recorded.

---

## Handoff

Outcome will be surfaced in chat as either (a) clean green run + clarifying question to user about which spec was meant, (b) root cause + fix proposal awaiting approval, (c) APP bug filed + spec skip proposal, or (d) cry-for-help with structured ask.

## Verification Artifact

Re-run this RCA against the same spec(s) at any time via:

```
# from clients/encore/
npm run clean
npx playwright test tests/locations/location-notes.spec.ts tests/locations/location-management-history.spec.ts --project=encore-locations --workers=2
# then read reports/failure-summary.json + reports/test-results/*/error-context.md
```

Expected (when this plan completes): either zero failures OR each failure has a citation in this plan's mama judgment trail + an entry in BUG-LOC-NTS-NNN.json verificationLog (existing or new).
