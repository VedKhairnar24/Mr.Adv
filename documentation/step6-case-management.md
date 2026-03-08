# Step 6 – Case Management APIs ✅ COMPLETE

## What We've Built

✅ **Complete case management system** with full CRUD operations and client-case relationships.

---

## Files Created

### Controllers
- ✅ `backend/controllers/caseController.js` - Case business logic
  - `createCase()` - Create new case with client verification
  - `getCases()` - Get all cases with client names
  - `getCaseById()` - Get single case with full details
  - `updateCaseStatus()` - Update case status only
  - `updateCase()` - Update complete case information
  - `deleteCase()` - Delete case and cascade delete related data

### Routes
- ✅ `backend/routes/caseRoutes.js` - Case API endpoints
  - POST `/api/cases/create` (protected)
  - GET `/api/cases/all` (protected)
  - GET `/api/cases/:id` (protected)
  - PUT `/api/cases/status/:id` (protected)
  - PUT `/api/cases/:id` (protected)
  - DELETE `/api/cases/:id` (protected)

### Updated Files
- ✅ `backend/server.js` - Integrated case routes

### Documentation
- ✅ `backend/CASE_API.md` - Complete API documentation
- ✅ `documentation/step6-case-management.md` - This summary

---

## API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/cases/create` | POST | ✅ | Create new case |
| `/api/cases/all` | GET | ✅ | Get all cases |
| `/api/cases/:id` | GET | ✅ | Get single case |
| `/api/cases/status/:id` | PUT | ✅ | Update status |
| `/api/cases/:id` | PUT | ✅ | Update case info |
| `/api/cases/:id` | DELETE | ✅ | Delete case |

**All routes require JWT authentication**

---

## Key Features Implemented

### 1. Client-Case Relationship
✅ **Client Verification**: Verifies client belongs to advocate before creating case  
✅ **JOIN Queries**: Fetches client names with case details  
✅ **Data Integrity**: Foreign key constraints enforced  

### 2. Case CRUD Operations
✅ **Create**: Add new cases with validation  
✅ **Read**: Fetch all or single case with client info  
✅ **Update**: Modify case status or complete information  
✅ **Delete**: Remove case and cascade delete related data  

### 3. Data Security
✅ **Advocate ID from Token**: Cannot be spoofed  
✅ **User Isolation**: Each advocate sees only their cases  
✅ **Ownership Verification**: Client ownership checked  

### 4. Status Management
✅ **Standard Values**: Pending, Active, On Hold, Closed, Disposed  
✅ **Validation**: Only valid status values accepted  
✅ **Separate Endpoint**: Quick status update route  

### 5. Error Handling
✅ **Validation Errors**: Missing required fields  
✅ **Authentication Errors**: Invalid/missing tokens  
✅ **Not Found Errors**: Case or client doesn't exist  
✅ **Database Errors**: Proper error messages  

---

## How the System Works

### Creating a Case Flow
```
Advocate logs in → Gets JWT token
    ↓
Sends POST request with case data
    ↓
Middleware verifies token → Extracts advocate_id = 3
    ↓
Verify client belongs to advocate (WHERE id = ? AND advocate_id = ?)
    ↓
Insert case with advocate_id = 3
    ↓
Case saved with owner reference
    ↓
Future queries filter WHERE advocate_id = 3
```

### Getting Cases Flow
```
GET /api/cases/all with token
    ↓
Middleware extracts advocate_id = 3
    ↓
Query with JOIN: 
SELECT cases.*, clients.name AS client_name
FROM cases
JOIN clients ON cases.client_id = clients.id
WHERE cases.advocate_id = 3
    ↓
Returns cases with client names
```

### Cascade Delete Flow
```
DELETE case with ID = 5
    ↓
Database automatically deletes:
  - Documents (WHERE case_id = 5)
  - Evidence (WHERE case_id = 5)
  - Hearings (WHERE case_id = 5)
  - Notes (WHERE case_id = 5)
    ↓
Case deleted cleanly
```

---

## Testing Instructions

### Prerequisites
1. Server must be running: `npm run dev`
2. You need a valid JWT token from login
3. At least one client should exist

### Step 1: Login to Get Token

**POST** `http://localhost:5000/api/auth/login`

```json
{
  "email": "ved@test.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "advocate": { ... }
}
```

**Copy the token!**

### Step 2: Create a Case

