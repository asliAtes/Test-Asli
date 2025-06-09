const config = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['src/tests/e2e/steps/**/*.steps.ts'],
    format: ['progress-bar', 'json:reports/cucumber_report.json'],
    publishQuiet: true,
  },
  
  // DEV-1059 Multi-Layer Retry Logic Tests
  'dev-1059-network-mock': {
    requireModule: ['ts-node/register'],
    require: [
      'src/tests/e2e/steps/DEV-1059/retry-logic-network-mock.steps.ts',
      'src/tests/e2e/steps/DEV-1059/debug-steps.ts'
    ],
    format: [
      'progress-bar',
      'json:reports/dev-1059-network-mock.json',
      'html:reports/dev-1059-network-mock.html'
    ],
    paths: ['src/tests/e2e/features/DEV-1059/retry-logic-network-mock.feature'],
    tags: '@network-mock and @dev-1059',
    parallel: 1,
    publishQuiet: true,
  },

  'dev-1059-real-environment': {
    requireModule: ['ts-node/register'],
    require: [
      'src/tests/e2e/steps/DEV-1059/retry-logic-real-environment.steps.ts',
      'src/tests/e2e/steps/DEV-1059/debug-steps.ts'
    ],
    format: [
      'progress-bar',
      'json:reports/dev-1059-real-environment.json',
      'html:reports/dev-1059-real-environment.html'
    ],
    paths: ['src/tests/e2e/features/DEV-1059/retry-logic-real-environment.feature'],
    tags: '@real-environment and @dev-1059',
    parallel: 1,
    publishQuiet: true,
  },

  'dev-1059-all': {
    requireModule: ['ts-node/register'],
    require: [
      'src/tests/e2e/steps/DEV-1059/**/*.steps.ts'
    ],
    format: [
      'progress-bar',
      'json:reports/dev-1059-all.json',
      'html:reports/dev-1059-all.html'
    ],
    paths: ['src/tests/e2e/features/DEV-1059/'],
    tags: '@dev-1059',
    parallel: 1,
    publishQuiet: true,
  },

  // Debug profile for development
  'dev-1059-debug': {
    requireModule: ['ts-node/register'],
    require: [
      'src/tests/e2e/steps/DEV-1059/debug-steps.ts'
    ],
    format: [
      'progress-bar',
      'json:reports/dev-1059-debug.json'
    ],
    paths: ['src/tests/e2e/features/DEV-1059/debug.feature'],
    tags: '@debug and @dev-1059',
    parallel: 1,
    publishQuiet: true,
  }
};

module.exports = config; 