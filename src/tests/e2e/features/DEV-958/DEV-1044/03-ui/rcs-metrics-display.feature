@DEV-958 @DEV-1044 @ui @staging @rcs-reports
Feature: RCS Metrics Display
  As a system user
  I want to view RCS metrics in the UI
  So that I can monitor RCS message performance

  Background:
    Given I am logged into the application
    And I am on the operational reports page
    And test data is prepared

  @smoke @display
  Scenario: View RCS metrics in operational reports
    When I view the daily operational report
    Then I should see the RCS metrics section
    And the RCS sent count should be displayed correctly
    And the delivery status breakdown should be visible

  @regression @filters
  Scenario: Filter RCS metrics by date range
    When I select the date range:
      | start_date | end_date   |
      | 2025-05-22 | 2025-05-24 |
    And I apply the filter
    Then the RCS metrics should update
    And I should see data for all 3 days
    And the totals should match the selected period

  @regression @charts
  Scenario: Verify RCS metrics in charts
    When I switch to chart view
    Then I should see the RCS metrics chart
    And the chart should show:
      | metric_type     | display_type |
      | RCS Sent Count | Line Chart   |
      | Delivery Status| Pie Chart    |
    And the chart data should match the table values

  @regression @export
  Scenario: Export RCS metrics report
    When I select the date range:
      | start_date | end_date   |
      | 2025-05-23 | 2025-05-23 |
    And I click export button
    And I choose "CSV" format
    Then the report should be downloaded
    And the CSV should contain all RCS metrics
    And the values should match the displayed data

  @negative @ui
  Scenario: Handle no data scenario
    When I select a date range with no data:
      | start_date | end_date   |
      | 2024-01-01 | 2024-01-01 |
    Then I should see "No data available" message
    And the charts should show empty state
    And export option should be disabled

  @regression @responsive
  Scenario Outline: Verify responsive layout
    When I resize browser to "<screen_size>"
    Then the RCS metrics should be properly displayed
    And all important data should be visible

    Examples:
      | screen_size |
      | desktop     |
      | tablet      |
      | mobile      | 