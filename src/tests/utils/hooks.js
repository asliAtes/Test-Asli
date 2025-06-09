// Load environment variables
require('dotenv').config();

const { Before, After } = require('@cucumber/cucumber');
const { Builder, until, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

// Set up browser options
function setupChromeOptions() {
  const options = new chrome.Options();
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1920,1080');
  
  // Headless mode for CI environments
  if (process.env.CI || process.env.HEADLESS === 'true') {
    options.addArguments('--headless');
  }
  
  return options;
}

function setupFirefoxOptions() {
  const options = new firefox.Options();
  
  // Headless mode for CI environments
  if (process.env.CI || process.env.HEADLESS === 'true') {
    options.addArguments('--headless');
  }
  
  return options;
}

// Set up WebDriver and page objects before each scenario
Before({ tags: '@UI' }, async function() {
  const browser = process.env.BROWSER || 'chrome';
  let driver;
  
  console.log("Setting up WebDriver for UI tests...");
  console.log(`BASE_URL: ${process.env.BASE_URL}`);
  console.log(`Username: ${process.env.ADMIN_USERNAME}`);
  
  // Initialize driver based on browser type
  if (browser.toLowerCase() === 'firefox') {
    driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(setupFirefoxOptions())
      .build();
  } else {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(setupChromeOptions())
      .build();
  }
  
  // Set implicit wait time for elements
  await driver.manage().setTimeouts({ implicit: 10000 });
  
  // Set driver and initialize page objects
  this.driver = driver;
  
  // Initialize page objects
  this.loginPage = {
    async login(username, password) {
      console.log(`Navigating to ${process.env.BASE_URL}`);
      await driver.get(process.env.BASE_URL);
      
      try {
        console.log("Waiting for login form to load...");
        // Wait for the login form to be present first
        await driver.wait(until.elementLocated(By.css('form')), 10000);
        
        console.log("Trying to find username field...");
        // Try different selectors for username field
        let usernameField;
        try {
          usernameField = await driver.findElement(By.css('input[name="username"]'));
        } catch (e) {
          console.log("Couldn't find by name=username, trying other selectors...");
          try {
            usernameField = await driver.findElement(By.css('input[type="text"]'));
          } catch (e2) {
            console.log("Trying by xpath for username input...");
            usernameField = await driver.findElement(By.xpath('//input[@placeholder="Username" or contains(@placeholder, "user")]'));
          }
        }
        
        console.log("Trying to find password field...");
        // Try different selectors for password field
        let passwordField;
        try {
          passwordField = await driver.findElement(By.css('input[name="password"]'));
        } catch (e) {
          console.log("Couldn't find by name=password, trying other selectors...");
          try {
            passwordField = await driver.findElement(By.css('input[type="password"]'));
          } catch (e2) {
            console.log("Trying by xpath for password input...");
            passwordField = await driver.findElement(By.xpath('//input[@placeholder="Password" or contains(@placeholder, "pass")]'));
          }
        }
        
        console.log("Trying to find login button...");
        // Try different selectors for login button
        let loginButton;
        try {
          loginButton = await driver.findElement(By.css('button[type="submit"]'));
        } catch (e) {
          console.log("Couldn't find by type=submit, trying other selectors...");
          try {
            loginButton = await driver.findElement(By.xpath('//button[contains(text(), "Login") or contains(text(), "Sign in")]'));
          } catch (e2) {
            console.log("Trying by css for any submit button...");
            loginButton = await driver.findElement(By.css('.login-button, .signin-button, .submit-button'));
          }
        }
        
        // Enter credentials and login
        console.log(`Entering username: ${username}`);
        await usernameField.clear();
        await usernameField.sendKeys(username);
        
        console.log(`Entering password: ${password}`);
        await passwordField.clear();
        await passwordField.sendKeys(password);
        
        console.log("Clicking login button...");
        await loginButton.click();
        
        // Wait for login to complete - adjust selector as needed
        console.log("Waiting for login to complete...");
        try {
          await driver.wait(until.elementLocated(By.css('.dashboard, .home-page, .main-content')), 10000);
          console.log("Login successful!");
        } catch (e) {
          console.error("Login failed or couldn't detect success:", e.message);
          // Take screenshot to help diagnose
          const screenshot = await driver.takeScreenshot();
          console.log("Screenshot after login attempt:", screenshot.substring(0, 100) + "...");
        }
      } catch (error) {
        console.error("Error during login process:", error);
        throw error;
      }
    }
  };
});

// Setup API test related hooks
Before({ tags: '@API' }, async function() {
  // API test setup can be added here
  this.apiBaseUrl = process.env.API_BASE_URL;
  this.apiToken = process.env.API_TOKEN;
});

// Clean up WebDriver after UI tests
After({ tags: '@UI' }, async function() {
  if (this.driver) {
    await this.driver.quit();
  }
});

// Clean up after API tests
After({ tags: '@API' }, async function() {
  // API test cleanup can be added here
});

// Clean up after database tests
After({ tags: '@database' }, async function() {
  if (this.dbConnection) {
    await this.dbConnection.disconnect();
  }
}); 