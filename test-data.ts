export interface TestData {
    id: string;
    toNumber?: string;
    clientName?: string;
    acctNum?: string;
    treatmentUserId?: string;
    carrier?: string;
    message?: string;
    rawPayload?: string;
    expectedChannel?: string;
    expectedResult?: string;
  }