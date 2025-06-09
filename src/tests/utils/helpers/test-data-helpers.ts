export interface TestMessage {
  to: string;
  message: string;
  priority?: 'high' | 'medium' | 'low';
  messageType?: 'sms' | 'mms';
}

export interface BulkMessageData {
  messages: TestMessage[];
  batchId: string;
  priority: 'high' | 'medium' | 'low';
  sendTime?: Date;
}

export class TestDataHelper {
  private testPhoneNumbers: string[] = [];
  
  // SMS Budget Management
  private static SMS_BUDGET = 10;
  private static smsUsed = 0;

  constructor() {
    this.testPhoneNumbers = [
      '+17472920712', // Working test number provided by user
      '+12144352325', // T-Mobile test number
      '+1234567890',  // Generic test number
      '+1234567891',  // Another test number
      '+1555123456'   // Additional test number
    ];
  }

  // SMS Budget Validation - FIXED: Check before, increment after success
  validateSMSBudgetAvailable(messageCount: number): boolean {
    if (TestDataHelper.smsUsed + messageCount > TestDataHelper.SMS_BUDGET) {
      throw new Error(`SMS Budget would be exceeded: ${TestDataHelper.smsUsed + messageCount}/${TestDataHelper.SMS_BUDGET} messages. Use email-only mode for high-volume tests.`);
    }
    console.log(`📊 SMS Budget check: ${messageCount} messages requested, ${TestDataHelper.SMS_BUDGET - TestDataHelper.smsUsed} remaining`);
    return true;
  }

  // NEW: Only increment after successful sending
  incrementSMSBudget(messageCount: number): void {
    TestDataHelper.smsUsed += messageCount;
    console.log(`📱 SMS Budget: ${TestDataHelper.smsUsed}/${TestDataHelper.SMS_BUDGET} messages used (after successful send)`);
  }

  // DEPRECATED: Remove this method - it was causing the logic error
  validateSMSBudget(messageCount: number): boolean {
    // This method is deprecated - use validateSMSBudgetAvailable + incrementSMSBudget instead
    console.warn(`⚠️ DEPRECATED: validateSMSBudget should be replaced with validateSMSBudgetAvailable + incrementSMSBudget`);
    return this.validateSMSBudgetAvailable(messageCount);
  }

  static resetSMSBudget(): void {
    TestDataHelper.smsUsed = 0;
    console.log(`🔄 SMS Budget reset: 0/${TestDataHelper.SMS_BUDGET} messages`);
  }

  static getCurrentSMSUsage(): { used: number; budget: number; remaining: number } {
    return {
      used: TestDataHelper.smsUsed,
      budget: TestDataHelper.SMS_BUDGET,
      remaining: TestDataHelper.SMS_BUDGET - TestDataHelper.smsUsed
    };
  }

  async getValidTestNumbers(): Promise<string[]> {
    return [...this.testPhoneNumbers];
  }

  async verifyTestNumber(phoneNumber: string): Promise<boolean> {
    return this.testPhoneNumbers.includes(phoneNumber);
  }

  createTestMessage(options: Partial<TestMessage> = {}): TestMessage {
    const randomPhoneNumber = this.getRandomTestNumber();
    const timestamp = new Date().toISOString();
    
    return {
      to: options.to || randomPhoneNumber,
      message: options.message || `Test message sent at ${timestamp}`,
      priority: options.priority || 'medium',
      messageType: options.messageType || 'sms'
    };
  }

  createSingleTestMessage(): TestMessage {
    return this.createTestMessage({
      message: 'Single test message for end-to-end testing'
    });
  }

  createSingleMessageData(): TestMessage {
    return this.createTestMessage({
      message: 'Single message for complete flow testing'
    });
  }

  createBulkMessageData(messageCount: number = 2): BulkMessageData {
    // BUDGET-OPTIMIZED: Reduced from 10 to 2 messages default
    console.log(`📊 Creating bulk message data with ${messageCount} messages (budget-optimized)`);
    
    const messages = Array.from({ length: messageCount }, (_, index) => 
      this.createTestMessage({
        message: `Bulk test message ${index + 1} of ${messageCount}`
      })
    );

    return {
      messages,
      batchId: this.generateBatchId(),
      priority: 'medium',
      sendTime: new Date()
    };
  }

