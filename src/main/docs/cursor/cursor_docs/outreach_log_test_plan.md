# USCC Outreach Log Test Automation Plan

## 1. Context & Objective
- Building comprehensive, automated test suite for USCC Outreach Log file process
- Focus on recurring issues (CR+LF line endings, null values, headers, file delivery, etc.)
- Goal: Ensure daily, production-like validation of files delivered to USCC, including Sundays and US holidays

## 2. Key Requirements & Issues

### File Generation & Timing
- Files must be generated every day (including Sundays and holidays) after 7pm CT
- On Sundays/holidays: Empty files with headers and blank row (correct number of delimiters)

### File Format & Naming
- Format: `.csv` (unencrypted), `.csv.pgp` (encrypted), no `.crlf` extension
- Naming: `KAI_Kredos_outreach_log_YYYYMMDDHHMMSS.csv` (no underscore between date and time)

### Content Requirements
- Headers must be present, all uppercase, and consistent (order check is low priority)
- CR+LF line endings required in `.csv` files
- No null values in required fields
  - If found: Record should not be present
  - Test should report which fields were null
- Blank row (with delimiters) must be present at end of every file

### Delivery Requirements
- Files must be delivered to both SFTP and S3
- Both staging and production environments
- PGP encryption validation required
  - Public key provided
  - Passphrase in vault

### Special Cases
- No special handling for July 4th
- Holidays and Sundays treated the same
- Real-life data must be validated daily to prevent failures

## 3. Test Data & Automation

### Test Data Management
- Test data should be parameterized
- Data should be refreshed for each run
- Can use dynamic generation or real daily files
- Tests should locate latest file based on naming convention and directory

### Validation Criteria
1. File Name Pattern:
   - Format: `KAI_Kredos_outreach_log_YYYYMMDDHHMMSS.csv`
   - Example: `KAI_Kredos_outreach_log_20241129170000.csv`
   - Date/time must be valid and not in the future

2. Headers (Required Fields):
   - ACCOUNT_NUMBER
   - PHONE_NUMBER
   - MESSAGE_TEXT
   - SEND_DATE
   - STATUS
   - CARRIER
   - All must be uppercase and comma-separated

3. Content Requirements:
   - Weekday files: Must contain actual records
   - Weekend/holiday files: Only headers and blank delimiter row
   - No null values in required fields
   - Date format: YYYY-MM-DD HH:mm:ss
   - Phone format: +XXXXXXXXXX (minimum 10 digits)
   - Line endings: CR+LF (\r\n)
   - Last line: Empty with correct number of delimiters

4. Delivery Requirements:
   - Files must exist in both locations:
     - S3: `s3://kredos-uscellular-production/Temporary-Files/`
     - SFTP: (path to be confirmed)
   - PGP encryption for delivered files
   - Delivery timing: After 7pm CT daily

### Validation Errors & Checks

#### 1. File Name Validation Errors
- Invalid format (must be `KAI_Kredos_outreach_log_YYYYMMDDHHMMSS.csv`)
- Invalid date/time in filename
- Missing or extra underscores
- Wrong file extension

#### 2. Header Validation Errors
- Missing required headers:
  ```
  ACCOUNT_NUMBER
  PHONE_NUMBER
  MESSAGE_TEXT
  SEND_DATE
  STATUS
  CARRIER
  ```
- Headers not in uppercase
- Incorrect delimiter (must be comma)
- Extra or missing headers

#### 3. Content Validation Errors
- Null or empty values in required fields
- Invalid date format (must be YYYY-MM-DD HH:mm:ss)
- Invalid phone number format (must start with + and have minimum 10 digits)
- Missing CR+LF line endings
- Missing final delimiter row
- Weekend/holiday files containing data (should be empty with headers only)
- Weekday files without data (must contain records)

#### 4. Delivery Validation Errors
- File not found in S3 location
- File not found in SFTP location
- Missing PGP encryption
- File delivered outside allowed time window (must be after 7pm CT)
- File integrity issues (size mismatch, corruption)

#### Error Reporting Format
When validation errors are found, they are reported in this format:
```json
{
    "fileName": "KAI_Kredos_outreach_log_20241129170000.csv",
    "isValid": false,
    "errors": [
        "Invalid header: ACCOUNTNUMBER (expected: ACCOUNT_NUMBER)",
        "Missing required header: PHONE_NUMBER",
        "Invalid date format in row 2: 11/29/2024 04:41 (expected: YYYY-MM-DD HH:mm:ss)",
        "Invalid line endings (must be CR+LF)"
    ]
}
```

### Environment Configuration
- SFTP and S3 credentials/configuration provided for both staging and production
- Sensitive credentials (AWS, SFTP, PGP) should be managed via:
  - Environment variables
  - Secure vault

## 4. Test Plan Structure

### File Format & Content Validation
- Naming convention: `KAI_Kredos_outreach_log_YYYYMMDDHHMMSS.csv`
- Line endings (CR+LF required)
- Headers (uppercase, comma-separated)
- Blank row with delimiters
- Null values validation
- Empty file handling

### S3 Validation Queries
Location: `s3://kredos-uscellular-production/Temporary-Files/`

#### Available Test Commands
1. Validate Latest File:
```bash
npm test -- --profile outreach-s3 --name "Validate latest outreach log from S3"
```

2. Validate Date Range:
```bash
npm test -- --profile outreach-s3 --name "Validate outreach logs for a specific date range"
```

3. Check for Validation Errors:
```bash
npm test -- --profile outreach-s3 --name "Check for validation errors in outreach logs"
```

#### Validation Checks
- File name pattern validation
- Headers validation (case, format, required fields)
- Content validation (null values, date format, phone numbers)
- Line ending validation (CR+LF)
- Weekend/holiday file structure
- Delivery status (SFTP, S3)

### Encryption Validation
- PGP encryption
- Decryption
- Integrity checks

### Delivery Validation
- SFTP presence
- S3 presence
- Permissions
- Integrity

### Special Cases
- Sunday/holiday empty files
- Error handling
- Retry logic

### Test Data Management
- Dynamic generation
- Parameterization
- Cleanup

### Reporting & Monitoring
- Automated reporting
- Alerting
- Result archiving

## 5. Implementation Phases
1. Basic validation
2. Advanced scenarios
3. Integration/monitoring

## 6. Open Questions/Clarifications
- Exact file output directory (pending)
- Acceptable file generation delay window (pending)
- Best way to access real daily data for validation (pending)
- Additional preferences for test scheduling and reporting (pending)

## 7. Next Steps
- Create formal test plan document based on agreed structure
- Await confirmation on:
  - File output location
  - Additional details
  - Implementation timeline 