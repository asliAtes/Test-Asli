Feature: SMS and RCS Reporting Tab

  Background:
    Given the API endpoint is "https://jlyfljojpe.execute-api.us-east-2.amazonaws.com/uscc-dev/report"
    And the request payload contains "customer" as "USCC" and "startDate" and "endDate" as "2025-05-07"

  Scenario: Normal SMS is sent and delivered as SMS
    Given a normal SMS message is triggered (not via failover)
    When I request the report with commType "sms"
    Then the "delivered" count in the response should be greater than or equal to 1
    And the record in database should have "original_message_type" = "SMS" and "message_type" = "SMS"

  Scenario: Infobip RCS message is sent and delivered as RCS
    Given an Infobip RCS message is sent and delivered successfully
    When I request the report with commType "rcs"
    Then the "delivered" count in the response should be greater than or equal to 1
    And the record in database should have "original_message_type" = "RCS" and "message_type" = "RCS"

  Scenario: Infobip RCS message is sent but delivered via SMS (failover)
    Given an Infobip RCS message is sent and delivered via SMS due to failover
    When I request the report with commType "rcs_failover"
    Then the "delivered" count in the response should be greater than or equal to 1
    And the record in database should have "original_message_type" = "RCS" and "message_type" = "SMS"

  Scenario: Verify webhook does not alter original_message_type
    Given an RCS message is triggered
    And the delivery is updated via webhook
    Then the "original_message_type" in database should remain as "RCS"
    And the "message_type" may reflect the actual delivery channel (RCS or SMS)

  Scenario: Validate UI reflects accurate counts for all message types
    When I open the SMS/Email Summary UI
    Then the total delivered counts should match the respective API report for sms, rcs, and rcs_failover