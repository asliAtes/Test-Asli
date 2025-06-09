import * as fs from 'fs';
import * as path from 'path';
import { DatabaseService } from '../../common/services/database.service';
import { S3Service } from '../common/services/s3.service';
import { createObjectCsvWriter } from 'csv-writer';
import { defaultConfig } from '../common/config';

export interface TestRecord {
    id: string;
    timestamp: string;
    data: string;
}

export class ArchiveService {
    private s3Service: S3Service;
    private dbService: DatabaseService;
    private identifiedRecords: TestRecord[] = [];
    private latestExportPath: string = '';

    constructor() {
        this.s3Service = new S3Service();
        this.dbService = new DatabaseService();
    }

    async init(): Promise<void> {
        await this.dbService.connect();
    }

    async cleanup(): Promise<void> {
        await this.dbService.connect();
    }

    async identifyRecordsForArchiving(daysOld: number = 60): Promise<TestRecord[]> {
        const result = await this.dbService.query(`
            SELECT id, timestamp, data
            FROM test_records
            WHERE timestamp < DATE_SUB(NOW(), INTERVAL ${daysOld} DAY)
        `);
        this.identifiedRecords = result as TestRecord[];
        return this.identifiedRecords;
    }

    getIdentifiedRecords(): TestRecord[] {
        return this.identifiedRecords;
    }

    async exportToCSV(): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportDir = path.join(process.cwd(), 'exports');
        
        // Ensure exports directory exists
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        this.latestExportPath = path.join(exportDir, `archive_${timestamp}.csv`);

        const csvWriter = createObjectCsvWriter({
            path: this.latestExportPath,
            header: [
                { id: 'id', title: 'ID' },
                { id: 'timestamp', title: 'Timestamp' },
                { id: 'data', title: 'Data' }
            ]
        });

        await csvWriter.writeRecords(this.identifiedRecords);
        return this.latestExportPath;
    }

    getLatestExportPath(): string {
        return this.latestExportPath;
    }

    async uploadToS3(): Promise<void> {
        if (!this.latestExportPath) {
            throw new Error('No export file available. Run exportToCSV first.');
        }

        const key = `archives/${path.basename(this.latestExportPath)}`;
        await this.s3Service.uploadFile({
            name: key,
            content: '',
            path: this.latestExportPath
        });
    }

    async verifyS3Upload(): Promise<{ success: boolean; error?: string }> {
        try {
            const key = `archives/${path.basename(this.latestExportPath)}`;
            const exists = await this.s3Service.verifyFileExists(key);
            
            if (!exists) {
                return { success: false, error: 'File not found in S3' };
            }

            const metadata = await this.s3Service.getFileMetadata(key);
            if (!metadata['archive-date']) {
                return { success: false, error: 'Missing archive metadata' };
            }

            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            };
        }
    }

    async verifyArchive(key: string): Promise<boolean> {
        try {
            return await this.s3Service.verifyFileExists(key);
        } catch (error) {
            console.error('Error verifying archive:', error);
            return false;
        }
    }

    async getArchiveMetadata(key: string): Promise<any> {
        try {
            return await this.s3Service.getFileMetadata(key);
        } catch (error) {
            console.error('Error getting archive metadata:', error);
            return null;
        }
    }

    async cleanupArchivedRecords(): Promise<void> {
        await this.dbService.query(`
            DELETE FROM test_records
            WHERE id IN (${this.identifiedRecords.map(r => r.id).join(',')})
        `);
    }
} 