  createBulkMessages(count: number): TestMessage[] {
    // ADD WARNING for high-volume scenarios
    if (count > 5) {
      console.warn(`⚠️ WARNING: Creating ${count} bulk messages. Consider using email-only mode to avoid SMS budget issues.`);
    }
    
    return Array.from({ length: count }, (_, index) => 
      this.createTestMessage({
        message: `Rate limit test message ${index + 1}`
      })
    );
  }

  createConcurrentMessages(count: number): TestMessage[] {
    // ADD WARNING for high-volume scenarios
    if (count > 3) {
      console.warn(`⚠️ WARNING: Creating ${count} concurrent messages. Consider using email-only mode to avoid SMS budget issues.`);
    }
    
    return Array.from({ length: count }, (_, index) => 
      this.createTestMessage({
        to: this.getRandomTestNumber(),
        message: `Concurrent test message ${index + 1}`,
        priority: index % 3 === 0 ? 'high' : 'medium'
      })
    );
  }

  createConcurrentTestMessages(count: number): TestMessage[] {
    return this.createConcurrentMessages(count);
  }

  createStagingBulkMessages(count: number = 2): TestMessage[] {
    // BUDGET-OPTIMIZED: Reduced from 50 to 2 messages default
    console.log(`📊 Creating staging bulk messages with ${count} messages (budget-optimized)`);
    
    return Array.from({ length: count }, (_, index) => 
      this.createTestMessage({
        message: `Staging bulk test message ${index + 1}`,
        priority: 'low' // Use low priority for staging bulk tests
      })
    );
  }

  createHighVolumeMessages(count: number): TestMessage[] {
    // FORCE EMAIL-ONLY MODE for high-volume tests
    if (count > 5) {
      throw new Error(`🚫 High-volume testing (${count} messages) requires EMAIL_ONLY_MODE=true. Set environment variable to proceed safely.`);
    }
    
    return Array.from({ length: count }, (_, index) => 
      this.createTestMessage({
        to: this.getRandomTestNumber(),
        message: `High volume test message ${index + 1}`,
        priority: index % 10 === 0 ? 'high' : 'medium'
      })
    );
  }

  createPriorityMessages(): { high: TestMessage[], medium: TestMessage[], low: TestMessage[] } {
    // BUDGET-OPTIMIZED: Reduced from 10 total to 3 total messages
    console.log(`📊 Creating priority messages: 1 high + 1 medium + 1 low (budget-optimized)`);
    
    return {
      high: Array.from({ length: 1 }, (_, index) => 
        this.createTestMessage({
          message: `High priority test message ${index + 1}`,
          priority: 'high'
        })
      ),
      medium: Array.from({ length: 1 }, (_, index) => 
        this.createTestMessage({
          message: `Medium priority test message ${index + 1}`,
          priority: 'medium'
        })
      ),
      low: Array.from({ length: 1 }, (_, index) => 
        this.createTestMessage({
          message: `Low priority test message ${index + 1}`,
          priority: 'low'
        })
      )
    };
  }

  createLongMessage(): TestMessage {
    const longText = 'This is a very long test message that exceeds the typical SMS length limit. '.repeat(10);
    return this.createTestMessage({
      message: longText,
      messageType: 'mms'
    });
  }

  createSpecialCharacterMessage(): TestMessage {
    return this.createTestMessage({
      message: 'Test message with special characters: !@#$%^&*()_+-=[]{}|;:,.<>?~`äöüß中文한국어日本語'
    });
  }

  createEmojiMessage(): TestMessage {
    return this.createTestMessage({
      message: 'Test message with emojis: 😀😁😂🤣😃😄😅😆😉😊😋😎😍😘🥰😗😙😚'
    });
  }

  createTestMessageBatch(batchSize: number, messageType: 'simple' | 'long' | 'special' | 'emoji' = 'simple'): TestMessage[] {
    const createFunction = {
      simple: () => this.createTestMessage(),
      long: () => this.createLongMessage(),
      special: () => this.createSpecialCharacterMessage(),
      emoji: () => this.createEmojiMessage()
    }[messageType];

    return Array.from({ length: batchSize }, createFunction);
  }

