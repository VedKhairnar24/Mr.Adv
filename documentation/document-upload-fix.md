# Document Upload Fix - Case ID Parameter Mismatch

## 🐛 Issue

When trying to upload a document from the Case Detail page, users received error:
```
"Case ID is required"
```

Even though the case ID was present in the form.

---

## 🔍 Root Cause

**Parameter naming mismatch between frontend and backend:**

**Frontend was sending:**
```javascript
formData.append("caseId", id);  // ❌ camelCase
```

**Backend was expecting:**
```javascript
const { case_id } = req.body;   // ✅ snake_case
```

---

## ✅ Solution Applied

**File Modified:** `frontend/src/pages/CaseDetail.jsx`

**Changed line 51 from:**
```javascript
formData.append("caseId", id);
```

**To:**
```javascript
formData.append("case_id", id);
```

---

## 📋 Technical Details

### Backend Controller (documentController.js)

```javascript
exports.uploadDocument = (req, res) => {
  const { case_id } = req.body;  // Expects snake_case
  const file = req.file;

  // Validate required fields
  if (!case_id) {
    return res.status(400).json({ 
      message: 'Case ID is required' 
    });
  }
  // ... rest of upload logic
};
```

### Frontend Form Data (CaseDetail.jsx)

**Before (Wrong):**
```javascript
const formData = new FormData();
formData.append("file", selectedFile);
formData.append("title", uploadTitle);
formData.append("caseId", id);  // ❌ Wrong format
```

**After (Correct):**
```javascript
const formData = new FormData();
formData.append("file", selectedFile);
formData.append("title", uploadTitle);
formData.append("case_id", id);  // ✅ Correct format
```

---

## 🧪 Testing Steps

1. **Navigate to any case detail page**
   ```
   http://localhost:5173/cases/:id
   ```

2. **Scroll to "Documents" section**

3. **Fill out upload form:**
   - Document Title: "Test Document"
   - Select File: Choose any PDF file

4. **Click "Upload Document"**

5. **Expected Result:**
   - ✅ Green toast notification: "Document uploaded successfully!"
   - ✅ Form clears
   - ✅ Document appears in list below
   - ✅ No errors

---

## 🔑 Key Learning

**Always match parameter naming conventions between frontend and backend:**

- If backend uses **snake_case** (`case_id`, `file_name`, etc.)
- Frontend must send **snake_case** parameters
- NOT camelCase (`caseId`, `fileName`)

This applies to all API endpoints, not just document upload.

---

## 📝 Related Endpoints

All document-related endpoints use `case_id`:

```javascript
// Upload document
POST /api/documents/upload
Body: { case_id, title, file }

// Get documents for case
GET /api/documents/case/:caseId
Params: caseId (in URL)

// Delete document
DELETE /api/documents/:id
Params: id (document ID)
```

---

## ✨ Status

**Issue:** ✅ FIXED

**Files Modified:**
- `frontend/src/pages/CaseDetail.jsx` (line 51)

**Next Steps:**
- Test document upload functionality
- Verify document appears in list
- Check file saved in `backend/uploads/documents/` folder
