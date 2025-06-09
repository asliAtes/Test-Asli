# To run only mock tests: npx cucumber-js --tags @mock
# To run only integration tests: npx cucumber-js --tags @integration

@DEV-1017
Feature: Archive and Upload 60 Days Old Run Data to S3

  Background:
    Given the MySQL database connection is established
    And the S3 bucket access is configured for both TMUS and USCC

  @mock
  Scenario: TC1 - Verify records older than 60 days are correctly filtered
    Given there are records in the run table with various dates
    When I filter records older than 60 days
    Then only records with msg_sent_date older than 60 days are selected

  @mock
  Scenario: TC2 - Verify CSV export contains correct data
    Given there are records older than 60 days in the run table
    When I export the filtered records to CSV
    Then the CSV file should contain all required fields
    And the data in CSV should match the database records

  @mock
  Scenario: TC3 - Verify file naming convention
    Given I have exported records to CSV
    Then the file should be named as "run_archive_YYYYMMDD.csv"
    And the date in filename should match current date

  @integration
  Scenario: TC4 - Verify S3 upload for TMUS
    Given I have a CSV file with archived records
    When I upload the file to TMUS S3 bucket
    Then the file should be accessible in the correct S3 location for TMUS

  @integration
  Scenario: TC5 - Verify S3 upload for USCC
    Given I have a CSV file with archived records
    When I upload the file to USCC S3 bucket
    Then the file should be accessible in the correct S3 location for USCC

  @integration
  Scenario: TC6 - Verify records are deleted only after successful upload
    Given I have exported records to CSV
    And uploaded the CSV to S3 successfully
    When I delete the records from run table
    Then the records should no longer exist in the run table
    And the records should be available in S3

  @mock
  Scenario: TC8 - Verify error handling for failed S3 upload
    Given I have exported records to CSV
    When the S3 upload fails
    Then the records should not be deleted from the run table
    And the error should be logged

  @integration
  Scenario: TC9 - Verify logging functionality
    Given I start the archival process
    When each step of the process executes
    Then appropriate log entries should be created for each step
    And errors should be properly logged if they occur

  @integration
  Scenario: TC11 - Verify data integrity
    Given I have records to be archived
    When I complete the full archival process
    Then the data in S3 should exactly match the original database records
    And no data should be lost or corrupted

  @mock
  Scenario: TC12 - Verify no data loss during interruption
    Given I have exported records to CSV and uploaded to S3
    When the deletion process is interrupted midway
    Then no partial deletions should occur
    And all records should still exist in the database
    And the process should be retryable without data loss

  # Scenario: Optionally archive records to run_archive table
  #   Given the 'run_archive' table exists
  #   When the script is configured to archive
  #   Then filtered records are inserted into 'run_archive' before deletion
  #   # This scenario is not required unless specifically requested 