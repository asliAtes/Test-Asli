# TEST PLAN: DEV-1017 Archive & Upload 60 Days Old Run Data to S3

## Scope
Automated archival of records older than 60 days from the `run` table in MySQL, export to CSV, upload to S3, and delete only after successful upload. Optionally, archive to `run_archive` table.

## Objectives
- Ensure no data loss during archival
- Optimize DB performance by removing old records
- Guarantee data retention in S3 for at least 2 years
- Provide recovery via optional archive table

## Test Approach
- BDD feature file: `DEV_1017_run_table_archival.feature`
- Manual and automated tests for all acceptance criteria
- Mock/test mode for safe runs; integration mode for real DB/S3

## Traceability
- All test cases are labeled `DEV-1017`
- Each scenario maps to an acceptance criterion or technical requirement

## Acceptance Criteria
- See feature file and README for detailed scenarios 