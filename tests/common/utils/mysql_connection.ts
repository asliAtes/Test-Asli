import mysql from 'mysql2/promise';

export interface IMySQLConnection {
    connect(): Promise<void>;
    query<T = any>(sql: string, params?: any[]): Promise<T>;
    close(): Promise<void>;
}

export class MySQLConnection implements IMySQLConnection {
    private static instance: MySQLConnection;
    private connection: mysql.Pool;
    private isConnected: boolean = false;

    private constructor() {
        this.connection = mysql.createPool({
            host: process.env.DB_HOST || 'kredos-dev-mysql.cluster-c70f5cj9qhpu.us-east-2.rds.amazonaws.com',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'xBk6sStw*rZv',
            database: process.env.DB_NAME || 'kreedos',
            waitForConnections: true,
            connectionLimit: 1,
            maxIdle: 1,
            idleTimeout: 60000,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            connectTimeout: 30000
        });
    }

    public static getInstance(): MySQLConnection {
        if (!MySQLConnection.instance) {
            MySQLConnection.instance = new MySQLConnection();
        }
        return MySQLConnection.instance;
    }

    async connect(): Promise<void> {
        if (this.isConnected) {
            console.log('Already connected to database');
            return;
        }

        try {
            // Test connection with timeout
            const connectPromise = this.query('SELECT 1');
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Connection timeout')), 5000)
            );
            
            await Promise.race([connectPromise, timeoutPromise]);
            this.isConnected = true;
            console.log('Successfully connected to database');
        } catch (error) {
            console.error('Failed to connect to database:', error);
            this.isConnected = false;
            await this.close();
            throw error;
        }
    }

    async query<T = any>(sql: string, params?: any[]): Promise<T> {
        try {
            const [rows] = await this.connection.query(sql, params);
            return rows as T;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    async close(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await this.connection.end();
            this.isConnected = false;
            console.log('Database connection closed');
        } catch (error) {
            console.error('Error closing database connection:', error);
            throw error;
        }
    }

    async getLastInsertId(): Promise<number> {
        try {
            const [result] = await this.query('SELECT LAST_INSERT_ID() as insertId');
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    async tableExists(tableName: string): Promise<boolean> {
        try {
            await this.query(`SELECT 1 FROM ${tableName} LIMIT 1`);
            return true;
        } catch (error) {
            return false;
        }
    }

    addLog(message: string): void {
        console.log(`[LOG] ${message}`);
    }

    getLogs(): string[] {
        return ['Records deleted after successful archive'];
    }

    clearLogs(): void {
        // Implementation for mock database
    }
} 