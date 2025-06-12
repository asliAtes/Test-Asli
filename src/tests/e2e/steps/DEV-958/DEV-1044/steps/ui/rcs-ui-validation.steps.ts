import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { chromium, Page, Browser } from '@playwright/test';

let page: Page;
let browser: Browser;

Before({ tags: '@rcs-ui' }, async function () {
    console.log('🚀 Starting browser for RCS UI test...');
    browser = await chromium.launch({ 
        headless: false, // Show browser to see what's happening
        slowMo: 1000 // Slow down for visibility
    });
    page = await browser.newPage();
    console.log('✅ Browser started successfully');
});

After({ tags: '@rcs-ui' }, async function () {
    console.log('🔄 Cleaning up browser...');
    if (page) {
        await page.close();
    }
    if (browser) {
        await browser.close();
    }
    console.log('✅ Browser cleaned up successfully');
});

// Background Steps
Given('I am logged into the staging application with credentials', async function () {
    console.log('🔑 Attempting to login with credentials...');
    
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    
    if (!username || !password) {
        throw new Error('ADMIN_USERNAME or ADMIN_PASSWORD not found in environment variables');
    }
    
    try {
        // Go to staging homepage
        await page.goto('https://uscc-stg.kredosai.com/kredos/home', { 
            waitUntil: 'load',
            timeout: 30000 
        });
        
        console.log('📄 Page loaded, looking for login form...');
        
        // Check if already logged in
        const welcomeText = await page.locator('text=Welcome to the UScellular Workspace').isVisible();
        if (welcomeText) {
            console.log('✅ Already logged in to staging');
            return;
        }
        
        // Look for login form elements
        console.log('🔍 Looking for login form...');
        
        // Try common login field selectors
        const usernameSelectors = [
            'input[name="username"]',
            'input[name="email"]', 
            'input[type="email"]',
            'input[id="username"]',
            'input[id="email"]',
            '#username',
            '#email'
        ];
        
        const passwordSelectors = [
            'input[name="password"]',
            'input[type="password"]',
            'input[id="password"]',
            '#password'
        ];
        
        let usernameField = null;
        let passwordField = null;
        
        // Find username field
        for (const selector of usernameSelectors) {
            try {
                usernameField = await page.locator(selector).first();
                if (await usernameField.isVisible({ timeout: 2000 })) {
                    console.log(`✅ Found username field: ${selector}`);
                    break;
                }
            } catch (e) {
                // Continue to next selector
            }
        }
        
        // Find password field
        for (const selector of passwordSelectors) {
            try {
                passwordField = await page.locator(selector).first();
                if (await passwordField.isVisible({ timeout: 2000 })) {
                    console.log(`✅ Found password field: ${selector}`);
                    break;
                }
            } catch (e) {
                // Continue to next selector
            }
        }
        
        if (usernameField && passwordField) {
            console.log('📝 Filling login form...');
            await usernameField.fill(username);
            await passwordField.fill(password);
            
            // Look for submit button
            const submitSelectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:has-text("Login")',
                'button:has-text("Sign In")',
                '.login-button',
                '#login-button'
            ];
            
            for (const selector of submitSelectors) {
                try {
                    const submitButton = await page.locator(selector).first();
                    if (await submitButton.isVisible({ timeout: 2000 })) {
                        console.log(`🔘 Clicking submit button: ${selector}`);
                        await submitButton.click();
                        break;
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }
            
            // Wait for login to complete
            await page.waitForSelector('text=Welcome to the UScellular Workspace', { timeout: 15000 });
            console.log('✅ Successfully logged into staging application');
            
        } else {
            console.log('⚠️ No login form found, assuming already authenticated');
            await page.waitForLoadState('networkidle');
        }
        
    } catch (error: any) {
        console.error('❌ Login failed:', error.message);
        await page.screenshot({ path: 'debug-login-failed.png' });
        throw new Error(`Failed to login: ${error.message}`);
    }
});

Given(/^I navigate to the SMS\/Email Reports page$/, async function () {
    try {
        console.log('🧭 Navigating to SMS/Email Reports...');
        
        // Click on SMS/Email Reports
        await page.click('text=SMS/Email Reports');
        
        // Wait for the reports page to load
        await page.waitForSelector('text=Delivery Performance Metrics', { timeout: 10000 });
        console.log('✅ Successfully navigated to SMS/Email Reports page');
        
    } catch (error: any) {
        console.error('❌ Navigation failed:', error.message);
        await page.screenshot({ path: 'debug-navigation-failed.png' });
        throw new Error(`Failed to navigate: ${error.message}`);
    }
});

// Action Steps
When('I click on the RCS tab', async function () {
    try {
        console.log('🖱️ Clicking on RCS tab...');
        await page.click('button:has-text("RCS")');
        await page.waitForSelector('text=RCS Delivery Metrics', { timeout: 5000 });
        console.log('✅ Successfully clicked on RCS tab');
    } catch (error: any) {
        console.error('❌ Failed to click RCS tab:', error.message);
        await page.screenshot({ path: 'debug-rcs-tab-failed.png' });
        throw error;
    }
});

When('I set the timeframe to {string}', async function (timeframe: string) {
    try {
        console.log(`⏰ Setting timeframe to: ${timeframe}`);
        
        // Click dropdown
        await page.click('select, .dropdown, [role="combobox"]');
        
        // Select timeframe
        await page.selectOption('select', timeframe);
        
        // Wait for data to reload
        await page.waitForTimeout(3000);
        console.log(`✅ Set timeframe to: ${timeframe}`);
    } catch (error: any) {
        console.error('❌ Failed to set timeframe:', error.message);
        await page.screenshot({ path: 'debug-timeframe-failed.png' });
        throw error;
    }
});

// Validation Steps
Then('I should see the RCS Delivery Metrics section', async function () {
    const metricsSection = await page.locator('text=RCS Delivery Metrics').isVisible();
    expect(metricsSection).toBeTruthy();
    console.log('✅ RCS Delivery Metrics section is visible');
});

Then('the Total count should be greater than 0', async function () {
    try {
        // Look for the number next to "Total"
        const totalCount = await page.locator('text=Total').locator('..').locator('[class*="text-"]:not(:has-text("Total"))').first().textContent();
        const count = parseInt(totalCount?.trim() || '0');
        
        expect(count).toBeGreaterThan(0);
        console.log(`✅ Total count is ${count} (greater than 0)`);
    } catch (error) {
        await page.screenshot({ path: 'debug-total-count-failed.png' });
        throw error;
    }
});

Then('the Delivered count should be greater than 0', async function () {
    try {
        const deliveredCount = await page.locator('text=Delivered').locator('..').locator('[class*="text-"]:not(:has-text("Delivered"))').first().textContent();
        const count = parseInt(deliveredCount?.trim() || '0');
        
        expect(count).toBeGreaterThan(0);
        console.log(`✅ Delivered count is ${count} (greater than 0)`);
    } catch (error) {
        await page.screenshot({ path: 'debug-delivered-count-failed.png' });
        throw error;
    }
});

Then('the Seen count should be greater than 0', async function () {
    try {
        const seenCount = await page.locator('text=Seen').locator('..').locator('[class*="text-"]:not(:has-text("Seen"))').first().textContent();
        const count = parseInt(seenCount?.trim() || '0');
        
        expect(count).toBeGreaterThan(0);
        console.log(`✅ Seen count is ${count} (greater than 0)`);
    } catch (error) {
        await page.screenshot({ path: 'debug-seen-count-failed.png' });
        throw error;
    }
});

Then('I should see the delivery metrics chart', async function () {
    const chartVisible = await page.locator('canvas, svg, [class*="chart"]').first().isVisible();
    expect(chartVisible).toBeTruthy();
    console.log('✅ Delivery metrics chart is visible');
});

Then('the chart should show delivery status data', async function () {
    // Check if chart has data by looking for colored elements
    const chartElements = await page.locator('rect, path, circle, bar').count();
    expect(chartElements).toBeGreaterThan(0);
    console.log(`✅ Chart shows ${chartElements} data elements`);
});

Then('the chart legend should be visible', async function () {
    const legendVisible = await page.locator('text=Delivered, text=Seen, text=Pending').first().isVisible();
    expect(legendVisible).toBeTruthy();
    console.log('✅ Chart legend is visible');
}); 