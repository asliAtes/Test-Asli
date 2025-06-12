@DEV-1044 @DEV-958 @rcs-complete
Feature: DEV-1044 RCS Complete Flow Testing
  As a system tester
  I want to verify the RCS messaging flow
  So that I can ensure message delivery works correctly

  Background: 
    Given the communication module is deployed and operational
    And I am logged into the application
    And the RCS metrics verification system is ready
    And I have prepared test data with known message counts

  @DEV-1044 @TC7 @smoke @message-sending
  Scenario: TC7 - Send RCS messages through Infobip
    Given I have a test file with valid records
    When I upload the test file through the communication module
    Then the file should be processed successfully
    And the messages should be sent through Infobip
    And all messages should have valid delivery status
    And I should receive delivery confirmations from Infobip
    And the delivery events should be logged in bne_events_data table
    And the metrics should be consistent across all sources

  @DEV-1044 @TC8 @smoke @api @validation
  Scenario: TC8 - Validate daily operational report data
    Given RCS messages have been sent and delivered
    When I call the "/get-mabOperationalReportData" API with parameters:
      | startDate  | endDate    | customer | commType |
      | {today}    | {today}    | USCC     | rcs      |
    Then the API response should have valid format
    And the response should contain RCS metrics
    And the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts
    And the metrics should be within expected ranges

  @DEV-1044 @TC9 @smoke @api @validation
  Scenario: TC9 - Validate weekly report data
    Given RCS messages have been sent and delivered
    When I call the "/get-mabReportsData" API with parameters:
      | startDate  | endDate    | customer | commType |
      | {today}    | {today}    | USCC     | rcs      |
    Then the API response should have valid format
    And the response should contain RCS metrics
    And the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts
    And the metrics should be within expected ranges

  @DEV-1044 @TC10 @smoke @ui @validation
  Scenario: TC10 - Verify RCS data display on UI
    Given RCS messages have been sent and delivered
    When I navigate to the operational reports page
    Then I should see the RCS metrics section
    And the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts
    And the metrics should be within expected ranges
    When I navigate to the weekly reports page
    Then I should see the RCS metrics section
    And the metrics should be consistent across all sources
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts
    And the metrics should be within expected ranges

  @DEV-1044 @TC11 @regression @data-consistency
  Scenario: TC11 - Verify data consistency across all layers
    Given RCS messages have been sent and delivered
    When I gather metrics from:
      | source              |
      | Database           |
      | Operational API    |
      | Weekly API         |
      | UI Display         |
      | Infobip Records    |
    Then all sources should show consistent counts
    And all metrics should be greater than or equal to zero
    And the total count should match the sum of individual status counts
    And the metrics should be within expected ranges 