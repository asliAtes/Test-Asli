
@DEV-1011 @keycloac_uscc_server26
Feature: Keycloak Docker Deployment Verification on Server 26 - USCC Staging

  Background:
    Given the Keycloak Docker container is deployed on Server 26 in USCC staging

  @smoke @TC-1
  Scenario: Verify Keycloak container is running and exposed
    When I run "docker ps" on Server 26
    Then the container named "keycloak-custom" should be listed
    And the container status should be "Up"
    And the ports 8080 and 8443 should be mapped

  @api @TC-2
  Scenario: Verify HTTPS endpoint responds
    When I send a GET request to "https://<server26-ip>:8443/auth"
    Then I should receive a valid HTTP response code like 200 or 302

  @ui @TC-3
  Scenario: Verify Keycloak admin console is accessible
    When I open "https://<server26-ip>:8443/auth/admin"
    Then the login screen should be displayed

  @login @TC-4
  Scenario: Verify admin user can log in to Keycloak
    Given I am on the Keycloak admin login page
    When I login with username "admin" and password "<admin-password>"
    Then I should be redirected to the admin dashboard

  @data @TC-5
  Scenario: Verify expected realm and users exist
    When I query the existing realms
    Then the "uscc" realm should be present
    And at least one user should exist under the "uscc" realm

  @restart @TC-6
  Scenario: Verify Keycloak persists after container restart
    When I restart the Docker container named "keycloak-custom"
    And I wait for the container to be ready
    Then a request to "https://<server26-ip>:8443/auth" should still return a valid response

  @logs @TC-7
  Scenario: Verify no startup errors in container logs
    When I check the logs of the container "keycloak-custom"
    Then there should be no "ERROR" or "Exception" messages