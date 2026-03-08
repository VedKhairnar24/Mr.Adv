# Hearing & Notes Management API Documentation

## Base URLs
```
Hearings: http://localhost:5000/api/hearings
Notes:    http://localhost:5000/api/notes
```

## Authentication Required
**All endpoints require JWT authentication.** Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## Part 1: Hearing Management APIs

### Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/add` | Add hearing to case | Yes |
| GET | `/:caseId` | Get case hearings | Yes |
| PUT | `/status/:id` | Update hearing status | Yes |
| DELETE | `/:id` | Delete hearing | Yes |

---

### 1. Add Hearing to Case

**Endpoint:** `POST /api/hearings/add`

**Description:** Schedule a court hearing for a specific case.

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

#### Request Body (JSON)
```json
{
  "case_id": 1,
  "hearing_date": "2026-04-10",
  "court_hall": "Court Hall 3",
  "judge_name": "Justice Sharma",
  "hearing_time": "10:00:00",
  "notes": "Argument stage"
}
```

#### Required Fields
- `case_id` (integer): ID of the case (must belong to logged-in advocate)
- `hearing_date` (date): Date of hearing (YYYY-MM-DD format)

#### Optional Fields
- `court_hall` (string): Court hall/room number
- `judge_name` (string): Presiding judge's name
- `hearing_time` (string): Time of hearing (HH:MM:SS format)
- `notes` (string): Additional notes about the hearing

#### Success Response (201 Created)
```json
{
  "message": "Hearing added successfully",
  "hearingId": 5
}
```

#### Error Responses

**400 Bad Request - Missing Case ID**
```json
{
  "message": "Case ID is required"
}
```

**400 Bad Request - Missing Hearing Date**
```json
{
  "message": "Hearing date is required"
}
```

**404 Not Found - Case Not Found**
```json
{
  "message": "Case not found or does not belong to you"
}
```

---

### 2. Get All Hearings for a Case

**Endpoint:** `GET /api/hearings/:caseId`

**Description:** Retrieve all hearings scheduled for a specific case, ordered by date and time.

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters
- `caseId` (integer): Case ID

#### Example
```
GET http://localhost:5000/api/hearings/1
```

#### Success Response (200 OK)
```json
[
  {
    "id": 5,
    "case_id": 1,
    "hearing_date": "2026-04-10",
    "court_hall": "Court Hall 3",
    "judge_name": "Justice Sharma",
    "hearing_time": "10:00:00",
    "notes": "Argument stage",
    "status": "Scheduled",
    "created_at": "2026-03-07T14:30:00.000Z"
  },
  {
    "id": 4,
    "case_id": 1,
    "hearing_date": "2026-03-15",
    "court_hall": "Court Hall 2",
    "judge_name": "Justice Patel",
    "hearing_time": "14:00:00",
    "notes": "First hearing",
    "status": "Completed",
    "created_at": "2026-03-01T10:00:00.000Z"
  }
]
```

#### Hearing Status Values
- `Scheduled` - Hearing is scheduled
- `Completed` - Hearing has been completed
- `Cancelled` - Hearing was cancelled
- `Adjourned` - Hearing was adjourned to later date

---

### 3. Update Hearing Status

**Endpoint:** `PUT /api/hearings/status/:id`

**Description:** Update the status of a scheduled hearing.

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

#### URL Parameters
- `id` (integer): Hearing ID

#### Request Body (JSON)
```json
{
  "status": "Completed"
}
```

#### Valid Status Values
- `Scheduled`
- `Completed`
- `Cancelled`
- `Adjourned`

#### Success Response (200 OK)
```json
{
  "message": "Hearing status updated successfully"
}
```

---

### 4. Delete Hearing

**Endpoint:** `DELETE /api/hearings/:id`

**Description:** Delete a scheduled hearing from a case.

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters
- `id` (integer): Hearing ID

#### Success Response (200 OK)
```json
{
  "message": "Hearing deleted successfully"
}
```

---

## Part 2: Notes Management APIs

### Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/add` | Add note to case | Yes |
| GET | `/:caseId` | Get case notes | Yes |
| PUT | `/:id` | Update note | Yes |
| DELETE | `/:id` | Delete note | Yes |

---

### 1. Add Note to Case

**Endpoint:** `POST /api/notes/add`

