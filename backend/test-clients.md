# Client Management Test Cases

## Prerequisites
✅ Server running (`npm run dev`)  
✅ MySQL database connected  
✅ Valid JWT token from login  

---

## Get Token First

**POST** `http://localhost:5000/api/auth/login`

```json
{
  "email": "ved@test.com",
  "password": "123456"
}
```

**Copy the token:** `_________________________________`

---

## Test Case 1: Create Client (With Token)

**POST** `http://localhost:5000/api/clients/create`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Rahul Sharma",
  "phone": "8888888888",
  "email": "rahul@test.com",
  "address": "Mumbai"
}
```

**Expected (201):**
```json
{
  "message": "Client added successfully",
  "clientId": <number>
}
```

**Result:** ⬜ Pass / ⬜ Fail  
**Client ID Created:** _______

---

## Test Case 2: Create Client (Missing Required Fields)

**POST** `http://localhost:5000/api/clients/create`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Incomplete Client"
}
```

**Expected (400):**
```json
{
  "message": "Name and phone are required"
}
```

**Result:** ⬜ Pass / ⬜ Fail

---

## Test Case 3: Create Client (No Token)

**POST** `http://localhost:5000/api/clients/create`

**Headers:**
```
Content-Type: application/json
```
(NO Authorization header)

**Body:**
```json
{
  "name": "Test Client",
  "phone": "9999999999"
}
```

**Expected (403):**
```json
{
  "message": "Token required"
}
```

**Result:** ⬜ Pass / ⬜ Fail

---

## Test Case 4: Get All Clients

**GET** `http://localhost:5000/api/clients/all`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Expected (200):** Array of clients

**Result:** ⬜ Pass / ⬜ Fail  
**Number of Clients:** _______

---

## Test Case 5: Get Single Client by ID

**GET** `http://localhost:5000/api/clients/<CLIENT_ID>`

Replace `<CLIENT_ID>` with actual ID from Test Case 1.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Expected (200):** Client object with details

**Result:** ⬜ Pass / ⬜ Fail

---

## Test Case 6: Get Non-Existent Client

**GET** `http://localhost:5000/api/clients/99999`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Expected (404):**
```json
{
  "message": "Client not found"
}
```

**Result:** ⬜ Pass / ⬜ Fail

---

## Test Case 7: Update Client

**PUT** `http://localhost:5000/api/clients/<CLIENT_ID>`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Updated Name",
  "phone": "9999999999",
  "email": "updated@test.com",
  "address": "New Address"
}
```

**Expected (200):**
```json
{
  "message": "Client updated successfully"
}
```

**Result:** ⬜ Pass / ⬜ Fail

---

## Test Case 8: Delete Client

**DELETE** `http://localhost:5000/api/clients/<CLIENT_ID>`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Expected (200):**
```json
{
  "message": "Client deleted successfully"
}
```

**Result:** ⬜ Pass / ⬜ Fail

---

## Test Case 9: Access Deleted Client

**GET** `http://localhost:5000/api/clients/<DELETED_CLIENT_ID>`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Expected (404):**
```json
{
  "message": "Client not found"
}
```

**Result:** ⬜ Pass / ⬜ Fail

---

## Manual Testing Checklist

After completing all tests:

- [ ] Token is valid and not expired
- [ ] Client creation works with valid data
- [ ] Required field validation works
- [ ] Missing token is rejected
- [ ] All clients list returns correct data
- [ ] Single client fetch works
- [ ] Non-existent client returns 404
- [ ] Update client modifies data correctly
- [ ] Delete client removes record
- [ ] Deleted client cannot be accessed again

---

## Notes

**Token Used:**
```
_______________________________________________________________
_______________________________________________________________
```

**Clients Created:**
1. _______________________ (ID: ____)
2. _______________________ (ID: ____)
3. _______________________ (ID: ____)

**Issues Encountered:**
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

---

## Overall Status

Tests Passed: ___ / 9  
Tests Failed: ___ / 9  

**Status:** ⬜ All Passed / ⬜ Some Failed
