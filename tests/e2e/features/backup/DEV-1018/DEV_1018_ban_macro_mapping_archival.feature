@DEV-1018 @ban_macro_mapping_archival
Feature: Archive old records from ban_macro_mapping table to S3

  Background:
    Given the ban_macro_mapping table exists in the database
    And the S3 bucket is configured for archival

  @TC-1 @record-filtering
  Scenario: Records older than 60 days are selected for archival
    Given there are records in ban_macro_mapping table with different timestamps
    When the archival process identifies records older than 60 days
    Then only records older than 60 days should be selected
    And current records should not be included

  @TC-2 @file-format
  Scenario: Archive file is generated in the correct format
    Given there are records to be archived
    When the archive file is generated
    Then the file should be in CSV format
    And the file name should follow pattern "ban_macro_mapping_YYYYMMDD.csv"
    And the CSV should contain all required fields

  @TC-3 @error-handling
  Scenario: System handles errors gracefully during archival
    Given there are records to be archived
    When a system error occurs during file generation
    Then no records should be deleted from the database
    And the error should be logged
    And the process should exit gracefully

  @TC-4 @record-deletion
  Scenario: Archived records are deleted after successful S3 upload
    Given there are records to be archived
    When the archive file is generated
    And the archive file is successfully uploaded to S3
    Then the archived records should be deleted from the database
    And the deletion should be logged

  @TC-5 @integration
  Scenario: End-to-end integration test of archival process
    Given the integration tests are enabled
    And there are records older than 60 days in staging database
    When the archival process runs
    Then the records should be exported to CSV
    And the process should complete successfully
    And the process should complete within acceptable time 