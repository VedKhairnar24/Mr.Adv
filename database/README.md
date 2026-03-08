# Advocate Case Management System - Database Design

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User (Advocate)                       │
│                      Web Browser                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│              Frontend Layer (React.js)                   │
│           User Interface Components                       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│           Backend Layer (Node.js + Express)              │
│         Business Logic & API Endpoints                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓ MySQL Connection
┌─────────────────────────────────────────────────────────┐
│              Database Layer (MySQL)                      │
│             Data Storage & Retrieval                      │
└─────────────────────────────────────────────────────────┘
```

## Database Information

**Database Name:** `advocate_case_db`

**Engine:** InnoDB  
**Character Set:** utf8mb4  
**Collation:** utf8mb4_unicode_ci

## Database Tables Overview

| # | Table Name   | Description                          | Foreign Keys                |
|---|--------------|--------------------------------------|-----------------------------|
| 1 | advocates    | Store advocate accounts              | None                        |
| 2 | clients      | Client information                   | advocate_id → advocates     |
| 3 | cases        | Case details                         | client_id, advocate_id      |
| 4 | documents    | Legal documents                      | case_id → cases             |
| 5 | evidence     | Case evidence files                  | case_id → cases             |
| 6 | hearings     | Court hearing schedules              | case_id → cases             |
| 7 | notes        | Advocate private notes               | case_id → cases             |

## Entity Relationship Diagram

```
┌─────────────┐
│  Advocates  │
│             │
│  id (PK)    │
│  name       │
│  email      │
│  password   │
│  phone      │
└──────┬──────┘
       │
       ├──────────────────────────┐
       │                          │
       ↓                          ↓
┌─────────────┐           ┌─────────────┐
│   Clients   │           │    Cases    │
│             │           │             │
│  id (PK)    │           │  id (PK)    │
│  advocate_  │           │  client_    │
│  id (FK)    │           │  id (FK)    │
│  name       │           │  advocate_  │
│  phone      │           │  id (FK)    │
│  email      │           │  case_title │
│  address    │           │  ...        │
└──────┬──────┘           └──────┬──────┘
       │                         │
       │         ┌───────────────┼───────────────┐
       │         │               │               │
       ↓         ↓               ↓               ↓
┌─────────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
│   Cases     │ │Documents│ │ Evidence │ │ Hearings │
│             │ │         │ │          │ │          │
│  (see above)│ │case(FK) │ │case_(FK) │ │case_(FK) │
│             │ │...      │ │...       │ │...       │
└─────────────┘ └─────────┘ └──────────┘ └──────────┘
       │
       ↓
┌─────────────┐
│    Notes    │
│             │
│ case_id(FK) │
│ note_text   │
│ created_at  │
└─────────────┘
```

## Table Details

### 1. advocates
Primary table storing advocate account information.

**Fields:**
- `id` - Primary key (auto-increment)
- `name` - Advocate's full name
- `email` - Unique email for login
- `password` - Hashed password (bcrypt)
- `phone` - Contact number
- `created_at` - Account creation timestamp

### 2. clients
Stores client personal and contact information.

**Fields:**
- `id` - Primary key
- `advocate_id` - Foreign key to advocates
- `name` - Client's full name
- `phone` - Contact number
- `email` - Email address
- `address` - Full address
- `created_at` - Record creation timestamp

### 3. cases
Core table storing all case information.

**Fields:**
- `id` - Primary key
- `client_id` - Foreign key to clients
- `advocate_id` - Foreign key to advocates
- `case_title` - Case title/description
- `case_number` - Official case number
- `court_name` - Court where case is filed
- `case_type` - Type (Civil, Criminal, Family, etc.)
- `status` - Current status (Active, Pending, Closed)
- `filing_date` - Date when case was filed
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

### 4. documents
Stores uploaded legal documents.

**Fields:**
- `id` - Primary key
- `case_id` - Foreign key to cases
- `document_name` - Name of document
- `file_path` - Path to stored file
- `file_type` - File type (PDF, DOC, etc.)
- `file_size` - File size in bytes
- `uploaded_at` - Upload timestamp

### 5. evidence
Stores case evidence files.

**Fields:**
- `id` - Primary key
- `case_id` - Foreign key to cases
- `evidence_type` - Type (Document, Image, Video, Audio)
- `description` - Evidence description
- `file_path` - Path to stored file
- `file_name` - Original filename
- `uploaded_at` - Upload timestamp

### 6. hearings
Stores court hearing schedules.

**Fields:**
- `id` - Primary key
- `case_id` - Foreign key to cases
- `hearing_date` - Scheduled hearing date
- `court_hall` - Court hall/room number
- `judge_name` - Presiding judge's name
- `hearing_time` - Hearing time
- `notes` - Additional notes
- `status` - Status (Scheduled, Completed, Cancelled)
- `created_at` - Record creation timestamp

### 7. notes
Private notes for advocates.

**Fields:**
- `id` - Primary key
- `case_id` - Foreign key to cases
- `note_text` - Note content
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Relationships

### One-to-Many Relationships

1. **Advocate → Clients**
   - One advocate can have many clients
   - Each client belongs to one advocate

2. **Advocate → Cases**
   - One advocate can handle many cases
   - Each case belongs to one advocate

3. **Client → Cases**
   - One client can have multiple cases
   - Each case belongs to one client

4. **Case → Documents**
   - One case can have multiple documents
   - Each document belongs to one case

5. **Case → Evidence**
   - One case can have multiple evidence items
   - Each evidence item belongs to one case

6. **Case → Hearings**
   - One case can have multiple hearings
   - Each hearing belongs to one case

7. **Case → Notes**
   - One case can have multiple notes
   - Each note belongs to one case

## Data Integrity

### Foreign Key Constraints
All foreign keys use `ON DELETE CASCADE` to ensure:
- When an advocate is deleted, all their clients and cases are deleted
- When a client is deleted, all their cases are deleted
- When a case is deleted, all related documents, evidence, hearings, and notes are deleted

### Unique Constraints
- `advocates.email` - Ensures unique email for each advocate
- Prevents duplicate accounts

### Default Values
- `cases.status` = 'Active'
- `hearings.status` = 'Scheduled'
- All timestamps auto-populate on record creation

## Sample Data

The schema includes sample data for testing:
- 2 advocates
- 3 clients
- 4 cases
- 4 documents
- 4 evidence items
- 4 hearings
- 4 notes

## Installation Steps

1. Install MySQL Server
2. Open MySQL Workbench or command line
3. Run the complete `schema.sql` file
4. Verify tables are created
5. Check sample data is inserted

## Verification Queries

```sql
-- Count records in each table
SELECT 'advocates' as table_name, COUNT(*) as count FROM advocates
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'cases', COUNT(*) FROM cases
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'evidence', COUNT(*) FROM evidence
UNION ALL
SELECT 'hearings', COUNT(*) FROM hearings
UNION ALL
SELECT 'notes', COUNT(*) FROM notes;
```
