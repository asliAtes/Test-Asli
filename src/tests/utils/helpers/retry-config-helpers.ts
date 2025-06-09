export interface RetryConfiguration {
  outerLoopRetries: number;
  outerLoopDelay: number;
  innerLoopRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  timeout: number;
}

export interface RetryMetrics {
  innerLoopRetries: number;
  outerLoopRetries: number;
  totalAttempts: number;
  executionTime: number;
  backoffPattern?: string;
  backoffIntervals?: number[];
  outerLoopDelay?: number;
}

export class RetryConfigHelper {
  private config: RetryConfiguration;

  constructor() {
    this.config = {
      outerLoopRetries: 3,
      outerLoopDelay: 30000, // 30 seconds
      innerLoopRetries: 5,
      baseDelay: 1000, // 1 second
      maxDelay: 60000, // 60 seconds
      backoffMultiplier: 2,
      timeout: 300000 // 5 minutes total timeout
    };
  }

  setOuterLoopRetries(retries: number): void {
    this.config.outerLoopRetries = retries;
  }

  setOuterLoopDelay(delayMs: number): void {
    this.config.outerLoopDelay = delayMs;
  }

  setInnerLoopRetries(retries: number): void {
    this.config.innerLoopRetries = retries;
  }

  setBaseDelay(delayMs: number): void {
    this.config.baseDelay = delayMs;
  }

  setMaxDelay(delayMs: number): void {
    this.config.maxDelay = delayMs;
  }

  setBackoffMultiplier(multiplier: number): void {
    this.config.backoffMultiplier = multiplier;
  }

  setTimeout(timeoutMs: number): void {
    this.config.timeout = timeoutMs;
  }

  getConfiguration(): RetryConfiguration {
    return { ...this.config };
  }

  getOuterLoopRetries(): number {
    return this.config.outerLoopRetries;
  }

  getOuterLoopDelay(): number {
    return this.config.outerLoopDelay;
  }

  getInnerLoopRetries(): number {
    return this.config.innerLoopRetries;
  }

  getMaxAcceptableExecutionTime(): number {
    return this.config.timeout;
  }

  calculateExpectedExecutionTime(metrics: RetryMetrics): number {
    const innerLoopTime = metrics.innerLoopRetries * this.config.baseDelay;
    const outerLoopTime = metrics.outerLoopRetries * this.config.outerLoopDelay;
    const backoffTime = this.calculateBackoffTime(metrics.innerLoopRetries);
    
    return innerLoopTime + outerLoopTime + backoffTime;
  }

  calculateBackoffTime(attempts: number): number {
    let totalBackoffTime = 0;
    let currentDelay = this.config.baseDelay;

    for (let i = 0; i < attempts; i++) {
      totalBackoffTime += Math.min(currentDelay, this.config.maxDelay);
      currentDelay *= this.config.backoffMultiplier;
    }

    return totalBackoffTime;
  }

  generateBackoffIntervals(attempts: number): number[] {
    const intervals: number[] = [];
    let currentDelay = this.config.baseDelay;

    for (let i = 0; i < attempts; i++) {
      intervals.push(Math.min(currentDelay, this.config.maxDelay));
      currentDelay *= this.config.backoffMultiplier;
    }

    return intervals;
  }

  calculateRetryMetrics(innerRetries: number, outerRetries: number): RetryMetrics {
    const backoffIntervals = this.generateBackoffIntervals(innerRetries);
    const totalTime = this.calculateExpectedExecutionTime({
      innerLoopRetries: innerRetries,
      outerLoopRetries: outerRetries,
      totalAttempts: innerRetries + outerRetries,
      executionTime: 0
    });

    return {
      innerLoopRetries: innerRetries,
      outerLoopRetries: outerRetries,
      totalAttempts: innerRetries + outerRetries + 1, // +1 for initial attempt
      executionTime: totalTime,
      backoffPattern: 'exponential',
      backoffIntervals,
      outerLoopDelay: this.config.outerLoopDelay
    };
  }

  validateRetryConfiguration(): boolean {
    // Validate retry configuration parameters
    if (this.config.outerLoopRetries < 0 || this.config.outerLoopRetries > 10) {
      return false;
    }

    if (this.config.innerLoopRetries < 0 || this.config.innerLoopRetries > 20) {
      return false;
    }

    if (this.config.outerLoopDelay < 1000 || this.config.outerLoopDelay > 120000) {
      return false;
    }

    if (this.config.baseDelay < 100 || this.config.baseDelay > 10000) {
      return false;
    }

    if (this.config.maxDelay < this.config.baseDelay) {
      return false;
    }

    if (this.config.backoffMultiplier < 1 || this.config.backoffMultiplier > 10) {
      return false;
    }

    return true;
  }

  resetToDefaults(): void {
    this.config = {
      outerLoopRetries: 3,
      outerLoopDelay: 30000,
      innerLoopRetries: 5,
      baseDelay: 1000,
      maxDelay: 60000,
      backoffMultiplier: 2,
      timeout: 300000
    };
  }

  loadFromEnvironment(): void {
    const envConfig = {
      outerLoopRetries: parseInt(process.env.BNE_RETRY_OUTER_MAX || '3'),
      outerLoopDelay: parseInt(process.env.BNE_RETRY_OUTER_DELAY || '30000'),
      innerLoopRetries: parseInt(process.env.BNE_RETRY_INNER_MAX || '5'),
      baseDelay: parseInt(process.env.BNE_RETRY_BASE_DELAY || '1000'),
      maxDelay: parseInt(process.env.BNE_RETRY_MAX_DELAY || '60000'),
      backoffMultiplier: parseFloat(process.env.BNE_RETRY_BACKOFF_MULTIPLIER || '2'),
      timeout: parseInt(process.env.BNE_RETRY_TIMEOUT || '300000')
    };

    // Only update valid values
    Object.entries(envConfig).forEach(([key, value]) => {
      if (!isNaN(value) && value > 0) {
        (this.config as any)[key] = value;
      }
    });
  }

  exportConfiguration(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfiguration(configJson: string): boolean {
    try {
      const importedConfig = JSON.parse(configJson);
      
      // Validate imported configuration
      const tempHelper = new RetryConfigHelper();
      tempHelper.config = { ...this.config, ...importedConfig };
      
      if (tempHelper.validateRetryConfiguration()) {
        this.config = tempHelper.config;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }

  getConfigurationSummary(): {
    totalPossibleRetries: number;
    maxExecutionTime: number;
    avgRetryDelay: number;
    configuration: RetryConfiguration;
  } {
    const totalPossibleRetries = this.config.outerLoopRetries * (this.config.innerLoopRetries + 1);
    const maxExecutionTime = this.calculateExpectedExecutionTime({
      innerLoopRetries: this.config.innerLoopRetries,
      outerLoopRetries: this.config.outerLoopRetries,
      totalAttempts: totalPossibleRetries,
      executionTime: 0
    });
    const avgRetryDelay = (this.config.baseDelay + this.config.maxDelay) / 2;

    return {
      totalPossibleRetries,
      maxExecutionTime,
      avgRetryDelay,
      configuration: { ...this.config }
    };
  }
} 