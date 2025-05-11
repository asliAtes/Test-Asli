// cucumber.js - Cucumber profiles configuration

module.exports = {
  // Default profile - used when no profile is specified
  default: {
    paths: ['tests/features/**/*.feature'],
    require: ['tests/steps/**/*.ts', 'tests/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'html:reports/cucumber-report.html', 
      'json:reports/cucumber_report.json'],
    publishQuiet: true

  },
  
  // Email module profile
  email: {
    paths: ['tests/features/Email_Module/**/*.feature'],
    require: ['tests/steps/Email_Module/**/*.ts', 'tests/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'html:reports/email-report.html'],
    publishQuiet: true
  },
  
  // RCS module profile
  rcs: {
    paths: ['tests/features/Comm_Module/DEV_931_*.feature'],
    require: ['tests/steps/Comm_Module/**/*.ts', 'tests/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'html:reports/rcs-report.html'],
    publishQuiet: true
  },
  
  // SMS module profile
  sms: {
    paths: ['tests/features/Comm_Module/DEV_926_*.feature'],
    require: ['tests/steps/Comm_Module/**/*.ts', 'tests/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'html:reports/sms-report.html'],
    publishQuiet: true
  },

  // DEV-1017 Data Archival profile
  'dev-1017': {
    paths: ['tests/features/active/DEV_1017/**/*.feature'],
    require: ['tests/steps/DEV_1017_run_table_archival.mock.steps.ts', 'tests/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'html:reports/dev-1017-report.html'],
    publishQuiet: true
  }
};