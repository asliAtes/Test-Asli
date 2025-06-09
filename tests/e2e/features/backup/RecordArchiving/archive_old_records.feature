Feature: Archive Old Records to S3
  As a system administrator
  I want to automatically archive old records to S3
  So that I can maintain database performance while preserving historical data

  Background:
    Given the system is configured with AWS credentials
    And the S3 bucket "archive-bucket" exists
    And the database contains records of various ages

  @mock
  Scenario: Mock Test - Verify records older than 60 days are identified for archiving
    Given there are records in the database with timestamps
      | days_old | count |
      | 30       | 5     |
      | 61       | 3     |
      | 90       | 2     |
    When the archiving process runs
    Then 5 records should be identified for archiving
    And all identified records should be older than 60 days

  @mock
  Scenario: Mock Test - Verify CSV export of archived records
    Given there are records identified for archiving
    When the records are exported to CSV
    Then the CSV file should contain all record fields
    And the CSV format should be valid
    And the file should be properly named with timestamp

  @mock
  Scenario: Mock Test - Verify S3 upload of archived records
    Given a CSV file with archived records exists
    When the file is uploaded to S3
    Then the upload should be successful
    And the file should be accessible in the correct S3 path
    And proper metadata should be attached to the S3 object

  @mock
  Scenario: Mock Test - Verify database cleanup after archiving
    Given records have been successfully archived to S3
    When the cleanup process runs
    Then the archived records should be removed from the database
    And the database should maintain referential integrity

  @integration
  Scenario: Integration Test - End-to-end archiving process
    Given the staging database contains records older than 60 days
    When the archiving process runs in staging
    Then old records should be exported to CSV
    And the CSV should be uploaded to the staging S3 bucket
    And the records should be removed from the staging database
    And the process should be logged properly

  @integration
  Scenario: Integration Test - Verify cron schedule execution
    Given the archiving process is scheduled via cron
    When the scheduled time is reached
    Then the archiving process should start automatically
    And should complete successfully
    And should generate appropriate logs 