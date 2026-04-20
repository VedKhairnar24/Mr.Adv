# AI Analysis & Insights System - Complete Documentation

**Project:** Mr. Adv Case Management System  
**Date:** April 20, 2026  
**Status:** AI system operational, documents not integrated

---

## EXECUTIVE SUMMARY

The system has a **functioning AI analysis engine** that generates legal insights for cases using **OpenAI's gpt-4.1-mini model**. However, **documents are completely disconnected** from this AI analysis - they're stored in the database but never read or sent to the AI.

### Key Stats
- **AI Model Used:** gpt-4.1-mini (3 base model)
- **Max Tokens:** 2200 per analysis
- **Temperature:** 0.3 (deterministic)
- **Output Format:** 8 structured sections
- **Access Control:** All operations require JWT authentication
- **Document Integration:** ❌ **NOT implemented** (critical gap)

---

## SECTION 1: AI GENERATION LOGIC

### 1.1 Backend Controller: `aiController.js`

**Location:** `backend/controllers/aiController.js`

**Main Endpoint:** 
```
POST /api/ai/generate/:caseId
```

**Key Function:** `exports.generateInsights = async (req, res)`

#### What It Does:
1. Verifies advocate ownership of the case
2. Fetches case metadata (title, number, court, client info)
3. Normalizes user input (notes and main points)
4. Optionally fetches up to 50 saved case notes from database
5. Builds comprehensive prompt with all data
6. Sends to OpenAI API
7. Stores result in `ai_notes` table
8. Returns response to frontend

#### System Prompt (Always Included)
```
You are an AI Legal Assistant designed to support advocates by analyzing case 
notes and extracting practical legal guidance.

Principles:
1. Accuracy — Use only facts in notes. Do not invent.
2. Legal Awareness — Identify Indian legal frameworks (IPC, BNS, CrPC, BNSS, CPC, 
   Indian Evidence Act, BSA)
3. Professional Structure — Use headings and bullet points
4. Advocate Control — Output is a drafting aid; advocate reviews/edits
5. Confidentiality Awareness — All case data is confidential

Always generate 8 sections:
1. CASE SUMMARY
2. MAIN FACTS AND KEY POINTS
3. CASE CHRONOLOGY
4. LEGAL ISSUES IDENTIFIED
5. RELEVANT LAWS AND SECTIONS
6. ARGUMENT DIRECTIONS
7. EVIDENCE GAPS
8. ACTION PLAN FOR ADVOCATE
```

### 1.2 Request Parameters

**Sent in POST body:**
```javascript
{
  notesText: "String of advocate's detailed notes about the case",
  mainPoints: ["Array", "of", "key", "points"],  // Max 30 items
  includeCaseNotes: true  // Boolean - whether to pull from saved notes
}
```

**Extracted from JWT token:**
- `advocateId` - Verified from authentication middleware

**From URL parameter:**
- `caseId` - Case to analyze

### 1.3 Data Aggregated into Prompt

The final prompt sent to OpenAI includes:

```
CASE INFORMATION
- Case Title (from cases table)
- Case Number (from cases table)
- Case Type (from cases table)
- Court Name (from cases table)
- Status (from cases table)
- Filing Date (from cases table)
- Client Name (from clients table)
- Client Phone (from clients table)
- Client Email (from clients table)
- Client Address (from clients table)

ADVOCATE NOTES (DIRECT INPUT)
- User's typed notes (notesText parameter)

MAIN POINTS (DIRECT INPUT)
- User's line-separated main points (mainPoints array)

SAVED CASE NOTES (DATABASE)
- Last 50 records from notes table for this case
- One note per bullet point
- Only if includeCaseNotes === true
```

### 1.4 OpenAI API Call

**Configuration:**
```javascript
openai.chat.completions.create({
  model: 'gpt-4.1-mini',
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt }
  ],
  temperature: 0.3,      // Deterministic, not creative
  max_tokens: 2200       // Limit response length
})
```

