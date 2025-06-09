@DEV-1045 @RCS @backend @API
Feature: DEV-1045 Backend changes: Create RCS tab under "SMS/Email Reports"

  Background:
    Given I have API access to the Message Reports service

  @smoke
  Scenario: Verify RCS metrics in API response
    When I request RCS tab metrics data
    Then the response should include RCS delivery metrics
    And the response format should match the API specification
    And the response should include timestamps for data freshness

  Scenario: Verify RCS metrics details in API response
    When I request RCS tab metrics data
    Then the response should include the following metrics:
      | Metric           |
      | Total            |
      | Delivered        |
      | Failed           |
      | Pending          |
      | Undeliverable    |
      | Carrier Error    |
    And each metric should have a valid numeric value
    And the response should include daily breakdown of metrics
    And the response should include percentage calculations where applicable

  Scenario: Verify API supports date range filtering for RCS tab
    When I request RCS tab metrics with timeframe "last_7_days"
    Then the response should include RCS data for the last 7 days
    When I request RCS tab metrics with custom date range from "2025-04-01" to "2025-04-07"
    Then the response should include RCS data only from April 1-7, 2025
    And the date-filtered data should match database records

  Scenario: Verify API error handling for invalid parameters
    When I request RCS tab metrics with invalid date parameters
    Then the API should return a 400 status code
    And the error response should contain helpful troubleshooting information

  @data-accuracy
  Scenario: Verify RCS metrics accuracy in API response
    When I request RCS tab metrics data
    Then the response metrics should exactly match the known database values
    And the calculated percentages should be mathematically correct

  @performance
  Scenario: Verify API caching for RCS tab metrics
    When I request RCS tab metrics data
    And I record the response time
    And I request RCS tab metrics data again
    Then the second response should be faster due to caching

  @data-refresh
  Scenario: Verify RCS metrics are updated with new message data
    Given a new RCS message is created with status "delivered"
    When I wait for the metrics cache to refresh
    And I request RCS tab metrics data
    Then the response should include the new RCS message data
    And the memory usage should remain within acceptable limits 