const assert = require('assert');
const { derivePriority, priorityScore } = require('./notificationPriority');

function test(name, fn) {
  try {
    fn();
    process.stdout.write(`ok - ${name}\n`);
  } catch (e) {
    process.stderr.write(`not ok - ${name}\n${e.stack || e.message}\n`);
    process.exitCode = 1;
  }
}

test('priorityScore ordering', () => {
  assert(priorityScore('urgent') > priorityScore('high'));
  assert(priorityScore('high') > priorityScore('medium'));
  assert(priorityScore('medium') > priorityScore('low'));
});

test('derivePriority uses explicit priority', () => {
  const p = derivePriority({ type: 'system_alert', explicitPriority: 'low' });
  assert.strictEqual(p, 'low');
});

test('derivePriority escalates close-to-event hearing reminders', () => {
  const now = new Date('2026-04-28T10:00:00Z');
  const eventTime = new Date('2026-04-28T11:30:00Z');
  const p = derivePriority({ type: 'hearing_reminder', now, eventTime });
  assert.strictEqual(p, 'urgent');
});

test('derivePriority defaults by type', () => {
  const p = derivePriority({ type: 'document_uploaded' });
  assert.strictEqual(p, 'high');
});

if (process.exitCode) process.exit(process.exitCode);