**Response Processing:**
- Extracts `completion.choices[0].message.content` (the AI analysis)
- Records `completion.usage?.total_tokens` (for tracking)
- Records `completion.model` (always gpt-4.1-mini)

### 1.5 Database Storage

**Table: `ai_notes`**
```sql
CREATE TABLE ai_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    note_type VARCHAR(50) NOT NULL DEFAULT 'full_analysis',
    content LONGTEXT NOT NULL,          -- Full AI response
    model_used VARCHAR(100),            -- e.g., 'gpt-4.1-mini'
    tokens_used INT,                    -- Token count
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);
```

**Insert Query:**
```javascript
INSERT INTO ai_notes (case_id, note_type, content, model_used, tokens_used) 
VALUES (caseId, 'full_analysis', aiContent, modelUsed, tokensUsed)
```

### 1.6 Error Handling

The controller handles specific errors:
- **401**: Invalid OpenAI API key
- **429**: Rate limit exceeded
- **402**: Billing quota exceeded
- **404**: Case not found or access denied
- **400**: Missing notes/main points
- **500**: Generic server error

---

## SECTION 2: FRONTEND COMPONENT - AINotes

### 2.1 Component File: `frontend/src/components/AINotes.jsx`

**Props:**
```javascript
<AINotes caseId={id} />
```

**Required:** `caseId` (string or number)

### 2.2 State Management

```javascript
const [notes, setNotes] = useState([]);          // AI analyses history
const [loading, setLoading] = useState(true);    // Initial fetch loading
const [generating, setGenerating] = useState(false); // Generation in progress
const [expanded, setExpanded] = useState(null);  // Which accordion item open
const [notesText, setNotesText] = useState("");  // User's detailed notes input
const [mainPointsText, setMainPointsText] = useState(""); // Main points (line-sep)
const [includeCaseNotes, setIncludeCaseNotes] = useState(true); // Checkbox state
const [savedCaseNotesCount, setSavedCaseNotesCount] = useState(0); // UI display
```

### 2.3 API Calls

#### Fetch AI Notes
```javascript
GET /api/ai/notes/${caseId}
Response: Array of ai_notes records
```

#### Generate AI Analysis
```javascript
POST /api/ai/generate/${caseId}
Body: {
  notesText: string,
  mainPoints: string[],
  includeCaseNotes: boolean
}
Response: {
  id: number,
  content: string,
  model_used: string,
  tokens_used: number,
  created_at: ISO datetime
}
```

#### Delete AI Note
```javascript
DELETE /api/ai/notes/${id}
Response: { message: 'AI note deleted successfully' }
```

#### Fetch Saved Case Notes Count
```javascript
GET /notes/${caseId}
Response: Array of notes (used to count)
```

### 2.4 User Input Flow

1. **Detailed Notes Section**
   - Textarea for advocate to describe case facts
   - Placeholder: "Add factual background, incident details, statements, dates..."
   - No character limit enforced (server normalizes to trim())

2. **Main Points Section**
   - Textarea with one point per line
   - Placeholder shows example format
   - Split on `\n` and filtered for empty strings

3. **Include Case Notes Checkbox**
   - Toggle to include up to 50 saved notes
   - Shows count of available notes
   - Enabled by default

4. **Generate Button**
   - Shows "ANALYZING..." with spinner while processing
   - Validates at least one input required
   - Shows error toast if validation fails
   - Shows success toast on completion

### 2.5 Content Parsing & Rendering

**Parse Logic in `renderContent()`:**

```javascript
// Detect headers (various formats supported)
- Markdown headers: # SECTION NAME
- Numbered: 1. SECTION NAME
- All-caps: SECTION NAME
- Bold: **SECTION NAME**

// Process lines:
- Remove empty lines
- Detect separator lines (---, ===)
- Convert bullets to unified format (•)
- Group by section
```

**Rendering:**
```javascript
// Each section rendered as:
<h3 className="text-xs font-bold tracking-wider text-gold">
  {sectionName}
</h3>
<div className="text-sm text-slate-300">
  {bulletPoints.map(item => <p>{item}</p>)}
</div>
```

