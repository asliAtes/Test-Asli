@DEV-1004
Feature: Add RCS data to graphs under Message Reports > Status
  As a user
  I want to see RCS segments in the Message Reports Status pie chart
  So that I can track RCS message distribution

  Background:
    Given I am logged in to the application
    And I navigate to Message Reports page
    And I click on the Status tab

  @TC-1004-01
  Scenario: RCS segments are present in pie chart
    When I view the "AI Sequencing: SMS & Email" pie chart
    Then I should see "RCS sent" segment in the chart
    And "RCS sent" segment should be after "SMS sent" segment

  @TC-1004-02
  Scenario: RCS segment values match with totals
    When I view the "AI Sequencing: SMS & Email" pie chart
    Then the sum of all segment values should match the total count
    And "RCS sent" segment should contain numeric values 