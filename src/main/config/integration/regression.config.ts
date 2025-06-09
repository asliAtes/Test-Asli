module.exports = {
    suites: {
        'full-regression': ['@regression'],
        'rcs-regression': ['@regression', '@rcs'],
        'active-only': ['@active'],
        'critical-path': ['@regression', '@critical'],
        'api-regression': ['@regression', '@api'],
        'ui-regression': ['@regression', '@ui']
    },
    priorities: {
        high: ['@critical', '@p1'],
        medium: ['@p2'],
        low: ['@p3']
    },
    modules: {
        rcs: ['@rcs'],
        email: ['@email'],
        sms: ['@sms']
    }
}; 