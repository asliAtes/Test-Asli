@DEV-1044 @DEV-958 @rcs-reports
Feature: DEV-1044 RCS Message Reports and Status Tracking
  As a system administrator
  I want to track RCS message delivery status in reports
  So that I can monitor message delivery performance

  Background: 
    Given the treatment and communication modules are deployed
    And the mab_operational_reports_data table has rcs_sms_sent_count column
    And I am logged into the application
    And the RCS metrics verification system is ready
    And I have prepared test data with known message counts

  @DEV-1044 @TC12 @smoke @database
  Scenario: TC12 - Track RCS message delivery statuses in database
    When I check the message statuses in database
    Then the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts
    And the delivery statuses should match the expected counts

  @DEV-1044 @TC13 @smoke @api
  Scenario: TC13 - Verify RCS metrics in daily operational report
    When I call the "/get-mabOperationalReportData" API with:
      | startDate  | endDate    | customer | commType |
      | {today}    | {today}    | USCC     | rcs      |
    Then the API response should contain RCS metrics
    And the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts
    And the delivery status breakdown should be accurate

  @DEV-1044 @TC14 @regression @weekly
  Scenario: TC14 - Verify RCS metrics in weekly report
    When I call the "/get-mabReportsData" API with:
      | startDate  | endDate    | customer | commType |
      | {today}    | {today}    | USCC     | rcs      |
    Then the weekly report should show consistent totals
    And the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the metrics should be within expected ranges

  @DEV-1044 @TC15 @smoke @integration
  Scenario: TC15 - Verify existing RCS messages in Infobip
    When I check the Infobip delivery status for customer_id "{customer_id}"
    Then the delivery status should be valid
    And the phone number should be valid
    And the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts

  @DEV-1044 @TC16 @regression @data-consistency
  Scenario: TC16 - Verify data consistency across reports
    When I gather metrics from multiple sources:
      | source              |
      | Database           |
      | Operational API    |
      | Weekly API         |
      | UI Display         |
    Then all sources should show consistent counts
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts
    And the metrics should be within expected ranges

  @DEV-1044 @TC17 @graphs @smoke
  Scenario: TC17 - Verify RCS data in Message Reports Status graphs
    When I call the report API with:
      | startDate  | endDate    | customer | commType |
      | {today}    | {today}    | USCC     | rcs      |
    Then the response should contain RCS metrics
    And the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts
    And the metrics should be within expected ranges

  @DEV-1044 @TC18 @failover @regression
  Scenario: TC18 - Verify RCS failover reporting
    Given I have messages with RCS failover to SMS
    When I call the report API with commType "rcs_failover"
    Then the response should show correct failover counts
    And the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts

  @DEV-1044 @TC19 @validation @regression
  Scenario Outline: TC19 - Validate report API with different commTypes
    When I call the report API with:
      | startDate   | endDate     | customer   | commType   |
      | {today}     | {today}     | USCC       | <type>     |
    Then the response should have valid format
    And the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts

    Examples:
      | type         |
      | sms          |
      | rcs          |
      | rcs_failover | 