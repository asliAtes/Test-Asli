export class MockDatabase {
  private data: Map<string, any[]>;
  private logs: string[];

  constructor() {
    this.data = new Map();
    this.logs = [];
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with some test data
    const now = Date.now();
    const sixtyOneDaysAgo = now - (61 * 24 * 60 * 60 * 1000);
    
    this.data.set('run', [
      { id: 1, msg_sent_date: sixtyOneDaysAgo, message: 'Old message 1' },
      { id: 2, msg_sent_date: now, message: 'Recent message' },
      { id: 3, msg_sent_date: sixtyOneDaysAgo, message: 'Old message 2' }
    ]);

    this.data.set('process_logs', []);
  }

  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    // Simple mock implementation that returns data based on the table name
    if (sql.toLowerCase().includes('select')) {
      const tableName = this.extractTableName(sql);
      return (this.data.get(tableName) || []) as T[];
    }
    return [] as T[];
  }

  private extractTableName(sql: string): string {
    const match = sql.match(/from\s+(\w+)/i);
    return match ? match[1].toLowerCase() : '';
  }

  async close(): Promise<void> {
    // No-op for mock
  }

  getLastInsertId(): number {
    return 1; // Mock implementation
  }

  async tableExists(tableName: string): Promise<boolean> {
    return this.data.has(tableName);
  }

  addLog(message: string): void {
    this.logs.push(message);
  }

  getLogs(): string[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }
} 