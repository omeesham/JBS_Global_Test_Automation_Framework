# compare_states.ps1
# PowerShell version of compare_states.sh for Windows users

param(
    [Parameter(Mandatory=$true)]
    [string]$BeforeDir,
    
    [Parameter(Mandatory=$true)]
    [string]$AfterDir,
    
    [string]$OutputFile = ".qa\VERIFICATION_LOGS\comparison_report.txt"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BeforeDir) -or -not (Test-Path $AfterDir)) {
    Write-Error "Error: Snapshot directories do not exist"
    exit 1
}

Write-Host "Comparing snapshots..." -ForegroundColor Cyan
Write-Host "Before: $BeforeDir" -ForegroundColor Gray
Write-Host "After: $AfterDir" -ForegroundColor Gray
Write-Host "Output: $OutputFile" -ForegroundColor Gray

# Create output directory
$OutputDir = Split-Path $OutputFile -Parent
if ($OutputDir -and -not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Helper function to compare files
function Compare-Files {
    param($File1, $File2)
    $content1 = Get-Content $File1 | Sort-Object
    $content2 = Get-Content $File2 | Sort-Object
    Compare-Object $content1 $content2
}

# Generate comparison report
$report = @"
==========================================
STATE COMPARISON REPORT
==========================================
Generated: $(Get-Date -Format o)
Before: $BeforeDir
After: $AfterDir

==========================================
1. GIT CHANGES
==========================================

--- Status Changes ---
$(try { 
    $diff = Compare-Object (Get-Content "$BeforeDir\git_status.txt") (Get-Content "$AfterDir\git_status.txt") -PassThru
    if ($diff) { $diff -join "`n" } else { "No changes" }
} catch { "Error comparing git status" })

--- Commits ---
Before: $(Get-Content "$BeforeDir\git_commit.txt" -Raw)
After: $(Get-Content "$AfterDir\git_commit.txt" -Raw)

==========================================
2. FILE TREE CHANGES
==========================================

--- New Files ---
$(try {
    $before = Get-Content "$BeforeDir\file_tree.txt" | Sort-Object
    $after = Get-Content "$AfterDir\file_tree.txt" | Sort-Object
    $new = Compare-Object $before $after | Where-Object { $_.SideIndicator -eq '=>' } | Select-Object -ExpandProperty InputObject
    if ($new) { $new -join "`n" } else { "None" }
} catch { "Error comparing file trees" })

--- Deleted Files ---
$(try {
    $before = Get-Content "$BeforeDir\file_tree.txt" | Sort-Object
    $after = Get-Content "$AfterDir\file_tree.txt" | Sort-Object
    $deleted = Compare-Object $before $after | Where-Object { $_.SideIndicator -eq '<=' } | Select-Object -ExpandProperty InputObject
    if ($deleted) { $deleted -join "`n" } else { "None" }
} catch { "Error comparing file trees" })

==========================================
3. TYPESCRIPT FILES
==========================================

Before Count: $((Get-Content "$BeforeDir\typescript_files.txt" | Measure-Object -Line).Lines)
After Count: $((Get-Content "$AfterDir\typescript_files.txt" | Measure-Object -Line).Lines)

--- New TypeScript Files ---
$(try {
    $before = Get-Content "$BeforeDir\typescript_files.txt" | Sort-Object
    $after = Get-Content "$AfterDir\typescript_files.txt" | Sort-Object
    $new = Compare-Object $before $after | Where-Object { $_.SideIndicator -eq '=>' } | Select-Object -ExpandProperty InputObject
    if ($new) { $new -join "`n" } else { "None" }
} catch { "None" })

--- Deleted TypeScript Files ---
$(try {
    $before = Get-Content "$BeforeDir\typescript_files.txt" | Sort-Object
    $after = Get-Content "$AfterDir\typescript_files.txt" | Sort-Object
    $deleted = Compare-Object $before $after | Where-Object { $_.SideIndicator -eq '<=' } | Select-Object -ExpandProperty InputObject
    if ($deleted) { $deleted -join "`n" } else { "None" }
} catch { "None" })

==========================================
4. PYTHON FILES
==========================================

Before Count: $((Get-Content "$BeforeDir\python_files.txt" | Measure-Object -Line).Lines)
After Count: $((Get-Content "$AfterDir\python_files.txt" | Measure-Object -Line).Lines)

--- New Python Files ---
$(try {
    $before = Get-Content "$BeforeDir\python_files.txt" | Sort-Object
    $after = Get-Content "$AfterDir\python_files.txt" | Sort-Object
    $new = Compare-Object $before $after | Where-Object { $_.SideIndicator -eq '=>' } | Select-Object -ExpandProperty InputObject
    if ($new) { $new -join "`n" } else { "None" }
} catch { "None" })

--- Deleted Python Files ---
$(try {
    $before = Get-Content "$BeforeDir\python_files.txt" | Sort-Object
    $after = Get-Content "$AfterDir\python_files.txt" | Sort-Object
    $deleted = Compare-Object $before $after | Where-Object { $_.SideIndicator -eq '<=' } | Select-Object -ExpandProperty InputObject
    if ($deleted) { $deleted -join "`n" } else { "None" }
} catch { "None" })

==========================================
5. DIRECTORY STRUCTURE CHANGES
==========================================

$(try {
    $diff = Compare-Object (Get-Content "$BeforeDir\directory_tree.txt") (Get-Content "$AfterDir\directory_tree.txt") -PassThru
    if ($diff) { $diff -join "`n" } else { "No changes" }
} catch { "Error comparing directory structures" })

==========================================
SUMMARY
==========================================

$(try {
    $beforeTs = (Get-Content "$BeforeDir\typescript_files.txt" | Measure-Object -Line).Lines
    $afterTs = (Get-Content "$AfterDir\typescript_files.txt" | Measure-Object -Line).Lines
    $beforePy = (Get-Content "$BeforeDir\python_files.txt" | Measure-Object -Line).Lines
    $afterPy = (Get-Content "$AfterDir\python_files.txt" | Measure-Object -Line).Lines
    
    $beforeFiles = Get-Content "$BeforeDir\file_tree.txt" | Sort-Object
    $afterFiles = Get-Content "$AfterDir\file_tree.txt" | Sort-Object
    $newFiles = (Compare-Object $beforeFiles $afterFiles | Where-Object { $_.SideIndicator -eq '=>' } | Measure-Object).Count
    $deletedFiles = (Compare-Object $beforeFiles $afterFiles | Where-Object { $_.SideIndicator -eq '<=' } | Measure-Object).Count
    
    @"
TypeScript files: $beforeTs → $afterTs (Δ $($afterTs - $beforeTs))
Python files: $beforePy → $afterPy (Δ $($afterPy - $beforePy))

Files added: $newFiles
Files deleted: $deletedFiles
"@
} catch { "Error generating summary" })

==========================================
"@

$report | Out-File $OutputFile -Encoding utf8

Write-Host "`n$report" -ForegroundColor White

Write-Host "`n✅ Comparison complete!" -ForegroundColor Green
Write-Host "Report saved to: $OutputFile" -ForegroundColor Cyan

exit 0
