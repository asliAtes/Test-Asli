import axios from 'axios';
import { Config } from '../config/config';

export interface MessageStatus {
    messageId: string;
    status: 'delivered' | 'failed' | 'pending';
    timestamp: string;
    error?: string;
}

export class CommunicationService {
    private config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    async sendMessage(data: {
        phoneNumber: string;
        message: string;
        clientId: string;
        treatmentUserId?: string;
        acctNum?: string;
    }) {
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

        const response = await axios.post(`${this.config.serviceEndpoint}/messages`, payload);
        return response.data;
    }

    async getMessageStatus(messageId: string): Promise<MessageStatus> {
        const response = await axios.get(`${this.config.serviceEndpoint}/messages/${messageId}`);
        return response.data;
    }

    async checkHealth(): Promise<{ status: string }> {
        const response = await axios.get(`${this.config.communicationModuleUrl}/health`);
        return response.data;
    }

    async getOperationalReport(): Promise<any> {
        const response = await axios.get(`${this.config.communicationModuleUrl}/reports/operational`);
        return response.data;
    }

    async getWeeklyReport(): Promise<any> {
        const response = await axios.get(`${this.config.communicationModuleUrl}/reports/weekly`);
        return response.data;
    }
} 