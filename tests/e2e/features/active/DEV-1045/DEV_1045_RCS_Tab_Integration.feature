@DEV-1045 @RCS-tab-integration
Feature: RCS Tab Integration Under SMS/Email Reports
  As a user of Kredos AI
  I need to see RCS delivery metrics in the reporting dashboard
  So that I can track all message channels in one place

  Background: 
    Given I am logged in as an admin user
    And I navigate to "Delivery Performance Metrics" page

  @DEV-1045-TC1 @ui @smoke
  Scenario: Verify RCS tab is present and clickable
    When I view the channel tabs
    Then I should see "SMS" tab
    And I should see "Email" tab
    And I should see "RCS" tab
    When I click on "RCS" tab
    Then the "RCS" tab should be active
    And I should see "RCS Delivery Metrics" heading

  @DEV-1045-TC2 @ui @metrics
  Scenario: Verify RCS metrics summary counts
    When I click on "RCS" tab
    Then I should see the following metric sections:
      | Label        | Description                                  |
      | Total        | Total number of RCS messages attempted       |
      | Delivered    | Number of successfully delivered messages    |
      | Pending      | Number of messages waiting for delivery      |
      | Carrier Error| Number of messages with carrier errors       |
      | Unreachable  | Number of messages where recipient not found |
      | Undelivered  | Number of messages that failed to deliver    |

  @DEV-1045-TC3 @ui @charts
  Scenario: Verify RCS metrics charts display correctly
    When I click on "RCS" tab
    Then I should see a chart displaying RCS metrics
    And the chart should have a date axis
    And the chart should show data points for "Delivered" messages
    And the chart should show data points for "Undelivered" messages
    And the chart should show data points for "Pending" messages
    And the chart legend should be visible

  @DEV-1045-TC4 @ui @filter
  Scenario: Verify timeframe filtering for RCS metrics
    When I click on "RCS" tab
    And I select timeframe "Last 7days" from dropdown
    Then the RCS metrics should update to show data for last 7 days
    When I select a custom date range
      | Start Date | End Date   |
      | 2025-04-14 | 2025-04-21 |
    And I click "Submit"
    Then the RCS metrics should update to show data for selected date range

  @DEV-1045-TC5 @ui @integration
  Scenario: Verify RCS failover metrics are tracked separately
    When I click on "SMS" tab
    Then I should see "SMS (from RCS Failover) Delivery Metrics" section
    And these metrics should show RCS messages that failed over to SMS
    When I click on "RCS" tab
    Then I should not see failed over messages in RCS counts

  @DEV-1045-TC6 @api @data-validation
  Scenario: Verify RCS metrics data matches database values
    When I retrieve RCS metrics from the UI for date "2025-04-21"
    And I query the database for RCS messages on "2025-04-21"
    Then the UI metrics should match database counts for:
      | Metric      | Database Column          |
      | Total       | total_rcs_messages       |
      | Delivered   | delivered_rcs_messages   |
      | Pending     | pending_rcs_messages     |
      | Unreachable | unreachable_rcs_messages |

  @DEV-1045-TC7 @ui @export
  Scenario: Verify RCS metrics can be exported
    When I click on "RCS" tab
    And I click on "Export" button
    Then a CSV file should be downloaded
    And the CSV should contain columns for all RCS metrics
    And the CSV data should match the displayed metrics

  @DEV-1045-TC8 @ui @view-toggle
  Scenario: Verify switching between column and line chart views
    When I click on "RCS" tab
    And I click on "Column" button
    Then the chart should display as a column chart
    When I click on "Line" button
    Then the chart should display as a line chart
    When I click on "#" button
    Then the chart should show absolute values
    When I click on "%" button
    Then the chart should show percentage values 