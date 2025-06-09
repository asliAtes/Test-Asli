import { OutreachLogFile } from '../../types/outreach.types';
import { DatabaseService } from '../database.service';
import { configManager } from '@integration/index';
import { DatabaseConfig } from '../../types/database.types';

export class OutreachLogService {
    private dbService: DatabaseService;

    constructor() {
        const config = configManager.getEnvironmentConfig();
        const dbConfig: DatabaseConfig = {
            host: config.database.host,
            port: config.database.port,
            user: config.database.username,
            password: config.database.password,
            database: config.database.name
        };
        this.dbService = DatabaseService.getInstance(dbConfig);
    }

    async checkServiceStatus(): Promise<boolean> {
        try {
            await this.dbService.query('SELECT 1');
            return true;
        } catch (error) {
            return false;
        }
    }

    async prepareTestData(): Promise<OutreachLogFile['records']> {
        // Generate some test records
        return [
            {
                messageId: 'test-msg-1',
                accountNumber: 'ACC001',
                phoneNumber: '+1234567890',
                messageText: 'Test message 1',
                sendDate: new Date().toISOString(),
                status: 'DELIVERED',
                carrier: 'TEST',
                rcsSmsSentCount: 1
            },
            {
                messageId: 'test-msg-2',
                accountNumber: 'ACC002',
                phoneNumber: '+1234567891',
                messageText: 'Test message 2',
                sendDate: new Date().toISOString(),
                status: 'PENDING',
                carrier: 'TEST',
                rcsSmsSentCount: 1
            }
        ];
    }

    async generateOutreachLog(date?: Date): Promise<OutreachLogFile> {
        const headers = ['ACCOUNT_NUMBER', 'PHONE_NUMBER', 'MESSAGE_TEXT', 'SEND_DATE', 'STATUS', 'CARRIER'];
        const records = await this.prepareTestData();
        
        const content = [
            headers.join(','),
            ...records.map(record => [
                record.accountNumber,
                record.phoneNumber,
                record.messageText,
                record.sendDate,
                record.status,
                record.carrier
            ].join(',')),
            ',,,,,' // Empty row with delimiters
        ].join('\r\n');

        return {
            name: `KAI_Kredos_outreach_log_${new Date().getTime()}.csv`,
            content,
            records,
            headers
        };
    }

    async validateHeaders(file: OutreachLogFile): Promise<{ isValid: boolean; errors: string[] }> {
        const expectedHeaders = ['ACCOUNT_NUMBER', 'PHONE_NUMBER', 'MESSAGE_TEXT', 'SEND_DATE', 'STATUS', 'CARRIER'];
        const errors: string[] = [];

        if (!file.headers || file.headers.length !== expectedHeaders.length) {
            errors.push('Invalid number of headers');
        } else {
            file.headers.forEach((header, index) => {
                if (header !== expectedHeaders[index]) {
                    errors.push(`Invalid header: ${header}, expected: ${expectedHeaders[index]}`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    async validateLineEndings(file: OutreachLogFile): Promise<boolean> {
        return file.content.includes('\r\n');
    }

    async processForDelivery(file: OutreachLogFile): Promise<OutreachLogFile> {
        // In a real implementation, this would process the file for delivery
        // For now, we'll just return the same file
        return file;
    }

    async validateEncryption(file: OutreachLogFile): Promise<boolean> {
        // In a real implementation, this would validate the encryption
        // For now, we'll just return true
        return true;
    }
} 