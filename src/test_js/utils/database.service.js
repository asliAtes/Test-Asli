"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const mysql_connection_1 = require("./mysql_connection");
class DatabaseService {
    constructor() {
        this.connection = mysql_connection_1.MySQLConnection.getInstance();
    }
    async query(sql, params) {
        return this.connection.query(sql, params);
    }
    async connect() {
        await this.connection.connect();
    }
    async close() {
        await this.connection.close();
    }
    async getOldRecords(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const timestamp = cutoffDate.getTime();
        return this.query('SELECT * FROM run WHERE msg_sent_date < ?', [timestamp]);
    }
    async exportToCSV(records) {
        // Implementation for CSV export
        return '';
    }
    async ensureTestData() {
        // Create test table if it doesn't exist
        await this.connection.query(`
            CREATE TABLE IF NOT EXISTS test_records (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP NOT NULL,
                data TEXT NOT NULL
            )
        `);
    }
    async setupTestRecords(records) {
        for (const record of records) {
            const timestamp = new Date();
            timestamp.setDate(timestamp.getDate() - parseInt(record.days_old.toString()));
            for (let i = 0; i < record.count; i++) {
                await this.connection.query('INSERT INTO test_records (timestamp, data) VALUES (?, ?)', [timestamp, `Test data ${i}`]);
            }
        }
    }
    async checkArchivedRecordsExistence() {
        const result = await this.connection.query('SELECT * FROM test_records WHERE archived = true');
        return result;
    }
    async cleanup() {
        await this.connection.query('DELETE FROM test_records');
    }
}
exports.DatabaseService = DatabaseService;
