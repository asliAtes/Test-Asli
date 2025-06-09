#!/bin/bash

# Base directory to start searching from
BASE_DIR="tests/e2e"

echo "Checking for empty directories in $BASE_DIR..."
echo "----------------------------------------"

# Find empty directories and store them in an array
while IFS= read -r dir; do
    # Check if directory is truly empty (no files, no subdirectories)
    if [ -z "$(ls -A "$dir")" ]; then
        echo "Empty directory found: $dir"
    fi
done < <(find "$BASE_DIR" -type d)

echo "----------------------------------------"
echo "Check complete!" 