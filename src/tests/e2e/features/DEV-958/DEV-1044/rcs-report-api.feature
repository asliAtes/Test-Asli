@DEV-1044 @api @reports
Feature: RCS SMS Count in Reports
  As a user
  I want to see RCS SMS sent count in reports
  So that I can track RCS message delivery metrics

  Background: 
    Given the treatment and communication modules are deployed and operational
    And I have test data in the system

  @smoke
  Scenario: View RCS SMS count in operational reports
    When I request the operational report data
    Then the API response should include RCS SMS sent count
    And the RCS metrics should match the database values

  @smoke
  Scenario: View RCS SMS count in weekly reports
    When I request the weekly report data
    Then the API response should include RCS SMS sent count
    And the RCS metrics should match the database values 