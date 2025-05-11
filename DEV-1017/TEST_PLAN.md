# DEV-1017 Test Plan: Archive & Upload 60 Days Old Run Data to S3

## 1. Objective
To validate the automated archival process for the `run` table in MySQL, ensuring records older than 60 days are exported to CSV, uploaded to S3, and deleted from the table only after successful upload, with data integrity and recoverability.

---

## 2. Scope
- **In Scope:**
  - Filtering records older than 60 days by `msg_sent_date`.
  - Exporting filtered records to a CSV file.
  - Uploading the CSV to the correct S3 bucket/path (TMUS & USCC).
  - Deleting records from the `run` table only after successful upload.
  - (Optional) Archiving to a `run_archive` table for short-term recovery.
  - Automation via script and cron.
  - Logging of each archival run.
- **Out of Scope:**
  - Manual data manipulation outside the archival process.
  - UI or reporting changes.

---

## 3. Test Strategy
- **Functional Testing:**
  - Validate correct filtering, export, upload, and deletion logic.
- **Regression Testing:**
  - Ensure no impact on unrelated DB tables or S3 buckets.
- **Integration Testing:**
  - Test with both staging and production S3 buckets.
- **Negative Testing:**
  - Simulate S3/DB errors, permission issues, or malformed data.

---

## 4. Test Cases

### 4.1. Data Filtering & Export
- **TC1:** Records older than 60 days are correctly filtered.
- **TC2:** Exported CSV file contains all required fields and correct data.
- **TC3:** File naming convention is followed (run_archive_YYYYMMDD.csv).

### 4.2. S3 Upload
- **TC4:** File is successfully uploaded to the correct S3 bucket/folder (TMUS & USCC).
- **TC5:** S3 object is accessible and matches the exported CSV.

### 4.3. Deletion & Recovery
- **TC6:** Records are deleted from the `run` table only after successful S3 upload.
- **TC7:** (Optional) Records are copied to `run_archive` table before deletion.

### 4.4. Error Handling & Logging
- **TC8:** If S3 upload fails, records are NOT deleted from the table.
- **TC9:** All steps are logged (success, failure, errors).
- **TC10:** Cron job runs as scheduled and logs output/errors.

### 4.5. Data Integrity
- **TC11:** Data in CSV matches DB before deletion.
- **TC12:** No data loss after deletion (cross-check with S3/optional archive table).

---

## 5. Data Requirements
- Access to MySQL `run` table with test data (older/newer than 60 days).
- S3 bucket access for both TMUS and USCC staging.
- Ability to run and schedule the archival script (Python/Bash).
- (Optional) Access to `run_archive` table for recovery tests.

---

## 6. Acceptance Criteria
- Only records older than 60 days are archived.
- Exported file is named correctly and uploaded to the right S3 location.
- Records are deleted only after successful upload.
- Cron job runs as scheduled and logs are captured.
- No data loss or corruption during the process.
- (Optional) Records are recoverable from `run_archive` table.

---

## 7. Traceability
- Each test case maps to a requirement or acceptance criterion above.

---

## 8. Notes
- Update DB/S3 configs per environment before running.
- Coordinate with ops for cron and script deployment.
- Validate with both TMUS and USCC S3 buckets. 