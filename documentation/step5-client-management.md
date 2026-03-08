# Step 5 – JWT Middleware & Client Management API ✅ COMPLETE

## What We've Built

✅ **Complete client management system** with JWT-protected routes and user data isolation.

---

## Files Created

### Middleware
- ✅ `backend/middleware/authMiddleware.js` - JWT token verification
  - Extracts token from Authorization header
  - Decodes advocate ID
  - Attaches user info to request object

### Controllers
- ✅ `backend/controllers/clientController.js` - Client business logic
  - `createClient()` - Create new client
  - `getClients()` - Get all clients for advocate
  - `getClientById()` - Get single client
  - `updateClient()` - Update client info
  - `deleteClient()` - Delete client and related data

### Routes
- ✅ `backend/routes/clientRoutes.js` - Client API endpoints
  - POST `/api/clients/create` (protected)
  - GET `/api/clients/all` (protected)
  - GET `/api/clients/:id` (protected)
  - PUT `/api/clients/:id` (protected)
  - DELETE `/api/clients/:id` (protected)

### Updated Files
- ✅ `backend/server.js` - Integrated client routes

### Documentation
- ✅ `backend/CLIENT_API.md` - Complete API documentation
- ✅ `documentation/step5-client-management.md` - This summary

---

## API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/clients/create` | POST | ✅ | Create new client |
| `/api/clients/all` | GET | ✅ | Get all clients |
| `/api/clients/:id` | GET | ✅ | Get single client |
| `/api/clients/:id` | PUT | ✅ | Update client |
| `/api/clients/:id` | DELETE | ✅ | Delete client |

**All routes require JWT authentication**

---

## Key Features Implemented

### 1. JWT Middleware Protection
✅ **Token Verification**: All client routes protected  
✅ **User Isolation**: Each advocate sees only their clients  
✅ **Secure Data Access**: Prevents cross-user data access  

### 2. Client CRUD Operations
✅ **Create**: Add new clients with validation  
✅ **Read**: Fetch all or single client  
✅ **Update**: Modify client information  
✅ **Delete**: Remove client and cascade delete related data  

### 3. Data Security
✅ **Advocate ID from Token**: Cannot be spoofed  
✅ **Database Constraints**: Foreign key enforcement  
✅ **Cascade Delete**: Automatic cleanup of related data  

### 4. Error Handling
✅ **Validation Errors**: Missing required fields  
✅ **Authentication Errors**: Invalid/missing tokens  
✅ **Not Found Errors**: Client doesn't exist  
✅ **Database Errors**: Proper error messages  

---

## How the Middleware Works

```javascript
// Request comes in with Authorization header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ↓
// Middleware extracts and verifies token
const decoded = jwt.verify(token, JWT_SECRET);
    ↓
// Advocate ID attached to request
req.advocateId = decoded.id;
    ↓
// Route handler can now safely use req.advocateId
db.query('SELECT * FROM clients WHERE advocate_id = ?', [req.advocateId]);
```

This ensures:
- Users cannot access other users' data
- Advocate ID comes from trusted source (JWT)
- No manual passing of user IDs needed

---

## Testing Instructions

### Prerequisites
1. Server must be running: `npm run dev`
2. You need a valid JWT token from login

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

### Step 2: Create a Client

**POST** `http://localhost:5000/api/clients/create`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Rahul Sharma",
  "phone": "8888888888",
  "email": "rahul@test.com",
  "address": "Mumbai"
}
```

**Expected Response:**
```json
{
  "message": "Client added successfully",
  "clientId": 5
}
```

### Step 3: Get All Clients

**GET** `http://localhost:5000/api/clients/all`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
[
  {
    "id": 5,
    "advocate_id": 3,
    "name": "Rahul Sharma",
    "phone": "8888888888",
    "email": "rahul@test.com",
    "address": "Mumbai",
    "created_at": "2026-03-07T..."
  }
]
```

### Step 4: Test Without Token

Try accessing any client endpoint WITHOUT the Authorization header.

**Expected Response:**
```json
{
  "message": "Token required"
}
```

This proves the middleware is working!

---

## Code Examples

### Using Client APIs in Frontend (React Example)

```javascript
// After login, store token
const token = localStorage.getItem('token');

