@rcs @metrics @ui
Feature: RCS Metrics Display
  As a system user
  I want to view RCS metrics in different formats
  So that I can analyze message delivery performance

  Background:
    Given I am on the RCS metrics page
    And the metrics data is loaded

  @TC1 @smoke @ui
  Scenario: View RCS metrics in table format
    When I select table view
    Then I should see RCS metrics in a table format
    And the table should include columns for sent, delivered, and failed messages

  @TC2 @ui
  Scenario: View RCS metrics in graph format
    When I select graph view
    Then I should see RCS metrics in a graph format
    And the graph should show trends over time

  @TC3 @ui @filter
  Scenario: Filter RCS metrics by date range
    When I select a custom date range
    And I apply the filter
    Then the metrics should update to show data for the selected period

  @TC4 @ui @export
  Scenario: Export RCS metrics report
    When I click on the export button
    And I select CSV format
    Then the metrics report should be downloaded in CSV format 