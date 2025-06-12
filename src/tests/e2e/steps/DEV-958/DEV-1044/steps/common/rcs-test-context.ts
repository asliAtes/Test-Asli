import { ApiService } from '../../../../../../common/services/api.service';
import { DatabaseService } from '../../../../../../common/services/database.service';
import { UIService } from '../../../../../../common/services/ui.service';

export interface RcsMetrics {
    total: number;
    delivered: number;
    pending: number;
    failed: number;
    rcsSmsSentCount: number;
}

export interface RcsTestContext {
    services?: {
        api?: ApiService;
        db?: DatabaseService;
        ui?: UIService;
    };
    testData?: {
        messageIds?: string[];
        expectedMetrics?: RcsMetrics;
        startDate?: string;
        endDate?: string;
    };
    responses?: {
        api?: any;
        ui?: any;
        db?: any;
    };
}

// Selector constants for UI tests
export const RCS_SELECTORS = {
    REPORTS: {
        OPERATIONAL: {
            PAGE: '/reports/operational',
            RCS_SECTION: '[data-testid="rcs-section"]',
            RCS_COUNT: '[data-testid="rcs-sms-count"]',
            RCS_SMS_COUNT: '[data-testid="rcs-sms-count"]',
            DATE_PICKER: '[data-testid="date-picker"]',
            APPLY_FILTER: '[data-testid="apply-filter"]',
            DELIVERY_CHART: '[data-testid="delivery-status-chart"]'
        },
        WEEKLY: {
            PAGE: '[data-testid="weekly-reports-page"]',
            TREND_CHART: '[data-testid="weekly-trend-chart"]'
        },
        CHARTS: {
            CONTAINER: '[data-testid="charts-container"]',
            LINE_CHART: '[data-testid="line-chart"]',
            PIE_CHART: '[data-testid="pie-chart"]',
            TOGGLE_VIEW: '[data-testid="chart-view-toggle"]'
        },
        EXPORT: {
            BUTTON: '[data-testid="export-btn"]',
            FORMAT_SELECT: '[data-testid="export-format-select"]'
        }
    }
}; 