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

### Environment Configuration
- SFTP and S3 credentials/configuration provided for both staging and production
- Sensitive credentials (AWS, SFTP, PGP) should be managed via:
  - Environment variables
  - Secure vault

## 4. Test Plan Structure

### File Format & Content Validation
- Naming convention
- Line endings
- Headers
- Blank row
- Null values
- Empty file handling

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