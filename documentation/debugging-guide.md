# Backend/Frontend Connection Debugging Guide

## Issue Identified & Fixed ✅

### Problem

The frontend was calling incorrect API endpoints that didn't exist in the backend.

**Frontend was calling:**
```javascript
API.get('/clients')        // ❌ This route doesn't exist
API.post('/clients')       // ❌ This route doesn't exist
```

**Backend had these routes:**
```javascript
GET  /api/clients/all      // ✅ Correct endpoint
POST /api/clients/create   // ✅ Correct endpoint
```

**Result:** 404 Not Found errors

---

### Solution Applied

Fixed `frontend/src/pages/Clients.jsx` to use correct endpoints:

**Before:**
```javascript
const response = await API.get('/clients');
await API.post('/clients', formData);
```

**After:**
```javascript
const response = await API.get('/clients/all');
await API.post('/clients/create', formData);
```

---

## Complete Debugging Checklist

Use this checklist to debug any backend/frontend connection issues.

### Step 1: Check if Backend Server is Running

**In your backend terminal, you should see:**
```
🚀 Server running on port 5000
📍 Local: http://localhost:5000
📍 Clients API: http://localhost:5000/api/clients
```

**If not running, start it:**
```bash
cd backend
npm start
```

**Check for Node processes:**
```powershell
Get-Process -Name node
```

You should see at least one Node process running.

---

### Step 2: Test Backend API Directly

**Test in your browser:**
```
http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "API is running",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

**Test clients endpoint (requires authentication):**
```
http://localhost:5000/api/clients/all
```

**Possible Outcomes:**

✅ **See JSON data** → Backend works perfectly  
❌ **"Cannot GET /api/clients"** → Route doesn't exist  
❌ **"Cannot get / method not allowed"** → Wrong HTTP method  
❌ **Browser shows "Site can't be reached"** → Backend not running  

---

### Step 3: Verify Backend Routes Configuration

**Open:** `backend/routes/clientRoutes.js`

**Should have:**
```javascript
// GET all clients
router.get('/all', verifyToken, clientController.getClients);

// POST create client
router.post('/create', verifyToken, clientController.createClient);
```

**Check route registration in:** `backend/server.js`

**Should have:**
```javascript
const clientRoutes = require('./routes/clientRoutes');
app.use('/api/clients', clientRoutes);
```

This means:
- Base path: `/api/clients`
- Full paths:
  - `/api/clients/all` (GET)
  - `/api/clients/create` (POST)
  - `/api/clients/:id` (GET/PUT/DELETE)

---

### Step 4: Check Frontend API Calls

**Open:** `frontend/src/pages/Clients.jsx`

**Check API calls match backend routes:**

**Frontend should call:**
```javascript
// GET request
API.get('/clients/all')  // ✅ Correct

