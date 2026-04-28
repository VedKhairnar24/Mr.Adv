const PRIORITY_TO_SCORE = Object.freeze({
  low: 10,
  medium: 50,
  high: 80,
  urgent: 100,
});

function coercePriority(p) {
  if (!p) return 'medium';
  const v = String(p).toLowerCase();
  if (v === 'low' || v === 'medium' || v === 'high' || v === 'urgent') return v;
  return 'medium';
}

function priorityScore(priority) {
  return PRIORITY_TO_SCORE[coercePriority(priority)];
}

/**
 * Priority alert rules.
 * Keep deterministic and side-effect free.
 */
function derivePriority({ type, explicitPriority, now, eventTime }) {
  const base = coercePriority(explicitPriority);
  if (explicitPriority) return base;

  const t = String(type || '').toLowerCase();
  let derived = 'medium';
  if (t === 'system_alert') derived = 'high';
  if (t === 'hearing_reminder') derived = 'high';
  if (t === 'deadline_approaching') derived = 'high';
  if (t === 'document_uploaded') derived = 'high';

  // Escalate close-to-event reminders to urgent.
  if (eventTime && now) {
    const ms = new Date(eventTime).getTime() - new Date(now).getTime();
    const hours = ms / (1000 * 60 * 60);
    if (hours > 0 && hours <= 2) derived = 'urgent';
  }

  return derived;
}

module.exports = {
  derivePriority,
  priorityScore,
  coercePriority,
};

