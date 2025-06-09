@DEV-1004 @RCS @graphs @UI
Feature: DEV-1004 Add RCS data to graphs under Message Reports > Status

  Background: 
    Given I am logged in as an admin user
    And I navigate to "Message Reports" page
    And I click on "Status" tab

  @smoke
  Scenario: Verify RCS data appears in status graphs
    When I view the status graphs
    Then I should see "RCS" data series in the graphs
    And RCS data should be visually distinct from other channels

  Scenario: Verify daily delivery status graph includes RCS data
    When I view the daily delivery status graph
    Then I should see RCS delivery data for each day
    And the graph legend should include RCS
    And hovering over RCS data points should show correct values
    And the RCS data should match the database records

  Scenario: Verify filtering by different timeframes
    When I select "Last 7 Days" from the timeframe dropdown
    Then the graphs should update to show RCS data for the last 7 days
    When I select a custom date range
      | Start Date | End Date   |
      | 2025-04-14 | 2025-04-21 |
    And I click "Apply"
    Then the graphs should update to show RCS data for the selected date range

  Scenario: Verify RCS data segmentation in breakdown graphs
    When I view the delivery status breakdown graph
    Then I should see RCS data segmented by the following statuses:
      | Status        |
      | Delivered     |
      | Failed        |
      | Pending       |
      | Carrier Error |
    And the segments should display correct proportions
    And the segments should use the standard color scheme

  Scenario: Verify toggling visibility of RCS data
    When I view the status graphs with all channels visible
    And I click on the RCS legend item to toggle visibility
    Then RCS data should be hidden
    When I click on the RCS legend item to toggle visibility
    Then RCS data should become visible again

  @export
  Scenario: Verify data export includes RCS metrics
    When I view the status graphs
    And I click on "Export Data" button
    Then the exported data should include RCS metrics
    And the exported format should maintain channel separation 