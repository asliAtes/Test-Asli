# Outreach Log Validation Test Suite

## Purpose
This test suite validates the generation, format, encryption, and delivery of outreach log files to USCC. It ensures that files are generated correctly every day, including Sundays and holidays, with proper formatting and encryption.

## Test Coverage

### File Format Validation
- Line endings (CR+LF)
- File naming convention
- Header presence and format
- Empty row at the end of file
- No null values in required fields

### Content Validation
- Field format validation
- Data integrity checks
- Performance with large data volumes
- Error handling for null values

### Scheduling
- Daily file generation
- Sunday file generation (empty file)
- Holiday file generation (empty file)

### Encryption
- PGP encryption validation
- Decryption verification
- Key management

### Delivery
- SFTP delivery validation
- S3 delivery validation
- Staging and production environment checks

## Test Categories

### Automated Tests
- File format validation
- Content validation
- Scheduling checks
- Field validation
- Performance testing
- Error handling
- Encryption validation
- Delivery verification

### Manual Tests
- Real production data validation
- End-to-end integration testing

## Test Data
- Mock data for automated tests
- Real production data for manual validation
- Parameterized test data for field validation

## Tags
- @automated: Automated test cases
- @manual: Manual test cases
- @file-format: File format validation
- @content-validation: Content validation
- @scheduling: Scheduling validation
- @field-validation: Field format validation
- @performance: Performance testing
- @error-handling: Error handling validation
- @encryption: Encryption validation
- @delivery: Delivery validation
- @holiday: Holiday file generation
- @sunday: Sunday file generation
- @real-data: Real production data validation
- @integration: End-to-end integration testing

## Test Mode

All tests run in test mode by default. This ensures:
- No real system changes
- Mock data usage
- Safe execution environment

## Running Tests

```bash
# Run all tests
npm test

# Run specific test categories
npm test -- --tags @file-format
npm test -- --tags @content-validation
npm test -- --tags @scheduling
npm test -- --tags @field-validation
npm test -- --tags @performance
npm test -- --tags @error-handling
npm test -- --tags @file-delivery
```

## Configuration

Test configuration is in `config/test_config.json`:
- Mock data settings
- Performance thresholds
- File delivery settings

## Safety Measures

1. **Test Mode Check**
   - All tests verify `isTestMode` flag
   - Environment check before execution
   - Mock data usage

2. **Data Isolation**
   - Mock data store
   - No real system access
   - Safe file operations

3. **Error Handling**
   - Graceful failure
   - Error logging
   - Process continuation

## Adding New Tests

1. Add new scenario to feature file
2. Implement step definitions
3. Add mock data if needed
4. Update configuration if required
5. Run tests to verify 

## Running with Mock or Real Data

You can control whether tests use mock data or real data by editing the `dataSource` field in `config/test_config.json`:

- To use mock data:
  ```json
  "dataSource": "mock"
  ```
- To use real data:
  ```json
  "dataSource": "real"
  ```

When `real` is selected, tests will use the CSV files in `real_data/`.

You can also run only mock or real data scenarios using tags:

- Sadece mock data testleri:
  ```bash
  npm test -- --tags @mock-data
  ```
- Sadece gerçek data testleri:
  ```bash
  npm test -- --tags @real-data
  ``` 