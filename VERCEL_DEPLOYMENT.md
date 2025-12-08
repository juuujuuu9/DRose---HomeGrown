# Vercel Deployment Troubleshooting Guide

## Current Issue
Error: `Cannot find module '/var/task/dist/server/entry.mjs'`

## Solution Steps

### Option 1: Check Vercel Project Settings (Recommended)

1. Go to your Vercel Dashboard → Select your project
2. Navigate to **Settings** → **General**
3. Verify the following settings:
   - **Framework Preset**: Should be "Astro" (or auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave **EMPTY** (the adapter handles this)
   - **Install Command**: `npm install` (or leave empty)
   - **Node.js Version**: Should be 22.x (or auto-detected)

4. Go to **Settings** → **General** → Scroll down to **Build & Development Settings**
5. Click **Clear Build Cache**
6. Redeploy the project

### Option 2: Deploy with Prebuilt Output (Bypass Vercel Build)

If the above doesn't work, deploy using your local build:

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Build locally
npm run build

# Deploy with prebuilt output
vercel deploy --prebuilt

# Or use the provided script
./deploy.sh
```

This uses your local `.vercel/output/` directory which we know works correctly.

### Option 3: Verify Build Output Structure

After building locally, verify the structure:

```bash
npm run build
ls -la .vercel/output/functions/_render.func/dist/server/entry.mjs
```

The file should exist. If it does, the issue is with Vercel's build environment.

### Option 4: Check Vercel Build Logs

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on the failed deployment
3. Check the **Build Logs** tab
4. Look for any errors during the build step (not just runtime)

Common issues to look for:
- Missing dependencies
- Build command failures
- Node.js version mismatches
- Environment variable issues

## Current Configuration

- **Astro Version**: 5.16.3
- **Vercel Adapter**: @astrojs/vercel@8.2.11
- **Output Mode**: server
- **Adapter Import**: `@astrojs/vercel` (non-deprecated)

## If All Else Fails

1. Try creating a new Vercel project and importing from Git
2. Ensure all environment variables are set in Vercel dashboard
3. Check if there are any Vercel-specific limitations or known issues
4. Consider opening an issue on the Astro GitHub repository