  async validateMessageFormat(message: TestMessage): Promise<boolean> {
    // Validate phone number format
    if (!this.isValidPhoneNumber(message.to)) {
      return false;
    }

    // Validate message content
    if (!message.message || message.message.trim().length === 0) {
      return false;
    }

    // Validate message length
    if (message.messageType === 'sms' && message.message.length > 160) {
      return false;
    }

    // Validate priority
    if (message.priority && !['high', 'medium', 'low'].includes(message.priority)) {
      return false;
    }

    return true;
  }

  async generateTestReport(messages: TestMessage[]): Promise<{
    totalMessages: number;
    uniqueRecipients: number;
    messageTypes: Record<string, number>;
    priorities: Record<string, number>;
    avgMessageLength: number;
  }> {
    const uniqueRecipients = new Set(messages.map(m => m.to)).size;
    
    const messageTypes = messages.reduce((acc, msg) => {
      const type = msg.messageType || 'sms';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorities = messages.reduce((acc, msg) => {
      const priority = msg.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgMessageLength = messages.reduce((sum, msg) => sum + msg.message.length, 0) / messages.length;

    return {
      totalMessages: messages.length,
      uniqueRecipients,
      messageTypes,
      priorities,
      avgMessageLength: Math.round(avgMessageLength)
    };
  }

  private getRandomTestNumber(): string {
    const randomIndex = Math.floor(Math.random() * this.testPhoneNumbers.length);
    return this.testPhoneNumbers[randomIndex];
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation (E.164 format)
    const phoneRegex = /^\+\d{1,15}$/;
    return phoneRegex.test(phoneNumber);
  }

  // BUDGET-SAFE: Special message methods (1 SMS each)
  createBudgetSafeSingleMessage(): TestMessage {
    console.log(`📱 Creating budget-safe single message (1 SMS)`);
    return this.createTestMessage({
      to: '+17472920712', // Use the working test number
      message: 'Budget-safe single SMS test message'
    });
  }

  createBudgetSafeAlertMessage(): TestMessage {
    console.log(`📱 Creating budget-safe alert message (1 SMS)`);
    return this.createTestMessage({
      to: '+17472920712', // Use the working test number
      message: 'SMS Alert: Test notification for budget-safe testing',
      priority: 'high'
    });
  }
}

class RCSTestDataHelper {
  private static readonly TEST_ID_PREFIX = 'DEV1044_TEST_';
  private dbConnection: any = null;

  constructor(dbConnection: any) {
    this.dbConnection = dbConnection;
  }

  async createTestReportData(data: {
    file_name: string;
    sent_date: string;
    total_records: number;
    rcs_sms_sent_count: number;
  }): Promise<string> {
    const timestamp = Date.now();
    const recordId = `${RCSTestDataHelper.TEST_ID_PREFIX}${timestamp}_${Math.random().toString(36).substring(7)}`;
    
    await this.dbConnection.query(`
      INSERT INTO mab_operational_reports_data 
      (mab_operational_report_id, file_name, sent_date, total_records, rcs_sms_sent_count, created_ts, updated_ts)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      recordId,
      data.file_name,
      data.sent_date,
      data.total_records,
      data.rcs_sms_sent_count,
      timestamp,
      timestamp
    ]);

    return recordId;
  }

  async getTestRecordCount(): Promise<number> {
    const result = await this.dbConnection.query(`
      SELECT COUNT(*) as count 
      FROM mab_operational_reports_data 
      WHERE mab_operational_report_id LIKE ?
    `, [`${RCSTestDataHelper.TEST_ID_PREFIX}%`]);

    return result[0].count;
  }

  async cleanupTestData(): Promise<number> {
    const result = await this.dbConnection.query(`
      DELETE FROM mab_operational_reports_data 
      WHERE mab_operational_report_id LIKE ?
    `, [`${RCSTestDataHelper.TEST_ID_PREFIX}%`]);

    return result.affectedRows;
  }

  static isTestRecord(recordId: string): boolean {
    return recordId.startsWith(RCSTestDataHelper.TEST_ID_PREFIX);
  }
}

// Export both classes at the end
export { RCSTestDataHelper }; 