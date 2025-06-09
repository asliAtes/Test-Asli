"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigHelper = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ConfigHelper {
    constructor() {
        this.loadConfigurations();
    }
    static getInstance() {
        if (!ConfigHelper.instance) {
            ConfigHelper.instance = new ConfigHelper();
        }
        return ConfigHelper.instance;
    }
    loadConfigurations() {
        const configPath = path.join(__dirname, '../config');
        this.testConfig = JSON.parse(fs.readFileSync(path.join(configPath, 'test_config.json'), 'utf8'));
        this.holidays = JSON.parse(fs.readFileSync(path.join(configPath, 'holidays.json'), 'utf8'));
    }
    isHoliday(date) {
        const year = date.getFullYear().toString();
        const dateStr = date.toISOString().split('T')[0];
        // Check US federal holidays
        if (this.holidays.us_federal_holidays[year]) {
            const yearHolidays = Object.values(this.holidays.us_federal_holidays[year]);
            if (yearHolidays.includes(dateStr))
                return true;
        }
        // Check additional holidays
        return this.holidays.additional_holidays.includes(dateStr);
    }
    isSunday(date) {
        return date.getDay() === 0;
    }
    shouldBeEmptyFile(date) {
        return this.isSunday(date) || this.isHoliday(date);
    }
    getEnvironmentConfig(env) {
        return this.testConfig.environments[env];
    }
    getFileGenerationConfig() {
        return this.testConfig.file_generation;
    }
    getRequiredHeaders() {
        return this.testConfig.headers;
    }
    getValidationRules() {
        return this.testConfig.validation;
    }
    updateHolidays(year, holidays) {
        this.holidays.us_federal_holidays[year] = holidays;
        this.saveHolidays();
    }
    addAdditionalHoliday(date) {
        if (!this.holidays.additional_holidays.includes(date)) {
            this.holidays.additional_holidays.push(date);
            this.saveHolidays();
        }
    }
    saveHolidays() {
        const configPath = path.join(__dirname, '../config');
        fs.writeFileSync(path.join(configPath, 'holidays.json'), JSON.stringify(this.holidays, null, 2));
    }
}
exports.ConfigHelper = ConfigHelper;
