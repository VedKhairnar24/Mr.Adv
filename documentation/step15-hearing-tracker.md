# Step 15 – Hearing Date Tracker + Dashboard Alerts ✅

## Implementation Complete

The Hearing Date Tracker and Dashboard Alerts have been successfully implemented. The system now displays upcoming court hearings directly on the dashboard with visual alerts.

---

## 📋 What Was Implemented

### 1. Backend Enhancements

#### **Hearing Controller** (`backend/controllers/hearingController.js`)

**New Function Added:**
- ✅ `getUpcomingHearings()` - Fetch upcoming hearings for dashboard

**Features:**
- Filters hearings by date (only future hearings)
- Excludes cancelled and completed hearings
- Joins with cases and clients tables for complete information
- Returns case title, case number, client name, contact details
- Sorted by hearing date and time (ascending order)
- Limited to 10 most recent upcoming hearings
- Advocate-specific filtering (security isolation)

**SQL Query Details:**
```sql
SELECT 
  h.*,
  cs.case_title,
  cs.case_number,
  cl.name AS client_name,
  cl.phone AS client_phone,
  cl.email AS client_email
FROM hearings h
JOIN cases cs ON h.case_id = cs.id
JOIN clients cl ON cs.client_id = cl.id
WHERE h.case_id IN (
  SELECT id FROM cases WHERE advocate_id = ?
)
AND h.hearing_date >= ?
AND h.status != 'Cancelled'
AND h.status != 'Completed'
ORDER BY h.hearing_date ASC, h.hearing_time ASC
LIMIT 10
```

#### **Hearing Routes** (`backend/routes/hearingRoutes.js`)

**New Route Added:**
- ✅ `GET /api/hearings/upcoming` - Get upcoming hearings (Protected)

**Route Configuration:**
- Protected with JWT authentication
- Uses `verifyToken` middleware
- Calls `hearingController.getUpcomingHearings`

---

### 2. Frontend - Dashboard Enhancement

#### **Dashboard Page** (`frontend/src/pages/Dashboard.jsx`)

**New Features:**
- ✅ State management for hearings data
- ✅ Separate fetch function for upcoming hearings
- ✅ Upcoming Hearings section with card layout
- ✅ Case Statistics panel
- ✅ Visual design with color-coded alerts
- ✅ Empty state handling
- ✅ Responsive grid layout

**UI Components:**

1. **Upcoming Hearings Panel**
   - Displays count of upcoming hearings
   - Shows hearing cards with:
     - Case title
     - Client name
     - Case number
     - Hearing date (formatted badge)
     - Hearing time
     - Court hall location
     - Judge name
     - Hearing notes
   - Blue theme for visual prominence
   - Hover effects for interactivity
   - Scrollable list (max-height: 96)
   - Empty state icon and message

2. **Case Statistics Panel**
   - Total Cases count
   - Active Cases count
   - Pending Cases count
   - Total Clients count
   - Color-coded statistics
   - Clean card layout

3. **Layout**
   - Two-column grid on large screens
   - Stacked on mobile devices
   - Consistent spacing and shadows
   - Professional styling

---

## 🎨 UI/UX Design Features

### Hearing Card Design

```
┌─────────────────────────────────────────────┐
│ [Blue Badge] 15 Mar, 2026                  │
│                                             │
│ Smith v. Johnson Corporation                │
│ Client: John Smith                          │
│ Case No: CV-2024-001                        │
│                                             │
│ 📍 Court Hall A - Justice R.K. Desai       │
│ "First hearing - preliminary arguments"     │
│                                             │
│ ⏰ 10:00 AM                                 │
└─────────────────────────────────────────────┘
```

**Visual Elements:**
- 🔵 Blue left border (4px solid)
- 🔵 Light blue background (hover effect)
- 📅 Date badge (blue pill-shaped)
- 📍 Location icon
- ⏰ Time display
- 💬 Notes in italics with quotes

---

## 🚀 How to Test

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

Server runs on: `http://localhost:5000`

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 3. Test Dashboard with Hearings

1. **Login** at `http://localhost:5173/login`
2. **Navigate** to Dashboard (default after login)
3. **Check** the "Upcoming Hearings" section

### 4. Verify Hearing Display

