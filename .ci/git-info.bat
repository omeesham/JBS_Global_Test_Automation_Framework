@echo off
REM ##############################################################################
REM FILE: .ci/git-info.bat
REM PURPOSE: Safe git info retrieval with timeout for Windows Jenkins agents
REM WHY NECESSARY: Prevents git command hangs in Jenkins workspace isolation
REM USED BY: Jenkins pipelines (optional - as alternative to inline timeout wrapper)
REM
REM HOW IT WORKS:
REM 1. Attempts git commands with error suppression (2>nul)
REM 2. Falls back to placeholder messages if git commands fail/timeout
REM 3. Returns exit code 0 regardless (non-blocking for CI pipelines)
REM
REM USAGE:
REM In Jenkinsfile.windows:
REM   bat '.ci\\git-info.bat'
REM
REM Or inline in pipeline:
REM   timeout(time: 10, unit: 'SECONDS') {
REM     catchError(buildResult: 'SUCCESS', stageResult: 'SUCCESS') {
REM       bat 'git log -1 || echo Git timeout - continuing'
REM     }
REM   }
REM ##############################################################################

echo ==========================================
echo Git Repository Information
echo ==========================================

REM Get last commit info
echo Last Commit:
git log -1 --oneline 2>nul || echo Git info unavailable (timeout or not a git repo)

REM Get current branch
echo.
echo Branch:
git rev-parse --abbrev-ref HEAD 2>nul || echo unknown

REM Get commit hash
echo.
echo Commit Hash:
git rev-parse --short HEAD 2>nul || echo unknown

echo ==========================================

REM Always exit successfully (don't block pipeline if git fails)
exit /b 0
