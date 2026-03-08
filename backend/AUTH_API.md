# Authentication API Documentation

## Base URL
```
http://localhost:5000/api/auth
```

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new advocate | No |
| POST | `/login` | Login and get JWT token | No |
| GET | `/profile` | Get user profile | Yes |

---

## 1. Register New Advocate

**Endpoint:** `POST /api/auth/register`

**Description:** Register a new advocate account with email, password, and phone number.

### Request Body (JSON)
```json
{
  "name": "Ved Khairnar",
  "email": "ved@test.com",
  "password": "123456",
  "phone": "9999999999"
}
```

### Required Fields
- `name` (string): Full name of the advocate
- `email` (string): Unique email address
- `password` (string): Minimum 6 characters recommended

### Optional Fields
- `phone` (string): Contact number

### Success Response (201 Created)
```json
{
  "message": "Advocate registered successfully",
  "advocateId": 1
}
```

### Error Responses

**400 Bad Request - Missing Fields**
```json
{
  "message": "Name, email, and password are required"
}
```

**409 Conflict - Email Already Exists**
```json
{
  "message": "Email already exists"
}
```

**500 Internal Server Error**
```json
{
  "message": "Registration failed",
  "error": "Error message details"
}
```

---

## 2. Login Advocate

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate advocate and receive JWT token for accessing protected routes.

### Request Body (JSON)
```json
{
  "email": "ved@test.com",
  "password": "123456"
}
```

### Required Fields
- `email` (string): Registered email address
- `password` (string): Account password

### Success Response (200 OK)
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "advocate": {
    "id": 1,
    "name": "Ved Khairnar",
    "email": "ved@test.com",
    "phone": "9999999999"
  }
}
```

### Token Usage
Use the returned token in the Authorization header for protected routes:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Error Responses

**400 Bad Request - Missing Fields**
```json
{
  "message": "Email and password are required"
}
```

**401 Unauthorized - Invalid Credentials**
```json
{
  "message": "Invalid email or password"
}
```

**500 Internal Server Error**
```json
{
  "message": "Login failed",
  "error": "Error message details"
}
```

---

## 3. Get User Profile (Protected)

**Endpoint:** `GET /api/auth/profile`

**Description:** Retrieve the profile information of the currently authenticated advocate.

### Headers Required
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### Success Response (200 OK)
```json
{
  "advocate": {
    "id": 1,
    "name": "Ved Khairnar",
    "email": "ved@test.com",
    "phone": "9999999999",
    "created_at": "2026-03-07T12:00:00.000Z"
  }
}
```

### Error Responses

**401 Unauthorized - No Token**
```json
{
  "message": "Access denied. No token provided."
}
```

**401 Unauthorized - Token Expired**
```json
{
  "message": "Token expired"
}
```

**403 Forbidden - Invalid Token**
```json
{
  "message": "Invalid token"
}
```

**404 Not Found**
```json
{
  "message": "Advocate not found"
}
```

---

## Testing with Postman

### Step 1: Register a User

1. Create new POST request
2. URL: `http://localhost:5000/api/auth/register`
3. Go to **Body** tab → Select **raw** → Choose **JSON**
4. Enter:
   ```json
   {
     "name": "Ved Khairnar",
     "email": "ved@test.com",
     "password": "123456",
     "phone": "9999999999"
   }
   ```
5. Click **Send**
6. Expected: `"message": "Advocate registered successfully"`

### Step 2: Login

1. Create new POST request
2. URL: `http://localhost:5000/api/auth/login`
3. Go to **Body** tab → Select **raw** → Choose **JSON**
4. Enter:
   ```json
   {
     "email": "ved@test.com",
     "password": "123456"
   }
   ```
5. Click **Send**
6. Copy the `token` from response

### Step 3: Access Protected Route

1. Create new GET request
2. URL: `http://localhost:5000/api/auth/profile`
3. Go to **Headers** tab
4. Add header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN_HERE` (paste your token)
5. Click **Send**
6. Expected: User profile data

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ved Khairnar",
    "email": "ved@test.com",
    "password": "123456",
    "phone": "9999999999"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ved@test.com",
    "password": "123456"
  }'
```

### Get Profile (with token)
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Security Features Implemented

✅ **Password Hashing**: bcrypt with 10 salt rounds  
✅ **JWT Tokens**: Secure token-based authentication  
✅ **Token Expiration**: Tokens expire after 24 hours  
✅ **Duplicate Email Check**: Prevents duplicate registrations  
✅ **Input Validation**: Checks for required fields  
✅ **Protected Routes**: Middleware verifies tokens  
✅ **SQL Injection Prevention**: Parameterized queries  

---

## Common Issues & Solutions

### Issue 1: "Cannot read property 'split' of undefined"
**Cause:** Authorization header format incorrect  
**Solution:** Use format `Bearer TOKEN` (with space)

### Issue 2: "Token expired"
**Cause:** Token is older than 24 hours  
**Solution:** Login again to get new token

### Issue 3: "Email already exists"
**Cause:** Trying to register with existing email  
**Solution:** Use different email or login instead

### Issue 4: "Invalid email or password"
**Cause:** Wrong credentials  
**Solution:** Double-check email and password

---

## Next Steps

After confirming authentication works:

1. ✅ Client Management APIs
2. ✅ Case Management APIs
3. ✅ Document Upload APIs
4. ✅ Evidence Management APIs
5. ✅ Hearing Management APIs
6. ✅ Notes Management APIs

All future APIs will use the authentication middleware to protect routes.
