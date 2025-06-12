@DEV-1044 @DEV-958 @ui @staging @rcs-reports
Feature: DEV-1044 RCS Metrics Display
  As a system user
  I want to view RCS metrics in the UI
  So that I can monitor RCS message performance

  Background:
    Given I am logged into the application
    And the RCS metrics verification system is ready
    And I have prepared test data with known message counts
    And I am on the operational reports page

  @DEV-1044 @TC38 @smoke @display
  Scenario: TC38 - View RCS metrics in operational reports
    When I view the daily operational report
    Then I should see the RCS metrics section
    And the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts
    And the delivery status breakdown should be visible

  @DEV-1044 @TC39 @regression @filters
  Scenario: TC39 - Filter RCS metrics by date range
    When I select the date range:
      | start_date | end_date   |
      | {today}    | {today}    |
    And I apply the filter
    Then the RCS metrics should update
    And the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the metrics should be within expected ranges

  @DEV-1044 @TC40 @regression @charts
  Scenario: TC40 - Verify RCS metrics in charts
    When I switch to chart view
    Then I should see the RCS metrics chart
    And the chart should display all required metrics
    And the chart data should match the table values
    And the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero

  @DEV-1044 @TC41 @regression @export
  Scenario: TC41 - Export RCS metrics report
    When I select the date range:
      | start_date | end_date   |
      | {today}    | {today}    |
    And I click export button
    And I choose "CSV" format
    Then the report should be downloaded
    And the CSV should contain all required metrics
    And the values should match the displayed data
    And the metrics should be consistent across all sources

  @DEV-1044 @TC42 @negative @ui
  Scenario: TC42 - Handle no data scenario
    When I select a date range with no data:
      | start_date | end_date   |
      | 2024-01-01 | 2024-01-01 |
    Then I should see "No data available" message
    And the charts should show empty state
    And export option should be disabled

  @DEV-1044 @TC43 @regression @responsive
  Scenario Outline: TC43 - Verify responsive layout
    When I resize browser to "<screen_size>"
    Then the RCS metrics should be properly displayed
    And all important data should be visible
    And the metrics should be consistent across all sources

    Examples:
      | screen_size |
      | desktop     |
      | tablet      |
      | mobile      | 