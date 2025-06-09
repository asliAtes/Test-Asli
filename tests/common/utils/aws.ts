import { S3 } from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';

// Initialize S3 clients with respective credentials
export const tmusS3 = new S3({
    accessKeyId: process.env.TMUS_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.TMUS_AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.TMUS_AWS_SESSION_TOKEN,
    region: process.env.AWS_REGION || 'us-east-1'
});

export const usccS3 = new S3({
    accessKeyId: process.env.USCC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.USCC_AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.USCC_AWS_SESSION_TOKEN,
    region: process.env.AWS_REGION || 'us-east-1'
});

// S3 bucket configurations
export const S3_CONFIG = {
    TMUS: {
        bucket: 'homer-staging-internal',
        prefix: 'tmus-ban-macro-mapping-archives/'
    },
    USCC: {
        bucket: 'kredos-uscellular-staging',
        prefix: 'kredos-uscellular-staging/ban-macro-mapping-archives/'
    }
};

// Interface for S3 operations
export interface S3Operations {
    uploadFile(filePath: string, carrier: 'TMUS' | 'USCC'): Promise<string>;
    listFiles(carrier: 'TMUS' | 'USCC'): Promise<string[]>;
    fileExists(key: string, carrier: 'TMUS' | 'USCC'): Promise<boolean>;
    downloadFile(key: string, outputPath: string, carrier: 'TMUS' | 'USCC'): Promise<string>;
    deleteFile(key: string, carrier: 'TMUS' | 'USCC'): Promise<boolean>;
}

// Implement S3 operations with retry logic
export class S3Helper implements S3Operations {
    private maxRetries: number = 3;
    private retryDelay: number = 2000; // 2 seconds
    
    constructor() {
        // Check if AWS credentials are configured
        this.checkCredentials();
    }
    
    private checkCredentials(): void {
        const tmsCreds = process.env.TMUS_AWS_ACCESS_KEY_ID && process.env.TMUS_AWS_SECRET_ACCESS_KEY;
        const usccCreds = process.env.USCC_AWS_ACCESS_KEY_ID && process.env.USCC_AWS_SECRET_ACCESS_KEY;
        
        if (!tmsCreds) {
            console.warn('TMUS AWS credentials not configured');
        }
        
        if (!usccCreds) {
            console.warn('USCC AWS credentials not configured');
        }
    }
    
    private getS3Client(carrier: 'TMUS' | 'USCC'): S3 {
        return carrier === 'TMUS' ? tmusS3 : usccS3;
    }
    
    private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
        let retries = 0;
        
        while (retries < this.maxRetries) {
            try {
                return await fn();
            } catch (error) {
                retries++;
                console.error(`S3 operation failed (attempt ${retries}/${this.maxRetries}):`, error);
                
                if (retries >= this.maxRetries) {
                    throw error;
                }
                
                console.log(`Retrying in ${this.retryDelay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            }
        }
        
        throw new Error('Maximum retry attempts reached');
    }
    
    async uploadFile(filePath: string, carrier: 'TMUS' | 'USCC'): Promise<string> {
        const s3Client = this.getS3Client(carrier);
        const config = S3_CONFIG[carrier];
        const fileName = path.basename(filePath);
        const key = `${config.prefix}${fileName}`;
        
        return this.withRetry(async () => {
            console.log(`Uploading ${filePath} to s3://${config.bucket}/${key}`);
            
            await s3Client.putObject({
                Bucket: config.bucket,
                Key: key,
                Body: fs.readFileSync(filePath),
                ContentType: this.getContentType(filePath),
                Metadata: {
                    'upload-date': new Date().toISOString(),
                    'source': 'kredos-automation-test'
                }
            }).promise();
            
            console.log(`Successfully uploaded to s3://${config.bucket}/${key}`);
            return `s3://${config.bucket}/${key}`;
        });
    }
    
    async listFiles(carrier: 'TMUS' | 'USCC'): Promise<string[]> {
        const s3Client = this.getS3Client(carrier);
        const config = S3_CONFIG[carrier];
        
        return this.withRetry(async () => {
            console.log(`Listing files in s3://${config.bucket}/${config.prefix}`);
            
            const response = await s3Client.listObjects({
                Bucket: config.bucket,
                Prefix: config.prefix
            }).promise();
            
            const files = response.Contents?.map(item => item.Key || '') || [];
            console.log(`Found ${files.length} files`);
            return files;
        });
    }
    
    async fileExists(key: string, carrier: 'TMUS' | 'USCC'): Promise<boolean> {
        const s3Client = this.getS3Client(carrier);
        const config = S3_CONFIG[carrier];
        
        try {
            console.log(`Checking if s3://${config.bucket}/${key} exists`);
            
            await s3Client.headObject({
                Bucket: config.bucket,
                Key: key
            }).promise();
            
            console.log(`File exists: s3://${config.bucket}/${key}`);
            return true;
        } catch (error) {
            if (error.code === 'NotFound') {
                console.log(`File does not exist: s3://${config.bucket}/${key}`);
                return false;
            }
            throw error;
        }
    }
    
    async downloadFile(key: string, outputPath: string, carrier: 'TMUS' | 'USCC'): Promise<string> {
        const s3Client = this.getS3Client(carrier);
        const config = S3_CONFIG[carrier];
        
        return this.withRetry(async () => {
            console.log(`Downloading s3://${config.bucket}/${key} to ${outputPath}`);
            
            const response = await s3Client.getObject({
                Bucket: config.bucket,
                Key: key
            }).promise();
            
            // Create directory if it doesn't exist
            const dir = path.dirname(outputPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(outputPath, response.Body as Buffer);
            console.log(`Successfully downloaded to ${outputPath}`);
            return outputPath;
        });
    }
    
    async deleteFile(key: string, carrier: 'TMUS' | 'USCC'): Promise<boolean> {
        const s3Client = this.getS3Client(carrier);
        const config = S3_CONFIG[carrier];
        
        return this.withRetry(async () => {
            console.log(`Deleting s3://${config.bucket}/${key}`);
            
            await s3Client.deleteObject({
                Bucket: config.bucket,
                Key: key
            }).promise();
            
            console.log(`Successfully deleted s3://${config.bucket}/${key}`);
            return true;
        });
    }
    
    private getContentType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        
        switch (ext) {
            case '.csv':
                return 'text/csv';
            case '.json':
                return 'application/json';
            case '.txt':
                return 'text/plain';
            default:
                return 'application/octet-stream';
        }
    }
}

// Export a singleton instance
export const s3Helper = new S3Helper(); 