"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockDatabase = void 0;
class MockDatabase {
    constructor() {
        this.data = new Map();
        this.logs = [];
        this.initializeMockData();
    }
    initializeMockData() {
        // Initialize with some test data
        const now = Date.now();
        const sixtyOneDaysAgo = now - (61 * 24 * 60 * 60 * 1000);
        this.data.set('run', [
            { id: 1, msg_sent_date: sixtyOneDaysAgo, message: 'Old message 1' },
            { id: 2, msg_sent_date: now, message: 'Recent message' },
            { id: 3, msg_sent_date: sixtyOneDaysAgo, message: 'Old message 2' }
        ]);
        this.data.set('process_logs', []);
    }
    async query(sql, params) {
        // Simple mock implementation that returns data based on the table name
        if (sql.toLowerCase().includes('select')) {
            const tableName = this.extractTableName(sql);
            return (this.data.get(tableName) || []);
        }
        return [];
    }
    extractTableName(sql) {
        const match = sql.match(/from\s+(\w+)/i);
        return match ? match[1].toLowerCase() : '';
    }
    async close() {
        // No-op for mock
    }
    getLastInsertId() {
        return 1; // Mock implementation
    }
    async tableExists(tableName) {
        return this.data.has(tableName);
    }
    addLog(message) {
        this.logs.push(message);
    }
    getLogs() {
        return this.logs;
    }
    clearLogs() {
        this.logs = [];
    }
}
exports.MockDatabase = MockDatabase;
