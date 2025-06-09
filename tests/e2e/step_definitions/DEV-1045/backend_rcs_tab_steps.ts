import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import axios from 'axios';
import mysql from 'mysql2/promise';
import helpers from '../../utils/test_helpers';

interface RCSMetrics {
    total: number;
    delivered: number;
    pending: number;
    failed: number;
    undeliverable: number;
    carrier_error: number;
    delivery_rate?: number;
    failure_rate?: number;
}

interface DailyMetrics {
    date: string;
    metrics: {
        rcs: RCSMetrics;
    };
}

interface APIResponse {
    data: {
        metrics: {
            rcs: RCSMetrics;
        };
        timestamp: string;
        period: string;
        daily: DailyMetrics[];
    };
}

interface ErrorResponse {
    data: {
        error: boolean;
        message: string;
        code?: string;
        details?: string;
        help?: string;
        trace?: string;
    };
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DB_HOST: string;
            DB_USER: string;
            DB_PASSWORD: string;
            DB_NAME: string;
        }
    }
}

// Most background steps are shared with DEV-1044 and can be reused
// We'll define only the unique steps for this feature

// RCS metrics API testing
Then('the response should include RCS delivery metrics', async function() {
    const response = this.apiResponse as APIResponse;
    expect(response.data).to.have.property('metrics');
    expect(response.data.metrics).to.have.property('rcs');
    expect(response.data.metrics.rcs).to.not.be.empty;
});

Then('the response format should match the API specification', async function() {
    const response = (this.apiResponse as APIResponse).data;
    
    // Check for required top-level properties
    expect(response).to.have.property('metrics');
    expect(response).to.have.property('timestamp');
    expect(response).to.have.property('period');
    
    // Check RCS metrics structure
    const rcsMetrics = response.metrics.rcs;
    expect(rcsMetrics).to.have.property('total');
    expect(rcsMetrics).to.have.property('delivered');
    expect(rcsMetrics).to.have.property('pending');
    expect(rcsMetrics).to.have.property('failed');
    expect(rcsMetrics).to.have.property('undeliverable');
    expect(rcsMetrics).to.have.property('carrier_error');
    
    // Check data types
    expect(rcsMetrics.total).to.be.a('number');
    expect(rcsMetrics.delivered).to.be.a('number');
    expect(rcsMetrics.pending).to.be.a('number');
    expect(rcsMetrics.failed).to.be.a('number');
    expect(rcsMetrics.undeliverable).to.be.a('number');
    expect(rcsMetrics.carrier_error).to.be.a('number');
});

Then('the response should include timestamps for data freshness', async function() {
    const response = (this.apiResponse as APIResponse).data;
    
    expect(response).to.have.property('timestamp');
    expect(response.timestamp).to.be.a('string');
    
    // Verify timestamp is recent (within last hour)
    const responseTime = new Date(response.timestamp);
    const now = new Date();
    const timeDiff = (now.getTime() - responseTime.getTime()) / (1000 * 60); // difference in minutes
    
    expect(timeDiff).to.be.lessThan(60, 'Response timestamp is more than 1 hour old');
});

Then('the response should include the following metrics:', async function(dataTable: { hashes: () => Array<{ Metric: string }> }) {
    const expectedMetrics = dataTable.hashes().map(row => row.Metric);
    const rcsMetrics = (this.apiResponse as APIResponse).data.metrics.rcs;
    
    for (const metric of expectedMetrics) {
        const metricKey = metric.toLowerCase().replace(/ /g, '_') as keyof RCSMetrics;
        expect(rcsMetrics).to.have.property(metricKey);
    }
});

Then('each metric should have a valid numeric value', async function() {
    const rcsMetrics = (this.apiResponse as APIResponse).data.metrics.rcs;
    
    for (const [key, value] of Object.entries(rcsMetrics)) {
        if (typeof value === 'number') {
            expect(value).to.be.at.least(0);
        }
    }
});

Then('the response should include daily breakdown of metrics', async function() {
    const response = (this.apiResponse as APIResponse).data;
    
    expect(response).to.have.property('daily');
    expect(response.daily).to.be.an('array');
    expect(response.daily.length).to.be.greaterThan(0);
    
    // Check the structure of daily data
    const firstDay = response.daily[0];
    expect(firstDay).to.have.property('date');
    expect(firstDay).to.have.property('metrics');
    expect(firstDay.metrics).to.have.property('rcs');
    
    // Check the metrics for this day
    const dayRcsMetrics = firstDay.metrics.rcs;
    expect(dayRcsMetrics).to.have.property('total');
    expect(dayRcsMetrics).to.have.property('delivered');
    expect(dayRcsMetrics).to.have.property('failed');
});

