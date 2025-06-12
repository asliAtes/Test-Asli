@DEV-1044 @api @reports
Feature: DEV-1044 RCS SMS Count in Reports
  As a user
  I want to see RCS SMS sent count in reports
  So that I can track RCS message delivery metrics

  Background: 
    Given the treatment and communication modules are deployed and operational
    And the RCS metrics verification system is ready
    And I have prepared test data with known message counts

  @DEV-1044 @TC25 @smoke
  Scenario: TC25 - View RCS SMS count in operational reports
    When I request the operational report data
    Then the API response should include RCS metrics
    And the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts
    And the metrics should be within expected ranges

  @DEV-1044 @TC26 @smoke
  Scenario: TC26 - View RCS SMS count in weekly reports
    When I request the weekly report data
    Then the API response should include RCS metrics
    And the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts
    And the metrics should be within expected ranges 