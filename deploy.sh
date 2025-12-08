#!/bin/bash
# Deploy to Vercel using prebuilt output
# This bypasses Vercel's build process and uses your local build

echo "🔨 Building project locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo "🚀 Deploying to Vercel with prebuilt output..."

vercel deploy --prebuilt
