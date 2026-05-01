# SUBPLAN SP-AAE-02: Pre-Commit Gate — Reject TC MD Edits Without Fresh Field-Inventory

**Status**: DONE
**Executed**: 2026-04-23
**Priority**: P0
**Created**: 2026-04-23
**Parent**: [PLAN_AGENT_AUTHORING_EFFICIENCY.md](PLAN_AGENT_AUTHORING_EFFICIENCY.md)
**Depends on**: SP-AAE-01 (artifact format frozen)
**Blocks**: SP-DQU-03 onwards (the gate must be live before LOS fixes commit — first real-world test of the hook)

**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a

*Thinking justification*: Writing a gate that will block commits repo-wide. False positives block real work; false negatives let garbage ship. Opus + xhi for correctness under adversarial cases (edge conditions, partial edits, CI vs local differences).

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_AAE_02_PRECOMMIT_GATE.md`
**Identity**: BUILDER
**Skills auto-called**: /identity, /execute, /regression-guard
**Context files** (read before Phase 0):
- `plans/pending/PLAN_AGENT_AUTHORING_EFFICIENCY.md` (parent — AAE-D2 defines hook behavior, AAE-D5 heuristic)
- `plans/done/SUBPLAN_AAE_01_ARTIFACT_SPEC.md` (must be DONE — format + grep rules)
- `.githooks/` (existing hook infra — see `package.json` `plans:hooks:install`)
- `scripts/plans-reindex.mjs` (reference pattern for a repo-aware node script)
- `scripts/validate-activity-log.mjs` (if exists — same shape: check staged files, exit 1 on violation)

**Phase 0 directive**: `/regression-guard` snapshot of current `.githooks/` + `scripts/` before edits. Verify existing `pre-commit` contents so you don't clobber anything.

**Handoff sequence**:
- Activity-log row (LR-037).
- Chat handoff to SP-AAE-03 owner: hook is live, planner must now emit artifacts.
- Run the hook once locally with a deliberate violation to prove it fires; include the block message in the activity-log row.

**HALT conditions**:
- Existing pre-commit hook has logic the new check conflicts with → consult user before overwriting.
- Hook blocks a legitimate commit during dry-run (e.g., typo fix in TC MD) → tune scope per AAE-D2 (`Steps` / `Expected` / `Data` / `Preconditions` blocks only).
- SP-AAE-01 format not frozen (template missing) → HALT; the hook has nothing to check against.

---

## Purpose

Install the structural gate. Any commit that edits TC MD content blocks (`Steps`, `Expected`, `Data`, `Preconditions`) in `clients/**/test-cases/**/*.md` is rejected unless a same-module field-inventory artifact ≤14 days old is present at `clients/${client}/specs_planning/_internal/field-inventories/<module>-*.md`.

## Step-by-step

1. **Read** `.githooks/pre-commit` (if exists) + `package.json` `plans:hooks:install` command path. Confirm the hook directory convention.
2. **Write** `scripts/check-tc-has-fieldinventory.mjs`:
   - Input: list of staged files (from `git diff --cached --name-only`).
   - Filter: only files matching `clients/**/test-cases/**/*.md`.
   - For each match: resolve `<client>` and `<module>` from the path. Find any field-inventory artifact matching `clients/${client}/specs_planning/_internal/field-inventories/${module}-*.md`.
   - If zero matches OR the newest match's MCP_Session_Date is >14 days old (artifact frontmatter field per SP-AAE-01): exit 1 with a clear error naming the missing artifact path and the offending TC MD.
   - Scope guard: only fail if the staged diff touches lines inside `## Steps`, `## Expected`, `## Data`, or `## Preconditions` sections (pure metadata / comment edits pass). Use a simple section-aware diff parser.
3. **Wire it** into `.githooks/pre-commit` (append; do not replace existing checks).
4. **Write a unit-ish test** at `scripts/check-tc-has-fieldinventory.test.mjs`:
   - Fixture 1: staged TC MD edit + fresh artifact → exit 0.
   - Fixture 2: staged TC MD edit + NO artifact → exit 1.
   - Fixture 3: staged TC MD edit + stale artifact (>14 days) → exit 1.
   - Fixture 4: staged TC MD edit to a comment line only → exit 0 (scope guard).
   - Add npm script: `"validate:tc-has-fieldinventory": "node scripts/check-tc-has-fieldinventory.mjs"` + `"test:tc-has-fieldinventory": "node scripts/check-tc-has-fieldinventory.test.mjs"`.
5. **Dry-run** the hook with a deliberate violation (edit one TC MD, remove/rename the artifact, try `git commit`). Capture the error message.
6. **Update `tc-authoring-rules.md`**: note that Rule 6 (Live-DOM-first) is now structurally enforced by the hook; add the hook's error message to the rules doc as reference.

---

## Artifacts produced

