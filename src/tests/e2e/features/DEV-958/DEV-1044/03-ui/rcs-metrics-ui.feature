@DEV-1044 @DEV-958 @rcs-metrics @ui
Feature: DEV-1044 RCS Metrics UI Display and Controls
  As a system user
  I want to view and control RCS metrics display in the UI
  So that I can effectively monitor and analyze RCS message performance

  Background: 
    Given I am logged into the application
    And the RCS metrics verification system is ready
    And I have prepared test data with known message counts
    And I am on the RCS metrics page

  @DEV-1044 @TC20 @smoke @ui @display
  Scenario: TC20 - View RCS metrics in different formats
    When I navigate to the operational reports page
    Then I should see RCS metrics in both table and graph format
    And the display should include all required metrics
    And the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts

  @DEV-1044 @TC21 @smoke @ui @filter
  Scenario: TC21 - Filter RCS metrics by date range
    When I select a custom date range:
      | start_date | end_date   |
      | {today}    | {today}    |
    And I apply the filter
    Then the metrics should update to show data for the selected period
    And the metrics should be consistent across all sources
    And the displayed metrics should match the API response
    And all metrics should be greater than or equal to zero

  @DEV-1044 @TC22 @regression @ui @chart-controls
  Scenario: TC22 - Control chart display options
    When I view the RCS metrics chart
    Then I should be able to switch between chart types
    And I should be able to toggle metric visibility
    And I should be able to view detailed values
    And the chart data should match the table values
    And the metrics should be consistent across all sources

  @DEV-1044 @TC23 @regression @ui @export
  Scenario: TC23 - Export RCS metrics report
    Given I have filtered the metrics for a specific date range
    When I click on the export button
    And I select CSV format
    Then the metrics report should be downloaded
    And the CSV should contain all required metrics
    And the values should match the displayed data
    And the metrics should be consistent across all sources

  @DEV-1044 @TC24 @smoke @ui @data-consistency
  Scenario: TC24 - Verify UI data consistency with API
    Given I have prepared test data with known message counts
    When I view the metrics on the UI
    Then the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts
    And the metrics should be within expected ranges 