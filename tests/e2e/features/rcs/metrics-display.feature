@DEV-1003 @metrics
Feature: RCS Metrics Display
  As a user
  I want to see RCS metrics in a dedicated section
  So that I can monitor RCS message performance

  Background:
    Given I am logged in to the application
    And I navigate to Message Reports page
    And I click on the RCS tab

  @TC-1003-03
  Scenario: RCS Delivery Metrics cards are visible
    Then I should see RCS Delivery Metrics section
    And I should see the timeframe selector
    And I should see the Delivered metric card

  @TC-1003-06
  Scenario: SMS failover metrics section is visible
    Then I should see SMS failover metrics section
    And the section should contain timeframe selector
    And the section should show Total metrics 