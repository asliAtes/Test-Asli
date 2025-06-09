import { EnvironmentConfig } from './environment.config';

export class StagingConfig implements EnvironmentConfig {
    // Environment Configuration
    readonly environment: string = 'staging';

    // AWS Configuration
    readonly awsRegion: string = process.env.STAGING_AWS_REGION || 'us-east-1';
    readonly s3Bucket: string = process.env.STAGING_S3_BUCKET || 'staging-uscc-outreach-logs';
    readonly s3Path: string = 'staging/outreach-logs';

    // SFTP Configuration
    readonly sftpHost: string = process.env.STAGING_SFTP_HOST || 'staging-sftp.uscc.com';
    readonly sftpPort: number = parseInt(process.env.STAGING_SFTP_PORT || '22');
    readonly sftpUsername: string = process.env.STAGING_SFTP_USER || 'staging-outreach-logs';
    readonly sftpPrivateKey: string = process.env.STAGING_SFTP_KEY || '';
    readonly sftpPath: string = process.env.STAGING_SFTP_PATH || '/staging/outreach-logs';

    // PGP Configuration
    readonly pgpPublicKey: string = process.env.STAGING_PGP_KEY || '';

    // Expected File Format
    readonly expectedHeaders: string = 'PHONE_NUMBER,ACCOUNT_ID,TIMESTAMP,MESSAGE_ID,STATUS';

    // Service Configuration
    readonly serviceEndpoint: string = process.env.STAGING_SERVICE_URL || 'https://staging-api.uscc.com/outreach';
    readonly monitoringEndpoint: string = process.env.STAGING_MONITORING_URL || 'https://staging-monitoring.uscc.com';
    readonly alertEndpoint: string = process.env.STAGING_ALERT_URL || 'https://staging-alerts.uscc.com';

    // Load staging test data
    async loadTestData(): Promise<{ testRecords: Array<{ phone: string; account: string; timestamp: string }> }> {
        return {
            testRecords: [
                { phone: '1234567890', account: 'STG001', timestamp: new Date().toISOString() },
                { phone: '0987654321', account: 'STG002', timestamp: new Date().toISOString() }
            ]
        };
    }

    // Generate outreach log for staging
    async generateOutreachLog(): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:\-]/g, '');
        return `STAGING_outreach_log_${timestamp}.csv`;
    }

    // Generate outreach log with staging data
    async generateOutreachLogWithData(): Promise<string> {
        return this.generateOutreachLog();
    }

    // Generate outreach log with specific field data
    async generateOutreachLogWithFieldData(fieldType: string): Promise<string> {
        return this.generateOutreachLog();
    }

    // Helper method to get current environment
    getEnvironment(): string {
        return this.environment;
    }

    // Validate if we're in staging
    isStaging(): boolean {
        return true;
    }
} 