**Description:** Add a private note to a case (for advocate's reference).

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

#### Request Body (JSON)
```json
{
  "case_id": 1,
  "note_text": "Prepare witness statement for next hearing"
}
```

#### Required Fields
- `case_id` (integer): ID of the case
- `note_text` (string): Content of the note

#### Success Response (201 Created)
```json
{
  "message": "Note added successfully",
  "noteId": 3
}
```

#### Error Responses

**400 Bad Request - Missing Case ID**
```json
{
  "message": "Case ID is required"
}
```

**400 Bad Request - Missing Note Text**
```json
{
  "message": "Note text is required"
}
```

**404 Not Found - Case Not Found**
```json
{
  "message": "Case not found or does not belong to you"
}
```

---

### 2. Get All Notes for a Case

**Endpoint:** `GET /api/notes/:caseId`

**Description:** Retrieve all private notes for a specific case, ordered by creation date (newest first).

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters
- `caseId` (integer): Case ID

#### Example
```
GET http://localhost:5000/api/notes/1
```

#### Success Response (200 OK)
```json
[
  {
    "id": 3,
    "case_id": 1,
    "note_text": "Prepare witness statement for next hearing",
    "created_at": "2026-03-07T14:30:00.000Z",
    "updated_at": "2026-03-07T14:30:00.000Z"
  },
  {
    "id": 2,
    "case_id": 1,
    "note_text": "Client needs to bring original documents",
    "created_at": "2026-03-05T11:20:00.000Z",
    "updated_at": "2026-03-05T11:20:00.000Z"
  }
]
```

---

### 3. Update Note

**Endpoint:** `PUT /api/notes/:id`

**Description:** Update an existing note's content.

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

#### URL Parameters
- `id` (integer): Note ID

#### Request Body (JSON)
```json
{
  "note_text": "Updated note content"
}
```

#### Success Response (200 OK)
```json
{
  "message": "Note updated successfully"
}
```

---

### 4. Delete Note

**Endpoint:** `DELETE /api/notes/:id`

**Description:** Delete a note from a case.

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters
- `id` (integer): Note ID

#### Success Response (200 OK)
```json
{
  "message": "Note deleted successfully"
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

### Step 3: Add Hearing

1. **POST** `http://localhost:5000/api/hearings/add`
2. Go to **Body** → Select **raw** → Choose **JSON**
3. Enter:
   ```json
   {
     "case_id": 1,
     "hearing_date": "2026-04-10",
     "court_hall": "Court Hall 3",
     "judge_name": "Justice Sharma",
     "hearing_time": "10:00:00",
     "notes": "Argument stage"
   }
   ```
4. Click **Send**
5. Expected: `"message": "Hearing added successfully"`

### Step 4: Get Hearings

1. **GET** `http://localhost:5000/api/hearings/1`
2. Click **Send**
3. Expected: Array of hearings

### Step 5: Update Hearing Status

1. **PUT** `http://localhost:5000/api/hearings/status/5`
2. Body:
   ```json
   {
     "status": "Completed"
   }
   ```
3. Click **Send**
4. Expected: `"message": "Hearing status updated successfully"`

### Step 6: Add Note

1. **POST** `http://localhost:5000/api/notes/add`
2. Body:
   ```json
   {
     "case_id": 1,
     "note_text": "Prepare witness statement"
   }
   ```
3. Click **Send**
4. Expected: `"message": "Note added successfully"`

### Step 7: Get Notes

1. **GET** `http://localhost:5000/api/notes/1`
2. Click **Send**
3. Expected: Array of notes

---

## Testing with cURL

### Add Hearing
```bash
curl -X POST http://localhost:5000/api/hearings/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": 1,
    "hearing_date": "2026-04-10",
    "court_hall": "Court Hall 3",
    "judge_name": "Justice Sharma",
    "notes": "Argument stage"
  }'
```

### Get Hearings
```bash
curl -X GET http://localhost:5000/api/hearings/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add Note
```bash
curl -X POST http://localhost:5000/api/notes/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": 1,
    "note_text": "Prepare witness statement"
  }'
```

### Get Notes
```bash
curl -X GET http://localhost:5000/api/notes/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Security Features

✅ **JWT Authentication**: All routes protected  
✅ **User Isolation**: Advocates only see their own data  
✅ **Case Verification**: Ensures case belongs to advocate  
✅ **Data Integrity**: Foreign key constraints enforced  

---

## Important Notes

### Hearing Status Workflow
1. **Scheduled** - Initial status when created
2. **Completed** - After hearing concludes
3. **Cancelled** - If hearing is cancelled
4. **Adjourned** - If hearing is postponed

### Notes Privacy
- Notes are **private** to each advocate
- Only visible to the advocate who created them
- Stored securely in database
- Can be edited or deleted anytime

### Data Relationships
```
cases (parent table)
    ↓
    ├── hearings (child - multiple hearings per case)
    └── notes (child - multiple notes per case)
```

Both use CASCADE delete:
- Deleting a case automatically deletes all its hearings
- Deleting a case automatically deletes all its notes

---

## Common Issues & Solutions

### Issue 1: "Case ID is required"
**Cause:** Missing case_id in request body  
**Solution:** Include case_id in JSON body

### Issue 2: "Hearing date is required"
**Cause:** Missing hearing_date field  
**Solution:** Provide hearing_date in YYYY-MM-DD format

### Issue 3: "Invalid status"
**Cause:** Using non-standard status value  
**Solution:** Use one of: Scheduled, Completed, Cancelled, Adjourned

### Issue 4: "Token expired"
**Cause:** Token older than 24 hours  
**Solution:** Login again to get fresh token

---

## Next Steps

After confirming hearings and notes work:

1. ✅ Complete dashboard statistics
2. ✅ Search and filter functionality
3. ✅ Advanced reporting features
4. ✅ Frontend development
