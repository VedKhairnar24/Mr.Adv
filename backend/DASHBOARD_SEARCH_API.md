# Dashboard & Search APIs Documentation

## Base URLs
```
Dashboard: http://localhost:5000/api/dashboard
Cases:     http://localhost:5000/api/cases
Search:    http://localhost:5000/api/cases/search
Filter:    http://localhost:5000/api/cases/filter
```

## Authentication Required
**All endpoints require JWT authentication.** Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## Part 1: Dashboard Statistics APIs

### Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Complete dashboard stats | Yes |
| GET | `/case-types` | Case type breakdown | Yes |
| GET | `/monthly-activity` | This month's activity | Yes |

---

### 1. Get Complete Dashboard Statistics

**Endpoint:** `GET /api/dashboard`

**Description:** Retrieve comprehensive dashboard statistics including totals, upcoming hearings, and recent activity.

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Success Response (200 OK)
```json
{
  "totalClients": 4,
  "totalCases": 7,
  "activeCases": 3,
  "pendingCases": 2,
  "recentDocuments": 5,
  "upcomingHearings": [
    {
      "id": 5,
      "case_id": 1,
      "hearing_date": "2026-04-10",
      "court_hall": "Court Hall 3",
      "judge_name": "Justice Sharma",
      "hearing_time": "10:00:00",
      "notes": "Argument stage",
      "status": "Scheduled",
      "case_title": "Rahul vs State",
      "case_number": "CR12345"
    },
    {
      "id": 6,
      "case_id": 2,
      "hearing_date": "2026-04-15",
      "court_hall": "Court Hall 1",
      "judge_name": "Justice Patel",
      "hearing_time": "14:00:00",
      "notes": "Evidence submission",
      "status": "Scheduled",
      "case_title": "Priya Property Dispute",
      "case_number": "CV2026001"
    }
  ],
  "recentCases": [
    {
      "id": 7,
      "case_title": "Corporate Merger Case",
      "case_number": "CL2026002",
      "status": "Active",
      "created_at": "2026-03-05T10:00:00.000Z"
    },
    {
      "id": 6,
      "case_title": "Family Settlement",
      "case_number": "FM2026001",
      "status": "Pending",
      "created_at": "2026-03-01T14:30:00.000Z"
    }
  ]
}
```

#### Response Fields Explained

**Statistics:**
- `totalClients` - Total number of clients
- `totalCases` - Total number of cases
- `activeCases` - Cases with status "Active"
- `pendingCases` - Cases with status "Pending"
- `recentDocuments` - Documents uploaded in last 7 days

**Upcoming Hearings:**
- Next 5 hearings scheduled for today or future dates
- Includes case title and number
- Ordered by hearing date (ascending)

**Recent Cases:**
- Last 5 cases created
- Shows basic case information
- Ordered by creation date (descending)

---

### 2. Get Case Type Statistics

**Endpoint:** `GET /api/dashboard/case-types`

**Description:** Get breakdown of cases by type (Civil, Criminal, Family, etc.)

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Success Response (200 OK)
```json
[
  {
    "case_type": "Criminal",
    "count": 3
  },
  {
    "case_type": "Civil",
    "count": 2
  },
  {
    "case_type": "Family",
    "count": 1
  },
  {
    "case_type": "Corporate",
    "count": 1
  }
]
```

---

### 3. Get Monthly Activity Summary

**Endpoint:** `GET /api/dashboard/monthly-activity`

**Description:** Get activity summary for the current month.

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Success Response (200 OK)
```json
{
  "new_cases": 3,
  "hearings_this_month": 5,
  "documents_uploaded": 8
}
```

#### Response Fields
- `new_cases` - Cases created this month
- `hearings_this_month` - Hearings scheduled this month
- `documents_uploaded` - Documents uploaded this month

---

## Part 2: Case Search & Filter APIs

### Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/cases/search?q=keyword` | Search cases | Yes |
| GET | `/cases/filter?status=Active` | Filter by status | Yes |

---

### 1. Search Cases

**Endpoint:** `GET /api/cases/search?q=keyword`

**Description:** Search cases by case title, case number, or client name using keyword matching.

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Query Parameters
- `q` (string, required): Search keyword

#### Example Requests
```
GET /api/cases/search?q=rahul
GET /api/cases/search?q=property
GET /api/cases/search?q=CR12345
```

#### Success Response (200 OK)
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
    "status": "Active",
    "filing_date": "2026-03-07",
    "created_at": "2026-03-07T14:30:00.000Z",
    "updated_at": "2026-03-07T14:30:00.000Z",
    "client_name": "Rahul Sharma"
  },
  {
    "id": 3,
    "client_id": 2,
    "advocate_id": 3,
    "case_title": "Property Dispute Case",
    "case_number": "CV2026001",
    "court_name": "High Court Delhi",
    "case_type": "Civil",
    "status": "Pending",
    "filing_date": "2026-02-15",
    "created_at": "2026-02-15T10:00:00.000Z",
    "updated_at": "2026-03-01T12:00:00.000Z",
    "client_name": "Priya Patel"
  }
]
```

#### Search Features
- **Case Title Search**: Matches partial text in case title
- **Case Number Search**: Matches partial text in case number
- **Client Name Search**: Matches partial text in client name
- **Case Sensitive**: No, search is case-insensitive
- **Match Type**: Partial match (LIKE '%keyword%')

#### Error Responses

**400 Bad Request - Missing Query**
```json
{
  "message": "Search query is required"
}
```

**500 Internal Server Error**
```json
{
  "message": "Search failed",
  "error": "Error details"
}
```

---

### 2. Filter Cases by Status

**Endpoint:** `GET /api/cases/filter?status=Active`

**Description:** Filter cases by their current status.

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Query Parameters
- `status` (string, required): Case status to filter by

#### Valid Status Values
- `Pending` - Initial status when case is created
- `Active` - Case is currently being processed
- `On Hold` - Case temporarily paused
- `Closed` - Case closed but not disposed
- `Disposed` - Case fully resolved/disposed

#### Example Requests
```
GET /api/cases/filter?status=Active
GET /api/cases/filter?status=Pending
GET /api/cases/filter?status=Closed
```

#### Success Response (200 OK)
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
    "status": "Active",
    "filing_date": "2026-03-07",
    "created_at": "2026-03-07T14:30:00.000Z",
    "updated_at": "2026-03-07T14:30:00.000Z",
    "client_name": "Rahul Sharma"
  },
  {
    "id": 4,
    "client_id": 2,
    "advocate_id": 3,
    "case_title": "Priya Property Dispute",
    "case_number": "CV2026001",
    "court_name": "High Court Delhi",
    "case_type": "Civil",
    "status": "Active",
    "filing_date": "2026-02-15",
    "created_at": "2026-02-15T10:00:00.000Z",
    "updated_at": "2026-03-01T12:00:00.000Z",
    "client_name": "Priya Patel"
  }
]
```

