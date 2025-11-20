# Launch CRM

A comprehensive internal CRM and employee management platform for managing clients, leads, deals, tasks, team performance, and social media scheduling.

## Features

- 📊 **CRM Dashboard** - Manage leads, clients, and deals with visual pipeline tracking
- 👥 **Employee Management** - Track team performance and manage employee directories
- ✅ **Task Tracking** - Assign and monitor tasks with priority management
- 📈 **Analytics** - Track performance metrics and business insights
- 📅 **Attendance System** - Employee time tracking with mark-in/mark-out, admin attendance pool for viewing all employees
- 📱 **Social Media Management** - Schedule and manage social media posts across multiple platforms
- 🔐 **Role-Based Access Control** - Admin, Manager, and Employee roles with different permissions
- 🔒 **Production-Ready Security** - Password hashing, rate limiting, CORS, and more

## Quick Start

### Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd crm-replit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:5000
   ```

### Demo Users (Development)

After running `npm run db:seed`, you can login with:

- **Admin**: admin@example.com (any password in dev mode)
- **Manager**: manager@example.com (any password in dev mode)
- **Employee**: employee@example.com (any password in dev mode)
- **Employee**: jane@example.com (any password in dev mode)

## Production Deployment

For production deployment instructions, see [PRODUCTION.md](./PRODUCTION.md)

## Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **TanStack Query** - Data fetching
- **Wouter** - Routing
- **React Hook Form** - Form management
- **Zod** - Validation

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database (via Neon)
- **Drizzle ORM** - Database toolkit
- **Passport.js** - Authentication
- **bcrypt** - Password hashing
- **express-session** - Session management

### Security & Production Features
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **CORS** - Cross-origin resource sharing
- **Compression** - Response compression
- **Environment validation** - Zod-based config validation
- **Password hashing** - bcrypt with 12 rounds
- **Secure sessions** - PostgreSQL-backed sessions

## Project Structure

```
crm-replit/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities and config
├── server/              # Backend Express application
│   ├── auth.ts         # Authentication system
│   ├── config.ts       # Environment configuration
│   ├── middleware.ts   # Security middleware
│   ├── routes.ts       # API routes
│   ├── storage.ts      # Database operations
│   ├── seed.ts         # Database seeding
│   └── index.ts        # Server entry point
├── shared/             # Shared code between client/server
│   └── schema.ts       # Database schema & types
├── .env.example        # Environment template
├── PRODUCTION.md       # Production deployment guide
└── package.json        # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes
- `npm run db:seed` - Seed database with demo data

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/user` - Get current user
- `POST /api/change-password` - Change password

### CRM
- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create lead
- `PATCH /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `GET /api/deals` - Get all deals
- `POST /api/deals` - Create deal
- `PATCH /api/deals/:id` - Update deal
- `DELETE /api/deals/:id` - Delete deal

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee (admin only)
- `PATCH /api/employees/:id` - Update employee (admin only)
- `DELETE /api/employees/:id` - Delete employee (admin only)

### Social Media
- `GET /api/social-profiles` - Get all social profiles
- `POST /api/social-profiles` - Create social profile
- `PATCH /api/social-profiles/:id` - Update social profile
- `DELETE /api/social-profiles/:id` - Delete social profile
- `GET /api/posting-schedule` - Get posting schedule
- `POST /api/posting-schedule` - Create scheduled post
- `POST /api/posting-schedule/:id/clone` - Clone post to multiple profiles

### Attendance
- `POST /api/attendance/mark-in` - Mark attendance in
- `PATCH /api/attendance/:id/mark-out` - Mark attendance out
- `GET /api/attendance/my` - Get my attendance records
- `GET /api/attendance` - Get all attendance (admin only)

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard metrics

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `PATCH /api/admin/users/:id` - Update user (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)

## Environment Variables

See `.env.example` for all available environment variables.

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secure random string (min 32 chars, 64+ recommended)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)

Production-recommended:
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
- `RATE_LIMIT_WINDOW_MS` - Rate limit window (default: 900000ms)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)
- `LOG_LEVEL` - Logging level (error/warn/info/debug)

## Security Features

### Authentication & Authorization
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Session-based authentication
- ✅ Role-based access control (Admin, Manager, Employee)
- ✅ Secure session storage (PostgreSQL)
- ✅ HTTP-only cookies
- ✅ CSRF protection

### API Security
- ✅ Rate limiting (configurable per endpoint)
- ✅ CORS configuration
- ✅ Input validation with Zod
- ✅ SQL injection protection (Drizzle ORM)
- ✅ XSS protection (Helmet)
- ✅ Security headers (Helmet)

### Data Protection
- ✅ Environment variable validation
- ✅ Secure password requirements (min 8 chars)
- ✅ Database encryption in transit (SSL/TLS)
- ✅ Sensitive data not exposed in logs

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Email notifications
- [ ] File uploads for attachments
- [ ] Advanced reporting and exports
- [ ] Calendar integration
- [ ] Mobile app
- [ ] Webhooks for integrations
- [ ] Automated social media publishing

## License

MIT

## Support

For issues or questions:
1. Check the [PRODUCTION.md](./PRODUCTION.md) guide
2. Review server logs
3. Check environment configuration
4. Verify database connectivity

---

**Built with ❤️ using React, Express, and PostgreSQL**
