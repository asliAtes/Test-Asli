import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="username"], input[type="text"], input[placeholder*="user" i]').first();
    this.passwordInput = page.locator('input[name="password"], input[type="password"], input[placeholder*="pass" i]').first();
    this.loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), .login-button, .signin-button, .submit-button').first();
    this.errorMessage = page.locator('.error-message, .alert-danger, .login-error');
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Login with the provided credentials
   */
  async login(username: string, password: string) {
    await this.goto();
    
    // Wait for login form to be visible
    await this.usernameInput.waitFor({ state: 'visible' });
    
    // Fill in the login form
    await this.usernameInput.clear();
    await this.usernameInput.fill(username);
    
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
    
    // Click login and wait for navigation
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle' }),
      this.loginButton.click()
    ]);
  }

  /**
   * Check if the user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.page.locator('.dashboard, .home-page, .main-content, .navbar-user').isVisible();
  }

  /**
   * Get error message if login failed
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }
} 