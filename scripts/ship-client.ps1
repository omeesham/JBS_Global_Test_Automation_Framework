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

# Pre-flight: clean working tree (unless --Force)
$dirty = & git status --porcelain "clients/$Client/" src/ pipeline/ 2>$null
if ($dirty -and -not $Force) {
    Write-Error "ERR: working tree dirty in tracked paths. Commit or pass -Force."
    exit 3
}

if (-not (Test-Path "clients/$Client")) {
    Write-Error "ERR: clients/$Client not found"
    exit 4
}

# Pre-flight verifiers
& node scripts/verify-vendor-fresh.mjs --client=$Client
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& node scripts/verify-no-forbidden.mjs --client=$Client
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Ship via git archive
if (Test-Path $Out) { Remove-Item -Recurse -Force $Out }
New-Item -ItemType Directory -Force -Path $Out | Out-Null

# tar via Windows built-in (Win10+) or git archive --output
& git archive HEAD "clients/$Client/" --output "$Out\_archive.tar"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& tar -x -C $Out -f "$Out\_archive.tar" --strip-components=2
Remove-Item -Force "$Out\_archive.tar"

# Post-ship verify + smoke
& node scripts/verify-no-forbidden.mjs --target=$Out
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Deliverable must NOT contain a GitHub workflow (client requirement; mirror of ship-client.sh).
$Wf = Get-ChildItem -Path "$Out\.github\workflows" -Filter "*.y*ml" -ErrorAction SilentlyContinue
if ($Wf) {
    Write-Error "ERR: $Out contains a GitHub workflow ($($Wf.Name)). The client requires deliverables with NO .github workflows. Remove it from clients/$Client/."
    exit 5
}

Push-Location $Out
& npm install --silent
& npx playwright test --list | Out-Null
Pop-Location

Write-Host "[OK] Shipped clients/$Client/ -> $Out via git archive"
