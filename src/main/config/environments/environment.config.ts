export interface EnvironmentConfig {
    // Environment Configuration
    readonly environment: string;

    // AWS Configuration
    readonly awsRegion: string;
    readonly s3Bucket: string;
    readonly s3Path: string;

    // SFTP Configuration
    readonly sftpHost: string;
    readonly sftpPort: number;
    readonly sftpUsername: string;
    readonly sftpPrivateKey: string;
    readonly sftpPath: string;

    // PGP Configuration
    readonly pgpPublicKey: string;

    // Expected File Format
    readonly expectedHeaders: string;

    // Service Configuration
    readonly serviceEndpoint: string;
    readonly monitoringEndpoint: string;
    readonly alertEndpoint: string;

    // Methods
    loadTestData(): Promise<{ testRecords: Array<{ phone: string; account: string; timestamp: string }> }>;
    generateOutreachLog(): Promise<string>;
    generateOutreachLogWithData(): Promise<string>;
    generateOutreachLogWithFieldData(fieldType: string): Promise<string>;
    getEnvironment(): string;
} 