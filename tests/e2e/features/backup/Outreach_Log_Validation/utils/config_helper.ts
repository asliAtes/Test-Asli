import * as fs from 'fs';
import * as path from 'path';

export class ConfigHelper {
  private static instance: ConfigHelper;
  private testConfig: any;
  private holidays: any;
  
  private constructor() {
    this.loadConfigurations();
  }

  public static getInstance(): ConfigHelper {
    if (!ConfigHelper.instance) {
      ConfigHelper.instance = new ConfigHelper();
    }
    return ConfigHelper.instance;
  }

  private loadConfigurations() {
    const configPath = path.join(__dirname, '../config');
    this.testConfig = JSON.parse(fs.readFileSync(path.join(configPath, 'test_config.json'), 'utf8'));
    this.holidays = JSON.parse(fs.readFileSync(path.join(configPath, 'holidays.json'), 'utf8'));
  }

  public isHoliday(date: Date): boolean {
    const year = date.getFullYear().toString();
    const dateStr = date.toISOString().split('T')[0];
    
    // Check US federal holidays
    if (this.holidays.us_federal_holidays[year]) {
      const yearHolidays = Object.values(this.holidays.us_federal_holidays[year]);
      if (yearHolidays.includes(dateStr)) return true;
    }
    
    // Check additional holidays
    return this.holidays.additional_holidays.includes(dateStr);
  }

  public isSunday(date: Date): boolean {
    return date.getDay() === 0;
  }

  public shouldBeEmptyFile(date: Date): boolean {
    return this.isSunday(date) || this.isHoliday(date);
  }

  public getEnvironmentConfig(env: 'staging' | 'production') {
    return this.testConfig.environments[env];
  }

  public getFileGenerationConfig() {
    return this.testConfig.file_generation;
  }

  public getRequiredHeaders() {
    return this.testConfig.headers;
  }

  public getValidationRules() {
    return this.testConfig.validation;
  }

  public updateHolidays(year: string, holidays: Record<string, string>) {
    this.holidays.us_federal_holidays[year] = holidays;
    this.saveHolidays();
  }

  public addAdditionalHoliday(date: string) {
    if (!this.holidays.additional_holidays.includes(date)) {
      this.holidays.additional_holidays.push(date);
      this.saveHolidays();
    }
  }

  private saveHolidays() {
    const configPath = path.join(__dirname, '../config');
    fs.writeFileSync(
      path.join(configPath, 'holidays.json'),
      JSON.stringify(this.holidays, null, 2)
    );
  }
} 