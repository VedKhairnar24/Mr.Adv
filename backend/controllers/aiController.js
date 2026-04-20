const OpenAI = require('openai');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Helper: Make OpenAI API call with fallback to backup key
async function callOpenAIWithFallback(messages, options = {}) {
  const primaryKey = process.env.OPENAI_API_KEY;
  const backupKey = process.env.OPENAI_API_KEY_BACKUP;

  if (!primaryKey) {
    throw new Error('OpenAI API key not configured. Add OPENAI_API_KEY to your .env file.');
  }

  // Try primary key first
  try {
    console.log('🔄 Attempting AI request with primary API key');
    const openai = new OpenAI({ apiKey: primaryKey });
    const completion = await openai.chat.completions.create({
      messages,
      temperature: 0.3,
      max_tokens: 2200,
      ...options,
    });
    console.log('✓ Successfully used primary API key');
    return { completion, keyUsed: 'primary' };
  } catch (error) {
    console.error('❌ Primary API key error:', {
      status: error.status,
      code: error.code,
      message: error.message,
      type: error.type,
    });

    // Check if it's a quota/billing error
    const isQuotaError = error.status === 402 || 
                         error.code === 'insufficient_quota' || 
                         error.code === 'billing_quota_exceeded' ||
                         error.message?.includes('quota') ||
                         error.message?.includes('billing') ||
                         error.message?.includes('insufficient');

    if (isQuotaError && backupKey) {
      console.warn('⚠️ Primary API key quota exceeded, attempting backup key...');
      try {
        const openai = new OpenAI({ apiKey: backupKey });
        const completion = await openai.chat.completions.create({
          messages,
          temperature: 0.3,
          max_tokens: 2200,
          ...options,
        });
        console.log('✓ Successfully used backup API key');
        return { completion, keyUsed: 'backup' };
      } catch (backupError) {
        console.error('❌ Backup API key also failed:', {
          status: backupError.status,
          code: backupError.code,
          message: backupError.message,
        });
        throw new Error('Both primary and backup API keys failed. ' + backupError.message);
      }
    }
    
    // If not a quota error or no backup key, throw original error
    console.error('🚨 Throwing error - not quota related or no backup key');
    throw error;
  }
}

// Helper: Extract text from document files
async function extractDocumentText(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const fullPath = path.resolve(filePath);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(fullPath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text.substring(0, 3000); // Limit to 3000 chars to preserve tokens
    } else if (ext === '.txt') {
      const text = fs.readFileSync(fullPath, 'utf-8');
      return text.substring(0, 3000);
    } else if (ext === '.doc' || ext === '.docx') {
      // Basic support - read as text if possible
      // For full DOCX support, would need docx library
      const text = fs.readFileSync(fullPath, 'utf-8').split('\0').join('');
      return text.substring(0, 3000);
    }
  } catch (error) {
    console.error('Error extracting document text:', error.message);
    return null;
  }
}

