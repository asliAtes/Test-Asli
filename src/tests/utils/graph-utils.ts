import { RcsGraphData } from '../common/services/rcs/rcs.service';

/**
 * Calculate percentage values for graph data
 */
export function calculatePercentages(data: RcsGraphData): {
    delivered: number;
    failed: number;
    pending: number;
} {
    const total = data.sent;
    if (total === 0) return { delivered: 0, failed: 0, pending: 0 };

    return {
        delivered: (data.delivered / total) * 100,
        failed: (data.failed / total) * 100,
        pending: (data.pending / total) * 100
    };
}

/**
 * Format graph data for display
 */
export function formatGraphData(data: any[], options: { interval: string }) {
    const labels = data.map(item => item.timestamp);
    const datasets = [
        {
            label: 'Sent',
            data: data.map(item => item.sent)
        },
        {
            label: 'Delivered',
            data: data.map(item => item.delivered)
        },
        {
            label: 'Failed',
            data: data.map(item => item.failed)
        },
        {
            label: 'Pending',
            data: data.map(item => item.pending)
        }
    ];

    return { labels, datasets };
}

/**
 * Validate graph data structure
 */
export function validateGraphData(data: any[]) {
    const errors: string[] = [];
    let isValid = true;

    if (!Array.isArray(data)) {
        errors.push('Data must be an array');
        return { isValid: false, errors };
    }

    data.forEach((item, index) => {
        if (!item.timestamp) {
            errors.push(`Missing timestamp at index ${index}`);
            isValid = false;
        }
        if (typeof item.sent !== 'number') {
            errors.push(`Invalid sent value at index ${index}`);
            isValid = false;
        }
        if (typeof item.delivered !== 'number') {
            errors.push(`Invalid delivered value at index ${index}`);
            isValid = false;
        }
        if (typeof item.failed !== 'number') {
            errors.push(`Invalid failed value at index ${index}`);
            isValid = false;
        }
        if (typeof item.pending !== 'number') {
            errors.push(`Invalid pending value at index ${index}`);
            isValid = false;
        }
    });

    return { isValid, errors };
} 