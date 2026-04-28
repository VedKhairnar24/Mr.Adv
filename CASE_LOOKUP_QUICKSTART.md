# Case Lookup Module - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Run Database Migration

```bash
mysql -u root -p advocate_case_db < database/migrations/002_case_lookup.sql
```

### Step 2: Start Backend Server

```bash
cd backend
npm run dev
```

### Step 3: Start Frontend Server

```bash
cd frontend
npm run dev
```

### Step 4: Test the Module

1. Login to your advocate account
2. Navigate to **"Case Lookup"** in the sidebar
3. Search by CNR: `MHAU030080742026`
4. View case details
5. Click **"Add to My Cases"**
6. Import the case to your dashboard

---

## 📋 What Was Built

### Backend Components

✅ **Database Migration** (`database/migrations/002_case_lookup.sql`)
- `case_lookup_cache` table - Stores external case data
- `case_sync_log` table - Tracks sync operations
- Updated `cases` table with CNR and sync fields
- Stored procedure for auto-sync

✅ **Service Layer** (`backend/services/caseLookupService.js`)
- Search by CNR number
- Search by case number
- Import case to dashboard
- Auto-sync metadata
- Bulk sync operations
- Cache management

✅ **Controller** (`backend/controllers/caseLookupController.js`)
- Handle API requests
- Validate inputs
- Return formatted responses
- Error handling

✅ **Routes** (`backend/routes/caseLookupRoutes.js`)
- 8 API endpoints
- JWT authentication
- Protected routes

✅ **Server Integration** (`backend/server.js`)
- Routes registered at `/api/case-lookup`

### Frontend Components

✅ **Case Lookup Page** (`frontend/src/pages/CaseLookup.jsx`)
- Search form with CNR/Case number toggle
- Case details display
- Import workflow
- Loading and error states

✅ **Routing** (`frontend/src/App.jsx`)
- Route: `/case-lookup`
- Protected with authentication

✅ **Navigation** (`frontend/src/components/Sidebar.jsx`)
- Added "Case Lookup" menu item
- Search icon

---

## 🎯 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/case-lookup/search/cnr` | Search by CNR |
| POST | `/api/case-lookup/search/case-number` | Search by case number |
| POST | `/api/case-lookup/import` | Import case to dashboard |
| POST | `/api/case-lookup/sync/:caseId` | Sync single case |
| POST | `/api/case-lookup/bulk-sync` | Sync all external cases |
| GET | `/api/case-lookup/sync-history/:caseId` | Get sync history |
| GET | `/api/case-lookup/cache/:cacheId` | Get cached case |
| GET | `/api/case-lookup/cache/search?q=keyword` | Search cached cases |

---

## 🧪 Testing with Mock Data

### Test CNR Numbers
- `MHAU030080742026` - Property dispute (Mumbai)
- `DLHI040090852025` - Criminal case (Delhi)
- Any 16-char format (4 letters + 12 digits) - Generates random mock data

### Test Case Numbers
- `CS/5678/2024` - Contract dispute (Delhi)
- Any format - Generates random mock data

### Example curl Commands

```bash
# Search by CNR
curl -X POST http://localhost:5000/api/case-lookup/search/cnr ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d '{"cnr_number": "MHAU030080742026"}'

# Search by Case Number
curl -X POST http://localhost:5000/api/case-lookup/search/case-number \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"case_number": "CS/5678/2024", "court_name": "Delhi"}'
```

---

## 🔄 Complete Workflow

### 1. Search for a Case
```
User enters CNR or Case Number
  ↓
System checks cache (24hr TTL)
  ↓
If not in cache → Fetch from external API
  ↓
If API unavailable → Use mock data
  ↓
Save to cache
  ↓
Display results to user
```

### 2. Import a Case
```
User clicks "Add to My Cases"
  ↓
System checks if case already exists
  ↓
If exists → Show conflict message
  ↓
If not exists → Create client (if needed)
  ↓
Create case with external reference
  ↓
Log import operation
  ↓
Redirect to case detail page
```

