import { CucumberJSAllureFormatter } from 'allure-cucumberjs';
import { AllureRuntime } from 'allure-js-commons';
import { IFormatterOptions } from '@cucumber/cucumber';

export default class CustomAllureFormatter extends CucumberJSAllureFormatter {
  constructor(options: IFormatterOptions) {
    super(
      options,
      new AllureRuntime({ resultsDir: 'reports/allure-results' }),
      {}
    );
  }
}