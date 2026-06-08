// One-off: build the all-in-one encore-qa-tracker.csv from the existing
// bugs-for-encore-qa CSV. Preserves existing 12 bugs + 10 questions byte-for-byte
// (line-injection, no re-parse), inserts 4 new product-bug rows, 1 new question,
// and a TEST RUN FINDINGS section. Run from repo root.
import fs from 'fs';

const SRC = 'clients/encore/exports/bugs-for-encore-qa-2026-05-14.csv';
const OUT = 'clients/encore/exports/encore-qa-tracker.csv';

const raw = fs.readFileSync(SRC, 'utf8');
const lines = raw.split(/\r?\n/);
while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();

// Sanity (no assumptions): verify the shape we expect before mutating.
if (!lines[0].startsWith('"#","Bug"')) throw new Error('header row not as expected: ' + lines[0]);
if (!lines[14] || !lines[14].includes('QUESTIONS FOR ENCORE')) throw new Error('questions separator not at idx14: ' + lines[14]);
if (lines.length !== 26) throw new Error('expected 26 content lines, got ' + lines.length);

const header = lines[0];          // column header
const bugs = lines.slice(1, 13);  // 12 existing bug rows (#1-#12)
const rest = lines.slice(13);     // blank + questions section + Q1..Q-NEW-1 (10)

const newBugs = [
  '"13","Location Settings → Shared Setup Locations — Change Local Office dialog and per-row Delete behave incorrectly after add+save+reload (umbrella)","1. Open /navigator/locations/1604/settings/location → Shared Setup Locations. 2. Add a location, Save, reload. 3a. Click a row Delete — it does not respond. 3b. Reopen the Add dialog and search the just-added number — it still appears instead of being hidden. 3c. Search 1233 — a phantom empty row appears (Miami-region offices excluded from the lookup). 3d. Toggle Shares Inventory back to original on an added row — Save stays enabled at net-zero.","Per-row Delete clicks no-op after reload; the dialog does not exclude already-added locations and drops Miami-region offices; net-zero edits leave the form dirty.","Per-row Delete works after reload; the dialog excludes already-added locations and includes valid offices; reverting to original disables Save.","BUG-LOC-SHR-001 (referenced in tests; no JSON file yet)","Blocks 9 tests: TC-LOC-SSL-007/026/030/031/032/041/042/043/044. User-verified 2026-05-22; related baseline divergence SHR-DIV-006. TC-LOC-SSL-024 (already-added exclusion) is the same dialog area and currently fails live."',
  '"14","Location Settings → Pricing — several fields do not persist after save; one save path returns HTTP 500","1. Open /navigator/locations/1604/settings/location → Pricing. 2. Change a pricing dropdown and Save, then reload. 3. Set a valid date and Save, then reload. 4. Uncheck Corporate Pricing and Save, then reload.","Pricing dropdowns: POST update-location-pricing returns HTTP 500 and the value reverts. Dates do not persist after save+reload. Corporate Pricing uncheck reverts to checked on reload although save returns 200.","Saved dropdowns, dates, and the Corporate Pricing checkbox persist after reload.","potential product bug — no ID/file yet","Blocks 7 tests: TC-LOC-PRI-020/025/026/027/028/029/030. Note: our save helper currently stops listening before the slow 500 returns (an our-side hardening item), but the 500 is the underlying blocker."',
  '"15","Location Settings → Account & Address — clearing optional Phone 2 is not saved; the prior value returns on reload","1. Open /navigator/locations/1604/settings/location → Account & Address. 2. Clear the Phone 2 field. 3. Save (it enables and reports success). 4. Reload — Phone 2 shows the prior value again.","Clearing Phone 2 and saving reports success, but the empty value is not persisted; the old value reappears on reload.","Clearing an optional field and saving persists empty; after reload Phone 2 is empty.","BUG-LOC-ACC-001","Filed at reports/bugs/BUG-LOC-ACC-001.json. Blocks TC-LOC-ACC-029. New-site-only surface (no old-site equivalent). A manual human clear reproduces it; an automated clear may not dirty the masked input."',
  '"16","Location Settings → Notes — the Delete control disappears when a single empty row remains, so the row cannot be removed","1. Open /navigator/locations/1604/settings/location → Notes. 2. With one note row, clear its textarea. 3. The row Delete button is no longer present in the page. 4. The empty row cannot be deleted.","After clearing the only row text, the Delete button vanishes from the DOM; the row cannot be removed.","Delete stays available on the single remaining row; clicking it removes the row and the empty state persists after save+reload.","BUG-LOC-NTS-004","Filed at reports/bugs/BUG-LOC-NTS-004.json. Blocks TC-LOC-NTS-062. New-site-only multi-row Notes form-array (the old site is a single textarea with no rows/delete)."',
];

const newQuestion =
  '"Q-NEW-2","Should the Change Local Office dialog hide locations that are already added? Today an already-added location still appears in the dialog. (Also: is excluding Miami-region offices from the lookup intended?)","TC-LOC-SSL-024 + BUG-LOC-SHR-001","Product/UX intent on dialog filtering — treated as a UX improvement, not a hard defect","","",""';

const findings = [
  '"","","","","","",""',
  '"--- TEST RUN FINDINGS (2026-06-01 — 2 clean full runs, 1 worker, 369 functional tests) ---","","","","","",""',
  '"#","Item","Detail","Status","Reference","",""',
  '"F1","Run summary","369 functional tests: 328 passed first try in both runs; 4 fail every run; 15 flaky (pass on retry); 22 skipped (intentional). Auth and full-suite completion verified on both runs.","stable","2 clean runs 2026-06-01","",""',
  '"F2","Test fix (our side) — TC-LOC-SSL-035","Clear-search restore bound lowered 3000 → 2000; the dialog renders a stable ~2653-row ceiling so the old bound was unreachable. Documented in code; not re-run per request.","fixed (our side)","SEARCH_BULK_LOWER_BOUND","",""',
  '"F3","Test items (our side) — TC-LOS-HIS-006, TC-LOC-MGH-015","The read-only check counts the paginator page-number input as editable; the history data itself is read-only. Set to fixme, deferred to the History cases rework.","deferred (our side)","HIST rework","",""',
  '"F4","Skipped — blocked by product issues (20 tests)","SSL family 9 (BUG-LOC-SHR-001); Pricing 7 (potential pricing bug); ACC-029 (BUG-LOC-ACC-001); NTS-062 (BUG-LOC-NTS-004); LOS-BAS-048 (BUG-LOC-LOS-001); MGH-019 (BUG-LOC-MGH-001).","waiting on Encore","see bug rows above","",""',
  '"F5","Skipped — data prerequisite (2 tests)","TC-LOC-MGH-006 and TC-LOC-MGH-007 need a location with <=20 / 0 history rows; office 1604 has 2900+. Not a product issue; needs a test fixture.","our side (fixture)","TC-LOC-MGH-006/007","",""',
  '"F6","Flaky — pass on retry (15 tests)","Notes form-array: NTS-028/031/032/039/046/047/059. Account List dialog: ACC-004/030/020. Save/dirty races: LI-021-029, CUR-021, BAS-006, BAS-065, MGH-008. Timing/Radix; self-recover on retry.","monitoring (our side)","—","",""',
];

const out = [header, ...bugs, ...newBugs, ...rest, newQuestion, ...findings];
fs.writeFileSync(OUT, out.join('\n') + '\n', 'utf8');
console.log('wrote', OUT, 'rows:', out.length);
