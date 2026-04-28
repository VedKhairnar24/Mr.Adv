# Case Lookup Module - Indian Judicial Data Integration

## Overview
The Case Lookup module integrates with Indian public judicial databases (eCourts, National Judicial Data Grid) to enable advocates to search, view, and import case information directly into their dashboard.

## Features
- ✅ Search by CNR (Case Number Record)
- ✅ Search by Case Number
- ✅ Fetch complete case details
- ✅ Add to My Cases (Import functionality)
- ✅ Save selected cases to advocate dashboard
- ✅ Auto-sync case metadata
- ✅ Bulk sync for all external cases
- ✅ Cache mechanism for performance

---

## Database Schema

### New Tables

#### 1. `case_lookup_cache`
Stores cached case data from external judicial databases.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment primary key |
| cnr_number | VARCHAR(50) | Unique 16-digit CNR identifier |
| case_number | VARCHAR(100) | Court case number |
| case_type | VARCHAR(100) | Type of case (Civil, Criminal, etc.) |
| case_status | VARCHAR(100) | Current status |
| court_name | VARCHAR(255) | Court name |
| court_district | VARCHAR(100) | District |
| court_state | VARCHAR(100) | State |
| filing_date | DATE | Date of filing |
| registration_date | DATE | Registration date |
| case_category | VARCHAR(100) | Case category |
| petitioner_name | VARCHAR(255) | Petitioner name |
| respondent_name | VARCHAR(255) | Respondent name |
| advocate_name | VARCHAR(255) | Advocate name |
| judge_name | VARCHAR(255) | Judge name |
| next_hearing_date | DATE | Next hearing date |
| last_hearing_date | DATE | Last hearing date |
| case_description | TEXT | Case description |
| proceedings | TEXT | Last proceedings |
| raw_response | JSON | Raw API response |
| synced_at | TIMESTAMP | Last sync timestamp |
| created_at | TIMESTAMP | Creation timestamp |

**Indexes:**
- `idx_cnr` - On cnr_number
- `idx_case_number` - On case_number
- `idx_court` - On court_name
- `idx_status` - On case_status
- `idx_filing_date` - On filing_date

#### 2. `case_sync_log`
Tracks all synchronization operations.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment primary key |
| advocate_id | INT (FK) | Reference to advocates table |
| case_lookup_id | INT (FK) | Reference to case_lookup_cache |
| local_case_id | INT (FK) | Reference to cases table |
| sync_type | ENUM | SEARCH, IMPORT, UPDATE, AUTO_SYNC |
| sync_status | ENUM | PENDING, SUCCESS, FAILED |
| sync_metadata | JSON | Additional sync data |
| error_message | TEXT | Error details if failed |
| synced_at | TIMESTAMP | Sync timestamp |

### Modified Tables

#### `cases` table
Added columns to support external case tracking:

| Column | Type | Description |
|--------|------|-------------|
| cnr_number | VARCHAR(50) | External CNR number |
| is_external_case | BOOLEAN | Flag for imported cases |
| external_case_id | INT | Reference to case_lookup_cache |
| last_synced_at | TIMESTAMP | Last metadata sync |

---

## API Endpoints

### Base URL
```
http://localhost:5000/api/case-lookup
```

### Authentication
All endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

### 1. Search Case by CNR

**Endpoint:** `POST /api/case-lookup/search/cnr`

**Description:** Search for a case using the 16-character CNR number (4 letters + 12 digits).

**Request Body:**
```json
{
  "cnr_number": "MHAU030080742026"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Case found",
  "data": {
    "cnr_number": "MHAU030080742026",
    "case_number": "CS/1234/2024",
    "case_type": "Civil Suit",
    "case_status": "Pending",
    "court_name": "District Court - Mumbai",
    "court_district": "Mumbai",
    "court_state": "Maharashtra",
    "filing_date": "2024-01-15",
    "registration_date": "2024-01-16",
    "case_category": "Property Dispute",
    "petitioner_name": "Rajesh Kumar",
    "respondent_name": "Amit Sharma",
    "advocate_name": "Adv. Suresh Menon",
    "judge_name": "Justice R.K. Desai",
    "next_hearing_date": "2026-05-15",
    "last_hearing_date": "2026-03-20",
    "case_description": "Property dispute regarding boundary demarcation",
    "proceedings": "Arguments heard, evidence submission pending",
    "cache_id": 1,
    "source": "cache"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid CNR format. Must be 16 characters (4 letters + 12 digits, e.g., MHAU030080742026)"
}
```

---

### 2. Search Case by Case Number

**Endpoint:** `POST /api/case-lookup/search/case-number`

**Description:** Search for a case using court case number.

**Request Body:**
```json
{
  "case_number": "CS/1234/2024",
  "court_name": "District Court - Mumbai"
}
```

