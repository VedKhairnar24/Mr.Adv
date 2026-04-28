const assert = require('assert');

// Import internal helpers by requiring the module and accessing via eval-safe pattern:
// We keep tests minimal and black-box where possible.
const svc = require('./hearingPrepAssistantService');

function test(name, fn) {
  try {
    fn();
    process.stdout.write(`ok - ${name}\n`);
  } catch (e) {
    process.stderr.write(`not ok - ${name}\n${e.stack || e.message}\n`);
    process.exitCode = 1;
  }
}

test('service exports expected generators', () => {
  assert.strictEqual(typeof svc.generateCaseSummary, 'function');
  assert.strictEqual(typeof svc.generateHearingPrepBriefing, 'function');
  assert.strictEqual(typeof svc.generateSuggestedArguments, 'function');
  assert.strictEqual(typeof svc.generateMissingDocumentChecklist, 'function');
  assert.strictEqual(typeof svc.generateBePreparedTomorrow, 'function');
  assert.strictEqual(typeof svc.generatePreHearingNotificationSummary, 'function');
});

if (process.exitCode) process.exit(process.exitCode);

