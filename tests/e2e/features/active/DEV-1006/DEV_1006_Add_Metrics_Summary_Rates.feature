@DEV-1006 @RCS @performance-reports @UI
Feature: DEV-1006 Add new metrics to Performance Reports > Summary Rates

  Background:
    Given I am on the Performance Reports page
    And I navigate to the Summary Rates section

  @smoke
  Scenario: Verify new RCS metrics in Summary Rates
    Then I should see the following RCS metrics in the Summary Rates section:
      | Metric Name          |
      | RCS Delivery Rate    |
      | RCS Engagement Rate  |
      | RCS Failure Rate     |

  Scenario: Verify RCS delivery rate metric displays correctly
    Then the "RCS Delivery Rate" metric should display the correct value
    When I hover over the "RCS Delivery Rate" metric
    Then I should see an informational tooltip explaining the metric

  Scenario: Verify RCS engagement rate metric displays correctly
    Then the "RCS Engagement Rate" metric should display the correct value
    When I hover over the "RCS Engagement Rate" metric
    Then I should see an informational tooltip explaining the metric

  Scenario: Verify RCS failure rate metric displays correctly
    Then the "RCS Failure Rate" metric should display the correct value
    When I hover over the "RCS Failure Rate" metric
    Then I should see an informational tooltip explaining the metric

  Scenario: Verify metrics update based on time period selection
    When I select "Last 7 Days" from the time period dropdown
    Then the metrics should update to reflect the "Last 7 Days" time period
    When I select "Last 30 Days" from the time period dropdown
    Then the metrics should update to reflect the "Last 30 Days" time period
    And RCS-related metrics should be accurate for the selected time period

  Scenario: Verify trend indicators on RCS metrics
    Then RCS metrics should display trend indicators
    And positive trends should be highlighted in green
    And negative trends should be highlighted in red 