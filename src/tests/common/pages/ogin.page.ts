import { Page } from '@playwright/test';

export class LoginPage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateToLoginPage() {
        console.log('Navigating to login page...');
        await this.page.goto('https://uscc-stg.kredosai.com/login');
        console.log('Waiting for username field...');
        await this.page.waitForSelector('#username', { state: 'visible', timeout: 10000 });
        console.log('Username field found');
    }

    async login(username = process.env.ADMIN_USERNAME, password = process.env.ADMIN_PASSWORD) {
        console.log('Starting login process...');
        console.log('Username:', username);
        console.log('Password:', password ? '****' : 'not set');
        
        const usernameField = await this.page.waitForSelector('#username', { state: 'visible', timeout: 10000 });
        const passwordField = await this.page.waitForSelector('#password', { state: 'visible', timeout: 10000 });
        
        console.log('Filling credentials...');
        await usernameField.fill(username || 'usccdevuser');
        await passwordField.fill(password || 'Kredos@1234');
        
        console.log('Looking for submit button...');
        const submitButton = await this.page.waitForSelector('button[type="submit"], input[type="submit"], .sign-in-button, #sign-in-button', { state: 'visible', timeout: 10000 });
        console.log('Clicking submit button...');
        await submitButton.click();
        
        console.log('Waiting for navigation...');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);
        console.log('Login process completed');
    }

    async navigateToSmsEmailReports() {
        console.log('Navigating to SMS/Email reports...');
        await this.page.goto('https://uscc-stg.kredosai.com/performance-reports');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);
        console.log('Navigation completed');
    }
} 