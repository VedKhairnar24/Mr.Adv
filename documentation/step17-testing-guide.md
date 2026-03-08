# Quick Test Guide - Step 17 Layout Navigation

## 🚀 Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 📋 Step-by-Step Tests

### Test 1: Login and See Layout

1. Open: `http://localhost:5173/login`
2. Login with your credentials
3. Should redirect to Dashboard
4. **Verify layout appears:**
   - ✅ Dark sidebar on left (gray/black)
   - ✅ Light content area on right (white/gray)
   - ✅ Navigation links visible
   - ✅ "Advocate System" title at top

### Test 2: Check Sidebar Elements

Look at the sidebar, verify:

**Top Section:**
- ✅ "Advocate System" text
- ✅ Toggle button (≡ or →)
- ✅ Subtitle "Case Management"

**Middle Section (if logged in):**
- ✅ Circular avatar with your initial
- ✅ Your name displayed
- ✅ Your email below name

**Navigation Links:**
- ✅ Dashboard (with home icon 🏠)
- ✅ Clients (with people icon 👥)
- ✅ Cases (with folder icon 📁)
- ✅ Documents (with document icon 📄)

**Bottom Section:**
- ✅ Logout button (with door icon 🚪)
- ✅ Red color text

### Test 3: Test Active Link Highlighting

1. You're on Dashboard → Dashboard link should be:
   - Blue background
   - White text
   - Chevron arrow (▶) on right

2. Click "Clients" link → Clients link should now be:
   - Blue background
   - White text
   - Chevron arrow (▶)

3. Click "Cases" → Cases highlights blue
4. Click "Documents" → Documents highlights blue

### Test 4: Test Navigation

Click each link and verify page loads:

| Click | Should Show |
|-------|-------------|
| Dashboard | Dashboard statistics |
| Clients | Clients list/form |
| Cases | Cases table |
| Documents | Document upload form |

URL should change:
- `/dashboard`
- `/clients`
- `/cases`
- `/documents`

### Test 5: Test Sidebar Toggle

1. Find the toggle button (≡ or →)
2. **Click to collapse:**
   - Sidebar shrinks to ~80px width
   - Only icons visible
   - Text disappears
   - Smooth animation

3. **Click to expand:**
   - Sidebar grows back to 256px
   - Text reappears
   - Icons stay aligned
   - Smooth animation

4. Verify navigation still works when collapsed

### Test 6: Test User Profile

If you're logged in:

1. Look at sidebar user section
2. **Verify displays:**
   - Avatar circle with your initial
   - Your full name
   - Your email address
   - Darker background (gray-800)

3. **Test truncation:**
   - Long names should be cut off with "..."
   - Email should also truncate if too long

### Test 7: Test Logout

1. Click "Logout" button at bottom of sidebar
2. **Verify:**
   - ✅ Success toast message appears
   - ✅ Redirects to login page
   - ✅ Sidebar disappears
   - ✅ Login page shows (full width, no sidebar)

3. Try to go back to dashboard:
   - Type: `http://localhost:5173/dashboard`
   - Should redirect back to login
   - OR show unauthorized message

### Test 8: Test Header Bar

On any protected page:

1. **Look at top header:**
   - ✅ White background
   - ✅ Shadow underneath
   - ✅ Page title (e.g., "Dashboard")
   - ✅ Current date on right

2. **Date format:**
   - Should show: "Monday, 15 March 2026"
   - Full weekday name
   - Full month name
   - 4-digit year

### Test 9: Test Content Scrolling

1. Go to a page with lots of content (e.g., Cases with many rows)
2. **Verify:**
   - ✅ Sidebar stays fixed
   - ✅ Only content area scrolls
   - ✅ Header stays at top
   - ✅ No layout breaking

### Test 10: Test Responsive Design

1. Press F12 to open DevTools
2. Toggle device toolbar
3. **Test different widths:**

**Desktop (1920px):**
- ✅ Sidebar fully expanded by default
- ✅ Content area wide
- ✅ Everything visible

**Tablet (768px):**
- ✅ Sidebar adapts
- ✅ Content adjusts
- ✅ No horizontal scroll

**Mobile (375px):**
- ✅ Sidebar can collapse
- ✅ Icons still accessible
- ✅ Content readable

---

## 🔍 Visual Verification Checklist

### Sidebar Appearance
- [ ] Dark background (gray-900)
- [ ] White text
- [ ] Proper spacing/padding
- [ ] Clean borders between sections

