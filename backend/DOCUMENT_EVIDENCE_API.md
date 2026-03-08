# Document & Evidence Upload API Documentation

## Base URLs
```
Documents: http://localhost:5000/api/documents
Evidence:  http://localhost:5000/api/evidence
Files:     http://localhost:5000/uploads
```

## Authentication Required
**All endpoints require JWT authentication.** Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## Part 1: Document Management APIs

### Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/upload` | Upload document | Yes |
| GET | `/:caseId` | Get case documents | Yes |
| DELETE | `/:id` | Delete document | Yes |

---

### 1. Upload Legal Document

**Endpoint:** `POST /api/documents/upload`

**Description:** Upload a legal document (PDF, Word) and attach it to a case.

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

#### Request Body (Form-Data)
```
Key: case_id    Type: text    Value: 1
Key: file       Type: file    Value: [Select PDF/Word file]
```

#### Allowed File Types
- **PDF**: `.pdf` (application/pdf)
- **Word**: `.doc`, `.docx` (application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document)

#### File Size Limit
- Maximum: **50MB**

#### Success Response (201 Created)
```json
{
  "message": "Document uploaded successfully",
  "documentId": 5,
  "fileName": "contract.pdf",
  "filePath": "uploads\\documents\\1741363200000-123456789.pdf"
}
```

#### Error Responses

**400 Bad Request - Missing Case ID**
```json
{
  "message": "Case ID is required"
}
```

**400 Bad Request - No File**
```json
{
  "message": "No file uploaded"
}
```

**404 Not Found - Case Not Found**
```json
{
  "message": "Case not found or does not belong to you"
}
```

**400 Bad Request - Invalid File Type**
```json
{
  "message": "Only PDF and Word documents are allowed"
}
```

---

### 2. Get All Documents for a Case

**Endpoint:** `GET /api/documents/:caseId`

**Description:** Retrieve all documents attached to a specific case.

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters
- `caseId` (integer): Case ID

#### Example
```
GET http://localhost:5000/api/documents/1
```

#### Success Response (200 OK)
```json
[
  {
    "id": 5,
    "case_id": 1,
    "document_name": "Contract Agreement.pdf",
    "file_path": "uploads\\documents\\1741363200000-123456789.pdf",
    "file_type": "application/pdf",
    "file_size": 245678,
    "uploaded_at": "2026-03-07T14:30:00.000Z"
  },
  {
    "id": 4,
    "case_id": 1,
    "document_name": "Affidavit.docx",
    "file_path": "uploads\\documents\\1741363100000-987654321.docx",
    "file_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "file_size": 156432,
    "uploaded_at": "2026-03-07T13:20:00.000Z"
  }
]
```

#### Accessing Files
To download/access a file:
```
http://localhost:5000/uploads/documents/1741363200000-123456789.pdf
```

---

### 3. Delete Document

**Endpoint:** `DELETE /api/documents/:id`

**Description:** Delete a document from database and remove physical file.

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters
- `id` (integer): Document ID

#### Success Response (200 OK)
```json
{
  "message": "Document deleted successfully"
}
```

---

## Part 2: Evidence Management APIs

### Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/upload` | Upload evidence | Yes |
| GET | `/:caseId` | Get case evidence | Yes |
| DELETE | `/:id` | Delete evidence | Yes |

---

### 1. Upload Evidence

**Endpoint:** `POST /api/evidence/upload`

**Description:** Upload evidence (images, videos, audio) and attach it to a case.

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

#### Request Body (Form-Data)
```
Key: case_id         Type: text    Value: 1
Key: evidence_type   Type: text    Value: Image
Key: description     Type: text    Value: Crime scene photo
Key: file            Type: file    Value: [Select file]
```

#### Allowed File Types
- **Images**: `.jpg`, `.jpeg`, `.png` (image/jpeg, image/png, image/jpg)
- **Videos**: `.mp4` (video/mp4)
- **Audio**: `.mp3`, `.mpeg` (audio/mpeg, audio/mp3)

#### Evidence Types (Suggested)
- `Image`
- `Video`
- `Audio`
- `Document`
- `Physical`

#### File Size Limit
- Maximum: **50MB**

#### Success Response (201 Created)
```json
{
  "message": "Evidence uploaded successfully",
  "evidenceId": 3,
  "fileName": "photo.jpg",
  "filePath": "uploads\\evidence\\1741363200000-123456789.jpg"
}
```

#### Error Responses

**400 Bad Request - Missing Case ID**
```json
{
  "message": "Case ID is required"
}
```

**400 Bad Request - Missing Evidence Type**
```json
{
  "message": "Evidence type is required"
}
```

**400 Bad Request - No File**
```json
{
  "message": "No file uploaded"
}
```

**400 Bad Request - Invalid File Type**
```json
{
  "message": "Invalid evidence file type. Allowed: images, videos, audio"
}
```

---

### 2. Get All Evidence for a Case

