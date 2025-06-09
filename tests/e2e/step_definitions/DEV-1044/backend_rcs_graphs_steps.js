const { Given, When, Then, After } = require('@cucumber/cucumber');
const { expect } = require('chai');
const axios = require('axios');
const mysql = require('mysql2/promise');
const helpers = require('../../utils/test_helpers');
const DatabaseConnection = require('../../utils/database_connection');

// API testing steps
Given('I have API access to the Message Reports service', async function() {
  // Store the API base URL and authentication token
  this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api';
  this.apiToken = process.env.API_TOKEN;
  
  // Verify the API is accessible with a simple ping
  try {
    const response = await axios.get(`${this.apiBaseUrl}/health`, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`
      }
    });
    
    expect(response.status).to.equal(200);
  } catch (error) {
    console.error('Error accessing API:', error);
    throw new Error('API is not accessible. Please check the API_BASE_URL and API_TOKEN environment variables.');
  }
});

When('I request graph data for RCS messages for the last {int} days', async function(days) {
  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  // Format dates for API
  const startDateStr = helpers.formatDate(startDate);
  const endDateStr = helpers.formatDate(endDate);
  
  // Store the date range for later use
  this.dateRange = {
    start: startDateStr,
    end: endDateStr,
    days: days
  };
  
  // Make API request to get graph data
  try {
    const startTime = Date.now();
    
    const response = await axios.get(
      `${this.apiBaseUrl}/reports/status/graph`, 
      {
        params: {
          startDate: startDateStr,
          endDate: endDateStr,
          channels: 'rcs,sms,email'
        },
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      }
    );
    
    const endTime = Date.now();
    this.responseTime = endTime - startTime;
    
    this.apiResponse = response.data;
    
    // Log the response status
    console.log(`API responded with status ${response.status} in ${this.responseTime}ms`);
    
  } catch (error) {
    console.error('Error requesting graph data:', error);
    this.apiError = error.response || error;
    throw error;
  }
});

When('I request graph data with custom date range from {string} to {string}', async function(startDate, endDate) {
  // Store the date range for later use
  this.dateRange = {
    start: startDate,
    end: endDate
  };
  
  // Make API request to get graph data
  try {
    const response = await axios.get(
      `${this.apiBaseUrl}/reports/status/graph`, 
      {
        params: {
          startDate: startDate,
          endDate: endDate,
          channels: 'rcs,sms,email'
        },
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      }
    );
    
    this.apiResponse = response.data;
    
  } catch (error) {
    console.error('Error requesting graph data with custom range:', error);
    this.apiError = error.response || error;
    throw error;
  }
});

Then('the response should include RCS data in the graph dataset', async function() {
  expect(this.apiResponse).to.have.property('datasets');
  
  // Check if RCS dataset exists
  const hasRcsDataset = this.apiResponse.datasets.some(dataset => 
    dataset.label && dataset.label.toLowerCase().includes('rcs')
  );
  
  expect(hasRcsDataset).to.be.true;
});

Then('the RCS dataset should contain data for each day in the range', async function() {
  // Find the RCS dataset
  const rcsDataset = this.apiResponse.datasets.find(dataset => 
    dataset.label && dataset.label.toLowerCase().includes('rcs')
  );
  
  expect(rcsDataset).to.exist;
  expect(rcsDataset).to.have.property('data');
  
  // Calculate expected number of days
  const startDate = new Date(this.dateRange.start);
  const endDate = new Date(this.dateRange.end);
  const daysDiff = Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000)) + 1;
  
  // Check if data points match expected days
  expect(rcsDataset.data.length).to.equal(daysDiff);
  
  // Check that each data point is a number (not null or undefined)
  for (const dataPoint of rcsDataset.data) {
    expect(dataPoint).to.be.a('number');
  }
});

Then('the response should include the following status breakdowns for RCS:', async function(dataTable) {
  const expectedStatuses = dataTable.hashes().map(row => row['Status']);
  
  // Check if status breakdown is included
  expect(this.apiResponse).to.have.property('statusBreakdown');
  expect(this.apiResponse.statusBreakdown).to.have.property('rcs');
  
  const rcsBreakdown = this.apiResponse.statusBreakdown.rcs;
  
  // Check each expected status
  for (const status of expectedStatuses) {
    const statusKey = status.toLowerCase().replace(/ /g, '_');
    expect(rcsBreakdown).to.have.property(statusKey);
  }
});

Then('each RCS status should have valid numeric data', async function() {
  const rcsBreakdown = this.apiResponse.statusBreakdown.rcs;
  
  for (const [status, value] of Object.entries(rcsBreakdown)) {
    expect(value).to.be.a('number');
    expect(value).to.be.at.least(0);
  }
});

Then('the response should include labels for all days in the date range', async function() {
  expect(this.apiResponse).to.have.property('labels');
  
  // Calculate expected number of days
  const startDate = new Date(this.dateRange.start);
  const endDate = new Date(this.dateRange.end);
  const daysDiff = Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000)) + 1;
  
  // Check if labels match expected days
  expect(this.apiResponse.labels.length).to.equal(daysDiff);
});

// Database verification steps
When('I query the database for RCS message counts by day', async function() {
  // Create database connection
  this.dbConnection = new DatabaseConnection();
  await this.dbConnection.connect();
  
  try {
    // Query the database for RCS counts by day
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM message_delivery
      WHERE channel = 'RCS'
      AND created_at BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    
    this.dbData = await this.dbConnection.query(query, [this.dateRange.start, this.dateRange.end]);
    
  } finally {
    // Close the database connection
    await this.dbConnection.disconnect();
  }
});

Then('the graph data should match the database counts exactly', async function() {
  // Find the RCS dataset
  const rcsDataset = this.apiResponse.datasets.find(dataset => 
    dataset.label && dataset.label.toLowerCase().includes('rcs')
  );
  
  // Get date labels from API response
  const dateLabels = this.apiResponse.labels;
  
  // Create a map of date to count from database results
  const dbDateCounts = {};
  for (const row of this.dbData) {
    const dateStr = helpers.formatDate(new Date(row.date));
    dbDateCounts[dateStr] = row.count;
  }
  
  // Compare API data with database counts
  for (let i = 0; i < dateLabels.length; i++) {
    const apiDate = dateLabels[i];
    const apiCount = rcsDataset.data[i];
    
    // If database has count for this date, compare with API count
    if (dbDateCounts[apiDate] !== undefined) {
      expect(apiCount).to.equal(dbDateCounts[apiDate], 
        `Count mismatch for date ${apiDate}: API reported ${apiCount}, DB has ${dbDateCounts[apiDate]}`);
    } else {
      // If no data for this date in DB, API should report 0
      expect(apiCount).to.equal(0, 
        `API reported ${apiCount} for date ${apiDate}, but no data found in DB`);
    }
  }
});

Then('the API should respond within {int} milliseconds', async function(maxTime) {
  expect(this.responseTime).to.be.at.most(maxTime, 
    `API took ${this.responseTime}ms to respond, which is more than the maximum ${maxTime}ms`);
});

// Cleanup
After(async function() {
  if (this.dbConnection) {
    await this.dbConnection.disconnect();
  }
}); 