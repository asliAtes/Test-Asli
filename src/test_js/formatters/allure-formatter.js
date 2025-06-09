"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allure_cucumberjs_1 = require("allure-cucumberjs");
const allure_js_commons_1 = require("allure-js-commons");
class CustomAllureFormatter extends allure_cucumberjs_1.CucumberJSAllureFormatter {
    constructor(options) {
        super(options, new allure_js_commons_1.AllureRuntime({ resultsDir: 'reports/allure-results' }), {});
    }
}
exports.default = CustomAllureFormatter;
