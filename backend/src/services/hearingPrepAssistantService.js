const db = require('../../config/db');
const logger = require('../config/logger');
const { processWithOpenRouter } = require('../../services/openrouterService');
const { cleanText } = require('../../utils/chunkText');

function toIsoDate(d) {
  if (!d) return null;
  const s = String(d);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function normalizeTime(t) {
  if (!t) return null;
  if (typeof t === 'string') return t.slice(0, 8);
  return String(t);
}

function buildContextBlock(ctx) {
  const caseInfo = ctx.caseInfo;
  const hearings = ctx.hearings || [];
  const documents = ctx.documents || [];
  const evidence = ctx.evidence || [];
  const notes = ctx.caseNotes || [];

  const nextHearingLine = ctx.nextHearing
    ? `${toIsoDate(ctx.nextHearing.hearing_date)} ${normalizeTime(ctx.nextHearing.hearing_time) || '--:--'}`
    : 'None';

  return cleanText(`
CASE
- Case Title: ${caseInfo.case_title || 'N/A'}
- Case Number: ${caseInfo.case_number || 'N/A'}
- Case Type: ${caseInfo.case_type || 'N/A'}
- Court: ${caseInfo.court_name || 'N/A'}
- Status: ${caseInfo.status || 'N/A'}

CLIENT
- Name: ${caseInfo.client_name || 'N/A'}
- Phone: ${caseInfo.client_phone || 'N/A'}
- Email: ${caseInfo.client_email || 'N/A'}
- Address: ${caseInfo.client_address || 'N/A'}

NEXT HEARING
- Next Hearing: ${nextHearingLine}
- Hearing Tomorrow: ${ctx.hasHearingTomorrow ? 'Yes' : 'No'}

HEARINGS (recent/upcoming first, max 10)
${hearings
  .slice(0, 10)
  .map(
    (h) =>
      `- ${toIsoDate(h.hearing_date)} ${normalizeTime(h.hearing_time) || '--:--'} | ${h.status || ''} | ${h.stage || ''} | ${h.court_name || h.court_hall || ''}`
  )
  .join('\n')}

DOCUMENTS (max 30)
${documents
  .slice(0, 30)
  .map((d) => `- ${d.document_name || ''} | ${toIsoDate(d.uploaded_at) || ''} | ${d.file_type || ''}`)
  .join('\n')}

EVIDENCE (max 30)
${evidence
  .slice(0, 30)
  .map((e) => `- ${e.file_name || e.description || ''} | ${e.evidence_type || ''} | ${toIsoDate(e.uploaded_at) || ''}`)
  .join('\n')}

CASE NOTES (max 20, most recent first)
${notes
  .slice(0, 20)
  .map((n) => `- ${toIsoDate(n.created_at) || ''} | ${n.note_type || ''} | ${n.title || ''}\n  ${String(n.content || '').slice(0, 800)}`)
  .join('\n')}
`);
}

function baselineMissingDocs(caseType) {
  const t = String(caseType || '').toLowerCase();
  // Minimal, broadly useful baselines; AI can refine.
  const common = [
    'Chronology of events (one-page)',
    'Client ID / KYC (if relevant)',
    'Vakalatnama / authorization documents (if applicable)',
    'Index of documents with exhibit references',
    'List of witnesses (if applicable)',
  ];

  if (t.includes('criminal')) {
    return [
      ...common,
      'FIR / Complaint copy',
      'Bail application / prior orders (if any)',
      'Charge sheet / final report (if filed)',
      'Medical / injury reports (if relevant)',
      'CCTV / digital evidence preservation certificates (if relevant)',
    ];
  }
  if (t.includes('civil')) {
    return [
      ...common,
      'Plaint / Written statement / replication',
      'Relevant contracts / agreements / notices',
      'Property title/possession documents (if relevant)',
      'Interim orders / injunctions (if any)',
      'Affidavits and supporting exhibits',
    ];
  }
  if (t.includes('family')) {
    return [
      ...common,
      'Marriage proof documents',
      'Financial disclosures / income proofs',
      'Communication records (if relevant)',
      'Child-related documents (school/medical) (if relevant)',
      'Prior mediation/counseling notes (if any)',
    ];
  }

  return common;
}

function dedupeChecklist(items) {
  const seen = new Set();
  const out = [];
  for (const it of items || []) {
    const k = String(it || '').trim().toLowerCase();
    if (!k) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(String(it).trim());
  }
  return out;
}

async function fetchCaseContext({ advocateId, caseId }) {
  const [caseRows] = await db.promise.query(
    `SELECT c.*, 
            cl.name AS client_name, cl.phone AS client_phone, cl.email AS client_email, cl.address AS client_address
     FROM cases c
     LEFT JOIN clients cl ON c.client_id = cl.id
     WHERE c.id = ? AND c.advocate_id = ?
     LIMIT 1`,
    [caseId, advocateId]
  );
  const caseInfo = caseRows && caseRows[0];
  if (!caseInfo) return null;

  const [hearings] = await db.promise.query(
    `SELECT * FROM hearings
     WHERE case_id = ?
     ORDER BY hearing_date DESC, hearing_time DESC
     LIMIT 50`,
    [caseId]
  );

  const [documents] = await db.promise.query(
    `SELECT * FROM documents
     WHERE case_id = ?
     ORDER BY uploaded_at DESC
     LIMIT 100`,
    [caseId]
  );

  const [evidence] = await db.promise.query(
    `SELECT * FROM evidence
     WHERE case_id = ?
     ORDER BY uploaded_at DESC
     LIMIT 100`,
    [caseId]
  );

  const [caseNotes] = await db.promise.query(
    `SELECT * FROM case_notes
     WHERE case_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [caseId]
  );

  let state = null;
  try {
    const [stateRows] = await db.promise.query(
      `SELECT * FROM case_hearing_state WHERE case_id = ? LIMIT 1`,
      [caseId]
    );
    state = stateRows && stateRows[0] ? stateRows[0] : null;
  } catch (e) {
    // If migration 003 isn't applied yet, proceed without derived hearing state.
    state = null;
  }

  // Compute next hearing robustly (fallback if state not present)
  let nextHearing = null;
  const upcoming = (hearings || [])
    .filter((h) => String(h.status || '').toLowerCase() === 'scheduled')
    .map((h) => ({
      ...h,
      _dt: new Date(`${toIsoDate(h.hearing_date)} ${normalizeTime(h.hearing_time) || '00:00:00'}`).getTime(),
    }))
    .filter((h) => Number.isFinite(h._dt))
    .sort((a, b) => a._dt - b._dt);
  nextHearing = upcoming[0] || null;

  const hasHearingTomorrow =
    Boolean(state?.has_hearing_tomorrow) ||
    Boolean(
      nextHearing &&
        toIsoDate(nextHearing.hearing_date) ===
          toIsoDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
    );

  return {
    caseInfo,
    hearings,
    documents,
    evidence,
    caseNotes,
    nextHearing,
    hasHearingTomorrow,
  };
}

async function runAi(prompt, options = {}) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }
  const result = await processWithOpenRouter(prompt, {
    temperature: options.temperature ?? 0.2,
    maxTokens: options.maxTokens ?? 1800,
    timeout: options.timeout ?? 30000,
    maxRetries: options.maxRetries ?? 2,
  });
  return {
    provider: 'openrouter',
    content: (result.completion || '').trim(),
    tokensUsed: result.tokens || 0,
  };
}

class HearingPrepAssistantService {
  static async generateCaseSummary({ advocateId, caseId }) {
    const ctx = await fetchCaseContext({ advocateId, caseId });
    if (!ctx) return null;

    const contextBlock = buildContextBlock(ctx);
    const prompt = `You are an AI hearing preparation assistant for an Indian advocate.

STRICT RULES:
- Use ONLY the provided context.
- If something is missing, write "Not mentioned".
- Do not invent facts.
- Output in clean headings and bullet points.

TASK: Generate a concise CASE SUMMARY for hearing preparation:
1) 5-8 line summary
2) Key facts (bullets)
3) Key issues/questions for court (bullets)
4) Immediate next steps before hearing (bullets)

