export interface RcsMetrics {
    total: number;
    delivered: number;
    pending: number;
    undelivered: number;
}

export interface RcsTestFile {
    name: string;
    records: any[];
}

export interface RcsTestRecord {
    phone_number: string;
    message_text: string;
    client_id: string;
    treatment_user_id: string;
}

export interface RcsUploadResponse {
    status: string;
    fileId: string;
}

export interface RcsMessage {
    messageId: string;
    status: 'DELIVERED' | 'PENDING' | 'FAILED';
    timestamp: string;
}

export interface RcsDeliveryConfirmation {
    messageId: string;
    status: string;
    timestamp: string;
}

export interface ApiResponse {
    chartdata: {
        total: number;
        delivered: number;
        pending: number;
        undelivered: number;
    };
    cumulativedata: any;
    rcsSmsSentCount?: number;
}

export interface TestContext {
    testFile?: RcsTestFile;
    uploadResponse?: { 
        fileId: string; 
        status: string; 
    };
    messageResponses?: RcsMessage[];
    apiResponse?: any;
    metrics: {
        database?: RcsMetrics;
        operational?: RcsMetrics;
        weekly?: RcsMetrics;
        ui?: RcsMetrics;
        infobip?: RcsMetrics;
    };
    uiService?: any;
} 