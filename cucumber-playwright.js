module.exports = {
  default: {
    paths: ['tests/playwright/features/**/*.feature'],
    require: [
      'tests/playwright/step_definitions/**/*.ts',
      'tests/playwright/support/hooks.ts',
      'tests/playwright/support/world.ts'
    ],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'html:cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
    worldParameters: {
      headless: true,
      slowMo: 0,
      timeout: 30000
    }
  }
}; 