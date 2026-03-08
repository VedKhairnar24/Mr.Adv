# Case Management API Documentation

## Base URL
```
http://localhost:5000/api/cases
```

## Authentication Required
**All endpoints require JWT authentication.** Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create` | Create new case | Yes |
| GET | `/all` | Get all cases | Yes |
| GET | `/:id` | Get single case details | Yes |
| PUT | `/status/:id` | Update case status | Yes |
| PUT | `/:id` | Update case information | Yes |
| DELETE | `/:id` | Delete case | Yes |

---

## 1. Create New Case

**Endpoint:** `POST /api/cases/create`

**Description:** Create a new legal case and associate it with a client.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Request Body (JSON)
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

### Required Fields
- `client_id` (integer): ID of the client (must belong to logged-in advocate)
- `case_title` (string): Title/description of the case
- `court_name` (string): Name of the court where case is filed

### Optional Fields
- `case_number` (string): Official case number
- `case_type` (string): Type of case (Civil, Criminal, Family, Corporate, etc.)
- `filing_date` (date): Date when case was filed (YYYY-MM-DD format)

### Success Response (201 Created)
```json
{
  "message": "Case created successfully",
  "caseId": 5
}
```

### Error Responses

**400 Bad Request - Missing Required Fields**
```json
{
  "message": "Client ID, case title, and court name are required"
}
```

**404 Not Found - Client Not Found**
```json
{
  "message": "Client not found or does not belong to you"
}
```

**403 Forbidden - No Token**
```json
{
  "message": "Token required"
}
```

**500 Internal Server Error**
```json
{
  "message": "Case creation failed",
  "error": "Error details"
}
```

---

## 2. Get All Cases

**Endpoint:** `GET /api/cases/all`

**Description:** Retrieve all cases belonging to the logged-in advocate with client names.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Success Response (200 OK)
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

### Empty Response (No Cases)
```json
[]
```

### Error Responses

**403 Forbidden - No Token**
```json
{
  "message": "Token required"
}
```

**500 Internal Server Error**
```json
{
  "message": "Error fetching cases",
  "error": "Error details"
}
```

---

## 3. Get Single Case by ID

**Endpoint:** `GET /api/cases/:id`

**Description:** Retrieve detailed information about a specific case including client details.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### URL Parameters
- `id` (integer): Case ID

### Example
```
GET http://localhost:5000/api/cases/5
```

### Success Response (200 OK)
```json
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
  "created_at": "2026-03-07T14:30:00.000Z",
  "updated_at": "2026-03-07T14:30:00.000Z",
  "client_name": "Rahul Sharma",
  "client_phone": "8888888888",
  "client_email": "rahul@test.com"
}
```

### Error Responses

**404 Not Found - Case Not Found**
```json
{
  "message": "Case not found"
}
```

**403 Forbidden - No Token**
```json
{
  "message": "Token required"
}
```

**500 Internal Server Error**
```json
{
  "message": "Error fetching case",
  "error": "Error details"
}
```

---

## 4. Update Case Status

**Endpoint:** `PUT /api/cases/status/:id`

**Description:** Update the status of an existing case.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### URL Parameters
- `id` (integer): Case ID

### Request Body (JSON)
```json
{
  "status": "Active"
}
```

### Valid Status Values
- `Pending` - Case just filed, awaiting action
- `Active` - Case is currently being processed
- `On Hold` - Case temporarily paused
- `Closed` - Case closed (not disposed)
- `Disposed` - Case disposed/resolved

### Success Response (200 OK)
```json
{
  "message": "Case status updated successfully"
}
```

### Error Responses

**400 Bad Request - Missing or Invalid Status**
```json
{
  "message": "Status is required"
}
```

```json
{
  "message": "Invalid status. Must be one of: Pending, Active, On Hold, Closed, Disposed"
}
```

**404 Not Found - Case Not Found**
```json
{
  "message": "Case not found"
}
```

**403 Forbidden - No Token**
```json
{
  "message": "Token required"
}
```

**500 Internal Server Error**
```json
{
  "message": "Status update failed",
  "error": "Error details"
}
```

---

## 5. Update Case Information

**Endpoint:** `PUT /api/cases/:id`

**Description:** Update complete case information.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### URL Parameters
- `id` (integer): Case ID

### Request Body (JSON)
```json
{
  "case_title": "Updated Case Title",
  "case_number": "NEW123",
  "court_name": "Updated Court Name",
  "case_type": "Civil",
  "status": "Active",
  "filing_date": "2026-03-07"
}
```

### Success Response (200 OK)
```json
{
  "message": "Case updated successfully"
}
```

### Error Responses

**404 Not Found - Case Not Found**
```json
{
  "message": "Case not found"
}
```

**403 Forbidden - No Token**
```json
{
  "message": "Token required"
}
```

**500 Internal Server Error**
```json
{
  "message": "Failed to update case",
  "error": "Error details"
}
```

---

## 6. Delete Case

**Endpoint:** `DELETE /api/cases/:id`

**Description:** Delete a case. This will cascade delete all related documents, evidence, hearings, and notes.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### URL Parameters
- `id` (integer): Case ID

### Example
```
DELETE http://localhost:5000/api/cases/5
```

### Success Response (200 OK)
```json
{
  "message": "Case deleted successfully"
}
```

### Error Responses

**404 Not Found - Case Not Found**
```json
{
  "message": "Case not found"
}
```

**403 Forbidden - No Token**
```json
{
  "message": "Token required"
}
```

**500 Internal Server Error**
```json
{
  "message": "Failed to delete case",
  "error": "Error details"
}
```

---

## Testing with Postman

### Step 1: Login First

Before testing case APIs, get a valid token.

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

### Step 3: Create a Case

1. **POST** `http://localhost:5000/api/cases/create`
2. Go to **Body** → Select **raw** → Choose **JSON**
3. Enter:
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
4. Click **Send**
5. Expected: `"message": "Case created successfully"`