**Note:** `court_name` is optional but recommended for better search results.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Case found",
  "data": {
    "cnr_number": "MHAU030080742026",
    "case_number": "CS/1234/2024",
    "case_type": "Civil Suit",
    "case_status": "Pending",
    "court_name": "District Court - Mumbai",
    "court_district": "Mumbai",
    "court_state": "Maharashtra",
    "filing_date": "2024-01-15",
    "petitioner_name": "Rajesh Kumar",
    "respondent_name": "Amit Sharma",
    "next_hearing_date": "2026-05-15",
    "cache_id": 1,
    "source": "external"
  }
}
```

---

### 3. Import Case to Dashboard

**Endpoint:** `POST /api/case-lookup/import`

**Description:** Import an external case to the advocate's case list.

**Request Body:**
```json
{
  "cache_id": 1,
  "client_id": 5,
  "phone": "9876543210",
  "email": "client@example.com",
  "address": "123 Main Street, Mumbai"
}
```

**Note:** 
- `cache_id` is required (from search result)
- `client_id` is optional - if not provided, a new client will be created from petitioner name
- `phone`, `email`, `address` are optional client details

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Case imported successfully",
  "case_id": 15
}
```

**Response (409 Conflict - Case already exists):**
```json
{
  "success": false,
  "message": "Case already exists in your dashboard",
  "case_id": 15
}
```

---

### 4. Sync Single Case Metadata

**Endpoint:** `POST /api/case-lookup/sync/:caseId`

**Description:** Auto-sync case metadata from external source for a specific case.

**URL Parameters:**
- `caseId` - Local case ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Case synced successfully",
  "data": {
    "success": true,
    "message": "Case synced successfully",
    "updated_status": "Active"
  }
}
```

---

### 5. Bulk Sync All External Cases

**Endpoint:** `POST /api/case-lookup/bulk-sync`

**Description:** Sync metadata for all external cases in the advocate's dashboard.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bulk sync completed: 5 successful, 1 failed",
  "data": {
    "synced": [
      {
        "case_id": 15,
        "cnr_number": "04010123456789012345",
        "status": "success",
        "message": "Case synced successfully"
      }
    ],
    "errors": [
      {
        "case_id": 16,
        "cnr_number": "04010123456789012346",
        "status": "error",
        "message": "External API timeout"
      }
    ]
  }
}
```

---

### 6. Get Sync History

**Endpoint:** `GET /api/case-lookup/sync-history/:caseId`

**Description:** Get synchronization history for a specific case.

**URL Parameters:**
- `caseId` - Local case ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "advocate_id": 1,
      "case_lookup_id": 1,
      "local_case_id": 15,
      "sync_type": "IMPORT",
      "sync_status": "SUCCESS",
      "sync_metadata": null,
      "error_message": null,
      "synced_at": "2026-04-27T10:30:00.000Z",
      "cnr_number": "04010123456789012345",
      "case_number": "CS/1234/2024"
    }
  ]
}
```

---

### 7. Get Cached Case Details

**Endpoint:** `GET /api/case-lookup/cache/:cacheId`

**Description:** Retrieve cached case details by cache ID.

**URL Parameters:**
- `cacheId` - Cache record ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "cnr_number": "04010123456789012345",
    "case_number": "CS/1234/2024",
    "case_status": "Pending",
    "court_name": "District Court - Mumbai",
    "petitioner_name": "Rajesh Kumar",
    "respondent_name": "Amit Sharma",
    "synced_at": "2026-04-27T10:30:00.000Z"
  }
}
```

---

### 8. Search Cached Cases

**Endpoint:** `GET /api/case-lookup/cache/search?q=keyword`

**Description:** Search through cached cases.

**Query Parameters:**
- `q` - Search keyword (required)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "cnr_number": "04010123456789012345",
      "case_number": "CS/1234/2024",
      "case_status": "Pending",
      "court_name": "District Court - Mumbai",
      "petitioner_name": "Rajesh Kumar",
      "synced_at": "2026-04-27T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

## Frontend Implementation

### Case Lookup Page

**Route:** `/case-lookup`

**Features:**
1. **Search Mode Toggle**
   - Search by CNR (16-digit number)
   - Search by Case Number (with optional court name)

2. **Search Form**
   - Input validation
   - Loading states
   - Error handling

3. **Result Display**
   - Complete case details
   - Status badge
   - Court information
   - Party details
   - Hearing dates
   - Case description and proceedings

4. **Import Workflow**
   - "Add to My Cases" button
   - Optional client details form
   - Auto-creation of client from petitioner name
   - Redirect to case detail page after import

### Navigation

Added to sidebar navigation:
- **Icon:** Search icon
- **Label:** "Case Lookup"
- **Path:** `/case-lookup`

---

## Setup Instructions

### 1. Database Migration

Run the migration script:
```bash
mysql -u root -p advocate_case_db < database/migrations/002_case_lookup.sql
```

