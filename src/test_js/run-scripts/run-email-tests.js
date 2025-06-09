const { exec } = require('child_process');

console.log('🔄 Running Email Module Tests...');

// Set environment variables for the test
process.env.NODE_ENV = 'test';
process.env.CUCUMBER_PUBLISH_QUIET = 'true';

const command = `NODE_OPTIONS="--loader ts-node/esm --no-warnings" npx cucumber-js \
  tests/features/Email_Module/DEV_926_Email_module.feature \
  --require tests/steps/Email_Module/**/*.ts \
  --require-module ts-node/register \
  --format progress \
  --format json:reports/email-test-results.json \
  --tags "@email"`;

exec(command, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
  // Always log the test output
  if (stdout) {
    console.log('📝 Test Output:\n', stdout);
  }

  // Log non-warning stderr messages
  if (stderr && !stderr.includes('ExperimentalWarning') && !stderr.includes('DeprecationWarning')) {
    console.error('⚠️ Test Warnings:\n', stderr);
  }

  // Handle test results
  try {
    if (error) {
      console.error('❌ Test Execution Error:', {
        code: error.code,
        signal: error.signal
      });
    } else {
      console.log('✅ Email tests completed successfully');
    }
  } catch (e) {
    console.error('❌ Error processing test results:', e.message);
    process.exit(1);
  }
}); 