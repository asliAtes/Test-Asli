import axios from 'axios';

export interface Config {
    baseUrl: string;
    username: string;
    password: string;
    serviceEndpoint: string;
    treatmentModuleUrl: string;
    communicationModuleUrl: string;
    database: {
        host: string;
        port: number;
        name: string;
        username: string;
        password: string;
    };
}

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
    status: 'delivered' | 'failed' | 'pending';
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
} 