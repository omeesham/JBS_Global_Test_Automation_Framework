> 🤖 **SESSION BOOTSTRAP — invoke with `/execute PLAN_BASELINE_ENFORCEMENT_HARDGATE.md`. All context below. Zero additional prompting needed.**
>
> 1. **Identity**: OWNER throughout (framework scripts + guardrail config — no pipeline-role artifacts are written).
> 2. **Skills**: `/delegation-temp on` at session start AND after EVERY compaction (its documented limit #1). `/regression-guard` before+after the wiring phase. `/final-q` before exit.
> 3. **Model + thinking + permission-mode**: read the frontmatter fields below (LR-041).
> 4. **Dependency gate**: Depends-on is `none`.
> 5. **Context load**: read this plan in full + every file in §Context-files. Missing context file = HALT.
> 6. **Browser tool**: `none` — this plan never opens a browser. Gate trip-tests run against FIXTURE files, never against the live app.
> 7. **Delegation-first is LAW**: decompose → ticket → dispatch → judge. Worker seats per the executing session's seat policy. Dispatch → END TURN (zero-burn). Never self-rescue a stalled worker.
> 8. **Execute Phases 0 → 5 in order.** Phase 5 (DENY promotion) has its own hard criteria — do not promote early.
> 9. **Handoff**: LR-027 Execution Summary in this file FIRST, then closure-gate dry-run, Status flip + Executed date, activity-log row (LR-028), `git mv` to plans/done/, `npm run plans:reindex`, `/final-q`.
> 10. **Gate-file protection**: `scripts/check-per-test-baseline.mjs` and siblings are protected gate files — Bash commands targeting them are denied by the A5 self-protection hook. Read them with the Read tool; edit them with Edit/Write. Worker tickets that must RUN them do so via `npm run check:per-test-baseline` (the package-script indirection is the sanctioned run path).
>
> **HALT + ASK RUTVIK** if: the rewired gate fires on a spec the reconciled census marks compliant (false-fire = design defect, not a spec defect) / Phase 0 registry-vs-census reconciliation can't be settled from artifacts (2 disputed specs, see Phase 0) / any LR-046 strict-line vs live-state mismatch / scope creep beyond the two gates.

---

# PLAN_BASELINE_ENFORCEMENT_HARDGATE — rewire the convicted LR-019 gate family + machine-enforce defect-annotation freshness

**Status**: PENDING
**Priority**: P0
**Created**: 2026-08-14
**Identity**: OWNER
**Depends on**: none
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: none
**Author**: Rutvik (via Claude Opus 5, session 295b447f — plan-only mandate: Rutvik executes in a new session)
**ActiveClient**: encore

---

## Why this plan exists (evidence, not vibes — all from 2026-08-14)

1. **A machine gate was green while the failure it guards happened.** LR-019 (`.claude/rules/specs.md`)
   requires per-test baseline enforcement, and `scripts/check-per-test-baseline.mjs` has enforced it at
   pre-commit (`.githooks/pre-commit:134`, blocking) since 2026-07-01. Both NM-3344 Service Charge specs
   are in its ENFORCED registry (`check-per-test-baseline.mjs:107-113`) — declared mechanism
   `fresh-open`, which credits a bare `goto()` in `beforeEach` (`:134` regex). A page reload restores
   NOTHING on the server. The shared e2e data drifted (our own runs left `30.00`/`35.00`/`45.00` behind
   on rows tests hardcoded) and two tests began failing on data their own siblings had poisoned — with
   the gate passing throughout. Root-cause chain: `clients/encore/reports/rca-nm3344-0814/r3-seatA/RESULT.md`
   (mechanism), `r3-seatB/RESULT.md` (live proof of the Save-enable rule), owner's manual replication at
   `clients/encore/specs_planning/_internal/ground-truth-service-charge-manual-2026-08-14.md`.
2. **The failure class is repo-wide, measured.** Two blind census seats + a mechanical diff + CEO
   adjudication produced: **33 spec files; ~5 with fragile per-test-only restores; 11 fully
   conventional; 9 read-only** (artifacts: `clients/encore/reports/gate-census-0814/seatA/RESULT.md`,
   `seatB/RESULT.md`, `diff/RESULT.md`). The census initially called 5 specs zero-enforcement; a
   2026-08-14 confirm seat re-read the disputed 2 against disk and ruled the GATE REGISTRY right on
   both (`location-notes.spec.ts:639-650` has `ensureEmptyState` in `beforeEach`;
   `location-shared-setup-locations.spec.ts:477-495` has `ensureCleanSSLTable` — verdicts in
   `clients/encore/reports/plan-fight-0814/confirm/RESULT.md`). The real zero-enforcement debt is the
   gate's own 3 WAIVED entries (`local-office-ect`, `local-office-settings`,
   `location-local-information` — parked on the FCC backlog since 2026-07-01, never burned down).
