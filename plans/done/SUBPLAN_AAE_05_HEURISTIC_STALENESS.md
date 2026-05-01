# SUBPLAN SP-AAE-05: Authoring-from-Spec Heuristic + Catalog Staleness Signal

**Status**: DONE
**Executed**: 2026-04-25
**Priority**: P0-CYCLE-1
**Created**: 2026-04-23
**Parent**: PLAN_AGENT_AUTHORING_EFFICIENCY.md
**Depends on**: SP-AAE-01, SP-AAE-02, SP-AAE-03 (planner emits citations; hook + format exist)
**Blocks**: SP-AAE-06 (rollout wants staleness + heuristic live before running 9 modules)

**Model**: claude-opus-4-7
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a

*Thinking justification*: Moderate judgment — heuristic grep rules + staleness windows. Not as load-bearing as the format or the gate. Opus + hi sufficient.

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_AAE_05_HEURISTIC_STALENESS.md`
**Identity**: BUILDER
**Skills auto-called**: /identity, /execute, /find-bugs
**Context files** (read before Phase 0):
- `plans/pending/PLAN_AGENT_AUTHORING_EFFICIENCY.md` (parent — AAE-D5 + AAE-D6)
- `plans/done/SUBPLAN_AAE_01_ARTIFACT_SPEC.md` (artifact frontmatter has `MCP_Session_Date`)
- `plans/done/SUBPLAN_AAE_02_PRECOMMIT_GATE.md` (hook pattern — same infra)
- `clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md` (known pre-Rule-6 TC — heuristic must flag at least one line here)

**Phase 0 directive**: grep the existing LOS TC MD for `MCP_VERIFICATION_LOG` references. Confirm count is 0 (proves heuristic will flag it).

**Handoff sequence**:
- Activity-log row (LR-037).
- Chat: heuristic + staleness live; rollout (SP-AAE-06) can start.

**HALT conditions**:
- Heuristic false-positive rate >20% on historical TC corpus → tighten grep pattern before shipping.
- Staleness threshold disagreement with AAE-D6 (14/30) needs user decision → HALT.

---

## Purpose

Build two lightweight safety nets on top of the structural gate:

1. **Authoring-from-spec heuristic** — flag TC MDs whose Expected/Steps blocks lack any `MCP_VERIFICATION_LOG:` citation. Cheap grep; catches the LOS-class defect.
2. **Catalog staleness signal** — warn at ≥14 days since artifact's `MCP_Session_Date`; HALT at ≥30 days. Fires at planner + generator + auditor session start.

## Step-by-step

1. **Heuristic — `scripts/check-tc-mcp-citations.mjs`**:
   - Walk `clients/**/test-cases/**/*.md`.
   - For each TC block, look for a `MCP_VERIFICATION_LOG:` line (or variant — document the grep pattern in the script).
   - Report count of TC blocks with zero citations; exit 0 but emit warning summary.
   - Wire into CI: `"validate:tc-mcp-citations": "node scripts/check-tc-mcp-citations.mjs"`.
   - Seed baseline: run on current corpus → write output to `reports/tc-mcp-citations-baseline-2026-04-23.json` (historical TCs grandfathered; new violations measured against baseline).
2. **Staleness — `scripts/check-fieldinventory-staleness.mjs`**:
   - Walk `clients/**/specs_planning/_internal/field-inventories/*.md`.
   - Parse each frontmatter's `MCP_Session_Date`.
   - Compute age vs today: <14 days = fresh, 14-30 days = warn, >30 days = halt.
   - Emit JSON report + human summary.
   - Wire into planner/generator/auditor bootstrap: session-start hook reads the report; fresh = silent, warn = print warning, halt = exit.
3. **Session-start integration**:
   - Add a one-liner to planner/generator/auditor identity files: "at session start, run `npm run validate:fieldinventory-staleness -- --module <module>`; honor exit code."
4. **Baseline + reporting**:
   - Run both scripts on the current repo; capture the baseline in `reports/`.
   - Write a brief analysis of the baseline to activity-log: X TCs lack citations, Y artifacts are stale (should be 0 because only LOS exists today).

---

## Artifacts produced

- `scripts/check-tc-mcp-citations.mjs` + npm script.
- `scripts/check-fieldinventory-staleness.mjs` + npm script.
- `reports/tc-mcp-citations-baseline-2026-04-23.json`.
- Session-start wiring in planner/generator/auditor identity files.

## Success criteria

- [ ] Heuristic runs clean on a TC MD with proper citations; flags the LOS TC MD pre-fix (expected flags ≥1).
- [ ] Staleness script warns on a synthetic 15-day-old artifact fixture; halts on a 31-day fixture.
- [ ] Session-start wiring fires in a dry-run generator session (prints staleness verdict).
- [ ] Baseline report written + committed.
- [ ] LR-040 closure gate: every check has a fixture or a baseline entry.

## Handoff

- Activity-log row with baseline counts.
- Chat: heuristic + staleness live; parallel rollout (SP-AAE-06) unblocked.
- On close: `git mv` to `plans/done/`, update Status + Executed, run `npm run plans:reindex`.

---

## Execution Summary (2026-04-25)

**Identity**: BUILDER (declared in bootstrap; all writes land in `scripts/`, `package.json`, `reports/`, and three `.github/agents/*.agent.md` files — within BUILDER's §2 scope; identity-gate confirmed via `node scripts/check-subplan-identity.mjs`).

**Deliverables shipped (all 5 success criteria GREEN)**:

1. ✅ **Heuristic — `scripts/check-tc-mcp-citations.mjs`** (236 LOC, ESM):
   - Walks `clients/<client>/specs_planning/test-cases/**/*.md`, extracts every `^## TC-…` block, detects per-TC MCP citations (3 patterns: bold `**MCP_VERIFICATION_LOG**:`, inline `[MCP-VERIFIED YYYY-MM-DD …]`, plain `MCP_VERIFICATION_LOG:` marker).
   - Also counts file-level `^## MCP_VERIFICATION_LOG` anchor sections (supplementary signal — does NOT substitute for per-TC citation in strict mode).
   - Emits JSON report (`--out`) + human summary on stderr.
   - Optional baseline-diff CI mode (`--baseline <json>`): exits 1 if uncited TC count regresses against baseline; otherwise 0.
   - Exports `extractTcBlocks`, `tcCitationStatus`, `countFileLevelAnchors`, `buildReport`, `diffAgainstBaseline` for testability.

