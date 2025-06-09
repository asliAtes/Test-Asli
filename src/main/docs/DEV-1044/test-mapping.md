# DEV-958 Test Automation Plan

This document maps all automated tests for DEV-958 sub-tasks, focusing on RCS integration and reporting enhancements.

## Overview of DEV-958

DEV-958 encompasses several sub-tasks related to adding RCS (Rich Communication Services) capabilities to the reporting dashboards and enhancing the performance metrics.

## Test Coverage by Ticket

### DEV-1003: [USCC] Create RCS tab under "SMS/Email Reports"

**Frontend UI Tests:**
- Test File: `tests/features/DEV-1003/DEV_1003_Create_RCS_Tab.feature`

| Test ID | Description | Type |
|---------|-------------|------|
| DEV-1003-TC1 | Verify RCS tab is created and visible | UI, Smoke |
| DEV-1003-TC2 | Verify RCS tab UI layout matches design specification | UI, Layout |
| DEV-1003-TC3 | Verify RCS tab interaction and tab switching | UI, Interaction |
| DEV-1003-TC4 | Verify RCS tab loads within acceptable timeframe | UI, Performance |
| DEV-1003-TC5 | Verify RCS tab display on different screen sizes | UI, Responsive |

### DEV-1004: [USCC] Add RCS data to graphs under Message Reports > Status

**Frontend UI Tests:**
- Test File: `tests/features/DEV-1004/DEV_1004_Add_RCS_Graphs.feature`

| Test ID | Description | Type |
|---------|-------------|------|
| DEV-1004-TC1 | Verify RCS data appears in the status graphs | UI, Smoke |
| DEV-1004-TC2 | Verify RCS data in daily delivery status graph | UI, Chart Data |
| DEV-1004-TC3 | Verify filtering of RCS data in graphs | UI, Filtering |
| DEV-1004-TC4 | Verify RCS data segmentation by status | UI, Segmentation |
| DEV-1004-TC5 | Verify toggling RCS data visibility in graphs | UI, Toggle |
| DEV-1004-TC6 | Verify RCS data is included in graph exports | UI, Export |

### DEV-1005: [USCC] Add RCS data to tables under Message Reports > Trends

**Frontend UI Tests:**
- Test File: `tests/features/DEV-1005/DEV_1005_Add_RCS_Tables.feature`

| Test ID | Description | Type |
|---------|-------------|------|
| DEV-1005-TC1 | Verify RCS data appears in the trends tables | UI, Smoke |
| DEV-1005-TC2 | Verify RCS columns in trends tables follow the correct structure | UI, Table Structure |
| DEV-1005-TC3 | Verify filtering of RCS data in tables | UI, Filtering |
| DEV-1005-TC4 | Verify sorting functionality for RCS columns | UI, Sorting |
| DEV-1005-TC5 | Verify RCS data accuracy in trends tables | UI, Data Accuracy |
| DEV-1005-TC6 | Verify RCS data is included in table exports | UI, Export |

### DEV-1006: [USCC] Add 3 new metrics to Performance Reports > Summary Rates

**Frontend UI Tests:**
- Test File: `tests/features/DEV-1006/DEV_1006_Add_Metrics_Summary_Rates.feature`

| Test ID | Description | Type |
|---------|-------------|------|
| DEV-1006-TC1 | Verify new metrics appear in Summary Rates section | UI, Smoke |
| DEV-1006-TC2 | Verify Cured% metric calculation and display | UI, Calculation |
| DEV-1006-TC3 | Verify PA% metric calculation and display | UI, Calculation |
| DEV-1006-TC4 | Verify Suspend% metric calculation and display | UI, Calculation |
| DEV-1006-TC5 | Verify new metrics reflect filter changes | UI, Filtering |
| DEV-1006-TC6 | Verify new metrics visualization | UI, Chart |

### DEV-1007: [USCC] Add 6 new counts to Performance Reports > Counts

**Frontend UI Tests:**
- Test File: `tests/features/DEV-1007/DEV_1007_Add_Counts_Performance_Reports.feature`

