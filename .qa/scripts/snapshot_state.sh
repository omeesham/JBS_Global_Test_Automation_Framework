#!/bin/bash

# snapshot_state.sh
# Captures current codebase state for comparison

set -e

# Parse arguments
TASK_ID="${1:-MANUAL}"
SNAPSHOT_DIR=".qa/VERIFICATION_LOGS/${TASK_ID}"

if [ "$TASK_ID" == "MANUAL" ]; then
    echo "Usage: $0 <TASK_ID>"
    echo "Example: $0 TASK-001-20260206-143000"
    exit 1
fi

# Create snapshot directory
mkdir -p "$SNAPSHOT_DIR"

echo "Creating state snapshot for task: $TASK_ID"

# 1. Git status
echo "Capturing git status..."
git status --porcelain > "$SNAPSHOT_DIR/git_status.txt" 2>&1 || echo "Not a git repository" > "$SNAPSHOT_DIR/git_status.txt"

# 2. Git diff
echo "Capturing git diff..."
git diff > "$SNAPSHOT_DIR/git_diff.txt" 2>&1 || echo "Not a git repository" > "$SNAPSHOT_DIR/git_diff.txt"

# 3. Current commit
echo "Capturing current commit..."
git rev-parse HEAD > "$SNAPSHOT_DIR/git_commit.txt" 2>&1 || echo "N/A" > "$SNAPSHOT_DIR/git_commit.txt"

# 4. File tree
echo "Capturing file tree..."
find . -type f -not -path '*/\.*' -not -path '*/node_modules/*' -not -path '*/logs/*' -not -path '*/reports/*' > "$SNAPSHOT_DIR/file_tree.txt"

# 5. TypeScript files
echo "Capturing TypeScript files..."
find . -name "*.ts" -not -path '*/node_modules/*' | sort > "$SNAPSHOT_DIR/typescript_files.txt"

# 6. Python files
echo "Capturing Python files..."
find . -name "*.py" -not -path '*/\.*' | sort > "$SNAPSHOT_DIR/python_files.txt"

# 7. Configuration files
echo "Capturing configuration files..."
{
    echo "=== package.json ===" 
    [ -f "package.json" ] && cat package.json || echo "Not found"
    echo ""
    echo "=== tsconfig.json ==="
    [ -f "tsconfig.json" ] && cat tsconfig.json || echo "Not found"
    echo ""
    echo "=== playwright.config.ts ==="
    [ -f "playwright.config.ts" ] && cat playwright.config.ts || echo "Not found"
} > "$SNAPSHOT_DIR/config_snapshot.txt"

# 8. Directory structure
echo "Capturing directory structure..."
tree -L 3 -I 'node_modules|logs|reports|.git' > "$SNAPSHOT_DIR/directory_tree.txt" 2>&1 || \
    find . -type d -not -path '*/\.*' -not -path '*/node_modules/*' | sort > "$SNAPSHOT_DIR/directory_tree.txt"

# 9. Line counts
echo "Capturing line counts..."
{
    echo "=== TypeScript Files ==="
    find . -name "*.ts" -not -path '*/node_modules/*' -exec wc -l {} \; | sort -n
    echo ""
    echo "=== Python Files ==="
    find . -name "*.py" -not -path '*/\.*' -exec wc -l {} \; | sort -n
} > "$SNAPSHOT_DIR/line_counts.txt"

# 10. Metadata
echo "Creating metadata..."
{
    echo "Snapshot Date: $(date -Iseconds)"
    echo "Task ID: $TASK_ID"
    echo "Hostname: $(hostname)"
    echo "User: $(whoami)"
    echo "Working Directory: $(pwd)"
    echo "Git Branch: $(git branch --show-current 2>/dev/null || echo 'N/A')"
} > "$SNAPSHOT_DIR/metadata.txt"

echo "✅ Snapshot created successfully at: $SNAPSHOT_DIR"
echo "Files captured:"
ls -lh "$SNAPSHOT_DIR"

exit 0