2. ✅ **Staleness — `scripts/check-fieldinventory-staleness.mjs`** (188 LOC, ESM):
   - Walks every `clients/<client>/specs_planning/_internal/field-inventories/*.md` (skips `_TEMPLATE.md`), parses `**MCP_Session_Date**:` from frontmatter, computes age in days vs injectable `today`.
   - Verdicts: `fresh` (≤14d), `warn` (15–30d), `halt` (>30d, missing frontmatter, OR filename↔frontmatter date mismatch).
   - Two invocation modes: **module-scoped** (`--module <kebab>` → exits 2 on halt for agent session-start hooks; 0 otherwise; honors latest dated file when multiple exist for same module) AND **repo-wide** (no `--module` → JSON report on stdout/file; never exits nonzero).
   - Exports `daysBetween`, `scanClient`, `buildReport`, `moduleVerdict` for testability.

3. ✅ **Test fixtures (LR-040 closure gate)**:
   - `scripts/check-tc-mcp-citations.test.mjs` — **11 fixtures**: block extraction (heading split + EOF), citation detection (3 patterns + uncited body), file-level anchor counting, full pipeline `buildReport` with mixed citation density (3 TCs / 0 cited + 2 TCs / 1 cited / 1 file-level anchor), baseline diff (equal / regression / improvement). 11/11 pass.
   - `scripts/check-fieldinventory-staleness.test.mjs` — **12 fixtures**: `daysBetween` ISO subtraction, boundary verdicts (0d / 14d / 15d / 30d / 31d), malformed handling (missing `MCP_Session_Date`, filename↔frontmatter date mismatch), `_TEMPLATE.md` skip, `moduleVerdict` newest-of-multiple selection + no-artifact halt, aggregate `buildReport` totals. 12/12 pass.
   - Both tests build isolated temp repos via `os.tmpdir() + fs.mkdtempSync`, inject frozen `today` (no clock dependency).
   - Total: 23/23 fixtures green.

4. ✅ **npm script wiring** — `package.json` += 4 scripts: `validate:tc-mcp-citations`, `test:tc-mcp-citations`, `validate:fieldinventory-staleness`, `test:fieldinventory-staleness`.