### 2.6 UI Components

**Accordion Layout:**
- Header button for each analysis
- Shows: date created, model used, token count
- Delete button for each analysis
- Expand/collapse with animation

**Visual States:**
- Loading: Spinner
- Empty: "No AI analysis generated yet"
- With results: Expandable accordion

---

## SECTION 3: API ROUTES & ENDPOINTS

### 3.1 AI Routes: `backend/routes/aiRoutes.js`

```javascript
router.post('/generate/:caseId', verifyToken, aiController.generateInsights);
// POST /api/ai/generate/:caseId
// Generates AI analysis for case

router.get('/notes/:caseId', verifyToken, aiController.getNotes);
// GET /api/ai/notes/:caseId
// Retrieves all AI analyses for case

router.delete('/notes/:id', verifyToken, aiController.deleteNote);
// DELETE /api/ai/notes/:id
// Deletes specific AI analysis
```

**Middleware:** `verifyToken` - validates JWT and sets `req.advocateId`

---

## SECTION 4: DOCUMENTS SYSTEM (Currently Unused by AI)

### 4.1 Document Storage

**Database Table: `documents`**
```sql
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),              -- e.g., 'application/pdf'
    file_size INT,                      -- bytes
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);
```

### 4.2 Document APIs

**Upload Document**
```
POST /api/documents/upload
Body: form-data
  - case_id: number
  - file: File object
```

**Get Documents for Case**
```
GET /api/documents/case/:caseId
Response: Array of document records
```

**Delete Document**
```
DELETE /api/documents/:id
```

### 4.3 Frontend: DocumentList Component

**Location:** `frontend/src/components/DocumentList.jsx`

**Displays:**
- Table of documents
- Document name, upload date
- View button (opens file in browser)
- Delete button
- Document count badge

**Never reads file content** - only displays metadata

### 4.4 Why Documents Are NOT Used by AI

**Critical Gap - Reasons:**

1. ❌ **No file reading mechanism** - Backend can't read uploaded files
2. ❌ **No text extraction** - No PDF parsing or OCR
3. ❌ **No format support** - Only metadata stored, not content
4. ❌ **No integration point** - AI controller doesn't reference documents
5. ❌ **No UI option** - No checkbox to "include documents"
6. ❌ **Token concerns** - Document content would be huge (could exceed limits)
7. ❌ **File paths only** - Database stores file paths, not content

**What Would Be Needed:**
- File reading library (e.g., pdf-parse for PDFs, docx for Word)
- Text extraction logic in backend
- Modification to AI prompt building
- UI checkbox to include/exclude documents
- Token counting to warn of limits
- Possible document summarization to reduce tokens

---

## SECTION 5: NOTES SYSTEM (Different from AI Notes)

### 5.1 Three Note Types in System

**Table 1: `notes` (Basic notes)**
```sql
CREATE TABLE notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```
- Simple key-value storage
- Used in AI generation (fetched if `includeCaseNotes=true`)

**Table 2: `case_notes` (Organized advocate notes)**
```sql
CREATE TABLE case_notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    case_id INT,
    advocate_id INT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'General',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```
- Rich structured notes
- Types: Client Meeting, Court Observation, Legal Research, Strategy Note, Task, General
- Managed via Notes.jsx page

**Table 3: `ai_notes` (AI generated)**
```sql
CREATE TABLE ai_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'full_analysis',
    content LONGTEXT NOT NULL,
    model_used VARCHAR(100),
    tokens_used INT,
    created_at TIMESTAMP
);
```
- AI-generated analyses
- Immutable (can only delete, not edit)

### 5.2 Notes.jsx Page

**Location:** `frontend/src/pages/Notes.jsx`

**Display:**
- All `case_notes` for advocate (not AI notes)
- Grid layout of note cards
- Searchable by title, content, case
- Filterable by note type
- Shows up to 4 lines of content per card

---

## SECTION 6: INTEGRATION IN CASE DETAIL PAGE

### 6.1 Layout Structure

