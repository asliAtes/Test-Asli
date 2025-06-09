export interface Config {
    db: {
        host: string;
        user: string;
        password: string;
        database: string;
    };
    api: {
        baseUrl: string;
        timeout: number;
    };
    test: {
        browser: string;
        headless: boolean;
        defaultTimeout: number;
    };
}

export const config: Config = {
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'test_user',
        password: process.env.DB_PASSWORD || 'test_password',
        database: process.env.DB_NAME || 'test_db'
    },
    api: {
        baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
        timeout: parseInt(process.env.API_TIMEOUT || '30000')
    },
    test: {
        browser: process.env.TEST_BROWSER || 'chromium',
        headless: process.env.TEST_HEADLESS !== 'false',
        defaultTimeout: parseInt(process.env.TEST_TIMEOUT || '30000')
    }
}; 