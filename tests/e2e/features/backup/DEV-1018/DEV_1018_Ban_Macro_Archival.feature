# To run only mock tests: npx cucumber-js --tags @mock
# To run only integration tests: npx cucumber-js --tags @integration

@DEV-1018 @ban-macro-archival
Feature: Ban Macro Mapping Table Archival Process
  Records older than 60 days in ban_macro_mapping table should be archived to S3 and then deleted from the table.
  Tests are generic for both USCC and TMUS, and should be run in the staging environment.

  Background: 
    Given the ban_macro_mapping table exists in the database
    And the S3 bucket is configured for archival

  @DEV-1018-TC1 @mock @record-filtering
  Scenario: Validate record filtering based on age
    Given there are records in ban_macro_mapping table with different timestamps
    When the archival process identifies records older than 60 days
    Then only records older than 60 days should be selected
    And current records should not be included

  @DEV-1018-TC2 @mock @file-format
  Scenario: Validate archive file format and naming
    Given there are records to be archived
    When the archive file is generated
    Then the file should be in CSV format
    And the file name should follow pattern "ban_macro_mapping_YYYYMMDD.csv"
    And the CSV should contain all required fields

  @DEV-1018-TC3 @mock @error-handling
  Scenario: Validate error handling during archival
    Given there are records to be archived
    When a system error occurs during file generation
    Then no records should be deleted from the database
    And the error should be logged
    And the process should exit gracefully

  @DEV-1018-TC4 @mock @deletion-validation
  Scenario: Validate record deletion after successful upload
    Given there are records to be archived
    When the archive file is successfully uploaded to S3
    Then the archived records should be deleted from the database
    And the deletion should be logged

  @DEV-1018-TC5 @integration @staging-only
  Scenario: End-to-end archival process in staging
    Given the integration tests are enabled
    And there are records older than 60 days in staging database
    When the archival process runs
    Then the records should be exported to CSV
    And the CSV should be uploaded to "s3://kredos-uscellular-staging/kredos-uscellular-staging/ban-macro-mapping-archives/"
    And the records should be deleted from staging database
    And the process should be logged

  @DEV-1018-TC6 @integration @staging-only
  Scenario: Validate scheduled execution in staging
    Given the integration tests are enabled
    And the cron job is configured to run at "55 04 * * *"
    When the scheduled time is reached
    Then the archival process should start automatically
    And the process should complete successfully
    And the execution should be logged

  @DEV-1018-TC7 @integration @staging-only
  Scenario: Validate large dataset handling in staging
    Given the integration tests are enabled
    And there are more than 10000 records to archive
    When the archival process runs
    Then all records should be processed without memory issues
    And the process should complete within acceptable time
    And no data should be lost

  @DEV-1018-TC8 @integration @staging-only
  Scenario: Validate backup table functionality in staging
    Given the integration tests are enabled
    And the backup table "ban_macro_mapping_archive" exists
    When the archival process completes
    Then the archived records should be present in backup table
    And the backup table should be queryable
    And the data should match the archived records 