// System prompt for legal AI assistant
const SYSTEM_PROMPT = `You are an AI Legal Assistant designed to support advocates by analyzing case notes, documents, and extracting practical legal guidance.

Your role is to analyze advocate-provided notes, key points, and attached case documents, then generate a clear and actionable legal analysis.

You must follow these principles:

1. Accuracy — Use only the facts present in the notes, key points, and documents. Do not invent facts.
2. Document Analysis — When case documents are provided, extract key information, legal language, and factual details.
3. Legal Awareness — Identify relevant Indian legal frameworks such as IPC, BNS, CrPC, BNSS, CPC, Indian Evidence Act, and BSA where applicable.
4. Professional Structure — Your output must always be clearly structured using headings and bullet points.
5. Advocate Control — The AI output is a legal drafting aid. The advocate will review and edit the output.
6. Confidentiality Awareness — Assume all case data is confidential and should be handled with legal sensitivity.

Your response must always generate the following sections:

1. CASE SUMMARY — Short and clear summary explaining the main issue and situation.
2. MAIN FACTS AND KEY POINTS — Consolidated bullet points from notes and documents.
3. CASE CHRONOLOGY — Timeline of events inferred from the notes and documents.
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
  const { notesText, mainPoints, includeCaseNotes, documentIds } = req.body || {};

  try {
    // Verify API keys are configured
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

    // 4. Extract text from documents if provided
    let documentContent = '';
    if (Array.isArray(documentIds) && documentIds.length > 0) {
      try {
        const documents = await queryPromise(
          `SELECT id, document_name, file_path FROM documents 
           WHERE id IN (${documentIds.map(() => '?').join(',')}) 
           AND case_id = ? 
           LIMIT 10`,
          [...documentIds, caseId]
        );

        for (const doc of documents) {
          const text = await extractDocumentText(doc.file_path);
          if (text) {
            documentContent += `\n\n--- Document: ${doc.document_name} ---\n${text}`;
          }
        }
      } catch (error) {
        console.error('Error processing documents:', error.message);
        // Continue even if document processing fails
      }
    }

    if (!normalizedNotesText && normalizedMainPoints.length === 0 && savedNotes.length === 0 && !documentContent) {
      return res.status(400).json({
        message: 'Please provide at least one source: notes, main points, documents, or enable saved case notes for AI analysis.'
      });
    }

    const userPrompt = `Analyze the following legal case notes and generate structured insights.

CASE INFORMATION
Case Title: ${caseInfo.case_title}
Case Number: ${caseInfo.case_number || 'N/A'}
Case Type: ${caseInfo.case_type || 'N/A'}
Court: ${caseInfo.court_name || 'N/A'}
Client: ${caseInfo.client_name || 'N/A'}
Status: ${caseInfo.status}
Filing Date: ${caseInfo.filing_date ? new Date(caseInfo.filing_date).toLocaleDateString('en-IN') : 'N/A'}

ADVOCATE NOTES (DIRECT INPUT)
${normalizedNotesText || 'No direct notes provided.'}

MAIN POINTS (DIRECT INPUT)
${normalizedMainPoints.length > 0 ? normalizedMainPoints.map((point) => `- ${point}`).join('\n') : 'No direct main points provided.'}

SAVED CASE NOTES (DATABASE)
${savedNotesSummary}

ATTACHED DOCUMENTS CONTENT
${documentContent || 'No documents provided.'}

Based on the above information, generate a comprehensive analysis with:
1. CASE SUMMARY
2. MAIN FACTS AND KEY POINTS
3. CASE CHRONOLOGY
4. LEGAL ISSUES IDENTIFIED
5. RELEVANT LAWS AND SECTIONS
6. ARGUMENT DIRECTIONS
7. EVIDENCE GAPS
8. ACTION PLAN FOR ADVOCATE`;

    // 5. Call OpenAI API with fallback support
    const { completion, keyUsed } = await callOpenAIWithFallback([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ], { model: 'gpt-4.1-mini' });

    const aiContent = completion.choices[0].message.content;
    const tokensUsed = completion.usage?.total_tokens || 0;
    const modelUsed = completion.model || 'gpt-4.1-mini';

    console.log(`AI Analysis generated using ${keyUsed} API key - Tokens: ${tokensUsed}`);

    // 6. Save to database
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
      api_key_used: keyUsed,
      created_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('🚨 AI generation error:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      stack: error.stack,
    });

    // Handle API key errors
    if (error.status === 401 || error.code === 'invalid_api_key' || error.message?.includes('invalid_api_key')) {
      return res.status(401).json({ message: 'Invalid OpenAI API key. Check your .env file.' });
    }
    
    // Handle rate limit errors
    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      return res.status(429).json({ message: 'OpenAI rate limit exceeded. Please try again later.' });
    }
    
    // Handle quota errors
    if (error.status === 402 || 
        error.code === 'insufficient_quota' || 
        error.code === 'billing_quota_exceeded' ||
        error.message?.includes('quota') ||
        error.message?.includes('billing')) {
      return res.status(402).json({ message: 'Both primary and backup OpenAI API keys have reached quota limits. Please check your OpenAI account.' });
    }

    // Generic error
    res.status(500).json({ 
      message: 'Failed to generate AI insights', 
      error: error.message,
      code: error.code 
    });
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
