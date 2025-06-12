// cucumber.js - Cucumber profiles configuration

const common = {
  requireModule: ['ts-node/register'],
  require: ['src/tests/e2e/**/*.ts'],
  format: ['progress-bar', 'html:reports/cucumber-report.html'],
  formatOptions: { snippetInterface: 'async-aware' },
  publishQuiet: true
};

module.exports = {
  // Default profile - used when no profile is specified
  default: {
    ...common,
    worldParameters: {
      environment: process.env.TEST_ENV || 'dev'
    }
  },

  // Single test profile
  single: {
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/single-test-report.html',
      'json:reports/single-test-report.json'
    ],
    publishQuiet: true
  },

  // Test set profile
  set: {
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/test-set-report.html',
      'json:reports/test-set-report.json'
    ],
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
    ...common,
    tags: '@rcs',
    worldParameters: {
      environment: process.env.TEST_ENV || 'dev'
    }
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
  },
  
  // DEV-1059 Debug - Simple Test
  'dev-1059-debug': {
    paths: ['src/tests/e2e/features/DEV-1059/simple-debug-test.feature'],
    require: [
      'src/tests/e2e/steps/DEV-1059/debug-steps.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/dev-1059-debug-report.html'
    ],
    publishQuiet: true,
    tags: '@debug',
    timeout: parseInt(process.env.CUCUMBER_TIMEOUT || '30000')
  },

  // DEV-1059 Multi-Layer Retry Logic profile - Network Mock Tests
  'dev-1059-mock': {
    paths: ['src/tests/e2e/features/DEV-1059/retry-logic-network-mock.feature'],
    require: [
      'src/tests/e2e/steps/DEV-1059/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/dev-1059-mock-report.html',
      'json:reports/dev-1059-mock-report.json'
    ],
    publishQuiet: true,
    tags: '@network-mock',
    timeout: parseInt(process.env.CUCUMBER_TIMEOUT || '30000')
  },

  // DEV-1059 Multi-Layer Retry Logic profile - Real Environment Tests
  'dev-1059-real': {
    paths: ['src/tests/e2e/features/DEV-1059/retry-logic-real-environment.feature'],
    require: [
      'src/tests/e2e/steps/DEV-1059/**/*.ts',
      'src/tests/utils/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/dev-1059-real-report.html',
      'json:reports/dev-1059-real-report.json'
    ],
    publishQuiet: true,
    tags: '@real-environment',
    timeout: parseInt(process.env.CUCUMBER_TIMEOUT || '60000')
  },

  // DEV-1059 Multi-Layer Retry Logic profile - All Tests
  'dev-1059': {
    paths: ['src/tests/e2e/features/DEV-1059/**/*.feature'],
    require: [
      'src/tests/e2e/steps/DEV-1059/**/*.ts',
      'src/tests/utils/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/dev-1059-report.html',
      'json:reports/dev-1059-report.json'
    ],
    publishQuiet: true,
    tags: '@DEV-1059',
    timeout: parseInt(process.env.CUCUMBER_TIMEOUT || '60000')
  },

  // DEV-1059 Multi-Layer Retry Logic profile - Bug Validation Tests (REAL ENVIRONMENT - DANGEROUS!)
  'dev-1059-bug-validation': {
    paths: ['src/tests/e2e/features/DEV-1059/retry-logic-bug-validation.feature'],
    require: [
      'src/tests/e2e/steps/DEV-1059/**/*.ts',
      'src/tests/utils/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/dev-1059-bug-validation-report.html',
      'json:reports/dev-1059-bug-validation-report.json'
    ],
    publishQuiet: true,
    tags: '@bug-validation and @critical',
    timeout: parseInt(process.env.CUCUMBER_TIMEOUT || '600000'), // 10 minutes for extensive testing
    parallel: 1, // Run sequentially to avoid resource conflicts
    retry: 0 // No retries for bug validation - we want to see actual failures
  },

  // DEV-1059 Email-Only Tests - Cost-Effective Testing Without SMS
  'dev-1059-email-only': {
    paths: ['src/tests/e2e/features/DEV-1059/retry-logic-real-environment.feature'],
    require: [
      'src/tests/e2e/steps/DEV-1059/retry-logic-real-environment.steps.ts',
      'src/tests/utils/helpers/real-environment-helpers.ts',
      'src/tests/utils/helpers/alert-system-helpers.ts',
      'src/tests/utils/helpers/test-data-helpers.ts',
      'src/tests/utils/helpers/retry-config-helpers.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/dev-1059-email-only-report.html',
      'json:reports/dev-1059-email-only-report.json'
    ],
    publishQuiet: true,
    tags: '@alert and not @end-to-end and not @performance and not @regression', // Only alert scenarios
    timeout: parseInt(process.env.CUCUMBER_TIMEOUT || '120000'), // 2 minutes for email tests
    parallel: 1, // Sequential execution
    retry: 1 // Allow one retry for email delivery delays
  },

  // DEV-1059 SMS Budget-Safe Tests - Critical SMS Tests Within 5-10 Message Budget
  'dev-1059-budget-sms': {
    paths: ['src/tests/e2e/features/DEV-1059/retry-logic-budget-safe.feature'],
    require: [
      'src/tests/e2e/steps/DEV-1059/retry-logic-real-environment.steps.ts',
      'src/tests/utils/helpers/real-environment-helpers.ts',
      'src/tests/utils/helpers/alert-system-helpers.ts',
      'src/tests/utils/helpers/test-data-helpers.ts',
      'src/tests/utils/helpers/retry-config-helpers.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/dev-1059-budget-sms-report.html',
      'json:reports/dev-1059-budget-sms-report.json'
    ],
    publishQuiet: true,
    tags: '@sms and @critical and not @end-to-end', // Only critical SMS tests
    timeout: parseInt(process.env.CUCUMBER_TIMEOUT || '120000'), // 2 minutes for SMS tests
    parallel: 1, // Sequential execution
    retry: 1 // Allow one retry for SMS delivery delays
  },

  // Outreach Log Tests
  'outreach-log': {
    paths: ['src/tests/e2e/features/DEV-958/**/*.feature'],
    require: [
      'src/tests/e2e/steps/DEV-958/**/*.ts',
      'src/tests/utils/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/outreach-log-report.html',
      'json:reports/outreach-log-report.json'
    ],
    publishQuiet: true,
    tags: '@outreach-log',
    timeout: parseInt(process.env.CUCUMBER_TIMEOUT || '60000')
  },
  
  // DEV-958 RCS Integration profile (JavaScript)
  'dev-958': {
    paths: ['tests/features/active/**/*.feature'],
    require: [
      'tests/step_definitions/**/*.js',
      'tests/hooks.js',
      'tests/utils/**/*.js'
    ],
    format: ['progress-bar', 'html:reports/dev-958-report.html'],
    publishQuiet: true
  },
  
  // DEV-958 RCS Integration TypeScript profile
  'dev-958-ts': {
    paths: ['tests/features/active/DEV-1003/**/*.feature'], // Start with just one feature for testing
    require: [
      'tests/step_definitions/**/*.ts',
      'tests/hooks.ts',
      'tests/utils/**/*.ts',
      'tests/page-objects/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'html:reports/dev-958-ts-report.html'],
    publishQuiet: true,
    // Use the CUCUMBER_TIMEOUT env var for step timeout, or default to 10000ms
    timeout: parseInt(process.env.CUCUMBER_TIMEOUT || '10000')
  },

  // RCS UI test profile
  'rcs-ui': {
    paths: ['tests/e2e/features/rcs/**/*.feature'],
    require: [
      'tests/e2e/step_definitions/rcs/**/*.ts',
      'tests/common/utils/**/*.ts',
      'tests/common/helpers/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/rcs-ui-report.html',
      'json:reports/rcs-ui-report.json'
    ],
    publishQuiet: true
  },

  // Temporary profile for migration
  'rcs-migration': {
    paths: [
      'tests/e2e/features/rcs/**/*.feature',
      'tests/e2e/features/DEV-1003/**/*.feature'
    ],
    require: [
      'tests/e2e/step_definitions/rcs/**/*.ts',
      'tests/e2e/step_definitions/DEV-1003/**/*.ts',
      'tests/common/utils/**/*.ts',
      'tests/common/helpers/**/*.ts',
      'tests/utils/**/*.ts',
      'tests/support/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/rcs-migration-report.html',
      'json:reports/rcs-migration-report.json'
    ],
    publishQuiet: true
  },

  smoke: {
    ...common,
    tags: '@smoke',
    worldParameters: {
      environment: process.env.TEST_ENV || 'dev'
    }
  },

  // RCS UI-only tests profile
  'rcs-ui-only': {
    paths: [
      'src/tests/e2e/features/rcs/metrics/metrics-display.feature',
      'src/tests/e2e/features/rcs/metrics/chart-controls.feature'
    ],
    require: [
      'src/tests/e2e/steps/rcs/metrics/metrics_display.steps.ts',
      'src/tests/e2e/steps/rcs/metrics/chart_controls.steps.ts',
      'src/tests/e2e/steps/rcs/metrics/rcs_graphs_steps.ts',
      'src/tests/utils/**/*.ts',
      'src/tests/common/**/*.ts',
      '!src/tests/**/*.spec.ts',
      '!src/tests/**/*.test.ts'
    ],
    requireModule: [
      'ts-node/register',
      'tsconfig-paths/register'
    ],
    format: [
      'progress-bar',
      'html:reports/rcs-ui-only-report.html',
      'json:reports/rcs-ui-only-report.json'
    ],
    tags: '@ui and not @TC4',
    publishQuiet: true,
    worldParameters: {
      environment: process.env.TEST_ENV || 'dev'
    }
  },

  'outreach-s3': [
    'src/tests/e2e/features/DEV-XXX_outreach_log/outreach-s3-validation.feature',
    '--require src/tests/e2e/steps/DEV-XXX_outreach_log/outreach-log-validation.steps.ts',
    '--require-module ts-node/register',
    '--format progress-bar'
  ].join(' '),

  // DEV-1044 RCS Metrics profile
  'dev-1044': {
    paths: ['src/tests/e2e/features/DEV-958/DEV-1044/**/*.feature'],
    require: [
      'src/tests/e2e/steps/rcs/**/*.ts',
      'src/tests/e2e/steps/DEV-958/**/*.ts',
      'src/tests/utils/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/dev-1044-report.html',
      'json:reports/dev-1044-report.json'
    ],
    publishQuiet: true,
    tags: '@DEV-1044',
    timeout: parseInt(process.env.CUCUMBER_TIMEOUT || '60000')
  },

  'rcs-ui-staging': [
    '--require "src/tests/e2e/setup.ts"',
    '--require "src/tests/e2e/steps/**/*.ts"',
    'src/tests/e2e/features/DEV-958/DEV-1044/rcs-ui-validation.feature',
    '--tags "@rcs-ui"',
    '--format progress',
    '--format json:reports/rcs-ui-test-results.json',
    '--format html:reports/rcs-ui-test-results.html'
  ].join(' '),

  'rcs-simple': [
    '--require "src/tests/e2e/setup.ts"',
    '--require "src/tests/e2e/steps/**/*.ts"',
    'src/tests/e2e/features/DEV-958/DEV-1044/rcs-simple-test.feature',
    '--tags "@rcs-simple"',
    '--format progress'
  ].join(' '),
};