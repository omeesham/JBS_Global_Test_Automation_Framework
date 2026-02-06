# generate_task_id.ps1
# PowerShell version of generate_task_id.sh for Windows users

param(
    [string]$Prefix = "TASK"
)

$ErrorActionPreference = "Stop"

# Configuration
$IdFile = ".qa\.task_counter"
$HistoryFile = ".qa\.task_history"

# Create .qa directory if it doesn't exist
if (-not (Test-Path ".qa")) {
    New-Item -ItemType Directory -Path ".qa" -Force | Out-Null
}

# Initialize counter file if it doesn't exist
if (-not (Test-Path $IdFile)) {
    Set-Content -Path $IdFile -Value "0"
}

# Read current counter
$Counter = [int](Get-Content $IdFile)

# Increment counter
$Counter++

# Save new counter
Set-Content -Path $IdFile -Value $Counter.ToString()

# Generate task ID with timestamp
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$TaskId = "$Prefix-$($Counter.ToString('000'))-$Timestamp"

# Output
Write-Output $TaskId

# Also save to history file
Add-Content -Path $HistoryFile -Value $TaskId

exit 0
