@DEV-1000
Feature: Flag-Based Fetching Logic for Communication Reports (Email Case) [Write/Side-Effect]
  The API Gateway Lambda should handle error and edge cases for fetching email report data from MongoDB or PostgreSQL (PSQL).

  Background:
    Given the API endpoint is "https://jlyfljojpe.execute-api.us-east-2.amazonaws.com/uscc-dev/report"
    And the request body contains "customer" as "USCC" and valid "startDate" and "endDate"

  @DEV-1000-TC6
  Scenario: MongoDB unavailable with flag=true
    Given the Lambda flag is set to true
    And MongoDB is unavailable
    When I request an email report
    Then the response should indicate a database connection error

  @DEV-1000-TC7
  Scenario: PSQL unavailable with flag=false
    Given the Lambda flag is set to false
    And PSQL is unavailable
    When I request an email report
    Then the response should indicate a database connection error

  @DEV-1000-TC8
  Scenario: Invalid or missing flag value
    Given the Lambda flag is missing or invalid
    When I request an email report
    Then the response should indicate a configuration error or use default behavior 