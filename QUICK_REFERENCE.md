# Quick Reference - AI Analysis System

## 🎯 WHAT YOU FOUND

### ✅ AI Analysis WORKS
- AI generates legal insights using OpenAI gpt-4.1-mini
- Takes advocate's manual notes + main points
- Includes saved case notes from database
- Produces 8-section structured analysis
- Stores in `ai_notes` table

### ❌ Documents NOT USED
- Documents uploaded and displayed separately
- NO text extraction from uploaded files
- NO document content sent to AI
- NO mechanism to read files
- Complete disconnection between doc system and AI system

---

## 📁 KEY FILES

| File | Purpose |
|------|---------|
| `backend/controllers/aiController.js` | AI generation logic + OpenAI calls |
| `backend/routes/aiRoutes.js` | 3 endpoints for AI (generate, fetch, delete) |
| `frontend/src/components/AINotes.jsx` | UI component where users input notes & see results |
| `frontend/src/pages/CaseDetail.jsx` | Main case page that contains AINotes |
| `backend/controllers/documentController.js` | Document upload/retrieval (no AI integration) |
| `database/schema.sql` | Tables: documents, ai_notes, case_notes, notes |

---

## 🔌 API ENDPOINTS

### AI Analysis
```
POST /api/ai/generate/:caseId
{
  "notesText": "string",
  "mainPoints": ["array", "of", "points"],
  "includeCaseNotes": true
}

GET /api/ai/notes/:caseId
DELETE /api/ai/notes/:id
```

### Documents
```
POST /api/documents/upload
GET /api/documents/case/:caseId
DELETE /api/documents/:id
```

---

## 💾 DATABASES

### AI System Uses
- `cases` table (case info)
- `notes` table (last 50 notes if includeCaseNotes=true)
- `ai_notes` table (stores generated analyses)

### Documents Use (Separate)
- `documents` table (metadata only, no content)

---

## 🎨 UI FLOW

**Case Detail Page**
```
┌─────────────────────────┐
│   Case Information      │
├─────────────────────────┤
│   Client Information    │
├─────────────────────────┤
│  DocumentList           │ ← Shows uploaded documents
│  (no AI processing)     │
├─────────────────────────┤
│  CaseTimeline           │
├─────────────────────────┤
│  AINotes Component      │ ← Where AI analysis happens
│  ┌───────────────────┐  │
│  │ Detailed Notes    │  │ User enters text here
│  ├───────────────────┤  │
│  │ Main Points       │  │
│  ├───────────────────┤  │
│  │ Include Case Notes│  │
│  │ [x] (count: N)    │  │
│  ├───────────────────┤  │
│  │ GENERATE INSIGHTS │  │ Sends to OpenAI
│  ├───────────────────┤  │
│  │ Analysis Result   │  │
│  │ [Accordion List]  │  │ Shows 8 sections
│  └───────────────────┘  │
└─────────────────────────┘
```

---

## 🤖 AI GENERATION PROCESS

```
1. User enters notes & main points
   ↓
2. Frontend validates (at least 1 required)
   ↓
3. POST to /api/ai/generate/:caseId
   ↓
4. Backend verifies advocate owns case
   ↓
5. Fetches case details from database
   ↓
6. Optionally fetches saved notes from database
   ↓
7. Builds comprehensive prompt
   ↓
8. Sends to OpenAI (gpt-4.1-mini, temp=0.3, max=2200 tokens)
   ↓
9. OpenAI returns 8-section analysis
   ↓
10. Insert into ai_notes table
   ↓
11. Return to frontend
   ↓
12. Frontend displays with section parsing
   ↓
13. User can expand/collapse/delete
```

---

## 🛑 CRITICAL FINDING: Document-AI Disconnection

**Why Documents Aren't Used:**

| Issue | Impact | Fix Needed |
|-------|--------|-----------|
| No file reading | Can't extract text | Add file reader (pdf-parse, etc.) |
| No text extraction | Content never sent to AI | Add extraction logic |
| No parsing logic | Supports only metadata | Add document format support |
| No UI option | User can't choose to include docs | Add checkbox in AINotes |
| Token concerns | Docs = very large = token overflow | Add summarization + warning |
| No AI integration point | Controller doesn't reference documents | Modify aiController.js |

**Example:** If you upload a 50-page PDF contract, AI analysis has NO WAY to see it.

---

## 📊 DATA FLOW VISUALIZATION

