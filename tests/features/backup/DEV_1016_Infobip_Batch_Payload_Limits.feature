Feature: Infobip Messages API Batch and Payload Size Limits (DEV-1016)
  To ensure compliance with Infobip's API limits, the Communication Module must enforce batch and payload size constraints.

  Background:
    Given the Communication Module is integrated with Infobip Messages API

  Scenario: Batch size at maximum limit (100 messages)
    Given I prepare a batch of 100 SMS messages for Infobip
    When I submit the batch to the Communication Module
    Then the request should be accepted by Infobip
    And no splitting should occur

  Scenario: Batch size exceeds maximum limit (e.g., 120 messages)
    Given I prepare a batch of 120 SMS messages for Infobip
    When I submit the batch to the Communication Module
    Then the batch should be split into 2 requests
    And each request should contain no more than 100 messages
    And all messages should be accepted by Infobip

  Scenario: Payload size just under 4MB
    Given I prepare a batch of messages with total payload size just under 4MB
    When I submit the batch to the Communication Module
    Then the request should be accepted by Infobip
    And no splitting should occur

  Scenario: Payload size exceeds 4MB
    Given I prepare a batch of messages with total payload size over 4MB
    When I submit the batch to the Communication Module
    Then the batch should be split into multiple requests
    And each request should not exceed 4MB
    And all messages should be accepted by Infobip

  Scenario: Infobip rejects batch due to size limits
    Given I prepare a batch that exceeds Infobip's limits
    When I submit the batch to the Communication Module
    Then the system should retry with smaller batch sizes
    And logs or alerts should indicate the reason for rejection

  Scenario: Logging and alerting when limits are exceeded
    Given I prepare a batch that exceeds either the batch size or payload size limit
    When I submit the batch to the Communication Module
    Then the system should log or alert that the batch was split due to limit constraints 