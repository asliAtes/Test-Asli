# Outreach Log Validation Test Plan

## 1. Test Environment Setup

### 1.1 Configuration
```typescript
// Environment Variables Required
SFTP_HOST=kredosai.us-east-1.sftpcloud.io
SFTP_USERNAME=kredos-uscellular-demo-sftp
SFTP_KEY_PATH=/path/to/ssh/private/key  // To be provided
S3_BUCKET=kredos-uscellular-demo
S3_REGION=us-east-2
AWS_ACCESS_KEY=AKIATMVU6YKJ4Z3QXPPP
AWS_SECRET_KEY=***  // From secure storage
PGP_PUBLIC_KEY_PATH=/path/to/KREDOS_PGP_KEY.asc
PGP_PASSPHRASE=***  // From secure storage
```

### 1.2 File Locations
#### Staging Environment
- S3 Configuration:
  - AWS Account: 233381479059 (Demo)
  - Region: us-east-2 (Ohio)
  - Bucket: kredos-uscellular-demo
  - Home Directory Prefix: /kredos-uscellular-demo
  - Full Path: `s3://kredos-uscellular-demo/kredos-uscellular-demo/Temporary-Files/`

- SFTP Configuration:
  - Host: `kredosai.us-east-1.sftpcloud.io`
  - Username: `kredos-uscellular-demo-sftp`
  - Home Directory Prefix: /kredos-uscellular-demo
  - SSH Key: (To be provided)

#### Production Environment
- S3 Configuration:
  - AWS Account: 631917821459 (Prod)
  - Region: us-east-2 (Ohio)
  - Bucket: kredos-uscellular-production
  - Home Directory Prefix: /kredos-uscellular-production
  - Full Path: `s3://kredos-uscellular-production/kredos-uscellular-production/Temporary-Files/`

- SFTP Configuration:
  - Host: `kredosai.us-east-1.sftpcloud.io`
  - Username: `kredos-uscellular-production-sftp`
  - Home Directory Prefix: /kredos-uscellular-production
  - SSH Key: (To be provided)

### 1.3 PGP Keys
- Production Key: `USCellular_prod_public_key (1).asc`
- Staging Key: `KREDOS_PGP_KEY (1).asc`
- Key ID: `83797146E810D9F517F9BEAE97956C544D912503`

### 1.3 Dependencies
- Node.js environment
- AWS SDK
- SFTP client library
- GPG for PGP operations
- Jira/Xray API access

## 2. Test Scenarios

### 2.1 File Format Validation
#### 2.1.1 Line Endings
- [ ] Verify CR+LF line endings are present in all lines
- [ ] Check that CR is not missing from any line
- [ ] Validate that file extension is NOT .crlf
- [ ] Verify line endings in both .csv and .csv.pgp files

#### 2.1.2 File Structure
- [ ] Verify headers are present and in ALL CAPS
- [ ] Check for null values in any field
- [ ] Validate blank row at end of file
- [ ] Verify file naming convention (`KAI_Kredos_outreach_log_YYYYMMDDHHMMSS.csv`)

### 2.2 Daily Processing
#### 2.2.1 Sunday/Holiday Processing
- [ ] Verify file generation on Sundays
- [ ] Validate empty file format (headers + blank row)
- [ ] Check file generation on holidays
- [ ] Verify proper encryption of empty files

#### 2.2.2 Regular Day Processing
- [ ] Verify file generation on regular days
- [ ] Validate data content and format
- [ ] Check proper encryption
- [ ] Verify delivery to both SFTP and S3

## 3. Test Implementation Structure

```typescript
// test/outreach-log/validation.spec.ts
describe('Outreach Log Validation', () => {
  describe('File Format', () => {
    it('should have correct line endings (CR+LF)', async () => {
      // Implementation
    });
    
    it('should not have .crlf extension', async () => {
      // Implementation
    });

    it('should not contain null values', async () => {
      // Implementation
    });

    it('should have blank row at end', async () => {
      // Implementation
    });

    it('should have headers in ALL CAPS', async () => {
      // Implementation
    });
  });

  describe('Daily Processing', () => {
    it('should generate file on Sundays with correct format', async () => {
      // Implementation
    });

    it('should generate file on holidays with correct format', async () => {
      // Implementation
    });

    it('should generate file on regular days with data', async () => {
      // Implementation
    });
  });
});
```

## 4. Test Data Management

### 4.1 Test Data Generation
- Create test files with known line endings
- Generate files with and without null values
- Create files with and without blank rows
- Generate files for different days (Sunday, holiday, regular)

### 4.2 Data Cleanup
- Remove test files after validation
- Archive test results for reference

## 5. Reporting and Monitoring

### 5.1 Test Results
- Generate daily test report with:
  - Line ending validation results
  - Null value check results
  - Blank row verification
  - Header validation
  - File generation status
  - Encryption status
  - Delivery status

### 5.2 Jira/Xray Integration
- Create test cases in Xray for each validation
- Link test results to Jira tickets
- Track test execution in Xray
- Generate test reports in Xray format
- Send email notifications to asli@kredosai.com for:
  - Test failures
  - Daily summary reports
  - Recurring issues

### 5.3 Monitoring
- Set up daily test runs
- Track recurring issues in Jira
- Monitor file generation timing
- Log validation failures

## 6. Implementation Phases

### Phase 1: Basic Format Validation
- Line ending validation
- Null value checking
- Blank row verification
- Header validation

### Phase 2: Daily Processing
- Sunday file generation
- Holiday file generation
- Regular day processing

### Phase 3: Integration and Monitoring
- Full integration testing
- Daily automated runs
- Results reporting

## 7. Success Criteria
- All files have correct CR+LF line endings
- No files have .crlf extension
- No null values in any field
- All files have blank row at end
- Files are generated every day (including Sundays and holidays)
- All files have headers in ALL CAPS

## 8. Notes and Considerations
- All tests will be run against the staging environment
- Test results will be stored in a dedicated test results directory
- Failed validations will be logged with detailed error messages
- Regular maintenance of test data and cleanup procedures will be implemented
- Jira/Xray integration will be used for test management and reporting
- Email notifications will be sent to asli@kredosai.com

## 9. Questions to Resolve
1. What is the exact timing for file generation on Sundays/holidays?
2. Are there specific holidays to test for?
3. What is the expected format of the blank row at the end (empty fields with delimiters)?
4. Should we validate the PGP encryption for empty files on Sundays/holidays?
5. What is the acceptable time window for file generation? (Files are generated at 7:01 PM CT / 5:01 PM PT) 