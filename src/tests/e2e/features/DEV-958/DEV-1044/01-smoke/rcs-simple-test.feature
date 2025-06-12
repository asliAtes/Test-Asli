@DEV-1044 @DEV-958 @rcs-simple
Feature: DEV-1044 RCS Simple Authentication Test
  As a tester
  I want to verify I can login to staging with credentials
  So that I can access the RCS features

  @DEV-1044 @TC6 @auth-test
  Scenario: TC6 - Verify staging login works with credentials
    Given I can access the staging environment
    When I attempt to login with admin credentials
    Then I should be successfully authenticated 