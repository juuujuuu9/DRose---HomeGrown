# Vercel Deployment Fix Checklist

## Current Issue
Error: `Cannot find module '/var/task/dist/server/entry.mjs'`

## What We've Done ✅
1. ✅ Updated adapter import (removed deprecated `/serverless`)
2. ✅ Fixed database initialization
3. ✅ Added error handling
4. ✅ Optimized database pool
5. ✅ Removed build artifacts from git
6. ✅ Added Node.js version constraint (18-22.x)
7. ✅ Verified local build works correctly

## What You Need to Check in Vercel Dashboard

### Step 1: Verify Project Settings
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **General**
2. Check these settings:
   - **Framework Preset**: Should be **"Astro"** (or auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: **LEAVE EMPTY** (adapter handles this automatically)
   - **Install Command**: `npm install` (or leave empty)
   - **Node.js Version**: Should be **22.x** (we just added this constraint)

### Step 2: Clear Build Cache
1. In **Settings** → **General**, scroll down to **Build & Development Settings**
2. Click **"Clear Build Cache"**
3. This forces Vercel to rebuild from scratch

### Step 3: Check Build Logs
1. Go to **Deployments** tab
2. Click on the **latest failed deployment**
3. Click **"Build Logs"** tab
4. Look for:
   - ✅ Does the build complete successfully?
   - ✅ Does it show `[@astrojs/vercel] Bundling function`?
   - ✅ Does it show `[@astrojs/vercel] Copying static files to .vercel/output/static`?
   - ❌ Any errors during the build step?

### Step 4: Check Runtime Logs
1. In the same deployment, click **"Runtime Logs"** tab
2. Look for the exact error message
3. The error should show it's looking for `/var/task/dist/server/entry.mjs`

## If Build Logs Show Success But Runtime Fails

This means the build completes but the files aren't in the right place. Try:

### Option A: Redeploy
1. Go to **Deployments**
2. Click the **three dots** on the latest deployment
3. Select **"Redeploy"**
4. This will trigger a fresh build

### Option B: Check Function Structure
The function should have this structure:
```
/var/task/
  ├── dist/
  │   └── server/
  │       └── entry.mjs  ← This file must exist
  ├── node_modules/
  └── package.json
```

If the structure is different, Vercel might not be using the Build Output API correctly.

## Alternative: Deploy with Prebuilt Output

If Vercel's build keeps failing, you can deploy using your local build:

```bash
# Build locally (we know this works)
npm run build

# Deploy with prebuilt output
vercel deploy --prebuilt --prod
```

**Note**: You may need to link the project first if you get a project name error:
```bash
vercel link
```

## Still Not Working?

If none of the above works, the issue might be:
1. **Vercel project configuration mismatch** - The project might be configured for a different framework
2. **Build Output API not enabled** - Vercel might not be detecting the `.vercel/output/` structure
3. **Adapter version incompatibility** - There might be a bug in `@astrojs/vercel@8.2.11`

**Next Steps**:
1. Try creating a **new Vercel project** and importing from Git
2. Check the [Astro GitHub Issues](https://github.com/withastro/astro/issues) for similar problems
3. Consider opening an issue if it's a bug

## Current Configuration Summary

- **Astro**: 5.16.3
- **Vercel Adapter**: @astrojs/vercel@8.2.11
- **Output Mode**: server
- **Node.js**: 18-22.x (specified in package.json)
- **Build Output API**: Version 3 (confirmed in `.vercel/output/config.json`)

The local build creates the correct structure at `.vercel/output/functions/_render.func/dist/server/entry.mjs`, so the issue is specifically with Vercel's build/deployment process.
