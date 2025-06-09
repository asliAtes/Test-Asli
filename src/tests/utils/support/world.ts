import { World, setWorldConstructor } from '@cucumber/cucumber';
import { Page, APIRequestContext } from '@playwright/test';

/**
 * Custom world class for sharing context between steps
 */
export class KredosWorld extends World {
  // Response objects from different modules
  public response: any;
  public emailApiResponse: any;
  public rcsResponse: any;
  
  // Request data
  public data: any;
  public emailRequestData: any;
  public rcsData: any;

  // Playwright objects
  public page: Page;
  public request: APIRequestContext;

  // Test context
  public testFile: any;
  public lastMessageId: string;
  public testDates: string[];
  public weeklyResponse: any;
  public apiResponse: any;
  
  constructor(options: any) {
    super(options);
    
    // Initialize properties
    this.response = null;
    this.emailApiResponse = null;
    this.rcsResponse = null;
    
    this.data = null;
    this.emailRequestData = null; 
    this.rcsData = null;

    this.page = null;
    this.request = null;

    this.testFile = null;
    this.lastMessageId = null;
    this.testDates = [];
    this.weeklyResponse = null;
    this.apiResponse = null;
  }
}

// Tell Cucumber to use our custom world class
setWorldConstructor(KredosWorld); 