import { getDbConnection } from '../db_utils';
import { readFileSync } from 'fs';
import path from 'path';

export class RCSTestHelper {
    private dbConnection: any;
    private readonly SQL_PATH = path.join(__dirname, '../../../e2e/features/DEV-958/DEV-1044/setup/test-data-setup.sql');

    constructor() {
        this.initializeConnection();
    }

    private async initializeConnection() {
        this.dbConnection = await getDbConnection();
    }

    public async setupTestData(): Promise<void> {
        try {
            const sqlScript = readFileSync(this.SQL_PATH, 'utf8');
            await this.dbConnection.query(sqlScript);
            console.log('✅ RCS test data setup completed');
        } catch (error) {
            console.error('❌ Failed to setup RCS test data:', error);
            throw error;
        }
    }

    public async cleanupTestData(): Promise<void> {
        try {
            await this.dbConnection.query("DELETE FROM mab_operational_reports_data WHERE file_name LIKE 'TEST_RCS_%'");
            console.log('🧹 RCS test data cleanup completed');
        } catch (error) {
            console.error('❌ Failed to cleanup RCS test data:', error);
            throw error;
        }
    }

    public async getTestDataStats(): Promise<any> {
        try {
            const [results] = await this.dbConnection.query(`
                SELECT 
                    COUNT(*) as total_records,
                    SUM(rcs_sms_sent_count) as total_rcs_sent,
                    COUNT(DISTINCT sent_date) as unique_dates
                FROM mab_operational_reports_data 
                WHERE file_name LIKE 'TEST_RCS_%'
            `);
            return results[0];
        } catch (error) {
            console.error('❌ Failed to get RCS test data stats:', error);
            throw error;
        }
    }

    public async validateRCSMetrics(expected: any): Promise<boolean> {
        try {
            const [actual] = await this.dbConnection.query(`
                SELECT 
                    total_records,
                    rcs_sms_sent_count,
                    status
                FROM mab_operational_reports_data 
                WHERE file_name = ?
            `, [expected.file_name]);

            return (
                actual[0].total_records === expected.total_records &&
                actual[0].rcs_sms_sent_count === expected.rcs_sms_sent_count &&
                actual[0].status === expected.status
            );
        } catch (error) {
            console.error('❌ Failed to validate RCS metrics:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (this.dbConnection) {
            await this.dbConnection.end();
        }
    }
} 