3. **Stale defect annotations rot in days, not months.** Three "known defects" recorded 2026-08-10/11
   (NM-3300 heading, NM-3285 modal absent, Modified-By GUIDs) were all FALSE by 2026-08-14 — the app
   had moved. Tests were failing as "evidence vehicles" for defects that no longer existed.
4. **Blind restores are the drift engine.** Restores that `clickSave()` without waiting for Save to be
   active silently no-op and leave test values persisted (proven for BAS-004/BAS-020 pre-remediation in
   `r3-seatA/RESULT.md`). No gate in the family catches this class today.

## §Prior-Fix Trial (LR-069 §3.5 — MANDATORY, verdicts recorded 2026-08-14 with disk evidence)

The failing area carries THREE prior "permanent" fixes. Each was put on trial before this plan was
allowed to propose anything. Layering a new gate over an unconvicted prior fix is FORBIDDEN — this
section is why Gate A below is a REWIRE, not a new script.

| Prior fix | What it does to prevent the class | Why it failed to prevent THIS instance | Verdict |
|---|---|---|---|
| `scripts/check-per-test-baseline.mjs` (LR-019, pre-commit blocking since 2026-07-01) | Registry of WAIVED/ENFORCED specs; verifies each ENFORCED describe carries its declared mechanism (`beforeEach-reset` \| `fcc` \| `fresh-open`); glob-WARNs unregistered save-capable describes | **`scoped-wrong`**: `fresh-open` (`:134`) credits page NAVIGATION as a baseline — it verifies the page reloads, not that server data returns to baseline. Both SC specs declared `fresh-open` and mutate the server (`:107-113`). Secondary: the glob pass is WARN-only (`:261`, non-blocking) and the WAIVED list is a parking lot with no burn-down force (3 entries untouched since 2026-07-01). | **CONVICTED** — rewire in this plan (Phase 1) |
| `scripts/check-weak-reset.mjs` (companion: does the reset ACT) | Verifies a declared reset action actually operates on the page | Same blindness inherited: classifies `fresh-open` as a valid reset class (`:94` "fresh page each test") — page-level, not data-level | **CONVICTED** — rewire in this plan (Phase 1, same change) |
| `scripts/check-save-honesty.mjs` CHECK 2 RESTORE-NO-VERIFY | A page-object method NAMED `restore*/reset*/revert*/cleanup*/ensureDefault*…` that saves without verifying = FAIL | **`different-sub-class`**: it guards restores that EXIST as named methods. At incident time the SC page object had NO restore method, and the blind restores sat inline in spec bodies (BAS-004/BAS-020) — outside its name-anchored scope. (The 2026-08-14 remediation since added a verified `ensureDefaultState` at `service-charge.page.ts:322`, which IS inside CHECK 2 scope — the historical gap was the inline class.) | **SURVIVES** — kept as-is; the inline blind-restore class gets its own CHECK 3 (Phase 2a), extending this gate, not duplicating it |

