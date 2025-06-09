#!/bin/bash

# List of empty directories to remove
EMPTY_DIRS=(
    "tests/e2e/step_definitions.bak/DEV-1047"
    "tests/e2e/step_definitions.bak/DEV-1003"
    "tests/e2e/step-definitions.bak/rcs"
    "tests/e2e/step-definitions/features/DEV-1047"
    "tests/e2e/step-definitions/features/DEV-1003"
    "tests/e2e/features/active/DEV-1046"
    "tests/e2e/features/active/DEV-1047"
    "tests/e2e/features/active/DEV-1044"
    "tests/e2e/features/modules"
    "tests/e2e/features/email"
    "tests/e2e/features/xray"
)

echo "Starting cleanup of empty directories..."
echo "----------------------------------------"

for dir in "${EMPTY_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        if [ -z "$(ls -A "$dir")" ]; then
            echo "Removing empty directory: $dir"
            rmdir "$dir"
        else
            echo "Warning: Directory not empty, skipping: $dir"
        fi
    else
        echo "Directory does not exist, skipping: $dir"
    fi
done

# Remove backup directories if they're empty
for backup_dir in tests/e2e/step{-,_}definitions.bak; do
    if [ -d "$backup_dir" ] && [ -z "$(ls -A "$backup_dir")" ]; then
        echo "Removing empty backup directory: $backup_dir"
        rmdir "$backup_dir"
    fi
done

echo "----------------------------------------"
echo "Cleanup complete!" 