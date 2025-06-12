# DEV-1044 RCS SMS Count Tracking Tests

This folder contains TypeScript/Playwright/Cucumber tests for the DEV-1044 RCS SMS count tracking feature implementation.

## Project Structure

```
src/tests/e2e/steps/DEV-958/DEV-1044/
├── README.md                           # This documentation
├── screenshots/                        # Test screenshots and evidence
│   ├── login-page.png
│   ├── after-login.png
│   ├── sms-email-reports.png
│   ├── message-reports.png
│   └── ...
├── steps/                              # TypeScript step definitions
│   ├── ui/                            # UI interaction steps
│   │   ├── rcs-ui-validation.steps.ts
│   │   ├── rcs-reports-ui.steps.ts
│   │   └── rcs-comprehensive-ui.steps.ts
│   ├── database/                      # Database validation steps
│   │   └── rcs-database-ssh.steps.ts
│   ├── api/                          # API testing steps
│   ├── setup/                        # Test setup and configuration
│   ├── simple/                       # Simple validation steps
│   └── common/                       # Shared utilities
└── ../../features/DEV-958/DEV-1044/   # Feature files
    └── rcs-comprehensive-testing.feature
```

## Test Categories

### 🖥️ UI Tests (`steps/ui/`)
- **rcs-comprehensive-ui.steps.ts** - Complete end-to-end UI workflow
- **rcs-ui-validation.steps.ts** - Core UI element validation
- **rcs-reports-ui.steps.ts** - Reports page specific testing

### 🗄️ Database Tests (`steps/database/`)
- **rcs-database-ssh.steps.ts** - SSH tunnel database validation
- Schema validation for `rcs_sms_sent_count` column
- Data integrity and distribution analysis
- Test data verification

### 🔌 API Tests (`steps/api/`)
- RCS API endpoint validation
- Data retrieval and structure verification
- Error handling and failover testing

## Key Features Tested

### ✅ Authentication & Navigation
- Keycloak authentication flow
- Direct navigation to SMS/Email dashboard
- RCS tab discovery and access

### ✅ RCS Metrics Display
- RCS Delivery Metrics section visibility
- Count validation (Total, Delivered, Seen, Pending)
- Real data from Suresh's implementation (2 sent, 2 delivered, 1 seen)

### ✅ Chart Visualization
- Chart element detection (canvas, svg)
- Data visualization validation
- Legend and filter controls

### ✅ Database Integration
- SSH tunnel connectivity to RDS
- Schema validation (`mab_operational_reports_data.rcs_sms_sent_count`)
- Data integrity checks
- Test data verification for 2025-05-08

### ✅ API Integration
- REST API endpoint testing
- JSON response validation
- RCS-specific data fields verification

## Environment & Configuration

### 🌐 Staging Environment
- **URL**: https://uscc-stg.kredosai.com/
- **Credentials**: usccdevuser / Kredos@1234
- **Dashboard**: `/kredos/dashboard/sms-email-summary`

### 🗄️ Database Access
- **Method**: SSH tunnel via bastion host
- **Bastion**: 3.133.216.212 (ubuntu user)
- **RDS**: kredos-dev-mysql.cluster-c70f5cj9qhpu.us-east-2.rds.amazonaws.com
- **Database**: kreedos
- **Required**: `kredosai-dev.pem` key file

### 🔌 API Endpoint
- **URL**: https://jlyfljojpe.execute-api.us-east-2.amazonaws.com/uscc-dev/get-mabOperationalReportData
- **Method**: POST
- **Payload**: `{ customer: 'USCC', startDate: '2025-05-08', endDate: '2025-05-08', commType: 'rcs' }`

## Running Tests

### 🚀 Execute Specific Test Scenarios

```bash
# Run complete UI workflow test
npx cucumber-js --tags "@rcs-comprehensive"

# Run database validation test  
npx cucumber-js --tags "@rcs-database-ssh"

# Run focused UI element validation
npx cucumber-js --tags "@rcs-ui and @focused"

# Run all DEV-1044 tests
npx cucumber-js src/tests/e2e/features/DEV-958/DEV-1044/
```

### 🛠️ Development Commands

```bash
# Compile TypeScript
npx tsc

# Run with specific browser
npx cucumber-js --tags "@rcs-comprehensive" --browser chromium

# Run headless
HEADLESS=true npx cucumber-js --tags "@rcs-comprehensive"
```

## Test Evidence

All test executions automatically capture:
- 📸 **Screenshots** at key validation points
- 🗄️ **Database query results** for data verification  
- 🔌 **API response data** for integration validation
- 📊 **Chart and UI element detection** results

Screenshots are saved to: `src/tests/e2e/steps/DEV-958/DEV-1044/screenshots/`

## Technical Implementation Details

### 🏗️ Architecture
- **Framework**: Cucumber + Playwright + TypeScript
- **Pattern**: Page Object Model with step definitions
- **Tags**: Feature-based test organization
- **Hooks**: Before/After setup and cleanup

### 🔧 Key Technologies
- **TypeScript**: Type-safe test development
- **Playwright**: Cross-browser automation
- **Cucumber**: BDD test scenarios
- **MySQL2**: Database connectivity
- **SSH Tunnel**: Secure database access

### 📋 Test Data
- **Real Implementation**: Tests against Suresh's actual deployed code
- **Live Database**: Validates real RCS data (2 messages on 2025-05-08)
- **API Integration**: Tests actual endpoint responses
- **UI Verification**: Validates working charts and metrics

## Success Criteria

✅ **Authentication**: Keycloak login working  
✅ **Navigation**: Direct dashboard access working  
✅ **RCS Tab**: Tab detection and access working  
✅ **Metrics Display**: RCS counts showing (2 total, 2 delivered, 1 seen)  
✅ **Charts**: Data visualization working  
✅ **Database**: Schema and data validation complete  
✅ **API**: Endpoint integration working  
✅ **Implementation**: DEV-1044 production ready!

## Notes

This test suite validates the complete end-to-end implementation of RCS SMS count tracking as developed by Suresh for DEV-1044. All tests are designed to work with the real staging environment and actual data. 