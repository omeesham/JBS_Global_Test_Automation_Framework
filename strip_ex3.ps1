Set-Location C:\Users\RutvikKhorasiya\projects\encore_framework
$report = [System.Collections.Generic.List[string]]::new()

function DoFile($rel, $reps) {
    $path = Join-Path (Get-Location) $rel
    $raw = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $new = $raw
    foreach ($r in $reps) { $new = $new -replace $r[0], $r[1] }
    if ($new -ne $raw) {
        [System.IO.File]::WriteAllText($path, $new, (New-Object System.Text.UTF8Encoding $false))
        $script:report.Add("| ``$rel`` | (multi) | NM/process refs removed | batch regex |")
    }
}

# 1 corporate-override-core.spec.ts
DoFile 'clients/encore/tests/corporate-override/corporate-override-core.spec.ts' @(
  @('\(NM-2272 graft\)', ''),
  @('\(NM-2273 graft\)', ''),
  @(' \(NM-1463\)', ''),
  @(' \(NM-2206\)', ''),
  @(' \(NM-1932\) @', ' @'),
  @(' \(NM-1932\)', ''),
  @(' \(NM-1940\)', ''),
  @('(?m)^[ \t]*// NM-1870 \("Current Price not displayed"\) not-reproduced[^\r\n]*[\r\n]*', ''),
  @('(?m)^[ \t]*// NM-1889 \("search matches unintended columns"\) not-reproduced[^\r\n]*[\r\n]*', ''),
  @('// NM-1463: editing', '// Editing'),
  @('(?m)^[ \t]*// === NM-2271 Gap-Closure: 62 new BVA[^\r\n]*[\r\n]*', ''),
  @(' NM-1870 / NM-1889 not-reproduced \(live verdicts recorded\)\.', '.'),
  @(', NM-1870 / NM-1889 not-reproduced \(live verdicts recorded\)', '')
)

# large deferred block in core spec (lines ~783-801)
$corePath = 'clients/encore/tests/corporate-override/corporate-override-core.spec.ts'
$coreRaw = [System.IO.File]::ReadAllText($corePath, [System.Text.Encoding]::UTF8)
$blockPat = '(?s)/\*\*\s*\* DEFERRED — NM-2273[^/]*?\*/'
$blockNew = '/* This test case is covered in the import spec; it verifies that an import CSV containing an empty Override Price is rejected. */'
$coreFixed = $coreRaw -replace $blockPat, $blockNew
$coreFixed = $coreFixed -replace "(?m)^[ \t]*// every run today and would silently start passing if NM-1940 were fixed, hiding the change\.[\r\n]*", ''
$coreFixed = $coreFixed -replace '\(NM-1940\)', ''
[System.IO.File]::WriteAllText((Join-Path (Get-Location) $corePath), $coreFixed, (New-Object System.Text.UTF8Encoding $false))

# 2 corporate-override-nm2271.spec.ts
DoFile 'clients/encore/tests/corporate-override/corporate-override-nm2271.spec.ts' @(
  @(' \(NM-2271\) @', ' @'),
  @(' \(NM-2271\)', '')
)

# 3 corporate-override-nm2270.spec.ts
DoFile 'clients/encore/tests/corporate-override/corporate-override-nm2270.spec.ts' @(
  @(' \(NM-2270\) @', ' @'),
  @(' \(NM-2270\)', '')
)

# 4 corporate-override-nm2272.spec.ts
DoFile 'clients/encore/tests/corporate-override/corporate-override-nm2272.spec.ts' @(
  @('Corporate Pricing Override — Export \(NM-2272 graft\)', 'Corporate Pricing Override — Export')
)

# 5 corporate-override-nm2273.spec.ts
DoFile 'clients/encore/tests/corporate-override/corporate-override-nm2273.spec.ts' @(
  @('Corporate Pricing Override — Import \(NM-2273 graft\)', 'Corporate Pricing Override — Import'),
  @(' \(NM-2186\)', ''),
  @(', NM-2186\)', ')')
)

# 6 corporate-override-nm2269.spec.ts
DoFile 'clients/encore/tests/corporate-override/corporate-override-nm2269.spec.ts' @(
  @(' \(NM-2269\) @', ' @'),
  @(' \(NM-2269\)', ''),
  @('// This office is the only walk-verified bed with inactive rows for the Active-only effect tests\.', '// This office has inactive rows for the Active-only effect tests.')
)

# 7 corporate-override-nm2268.spec.ts
DoFile 'clients/encore/tests/corporate-override/corporate-override-nm2268.spec.ts' @(
  @(' \(NM-2126\)', ''),
  @('; see NM-2126\]', ']'),
  @('(?m)^[ \t]*// Known behavior \(reviewer-confirmed\):', '// Known behavior:'),
  @('// PERMANENTLY NOT AUTOMATABLE — owner-confirmed 2026-07-20\.', '// PERMANENTLY NOT AUTOMATABLE.')
)

# 8 corporate-pricing-export-all.spec.ts
DoFile 'clients/encore/tests/corporate-pricing/corporate-pricing-export-all.spec.ts' @(
  @(' \(NM-2264\) @', ' @'),
  @(' \(NM-2264\)', ''),
  @('// NM-1997/1998: every Product Group Id unique', '// every Product Group Id unique'),
  @('// NM-1998', ''),
  @('round-trip \+ NM-2005 \(', 'round-trip ('),
  @('// NM-2005 \(a\): ', '// '),
  @('// NM-2005 \(b\): ', '// '),
  @('// NM-2005 applied to the labor scope: ', '// ')
)

# 9 corporate-pricing-import-all.spec.ts
DoFile 'clients/encore/tests/corporate-pricing/corporate-pricing-import-all.spec.ts' @(
  @('// Import ▾ All \(NM-2265\) — ', '// Import ▾ All — '),
  @(' \(NM-2265\) @', ' @'),
  @(' \(NM-2265\)', ''),
  @(', NM-2206\)\.', '.)'),
  @(', NM-2206\)', ')')
)

# 10 corporate-pricing-detail.spec.ts
DoFile 'clients/encore/tests/corporate-pricing/corporate-pricing-detail.spec.ts' @(
  @(' // no silent coercion \(watch: NM-2301\)', ''),
  @(' // marks the grid dirty \(NM-1874\)', ' // marks the grid dirty'),
  @(' // row B unaffected \(watch: NM-2095\)', ' // row B unaffected'),
  @('defect NM-1967 reproduced', 'known defect reproduced'),
  @('// KNOWN APP DEFECT \(NM-1967\):', '// KNOWN APP DEFECT:')
)

# 11 corporate-pricing-loc-export.spec.ts
DoFile 'clients/encore/tests/corporate-pricing/corporate-pricing-loc-export.spec.ts' @(
  @(' \(NM-2262\) @', ' @'),
  @(' \(NM-2262\)', '')
)

# 12 corporate-pricing-loc-import.spec.ts
DoFile 'clients/encore/tests/corporate-pricing/corporate-pricing-loc-import.spec.ts' @(
  @(' \(NM-2305\) @', ' @'),
  @(' \(NM-2305\)', ''),
  @('// grid re-renders, not left blank \(guards NM-2206\)', '// grid re-renders, not left blank')
)

# 13 location-left-panel-basic-information.spec.ts
DoFile 'clients/encore/tests/locations/location-left-panel-basic-information.spec.ts' @(
  @(' \(Encore NM-831/NM-1140\)', ''),
  @(' \(NM-831\)', ''),
  @(' \(NM-831 / NM-1140 — selectable only at creation\)\.', ' (selectable only at creation).'),
  @('NM-831 / NM-1140 — selectable', 'selectable')
)

# 14 corporate-override.page.ts
DoFile 'clients/encore/src/pages/corporate-override/corporate-override.page.ts' @(
  @('// --- Change Local Office picker helpers \(NM-2268, search-narrowing \+ Active checkbox\) ---', '// --- Change Local Office picker helpers (search-narrowing + Active checkbox) ---'),
  @('// --- Grid pagination \(NM-2271\) — icon buttons identified by aria-label ---', '// --- Grid pagination — icon buttons identified by aria-label ---'),
  @('// --- Unsaved-changes guard \(NM-2271\) ---', '// --- Unsaved-changes guard ---'),
  @('// --- Keyboard access to editable cells \(NM-2271\) ---', '// --- Keyboard access to editable cells ---'),
  @('// --- Currency-gated Product Group picker / drag-to-add \(NM-2271\) ---', '// --- Currency-gated Product Group picker / drag-to-add ---'),
  @('// --- Labor-tab equivalents of Equipment helpers \(NM-2271\) ---', '// --- Labor-tab equivalents of Equipment helpers ---'),
  @('// --- BVA navigation helpers \(NM-2271 lot contract\) ---', '// --- BVA navigation helpers ---'),
  @('// --- probeEditOracle: rejection/commit oracle \(NM-2271\) ---', '// --- probeEditOracle: rejection/commit oracle ---'),
  @('// ── NM-2272 graft: export / grid-status / search-panel methods ──', '// ── Export / grid-status / search-panel methods ──'),
  @('// ── NM-2273 graft: import methods ──', '// ── Import methods ──'),
  @('", NM-2186 — use a minimal file here\.\)', '" — use a minimal file here.)')
)

