#!/bin/bash

# Set the base directory
BASE_DIR="tests/e2e"

# Create temporary directory for merging
mkdir -p "${BASE_DIR}/step-definitions-temp"

# Move files from step_definitions to appropriate locations
echo "Moving files from step_definitions..."

# Move RCS related files
mkdir -p "${BASE_DIR}/step-definitions-temp/rcs"
cp -r "${BASE_DIR}/step_definitions/rcs/"* "${BASE_DIR}/step-definitions-temp/rcs/"

# Move DEV ticket files to feature-based folders
for dir in "${BASE_DIR}/step_definitions/DEV-"*; do
  if [ -d "$dir" ]; then
    ticket=$(basename "$dir")
    echo "Processing $ticket..."
    
    # Create feature directory if needed
    mkdir -p "${BASE_DIR}/step-definitions-temp/features/$ticket"
    cp -r "$dir/"* "${BASE_DIR}/step-definitions-temp/features/$ticket/"
  fi
done

# Move existing step-definitions content
cp -r "${BASE_DIR}/step-definitions/"* "${BASE_DIR}/step-definitions-temp/"

# Backup old directories
mv "${BASE_DIR}/step-definitions" "${BASE_DIR}/step-definitions.bak"
mv "${BASE_DIR}/step_definitions" "${BASE_DIR}/step_definitions.bak"

# Move new consolidated directory into place
mv "${BASE_DIR}/step-definitions-temp" "${BASE_DIR}/step-definitions"

echo "Step definitions consolidated successfully!"
echo "Old directories backed up as step-definitions.bak and step_definitions.bak"
echo "Please verify the consolidation and remove backup directories if everything is correct." 