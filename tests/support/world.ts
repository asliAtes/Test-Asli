import { World, setWorldConstructor } from '@cucumber/cucumber';
import { initializeSharedSteps } from '../steps/shared';

// Initialize all shared steps
//initializeSharedSteps();

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
  
  constructor(options: any) {
    super(options);
    
    // Initialize properties
    this.response = null;
    this.emailApiResponse = null;
    this.rcsResponse = null;
    
    this.data = null;
    this.emailRequestData = null; 
    this.rcsData = null;
  }
}

// Tell Cucumber to use our custom world class
setWorldConstructor(KredosWorld); 