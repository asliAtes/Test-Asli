#!/bin/bash

# Daily Outreach Log Validation Script
# Usage: ./daily-outreach-validation.sh

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="/tmp/outreach-validation-$(date +%Y%m%d).log"
EMAIL_RECIPIENT="your-email@company.com"  # Change this
SLACK_WEBHOOK=""  # Optional: Add your Slack webhook URL

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}$(date '+%Y-%m-%d %H:%M:%S') - ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}$(date '+%Y-%m-%d %H:%M:%S') - SUCCESS: $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}$(date '+%Y-%m-%d %H:%M:%S') - WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

send_notification() {
    local status="$1"
    local message="$2"
    local log_content="$3"
    
    # Email notification
    if command -v mail &> /dev/null && [ -n "$EMAIL_RECIPIENT" ]; then
        echo -e "Outreach Log Validation Report\n\nStatus: $status\nMessage: $message\n\nFull Log:\n$log_content" | \
        mail -s "Outreach Log Validation - $status" "$EMAIL_RECIPIENT"
        log "Email notification sent to $EMAIL_RECIPIENT"
    fi
    
    # Slack notification (if webhook configured)
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🔍 Outreach Log Validation\\n*Status:* $status\\n*Message:* $message\"}" \
        "$SLACK_WEBHOOK" 2>/dev/null || log_warning "Failed to send Slack notification"
    fi
}

# Main execution
main() {
    log "=========================================="
    log "Starting Daily Outreach Log Validation"
    log "=========================================="
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        log_error "Not in the correct project directory (package.json not found)"
        log "Current directory: $(pwd)"
        log "Looking for package.json in: $(pwd)/package.json"
        exit 1
    fi
    
    # We're already in the project directory
    log "Working directory: $(pwd)"
    
    # Check Node.js and dependencies
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        log_error "npx is not available"
        exit 1
    fi
    
    # Check if TypeScript compilation works
    log "Checking TypeScript compilation..."
    if ! npx tsc --noEmit src/scripts/test-latest-outreach-log.ts; then
        log_error "TypeScript compilation failed"
        exit 1
    fi
    
    # Run the validation
    log "Running outreach log validation..."
    
    if npx ts-node src/scripts/test-latest-outreach-log.ts >> "$LOG_FILE" 2>&1; then
        # Count critical issues from log
        critical_issues=$(grep -c "❌ FAIL\|CRITICAL\|Missing required header" "$LOG_FILE" || echo "0")
        
        if [ "$critical_issues" -gt 0 ]; then
            log_warning "Validation completed with $critical_issues critical issues"
            send_notification "WARNING" "Validation found $critical_issues critical issues" "$(cat "$LOG_FILE")"
        else
            log_success "Validation completed successfully - no critical issues found"
            send_notification "SUCCESS" "All validations passed" "$(tail -20 "$LOG_FILE")"
        fi
    else
        log_error "Validation script failed to execute"
        send_notification "ERROR" "Validation script execution failed" "$(cat "$LOG_FILE")"
        exit 1
    fi
    
    # Cleanup old log files (keep last 7 days)
    find /tmp -name "outreach-validation-*.log" -mtime +7 -delete 2>/dev/null || true
    
    log "=========================================="
    log "Daily validation completed"
    log "Log file: $LOG_FILE"
    log "=========================================="
}

# Trap for cleanup on exit
cleanup() {
    log "Script interrupted or finished"
}
trap cleanup EXIT

# Run main function
main "$@" 