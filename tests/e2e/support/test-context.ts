import { Browser, BrowserContext, Page } from '@playwright/test';
import { chromium } from 'playwright';

class TestContext {
    private _browser: Browser | null = null;
    private _context: BrowserContext | null = null;
    private _page: Page | null = null;

    get browser(): Browser {
        if (!this._browser) {
            throw new Error('Browser is not initialized');
        }
        return this._browser;
    }

    get context(): BrowserContext {
        if (!this._context) {
            throw new Error('Browser context is not initialized');
        }
        return this._context;
    }

    get page(): Page {
        if (!this._page) {
            throw new Error('Page is not initialized');
        }
        return this._page;
    }

    async init() {
        this._browser = await chromium.launch({
            headless: process.env.HEADLESS !== 'false'
        });
        this._context = await this._browser.newContext();
        this._page = await this._context.newPage();
    }

    async close() {
        if (this._page) {
            await this._page.close();
            this._page = null;
        }
        if (this._context) {
            await this._context.close();
            this._context = null;
        }
        if (this._browser) {
            await this._browser.close();
            this._browser = null;
        }
    }
}

export const test = new TestContext(); 