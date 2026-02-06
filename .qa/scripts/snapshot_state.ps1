# snapshot_state.ps1
# PowerShell version of snapshot_state.sh for Windows users

param(
    [Parameter(Mandatory=$true)]
    [string]$TaskId
)

$ErrorActionPreference = "Stop"

$SnapshotDir = ".qa\VERIFICATION_LOGS\$TaskId"

Write-Host "Creating state snapshot for task: $TaskId" -ForegroundColor Cyan

# Create snapshot directory
New-Item -ItemType Directory -Path $SnapshotDir -Force | Out-Null

# 1. Git status
Write-Host "Capturing git status..." -ForegroundColor Gray
try {
    git status --porcelain | Out-File "$SnapshotDir\git_status.txt" -Encoding utf8
} catch {
    Set-Content "$SnapshotDir\git_status.txt" "Not a git repository"
}

# 2. Git diff
Write-Host "Capturing git diff..." -ForegroundColor Gray
try {
    git diff | Out-File "$SnapshotDir\git_diff.txt" -Encoding utf8
} catch {
    Set-Content "$SnapshotDir\git_diff.txt" "Not a git repository"
}

# 3. Current commit
Write-Host "Capturing current commit..." -ForegroundColor Gray
try {
    git rev-parse HEAD | Out-File "$SnapshotDir\git_commit.txt" -Encoding utf8
} catch {
    Set-Content "$SnapshotDir\git_commit.txt" "N/A"
}

# 4. File tree
Write-Host "Capturing file tree..." -ForegroundColor Gray
Get-ChildItem -Recurse -File | 
    Where-Object { $_.FullName -notmatch '[\\/]\.' -and 
                   $_.FullName -notmatch 'node_modules' -and 
                   $_.FullName -notmatch '[\\/]logs[\\/]' -and 
                   $_.FullName -notmatch '[\\/]reports[\\/]' } |
    ForEach-Object { $_.FullName.Replace($PWD.Path + '\', '.\') } |
    Out-File "$SnapshotDir\file_tree.txt" -Encoding utf8

# 5. TypeScript files
Write-Host "Capturing TypeScript files..." -ForegroundColor Gray
Get-ChildItem -Recurse -Filter "*.ts" -File |
    Where-Object { $_.FullName -notmatch 'node_modules' } |
    ForEach-Object { $_.FullName.Replace($PWD.Path + '\', '.\') } |
    Sort-Object |
    Out-File "$SnapshotDir\typescript_files.txt" -Encoding utf8

# 6. Python files
Write-Host "Capturing Python files..." -ForegroundColor Gray
Get-ChildItem -Recurse -Filter "*.py" -File |
    Where-Object { $_.FullName -notmatch '[\\/]\.' } |
    ForEach-Object { $_.FullName.Replace($PWD.Path + '\', '.\') } |
    Sort-Object |
    Out-File "$SnapshotDir\python_files.txt" -Encoding utf8

# 7. Configuration files
Write-Host "Capturing configuration files..." -ForegroundColor Gray
@"
=== package.json ===
$(if (Test-Path "package.json") { Get-Content "package.json" -Raw } else { "Not found" })

=== tsconfig.json ===
$(if (Test-Path "tsconfig.json") { Get-Content "tsconfig.json" -Raw } else { "Not found" })

=== playwright.config.ts ===
$(if (Test-Path "playwright.config.ts") { Get-Content "playwright.config.ts" -Raw } else { "Not found" })
"@ | Out-File "$SnapshotDir\config_snapshot.txt" -Encoding utf8

# 8. Directory structure
Write-Host "Capturing directory structure..." -ForegroundColor Gray
Get-ChildItem -Recurse -Directory |
    Where-Object { $_.FullName -notmatch '[\\/]\.' -and 
                   $_.FullName -notmatch 'node_modules' } |
    ForEach-Object { $_.FullName.Replace($PWD.Path + '\', '.\') } |
    Sort-Object |
    Out-File "$SnapshotDir\directory_tree.txt" -Encoding utf8

# 9. Line counts
Write-Host "Capturing line counts..." -ForegroundColor Gray
@"
=== TypeScript Files ===
$(Get-ChildItem -Recurse -Filter "*.ts" -File |
    Where-Object { $_.FullName -notmatch 'node_modules' } |
    ForEach-Object { 
        $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
        "$lines $($_.FullName.Replace($PWD.Path + '\', '.\'))"
    } | Sort-Object)

=== Python Files ===
$(Get-ChildItem -Recurse -Filter "*.py" -File |
    Where-Object { $_.FullName -notmatch '[\\/]\.' } |
    ForEach-Object {
        $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
        "$lines $($_.FullName.Replace($PWD.Path + '\', '.\'))"
    } | Sort-Object)
"@ | Out-File "$SnapshotDir\line_counts.txt" -Encoding utf8

# 10. Metadata
Write-Host "Creating metadata..." -ForegroundColor Gray
$branch = try { git branch --show-current 2>$null } catch { "N/A" }
@"
Snapshot Date: $(Get-Date -Format o)
Task ID: $TaskId
Hostname: $env:COMPUTERNAME
User: $env:USERNAME
Working Directory: $PWD
Git Branch: $branch
"@ | Out-File "$SnapshotDir\metadata.txt" -Encoding utf8

Write-Host "`n✅ Snapshot created successfully at: $SnapshotDir" -ForegroundColor Green
Write-Host "`nFiles captured:" -ForegroundColor Cyan
Get-ChildItem $SnapshotDir | Format-Table Name, Length, LastWriteTime

exit 0
