@rcs @metrics @ui @charts
Feature: RCS Chart Controls
  As a system user
  I want to control how RCS metrics are displayed in charts
  So that I can better analyze the data

  Background:
    Given I am on the RCS metrics page
    And I am viewing the metrics in chart format

  @TC1 @ui
  Scenario: Switch between chart types
    When I click on the chart type selector
    And I select "Line Chart"
    Then the metrics should be displayed as a line chart
    When I select "Bar Chart"
    Then the metrics should be displayed as a bar chart

  @TC2 @ui @zoom
  Scenario: Zoom chart to specific time period
    When I select the zoom tool
    And I select a time period on the chart
    Then the chart should zoom to the selected period
    And I should see detailed metrics for that period

  @TC3 @ui @legend
  Scenario: Toggle metric visibility using legend
    When I click on a metric in the legend
    Then that metric should be hidden from the chart
    When I click on the metric again
    Then that metric should be shown in the chart

  @TC4 @ui @tooltip
  Scenario: View detailed metrics using tooltips
    When I hover over a data point on the chart
    Then I should see a tooltip with detailed metrics
    And the tooltip should show the exact values for that point 