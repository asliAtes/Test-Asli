@rcs @ui @navigation
Feature: RCS Tab Navigation
  As a system user
  I want to navigate through different RCS sections
  So that I can access various RCS functionalities

  Background:
    Given I am logged in to the application
    And I am on the RCS dashboard

  @TC1 @smoke @ui
  Scenario: Navigate to RCS metrics tab
    When I click on the "Metrics" tab
    Then I should see the RCS metrics page
    And the metrics data should be loaded

  @TC2 @ui
  Scenario: Navigate to RCS configuration tab
    When I click on the "Configuration" tab
    Then I should see the RCS configuration page
    And all configuration options should be visible

  @TC3 @ui
  Scenario: Navigate to RCS templates tab
    When I click on the "Templates" tab
    Then I should see the RCS templates page
    And the list of templates should be loaded

  @TC4 @ui @breadcrumb
  Scenario: Use breadcrumb navigation
    Given I am on the RCS templates page
    When I click on the "RCS Dashboard" breadcrumb
    Then I should return to the RCS dashboard

  @TC5 @ui @refresh
  Scenario: Tab content refresh
    Given I am on the RCS metrics tab
    When I click the refresh button
    Then the metrics data should be updated
    And the last refresh timestamp should be current 