@DEV-958 @DEV-1044 @smoke @staging @rcs-reports
Feature: Basic RCS Reports Flow
  As a system user
  I want to verify basic RCS reporting functionality
  So that I can ensure core features are working

  Background: 
    Given I am connected to the USCC staging environment
    And I am logged into the application
    And test data is prepared

  @critical @ui
  Scenario: View RCS metrics in daily operational report
    When I navigate to the operational reports page
    Then I should see RCS metrics section
    And the RCS sent count should be "5"
    And the delivery status breakdown should show:
      | status    | count |
      | Delivered | 5     |
      | Pending   | 3     |
      | Failed    | 2     |

  @critical @api
  Scenario: Verify RCS metrics via API
    When I call the daily report API with:
      | startDate  | endDate    | customer |
      | 2025-05-23 | 2025-05-23 | USCC     |
    Then the API response should be successful
    And the response should contain RCS metrics
    And the total RCS sent count should be "10"

  @critical @database
  Scenario: Verify RCS data in database
    When I query the operational reports data
    Then the RCS SMS sent count should match expected values
    And the delivery statuses should be accurate 