# 15 override.ts (data)
DoFile 'clients/encore/src/data/corporate-override/override.ts' @(
  @('\* behavior \(NM-1446 documents the mechanism, and the import dialog is titled "Import All Pricing', '* behavior (the import dialog is titled "Import All Pricing'),
  @('\* NM-1940 — ', '* '),
  @(' \(NM-2186\)', ''),
  @('\* Labor-tab mutation fixture \(NM-2271\) — ', '* Labor-tab mutation fixture — '),
  @('\* Populated Labor volume/pagination bed \(NM-2271\) — office 9460 Labor, verified live 2026-07-20:', '* Populated Labor volume/pagination bed — office 9460 Labor, verified live:'),
  @('\* Blank Override Price render bed \(NM-1932\) — ', '* Blank Override Price render bed — '),
  @('\* Currency-gated Product Group picker bed \(NM-2271 add-override flow\) — ', '* Currency-gated Product Group picker bed (add-override flow) — '),
  @('// --- NM-2271 BVA constants \(lot-worker API contract\) ---', '// --- BVA constants ---')
)

# 16 selectors/corporate-override/override.ts - check for NM refs (none listed, skip)

# 17 field-case-runner.ts (only JSDoc, skip the code line)
DoFile 'clients/encore/src/utils/field-case-runner.ts' @(
  @('\* Writes a tamper-evident receipt to `clients/encore/\.machine-evidence/reject-oracle/<caseId>\.json`\.', '* Writes a tamper-evident receipt to the `.reject-evidence/` directory for each rejected case.')
)

# 18 base.page.ts
DoFile 'clients/encore/src/pages/base.page.ts' @(
  @('\* Cross-field validation \(e\.g\. NM-1264\) fires', '* Cross-field validation fires')
)

# 19 corporate-pricing-search.page.ts
DoFile 'clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts' @(
  @('/\*\* Parsed result of a CSV file download \(NM-2262 — reusable across the Corporate Pricing export flows\)\. \*/', '/** Parsed result of a CSV file download, reusable across the Corporate Pricing export flows. */'),
  @(' \(NM-2305\)\.', '.'),
  @(' \(NM-2305\)', ''),
  @('/\*\* One staged change row in the Import All "Select items to publish" delta modal \(NM-2265\)\. \*/', '/** One staged change row in the Import All "Select items to publish" delta modal. */'),
  @(' \(NM-2265\)\. Choosing a file', '. Choosing a file'),
  @(' \(NM-2265\)\.', '.'),
  @('/\*\* The result of publishing staged Import All changes — the ONLY mutating step \(NM-2265\)\. \*/', '/** The result of publishing staged Import All changes — the ONLY mutating step. */'),
  @('\* NM-2264 real Export', '* Real Export'),
  @(' \(NM-2262\) — a thin wrapper', ' — a thin wrapper'),
  @(' \(NM-2305 round-trip', ' (round-trip')
)

# 20 corporate-pricing-new-pricebook.page.ts
DoFile 'clients/encore/src/pages/corporate-pricing/corporate-pricing-new-pricebook.page.ts' @(
  @(' \(NM-1440\)\.', '.'),
  @(' \(NM-2057\)\.', '.'),
  @(' \(NM-2022\)\.', '.')
)

# 21 toolbar-io.ts (data)
DoFile 'clients/encore/src/data/corporate-pricing/toolbar-io.ts' @(
  @(' \(NM-2305\)\.', '.'),
  @(' \(NM-2305\)', ''),
  @(' \(NM-2265\)\.', '.'),
  @(' \(NM-2265\)', ''),
  @(' NM-1604 "4 export variants \+ locale"\)\.', ').'),
  @('/\*\* Every export request carries the UI locale \(NM-1604 locale facet\)\. \*/', '/** Every export request carries the UI locale. */'),
  @('\* NM-2264: clicking', '* Clicking'),
  @(' \(NM-2265 / NM-1446\)\.', '.'),
  @(' \(NM-2305\)\. Live-verified', '. Live-verified'),
  @(' \(NM-2407\)', ''),
  @(' \(NM-2262\)\.', '.')
)

# 22 new-pricebook.ts (data)
DoFile 'clients/encore/src/data/corporate-pricing/new-pricebook.ts' @(
  @(' \(NM-1440\)\.', '.'),
  @(' \(NM-2022\)\.', '.'),
  @(' \(NM-2261\);', ';')
)

# 23 strategy.ts (data)
DoFile 'clients/encore/src/data/corporate-pricing/strategy.ts' @(
  @('/\*\* Deep-coverage \(NM-2261\) — in-session strategy names; never saved \(reload discards\)\. \*/', '/** In-session strategy names for deep-coverage; never saved (reload discards). */')
)

# 24 left-panel-basic-information.ts (selectors/locations)
DoFile 'clients/encore/src/selectors/locations/left-panel-basic-information.ts' @(
  @('\(NM-831 / NM-1140 — only selectable during', '(only selectable during')
)

# 25 location-left-panel-basic-information.ts (data/locations)
DoFile 'clients/encore/src/data/locations/location-left-panel-basic-information.ts' @(
  @('// read-only in edit mode \(NM-831 / NM-1140\)', '// read-only in edit mode by design')
)

Write-Host "ALL FILES PROCESSED"
