@DEV-958 @DEV-1044 @rcs-complete
Feature: RCS Complete Flow Testing
  As a system tester
  I want to verify the RCS messaging flow
  So that I can ensure message delivery works correctly

  Background: 
    Given the communication module is deployed and operational
    And I am logged into the application

  @smoke @message-sending
  Scenario: Send RCS messages through Infobip
    Given I have a test file "RCS_test_file.csv" with the following records:
      | phone_number | message_text        | client_id  |
      | 2068519215  | Test RCS Message 1  | TEST001    |
      | 2068519216  | Test RCS Message 2  | TEST002    |
    When I upload the test file through the communication module
    Then the file should be processed successfully
    And the messages should be sent through Infobip
    And all messages should have delivery status "DELIVERED"
    And I should receive delivery confirmations from Infobip
    And the delivery events should be logged in bne_events_data table

  @smoke @api @validation
  Scenario: Validate daily operational report data
    Given RCS messages have been sent and delivered
    When I call the "/get-mabOperationalReportData" API with parameters:
      | startDate  | endDate    | customer | commType |
      | {today}    | {today}    | USCC     | rcs      |
    Then the API response should have correct format
    And the response should contain "rcsSmsSentCount" field
    And the chartdata should contain:
      | field        | value |
      | total        | 2     |
      | delivered    | 2     |
      | pending      | 0     |
      | undelivered  | 0     |

  @smoke @api @validation
  Scenario: Validate weekly report data
    Given RCS messages have been sent and delivered
    When I call the "/get-mabReportsData" API with parameters:
      | startDate  | endDate    | customer | commType |
      | {today}    | {today}    | USCC     | rcs      |
    Then the API response should have correct format
    And the response should contain "rcsSmsSentCount" field
    And the chartdata should match daily report data

  @smoke @ui @validation
  Scenario: Verify RCS data display on UI
    Given RCS messages have been sent and delivered
    When I navigate to the operational reports page
    Then I should see the RCS SMS count "2" displayed correctly
    And the delivery status chart should show:
      | status    | count |
      | Delivered | 2     |
    When I navigate to the weekly reports page
    Then I should see the RCS SMS count "2" displayed correctly
    And the weekly trend chart should include today's data

  @regression @data-consistency
  Scenario: Verify data consistency across all layers
    Given RCS messages have been sent and delivered
    When I gather metrics from:
      | source              |
      | Database           |
      | Operational API    |
      | Weekly API         |
      | UI Display         |
      | Infobip Records    |
    Then all sources should show consistent counts
    And all sources should show consistent delivery statuses 