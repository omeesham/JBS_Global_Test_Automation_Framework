# SUBPLAN_PARITY_00 — Spec-Driven CSV Augmentation → Push for Encore Review

**Parent**: `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md`
**Phase**: 0 of parent (PRECEDES all other subplans; runs FIRST; offline-safe)
**Status**: PENDING
**Priority**: P0 (client review of CSVs imminent; e2e down blocks SP01..SP08)
**PermissionMode**: acceptEdits
**Justification**: Permanent commit to working branch + push to remote (`encore_deliverables_test/csv-spec-demo-2026-05-25`). Per-step user-confirmation gates inside (Phase 2 review + Phase 4 push). LR-041 acceptEdits chosen over auto to preserve human-in-loop at the two risky moments (permanent CSV mutation + remote push).
**BrowserTool**: none
**Skills**: /execute, /regression-guard
**Identity**: BUILDER (deterministic file ops + git ops — Sonnet-safe)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**Created**: 2026-05-25
**Author**: Rutvik (via Claude Opus 4.7)
**ActiveClient**: encore

---

## Change Log

- **2026-05-25** — INITIAL AUTHORING + DIRECTIONAL PIVOT + COMPREHENSIVE DESIGN consolidating P1-P17 + Round 9 S1-S3 + Round 10 N18-N25 + Round 11 M1-M7 from meta-plan at `C:\Users\rutvi\.claude\plans\i-need-u-to-iterative-matsumoto.md`. Architecture: augment 10 source CSVs in-place with 3 new columns (Automated/Automation Execution/If Failed Reason of Failure) → user reviews in source location → PERMANENT commit to working branch → push bundle to `csv-spec-demo-2026-05-25` on `RutviK-JBS/encore_deliverables_test`. NO revert; augmented CSVs become permanent (9 → 12 cols). SSL_FCC contamination 4-layer guard (Phase 0 user question + STRICT-STAGE check + baseline overlay + bundle smoke test). 100% mapping accuracy via Playwright JSON `--list --reporter=json` (primary for TC set + mode) + source-file regex at JSON-reported `location.file:line` (secondary for `test.fixme(true, '<reason>')` text — JSON does NOT expose reason; verified). Hybrid fixme registry reuse: `node scripts/scan-fixmes.ts` for `// FIXME` comment reasons. Cross-platform: all file ops in Node augment script (no shell `cmp`/`cp`/`find` — Windows-safe). Sibling reverts of prior `.fixme` stub-direction additions remain landed across SP01-SP08 + parent PLAN.

- **2026-05-25 (mid-execution scope expansion at Phase 2 HALT)** — Two user-authorized scope additions during Phase 2 review:
  1. **Notes CSV restored** — `locations_notes_test_cases.csv` was identified as missing from the original 10 CSVs (it had been force-added in May 2026 for a one-off code-review deliverable per commits `89c5c02 → 9ee3c43 → 08a4e50`, but the source MD was never tracked due to `clients/*/specs_planning/` being gitignored at root `.gitignore:185` per LR-049 client-deliverable design; subsequent regens lost it). A separate recovery agent restored it byte-exact from git blob `c1b0bdcf3998d0fd23777b4a0cebd1811567c2e3` (2026-05-15, 195 lines, 32 TCs). The restored CSV uses a 10-col schema (`TC ID, Title, Module, Submodule, Tags, Status, Preconditions, Steps, Expected Result, Notes`) vs the 9-col schema of siblings (`Specific Field` at col 5). Schema divergence preserved (NOT normalized) — colleague will see column-layout inconsistency between Notes and other modules. SP00 strict count changes 10 → 11 CSVs; LR-046 strict-line authorization is implicit (user directive `i will be adding the missing notes csv for ur review, please work on it`).
  2. **CSV content cleansing pass added** — external reviewer surfaced patterns in CSV content that need cleansing before colleague-ship. Pattern scan across all 11 CSVs / 423 rows found: 21 `MCP-verified YYYY-MM-DD`/`(MCP-N)` markers, 1 `Corrected during generation 2026-02-25` (TC-LOC-CUR-013), 56 `CLEANUP REQUIRED` markers in Notes column, 27 `MCP`/`Playwright CLI` framework jargon, 32 `BUG-XXX-NNN` internal bug IDs, 13 `NM-NNNN` Jira refs (legitimate — KEEP), 3 `Planner expected ... actual app behavior` patterns. Cleanse pass added IN-SCOPE per LR-ENC-002 ("never lazy-defer MD/CSV/test-plan updates"); per LR-050 (restructure plans must enumerate stale-slop cleanup in-scope — never defer to "discover later" subplans). PO-input items (TC-LOC-CUR-013 testing-to-code anti-pattern, TC-LOC-CUR-010 MXN data-gap assertion) flagged for `/encore-questions` follow-up — NOT silently rewritten.

- **2026-05-26 (mid-execution scope expansion at Phase 2 HALT round 3)** — Third user-authorized scope addition during Phase 2 review:
  3. **Augment v1 → v2 rewrite — source-of-truth fixme detection + FCC orphan-row injection.** User reviewer noticed CSVs showed all `Pass` in shared-setup / notes specs that have FIXMEs in code. Investigation found v1 augment relied on Playwright `--list --reporter=json` `expectedStatus` field, which reports `passed` for inline runtime `test.fixme(true, '<reason>')` calls (the fixme fires at runtime, not at discovery). v1 missed 8 of ~14 known fixme'd TCs: SSL-007/026/030/FCC-009/FCC-012 (inline runtime fixmes), MGH-006/007 (bare `test.skip(true, ...)`), NTS-FCC-022 (FCC TC ID not in CSV — no row to update). v2 (`sp00-augment-v2.mjs`) parses every `.spec.ts` directly via regex: literal-quote OR template-literal test heads with separate single/double-quote-tolerant patterns, walks body to next test() for inline runtime skip/fixme, walks UP for signature-level skip + // comment reasons, resolves template-literal `${tcId}` loops by following the for-loop's array variable across data files. Added orphan-row injection: 5 spec-fixme TC IDs that have no CSV row (SSL-026, SSL-030, SSL-FCC-009, SSL-FCC-012, NTS-FCC-022) now get NEW rows in their matching CSVs with minimal content (TC ID + title from spec + Module/Submodule + empty planning cols + Steps="See spec for steps." + Notes="Added from spec FCC-pilot case. Blocked by app bug; runtime-fixme." + Yes/Fail/scrubbed-reason). Final state: 17 fixme'd TCs detected (vs 9 with v1), 17 Fail entries in CSVs (vs 9 with v1), 0 unmapped fixmes, 5 orphan rows injected. CSV total: 11 CSVs / 428 rows (was 423; +5 orphans). User directive: "do what's best, no lazyness".

