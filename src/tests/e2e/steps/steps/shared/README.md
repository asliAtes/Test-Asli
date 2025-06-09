# Shared Step Definitions and Utilities

This directory contains shared step definitions and utilities that can be used across different test modules.

## How to Use Shared Steps

### 1. Import the shared utilities and assertions

In your step definition file, import the shared utilities and assertions:

```typescript
import { config, generateTestId } from '../shared/utils';
import { defineCommonAssertions } from '../shared/common_assertions';
```

### 2. Initialize the common assertions

Call the `defineCommonAssertions()` function to register the shared step definitions:

```typescript
// Initialize common assertions
defineCommonAssertions();
```

### 3. Store response data in the world context

When making API calls, store the response in the world context so that the shared steps can access it:

```typescript
// Store in world context for shared steps to access
this.response = response;
```

### 4. Use the shared steps in your feature files

Update your feature files to use the shared steps:

```gherkin
Then the response should indicate "400 Bad Request"
```

## Available Shared Steps

### Response Assertions

- `Then the response should indicate {string}` - Checks if the response contains the expected message or status code.

## Available Utilities

### Configuration

```typescript
import { config } from '../shared/utils';

// Available properties:
// - config.baseUrl - The base URL for the communication module API
// - config.emailUrl - The URL for the email endpoint
// - config.testPhone - The test phone number
// - config.rcsCapablePhone - The RCS-capable test phone number
// - config.nonRcsPhone - The non-RCS test phone number
// - config.timeout - The API request timeout in milliseconds
```

### Helper Functions

```typescript
import { generateTestId, generateFutureDate } from '../shared/utils';

// Generate a random ID for testing
const id = generateTestId();

// Generate a date 24 hours in the future in ISO format
const futureDate = generateFutureDate();

// Generate a date with custom hours in the future
const customFutureDate = generateFutureDate(48); // 48 hours in the future
```

## Custom World

The `KredosWorld` class in `tests/support/world.ts` is used to share context between step definition files. It provides the following properties:

- `response` - The response from the SMS module
- `emailApiResponse` - The response from the Email module
- `rcsResponse` - The response from the RCS module
- `data` - The request data for the SMS module
- `emailRequestData` - The request data for the Email module
- `rcsData` - The request data for the RCS module 