**POST** `http://localhost:5000/api/cases/create`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "client_id": 1,
  "case_title": "Rahul vs State",
  "case_number": "CR12345",
  "court_name": "District Court Mumbai",
  "case_type": "Criminal",
  "filing_date": "2026-03-07"
}
```

**Expected Response:**
```json
{
  "message": "Case created successfully",
  "caseId": 5
}
```

### Step 3: Get All Cases

**GET** `http://localhost:5000/api/cases/all`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
[
  {
    "id": 5,
    "client_id": 1,
    "advocate_id": 3,
    "case_title": "Rahul vs State",
    "case_number": "CR12345",
    "court_name": "District Court Mumbai",
    "case_type": "Criminal",
    "status": "Pending",
    "filing_date": "2026-03-07",
    "created_at": "2026-03-07T...",
    "updated_at": "2026-03-07T...",
    "client_name": "Rahul Sharma"
  }
]
```

### Step 4: Update Case Status

**PUT** `http://localhost:5000/api/cases/status/5`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "status": "Active"
}
```

**Expected Response:**
```json
{
  "message": "Case status updated successfully"
}
```

### Step 5: Get Single Case Details

**GET** `http://localhost:5000/api/cases/5`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "id": 5,
  "client_id": 1,
  "advocate_id": 3,
  "case_title": "Rahul vs State",
  "case_number": "CR12345",
  "court_name": "District Court Mumbai",
  "case_type": "Criminal",
  "status": "Active",
  "filing_date": "2026-03-07",
  "created_at": "2026-03-07T...",
  "updated_at": "2026-03-07T...",
  "client_name": "Rahul Sharma",
  "client_phone": "8888888888",
  "client_email": "rahul@test.com"
}
```

---

## Code Examples

### Using Case APIs in Frontend (React Example)

```javascript
// After login, store token
const token = localStorage.getItem('token');

// Create case
const createCase = async (caseData) => {
  const response = await fetch('http://localhost:5000/api/cases/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(caseData)
  });
  
  return await response.json();
};

// Get all cases
const getCases = async () => {
  const response = await fetch('http://localhost:5000/api/cases/all', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};

// Update case status
const updateCaseStatus = async (caseId, status) => {
  const response = await fetch(`http://localhost:5000/api/cases/status/${caseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  
  return await response.json();
};

// Get single case
const getCaseById = async (caseId) => {
  const response = await fetch(`http://localhost:5000/api/cases/${caseId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

---

## Database Relationships

### Table Structure
```
clients (parent table)
    ↓
    └── cases (child table)
            ↓
            ├── documents
            ├── evidence
            ├── hearings
            └── notes
```

### Foreign Keys
```sql
-- Cases reference clients
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE

-- Cases reference advocates
FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE

-- Child tables reference cases
FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
```

This ensures:
- A case cannot exist without a client
- Deleting a client removes all their cases
- Deleting a case removes all related documents, evidence, etc.

---

## Verification Checklist

Before moving to next step, ensure:

- [ ] Create case works with valid client
- [ ] Create case rejects invalid client_id
- [ ] Get all cases returns only your cases
- [ ] Get single case includes client details
- [ ] Update status changes case status
- [ ] Update case modifies all fields
- [ ] Delete case removes record
- [ ] Cascade delete removes related data
- [ ] Cannot access other advocates' cases

---

## Common Issues & Solutions

### Issue 1: "Client not found or does not belong to you"
**Cause:** Trying to use a client_id that doesn't exist or belongs to another advocate  
**Solution:** First create a client, then use that client's ID

### Issue 2: "Invalid status"
**Cause:** Using non-standard status value  
**Solution:** Use one of: Pending, Active, On Hold, Closed, Disposed

### Issue 3: "Token expired"
**Cause:** Token older than 24 hours  
**Solution:** Login again for fresh token

### Issue 4: Case created but client name missing in list
**Cause:** Client was deleted after case creation  
**Solution:** Check if client still exists, or handle NULL in query

---

## Security Best Practices Implemented

✅ **Never trust client-side user IDs** - Always extract from JWT  
✅ **Always filter by owner ID** - WHERE advocate_id = ?  
✅ **Verify parent ownership** - Check client belongs to user  
✅ **Use parameterized queries** - Prevent SQL injection  
✅ **Return meaningful errors** - Don't expose sensitive info  
✅ **Cascade delete carefully** - Verify before deletion  

---

## What's Next?

Now that we have complete case management, we'll build:

### Step 7: Document & Evidence Upload APIs
- File upload with Multer
- Organize files by case
- Download/delete files
- Support multiple file types (PDF, images, videos, audio)

### Step 8: Hearing & Notes Management
- Schedule court hearings
- Manage hearing dates
- Add/edit/delete case notes
- Upcoming hearings list

---

## Key Takeaways

✅ **Multi-tenant Architecture**: Each user's cases are isolated  
✅ **Client-Case Relationship**: Proper foreign key enforcement  
✅ **CRUD Operations**: Full create/read/update/delete  
✅ **Data Integrity**: Cascade delete maintains clean database  
✅ **Security First**: Token-based auth for all operations  
✅ **Status Tracking**: Standard workflow states  

---

**Status:** ✅ Step 6 Complete!

Your backend now supports the complete legal case workflow with proper client relationships and data isolation!

Ready to proceed to Step 7: Document & Evidence Management.
