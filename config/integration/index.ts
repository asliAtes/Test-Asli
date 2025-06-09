export interface Config {
    baseUrl: string;
    username: string;
    password: string;
    serviceEndpoint: string;
    treatmentModuleUrl: string;
    communicationModuleUrl: string;
    api: {
        baseUrl: string;
        timeout: number;
    };
    database: {
        host: string;
        port: number;
        name: string;
        username: string;
        password: string;
    };
    sftp?: {
        host: string;
        port: number;
        username: string;
        password: string;
    };
    environment?: string;
    isTestEnvironment?: boolean;
}

export interface ConfigManager {
    getConfig(): Config;
    setConfig(config: Partial<Config>): void;
    getEnvironmentConfig(): Config;
}

class DefaultConfigManager implements ConfigManager {
    private config: Config;

    constructor() {
        this.config = {
            baseUrl: process.env.BASE_URL || 'http://localhost:3000',
            username: process.env.USERNAME || 'admin',
            password: process.env.PASSWORD || 'admin',
            serviceEndpoint: process.env.SERVICE_ENDPOINT || 'http://localhost:3001',
            treatmentModuleUrl: process.env.TREATMENT_MODULE_URL || 'http://localhost:3002',
            communicationModuleUrl: process.env.COMMUNICATION_MODULE_URL || 'http://localhost:3003',
            api: {
                baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
                timeout: 30000
            },
            database: {
                host: process.env.DB_HOST || 'localhost',
                port: Number(process.env.DB_PORT) || 5432,
                name: process.env.DB_NAME || 'kredos',
                username: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres'
            },
            sftp: {
                host: process.env.SFTP_HOST || 'localhost',
                port: Number(process.env.SFTP_PORT) || 22,
                username: process.env.SFTP_USER || 'test',
                password: process.env.SFTP_PASSWORD || 'test'
            }
        };
    }

    getConfig(): Config {
        return this.config;
    }

    setConfig(config: Partial<Config>): void {
        this.config = { ...this.config, ...config };
    }

    getEnvironmentConfig(): Config {
        return {
            ...this.config,
            environment: process.env.NODE_ENV || 'development',
            isTestEnvironment: process.env.NODE_ENV === 'test'
        };
    }
}

export const configManager = new DefaultConfigManager(); 