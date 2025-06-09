import { promises as fs } from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import * as path from 'path';
import { Config } from '@integration/index';
import { RcsTestFile as TestFile, RcsMessage as Message, RcsMetrics as Metrics, RcsUploadResponse as UploadResponse, RcsDeliveryConfirmation as DeliveryConfirmation } from '../../types/rcs.types';

export interface RcsMetrics {
    total: number;
    delivered: number;
    pending: number;
    failed: number;
    rcsSmsSentCount: number;
}

export interface RcsMessage {
    messageId: string;
    status: 'DELIVERED' | 'PENDING' | 'FAILED';
    rcsSmsSentCount: number;
}

export interface RcsTestData {
    phoneNumber: string;
    message: string;
    clientId: string;
    treatmentUserId?: string;
    acctNum?: string;
}

export interface RcsGraphData {
    timestamp: string;
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
}

export interface RcsGraphOptions {
    startDate?: string;
    endDate?: string;
    interval?: 'hour' | 'day' | 'week' | 'month';
    format?: 'line' | 'bar';
    showPercentage?: boolean;
}

export interface RcsTestFile {
    id: string;
    name: string;
    content: string;
    type: string;
    records?: any[];
}

export class RcsService {
    private config: Config;
    private uploadDir: string;

    constructor(config: Config) {
        this.config = config;
        this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    }

    async createTestFile(testFile: TestFile): Promise<void> {
        const csvContent = this.convertToCsv(testFile.records);
        const filePath = path.join(this.uploadDir, testFile.name);
        await fs.writeFile(filePath, csvContent);
    }

    private convertToCsv(records: any[]): string {
        const headers = Object.keys(records[0]);
        const csvRows = [
            headers.join(','),
            ...records.map(record => 
                headers.map(header => record[header]).join(',')
            )
        ];
        return csvRows.join('\n');
    }

    async uploadTestFile(file: RcsTestFile): Promise<string> {
        // Simulated file upload
        return `upload-${file.id}`;
    }

    async getFileProcessingStatus(fileId: string): Promise<string> {
        const response = await axios.get(
            `${this.config.baseUrl}/file-status/${fileId}`
        );
        return response.data.status;
    }

    async sendTestMessage(data: { phoneNumber: string; message: string; clientId: string }): Promise<RcsMessage> {
        // Simulated message sending
        return {
            messageId: `msg-${Date.now()}`,
            status: 'DELIVERED',
            rcsSmsSentCount: 1
        };
    }

    async getMessageStatus(messageId: string): Promise<string> {
        const response = await axios.get(`${this.config.baseUrl}/message-status/${messageId}`);
        return response.data.status;
    }

    async waitForDeliveryConfirmation(messageId: string): Promise<RcsMessage> {
        // Simulated delivery confirmation
        return {
            messageId,
            status: 'DELIVERED',
            rcsSmsSentCount: 1
        };
    }

    async getMetrics(): Promise<Metrics> {
        const params = {
            startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString()
        };

        const response = await axios.get(`${this.config.baseUrl}/metrics/rcs`, { params });
        return response.data;
    }

    async getHistoricalData(startDate: string, endDate: string): Promise<any> {
        const options = {
            params: {
                startDate,
                endDate
            }
        };

        const response = await axios.post(`${this.config.baseUrl}/test/rcs/historical`, options);
        return response.data;
    }

    async getInfobipMetrics(): Promise<RcsMetrics> {
        // Simulated API response
        return {
            total: 100,
            delivered: 80,
            pending: 5,
            failed: 15,
            rcsSmsSentCount: 100
        };
    }

    async getGraphData(options: { startDate?: string; endDate?: string } = {}): Promise<RcsGraphData[]> {
        // Simulated API response
        return [
            {
                timestamp: '2025-01-01T00:00:00Z',
                sent: 100,
                delivered: 80,
                failed: 15,
                pending: 5
            },
            {
                timestamp: '2025-01-02T00:00:00Z',
                sent: 120,
                delivered: 95,
                failed: 20,
                pending: 5
            }
        ];
    }

    async getDeliveryTrends(): Promise<RcsGraphData[]> {
        // Simulated API response
        return [
            {
                timestamp: '2025-01-01T00:00:00Z',
                sent: 100,
                delivered: 80,
                failed: 15,
                pending: 5
            },
            {
                timestamp: '2025-01-02T00:00:00Z',
                sent: 120,
                delivered: 95,
                failed: 20,
                pending: 5
            },
            {
                timestamp: '2025-01-03T00:00:00Z',
                sent: 90,
                delivered: 75,
                failed: 10,
                pending: 5
            }
        ];
    }

    async getFailureAnalysis() {
        return [
            { category: 'Network Error', count: 50, percentage: 40 },
            { category: 'Invalid Number', count: 30, percentage: 24 },
            { category: 'Timeout', count: 25, percentage: 20 },
            { category: 'Other', count: 20, percentage: 16 }
        ];
    }

    async checkServiceStatus(): Promise<string> {
        const response = await axios.get(`${this.config.baseUrl}/status/rcs`);
        return response.data.status;
    }
} 