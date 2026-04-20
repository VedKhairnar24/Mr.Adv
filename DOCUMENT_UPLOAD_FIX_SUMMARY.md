# Document Upload Issue - Root Cause Analysis & Fix

## 🔴 Problems Found

### Problem 1: Missing Upload Directories
**Issue:** The upload directories `uploads/documents/` and `uploads/evidence/` did not exist.
- Multer attempted to save files to non-existent directories, causing ENOENT (file not found) errors
- You could see errors in the backend logs: `Error: ENOENT: no such file or directory`

**Location:** `backend/uploads/`

**Fix Applied:** Created the missing directories:
```
✅ backend/uploads/documents/  (created)
✅ backend/uploads/evidence/   (created)
```

---

### Problem 2: Incorrect Content-Type Header in API Service
**Issue:** The axios instance in `frontend/src/services/api.js` was setting a default `Content-Type: application/json` header globally.

**Why this breaks FormData uploads:**
- When uploading files using FormData, the browser must set `Content-Type: multipart/form-data` WITH a boundary parameter
- Example: `Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW`
- Setting the header to just `application/json` removes this critical boundary
- Without the boundary, the backend cannot parse the FormData correctly, and multer fails silently

**Location:** `frontend/src/services/api.js` (lines 7-9)

**Old Code:**
```javascript
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',  // ❌ BREAKS FormData
  },
});
```

**Fix Applied:**
```javascript
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  // ✅ Removed default Content-Type header
});

// Interceptor now handles Content-Type intelligently
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // ✅ Only set JSON header for non-FormData requests
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  } else {
    // ✅ Remove header for FormData - let browser set it with boundary
    delete config.headers['Content-Type'];
  }
  
  return config;
});
```

---

### Problem 3: Explicit Content-Type in FormData Request
**Issue:** In `frontend/src/pages/Documents.jsx`, the upload request was explicitly setting the Content-Type header even for FormData.

**Location:** `frontend/src/pages/Documents.jsx` (lines 148-150)

**Old Code:**
```javascript
await API.post("/documents/upload", formData, {
  headers: { "Content-Type": "multipart/form-data" },  // ❌ BREAKS: No boundary!
});
```

**Fix Applied:**
```javascript
// ✅ Removed explicit headers parameter
await API.post("/documents/upload", formData);
// Browser & axios now handle Content-Type automatically with proper boundary
```

---

### Problem 4: No Directory Auto-Creation in Multer
**Issue:** If directories got deleted or didn't exist on a fresh checkout, multer would fail.

**Location:** `backend/middleware/uploadMiddleware.js`

**Fix Applied:** Added automatic directory creation:
```javascript
const fs = require('fs');

// ✅ Ensure directories exist before starting server
const ensureUploadDirsExist = () => {
  const dirs = ['uploads', 'uploads/documents', 'uploads/evidence'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Call during initialization
ensureUploadDirsExist();
```

---

## ✅ Files Modified

| File | Changes |
|------|---------|
| `frontend/src/services/api.js` | Removed default Content-Type header, added smart detection for FormData |
| `frontend/src/pages/Documents.jsx` | Removed explicit Content-Type header from upload request |
| `backend/middleware/uploadMiddleware.js` | Added auto-create directory functionality |
| `backend/uploads/documents/` | Created directory |
| `backend/uploads/evidence/` | Created directory |

---

## 🧪 Testing the Fix

### Steps to Test Document Upload:

1. **Start Backend** (if not already running):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (if not already running):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Upload:**
   - Navigate to Document Management page
   - Select a case from the dropdown
   - Click on the upload area or drag & drop a PDF/DOC/DOCX file (< 10MB)
   - Click "Upload Document"
   - You should see success message and the file in the list

4. **Verify Files:**
   - Check `backend/uploads/documents/` - should contain your uploaded files
   - Verify files can be downloaded/viewed

---

## 🔍 How Document Upload Flow Works (Now Fixed)

```
1. User selects file in frontend
   ↓
2. FormData created with file + case_id
   ↓
3. axios.post() sends request
   ↓
4. Interceptor (api.js) detects FormData
   ↓
5. Content-Type header removed (browser sets it with boundary)
   ↓
6. Backend receives multipart/form-data with correct boundary
   ↓
7. Multer parses FormData correctly
   ↓
8. File saved to: uploads/documents/{timestamp}-{random}.{ext}
   ↓
9. Metadata saved to: documents table
   ↓
10. Success response sent to frontend
    ↓
11. Frontend shows success message & reloads document list
```

---

## 📋 Common Upload Errors (Now Fixed)

| Error | Cause | Status |
|-------|-------|--------|
| "No file uploaded" | multer couldn't parse FormData | ✅ FIXED |
| ENOENT directory error | Missing uploads/documents directory | ✅ FIXED |
| 400 Bad Request | Wrong Content-Type boundary | ✅ FIXED |
| File not visible after upload | Directory didn't exist | ✅ FIXED |

---

## 🚀 Next Steps

- Test document uploads thoroughly
- If you encounter any issues, check:
  1. Backend console for errors
  2. Browser Network tab to verify multipart/form-data content type
  3. `backend/uploads/documents/` directory has files

- Similarly, the Evidence upload (once frontend is created) will benefit from these fixes
