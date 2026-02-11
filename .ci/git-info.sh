#!/bin/bash
###############################################################################
# FILE: .ci/git-info.sh
# PURPOSE: Safe git info retrieval with timeout for Jenkins/CI environments
# WHY NECESSARY: Prevents git command hangs in Jenkins workspace isolation
# USED BY: Jenkins pipelines (optional - as alternative to inline timeout wrapper)
#
# HOW IT WORKS:
# 1. Uses `timeout` command to limit git execution to 5 seconds
# 2. Falls back to placeholder messages if git commands fail/timeout
# 3. Returns exit code 0 regardless (non-blocking for CI pipelines)
#
# USAGE:
# In Jenkinsfile.ubuntu:
#   sh '.ci/git-info.sh'
#
# Or inline in pipeline:
#   timeout(time: 10, unit: 'SECONDS') {
#     catchError(buildResult: 'SUCCESS', stageResult: 'SUCCESS') {
#       sh 'git log -1 --oneline || echo "Git timeout - continuing"'
#     }
#   }
###############################################################################

set -e  # Exit on error (but we catch errors below)

echo "=========================================="
echo "Git Repository Information"
echo "=========================================="

# Get last commit info with 5 second timeout
echo -n "Last Commit: "
timeout 5 git log -1 --oneline 2>/dev/null || echo "Git info unavailable (timeout or not a git repo)"

# Get current branch with 5 second timeout
echo -n "Branch: "
timeout 5 git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown"

# Get commit hash with 5 second timeout
echo -n "Commit Hash: "
timeout 5 git rev-parse --short HEAD 2>/dev/null || echo "unknown"

echo "=========================================="

# Always exit successfully (don't block pipeline if git fails)
exit 0