**File:** `frontend/src/pages/CaseDetail.jsx`

**Two-column layout:**

**Left Column (Main Content):**
1. Case Information Card
2. Client Information Card
3. DocumentList Component
4. CaseTimeline Component
5. AINotes Component ← **AI Analysis goes here**

**Right Column (Sidebar):**
1. AddHearing Component
2. HearingList Component

### 6.2 Data Flow in CaseDetail

```
CaseDetail Component
    ↓
    ├─→ DocumentList (case documents only)
    │
    ├─→ CaseTimeline (hearings/timeline)
    │
    └─→ AINotes (AI analysis for case)
           ↓
           ├─→ GET /api/ai/notes/:caseId
           │
           └─→ POST /api/ai/generate/:caseId (on user action)
```

---

## SECTION 7: AUTHENTICATION & ACCESS CONTROL

### 7.1 JWT Token Flow

1. User logs in (authController)
2. JWT token issued containing `advocateId`
3. Token sent in `Authorization: Bearer {token}` header
4. `verifyToken` middleware extracts `advocateId`
5. All API calls verify `req.advocateId` ownership

### 7.2 Security Checks

**In AI Generation:**
```javascript
// Verify case belongs to advocate
SELECT id FROM cases 
WHERE id = ? AND advocate_id = ?
```

**In AI Notes Fetch:**
```javascript
// Same verification before returning notes
```

**In Note Deletion:**
```javascript
// Verify via case relationship
SELECT an.id FROM ai_notes an
JOIN cases c ON an.case_id = c.id
WHERE an.id = ? AND c.advocate_id = ?
```

---

## SECTION 8: DATABASE SCHEMA OVERVIEW

```
advocates (id, name, email, password, phone)
    ↓
clients (id, advocate_id, name, phone, email, address)
    ↓
cases (id, client_id, advocate_id, case_title, case_number, ...)
    ├─→ documents (id, case_id, document_name, file_path, ...)
    ├─→ ai_notes (id, case_id, note_type, content, model_used, tokens_used)
    ├─→ case_notes (id, case_id, advocate_id, note_type, title, content)
    ├─→ notes (id, case_id, note_text)
    ├─→ hearings (id, case_id, hearing_date, judge_name, ...)
    ├─→ evidence (id, case_id, evidence_type, file_path, ...)
    └─→ courts (id, advocate_id, court_name, location)
```

---

## SECTION 9: CURRENT LIMITATIONS & GAPS

### 9.1 Document-AI Disconnection

| Aspect | Status |
|--------|--------|
| Document upload | ✅ Works |
| Document display in UI | ✅ Works |
| Document retrieval for AI | ❌ **Not implemented** |
| Document content extraction | ❌ **Not implemented** |
| File parsing (PDF, DOCX) | ❌ **Not implemented** |
| OCR/Text recognition | ❌ **Not implemented** |
| UI option to include docs | ❌ **Not implemented** |
| Token management for docs | ❌ **Not implemented** |

### 9.2 Other Limitations

- Max 50 saved case notes pulled (configurable but not exposed)
- No document summarization (would help with token limits)
- No streaming response (waits for full response)
- No retry logic for failed generations
- No rate limiting on AI requests
- No cost tracking (tokens yes, but no cost calculation)

---

## SECTION 10: USAGE EXAMPLES

### 10.1 How to Generate AI Analysis (User Perspective)

1. Navigate to a case in Case Detail page
2. Scroll to "AI Legal Analysis" section
3. In "Detailed Notes" field, paste case background:
   ```
   Plaintiff filed case on 5 Jan 2026. Defendant failed to appear 
   for first hearing on 15 Jan 2026. Adjournment granted for 22 Jan 2026.
   ```
4. In "Main Points" field, enter key points (one per line):
   ```
   Defendant non-appearance at first hearing
   Adjournment granted till 22 Jan 2026
   Need to prepare counter-arguments for next hearing
   ```