You should see:
- ✅ Hearing cards sorted by date
- ✅ Case titles and client names
- ✅ Formatted dates (e.g., "15 Mar, 2026")
- ✅ Hearing times (if available)
- ✅ Court locations and judge names
- ✅ Notes displayed in italics

### 5. Test Empty State

If no hearings exist:
- Calendar icon appears
- Message: "No upcoming hearings"
- Clean, centered layout

### 6. Add New Hearing (Optional)

To test the full workflow:

1. Go to Hearings page (if available) or use API
2. Add a hearing with future date
3. Return to Dashboard
4. New hearing should appear in list

---

## 📊 API Endpoint Details

### GET /api/hearings/upcoming

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response Format:**
```json
[
  {
    "id": 1,
    "case_id": 1,
    "hearing_date": "2026-03-15",
    "court_hall": "Court Hall A",
    "judge_name": "Justice R.K. Desai",
    "hearing_time": "10:00:00",
    "notes": "First hearing - preliminary arguments",
    "status": "Scheduled",
    "created_at": "2026-03-01T10:00:00.000Z",
    "case_title": "Smith v. Johnson Corporation",
    "case_number": "CV-2024-001",
    "client_name": "John Smith",
    "client_phone": "9123456789",
    "client_email": "john@example.com"
  }
]
```

**Query Parameters:**
- None (automatic filtering by logged-in advocate)

**Filters Applied:**
- `hearing_date >= today`
- `status != 'Cancelled'`
- `status != 'Completed'`
- `advocate_id = logged_in_user`
- Ordered by date ASC, time ASC
- Limited to 10 results

---

## 🎯 Features Summary

### Advocates Can Now:

- ✅ View all upcoming hearings on dashboard
- ✅ See hearing dates prominently displayed
- ✅ Get case context (title, number, client)
- ✅ Know court location and judge
- ✅ Check hearing time
- ✅ Read hearing notes
- ✅ Quick overview of case statistics
- ✅ Visual alerts for important dates

---

## 🔐 Security Features

- ✅ JWT token required for API access
- ✅ Advocate isolation (only sees own hearings)
- ✅ Case ownership verification
- ✅ Filtered by status (excludes cancelled/completed)
- ✅ SQL injection prevention (parameterized queries)

---

## 💡 Database Schema

### Existing Tables Used:

**hearings table:**
```sql
CREATE TABLE hearings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  hearing_date DATE NOT NULL,
  court_hall VARCHAR(50),
  judge_name VARCHAR(100),
  hearing_time TIME,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'Scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);
```

**Related tables:**
- `cases` - Links hearings to cases
- `clients` - Provides client information
- `advocates` - Ensures ownership

---

## 🎨 Styling Details

### Color Scheme:

