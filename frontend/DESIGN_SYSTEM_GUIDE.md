# Mr. Advocate — Design System Implementation Guide

## Overview

The global design system is now fully implemented in `frontend/src/styles/globals.css`. This file contains:

- **CSS Color Tokens** (all `--bg`, `--gold`, `--white`, etc.)
- **Typography Setup** (Google Fonts: Cormorant Garamond, Rajdhani, JetBrains Mono)
- **Component Library** (buttons, cards, forms, badges, tables, sidebars, etc.)
- **Utility Classes** (spacing, flexbox, text styling, grids)
- **Animations** (fadeUp, fadeDown, fadeLeft, fadeRight, pulse, scale)
- **Responsive Breakpoints** (1024px, 768px, 640px)

**Imported in:** `frontend/src/main.jsx`

---

## Usage Patterns

### 1. **Using CSS Variables in Components**

All color tokens are CSS custom properties, accessible in any inline `style` or CSS module:

```jsx
// In any component
const Card = () => (
  <div style={{
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--white)'
  }}>
    Card content
  </div>
)

// Or in CSS
.my-section {
  background: var(--bg);
  color: var(--gold);
  padding: var(--md);
}
```

### 2. **Component Classes**

Use pre-built component classes for common patterns:

```jsx
// Buttons
<button className="btn-primary">Save</button>
<button className="btn-ghost">Cancel</button>
<button className="btn-danger">Delete</button>
<button className="btn-icon">☰</button>

// Cards
<div className="card">
  Content
</div>

// Badges/Status
<span className="badge badge-scheduled">SCHEDULED</span>
<span className="badge badge-active">ACTIVE</span>
<span className="badge badge-pending">PENDING</span>

// Containers
<div className="sidebar">Sidebar content</div>
<div className="navbar">Nav content</div>
<div className="main-content">Page content</div>
```

### 3. **Utility Classes**

Use utility classes for spacing, layout, and typography:

```jsx
<div className="flex items-center gap-md mt-lg mb-2xl">
  <div className="w-12 h-12 flex-center">Icon</div>
  <div className="flex-col gap-xs">
    <h3 className="text-white font-700">Title</h3>
    <p className="text-muted text-xs">Subtitle</p>
  </div>
</div>
```

#### Spacing Utilities
- `mt-xs`, `mt-sm`, `mt-md`, `mt-lg`, `mt-xl`, `mt-2xl`, `mt-3xl` (margin-top)
- `mb-xs`, `mb-sm`, `mb-md`, `mb-lg`, `mb-xl`, `mb-2xl`, `mb-3xl` (margin-bottom)
- `p-xs`, `p-sm`, `p-md`, `p-lg`, `p-xl` (padding)
- `px-md`, `px-lg` (horizontal padding)
- `py-md`, `py-lg` (vertical padding)
- `gap-sm`, `gap-md`, `gap-lg`, `gap-xl` (flex gap)

#### Flexbox Utilities
- `flex` — display: flex
- `flex-col` — flex-direction: column
- `flex-center` — center items both axes
- `flex-between` — space-between + align-center
- `flex-wrap` — flex-wrap: wrap
- `items-center`, `items-start`, `justify-center`, `justify-between`, `justify-start`

#### Text Utilities
- `text-center`, `text-left`, `text-right`
- `text-white`, `text-muted`, `text-gold`, `text-danger`, `text-success`, `text-amber`
- `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`
- `font-400`, `font-500`, `font-600`, `font-700`
- `italic`, `uppercase`

#### Grid Utilities
- `grid` — display: grid; gap: var(--lg)
- `grid-2` — 2-column grid
- `grid-3` — 3-column grid
- `grid-4` — 4-column grid

---

## Pages Implementation Checklist

### Page: Landing (Public)

✅ Uses `--gold` accent for buttons, brand elements
✅ Hero section with split layout (image left, content right)
✅ "Cormorant Garamond" for titles and statistics
✅ "Rajdhani" for body text and labels
✅ Empty state for premium empty pages
✅ Navbar with fixed positioning
✅ No light backgrounds (all `--bg` or `--surface`)

### Page: Login / Register

✅ Card uses `--surface` background
✅ Form inputs with bottom-border only (no background)
✅ Buttons properly styled (primary gold filled)
✅ Grid layout for split side decorations
✅ No white/light backgrounds
✅ Focus states on inputs show gold border-bottom

### Page: Dashboard

✅ Sidebar on left (fixed 240px)
✅ Stat cards with gold top border (3px)
✅ Timeline with gold left border
✅ Table with gold header text
✅ Empty state if no data
✅ Cards show gold glow on hover
✅ Responsive: collapses sidebar on <1024px

### Page: Clients