| Test ID | Description | Type |
|---------|-------------|------|
| DEV-1007-TC1 | Verify new count metrics appear in Counts section | UI, Smoke |
| DEV-1007-TC2 | Verify Total Unique Placements count accuracy | UI, Data Accuracy |
| DEV-1007-TC3 | Verify Total Early Cures count accuracy | UI, Data Accuracy |
| DEV-1007-TC4 | Verify Total Exits From Treatment count accuracy | UI, Data Accuracy |
| DEV-1007-TC5 | Verify remaining count metrics accuracy | UI, Data Accuracy |
| DEV-1007-TC6 | Verify count metrics reflect filter changes | UI, Filtering |
| DEV-1007-TC7 | Verify count metrics show details on hover | UI, Interaction |

### DEV-1044: [USCC] Backend-change: Add RCS data to graphs under Message Reports > Status

**Backend API Tests:**
- Test File: `tests/features/DEV-1044/DEV_1044_Backend_RCS_Graphs.feature`

| Test ID | Description | Type |
|---------|-------------|------|
| DEV-1044-TC1 | Verify RCS data is included in message status API response | API, Smoke |
| DEV-1044-TC2 | Verify RCS metrics calculation in backend API | API, Calculation |
| DEV-1044-TC3 | Verify date filtering for RCS data in API | API, Filtering |
| DEV-1044-TC4 | Verify API error handling for RCS data | API, Error Handling |
| DEV-1044-TC5 | Verify end-to-end data flow for RCS message status | Integration |
| DEV-1044-TC6 | Verify API performance with large RCS dataset | Performance |
| DEV-1044-TC7 | Verify API security for RCS data access | Security |

### DEV-1045: [USCC] Backend-change: Create RCS tab under "SMS/Email Reports"

**Backend API Tests:**
- Test File: `tests/features/DEV-1045/DEV_1045_Backend_RCS_Tab.feature`

| Test ID | Description | Type |
|---------|-------------|------|
| DEV-1045-TC1 | Verify RCS metrics API endpoint exists and returns data | API, Smoke |
| DEV-1045-TC2 | Verify RCS metrics API response structure | API, Structure |
| DEV-1045-TC3 | Verify date filtering for RCS metrics API | API, Filtering |
| DEV-1045-TC4 | Verify RCS metrics API error handling | API, Error Handling |
| DEV-1045-TC5 | Verify RCS metrics API data accuracy | API, Data Accuracy |
| DEV-1045-TC6 | Verify RCS metrics API caching behavior | API, Caching |
| DEV-1045-TC7 | Verify RCS metrics API performance with large dataset | Performance |

### DEV-986: [USCC] Verify performance reports calculation and logic

**Data Verification Tests:**
- Test File: `tests/features/DEV-986/DEV_986_Verify_Reports_Calculation.feature`

| Test ID | Description | Type |
|---------|-------------|------|
| DEV-986-TC1 | Verify basic count calculations in performance reports | Data Verification |
| DEV-986-TC2 | Verify rate percentage calculations in Summary Rates | Data Verification |
| DEV-986-TC3 | Verify calculations across different time periods | Data Verification |
| DEV-986-TC4 | Verify calculation consistency with filters applied | Data Verification |
| DEV-986-TC5 | Verify calculation handling of edge cases | Data Verification |
| DEV-986-TC6 | Verify business rules are correctly applied in calculations | Data Verification |
| DEV-986-TC7 | Verify calculations match historical patterns | Data Verification |
| DEV-986-TC8 | Verify calculation consistency in exported reports | Data Verification |

## Test Execution Guidelines

### Running Tests by Ticket

Use the provided `run-ticket-tests.js` script to run tests for a specific ticket:

```bash
# Run all tests for specific ticket
node run-ticket-tests.js DEV-1003

# Run a specific test case
node run-ticket-tests.js DEV-1003-TC1

# Run tests by type
node run-ticket-tests.js --ui
node run-ticket-tests.js --api
```

### Running All DEV-958 Tests

To run all tests for DEV-958 sub-tasks:

```bash
node run-all-dev958-tests.js
```

## Test Environment Setup

- Frontend tests require a browser (Chrome or Firefox)
- API tests require a running backend
- Data verification tests require database access
- All tests require appropriate test data

## Reporting

Test results are generated in the following formats:
- HTML report: `reports/cucumber_report.html`
- JSON report: `reports/cucumber_report.json` 