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

### Step 1: Fix Output Directory (CRITICAL!)
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **General** → **Framework Settings**
2. Find the **"Output Directory"** field
3. **DISABLE the "Override" toggle** next to Output Directory (turn it OFF/grey)
4. **OR** clear the `dist` value and leave it empty
5. **Why**: The Astro Vercel adapter uses `.vercel/output/` structure, not `dist`. Setting Output Directory to `dist` causes Vercel to look in the wrong place for `entry.mjs`.

### Step 2: Verify Other Project Settings
1. In the same **Framework Settings** page:
   - **Framework Preset**: Should be **"Astro"** ✓ (you have this correct)
   - **Build Command**: `npm run build` ✓ (you have this correct)
   - **Output Directory**: **MUST BE EMPTY** (disable override) ⚠️ **THIS IS THE PROBLEM**
   - **Install Command**: Can be default (not overridden)
   - **Development Command**: Can be default (not overridden)

### Step 3: Fix Node.js Version Settings
1. Go to **Settings** → **General** → **Node.js Version**
2. You'll see a warning: "Configuration Settings in the current Production deployment differ from your current Project Settings"
3. Click to expand **"Production Overrides"** and **"Project Settings"**
4. Ensure both are set to **Node.js 22.x** (or at least match each other)
5. If they differ, update **Project Settings** to **22.x** and remove any production overrides

### Step 4: Clear Build Cache
1. In **Settings** → **General**, scroll down to **Build & Development Settings**
2. Click **"Clear Build Cache"**
3. This forces Vercel to rebuild from scratch

### Step 5: Check Build Logs
1. Go to **Deployments** tab
2. Click on the **latest failed deployment**
3. Click **"Build Logs"** tab
4. Look for:
   - ✅ Does the build complete successfully?
   - ✅ Does it show `[@astrojs/vercel] Bundling function`?
   - ✅ Does it show `[@astrojs/vercel] Copying static files to .vercel/output/static`?
   - ❌ Any errors during the build step?

### Step 6: Check Runtime Logs
1. In the same deployment, click **"Runtime Logs"** tab
2. Look for the exact error message
3. The error should show it's looking for `/var/task/dist/server/entry.mjs`

### Step 7: Redeploy After Changes
**IMPORTANT**: After making the Output Directory change, you MUST redeploy:
1. Go to **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Select **"Redeploy"**
4. This will trigger a fresh build with the corrected settings

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
