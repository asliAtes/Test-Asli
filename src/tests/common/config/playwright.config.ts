interface Config {
    apiBaseUrl: string;
    treatmentModuleUrl: string;
    communicationModuleUrl: string;
    database: {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
    };
}

export const config: Config = {
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
    treatmentModuleUrl: process.env.TREATMENT_MODULE_URL || 'http://localhost:3001',
    communicationModuleUrl: process.env.COMMUNICATION_MODULE_URL || 'http://localhost:3002',
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'kredos'
    }
}; 