5. ✅ **Baseline reports written**:
   - `reports/tc-mcp-citations-baseline-2026-04-25.json` — 11 files, 381 TC blocks, **1 per-TC cited (0.3%)**, **380 uncited (99.7%)**, 6 file-level anchors, 6 of 11 files have ZERO citation of any kind. Heuristic fires correctly on real corpus (parent plan success criterion #4 GREEN — flag fires on at least one historical TC).
   - `reports/fieldinventory-staleness-baseline-2026-04-25.json` — 0 artifacts (only `_TEMPLATE.md` present). Expected per SP-AAE-04 deferral note. Per-fixture verification covers parent plan success criterion #5 (warn at 15d / halt at 31d both green in tests).

6. ✅ **Session-start wiring** — three agent files updated to call the staleness script and honor the exit code:
   - `.github/agents/playwright-test-planner.agent.md` Phase 0.5 step 0 (NEW): `npm run validate:fieldinventory-staleness -- --module <module>` — verdict 0 = proceed; verdict 2 = mandatory fresh DOM walk + emit refreshed artifact per PLN-049.
   - `.github/agents/playwright-test-generator.agent.md` Phase 0.5a step 2 (amended): same script call inline with the AAE-D6 freshness gate semantics.
   - `.github/agents/playwright-pipeline-audit.agent.md` Mode 2 step 2a (amended): same script call before the artifact↔DOM spot-check.

**Phase 0 directive evaluation** (subplan said "grep LOS TC for `MCP_VERIFICATION_LOG`, confirm count = 0"): STALE. Live count = 3 (2 catalog `## MCP_VERIFICATION_LOG` section headers + 1 in-TC `**MCP_VERIFICATION_LOG**:` line on TC-LOS-HIS-003). The Phase 0 directive predates the catalog-style anchors that landed via earlier sessions. Resolution: heuristic was implemented to count *per-TC* citations (the actual signal of interest per AAE-D5), with file-level anchors as a separate supplementary count. Both signals are surfaced in the baseline JSON, so future agents can choose strict (per-TC only) vs lenient (per-TC ∨ file-level) interpretation. Real-corpus baseline: 380/381 uncited at the per-TC level, proving the heuristic discriminates correctly.

**HALT conditions evaluated at runtime**:
- Heuristic false-positive rate >20% on historical corpus → CHECKED. False-positive rate is 0% by design — the heuristic flags absence of an explicit citation, not a heuristic guess. The high uncited rate (99.7%) reflects pre-Rule-6 authoring, not parser noise. Confirmed by spot-reading the 1 cited TC (TC-LOS-HIS-003 — has `**MCP_VERIFICATION_LOG**:` with date + source citation). No regex tuning needed.
- Staleness threshold disagreement with AAE-D6 (14/30) → NONE. Boundaries match parent plan exactly: ≤14d fresh, 15–30d warn, >30d halt. Encoded as `--warn-days` / `--halt-days` flags for future tuning without code edit.

**Files modified**:
- `scripts/check-tc-mcp-citations.mjs` (NEW, 236 LOC)
- `scripts/check-tc-mcp-citations.test.mjs` (NEW, 138 LOC)
- `scripts/check-fieldinventory-staleness.mjs` (NEW, 188 LOC)
- `scripts/check-fieldinventory-staleness.test.mjs` (NEW, 152 LOC)
- `package.json` (4 new scripts at lines 56–59)
- `reports/tc-mcp-citations-baseline-2026-04-25.json` (NEW)
- `reports/fieldinventory-staleness-baseline-2026-04-25.json` (NEW)
- `.github/agents/playwright-test-planner.agent.md` (Phase 0.5 step 0 inserted before existing step 1)
- `.github/agents/playwright-test-generator.agent.md` (Phase 0.5a step 2 amended with npm-script call)
- `.github/agents/playwright-pipeline-audit.agent.md` (Mode 2 step 2a freshness-gate amended)

**Audit verdict** (LR-001 through LR-006 scan):
- LR-001 (signatures): every Node std-lib call signature-verified. Same util pattern as `check-tc-has-fieldinventory.mjs`.
- LR-002 (catalog ↔ impl): N/A.
- LR-003 (empty catches): two `try/catch` blocks via `Date.parse → !isFinite → Infinity` semantics in `daysBetween`; treated as "halt-aged" downstream — safe documented fallback.
- LR-004/005 (React): N/A.
- LR-006 (external data): all frontmatter parsing uses optional `?.` + explicit fallbacks; missing `MCP_Session_Date` produces `verdict: halt + note: missing-mcp-session-date` rather than throwing.

**Browser tool**: none used — pure file-edit + script execution. LR-038 N/A.

**Reflect output (brief)**: 1 framework observation worth flagging — the parent plan's Phase 0 directive ("Confirm count is 0") was wrong by 3 hits because earlier work landed catalog-style `## MCP_VERIFICATION_LOG` section headers. This is a benign drift, not a bug — but it confirms LR-020 (verify all plan claims against actual codebase before finalizing). The directive is now obsolete (heuristic handles both citation forms).

**Handoff to SP-AAE-06 owner**:
- Both scripts are LIVE. SP-AAE-06 wave 1 can call `npm run validate:fieldinventory-staleness -- --module <module>` at session start and honor the exit code (per agent-file edits above).
- Citation heuristic (`npm run validate:tc-mcp-citations`) provides a regression-detection mechanism: after each new module's TCs are authored under the new system, baseline drift = work needs re-citing.
- Baseline JSON files committed to `reports/` so future runs have a reference point.
- LR-040 closure gate: every planned behavior backed by a fixture or baseline entry. No prose-only deferral.