- **2026-05-26 (mid-execution scope expansion — scope addition 4)** — FCC TC ID rename completion + orphan row injection. User authorized "Rename ALL FCC in spec + CSV (full cleanup)" in prior session. Prior session renamed only 5 of 65+. This session completed the remaining: 23 NTS FCC IDs (TC-LOC-NTS-FCC-001..032 → TC-LOC-NTS-039..061), 12 SSL FCC IDs (TC-LOC-SSL-FCC-001..014 → TC-LOC-SSL-033..044), 3 HIST comment refs (FCC-028 → NTS-059). Total 68 replacements across 3 spec files. Also injected 35 new CSV rows (23 NTS + 12 SSL) with real Steps + Expected Result content for the renamed spec-only tests (no placeholders — each row's Steps/Expected synthesized from the spec test body). CSV total: 11 CSVs / 463 rows (was 428; +35 orphans). Augment-v2 re-run: 335 unique TCs (318 active, 17 fixme), 463 CSV TCs mapped, 0 unmapped fixmes. Final adversarial audit: 13 flags, all false positives, 0 real defects.

---

## Context

Colleague at Encore needs a CSV deliverable with 3 columns added per verbatim ask: `Automated` (Yes/No), `Automation Execution` (Pass/Fail/empty), `If Failed Reason of Failure` (text). The e2e website is down → SP01..SP08 (real automation work) cannot execute. SP00 produces the deliverable directly from current spec state.

**Architecture** — permanent augment + push for review:

1. **Phase 0** — Dependency gate + Drift Check + SSL_FCC contamination question + Playwright JSON pre-build + scan-fixmes registry generation
2. **Phase 1** — Augment all 10 source CSVs in-place with 3 new columns (Playwright JSON primary; source regex + fixme-registry for reason text); inline self-validation
3. **Phase 2** — HALT for user QUALITY review (mapping correctness is structurally guaranteed; user reviews readability)
4. **Phase 3** — Permanent commit to working branch (CSVs only via STRICT-STAGE); `client:ship --force` bundle; SSL_FCC scrub (conditional); bundle smoke test (`tsc --noEmit`)
5. **Phase 4** — HALT for push confirmation
6. **Phase 5** — Orphan-branch push to `csv-spec-demo-2026-05-25` on `RutviK-JBS/encore_deliverables_test`
7. **Phase 6** — Verify final state (permanent commit on working branch, CSV-only diff, no untracked SP00 artifacts)
8. **Phase 7** — `os.tmpdir()` cleanup

**End state**: Framework working branch has 1 new commit (the augment). 10 source CSVs permanently have 12 columns (was 9: TC ID, Title, Module, Submodule, Specific Field, Preconditions, Steps, Expected Result, Notes; now +3: Automated, Automation Execution, If Failed Reason of Failure). Bundle frozen on remote `csv-spec-demo-2026-05-25`. SP01..SP08 see augmented (12-col) CSVs.

**Refresh model** (M1): pipeline auto-regen via `scripts/planner-post-complete.ts:21` re-imports `CsvConverter` and wipes the 3 new cols on next Planner queue completion. P17 Edit 17A added 3 entries to `export_test_cases/to-csv.ts` COLUMNS array → 12-col schema preserved on regen (only data wiped). Re-run SP00 to refresh data when colleague requests.

---

## Bootstrap (read first, 5 essentials)

1. `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — §Goal, §Governing Rules, §Ordered Execution Sequence
2. `clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md` + `scripts/ship-client.sh` — canonical ship runbook (preflight, `--strip-components=2`, post-ship verify-no-forbidden)
3. `export_test_cases/to-csv.ts` (COLUMNS array — must contain 3 new entries before SP00 executes per P17 Edit 17A) + `scripts/check-tc-parity.ts` (existing exporter chain) + `scripts/scan-fixmes.ts` (fixme registry tool for `// FIXME` comments)
4. `clients/encore/playwright.config.ts` — projects + `auth.setup.ts` dependency (filter `projectId === 'setup'` in augment)
5. `plans/pending/SUBPLAN_SSL_FCC.md` Phase 3 — 3 SSL_FCC target files used by Phase 0 contamination guard

Other rules auto-load via path-scope at execution time.

---

## Phase 0 — Gate + Drift Check + Index Pre-build

**[GATE-D0]** Verify dependencies (7 sub-checks):

- [ ] **Working branch is expected**: print `git rev-parse --abbrev-ref HEAD`; HALT if not `client_deliverable` (or whatever user expects)
- [ ] **`client:ship` npm script exists** and uses `git archive HEAD clients/encore/`
- [ ] **Remote repo accessible**: `gh auth status` green; `gh` CLI authenticated for `RutviK-JBS` org
- [ ] **No uncommitted CSV edits** (M-19): `git status --porcelain clients/encore/test_cases_csv/` returns empty. **HALT if non-empty** — ask user to commit/stash/abort before SP00 (git history must reflect pre-SP00 truth so `git checkout --` in Phase 2 reject path is safe restoration)
- [ ] **Augmented schema present in to-csv.ts** (M1, P17 Edit 17A): grep `export_test_cases/to-csv.ts` for 3 keys `'automated'` AND `'automationExecution'` AND `'reasonOfFailure'` in COLUMNS array. HALT if any missing — to-csv.ts must be updated FIRST or pipeline auto-regen will produce 9-col CSVs that destroy the augment schema
- [ ] **Browser tool none**: offline file-ops + git-ops only
- [ ] **Phantom-file check** (M2): NO Phase 0 sub-check for `clients/encore/scripts/ci/check-csv-sanity.mjs` — file does not exist (SP03 future-work per `SUBPLAN_PARITY_03:50`). Do not invent a check for a non-existent file.

**HALT** if any gate fails → escalate to chat.

**Drift Check** (mandatory; emit `$REPORTS_DIR/drift-note.md`):

1. **[CRITICAL] SSL_FCC contamination check** (per user 2026-05-25 directive: "do not push a single thing from SUBPLAN_SSL_FCC half-done exe"):
   - `SSL_FCC_FILES` = `clients/encore/specs/locations/location-shared-setup-locations.spec.ts`, `clients/encore/src/data/testdata/locations/location-shared-setup-locations.data.ts`, `clients/encore/src/pages/locations/location-shared-setup-locations.page.ts`
   - Print to user, in order:
     - `git log --oneline -5 -- $SSL_FCC_FILES` (last 5 commits touching any SSL_FCC file)
     - `git diff --stat HEAD -- $SSL_FCC_FILES` (per-file uncommitted change count)
     - Suggest baseline candidate: `git log --oneline --all --grep="commit SSL spec.data state from prior closure" | head -3` (auto-suggests `82b5ecc` or similar)
     - Per baseline candidate: `git diff <baseline-SHA> HEAD -- $SSL_FCC_FILES | wc -l`
   - **Decision criterion** (one-line plain-English aid): "HEAD is clean if (i) commits since baseline are NOT named for SSL_FCC work, AND (ii) bundle smoke test (Phase 3 step 10 — `tsc --noEmit`) will pass on HEAD's SSL files unchanged. If unsure, pick (b) — overlay is cheap, contamination is expensive."
   - **ASK USER** (mandatory before Phase 1):
     ```
     "Last commit touching SSL files is <SHA-HEAD> '<message>'.
      Working tree has <N> uncommitted lines across SSL_FCC files (these will NOT ship — git archive reads HEAD only).
      Suggested clean baseline: <SHA> '<message>'. Divergence at HEAD vs baseline: <M> lines.

      Is HEAD's SSL state safe to ship to demo branch?
        (a) HEAD is clean (commits since baseline are non-SSL_FCC + would compile cleanly) — proceed
        (b) HEAD contains partial SSL_FCC work — provide baseline SHA; I'll overlay 3 files in bundle from that SHA
        (c) Unsure — abort, investigate separately"
     ```
   - Quote user's exact answer into Evidence Audit. If (b), store `$SSL_FCC_BASELINE_SHA` for Phase 3 step 9 overlay.
2. **Pre-check remote branch**: `gh api repos/RutviK-JBS/encore_deliverables_test/branches/csv-spec-demo-2026-05-25` — if branch EXISTS (HTTP 200), HALT and ask user (force-push? append suffix? abort?). Never auto-force.
3. **`git status --porcelain`** check: working tree may be dirty (WIP from SSL_FCC + other pending subplans); does NOT block — `client:ship --force` per Phase 3 bypasses preflight; `git archive HEAD` ignores working tree.
4. **Sanity-grep** `BLOCKED-BY-PARITY-PATCH-SP00` in `clients/encore/specs/`, `clients/encore/src/`, `clients/encore/test_cases_csv/` (N21 — scope narrowed to non-plan paths; plan-doc references are intentional sibling-reversion history). Expected: **zero hits in these 3 dirs**. If non-zero, HALT and investigate sibling-revert state.
5. **Build Playwright JSON index** (N19, primary mapping source): `cd clients/encore && npx playwright test --list --reporter=json > "$REPORTS_DIR/playwright-list.json"`. Captures canonical TC IDs (351 unique per Round 10 N22 verification, expanded from templates) + `expectedStatus` (`skipped` ⟹ fixme/skip; `passed` ⟹ active) + `annotations[]` (non-deterministic per N19; do not rely solely on it) + `projectId` (filter `setup` per N24). ~5 sec runtime, no browser launch.
6. **Build fixme registry** (M4 hybrid reuse): `node scripts/scan-fixmes.ts` — generates `reports/fixme-registry.json` for `// FIXME` and `// NOT-AUTOMATABLE` comment reasons (registry does NOT extract `test.fixme(true, '<reason>')` 2nd-arg text per scan-fixmes.ts:154-171; augment script falls back to source-file regex for those). ~2 sec runtime.
7. **Emit Drift Note** at `$REPORTS_DIR/drift-note.md` (per-claim verdict; >30% scope stale → HALT).

---

## Phase 1 — Augment all 10 source CSVs in-place with 3 new columns

**Augment script architecture** (~150 LOC pure Node ESM, lives at `${os.tmpdir()}/sp00-script-<ts>/sp00-augment.mjs` — never in framework repo; P16 + M2 lock):

**Inputs**:
- `$REPORTS_DIR/playwright-list.json` (Phase 0 step 5)
- `reports/fixme-registry.json` (Phase 0 step 6)
- `clients/encore/specs/**/*.spec.ts` (source files read at JSON-reported `location.file:line` for `test.fixme(true, '<reason>')` extraction)
- `clients/encore/test_cases_csv/*.csv` (10 files; read + write back in-place)

**Outputs**:
- Modified `clients/encore/test_cases_csv/*.csv` (10 files; 12 columns; ALL rows preserved + 3 new cols at end)
- `$REPORTS_DIR/manifest.json` (per-module: `{csv_rows, automated_yes, automated_no, pass, fail, not_automated}`)
- `$REPORTS_DIR/red-flags.md` (7 genuinely-new patterns missed by `cleanMarkdown` + `verify-no-forbidden`)

**Per-row mapping logic** (architecture per M3 decision — Playwright JSON authoritative, NOT TestCase MD fields):

```javascript
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// === Inline RFC 4180 CSV parser + writer (RF-2 fix: csv-parse/sync + csv-stringify/sync NOT in root package.json,
// NOT in clients/encore/package.json, NOT in any node_modules; script in /tmp/ cannot resolve from repo's node_modules
// because Node module resolution walks up from script location, not cwd. ~35 LOC, no deps.) ===
function parseCSV(text) {
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);  // strip BOM
  const rows = []; let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i+1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQ = false; }
      else { field += c; }
    } else {
      if (c === '"') { inQ = true; }
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\r') { /* skip */ }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else { field += c; }
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).filter(r => r.some(f => f !== '')).map(r => {
    const obj = {};
    headers.forEach((h, idx) => obj[h] = r[idx] !== undefined ? r[idx] : '');
    return obj;
  });
}
function csvEscape(s) {
  s = String(s == null ? '' : s);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function stringifyCSV(records, headers) {
  const lines = [headers.map(csvEscape).join(',')];
  for (const r of records) lines.push(headers.map(h => csvEscape(r[h])).join(','));
  return '﻿' + lines.join('\n') + '\n';  // BOM-preserved + trailing newline
}

// === 1. Build SPEC_INDEX from Playwright JSON ===
const json = JSON.parse(fs.readFileSync(REPORTS_DIR + '/playwright-list.json', 'utf-8'));
const SPEC_INDEX = {};  // { tcId: { mode, file, line } }

function walkSuite(suite) {
  for (const spec of suite.specs || []) {
    const tcMatch = (spec.title || '').match(/^(TC-[A-Z0-9-]+):/);
    if (!tcMatch) continue;
    const tcId = tcMatch[1];
    for (const test of spec.tests || []) {
      if (test.projectId === 'setup') continue;  // N24 filter
      const isSkipped = test.expectedStatus === 'skipped';
      SPEC_INDEX[tcId] = {
        mode: isSkipped ? 'fixme' : 'active',
        file: spec.file,
        line: spec.line
      };
      break;  // first test entry per spec (multi-project entries are duplicates)
    }
  }
  for (const child of suite.suites || []) walkSuite(child);
}
for (const root of json.suites || []) walkSuite(root);

// === 2. Build REASON_MAP from registry + source regex ===
const REASON_MAP = {};  // { tcId: scrubbed reason text }

// Step A: from fixme registry (// FIXME comments — M4 partial reuse)
const registry = JSON.parse(fs.readFileSync('reports/fixme-registry.json', 'utf-8'));
for (const entry of registry) {
  if (entry.reason && entry.reason !== 'test.fixme() call in spec') {
    REASON_MAP[entry.tcId] = scrubReason(entry.reason);
  }
}

// Step B: from source regex for test.fixme(true, '<reason>') — N19 fallback
for (const [tcId, idx] of Object.entries(SPEC_INDEX)) {
  if (idx.mode !== 'fixme' || REASON_MAP[tcId]) continue;
  if (!idx.file || !idx.line) continue;
  const sourcePath = path.join('clients/encore', idx.file);
  if (!fs.existsSync(sourcePath)) continue;
  const lines = fs.readFileSync(sourcePath, 'utf-8').split('\n');
  // Search ±5 lines from JSON-reported location for test.fixme(true, '...')
  for (let i = Math.max(0, idx.line - 5); i < Math.min(lines.length, idx.line + 5); i++) {
    const m = lines[i].match(/test\.fixme\s*\(\s*true\s*,\s*['"]([^'"]+)['"]\)/);
    if (m) {
      REASON_MAP[tcId] = scrubReason(m[1]);
      break;
    }
  }
}

// === 3. Scrub function: BUG-IDs + framework-internal markers (P12 decision 2) ===
// Note (M6 clarification): stripInternalTags in to-csv.ts:298 strips MD section markers (Automatable/MCP_VERIFICATION_LOG/etc.), NOT BUG-IDs. Different concern. Augment owns BUG-ID scrub.
function scrubReason(text) {
  return text
    .replace(/^FIXME\(BUG-[A-Z0-9-]+\):\s*/i, '')                            // strip leading FIXME(BUG-XXX): prefix
    .replace(/\bBUG-[A-Z0-9-]+\b/g, 'the app bug')                            // inline BUG-IDs → generic
    .replace(/\bSHR-DIV-\d+\b/g, '')                                          // strip divergence IDs
    .replace(/\b(PLAN_[A-Z0-9_]+|SUBPLAN_[A-Z0-9_]+|SP-[A-Z]+-\d+)\b/g, '')   // strip plan refs (matches verify-no-forbidden MARKER_GREP_CLIENT_ONLY)
    .replace(/\b(HUNTER|GIVER|BUILDER|HEALER|WATCHDOG|GARDENER|OWNER)\b/g, '') // strip agent codenames
    .replace(/\bJBS\b/g, '')                                                  // strip company-internal
    .replace(/\s+/g, ' ')                                                     // collapse whitespace
    .trim();
  // KEEP TC-XXX-NNN test case IDs — useful cross-references for colleague
}

// === 4. Augment each CSV ===
const csvDir = 'clients/encore/test_cases_csv';
const csvFiles = fs.readdirSync(csvDir).filter(f => f.endsWith('.csv'));
const NEW_COLS = ['Automated', 'Automation Execution', 'If Failed Reason of Failure'];
const manifest = {};

for (const f of csvFiles) {
  const filepath = path.join(csvDir, f);
  const content = fs.readFileSync(filepath, 'utf-8');
  const records = parseCSV(content);  // RF-2 fix: inline parser, no csv-parse/sync dep
  const inputRowCount = records.length;
  
  const moduleStats = { csv_rows: 0, automated_yes: 0, automated_no: 0, pass: 0, fail: 0 };
  
  for (const row of records) {
    const tcId = row['TC ID'];
    if (!tcId) continue;
    moduleStats.csv_rows++;
    const idx = SPEC_INDEX[tcId];
    if (!idx) {
      row['Automated'] = 'No';
      row['Automation Execution'] = '';
      row['If Failed Reason of Failure'] = '';
      moduleStats.automated_no++;
    } else {
      row['Automated'] = 'Yes';
      moduleStats.automated_yes++;
      if (idx.mode === 'fixme') {
        row['Automation Execution'] = 'Fail';
        row['If Failed Reason of Failure'] = REASON_MAP[tcId] || 'See spec for blocker details';
        moduleStats.fail++;
      } else {
        row['Automation Execution'] = 'Pass';
        row['If Failed Reason of Failure'] = '';
        moduleStats.pass++;
      }
    }
  }
  
  // Inline self-validation (S1 — replaces Phase 1.5 subagent per Round 9)
  const headerKeys = Object.keys(records[0] || {});
  // RF-4 fix: assert NEW col NAMES present (not total count) — post-pipeline-regen schema has 13+ cols
  // (10 to-csv.ts human-export cols + 3 new); count-based assert was brittle. Name-based is regen-safe.
  for (const col of NEW_COLS) assert(headerKeys.includes(col), `${f}: missing new col "${col}"`);
  assert(headerKeys.length >= 12, `${f}: expected >=12 cols (9 pre-regen base + 3 new, OR 10 post-regen base + 3 new), got ${headerKeys.length}`);
  for (const row of records) {
    if (!row['TC ID']) continue;
    assert(['Yes', 'No'].includes(row['Automated']), `${f}: invalid Automated=${row['Automated']}`);
    assert(['Pass', 'Fail', ''].includes(row['Automation Execution']), `${f}: invalid Execution=${row['Automation Execution']}`);
    if (row['Automated'] === 'No') {
      assert(row['Automation Execution'] === '' && row['If Failed Reason of Failure'] === '',
        `${f} TC-${row['TC ID']}: orphan status (Automated=No must have empty Execution+Reason)`);
    }
  }
  
  const outputHeaders = Object.keys(records[0] || {});  // preserves insertion order: original cols + 3 new appended
  const output = stringifyCSV(records, outputHeaders);  // RF-2 fix: inline writer, no csv-stringify/sync dep
  fs.writeFileSync(filepath, output, 'utf-8');
  
  const outputRowCount = parseCSV(fs.readFileSync(filepath, 'utf-8')).length;
  assert(inputRowCount === outputRowCount, `${f}: row count drift ${inputRowCount}→${outputRowCount}`);
  
  manifest[f] = moduleStats;
}

fs.writeFileSync(REPORTS_DIR + '/manifest.json', JSON.stringify(manifest, null, 2));
```

**Cross-platform** (N20 fix): all file operations via Node `fs`/`path`/`os`. No shell `cp`/`cmp`/`find`/`rm`. Augment script handles backup-safety via `git checkout --` in Phase 2 reject path; no `$ORIG_DIR` /tmp backup needed (S2 — git history is the authoritative pre-state).

**Supplementary red-flag scan** (7 genuinely-new patterns; the 6 redundant ones — agent codenames, smart quotes, leading/trailing ws, double-space, internal paths, markdown bold/backticks — already handled by `cleanMarkdown` + `sanitizeUnicode` + `verify-no-forbidden`):
- `BUG-[A-Z0-9-]+` (internal bug IDs — sanity check that scrub worked)
- `\bNM-\d+\b` (Jira-like internal IDs)
- `\b(CLEANUP REQUIRED|BLOCKED-BY|OMITTED-BUG|SKIP-BILLING)\b` (automation directives leaked into test text)
- `\b(MCP|Playwright CLI|playwright-cli|BLOCKED-BY-PARITY-PATCH)\b` (framework jargon `cleanMarkdown` doesn't strip)
- Control chars `[\x00-\x08\x0B\x0C\x0E-\x1F]`
- BOM (0xFEFF) inside cell content (not at file head — head BOM is correct)
- Empty required cells (TC ID or Title blank)

Findings written to `$REPORTS_DIR/red-flags.md`. Verdict mode: produce augmented CSVs + reports; user reviews quality at Phase 2.

**Phase 1 verification** (NO subagent — inline self-validation per Round 9 S1 + N19 row checks):
- Source MDs + specs byte-unchanged: `git diff clients/encore/specs/ clients/encore/specs_planning/test-cases/` → empty
- Source CSVs changed: `git diff --stat clients/encore/test_cases_csv/` shows each CSV with non-zero line diff
- Each CSV has 12-col header (validated inline)
- Row counts preserved (validated inline)
- Reason cross-check: for each row where Reason is non-empty, scrubbed text appears in source file at SPEC_INDEX[tcId].location (validated inline)

---

## Phase 1.5 — Content cleansing pass (added 2026-05-25 mid-execution)

**Scope additions** (per "Mid-execution scope expansion" change-log entry):

1. **Notes CSV included** — augment now runs over 11 CSVs (script auto-discovers via `fs.readdirSync(CSV_DIR)`). Restored CSV inherits same 3 new cols (Automated / Automation Execution / If Failed Reason of Failure) → 10 → 13 cols.

2. **Content cleanse — automatic (privacy / professionalism)**:
   - Strip `MCP-verified YYYY-MM-DD` / `(MCP-N)` / `(MCP-N.N)` markers from any cell — internal verification timestamps; should not ship
   - Strip `Corrected during generation YYYY-MM-DD` / `generation YYYY-MM-DD` — AI-script-generation metadata
   - Replace `MCP` / `Playwright CLI` / `playwright-cli` bare word references with neutral terms (or strip if standalone)
   - Replace `BUG-XXX-NNN` internal bug IDs with "the app bug" (already in `scrubReason` for fixme reasons; extend to all cell content)
   - KEEP `NM-NNNN` Jira IDs (legitimate cross-reference — per LR-008 frontmatter convention)
   - Strip `Planner expected error dialog ... actual app behavior is Save button disable, not error notification. Corrected during generation YYYY-MM-DD` — collapse to neutral expected-result text + flag for PO follow-up

3. **Content cleanse — user-judgment (Phase 2 HALT inputs)**:
   - `CLEANUP REQUIRED: ...` in Notes column (56 rows in `local_office_settings_test_cases.csv` per BAS-004..029 + 1 from `locations_account_address`) — operationally useful internally but reads as internal-tooling-jargon for colleague. User decides: STRIP / KEEP / move to dedicated column.
   - TC-LOC-CUR-013 testing-to-code anti-pattern — Expected Result was changed mid-2026 to match observed Save-disable behavior instead of asserting the documented error dialog. Per ALL-024 + LR-ENC-001 (old-site DOM is baseline truth), the correct action is one of: (a) revert Expected to error dialog + file BUG-LOC-CUR per LR-034, (b) document divergence as INTENTIONAL-UX-CHANGE with PO sign-off in REQUIREMENTS.md, or (c) `/encore-questions` escalation. SP00 will NOT silently retain the "corrected" text — needs user direction.
   - TC-LOC-CUR-010 MXN data-gap assertion — test asserts MXN has zero merchants in Office 1604, but Notes flag PO uncertainty. User decides: KEEP as-is with PO follow-up note / DEFER until PO clarifies / mark `Status: Blocked (Cat-A)` per PLN-013.

4. **Cleansing scope OUT** (deferred to future polish subplan, NOT SP00):
   - UI terminology normalization (reviewer found "Selected" vs "Is Default" inconsistencies) — needs DOM-walk per LR-007 + spec scan; out of SP00 offline scope.
   - Persistence test consolidation (TC-LOC-CUR-021..024 consolidation) — test-design change; needs PLAN_MD_CSV_SPEC_PARITY SP01..SP08 ownership.

5. **Acceptance** — pattern scan re-run (`inspect-patterns.mjs` equivalent) must show:
   - `mcp-verified-date` count = 0
   - `corrected-during-generation` count = 0
   - `framework-jargon-mcp` count = 0
   - `bug-ids` count = 0 (replaced with "the app bug")
   - `nm-jira-ids` count = unchanged (13 — kept intentionally)
   - `cleanup-required` count = per-user-direction (0 if STRIP, 56 if KEEP)

## Per-Identity Satisfaction (LR-048 v2 retroactive — added 2026-05-25 mid-execution)

SP00 declared `Identity: BUILDER` and is offline-only. Per the new LR-048 v2 matrix:

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline / REQUIREMENTS.md | (none) — offline CSV-only work, no nav2 walk | n/a |
| GIVER | test-cases.md / test-plans.md / CSV via planner:post-complete | (none) — parent PLAN_MD_CSV_SPEC_PARITY owns MD recovery; SP00 only mutates CSVs in-place; PO-input items flagged via `/encore-questions`, not silently rewritten | n/a — MDs are gitignored + locally absent (recovery is parent's job) |
| BUILDER | `clients/encore/test_cases_csv/*.csv` (11 files; +3 cols + content cleanse) | 11 augmented CSVs + cleanse pass + sanitized README_DEMO.md + orphan-push to demo branch | `grep -c MCP-verified clients/encore/test_cases_csv/*.csv → 0` AND `node scripts/verify-no-forbidden.mjs --target=$BUNDLE_DIR → exit 0` |
| HEALER | per-fix MD update | (none) — no test runs / fix loops in SP00 | n/a |
| WATCHDOG | findings table | (none) — SP00 is execute, not audit; `/audit:verify` ceremony task #29 will run | n/a |
| GARDENER | refactor citation | (none) — no structural refactor | n/a |

PO-input items (TC-LOC-CUR-013, TC-LOC-CUR-010) are recipient-classified per LR-040 §(c): user-flagged with named follow-up via `/encore-questions` Tier A — captured in SP00's Execution Summary at Phase 3.5 closure.

---

## Phase 2 — HALT for user QUALITY review

**Mapping correctness is structurally guaranteed** by Phase 1's authoritative sources (Playwright JSON for TC set/mode; source regex + fixme-registry for reason text) + inline self-validation. User does NOT need to check mapping — only review READABILITY of the 3 new columns.

1. Print to user:
   ```
   "10 source CSVs augmented in-place with 3 new columns (Automated/Automation Execution/If Failed Reason of Failure).
    Reports: $REPORTS_DIR/{manifest.json, red-flags.md, drift-note.md}
    Open the source CSV files directly to spot-check QUALITY (reason text readability).
    Approve to proceed with PERMANENT commit + bundle + push to csv-spec-demo-2026-05-25?
      (a) Approve — proceed to Phase 3 (PERMANENT commit follows; revert via `git revert HEAD` if you change your mind later)
      (b) Reject — restore working tree via `git checkout -- clients/encore/test_cases_csv/`; no commit, no push
      (c) Defer — keep augmented CSVs in place; come back later (Drift Check on re-run handles partial state)"
   ```
2. Quote user's exact answer into Evidence Audit
3. If (b) Reject: `git checkout -- clients/encore/test_cases_csv/` restores working tree from HEAD (S2 — git is the safety net; Phase 0 GATE-D0 verified clean pre-state); skip to Phase 7
4. If (c) Defer: exit subplan; user resumes by re-running `/execute SUBPLAN_PARITY_00_*`

---

## Phase 3 — Permanent commit + bundle + smoke test

1. `git add clients/encore/test_cases_csv/` (stage ONLY this path; NEVER `git add -A` or `git add .`)
2. **[STRICT-STAGE]** `git diff --cached --name-only | grep -v '^clients/encore/test_cases_csv/'` must return ZERO lines. If anything else is staged, HALT and inspect — SSL_FCC working-tree leak or other WIP must not enter this commit
3. `git commit -m "feat(encore): augment test case CSVs with automation status columns"` — commit lands on current working branch (typically `client_deliverable`); PERMANENT (no throwaway branch per S2)
4. **Post-commit sanity**: `git diff HEAD~1 HEAD --name-only` returns ONLY paths under `clients/encore/test_cases_csv/`
5. `TS=$(date +%s)`; `BUNDLE_DIR=${os.tmpdir()}/encore-demo-bundle-$TS`
6. `npm run client:ship -- --client=encore --out="$BUNDLE_DIR" --force` — **`--force` REQUIRED** (P1 / B1): `scripts/ship-client.sh:25-28` preflight rejects dirty working tree under `clients/encore/`, `src/`, `pipeline/`. Working tree IS dirty (SSL_FCC + other WIP). `--force` bypasses preflight, NOT the archive. Archive itself reads HEAD only (commit tree); working-tree dirt excluded from bundle regardless. **RF-3 fix**: SINGLE `--` only — `ship-client.sh:10-17` parses with `for arg in "$@"; case "$arg" in --client=*|--out=*|--force) ... ;; *) exit 2 ;; esac` — a bare `--` hits the `*)` catch-all and exits 2. npm passes everything after the first `--` directly to the script as args.
7. **Verify bundle paths** (P2 / B2): `scripts/ship-client.sh:42` does `git archive | tar -x --strip-components=2`, so `clients/encore/test_cases_csv/foo.csv` → `$BUNDLE_DIR/test_cases_csv/foo.csv` (NO `clients/encore/` prefix). Per-module verify in Node:
   ```javascript
   const moduleFiles = fs.readdirSync('clients/encore/test_cases_csv').filter(f => f.endsWith('.csv'));
   for (const f of moduleFiles) {
     const src = fs.readFileSync(path.join('clients/encore/test_cases_csv', f));
     const bundled = fs.readFileSync(path.join(BUNDLE_DIR, 'test_cases_csv', f));
     assert(Buffer.compare(src, bundled) === 0, `bundle path mismatch: ${f}`);
   }
   ```
8. **Verify gitignored exclusion**: `fs.existsSync(BUNDLE_DIR + '/specs_planning')` must be `false`. If `true`, HALT (gitignore broken)
9. **[CRITICAL] SSL_FCC bundle scrub** (conditional — only if Phase 0 step 1 returned `$SSL_FCC_BASELINE_SHA`):
   - For each `<file>` in `SSL_FCC_FILES` (in-repo paths), compute bundle path by stripping `clients/encore/` prefix
   - `git show $SSL_FCC_BASELINE_SHA:<file> > "<bundle-relative-path>"` (overlay baseline)
   - Byte-equality verify: read both, `Buffer.compare === 0`
   - Log to `$BUNDLE_DIR/scrub-log.txt`: per-file `{in_repo_path, bundle_path, before_sha, after_sha, baseline_sha, reason: "SSL_FCC contamination guard per 2026-05-25 directive"}`
10. **[CRITICAL] Bundle smoke test** (ALWAYS runs):
    - `cd "$BUNDLE_DIR" && npx tsc --noEmit` — must exit 0 (`ship-client.sh:54` already ran `npx playwright test --list`; tsc adds static-typecheck layer for contamination/missing-import detection)
    - If tsc fails: HALT — log stderr to `$BUNDLE_DIR/smoke-test.log`; DO NOT push; user can pick different baseline or abort
11. Add `$BUNDLE_DIR/README_DEMO.md` — **sanitized template (no internal tokens per B3 / P3)**:
    ```
    # Encore Test Case CSV Snapshot — 2026-05-25
    
    Frozen snapshot of test-case CSVs for review. Files at `test_cases_csv/`.
    
    Columns:
    - Automated (Yes/No): whether an automated test exists for this case
    - Automation Execution (Pass/Fail/empty): outcome based on current spec state (Pass = active in suite; Fail = test marked as known-blocked)
    - If Failed Reason of Failure: extracted from spec annotation for known-blocked tests
    
    Pass = last known-green code state, not live run (e2e env was offline at snapshot time).
    Coverage reflects current automated test set; some planned cases may not be automated yet.
    Smoke tested: tsc --noEmit + playwright test --list both PASS.
    
    Contact: Encore automation team
    ```
    **Forbidden tokens** (auto-scanned by step 12 — `scripts/verify-no-forbidden.mjs:70-98` `MARKER_GREP_CLIENT_ONLY`): `SUBPLAN_*`, `PLAN_*`, `SP-*-*`, agent codenames, `RutviK-JBS`, `encore_deliverables_test`, framework path leaks, `IntelliQE`, `.claude/`, `specs_planning/`, `JBS`, personal names. **RF-5 fix**: Contact line uses generic "Encore automation team" placeholder (replaces prior "Rutvik @ JBS" which triggered `\bJBS\b` deny-list pattern at verify-no-forbidden.mjs:88). Sanitized template above passes verify-no-forbidden scan.
12. **[CRITICAL] Post-README verify-no-forbidden re-scan** (B3 / P3): `node scripts/verify-no-forbidden.mjs --target="$BUNDLE_DIR"` — must exit 0. If non-zero, HALT — sanitize README further OR fix other leak; re-run

---

## Phase 4 — HALT for push confirmation (second user gate)

1. Print to user: "Bundle ready at `$BUNDLE_DIR`. Smoke tests PASS. Working branch has 1 permanent commit (`feat(encore): augment test case CSVs...`). About to orphan-init bundle dir + push to `csv-spec-demo-2026-05-25` on `encore_deliverables_test`. Approve push?"
2. Quote answer into Evidence Audit
3. If rejected: skip to Phase 6 (don't push; commit stays on working branch — user can `git revert HEAD` later)

---

## Phase 5 — Orphan-branch push (P8 pattern, matches `PLAN_PUSH_NOTES_LATEST` precedent)

**Pattern rationale**: Orphan branch (no shared history) shows reviewer just-the-snapshot, no churn-diff vs `main`. Matches the `notes-latest` push pattern from 2026-05-19.

1. **Orphan-branch init inside bundle dir**:
   ```bash
   cd "$BUNDLE_DIR"
   git init -b csv-spec-demo-2026-05-25   # N25 — renamed from `notes-SSL-csv` per Y3 (visual distance from existing `notes-SSL` branch on remote)
   git add -A                              # stage everything in bundle (CSVs, specs, src, README_DEMO.md, .github/, etc.)
   git status                              # print summary to user before commit
   ```
2. **Verify staging cleanliness** (S3 — auditor says no ambiguity to verify, but cheap defense-in-depth): `git ls-files --cached | wc -l` matches `find $BUNDLE_DIR -type f | wc -l`
3. **Commit**:
   ```bash
   git commit -m "Encore test case CSV snapshot — 2026-05-25"
   # Sanitized — no SUBPLAN/PLAN tokens, no personal names per B3/P3 deny-list
   ```
4. **Remote add + push** (orphan; no force needed because branch is fresh; Phase 0 step 2 verified absent):
   ```bash
   git remote add origin https://github.com/RutviK-JBS/encore_deliverables_test.git
   git push -u origin csv-spec-demo-2026-05-25
   ```
5. **Verify push landed**: `gh api repos/RutviK-JBS/encore_deliverables_test/branches/csv-spec-demo-2026-05-25 | jq .name` returns `"csv-spec-demo-2026-05-25"`
6. **Print URL to user**: `https://github.com/RutviK-JBS/encore_deliverables_test/tree/csv-spec-demo-2026-05-25`

---

## Phase 6 — Verify final state (NO REVERT)

If Phase 2 was Approve path (commit made):

1. `cd <framework-repo-root>` (return from `$BUNDLE_DIR` where Phase 5 orphan-branch push ran)
2. `git rev-parse --abbrev-ref HEAD` shows working branch (still on it — never switched)
3. `git log -1 --oneline` shows augment commit: `feat(encore): augment test case CSVs with automation status columns`
4. `git diff HEAD~1 HEAD --name-only | grep -v '^clients/encore/test_cases_csv/'` returns ZERO lines (CSV-only diff)
5. `git status` clean for `clients/encore/test_cases_csv/`
6. `git ls-files --others --exclude-standard | grep -E '(sp00-|orig-csvs)'` → empty (no SP00 artifacts in framework repo — all live in `os.tmpdir()`)
7. Each source CSV has 12 cols: read header line; assert split-by-comma length equals 12

If Phase 2 was Reject path (no commit made):

1. `git checkout -- clients/encore/test_cases_csv/` already ran in Phase 2; verify `git status clients/encore/test_cases_csv/` → empty
2. `git rev-parse HEAD` matches pre-SP00 HEAD (no commit was added)
3. Skip to Phase 7

---

## Phase 7 — Tmp cleanup

Cross-platform (N20): all delete ops in Node:

```javascript
// Prefix-validate each path before delete (paranoid safety)
const tmpRoot = os.tmpdir();
for (const dir of [SCRIPT_DIR, REPORTS_DIR, BUNDLE_DIR]) {
  if (dir.startsWith(tmpRoot) && (dir.includes('sp00-script-') || dir.includes('sp00-reports-') || dir.includes('encore-demo-bundle-'))) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
// Verify gone
for (const dir of [SCRIPT_DIR, REPORTS_DIR, BUNDLE_DIR]) {
  assert(!fs.existsSync(dir), `cleanup failed: ${dir} still exists`);
}
```

No `$ORIG_DIR` to delete (S2 — git history is the backup, not a /tmp dir).

---

## Scope (OUT)

- Edits to source MD / specs / src / page-objects / data files (SP01..SP08 territory)
- Persistent script in framework repo (script lives in `os.tmpdir()` only, never in repo)
- Stub-related anything (`.fixme` stubs in specs; `BLOCKED-BY-PARITY-PATCH-SP00` markers in non-plan paths) — directionally reversed
- Spec scaffold creation (left_panel = SP07; notes-history = future)
- New LR-NNN — augment-and-push workflow encoded in this subplan IS the recipe
- Pushing to any branch other than `csv-spec-demo-2026-05-25` on `encore_deliverables_test`; force-pushing (HALT if branch pre-exists)
- **Triggering GitHub Actions workflow** (Y5 / P7): `SHIP_TO_ENCORE.md:50-54` does this for green-suite verification; SP00 SKIPS (demo is for CSV review, not test run). User can manually trigger: `gh workflow run playwright-tests.yml --repo RutviK-JBS/encore_deliverables_test --ref csv-spec-demo-2026-05-25`
- Reverting source CSVs after push — augmented CSVs are PERMANENT; refresh model = re-run SP00 when pipeline auto-regen (`scripts/planner-post-complete.ts:21`) wipes data
- Using TestCase MD fields (`automationStatus`, `currentResult`, `knownIssues` — M3 / `export_test_cases/types.ts:98,124,126,127`) to populate the new CSV cols. These are MD-source INTENT, not REALITY. Augment uses Playwright JSON for ground truth. SimpleTestCase interface UNCHANGED.

---

## Acceptance Criteria

- [ ] Phase 0: GATE-D0 passed (7 sub-checks including no-uncommitted-CSVs + to-csv.ts COLUMNS validation); Drift Note emitted; SSL_FCC contamination question asked + answer quoted; Playwright JSON built (351 unique TCs expected); fixme registry built via `node scripts/scan-fixmes.ts`
- [ ] Phase 1: augment script in `os.tmpdir()` (never in framework repo); **11 CSVs** augmented with 3 new cols (Automated, Automation Execution, If Failed Reason of Failure) — was 10, expanded to 11 mid-execution per Notes CSV restoration; row counts preserved per CSV; inline self-validation PASS (≥12-col header per CSV; valid enum values; orphan-status check; reason cross-check)
- [ ] Phase 1.5: content cleanse PASS — `MCP-verified` count = 0; `Corrected during generation` count = 0; framework jargon (`MCP`/`Playwright CLI`/`playwright-cli`) count = 0; `BUG-XXX-NNN` internal IDs replaced with "the app bug"; `NM-NNNN` Jira refs preserved unchanged; `CLEANUP REQUIRED` disposition per user direction; PO-input items (TC-LOC-CUR-013, TC-LOC-CUR-010) flagged for `/encore-questions` follow-up in Execution Summary
- [ ] Phase 1 source unchanged: `git diff clients/encore/specs/ clients/encore/specs_planning/test-cases/` → empty
- [ ] Phase 2 HALT presented + user answer quoted; if (b) Reject, `git checkout` restored cleanly
- [ ] Phase 3 STRICT-STAGE PASS (only `test_cases_csv/` staged); permanent commit on working branch with CSV-only diff; `client:ship --force` produced bundle; SSL_FCC scrub applied if user chose (b); bundle smoke test `tsc --noEmit` PASS; README_DEMO.md added; post-README `verify-no-forbidden --target` exit 0
- [ ] Phase 4 push-confirmation HALT presented + answer quoted
- [ ] Phase 5 remote branch `csv-spec-demo-2026-05-25` exists on `RutviK-JBS/encore_deliverables_test`; no force-push (Phase 0 step 2 confirmed branch absent)
- [ ] Phase 6 (Approve path): working branch has 1 augment commit; `git status` clean; no SP00-created files in repo; 12-col headers verified. (Reject path): source CSVs byte-identical to pre-SP00 HEAD
- [ ] Phase 7 all temp dirs deleted (verified via `fs.existsSync` returning false)
- [ ] **Post-execution invariants**: repo-wide grep `BLOCKED-BY-PARITY-PATCH-SP00` in non-plan paths → 0 hits; LR-049 compliance (`client:ship --force`, not `cp -r`); LR-055 closure gate PASS (or override entry); LR-028 activity log entry citing pushed branch URL

---

## Reflect + Graduate

Zero new LR-NNN. Permanent-augment + push workflow is a one-off recipe encoded in this subplan; future re-runs follow this file. Pre-graduate grep confirmed (no matching rule in `agent-mistakes.md` / `LEARNED_RULES.md` / `.claude/rules/*.md` / `feedback_*.md` / `clients/encore/CLAUDE.md` / root `CLAUDE.md`).

**Reflection table** (emit in `/final-q`):

| Root-cause mistake | Existing learning | Action |
|---|---|---|
| Initial design used throwaway+revert when user wanted permanent (P13 pivot) | SUPREME `NEVER ASSUME` (root CLAUDE.md) | No new rule; subplan models ASK-FIRST (2 HALT gates) |
| Prior CSV exporter overlook (~350 LOC custom script vs ~120 LOC reuse) (P9) | `feedback_self_first_research.md` (introspect → repo → web → Rutvik) | No new rule; reuse path locked in P9 reflection |
| Single-direction (DEEP) audit missed BROAD grep findings (Round 10 vs Round 11 complementarity) | None | Add framework checklist (TODO at low priority): "CSV-generator audits must pair DEEP single-file analysis + BROAD grep sweep" — escalate to `.claude/rules/specs.md` if seen 2nd time |

Anti-duplicate scan: >70% similarity to existing entry → rollback to structural escalation only.

---

## Closure

- LR-028 activity log entry citing pushed branch URL
- LR-049 compliance noted (`client:ship --force`, not `cp -r`)
- LR-055 closure: `node scripts/validate-plan-closure.mjs --enforce --plan plans/done/SUBPLAN_PARITY_00_OFFLINE_CSV_SPEC_PARITY_PATCH.md --json` PASS, OR `.claude/closure-overrides.json` entry
- LR-027 parent-cascade: SP00 is NOT last subplan; parent PLAN closure waits for SP08
- `git mv` to `plans/done/`; `npm run plans:reindex`; closure manifest at `plans/_closure_manifests/SUBPLAN_PARITY_00_OFFLINE_CSV_SPEC_PARITY_PATCH.md.manifest.json`
- **Informational closure note** (M7): 3 new cols mirror what `to-jira.ts:23-36` Jira export already exposes for the same TCs — colleague's Excel ask aligns with existing Jira convention

---

## Handoff (chat-only per `feedback_handoff_in_chat_only.md`)

Rutvik will:
1. Trigger `/execute SUBPLAN_PARITY_00_OFFLINE_CSV_SPEC_PARITY_PATCH` (manual, NOT `/chain` — has internal user gates)
2. Answer SSL_FCC contamination question at Phase 0 (option a, b, or c)
3. Spot-check augmented CSVs in `clients/encore/test_cases_csv/` at Phase 2 HALT; approve/reject/defer based on QUALITY review (mapping correctness is structurally guaranteed by inline validation)
4. Confirm push at Phase 4 HALT; URL printed to chat at Phase 5 step 6
5. Verify working branch has 1 augment commit at Phase 6 exit
6. Out-of-band: share `https://github.com/RutviK-JBS/encore_deliverables_test/tree/csv-spec-demo-2026-05-25` with Encore colleague

If any HALT fires → Claude pauses, Rutvik decides next step in chat.
