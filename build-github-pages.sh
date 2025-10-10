#!/bin/bash

echo "🚀 Building MentalBiriyani for GitHub Pages..."
echo ""

# Convert videos to MP4 (720p max)
echo "🎬 Step 1/6: Converting videos to MP4..."
if node scripts/convert-videos.js; then
  echo "✓ Video conversion complete"
else
  echo "⚠️  Video conversion failed or skipped"
  echo "   Videos will be used as-is (.mov format)"
  echo "   For universal browser support, install FFmpeg and run again"
fi
echo ""

# Build the app
echo "📦 Step 2/6: Building app with Vite..."
npm run build

# Fix paths for GitHub Pages
echo "🔧 Step 3/6: Fixing asset paths..."
node scripts/fix-github-pages-paths.js

# Copy content folder
echo "📁 Step 4/6: Copying media files..."
cp -r client/public/content dist/public/

# Copy PWA files
echo "📱 Step 5/6: Copying PWA configuration..."
cp client/public/manifest.json client/public/sw.js dist/public/
cp client/public/icon-*.svg dist/public/
touch dist/public/.nojekyll

# Copy documentation
echo "📚 Step 6/6: Copying documentation..."
cp DEPLOYMENT_PACKAGE.md GITHUB_PAGES_DEPLOYMENT.md PWA_INSTALLATION_GUIDE.md dist/public/

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Package location: dist/public/"
echo "📊 Total size: $(du -sh dist/public | cut -f1)"
echo ""
echo "🚀 Ready to deploy to GitHub Pages!"
echo ""
echo "Next steps:"
echo "  1. cd dist/public"
echo "  2. Follow instructions in README.md"
echo ""
