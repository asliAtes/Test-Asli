# Outreach Log Validation

This test suite focuses on **recurring problems validation** for outreach log files in the staging environment. Only read-only validation is performed; no files are uploaded, modified, or deleted.

## Scope
- CR+LF line endings
- No `.crlf` extension
- No null values in any field
- Blank row at end
- Headers in ALL CAPS
- File is empty (except header + blank row) on Sundays/holidays

Other scenarios (file delivery, performance, recovery, etc.) are out of scope for this suite.

## Implementation
- Feature files and step definitions are aligned with the above recurring problems.
- Test results can be reported to Xray using environment credentials.

## Key Features Tested

### 1. File Format Validation
- CR+LF line endings
- File extension verification
- File naming conventions
- File structure and headers

### 2. Content Validation
- Header presence and format
- Null value prevention
- Required empty row at end
- Field format validation

### 3. Scheduling
- Daily generation verification
- Weekend processing validation
- Holiday handling

### 4. Data Integrity
- Field format validation
- Data type verification
- Null value prevention
- Data consistency checks

### 5. Performance
- Processing time monitoring
- Large volume handling
- Resource utilization
- Timeout handling

### 6. Error Handling
- Invalid data management
- Error logging
- Process continuation
- Error reporting

### 7. File Delivery
- SFTP delivery verification
- Permission settings
- Backup management
- Delivery confirmation

### 8. System Recovery
- Interruption handling
- Process resumption
- Data integrity during recovery
- Recovery logging

## Test Execution

### Prerequisites
```bash
# Required environment variables
SFTP_HOST=uscc-sftp.example.com
SFTP_USER=kredos
SFTP_KEY_PATH=/path/to/ssh/key
OUTPUT_DIR=/path/to/outreach/logs
```

### Running Tests
```bash
# Run all outreach log validation tests
npm run test:outreach-log

# Run specific test categories
npm run test:outreach-log -- --tags @file-format
npm run test:outreach-log -- --tags @content-validation
npm run test:outreach-log -- --tags @critical
```

## Test Data
Test data is managed in the `test-data` directory and includes:
- Sample outreach log files
- Invalid data samples
- Large volume test data
- Error case samples

## Known Issues
1. Performance tests with 100k+ records require significant memory
2. SFTP tests require valid credentials
3. Some tests modify system date/time

## Best Practices
1. Run tests in isolation
2. Verify SFTP connectivity before running delivery tests
3. Monitor system resources during large volume tests
4. Review error logs after test execution

## Related Documentation
- [DEV-711: USCC - Outreach Log Format PT IV (CR + LF)]
- [DEV-704: USCC - Outreach Log Format PT III]
- [DEV-697: USCC - Outreach Log Format: CR and LF]
- [DEV-429: USCC - Add blank record]
- [DEV-383: USCC - Outreach Log Headers]
- [DEV-375: USCC - Process Outreach File on Sundays] 