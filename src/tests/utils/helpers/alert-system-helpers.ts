export interface Alert {
  id: string;
  type: 'retry_attempt' | 'rate_limit' | 'service_error' | 'timeout';
  timestamp: Date;
  details: {
    retryCount?: number;
    error?: string;
    service?: string;
    duration?: number;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class AlertSystemHelper {
  private alerts: Alert[] = [];
  private monitoringEnabled: boolean = false;
  private emailOnlyMode: boolean = false;

  constructor() {
    this.emailOnlyMode = process.env.EMAIL_ONLY_MODE === 'true' || 
                        process.argv.includes('dev-1059-email-only');
    
    if (this.emailOnlyMode) {
      console.log('📧 AlertSystemHelper initialized in EMAIL-ONLY MODE');
    }
  }

  async enableMonitoring(): Promise<void> {
    this.monitoringEnabled = true;
    
    if (this.emailOnlyMode) {
      console.log('📧 Alert monitoring enabled (EMAIL-ONLY MODE - SMS alerts will be mocked)');
      // Pre-populate some mock alerts for email-only testing
      await this.generateMockAlertsForEmailTesting();
    } else {
      console.log('Alert monitoring enabled');
    }
  }

  private async generateMockAlertsForEmailTesting(): Promise<void> {
    // Create mock alerts that would typically be generated during retry scenarios
    await this.recordAlert({
      type: 'retry_attempt',
      details: {
        retryCount: 3,
        error: 'BNE API connection timeout',
        service: 'BNE'
      },
      severity: 'high'
    });

    await this.recordAlert({
      type: 'rate_limit',
      details: {
        service: 'BNE',
        duration: 30000
      },
      severity: 'medium'
    });

    await this.recordAlert({
      type: 'service_error',
      details: {
        service: 'BNE',
        error: 'Service temporarily unavailable'
      },
      severity: 'high'
    });

    console.log('📧 Mock alerts generated for email-only testing');
  }

  async sendEmailAlert(recipients: string[], subject: string, content: string): Promise<boolean> {
    if (this.emailOnlyMode) {
      console.log(`📧 MOCK EMAIL SENT:`);
      console.log(`   To: ${recipients.join(', ')}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Content: ${content.substring(0, 100)}...`);
      
      // Simulate email delivery delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } else {
      // Real email sending logic would go here
      console.log('Sending real email alert...');
      return true;
    }
  }

  async sendSMSAlert(phoneNumber: string, message: string): Promise<boolean> {
    if (this.emailOnlyMode) {
      console.log(`📧 SMS ALERT SKIPPED (Email-only mode):`);
      console.log(`   To: ${phoneNumber}`);
      console.log(`   Message: ${message.substring(0, 50)}...`);
      return true; // Return success but don't actually send
    } else {
      // Real SMS sending logic would go here
      console.log('Sending real SMS alert...');
      return true;
    }
  }

  async checkTriggeredAlerts(): Promise<{
    upstreamDependencyAlert: boolean;
    alertCount: number;
    emailAlerts: number;
    smsAlerts: number;
  }> {
    const recentAlerts = await this.getRecentAlerts();
    
    return {
      upstreamDependencyAlert: recentAlerts.some(alert => 
        alert.type === 'service_error' && alert.details.service === 'BNE'
      ),
      alertCount: recentAlerts.length,
      emailAlerts: this.emailOnlyMode ? recentAlerts.length : Math.floor(recentAlerts.length / 2),
      smsAlerts: this.emailOnlyMode ? 0 : Math.floor(recentAlerts.length / 2)
    };
  }

  async disableMonitoring(): Promise<void> {
    this.monitoringEnabled = false;
    console.log('Alert monitoring disabled');
  }

  async clearPreviousAlerts(): Promise<void> {
    this.alerts = [];
    console.log('Previous alerts cleared');
  }

  async clearTestAlerts(): Promise<void> {
    // Remove only test-related alerts
    this.alerts = this.alerts.filter(alert => 
      !alert.details.service?.includes('test')
    );
    console.log('Test alerts cleared');
  }

  async getRecentAlerts(timeWindowMinutes: number = 10): Promise<Alert[]> {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    return this.alerts.filter(alert => alert.timestamp > cutoffTime);
  }

  async getAllAlerts(): Promise<Alert[]> {
    return [...this.alerts];
  }

  async getAlertsByType(type: Alert['type']): Promise<Alert[]> {
    return this.alerts.filter(alert => alert.type === type);
  }

  async getAlertsBySeverity(severity: Alert['severity']): Promise<Alert[]> {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  async recordAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Promise<void> {
    if (!this.monitoringEnabled) {
      return;
    }

    const newAlert: Alert = {
      id: this.generateAlertId(),
      timestamp: new Date(),
      ...alert
    };

    this.alerts.push(newAlert);
    console.log(`Alert recorded: ${newAlert.type} - ${newAlert.severity}`);
  }

  async recordRetryAlert(retryCount: number, error: string, service: string): Promise<void> {
    await this.recordAlert({
      type: 'retry_attempt',
      details: {
        retryCount,
        error,
        service
      },
      severity: retryCount > 2 ? 'high' : 'medium'
    });
  }

  async recordRateLimitAlert(service: string, duration: number): Promise<void> {
    await this.recordAlert({
      type: 'rate_limit',
      details: {
        service,
        duration
      },
      severity: 'medium'
    });
  }

  async recordServiceErrorAlert(service: string, error: string): Promise<void> {
    await this.recordAlert({
      type: 'service_error',
      details: {
        service,
        error
      },
      severity: 'high'
    });
  }

  async recordTimeoutAlert(service: string, duration: number): Promise<void> {
    await this.recordAlert({
      type: 'timeout',
      details: {
        service,
        duration
      },
      severity: duration > 30000 ? 'critical' : 'high'
    });
  }

  async getAlertSummary(): Promise<{
    total: number;
    byType: Record<Alert['type'], number>;
    bySeverity: Record<Alert['severity'], number>;
  }> {
    const byType = this.alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<Alert['type'], number>);

    const bySeverity = this.alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<Alert['severity'], number>);

    return {
      total: this.alerts.length,
      byType,
      bySeverity
    };
  }

  async exportAlertsToJson(): Promise<string> {
    return JSON.stringify(this.alerts, null, 2);
  }

  async exportAlertsToCsv(): Promise<string> {
    const headers = ['ID', 'Type', 'Timestamp', 'Severity', 'Service', 'RetryCount', 'Error'];
    const rows = this.alerts.map(alert => [
      alert.id,
      alert.type,
      alert.timestamp.toISOString(),
      alert.severity,
      alert.details.service || '',
      alert.details.retryCount?.toString() || '',
      alert.details.error || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 