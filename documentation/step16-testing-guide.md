# Quick Test Guide - Step 16 Document Upload

## 🚀 Start Both Servers

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
✅ Backend running on `http://localhost:5000`

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend running on `http://localhost:5173`

---

## 📋 Step-by-Step Tests

### Test 1: Navigate to Documents Page

1. Open browser: `http://localhost:5173/documents`
2. Login if needed
3. You should see:
   - Page title: "Document Management"
   - Upload form with case dropdown
   - Drag-and-drop file area
   - Empty documents section (if no cases selected)

### Test 2: Select a Case

1. Click "Select Case" dropdown
2. You should see list of cases from database
3. Format: "Case Title (Case Number) - Client Name"
4. Select any case
5. Documents list should load (may be empty)

**Expected:**
- ✅ Cases appear in dropdown
- ✅ First case auto-selected (if available)
- ✅ Documents section updates

### Test 3: Upload a Document

**Prepare a test file:**
- PDF file (< 10MB), OR
- Word document (.doc or .docx, < 10MB)

**Upload process:**
1. Click on drag-and-drop area
2. Browse to your file
3. Select the file
4. You should see:
   - File name displayed
   - File size shown
   - Upload button enabled

5. Click "Upload Document"
6. Button shows: "Uploading..." with spinner
7. Success message appears (green)
8. Document appears in list below

**Expected Result:**
```
┌─────────────────────────────────┐
│ ✓ Document uploaded successfully│
├─────────────────────────────────┤
│ Documents for This Case (1 doc) │
├─────────────────────────────────┤
│ 📄 your-file.pdf                │
│    245 KB • Uploaded: Just now  │
│                     [View] [Delete] │
└─────────────────────────────────┘
```

### Test 4: View the Document

1. Click "View" button next to document
2. Document should open in new tab
3. URL should be: `http://localhost:5000/uploads/documents/[filename].pdf`
4. Document displays correctly in browser

### Test 5: Delete the Document

1. Click "Delete" button
2. Confirmation dialog appears
3. Click "OK"
4. Document disappears from list
5. Success message: "Document deleted successfully"

### Test 6: Test File Type Validation

**Try uploading wrong file type:**

1. Select an image file (.jpg, .png)
2. OR select executable (.exe, .bat)
3. Error message should appear (red):
   - "Only PDF and Word documents (.pdf, .doc, .docx) are allowed"
4. Upload button should be disabled
5. File input resets

### Test 7: Test File Size Validation

**Try uploading large file (> 10MB):**

1. Select file larger than 10MB
2. Error message appears:
   - "File size must be less than 10MB"
3. Upload prevented

### Test 8: Test Required Fields

**Without selecting case:**
1. Don't select a case (keep dropdown at "Choose...")
2. Try to upload file
3. Should fail (button disabled or error)

**Without selecting file:**
1. Select a case
2. Don't select file
3. Try to upload
4. Should fail (button disabled)

### Test 9: Multiple Documents

**Upload multiple documents:**

1. Upload first document → Success
2. Upload second document → Success
3. Check documents list shows both
4. Count should update: "2 documents"

### Test 10: Switch Between Cases

1. Upload document to Case A
2. Change dropdown to Case B
3. Documents list should update
4. Shows only Case B's documents
5. Switch back to Case A
6. Original documents reappear

---

## 🔍 What to Verify

### Visual Elements
- [ ] Page loads without errors
- [ ] Form styled correctly
- [ ] Drag-and-drop area visible
- [ ] Icons display properly
- [ ] Loading spinners work
- [ ] Success/error messages show

### Functionality
- [ ] Cases populate in dropdown
- [ ] File selection works
- [ ] Upload button enables/disables
- [ ] Progress indicator shows
- [ ] Documents list updates
- [ ] View opens document
- [ ] Delete with confirmation
- [ ] Validation prevents bad files

### Backend Verification

**Check uploads folder:**
```bash
cd backend/uploads/documents
ls -la
```

You should see uploaded files with names like:
```
1710234567890-123456789-contract.pdf
1710234599123-987654321-agreement.docx
```

