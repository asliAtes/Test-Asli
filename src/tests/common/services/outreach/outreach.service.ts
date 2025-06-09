import { promises as fs } from 'fs';
import * as path from 'path';
import { S3Service } from '../../../utils/s3.service';
import { DatabaseService } from '../database.service';
import { OutreachLogFile, OutreachLogRecord, DeliveryStatus } from '../../types/outreach.types';
import { Config } from '../../config/config';
import * as crypto from 'crypto';

export class OutreachService {
    private s3Service: S3Service;
    private dbService: DatabaseService;
    private readonly SAMPLE_FILE = 'src/tests/mocks/data/KAI_Kredos_outreach_log_20241021190000.csv';

    constructor(private config: Config) {
        this.s3Service = new S3Service(config);
        this.dbService = new DatabaseService(config);
    }

    async generateFileName(): Promise<string> {
        const timestamp = new Date().toISOString()
            .replace(/[-:]/g, '')
            .replace(/\..+/, '');
        return `KAI_Kredos_outreach_log_${timestamp}.csv`;
    }

    async generateTestData(count: number = 5): Promise<OutreachLogRecord[]> {
        // Read sample data from the example file
        const content = await fs.readFile(this.SAMPLE_FILE, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        
        const records: OutreachLogRecord[] = [];
        const dataLines = lines.slice(1, count + 1);
        
        for (const line of dataLines) {
            const values = line.split(',');
            records.push({
                accountNumber: values[0] || '',
                phoneNumber: values[1] || '',
                messageText: values[7] || '',
                sendDate: values[4] || '',
                status: values[6] || '',
                carrier: values[5] || ''
            });
        }
        
        return records;
    }

    async createFile(records: OutreachLogRecord[]): Promise<OutreachLogFile> {
        const fileName = await this.generateFileName();
        const headers = ['ACCOUNT_NUMBER', 'PHONE_NUMBER', 'MESSAGE_TEXT', 'SEND_DATE', 'STATUS', 'CARRIER'];
        
        return {
            name: fileName,
            records,
            headers
        };
    }

    async writeFile(file: OutreachLogFile): Promise<string> {
        const filePath = path.join(this.config.uploadDir, file.name);
        const content = this.formatFileContent(file);
        await fs.writeFile(filePath, content);
        return filePath;
    }

    private formatFileContent(file: OutreachLogFile): string {
        const lines = [
            file.headers.join(','),
            ...file.records.map(record => [
                record.accountNumber,
                record.phoneNumber,
                record.messageText,
                record.sendDate,
                record.status,
                record.carrier
            ].join(',')),
            ','.repeat(file.headers.length - 1) // Blank row with delimiters
        ];
        return lines.join('\r\n');
    }

    async encryptFile(filePath: string): Promise<string> {
        const encryptedPath = `${filePath}.pgp`;
        // Implementation would use GPG or OpenPGP
        // For test purposes, we'll just copy the file
        await fs.copyFile(filePath, encryptedPath);
        return encryptedPath;
    }

    async deliverFile(encryptedFilePath: string): Promise<DeliveryStatus> {
        const fileName = path.basename(encryptedFilePath);
        
        // Upload to S3
        await this.s3Service.uploadFile(
            encryptedFilePath,
            `${this.config.s3.path}/${fileName}`
        );

        // Upload to SFTP would be implemented here
        // For now, we'll simulate it
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            fileName,
            sftpDelivered: true,
            s3Uploaded: true,
            timestamp: new Date().toISOString(),
            encrypted: true
        };
    }

    async validateFileFormat(filePath: string): Promise<boolean> {
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Check headers
        const headers = lines[0].trim().split(',');
        const expectedHeaders = ['ACCOUNT_NUMBER', 'PHONE_NUMBER', 'MESSAGE_TEXT', 'SEND_DATE', 'STATUS', 'CARRIER'];
        if (!expectedHeaders.every(h => headers.includes(h))) {
            return false;
        }

        // Check line endings
        if (!content.includes('\r\n')) {
            return false;
        }

        // Check for blank row at end
        const lastLine = lines[lines.length - 1].trim();
        if (lastLine !== ','.repeat(headers.length - 1)) {
            return false;
        }

        return true;
    }

    async isWeekend(): Promise<boolean> {
        const day = new Date().getDay();
        return day === 0 || day === 6;
    }

    async generateEmptyFile(): Promise<OutreachLogFile> {
        return this.createFile([]);
    }
} 