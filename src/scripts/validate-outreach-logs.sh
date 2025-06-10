#!/bin/bash

# Help function
show_help() {
    echo "Usage: validate-outreach-logs.sh [options]"
    echo "Options:"
    echo "  -s, --start-date YYYY-MM-DD    Start date for validation"
    echo "  -e, --end-date YYYY-MM-DD      End date for validation (defaults to start date if not provided)"
    echo "  -l, --latest                   Validate only the latest file"
    echo "  -h, --help                     Show this help message"
    echo
    echo "Examples:"
    echo "  ./validate-outreach-logs.sh -s 2024-11-29"
    echo "  ./validate-outreach-logs.sh -s 2024-11-29 -e 2024-12-01"
    echo "  ./validate-outreach-logs.sh -l"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--start-date)
            START_DATE="$2"
            shift 2
            ;;
        -e|--end-date)
            END_DATE="$2"
            shift 2
            ;;
        -l|--latest)
            LATEST=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate arguments
if [[ $LATEST == true ]]; then
    npm test -- --profile outreach-s3 --name "Validate daily log generation"
    exit 0
fi

if [[ -z "$START_DATE" ]]; then
    echo "Error: Start date is required unless using --latest"
    show_help
    exit 1
fi

# If end date not provided, use start date
if [[ -z "$END_DATE" ]]; then
    END_DATE=$START_DATE
fi

# Export dates as environment variables
export START_DATE
export END_DATE

# Run the test with the specified dates
if [[ "$START_DATE" == "$END_DATE" ]]; then
    npm test -- --profile outreach-s3 --name "Validate log file format compliance"
else
    npm test -- --profile outreach-s3 --name "Validate log file data quality"
fi 