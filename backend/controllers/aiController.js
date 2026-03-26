const OpenAI = require('openai');
const db = require('../config/db');

// System prompt for legal AI assistant
const SYSTEM_PROMPT = `You are an AI Legal Assistant designed to support advocates by analyzing case notes and extracting practical legal guidance.

Your role is to analyze advocate-provided notes and key points, then generate a clear and actionable legal analysis.

You must follow these principles:

1. Accuracy — Use only the facts present in the notes and key points. Do not invent facts.
2. Legal Awareness — Identify relevant Indian legal frameworks such as IPC, BNS, CrPC, BNSS, CPC, Indian Evidence Act, and BSA where applicable.
3. Professional Structure — Your output must always be clearly structured using headings and bullet points.
4. Advocate Control — The AI output is a legal drafting aid. The advocate will review and edit the output.
5. Confidentiality Awareness — Assume all case data is confidential and should be handled with legal sensitivity.

Your response must always generate the following sections:

1. CASE SUMMARY — Short and clear summary explaining the main issue and situation.
2. MAIN FACTS AND KEY POINTS — Consolidated bullet points from notes.
3. CASE CHRONOLOGY — Timeline of events inferred from the notes.
4. LEGAL ISSUES IDENTIFIED — Core legal questions in dispute.
5. RELEVANT LAWS AND SECTIONS — Possible Acts and section-level references with short reason.
6. ARGUMENT DIRECTIONS — Possible arguments for both sides where relevant.
7. EVIDENCE GAPS — Missing documents, witnesses, or factual clarifications.
8. ACTION PLAN FOR ADVOCATE — Practical next steps to progress the matter.`;

/**
 * Generate AI insights for a case
 * POST /api/ai/generate/:caseId
 */
exports.generateInsights = async (req, res) => {
  const { caseId } = req.params;
  const advocateId = req.advocateId;
  const { notesText, mainPoints, includeCaseNotes } = req.body || {};

  try {
    // Verify API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: 'OpenAI API key not configured. Add OPENAI_API_KEY to your .env file.' });
    }

    // 1. Fetch case details (with ownership check)
    const caseData = await queryPromise(
      `SELECT c.*, cl.name AS client_name, cl.phone AS client_phone, cl.email AS client_email, cl.address AS client_address
       FROM cases c
       LEFT JOIN clients cl ON c.client_id = cl.id
       WHERE c.id = ? AND c.advocate_id = ?`,
      [caseId, advocateId]
    );

    if (caseData.length === 0) {
      return res.status(404).json({ message: 'Case not found or access denied' });
    }

    const caseInfo = caseData[0];

    // 2. Normalize direct notes input
    const normalizedNotesText = typeof notesText === 'string' ? notesText.trim() : '';
    const normalizedMainPoints = Array.isArray(mainPoints)
      ? mainPoints
          .map((point) => String(point || '').trim())
          .filter((point) => point.length > 0)
          .slice(0, 30)
      : [];

    // 3. Optionally pull existing saved case notes
    let savedNotes = [];
    if (includeCaseNotes !== false) {
      savedNotes = await queryPromise(
        'SELECT note_text, created_at FROM notes WHERE case_id = ? ORDER BY created_at DESC LIMIT 50',
        [caseId]
      );
    }

    const savedNotesSummary = savedNotes.length > 0
      ? savedNotes.map((n) => `- ${n.note_text}`).join('\n')
      : 'No saved case notes included.';

    if (!normalizedNotesText && normalizedMainPoints.length === 0 && savedNotes.length === 0) {
      return res.status(400).json({
        message: 'Please add notes or main points before generating AI analysis.'
      });
    }

    const userPrompt = `Analyze the following legal case notes and generate structured insights.

CASE INFORMATION
Case Title: ${caseInfo.case_title}
Case Number: ${caseInfo.case_number || 'N/A'}
Case Type: ${caseInfo.case_type || 'N/A'}
Court: ${caseInfo.court_name || 'N/A'}
Status: ${caseInfo.status}
Filing Date: ${caseInfo.filing_date ? new Date(caseInfo.filing_date).toLocaleDateString('en-IN') : 'N/A'}

ADVOCATE NOTES (DIRECT INPUT)
${normalizedNotesText || 'No direct notes provided.'}

MAIN POINTS (DIRECT INPUT)
${normalizedMainPoints.length > 0 ? normalizedMainPoints.map((point) => `- ${point}`).join('\n') : 'No direct main points provided.'}

SAVED CASE NOTES (DATABASE)
${savedNotesSummary}

Based on the above information, generate a comprehensive analysis with:
1. CASE SUMMARY
2. MAIN FACTS AND KEY POINTS
3. CASE CHRONOLOGY
4. LEGAL ISSUES IDENTIFIED
5. RELEVANT LAWS AND SECTIONS
6. ARGUMENT DIRECTIONS
7. EVIDENCE GAPS
8. ACTION PLAN FOR ADVOCATE`;

    // 4. Call OpenAI API
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2200,
    });

    const aiContent = completion.choices[0].message.content;
    const tokensUsed = completion.usage?.total_tokens || 0;
    const modelUsed = completion.model || 'gpt-4.1-mini';

    // 5. Save to database
    const insertResult = await queryPromise(
      'INSERT INTO ai_notes (case_id, note_type, content, model_used, tokens_used) VALUES (?, ?, ?, ?, ?)',
      [caseId, 'full_analysis', aiContent, modelUsed, tokensUsed]
    );

    res.json({
      message: 'AI insights generated successfully',
      id: insertResult.insertId,
      content: aiContent,
      model_used: modelUsed,
      tokens_used: tokensUsed,
      created_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI generation error:', error);

    if (error.status === 401 || error.code === 'invalid_api_key') {
      return res.status(401).json({ message: 'Invalid OpenAI API key. Check your .env file.' });
    }
    if (error.status === 429) {
      return res.status(429).json({ message: 'OpenAI rate limit exceeded. Please try again later.' });
    }
    if (error.status === 402 || error.code === 'insufficient_quota') {
      return res.status(402).json({ message: 'OpenAI billing quota exceeded. Check your OpenAI account.' });
    }

    res.status(500).json({ message: 'Failed to generate AI insights', error: error.message });
  }
};

