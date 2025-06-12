import dotenv from 'dotenv';
dotenv.config();

export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

export class Config {
    readonly baseUrl: string;
    readonly username: string;
    readonly password: string;
    readonly serviceEndpoint: string;
    readonly treatmentModuleUrl: string;
    readonly communicationModuleUrl: string;
    readonly database: DatabaseConfig;
    readonly uploadDir: string;
    readonly api: {
        baseUrl: string;
        timeout: number;
    };

    constructor() {
        this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        this.username = process.env.RCS_USERNAME || 'test_user';
        this.password = process.env.RCS_PASSWORD || 'test_pass';
        this.serviceEndpoint = process.env.SERVICE_ENDPOINT || 'http://localhost:3001';
        this.treatmentModuleUrl = process.env.TREATMENT_MODULE_URL || 'http://localhost:3002';
        this.communicationModuleUrl = process.env.COMMUNICATION_MODULE_URL || 'http://localhost:3003';
        this.uploadDir = process.env.UPLOAD_DIR || './uploads';
        this.database = {
        host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            database: process.env.DB_NAME || 'kredos_test',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'password'
        };
        this.api = {
            baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
            timeout: parseInt(process.env.API_TIMEOUT || '30000', 10)
        };
    }
}

export const config: Config = new Config(); 