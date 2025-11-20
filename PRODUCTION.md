# Production Deployment Guide

This guide will help you deploy your CRM application to production safely and securely.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Security Checklist](#security-checklist)
- [Deployment Steps](#deployment-steps)
- [Post-Deployment](#post-deployment)
- [Maintenance](#maintenance)

## Prerequisites

Before deploying to production, ensure you have:

1. **Node.js** v18 or higher
2. **PostgreSQL** database (we recommend Neon, Supabase, or Railway)
3. **SSL Certificate** for HTTPS
4. **Domain name** configured
5. **Environment variables** properly set

## Environment Setup

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your production values:

```env
# Database - Use your production PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Server
PORT=5000
NODE_ENV=production

# Security - Generate a secure random session secret
# Run: openssl rand -base64 48
SESSION_SECRET=<YOUR_SECURE_RANDOM_STRING_MIN_64_CHARS>

# CORS - Add your production domain(s)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting (adjust based on your needs)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### 3. Generate Secure Session Secret

```bash
openssl rand -base64 64
```

Copy the output and use it as your `SESSION_SECRET`.

## Database Setup

### 1. Create Database Tables

```bash
npm run db:push
```

This will create all necessary tables in your production database.

### 2. Create Admin User

Create your first admin user:

```bash
npm run db:seed
```

Or manually via API after deployment:

```bash
curl -X POST https://yourdomain.com/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

Then update the user role to admin in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@yourdomain.com';
```

## Security Checklist

Before going live, verify:

- [ ] `NODE_ENV=production` is set
- [ ] `SESSION_SECRET` is at least 64 characters and randomly generated
- [ ] `DATABASE_URL` uses SSL (`sslmode=require`)
- [ ] `ALLOWED_ORIGINS` is set to your actual domain(s)
- [ ] HTTPS is configured (SSL certificate)
- [ ] Database backups are configured
- [ ] Rate limiting is enabled
- [ ] Passwords are hashed with bcrypt (✅ already configured)
- [ ] Session store uses PostgreSQL (✅ already configured)
- [ ] Security headers are enabled via Helmet (✅ already configured)
- [ ] CORS is properly configured (✅ already configured)
- [ ] Input validation is in place (✅ already configured)

## Deployment Steps

### Option 1: Docker Deployment (Recommended)

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY dist ./dist
   COPY server ./server

   ENV NODE_ENV=production

   EXPOSE 5000

   CMD ["node", "dist/index.js"]
   ```

3. **Build and run:**
   ```bash
   docker build -t crm-app .
   docker run -p 5000:5000 --env-file .env crm-app
   ```

### Option 2: Traditional Server Deployment

1. **Install dependencies:**
   ```bash
   npm ci --only=production
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Start with PM2 (Process Manager):**
   ```bash
   npm install -g pm2
   pm2 start npm --name "crm-app" -- start
   pm2 save
   pm2 startup
   ```

### Option 3: Platform as a Service (PaaS)

#### Heroku
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
git push heroku main
```

#### Railway
1. Connect your GitHub repository
2. Add PostgreSQL database
3. Set environment variables
4. Deploy

#### Render
1. Connect your GitHub repository
2. Add PostgreSQL database
3. Set environment variables
4. Deploy

## Post-Deployment

### 1. Verify Deployment

```bash
# Check health
curl https://yourdomain.com/api/dev/users

# Test authentication
curl -X POST https://yourdomain.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"yourpassword"}'
```

### 2. Create Additional Users

Use the admin panel or API to create users for your team.

### 3. Configure Monitoring

Set up monitoring for:
- Application uptime
- API response times
- Error rates
- Database performance
- Server resources

Recommended tools:
- **Application**: New Relic, Datadog, or Sentry
- **Uptime**: UptimeRobot or Pingdom
- **Logs**: LogDNA or Papertrail

## Maintenance

### Database Backups

Set up automated backups:
- **Neon**: Automatic backups included
- **Supabase**: Configure via dashboard
- **Manual**: Use `pg_dump` daily

```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Updating the Application

1. **Test in staging first**
2. **Backup database**
3. **Pull latest changes**
   ```bash
   git pull origin main
   ```
4. **Install dependencies**
   ```bash
   npm ci
   ```
5. **Run migrations**
   ```bash
   npm run db:push
   ```
6. **Rebuild**
   ```bash
   npm run build
   ```
7. **Restart**
   ```bash
   pm2 restart crm-app
   ```

### Security Updates

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Fix vulnerabilities
npm audit fix
```

### Monitoring Logs

```bash
# With PM2
pm2 logs crm-app

# With Docker
docker logs <container-id>
```

## Troubleshooting

### Common Issues

1. **"SESSION_SECRET must be at least 32 characters"**
   - Generate a new secret: `openssl rand -base64 64`
   - Update `.env` file

2. **CORS errors**
   - Verify `ALLOWED_ORIGINS` includes your domain
   - Check that cookies are being sent with credentials

3. **Database connection errors**
   - Verify `DATABASE_URL` is correct
   - Ensure SSL is enabled (`sslmode=require`)
   - Check firewall rules

4. **Rate limiting too aggressive**
   - Adjust `RATE_LIMIT_MAX_REQUESTS` in `.env`
   - Consider IP whitelisting for internal tools

## Support

For issues or questions:
1. Check logs first
2. Review this guide
3. Check database connectivity
4. Verify environment variables

## Security Best Practices

1. **Never commit `.env` to version control**
2. **Rotate `SESSION_SECRET` periodically**
3. **Keep dependencies updated**
4. **Monitor for security vulnerabilities**
5. **Use strong passwords for all users**
6. **Enable 2FA for admin accounts** (future feature)
7. **Regular security audits**
8. **Backup regularly**

---

**Last Updated:** 2025-01-11
**Version:** 1.0.0