// POST request  
API.post('/clients/create')  // ✅ Correct
```

**NOT:**
```javascript
API.get('/clients')      // ❌ Wrong - route doesn't exist
API.post('/clients')     // ❌ Wrong - route doesn't exist
```

---

### Step 5: Verify Axios Configuration

**Open:** `frontend/src/services/api.js`

**Should have:**
```javascript
const API = axios.create({
  baseURL: 'http://localhost:5000/api',  // ✅ Correct port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Common Issues:**

❌ **Wrong port:**
```javascript
baseURL: 'http://localhost:3000/api'  // Wrong!
```

✅ **Correct:**
```javascript
baseURL: 'http://localhost:5000/api'  // Correct!
```

---

### Step 6: Check Browser Console for Errors

**Open your app:**
```
http://localhost:5173
```

**Press F12 → Go to Console tab**

**Look for errors:**

**Network Error Examples:**

1. **404 Not Found**
   ```
   GET http://localhost:5000/api/clients 404 (Not Found)
   ```
   **Meaning:** Route doesn't exist in backend

2. **CORS Error**
   ```
   Access to XMLHttpRequest blocked by CORS policy
   ```
   **Meaning:** CORS not enabled in backend

3. **Connection Refused**
   ```
   GET http://localhost:5000/api/clients net::ERR_CONNECTION_REFUSED
   ```
   **Meaning:** Backend server not running

4. **401 Unauthorized**
   ```
   GET http://localhost:5000/api/clients/all 401 (Unauthorized)
   ```
   **Meaning:** Missing or invalid JWT token

---

### Step 7: Verify CORS is Enabled

**Open:** `backend/server.js`

**Should have:**
```javascript
const cors = require('cors');
app.use(cors());  // Enable CORS for all routes
```

**If missing, install and add:**
```bash
cd backend
npm install cors
```

Then add to server.js:
```javascript
const express = require('express');
const cors = require('cors');  // Add this import

const app = express();
app.use(cors());  // Add this line BEFORE routes
```

---

### Step 8: Check Authentication

Most backend routes require JWT authentication.

**Verify you're logged in:**

1. Open browser DevTools (F12)
2. Go to Application tab
3. Check Local Storage
4. Look for `token` key

**Should have:**
```
token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**If no token:**
- Navigate to login page
- Login with credentials
- Token will be saved automatically

---

### Step 9: Test API with Postman/curl

**Test GET clients:**
```bash
curl -X GET http://localhost:5000/api/clients/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Test POST create client:**
```bash
curl -X POST http://localhost:5000/api/clients/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Client","phone":"1234567890"}'
```

---

### Step 10: Restart Everything

**Stop both servers:**

Backend:
```
Ctrl + C
```

Frontend:
```
Ctrl + C
```

**Restart backend:**
```bash
cd backend
npm start
```

Wait for:
```
🚀 Server running on port 5000
```

**Restart frontend:**
```bash
cd frontend
npm run dev
```

Wait for:
```
VITE ready in XXX ms
Local: http://localhost:5173
```

---

## Common Issues & Solutions

### Issue 1: 404 Not Found

**Error:**
```
GET http://localhost:5000/api/clients 404
```

**Possible Causes:**
1. ❌ Route doesn't exist
2. ❌ Wrong endpoint path
3. ❌ Route not registered in server.js

**Solution:**
- Check backend routes file
- Verify route registration in server.js
- Match frontend endpoint with backend route

---

### Issue 2: CORS Error

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Cause:** CORS not enabled in backend

**Solution:**
```bash
cd backend
npm install cors
```

Add to server.js:
```javascript
const cors = require('cors');
app.use(cors());
```

---

### Issue 3: Connection Refused

**Error:**
```
ERR_CONNECTION_REFUSED
```

**Cause:** Backend server not running

**Solution:**
```bash
cd backend
npm start
```

---

### Issue 4: 401 Unauthorized

**Error:**
```
GET /api/clients/all 401 (Unauthorized)
```

**Possible Causes:**
1. ❌ No JWT token
2. ❌ Expired token
3. ❌ Invalid token

**Solution:**
- Login again
- Check token in localStorage
- Verify token interceptor in api.js

---

### Issue 5: Network Error (Vite Proxy)

**Error:**
```
Network Error
```

**Cause:** Using relative paths without proxy

**Solution:**

Option A: Use full URL in frontend
```javascript
axios.get('http://localhost:5000/api/clients/all')
```

Option B: Configure Vite proxy
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

Then use relative paths:
```javascript
API.get('/clients/all')  // Will proxy to localhost:5000
```

---

## Testing Workflow

### Test Backend First

1. **Start backend only**
   ```bash
   cd backend
   npm start
   ```

2. **Test health endpoint in browser**
   ```
   http://localhost:5000/api/health
   ```
   Should return: `{"status": "OK", ...}`

3. **Test specific endpoint**
   ```
   http://localhost:5000/api/clients/all
   ```
   (Requires auth token)

4. **If backend works → Move to frontend**

---

### Test Frontend

1. **Make sure backend is running**
   - Check terminal for "Server running" message

2. **Start frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open browser console (F12)**

4. **Navigate to page**
   ```
   http://localhost:5173/clients
   ```

5. **Check console for errors**
   - No errors? ✅ Success!
   - Red errors? → Debug using steps above

---

## Verification Checklist

After fixing, verify everything works:

### Backend Verification
- [ ] Backend server running on port 5000
- [ ] Health endpoint returns OK: `http://localhost:5000/api/health`
- [ ] Client routes exist in `clientRoutes.js`
- [ ] Routes registered in `server.js`
- [ ] CORS enabled
- [ ] Database connected

### Frontend Verification
- [ ] Frontend running on port 5173 (or 5175)
- [ ] API base URL correct in `api.js`
- [ ] Endpoints match backend routes
- [ ] Auth token in localStorage
- [ ] No CORS errors in console
- [ ] No 404 errors in console

### Integration Verification
- [ ] Can access `/clients` page without errors
- [ ] Client list loads successfully
- [ ] Can add new client
- [ ] Can delete client
- [ ] Data persists in database

---

## Quick Fix Commands

### Restart Everything Clean
```bash
# Stop all Node processes (Windows PowerShell)
Get-Process node | Stop-Process -Force

# Start backend
cd backend
npm start

# In new terminal, start frontend
cd frontend
npm run dev
```

### Clear Cache and Restart
```bash
# Backend
cd backend
npm cache clean --force
npm install
npm start

# Frontend
cd frontend
npm cache clean --force
npm install
npm run dev
```

### Check What's Running
```powershell
# Windows
Get-Process node

# Check ports
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

---

## Expected Behavior After Fix

### Terminal Output (Backend)
```
🚀 Server running on port 5000
📍 Local: http://localhost:5000
📍 Clients API: http://localhost:5000/api/clients
MongoDB connected ✓
```

### Terminal Output (Frontend)
```
VITE v7.x.x ready in XXX ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Browser Console (No Errors)
```
✓ Compiled successfully
```

### Network Tab (Successful Requests)
```
GET http://localhost:5000/api/clients/all
Status: 200 OK
Response: [{id: 1, name: "Client 1", ...}, ...]
```

---

## Summary

**Issue Found:** Mismatched API endpoints between frontend and backend

**Fix Applied:** Updated `Clients.jsx` to use correct endpoints:
- `GET /clients/all` instead of `/clients`
- `POST /clients/create` instead of `/clients`

**Files Modified:**
- ✅ `frontend/src/pages/Clients.jsx` (lines 25, 57)

**Next Steps:**
1. Restart both servers
2. Navigate to `/clients` page
3. Verify client list loads
4. Test adding/deleting clients
5. Check browser console for errors

**Testing:**
```bash
# Backend running on http://localhost:5000
# Frontend running on http://localhost:5173

# Test: Open http://localhost:5173/clients
# Expected: Client list loads successfully
# Expected: No errors in console
# Expected: Can add/delete clients
```

---

**Everything should now work perfectly!** 🎉
