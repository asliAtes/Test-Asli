# DEV-1017: Archive & Upload 60 Days Old Run Data to S3

## Purpose
Automate the archival of records older than 60 days from the `run` table in MySQL, export to CSV, upload to S3, and delete only after successful upload. Optionally, archive to `run_archive` table for recovery (not required unless specifically requested).

## Test Coverage
- Filtering records older than 60 days
- Exporting to CSV with correct naming
- Uploading to S3
- Deleting only after successful upload
- Data integrity check before deletion (compare all fields, or use run_id or banmacromapping id)
- Logging and cron automation (log file name and location are fixed)
- Only negative scenario: do not delete if S3 upload fails
- Tests are generic for both USCC and TMUS, run in staging environment

## How to Run
- Feature file: `DEV_1017_run_table_archival.feature`
- Step definitions: `DEV_1017_run_table_archival.ts`
- Run with: `npx cucumber-js tests/features/active/DEV_1017/DEV_1017_run_table_archival.feature`
- By default, tests run in mock/test mode. For real DB/S3, set `isTestMode = false` in the step file.

## Notes
- S3 and DB credentials must be set for integration tests.
- All tests are labeled with `DEV-1017` for traceability.
- No need to include test cases for the optional `run_archive` table unless specifically requested.
- No need for separate test cases for USCC and TMUS; generic coverage is sufficient. 