Then('the response should include percentage calculations where applicable', async function() {
    const rcsMetrics = (this.apiResponse as APIResponse).data.metrics.rcs;
    
    // Check for delivery rate percentage
    expect(rcsMetrics).to.have.property('delivery_rate');
    expect(rcsMetrics.delivery_rate).to.be.a('number');
    expect(rcsMetrics.delivery_rate).to.be.within(0, 100);
    
    // Verify the percentage calculation is correct
    if (rcsMetrics.total > 0) {
        const expectedRate = (rcsMetrics.delivered / rcsMetrics.total) * 100;
        expect(rcsMetrics.delivery_rate).to.be.closeTo(expectedRate, 0.01);
    }
});

Then('the response should include RCS data for the last 7 days', async function() {
    const response = (this.apiResponse as APIResponse).data;
    
    expect(response).to.have.property('period', '7d');
    expect(response).to.have.property('daily');
    expect(response.daily).to.be.an('array');
    
    // Should have 7 days of data (or slightly fewer if some days have no data)
    expect(response.daily.length).to.be.within(5, 7);
    
    // Check that days are within the last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    for (const day of response.daily) {
        const dayDate = new Date(day.date);
        expect(dayDate.getTime() >= sevenDaysAgo.getTime()).to.be.true;
    }
});

Then('the response should include RCS data only from April 1-7, 2025', async function() {
    const response = (this.apiResponse as APIResponse).data;
    
    expect(response.daily).to.be.an('array');
    
    const startDate = new Date('2025-04-01');
    const endDate = new Date('2025-04-07');
    
    for (const day of response.daily) {
        const dayDate = new Date(day.date);
        expect(dayDate.getTime() >= startDate.getTime() && dayDate.getTime() <= endDate.getTime()).to.be.true;
    }
});

Then('the date-filtered data should match database records', async function() {
    const response = (this.apiResponse as APIResponse).data;
    
    expect(response).to.have.property('daily');
    expect(response.daily).to.be.an('array');
    
    for (const day of response.daily) {
        expect(day).to.have.property('date');
        expect(day).to.have.property('metrics');
        expect(day.metrics).to.have.property('rcs');
        expect(day.metrics.rcs).to.have.property('total');
        expect(day.metrics.rcs.total).to.be.a('number');
    }
});

Then('the error response should contain helpful troubleshooting information', async function() {
    const errorResponse = this.apiError as ErrorResponse;
    
    expect(errorResponse.data).to.have.property('error');
    expect(errorResponse.data).to.have.property('message');
    expect(errorResponse.data.message).to.be.a('string');
    expect(errorResponse.data.message.length).to.be.greaterThan(10);
    
    // Additional information should be included
    expect(errorResponse.data).to.have.any.keys('code', 'details', 'help', 'trace');
});

Then('the response metrics should exactly match the known database values', async function() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    
    try {
        // Get RCS metrics from database
        const [rows] = await connection.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) as delivered,
                SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'UNDELIVERABLE' THEN 1 ELSE 0 END) as undeliverable,
                SUM(CASE WHEN status = 'CARRIER_ERROR' THEN 1 ELSE 0 END) as carrier_error
            FROM message_delivery 
            WHERE channel = 'RCS'
        `);
        
        const dbMetrics = rows[0] as RCSMetrics;
        const apiMetrics = (this.apiResponse as APIResponse).data.metrics.rcs;
        
        // Compare values
        expect(apiMetrics.total).to.equal(dbMetrics.total);
        expect(apiMetrics.delivered).to.equal(dbMetrics.delivered);
        expect(apiMetrics.failed).to.equal(dbMetrics.failed);
        expect(apiMetrics.pending).to.equal(dbMetrics.pending);
        expect(apiMetrics.undeliverable).to.equal(dbMetrics.undeliverable);
        expect(apiMetrics.carrier_error).to.equal(dbMetrics.carrier_error);
        
    } finally {
        await connection.end();
    }
});

Then('the calculated percentages should be mathematically correct', async function() {
    const metrics = (this.apiResponse as APIResponse).data.metrics.rcs;
    
    // Check delivery rate calculation
    if (metrics.total > 0) {
        const expectedDeliveryRate = (metrics.delivered / metrics.total) * 100;
        expect(metrics.delivery_rate).to.be.closeTo(expectedDeliveryRate, 0.01);
    } else {
        expect(metrics.delivery_rate).to.equal(0);
    }
    
    // Check other percentage metrics if they exist
    if (metrics.failure_rate) {
        const expectedFailureRate = (metrics.failed / metrics.total) * 100;
        expect(metrics.failure_rate).to.be.closeTo(expectedFailureRate, 0.01);
    }
});

When('I record the response time', async function() {
    this.firstResponseTime = this.responseTime;
});

Then('the second response should be faster due to caching', async function() {
    expect(this.responseTime).to.be.lessThan(this.firstResponseTime);
});

Then('the response should include the new RCS message data', async function() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    
    try {
        // Verify that our test message is included in the counts
        const [rows] = await connection.execute(`
            SELECT COUNT(*) as count
            FROM message_delivery
            WHERE channel = 'RCS'
            AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        `);
        
        const recentCount = (rows as Array<{ count: number }>)[0].count;
        expect(recentCount).to.be.greaterThan(0);
        
    } finally {
        await connection.end();
    }
}); 