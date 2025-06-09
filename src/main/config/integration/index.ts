export interface Config {
    serviceEndpoint: string;
    treatmentModuleUrl: string;
    communicationModuleUrl: string;
    database: {
        host: string;
        port: number;
        user: string;
        password: string;
        name: string;
    };
}

export const defaultConfig: Config = {
    serviceEndpoint: process.env.SERVICE_ENDPOINT || 'http://localhost:3000',
    treatmentModuleUrl: process.env.TREATMENT_MODULE_URL || 'http://localhost:3001',
    communicationModuleUrl: process.env.COMMUNICATION_MODULE_URL || 'http://localhost:3002',
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || 'kredos'
    }
};

export const configManager = {
    getEnvironmentConfig: () => ({
        baseUrl: process.env.BASE_URL || 'https://uscc-stg.kredosai.com',
        username: process.env.ADMIN_USERNAME || 'usccdevuser',
        password: process.env.ADMIN_PASSWORD || 'Kredos@1234',
        serviceEndpoint: process.env.SERVICE_ENDPOINT || 'https://api.kredosai.com',
        treatmentModuleUrl: process.env.TREATMENT_MODULE_URL || 'https://treatment.kredosai.com',
        communicationModuleUrl: process.env.COMMUNICATION_MODULE_URL || 'https://communication.kredosai.com',
        database: {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            name: process.env.DB_NAME || 'kredos',
            username: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        }
    })
}; 