### 3. Sync Case Metadata
```
User triggers sync (manual or bulk)
  ↓
Fetch latest data from external source
  ↓
Update local case status
  ↓
Update last_synced_at timestamp
  ↓
Log sync operation
  ↓
Show success/error report
```

---

## 🗂️ File Structure

```
Mr.Adv/
├── database/
│   └── migrations/
│       └── 002_case_lookup.sql          # Database migration
│
├── backend/
│   ├── services/
│   │   └── caseLookupService.js         # Business logic
│   ├── controllers/
│   │   └── caseLookupController.js      # Request handlers
│   ├── routes/
│   │   └── caseLookupRoutes.js          # API routes
│   └── server.js                         # Updated with routes
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   └── CaseLookup.jsx           # UI component
│       ├── App.jsx                       # Updated with route
│       └── components/
│           └── Sidebar.jsx              # Updated navigation
│
└── CASE_LOOKUP_API.md                   # Full documentation
```

---

## 🎨 UI Features

### Search Form
- Toggle between CNR and Case Number search
- Input validation
- Loading spinner during search
- Error message display

### Case Details Display
- Status badge (color-coded)
- CNR and case numbers (monospace font)
- Court information with district/state
- Case type and category
- Petitioner and respondent names
- Filing date and next hearing date
- Case description
- Last proceedings

### Import Form
- Auto-filled petitioner name
- Optional fields: phone, email, address
- Client auto-creation notice
- Success/error alerts

---

## 🔐 Security

- ✅ JWT authentication on all endpoints
- ✅ Advocate-scoped data access
- ✅ Input validation (CNR format, required fields)
- ✅ SQL injection prevention (parameterized queries)
- ✅ Error handling without data leakage

---

## 📊 Database Relationships

```
advocates
  ├── clients (1:N)
  │     └── cases (1:N)
  │           └── hearings (1:N)
  │
  └── case_sync_log (1:N)
        ├── case_lookup_cache (N:1)
        └── cases (N:1)

case_lookup_cache (1:N)
  └── case_sync_log (1:N)
```

---

## 🚦 Status Indicators

### Case Status Badges
- **Active** - Green badge
- **Pending** - Yellow badge
- **Disposed** - Gray badge
- **Closed** - Red badge

### Source Indicators
- **cache** - Data from local cache (< 24hrs)
- **external** - Data from live API
- **mock** - Mock data (development mode)

---

## 📝 Next Steps for Production

1. **Get eCourts API Access**
   - Register at https://ecourts.gov.in/
   - Obtain API credentials
   - Review API documentation

2. **Update Service Configuration**
   - Add API credentials to `.env`
   - Uncomment API integration code
   - Test with real data

3. **Implement Rate Limiting**
   - Add rate limiting middleware
   - Configure appropriate limits
   - Monitor usage

4. **Set Up Monitoring**
   - Log all API calls
   - Track success/failure rates
   - Set up alerts for failures

5. **Enable Auto-Sync Scheduler**
   - Create cron job for daily sync
   - Update all external cases
   - Notify advocates of changes

---

## 🆘 Troubleshooting

### Issue: Database migration fails
**Solution:** Check if `advocate_case_db` exists and you have proper permissions

### Issue: Search returns no results
**Solution:** 
- Verify CNR is 16 digits
- Check if case exists in database
- Review backend logs

### Issue: Import fails
**Solution:**
- Ensure you're logged in
- Verify cache_id is valid
- Check if case already exists

### Issue: Frontend not showing Case Lookup
**Solution:**
- Clear browser cache
- Check if route is added in App.jsx
- Verify sidebar navigation update

---

## 📚 Additional Resources

- Full API Documentation: `CASE_LOOKUP_API.md`
- Database Schema: `database/schema.sql`
- Backend Setup: `backend/README.md`
- Frontend Setup: `frontend/README.md`

---

**Ready to use! 🎉**

Login and navigate to "Case Lookup" to start searching Indian judicial cases.
