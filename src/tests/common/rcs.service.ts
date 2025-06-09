import axios from 'axios';
import { Config } from '@integration/index';

export interface RcsMetrics {
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
}

export interface RcsMessage {
    messageId: string;
    to: string;
    message: string;
    status: 'DELIVERED' | 'PENDING' | 'FAILED';
    timestamp: string;
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
}

export class RcsService {
    private config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    async getMetrics(startDate?: string, endDate?: string): Promise<RcsMetrics> {
        const params = {};
        if (startDate) params['startDate'] = startDate;
        if (endDate) params['endDate'] = endDate;

        const response = await axios.get(`${this.config.serviceEndpoint}/metrics/rcs`, { params });
        return response.data;
    }

    async sendTestMessage(data: RcsTestData): Promise<RcsMessage> {
        const payload = {
            carrier: 'INFOBIP_RCS',
            schedule: false,
            smsRequestList: [{
                toNumber: data.phoneNumber,
                message: data.message,
                treatmentUserId: data.treatmentUserId || data.clientId,
                clientName: 'TEST',
                acctNum: data.acctNum || data.clientId
            }]
        };

        const response = await axios.post(`${this.config.serviceEndpoint}/messages/rcs`, payload);
        return response.data;
    }

    async getMessageStatus(messageId: string): Promise<RcsMessage> {
        const response = await axios.get(`${this.config.serviceEndpoint}/messages/rcs/${messageId}`);
        return response.data;
    }

    async generateHistoricalData(options: {
        startDate: Date;
        endDate: Date;
        recordsPerDay: number;
    }): Promise<RcsMessage[]> {
        const response = await axios.post(`${this.config.serviceEndpoint}/test/rcs/historical`, options);
        return response.data;
    }

    async uploadTestFile(file: RcsTestFile): Promise<string> {
        const formData = new FormData();
        formData.append('file', new Blob([file.content], { type: file.type }), file.name);

        const response = await axios.post(`${this.config.serviceEndpoint}/test/rcs/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.id;
    }

    async waitForDeliveryConfirmation(messageId: string, timeout: number = 30000): Promise<RcsMessage> {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const message = await this.getMessageStatus(messageId);
            if (message.status === 'DELIVERED' || message.status === 'FAILED') {
                return message;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        throw new Error(`Message ${messageId} did not receive delivery confirmation within ${timeout}ms`);
    }

    async getInfobipMetrics(): Promise<RcsMetrics> {
        const response = await axios.get(`${this.config.serviceEndpoint}/metrics/infobip/rcs`);
        return response.data;
    }

    // New methods for DEV-1044
    async getGraphData(options: { startDate?: string; endDate?: string } = {}) {
        // Simulated API response
        return [
            {
                timestamp: '2025-01-01T00:00:00Z',
                sent: 100,
                delivered: 80,
                failed: 15,
                pending: 5
            },
            // Add more sample data as needed
        ];
    }

    async getDeliveryTrends() {
        return this.getGraphData();
    }

    async getFailureAnalysis() {
        return [
            { category: 'Network Error', count: 50, percentage: 40 },
            { category: 'Invalid Number', count: 30, percentage: 24 },
            { category: 'Timeout', count: 25, percentage: 20 },
            { category: 'Other', count: 20, percentage: 16 }
        ];
    }

    async checkFileProcessingStatus(fileId: string): Promise<string> {
        const response = await axios.get(`${this.config.serviceEndpoint}/test/rcs/status/${fileId}`);
        return response.data.status;
    }

    async getSentMessages(fileId: string): Promise<RcsMessage[]> {
        const response = await axios.get(`${this.config.serviceEndpoint}/test/rcs/messages/${fileId}`);
        return response.data;
    }

    async getDeliveryConfirmations(fileId: string): Promise<any[]> {
        const response = await axios.get(`${this.config.serviceEndpoint}/test/rcs/confirmations/${fileId}`);
        return response.data;
    }
} 