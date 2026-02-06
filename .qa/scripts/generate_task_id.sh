#!/bin/bash

# generate_task_id.sh
# Generates a unique task ID for tracking work

set -e

# Configuration
PREFIX="${1:-TASK}"
ID_FILE=".qa/.task_counter"

# Create .qa directory if it doesn't exist
mkdir -p .qa

# Initialize counter file if it doesn't exist
if [ ! -f "$ID_FILE" ]; then
    echo "0" > "$ID_FILE"
fi

# Read current counter
COUNTER=$(cat "$ID_FILE")

# Increment counter
COUNTER=$((COUNTER + 1))

# Save new counter
echo "$COUNTER" > "$ID_FILE"

# Generate task ID with timestamp
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
TASK_ID="${PREFIX}-$(printf '%03d' $COUNTER)-${TIMESTAMP}"

# Output
echo "$TASK_ID"

# Also save to a log file
echo "$TASK_ID" >> .qa/.task_history

exit 0
