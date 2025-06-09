@DEV-1007 @RCS @performance-reports @UI
Feature: DEV-1007 Add new counts to Performance Reports > Counts

  Background:
    Given I am on the Performance Reports page
    And I navigate to the Counts section

  @smoke
  Scenario: Verify new RCS counts in Counts section
    Then I should see the following RCS counts in the Counts section:
      | Count Name           |
      | RCS Sent             |
      | RCS Delivered        |
      | RCS Failed           |
      | RCS Carrier Error    |
      | RCS Rejected         |
      | RCS Blocked          |

  Scenario: Verify RCS sent count displays correctly
    Then the "RCS Sent" count should display the correct value
    When I hover over the "RCS Sent" count
    Then I should see an informational tooltip explaining the count

  Scenario: Verify RCS delivered count displays correctly
    Then the "RCS Delivered" count should display the correct value
    When I hover over the "RCS Delivered" count
    Then I should see an informational tooltip explaining the count

  Scenario: Verify RCS failed count displays correctly
    Then the "RCS Failed" count should display the correct value
    When I hover over the "RCS Failed" count
    Then I should see an informational tooltip explaining the count

  Scenario: Verify counts update based on time period selection
    When I select "Last 7 Days" from the time period dropdown
    Then the counts should update to reflect the "Last 7 Days" time period
    When I select "Last 30 Days" from the time period dropdown
    Then the counts should update to reflect the "Last 30 Days" time period

  Scenario: Verify counts update based on filter selection
    When I apply a filter for "Business Unit A"
    Then the counts should update to show only "Business Unit A" data
    When I apply a filter for "Campaign XYZ"
    Then the counts should update to show only "Campaign XYZ" data

  @data-accuracy
  Scenario: Verify RCS counts match database records
    When I query the database for RCS counts for the past 7 days
    Then the displayed RCS counts should match the database values 