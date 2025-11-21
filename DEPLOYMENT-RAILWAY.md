# Railway Deployment Guide (Recommended)

Railway is perfect for your Express.js CRM application with sessions and WebSockets.

## Why Railway?

✅ Works perfectly with Express.js and sessions
✅ Handles persistent connections
✅ Free tier with $5 credit monthly
✅ No code changes needed
✅ Automatic HTTPS
✅ Easy database integration

## Prerequisites

1. A [Railway account](https://railway.app) (sign up with GitHub)
2. Your code pushed to GitHub
3. A PostgreSQL database (Railway provides one, or use Neon)

## Step 1: Prepare Your Repository

Make sure your code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

## Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your CRM repository
5. Railway will automatically detect it as a Node.js app

## Step 3: Add PostgreSQL Database

### Option A: Use Railway's PostgreSQL (Easiest)

1. In your Railway project, click **"New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a `DATABASE_URL` environment variable
4. Done! Skip to Step 4.

### Option B: Use Your Existing Neon Database

1. In your Railway project, click on your service
2. Go to **"Variables"** tab
3. Add your existing `DATABASE_URL` from Neon

## Step 4: Add Environment Variables

In the **Variables** tab, add the following:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `SESSION_SECRET` | Generate using: `openssl rand -base64 48` | Required - must be 32+ chars |
| `PORT` | (leave empty) | Railway sets this automatically |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Optional - 15 minutes |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Optional |
| `LOG_LEVEL` | `info` | Optional |

**For DATABASE_URL**:
- If using Railway PostgreSQL, it's added automatically
- If using Neon, paste your connection string from Neon dashboard

**Generate SESSION_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

## Step 5: Configure Build Settings

Railway usually auto-detects everything, but verify:

1. Go to **Settings** tab
2. Check:
   - **Build Command**: Should be auto-detected (`npm run build`)
   - **Start Command**: Should be auto-detected (`npm start`)
3. If not set, add them:
   - Build: `npm install && npm run build`
   - Start: `npm start`

## Step 6: Deploy

1. Railway will automatically start deploying
2. Wait for build to complete (2-5 minutes)
3. You'll get a URL like: `your-app.up.railway.app`

## Step 7: Push Database Schema

After deployment, you need to create database tables:

### Method 1: Using Railway's PostgreSQL

1. In Railway, click your PostgreSQL service
2. Go to **"Data"** tab
3. Note your database credentials
4. Temporarily update your local `.env` with Railway's `DATABASE_URL`
5. Run:
   ```bash
   npm run db:push
   ```
6. Restore your local `.env`

### Method 2: Using Railway CLI (Easier)

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login:
   ```bash
   railway login
   ```

3. Link your project:
   ```bash
   railway link
   ```

4. Run migrations:
   ```bash
   railway run npm run db:push
   ```

## Step 8: Configure CORS (Important!)

1. In Railway Variables, add:
   ```
   ALLOWED_ORIGINS=https://your-app.up.railway.app
   ```
2. Railway will auto-redeploy with new variables

## Step 9: Add Custom Domain (Optional)

1. In Railway, go to **Settings** → **Domains**
2. Click **"Generate Domain"** for a railway.app subdomain
3. Or add your custom domain:
   - Click **"Custom Domain"**
   - Enter your domain
   - Add CNAME record to your DNS:
     ```
     CNAME  your-domain.com  your-app.up.railway.app
     ```
4. Update `ALLOWED_ORIGINS` to include your custom domain

## Step 10: Seed Database (Optional)

To create initial users:

```bash
# Using Railway CLI
railway run npm run db:seed

# Or manually update local .env and run:
npm run db:seed
```

## Verify Deployment

1. Visit your Railway URL
2. Try signing up for an account
3. Test login, tasks, attendance features
4. Check logs in Railway dashboard if issues occur

## Monitoring & Logs

- **View Logs**: Railway Dashboard → Your Service → **Deployments** tab
- **Metrics**: Railway shows CPU, Memory, Network usage
- **Restart**: Click **"Restart"** button if needed

## Updating Your App

To deploy updates:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Railway automatically detects GitHub pushes and redeploys!

## Cost & Limits

- **Free Tier**: $5 credit per month
- **Usage**: ~$0.50-2/month for small apps
- **Database**: ~$1-3/month for Railway PostgreSQL
- **Upgrade**: $5/month for more resources

## Troubleshooting

### Build Fails
- Check **Deployments** logs for errors
- Verify all environment variables are set
- Make sure `package.json` has correct scripts

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Make sure you ran `npm run db:push`
- Check PostgreSQL service is running

### App Crashes on Start
- Check logs: Railway Dashboard → Deployments → Latest
- Verify `NODE_ENV=production`
- Make sure `SESSION_SECRET` is set

### CORS Errors
- Add your Railway domain to `ALLOWED_ORIGINS`
- Format: `https://your-app.up.railway.app` (no trailing slash)

## Environment Variables Checklist

- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` (auto-set if using Railway PostgreSQL)
- [ ] `SESSION_SECRET` (48+ character random string)
- [ ] `ALLOWED_ORIGINS` (your Railway URL)
- [ ] `RATE_LIMIT_WINDOW_MS` (optional)
- [ ] `RATE_LIMIT_MAX_REQUESTS` (optional)

## Post-Deployment Checklist

- [ ] Database schema pushed
- [ ] App loads without errors
- [ ] Can sign up new users
- [ ] Can login successfully
- [ ] CORS configured correctly
- [ ] All features work (tasks, posts, attendance)
- [ ] Custom domain configured (if applicable)

## Useful Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs

# Run commands with production env
railway run npm run db:push
railway run npm run db:seed

# Open dashboard
railway open
```

## Getting Help

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check logs in Railway dashboard

---

**Congratulations! Your CRM is now live on Railway! 🎉**

Railway is much better suited for your Express.js app than Vercel!