**Endpoint:** `GET /api/evidence/:caseId`

**Description:** Retrieve all evidence attached to a specific case.

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters
- `caseId` (integer): Case ID

#### Example
```
GET http://localhost:5000/api/evidence/1
```

#### Success Response (200 OK)
```json
[
  {
    "id": 3,
    "case_id": 1,
    "evidence_type": "Image",
    "description": "Crime scene photograph",
    "file_path": "uploads\\evidence\\1741363200000-123456789.jpg",
    "file_name": "crime_scene.jpg",
    "uploaded_at": "2026-03-07T14:30:00.000Z"
  },
  {
    "id": 2,
    "case_id": 1,
    "evidence_type": "Video",
    "description": "CCTV footage",
    "file_path": "uploads\\evidence\\1741363100000-987654321.mp4",
    "file_name": "cctv_footage.mp4",
    "uploaded_at": "2026-03-07T13:20:00.000Z"
  }
]
```

#### Accessing Files
To view/download evidence:
```
http://localhost:5000/uploads/evidence/1741363200000-123456789.jpg
```

---

### 3. Delete Evidence

**Endpoint:** `DELETE /api/evidence/:id`

**Description:** Delete evidence from database and remove physical file.

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters
- `id` (integer): Evidence ID

#### Success Response (200 OK)
```json
{
  "message": "Evidence deleted successfully"
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

### Step 3: Upload Document

1. **POST** `http://localhost:5000/api/documents/upload`
2. Go to **Body** → Select **form-data**
3. Add fields:
   - Key: `case_id` (Type: Text) → Value: `1`
   - Key: `file` (Type: File) → Click "Select Files" and choose PDF/Word file
4. Click **Send**
5. Expected: `"message": "Document uploaded successfully"`

### Step 4: Get Documents

1. **GET** `http://localhost:5000/api/documents/1`
2. Click **Send**
3. Expected: Array of documents

### Step 5: Upload Evidence

1. **POST** `http://localhost:5000/api/evidence/upload`
2. Go to **Body** → Select **form-data**
3. Add fields:
   - Key: `case_id` (Type: Text) → Value: `1`
   - Key: `evidence_type` (Type: Text) → Value: `Image`
   - Key: `description` (Type: Text) → Value: `Test evidence`
   - Key: `file` (Type: File) → Select image/video/audio file
4. Click **Send**
5. Expected: `"message": "Evidence uploaded successfully"`

### Step 6: Get Evidence

1. **GET** `http://localhost:5000/api/evidence/1`
2. Click **Send**
3. Expected: Array of evidence items

---

## Testing with cURL

### Upload Document
```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "case_id=1" \
  -F "file=@/path/to/document.pdf"
```

### Get Documents
```bash
curl -X GET http://localhost:5000/api/documents/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Upload Evidence
```bash
curl -X POST http://localhost:5000/api/evidence/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "case_id=1" \
  -F "evidence_type=Image" \
  -F "description=Test photo" \
  -F "file=@/path/to/photo.jpg"
```

### Get Evidence
```bash
curl -X GET http://localhost:5000/api/evidence/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Security Features

✅ **JWT Authentication**: All routes protected  
✅ **User Isolation**: Advocates only see their own files  
✅ **Case Verification**: Ensures case belongs to advocate  
✅ **File Type Validation**: Only allowed file types accepted  
✅ **File Size Limits**: Prevents large file uploads  
✅ **Physical File Deletion**: Removes files on delete  

---

## Important Notes

### File Storage Structure
```
backend/uploads/
├── documents/
│   ├── 1741363200000-123456789.pdf
│   └── 1741363300000-987654321.docx
└── evidence/
    ├── 1741363400000-456789123.jpg
    └── 1741363500000-321654987.mp4
```

### File Naming Convention
Files are renamed on upload to prevent conflicts:
```
Format: TIMESTAMP-RANDOMNUMBER.EXTENSION
Example: 1741363200000-123456789.pdf
```

### File Access
Uploaded files are accessible via:
```
http://localhost:5000/uploads/documents/[filename]
http://localhost:5000/uploads/evidence/[filename]
```

---

## Common Issues & Solutions

### Issue 1: "No file uploaded"
**Cause:** File field missing or empty  
**Solution:** Ensure file is selected in form-data

### Issue 2: "Invalid file type"
**Cause:** File format not allowed  
**Solution:** Use only PDF/Word for documents, images/videos/audio for evidence

### Issue 3: "Case not found or does not belong to you"
**Cause:** Case doesn't exist or belongs to another advocate  
**Solution:** Verify case ownership before uploading

### Issue 4: File too large
**Cause:** File exceeds 50MB limit  
**Solution:** Compress file or split into smaller parts

---

## Next Steps

After confirming file uploads work:

1. ✅ Hearing Management APIs
2. ✅ Notes Management APIs
3. ✅ Complete dashboard statistics
4. ✅ Search and filter functionality
