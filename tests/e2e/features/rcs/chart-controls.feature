@DEV-1003 @charts
Feature: RCS Chart Controls
  As a user
  I want to control how RCS metrics are displayed
  So that I can analyze the data in different ways

  Background:
    Given I am logged in to the application
    And I navigate to Message Reports page
    And I click on the RCS tab

  @TC-1003-04
  Scenario: Chart controls and metrics are functional
    Then I should be able to select different timeframes
    And I should be able to toggle between Column and Line views
    And I should be able to toggle between # and % views

  @TC-1003-04-1
  Scenario: Timeframe selection updates chart data
    When I select "Last 7 Days" timeframe
    Then the chart should update with 7 days of data
    When I select "Last 30 Days" timeframe
    Then the chart should update with 30 days of data

  @TC-1003-04-2
  Scenario: View type changes update chart visualization
    When I toggle to "Line" view
    Then the chart should display as a line graph
    When I toggle to "Column" view
    Then the chart should display as a column graph 