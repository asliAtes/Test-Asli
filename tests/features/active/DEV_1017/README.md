# DEV-1017: Archive & Upload 60 Days Old Run Data to S3

## Purpose
Automate the archival of records older than 60 days from the `run` table in MySQL, export to CSV, upload to S3, and delete only after successful upload. Optionally, archive to `run_archive` table for recovery.

## Test Coverage
- Filtering records older than 60 days
- Exporting to CSV with correct naming
- Uploading to S3
- Deleting only after successful upload
- Data integrity check before deletion
- Logging and cron automation
- Optional archiving to `run_archive` table

## How to Run
- Feature file: `DEV_1017_run_table_archival.feature`
- Step definitions: `DEV_1017_run_table_archival.ts`
- Run with: `npx cucumber-js tests/features/active/DEV_1017/DEV_1017_run_table_archival.feature`
- By default, tests run in mock/test mode. For real DB/S3, set `isTestMode = false` in the step file.

## Notes
- S3 and DB credentials must be set for integration tests.
- All tests are labeled with `DEV-1017` for traceability. 