import { WebDriver, By, until, WebElement } from 'selenium-webdriver';
import * as helpers from '../../utils/test_helpers';

/**
 * Page Object representing the login page
 */
export class LoginPage {
  private driver: WebDriver;
  private defaultTimeout: number;
  
  constructor(driver: WebDriver) {
    this.driver = driver;
    this.defaultTimeout = parseInt(process.env.CUCUMBER_TIMEOUT || '30000');
  }
  
  /**
   * Navigate to the login page
   */
  async navigate(): Promise<void> {
    console.log(`Navigating to ${process.env.BASE_URL}`);
    await this.driver.get(process.env.BASE_URL || '');
  }
  
  /**
   * Get the username input field
   */
  async getUsernameField(): Promise<WebElement> {
    console.log("Finding username field");
    // Try multiple possible selectors
    try {
      return await this.driver.findElement(By.css('input[name="username"]'));
    } catch (e) {
      try {
        return await this.driver.findElement(By.css('input[type="text"]'));
      } catch (e2) {
        return await this.driver.findElement(
          By.xpath('//input[@placeholder="Username" or contains(@placeholder, "user")]')
        );
      }
    }
  }
  
  /**
   * Get the password input field
   */
  async getPasswordField(): Promise<WebElement> {
    console.log("Finding password field");
    // Try multiple possible selectors
    try {
      return await this.driver.findElement(By.css('input[name="password"]'));
    } catch (e) {
      try {
        return await this.driver.findElement(By.css('input[type="password"]'));
      } catch (e2) {
        return await this.driver.findElement(
          By.xpath('//input[@placeholder="Password" or contains(@placeholder, "pass")]')
        );
      }
    }
  }
  
  /**
   * Get the login button
   */
  async getLoginButton(): Promise<WebElement> {
    console.log("Finding login button");
    // Try multiple possible selectors
    try {
      return await this.driver.findElement(By.css('button[type="submit"]'));
    } catch (e) {
      try {
        return await this.driver.findElement(
          By.xpath('//button[contains(text(), "Login") or contains(text(), "Sign in")]')
        );
      } catch (e2) {
        return await this.driver.findElement(By.css('.login-button, .signin-button, .submit-button'));
      }
    }
  }
  
  /**
   * Login with the given credentials
   */
  async login(username: string, password: string): Promise<void> {
    await this.navigate();
    
    try {
      console.log("Waiting for login form to load...");
      // Wait for the login form to be present
      await this.driver.wait(until.elementLocated(By.css('form')), this.defaultTimeout);
      
      // Get form elements
      const usernameField = await this.getUsernameField();
      const passwordField = await this.getPasswordField();
      const loginButton = await this.getLoginButton();
      
      // Enter credentials
      console.log(`Entering username: ${username}`);
      await usernameField.clear();
      await usernameField.sendKeys(username);
      
      console.log(`Entering password: ${password}`);
      await passwordField.clear();
      await passwordField.sendKeys(password);
      
      // Submit the form
      console.log("Clicking login button");
      await loginButton.click();
      
      // Wait for login to complete
      console.log("Waiting for login to complete...");
      try {
        await this.driver.wait(
          until.elementLocated(By.css('.dashboard, .home-page, .main-content')), 
          this.defaultTimeout
        );
        console.log("Login successful!");
      } catch (e) {
        console.error("Login failed or couldn't detect success:", (e as Error).message);
        // Take screenshot to help diagnose
        const screenshot = await this.driver.takeScreenshot();
        console.log("Screenshot after login attempt:", screenshot.substring(0, 100) + "...");
      }
    } catch (error) {
      console.error("Error during login process:", error);
      throw error;
    }
  }
  
  /**
   * Check if login was successful
   */
  async isLoggedIn(): Promise<boolean> {
    return helpers.elementExists(
      this.driver, 
      By.css('.dashboard, .home-page, .main-content, .navbar-user')
    );
  }
  
  /**
   * Get any error messages shown on the login page
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      const errorElement = await this.driver.findElement(
        By.css('.error-message, .alert-danger, .login-error')
      );
      return await errorElement.getText();
    } catch (e) {
      return null;
    }
  }
} 