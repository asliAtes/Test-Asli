@DEV-958 @DEV-1044 @rcs-metrics @ui
Feature: RCS Metrics UI Display and Controls
  As a system user
  I want to view and control RCS metrics display in the UI
  So that I can effectively monitor and analyze RCS message performance

  Background: 
    Given I am logged into the application
    And I am on the RCS metrics page
    And the metrics data is loaded

  @smoke @ui @display
  Scenario: View RCS metrics in different formats
    When I navigate to the operational reports page
    Then I should see RCS metrics in both table and graph format
    And the display should include:
      | metric_type        | description                    |
      | rcsSmsSentCount   | Total RCS messages sent        |
      | delivered         | Successfully delivered messages |
      | pending          | Messages pending delivery       |
      | failed           | Failed message deliveries       |

  @smoke @ui @filter
  Scenario: Filter RCS metrics by date range
    When I select a custom date range:
      | start_date | end_date   |
      | 2025-05-01 | 2025-05-07 |
    And I apply the filter
    Then the metrics should update to show data for the selected period
    And the API request should be made with the selected date range
    And the displayed metrics should match the API response

  @regression @ui @chart-controls
  Scenario: Control chart display options
    When I view the RCS metrics chart
    Then I should be able to:
      | action                  | expected_result                        |
      | Switch to Line Chart    | View metrics as a line chart           |
      | Switch to Bar Chart     | View metrics as a bar chart            |
      | Toggle metric visibility| Hide/show specific metrics             |
      | Use tooltips           | View detailed values for data points   |

  @regression @ui @export
  Scenario: Export RCS metrics report
    Given I have filtered the metrics for a specific date range
    When I click on the export button
    And I select CSV format
    Then the metrics report should be downloaded
    And the CSV should contain:
      | column_name       |
      | Date             |
      | RCS SMS Sent     |
      | Delivered Count  |
      | Pending Count    |
      | Failed Count     |

  @smoke @ui @data-consistency
  Scenario: Verify UI data consistency with API
    Given I have RCS message data for today
    When I view the metrics on the UI
    Then the displayed metrics should match the API response for:
      | endpoint                      | metric            |
      | /get-mabOperationalReportData | rcsSmsSentCount   |
      | /get-mabReportsData          | rcsSmsSentCount   |
    And the graph data should match the database records 