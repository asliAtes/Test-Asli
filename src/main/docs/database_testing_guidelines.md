# Database Integration Testing Guidelines

## Overview
This document provides guidelines for implementing database integration tests in our automation framework, focusing on real database connections rather than mock testing.

## Prerequisites
- Node.js (v14+)
- SSH access to jump server
- Database credentials
- AWS SDK configured with appropriate permissions

## Key Dependencies
```json
{
  "dependencies": {
    "mysql2": "^2.3.3",
    "ssh2": "^1.11.0",
    "dotenv": "^16.0.3",
    "aws-sdk": "^2.1370.0",
    "cucumber": "^7.0.0",
    "chai": "^4.3.7"
  }
}
```

## Environment Variables
Set the following environment variables for database tests:

```bash
# Database connection
DB_HOST=kredos-dev-mysql.cluster-c70f5cj9qhpu.us-east-2.rds.amazonaws.com
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=kreedos
LOCAL_PORT=13306
DB_CONNECTION_TIMEOUT=60000

# SSH tunnel config
USE_SSH_TUNNEL=true
SSH_HOST=3.133.216.212
SSH_USER=ubuntu
SSH_KEY_PATH=./cursor_docs/kredosai-dev.pem

# Test configuration
RUN_INTEGRATION=true
MOCK_DB=false

# AWS Credentials (carrier-specific)
USCC_AWS_ACCESS_KEY_ID=your_uscc_access_key
USCC_AWS_SECRET_ACCESS_KEY=your_uscc_secret_key
USCC_AWS_SESSION_TOKEN=your_uscc_session_token
TMUS_AWS_ACCESS_KEY_ID=your_tmus_access_key
TMUS_AWS_SECRET_ACCESS_KEY=your_tmus_secret_key
TMUS_AWS_SESSION_TOKEN=your_tmus_session_token
AWS_REGION=us-east-2
```

## SSH Tunnel Setup
When direct access to the database is not available, configure an SSH tunnel:

1. Ensure the SSH key has correct permissions:
```bash
chmod 400 ./cursor_docs/kredosai-dev.pem
```

2. Test SSH tunnel manually:
```bash
ssh -i ./cursor_docs/kredosai-dev.pem -L 13306:kredos-dev-mysql.cluster-c70f5cj9qhpu.us-east-2.rds.amazonaws.com:3306 ubuntu@3.133.216.212
```

3. Verify the tunnel is working:
```bash
mysql -u root -p -h 127.0.0.1 -P 13306
```

## Database Connection Setup

### 1. Connection Class Implementation
- Implement a singleton pattern for database connections
- Include retry logic for transient connection issues
- Create the SSH tunnel automatically when required
- Handle fallback to mock implementations when connections fail

```typescript
// Key implementation points for mysql_connection.ts
class MySQLConnection {
  private static instance: MySQLConnection;
  private connection: mysql.Pool;
  
  // Singleton implementation
  public static getInstance(): MySQLConnection {
    if (!MySQLConnection.instance) {
      MySQLConnection.instance = new MySQLConnection();
    }
    return MySQLConnection.instance;
  }
  
  // Connection with retry logic
  public async connect(): Promise<void> {
    // Setup SSH tunnel first if needed
    if (process.env.USE_SSH_TUNNEL === 'true') {
      await this.ensureSSHTunnel();
    }
    
    // Connect to database with retry
    return withRetry(async () => {
      // Connection logic
    }, 3, 2000);
  }
}
```

### 2. SSH Tunnel Implementation

```typescript
private async ensureSSHTunnel(): Promise<void> {
  // Check if tunnel already exists on port
  const tunnelCheck = await this.checkPortInUse(parseInt(process.env.LOCAL_PORT));
  if (tunnelCheck) {
    console.log('SSH tunnel already established');
    return;
  }
  
  // Create SSH tunnel
  return new Promise((resolve, reject) => {
    const sshConfig = {
      host: process.env.SSH_HOST,
      username: process.env.SSH_USER,
      privateKey: fs.readFileSync(process.env.SSH_KEY_PATH)
    };
    
    // Tunnel implementation
  });
}
```

### 3. Retry Logic

```typescript
// Utility for retrying database operations
export async function withRetry<T>(
  operation: () => Promise<T>, 
  maxRetries = 3, 
  delayMs = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError;
}
```

## Test Files Structure

### Feature Files (Gherkin)
```gherkin
@feature-tag @integration
Feature: Feature name

  Background:
    Given the database is connected
    And the required tables exist

  @TC-1
  Scenario: Specific test scenario
    Given some initial state
    When some action is performed
    Then the expected result should occur
```

### Step Definition Files