**Check database:**
```sql
USE advocate_case_db;
SELECT * FROM documents ORDER BY uploaded_at DESC LIMIT 5;
```

Should show records with:
- id
- case_id
- document_name
- file_path
- file_type
- file_size
- uploaded_at

---

## ❌ Common Issues & Fixes

### Issue: "No cases available"

**Cause:** No cases in database

**Fix:**
1. Go to Cases page
2. Create a test case first
3. Return to Documents page
4. Refresh

### Issue: Upload fails with 401 error

**Cause:** Token expired

**Fix:**
1. Logout
2. Login again
3. Retry upload

### Issue: Document doesn't appear in list

**Causes:**
- Database insert failed
- Wrong case_id
- API error

**Fixes:**
1. Check browser console for errors
2. Verify file exists in uploads folder
3. Check database has record
4. Refresh page

### Issue: Cannot view document (404)

**Cause:** Static serving not configured

**Fix:**
1. Verify server.js has: `app.use('/uploads', express.static('uploads'));`
2. Check file path in database matches actual location
3. Restart backend server

### Issue: Drag-and-drop not working

**Cause:** Browser limitation or event handler issue

**Workaround:**
- Use click-to-browse instead
- Check browser console for errors

---

## ✅ Expected Results Summary

| Test | Expected Result | Status |
|------|----------------|--------|
| Page Load | Form displays | ⬜ |
| Case Selection | Dropdown populated | ⬜ |
| File Selection | Name/size shown | ⬜ |
| Upload Success | Green message + list update | ⬜ |
| View Document | Opens in new tab | ⬜ |
| Delete Document | Removed from list | ⬜ |
| Type Validation | Rejects non-PDF/DOC | ⬜ |
| Size Validation | Rejects >10MB files | ⬜ |
| Multiple Uploads | All appear in list | ⬜ |
| Case Switching | List updates correctly | ⬜ |

---

## 📊 Test Data Examples

### Good Test Files:
- ✅ `contract.pdf` (245 KB)
- ✅ `agreement.docx` (180 KB)
- ✅ `court_order.pdf` (520 KB)
- ✅ `petition.doc` (95 KB)

### Bad Test Files:
- ❌ `photo.jpg` (wrong type)
- ❌ `video.mp4` (wrong type)
- ❌ `huge_file.pdf` (25 MB - too big)
- ❌ `program.exe` (executable - blocked)

---

## 🎯 Quick Validation Commands

### Check Multer Installation
```bash
cd backend
npm list multer
```
Should show: `multer@2.1.1`

### Check Uploads Folder Exists
```bash
ls backend/uploads/documents
ls backend/uploads/evidence
```

### Test API Directly (with token)
```bash
# Get token from browser console
# In DevTools: console.log(localStorage.getItem('token'))

curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/your/file.pdf" \
  -F "case_id=1"
```

---

## 📝 Test Report Template

```
Test Date: ___________
Tester: ___________

Backend Server: ✅ Running / ❌ Not Running
Frontend Server: ✅ Running / ❌ Not Running
Uploads Folder: ✅ Exists / ❌ Missing

Page Loads: ✅ Pass / ❌ Fail
Case Selection: ✅ Pass / ❌ Fail
File Upload: ✅ Pass / ❌ Fail
View Document: ✅ Pass / ❌ Fail
Delete Document: ✅ Pass / ❌ Fail
Type Validation: ✅ Pass / ❌ Fail
Size Validation: ✅ Pass / ❌ Fail

Files Uploaded: _____
Documents in DB: _____

Issues Found:
_________________________________
_________________________________

Overall Status: ✅ Pass / ❌ Fail
```

---

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ Can select a case from dropdown
2. ✅ Can choose a PDF/Word file
3. ✅ Upload completes successfully
4. ✅ Success message appears
5. ✅ Document shows in list
6. ✅ Can view the document
7. ✅ Can delete the document
8. ✅ Validation blocks invalid files
9. ✅ No console errors
10. ✅ Files saved in uploads folder

---

**Ready to test! Navigate to `http://localhost:5173/documents` and start uploading!** 🚀
