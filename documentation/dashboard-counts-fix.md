# Dashboard Not Showing Clients/Cases - Troubleshooting Guide

## 🐛 Problem

You added clients and cases, but they're not showing on the dashboard.

---

## 🔍 Most Likely Cause

**Advocate ID Mismatch** - The clients and cases were added under one advocate account, but you're logged in as a different advocate.

In MySQL database, every client and case has an `advocate_id` field linking it to a specific user. If you:

1. Logged in as Advocate A
2. Added clients/cases
3. Logged out
4. Logged in as Advocate B (even if it's the same person!)

Then Advocate B won't see Advocate A's data because the SQL queries filter by `advocate_id`:

```sql
-- Dashboard counts query
SELECT COUNT(*) FROM clients WHERE advocate_id = ?  -- Only counts for current advocate
SELECT COUNT(*) FROM cases WHERE advocate_id = ?    -- Only counts for current advocate
```

---

## 🧪 Diagnostic Steps

### Step 1: Check Which Advocate You're Logged In As

**Open Browser Console (F12) → Application → Local Storage**

Check these values:
```javascript
token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
advocate: "{\"id\":1,\"name\":\"...\",\"email\":\"...\"}"
```

Note the **advocate ID** (e.g., `id: 1`).

---

### Step 2: Check Database Directly

Run this query in MySQL to see which advocate owns what:

```sql
-- See all advocates and their counts
SELECT 
    a.id AS advocate_id,
    a.name AS advocate_name,
    a.email AS advocate_email,
    COUNT(DISTINCT c.id) AS client_count,
    COUNT(DISTINCT cs.id) AS case_count
FROM advocates a
LEFT JOIN clients c ON a.id = c.advocate_id
LEFT JOIN cases cs ON a.id = cs.advocate_id
GROUP BY a.id, a.name, a.email;
```

**Expected Output:**
```
┌─────────────┬──────────────────┬──────────────┬──────────────┬─────────────┐
│ advocate_id │ advocate_name    │ advocate_email│ client_count │ case_count  │
├─────────────┼──────────────────┼──────────────┼──────────────┼─────────────┤
│ 1           │ Rajesh Kumar     │ rajesh@...   │ 5            │ 10          │
│ 2           │ Priya Sharma     │ priya@...    │ 0            │ 0           │
└─────────────┴──────────────────┴──────────────┴──────────────┴─────────────┘
```

If you're logged in as advocate ID 2 but all data belongs to advocate ID 1, you'll see zeros!

---

### Step 3: Test API Endpoints Directly

**With your auth token**, test these endpoints in browser or Postman:

```bash
# Get client count
GET http://localhost:5000/api/clients/count
Headers: Authorization: Bearer YOUR_TOKEN

# Get case count  
GET http://localhost:5000/api/cases/count
Headers: Authorization: Bearer YOUR_TOKEN

# Get all clients
GET http://localhost:5000/api/clients/all
Headers: Authorization: Bearer YOUR_TOKEN
```

**If returning 0:**
- ✅ Backend is working
- ❌ You're logged in as wrong advocate OR data was added under different advocate

**If returning error:**
- ❌ Backend issue (check server logs)

---

## ✅ Solutions

### Solution 1: Login with Correct Account

If you have multiple test accounts:

1. **Logout** from current account
   ```javascript
   // Browser console
   localStorage.removeItem('token');
   localStorage.removeItem('advocate');
   ```

2. **Login** with the account you used to add clients/cases

3. **Check dashboard** - counts should appear

---

### Solution 2: Transfer Data to Current Advocate

If you want to move clients/cases from one advocate to another:

```sql
-- Update all clients to belong to current advocate (e.g., from advocate_id 1 to 2)
UPDATE clients SET advocate_id = 2 WHERE advocate_id = 1;

-- Update all cases to belong to current advocate
UPDATE cases SET advocate_id = 2 WHERE advocate_id = 1;

-- Update hearings (through cases)
UPDATE hearings h
JOIN cases c ON h.case_id = c.id
SET c.advocate_id = 2
WHERE c.advocate_id = 1;

-- Update documents (through cases)
UPDATE documents d
JOIN cases c ON d.case_id = c.id
SET c.advocate_id = 2
WHERE c.advocate_id = 1;
```

⚠️ **WARNING:** This permanently moves all data!

---

### Solution 3: Use Dummy Data Script

If you ran the dummy data script (`create_dummy_data.sql`), it created data for **3 different advocates**:

- Advocate ID 1: Rajesh Kumar (5 clients, 10 cases)
- Advocate ID 2: Priya Sharma (4 clients, 8 cases)
- Advocate ID 3: Amit Patel (3 clients, 5 cases)

**To see the dummy data:**

1. Find out which email you're using to login
2. Match it to one of the advocates above
3. That advocate should already have data!

If you registered a NEW advocate (not in dummy data), they won't have any clients/cases.

---

### Solution 4: Add Fresh Data While Logged In

**Simplest approach:**

1. **Stay logged in** to your current account
2. **Add new clients** via the Clients page
3. **Add new cases** via the Cases page
4. **Refresh dashboard** - should show counts now

This ensures all data is linked to YOUR current advocate ID.

---

## 🔧 Debug Code

Add this to your Dashboard.jsx temporarily to see what's happening:

```javascript
// Add after line 13 in Dashboard.jsx
useEffect(() => {
  const storedAdvocate = localStorage.getItem('advocate');
  console.log('=== DASHBOARD DEBUG ===');
  console.log('Logged in advocate:', JSON.parse(storedAdvocate));
  console.log('Client count:', clientCount);
  console.log('Case count:', caseCount);
  console.log('Dashboard data:', dashboardData);
  console.log('======================');
}, [clientCount, caseCount, dashboardData]);
```

Then open browser console and check:
- What advocate ID is shown?
- Are counts coming back as 0?
- Is dashboard data null?

---

## 📊 Verify Database State

Run these queries to see exact state:

```sql
-- Count total advocates
SELECT COUNT(*) AS total_advocates FROM advocates;

-- Count total clients
SELECT COUNT(*) AS total_clients FROM clients;

-- Count total cases
SELECT COUNT(*) AS total_cases FROM cases;

-- See distribution by advocate
SELECT 
    advocate_id,
    COUNT(*) AS client_count
FROM clients
GROUP BY advocate_id;

SELECT 
    advocate_id,
    COUNT(*) AS case_count
FROM cases
GROUP BY advocate_id;
```

---

## 🎯 Quick Fix Steps

**Option A: Start Fresh (Recommended)**

1. **Logout** of current account
2. **Clear localStorage:**
   ```javascript
   localStorage.clear();
   ```
3. **Login again** with your credentials
4. **Add 1-2 test clients**
5. **Add 1-2 test cases**
6. **Go to dashboard** - should see counts now!

---

**Option B: Check Existing Data**

1. Open MySQL Workbench or command line
2. Run diagnostic queries above
3. See which advocate owns the data
4. Login as that advocate
5. Dashboard will show correct counts

---

## 💡 Prevention

To avoid this in future:

1. **Use one advocate account** for testing
2. **Don't logout/login frequently** during development
3. **Keep track** of which email you used to add data
4. **Use dummy data script** if you need fresh test data

---

## ✨ Expected Behavior

When everything works correctly:

**Dashboard shows:**
```
┌──────────────────┬──────────────────┬──────────────────┐
│ Total Clients    │ Total Cases      │ Upcoming Hearings│
├──────────────────┼──────────────────┼──────────────────┤
│ 5                │ 10               │ 3                │
└──────────────────┴──────────────────┴──────────────────┘
```

**API returns:**
```json
{
  "totalClients": 5,
  "totalCases": 10,
  "activeCases": 7,
  "pendingCases": 3,
  "upcomingHearings": [...],
  "recentCases": [...]
}
```

**Database query:**
```sql
SELECT COUNT(*) FROM clients WHERE advocate_id = 1;  -- Returns 5
SELECT COUNT(*) FROM cases WHERE advocate_id = 1;    -- Returns 10
```

---

## 🚨 Still Not Working?

If counts still show 0 after trying above:

1. **Check backend terminal** for errors
2. **Check browser console** for errors
3. **Verify JWT token is valid** (not expired)
4. **Test API directly** with Postman/curl
5. **Check database connection** is working

---

## 📝 Summary

**Most likely issue:** Advocate ID mismatch between logged-in user and data owner.

**Quick fix:** Logout, clear storage, login again, add fresh data.

**Permanent fix:** Ensure you always use the same advocate account when adding/viewing data.

**Root cause:** SQL queries filter by `advocate_id`, so each advocate only sees their own data.
