# DEV-1070: Data Archival Mechanism for MySQL `run` Table

## Overview
Implement an automated data archival process for the `run` table in MySQL. The process will identify records older than 60 days, export them to a CSV file, upload the file to S3, and then delete the records from the table—ensuring data integrity, recoverability, and long-term retention.

---

## Goals
- Reduce the size of the `run` table and optimize query performance.
- Ensure long-term data retention in S3.
- Provide a mechanism for short-term manual recovery (optional).

---

## Workflow Steps
1. **Identify Old Records**
   - Select records from the `run` table where `msg_sent_date` (Epoch ms) is older than 60 days.
2. **Export to CSV**
   - Export these records to a CSV file named `run_archive_YYYYMMDD.csv`.
3. **Upload to S3**
   - Upload the CSV file to `s3://<your-bucket-name>/run-archive/`.
   - Retain the file in S3 for at least 2 years.
4. **Delete from DB**
   - Only after a successful upload, delete the exported records from the `run` table.
5. **Optional: Short-term Recovery**
   - Optionally, move deleted records to a `run_archive` table for short-term manual recovery.
6. **Automation**
   - Automate the process using a Bash or Python script, scheduled via cron.
   - Capture logs for each run.

---

## Acceptance Criteria
- Records older than 60 days are correctly filtered.
- Exported file follows the naming convention: `run_archive_YYYYMMDD.csv`.
- File is successfully uploaded to the defined S3 location.
- Records are deleted from the table only after a successful S3 upload.
- The process is automated and logs are available for each run.
- (Optional) Data is available in a `run_archive` table for short-term recovery.

---

## Technical Details
- **Table Name:** `run`
- **Filter Field:** `msg_sent_date` (Epoch ms)
- **Export Format:** `.csv`
- **S3 Bucket:** `s3://<your-bucket-name>/run-archive/`
- **Retention Policy:** Keep in S3 for minimum 2 years
- **Automation:** Bash or Python script scheduled via cron

---

## Test Cases
- Verify old data is correctly filtered (age > 60 days).
- Confirm data integrity between DB and CSV before deletion.
- Confirm upload success with `aws s3 ls` or S3 SDK.
- Ensure no data loss after deletion. 