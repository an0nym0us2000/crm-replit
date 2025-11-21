# Deployment Guide

⚠️ **IMPORTANT: This Express.js application is NOT compatible with Vercel's serverless architecture.**

## ✅ Recommended Deployment Platform: Railway

**Please use [DEPLOYMENT-RAILWAY.md](DEPLOYMENT-RAILWAY.md) instead!**

Railway is the best choice for this application because:
- ✅ Works perfectly with Express.js and sessions
- ✅ Handles WebSocket connections
- ✅ No code changes required
- ✅ Free $5 monthly credit
- ✅ Much simpler than Vercel for this use case

## Why Not Vercel?

Vercel is designed for serverless functions and static sites. This application uses:
- Express sessions (requires persistent server)
- Database connection pooling
- Long-running processes

These don't work well in Vercel's serverless environment.

---

# ❌ Vercel Deployment (Not Recommended)

**This section is kept for reference only. Use Railway instead!**

If you still want to try Vercel despite the limitations:

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier works fine)
2. A [Neon PostgreSQL database](https://neon.tech) or any other PostgreSQL provider
3. GitHub account with this repository pushed to GitHub

## Step 1: Prepare Your Database

### Option A: Using Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and sign up for a free account
2. Create a new project
3. Copy the connection string (it will look like: `postgresql://user:password@host.neon.tech/database?sslmode=require`)
4. Keep this connection string handy for the next steps

### Option B: Using Another PostgreSQL Provider

You can use Supabase, Railway, or any other PostgreSQL provider. Just make sure to get the connection string.

## Step 2: Push Your Code to GitHub

If you haven't already, push your code to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

**IMPORTANT**: Make sure your `.env` file is NOT committed to GitHub. The `.gitignore` file should already exclude it.

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" � "Project"
3. Import your GitHub repository
4. Configure your project:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Click on "Environment Variables" and add the following:

   | Variable Name | Value | Description |
   |--------------|-------|-------------|
   | `DATABASE_URL` | Your PostgreSQL connection string | From Neon or your DB provider |
   | `SESSION_SECRET` | Generate using: `openssl rand -base64 48` | A secure random string |
   | `NODE_ENV` | `production` | Environment mode |
   | `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | Your Vercel domain (add after first deploy) |
   | `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 minutes) |
   | `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
   | `LOG_LEVEL` | `info` | Logging level |

6. Click "Deploy"

## Step 4: Push Database Schema

After your first deployment, you need to push the database schema:

1. Open your local terminal
2. Temporarily update your `.env` file with the production `DATABASE_URL`
3. Run the following command:
   ```bash
   npm run db:push
   ```
4. Restore your local `DATABASE_URL` in `.env`

## Step 5: Update CORS Settings

After deployment, you'll get a Vercel URL like `https://your-app.vercel.app`

1. Go to Vercel Dashboard � Your Project � Settings � Environment Variables
2. Update the `ALLOWED_ORIGINS` variable to include your Vercel URL:
   ```
   https://your-app.vercel.app
   ```
3. Click "Save"
4. Redeploy your application (Vercel will auto-redeploy when you save env vars)

## Step 6: Seed Initial Admin User (Optional)

If you want to create an initial admin user:

1. Update your local `.env` with production `DATABASE_URL`
2. Run:
   ```bash
   npm run db:seed
   ```
3. This will create default users (admin@example.com, etc.)
4. **IMPORTANT**: Change these passwords immediately after first login!

## Step 7: Verify Deployment

1. Visit your Vercel URL
2. Try signing up for a new account
3. Test login functionality
4. Verify all features work correctly

## Troubleshooting

### Build Fails

- Check the build logs in Vercel dashboard
- Make sure all environment variables are set correctly
- Verify your `package.json` dependencies are correct

### Database Connection Errors

- Verify your `DATABASE_URL` is correct
- Make sure you've run `npm run db:push` to create tables
- Check that your database allows connections from Vercel IPs

### 429 Rate Limit Errors

- This is normal in production to prevent abuse
- Rate limiting is disabled in development mode
- Adjust `RATE_LIMIT_MAX_REQUESTS` if needed

### CORS Errors

- Make sure `ALLOWED_ORIGINS` includes your Vercel domain
- Don't include trailing slashes in the URL
- Redeploy after changing environment variables

## Custom Domain (Optional)

To use a custom domain:

1. Go to Vercel Dashboard � Your Project � Settings � Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Add your custom domain to `ALLOWED_ORIGINS`:
   ```
   https://your-app.vercel.app,https://yourdomain.com,https://www.yourdomain.com
   ```

## Environment Variables Reference

All required environment variables are documented in `.env.example`. Make sure to set all of them in Vercel's dashboard.

## Security Notes

-  Never commit `.env` to GitHub
-  Use strong, random SESSION_SECRET (minimum 32 characters)
-  Enable SSL/HTTPS (Vercel does this automatically)
-  Change default user passwords immediately
-  Review and adjust rate limiting based on your needs
-  Keep your DATABASE_URL secret
-  Regularly update dependencies for security patches

## Post-Deployment Checklist

- [ ] Database schema pushed successfully
- [ ] All environment variables configured
- [ ] CORS settings updated with Vercel URL
- [ ] Admin account created and password changed
- [ ] Quick login feature removed (already done)
- [ ] Test all major features (signup, login, tasks, posts, attendance)
- [ ] Monitor Vercel logs for any errors
- [ ] Set up error tracking (optional: Sentry, LogRocket, etc.)

## Updating Your App

To deploy updates:

1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
4. Vercel will automatically deploy the changes

## Getting Help

- Vercel Documentation: https://vercel.com/docs
- Neon Documentation: https://neon.tech/docs
- Check server logs in Vercel Dashboard � Your Project � Deployments � [Latest] � Functions

---

**Congratulations! Your CRM is now live on Vercel! <�**
