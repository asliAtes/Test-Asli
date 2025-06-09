/**
 * Helper functions for automation tests
 */

/**
 * Sleep for a specified number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format a date as YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
function randomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Wait for an element to be present and visible
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {By} locator - Element locator
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<WebElement>} The element
 */
async function waitForElement(driver, locator, timeout = 10000) {
  const { until } = require('selenium-webdriver');
  return driver.wait(until.elementLocated(locator), timeout)
    .then(el => driver.wait(until.elementIsVisible(el), timeout))
    .then(el => el);
}

/**
 * Check if an element exists
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {By} locator - Element locator
 * @returns {Promise<boolean>} Whether the element exists
 */
async function elementExists(driver, locator) {
  try {
    await driver.findElement(locator);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  sleep,
  formatDate,
  randomString,
  waitForElement,
  elementExists
}; 
 * Helper functions for automation tests
 */

/**
 * Sleep for a specified number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format a date as YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
function randomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Wait for an element to be present and visible
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {By} locator - Element locator
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<WebElement>} The element
 */
async function waitForElement(driver, locator, timeout = 10000) {
  const { until } = require('selenium-webdriver');
  return driver.wait(until.elementLocated(locator), timeout)
    .then(el => driver.wait(until.elementIsVisible(el), timeout))
    .then(el => el);
}

/**
 * Check if an element exists
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {By} locator - Element locator
 * @returns {Promise<boolean>} Whether the element exists
 */
async function elementExists(driver, locator) {
  try {
    await driver.findElement(locator);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  sleep,
  formatDate,
  randomString,
  waitForElement,
  elementExists
}; 