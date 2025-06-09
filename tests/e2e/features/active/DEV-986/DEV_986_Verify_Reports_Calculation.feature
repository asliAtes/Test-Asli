@DEV-986 @RCS @performance-reports @calculation
Feature: DEV-986 Verify performance reports calculation and logic

  Background:
    Given I have a database connection

  @database
  Scenario: Verify performance reports API calculation matches database data
    When I query the database for raw message data between "2025-04-01" and "2025-04-07"
    And I calculate the expected metrics based on the raw data
    And I query the performance reports API for the same date range
    Then the API response metrics should match my calculated metrics

  @ui
  Scenario: Verify performance dashboard shows correct metrics from database
    When I go to the Performance Reports dashboard
    And I set the date range to "2025-04-01" until "2025-04-07"
    And I query the database for raw message data between "2025-04-01" and "2025-04-07"
    And I calculate the expected metrics based on the raw data
    Then the dashboard metrics should match my calculated metrics

  @rcs
  Scenario: Verify RCS metrics calculation logic
    When I query the database for raw message data between "2025-04-01" and "2025-04-07"
    And I calculate the expected metrics based on the raw data
    Then RCS delivery rate should be (delivered / total) * 100
    And RCS successful delivery count should equal delivered messages
    And RCS failed delivery count should include failed, undeliverable, and carrier_error statuses
    And RCS engagement rate should be (engaged / delivered) * 100

  @sms-email-comparison
  Scenario: Verify RCS metrics calculation is consistent with SMS and Email
    When I query the database for raw message data between "2025-04-01" and "2025-04-07"
    And I calculate the expected metrics based on the raw data
    Then the calculation logic for delivery rate should be the same for RCS, SMS, and Email channels
    And the categorization of message statuses should be consistent across channels
    And the rounding rules for percentages should be the same for all channels 