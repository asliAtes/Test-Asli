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
exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const fs = __importStar(require("fs"));
class S3Service {
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
            }
        });
        this.bucket = process.env.S3_BUCKET || 'test-archive-bucket';
    }
    async uploadFile(filePath, key) {
        const fileContent = await fs.promises.readFile(filePath);
        const command = new client_s3_1.PutObjectCommand({
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
    async verifyFileExists(key) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: this.bucket,
                Key: key
            });
            await this.client.send(command);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async getFileMetadata(key) {
        const command = new client_s3_1.HeadObjectCommand({
            Bucket: this.bucket,
            Key: key
        });
        const response = await this.client.send(command);
        return response.Metadata || {};
    }
}
exports.S3Service = S3Service;
