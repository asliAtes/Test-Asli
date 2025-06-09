export interface OutreachLogRecord {
    messageId: string;
    accountNumber: string;
    phoneNumber: string;
    messageText: string;
    sendDate: string;
    status: 'DELIVERED' | 'PENDING' | 'FAILED';
    carrier: string;
    rcsSmsSentCount?: number;
}

export interface OutreachLogFile {
    name: string;
    content: string;
    records: OutreachLogRecord[];
    headers: string[];
}

export interface DeliveryStatus {
    fileName: string;
    sftpDelivered: boolean;
    s3Uploaded: boolean;
    timestamp: string;
    encrypted: boolean;
}

export interface OutreachLogContext {
    currentFile?: OutreachLogFile;
    deliveryStatus?: DeliveryStatus;
    testData?: OutreachLogRecord[];
}

export interface TestContext {
    currentFile?: {
        name: string;
        content: string;
    };
    generatedFile?: {
        name: string;
        content: string;
    };
    fileLines?: string[];
    logId?: string;
    logData?: any;
} 