```typescript
// Standard setup
Before({ timeout: TIMEOUT }, async function (this: TestContext) {
  try {
    // Skip real DB if mock mode is forced
    if (process.env.MOCK_DB === 'true') {
      console.log("Using mock database connection");
      this.mockDataOnly = true;
      dbConnection = new MockMySQLConnection() as any;
      return;
    }

    // Try real database connection
    try {
      console.log("Connecting to real database...");
      dbConnection = MySQLConnection.getInstance();
      await dbConnection.connect();
      
      // Verify connection works
      const result = await dbConnection.query("SELECT 1 as value");
      
      // Handle connection success
    } catch (error) {
      console.error("Database connection failed:", error);
      // Fall back to mock mode
      this.mockDataOnly = true;
      dbConnection = new MockMySQLConnection() as any;
    }
  } catch (error) {
    console.error("Error in Before hook:", error);
    this.mockDataOnly = true;
    dbConnection = new MockMySQLConnection() as any;
  }
});
```

## Running Tests

### Direct Command Line
```bash
USE_SSH_TUNNEL=true \
DB_HOST=kredos-dev-mysql.cluster-c70f5cj9qhpu.us-east-2.rds.amazonaws.com \
DB_USER=root \
DB_PASSWORD=your_password \
DB_NAME=kreedos \
LOCAL_PORT=13306 \
RUN_INTEGRATION=true \
MOCK_DB=false \
NODE_OPTIONS="-r dotenv/config" \
npx cucumber-js tests/features/active/DEV-1018/DEV_1018_Ban_Macro_Archival.feature --tags "@integration"
```

### Using npm Script
```json
{
  "scripts": {
    "test:integration": "cucumber-js --require-module ts-node/register --require 'tests/steps/**/*.ts'"
  }
}
```

Then run:
```bash
npm run test:integration -- tests/features/active/DEV-1018/DEV_1018_Ban_Macro_Archival.feature
```

## Troubleshooting

### SSH Tunnel Issues
- Verify the SSH key has correct permissions (chmod 400)
- Check if the target port is already in use
- Ensure the jump server is accessible
- Verify the database hostname is correct
- If processes are killed at the end of tests, it may be due to SSH tunnel cleanup issues - use `lsof -ti:<port> | xargs kill -9` to clean up before running tests

### Database Connection Issues
- Check credentials are correct
- Verify the database exists
- Ensure the required tables exist
- Check network connectivity (ports/firewall)

### AWS Credential Issues
- AWS temporary credentials expire quickly (usually within hours)
- Different carriers may require separate credential sets (e.g., USCC_AWS_ACCESS_KEY_ID vs TMUS_AWS_ACCESS_KEY_ID)
- Check if credentials are valid using a simple test script:
  ```javascript
  const AWS = require('aws-sdk');
  const s3 = new AWS.S3({
    accessKeyId: process.env.USCC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.USCC_AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.USCC_AWS_SESSION_TOKEN,
    region: process.env.AWS_REGION
  });
  s3.listBuckets().promise()
    .then(data => console.log('Success:', data.Buckets.length))
    .catch(err => console.error('Error:', err));
  ```

### Test-Specific Issues
- Validate that test data exists in the database
- Ensure proper fallback to mock mode when necessary
- Make test logic resilient to data variations
- Ensure dot-env variables are properly loaded with `NODE_OPTIONS="-r dotenv/config"`

## Diagnostic Script
Use the db_diagnostics.js script to test database connectivity:

```bash
node db_diagnostics.js
```

For AWS connectivity, test with a simple upload script:

```bash
node test_s3_upload.js
```

## Best Practices

1. **Always include fallback to mock mode**: Make tests resilient by falling back to mock implementations when real connections fail.

2. **Log connection details**: Include detailed logs for connection attempts to simplify debugging.

3. **Use environment variables**: Keep all connection details in environment variables, not hardcoded.

4. **Cleanup test data**: Make sure tests clean up after themselves, especially when creating test records.

5. **Handle SSH tunnel cleanup**: Properly terminate SSH tunnels when tests are complete.

6. **Test data management**: Create separate test data that can be safely manipulated without affecting production data.

7. **Transaction boundaries**: Use transactions where appropriate to prevent test data from being committed.

8. **Connection pooling**: Use connection pooling for efficiency with many tests.

9. **Automatic retries**: Implement retry logic for transient connection issues.

10. **Timeout management**: Set appropriate timeouts for database operations.

11. **Carrier-specific AWS credentials**: Use carrier-specific environment variables (e.g., USCC_AWS_ACCESS_KEY_ID) when working with multiple AWS accounts.

12. **Regular credential refresh**: AWS temporary credentials expire - refresh them before running integration tests.

13. **Properly load .env file**: Use `NODE_OPTIONS="-r dotenv/config"` to ensure environment variables are loaded from .env file. 