Rewire disposition per §3.5: the CONVICTED pair is upgraded IN THE SAME CHANGE — never left as
sediment, never given a parallel sibling. Gate B (annotation freshness) has NO prior fix covering its
class (`check-todo-injection.mjs` covers skip/fixme-without-BUG at edit time — a different invariant),
so it legitimately lands as a new script.

## What this plan builds

Two enforcement upgrades + one new gate, all LR-069-governed (severity rubric, announce-first ramp,
bloat governor, fire telemetry), all anchored to code shapes — never to prose a description could trigger.

### Gate A — REWIRE `scripts/check-per-test-baseline.mjs` (+ align `check-weak-reset.mjs`)

**Invariant**: a describe that persists changes to the shared app must enforce a per-test baseline
via a mechanism that restores DATA, not merely the page.

The existing gate's architecture is kept — registry-driven, describe-scoped, helper-name recognizers
(`REAL_SAVE_HELPERS` at `:117-124` already detects save-capability from spec text regardless of
import path, so no import-graph/fixture-resolution machinery is needed; specs importing via
`src/fixtures/pages.fixture` are covered as-is). Five changes:

1. **Mutation-aware mechanism validity.** Registry rows gain `mutates: true|false`, seeded from the
   reconciled census (Phase 0). For a `mutates: true` describe, `fresh-open` is NO LONGER a valid
   declared mechanism — page reload ≠ data restore. Valid mechanisms for mutating describes:
   `beforeEach-reset` or `fcc`. `fresh-open` stays valid for non-mutating describes (navigation IS a
   complete baseline when nothing persists). This single rule would have FAILed both SC specs before
   the 2026-08-14 remediation — the exact escape this plan closes. (No new mechanism is added: the
   remediated SC Basic shape IS `beforeEach-reset` — see change 2. A future legitimate shape outside
   the recognized three routes through the Phase 0 NEW-SHAPE protocol, never an allowlist.)
2. **SC registry rows re-declared to match disk.**
   `service-charge-basic-information` → `beforeEach-reset`, `mutates: true` (its `beforeEach` awaits
   the verified `ensureDefaultState` — `service-charge-basic-information.spec.ts:47-51`,
   `service-charge.page.ts:322`). `service-charge-history` → `mutates: true` but its `beforeEach` is
   `goto`-only (`service-charge-history.spec.ts:27-31`) while one test (TC-SVC-HIS-013) really saves
   with an in-test finally-restore (`:317-321`) — no recognized mechanism fits, so History moves to
   the WAIVED debt list (`since: 2026-08-14`, reason: burn-down ticket wires `ensureDefaultState`
   into its `beforeEach` and removes the waiver — Phase 4). Honest debt beats a mislabeled mechanism.
3. **WAIVED becomes a debt ratchet instead of a parking lot.** Rules: (a) WAIVED entries carry
   `since: YYYY-MM-DD`; (b) a commit that EDITS a WAIVED spec's save-capable describe FAILs unless the
   edit brings compliance (touch-it-fix-it); (c) the WAIVED list only ever shrinks — a commit growing
   it FAILs; (d) stale entries already FAIL today (`:214` spec-not-found), which also structurally
   handles renames — a renamed spec breaks its registry row loudly, so there is no silent
   rename-escape from debt.
4. **Glob pass ramps from WARN to blocking.** The unregistered-save-capable pass (`:250-263`) keeps
   exit-0 WARN in announce mode and becomes a FAIL at DENY promotion (Phase 5). This is the literal
   "soft gate" the owner named — it graduates to a hard one on the LR-069 ramp.
5. **Fire telemetry.** The gate is DARK today (no `fireTelemetry` — the LR-069 §3.4 table's known
   gap class). Wire `fireTelemetry('per-test-baseline', verdict, target)` on every FAIL/WARN per
   `.claude/hooks/lib/hook-utils.mjs:102`, so Phase 5 promotion and future demotion reviews run on
   real signal.

