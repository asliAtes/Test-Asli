import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from 'chai';
import { DatabaseService } from '@services/database.service';
import { configManager } from '@integration/index';
import { DatabaseConfig } from '@common/types/database.types';

let dbService: DatabaseService;

Before(async function () {
    const config = configManager.getEnvironmentConfig();
    
    // Convert Config to DatabaseConfig
    const dbConfig: DatabaseConfig = {
        host: config.database.host,
        port: config.database.port,
        user: config.database.username,
        password: config.database.password,
        database: config.database.name
    };
    
    dbService = DatabaseService.getInstance(dbConfig);
});

Given('I have test data in the database', async function () {
    // Implementation will be added
});

When('I clean up the test data', async function () {
    // Implementation will be added
});

Then('the test data should be removed', async function () {
    // Implementation will be added
}); 