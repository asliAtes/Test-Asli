import axios from 'axios';
import { Config } from '../config/config';

interface TestRecord {
    phoneNumber: string;
    message: string;
    channel: string;
    clientId: string;
}

interface TestFile {
    records: TestRecord[];
    id: string;
}

interface ProcessResult {
    success: boolean;
    errors?: string[];
}

export class TreatmentService {
    private config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    async checkHealth(): Promise<{ status: string }> {
        const response = await axios.get(`${this.config.treatmentModuleUrl}/health`);
        return response.data;
    }

    async createTestFile(records: TestRecord[]): Promise<TestFile> {
        const response = await axios.post(`${this.config.treatmentModuleUrl}/test/file`, {
            records
        });
        return response.data;
    }

    async processFile(fileId: string): Promise<{ success: boolean; errors?: string[] }> {
        try {
            const response = await axios.post(`${this.config.treatmentModuleUrl}/process`, { fileId });
            return { success: true, ...response.data };
        } catch (error) {
            return { success: false, errors: [error.message] };
        }
    }

    async uploadFile(file: Buffer, filename: string) {
        const formData = new FormData();
        formData.append('file', new Blob([file]), filename);

        const response = await axios.post(
            `${this.config.treatmentModuleUrl}/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        return response.data;
    }

    async getFileStatus(fileId: string) {
        const response = await axios.get(`${this.config.treatmentModuleUrl}/files/${fileId}/status`);
        return response.data;
    }

    async getFileMetrics(fileId: string) {
        const response = await axios.get(`${this.config.treatmentModuleUrl}/files/${fileId}/metrics`);
        return response.data;
    }
} 