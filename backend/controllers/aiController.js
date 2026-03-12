const OpenAI = require('openai');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// System prompt for legal AI assistant
const SYSTEM_PROMPT = `You are an AI Legal Assistant designed to support advocates in managing and analyzing case information.

Your role is to analyze case data, notes, and documents provided by the advocate and generate structured insights that help the lawyer quickly understand the case.

You must follow these principles:

1. Accuracy — Only use the information provided in the input. Do not invent facts.
2. Legal Awareness — When possible, identify relevant Indian legal frameworks such as IPC, CrPC, CPC, Indian Evidence Act, and other applicable legal provisions.
3. Professional Structure — Your output must always be clearly structured using headings and bullet points.
4. Advocate Control — The AI output is only a suggestion. The advocate will review and edit the generated content.
5. Confidentiality Awareness — Assume all case data is confidential and should be handled with legal sensitivity.

Your response must always generate the following sections:

1. CASE SUMMARY — Short and clear summary explaining the main issue and situation.
2. KEY CASE POINTS — List the most important facts in bullet points.
3. CASE CHRONOLOGY — Timeline of important events related to the case.
4. RELEVANT LAWS AND LEGAL PROVISIONS — Identify possible legal sections or acts that may apply.
5. POSSIBLE LEGAL CONSIDERATIONS — Legal risks, arguments, or possible legal interpretations.
6. SUGGESTED NEXT STEPS — Actions the advocate might take next.`;

/**
 * Generate AI insights for a case
 * POST /api/ai/generate/:caseId
 */
exports.generateInsights = async (req, res) => {
  const { caseId } = req.params;
  const advocateId = req.advocateId;

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

    // 2. Fetch hearings
    const hearings = await queryPromise(
      'SELECT * FROM hearings WHERE case_id = ? ORDER BY hearing_date DESC',
      [caseId]
    );

    // 3. Fetch notes
    const notes = await queryPromise(
      'SELECT * FROM notes WHERE case_id = ? ORDER BY created_at DESC',
      [caseId]
    );

    // 4. Fetch documents and extract text from PDFs
    const documents = await queryPromise(
      'SELECT * FROM documents WHERE case_id = ?',
      [caseId]
    );

    let documentText = '';
    for (const doc of documents) {
      if (doc.file_path && (doc.file_type?.includes('pdf') || doc.file_path?.endsWith('.pdf'))) {
        try {
          const filePath = path.resolve(doc.file_path.replace(/^\//, ''));
          if (fs.existsSync(filePath)) {
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            if (pdfData.text && pdfData.text.trim()) {
              // Limit text per document to prevent token overflow
              const trimmedText = pdfData.text.trim().substring(0, 3000);
              documentText += `\n--- Document: ${doc.document_name} ---\n${trimmedText}\n`;
            }
          }
        } catch (pdfErr) {
          console.error(`PDF parse error for ${doc.document_name}:`, pdfErr.message);
        }
      }
    }

    // 5. Build the user prompt with all case data
    const hearingsSummary = hearings.length > 0
      ? hearings.map(h => `- ${new Date(h.hearing_date).toLocaleDateString('en-IN')} | Court: ${h.court_hall || 'N/A'} | Judge: ${h.judge_name || 'N/A'} | Status: ${h.status} | Notes: ${h.notes || 'None'}`).join('\n')
      : 'No hearings recorded.';

    const notesSummary = notes.length > 0
      ? notes.map(n => `- ${n.note_text}`).join('\n')
      : 'No advocate notes.';

    const userPrompt = `Analyze the following legal case information and generate structured insights.

CASE INFORMATION
Case Title: ${caseInfo.case_title}
Case Number: ${caseInfo.case_number || 'N/A'}
Case Type: ${caseInfo.case_type || 'N/A'}
Court: ${caseInfo.court_name || 'N/A'}
Status: ${caseInfo.status}
Filing Date: ${caseInfo.filing_date ? new Date(caseInfo.filing_date).toLocaleDateString('en-IN') : 'N/A'}

CLIENT INFORMATION
Name: ${caseInfo.client_name || 'N/A'}
Phone: ${caseInfo.client_phone || 'N/A'}
Email: ${caseInfo.client_email || 'N/A'}
Address: ${caseInfo.client_address || 'N/A'}

HEARINGS
${hearingsSummary}

ADVOCATE NOTES
${notesSummary}

UPLOADED DOCUMENT TEXT
${documentText || 'No document text extracted.'}

Based on the above information, generate a comprehensive analysis with:
1. CASE SUMMARY
2. KEY CASE POINTS
3. CASE CHRONOLOGY
4. RELEVANT LAWS AND LEGAL PROVISIONS
5. POSSIBLE LEGAL CONSIDERATIONS
6. SUGGESTED NEXT STEPS`;

    // 6. Call OpenAI API
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const aiContent = completion.choices[0].message.content;
    const tokensUsed = completion.usage?.total_tokens || 0;
    const modelUsed = completion.model || 'gpt-4.1-mini';

    // 7. Save to database
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