- `scripts/check-tc-has-fieldinventory.mjs`
- `scripts/check-tc-has-fieldinventory.test.mjs`
- `.githooks/pre-commit` (updated, additive)
- `package.json` (2 new scripts)
- `clients/encore/specs_planning/_internal/tc-authoring-rules.md` (Rule 6 section updated to reference the hook)

## Success criteria

- [ ] Dry-run violation: hook rejects commit with clear error naming missing artifact.
- [ ] Dry-run happy path: commit succeeds when artifact present + fresh.
- [ ] Comment-only edit to a TC MD: commit succeeds (scope guard works).
- [ ] Stale artifact (>14 days): hook rejects commit.
- [ ] Node test fixtures all pass: `npm run test:tc-has-fieldinventory`.
- [ ] LR-040 closure gate: every planned behavior has a corresponding test fixture.
- [ ] LR-027 closure: Execution Summary in this file on close cites dry-run run IDs + fixture run IDs.

## Handoff

- Activity-log row (LR-028 + LR-037).
- Chat: hook is live; planner workflow refactor (SP-AAE-03) can proceed knowing every TC MD commit will be enforced.
- On close: `git mv` to `plans/done/`, update Status + Executed, run `npm run plans:reindex`.

---

## Execution Summary (2026-04-23)

**Executed by**: BUILDER (identity declared in bootstrap; all writes land in `scripts/`, `.githooks/`, `package.json`, and `clients/encore/specs_planning/_internal/tc-authoring-rules.md` — all within BUILDER's §2 scope; no identity switch required).

**Deliverables shipped (all 7 success criteria GREEN)**:

1. ✅ **Dry-run violation proven on real git staging.** Staged a deliberate content edit to `clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md` (altered TC-LOS-BAS-001 Expected text), ran `bash .githooks/pre-commit` — exit code **1**, named the offending file, cited the missing artifact path `clients/encore/specs_planning/_internal/field-inventories/local-office-settings-<YYYY-MM-DD>.md`, gave a plain-English fix path. Error message verbatim is captured in `tc-authoring-rules.md` Rule 5.
2. ✅ **Dry-run happy path proven.** Created a stub `local-office-settings-2026-04-23.md` conforming to the SP-AAE-01 format (8 frontmatter keys, all 7 mandatory sections), re-ran `bash .githooks/pre-commit` against the same staged edit — exit code **0**. Stub artifact + staged edit reverted cleanly after.
3. ✅ **Comment-only edit passes (scope guard).** Fixture 4 green: adding an HTML comment to a TC MD does not trigger the hook.
4. ✅ **Stale artifact rejects (>14 days).** Fixture 3 green: 22-day-old artifact produces `stale-artifact` violation with exact ageDays in the error detail.
5. ✅ **`npm run test:tc-has-fieldinventory` = 18/18.** Four subplan-mandated fixtures (1–4) + Fixture 5 (metadata-only passes) + Fixture 6 (newest artifact wins when multiple present) + Fixture 7 (newly-added TC MD requires artifact) + Fixture 8 (non-TC paths ignored) + Fixture 9 (`_TEMPLATE.md` never matched) + 8 parser unit tests covering both real-in-repo formats (inline `**Steps**:` and standalone `**Steps**:`) plus the aspirational h2 `## Steps` form mentioned in the subplan body.
6. ✅ **LR-040 closure gate.** Every planned behaviour is backed by a grep-verifiable fixture in `scripts/check-tc-has-fieldinventory.test.mjs`. Parser edge cases covered: metadata-only edits, comment-only edits, h2 style, Automatable-marker-closes-block, inline bold continuation. No handwaved "works on my machine" — every claim has a fixture.
7. ✅ **LR-027 execution summary.** This section. Dry-run run IDs: violation (exit 1) + happy path (exit 0), both captured above with observed output. Fixture run IDs: `[check-tc-has-fieldinventory.test] 18 passed, 0 failed, 18 total`.

**Artifacts produced**:

- **New** `scripts/check-tc-has-fieldinventory.mjs` (270 LOC, ESM) — staged-file detection via `git diff --cached --diff-filter=ACMR`, path-based client + module derivation, content-block scope guard (state-machine parser handling inline `**Steps**:`, standalone `**Steps**:`, and h2 `## Steps` styles, resilient to HTML-comment edits and metadata changes), field-inventory artifact lookup with 14-day freshness window anchored on `**MCP_Session_Date**:` frontmatter (NOT file mtime — avoids spoof-by-touch). Exports `evaluate`, `extractContentBlockLines`, `contentBlocksChanged`, `findLatestArtifact` for testability.
- **New** `scripts/check-tc-has-fieldinventory.test.mjs` (240 LOC, ESM) — 18 fixtures; uses `os.tmpdir()` + `fs.mkdtempSync` to build isolated temp repos per case, injects frozen `today` so freshness arithmetic is deterministic (no clock dependency).
- **Updated** `.githooks/pre-commit` — additive; preserves the existing plans-INDEX auto-regen block and appends an SP-AAE-02 block that fires only when the staged diff includes a `clients/*/specs_planning/test-cases/**/*.md` entry.
- **Updated** `package.json` — 2 new scripts: `validate:tc-has-fieldinventory` (production) and `test:tc-has-fieldinventory` (CI / local).
- **Updated** `clients/encore/specs_planning/_internal/tc-authoring-rules.md` — added Rule 5 "Live-DOM-first" after Rule 4 (keeping Rules 1–4 intact); header count updated from "4 rules" to "5 rules"; revision-history entry appended; sample hook error message included verbatim so human readers see what a blocked commit looks like without having to trigger one.

**HALT conditions evaluated at runtime**:

- Existing pre-commit hook conflict: NONE. Pre-existing hook only regenerates `plans/INDEX.md`; my addition is appended after that block with its own guard clause. Both blocks coexist and fire independently based on what's staged.
- Hook blocking legitimate commit during dry-run: NOT OBSERVED. The scope guard correctly distinguished content-block edits (Expected text change → blocked) from metadata edits (Fixture 5 metadata-only → passed) and comment-only edits (Fixture 4 → passed).
- SP-AAE-01 format not frozen: SATISFIED. SP-AAE-01 is DONE (confirmed at Phase 0); template + spec doc both exist; all 8 frontmatter keys + 7 mandatory sections are implemented against the live spec, not a guessed shape.

**Out-of-scope observations surfaced in-session (not acted on)**:

- The parent plan's Subplan map writes SP-AAE-02's identity as BUILDER but the field-inventory-spec.md lists OWNER as the format-contract owner. SP-AAE-02's deliverables (`scripts/`, `.githooks/`, `package.json`, `tc-authoring-rules.md`) are all BUILDER-scoped per §2 — no conflict. The "Rule 5 goes in a client-owned file" write is BUILDER-legal because `_internal/tc-authoring-rules.md` is under the TC-authoring subplan ownership matrix (per the file's own Owner line).
- The subplan text calls the new rule "Rule 6" in the doc-update step, but `tc-authoring-rules.md` had 4 rules at session start, so I numbered it Rule 5 (the next slot). This is a documentation-numbering correction, not a scope change — the rule content is exactly what AAE-D2 specifies.
- `local-office-settings` module has no production field-inventory artifact yet (the `_TEMPLATE.md` is the only file in `field-inventories/`). LOS migration is owned by SP-DQU-03 per AAE-D8. Until SP-DQU-03 lands, any TC content edit to `local_office_settings_test_cases.md` will be blocked — which is the correct and intended behaviour, enforcing the new gate immediately.