### Navigation Links
- [ ] Icons aligned with text
- [ ] Proper hover effects (darker background)
- [ ] Active link has blue background
- [ ] Chevron on active link
- [ ] Smooth transitions

### Main Content
- [ ] Light background (gray-100)
- [ ] Header with shadow
- [ ] Page title matches route
- [ ] Date displays correctly
- [ ] Content padding adequate

### Interactive Elements
- [ ] Toggle button works
- [ ] Links are clickable
- [ ] Logout button functional
- [ ] Hover states visible
- [ ] Animations smooth

---

## ❌ Common Issues & Fixes

### Issue: No sidebar appears

**Possible Causes:**
- Not logged in
- Routes not wrapped with MainLayout
- Tailwind CSS not loaded

**Fixes:**
1. Login first
2. Check App.jsx has MainLayout imports
3. Verify routes use `<MainLayout><Page /></MainLayout>`
4. Ensure `npm run dev` is running

### Issue: Toggle button doesn't work

**Fixes:**
1. Check browser console for errors
2. Verify React is loaded correctly
3. Test in different browser
4. Clear cache and reload

### Issue: Active link not highlighting

**Fixes:**
1. Navigate away and back
2. Check location.pathname is correct
3. Verify React Router working
4. Reload page

### Issue: User profile not showing

**Fixes:**
1. Ensure you're logged in
2. Check localStorage has 'advocate' key
3. Re-login if needed
4. Check browser console for JSON parse errors

### Issue: Logout doesn't work

**Fixes:**
1. Click button firmly (sometimes need clear click)
2. Check toast library is working
3. Verify localStorage clearing
4. Manually navigate to /login

---

## ✅ Expected Results Summary

| Feature | Expected Behavior | Status |
|---------|------------------|--------|
| Sidebar Appears | Dark sidebar on left | ⬜ |
| Navigation Links | 4 links + logout visible | ⬜ |
| Active Highlighting | Blue background on current | ⬜ |
| Toggle Works | Collapses/expands smoothly | ⬜ |
| User Profile | Shows name/email/avatar | ⬜ |
| Logout Works | Clears session, redirects | ⬜ |
| Header Bar | Shows title + date | ⬜ |
| Content Area | Scrolls independently | ⬜ |
| Responsive | Works on different sizes | ⬜ |
| No Errors | Console clean | ⬜ |

---

## 🎯 Quick Visual Test

### What You Should See:

```
┌─────────────────────────────────────────────────────┐
│ Sidebar       │  Header: Dashboard    Mar 15, 2026 │
│               ├─────────────────────────────────────┤
│ Advocate Sys  │                                     │
│ Case Mgmt     │  Dashboard Content Here             │
│               │                                     │
│ 👤 John Doe   │  - Statistics cards                 │
│ john@mail.com │  - Upcoming hearings                │
│               │  - Case stats                       │
│ 🏠 Dashboard ▶│                                     │
│ 👥 Clients    │                                     │
│ 📁 Cases      │                                     │
│ 📄 Documents  │                                     │
│               │                                     │
│ 🚪 Logout     │                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📝 Test Report Template

```
Test Date: ___________
Tester: ___________

Frontend Server: ✅ Running / ❌ Not Running
Logged In: ✅ Yes / ❌ No

Sidebar Displays: ✅ Pass / ❌ Fail
Navigation Works: ✅ Pass / ❌ Fail
Active Highlighting: ✅ Pass / ❌ Fail
Toggle Functions: ✅ Pass / ❌ Fail
User Profile Shows: ✅ Pass / ❌ Fail
Logout Works: ✅ Pass / ❌ Fail
Header Displays: ✅ Pass / ❌ Fail
Responsive Design: ✅ Pass / ❌ Fail

Issues Found:
_________________________________
_________________________________

Overall Status: ✅ Pass / ❌ Fail
```

---

## 🎉 Success Indicators

You'll know it's working perfectly when:

1. ✅ Professional sidebar appears on all pages
2. ✅ Navigation is intuitive and clear
3. ✅ Active page highlights automatically
4. ✅ Toggle button smoothly collapses/expands
5. ✅ User profile displays your info
6. ✅ Logout clears session and redirects
7. ✅ Header shows page title and date
8. ✅ Content area scrolls properly
9. ✅ Works on different screen sizes
10. ✅ No JavaScript errors in console

---

**Ready to test! Navigate to `http://localhost:5173/dashboard` after logging in!** 🚀

Your application should now look like professional enterprise software with a modern admin panel interface!
