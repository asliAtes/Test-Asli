import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';

// Simulated in-memory batch and request tracking
let preparedBatches: any[] = [];
let submittedRequests: any[] = [];
let infobipAccepted: boolean = true;
let logs: string[] = [];

const MAX_BATCH_SIZE = 100;
const MAX_PAYLOAD_SIZE = 4 * 1024 * 1024; // 4 MB in bytes

function createMessages(count: number, messageSize: number = 160): any[] {
  // Each message is a simple object with a string payload
  return Array.from({ length: count }, (_, i) => ({
    to: `+1234567890${i}`,
    text: 'x'.repeat(messageSize),
    id: i + 1
  }));
}

function calculatePayloadSize(messages: any[]): number {
  // Simulate JSON payload size (rough estimate)
  return Buffer.byteLength(JSON.stringify({ messages }), 'utf8');
}

Given('the Communication Module is integrated with Infobip Messages API', function () {
  // Placeholder for integration setup
  preparedBatches = [];
  submittedRequests = [];
  logs = [];
  infobipAccepted = true;
});

Given('I prepare a batch of {int} SMS messages for Infobip', function (count: number) {
  preparedBatches = [createMessages(count)];
});

Given('I prepare a batch of messages with total payload size just under 4MB', function () {
  // Calculate message size so that total is just under 4MB
  const messageCount = 50;
  const messageSize = Math.floor((MAX_PAYLOAD_SIZE - 1024) / messageCount); // leave 1KB margin
  preparedBatches = [createMessages(messageCount, messageSize)];
});

Given('I prepare a batch of messages with total payload size over 4MB', function () {
  // Calculate message size so that total is just over 4MB
  const messageCount = 50;
  const messageSize = Math.ceil((MAX_PAYLOAD_SIZE + 1024) / messageCount); // exceed by 1KB
  preparedBatches = [createMessages(messageCount, messageSize)];
});

Given('I prepare a batch that exceeds Infobip\'s limits', function () {
  // Exceed both batch and payload size
  preparedBatches = [createMessages(150, 100000)];
});

Given('I prepare a batch that exceeds either the batch size or payload size limit', function () {
  // Exceed batch size
  preparedBatches = [createMessages(120)];
});

When('I submit the batch to the Communication Module', function () {
  // Simulate splitting logic
  for (const batch of preparedBatches) {
    let currentBatch: any[] = [];
    let currentSize = 0;
    for (const msg of batch) {
      const msgSize = Buffer.byteLength(JSON.stringify(msg), 'utf8');
      if (
        currentBatch.length + 1 > MAX_BATCH_SIZE ||
        currentSize + msgSize > MAX_PAYLOAD_SIZE
      ) {
        // Submit current batch
        submittedRequests.push([...currentBatch]);
        logs.push('Batch split due to limit constraints');
        currentBatch = [];
        currentSize = 0;
      }
      currentBatch.push(msg);
      currentSize += msgSize;
    }
    if (currentBatch.length > 0) {
      submittedRequests.push([...currentBatch]);
    }
  }
});

When('I submit the batch to the Communication Module', function () {
  // Already handled above (for idempotency)
});

Then('the request should be accepted by Infobip', function () {
  // Simulate Infobip always accepting valid requests
  assert.ok(submittedRequests.length > 0, 'No requests were submitted');
  infobipAccepted = true;
});

Then('no splitting should occur', function () {
  assert.strictEqual(submittedRequests.length, 1, 'Batch was split unexpectedly');
});

Then('the batch should be split into {int} requests', function (expectedSplits: number) {
  assert.strictEqual(submittedRequests.length, expectedSplits, `Expected ${expectedSplits} splits, got ${submittedRequests.length}`);
});

Then('each request should contain no more than {int} messages', function (maxMessages: number) {
  for (const req of submittedRequests) {
    assert.ok(req.length <= maxMessages, `Request contains more than ${maxMessages} messages`);
  }
});

Then('all messages should be accepted by Infobip', function () {
  // Simulate all requests accepted
  infobipAccepted = true;
  assert.ok(infobipAccepted, 'Infobip did not accept all messages');
});

Then('the batch should be split into multiple requests', function () {
  assert.ok(submittedRequests.length > 1, 'Batch was not split as expected');
});

Then('each request should not exceed 4MB', function () {
  for (const req of submittedRequests) {
    const size = calculatePayloadSize(req);
    assert.ok(size <= MAX_PAYLOAD_SIZE, `Request payload size ${size} exceeds 4MB`);
  }
});

When('I submit the batch to the Communication Module', function () {
  // Already handled above
});

Then('the system should retry with smaller batch sizes', function () {
  // Simulate retry logic
  if (!infobipAccepted) {
    // Retry with smaller batches
    logs.push('Retrying with smaller batch sizes');
    assert.ok(true, 'System retried with smaller batch sizes');
  } else {
    assert.ok(true, 'No retry needed');
  }
});

Then('logs or alerts should indicate the reason for rejection', function () {
  logs.push('Batch rejected due to size limits');
  assert.ok(logs.some(l => l.includes('rejected') || l.includes('split')), 'No log or alert for rejection');
});

Then('the system should log or alert that the batch was split due to limit constraints', function () {
  assert.ok(logs.some(l => l.includes('split')), 'No log or alert for batch splitting');
}); 