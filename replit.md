# Launch CRM

## Overview

Launch CRM is a comprehensive internal CRM and employee management platform built with a modern full-stack architecture. The application enables organizations to manage clients, leads, deals, employees, tasks, and analytics through a clean, professional interface inspired by Linear's productivity aesthetic and Material Design principles.

The platform provides role-based access control (Admin, Manager, Employee) with dedicated dashboards for each user type, real-time collaboration features, and comprehensive data management capabilities across CRM operations, employee directories, and task tracking.

## Recent Changes

**November 9, 2025 - Posting Schedule Feature (PRODUCTION-READY):**

Complete social media posting schedule management system with calendar and list views, bulk operations, and role-based permissions.

**Feature Components:**

1. **Database Schema (posting_schedule table):**
   - Full CRUD support for social media posts across multiple platforms
   - Foreign keys to social_profiles (cascade delete) and users (assignedTo, createdBy)
   - Status tracking: draft, scheduled, published, failed
   - Approval workflow: pending, approved, rejected
   - Post types: text, image, video, carousel, story
   - Nullable optional fields: assignedTo, mediaUrl, approvalStatus, publishResult, cloneOf
   - Indexed on frequently queried fields (status, scheduledDateTime, profileId)

2. **Backend Implementation:**
   - **Storage Layer:** Role-based filtering via SQL in `getPostingScheduleForRole`
   - **Permission Model:** Centralized `canModifyPost` helper for authorization
   - **API Endpoints:** Full REST API with GET, POST, PATCH, DELETE, bulk delete
   - **Data Validation:** Zod schemas, user ID validation, empty string to null conversion
   - **Security:** Role-scoped queries prevent data leakage

3. **Frontend Implementation:**
   - **posting-schedule.tsx:** Main page with calendar/list view toggle, status/profile filters, bulk selection
   - **post-form-dialog.tsx:** Create/edit dialog with profile selection, post type, caption, media URL, scheduling, status, approval, assignee
   - **Navigation:** Sidebar integration with Calendar icon
   - **State Management:** React Query with cache invalidation

**Bug Fixes Applied During Development:**

1. **Radix Select Error:** Removed empty value `<SelectItem>`, added "__NONE__" sentinel value for "Not assigned"
2. **Schema Validation:** Omitted `createdBy` from insert schema (server adds after validation)
3. **FK Constraints:** Backend converts empty strings to null for optional FK fields (assignedTo, cloneOf, publishResult, mediaUrl)
4. **Date Handling:** Backend converts scheduledDateTime string to Date object
5. **Un-assign UX:** Added "Not assigned" option, form converts "__NONE__" to empty string on submit
6. **User Validation:** Backend validates assignedTo is valid user ID, sets to null if invalid

**Key Features:**
- ✅ Calendar and list view modes with seamless toggle
- ✅ Filter by status (draft, scheduled, published, failed) and social profile
- ✅ Bulk selection and delete with permission checks
- ✅ Create/edit posts with media URL, scheduling, and approval workflows
- ✅ Assign/un-assign/re-assign posts to team members
- ✅ Role-based access: employees see own/assigned posts, managers see team posts, admins see all
- ✅ Empty states with create CTAs
- ✅ Real-time cache updates via React Query

**Testing Status:**
- ✅ All CRUD operations verified via end-to-end tests
- ✅ Create, edit, delete, view toggling, filtering all passing
- ✅ Assign/un-assign flows working correctly
- ✅ No runtime errors, FK violations, or validation failures
- ✅ Database stores NULL for unassigned posts (verified via SQL)
- ✅ HTTP status codes correct (201 create, 200 update, 204 delete)
- ✅ Production-ready per architect approval

**November 9, 2025 - Earlier Bug Fixes:**

1. **Authentication Crash Fix**
   - Fixed server crash on login with existing users
   - Changed `upsertUser` conflict target from `users.id` to `users.email`
   - Now properly handles users logging in with previously used email addresses
   - Prevents duplicate key constraint violations

2. **Task Date Handling Fix**
   - Fixed "value.toISOString is not a function" error when creating/updating tasks
   - Backend now converts ISO date strings to Date objects before database insertion
   - Applied to both POST /api/tasks (create) and PATCH /api/tasks/:id (update) endpoints
   - Removed Zod schema transform to keep form handling simpler

3. **Attendance Security Enhancement**
   - Added targeted `getAttendance(id)` storage method to prevent data leakage
   - Mark-out endpoint now uses specific record lookup instead of fetching all records
   - Improved IST timezone handling using robust UTC+5.5 hours calculation
   - Replaced fragile `toLocaleString()` with deterministic date math

