import { defaultConfig } from '../common/config';

export interface TestContext {
    testData?: any[];
    generatedFile?: {
        name: string;
        content: string;
        path: string;
    };
    processedFile?: {
        name: string;
        content: string;
        path: string;
    };
    currentFile?: {
        name: string;
        content: string;
        path: string;
    };
    deliveryStatus?: {
        encrypted: boolean;
        sftpDelivered: boolean;
        s3Uploaded: boolean;
    };
}

export function createTestContext(): TestContext {
    return {};
} 