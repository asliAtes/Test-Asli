import { defineCommonAssertions } from './common_assertions';

/**
 * Initialize all shared step definitions
 * This should be called only once, from the main support file
 */
export function initializeSharedSteps(): void {
  // Initialize common assertions
  defineCommonAssertions();
  
  // Add other shared step definitions here as needed
} 