4. **Form Type Safety Improvements**
   - Restored proper TypeScript types in task and employee form dialogs
   - Removed `any` types in favor of specific interfaces
   - All forms now have full type safety with no LSP errors

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod for form validation
- Tailwind CSS for utility-first styling
- shadcn/ui component library (New York style variant) for consistent UI components

**Design System:**
- Custom design tokens defined in CSS variables for theming (light/dark mode support)
- Typography system using Inter for UI elements and JetBrains Mono for monospace content
- Spacing based on Tailwind's scale (2, 4, 6, 8 units) for consistent rhythm
- Component-based architecture with reusable UI primitives
- Hover and active elevation states for interactive feedback
- Responsive layouts with mobile-first approach

**State Management Strategy:**
- Server state managed through React Query with infinite stale time and no automatic refetching
- Local UI state managed through React hooks
- Authentication state cached in React Query
- Form state isolated to React Hook Form instances
- No global client-side state management library (Redux/Zustand) required

**Routing Structure:**
- Public route: Landing page (`/`)
- Protected routes: Dashboard, CRM, Employees, Tasks, Analytics, Attendance, Social Profiles, Posting Schedule, Admin, Settings
- Route protection handled through authentication check in main App router
- 404 handling with dedicated NotFound component

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js for HTTP server
- TypeScript for type safety across server code
- Drizzle ORM for database operations
- OpenID Connect (Replit Auth) for authentication
- Express sessions with PostgreSQL session store

**Authentication & Authorization:**
- OAuth 2.0 / OpenID Connect flow via Replit's identity provider
- Session-based authentication with httpOnly cookies
- Role-based access control with three tiers: admin, manager, employee
- Middleware functions for route protection (`isAuthenticated`, `requireRole`)
- User claims extracted from ID tokens and stored in session

**API Design:**
- RESTful API endpoints under `/api` prefix
- Resource-oriented routes for leads, deals, employees, tasks, users, attendance, social_profiles, posting_schedule
- Standard HTTP methods: GET (list/retrieve), POST (create), PATCH (update), DELETE (remove)
- Consistent error handling with appropriate HTTP status codes
- JSON request/response bodies
- Request logging middleware for debugging
- Role-based filtering and permission checks on all mutations

**Data Access Layer:**
- Storage abstraction through `IStorage` interface for testability
- `DbStorage` implementation using Drizzle ORM
- Type-safe database operations with full TypeScript integration
- Schema validation using Zod (via drizzle-zod)
- Automatic timestamp management (createdAt, updatedAt)

### Data Storage

**Database:**
- PostgreSQL via Neon serverless driver
- Connection pooling for efficient resource usage
- WebSocket-based connections for serverless compatibility

**Schema Design:**
- `sessions` table for Express session storage with expiration index
- `users` table with role, status, and profile information
- `leads` table for CRM lead tracking with stage pipeline
- `deals` table for opportunity management with value and due dates
- `employees` table for HR information with department and position data
- `tasks` table for task management with priority, status, and assignments
- `attendance` table for employee attendance tracking in IST timezone
- `social_profiles` table for social media account management (LinkedIn, Twitter, Facebook, Instagram)
- `posting_schedule` table for social media post scheduling with approval workflows
- UUID primary keys generated via PostgreSQL's `gen_random_uuid()`
- Foreign key relationships using `assignedTo`, `createdBy`, `profileId` references with appropriate cascade rules

**Data Validation:**
- Zod schemas derived from Drizzle table definitions
- Insert schemas with automatic field omission (id, timestamps)
- Runtime validation on API boundaries
- Type inference from schemas ensuring client-server contract

### External Dependencies

**Third-Party Services:**
- Replit Authentication Service (OpenID Connect provider at `replit.com/oidc`)
- Neon Database (serverless PostgreSQL hosting)
- Google Fonts CDN for Inter and JetBrains Mono typography

**NPM Packages:**
- **UI Framework:** @radix-ui/* primitives for accessible component foundations
- **Forms:** react-hook-form, @hookform/resolvers, zod
- **Data Fetching:** @tanstack/react-query
- **Database:** drizzle-orm, drizzle-zod, @neondatabase/serverless
- **Authentication:** passport, openid-client
- **Session Management:** express-session, connect-pg-simple
- **Styling:** tailwindcss, autoprefixer, class-variance-authority, clsx, tailwind-merge
- **Date Handling:** date-fns
- **Utilities:** memoizee, nanoid

**Development Tools:**
- TypeScript compiler for type checking
- Vite plugins for development experience (@replit/vite-plugin-runtime-error-modal, cartographer, dev-banner)
- ESBuild for production server bundling
- Drizzle Kit for database migrations and schema management

**Build Process:**
- Development: TSX with Vite dev server and HMR
- Production: Vite builds client to `dist/public`, ESBuild bundles server to `dist/index.js`
- Single production artifact runs on Node.js with pre-built static assets