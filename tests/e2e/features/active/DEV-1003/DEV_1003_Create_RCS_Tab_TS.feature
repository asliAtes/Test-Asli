@DEV-1003 @RCS @UI @TS
Feature: DEV-1003 Create RCS Tab under SMS/Email Reports (TypeScript)

  Background: 
    Given I am logged in as an admin user

  @smoke
  Scenario: Verify the existence of the RCS tab
    When I navigate to "Message Reports" page
    And I view the channel tabs
    Then I should see the following tabs in order:
      | Tab Name |
      | SMS      |
      | Email    |
      | RCS      |
    And the "SMS" tab should be active by default

  Scenario: Verify tab functionality and content
    When I navigate to "Message Reports" page
    And I click on "RCS" tab
    Then the "RCS" tab should be active
    And I should see "RCS Reports" heading
    And I should see a metrics summary section
    And I should see a timeframe selection dropdown
    And I should see a chart visualization area
    And the layout should match the approved design

  Scenario: Verify tab load time
    When I navigate to "Message Reports" page
    And I click on "RCS" tab
    Then the RCS tab content should load within 5 seconds
    And no loading errors should be displayed

  @responsive
  Scenario Outline: Verify responsive layout on different devices
    Given I am using a <device> browser
    When I navigate to "Message Reports" page
    And I click on "RCS" tab
    Then the RCS tab should display correctly <view>

    Examples:
      | device   | view              |
      | desktop  |                   |
      | tablet   | in tablet view    |
      | mobile   | in mobile view    | 