CONTEXT:
${contextBlock}`;

    return runAi(prompt, { maxTokens: 1400, temperature: 0.2 });
  }

  static async generateHearingPrepBriefing({ advocateId, caseId }) {
    const ctx = await fetchCaseContext({ advocateId, caseId });
    if (!ctx) return null;

    const contextBlock = buildContextBlock(ctx);
    const prompt = `You are an AI hearing preparation assistant for an Indian advocate.

STRICT RULES:
- Use ONLY the provided context.
- If something is missing, write "Not mentioned".
- Do not invent facts.

TASK: Create a HEARING PREP BRIEFING with:
1) Objective for next hearing
2) Current procedural posture (based on notes/hearings)
3) What to say in court (talking points)
4) What to ask / seek (orders/prayers)
5) Risks and weak points
6) A 30-minute prep checklist (timed)

CONTEXT:
${contextBlock}`;

    return runAi(prompt, { maxTokens: 2000, temperature: 0.25 });
  }

  static async generateSuggestedArguments({ advocateId, caseId }) {
    const ctx = await fetchCaseContext({ advocateId, caseId });
    if (!ctx) return null;

    const contextBlock = buildContextBlock(ctx);
    const prompt = `You are an AI hearing preparation assistant for an Indian advocate.

STRICT RULES:
- Use ONLY the provided context.
- If laws/sections are not clearly implied, say "Not mentioned".
- Do not invent evidence or facts.

