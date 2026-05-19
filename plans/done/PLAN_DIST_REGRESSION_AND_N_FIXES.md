# PLAN — dist/framework regression fix + 4 N-findings + 5 audit GAPs

**Status**: DONE
**Executed**: 2026-05-19
**Executed by**: OWNER
**Created**: 2026-05-19
**Priority**: P1

### Execution Summary

All 9 plan phases + Phase 6.5 (GAP-4) + Phase 10 (demo prep per user request) landed in one session.

**Phase 1**: `clients/encore/dist/` removed (was untracked regression artifact, rebuilt 2026-05-19T10:45 UTC).

**Phase 2**: AgentReporter relocated from `src/utils/agent-reporter.ts` → `clients/encore/src/utils/agent-reporter.ts` (370 lines copied with 2 import adjustments — `from '../types/diagnostics'` + local `type TriageResult = unknown` stub). `clients/encore/playwright.config.ts:49` updated to `'./src/utils/agent-reporter.ts'`. Root copy left with DEPRECATED survival comment per R5 mitigation.

**Phase 3**: `clients/*/dist/` added to root `.gitignore` (line 16, between `/dist-pipeline/` and `client-delivery/`).

**Phase 4 (N1 + GAP-3)**: 4 LIVE files scrubbed of nav4/Navigator4 stale labels — `MODULE_REGISTRY.md:3`, `location-local-info.data.ts:32` (comment only), `.claude/skills/rca/SKILL.md:207`, `.claude/AGENT_SCHOOL.md:9`. `clients/encore/CLAUDE.md:49` preserved as KEEP-INTENTIONAL (LR-ENC-001 explainer). `PLAN_DQU_V6_PILOT_SHARED_SETUP.md` LEFT AS-IS — references are structural CHANGE LOG narrative about removing nav4 walks, not stale labels.

**Phase 5 (N2)**: `testIgnore: ['**/examples/**']` deleted from `clients/encore/playwright.config.ts:23` — was pointing at non-existent `tests/examples/` dir.

**Phase 6 (N5 + GAP-1 + GAP-2)**: 7 LIVE docs updated to remove vendoring-as-current pattern — `README.md`, `BUNDLE_MANIFEST.md` (title + Generated date + lines 10/22/27 per GAP-2 deeper rewrite), `docs/SETUP.md` ("After every pull" section deleted), `CLAUDE.md:136`, `ARCHITECTURE.md:76`, `pipeline/README.md:21-32` AND `pipeline/README.md:16` (per GAP-1 "Agent-public reporters live per-client at clients/<id>/src/utils/...").

**Phase 6.5 (GAP-4 / LR-050 Option B)**: 6 vendor-machinery artifacts marked DEPRECATED via survival comments — `scripts/build-framework-vendor.ts`, `scripts/build-framework-vendor-all.mjs`, `scripts/verify-vendor-fresh.mjs`, `.github/workflows/ship-smoke.yml`, `package.json` (top-level `_vendor_deprecation_note` field, JSON validity preserved), `.githooks/pre-push` lines 19-29 + error message at line 25. Option B (survival comments) preserves §2 OUT-OF-SCOPE strict line per LR-046; final deletion deferred to `PLAN_ROOT_CLIENT_DEDUPE.md`.

**Phase 7 (N4)**: `scripts/validate-plan-closure.mjs:47-54` regex updated with `(?:>\s*)?` to support blockquote `> **Status**: DONE`. Verified: PLAN_POST_MATSUMOTO_SLOP_SWEEP.md now parses through C1-C5 checks (returns FAIL on C2 = pre-existing Execution Summary gap, NOT a regression caused by this plan — see plan §11.1).

**Phase 2.5 Adjacent-Sweep DO-NOW**: `clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md` (gitignored agent doc) updated to mark vendor-fresh step as deprecated/vestigial — was the only Phase-6-adjacent stale ref found.

