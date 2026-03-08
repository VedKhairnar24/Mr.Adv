# Step 4 – Advocate Authentication System ✅ COMPLETE

## What We've Built

✅ **Complete authentication system** with secure password handling and JWT-based authorization.

---

## Files Created

### Controllers
- ✅ `backend/controllers/authController.js` - Authentication business logic
  - `register()` - New advocate registration
  - `login()` - Authenticate and generate JWT token
  - `getProfile()` - Get current user profile (protected)

### Routes
- ✅ `backend/routes/authRoutes.js` - API route definitions
  - `POST /api/auth/register` - Registration endpoint
  - `POST /api/auth/login` - Login endpoint
  - `GET /api/auth/profile` - Protected profile endpoint

### Middleware
- ✅ `backend/middleware/auth.js` - Token verification middleware
  - `authenticateToken()` - Validates JWT tokens for protected routes

### Updated Files
- ✅ `backend/server.js` - Integrated authentication routes

### Documentation
- ✅ `backend/AUTH_API.md` - Complete API documentation
- ✅ `backend/test-auth.http` - Test cases and examples

---

## API Endpoints Summary

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/auth/register` | POST | No | Register new advocate |
| `/api/auth/login` | POST | No | Login and get token |
| `/api/auth/profile` | GET | Yes | Get user profile |

---

## Security Features Implemented

### 1. Password Security
✅ **bcrypt hashing** with 10 salt rounds  
✅ Passwords never stored in plain text  
✅ Secure comparison during login  

### 2. Token-Based Authentication
✅ **JWT (JSON Web Tokens)**  
✅ Token expires after 24 hours  
✅ Contains user ID and email  

### 3. Input Validation
✅ Required field checks  
✅ Proper error messages  
✅ Prevents empty submissions  

### 4. Database Security
✅ **Parameterized queries** (prevents SQL injection)  
✅ Duplicate email handling  
✅ Error handling for database operations  

### 5. Access Control
✅ Protected routes require valid token  
✅ Token verification middleware  
✅ Clear error messages for unauthorized access  

---

## How It Works

### Registration Flow
```
User submits registration form
    ↓
Password is hashed with bcrypt
    ↓
Data inserted into advocates table
    ↓
Success response with advocate ID
```

### Login Flow
```
User submits email and password
    ↓
Find advocate by email
    ↓
Compare passwords with bcrypt
    ↓
Generate JWT token (expires in 24h)
    ↓
Return token + user data (without password)
```

### Protected Route Access
```
Client sends request with Authorization header
    ↓
Middleware extracts token from header
    ↓
Verify token using JWT_SECRET
    ↓
Attach user info to request object
    ↓
Allow access to protected resource
```

---

## Testing Instructions

### 1. Start the Server
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on port 5000
📍 Auth API: http://localhost:5000/api/auth
```

### 2. Test Registration (Postman/Thunder Client)

**POST** `http://localhost:5000/api/auth/register`

**Body (JSON):**
```json
{
  "name": "Ved Khairnar",
  "email": "ved@test.com",
  "password": "123456",
  "phone": "9999999999"
}
```

**Expected Response:**
```json
{
  "message": "Advocate registered successfully",
  "advocateId": 3
}
```

### 3. Test Login

**POST** `http://localhost:5000/api/auth/login`

**Body (JSON):**
```json
{
  "email": "ved@test.com",
  "password": "123456"
}
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "advocate": {
    "id": 3,
    "name": "Ved Khairnar",
    "email": "ved@test.com",
    "phone": "9999999999"
  }
}
```

### 4. Test Protected Profile Route

**GET** `http://localhost:5000/api/auth/profile`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "advocate": {
    "id": 3,
    "name": "Ved Khairnar",
    "email": "ved@test.com",
    "phone": "9999999999",
    "created_at": "2026-03-07T..."
  }
}
```

---

## Code Examples

### Using Authentication in Future Routes

When creating new protected routes, use the middleware:

```javascript
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// Protected route example
router.get('/cases', authenticateToken, (req, res) => {
  // req.advocate contains authenticated user info
  const userId = req.advocate.id;
  
  // Your code here...
});

module.exports = router;
```

### Making Protected API Calls

Frontend example (React):
```javascript
// After login, store token
localStorage.setItem('token', response.data.token);

// For protected requests
const token = localStorage.getItem('token');
axios.get('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Common Issues & Solutions

### Issue 1: "Cannot read property 'split' of undefined"
**Cause:** Authorization header not formatted correctly  
**Solution:** Use `Bearer TOKEN` format (with space between)

### Issue 2: Database connection error
**Cause:** MySQL password not configured or database doesn't exist  
**Solution:** 
1. Update `.env` with correct MySQL password
2. Ensure `advocate_case_db` exists
3. Restart server

### Issue 3: "Email already exists"
**Cause:** Trying to register with existing email  
**Solution:** Either login with existing credentials or use different email

### Issue 4: Token expired
**Cause:** Token is older than 24 hours  
**Solution:** Login again to get fresh token

---

## Verification Checklist

Before moving to next step, ensure:

- [ ] Server runs without errors
- [ ] Database is connected successfully
- [ ] Registration API works (creates new advocate)
- [ ] Registration rejects duplicate emails
- [ ] Login API works (returns JWT token)
- [ ] Login rejects invalid credentials
- [ ] Profile API requires authentication
- [ ] Profile API returns user data with valid token
- [ ] Password is NOT visible in any API response
- [ ] All test cases pass

---

## What's Next?

Now that authentication is complete, we'll build:

### Step 5: Client Management APIs
- Create client records
- Update client information
- Delete clients
- Get all clients for logged-in advocate
- Get single client details

### Step 6: Case Management APIs
- Create new cases
- Assign clients to cases
- Update case status
- Filter cases by type/status
- Case search functionality

### Step 7: File Upload APIs
- Document upload with Multer
- Evidence file uploads
- File organization by case
- Download/delete files

### Step 8: Hearing & Notes APIs
- Schedule court hearings
- Update hearing dates
- Add/edit/delete case notes
- Upcoming hearings list

---

## Key Takeaways

✅ **Security First**: Passwords are hashed, tokens expire  
✅ **Validation**: All inputs are validated before processing  
✅ **Error Handling**: Clear error messages for all scenarios  
✅ **Scalability**: JWT allows stateless authentication  
✅ **Best Practices**: Following industry-standard patterns  

---

## Additional Resources

- **bcryptjs**: https://www.npmjs.com/package/bcryptjs
- **jsonwebtoken**: https://www.npmjs.com/package/jsonwebtoken
- **Express.js**: https://expressjs.com/
- **JWT.io**: https://jwt.io/ (Decode/verify tokens online)

---

**Status:** ✅ Step 4 Complete!

Ready to proceed to Step 5: Client Management System.
