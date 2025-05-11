#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  // Run only email module tests with specific paths
  const command = `npx cucumber-js tests/features/Email_Module/DEV_926_Email_module.feature --require tests/steps/Email_Module/DEV_926_Email_module.ts`;
  
  console.log(`Running command: ${command}`);
  
  const output = execSync(command, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      TS_NODE_PROJECT: 'tsconfig.json',
      BASE_URL: process.env.BASE_URL || 'http://3.133.216.212/app4/kredos/comm/messaging'
    }
  });
  
  console.log(output.toString());
} catch (error) {
  console.error('Error running email tests:', error.message);
  process.exit(1);
} 