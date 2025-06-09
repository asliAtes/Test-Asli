/**
 * Database connection utility for tests
 */
const mysql = require('mysql2/promise');
class DatabaseConnection {
    constructor() {
        this.connection = null;
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'kredos',
            port: process.env.DB_PORT || 3306,
            connectTimeout: 10000,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };
    }
    /**
     * Connect to the database
     * @returns {Promise<void>}
     */
    async connect() {
        try {
            this.connection = await mysql.createConnection(this.config);
            console.log('Connected to database successfully');
        }
        catch (error) {
            console.error('Error connecting to database:', error);
            throw error;
        }
    }
    /**
     * Disconnect from the database
     * @returns {Promise<void>}
     */
    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
            console.log('Disconnected from database');
        }
    }
    /**
     * Execute a query
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise<Array>} Query results
     */
    async query(sql, params = []) {
        if (!this.connection) {
            throw new Error('Not connected to database. Call connect() first.');
        }
        try {
            const [rows] = await this.connection.execute(sql, params);
            return rows;
        }
        catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }
    /**
     * Get a single row from the database
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise<Object>} First row of results
     */
    async getOne(sql, params = []) {
        const rows = await this.query(sql, params);
        return rows.length > 0 ? rows[0] : null;
    }
    /**
     * Get the count of rows matching a query
     * @param {string} table - Table name
     * @param {string} where - WHERE clause
     * @param {Array} params - Query parameters
     * @returns {Promise<number>} Row count
     */
    async count(table, where = '', params = []) {
        const whereClause = where ? `WHERE ${where}` : '';
        const sql = `SELECT COUNT(*) as count FROM ${table} ${whereClause}`;
        const result = await this.getOne(sql, params);
        return result.count;
    }
    /**
     * Insert a row into a table
     * @param {string} table - Table name
     * @param {Object} data - Column-value pairs to insert
     * @returns {Promise<Object>} Result with insertId
     */
    async insert(table, data) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);
        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        const [result] = await this.connection.execute(sql, values);
        return result;
    }
    /**
     * Update rows in a table
     * @param {string} table - Table name
     * @param {Object} data - Column-value pairs to update
     * @param {string} where - WHERE clause
     * @param {Array} params - Parameters for WHERE clause
     * @returns {Promise<Object>} Result with affectedRows
     */
    async update(table, data, where, params = []) {
        const setClauses = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), ...params];
        const sql = `UPDATE ${table} SET ${setClauses} WHERE ${where}`;
        const [result] = await this.connection.execute(sql, values);
        return result;
    }
}
module.exports = DatabaseConnection;
