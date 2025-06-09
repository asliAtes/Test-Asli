import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { test } from './test-context';
import * as dotenv from 'dotenv';

// Load environment variables
BeforeAll(async function () {
    dotenv.config();
});

// Before each scenario
Before(async function () {
    await test.init();
});

// After each scenario
After(async function () {
    await test.close();
});

// After all scenarios
AfterAll(async function () {
    // Any cleanup needed after all tests
}); 