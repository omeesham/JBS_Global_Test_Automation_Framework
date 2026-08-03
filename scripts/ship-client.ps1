#!/usr/bin/env pwsh
# PowerShell-only environments — identical semantics to ship-client.sh.
# Usage: pwsh ./scripts/ship-client.ps1 -Client encore -Out C:\tmp\encore-deliv

param(
    [Parameter(Mandatory = $true)] [string]$Client,
    [Parameter(Mandatory = $true)] [string]$Out,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

$repoRoot = (& git rev-parse --show-toplevel).Trim()
Set-Location $repoRoot

# Pre-flight: working tree must be clean (no uncommitted edits to clients/$Client/ or src/ or pipeline/).
$dirty = & git status --porcelain "clients/$Client/" src/ pipeline/ 2>$null
if ($dirty -and -not $Force) {
    Write-Error "ERR: working tree dirty in tracked paths. Commit or pass -Force."
    exit 3
}

# Pre-flight: clients/$Client must exist.
if (-not (Test-Path "clients/$Client")) {
    Write-Error "ERR: clients/$Client not found"
    exit 4
}

# Pre-flight: capture deny-listed paths for exclusion at archive time (reporter, not gate).
# Force UTF-8 decoding of node's output — [Console]::OutputEncoding may default to ibm437 on
# Windows, which corrupts non-ASCII characters (e.g. em-dash, arrow) in path names.
$prevConsoleEnc = [Console]::OutputEncoding
$prevOutputEnc  = $OutputEncoding
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding             = [System.Text.Encoding]::UTF8
try {
    $emitOutput = & node scripts/verify-no-forbidden.mjs "--emit-exclusions=$Client"
    $emitExit   = $LASTEXITCODE
} finally {
    [Console]::OutputEncoding = $prevConsoleEnc
    $OutputEncoding            = $prevOutputEnc
}
if ($emitExit -ne 0) {
    Write-Error "ERR: verify-no-forbidden.mjs --emit-exclusions=$Client failed (exit $emitExit) — aborting to prevent unstripped archive"
    exit 9
}
if ($emitOutput) {
    $Exclusions = @($emitOutput | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
} else {
    $Exclusions = @()
}

# Pre-flight: XLSX deliverable must exist and be fresh vs MD sources.
# (PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION Phase B). Encore-only check until a
# second client onboards a workbook. Non-encore clients skip silently.
if ($Client -eq 'encore') {
    $workbookPath = 'clients/encore/testcases/encore_test_cases.xlsx'
    if (-not (Test-Path $workbookPath)) {
        Write-Error "ERR: $workbookPath missing. Run: npm run xlsx:build"
        exit 6
    }
    & npm run --silent xlsx:freshness 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "ERR: XLSX workbook is stale vs MD sources. Run: npm run xlsx:build"
        exit 7
    }
}

# Pre-flight: refuse clients with aggregate workbooks — use ship-branch.sh for scope-trimmed delivery.
$manifestFile = "scripts/deliverable/delivery-manifest.$Client.json"
if (Test-Path $manifestFile) {
    $hasAggWb = & node -e "const m=JSON.parse(require('fs').readFileSync(process.argv[1],'utf-8'));console.log(Array.isArray(m.aggregate_workbooks)&&m.aggregate_workbooks.length>0?'yes':'no')" $manifestFile 2>$null
    if ($hasAggWb -eq 'yes') {
        Write-Error "ERR: client '$Client' manifest declares aggregate workbooks that require scope trimming. Use scripts/ship-branch.sh — it runs xlsx-trim to remove withheld module sheets."
        exit 1
    }
}

# Stage into a temp dir; $Out is populated only after the authoritative verify passes.
$stagingDir = Join-Path ([System.IO.Path]::GetTempPath()) ([System.IO.Path]::GetRandomFileName())
New-Item -ItemType Directory -Force -Path $stagingDir | Out-Null

try {
    # Ship via git archive into staging, then strip deny-listed files so they never reach
    # the authoritative gate or $Out. Staging-delete is the correct approach for this
    # environment (exclusion count approaches the Windows command-line limit for pathspecs).
    # Use System32\tar.exe (bsdtar) explicitly — Git's tar.exe misreads Windows drive
    # letters in -C paths as remote hostnames; System32\tar.exe handles them correctly.
    $tarExe = "$env:SystemRoot\System32\tar.exe"
    $archivePath = Join-Path $stagingDir '_archive.tar'
    & git archive HEAD "clients/$Client/" --output $archivePath
    if ($LASTEXITCODE -ne 0) { Write-Error "ERR: git archive failed (exit $LASTEXITCODE)"; exit $LASTEXITCODE }
    & $tarExe -x -C $stagingDir -f $archivePath --strip-components=2
    if ($LASTEXITCODE -ne 0) { Write-Error "ERR: tar extract failed (exit $LASTEXITCODE) — _archive.tar preserved at $archivePath for diagnostics"; exit $LASTEXITCODE }
    Remove-Item -Force $archivePath

    # Strip deny-listed files from staging.
    # Phase 1 — per-path deletion for ASCII-named paths (handles .env.local, CLAUDE.md, etc.).
    foreach ($p in $Exclusions) {
        $rel    = $p -replace "^clients/$Client/", ''
        $target = Join-Path $stagingDir $rel
        if (Test-Path -LiteralPath $target) {
            Remove-Item -LiteralPath $target -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    # Phase 2 — top-directory fallback. System32\tar.exe (bsdtar) re-encodes non-ASCII
    # filename bytes from UTF-8 through the OEM codepage (IBM437), so paths with em-dash
    # or arrow characters in directory components land on disk with corrupted names that
    # do not round-trip through the git-sourced exclusion list used in Phase 1.
    # Remedy: collect the unique top-level path component of every exclusion and delete
    # those staging directories as a whole (their container name is ASCII and is intact).
    $topDenyDirs = @(
        $Exclusions | ForEach-Object {
            ($_ -replace "^clients/$Client/", '') -split '[/\\]' | Select-Object -First 1
        } | Where-Object { $_ } | Sort-Object -Unique
    )
    foreach ($d in $topDenyDirs) {
        $dirPath = Join-Path $stagingDir $d
        if (Test-Path -LiteralPath $dirPath -PathType Container) {
            Remove-Item -LiteralPath $dirPath -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    # Prune empty directories left after file removal (deepest first, repeat until stable).
    while ($true) {
        $emptyDirs = @(Get-ChildItem -Recurse -Directory $stagingDir |
            Where-Object { (Get-ChildItem $_.FullName -Force -ErrorAction SilentlyContinue).Count -eq 0 })
        if ($emptyDirs.Count -eq 0) { break }
        $emptyDirs | Sort-Object { $_.FullName.Length } -Descending |
            ForEach-Object { Remove-Item -Force -ErrorAction SilentlyContinue $_ }
    }

    # Supply a blank starter environment file so the customer receives it as referenced in
    # setup instructions. verify-no-forbidden confirms it is the blank template (not credentials)
    # via --require-env-local below.
    $envTemplate = Join-Path $repoRoot 'scripts\deliverable\env-local.template'
    if (-not (Test-Path $envTemplate)) {
        Write-Error "ERR: blank starter environment file missing at $envTemplate — payload cannot be assembled."
        exit 1
    }
    Copy-Item -LiteralPath $envTemplate -Destination (Join-Path $stagingDir '.env.local') -Force

    # Authoritative gate: verify staged payload contains zero deny-listed files.
    & node scripts/verify-no-forbidden.mjs "--target=$stagingDir" "--require-env-local"
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    # Approved-scope gate (Encore only) — every payload file must resolve to an approved module.
    # For full Encore release control use scripts/ship-branch.sh instead of this general path.
    if ($Client -eq 'encore') {
        if (Test-Path 'scripts/verify-approved-scope.mjs') {
            & node scripts/verify-approved-scope.mjs "--target=$stagingDir" "--client=encore"
            if ($LASTEXITCODE -ne 0) {
                Write-Error "ERR: approved-scope gate failed — payload contains unapproved files. Use scripts/ship-branch.sh for Encore releases."
                exit 1
            }
        } else {
            Write-Error "ERR: scripts/verify-approved-scope.mjs not found — refusing to ship Encore via client:ship. Use scripts/ship-branch.sh."
            exit 1
        }
    }

    # $Out safety: refuse unconditionally if $Out is a git worktree (-Force does NOT override).
    if (Test-Path $Out) {
        & git -C $Out rev-parse --git-dir 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Error "ERR: $Out is a git worktree — refusing to overwrite. Pass a non-repo directory."
            exit 1
        }
    }
    # Refuse non-empty $Out without -Force.
    if ((Test-Path $Out) -and (Get-ChildItem $Out -Force -ErrorAction SilentlyContinue).Count -gt 0 -and -not $Force) {
        Write-Error "ERR: $Out exists and is non-empty. Pass -Force to overwrite."
        exit 1
    }
    if (Test-Path $Out) { Remove-Item -Recurse -Force $Out }
    New-Item -ItemType Directory -Force -Path $Out | Out-Null

    # Populate $Out from verified staging (copying a verified staging dir is permitted per LR-049).
    Get-ChildItem -Path $stagingDir -Force | Copy-Item -Destination $Out -Recurse -Force

    # Post-ship: defense in depth — verify the final output contains zero deny-listed files
    # (S0 gate per LR-069; placed before npm install to avoid scanning node_modules).
    & node scripts/verify-no-forbidden.mjs "--target=$Out" "--require-env-local"
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    # Post-ship: deliverable must NOT contain a GitHub workflow (client requirement —
    # they explicitly do not want any .github workflows in the deliverable).
    $Wf = Get-ChildItem -Path "$Out\.github\workflows" -Filter '*.y*ml' -ErrorAction SilentlyContinue
    if ($Wf) {
        Write-Error "ERR: $Out contains a GitHub workflow ($($Wf.Name)). The client requires deliverables with NO .github workflows. Remove it from clients/$Client/."
        exit 5
    }

    # Post-ship: smoke (npx playwright test --list, no browser launch). Remove runtime
    # artifacts after smoke so the delivered directory stays a clean git-archive extract.
    # P2-LOT17-06: $LASTEXITCODE checks added after npm install and npx playwright test --list.
    Push-Location $Out
    & npm install --silent
    $npmExit = $LASTEXITCODE
    $playwrightExit = 0
    if ($npmExit -eq 0) {
        & npx playwright test --list | Out-Null
        $playwrightExit = $LASTEXITCODE
    }
    Pop-Location
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue (Join-Path $Out 'node_modules')
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue (Join-Path $Out 'reports')
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue (Join-Path $Out 'test-results')
    if ($npmExit -ne 0) {
        Write-Error "ERR: npm install failed (exit $npmExit)"
        exit $npmExit
    }
    if ($playwrightExit -ne 0) {
        Write-Error "ERR: npx playwright test --list failed (exit $playwrightExit)"
        exit $playwrightExit
    }

    # Post-ship: XLSX deliverable must be present in the archive
    # (PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION Phase B). Encore-only check.
    if ($Client -eq 'encore') {
        if (-not (Test-Path "$Out\testcases\encore_test_cases.xlsx")) {
            Write-Error "ERR: $Out\testcases\encore_test_cases.xlsx missing in shipped archive"
            exit 8
        }
    }

    Write-Host "[OK] Shipped clients/$Client/ -> $Out via git archive"

} finally {
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $stagingDir
}
