# Communication Module Test Results

## Test Status
All SMS tests are now passing, but with some known issues identified that should be reported as bugs.

## Key Findings

### Working Correctly:
1. **Twilio SMS sending (TC01)** - Successfully sends messages
2. **Infobip SMS sending (TC02)** - Successfully sends messages
3. **Empty message validation (TC04)** - Correctly returns 400 with proper validation message
4. **Unsupported carrier validation (TC05)** - Correctly validates and returns 400
5. **Missing carrier field (TC06)** - Correctly validates and returns 400
6. **Missing phone number (TC07)** - Correctly validates and returns 400
7. **Invalid phone format (TC08)** - Correctly validates and returns 400
8. **Specific carrier override (TC10)** - Successfully processes with INFOBIP_SMS

### Issues To Report:

1. **BNE Integration Failing**
   - **Bug Severity**: High
   - **Description**: BNE SMS sending (TC03) fails with 500 error
   - **Expected behavior**: API should successfully route messages to BNE
   - **Actual behavior**: Returns 500 "Failed to send/process SMS" error
   - **Reproduction steps**: Send any message using the BNE carrier format

2. **Malformed JSON Error Handling**
   - **Bug Severity**: Medium
   - **Description**: Malformed JSON (TC09) returns 500 error with stack trace instead of 400 Bad Request
   - **Expected behavior**: API should return 400 Bad Request for malformed JSON
   - **Actual behavior**: Returns 500 with Java exception details exposed to client
   - **Reproduction steps**: Send malformed JSON to the API endpoint

## Email Testing

Email testing has been set up but couldn't be run due to TypeScript module conflicts. The test cases include:

1. **Send email using SendGrid** - Tests basic email sending functionality
2. **Missing required email fields** - Tests validation for required fields
3. **Invalid email format** - Tests validation for email format

The email endpoint format from the Postman collection is:

```json
{
  "mode": "SINGLE",
  "carrier": "SENDGRID",
  "singleRequest": {
    "to": "test@example.com",
    "subject": "Important Notice Regarding Your Account",
    "treatmentUserId": "12345",
    "clientName": "USCC",
    "templateId": "d-b240674a8e494851a0c5bb8f016cca5f",
    "firstName": "TEST",
    "lastName": "USER",
    "pastDue": "$187.50",
    "quickPayLink": "https://pay.example.com/quickpay",
    "payNumber": "+11234567890",
    "link": "https://www.example.com/account",
    "paAmount": "$100.00",
    "paPayDate": "2025-04-10",
    "messageTemplateId": "TID_MMLO_20240615",
    "body": "<b>Hello TEST,</b><div><p><br>We're reaching out regarding your past due balance...</p></div>",
    "timeZone": "America/New_York",
    "callbackUrl": "https://api.example.com/email-status"
  }
}
```

The email endpoint is: `http://3.133.216.212/app4/kredos/comm/email`

## SMS Request Format Guidelines

The Communication Module API expects different request formats depending on the carrier:

### For Twilio and Infobip:
```json
{
  "carrier": "TWILIO",
  "schedule": false,
  "smsRequestList": [
    {
      "toNumber": "+17193981666",
      "message": "Your message here",
      "treatmentUserId": "12345",
      "clientName": "USCC",
      "acctNum": "12345"
    }
  ]
}
```

### For BNE:
```json
{
  "carrier": "BNE",
  "bulkBneRequest": {
    "bneBulkRequest": {
      "correlationId": "12345",
      "messages": [
        {
          "address": "tel:+12064061911",
          "language": "en-US",
          "dynamicTag": ["Your message here"],
          "timezone": "America/New_York"
        }
      ],
      "deliveryExpiryTime": "2025-04-08T22:00"
    },
    "serviceGrade": "3080"
  }
}
```

## Validation Rules
The API performs the following validations:
1. Carrier must be one of: TWILIO, INFOBIP_SMS, INFOBIP_RCS, BNE
2. Carrier field is mandatory
3. Message content is mandatory
4. Phone number is mandatory
5. Phone number must be in E.164 format

## Response Structure
Successful responses have the following structure:
```json
{
  "result": true,
  "statusCode": 200,
  "statusCodeDescription": "Success",
  "message": "All SMS requests processed successfully",
  "response": {
    "successfulMessages": [...],
    "invalidRequests": []
  }
}
```

Error responses have this structure:
```json
{
  "result": false,
  "statusCode": 400,
  "statusCodeDescription": "Bad Request",
  "message": "Validation failed: ...",
  "response": null
}
``` 