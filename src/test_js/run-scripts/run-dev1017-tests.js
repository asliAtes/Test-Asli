const { execSync } = require('child_process');
const path = require('path');

// Set environment variables
process.env.TEST_MODE = 'true';
process.env.NODE_ENV = 'test';
process.env.TS_NODE_TRANSPILE_ONLY = 'true';
process.env.TS_NODE_PROJECT = './tsconfig.json';

try {
  // Run the mock tests
  console.log('Running DEV-1017 mock tests...');
  execSync(
    'npx cucumber-js ' +
    'tests/features/Ban_Macro_Mapping/DEV_1017_run_table_archival.feature ' +
    '--tags @mock ' +
    '--require-module ts-node/register ' +
    '--require "tests/steps/Ban_Macro_Mapping/*.ts" ' +
    '--format progress-bar',
    { stdio: 'inherit' }
  );

  console.log('Mock tests completed successfully.');

  // Run integration tests if enabled
  if (process.env.ENABLE_INTEGRATION_TESTS === 'true') {
    console.log('\nRunning DEV-1017 integration tests...');
    execSync(
      'npx cucumber-js ' +
      'tests/features/Ban_Macro_Mapping/DEV_1017_run_table_archival.feature ' +
      '--tags @integration ' +
      '--require-module ts-node/register ' +
      '--require "tests/steps/Ban_Macro_Mapping/*.ts" ' +
      '--format progress-bar',
      { stdio: 'inherit' }
    );
    console.log('Integration tests completed successfully.');
  }
} catch (error) {
  console.error('Test execution failed:', error.message);
  process.exit(1);
} 