`check-weak-reset.mjs` gets the matching one-line alignment: `fresh-open` classification (`:94`) is
only credited for describes whose registry row is `mutates: false` (it reads the same registry).

### Gate A2 — extend `scripts/check-save-honesty.mjs` with CHECK 3: BLIND-RESTORE (spec-side, restore contexts only)

**Invariant**: a save used as a RESTORE must be a verified save. Scope is restore contexts ONLY —
`finally { … }`, `catch { … }`, and `afterEach` bodies inside `clients/*/tests/**/*.spec.ts` — NOT
ordinary test-body saves: a mutate→save in a test's main path is the behavior under test and its own
assertions catch a no-op (e.g. `service-charge-history.spec.ts:319-322`, the legitimate TC-SVC-HIS-013
mutate+save that must NOT trip). Anchor within a restore context: a `REAL_SAVE_HELPERS` call preceded
in the same block by a mutating page-object await (`set*/fill*/toggle*/select*`) with NO
`waitForSaveActive(`/`waitForSave*(` await between them, and no `ensureDefault*`/`saveAndVerifyPersisted`
in the block. Fixtures pin both bounds: the pre-remediation BAS-004 finally-restore shape trips; a
finally-restore via `ensureDefaultState` passes; the HIS-013 try-block mutate+save passes; an
assert-only `clickSave` passes. Live-fire on the current tree: any hit is ADJUDICATED (not
auto-remediated) — a confirmed genuine blind restore becomes recorded remediation scope in this
phase's Deviations entry. CHECK 3 lands in announce mode on the same ramp knob as Gate A (one class,
one ramp).

### Gate B — NEW `scripts/check-defect-annotations.mjs`

**Invariant**: every "known defect" claim in specs or test-case docs is ticketed and fresh.

- **Anchors** (emitter-exact): spec side `annotations.push({ type: 'known-defect'` and quote-variant
  forms (`"known-defect"`, backtick) — count on the CURRENT tree is expected ≈0 after the 2026-08-14
  cleanse (the only `type:`-annotation live today is `type: 'restore'` at
  `corporate-pricing-loc-import.spec.ts:52`, which must NOT match). Doc side: lines beginning
  `**Known defect**:` in `clients/*/specs_planning/test-cases/**/*.md`. **Phase 0 counts both
  populations on the real tree and records the numbers in this plan — backfill scope (Phase 2b) is
  derived from that count, never assumed.**
- **Required fields on every match**: a ticket ID (`NM-\d+` or `BUG-[A-Z]+-\d+`) AND a
  `verified: YYYY-MM-DD` stamp. Missing either → FAIL (after ramp).
- **Freshness**: `verified` older than **14 days** → STALE warning; STALE on a file edited in the
  commit → FAIL. Floor justification (measured, not invented): the three false annotations above went
  true→false in ≤3 days against a fast-moving e2e build; 14 days = ×4 the observed rot interval,
  revisitable from telemetry after a month of firing.
- Backfill stamps use dates already recorded in the dated walk/baseline artifacts — never invented dates.

## What this plan deliberately does NOT do (bloat governor, LR-069)

- No new parallel baseline gate — the convicted family is rewired in place (§Prior-Fix Trial).
- No import-graph resolver / persisting-methods registry — the existing helper-name recognizer is
  import-path-agnostic and proven; adding an import graph is complexity without a failure it prevents.
- No generic "spec quality" AI reviewer, no NLP heuristics, no style rules — two invariants only.
- No retroactive mass-fix of the debt specs inside this plan (Phase 4 files ONE burn-down ticket per
  spec as separate follow-ups; the ratchet makes them converge naturally).
- No changes to `delegation-gate` / hooks in `~/.claude/` — repo-side `scripts/check-*` only.
- No new abstractions in test code; the gates read, they never rewrite.

## Phases

### Phase 0 — Ratify + reconcile inputs (1 hr)
- [ ] Read the three census artifacts + §Why evidence paths + §Prior-Fix Trial cites; confirm all
      exist on disk (C3 discipline).
- [ ] Regenerate the denominator (`git ls-files 'clients/*/tests/**/*.spec.ts'`) and diff against the
      census's 33 — drift means the census is stale: HALT and re-run the census seats before building
      (LR-062: the denominator is machine-owned and current, never inherited).
- [ ] **Re-verify the 2 formerly-disputed specs** (`location-notes.spec.ts`,
      `location-shared-setup-locations.spec.ts`): the 2026-08-14 confirm seat already ruled the gate
      registry RIGHT on both (`ensureEmptyState` at `location-notes.spec.ts:639-650`;
      `ensureCleanSSLTable` at `location-shared-setup-locations.spec.ts:477-495` — verdicts in
      `clients/encore/reports/plan-fight-0814/confirm/RESULT.md`). This step only confirms those two
      cites still hold on the current tree; drift → HALT + ask Rutvik (bootstrap HALT list). The
      reconciled census seeds every `mutates:` flag in Phase 1.
- [ ] **Count Gate B's real populations**: grep the tree for both anchor families (spec-side variants,
      doc-side `**Known defect**:`); record counts here. These numbers ARE Phase 2b's backfill scope.
- [ ] **NEW-SHAPE protocol check**: if reconciliation surfaces a legitimate baseline mechanism outside
      the recognized three (`beforeEach-reset`, `fcc`, `fresh-open`), do NOT shoehorn or allowlist it
      silently — record it as a NEW-SHAPE finding naming the file, amend this plan's mechanism list,
      and add a recognizer + fixture for it in Phase 1. Unrecognized-but-legit shapes are plan
      amendments, never rubber stamps. (Known candidate class: TC-SVC-HIS-013's in-test
      baseline-read + finally-restore — deliberately NOT recognized as a mechanism; that spec goes to
      WAIVED debt instead, Gate A change 2.)

### Phase 1 — Gate A rewire (half day)
- [ ] Implement changes 1–5 on `check-per-test-baseline.mjs` + the `check-weak-reset.mjs` alignment
      (Edit tool — bootstrap note 10). Registry rows updated: SC Basic → `beforeEach-reset`,
      `mutates: true`; SC History → WAIVED (`since: 2026-08-14`, burn-down reason); every row gains
      `mutates:` from the reconciled census; existing WAIVED rows gain `since: 2026-07-01`.
