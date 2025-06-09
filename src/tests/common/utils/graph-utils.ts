export interface GraphDataPoint {
    timestamp: string;
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface FormattedGraphData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
    }>;
}

export function validateGraphData(data: GraphDataPoint[]): ValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
        errors.push('Data must be an array');
        return { isValid: false, errors };
    }

    data.forEach((point, index) => {
        if (!point.timestamp) {
            errors.push(`Missing timestamp at index ${index}`);
        }
        if (typeof point.sent !== 'number') {
            errors.push(`Invalid sent value at index ${index}`);
        }
        if (typeof point.delivered !== 'number') {
            errors.push(`Invalid delivered value at index ${index}`);
        }
        if (typeof point.failed !== 'number') {
            errors.push(`Invalid failed value at index ${index}`);
        }
        if (typeof point.pending !== 'number') {
            errors.push(`Invalid pending value at index ${index}`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors
    };
}

export interface GraphFormatOptions {
    interval?: 'hour' | 'day' | 'week' | 'month';
}

export function formatGraphData(data: GraphDataPoint[], options: GraphFormatOptions = { interval: 'day' }): FormattedGraphData {
    const labels = data.map(point => {
        const date = new Date(point.timestamp);
        switch (options.interval) {
            case 'hour':
                return date.toLocaleString('en-US', { hour: 'numeric', hour12: true });
            case 'week':
                return date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
            case 'month':
                return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
            case 'day':
            default:
                return date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
        }
    });

    return {
        labels,
        datasets: [
            {
                label: 'Sent',
                data: data.map(point => point.sent)
            },
            {
                label: 'Delivered',
                data: data.map(point => point.delivered)
            },
            {
                label: 'Failed',
                data: data.map(point => point.failed)
            },
            {
                label: 'Pending',
                data: data.map(point => point.pending)
            }
        ]
    };
} 