# Nople — Railway Deployment Guide

This guide walks you through deploying Nople (the coffee suppliers B2B marketplace) to Railway for free using Railway's trial credit.

---

## Prerequisites

1. A GitHub account with the Nople repository pushed
2. A Railway account (sign up at [railway.app](https://railway.app)) — you get **$5 free credit** (about 30 days of hosting)
3. No local machine needed — everything is done from the Railway dashboard

---

## Step 1: Delete the Old Railway Project (if any)

If you already created a Railway project that is stuck or failed:

1. Go to your Railway dashboard
2. Click on the failed project (e.g., "handsome-healing")
3. Go to **Settings → Delete Project**
4. Confirm deletion

This clears the slate so we can start fresh with proper configuration.

---

## Step 2: Create a New Railway Project

1. Go to [railway.app](https://railway.app) and log in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select the `Nople` repository (yuoseef01018/Nople)
4. Railway will detect the `Dockerfile` and `railway.json` we added
5. **Do NOT deploy yet** — we need to add databases and environment variables first
6. Click **Add a Service** → you'll see the repo, but **wait** — set up databases first

---

## Step 3: Add PostgreSQL Database

1. In your Railway project, click **+ Add** (or **New Service**)
2. Select **Database → PostgreSQL**
3. Wait for it to provision (takes ~30 seconds)
4. Once provisioned, click on the PostgreSQL service
5. Go to the **Connect** tab
6. Copy the **Postgres URL** (looks like: `postgresql://postgres:password@host.railway.app:port/railway`)
7. Save this URL — you'll need it for environment variables

---

## Step 4: Add Redis Database

1. In your Railway project, click **+ Add** (or **New Service**)
2. Select **Database → Redis**
3. Wait for it to provision (takes ~30 seconds)
4. Once provisioned, click on the Redis service
5. Go to the **Connect** tab
6. Copy the **Redis URL** (looks like: `redis://default:password@host.railway.app:port`)
7. Save this URL — you'll need it for environment variables

---

## Step 5: Deploy the Nople App

1. In your Railway project, click **+ Add** → **GitHub Repo**
2. Select the `Nople` repository
3. Railway will detect the `Dockerfile` and begin building
4. **Before the build finishes**, go to the service's **Variables** tab
5. Add all the environment variables (see Step 6 below)
6. The build will take ~5-10 minutes (it builds all monorepo packages + UI panels)

---

## Step 6: Set Environment Variables

Go to your Nople service → **Variables** tab, and add each of these:

### Database Variables
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | (Your PostgreSQL URL from Step 3) |
| `REDIS_URL` | (Your Redis URL from Step 4) |

### CORS Variables
Replace `YOUR-APP-URL` with the URL Railway assigns your app (find it in **Settings → Networking → Public URL**). Format: `https://nople-production.up.railway.app`

| Variable | Value |
|----------|-------|
| `STORE_CORS` | `https://YOUR-APP-URL.up.railway.app,http://localhost:8000` |
| `ADMIN_CORS` | `https://YOUR-APP-URL.up.railway.app/dashboard,http://localhost:7000` |
| `VENDOR_CORS` | `https://YOUR-APP-URL.up.railway.app/seller,http://localhost:7001` |
| `AUTH_CORS` | `https://YOUR-APP-URL.up.railway.app,http://localhost:8000` |

### Security Secrets
Generate random strings (e.g., from [random.org](https://www.random.org/strings/) or use any long random string):

| Variable | Value |
|----------|-------|
| `JWT_SECRET` | (a random 32+ character string) |
| `COOKIE_SECRET` | (a different random 32+ character string) |

### File & URL Variables
| Variable | Value |
|----------|-------|
| `FILE_BACKEND_URL` | `https://YOUR-APP-URL.up.railway.app/static` |
| `MERCUR_VENDOR_URL` | `https://YOUR-APP-URL.up.railway.app/seller` |
| `VITE_MERCUR_BACKEND_URL` | `https://YOUR-APP-URL.up.railway.app` |
| `VITE_MERCUR_VENDOR_URL` | `https://YOUR-APP-URL.up.railway.app/seller` |

### Environment
| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |

---

## Step 7: Generate the Public URL

1. Go to your Nople service → **Settings → Networking**
2. Click **Generate Public URL** (or **Generate Domain**)
3. Railway gives you a URL like: `https://nople-production.up.railway.app`
4. **IMPORTANT:** Go back to your **Variables** tab and update all the CORS/URL variables above with this actual URL

---

## Step 8: Run Database Migrations & Seed

After the app is deployed and running, you need to run migrations to create database tables and seed coffee data.

### Option A: Using Railway Shell (Recommended)

1. Go to your Nople service in Railway
2. Click the **Settings** or click on the service and look for **Console** / **Shell** access
3. Run these commands:

```bash
# Run database migrations
cd /app/apps/api && bunx medusa db:migrate

# Run the Nople coffee seed data (optional but recommended)
cd /app/apps/api && bunx medusa exec ./src/scripts/seed-nople-coffee.ts
```

### Option B: Create a Seed Job in Railway

1. In your Railway project, click the **Nople service → Settings**
2. Scroll down to find a way to run a one-off command
3. Or create a new service with the same repo, set the start command to:
   ```
   cd /app/apps/api && bunx medusa db:migrate && bunx medusa exec ./src/scripts/seed-nople-coffee.ts
   ```

---

## Step 9: Access Your Deployed App

Once everything is running:

| Service | URL |
|---------|-----|
| **API** | `https://YOUR-APP-URL.up.railway.app` |
| **Admin Dashboard** | `https://YOUR-APP-URL.up.railway.app/dashboard` |
| **Vendor Panel** | `https://YOUR-APP-URL.up.railway.app/seller` |

### Default Admin Login
The first time you access the admin dashboard, you may need to create an admin user. Use the Medusa CLI in the Railway shell:

```bash
cd /app/apps/api && bunx medusa user --email admin@nople.com --password SuperSecret123!
```

---

## Troubleshooting

### Build Fails
- Check the build logs in Railway (click on the deploy, then view logs)
- Common issues:
  - Missing environment variables → ensure all variables from Step 6 are set
  - `bun install` fails → the `bun.lock` file should handle this, but try removing `--frozen-lockfile` from the Dockerfile if it fails

### App Crashes on Start
- Check the deploy logs
- Common issues:
  - Database not connected → verify `DATABASE_URL` is set correctly
  - Redis not connected → verify `REDIS_URL` is set correctly
  - Missing migrations → run `bunx medusa db:migrate` first

### Admin/Vendor Panels Show "Dashboard not built"
- This means the Vite build for the UI panels failed or didn't run
- Check the build logs for Vite errors
- The admin panel should be at `/dashboard` and vendor at `/seller`

### CORS Errors
- Ensure all CORS variables match your actual Railway domain exactly
- No trailing slashes in the URLs
- Include both the Railway domain and localhost for local dev

---

## Cost Management

Railway gives you $5 free credit. To maximize it:

1. The app uses ~200-500MB RAM in production
2. At $0.34/hour for the compute, $5 lasts about 14-15 hours of continuous running
3. The trial credit lasts 30 days but the $5 credit may run out sooner
4. To extend: consider upgrading to a paid plan or using the Always Free Oracle Cloud VM option (see README for details)

---

## Alternative: Oracle Cloud Always Free (Permanent Free)

For a truly free, permanent hosting solution, consider Oracle Cloud Always Free:
- **VM**: 4 ARM cores, 24GB RAM (much more powerful than Railway)
- **Permanent**: No expiry, no credit card charge
- **Setup**: Install Docker, PostgreSQL, Redis on the VM, then run Nople with docker-compose
- See the README for the Oracle Cloud setup guide

---

## Summary

1. ✅ Create Railway project from GitHub repo
2. ✅ Add PostgreSQL + Redis services
3. ✅ Set all environment variables
4. ✅ Generate public URL and update CORS variables
5. ✅ Run database migrations
6. ✅ Create admin user
7. ✅ Access admin at `/dashboard` and vendor at `/seller`

Your Nople coffee marketplace is now live! 🎉
