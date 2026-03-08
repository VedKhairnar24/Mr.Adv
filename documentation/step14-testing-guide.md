# Testing Guide - Case Management Module

## Quick Test Checklist

### Prerequisites
- ✅ Backend server running on port 5000
- ✅ Frontend running on port 5173
- ✅ Database is set up and connected
- ✅ You have at least one registered user account

---

## Step-by-Step Testing

### 1. Login to the System

```
URL: http://localhost:5173/login
Email: your-email@example.com
Password: your-password
```

Click "Login" → Should redirect to Dashboard

---

### 2. Navigate to Cases Page

**Option A:** Click on navigation menu (if available)
**Option B:** Direct URL: `http://localhost:5173/cases`

You should see:
- Page title "Cases"
- "+ New Case" button
- Empty state message (if no cases exist)

---

### 3. Create a Client First (If Not Exists)

Before creating a case, you need a client:

1. Go to Clients page: `http://localhost:5173/clients`
2. Click "Add Client" or similar button
3. Fill in client details:
   - Name: "John Smith"
   - Email: "john@example.com"
   - Phone: "1234567890"
   - Address: "123 Main St"
4. Save the client
5. **Note the Client ID** (usually shown in the list, typically starts from 1)

---

### 4. Create Your First Case

1. Click "+ New Case" button
2. Fill in the form:

```
Client ID: 1 (or the ID from step 3)
Case Title: Smith v. Johnson Corporation
Case Number: CV-2024-001
Court Name: High Court of Delhi
Case Type: Civil
Filing Date: 2024-01-15
```

3. Click "Create Case" button
4. You should see:
   - Success alert: "Case created successfully!"
   - Form closes automatically
   - New case appears in the table

---

### 5. Verify Case Appears in List

Check the table shows:
- ✅ Case Title: "Smith v. Johnson Corporation"
- ✅ Client Name: "John Smith" (auto-populated from database)
- ✅ Case Number: "CV-2024-001"
- ✅ Court: "High Court of Delhi"
- ✅ Type: "Civil"
- ✅ Status: "Pending" (default status with yellow badge)

---

### 6. Create More Test Cases

Create 2-3 more cases with different data:

**Case 2:**
```
Client ID: 1
Case Title: State v. Williams
Case Number: CR-2024-050
Court Name: District Court
Case Type: Criminal
Status: Active
```

**Case 3:**
```
Client ID: 1
Case Title: Property Dispute - Sharma Estate
Case Number: PROP-2024-012
Court Name: Civil Court
Case Type: Property
Status: On Hold
```

---

### 7. Test Delete Functionality

1. Find a case in the table
2. Click "Delete" button
3. Confirm the action in the dialog
4. Case should disappear from the table
5. Success alert: "Case deleted successfully!"

---

### 8. Test Form Validation

Try creating a case with missing required fields:

**Test 1:** Empty Client ID
- Should show validation error or fail gracefully

**Test 2:** Empty Case Title
- HTML5 validation should prevent submission

**Test 3:** Empty Court Name
- HTML5 validation should prevent submission

---

### 9. Test UI States

**Loading State:**
- Refresh the page
- You should see a loading spinner
- Text: "Loading cases..."

**Empty State:**
- Delete all cases (if any)
- Should show empty state illustration
- Message: "No cases found"
- "Create Case" button

**Error State:**
- Stop the backend server
- Try to load cases
- Should show error message

---

### 10. Test Responsive Design

1. Open browser DevTools (F12)
2. Toggle device toolbar
3. Test different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1024px+)
4. Table should be scrollable on mobile
5. Form should stack vertically on smaller screens

---

## API Testing (Optional)

### Using Browser DevTools

1. Open DevTools → Network tab
2. Perform actions in the app
3. Check API requests:

**Get Cases:**
```
Request URL: http://localhost:5000/api/cases/all
Method: GET
Headers: Authorization: Bearer <token>
Response: Array of cases
```

**Create Case:**
```
Request URL: http://localhost:5000/api/cases/create
Method: POST
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json
Body: {
  "client_id": 1,
  "case_title": "Test Case",
  "case_number": "TC-001",
  "court_name": "Test Court",
  "case_type": "Civil",
  "filing_date": "2024-01-15"
}
Response: { "message": "Case created successfully", "caseId": 1 }
```

**Delete Case:**
```
Request URL: http://localhost:5000/api/cases/1
Method: DELETE
Headers: Authorization: Bearer <token>
Response: { "message": "Case deleted successfully" }
```

---

## Expected Results Summary

| Feature | Expected Behavior | Status |
|---------|------------------|--------|
| Page Load | Shows cases table or empty state | ⬜ |
| Create Case | Form appears, saves to database | ⬜ |
| View Cases | Table displays all case details | ⬜ |
| Delete Case | Confirmation dialog, removes case | ⬜ |
| Validation | Required fields enforced | ⬜ |
| Loading State | Spinner shows while fetching | ⬜ |
| Error Handling | User-friendly error messages | ⬜ |
| Responsive | Works on mobile/tablet/desktop | ⬜ |
| Status Badges | Color-coded by status | ⬜ |

---

## Common Issues & Solutions

### Issue 1: "Failed to load cases"
**Solution:** 
- Check if backend is running
- Verify database connection
- Check browser console for errors

### Issue 2: "Client not found"
**Solution:**
- Create a client first in Clients page
- Use correct Client ID

### Issue 3: "Unauthorized" or "Token expired"
**Solution:**
- Logout and login again
- Clear localStorage if needed

### Issue 4: Form doesn't submit
**Solution:**
- Check all required fields are filled
- Check browser console for validation errors
- Verify network request in DevTools

---

## Success Criteria

✅ All tests pass
✅ No console errors
✅ Smooth user experience
✅ Data persists in database
✅ Proper error handling
✅ Responsive design works

---

## Performance Checklist

- [ ] Page loads within 2 seconds
- [ ] Form submission is instant
- [ ] Delete action confirms immediately
- [ ] No lag when scrolling through cases
- [ ] Loading states appear appropriately

---

**Testing Completed:** ___________  
**Tester Name:** ___________  
**Issues Found:** ___________  
**Overall Status:** ⬜ Pass / ⬜ Fail
