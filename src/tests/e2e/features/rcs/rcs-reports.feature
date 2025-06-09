@DEV-958 @rcs-reports
Feature: RCS Message Reports and Graphs
  As a user
  I want to see RCS message statistics in reports and graphs
  So that I can track RCS message delivery and performance

  Background: 
    Given I am connected to the USCC staging environment
    And the RCS reporting system is configured

  @DEV-1044 @graphs
  Scenario: Verify RCS data in Message Reports Status graphs
    Given I have sent the following messages:
      | type          | count | status    |
      | RCS           | 2     | delivered |
      | RCS-to-SMS    | 1     | delivered |
      | Regular-SMS   | 1     | delivered |
    When I call the report API with:
      | startDate  | endDate    | customer | commType     |
      | 2025-05-07 | 2025-05-07 | USCC     | rcs         |
    Then the response should contain correct RCS statistics
    And the graph data should match database counts
    And the cumulative data should be accurate

  @DEV-1044 @failover
  Scenario: Verify RCS failover reporting
    Given I have messages with RCS failover to SMS
    When I call the report API with commType "rcs_failover"
    Then the response should show correct failover counts
    And the original message type should be "RCS"
    And the final message type should be "SMS"

  @DEV-1044 @validation
  Scenario Outline: Validate report API with different commTypes
    When I call the report API with:
      | startDate   | endDate     | customer   | commType   |
      | 2025-05-07 | 2025-05-07  | USCC       | <type>     |
    Then the response should have valid format
    And the statistics should match database records

    Examples:
      | type         |
      | sms          |
      | rcs          |
      | rcs_failover | 