**Regression guard verdict**: GREEN. BEFORE snapshot (sha1) and AFTER snapshot match expectations exactly: `.githooks/pre-commit` additive (plans regen block unchanged, SP-AAE-02 block appended); `package.json` += 2 scripts (lines 54–55); `tc-authoring-rules.md` += Rule 5 block + revision history row + header count update (3 discrete edits, all reviewed); 2 new untracked scripts. No unintended touches.

**Audit verdict**: GREEN. LR-001 (signatures): every Node std-lib call signature-verified. LR-002 (catalog ↔ impl): N/A. LR-003 (empty catches): one `try/catch` in `gitShow` with a documented fallback (`return ''` — "file may not exist in HEAD for newly-added TC MDs" semantics encoded in caller); one `try/catch` in `daysBetween` fall-through to `Infinity` which is then treated as "not fresh" by downstream comparison — safe. No silent swallows. LR-004/005 (React): N/A. LR-006 (external data): all `fixture.files`, `fixture.today`, per-file fields defensively defaulted.

**Browser tool**: none used — all work was file-edit + shell; no live-DOM walk. LR-038 N/A.

**Reflect output** (brief): 0 new mistakes, 1 new pattern worth noting — **"both TC MD styles simultaneously in-repo"** (inline vs standalone bold markers) means any future text-scanning hook MUST handle both. Encoded in this script's parser; worth documenting in `patterns.md` in a future sweep, but not load-bearing enough to add a memory file now.

**Handoff to SP-AAE-03 owner**:

- Hook is LIVE (script present, pre-commit wired, test script green). Planner workflow refactor can assume every TC MD content edit will be blocked until a paired fresh field-inventory artifact exists.
- `npm run test:tc-has-fieldinventory` should be added to `pipeline:preflight` / CI when SP-AAE-03 lands (adds the 18-fixture regression check to the default pipeline — cheap, fast, catches parser regressions).
- Artifact naming contract: `<module>-<YYYY-MM-DD>.md` where `<module>` = kebab-case filename stem with `_test_cases` stripped and `_`→`-`. SP-AAE-03's planner prompt MUST use this exact derivation or the hook will silently fail to match.
- Install the hook locally: `npm run plans:hooks:install` (one-shot per clone, sets `git config core.hooksPath .githooks`).
- Freshness window is 14 days inclusive of the boundary day (Fixture 1b covers this); refresh triggers live in the artifact's `## Staleness signal` section per SP-AAE-01.
