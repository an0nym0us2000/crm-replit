# Launch CRM Design Guidelines

## Design Approach

**System-Based Approach**: Drawing from Linear's clean productivity aesthetic combined with Material Design principles for data-intensive interfaces. This approach prioritizes clarity, efficiency, and professional polish for an internal business tool.

**Core Principles:**
- Information hierarchy over decoration
- Consistent, predictable patterns across modules
- Efficient data density without overwhelming users
- Professional, trustworthy aesthetic appropriate for business use

---

## Typography System

**Font Family:**
- Primary: Inter (via Google Fonts) - for UI elements, tables, forms
- Monospace: JetBrains Mono - for timestamps, IDs, data fields

**Scale & Hierarchy:**
```
Page Titles: text-2xl font-semibold (Admin Dashboard, Employee Directory)
Section Headers: text-lg font-semibold (Today's Tasks, Active Deals)
Card Titles: text-base font-medium
Body Text: text-sm font-normal
Labels: text-xs font-medium uppercase tracking-wide
Metadata: text-xs text-gray-500 (dates, timestamps)
```

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 for consistent rhythm
- Component padding: p-4 or p-6
- Section gaps: gap-6 or gap-8
- Card spacing: space-y-4
- Form fields: space-y-6

**Grid Structure:**
- Sidebar: Fixed 64px width (collapsed) or 256px (expanded)
- Main content: max-w-7xl with responsive padding (px-4 lg:px-8)
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Data tables: Full width within content container

---

## Component Library

### Navigation
**Sidebar (Persistent):**
- Fixed left position with logo at top
- Navigation items with icon + label (hidden on collapse)
- Active state: subtle background fill with left border accent
- Sections: Dashboard, CRM, Employees, Tasks, Admin, Settings
- User profile widget at bottom with role badge

**Top Bar:**
- Breadcrumb navigation for context (Dashboard > Employees > John Doe)
- Global search input (large, prominent)
- Notification bell with badge count
- User avatar dropdown (right-aligned)

### Dashboard Cards
**Metric Cards (KPI Display):**
- Large number (text-3xl font-bold)
- Label beneath (text-sm)
- Small trend indicator (+12% this week) with icon
- Icon in top-right corner for visual identity
- Subtle border, elevated on hover

**Activity/Summary Cards:**
- Header with title + "View All" link
- List of 5-8 recent items with avatar + text + timestamp
- Scrollable if content exceeds height

### Data Tables
**Structure:**
- Sticky header row with sort indicators
- Alternating row backgrounds for readability
- Row hover state with subtle elevation
- Action menu (three dots) on row hover
- Checkbox column for bulk actions (left-most)
- Status badges as colored pills with icons
- Avatar + name combinations for user references

**Table Controls (Above Table):**
- Search input (left)
- Filter dropdowns (by status, assignee, date range)
- View toggles (table/kanban/calendar)
- Action buttons (+ Add New, Export, etc.) right-aligned

### Kanban Board
**Column Structure:**
- Equal-width columns with header showing count
- Cards with white background, border, shadow
- Card contents: Title (bold), assigned user avatar, due date, priority badge
- Drag handle indicator on hover
- "Add Card" button at column bottom

### Forms
**Layout:**
- Two-column grid for related fields (lg:grid-cols-2)
- Full-width for textareas and rich text
- Label above input pattern
- Helper text below inputs (text-xs)
- Required field indicators (asterisk)

**Input Styling:**
- Consistent height (h-10 for single-line, h-32 for textarea)
- Border with focus ring
- Icons inside inputs where appropriate (search, email, etc.)

### Modals & Overlays
**Modal Pattern:**
- Centered, max-w-2xl
- Header with title + close button
- Scrollable content area
- Fixed footer with action buttons (Cancel left, Primary right)

**Slide-over Panel (for quick edits):**
- Slides from right, max-w-md
- Full height with internal scroll
- Same header/footer pattern as modals

### Status Indicators
**Priority Badges:**
- Small pill shape (px-2 py-1 rounded-full)
- High: Red dot + "High"
- Medium: Yellow dot + "Medium"  
- Low: Gray dot + "Low"

**Stage/Status Badges:**
- Slightly larger pills with icons
- Lead, Negotiation, Closed stages with distinct visual treatments
- To Do, In Progress, Done for tasks

### Charts & Analytics
**Chart Types:**
- Line charts for trends (conversion rate over time)
- Bar charts for comparisons (employee performance)
- Donut charts for proportions (deal stages breakdown)
- Use consistent heights (h-64 or h-80)

---

## Module-Specific Layouts

### CRM Dashboard
- Top row: 4 metric cards (Leads, Deals, Clients, Conversion Rate)
- Second row: Split layout - Deal pipeline (Kanban) 2/3 width + Recent Activity 1/3 width
- Bottom: Tabs component switching between Leads/Clients/Deals/Contacts tables

### Employee Management
- Grid of employee cards (3-4 columns) showing avatar, name, role, department, status badge
- Click to expand into slide-over with full details
- Top bar with filters (department, status) and search
- Attendance tracking shown in dedicated tab with timeline view

### Task Tracking
- Default view: Data table with filters
- Alternative views accessible via toggles: Kanban board grouped by status, Calendar view
- Each task row/card shows assignee avatar, priority badge, due date, completion checkbox

### Admin Dashboard
- Overview metrics in top grid (Total Users, Active Tasks, Revenue, Performance Score)
- User management table with inline role editing
- Analytics section with tab-based navigation (Performance, Revenue, Conversion, Tasks)
- Export controls in top-right of each analytics view

---

## Responsive Behavior

**Desktop (lg and above):**
- Full sidebar visible
- Multi-column layouts for cards and tables
- Kanban board shows all columns

**Tablet (md):**
- Collapsible sidebar (icon-only or hamburger)
- Two-column card grids
- Horizontal scroll for kanban

**Mobile (base):**
- Hidden sidebar with overlay menu
- Single column stacking
- Simplified table views (card-based on mobile)
- Bottom navigation for primary actions

---

## Interaction Patterns

**Loading States:**
- Skeleton screens for tables and cards (pulsing gray rectangles)
- Spinner for actions (button states)

**Empty States:**
- Centered illustration placeholder + text + CTA button
- "No tasks assigned yet" with "Create First Task" button

**Notifications:**
- Toast messages (top-right): Success (green), Error (red), Info (blue)
- Slide in/out animation
- Auto-dismiss after 4 seconds with progress bar

---

## Images

**No Hero Images Required** - This is an internal dashboard application, not a marketing site.

**Avatar Placeholders:**
- User profile images throughout (32px, 40px, 48px sizes)
- Use initials in colored circles as fallbacks

**Illustrative Elements:**
- Empty state illustrations (minimal, line-art style)
- Success/error confirmation graphics in modals

**Logo:**
- "Launch CRM" wordmark in sidebar (clean, modern sans-serif)
- Favicon with "L" monogram