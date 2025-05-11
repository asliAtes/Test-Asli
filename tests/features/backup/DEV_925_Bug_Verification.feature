Feature: Bug Verification Tests
  As a QA engineer
  I want to verify if previously reported bugs have been fixed
  So that we can confirm the fixes

  # Bug Status Summary:
  # Bug #1 (BNE Integration): NOT FIXED - Still returns 500 error
  # Bug #2 (Malformed JSON): PARTIALLY FIXED - Returns 400 instead of 500, but still exposes stack trace
  # Bug #3 (Large Message): PARTIALLY FIXED - Returns 400 instead of 500, but validation limit changed (800 vs 1600)
  # Bug #4 (Scheduling): NOT FIXED - Error message is unclear about requirements

  @DEV-925-TC1 @bug-verification @bne-500-error @Known_Issue
  Scenario: Bug #1 - BNE SMS carrier integration fails with 500 Internal Server Error
    # This bug remains unfixed - BNE integration still returns 500 Internal Server Error
    Given I prepare a standard SMS message request
    And I set the carrier to "BNE"
    And I set a valid T-Mobile phone number "+12144352325"
    When I submit the request to the communication module
    Then the response should have status code 200
    And the message should be routed to BNE
  
  @DEV-925-TC2 @bug-verification @malformed-json @Known_Issue
  Scenario: Bug #2 - Malformed JSON exposes internal stack trace in 500 error
    # This bug is partially fixed. API now returns 400 instead of 500,
    # but still exposes stack trace information which is a security risk
    Given I prepare a malformed JSON message request
    When I submit the invalid request to the communication module
    Then the response should have status code 400
    And the response should not contain stack trace information
  
  @DEV-925-TC3 @bug-verification @large-message @Known_Issue
  Scenario: Bug #3 - Large Message Content Handling (500 Error)
    # This bug is partially fixed. API now returns 400 instead of 500,
    # but message length limit has changed from 1600 to 800 characters
    Given I prepare a standard SMS message request
    And I set the carrier to "TWILIO"
    And I set a valid phone number
    And I set message content exceeding 1600 characters
    When I submit the request to the communication module
    Then the response should have status code 400
    And the response should indicate message length limit exceeded
  
  @DEV-925-TC4 @bug-verification @scheduling-param @Known_Issue
  Scenario: Bug #4 - Scheduling error message is unclear
    Given I prepare a standard SMS message request
    And I set the carrier to "TWILIO"
    And I set a valid phone number
    And I set schedule=true without scheduleAt parameter
    When I submit the request to the communication module
    Then the response should have status code 400
    And the response should clearly indicate scheduleAt parameter is required 