#### Error Responses

**400 Bad Request - Missing Status**
```json
{
  "message": "Status filter is required"
}
```

**400 Bad Request - Invalid Status**
```json
{
  "message": "Invalid status. Must be one of: Pending, Active, On Hold, Closed, Disposed"
}
```

---

## Testing with Postman

### Step 1: Login First

Get a valid JWT token:
1. **POST** `http://localhost:5000/api/auth/login`
2. Body:
   ```json
   {
     "email": "ved@test.com",
     "password": "123456"
   }
   ```
3. Copy the `token` from response

### Step 2: Set Authorization Header

In Postman:
- Go to **Authorization** tab
- Type: `Bearer Token`
- Token: Paste your token

### Step 3: Test Dashboard API

1. **GET** `http://localhost:5000/api/dashboard`
2. Click **Send**
3. Expected: Complete dashboard statistics

### Step 4: Test Case Search

1. **GET** `http://localhost:5000/api/cases/search?q=rahul`
2. Click **Send**
3. Expected: Matching cases

### Step 5: Test Case Filter

1. **GET** `http://localhost:5000/api/cases/filter?status=Active`
2. Click **Send**
3. Expected: All active cases

### Step 6: Test Case Type Stats

1. **GET** `http://localhost:5000/api/dashboard/case-types`
2. Click **Send**
3. Expected: Breakdown by case type

---

## Testing with cURL

### Get Dashboard
```bash
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search Cases
```bash
curl -X GET "http://localhost:5000/api/cases/search?q=property" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter Cases
```bash
curl -X GET "http://localhost:5000/api/cases/filter?status=Active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Case Type Stats
```bash
curl -X GET http://localhost:5000/api/dashboard/case-types \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Monthly Activity
```bash
curl -X GET http://localhost:5000/api/dashboard/monthly-activity \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Use Cases

### Dashboard Usage

**Frontend Dashboard Page:**
```javascript
// Fetch dashboard data on page load
const dashboardData = await fetch('http://localhost:5000/api/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Display statistics
document.getElementById('totalClients').textContent = dashboardData.totalClients;
document.getElementById('totalCases').textContent = dashboardData.totalCases;
document.getElementById('activeCases').textContent = dashboardData.activeCases;

// Display upcoming hearings
dashboardData.upcomingHearings.forEach(hearing => {
  // Create hearing card
});
```

### Search Usage

**Search Bar Implementation:**
```javascript
// On search input change
const searchCases = async (keyword) => {
  const response = await fetch(`http://localhost:5000/api/cases/search?q=${keyword}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const results = await response.json();
  displaySearchResults(results);
};
```

### Filter Usage

**Status Filter Dropdown:**
```javascript
// On status dropdown change
const filterByStatus = async (status) => {
  const response = await fetch(`http://localhost:5000/api/cases/filter?status=${status}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const filteredCases = await response.json();
  displayCases(filteredCases);
};
```

---

## Security Features

✅ **JWT Authentication**: All routes protected  
✅ **User Isolation**: Advocates only see their own data  
✅ **SQL Injection Prevention**: Parameterized queries  
✅ **Input Validation**: Search terms and status values validated  

---

## Common Issues & Solutions

### Issue 1: "Search query is required"
**Cause:** Missing `q` parameter in search URL  
**Solution:** Add query parameter: `?q=keyword`

### Issue 2: "Invalid status"
**Cause:** Using non-standard status value  
**Solution:** Use one of: Pending, Active, On Hold, Closed, Disposed

### Issue 3: "Token expired"
**Cause:** Token older than 24 hours  
**Solution:** Login again to get fresh token

### Issue 4: No search results
**Cause:** Keyword doesn't match any cases  
**Solution:** Try different keyword or broader search term

---

## Performance Notes

### Dashboard Optimization
- Single API call returns all dashboard data
- Nested queries prevent multiple round trips
- Limited results (e.g., 5 upcoming hearings) for performance

### Search Performance
- Uses SQL LIKE with wildcards (%keyword%)
- Searches across multiple fields simultaneously
- Returns results ordered by recency

### Best Practices
1. **Debounce Search**: Wait 300ms after typing before searching
2. **Cache Dashboard Data**: Refresh every few minutes, not on every page view
3. **Lazy Load**: Load detailed stats after initial dashboard renders
4. **Pagination**: For large result sets, implement pagination

---

## Next Steps

After confirming dashboard and search work:

1. ✅ Frontend dashboard development
2. ✅ Advanced filtering options
3. ✅ Export reports functionality
4. ✅ Email notifications for hearings
5. ✅ Document templates system
