"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockS3 = void 0;
class MockS3 {
    constructor() {
        this.uploadedFiles = new Map();
        this.bucketConfig = { bucket: '', prefix: '' };
    }
    configureBucket(bucket, prefix) {
        this.bucketConfig = { bucket, prefix };
    }
    async send(command) {
        if (command.constructor.name === 'PutObjectCommand') {
            const { Bucket, Key, Body } = command.input;
            this.uploadedFiles.set(`${Bucket}/${Key}`, Body);
            return { success: true };
        }
        throw new Error('Unsupported command');
    }
    getUploadedFile(bucket, key) {
        return this.uploadedFiles.get(`${bucket}/${key}`);
    }
    clearUploads() {
        this.uploadedFiles.clear();
    }
    getBucketConfig() {
        return this.bucketConfig;
    }
}
exports.MockS3 = MockS3;
