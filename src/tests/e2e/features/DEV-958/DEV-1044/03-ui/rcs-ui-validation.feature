@DEV-1044 @DEV-958 @rcs-ui @smoke
Feature: DEV-1044 RCS UI Validation - Real Staging Test
  As a tester
  I want to verify RCS metrics display correctly in staging UI
  So that I can validate Suresh's implementation

  Background:
    Given I am logged into the staging application with credentials
    And I navigate to the SMS/Email Reports page

  @DEV-1044 @TC4 @critical @rcs-metrics
  Scenario: TC4 - Verify RCS delivery metrics display correctly
    When I click on the RCS tab
    And I set the timeframe to "Last 30days"
    Then I should see the RCS Delivery Metrics section
    And the Total count should be greater than 0
    And the Delivered count should be greater than 0
    And the Seen count should be greater than 0

  @DEV-1044 @TC5 @charts @visualization
  Scenario: TC5 - Verify RCS metrics chart is working
    When I click on the RCS tab  
    And I set the timeframe to "Last 30days"
    Then I should see the delivery metrics chart
    And the chart should show delivery status data
    And the chart legend should be visible 