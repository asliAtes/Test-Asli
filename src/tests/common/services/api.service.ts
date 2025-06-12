import axios from 'axios';
import { Config } from '@integration/index';
import { RcsMetrics } from '../types/rcs.types';

export class ApiService {
    private config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    async checkServiceStatus(service: string): Promise<string> {
        const response = await axios.get(`${this.config.baseUrl}/status/${service}`);
            return response.data.status;
    }

    async getMabOperationalReportData() {
        const response = await axios.get(`${this.config.baseUrl}/mab-operational-report`);
        return response.data;
    }

    async getMabReportsData() {
        const response = await axios.get(`${this.config.baseUrl}/mab-reports`);
        return response.data;
    }

    async getOperationalMetrics(): Promise<any> {
        const response = await axios.get(`${this.config.baseUrl}/metrics/operational`);
        return response.data;
    }

    async getWeeklyMetrics(): Promise<any> {
        const response = await axios.get(`${this.config.baseUrl}/metrics/weekly`);
        return response.data;
    }

    async callApi(endpoint: string, params: any): Promise<any> {
        const response = await axios.get(`${this.config.baseUrl}/${endpoint}`, { params });
        return response.data;
    }

    async checkCommunicationModuleStatus() {
        const response = await axios.get(`${this.config.communicationModuleUrl}/status`);
        return response.data;
    }

    async login() {
        const response = await axios.post(`${this.config.baseUrl}/auth/login`, {
            username: this.config.username,
            password: this.config.password
        });
        return response.data;
    }
} 