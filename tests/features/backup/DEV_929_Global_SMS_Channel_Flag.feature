@DEV-929 @Feature_Flag @Comm_Module
Feature: Global SMS Channel Routing (Carrier-Based Only)
  The system supports only carrier-based routing. The globalSMSChannel parameter is not supported and will be rejected.

  Background:
    Given the Global SMS Channel communication module is deployed and accessible

  Scenario: Standard customer uses Twilio by default
    Given a standard customer is configured for SMS routing
    When I send a Global SMS Channel request for the standard customer
    Then the Global SMS Channel response should indicate routing to "Twilio"
    And the Global SMS Channel response should indicate successful message acceptance

  Scenario: T-Mobile customer uses BNE
    Given a T-Mobile customer is configured for SMS routing
    When I send a Global SMS Channel request for the T-Mobile customer
    Then the Global SMS Channel response should indicate routing to "BNE"
    And the Global SMS Channel response should indicate successful message acceptance

  Scenario: USCC customer uses Infobip
    Given a USCC customer is configured for SMS routing
    When I send a Global SMS Channel request for the USCC customer
    Then the Global SMS Channel response should indicate routing to "Infobip"
    And the Global SMS Channel response should indicate successful message acceptance

  Scenario: New customer uses Infobip
    Given a new customer is configured for SMS routing
    When I send a Global SMS Channel request for the new customer
    Then the Global SMS Channel response should indicate routing to "Infobip"
    And the Global SMS Channel response should indicate successful message acceptance

  Scenario: Invalid carrier parameter is rejected
    Given a standard customer is configured for SMS routing
    When I send a Global SMS Channel request for the standard customer with an invalid carrier
    Then the Global SMS Channel response should indicate a 400 Bad Request for carrier
    And the Global SMS Channel error message should contain "Invalid carrier" 