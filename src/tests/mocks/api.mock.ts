export interface ApiResponse {
    chartdata: {
        total: number;
        delivered: number;
        pending: number;
        undelivered: number;
        carrierError: number;
        unreachable: number;
        changed: number;
    };
    cumulativedata: {
        [key: string]: {
            total: number;
            delivered: number;
            pending: number;
            undelivered: number;
            carrierError: number;
            unreachable: number;
            changed: number;
        };
    };
    rcsSmsSentCount: number;
}

export class MockApiService {
    private static instance: MockApiService;

    private constructor() {}

    public static getInstance(): MockApiService {
        if (!MockApiService.instance) {
            MockApiService.instance = new MockApiService();
        }
        return MockApiService.instance;
    }

    public async callApi(endpoint: string, params: any): Promise<ApiResponse> {
        const chartdata = {
            total: 2,
            delivered: 2,
            pending: 0,
            undelivered: 0,
            carrierError: 0,
            unreachable: 0,
            changed: 0
        };

        const response: ApiResponse = {
            chartdata,
            cumulativedata: {},
            rcsSmsSentCount: 2
        };

        response.cumulativedata[params.startDate] = chartdata;

        return response;
    }
}

export const mockApi = MockApiService.getInstance(); 

// RCS Report API Mocks
export const rcsReportMocks = {
    dailyReport: {
        success: {
            status: 'success',
            data: {
                chartdata: {
                    total: 10,
                    delivered: 8,
                    pending: 1,
                    failed: 1,
                    rcsSmsSentCount: 10
                },
                cumulativedata: {
                    '2025-05-23': {
                        total: 10,
                        delivered: 8,
                        pending: 1,
                        failed: 1,
                        rcsSmsSentCount: 10
                    }
                }
            }
        },
        empty: {
            status: 'success',
            data: {
                chartdata: {
                    total: 0,
                    delivered: 0,
                    pending: 0,
                    failed: 0,
                    rcsSmsSentCount: 0
                },
                cumulativedata: {}
            }
        },
        error: {
            status: 'error',
            error: {
                code: 'INVALID_DATE_RANGE',
                message: 'Invalid date range provided'
            }
        }
    },
    weeklyReport: {
        success: {
            status: 'success',
            data: {
                chartdata: {
                    total: 50,
                    delivered: 45,
                    pending: 3,
                    failed: 2,
                    rcsSmsSentCount: 50
                },
                weeklyTrend: {
                    '2025-W21': {
                        total: 30,
                        delivered: 28,
                        pending: 1,
                        failed: 1,
                        rcsSmsSentCount: 30
                    },
                    '2025-W22': {
                        total: 20,
                        delivered: 17,
                        pending: 2,
                        failed: 1,
                        rcsSmsSentCount: 20
                    }
                }
            }
        },
        empty: {
            status: 'success',
            data: {
                chartdata: {
                    total: 0,
                    delivered: 0,
                    pending: 0,
                    failed: 0,
                    rcsSmsSentCount: 0
                },
                weeklyTrend: {}
            }
        }
    }
}; 