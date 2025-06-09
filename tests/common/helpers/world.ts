import { setWorldConstructor, World } from '@cucumber/cucumber';
import { initializeSharedSteps } from '../steps/shared';
import { Page } from 'playwright';

// Initialize all shared steps
//initializeSharedSteps();

export interface CustomWorld extends World {
    page?: Page;
    response?: any;
    emailRequestData?: any;
    rcsData?: any;
}

/**
 * Custom world class for sharing context between steps
 */
class TestWorld extends World implements CustomWorld {
  // Response objects from different modules
  public response: any;
  public emailApiResponse: any;
  public rcsResponse: any;
  
  // Request data
  public data: any;
  public emailRequestData: any;
  public rcsData: any;
  
  constructor(options: any) {
    super(options);
    
    // Initialize properties
    this.response = null;
    this.emailApiResponse = null;
    this.rcsResponse = null;
    
    this.data = null;
    this.emailRequestData = null; 
    this.rcsData = null;

    initializeSharedSteps();
  }
}

// Tell Cucumber to use our custom world class
setWorldConstructor(TestWorld); 