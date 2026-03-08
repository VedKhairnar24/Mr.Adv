# Quick Test Guide - Step 15 Hearing Tracker

## 🚀 Start Both Servers

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
✅ Backend running on `http://localhost:5000`

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend running on `http://localhost:5173`

---

## 📋 Test Steps

### Step 1: Login
1. Open browser: `http://localhost:5173/login`
2. Enter credentials
3. Click "Login"
4. Should redirect to Dashboard

### Step 2: Check Dashboard
After login, you should see:
- Statistics cards at top (Clients, Cases, etc.)
- **NEW:** "Upcoming Hearings" section
- **NEW:** "Case Statistics" panel

### Step 3: Verify Hearings Display

**If hearings exist in database:**
- ✅ Cards with blue left border
- ✅ Case titles visible
- ✅ Client names shown
- ✅ Dates in blue badges
- ✅ Times displayed
- ✅ Court locations shown
- ✅ Scrollable if more than 3-4 hearings

**Example card:**
```
┌─────────────────────────────────────┐
│ [Blue Badge] 15 Mar, 2026          │
│                                     │
│ Smith v. Johnson Corp               │
│ Client: John Smith                  │
│ Case No: CV-2024-001                │
│                                     │
│ 📍 Court Hall A - Justice Desai    │
│ "Preliminary arguments"             │
│                                     │
│ ⏰ 10:00 AM                         │
└─────────────────────────────────────┘
```

### Step 4: Test Empty State

**To test empty state:**
1. Check if you have any hearings in database
2. If yes, temporarily change their status to 'Completed' or set date to past
3. Refresh dashboard
4. Should see:
   - Calendar icon
   - Text: "No upcoming hearings"

### Step 5: Add Test Hearing (Optional)

**Option A: Using SQL**
```sql
USE advocate_case_db;

INSERT INTO hearings (case_id, hearing_date, court_hall, judge_name, hearing_time, notes, status) VALUES
(1, '2026-04-15', 'High Court Room 3', 'Justice A. Kumar', '14:30:00', 'Final arguments', 'Scheduled');
```

**Option B: Using API**
```bash
curl -X POST http://localhost:5000/api/hearings/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": 1,
    "hearing_date": "2026-04-15",
    "court_hall": "High Court Room 3",
    "judge_name": "Justice A. Kumar",
    "hearing_time": "14:30",
    "notes": "Final arguments",
    "status": "Scheduled"
  }'
```

**Then:**
1. Refresh dashboard
2. New hearing should appear

### Step 6: Test Responsiveness

1. Press F12 to open DevTools
2. Toggle device toolbar
3. Test different screen sizes:
   - Mobile (375px width)
   - Tablet (768px width)
   - Desktop (1024px+ width)

**Expected behavior:**
- Desktop: Two columns side-by-side
- Mobile: Stacked vertically
- Hearings list scrollable

### Step 7: Verify Data Accuracy

Check that displayed hearings:
- ✅ Have future dates only
- ✅ Are not marked as 'Cancelled' or 'Completed'
- ✅ Belong to your cases (advocate ownership)
- ✅ Show correct client names
- ✅ Sorted by date (earliest first)

---

## 🔍 What to Check

### Visual Elements
- [ ] Blue border on left side of cards
- [ ] Light blue background
- [ ] Date badge is rounded and blue
- [ ] Text is readable
- [ ] Icons display correctly
- [ ] Hover effect works

### Functionality
- [ ] Hearsings load automatically
- [ ] Count shows correct number
- [ ] Scroll works if many hearings
- [ ] Empty state appears when appropriate
- [ ] Statistics show correct data

### Data Display
- [ ] Case title correct
- [ ] Client name correct
- [ ] Date formatted properly (e.g., "15 Mar, 2026")
- [ ] Time shown if available
- [ ] Court hall displayed
- [ ] Judge name shown
- [ ] Notes in italics

---

## ❌ Common Issues & Fixes

### Issue: "No upcoming hearings" but hearings exist

**Check:**
1. Hearing date is in the future
2. Status is 'Scheduled' (not Completed/Cancelled)
3. Case belongs to your advocate account
4. Browser console for errors

**Fix:**
```sql
-- Update hearing to be in future and scheduled
UPDATE hearings 
SET hearing_date = '2026-04-15', status = 'Scheduled'
WHERE id = 1;
```

### Issue: Statistics not showing

**Check:**
1. Dashboard API endpoint working
2. `dashboardData` state populated
3. Backend server running

**Fix:**
- Refresh page
- Check network tab for API response
- Verify `/api/dashboard` endpoint returns data

### Issue: Error loading hearings

**Check:**
1. Token is valid (not expired)
2. Backend server running
3. Network tab shows successful API call

**Fix:**
- Logout and login again
- Check browser console for error details
- Verify token in localStorage

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Dashboard loads without errors
2. ✅ "Upcoming Hearings" section visible
3. ✅ Hearing cards display correctly
4. ✅ Dates are formatted nicely
5. ✅ All information shows (case, client, court, time)
6. ✅ Blue theme applied
7. ✅ Responsive on mobile/tablet
8. ✅ Empty state works
9. ✅ Statistics panel shows data
10. ✅ No console errors

---

## 📊 Expected Results

### With Test Data (from schema.sql):

You should see 4 upcoming hearings:

1. **Mar 15, 2026** - Civil Dispute Property Matter
   - Client: Rajesh Kumar
   - Court: Court Hall A
   - Judge: Justice R.K. Desai
   - Time: 10:00 AM

2. **Apr 10, 2026** - Civil Dispute Property Matter
   - Client: Rajesh Kumar
   - Court: Court Hall A
   - Judge: Justice R.K. Desai
   - Time: 10:00 AM

3. **Mar 20, 2026** - Criminal Defense Case
   - Client: Rajesh Kumar
   - Court: Court Hall B
   - Judge: Justice S.M. Khan
   - Time: 2:00 PM

4. **Mar 25, 2026** - Family Court Matter
   - Client: Priya Sharma
   - Court: Family Court Room 2
   - Judge: Justice P. Singh
   - Time: 11:00 AM

---

## 🎯 Quick Validation Commands

### Check API Directly

Get token from browser console:
```javascript
// In browser console after login
console.log(localStorage.getItem('token'));
```

Test API with curl (replace TOKEN):
```bash
curl http://localhost:5000/api/hearings/upcoming \
  -H "Authorization: Bearer TOKEN"
```

Should return JSON array of hearings.

### Check Database

```sql
-- View all upcoming hearings
SELECT h.*, cs.case_title, cl.name as client_name
FROM hearings h
JOIN cases cs ON h.case_id = cs.id
JOIN clients cl ON cs.client_id = cl.id
WHERE h.hearing_date >= CURDATE()
AND h.status NOT IN ('Cancelled', 'Completed')
ORDER BY h.hearing_date;
```

---

## 📝 Test Report Template

```
Test Date: ___________
Tester: ___________

Backend Server: ✅ Running / ❌ Not Running
Frontend Server: ✅ Running / ❌ Not Running

Dashboard Loads: ✅ Pass / ❌ Fail
Hearings Display: ✅ Pass / ❌ Fail
Empty State Works: ✅ Pass / ❌ Fail
Statistics Show: ✅ Pass / ❌ Fail
Responsive Design: ✅ Pass / ❌ Fail

Issues Found:
_________________________________
_________________________________

Overall Status: ✅ Pass / ❌ Fail
```

---

**Ready to test! Navigate to `http://localhost:5173/dashboard` after logging in.** 🎉
