import * as mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'kredos-dev-mysql.cluster-c70f5cj9qhpu.us-east-2.rds.amazonaws.com',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'xBk6sStw*rZv',
    database: process.env.DB_NAME || 'kreedos',
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Export connection for use in tests
export const dbConnection = {
    query: async <T = any>(sql: string, values?: any): Promise<T> => {
        const [rows] = await pool.query(sql, values);
        return rows as T;
    },
    close: async () => {
        await pool.end();
    }
}; 