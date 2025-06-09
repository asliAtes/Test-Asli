import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { promises as fs } from 'fs';
import { Config } from '../common/config/config';

export class S3Service {
    private s3Client: S3Client;

    constructor(private config: Config) {
        this.s3Client = new S3Client({
            region: config.s3.region
        });
    }

    async uploadFile(filePath: string, s3Key: string): Promise<void> {
        const fileContent = await fs.readFile(filePath);
        
        await this.s3Client.send(new PutObjectCommand({
            Bucket: this.config.s3.bucket,
            Key: s3Key,
            Body: fileContent
        }));
    }

    async fileExists(s3Key: string): Promise<boolean> {
        try {
            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.config.s3.bucket,
                Key: s3Key
            }));
            return true;
        } catch (error) {
            return false;
        }
    }
} 