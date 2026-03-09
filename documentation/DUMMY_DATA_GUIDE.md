# Dummy Data Guide - Mr.Adv Database

## 📁 File Created

**File:** `database/create_dummy_data.sql`

---

## 🎯 What's Included

The dummy data script creates realistic test data for all tables:

### 1. **Advocates (3 users)**
- Rajesh Kumar (Delhi)
- Priya Sharma (Delhi High Court)
- Amit Patel (Ahmedabad, Gujarat)

### 2. **Clients (12 clients)**
- 5 clients for Advocate 1
- 4 clients for Advocate 2
- 3 clients for Advocate 3

### 3. **Cases (18 cases)**
- Civil Suits
- Criminal Matters
- Matrimonial Cases
- Commercial Disputes
- Writ Petitions
- Arbitration Matters
- Execution Proceedings
- Labor Matters

### 4. **Hearings (40+ hearings)**
- Past hearings (Completed status)
- Future hearings (Scheduled status)
- Realistic court venues and judges
- Hearing notes and timestamps

### 5. **Documents (30+ documents)**
- Property deeds
- FIR copies
- Marriage certificates
- Bail orders
- Contracts
- Court orders
- Various legal documents

### 6. **Notes (20+ case notes)**
- Case strategy notes
- Client instructions
- Important reminders
- Hearing preparations

---

## 🚀 How to Use

### Method 1: MySQL Command Line

```bash
# Navigate to database folder
cd database

# Run the script
mysql -u root -p mr_adv < create_dummy_data.sql
```

Enter your MySQL root password when prompted.

---

### Method 2: MySQL Workbench

1. Open **MySQL Workbench**
2. Connect to your database
3. Click **File → Open SQL Script**
4. Select `create_dummy_data.sql`
5. Make sure connection is set to `mr_adv` schema
6. Click **Lightning bolt icon** (Execute)

---

### Method 3: phpMyAdmin

1. Open **phpMyAdmin** in browser
2. Select `mr_adv` database from left panel
3. Click **Import** tab
4. Choose file: `create_dummy_data.sql`
5. Click **Go** button

---

### Method 4: Direct MySQL Command

```sql
-- Login to MySQL
mysql -u root -p

-- Select database
USE mr_adv;

-- Source the file
source C:/Users/khair/OneDrive/Documents/Mr.Adv/database/create_dummy_data.sql;
```

---

## ✅ Verify Data Insertion

After running the script, verify the data:

```sql
-- Check record counts
SELECT 
    'Advocates' AS Table_Name, 
    COUNT(*) AS Record_Count 
FROM advocates
UNION ALL
SELECT 'Clients', COUNT(*) FROM clients
UNION ALL
SELECT 'Cases', COUNT(*) FROM cases
UNION ALL
SELECT 'Hearings', COUNT(*) FROM hearings
UNION ALL
SELECT 'Documents', COUNT(*) FROM documents
UNION ALL
SELECT 'Notes', COUNT(*) FROM notes;
```

**Expected Results:**
```
┌─────────────┬──────────────┐
│ Table_Name  │ Record_Count │
├─────────────┼──────────────┤
│ Advocates   │ 3            │
│ Clients     │ 12           │
│ Cases       │ 18           │
│ Hearings    │ 40+          │
│ Documents   │ 30+          │
│ Notes       │ 20+          │
└─────────────┴──────────────┘
```

---

## 🔍 Sample Queries

### View All Cases with Client Names

```sql
SELECT 
    c.case_number,
    c.case_type,
    c.case_status,
    cl.name AS client_name,
    a.name AS advocate_name
FROM cases c
JOIN clients cl ON c.client_id = cl.id
JOIN advocates a ON c.advocate_id = a.id
ORDER BY c.filing_date DESC;
```

### View Upcoming Hearings

```sql
SELECT 
    c.case_number,
    h.hearing_date,
    h.hearing_time,
    h.court_hall,
    h.judge_name,
    h.notes,
    h.status
FROM hearings h
JOIN cases c ON h.case_id = c.id
WHERE h.hearing_date >= CURDATE()
AND h.status = 'Scheduled'
ORDER BY h.hearing_date, h.hearing_time;
```

### View Documents by Case

```sql
SELECT 
    c.case_number,
    d.document_name,
    d.file_path,
    d.file_type,
    d.file_size,
    d.uploaded_at
FROM documents d
JOIN cases c ON d.case_id = c.id
ORDER BY d.uploaded_at DESC;
```

---

## 📊 Test Scenarios

### Scenario 1: Test Dashboard

With dummy data, your dashboard should show:
- ✅ 3 advocates
- ✅ 12 clients
- ✅ 18 cases
- ✅ 40+ hearings (check upcoming count)

### Scenario 2: Test Case Detail Page

Open any case and verify:
- ✅ Case information displays
- ✅ Client details visible
- ✅ Documents list populated
- ✅ Hearing timeline shows multiple hearings
- ✅ Notes section has content

### Scenario 3: Test Search & Filter

Test searching for:
- ✅ Client names (e.g., "Ramesh", "Sunita")
- ✅ Case numbers (e.g., "CS/1234/2023")
- ✅ Case types (Civil, Criminal, etc.)

---

## 🔧 Troubleshooting

### Issue 1: Foreign Key Constraint Errors

**Error:**
```
Cannot add or update a child row: a foreign key constraint fails
```

**Solution:**
Make sure you're inserting data in correct order:
1. Advocates first
2. Then Clients
3. Then Cases
4. Then Hearings/Documents/Notes

