@rcs @metrics @DEV-1044
Feature: RCS Graphs and Metrics
  As a system administrator
  I want to view RCS message metrics and graphs
  So that I can monitor RCS message delivery performance

  Background: 
    Given the treatment and communication modules are deployed
    And the database has the "rcs_metrics" column in "operational_reports" table

  @TC1 @smoke
  Scenario: View RCS message metrics for today
    Given I have uploaded a test file with 5 RCS-eligible records
    When I check the RCS metrics for today
    Then the metrics should show 5 sent messages
    And the metrics should include delivery statuses

  @TC2 @api
  Scenario: View RCS message metrics for the past week
    Given I have historical RCS message data for the past week
    When I check the RCS metrics for the past week
    Then the weekly report should show consistent totals

  @TC3 @database
  Scenario: Track RCS message delivery statuses
    Given I have RCS messages with different delivery statuses
    When I check message statuses
    Then I should see messages with different statuses

  @TC4 @integration
  Scenario: Send RCS messages via Infobip channel
    Given I have uploaded a test file with 3 RCS-eligible records
    When RCS messages are sent via Infobip channel
    Then the metrics should show 3 sent messages
    And the weekly report should show consistent totals

  @TC5 @error
  Scenario: Handle failed RCS message deliveries
    Given I have RCS messages with different delivery statuses
    When I check message statuses
    Then I should see messages with different statuses
    And the metrics should include delivery statuses


  @DEV-1044 @rcs @graphs @api
  Scenario: Verify RCS graph data structure and values
    Given I have access to the RCS service
    When I request the graph data
    Then the graph data should have valid structure
    And the graph data should contain all required metrics

  @DEV-1044 @rcs @graphs @api
  Scenario: Verify daily delivery trends data
    Given I have access to the RCS service
    When I request the delivery trends data
    Then the trend data should have valid structure
    And the trend data should be formatted correctly
    And the trend data should be consistent

  @DEV-1044 @rcs @graphs @api
  Scenario: Verify timeframe filtering in API
    Given I have access to the RCS service
    When I request graph data for the following timeframes:
      | startDate   | endDate     |
      | 2025-01-01 | 2025-01-07  |
      | 2025-01-01 | 2025-01-31  |
      | 2025-01-01 | 2025-03-01  |
    Then all data points should be within the specified timeframe

  @DEV-1044 @rcs @graphs @api
  Scenario: Verify failure analysis data
    Given I have access to the RCS service
    When I request the failure analysis data
    Then the failure data should have valid structure
    And the failure percentages should total 100% 