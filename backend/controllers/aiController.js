const { generateInsight, analyzeDocumentOnly, generateRealDocumentInsights } = require('../services/aiService');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { chunkText, cleanText } = require('../utils/chunkText');

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
      return pdfData.text.substring(0, 3000); // Limit to 3000 chars
    } else if (ext === '.txt') {
      const text = fs.readFileSync(fullPath, 'utf-8');
      return text.substring(0, 3000);
    } else if (ext === '.doc' || ext === '.docx') {
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
    // Helper function for database queries
    const queryPromise = (query, values = []) => {
      return new Promise((resolve, reject) => {
        db.query(query, values, (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      });
    };

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
      }
    }

    if (!normalizedNotesText && normalizedMainPoints.length === 0 && savedNotes.length === 0 && !documentContent) {
      return res.status(400).json({
        message: 'Please provide at least one source: notes, main points, documents, or enable saved case notes for AI analysis.'
      });
    }

    // 5. Determine analysis type: Use REAL document insights if documents provided, else generic analysis
    console.log('🤖 Calling AI service with Hugging Face...');
    
    let aiResponse;
    
    // If documents are provided, use REAL document insights (extract actual facts, structured format)
    if (documentContent && documentContent.trim().length > 0) {
      console.log('📄 Using REAL document-based insights (actual extraction, structured output)...');
      
      // Extract just the document text for analysis (not mixed with other inputs)
      const cleanedDocumentContent = cleanText(documentContent);
      
      // Use the new real document insights generator for better structured output
      aiResponse = await generateRealDocumentInsights(cleanedDocumentContent, {
        temperature: 0.2, // Lower temperature for factual output
        maxTokens: 2500,
        timeout: 20000,
      });
      
      console.log(`✅ Real document insights complete - Structured format with bullet points and summary`);
    } else {
      // If NO documents, use generic insight generation from notes
      console.log('📝 Using generic analysis from notes/main points...');
      
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

Based on the above information, generate a comprehensive analysis with:
1. CASE SUMMARY
2. MAIN FACTS AND KEY POINTS
3. CASE CHRONOLOGY
4. LEGAL ISSUES IDENTIFIED
5. RELEVANT LAWS AND SECTIONS
6. ARGUMENT DIRECTIONS
7. EVIDENCE GAPS
8. ACTION PLAN FOR ADVOCATE`;

      aiResponse = await generateInsight([
        { role: 'system', content: 'You are an AI Legal Assistant designed to support advocates by analyzing case notes and providing actionable legal guidance.' },
        { role: 'user', content: userPrompt },
      ], {
        temperature: 0.3,
        maxTokens: 2500,
        timeout: 20000,
      });
      
      console.log(`✅ Generic analysis generated via ${aiResponse.provider}`);
    }

    const aiContent = aiResponse.insight;
    const provider = aiResponse.provider;
    const status = aiResponse.status;
    const analysisType = documentContent ? 'real_document_insights' : 'generic_analysis';

    console.log(`✅ AI Analysis generated via ${provider} (${status})`);

    // 6. Save to database
    const insertResult = await queryPromise(
      'INSERT INTO ai_notes (case_id, note_type, content, model_used, tokens_used) VALUES (?, ?, ?, ?, ?)',
      [caseId, analysisType, aiContent, provider, aiResponse.tokensUsed || 0]
    );

    res.json({
      message: 'AI insights generated successfully',
      id: insertResult.insertId,
      content: aiContent,
      model_used: provider,
      tokens_used: aiResponse.tokensUsed || 0,
      api_status: status,
      analysis_type: analysisType,
      is_document_based: documentContent ? true : false,
      created_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('🚨 AI generation error:', {
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({ 
      message: 'Failed to generate AI insights', 
      error: error.message,
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