| Element | Color | Purpose |
|---------|-------|---------|
| Border Left | Blue (#3B82F6) | Visual prominence |
| Background | Light Blue (#EFF6FF) | Highlight card |
| Date Badge | Blue (#2563EB) | Important date |
| Text Primary | Gray-900 | Readability |
| Text Secondary | Gray-600 | Supporting info |
| Hover | Blue-100 | Interactivity |

### Responsive Breakpoints:

- **Mobile (< 1024px):** Single column stack
- **Desktop (≥ 1024px):** Two-column grid
- **Hearings List:** Scrollable (max-h-96)

---

## 📱 Responsive Design

### Mobile View:
```
┌──────────────────────┐
│ Upcoming Hearings    │
│ (2 hearings)         │
├──────────────────────┤
│ [Hearing Card 1]     │
├──────────────────────┤
│ [Hearing Card 2]     │
└──────────────────────┘

┌──────────────────────┐
│ Case Statistics      │
├──────────────────────┤
│ Total Cases: 5       │
│ Active Cases: 3      │
│ Pending Cases: 2     │
│ Total Clients: 4     │
└──────────────────────┘
```

### Desktop View:
```
┌──────────────────┬──────────────────┐
│ Upcoming Hearings│ Case Statistics  │
│                  │                  │
│ [Card 1]         │ Total: 5         │
│ [Card 2]         │ Active: 3        │
│ [Card 3]         │ Pending: 2       │
│                  │ Clients: 4       │
└──────────────────┴──────────────────┘
```

---

## ✅ Testing Checklist

### Backend Tests:

- [ ] API endpoint returns correct data
- [ ] Authentication required
- [ ] Only returns hearings for logged-in advocate
- [ ] Filters out past dates
- [ ] Filters out cancelled/completed hearings
- [ ] Sorts by date and time correctly
- [ ] Limits to 10 results
- [ ] Includes joined data (case, client)

### Frontend Tests:

- [ ] Dashboard loads without errors
- [ ] Hearsings section displays correctly
- [ ] Empty state shows when no hearings
- [ ] Hearing cards render all information
- [ ] Dates formatted correctly
- [ ] Times displayed properly
- [ ] Responsive design works
- [ ] Hover effects functional
- [ ] Scroll works in hearings list
- [ ] Statistics panel shows correct data

### Integration Tests:

- [ ] Data flows from DB → API → UI
- [ ] Real-time updates work
- [ ] No console errors
- [ ] Loading states appropriate
- [ ] Error handling graceful

---

## 🔧 Troubleshooting

### Issue 1: No hearings showing

**Solutions:**
- Check database has hearings with future dates
- Verify hearing status is 'Scheduled'
- Confirm case belongs to logged-in advocate
- Check browser console for errors

### Issue 2: API returns 401 error

**Solutions:**
- Ensure user is logged in
- Check token in localStorage
- Verify token hasn't expired
- Re-login if necessary

### Issue 3: Wrong hearings displayed

**Solutions:**
- Verify advocate_id filtering in query
- Check JOIN conditions
- Ensure proper ownership validation
- Review database relationships

### Issue 4: Date formatting incorrect

**Solutions:**
- Check browser locale settings
- Verify hearing_date format in DB
- Ensure timezone handling correct
- Update `toLocaleDateString()` parameters

---

## 📝 Example Test Data

### Insert Test Hearings:

```sql
-- Use the database
USE advocate_case_db;

-- Add upcoming hearings
INSERT INTO hearings (case_id, hearing_date, court_hall, judge_name, hearing_time, notes, status) VALUES
(1, '2026-03-15', 'Court Hall A', 'Justice R.K. Desai', '10:00:00', 'Preliminary arguments', 'Scheduled'),
(1, '2026-04-10', 'Court Hall A', 'Justice R.K. Desai', '10:00:00', 'Evidence submission', 'Scheduled'),
(2, '2026-03-20', 'Court Hall B', 'Justice S.M. Khan', '14:00:00', 'Bail hearing', 'Scheduled'),
(3, '2026-03-25', 'Family Court Room 2', 'Justice P. Singh', '11:00:00', 'Counseling session', 'Scheduled');
```

---

## 🎯 Success Criteria

✅ **Implementation Complete When:**

- [x] Backend API endpoint created
- [x] Dashboard fetches upcoming hearings
- [x] Hearings displayed in card format
- [x] Date and time shown clearly
- [x] Case and client info included
- [x] Empty state handled gracefully
- [x] Responsive design works
- [x] Authentication enforced
- [x] Advocate isolation working
- [x] Documentation complete

---

## 🚀 Next Steps (Optional Enhancements)

Consider adding:

1. **Hearing Notifications**
   - Email reminders 1 day before
   - SMS alerts on hearing day
   - Push notifications in app

2. **Hearing Management**
   - Add/Edit/Delete hearings from dashboard
   - Quick actions on hearing cards
   - Reschedule hearing option

3. **Advanced Filtering**
   - Filter by date range
   - Filter by court/judge
   - Filter by case type

4. **Calendar Integration**
   - Google Calendar sync
   - iCal export
   - Calendar view of hearings

5. **Hearing Analytics**
   - Average hearing duration
   - Most frequent courts
   - Hearing outcomes tracking

---

## 📞 Support

If you encounter issues:

1. **Check Backend Console** - Look for SQL errors
2. **Check Frontend Console** - Look for API errors
3. **Verify Database** - Ensure hearings table has data
4. **Test API Directly** - Use Postman or curl
5. **Review Auth Token** - Ensure valid JWT

---

**Implementation Date:** March 8, 2026  
**Status:** ✅ Complete and Ready for Testing  
**API Endpoint:** `GET /api/hearings/upcoming`  
**Frontend Route:** `/dashboard`