// Create client
const createClient = async (clientData) => {
  const response = await fetch('http://localhost:5000/api/clients/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(clientData)
  });
  
  return await response.json();
};

// Get all clients
const getClients = async () => {
  const response = await fetch('http://localhost:5000/api/clients/all', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};

// Update client
const updateClient = async (id, updatedData) => {
  const response = await fetch(`http://localhost:5000/api/clients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updatedData)
  });
  
  return await response.json();
};

// Delete client
const deleteClient = async (id) => {
  const response = await fetch(`http://localhost:5000/api/clients/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

---

## Database Flow

When you create a client:
```
Advocate logs in → Gets JWT token
    ↓
Sends POST request with token
    ↓
Middleware verifies token → Extracts advocate_id = 3
    ↓
Controller uses advocate_id to create client
    ↓
INSERT INTO clients (advocate_id=3, name, phone, email, address)
    ↓
Client saved with advocate_id = 3
    ↓
Future queries filter WHERE advocate_id = 3
```

When fetching clients:
```
GET /api/clients/all with token
    ↓
Middleware extracts advocate_id = 3
    ↓
Query: SELECT * FROM clients WHERE advocate_id = 3
    ↓
Returns ONLY clients belonging to advocate 3
```

This prevents User A from seeing User B's clients!

---

## Verification Checklist

Before moving to next step, ensure:

- [ ] JWT middleware is working (rejects requests without token)
- [ ] Create client works with valid token
- [ ] Create client validates required fields (name, phone)
- [ ] Get all clients returns only your clients
- [ ] Get single client works
- [ ] Update client works
- [ ] Delete client works
- [ ] Cannot access other advocates' clients
- [ ] Cascade delete removes related cases/documents

---

## Common Issues & Solutions

### Issue 1: "Cannot read property 'split' of undefined"
**Cause:** Authorization header format wrong  
**Solution:** Use `Bearer TOKEN` (with space)

### Issue 2: Getting other users' clients
**Cause:** Not filtering by advocate_id in query  
**Solution:** Always use `WHERE advocate_id = ?` with token's ID

### Issue 3: Token expired
**Cause:** Token older than 24 hours  
**Solution:** Login again for fresh token

### Issue 4: Client created but shows duplicate entry
**Cause:** Trying to insert same data twice  
**Solution:** This is normal - each client should be unique

---

## Security Best Practices Implemented

✅ **Never trust client-side user IDs** - Always extract from JWT  
✅ **Always filter by owner ID** - WHERE advocate_id = ?  
✅ **Validate ownership before operations** - Check client belongs to user  
✅ **Use parameterized queries** - Prevent SQL injection  
✅ **Return meaningful errors** - Don't expose sensitive info  

---

## What's Next?

Now that we have secure client management, we'll build:

### Step 6: Case Management APIs
- Create cases linked to clients
- Update case status
- Filter cases by type/status
- Case search functionality

### Step 7: Document & Evidence Upload
- File upload with Multer
- Organize files by case
- Download/delete files
- Support multiple file types

### Step 8: Hearing & Notes Management
- Schedule court hearings
- Manage hearing dates
- Add/edit/delete case notes
- Upcoming hearings list

---

## Key Takeaways

✅ **Multi-tenant Architecture**: Each user's data is isolated  
✅ **JWT Middleware**: Reusable authentication pattern  
✅ **CRUD Operations**: Full create/read/update/delete  
✅ **Data Integrity**: Foreign keys enforce relationships  
✅ **Security First**: Token-based auth for all operations  

---

**Status:** ✅ Step 5 Complete!

Your backend now supports secure multi-user client management with proper data isolation!

Ready to proceed to Step 6: Case Management System.
