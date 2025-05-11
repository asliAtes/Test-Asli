# Xray BDD Import CSV Files

This directory contains CSV files ready for import into Xray as BDD test cases. Each file corresponds to a feature file in the test automation framework.

## Files Included

1. **DEV_926_Comm_module.csv** - Communication Module as a Separate Service (21 test cases)
2. **DEV_926_Email_module.csv** - Email Module as a Separate Service (3 test cases)
3. **DEV_927_Infobip_SMS_channel.csv** - Infobip SMS Channel Implementation (11 test cases)
4. **DEV_928_Infobip_SMS_Test_Mode.csv** - Infobip SMS Test Mode (17 test cases)
5. **DEV_929_Global_SMS_Channel_Flag.csv** - Global SMS Channel Flag (8 test cases)
6. **DEV_931_RCS_Failover_message.csv** - RCS Failover Message Functionality (19 test cases)
7. **DEV_932_Customer_level_RCS_flag.csv** - Customer Level RCS Flag (10 test cases)

## Recent Updates

### BNE Test Phone Numbers
All BNE-related test cases have been updated to use new dedicated testing phone numbers:
- Primary BNE test phone: `+12144352325`
- Secondary BNE test phone: `+16504688652`

This affects test cases in the following files:
- DEV_926_Comm_module.csv (TC03)
- DEV_929_Global_SMS_Channel_Flag.csv (TC03, TC04)
- DEV_932_Customer_level_RCS_flag.csv (TC05, TC06, TC08, TC09)

## How to Import into Xray

1. In Jira, navigate to Tests > Test Management
2. Select Import > Import Cucumber Tests
3. Choose the CSV import option
4. Upload the CSV file for the feature you want to import
5. Map the columns according to Xray requirements:
   - issuetype: Maps to issue type (Test)
   - summary: Maps to test case summary
   - description: Maps to test case description
   - labels: Maps to labels (comma-separated)
   - components: Maps to Jira components
   - issuelinks: Maps to linked issues
   - issuelinks.type: Maps to link type
   - issuelinks.summary: Maps to linked issue summary
   - issuelinks.issue: Maps to linked issue key
   - customfield_12800: Maps to Cucumber Scenario (the BDD feature/scenario)
   - customfield_11805, customfield_11806, customfield_11807: Optional custom fields

6. Click Import and verify the results

## CSV Column Details

- **issuetype**: Always "Test"
- **summary**: Test case title (e.g., "TC01 - Send SMS using Twilio")
- **description**: Brief description of the test case
- **labels**: Tags for the test case (e.g., "automated rcs")
- **components**: Component assignment (e.g., "comm-module")
- **issuelinks**: Jira issue key that this test relates to (e.g., "DEV-926")
- **issuelinks.type**: Type of link (e.g., "Tests")
- **issuelinks.summary**: Summary of the linked issue
- **customfield_12800**: The full BDD scenario content

## Notes for Automation Team

These CSV files maintain the exact BDD format from the feature files, preserving:

1. Feature titles
2. Scenario titles
3. Given/When/Then steps exactly as written
4. Tags are converted to labels

The imported test cases will be linked to their respective Jira tickets and organized correctly in the test hierarchy in Xray. 