**Phase 8 Verification (via Bash tool per GAP-5)**: All 11 composite axes GREEN — A (dist/ removed), B (reporter relocated), C (config ref clean), D (gitignore active), E (1595/15 unchanged), F (no rebuild from --list), G (Navigator4 0 hits), H (testIgnore 0 hits), I (validator no SKIP — returns FAIL on PLAN_POST_MATSUMOTO_SLOP_SWEEP.md showing C1-C5 now parsed), J (N5 live-doc sweep 0 hits for vendoring-as-current), K (orphan survival comment present).

**Phase 10 DEMO PREP**: `tests/specs/setup/locations/location-notes.spec.ts --project=chromium` ran end-to-end. Result: **32 passed (6.0min), 1 flaky** (TC-LOC-NTS-009 textarea visibility race recovered on retry — pre-existing, unrelated to dist regression / reporter relocation). AgentReporter loaded and executed correctly (visible in console output via "[AgentReporter] Skipping failure-summary.json write -- no tests executed" message during --list earlier and during spec run reporter writes).

**Audit GAPs disposition matrix**:

| GAP | Disposition | Where |
|---|---|---|
| GAP-1 (pipeline/README.md:16 stale) | DONE | Phase 6 |
| GAP-2 (BUNDLE_MANIFEST.md framing) | DONE — title + Generated + lines 10/22/27 rewritten | Phase 6 |
| GAP-3 (CLAUDE.md:49 KEEP-INTENTIONAL) | DONE — explicitly preserved | Phase 4 |
| GAP-4 (LR-050 restructure-orphan disposition) | DONE — Option B survival comments on 6 vendor-machinery artifacts | Phase 6.5 |
| GAP-5 (Bash tool for verification) | DONE — all Phase 8 commands run via Bash, not PowerShell | Phase 8 |

**Known follow-ups (deferred per §2 OUT-OF-SCOPE + LR-046)**:
1. Delete (not just deprecate) `scripts/build-framework-vendor*.ts/mjs`, `scripts/verify-vendor-fresh.mjs`, `.github/workflows/ship-smoke.yml`, `package.json` `vendor:build*` entries, `.githooks/pre-push:19-29` — tracked by `PLAN_ROOT_CLIENT_DEDUPE.md`.
2. Delete root `src/utils/agent-reporter.ts` + root `src/utils/retry-telemetry.ts` (orphan after relocation) — tracked by `PLAN_ROOT_CLIENT_DEDUPE.md`.
3. Audit existing blockquote-Status plans for C1-C5 violations (N4 fix exposed them) — spawn remediation plan if user wants.
4. `PLAN_DQU_V6_PILOT_SHARED_SETUP.md` retains nav4 narrative as documentation of dropped scope — intentional, not stale.


