import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';

export class S3Service {
    private client: S3Client;
    private bucket: string;

    constructor() {
        this.client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
            }
        });
        this.bucket = process.env.S3_BUCKET || 'test-archive-bucket';
    }

    async uploadFile(filePath: string, key: string): Promise<void> {
        const fileContent = await fs.promises.readFile(filePath);
        
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: fileContent,
            ContentType: 'text/csv',
            Metadata: {
                'archive-date': new Date().toISOString()
            }
        });

        await this.client.send(command);
    }

    async verifyFileExists(key: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucket,
                Key: key
            });
            await this.client.send(command);
            return true;
        } catch (error) {
            return false;
        }
    }

    async getFileMetadata(key: string): Promise<Record<string, string>> {
        const command = new HeadObjectCommand({
            Bucket: this.bucket,
            Key: key
        });
        const response = await this.client.send(command);
        return response.Metadata || {};
    }
} 