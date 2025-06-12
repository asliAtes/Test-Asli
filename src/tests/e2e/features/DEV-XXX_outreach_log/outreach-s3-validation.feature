@outreach-log @format-compliance
Feature: Outreach Log File Validation
  As a system administrator
  I want to validate outreach log files
  So that I can ensure they meet our requirements

  Background:
    Given an outreach log file is available for validation

  @format-compliance @line-endings
  Scenario: Validate line endings in log file
    When I validate the file format
    Then line endings should be CR+LF for all valid data lines
    And line ending statistics should be reported
    And any line ending issues should be detailed with hex values

  @format-compliance @file-name
  Scenario: Validate log file name format
    When I validate the file format
    Then file name should match pattern "KAI_Kredos_outreach_log_yyyymmddHHmmss.csv"
    And file should not have .pgp extension
    And file generation time should be around 6:00 PM CT with 30 minutes tolerance

  @format-compliance @structure
  Scenario: Validate log file structure
    When I validate the file format
    Then file should contain at least headers and one data row
    And file should not contain subheaders
    And file should end with a blank row
    And file should follow weekend/holiday rules when applicable

  @data-quality @field-validation
  Scenario: Validate required fields in log file
    When I validate the file content
    Then the following fields should not be null or empty:
      | Field            |
      | ACCOUNTNUMBER    |
      | FINANCIALACCOUNT |
      | TEMPLATENAME     |
      | TEMPLATEMEMO     |
      | TIMESTAMPCST-CDT |
      | CHANNEL          |
      | EVENTNAME        |
    And SMSCopy should be empty for email activities

  @data-quality @field-formats
  Scenario: Validate field formats in log file
    When I validate the file content
    Then TIMESTAMPCST-CDT should be in "MM/dd/yyyy HH:mm" format
    And CHANNEL should be either "smsActivities" or "emailActivities"
    And EVENTNAME should be either "SMS Delivered" or "Email Delivered"

  @data-quality @detailed-analysis
  Scenario: Generate detailed analysis report
    When I validate the file content
    Then a detailed report should be generated showing:
      | Report Section        |
      | Line ending analysis |
      | Field issues         |
      | Data quality metrics |
      | Error breakdown      |
      | Critical issues      |
    And report should include raw data for problematic lines
    And report should show exact line numbers for issues

  @process-reliability @generation-time
  Scenario: Validate log file generation timing
    Given today's outreach log file
    When I check the generation timestamp
    Then it should be generated within the expected timeframe
    And it should follow weekend generation rules

  @comprehensive @all-validations
  Scenario: Comprehensive validation of outreach log file
    When I perform all validations
    Then all format compliance checks should pass:
      | Check             |
      | Line endings      |
      | File name pattern |
      | File structure    |
      | Headers          |
    And all data quality checks should pass:
      | Check              |
      | No null values     |
      | Valid formats      |
      | Data consistency   |
      | Required fields    |
    And detailed error report should be generated if any checks fail 