```
┌─────────────────────────────────────────┐
│   CURRENT (Working)                     │
├─────────────────────────────────────────┤
│                                         │
│  User Manual Input                      │
│  ├─ Detailed Notes                      │
│  ├─ Main Points                         │
│  └─ Toggle: Include Saved Notes         │
│       ↓                                 │
│  OpenAI Prompt Builder                  │
│  ├─ Case info from DB                   │
│  ├─ User text                           │
│  ├─ Main points                         │
│  └─ Saved notes from notes table        │
│       ↓                                 │
│  OpenAI API (gpt-4.1-mini)              │
│       ↓                                 │
│  8-Section Legal Analysis               │
│       ↓                                 │
│  Store in ai_notes table                │
│       ↓                                 │
│  Display in AINotes Component           │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   DISCONNECTED (Not Working)            │
├─────────────────────────────────────────┤
│                                         │
│  Documents Uploaded by User             │
│       ↓                                 │
│  Store file path in documents table     │
│       ↓                                 │
│  Display in DocumentList Component      │
│       ↓                                 │
│  User can view/delete files             │
│                                         │
│  ❌ NEVER connected to AI               │
│  ❌ NEVER extracted                     │
│  ❌ NEVER sent to OpenAI                │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔑 KEY CODE SNIPPETS

### How AI Prompt is Built

**From aiController.js:**
```javascript
const userPrompt = `Analyze the following legal case notes and generate structured insights.

CASE INFORMATION
Case Title: ${caseInfo.case_title}
Case Number: ${caseInfo.case_number || 'N/A'}
Case Type: ${caseInfo.case_type || 'N/A'}
Court: ${caseInfo.court_name || 'N/A'}
Status: ${caseInfo.status}

ADVOCATE NOTES (DIRECT INPUT)
${normalizedNotesText || 'No direct notes provided.'}

MAIN POINTS (DIRECT INPUT)
${normalizedMainPoints.length > 0 ? normalizedMainPoints.map((point) => `- ${point}`).join('\n') : 'No direct main points provided.'}

SAVED CASE NOTES (DATABASE)
${savedNotesSummary}`;
```

### How Frontend Generates

**From AINotes.jsx:**
```javascript
const generateInsights = async () => {
  const mainPoints = mainPointsText
    .split("\n")
    .map((point) => point.trim())
    .filter(Boolean);

  setGenerating(true);
  const res = await API.post(`/ai/generate/${caseId}`, {
    notesText,
    mainPoints,
    includeCaseNotes,
  });
  
  setNotes((prev) => [
    {
      id: res.data.id,
      content: res.data.content,
      model_used: res.data.model_used,
      tokens_used: res.data.tokens_used,
      created_at: res.data.created_at,
    },
    ...prev,
  ]);
};
```

### How Content is Parsed

**From AINotes.jsx - renderContent():**
```javascript
const isHeader = 
  /^#+\s/.test(trimmed) ||              // Markdown #
  /^\d+\.\s*[A-Z]{2,}/.test(trimmed) || // 1. SECTION
  /^[A-Z][A-Z\s&]{3,}$/.test(trimmed) ||// ALL CAPS
  /^\*\*[A-Z]/.test(trimmed);           // **SECTION**

if (isHeader) {
  currentSection = trimmed
    .replace(/^#+\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/^[\d.]+\s*/, "");
}
```

---

## 📈 STATISTICS

| Metric | Value |
|--------|-------|
| AI Model | gpt-4.1-mini (base-3) |
| Temperature | 0.3 (deterministic) |
| Max Tokens | 2200 |
| Output Sections | 8 (always) |
| Saved Notes Fetched | Last 50 |
| Main Points Max | 30 |
| AI Endpoints | 3 (generate, fetch, delete) |
| Document Endpoints | 4 (upload, get, delete, all) |
| Tables Involved | 5 (cases, notes, ai_notes, case_notes, documents) |

---

## 🚀 NEXT STEPS (If Integrating Documents)

1. **Backend:** Add file reading library
   ```javascript
   npm install pdf-parse    // For PDF
   npm install docx         // For DOCX
   ```

2. **Backend:** Create document extraction endpoint
   ```javascript
   POST /api/documents/extract/:documentId
   Returns: { text: "extracted content" }
   ```

3. **Frontend:** Add "Include Documents" checkbox in AINotes

4. **Backend:** Modify aiController to:
   ```javascript
   if (includeDocuments) {
     // Fetch document file paths
     // Read and extract text
     // Add to prompt with token warning
   }
   ```

5. **UI:** Add token counter
   ```
   Estimated tokens: 1200 / 2200
   [Reduce documents] [Generate]
   ```

---

## 📝 SUMMARY

**Current State:**
- ✅ AI analysis fully functional
- ✅ Takes user notes + main points
- ✅ Integrates saved case notes
- ✅ Generates 8-section legal analysis
- ❌ Documents completely separate
- ❌ No file content extraction
- ❌ No document-AI connection

**Priority Enhancement:**
Connect documents to AI system by extracting text and including in prompt (with token management).
