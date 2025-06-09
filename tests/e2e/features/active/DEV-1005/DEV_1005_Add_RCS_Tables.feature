@DEV-1005 @RCS @tables @UI
Feature: DEV-1005 Add RCS data to tables under Message Reports > Trends

  Background:
    Given I am logged in as an admin user
    And I navigate to "Message Reports" page
    And I click on "Trends" tab

  @smoke
  Scenario: Verify RCS data appears in trends tables
    When I view the trends tables
    Then I should see RCS-related columns in the tables
    And RCS data should be properly formatted
    And RCS data should be up-to-date

  Scenario: Verify RCS columns structure and order
    When I view the trends tables
    Then I should see the following RCS columns:
      | Column Name         |
      | RCS Sent            |
      | RCS Delivered       |
      | RCS Failed          |
      | RCS Pending         |
      | RCS Delivery Rate (%) |
    And the columns should be in the correct order
    And the column headers should use the standard naming convention

  Scenario: Verify RCS data sorting functionality
    When I view the trends tables
    And I click on "RCS Sent" column header
    Then the table should sort by RCS sent count in ascending order
    When I click on "RCS Sent" column header
    Then the table should sort by RCS sent count in descending order
    When I click on "RCS Delivery Rate (%)" column header
    Then the table should sort by RCS delivery rate in ascending order

  @data-accuracy
  Scenario: Verify RCS data accuracy in tables
    When I view the RCS data in trends tables for yesterday
    And I query the database for RCS delivery metrics for yesterday
    Then the table data should match the database records with 100% accuracy
    And calculated metrics like delivery rate should be correctly computed

  Scenario: Verify RCS data export functionality
    When I view the trends tables
    And I click on "Export CSV" button
    Then the exported CSV should include all RCS columns
    And the RCS data in CSV should match what is displayed in the UI tables 