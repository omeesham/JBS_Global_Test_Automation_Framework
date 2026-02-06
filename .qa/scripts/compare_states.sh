#!/bin/bash

# compare_states.sh
# Compares before/after snapshots to verify changes

set -e

# Parse arguments
BEFORE_DIR="${1}"
AFTER_DIR="${2}"
OUTPUT_FILE="${3:-.qa/VERIFICATION_LOGS/comparison_report.txt}"

if [ -z "$BEFORE_DIR" ] || [ -z "$AFTER_DIR" ]; then
    echo "Usage: $0 <BEFORE_SNAPSHOT_DIR> <AFTER_SNAPSHOT_DIR> [OUTPUT_FILE]"
    echo "Example: $0 .qa/VERIFICATION_LOGS/TASK-001-before .qa/VERIFICATION_LOGS/TASK-001-after"
    exit 1
fi

if [ ! -d "$BEFORE_DIR" ] || [ ! -d "$AFTER_DIR" ]; then
    echo "Error: Snapshot directories do not exist"
    exit 1
fi

echo "Comparing snapshots..."
echo "Before: $BEFORE_DIR"
echo "After: $AFTER_DIR"
echo "Output: $OUTPUT_FILE"

# Create output directory
mkdir -p "$(dirname "$OUTPUT_FILE")"

# Generate comparison report
{
    echo "=========================================="
    echo "STATE COMPARISON REPORT"
    echo "=========================================="
    echo "Generated: $(date -Iseconds)"
    echo "Before: $BEFORE_DIR"
    echo "After: $AFTER_DIR"
    echo ""
    
    echo "=========================================="
    echo "1. GIT CHANGES"
    echo "=========================================="
    echo ""
    echo "--- Status Changes ---"
    diff "$BEFORE_DIR/git_status.txt" "$AFTER_DIR/git_status.txt" || echo "Files added/modified/deleted (see above)"
    echo ""
    
    echo "--- Commits ---"
    echo "Before: $(cat "$BEFORE_DIR/git_commit.txt")"
    echo "After: $(cat "$AFTER_DIR/git_commit.txt")"
    echo ""
    
    echo "=========================================="
    echo "2. FILE TREE CHANGES"
    echo "=========================================="
    echo ""
    echo "--- New Files ---"
    comm -13 <(sort "$BEFORE_DIR/file_tree.txt") <(sort "$AFTER_DIR/file_tree.txt") || echo "None"
    echo ""
    
    echo "--- Deleted Files ---"
    comm -23 <(sort "$BEFORE_DIR/file_tree.txt") <(sort "$AFTER_DIR/file_tree.txt") || echo "None"
    echo ""
    
    echo "=========================================="
    echo "3. TYPESCRIPT FILES"
    echo "=========================================="
    echo ""
    echo "Before Count: $(wc -l < "$BEFORE_DIR/typescript_files.txt")"
    echo "After Count: $(wc -l < "$AFTER_DIR/typescript_files.txt")"
    echo ""
    echo "--- New TypeScript Files ---"
    comm -13 <(sort "$BEFORE_DIR/typescript_files.txt") <(sort "$AFTER_DIR/typescript_files.txt") || echo "None"
    echo ""
    echo "--- Deleted TypeScript Files ---"
    comm -23 <(sort "$BEFORE_DIR/typescript_files.txt") <(sort "$AFTER_DIR/typescript_files.txt") || echo "None"
    echo ""
    
    echo "=========================================="
    echo "4. PYTHON FILES"
    echo "=========================================="
    echo ""
    echo "Before Count: $(wc -l < "$BEFORE_DIR/python_files.txt")"
    echo "After Count: $(wc -l < "$AFTER_DIR/python_files.txt")"
    echo ""
    echo "--- New Python Files ---"
    comm -13 <(sort "$BEFORE_DIR/python_files.txt") <(sort "$AFTER_DIR/python_files.txt") || echo "None"
    echo ""
    echo "--- Deleted Python Files ---"
    comm -23 <(sort "$BEFORE_DIR/python_files.txt") <(sort "$AFTER_DIR/python_files.txt") || echo "None"
    echo ""
    
    echo "=========================================="
    echo "5. LINE COUNT SUMMARY"
    echo "=========================================="
    echo ""
    echo "--- Before ---"
    tail -20 "$BEFORE_DIR/line_counts.txt"
    echo ""
    echo "--- After ---"
    tail -20 "$AFTER_DIR/line_counts.txt"
    echo ""
    
    echo "=========================================="
    echo "6. DIRECTORY STRUCTURE CHANGES"
    echo "=========================================="
    echo ""
    diff "$BEFORE_DIR/directory_tree.txt" "$AFTER_DIR/directory_tree.txt" || echo "Directories added/removed (see above)"
    echo ""
    
    echo "=========================================="
    echo "7. CONFIGURATION CHANGES"
    echo "=========================================="
    echo ""
    diff "$BEFORE_DIR/config_snapshot.txt" "$AFTER_DIR/config_snapshot.txt" || echo "Configuration files changed (see above)"
    echo ""
    
    echo "=========================================="
    echo "SUMMARY"
    echo "=========================================="
    echo ""
    BEFORE_TS=$(wc -l < "$BEFORE_DIR/typescript_files.txt")
    AFTER_TS=$(wc -l < "$AFTER_DIR/typescript_files.txt")
    BEFORE_PY=$(wc -l < "$BEFORE_DIR/python_files.txt")
    AFTER_PY=$(wc -l < "$AFTER_DIR/python_files.txt")
    
    echo "TypeScript files: $BEFORE_TS → $AFTER_TS (Δ $((AFTER_TS - BEFORE_TS)))"
    echo "Python files: $BEFORE_PY → $AFTER_PY (Δ $((AFTER_PY - BEFORE_PY)))"
    echo ""
    
    NEW_FILES=$(comm -13 <(sort "$BEFORE_DIR/file_tree.txt") <(sort "$AFTER_DIR/file_tree.txt") | wc -l)
    DELETED_FILES=$(comm -23 <(sort "$BEFORE_DIR/file_tree.txt") <(sort "$AFTER_DIR/file_tree.txt") | wc -l)
    
    echo "Files added: $NEW_FILES"
    echo "Files deleted: $DELETED_FILES"
    echo ""
    echo "=========================================="
    
} > "$OUTPUT_FILE"

cat "$OUTPUT_FILE"

echo ""
echo "✅ Comparison complete!"
echo "Report saved to: $OUTPUT_FILE"

exit 0
