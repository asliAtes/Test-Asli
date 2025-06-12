@DEV-1044 @DEV-958 @smoke @staging @rcs-reports
Feature: DEV-1044 Basic RCS Reports Flow
  As a system user
  I want to verify basic RCS reporting functionality
  So that I can ensure core features are working

  Background: 
    Given I am connected to the USCC staging environment
    And I am logged into the application
    And the RCS metrics verification system is ready
    And I have prepared test data with known message counts

  @DEV-1044 @TC30 @critical @ui
  Scenario: TC30 - View RCS metrics in daily operational report
    When I navigate to the operational reports page
    Then I should see RCS metrics section
    And the RCS metrics should match the test data
    And the delivery status breakdown should be consistent with database records
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts
    And the metrics should be consistent across all sources

  @DEV-1044 @TC31 @critical @api
  Scenario: TC31 - Verify RCS metrics via API
    When I call the daily report API with:
      | startDate  | endDate    | customer |
      | {today}    | {today}    | USCC     |
    Then the API response should be successful
    And the response should contain RCS metrics
    And the metrics should be consistent across all sources
    And the metrics should be within expected ranges

  @DEV-1044 @TC32 @critical @database
  Scenario: TC32 - Verify RCS data in database
    When I query the operational reports data
    Then the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts 