# Client Management API Documentation

## Base URL
```
http://localhost:5000/api/clients
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
| POST | `/create` | Create new client | Yes |
| GET | `/all` | Get all clients | Yes |
| GET | `/:id` | Get single client | Yes |
| PUT | `/:id` | Update client | Yes |
| DELETE | `/:id` | Delete client | Yes |

---

## 1. Create New Client

**Endpoint:** `POST /api/clients/create`

**Description:** Create a new client record for the logged-in advocate.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Request Body (JSON)
```json
{
  "name": "Rahul Sharma",
  "phone": "8888888888",
  "email": "rahul@test.com",
  "address": "Mumbai"
}
```

### Required Fields
- `name` (string): Client's full name
- `phone` (string): Contact number

### Optional Fields
- `email` (string): Email address
- `address` (string): Full address

### Success Response (201 Created)
```json
{
  "message": "Client added successfully",
  "clientId": 5
}
```

### Error Responses

**400 Bad Request - Missing Required Fields**
```json
{
  "message": "Name and phone are required"
}
```

**403 Forbidden - No Token**
```json
{
  "message": "Token required"
}
```

**401 Unauthorized - Invalid Token**
```json
{
  "message": "Invalid token"
}
```

**500 Internal Server Error**
```json
{
  "message": "Client creation failed",
  "error": "Error details"
}
```

---

## 2. Get All Clients

**Endpoint:** `GET /api/clients/all`

**Description:** Retrieve all clients belonging to the logged-in advocate.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Success Response (200 OK)
```json
[
  {
    "id": 5,
    "advocate_id": 3,
    "name": "Rahul Sharma",
    "phone": "8888888888",
    "email": "rahul@test.com",
    "address": "Mumbai",
    "created_at": "2026-03-07T14:30:00.000Z"
  },
  {
    "id": 4,
    "advocate_id": 3,
    "name": "Priya Patel",
    "phone": "7777777777",
    "email": "priya@test.com",
    "address": "Delhi",
    "created_at": "2026-03-07T13:20:00.000Z"
  }
]
```

### Empty Response (No Clients)
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
  "message": "Error fetching clients",
  "error": "Error details"
}
```

---

## 3. Get Single Client by ID

**Endpoint:** `GET /api/clients/:id`

**Description:** Retrieve details of a specific client by ID.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### URL Parameters
- `id` (integer): Client ID

### Example
```
GET http://localhost:5000/api/clients/5
```

### Success Response (200 OK)
```json
{
  "id": 5,
  "advocate_id": 3,
  "name": "Rahul Sharma",
  "phone": "8888888888",
  "email": "rahul@test.com",
  "address": "Mumbai",
  "created_at": "2026-03-07T14:30:00.000Z"
}
```

### Error Responses

**404 Not Found - Client Not Found**
```json
{
  "message": "Client not found"
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
  "message": "Error fetching client",
  "error": "Error details"
}
```

---

## 4. Update Client Information

**Endpoint:** `PUT /api/clients/:id`

**Description:** Update an existing client's information.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### URL Parameters
- `id` (integer): Client ID

### Request Body (JSON)
```json
{
  "name": "Rahul Kumar Sharma",
  "phone": "9999999999",
  "email": "rahul.sharma@test.com",
  "address": "Andheri, Mumbai"
}
```

### Success Response (200 OK)
```json
{
  "message": "Client updated successfully"
}
```

### Error Responses

**404 Not Found - Client Not Found**
```json
{
  "message": "Client not found"
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
  "message": "Failed to update client",
  "error": "Error details"
}
```

---

## 5. Delete Client

**Endpoint:** `DELETE /api/clients/:id`

**Description:** Delete a client and all associated cases, documents, evidence, hearings, and notes.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### URL Parameters
- `id` (integer): Client ID

### Example
```
DELETE http://localhost:5000/api/clients/5
```

### Success Response (200 OK)
```json
{
  "message": "Client deleted successfully"
}
```

### Error Responses

**404 Not Found - Client Not Found**
```json
{
  "message": "Client not found"
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
  "message": "Failed to delete client",
  "error": "Error details"
}
```

