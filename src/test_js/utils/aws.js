"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Helper = exports.S3Helper = exports.S3_CONFIG = exports.usccS3 = exports.tmusS3 = void 0;
const aws_sdk_1 = require("aws-sdk");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Initialize S3 clients with respective credentials
exports.tmusS3 = new aws_sdk_1.S3({
    accessKeyId: process.env.TMUS_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.TMUS_AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.TMUS_AWS_SESSION_TOKEN,
    region: process.env.AWS_REGION || 'us-east-1'
});
exports.usccS3 = new aws_sdk_1.S3({
    accessKeyId: process.env.USCC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.USCC_AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.USCC_AWS_SESSION_TOKEN,
    region: process.env.AWS_REGION || 'us-east-1'
});
// S3 bucket configurations
exports.S3_CONFIG = {
    TMUS: {
        bucket: 'homer-staging-internal',
        prefix: 'tmus-ban-macro-mapping-archives/'
    },
    USCC: {
        bucket: 'kredos-uscellular-staging',
        prefix: 'kredos-uscellular-staging/ban-macro-mapping-archives/'
    }
};
// Implement S3 operations with retry logic
class S3Helper {
    constructor() {
        this.maxRetries = 3;
        this.retryDelay = 2000; // 2 seconds
        // Check if AWS credentials are configured
        this.checkCredentials();
    }
    checkCredentials() {
        const tmsCreds = process.env.TMUS_AWS_ACCESS_KEY_ID && process.env.TMUS_AWS_SECRET_ACCESS_KEY;
        const usccCreds = process.env.USCC_AWS_ACCESS_KEY_ID && process.env.USCC_AWS_SECRET_ACCESS_KEY;
        if (!tmsCreds) {
            console.warn('TMUS AWS credentials not configured');
        }
        if (!usccCreds) {
            console.warn('USCC AWS credentials not configured');
        }
    }
    getS3Client(carrier) {
        return carrier === 'TMUS' ? exports.tmusS3 : exports.usccS3;
    }
    async withRetry(fn) {
        let retries = 0;
        while (retries < this.maxRetries) {
            try {
                return await fn();
            }
            catch (error) {
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
    async uploadFile(filePath, carrier) {
        const s3Client = this.getS3Client(carrier);
        const config = exports.S3_CONFIG[carrier];
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
    async listFiles(carrier) {
        const s3Client = this.getS3Client(carrier);
        const config = exports.S3_CONFIG[carrier];
        return this.withRetry(async () => {
            var _a;
            console.log(`Listing files in s3://${config.bucket}/${config.prefix}`);
            const response = await s3Client.listObjects({
                Bucket: config.bucket,
                Prefix: config.prefix
            }).promise();
            const files = ((_a = response.Contents) === null || _a === void 0 ? void 0 : _a.map(item => item.Key || '')) || [];
            console.log(`Found ${files.length} files`);
            return files;
        });
    }
    async fileExists(key, carrier) {
        const s3Client = this.getS3Client(carrier);
        const config = exports.S3_CONFIG[carrier];
        try {
            console.log(`Checking if s3://${config.bucket}/${key} exists`);
            await s3Client.headObject({
                Bucket: config.bucket,
                Key: key
            }).promise();
            console.log(`File exists: s3://${config.bucket}/${key}`);
            return true;
        }
        catch (error) {
            if (error.code === 'NotFound') {
                console.log(`File does not exist: s3://${config.bucket}/${key}`);
                return false;
            }
            throw error;
        }
    }
    async downloadFile(key, outputPath, carrier) {
        const s3Client = this.getS3Client(carrier);
        const config = exports.S3_CONFIG[carrier];
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
            fs.writeFileSync(outputPath, response.Body);
            console.log(`Successfully downloaded to ${outputPath}`);
            return outputPath;
        });
    }
    async deleteFile(key, carrier) {
        const s3Client = this.getS3Client(carrier);
        const config = exports.S3_CONFIG[carrier];
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
    getContentType(filePath) {
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
exports.S3Helper = S3Helper;
// Export a singleton instance
exports.s3Helper = new S3Helper();
