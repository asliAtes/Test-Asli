import { Given, When, Then, After } from '@cucumber/cucumber';
import { expect } from 'chai';
import { By, until, WebDriver } from 'selenium-webdriver';
import helpers from '../../utils/test_helpers';
import DatabaseConnection from '../../utils/database_connection';
import axios from 'axios';

interface MessageMetrics {
    total: number;
    delivered: number;
    failed: number;
    pending?: number;
    bounced?: number;
    carrier_error?: number;
    delivery_rate: number;
}

interface ChannelMetrics {
    sms: MessageMetrics;
    email: MessageMetrics;
    rcs: MessageMetrics;
}

interface RawDataRow {
    channel: string;
    status: string;
    date: string;
    count: number;
}

interface APIResponse {
    metrics: {
        [key: string]: MessageMetrics;
    };
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            API_BASE_URL: string;
            API_TOKEN: string;
            BASE_URL: string;
        }
    }
}

// Add properties to World
declare module '@cucumber/cucumber' {
    interface World {
        dbConnection: DatabaseConnection;
        driver: WebDriver;
        startDate: string;
        endDate: string;
        rawData: RawDataRow[];
        expectedMetrics: ChannelMetrics;
        apiResponse: APIResponse;
    }
}

// Database verification steps
Given('I have a database connection', async function() {
    this.dbConnection = new DatabaseConnection();
    await this.dbConnection.connect();
});

When('I query the database for raw message data between {string} and {string}', async function(startDate: string, endDate: string) {
    // Store the date range for later use
    this.startDate = startDate;
    this.endDate = endDate;
    
    // Query the database for raw message data
    const query = `
        SELECT 
            channel,
            status,
            DATE(created_at) as date,
            COUNT(*) as count
        FROM message_delivery
        WHERE created_at BETWEEN ? AND ?
        GROUP BY channel, status, DATE(created_at)
        ORDER BY date, channel, status
    `;
    
    this.rawData = await this.dbConnection.query(query, [startDate, endDate]);
});

When('I calculate the expected metrics based on the raw data', async function() {
    // Initialize metrics object
    this.expectedMetrics = {
        sms: {
            total: 0,
            delivered: 0,
            failed: 0,
            pending: 0,
            delivery_rate: 0
        },
        email: {
            total: 0,
            delivered: 0,
            failed: 0,
            bounced: 0,
            delivery_rate: 0
        },
        rcs: {
            total: 0,
            delivered: 0,
            failed: 0,
            pending: 0,
            carrier_error: 0,
            delivery_rate: 0
        }
    };
    
    // Process the raw data
    for (const row of this.rawData) {
        const channel = row.channel.toLowerCase();
        const status = row.status.toLowerCase();
        const count = row.count;
        
        // Skip if channel not in metrics
        if (!this.expectedMetrics[channel as keyof ChannelMetrics]) continue;
        
        // Add to total
        this.expectedMetrics[channel as keyof ChannelMetrics].total += count;
        
        // Add to specific status
        switch (status) {
            case 'delivered':
                this.expectedMetrics[channel as keyof ChannelMetrics].delivered += count;
                break;
            case 'failed':
                this.expectedMetrics[channel as keyof ChannelMetrics].failed += count;
                break;
            case 'pending':
                if ('pending' in this.expectedMetrics[channel as keyof ChannelMetrics]) {
                    (this.expectedMetrics[channel as keyof ChannelMetrics] as any).pending += count;
                }
                break;
            case 'bounced':
                if (channel === 'email') {
                    this.expectedMetrics.email.bounced! += count;
                }
                break;
            case 'carrier_error':
                if (channel === 'rcs') {
                    this.expectedMetrics.rcs.carrier_error! += count;
                }
                break;
        }
    }
    
    // Calculate delivery rates
    for (const channel of Object.keys(this.expectedMetrics) as Array<keyof ChannelMetrics>) {
        const metrics = this.expectedMetrics[channel];
        if (metrics.total > 0) {
            metrics.delivery_rate = (metrics.delivered / metrics.total) * 100;
            // Round to 2 decimal places
            metrics.delivery_rate = Math.round(metrics.delivery_rate * 100) / 100;
        }
    }
});

