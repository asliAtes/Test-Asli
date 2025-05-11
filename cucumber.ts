const CustomAllureFormatter = require('./tests/formatters/allure-formatter.ts').default;

module.exports = {
  require: ['tests/steps/**/*.ts'],
  requireModule: ['ts-node/register'],
  format: [
    {
      type: CustomAllureFormatter,
      output: 'reports/allure-results'
    },
    'json:reports/cucumber-report.json'
  ],
  paths: ['tests/features/**/*.feature']
};