✅ Search bar with transparent background
✅ Card layout (not numbered list!)
✅ Avatar badges for client profile
✅ Empty state with icon
✅ Animate on mount (fade-up, stagger)
✅ Status badges properly colored

### Page: Cases

✅ Table layout with case data
✅ Status badges (Scheduled, Pending, Disposed, etc.)
✅ Gold header text
✅ Hover rows show left gold border
✅ Filter dropdowns styled
✅ Empty state message

### Page: Hearings

✅ Calendar week strip at top
✅ Hearing table below
✅ Animate hearing entries
✅ Time column in monospace font (JetBrains Mono)
✅ Badge styling for hearing status
✅ Empty state if no hearings

### Page: Documents

✅ Upload zone (drag-drop area)
✅ Document list with file icons
✅ Monospace font for file names/dates
✅ Status badges
✅ Delete/view buttons
✅ Empty state icon

### Page: Notes

✅ Masonry grid layout
✅ Note cards with colored left border (by type)
✅ Type badges properly styled
✅ Empty state message
✅ Staggered animation on load
✅ Edit/delete actions on hover

### Page: Settings

✅ Tabbed interface (Profile, Security, Notifications)
✅ Form inputs with gold focus state
✅ Buttons properly styled
✅ Toggle switches (if applicable)
✅ Save/Cancel buttons
✅ Success/error feedback via badges

---

## Component Migration Example

### Before (Old Tailwind)
```jsx
export default function ClientCard({ client }) {
  return (
    <div className="p-6 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg">
      <h3 className="text-lg font-bold text-gray-900">{client.name}</h3>
      <p className="text-gray-600 mt-2">{client.phone}</p>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        View Details
      </button>
    </div>
  )
}
```

### After (Design System)
```jsx
export default function ClientCard({ client }) {
  return (
    <div className="card">
      <div className="flex-col gap-md">
        <h4 className="text-white font-700">{client.name}</h4>
        <p className="text-muted text-sm">{client.phone}</p>
        <button className="btn-primary mt-md">
          View Details
        </button>
      </div>
    </div>
  )
}
```

**Key Changes:**
- `.card` replaces all background/border/shadow styling
- `text-white` + `font-700` replaces inline color & weight
- `text-muted` + `text-sm` replaces gray text
- `.btn-primary` replaces inline button styling
- `gap-md`, `flex-col` replaces manual spacing

---

## Examples by Component Type

### Button Examples

```jsx
<button className="btn-primary">Save Case</button>
<button className="btn-ghost">Cancel</button>
<button className="btn-danger">Delete</button>
<button className="btn-icon">👤</button>

// With custom styling
<button className="btn-primary" style={{ width: '100%' }}>
  Full Width Primary
</button>
```

### Badge Examples

```jsx
<span className="badge badge-scheduled">SCHEDULED</span>
<span className="badge badge-active">ACTIVE</span>
<span className="badge badge-pending">PENDING</span>
<span className="badge badge-disposed">DISPOSED</span>
<span className="badge badge-closed">CLOSED</span>
```

### Card Examples

```jsx
{/* Basic Card */}
<div className="card">
  <h4>Card Title</h4>
  <p>Card content</p>
</div>

{/* Card with Accent Top */}
<div className="card card-accent-top">
  <h4>Stat Value</h4>
  <p>25 new cases</p>
</div>

{/* Card with Corner Brackets */}
<div className="card card-corners">
  <h4>Premium Card</h4>
  <p>Special styling</p>
</div>
```

### Form Examples

```jsx
<div className="flex-col gap-lg">
  <div>
    <label className="label">Case Number</label>
    <input type="text" placeholder="e.g., 2024/123456" />
  </div>
  
  <div>
    <label className="label">Case Description</label>
    <textarea placeholder="Enter details..."></textarea>
  </div>
  
  <div>
    <label className="label">Status</label>
    <select>
      <option>Select status</option>
      <option>Scheduled</option>
      <option>Pending</option>
    </select>
  </div>
  
  <button className="btn-primary">Submit</button>
</div>
```

### Table Examples

```jsx
<table className="table">
  <thead>
    <tr>
      <th>Case Number</th>
      <th>Party Names</th>
      <th>Status</th>
      <th>Next Hearing</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="mono">2024/001</td>
      <td>John Doe vs State</td>
      <td>
        <span className="badge badge-active">ACTIVE</span>
      </td>
      <td className="mono">2024-03-25</td>
    </tr>
  </tbody>
</table>
```

### Timeline Examples

```jsx
<div className="timeline">
  <div className="timeline-item">
    <h5>Hearing Scheduled</h5>
    <p className="text-muted text-sm">March 20, 2024 — 10:30 AM</p>
  </div>
  <div className="timeline-item">
    <h5>Case Filed</h5>
    <p className="text-muted text-sm">March 15, 2024</p>
  </div>
</div>
```

