@DEV-1000
Feature: Flag-Based Fetching Logic for Communication Reports (Email Case)
  The API Gateway Lambda should fetch email report data from MongoDB or PostgreSQL (PSQL) based on a flag value.

  Background:
    Given the API endpoint is "https://jlyfljojpe.execute-api.us-east-2.amazonaws.com/uscc-dev/report"
    And the request body contains "customer" as "USCC" and valid "startDate" and "endDate"

  @DEV-1000-TC1
  Scenario: Fetch report with flag=true (MongoDB)
    Given the Lambda flag is set to true
    When I request an email report with commType "sms"
    Then the response should contain "chartdata" and "cumulativedata"
    And the data should be fetched from MongoDB

  @DEV-1000-TC2
  Scenario: Fetch report with flag=false (PSQL)
    Given the Lambda flag is set to false
    When I request an email report with commType "sms"
    Then the response should contain "chartdata" and "cumulativedata"
    And the data should be fetched from PSQL

  @DEV-1000-TC3
  Scenario: Flag change and redeploy switches data source
    Given the Lambda flag is set to true
    When I request an email report with commType "sms"
    Then the data should be fetched from MongoDB
    When the Lambda flag is changed to false and redeployed
    And I request an email report with commType "sms"
    Then the data should be fetched from PSQL

  @DEV-1000-TC4
  Scenario: Data integrity between MongoDB and PSQL for the same record
    Given the same report exists in both MongoDB and PSQL
    When I request the report with flag=true and with flag=false
    Then the response data from both sources should be consistent

  @DEV-1000-TC5
  Scenario: Response contains all required fields
    When I request an email report with commType "sms"
    Then the response "chartdata" should contain fields "total", "delivered", "pending", "undelivered", "carrierError", "unreachable", "changed"

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

  @DEV-1000-TC9
  Scenario: Migration - old data in MongoDB, new data in PSQL
    Given a report created before migration exists in MongoDB
    And a report created after migration exists in PSQL
    When I request the old report with flag=true
    Then the data should be fetched from MongoDB
    When I request the new report with flag=false
    Then the data should be fetched from PSQL 