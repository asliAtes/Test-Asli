# Record Archiving Test Automation

This repository contains automated tests for the record archiving feature (DEV-1017 and DEV-1018), which handles archiving old records from database tables to S3.

## Documentation

All documentation files are located in the `docs/readme` directory:

### Project Documentation
- [DEV-925 Task List](docs/readme/DEV_925_TaskList.md) - Task list and progress tracking
- [BNE Integration Documentation](docs/readme/BNE_Integration_Documentation.md) - Integration details
- [Cucumber Module Structure](docs/readme/cucumber-module-structure.md) - Test framework structure

### Test Documentation
- [Test Mapping](docs/readme/test_mapping.md) - Overall test coverage and mapping
- [DEV-958 Test Mapping](docs/readme/DEV-958-test-mapping.md) - Specific test mapping for DEV-958
- [Executive Summary](docs/readme/README-ExecutiveSummary.md) - High-level test execution summary
- [Test Tasks](docs/readme/README-Tasks.md) - Test-related tasks and assignments
- [Bug Status](docs/readme/README-BugStatus.md) - Current bug status and tracking
- [Test Execution](docs/readme/README-TestExecution.md) - Test execution details and procedures
- [Test Results](docs/readme/README-TestResults.md) - Detailed test results and analysis

## Features Tested

- Identification of records older than 60 days
- CSV export of archived records
- S3 upload functionality
- Database cleanup after archiving
- Logging and monitoring
- Cron schedule execution

## Test Structure

The tests are organized into two categories:

1. Mock Tests (`@mock` tag)
   - Unit tests with mocked AWS services
   - Fast execution for development
   - No external dependencies

2. Integration Tests (`@integration` tag)
   - End-to-end tests in staging environment
   - Requires proper AWS and database credentials
   - Tests actual service integration

## Prerequisites

- Node.js 14+
- PostgreSQL database
- AWS credentials for S3 access

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Create a `.env` file with:
   ```
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=test_db
   DB_USER=test_user
   DB_PASSWORD=test_password

   # AWS Configuration
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   S3_BUCKET=test-archive-bucket

   # Test Configuration
   TEST_ENV=mock  # or 'staging' for integration tests
   ```

## Running Tests

Run all tests:
```bash
npm test
```

Run mock tests only:
```bash
npm run test:mock
```

Run integration tests only:
```bash
npm run test:integration
```

## Test Files Structure

```
├── tests/
│   ├── features/
│   │   └── RecordArchiving/
│   │       └── archive_old_records.feature
│   ├── steps/
│   │   └── record_archiving/
│   │       └── archiveSteps.ts
│   └── utils/
│       ├── database.service.ts
│       ├── s3.service.ts
│       ├── archive.service.ts
│       └── log.service.ts
```

## Service Classes

- `DatabaseService`: Handles database operations
- `S3Service`: Manages S3 interactions
- `ArchiveService`: Coordinates archiving process
- `LogService`: Handles logging and monitoring

## Best Practices

1. Always run mock tests before integration tests
2. Keep AWS credentials secure and use IAM roles
3. Clean up test data after each test run
4. Use descriptive scenario names
5. Maintain separation between mock and integration tests

## Troubleshooting

Common issues and solutions:

1. Database Connection Issues:
   - Verify database credentials
   - Ensure PostgreSQL is running
   - Check network connectivity

2. AWS Authentication Errors:
   - Verify AWS credentials
   - Check IAM permissions
   - Ensure correct region setting

3. Test Failures:
   - Check test logs in `logs/archive_process.log`
   - Verify test data setup
   - Ensure clean test environment

## Contributing

1. Create feature branch
2. Add or modify tests
3. Run full test suite
4. Submit pull request

## License

MIT 