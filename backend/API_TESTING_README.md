# API Testing README

This guide is dedicated to API testing for the backend service.

## Base Information

- Base URL: http://localhost:5000/api
- Server start command (dev): npm run dev
- Server start command (prod): npm start
- Existing auth test file: backend/test-auth.http

## Prerequisites

1. Install backend dependencies.
2. Configure .env for database and JWT.
3. Ensure MySQL is running and schema is imported.
4. Start backend from backend folder.

## Quick Start

1. Run health check.
2. Register user.
3. Login and copy token.
4. Use Authorization header for protected routes.
5. Test modules one by one.

## Health and Connectivity Tests

### Health

Method: GET

URL: /health

Expected: 200

### Database Test

Method: GET

URL: /test-db

Expected: 200

## Authentication Test Flow

### 1) Register

Method: POST

URL: /auth/register

Body:

```json
{
  "name": "API Tester",
  "email": "apitester@example.com",
  "password": "Test@12345",
  "phone": "9876543210"
}
```

Expected: 201

### 2) Login

Method: POST

URL: /auth/login

Body:

```json
{
  "email": "apitester@example.com",
  "password": "Test@12345"
}
```

Expected: 200 and token in response

### 3) Profile

Method: GET

URL: /auth/profile

Header:

Authorization: Bearer <TOKEN>

Expected: 200

## Protected Route Header

Use this header for all protected endpoints:

Authorization: Bearer <TOKEN>

## Module Wise API Testing Checklist

## Clients

- POST /clients/create
- GET /clients/all
- GET /clients/count
- GET /clients/:id
- PUT /clients/:id
- DELETE /clients/:id

## Cases

- POST /cases/create
- GET /cases
- GET /cases/all
- GET /cases/count
- GET /cases/search
- GET /cases/filter
- GET /cases/client/:clientId
- GET /cases/:id
- PUT /cases/:id
- PUT /cases/status/:id
- PUT /cases/:id/status
- DELETE /cases/:id

## Hearings

- POST /hearings/add
- GET /hearings/all
- GET /hearings/upcoming
- GET /hearings/case/:caseId
- GET /hearings/detail/:id
- PUT /hearings/status/:id
- PUT /hearings/:id
- DELETE /hearings/:id

## Notes

- POST /notes
- GET /notes
- GET /notes/case/:caseId
- GET /notes/:id
- PUT /notes/:id
- DELETE /notes/:id
- POST /notes/add
- GET /notes/legacy/:caseId

## Documents

- POST /documents/upload (multipart/form-data)
- GET /documents/case/:caseId
- GET /documents/:caseId
- DELETE /documents/:id

## Evidence

- POST /evidence/upload (multipart/form-data)
- GET /evidence/:caseId
- DELETE /evidence/:id

## Dashboard

- GET /dashboard
- GET /dashboard/case-types
- GET /dashboard/monthly-activity

## Courts

- GET /courts
- POST /courts
- DELETE /courts/:id

## Settings

- GET /settings/profile
- PUT /settings/profile
- PUT /settings/change-password

## AI

- POST /ai/generate/:caseId
- GET /ai/notes/:caseId
- DELETE /ai/notes/:id

AI generate request body example:

```json
{
  "notesText": "Complainant states payment was made but goods were not delivered.",
  "mainPoints": [
    "Agreement date is 14 Jan 2026",
    "Notice sent on 2 Feb 2026",
    "No written reply from opposite party"
  ],
  "includeCaseNotes": true
}
```

## Recommended Test Order

1. Health and DB check
2. Auth register/login/profile
3. Clients create and fetch
4. Cases create and fetch
5. Hearings and notes
6. Documents and evidence upload
7. Dashboard and courts
8. AI generation and AI notes retrieval
9. Negative tests (invalid token, missing fields, invalid ids)

## Common Failure Cases to Validate

- Missing Authorization header returns 401
- Invalid token returns 403
- Missing required body fields returns 400
- Non existing resource id returns 404
- Duplicate unique fields returns 409 where applicable
- Server side unexpected failures return 500

## Tools You Can Use

- Postman collection
- VS Code REST Client with .http files
- curl from terminal

## Related Files

- backend/test-auth.http
- backend/AUTH_API.md
- backend/CLIENT_API.md
- backend/CASE_API.md
- backend/HEARING_NOTES_API.md
- backend/DOCUMENT_EVIDENCE_API.md
- backend/DASHBOARD_SEARCH_API.md