Or execute manually in MySQL:
```sql
source /path/to/database/migrations/002_case_lookup.sql;
```

### 2. Backend Setup

The backend is already configured with:
- ✅ Case lookup service (`backend/services/caseLookupService.js`)
- ✅ Controller (`backend/controllers/caseLookupController.js`)
- ✅ Routes (`backend/routes/caseLookupRoutes.js`)
- ✅ Server integration (`backend/server.js`)

### 3. Frontend Setup

The frontend is already configured with:
- ✅ Case lookup page (`frontend/src/pages/CaseLookup.jsx`)
- ✅ Route added (`frontend/src/App.jsx`)
- ✅ Sidebar navigation (`frontend/src/components/Sidebar.jsx`)

### 4. Environment Variables (Optional)

For production eCourts API integration, add to `.env`:

```env
# eCourts API Configuration
ECOURTS_API_KEY=your_api_key_here
ECOURTS_API_TOKEN=your_api_token_here
ECOURTS_API_BASE_URL=https://api.ecourts.gov.in
```

---

## Integration with Indian Judicial APIs

### Current Implementation

The system is designed to work with:
1. **eCourts Services** - https://ecourts.gov.in/
2. **National Judicial Data Grid (NJDG)** - https://njdg.ecourts.gov.in/

### Live Data Only (No Dummy Fallback)

This module **does not return mocked/demo case data**.

To enable live lookup, configure a legally compliant provider in `.env`:

1. **Recommended (Adapter URL)**
   - Set `COURT_DATA_PROVIDER_URL` to your own server-side adapter endpoint.
   - Optionally set `COURT_DATA_PROVIDER_TOKEN` for auth.

2. **Optional (Official/Partner API)**
   - Set `ECOURTS_API_BASE_URL`
   - Optionally set `ECOURTS_CASE_SEARCH_PATH`, `ECOURTS_API_TOKEN`, `ECOURTS_API_KEY`

If live lookup is unavailable and there is no cached record, the API returns:
`"Live case data unavailable"`.

---

## Testing

### Test Values

Use **real** CNR/Case Number values from public court records.

### Manual Testing

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Flow:**
   - Navigate to `/case-lookup`
   - Search by CNR: `04010123456789012345`
   - View case details
   - Click "Add to My Cases"
   - Fill optional client details
   - Import case
   - Verify case appears in Cases page

---

## Auto-Sync Mechanism

### How It Works

1. **Cache Layer**
   - Search results are cached for 24 hours
   - Reduces API calls
   - Improves performance

2. **Manual Sync**
   - Click sync button on case detail page
   - Fetches latest data from external source
   - Updates local case status

3. **Bulk Sync**
   - Syncs all external cases at once
   - Provides success/error report
   - Logs all operations

4. **Sync Logging**
   - All sync operations are tracked
   - View history in `case_sync_log` table
   - Monitor success/failure rates

### Stored Procedure

MySQL stored procedure for efficient sync:
```sql
CALL SyncCaseMetadata(case_id, cnr_number);
```

---

## Error Handling

### Common Errors

| Error | Status | Description |
|-------|--------|-------------|
| Invalid CNR format | 400 | CNR must be exactly 16 digits |
| Case not found | 404 | No case found in external database |
| Case already exists | 409 | Case already imported to dashboard |
| Missing cache_id | 400 | Cache ID required for import |
| Authentication failed | 401 | Invalid or missing JWT token |
| Server error | 500 | Internal server error |

### Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Security Considerations

1. **Authentication**
   - All endpoints require JWT token
   - Advocate ID extracted from token
   - Cases scoped to advocate

2. **Data Validation**
   - CNR format validation (16 digits)
   - SQL injection prevention (parameterized queries)
   - Input sanitization

3. **Rate Limiting**
   - Implement rate limiting for production
   - Prevent abuse of external APIs
   - Cache frequently searched cases

4. **Data Privacy**
   - Only public case data is accessed
   - No sensitive personal information
   - Compliant with public data usage

---

## Future Enhancements

1. **Real API Integration**
   - Connect to eCourts production API
   - Handle API rate limits
   - Implement retry logic

2. **Advanced Search**
   - Search by party name
   - Search by advocate name
   - Search by judge name
   - Date range filters

3. **Notifications**
   - Alert on case status changes
   - Hearing date reminders
   - Sync failure notifications

4. **Analytics**
   - Search trends
   - Import statistics
   - Sync success rates

5. **Batch Operations**
   - Import multiple cases
   - Export case data
   - Bulk status updates

---

## Support

For issues or questions:
1. Check error logs: `backend/logs/error.log`
2. Review API responses in browser console
3. Verify database migration completed successfully
4. Ensure JWT token is valid

---

## License

This module is part of the Mr.Adv advocate case management system.

---

**Last Updated:** April 27, 2026
**Version:** 1.0.0
