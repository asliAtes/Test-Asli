# DEV-1070 Test Plan: Data Archival Mechanism for MySQL `run` Table

## 1. Objective
To validate the automated archival process for the `run` table in MySQL, ensuring that records older than 60 days are exported, uploaded to S3, and deleted from the table only after successful upload, with data integrity and recoverability.

---

## 2. Scope
- **In Scope:**
  - Filtering records older than 60 days by `msg_sent_date`.
  - Exporting filtered records to a CSV file.
  - Uploading the CSV to the correct S3 bucket/path.
  - Deleting records from the `run` table only after successful upload.
  - (Optional) Archiving to a `run_archive` table for short-term recovery.
  - Automation via script and cron.
  - Logging of each archival run.
- **Out of Scope:**
  - Manual data recovery from S3 or `run_archive` table.
  - S3 bucket lifecycle management beyond retention policy.

---

## 3. Test Strategy
- **Type:** Functional, Integration, and Data Integrity Testing
- **Approach:**
  - Use a test MySQL database with sample data.
  - Use a test S3 bucket for uploads.
  - Simulate cron execution manually and via scheduler.
  - Validate logs and error handling.

---

## 4. Test Cases
### 4.1 Filtering & Export
- TC1: Only records with `msg_sent_date` > 60 days are selected for export.
- TC2: Exported CSV file contains all and only the filtered records.
- TC3: CSV file follows the naming convention `run_archive_YYYYMMDD.csv`.

### 4.2 S3 Upload
- TC4: CSV file is uploaded to the correct S3 bucket and path.
- TC5: File is visible in S3 and can be downloaded.
- TC6: S3 object metadata (date, size) matches the exported file.

### 4.3 Deletion & Recovery
- TC7: Records are deleted from the `run` table only after successful S3 upload.
- TC8: (Optional) Deleted records are present in the `run_archive` table.
- TC9: No data loss—record count in CSV + remaining in DB = original count.

### 4.4 Automation & Logging
- TC10: Script runs automatically via cron and logs each run.
- TC11: Logs capture start/end time, record counts, file name, S3 upload status, and errors.
- TC12: Script handles and logs failures (e.g., S3 upload failure, DB connection error) without data loss.

---

## 5. Data Requirements
- Test database with records spanning various `msg_sent_date` values (some <60 days, some >60 days).
- Access to a test S3 bucket with appropriate permissions.
- (Optional) `run_archive` table for recovery tests.

---

## 6. Acceptance Criteria
- All test cases above pass.
- No data loss or corruption occurs during the archival process.
- Logs are complete and accurate for each run.
- S3 retention policy is verifiable.

---

## 7. Risks & Mitigations
- **Risk:** Accidental deletion of non-archived data.
  - **Mitigation:** Only delete after upload confirmation; test thoroughly on non-prod data.
- **Risk:** S3 upload failure.
  - **Mitigation:** Abort deletion and log error if upload fails.
- **Risk:** Cron misconfiguration.
  - **Mitigation:** Manual test runs and log review before enabling automation.

---

## 8. References
- [DEV-1070 README.md](./README.md) 