Feature: Communication Module Email Functionality

  Scenario: TC01 - Send email using SendGrid
    Given email test data for "TC01"
    When the email request is submitted to the communication module
    Then the email should be processed successfully

  Scenario: TC02 - Missing required email fields
    Given email test data for "TC02"
    When the email request is submitted to the communication module
    Then the email response should indicate "400 Bad Request"

  Scenario: TC03 - Invalid email format
    Given email test data for "TC03"
    When the email request is submitted to the communication module
    Then the email response should indicate "Invalid email format" 