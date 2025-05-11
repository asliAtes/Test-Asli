@DEV-1017
Feature: Archive & Upload 60 Days Old Run Data to S3
  The system should archive records older than 60 days from the 'run' table, export them to CSV, upload to S3, and delete only after successful upload.

  Background:
    Given the MySQL database is accessible
    And the 'run' table contains records with 'msg_sent_date' in epoch ms

  Scenario: Filter records older than 60 days
    When the archival script is executed
    Then only records with 'msg_sent_date' older than 60 days are selected

  Scenario: Export filtered records to CSV with correct naming
    Given filtered records are available
    When the script exports the records
    Then the CSV file is named 'run_archive_YYYYMMDD.csv'
    And the file contains all filtered records

  Scenario: Upload CSV to correct S3 location
    Given a CSV file 'run_archive_YYYYMMDD.csv' exists
    And the S3 bucket and folder are configured
    When the script uploads the file
    Then the file appears in the correct S3 bucket and folder

  Scenario: Delete records only after successful S3 upload
    Given filtered records are exported and S3 upload is attempted
    When the S3 upload is successful
    Then the corresponding records are deleted from the 'run' table
    But if the upload fails, no records are deleted

  Scenario: Verify data integrity between DB and CSV before deletion
    Given filtered records are exported to CSV
    When the CSV is compared to the DB records before deletion
    Then all fields and record counts must match

  Scenario: Log archival process and automate with cron
    Given the archival script is scheduled with cron
    When the script runs
    Then a log file is created with details of each step and errors (if any)

  Scenario: Optionally archive records to run_archive table
    Given the 'run_archive' table exists
    When the script is configured to archive
    Then filtered records are inserted into 'run_archive' before deletion 