@outreach-log
Feature: Outreach Log File Generation and Validation
  As a system administrator
  I want to generate and validate outreach log files
  So that I can track customer communications effectively

  Background:
    Given the outreach log service is operational
    And the required database connections are established

  @smoke @format-compliance
  Scenario: Generate outreach log file with valid format
    Given test data is prepared for outreach log generation
    When I generate an outreach log file for the current date
    Then the file should be generated with name pattern "^KAI_Kredos_outreach_log_\\d{14}\\.csv$"
    And the file should have valid headers
    And all required fields should be populated
    And the file should use CR+LF line endings

  @validation @headers @format-compliance
  Scenario: Validate outreach log file headers
    Given an outreach log file is generated
    When I read the file contents
    Then the file should contain the following headers:
      | ACCOUNT_NUMBER |
      | PHONE_NUMBER  |
      | MESSAGE_TEXT  |
      | SEND_DATE     |
      | STATUS        |
      | CARRIER      |
    And headers should be in uppercase
    And headers should be comma-separated

  @validation @content @data-quality
  Scenario: Validate outreach log file content
    Given an outreach log file is generated with test data
    When I read the file contents
    Then no required fields should contain null values
    And date fields should be in "YYYY-MM-DD HH:mm:ss" format
    And phone numbers should be in valid format
    And the file should end with a blank row containing delimiters

  @weekend @process-reliability
  Scenario: Generate empty outreach log file on weekend
    Given today is a weekend
    When I generate an outreach log file
    Then the file should contain only headers
    And a blank row with delimiters

  @sftp @process-reliability
  Scenario: Deliver outreach log file via SFTP
    Given test data is prepared for outreach log generation
    When I generate an outreach log file for the current date
    Then the file should be delivered to SFTP server successfully

  @error-handling @process-reliability
  Scenario: Handle delivery failures gracefully
    Given test data is prepared for outreach log generation
    When SFTP server is not available
    Then the system should retry delivery with exponential backoff
    And errors should be logged appropriately

  @outreach-log-validation @s3-validation
  Scenario: Comprehensive validation of latest outreach log from S3
    Given today's outreach log file
    When I validate the file format
    Then line endings should be CR+LF
    And file name should follow the convention
    And file structure should be intact
    And headers should be valid
    And there should be no null values
    And field formats should be valid
    And data types should be consistent
    And all required fields should be present
    And it should be generated within the expected timeframe
    And it should follow weekend generation rules

  @outreach-log-validation @weekend-validation
  Scenario: Validate outreach log file for weekend/holiday
    Given an outreach log file is available for validation
    When I validate the file content
    Then it should follow weekend generation rules
    And file structure should be intact 