### Step 4: Get All Cases

1. **GET** `http://localhost:5000/api/cases/all`
2. Click **Send**
3. Expected: Array of cases with client names

### Step 5: Get Single Case

1. **GET** `http://localhost:5000/api/cases/5` (replace 5 with actual ID)
2. Click **Send**
3. Expected: Case details with client information

### Step 6: Update Case Status

1. **PUT** `http://localhost:5000/api/cases/status/5`
2. Body:
   ```json
   {
     "status": "Active"
   }
   ```
3. Click **Send**
4. Expected: `"message": "Case status updated successfully"`

---

## Testing with cURL

### Create Case
```bash
curl -X POST http://localhost:5000/api/cases/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "case_title": "Rahul vs State",
    "case_number": "CR12345",
    "court_name": "District Court Mumbai",
    "case_type": "Criminal",
    "filing_date": "2026-03-07"
  }'
```

### Get All Cases
```bash
curl -X GET http://localhost:5000/api/cases/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Single Case
```bash
curl -X GET http://localhost:5000/api/cases/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Case Status
```bash
curl -X PUT http://localhost:5000/api/cases/status/5 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Active"
  }'
```

### Delete Case
```bash
curl -X DELETE http://localhost:5000/api/cases/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Security Features

✅ **JWT Authentication**: All routes protected  
✅ **User Isolation**: Advocates only see their own cases  
✅ **Client Verification**: Ensures client belongs to advocate before creating case  
✅ **Data Integrity**: Foreign key constraints enforced  
✅ **Cascade Delete**: Related data cleaned automatically  
✅ **Input Validation**: Required fields and status values checked  

---

## Important Notes

### Data Isolation
Each advocate can ONLY access their own cases because:
- `req.advocateId` is extracted from JWT token
- All queries filter by `advocate_id`
- Client ownership is verified before creating case

### Cascade Delete
When you delete a case, the database automatically deletes:
- All documents attached to that case
- All evidence linked to that case
- All hearings scheduled for that case
- All notes created for that case

This is handled by FOREIGN KEY constraints with `ON DELETE CASCADE`.

### Case Status Values
Standard status values for consistency:
- **Pending**: Initial state when case is created
- **Active**: Case is being actively worked on
- **On Hold**: Case temporarily paused
- **Closed**: Case closed but not disposed
- **Disposed**: Case fully resolved/disposed

---

## Common Issues & Solutions

### Issue 1: "Client not found or does not belong to you"
**Cause:** Trying to create case for a client that doesn't exist or belongs to another advocate  
**Solution:** Ensure client_id is valid and belongs to logged-in advocate

### Issue 2: "Invalid status"
**Cause:** Using non-standard status value  
**Solution:** Use one of: Pending, Active, On Hold, Closed, Disposed

### Issue 3: "Token required"
**Cause:** Authorization header missing  
**Solution:** Add `Authorization: Bearer TOKEN` header

### Issue 4: "Token expired"
**Cause:** Token older than 24 hours  
**Solution:** Login again to get fresh token

---

## Next Steps

After confirming case management works:

1. ✅ Document Upload APIs
2. ✅ Evidence Management APIs
3. ✅ Hearing Management APIs
4. ✅ Notes Management APIs

All future APIs will follow the same pattern:
- JWT authentication
- User data isolation
- Proper error handling