### Empty State Examples

```jsx
<div className="empty-state">
  <div className="empty-icon">📋</div>
  <h3 className="empty-title">No Cases Yet</h3>
  <p className="empty-text">
    Start by creating your first case to track hearings and documents.
  </p>
  <div className="empty-action">
    <button className="btn-primary">Create Case</button>
  </div>
</div>
```

### Modal Examples

```jsx
{showModal && (
  <div className="modal active">
    <div className="modal-content">
      <div className="modal-header">
        <h2 className="modal-title">Confirm Delete</h2>
        <button className="modal-close" onClick={closeModal}>×</button>
      </div>
      <p className="text-muted mb-lg">
        Are you sure you want to delete this case? This action cannot be undone.
      </p>
      <div className="flex gap-md justify-end">
        <button className="btn-ghost" onClick={closeModal}>Cancel</button>
        <button className="btn-danger">Delete</button>
      </div>
    </div>
  </div>
)}
```

---

## Animation Usage

### Staggered Fade-Up (Page Load)

```jsx
export default function CasesList({ cases }) {
  return (
    <div className="grid-2 gap-lg">
      {cases.map((caseItem, idx) => (
        <div key={caseItem.id} className="fade-up" style={{
          animationDelay: `${idx * 50}ms`
        }}>
          <div className="card">
            <h4>{caseItem.title}</h4>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Or use stagger classes:

```jsx
<div className="card fade-up stagger-1">Card 1</div>
<div className="card fade-up stagger-2">Card 2</div>
<div className="card fade-up stagger-3">Card 3</div>
```

---

## Color Token Reference

### Quick Color Map

```css
/* Backgrounds */
--bg:       #0a1210   /* Darkest */
--bg2:      #0d1a17   /* Sidebar */
--surface:  #111f1b   /* Cards */
--surface2: #162820   /* Hover state */

/* Primary Accent */
--gold:     #c8a84b
--gold2:    #e6cc78   /* Lighter on hover */
--gold-dim: rgba(200, 168, 75, 0.10)
--gold-glow:rgba(200, 168, 75, 0.15)

/* Text */
--white:    #f0ebe0   /* Main text */
--muted:    rgba(240, 235, 224, 0.45)
--muted2:   rgba(240, 235, 224, 0.25)

/* Status Colors */
--danger:   #c0392b   /* Red for errors/delete */
--success:  #1a7a4a   /* Green for success */
--amber:    #c8842b   /* Orange for pending */

/* Utility */
--border:   rgba(180, 150, 80, 0.18)
--border-hover: rgba(180, 150, 80, 0.40)
```

---

## Responsive Behavior

All components automatically adapt:

| Breakpoint | Change |
|-----------|--------|
| **1024px** | Grid-4 → Grid-2, Tables remain |
| **768px** | Sidebar collapses to 64px, Grid-2 → Grid-1, Grid-3 → Grid-1 |
| **640px** | Sidebar hidden, Full width layout |

---

## What NOT to Do

❌ **Don't** use white/light backgrounds (use `--bg`, `--surface`, or `--bg2`)
❌ **Don't** use inline colors (use CSS variables or classes)
❌ **Don't** create large border-radius (max 4px, use `--radius-soft`)
❌ **Don't** use Inter, Roboto, Arial fonts (use Cormorant Garamond, Rajdhani, JetBrains Mono)
❌ **Don't** add box shadows without purpose (use `.card` or defined shadow helpers)
❌ **Don't** use zebra-striped tables (single row hover pattern with left gold border)
❌ **Don't** add numbered prefixes to lists (e.g., "5. Tejas Kumar")
❌ **Don't** use purple or blue as primary color (gold only)

---

## Next Steps

1. **Review** all existing component files in `frontend/src/pages/` and `frontend/src/components/`
2. **Migrate** each component to use the design system:
   - Replace inline styles with CSS variables
   - Replace Tailwind classes with utility classes or design system classes
   - Apply proper typography (Cormorant for headings, Rajdhani for body)
3. **Test** responsive behavior at breakpoints: 1024px, 768px, 640px
4. **Validate** no white/light backgrounds exist
5. **Deploy** with confidence that all pages follow the same design language

---

## Support Reference

- **Color Tokens:** All in `:root` of `globals.css`
- **Component Classes:** Defined starting ~line 100 in `globals.css`
- **Utilities:** Flexbox (~line 300), Spacing (~line 250), Text (~line 330), Grid (~line 280)
- **Animations:** Defined ~line 400, usage via `.fade-up`, `.stagger-N` classes
- **Responsive:** Media queries at end of `globals.css` (~line 600)
