import { EnvironmentConfig } from '../environments/environment.config';
import { StagingConfig } from '../environments/staging.config';

export class ConfigHelper {
    private static instance: ConfigHelper;
    private currentConfig: EnvironmentConfig;

    private constructor() {
        // Default to staging config
        this.currentConfig = new StagingConfig();
    }

    public static getInstance(): ConfigHelper {
        if (!ConfigHelper.instance) {
            ConfigHelper.instance = new ConfigHelper();
        }
        return ConfigHelper.instance;
    }

    public getCurrentConfig(): EnvironmentConfig {
        return this.currentConfig;
    }

    public setConfig(config: EnvironmentConfig): void {
        this.currentConfig = config;
    }

    public getEnvironment(): string {
        return this.currentConfig.getEnvironment();
    }

    public async generateOutreachLog(): Promise<string> {
        return this.currentConfig.generateOutreachLog();
    }

    public async loadTestData(): Promise<{ testRecords: Array<{ phone: string; account: string; timestamp: string }> }> {
        return this.currentConfig.loadTestData();
    }

    public getServiceEndpoint(): string {
        return this.currentConfig.serviceEndpoint;
    }

    public getMonitoringEndpoint(): string {
        return this.currentConfig.monitoringEndpoint;
    }

    public getAlertEndpoint(): string {
        return this.currentConfig.alertEndpoint;
    }

    public getS3Config(): { bucket: string; path: string; region: string } {
        return {
            bucket: this.currentConfig.s3Bucket,
            path: this.currentConfig.s3Path,
            region: this.currentConfig.awsRegion
        };
    }

    public getSFTPConfig(): { host: string; port: number; username: string; privateKey: string; path: string } {
        return {
            host: this.currentConfig.sftpHost,
            port: this.currentConfig.sftpPort,
            username: this.currentConfig.sftpUsername,
            privateKey: this.currentConfig.sftpPrivateKey,
            path: this.currentConfig.sftpPath
        };
    }

    public getPGPConfig(): { publicKey: string } {
        return {
            publicKey: this.currentConfig.pgpPublicKey
        };
    }
} 