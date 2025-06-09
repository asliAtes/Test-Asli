@DEV-1003
Feature: Create RCS tab under Message Reports
  As a user
  I want to see RCS metrics in a dedicated tab
  So that I can monitor RCS message performance

  Background:
    Given I am logged in to the application
    And I navigate to Message Reports page

  @TC-1003-01
  Scenario: RCS tab is visible and can be activated
    When I click on the RCS tab
    Then the RCS tab should be visible
    And RCS Delivery Metrics section should be displayed

  @TC-1003-02
  Scenario: Tab switching works correctly
    When I click on the SMS tab
    Then the SMS tab should be active
    When I click on the Email tab
    Then the Email tab should be active
    When I click on the RCS tab
    Then the RCS tab should be active

  @TC-1003-03
  Scenario: RCS Delivery Metrics cards are visible
    When I click on the RCS tab
    Then I should see RCS Delivery Metrics section
    And I should see the timeframe selector
    And I should see the Delivered metric card

  @TC-1003-04
  Scenario: Chart controls and metrics are functional
    When I click on the RCS tab
    Then I should be able to select different timeframes
    And I should be able to toggle between Column and Line views
    And I should be able to toggle between # and % views

  @TC-1003-05
  Scenario: RCS tab loads within acceptable time
    When I click on the RCS tab
    Then the tab should load within 10 seconds
    And no errors should be displayed

  @TC-1003-06
  Scenario: SMS failover metrics section is visible
    When I click on the RCS tab
    Then I should see SMS failover metrics section
    And the section should contain timeframe selector
    And the section should show Total metrics 