5. Optionally check "Include saved case notes" (checked by default)
6. Click "GENERATE AI INSIGHTS"
7. Wait for analysis (usually 5-15 seconds)
8. View formatted analysis with sections
9. Can delete and regenerate as needed

### 10.2 What Output Looks Like

```
CASE SUMMARY
The plaintiff initiated a civil case against the defendant, scheduled 
for first hearing on 15 January 2026, which resulted in adjournment 
to 22 January 2026 due to defendant's non-appearance...

MAIN FACTS AND KEY POINTS
• Plaintiff filed case on 5 January 2026
• Defendant absent at first hearing (15 January 2026)
• Adjournment granted for 22 January 2026
• Need to develop counter-arguments for next hearing

CASE CHRONOLOGY
5 January 2026: Case filed
15 January 2026: First hearing - defendant non-appearance
22 January 2026: Next hearing scheduled (expected)

LEGAL ISSUES IDENTIFIED
• Procedural compliance and case management
• Defendant's right to appear and be heard
• Grounds for dismissal or continuance

RELEVANT LAWS AND SECTIONS
• CPC Section 142 - Adjournment
• CPC Section 88 - Appearance of defendant
• CPC Section 343 - Hearing not to be postponed

ARGUMENT DIRECTIONS
For Plaintiff:
• Emphasize proper notice given to defendant
• Highlight procedural compliance
For Defendant:
• Explain reasons for non-appearance
• Request further adjournment if needed

EVIDENCE GAPS
• Proof of notice to defendant (summons/service records)
• Actual reasons for defendant's non-appearance
• Defendant's counter-arguments or reply

ACTION PLAN FOR ADVOCATE
1. Collect proof of service/summons to defendant
2. Prepare opening statements for 22 Jan hearing
3. Anticipate defendant's defenses
4. Prepare evidence required for next hearing
5. Review CPC provisions on adjournment
```

---

## SECTION 11: FILES INVOLVED

### Backend Files
- `backend/controllers/aiController.js` - Main AI logic
- `backend/routes/aiRoutes.js` - AI endpoints
- `backend/controllers/documentController.js` - Document management
- `backend/routes/documentRoutes.js` - Document endpoints
- `backend/controllers/noteController.js` - Note management
- `backend/routes/noteRoutes.js` - Note endpoints
- `backend/middleware/authMiddleware.js` - JWT verification

### Frontend Files
- `frontend/src/components/AINotes.jsx` - AI analysis component
- `frontend/src/pages/CaseDetail.jsx` - Case detail page
- `frontend/src/components/DocumentList.jsx` - Document display
- `frontend/src/pages/Notes.jsx` - Notes list page
- `frontend/src/services/api.js` - API client

### Database Files
- `database/schema.sql` - Full schema with ai_notes table

---

## SECTION 12: RECOMMENDATIONS

### Priority 1: Connect Documents to AI (High Impact)
1. Add file reading in backend (pdf-parse, etc.)
2. Extract text from uploaded documents
3. Add UI checkbox: "Include documents in analysis"
4. Include document excerpts in prompt
5. Add token warning if too many documents

### Priority 2: Improve AI Output (Medium Impact)
1. Add cost tracking (tokens → $)
2. Implement streaming response (better UX)
3. Add document summarization before AI
4. Expose configuration limits (saved notes, max tokens)

### Priority 3: Enhanced UX (Low-Medium Impact)
1. Pre-fill AI input from case notes
2. Allow AI note editing/refinement
3. Export AI analysis to document
4. Compare multiple AI analyses
5. AI analysis history/versioning

---

## APPENDIX: Configuration

### Environment Variables Required
```
OPENAI_API_KEY=sk-...
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=...
DATABASE_NAME=advocate_case_db
```

### OpenAI Settings (Configurable in aiController.js)
```javascript
model: 'gpt-4.1-mini'          // Change model here
temperature: 0.3                // Change creativity (0-1)
max_tokens: 2200                // Change response length
```

### Database Query Limits (In aiController.js)
```javascript
LIMIT 50  // Saved notes to fetch - Can be increased
```

---

**End of Documentation**
