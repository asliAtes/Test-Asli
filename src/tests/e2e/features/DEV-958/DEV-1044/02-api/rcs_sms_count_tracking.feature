@DEV-1044
Feature: DEV-1044 RCS SMS Count Tracking in Reports
  As a user
  I want to track RCS SMS counts in reports
  So that I can monitor message delivery metrics

  Background:
    Given the RCS service is operational
    And test data is prepared for RCS message tracking

  @DEV-1044 @TC27 @api
  Scenario: TC27 - Verify RCS SMS count in operational report
    When I send an RCS message to a test number
    And I wait for the message delivery confirmation
    Then the operational report should show the correct RCS SMS count
    And the message status should be "DELIVERED"
    And the RCS SMS sent count should be 1

  @DEV-1044 @TC28 @api
  Scenario: TC28 - Verify RCS SMS count in weekly report
    Given there are RCS messages sent in the past week
    When I generate the weekly report
    Then the weekly report should show the total RCS SMS count
    And the count should match the database records

  @DEV-1044 @TC29 @ui
  Scenario: TC29 - Display RCS metrics on dashboard
    Given there are RCS messages in the system
    When I navigate to the metrics dashboard
    Then I should see the RCS message count displayed
    And the graph should show RCS message delivery trends
    And the metrics should match the database records 