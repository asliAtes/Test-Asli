# Kredos AI Test Automation - Test Mapping by Ticket

This document maps each automated test to its corresponding ticket/feature for traceability and scope management.

## DEV-1045: RCS Tab Integration
> Adds a new RCS tab under SMS/Email Reports to show RCS delivery metrics

### Test Coverage
| Test ID | Scenario | Description | Type |
|---------|----------|-------------|------|
| DEV-1045-TC1 | Verify RCS tab is present and clickable | Checks if the RCS tab exists and can be activated | UI, Smoke |
| DEV-1045-TC2 | Verify RCS metrics summary counts | Validates all metric sections display correctly | UI |
| DEV-1045-TC3 | Verify RCS metrics charts display correctly | Checks chart axis, data points and legend | UI |
| DEV-1045-TC4 | Verify timeframe filtering for RCS metrics | Tests date range filtering functionality | UI |
| DEV-1045-TC5 | Verify RCS failover metrics are tracked separately | Validates that SMS failover metrics are separate | UI |
| DEV-1045-TC6 | Verify RCS metrics data matches database values | Data integrity validation against database | API |
| DEV-1045-TC7 | Verify RCS metrics can be exported | Tests export functionality for RCS metrics | UI |
| DEV-1045-TC8 | Verify switching between column and line chart views | Tests chart visualization toggle options | UI |

### Test Files
- Feature file: `tests/features/DEV-1045/DEV_1045_RCS_Tab_Integration.feature`
- Step definitions: `tests/step_definitions/DEV-1045/rcs_tab_steps.js`

## DEV-1046: Performance Reports Dashboard
> Main performance dashboard with filtering capabilities and performance metrics display

### Test Coverage
| Test ID | Scenario | Description | Type |
|---------|----------|-------------|------|
| DEV-1046-TC1 | Verify toggle controls for report filtering | Tests filter toggles and controls | UI |
| DEV-1046-TC2 | Verify date range selector functionality | Tests date range selection and data update | UI |
| DEV-1046-TC3 | Verify navigation between report tabs | Tests tab navigation and display | UI |
| DEV-1046-TC4 | Verify metrics cards on Counts tab | Validates metric cards display correctly | UI |
| DEV-1046-TC5 | Verify impact of toggle filters on displayed data | Tests filter impact on displayed metrics | UI |
| DEV-1046-TC6 | Verify collection path filtering | Tests collection path specific filtering | UI |
| DEV-1046-TC7 | Verify chart display in Rates by DPD tab | Tests DPD rate chart visualization | UI |
| DEV-1046-TC8 | Verify dashboard data accuracy against database | Data integrity validation | API |

### Test Files
- Feature file: `tests/features/DEV-1046/DEV_1046_Performance_Reports_Dashboard.feature`
- Step definitions: [To be implemented]

## Future Tickets

### DEV-1047: Reports Data Export Functionality
> Will cover export of report data in various formats (CSV, Excel, etc.)

### DEV-1048: Dashboard Customization
> Will cover user preferences, saved filters, and custom views

## Test Execution Guidelines

### Running Tests by Ticket

To run tests for a specific ticket:

```bash
# Run all tests for DEV-1045
npx cucumber-js --tags @DEV-1045

# Run all tests for DEV-1046
npx cucumber-js --tags @DEV-1046

# Run a specific test case
npx cucumber-js --tags @DEV-1045-TC1
```

### Running Tests by Type

```bash
# Run all UI tests
npx cucumber-js --tags @ui

# Run all API validation tests
npx cucumber-js --tags @api

# Run all smoke tests
npx cucumber-js --tags @smoke
``` 

This document maps each automated test to its corresponding ticket/feature for traceability and scope management.

## DEV-1045: RCS Tab Integration
> Adds a new RCS tab under SMS/Email Reports to show RCS delivery metrics

### Test Coverage
| Test ID | Scenario | Description | Type |
|---------|----------|-------------|------|
| DEV-1045-TC1 | Verify RCS tab is present and clickable | Checks if the RCS tab exists and can be activated | UI, Smoke |
| DEV-1045-TC2 | Verify RCS metrics summary counts | Validates all metric sections display correctly | UI |
| DEV-1045-TC3 | Verify RCS metrics charts display correctly | Checks chart axis, data points and legend | UI |
| DEV-1045-TC4 | Verify timeframe filtering for RCS metrics | Tests date range filtering functionality | UI |
| DEV-1045-TC5 | Verify RCS failover metrics are tracked separately | Validates that SMS failover metrics are separate | UI |
| DEV-1045-TC6 | Verify RCS metrics data matches database values | Data integrity validation against database | API |
| DEV-1045-TC7 | Verify RCS metrics can be exported | Tests export functionality for RCS metrics | UI |
| DEV-1045-TC8 | Verify switching between column and line chart views | Tests chart visualization toggle options | UI |

### Test Files
- Feature file: `tests/features/DEV-1045/DEV_1045_RCS_Tab_Integration.feature`
- Step definitions: `tests/step_definitions/DEV-1045/rcs_tab_steps.js`

## DEV-1046: Performance Reports Dashboard
> Main performance dashboard with filtering capabilities and performance metrics display

### Test Coverage
| Test ID | Scenario | Description | Type |
|---------|----------|-------------|------|
| DEV-1046-TC1 | Verify toggle controls for report filtering | Tests filter toggles and controls | UI |
| DEV-1046-TC2 | Verify date range selector functionality | Tests date range selection and data update | UI |
| DEV-1046-TC3 | Verify navigation between report tabs | Tests tab navigation and display | UI |
| DEV-1046-TC4 | Verify metrics cards on Counts tab | Validates metric cards display correctly | UI |
| DEV-1046-TC5 | Verify impact of toggle filters on displayed data | Tests filter impact on displayed metrics | UI |
| DEV-1046-TC6 | Verify collection path filtering | Tests collection path specific filtering | UI |
| DEV-1046-TC7 | Verify chart display in Rates by DPD tab | Tests DPD rate chart visualization | UI |
| DEV-1046-TC8 | Verify dashboard data accuracy against database | Data integrity validation | API |

### Test Files
- Feature file: `tests/features/DEV-1046/DEV_1046_Performance_Reports_Dashboard.feature`
- Step definitions: [To be implemented]

## Future Tickets

### DEV-1047: Reports Data Export Functionality
> Will cover export of report data in various formats (CSV, Excel, etc.)

### DEV-1048: Dashboard Customization
> Will cover user preferences, saved filters, and custom views

## Test Execution Guidelines

### Running Tests by Ticket

To run tests for a specific ticket:

```bash
# Run all tests for DEV-1045
npx cucumber-js --tags @DEV-1045

# Run all tests for DEV-1046
npx cucumber-js --tags @DEV-1046

# Run a specific test case
npx cucumber-js --tags @DEV-1045-TC1
```

### Running Tests by Type

```bash
# Run all UI tests
npx cucumber-js --tags @ui

# Run all API validation tests
npx cucumber-js --tags @api

# Run all smoke tests
npx cucumber-js --tags @smoke
``` 