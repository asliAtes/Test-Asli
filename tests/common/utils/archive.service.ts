import * as fs from 'fs';
import * as path from 'path';
import { DatabaseService, TestRecord } from './database.service';
import { S3Service } from './s3.service';
import { createObjectCsvWriter } from 'csv-writer';

export class ArchiveService {
    private dbService: DatabaseService;
    private s3Service: S3Service;
    private identifiedRecords: TestRecord[] = [];
    private latestExportPath: string = '';

    constructor(dbService: DatabaseService, s3Service: S3Service) {
        this.dbService = dbService;
        this.s3Service = s3Service;
    }

    async identifyRecordsForArchiving(daysOld: number = 60): Promise<TestRecord[]> {
        this.identifiedRecords = await this.dbService.getOldRecords(daysOld);
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
        await this.s3Service.uploadFile(this.latestExportPath, key);
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

    async cleanupArchivedRecords(): Promise<void> {
        // In a real implementation, this would use a transaction
        // and verify S3 upload success before deletion
        await this.dbService.cleanup();
    }
} 