---

## Testing with Postman

### Step 1: Login First

Before testing client APIs, you need a valid token.

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
1. Go to **Headers** tab
2. Add:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN_HERE`

Or use **Authorization** tab:
- Type: `Bearer Token`
- Token: Paste your token

### Step 3: Create Client

1. **POST** `http://localhost:5000/api/clients/create`
2. Go to **Body** → Select **raw** → Choose **JSON**
3. Enter:
   ```json
   {
     "name": "Rahul Sharma",
     "phone": "8888888888",
     "email": "rahul@test.com",
     "address": "Mumbai"
   }
   ```
4. Click **Send**
5. Expected: `"message": "Client added successfully"`

### Step 4: Get All Clients

1. **GET** `http://localhost:5000/api/clients/all`
2. Click **Send**
3. Expected: Array of clients

### Step 5: Get Single Client

1. **GET** `http://localhost:5000/api/clients/5` (replace 5 with actual ID)
2. Click **Send**
3. Expected: Client details

### Step 6: Update Client

1. **PUT** `http://localhost:5000/api/clients/5`
2. Body:
   ```json
   {
     "name": "Updated Name",
     "phone": "9999999999",
     "email": "updated@test.com",
     "address": "New Address"
   }
   ```
3. Click **Send**
4. Expected: `"message": "Client updated successfully"`

### Step 7: Delete Client

1. **DELETE** `http://localhost:5000/api/clients/5`
2. Click **Send**
3. Expected: `"message": "Client deleted successfully"`

---

## Testing with cURL

### Create Client
```bash
curl -X POST http://localhost:5000/api/clients/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Sharma",
    "phone": "8888888888",
    "email": "rahul@test.com",
    "address": "Mumbai"
  }'
```

### Get All Clients
```bash
curl -X GET http://localhost:5000/api/clients/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Single Client
```bash
curl -X GET http://localhost:5000/api/clients/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Client
```bash
curl -X PUT http://localhost:5000/api/clients/5 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "phone": "9999999999"
  }'
```

### Delete Client
```bash
curl -X DELETE http://localhost:5000/api/clients/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Security Features

✅ **JWT Authentication**: All routes protected  
✅ **User Isolation**: Advocates only see their own clients  
✅ **Data Integrity**: Foreign key constraints enforced  
✅ **Cascade Delete**: Related data cleaned automatically  
✅ **Input Validation**: Required fields checked  

---

## Important Notes

### Data Isolation
Each advocate can ONLY access their own clients. The middleware ensures:
- `req.advocateId` is extracted from JWT token
- All queries filter by `advocate_id`
- Cross-user data access is prevented

### Cascade Delete
When you delete a client, the database automatically deletes:
- All cases associated with that client
- All documents in those cases
- All evidence attached to those cases
- All hearings scheduled for those cases
- All notes created for those cases

This is handled by the database FOREIGN KEY constraints with `ON DELETE CASCADE`.

### Best Practices
1. Always validate client data on frontend before sending
2. Show confirmation dialog before deleting
3. Handle errors gracefully in UI
4. Store token securely (localStorage or better)
5. Refresh token before expiration (24 hours)

---

## Common Issues & Solutions

### Issue 1: "Token required"
**Cause:** Authorization header missing  
**Solution:** Add `Authorization: Bearer TOKEN` header

### Issue 2: "Invalid token"
**Cause:** Token expired or invalid  
**Solution:** Login again to get fresh token

### Issue 3: "Client not found"
**Cause:** Client doesn't exist or belongs to different advocate  
**Solution:** Verify client ID and user permissions

### Issue 4: "Name and phone are required"
**Cause:** Missing required fields in request  
**Solution:** Include both `name` and `phone` in body

---

## Next Steps

After confirming client management works:

1. ✅ Case Management APIs
2. ✅ Document Upload APIs
3. ✅ Evidence Management APIs
4. ✅ Hearing Management APIs
5. ✅ Notes Management APIs

All future APIs will follow the same pattern:
- JWT authentication
- User data isolation
- Proper error handling