TASK: Provide SUGGESTED ARGUMENTS:
1) For our side: 6-10 argument bullets
2) For other side: 4-8 likely counterarguments
3) Rebuttals: 4-8 rebuttal bullets
4) Suggested authorities (Acts/Sections only if justified by context)

CONTEXT:
${contextBlock}`;

    return runAi(prompt, { maxTokens: 2200, temperature: 0.3 });
  }

  static async generateMissingDocumentChecklist({ advocateId, caseId }) {
    const ctx = await fetchCaseContext({ advocateId, caseId });
    if (!ctx) return null;

    const uploadedNames = new Set((ctx.documents || []).map((d) => String(d.document_name || '').toLowerCase()));
    const baseline = baselineMissingDocs(ctx.caseInfo.case_type);

    // Rule-based "missing" by simple name matching (kept conservative)
    const likelyMissing = baseline.filter((item) => {
      const key = item.toLowerCase();
      for (const n of uploadedNames) {
        if (!n) continue;
        if (n.includes(key.split(' ')[0])) return false;
      }
      return true;
    });

    const contextBlock = buildContextBlock(ctx);
    const prompt = `You are an AI hearing preparation assistant.

STRICT RULES:
- Use ONLY the provided context.
- Do not assume documents exist unless listed.

TASK: Produce a MISSING DOCUMENT CHECKLIST:
- Section A: Likely required documents for this matter type (bullets)
- Section B: Specifically missing or not mentioned in context (bullets)
- Section C: Questions to ask client to confirm missing items (bullets)

IMPORTANT: Do not output any confidential data beyond what's in context.

CONTEXT:
${contextBlock}

RULE-BASED LIKELY MISSING (initial draft):
${likelyMissing.map((x) => `- ${x}`).join('\n')}`;

    const ai = await runAi(prompt, { maxTokens: 1600, temperature: 0.25 });
    return {
      ...ai,
      baselineChecklist: dedupeChecklist(baseline),
      likelyMissing: dedupeChecklist(likelyMissing),
    };
  }

  static async generateBePreparedTomorrow({ advocateId, caseId }) {
    const ctx = await fetchCaseContext({ advocateId, caseId });
    if (!ctx) return null;

    const contextBlock = buildContextBlock(ctx);
    const prompt = `You are an AI hearing preparation assistant for an Indian advocate.

STRICT RULES:
- Use ONLY the provided context.
- Do not invent facts.

TASK: "BE PREPARED TOMORROW" assistant output:
1) If hearing is tomorrow: a focused plan for tonight and tomorrow morning
2) If not tomorrow: still give the next best preparation plan for the next hearing date
3) A short script (6-10 lines) for what to say first in court
4) A list of files to print/keep ready (bullets)

CONTEXT:
${contextBlock}`;

    return runAi(prompt, { maxTokens: 1800, temperature: 0.25 });
  }

  static async generatePreHearingNotificationSummary({ advocateId, caseId }) {
    const ctx = await fetchCaseContext({ advocateId, caseId });
    if (!ctx) return null;

    const nh = ctx.nextHearing;
    const hearingLine = nh
      ? `${toIsoDate(nh.hearing_date)} ${normalizeTime(nh.hearing_time) || '--:--'}`
      : 'Not mentioned';

    const contextBlock = buildContextBlock(ctx);
    const prompt = `You are an AI assistant producing a SHORT pre-hearing summary for notifications.

STRICT RULES:
- Use ONLY the provided context.
- Output must be concise and scannable.

TASK:
Return:
1) One-line title (max 80 chars)
2) A short summary (max 600 chars)
3) Top 5 prep actions (bullets)

Hearing: ${hearingLine}

CONTEXT:
${contextBlock}`;

    const ai = await runAi(prompt, { maxTokens: 900, temperature: 0.2 });

    // Also return a minimal structured payload useful to build notification message.
    return {
      ...ai,
      structured: {
        caseId: Number(caseId),
        caseTitle: ctx.caseInfo.case_title,
        nextHearing: nh
          ? {
              hearingId: nh.id,
              date: toIsoDate(nh.hearing_date),
              time: normalizeTime(nh.hearing_time),
              court: nh.court_name || nh.court_hall || null,
              stage: nh.stage || null,
            }
          : null,
        hasHearingTomorrow: ctx.hasHearingTomorrow,
      },
    };
  }
}

module.exports = HearingPrepAssistantService;

