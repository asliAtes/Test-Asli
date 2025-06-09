import mysql, { Connection, ConnectionOptions, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { config } from '../config';

interface DatabaseConfig extends ConnectionOptions {
  connectTimeout: number;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

export interface DbConnection {
    query: (sql: string, values?: any[]) => Promise<any>;
    close: () => Promise<void>;
}

export class DatabaseConnection {
  private connection: Connection | null = null;
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kredos',
      port: Number(process.env.DB_PORT) || 3306,
      connectTimeout: 10000,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };
  }

  async connect(): Promise<void> {
    try {
      this.connection = await mysql.createConnection(this.config);
      console.log('Connected to database successfully');
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log('Disconnected from database');
    }
  }

  async query<T extends RowDataPacket[]>(sql: string, params: any[] = []): Promise<T> {
    if (!this.connection) {
      throw new Error('Not connected to database. Call connect() first.');
    }

    try {
      const [rows] = await this.connection.execute<T>(sql, params);
      return rows;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  async getOne<T extends RowDataPacket>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T[]>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async count(table: string, where: string = '', params: any[] = []): Promise<number> {
    const whereClause = where ? `WHERE ${where}` : '';
    const sql = `SELECT COUNT(*) as count FROM ${table} ${whereClause}`;
    const result = await this.getOne<RowDataPacket & { count: number }>(sql, params);
    return result?.count || 0;
  }

  async insert(table: string, data: Record<string, any>): Promise<ResultSetHeader> {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    const [result] = await this.connection!.execute<ResultSetHeader>(sql, values);
    return result;
  }

  async update(table: string, data: Record<string, any>, where: string, params: any[] = []): Promise<ResultSetHeader> {
    const setClauses = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), ...params];
    
    const sql = `UPDATE ${table} SET ${setClauses} WHERE ${where}`;
    const [result] = await this.connection!.execute<ResultSetHeader>(sql, values);
    return result;
  }
}

// Export a singleton instance
const dbConnection = new DatabaseConnection();

export async function getDbConnection(): Promise<DbConnection> {
    const connection = await mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database
    });

    return {
        query: async (sql: string, values?: any[]) => {
            const [rows] = await connection.execute(sql, values);
            return rows;
        },
        close: async () => {
            await connection.end();
        }
    };
} 