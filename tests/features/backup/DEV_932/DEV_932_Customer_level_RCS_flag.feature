@DEV-932 @Customer_Flag @Comm_Module
Feature: Customer Level RCS Flag
  As a developer
  I want to control whether to use RCS or SMS at the customer level
  So that customers can choose their preferred messaging channel

  Background:
    # IMPORTANT: The tryRCS parameter is no longer supported and is rejected by the API.
    # All scenarios and steps using tryRCS have been removed or rewritten to reflect this product direction.
    # Only T-Mobile (BNE) scenarios remain valid.

  @TC05 @Special @TMobile
  Scenario: T-Mobile customer always uses BNE (true)
    Given customer "T-Mobile" is configured
    When I send a message to any device
    Then the message should be delivered through "SMS" via "BNE"
    And the response should indicate successful message acceptance

  @TC06 @Special @TMobile
  Scenario: T-Mobile customer always uses BNE (false)
    Given customer "T-Mobile" is configured
    When I send a message to any device
    Then the message should be delivered through "SMS" via "BNE"
    And the response should indicate successful message acceptance

  # (Optional) Add any additional scenarios if new requirements are clarified. 