@DEV-958 @DEV-1044 @rcs-reports
Feature: RCS Message Reports and Status Tracking
  As a system administrator
  I want to track RCS message delivery status in reports
  So that I can monitor message delivery performance

  Background: 
    Given the treatment and communication modules are deployed
    And the mab_operational_reports_data table has rcs_sms_sent_count column
    And I am logged into the application
    And the test data file "KAI_cohort_20250523_1611.csv" is already uploaded
    And RCS messages have been sent via Infobip

  @smoke @database
  Scenario: Track RCS message delivery statuses in database
    When I check the message statuses in database
    Then the mab_operational_reports_data should show:
      | total_records | rcs_sms_sent_count | delivery_date |
      | 2            | 2                   | 2025-05-23    |
    And the delivery statuses should match the expected counts

  @smoke @api
  Scenario: Verify RCS metrics in daily operational report
    When I call the "/get-mabOperationalReportData" API with:
      | startDate  | endDate    | customer | commType |
      | 2025-05-23 | 2025-05-23 | USCC     | rcs      |
    Then the API response should contain "rcsSmsSentCount"
    And the response metrics should match database records:
      | metric            | expected_value |
      | total_records     | 2             |
      | rcs_sms_sent     | 2             |
    And the delivery status breakdown should be accurate

  @regression @weekly
  Scenario: Verify RCS metrics in weekly report
    When I call the "/get-mabReportsData" API with:
      | startDate  | endDate    | customer | commType |
      | 2025-05-23 | 2025-05-23 | USCC     | rcs      |
    Then the weekly report should show consistent totals
    And the trend data should match daily aggregates

  @smoke @integration
  Scenario: Verify existing RCS messages in Infobip
    When I check the Infobip delivery status for customer_id "614241001"
    Then the delivery status should be "DELIVERED"
    And the phone number should be "2068519215"
    And the operational report should show:
      | metric            | value |
      | total_records     | 2     |
      | rcs_sms_sent     | 2     |
      | delivery_status   | DELIVERED |

  @regression @data-consistency
  Scenario: Verify data consistency across reports
    When I gather metrics from multiple sources:
      | source              |
      | Database           |
      | Operational API    |
      | Weekly API         |
      | UI Display         |
    Then all sources should show consistent counts:
      | metric            | expected_value |
      | total_records     | 2             |
      | rcs_sms_sent     | 2             |
    And the delivery status totals should match

  @graphs @smoke
  Scenario: Verify RCS data in Message Reports Status graphs
    When I call the report API with:
      | startDate  | endDate    | customer | commType |
      | 2025-05-23 | 2025-05-23 | USCC     | rcs      |
    Then the response should contain correct RCS statistics
    And the graph data should match database records:
      | metric            | expected_value |
      | total_records     | 2             |
      | rcs_sms_sent     | 2             |
    And the cumulative data should be accurate

  @failover @regression
  Scenario: Verify RCS failover reporting
    Given I have messages with RCS failover to SMS
    When I call the report API with commType "rcs_failover"
    Then the response should show correct failover counts
    And the original message type should be "RCS"
    And the final message type should be "SMS"

  @validation @regression
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