The script already follows this order, so just run it as-is.

---

### Issue 2: Duplicate Entry Errors

**Error:**
```
Duplicate entry 'X' for key 'PRIMARY'
```

**Cause:** Data already exists in tables

**Solution A - Clear existing data:**
```sql
-- WARNING: This deletes all existing data!
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notes;
TRUNCATE TABLE documents;
TRUNCATE TABLE hearings;
TRUNCATE TABLE cases;
TRUNCATE TABLE clients;
TRUNCATE TABLE advocates;
SET FOREIGN_KEY_CHECKS = 1;

-- Now run the dummy data script again
```

**Solution B - Skip duplicates:**
Add `IGNORE` keyword:
```sql
INSERT IGNORE INTO advocates (...) VALUES ...
```

---

### Issue 3: Database Not Selected

**Error:**
```
No database selected
```

**Solution:**
```sql
USE mr_adv;
```

Or add database name at top of script:
```sql
USE mr_adv;
-- Rest of script follows
```

---

## 🗑️ Clean Up (Remove Dummy Data)

If you want to remove all dummy data:

```sql
-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Delete all data (order matters due to foreign keys)
DELETE FROM notes;
DELETE FROM documents;
DELETE FROM hearings;
DELETE FROM cases;
DELETE FROM clients;
DELETE FROM advocates;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
```

Or truncate tables:
```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notes;
TRUNCATE TABLE documents;
TRUNCATE TABLE hearings;
TRUNCATE TABLE cases;
TRUNCATE TABLE clients;
TRUNCATE TABLE advocates;
SET FOREIGN_KEY_CHECKS = 1;
```

---

## 📋 Data Relationships

```
Advocates (3)
    ├── Clients (12)
    │   └── Cases (18)
    │       ├── Hearings (40+)
    │       ├── Documents (30+)
    │       └── Notes (20+)
```

**Foreign Key Chain:**
- `clients.advocate_id` → `advocates.id`
- `cases.advocate_id` → `advocates.id`
- `cases.client_id` → `clients.id`
- `hearings.case_id` → `cases.id`
- `documents.case_id` → `cases.id`
- `notes.case_id` → `cases.id`

---

## 🎨 Realistic Data Features

### Advocates
- Different bar councils (Delhi, Gujarat)
- Unique enrollment numbers
- Realistic phone numbers
- Professional email addresses

### Clients
- Diverse names from different regions
- Valid Indian phone formats
- Realistic Delhi/Gujarat addresses
- Mix of individual and family clients

### Cases
- Proper case numbering format
- Variety of case types
- Realistic filing dates
- Appropriate court/judge assignments
- Status progression (Pending → Active → Closed)

### Hearings
- Chronological sequence
- Realistic hearing gaps (2-4 weeks)
- Proper court venue names
- Actual judge names
- Meaningful hearing notes
- Status tracking (Completed/Scheduled)

### Documents
- Descriptive filenames
- Proper file paths
- Correct MIME types
- Realistic file sizes
- Timestamped uploads

### Notes
- Context-aware case notes
- Strategic legal thinking
- Client communication records
- Important date reminders
- Action items

---

## 💡 Testing Tips

### Tip 1: Test Authentication

Login credentials are NOT included in dummy data. You need to:
1. Register new advocates via app
2. Or manually insert with proper password hash

### Tip 2: Test File Uploads

Dummy documents reference files that don't actually exist. For testing:
1. Create dummy PDF files
2. Name them according to database entries
3. Place in `backend/uploads/documents/` folder

Example:
```bash
# Create test PDF
echo "Test document" > backend/uploads/documents/1739564823456_property_deed.pdf
```

### Tip 3: Test Hearing Dates

Hearings include both past and future dates:
- **Past hearings:** Status = 'Completed'
- **Future hearings:** Status = 'Scheduled'

This tests the hearing timeline feature effectively.

### Tip 4: Test Pagination

With 18 cases and 40+ hearings, you can test:
- List scrolling
- Search functionality
- Filter operations
- Sorting features

---

## 📈 Database Size After Import

**Estimated sizes:**
```
Table        | Rows | Approx. Size
-------------|------|-------------
advocates    | 3    | ~1 KB
clients      | 12   | ~2 KB
cases        | 18   | ~5 KB
hearings     | 40+  | ~10 KB
documents    | 30+  | ~8 KB
notes        | 20+  | ~5 KB
-------------|------|-------------
TOTAL        | 123+ | ~31 KB
```

Note: This doesn't include actual document files, only database records.

---

## ✨ Quick Start Commands

```bash
# 1. Navigate to project
cd C:\Users\khair\OneDrive\Documents\Mr.Adv

# 2. Stop backend if running
# (Ctrl+C in backend terminal)

# 3. Import dummy data
mysql -u root -p mr_adv < database/create_dummy_data.sql

# 4. Restart backend
cd backend
npm start

# 5. Open app and test!
# http://localhost:5173
```

---

## 🎉 Ready to Test!

After running this script, your database will have:
- ✅ **Realistic test data** across all tables
- ✅ **Proper relationships** between entities
- ✅ **Variety of scenarios** (different courts, case types, statuses)
- ✅ **Ready-to-test** frontend features

**Your app will now show:**
- Multiple clients in the list
- Cases with full details
- Hearing timelines with dates
- Document lists
- Case notes
- Dashboard statistics

**Happy testing!** 🚀
