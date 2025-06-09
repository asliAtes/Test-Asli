@email
Feature: Email Module as a Separate Service
  As a developer
  I want to be able to send emails through the communication module
  So that I can communicate with customers via email

  @basic @sendgrid
  Scenario: TC01 - Send an email using SendGrid
    Given email test data for "TC01"
    When the email request is submitted to the communication module
    Then the email should be processed successfully

  @validation @error
  Scenario: TC02 - Missing required email fields
    Given email test data for "TC02"
    When the email request is submitted to the communication module
    Then the email response should indicate "400 Bad Request"

  @validation @error
  Scenario: TC03 - Invalid email format
    Given email test data for "TC03"
    When the email request is submitted to the communication module
    Then the email response should indicate "Invalid email format" 