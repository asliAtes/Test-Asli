import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { OutreachLogFile } from '../../../../common/types/outreach.types';
import { Readable } from 'stream';

export class OutreachS3Service {
    private s3Client: S3Client;
    private readonly bucketName = 'kredos-uscellular-production';
    private readonly prefix = 'Temporary-Files/';

    constructor() {
        this.s3Client = new S3Client({ region: 'us-east-2' });
    }

    async listOutreachLogs(startDate?: Date, endDate?: Date): Promise<string[]> {
        try {
            const command = new ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: this.prefix
            });

            const response = await this.s3Client.send(command);
            const files = response.Contents || [];

            return files
                .filter(file => {
                    if (!file.Key?.endsWith('.csv')) return false;
                    if (!file.Key.includes('KAI_Kredos_outreach_log_')) return false;

                    // Extract date from filename
                    const dateMatch = file.Key.match(/KAI_Kredos_outreach_log_(\d{14})\.csv/);
                    if (!dateMatch) return false;

                    const fileDate = new Date(
                        parseInt(dateMatch[1].substring(0, 4)),  // year
                        parseInt(dateMatch[1].substring(4, 6)) - 1,  // month (0-based)
                        parseInt(dateMatch[1].substring(6, 8)),  // day
                        parseInt(dateMatch[1].substring(8, 10)),  // hour
                        parseInt(dateMatch[1].substring(10, 12)),  // minute
                        parseInt(dateMatch[1].substring(12, 14))   // second
                    );

                    if (startDate && fileDate < startDate) return false;
                    if (endDate && fileDate > endDate) return false;

                    return true;
                })
                .map(file => file.Key!)
                .sort();
        } catch (error) {
            console.error('Error listing outreach logs:', error);
            throw error;
        }
    }

    async getOutreachLog(key: string): Promise<OutreachLogFile> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });

            const response = await this.s3Client.send(command);
            const stream = response.Body as Readable;
            const chunks: Buffer[] = [];

            return new Promise((resolve, reject) => {
                stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
                stream.on('error', (err) => reject(err));
                stream.on('end', () => {
                    const content = Buffer.concat(chunks).toString('utf-8');
                    const fileName = key.split('/').pop() || '';
                    resolve({
                        name: fileName,
                        content: content,
                        path: key
                    });
                });
            });
        } catch (error) {
            console.error('Error getting outreach log:', error);
            throw error;
        }
    }

    async getLatestOutreachLog(): Promise<OutreachLogFile | null> {
        const files = await this.listOutreachLogs();
        if (files.length === 0) return null;
        
        const latestFile = files[files.length - 1];
        return this.getOutreachLog(latestFile);
    }

    async getOutreachLogsByDateRange(startDate: Date, endDate: Date): Promise<OutreachLogFile[]> {
        const files = await this.listOutreachLogs(startDate, endDate);
        return Promise.all(files.map(file => this.getOutreachLog(file)));
    }
} 