export class MockS3 {
  private uploadedFiles: Map<string, string>;
  private bucketConfig: { bucket: string; prefix: string };

  constructor() {
    this.uploadedFiles = new Map();
    this.bucketConfig = { bucket: '', prefix: '' };
  }

  configureBucket(bucket: string, prefix: string): void {
    this.bucketConfig = { bucket, prefix };
  }

  async send(command: any): Promise<{ success: boolean }> {
    if (command.constructor.name === 'PutObjectCommand') {
      const { Bucket, Key, Body } = command.input;
      this.uploadedFiles.set(`${Bucket}/${Key}`, Body);
      return { success: true };
    }
    throw new Error('Unsupported command');
  }

  getUploadedFile(bucket: string, key: string): string | undefined {
    return this.uploadedFiles.get(`${bucket}/${key}`);
  }

  clearUploads(): void {
    this.uploadedFiles.clear();
  }

  getBucketConfig(): { bucket: string; prefix: string } {
    return this.bucketConfig;
  }
} 