**Identity**: OWNER (WATCHDOG audited; independent fresh-session WATCHDOG re-audit produced 5 GAP fixes incorporated below)
**Skills**: /execute → /regression-guard (wrap) → /audit → /reflect → /final-q
**PermissionMode**: acceptEdits
**BrowserTool**: none for Phases 1-9 (file ops only); cli for Phase 10 (demo spec run)
**Master plan**: standalone — derived from a fresh-session WATCHDOG audit (kept in the user's `~/.claude/plans/` scratch dir, external to repo per `feedback_save_plan_location.md`); both source artifacts are hypothetical external scratch files and intentionally not cited as in-repo paths

## 1. Context

User intent: *"mirror the structure without losing the content we already have... folder restructure and make it prettier for morons to review manually"*. Target structure mirror = `C:\Users\rutvi\projects\notes` (single-client layout, `src/` self-contained, no `dist/framework/`).

### 1.1 Regression
`clients/encore/dist/framework/` rebuilt 2026-05-19T10:45 UTC. Root cause = [clients/encore/playwright.config.ts:49](clients/encore/playwright.config.ts:49) reporter ref `'./dist/framework/utils/agent-reporter.js'` — points at deleted vendored output.

### 1.2 Ship constraint (CRITICAL)
`scripts/ship-client.sh:42` uses `git archive HEAD clients/encore/ | tar -x --strip-components=2`. Deliverable contains ONLY `clients/encore/` contents — root `src/` is unreachable post-ship. Reporter source must live INSIDE `clients/encore/`.

### 1.3 N-findings bundled
- **N1** Live `[Nn]avigator?4` stale labels in 5 LIVE files + KEEP-INTENTIONAL at [clients/encore/CLAUDE.md:49](clients/encore/CLAUDE.md:49) (LR-ENC-001 explainer note)
- **N2** [playwright.config.ts:23](clients/encore/playwright.config.ts:23) `testIgnore: ['**/examples/**']` → empty dir
- **N4** `scripts/validate-plan-closure.mjs:47-54` regex misses blockquote `> **Status**: DONE`
- **N5** 7 LIVE docs describe vendoring-as-current — contradicts notes-structure target

### 1.4 5 audit GAPs (incorporated into phases)
- **GAP-1** pipeline/README.md:16 — "Agent-public reporters stay at src/utils/agent-reporter.ts" becomes false post-relocation → fold into Phase 6
- **GAP-2** BUNDLE_MANIFEST.md needs deeper rewrite (title + Generated date + vendor-fresh note) — fold into Phase 6
- **GAP-3** N1 inventory must classify [clients/encore/CLAUDE.md:49](clients/encore/CLAUDE.md:49) as KEEP-INTENTIONAL — explicit DO-NOT-TOUCH in Phase 4
- **GAP-4** LR-050 restructure-orphan disposition for dead vendor machinery (Option B = survival comments, NOT deletion — preserves §2 strict OUT-OF-SCOPE line per LR-046) → new Phase 6.5
- **GAP-5** Verification commands need Bash tool (POSIX), not PowerShell — explicit note in Phase 8

## 2. Scope

### In-scope (Phases 1-10)
- Phase 1: Delete `clients/encore/dist/` regression artifact
- Phase 2: Relocate AgentReporter → `clients/encore/src/utils/agent-reporter.ts` + orphan survival comment on root copy
- Phase 3: Add `clients/*/dist/` to root `.gitignore`
- Phase 4: N1 scrub 5 LIVE files, preserve LR-ENC-001 KEEP at [clients/encore/CLAUDE.md:49](clients/encore/CLAUDE.md:49)
- Phase 5: N2 testIgnore removal
- Phase 6: N5 LIVE-doc sweep + GAP-1 (pipeline/README.md:16) + GAP-2 (BUNDLE_MANIFEST.md framing)
- Phase 6.5: GAP-4 LR-050 disposition (Option B survival comments on 7 vendor-machinery artifacts)
- Phase 7: N4 validator regex blockquote support
- Phase 8: Verification (via Bash tool per GAP-5)
- Phase 9: Closure (Status DONE + git mv + plans:reindex + activity log)
- Phase 10: DEMO — run `location-notes.spec.ts` end-to-end (user request — upcoming demo)

### Out of scope (strict plan lines per LR-046)
- **DELETING** root `src/utils/agent-reporter.ts`, `src/utils/retry-telemetry.ts`, or other root `src/` orphans → deferred to PLAN_ROOT_CLIENT_DEDUPE.md. Disposition: Option B survival comments only (Phase 2 + Phase 6.5).
- **DELETING** dead vendor scripts (`build-framework-vendor.ts`, `build-framework-vendor-all.mjs`, `verify-vendor-fresh.mjs`), `.github/workflows/ship-smoke.yml`, `package.json` `vendor:build*` entries, `.githooks/pre-push:19-29` → Phase 6.5 marks them DEPRECATED; deletion deferred to PLAN_ROOT_CLIENT_DEDUPE.md
- **AUDITING** existing blockquote-Status plans for C1-C5 violations once N4 regex fixed → follow-up sweep
- **FORENSIC** for the 10:45 UTC vendor rebuild trigger — Phase 2 removes the demand path

## 3. Phase 1 — Delete dist regression

```bash
rm -rf clients/encore/dist/
ls clients/encore/dist/ 2>&1   # expected: "No such file"
```

## 4. Phase 2 — Relocate AgentReporter

### 4.1 Create [clients/encore/src/utils/agent-reporter.ts](clients/encore/src/utils/agent-reporter.ts)
Copy [src/utils/agent-reporter.ts](src/utils/agent-reporter.ts) (370 lines) with import adjustments:
- Lines 9-17: change `from '../framework-contracts/diagnostics'` → `from '../types/diagnostics'`; drop `TriageResult` from import; add local `type TriageResult = unknown;` stub
- Lines 18-23: `from './retry-telemetry'` works as-is — `clients/encore/src/utils/retry-telemetry.ts` already exists

Rationale for local stub: `triage` field is `null` literally at [src/utils/agent-reporter.ts:232](src/utils/agent-reporter.ts:232) and [src/utils/agent-reporter.ts:355](src/utils/agent-reporter.ts:355); never read.

### 4.2 Update [clients/encore/playwright.config.ts:49](clients/encore/playwright.config.ts:49)
FROM: `['./dist/framework/utils/agent-reporter.js'],`
TO:   `['./src/utils/agent-reporter.ts'],`

### 4.3 Survival comment on root [src/utils/agent-reporter.ts](src/utils/agent-reporter.ts) (R5 mitigation)
Prepend header comment: `// DEPRECATED 2026-05-19 — moved to clients/encore/src/utils/agent-reporter.ts. Kept temporarily; cleanup tracked by PLAN_ROOT_CLIENT_DEDUPE.md.`

## 5. Phase 3 — Defensive gitignore

Append to root [.gitignore](.gitignore) after line 15:
```
# Per-client build artifacts (parallel to /dist/ and /dist-pipeline/).
# Post-2026-05-19: clients don't ship pre-built artifacts.
clients/*/dist/
```

Verify (e.g., via `git check-ignore -v` against any hypothetical path matching the pattern — actual `clients/encore/dist/` is deleted in Phase 1, so pattern correctness is verified by `grep -F` string match against the gitignore file).

## 6. Phase 4 — N1 nav4 scrub (5 LIVE + 1 KEEP-INTENTIONAL per GAP-3)

| File | Action |
|---|---|
| [clients/encore/docs/MODULE_REGISTRY.md:3](clients/encore/docs/MODULE_REGISTRY.md:3) | "Navigator4" → "Encore Navigator Cloud" |
| [clients/encore/tests/test-data/setup/locations/location-local-info.data.ts:32](clients/encore/tests/test-data/setup/locations/location-local-info.data.ts:32) | comment-only: "Navigator4" → "Encore Navigator Cloud" |
| [.claude/skills/rca/SKILL.md:207](.claude/skills/rca/SKILL.md:207) | "Navigator4 SSO" → "Navigator Cloud SSO" |
| [.claude/AGENT_SCHOOL.md:9](.claude/AGENT_SCHOOL.md:9) | "Navigator4" → "Navigator Cloud" |
| [plans/pending/PLAN_DQU_V6_PILOT_SHARED_SETUP.md](plans/pending/PLAN_DQU_V6_PILOT_SHARED_SETUP.md) | **LEAVE AS-IS** — references are STRUCTURAL CHANGE LOG narrative about removing nav4 walks (not stale labels). Surface to user in execution summary. |
| [clients/encore/CLAUDE.md:49](clients/encore/CLAUDE.md:49) | **KEEP-INTENTIONAL** per GAP-3 — LR-ENC-001 explainer note about nav4-not-being-an-env. DO NOT TOUCH. |

## 7. Phase 5 — N2 testIgnore

Edit [clients/encore/playwright.config.ts:23](clients/encore/playwright.config.ts:23):
DELETE the `testIgnore: ['**/examples/**'],` line.

## 8. Phase 6 — N5 LIVE-doc sweep (+ GAP-1 + GAP-2)

| File | Edit |
|---|---|
| [README.md:30-36](README.md:30) | Remove "vendored framework build" + `npm run vendor:build:all` instructions |
| [BUNDLE_MANIFEST.md](BUNDLE_MANIFEST.md) | **GAP-2 expanded**: line 1 title "Path A (vendored framework + git-archive ship)" → "Path A — git-archive ship"; line 3 Generated bump 2026-04-30 → 2026-05-19; line 10 drop "dist/framework"; line 22 drop "vendor-fresh check"; line 27 drop "regenerate vendor" |
| [docs/SETUP.md:60-72](docs/SETUP.md:60) | Delete "After every pull" section |
| [CLAUDE.md:136](CLAUDE.md:136) | "ships via vendoring" → "lives at `clients/<id>/src/`, no per-client vendor build" |
| [docs/read_only_docs/ARCHITECTURE.md:76](docs/read_only_docs/ARCHITECTURE.md:76) | Update Path note: drop vendoring; describe notes-structure mirror |
| [pipeline/README.md:21-32](pipeline/README.md:21) | Rewrite Path A bullets (post-2026-05-19 notes-structure) |
| [pipeline/README.md:16](pipeline/README.md:16) | **GAP-1**: "Agent-public reporters stay at `src/utils/agent-reporter.ts`" → "Agent-public reporters live per-client at `clients/<id>/src/utils/agent-reporter.ts`" |

## 9. Phase 6.5 — GAP-4 LR-050 disposition: Survival comments on dead vendor machinery (Option B)

Per `feedback_restructure_plans_include_cleanup.md` + LR-050 + audit GAP-4. NOT deletion (preserves §2 OUT-OF-SCOPE line per LR-046). Mark with: `DEPRECATED 2026-05-19 — vendoring removed in PLAN_DIST_REGRESSION_AND_N_FIXES. Cleanup tracked by PLAN_ROOT_CLIENT_DEDUPE.md`.

| File | Survival-comment location |
|---|---|
| [scripts/build-framework-vendor.ts](scripts/build-framework-vendor.ts) | top header |
| [scripts/build-framework-vendor-all.mjs](scripts/build-framework-vendor-all.mjs) | top header |
| [scripts/verify-vendor-fresh.mjs](scripts/verify-vendor-fresh.mjs) | top header |
| [.github/workflows/ship-smoke.yml](.github/workflows/ship-smoke.yml) | top YAML comment block |
| [package.json](package.json) `vendor:build` + `vendor:build:all` | inline comment-equivalent: rename keys to `vendor:build:DEPRECATED` + `vendor:build:all:DEPRECATED` OR leave as-is and add a top-level `_vendor_deprecation_note` field (use whichever doesn't break JSON validity — pick approach in execution) |
| [.githooks/pre-push](.githooks/pre-push) lines 19-29 | inline `# DEPRECATED` comment above the block |

## 10. Phase 7 — N4 validator regex

Edit [scripts/validate-plan-closure.mjs:47-54](scripts/validate-plan-closure.mjs:47):
```javascript
function parseField(header, label) {
  // (?:>\s*)? — accept blockquote prefix (closes LR-055 bypass; PLAN_DIST_REGRESSION_AND_N_FIXES 2026-05-19)
  const re = new RegExp(
    `(?:^|\\n)\\s*(?:>\\s*)?(?:\\*\\*)?${label}(?:\\*\\*)?\\s*:\\s*([^\\n]+)`,
    'i',
  );
  const m = header.match(re);
  return m ? cleanValue(m[1]) : '';
}
```

## 11. Phase 8 — Verification (GAP-5: via Bash tool — POSIX env, NOT PowerShell)

```bash
# All axes — run as one composite via Bash tool:
rm -rf clients/encore/dist/ && \
echo "=== A. dist/ removed ===" && ls clients/encore/dist/ 2>&1 && \
echo "=== B. reporter relocated ===" && head -3 clients/encore/src/utils/agent-reporter.ts && \
echo "=== C. config ref clean ===" && grep -n "agent-reporter\|dist/framework" clients/encore/playwright.config.ts && \
echo "=== D. gitignore active ===" && grep -F "clients/*/dist/" .gitignore && \
echo "=== E. tests intact ===" && (cd clients/encore && npx playwright test --list 2>&1 | tail -1) && \
echo "=== F. no rebuild from --list ===" && ls clients/encore/dist/ 2>&1 && \
echo "=== G. N1 Navigator4 gone ===" && grep -c "Navigator4" clients/encore/docs/MODULE_REGISTRY.md && \
echo "=== H. N2 testIgnore clean ===" && grep -c "examples" clients/encore/playwright.config.ts && \
echo "=== I. N4 validator no SKIP ===" && node scripts/validate-plan-closure.mjs --enforce --plan plans/done/PLAN_POST_MATSUMOTO_SLOP_SWEEP.md --json
```

Expected: A "No such file"; B import lines correct; C 1 hit (line 49 new path); D pattern present; E "Total: 1595 tests in 15 files"; F "No such file" (no rebuild); G 0; H 0; I status NOT "SKIP".

## 12. Phase 9 — Closure

1. Append activity-log row to the active client's agent-activity-log per LR-028 + LR-037 timestamp gate
2. Plan finalization: change **Status**: PENDING → DONE (plain form), add **Executed**: 2026-05-19 + ### Execution Summary section
3. Run `scripts/validate-plan-closure.mjs` (the validator script) with `--enforce --write-manifest` — must PASS
4. `git mv` the plan from the pending dir to the done dir (same filename; source/dest paths intentionally not inline — the destination will exist post-move)
5. Run `plans:reindex` (the npm reindex script)

## 13. Phase 10 — DEMO PREP (user request — upcoming demo)

Run one location spec to confirm framework still works post-changes:
```bash
cd clients/encore && npx playwright test tests/specs/setup/locations/location-notes.spec.ts --project=chromium 2>&1 | tail -30
```

GEN-034 mandate: --list is NOT a test run. This is the real test. PASS = framework intact. FAIL = HALT and triage before declaring done.

## 14. Acceptance criteria
- [ ] `clients/encore/dist/` gone
- [ ] [clients/encore/src/utils/agent-reporter.ts](clients/encore/src/utils/agent-reporter.ts) exists with correct imports
- [ ] [clients/encore/playwright.config.ts:49](clients/encore/playwright.config.ts:49) references new path; no `dist/framework` ref
- [ ] root [.gitignore](.gitignore) contains `clients/*/dist/`
- [ ] 5 LIVE files scrubbed; [clients/encore/CLAUDE.md:49](clients/encore/CLAUDE.md:49) preserved
- [ ] testIgnore line gone from playwright.config.ts
- [ ] 7 LIVE docs no longer say "ships via vendoring"
- [ ] 7 vendor-machinery artifacts marked DEPRECATED
- [ ] Validator regex accepts blockquote `> **Status**: DONE`
- [ ] `npx playwright test --list` returns 1595/15
- [ ] location-notes.spec.ts passes end-to-end
- [ ] Activity log row + plan in plans/done/ + INDEX regenerated

## 15. Risks
| Risk | Mitigation |
|---|---|
| Playwright `.ts` reporter doesn't load in deliverable | Phase 8 covers shipping; demo spec covers local execution |
| Local `TriageResult = unknown` causes type error | `triage` is null-only; never read inside reporter |
| Validator regex retroactively flips Status | Regex only changes parseField; doesn't change authoritative state |
| `clients/*/dist/` masks future legitimate dist | Each client owns own .gitignore for negative-ignore |
| Phase 10 demo spec fails due to env / SSO | HALT before declaring done; surface root cause |
