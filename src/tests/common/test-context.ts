export interface RcsTestData {
    phoneNumber: string;
    message: string;
    clientId: string;
    treatmentUserId?: string;
    acctNum?: string;
}

export interface WeeklyReport {
    rcsMetrics: {
        total: number;
        delivered: number;
        pending: number;
        failed: number;
    };
}

export class TestContext {
    testData: RcsTestData;
    messageId: string;
    messageStatus: string;
    rcsSmsSentCount: number;
    weeklyReport: WeeklyReport;

    constructor() {
        this.testData = {
            phoneNumber: '',
            message: '',
            clientId: ''
        };
        this.messageId = '';
        this.messageStatus = '';
        this.rcsSmsSentCount = 0;
        this.weeklyReport = {
            rcsMetrics: {
                total: 0,
                delivered: 0,
                pending: 0,
                failed: 0
            }
        };
    }
} 