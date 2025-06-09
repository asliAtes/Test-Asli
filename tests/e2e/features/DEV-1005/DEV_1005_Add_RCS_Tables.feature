@DEV-1005
Feature: Add RCS data to tables under Message Reports > Trends
  As a user
  I want to see RCS data in the Message Reports Trends table
  So that I can track RCS message statistics

  Background:
    Given I am logged in to the application
    And I navigate to Message Reports page
    And I click on the Trends tab

  @TC-1005-01
  Scenario: RCS sent column is present after SMS sent
    When I scroll the table to the right
    Then I should see "RCS sent" column
    And "RCS sent" column should be after "SMS sent" column

  @TC-1005-02
  Scenario: RCS sent column contains numeric data
    When I scroll the table to the right
    Then I should see "RCS sent" column
    And the "RCS sent" column should contain numeric values 