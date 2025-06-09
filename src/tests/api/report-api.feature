@regression @api @report @p1
Feature: Report API Data Source Management
  As a system administrator
  I want to manage data sources for the report API
  So that I can fetch data from the correct database based on configuration

  Background:
    Given the Report API is configured with endpoint "https://jlyfljojpe.execute-api.us-east-2.amazonaws.com/uscc-dev/report"
    And test data exists for customer "USCC" on date "2025-05-07"

  @TC-1000-01 @critical @mongodb
  Scenario: Fetch data from MongoDB when flag is true
    Given the data source flag is set to "true"
    When I request SMS report data
    Then the response should contain valid chart data
    And the data should be fetched from MongoDB

  @TC-1000-02 @critical @postgresql
  Scenario: Fetch data from PostgreSQL when flag is false
    Given the data source flag is set to "false"
    When I request SMS report data
    Then the response should contain valid chart data
    And the data should be fetched from PostgreSQL

  @TC-1000-03 @p1
  Scenario: Verify data consistency across databases
    Given identical test data exists in both databases
    When I fetch data with MongoDB flag
    And I fetch data with PostgreSQL flag
    Then both responses should contain identical chart data

  @TC-1000-04 @p1
  Scenario: Validate response structure
    When I request SMS report data
    Then the response should contain all required fields:
      | Field         |
      | total         |
      | delivered     |
      | pending       |
      | undelivered   |
      | carrierError  |
      | unreachable   |
      | changed       |

  @TC-1000-05 @p2 @error-handling
  Scenario: Handle MongoDB unavailability
    Given the data source flag is set to "true"
    And MongoDB is unavailable
    When I request SMS report data
    Then the API should return an appropriate error response
    And the error should indicate database connectivity issue

  @TC-1000-06 @p2 @error-handling
  Scenario: Handle PostgreSQL unavailability
    Given the data source flag is set to "false"
    And PostgreSQL is unavailable
    When I request SMS report data
    Then the API should return an appropriate error response
    And the error should indicate database connectivity issue

  @TC-1000-07 @p2 @error-handling
  Scenario: Handle invalid flag configuration
    Given the data source flag is missing or invalid
    When I request SMS report data
    Then the API should return an appropriate error response
    And the error should indicate configuration issue

  @TC-1000-08 @p1 @migration
  Scenario: Verify data after migration
    Given data migration has been performed
    When I fetch historical data with MongoDB flag
    And I fetch recent data with PostgreSQL flag
    Then historical data should match pre-migration records
    And recent data should be available in PostgreSQL only 