/**
 * Get all AI notes for a case
 * GET /api/ai/notes/:caseId
 */
exports.getNotes = async (req, res) => {
  const { caseId } = req.params;
  const advocateId = req.advocateId;

  try {
    // Verify case belongs to advocate
    const caseCheck = await queryPromise(
      'SELECT id FROM cases WHERE id = ? AND advocate_id = ?',
      [caseId, advocateId]
    );
    if (caseCheck.length === 0) {
      return res.status(404).json({ message: 'Case not found or access denied' });
    }

    const notes = await queryPromise(
      'SELECT * FROM ai_notes WHERE case_id = ? ORDER BY created_at DESC',
      [caseId]
    );

    res.json(notes);
  } catch (error) {
    console.error('Fetch AI notes error:', error);
    res.status(500).json({ message: 'Failed to fetch AI notes', error: error.message });
  }
};

/**
 * Delete an AI note
 * DELETE /api/ai/notes/:id
 */
exports.deleteNote = async (req, res) => {
  const { id } = req.params;
  const advocateId = req.advocateId;

  try {
    // Verify ownership via case
    const noteCheck = await queryPromise(
      `SELECT an.id FROM ai_notes an
       JOIN cases c ON an.case_id = c.id
       WHERE an.id = ? AND c.advocate_id = ?`,
      [id, advocateId]
    );
    if (noteCheck.length === 0) {
      return res.status(404).json({ message: 'AI note not found or access denied' });
    }

    await queryPromise('DELETE FROM ai_notes WHERE id = ?', [id]);
    res.json({ message: 'AI note deleted successfully' });
  } catch (error) {
    console.error('Delete AI note error:', error);
    res.status(500).json({ message: 'Failed to delete AI note', error: error.message });
  }
};

// Helper: promisify db.query
function queryPromise(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}
