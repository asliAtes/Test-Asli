import { MySQLConnection } from './mysql_connection';

export interface TestRecord {
    id: number;
    timestamp: Date;
    data: string;
}

export class DatabaseService {
    private connection: MySQLConnection;

    constructor() {
        this.connection = MySQLConnection.getInstance();
    }

    async query<T>(sql: string, params?: any[]): Promise<T> {
        return this.connection.query<T>(sql, params);
    }

    async connect(): Promise<void> {
        await this.connection.connect();
    }

    async close(): Promise<void> {
        await this.connection.close();
    }

    async getOldRecords(days: number): Promise<any[]> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const timestamp = cutoffDate.getTime();

        return this.query<any[]>(
            'SELECT * FROM run WHERE msg_sent_date < ?',
            [timestamp]
        );
    }

    async exportToCSV(records: any[]): Promise<string> {
        // Implementation for CSV export
        return '';
    }

    async ensureTestData(): Promise<void> {
        // Create test table if it doesn't exist
        await this.connection.query(`
            CREATE TABLE IF NOT EXISTS test_records (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP NOT NULL,
                data TEXT NOT NULL
            )
        `);
    }

    async setupTestRecords(records: Array<{ days_old: number; count: number }>): Promise<void> {
        for (const record of records) {
            const timestamp = new Date();
            timestamp.setDate(timestamp.getDate() - parseInt(record.days_old.toString()));
            
            for (let i = 0; i < record.count; i++) {
                await this.connection.query(
                    'INSERT INTO test_records (timestamp, data) VALUES (?, ?)',
                    [timestamp, `Test data ${i}`]
                );
            }
        }
    }

    async checkArchivedRecordsExistence(): Promise<TestRecord[]> {
        const result = await this.connection.query<TestRecord[]>(
            'SELECT * FROM test_records WHERE archived = true'
        );
        return result;
    }

    async cleanup(): Promise<void> {
        await this.connection.query('DELETE FROM test_records');
    }
} 