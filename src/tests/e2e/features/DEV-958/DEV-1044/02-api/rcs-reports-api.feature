@DEV-958 @DEV-1044 @api @staging @rcs-reports
Feature: RCS Reports API Testing
  As an API consumer
  I want to verify RCS reporting APIs
  So that I can ensure data accuracy and error handling

  Background:
    Given the API endpoints are accessible
    And test data is prepared

  @smoke @daily-report
  Scenario: Get daily RCS metrics via API
    When I call "/get-mabOperationalReportData" with parameters:
      | startDate  | endDate    | customer | commType |
      | 2025-05-23 | 2025-05-23 | USCC     | rcs      |
    Then the response status should be 200
    And the response should contain:
      | field           | value |
      | rcsSmsSentCount | 10    |
      | total_records   | 10    |
    And the delivery breakdown should be accurate

  @smoke @weekly-report
  Scenario: Get weekly RCS metrics via API
    When I call "/get-mabReportsData" with parameters:
      | startDate  | endDate    | customer | commType |
      | 2025-05-17 | 2025-05-23 | USCC     | rcs      |
    Then the response status should be 200
    And the weekly trend data should be present
    And each day should have valid RCS metrics

  @negative
  Scenario Outline: Handle invalid API parameters
    When I call "/get-mabOperationalReportData" with parameters:
      | startDate   | endDate   | customer   | commType   |
      | <startDate> | <endDate> | <customer> | <commType> |
    Then the response status should be <status>
    And the error message should be "<message>"

    Examples:
      | startDate   | endDate    | customer | commType | status | message                    |
      | invalid     | 2025-05-23 | USCC     | rcs      | 400    | Invalid date format        |
      | 2025-05-23 | 2025-05-22 | USCC     | rcs      | 400    | Invalid date range         |
      | 2025-05-23 | 2025-05-23 | INVALID  | rcs      | 404    | Customer not found         |
      | 2025-05-23 | 2025-05-23 | USCC     | invalid  | 400    | Invalid communication type |

  @edge-case
  Scenario: Handle large date range request
    When I call "/get-mabReportsData" with parameters:
      | startDate  | endDate    | customer | commType |
      | 2024-01-01 | 2025-12-31 | USCC     | rcs      |
    Then the response status should be 200
    And the response time should be under 5 seconds
    And the data should be properly paginated

  @data-validation
  Scenario: Verify data consistency between daily and weekly reports
    When I get daily report data for the week
    And I get weekly report data for the same period
    Then the aggregated daily totals should match weekly totals
    And the RCS metrics should be consistent 