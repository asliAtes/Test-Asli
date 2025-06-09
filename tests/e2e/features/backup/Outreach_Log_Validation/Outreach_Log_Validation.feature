Feature: Outreach Log Validation
  This feature validates the outreach log files for correct format, content, and structure according to business requirements.

  Background:
    Given the outreach log generation service is running in production environment
    And production test data is prepared for outreach log validation

  Scenario: Validate outreach log file line endings (CR+LF)
    When a production outreach log file is generated
    Then every line in the outreach log file should end with CR+LF

  Scenario: Validate outreach log file extension
    When a production outreach log file is generated
    Then the outreach log file should not have a .crlf extension

  Scenario: Validate outreach log file has no null values
    When a production outreach log file is generated
    Then the outreach log file should not contain any null values

  Scenario: Validate outreach log file ends with a blank row
    When a production outreach log file is generated
    Then the outreach log file should end with a blank row

  Scenario: Validate outreach log file headers are in ALL CAPS
    When a production outreach log file is generated
    Then the outreach log file headers should be in ALL CAPS

  Scenario: Validate outreach log file for Sundays and holidays
    When a production outreach log file is generated for a Sunday or holiday
    Then the outreach log file should only contain the header and a blank row 