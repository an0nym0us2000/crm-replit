# Launch CRM

## Overview

Launch CRM is a comprehensive internal CRM and employee management platform built with a modern full-stack architecture. The application enables organizations to manage clients, leads, deals, employees, tasks, and analytics through a clean, professional interface inspired by Linear's productivity aesthetic and Material Design principles.

The platform provides role-based access control (Admin, Manager, Employee) with dedicated dashboards for each user type, real-time collaboration features, and comprehensive data management capabilities across CRM operations, employee directories, and task tracking.

## Recent Changes

**November 9, 2025 - Critical Bug Fixes:**

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

**Testing Status:**
- ✅ End-to-end tests passing for authentication, attendance mark-in/out, and task creation
- ✅ All critical user flows validated and working correctly
- ✅ No security issues or data leakage observed

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
- Protected routes: Dashboard, CRM, Employees, Tasks, Analytics, Admin, Settings
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
- Resource-oriented routes for leads, deals, employees, tasks, users
- Standard HTTP methods: GET (list/retrieve), POST (create), PATCH (update), DELETE (remove)
- Consistent error handling with appropriate HTTP status codes
- JSON request/response bodies
- Request logging middleware for debugging

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
- `employees` table for HR information (appears referenced but not in provided schema snippet)
- `tasks` table for task management with priority, status, and assignments
- UUID primary keys generated via PostgreSQL's `gen_random_uuid()`
- Foreign key relationships using `assignedTo` references to users

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