When('I query the performance reports API for the same date range', async function() {
    // Build API URL with date range
    const apiUrl = `${process.env.API_BASE_URL}/api/performance/summary?startDate=${this.startDate}&endDate=${this.endDate}`;
    
    try {
        // Make API request
        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Bearer ${process.env.API_TOKEN}`
            }
        });
        
        this.apiResponse = response.data;
    } catch (error) {
        console.error('Error calling performance API:', error);
        throw error;
    }
});

Then('the API response metrics should match my calculated metrics', async function() {
    // Compare the API response with our calculated metrics
    const apiMetrics = this.apiResponse.metrics;
    
    for (const channel of Object.keys(this.expectedMetrics) as Array<keyof ChannelMetrics>) {
        // Skip if channel not in API response
        if (!apiMetrics[channel]) continue;
        
        const expected = this.expectedMetrics[channel];
        const actual = apiMetrics[channel];
        
        // Compare total
        expect(actual.total).to.equal(expected.total, 
            `${channel.toUpperCase()} total count mismatch: expected ${expected.total}, got ${actual.total}`);
        
        // Compare delivered
        expect(actual.delivered).to.equal(expected.delivered, 
            `${channel.toUpperCase()} delivered count mismatch: expected ${expected.delivered}, got ${actual.delivered}`);
        
        // Compare failed
        expect(actual.failed).to.equal(expected.failed, 
            `${channel.toUpperCase()} failed count mismatch: expected ${expected.failed}, got ${actual.failed}`);
        
        // Compare delivery rate (allowing small rounding differences)
        expect(actual.delivery_rate).to.be.closeTo(expected.delivery_rate, 0.01, 
            `${channel.toUpperCase()} delivery rate mismatch: expected ${expected.delivery_rate}%, got ${actual.delivery_rate}%`);
        
        // Channel-specific metrics
        if (channel === 'rcs') {
            expect(actual.carrier_error).to.equal(expected.carrier_error, 
                `RCS carrier error count mismatch: expected ${expected.carrier_error}, got ${actual.carrier_error}`);
        }
        
        if (channel === 'email') {
            expect(actual.bounced).to.equal(expected.bounced, 
                `Email bounced count mismatch: expected ${expected.bounced}, got ${actual.bounced}`);
        }
    }
});

// UI verification steps
When('I go to the Performance Reports dashboard', async function() {
    await this.driver.get(`${process.env.BASE_URL}/performance-reports`);
    await helpers.waitForElement(this.driver, By.css('.performance-reports-container'));
});

When('I set the date range to {string} until {string}', async function(startDate: string, endDate: string) {
    // Find date range inputs
    const startDateInput = await this.driver.findElement(By.css('input[name="startDate"]'));
    const endDateInput = await this.driver.findElement(By.css('input[name="endDate"]'));
    
    // Clear and set values
    await startDateInput.clear();
    await startDateInput.sendKeys(startDate);
    
    await endDateInput.clear();
    await endDateInput.sendKeys(endDate);
    
    // Apply filter
    const applyButton = await this.driver.findElement(By.css('button.apply-filter'));
    await applyButton.click();
    
    // Wait for data to load
    await helpers.sleep(2000);
});

Then('the dashboard metrics should match my calculated metrics', async function() {
    // Check metrics for each channel
    for (const channel of Object.keys(this.expectedMetrics) as Array<keyof ChannelMetrics>) {
        // Get metrics from UI
        const channelSection = await this.driver.findElement(
            By.xpath(`//div[contains(@class, 'channel-section') and contains(., '${channel.toUpperCase()}')]`)
        );
        
        // Get total metric
        const totalElement = await channelSection.findElement(
            By.xpath(`.//div[contains(@class, 'metric') and contains(., 'Total')]`)
        );
        const totalText = await totalElement.findElement(By.css('.metric-value')).getText();
        const totalValue = parseInt(totalText.replace(/,/g, ''));
        
        // Get delivered metric
        const deliveredElement = await channelSection.findElement(
            By.xpath(`.//div[contains(@class, 'metric') and contains(., 'Delivered')]`)
        );
        const deliveredText = await deliveredElement.findElement(By.css('.metric-value')).getText();
        const deliveredValue = parseInt(deliveredText.replace(/,/g, ''));
        
        // Get delivery rate metric
        const rateElement = await channelSection.findElement(
            By.xpath(`.//div[contains(@class, 'metric') and contains(., 'Delivery Rate')]`)
        );
        const rateText = await rateElement.findElement(By.css('.metric-value')).getText();
        const rateValue = parseFloat(rateText.replace('%', ''));
        
        // Compare with expected values
        expect(totalValue).to.equal(this.expectedMetrics[channel].total, 
            `${channel.toUpperCase()} total in UI doesn't match expected value`);
        
        expect(deliveredValue).to.equal(this.expectedMetrics[channel].delivered, 
            `${channel.toUpperCase()} delivered in UI doesn't match expected value`);
        
        expect(rateValue).to.be.closeTo(this.expectedMetrics[channel].delivery_rate, 0.01, 
            `${channel.toUpperCase()} delivery rate in UI doesn't match expected value`);
    }
});

// Cleanup
After(async function() {
    if (this.dbConnection) {
        await this.dbConnection.disconnect();
    }
}); 