- [ ] Extend `check-per-test-baseline.test.mjs` (house pattern: same file, exported-function unit
      cases + synthetic fixture specs under `scripts/test-fixtures/` for file-level verdicts — follow
      the existing test's own conventions plus the `check-tc-has-fieldinventory` fixture-dir precedent).
      New cases: mutating+fresh-open→FAIL · mutating+beforeEach-reset→PASS ·
      non-mutating+fresh-open→PASS · WAIVED-edited-without-compliance→FAIL · WAIVED-grown→FAIL ·
      renamed-spec→FAIL (stale row) · glob-unregistered→WARN(announce). All green.
- [ ] **Live-fire proof (HARD-classification requirement)**: run via `npm run check:per-test-baseline`
      against the real tree — expected: 4 WAIVED debt warns (3 legacy + SC History), SC Basic PASS via
      `beforeEach-reset`, 0 FAIL, exit 0 in announce mode. Any FAIL on a reconciled-compliant spec =
      false-fire = HALT + fix the gate, never the spec.

### Phase 2a — CHECK 3 BLIND-RESTORE (2 hrs)
- [ ] Extend `check-save-honesty.mjs` with CHECK 3 per the design above + the four fixture bounds
      (finally-restore blind → trips; finally via `ensureDefaultState` → passes; HIS-013 try-block
      mutate+save → passes; assert-only save → passes).
- [ ] Live-fire on the current tree: 0 FAIL expected (the two proven sites were remediated
      2026-08-14); any hit is adjudicated per the Gate A2 design — a confirmed genuine blind restore
      is recorded remediation scope in the Deviations log, a false fire is a gate fix.

### Phase 2b — Gate B (half day)
- [ ] Build `check-defect-annotations.mjs` per the design above (anchor variants included;
      `type: 'restore'` fixture proves the non-match).
- [ ] Backfill ticket IDs + `verified:` stamps on every match found by Phase 0's count, dates sourced
      from the dated artifacts (each backfill cites its source line in the commit body).
- [ ] Fixtures + test file (missing-ticket, missing-date, stale-edited, fresh-pass, restore-annotation
      non-match). All green. Live-fire: 0 FAIL after backfill.

### Phase 3 — Wiring + ramp state, ANNOUNCE mode (2 hrs)
- [ ] `/regression-guard` snapshot.
- [ ] `package.json`: add `check:defect-annotations`; `check:per-test-baseline` already exists (`:118`).
      Pre-commit already runs the baseline gate (`.githooks/pre-commit:134`) — it inherits the rewire
      with zero wiring change; add Gate B to the same battery in ANNOUNCE mode.
- [ ] Ramp state per LR-069 §3.3, exact keys in `.claude/guardrail-config.json` following the house
      prefixed shape (measured on the live file — every knob uses `<gate>_mode` +
      `<gate>_ramp_started` + DATE-valued `<gate>_ramp_target` + `<gate>_ramp_complete` +
      criterion text in `<gate>_ramp_note`, e.g. `depth_gate_*` at `.claude/guardrail-config.json:38-43`):
      `per_test_baseline_mode: "announce"`, `per_test_baseline_ramp_started`, date-valued
      `per_test_baseline_ramp_target` (+30 days), `per_test_baseline_ramp_complete: false`,
      `per_test_baseline_ramp_note` (the Phase 5 criteria verbatim) — and the same five
      `defect_gate_*` keys. Plus `_comment` provenance keys naming Sev + graduating incident, matching
      the file's convention. Sev class: S1 both (silent quality drift surviving to commit) —
      announce-first is mandatory, not softness; §3.3 forbids straight-to-deny for S1.
- [ ] `/regression-guard` diff — zero unrelated changes.

### Phase 4 — Debt burn-down handoff (1 hr, authoring only)
- [ ] File one follow-up ticket per WAIVED debt entry — 4 total: the 3 legacy waivers
      (`local-office-ect`, `local-office-settings`, `location-local-information`) + SC History (added
      by this plan's rewire). Each ticket specifies the conventional `ensureDefaultState` wiring for
      that module's `beforeEach` (reference implementations: `corporate-override.page.ts:430`,
      `location-pricing.page.ts:552`; SC History reuses the existing verified
      `service-charge.page.ts:322` restore) + registry row flip to `beforeEach-reset` + waiver
      removal, citing the census row. These are SEPARATE executions — not this plan's scope.

### Phase 5 — DENY promotion (gated on telemetry, days later — may be a separate session)
- [ ] Promotion criteria (ALL required): ≥10 real commits passed through ANNOUNCE mode · zero
      false-fires in `.claude/state/gate-fires.log` · debt list shrank or held (never grew) ·
      **≥1 recorded live trip of each FAIL class, demonstrated on a fixture branch** (a gate that has
      never been seen to fire is not promotable — a signal that never varies is not a signal).
- [ ] Flip both knobs to `deny` (`ramp_complete: true`, `ramp_flipped` date). Glob pass becomes FAIL
      (Gate A change 4).
- [ ] Record the LR-069 severity-rubric rows (S1, blocking, live-fired, evidence paths) in
      `.claude/rules/guardrail-policy.md` per its numbering discipline; update LR-019 in
      `.claude/rules/specs.md` to state its enforcement is now mutation-aware.

## §Context-files (read all before Phase 0)
- `clients/encore/reports/gate-census-0814/seatA/RESULT.md` · `seatB/RESULT.md` · `diff/RESULT.md`
- `clients/encore/reports/rca-nm3344-0814/r3-seatA/RESULT.md` · `r3-seatB/RESULT.md`
- `clients/encore/specs_planning/_internal/ground-truth-service-charge-manual-2026-08-14.md`
- `scripts/check-per-test-baseline.mjs` + `.test.mjs` (the convicted gate being rewired — Read tool only)
- `scripts/check-weak-reset.mjs` · `scripts/check-save-honesty.mjs` (family siblings)
- `.claude/rules/specs.md` (LR-019) · `.claude/rules/guardrail-policy.md` (LR-069, LR-074)
- `scripts/check-tc-has-fieldinventory.mjs` + its `.test.mjs` (house pattern for gate + fixture tests)

## §Delegation Contract
- CEO decomposes/tickets/judges; workers build scripts, fixtures, backfills, and run verifications.
- Every dispatch: preflight → envelope → `--work-type` → 2× credit sizing → tee'd VERIFY artifacts →
  cross-family review before accept. Machine facts only (verify-run verdict, exit codes) — never
  report prose.
- Gate scripts are guardrail-path work (`scripts/check-*`): LR-069 + LR-074 apply to every edit; the
  A5 self-protection denies Bash against gate files (bootstrap note 10 gives the sanctioned paths).

## §Verification Artifact (D23 — runnable checks for the executing session)
```bash
# Gate A rewired suite green (unit + fixture verdicts exact):
node scripts/check-per-test-baseline.test.mjs      # expect: exit 0
# Gate A live-fire, announce mode (via the sanctioned npm path):
npm run check:per-test-baseline                    # expect: WAIVED debt warns, 0 FAIL, exit 0
# CHECK 3 + Gate B suites green:
node scripts/check-save-honesty.test.mjs           # expect: exit 0 (if suite exists; else gate self-run)
node scripts/check-defect-annotations.test.mjs     # expect: exit 0
# Gate B live-fire after backfill:
node scripts/check-defect-annotations.mjs          # expect: 0 FAIL, exit 0
# Wiring + ramp state present (house prefixed key shape):
grep -E "check:(per-test-baseline|defect-annotations)" package.json        # expect: 2 hits
grep -cE "per_test_baseline_(mode|ramp_started|ramp_target|ramp_complete|ramp_note)|defect_gate_(mode|ramp_started|ramp_target|ramp_complete|ramp_note)" .claude/guardrail-config.json  # expect: 10
```

## §Per-Identity Satisfaction (LR-048 v3)
| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| OWNER | `scripts/check-per-test-baseline.mjs` (rewire) + `.test.mjs` | `scripts/check-per-test-baseline.mjs`<br>`scripts/check-per-test-baseline.test.mjs` | `node scripts/check-per-test-baseline.test.mjs` exit 0 |
| OWNER | `scripts/check-weak-reset.mjs` (alignment) | `scripts/check-weak-reset.mjs` | `node scripts/check-weak-reset.mjs` exit 0 on current tree |
| OWNER | `scripts/check-save-honesty.mjs` (CHECK 3) | `scripts/check-save-honesty.mjs` | gate live-fire exit 0 on current tree |
| OWNER | `scripts/check-defect-annotations.mjs` (new) + test + fixtures | `scripts/check-defect-annotations.mjs`<br>`scripts/check-defect-annotations.test.mjs` | `node scripts/check-defect-annotations.test.mjs` exit 0 |
| OWNER | `package.json` + `.claude/guardrail-config.json` wiring | `package.json`<br>`.claude/guardrail-config.json` | the two `grep` lines in §Verification Artifact, 2 hits each |
| HUNTER / GIVER / BUILDER / HEALER / WATCHDOG / GARDENER | (none) | (none) | (none — framework-gate scope only; no pipeline artifacts written) |

## Deviations log
(append during execution per feedback_plan_deviations_log; Phase 0 reconciliation verdicts land here)
