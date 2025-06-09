import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import {
    DatabaseConfig,
    QueryResult,
    QueryResponse,
    InsertResult,
    UpdateResult,
    MessageRecord,
    RcsMetricsRecord
} from '../types/database.types';

export class DatabaseService {
    private pool: Pool;
    private config: DatabaseConfig;
    private static instance: DatabaseService;

    private constructor(config: DatabaseConfig) {
        this.config = config;
        this.pool = mysql.createPool({
            host: config.host,
            port: config.port || 3306,
            user: config.user,
            password: config.password,
            database: config.database,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true
        });
    }

    public static getInstance(config: DatabaseConfig): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService(config);
        }
        return DatabaseService.instance;
    }

    private async getConnection(): Promise<PoolConnection> {
        try {
            return await this.pool.getConnection();
        } catch (error) {
            console.error('Failed to get database connection:', error);
            throw new Error('Database connection failed');
        }
    }

    async query<T = any>(sql: string, params: any[] = []): Promise<QueryResponse<T>> {
        const conn = await this.getConnection();
        try {
            const [rows] = await conn.execute(sql, params);
            return rows as QueryResponse<T>;
        } catch (error) {
            console.error('Query execution failed:', error);
            throw error;
        } finally {
            conn.release();
        }
    }

    async insert<T extends QueryResult>(
        table: string,
        data: Partial<T>
    ): Promise<InsertResult> {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map(() => '?').join(', ');
        
        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        const [result] = await this.pool.execute<InsertResult>(sql, values);
        return result;
    }

    async update<T extends QueryResult>(
        table: string,
        data: Partial<T>,
        where: string,
        params: any[] = []
    ): Promise<UpdateResult> {
        const setClauses = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), ...params];
        
        const sql = `UPDATE ${table} SET ${setClauses} WHERE ${where}`;
        const [result] = await this.pool.execute<UpdateResult>(sql, values);
        return result;
    }

    async getRcsMessageCount(): Promise<number> {
        const result = await this.query<{ count: number }[]>(
            'SELECT COUNT(*) as count FROM messages WHERE channel = ?',
            ['RCS']
        );
        return result[0]?.count || 0;
    }

    async getRcsMetrics(startDate: Date, endDate: Date): Promise<RcsMetricsRecord[]> {
        return this.query<RcsMetricsRecord[]>(
            'SELECT date, message_count, success_rate FROM rcs_metrics WHERE date BETWEEN ? AND ?',
            [startDate, endDate]
        );
    }

    async checkColumnExists(table: string, column: string): Promise<boolean> {
        const sql = `
            SELECT COUNT(*) as count
            FROM information_schema.columns
            WHERE table_name = ?
            AND column_name = ?
            AND table_schema = ?
        `;
        const result = await this.query<{ count: number }[]>(
            sql,
            [table, column, this.config.database]
        );
        return result[0]?.count > 0;
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
} 