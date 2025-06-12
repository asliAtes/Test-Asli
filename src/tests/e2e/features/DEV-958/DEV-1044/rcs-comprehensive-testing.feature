@DEV-1044
Feature: DEV-1044 RCS SMS Count Tracking - Comprehensive Testing
  
  As a QA engineer
  I want to comprehensively test the RCS SMS count tracking implementation
  So that I can verify all aspects of DEV-1044 are working correctly

  Background:
    Given I am testing the DEV-1044 RCS SMS count tracking feature

  @DEV-1044 @TC1 @rcs-comprehensive @ui
  Scenario: TC1 - Complete RCS UI Workflow Testing
    Given I authenticate with the staging application using credentials "usccdevuser" and "Kredos@1234"
    When I navigate directly to the SMS Email dashboard
    And I access the RCS tab using multiple selector approaches
    Then I should see RCS delivery metrics on the page
    And I should see chart elements for RCS data visualization
    And I should see filter elements for data manipulation
    When I test the RCS API endpoint with date range "2025-05-08" to "2025-05-08"
    Then the API should return successful RCS data
    And I should see the complete RCS tracking implementation working

  @DEV-1044 @TC2 @rcs-database-ssh @database
  Scenario: TC2 - Complete Database Validation via SSH Tunnel
    Given I have SSH tunnel configuration for RDS access
    When I establish SSH tunnel to database
    And I connect to the database through SSH tunnel
    Then I should be able to validate RCS schema in the database
    And I should be able to discover the complete table structure
    And I should find RCS data records in the database
    When I search for test data from date "2025-05-08"
    Then I should be able to analyze data integrity and distribution
    And the database validation should be complete and successful

  @DEV-1044 @TC3 @rcs-ui @focused
  Scenario: TC3 - RCS UI Elements Validation
    Given I am logged into the staging application with credentials
    And I navigate to the SMS/Email Reports page
    When I click on the RCS tab
    Then I should see the RCS Delivery Metrics section
    And the Total count should be greater than 0
    And the Delivered count should be greater than 0
    And the Seen count should be greater than 0
    And I should see the delivery metrics chart
    And the chart should show delivery status data
    And the chart legend should be visible 