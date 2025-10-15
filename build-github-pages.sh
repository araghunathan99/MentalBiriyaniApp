#!/bin/bash

# GitHub Pages Build & Deploy Script for MentalBiriyani
# This script builds the app and optionally deploys to GitHub Pages

set -e  # Exit on error

echo "🚀 Building MentalBiriyani for GitHub Pages..."
echo ""

# Parse command line arguments
AUTO_DEPLOY=false
SKIP_VIDEO=false

for arg in "$@"; do
  case $arg in
    --deploy)
      AUTO_DEPLOY=true
      shift
      ;;
    --skip-video)
      SKIP_VIDEO=true
      shift
      ;;
    --help)
      echo "Usage: ./build-github-pages.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --deploy       Automatically deploy to GitHub Pages after build"
      echo "  --skip-video   Skip video conversion (faster build, use existing videos)"
      echo "  --help         Show this help message"
      echo ""
      echo "Environment Variables:"
      echo "  GITHUB_PAGES_REPO   GitHub repository URL (default: https://github.com/araghunathan99/MentalBiriyani.git)"
      echo ""
      echo "Examples:"
      echo "  ./build-github-pages.sh                    # Build only"
      echo "  ./build-github-pages.sh --deploy           # Build and deploy"
      echo "  ./build-github-pages.sh --skip-video       # Build without video conversion"
      echo ""
      exit 0
      ;;
  esac
done

# Download LFS files if needed
echo "📥 Step 1/9: Downloading Git LFS files..."
if python3 scripts/download-lfs-files.py; then
  echo "✓ LFS files downloaded successfully"
else
  echo "⚠️  LFS download failed or files already present"
fi
echo ""

# Convert videos to MP4 (720p max)
if [ "$SKIP_VIDEO" = false ]; then
  echo "🎬 Step 2/9: Converting videos to MP4 (H.264, 720p)..."
  if node scripts/convert-videos.js 2>&1 | tee video-conversion.log; then
    echo "✓ Video conversion complete"
  else
    echo "⚠️  Some videos failed conversion (check video-conversion.log)"
  fi
  echo ""
else
  echo "⏭️  Step 2/9: Skipping video conversion (--skip-video flag)"
  echo ""
fi

# Generate thumbnails for all media
echo "🖼️  Step 3/9: Generating thumbnails for media files..."
node scripts/generate-thumbnails.js
echo ""

# Generate content lists (media, audio, chat)
echo "📋 Step 4/9: Generating content lists..."
node scripts/generate-content-lists.js
echo ""

# Parse chat conversations
echo "💬 Step 5/9: Parsing chat conversations..."
node scripts/parse-chat.js
echo ""

# Build the app with Vite
echo "📦 Step 6/9: Building app with Vite..."
npm run build
echo ""

# Fix paths for GitHub Pages base path
echo "🔧 Step 7/9: Fixing asset paths for /MentalBiriyani/ base..."
node scripts/fix-github-pages-paths.js
echo ""

# Copy static assets to dist
echo "📁 Step 8/9: Copying static assets..."
cp -r client/public/content dist/public/
cp client/public/manifest.json client/public/sw.js dist/public/
cp client/public/icon-*.png client/public/apple-touch-icon.png client/public/favicon.ico client/public/og-image.png dist/public/
touch dist/public/.nojekyll
echo ""

# Add cache-busting version parameters
echo "🔄 Step 9/9: Adding cache-busting version..."
node scripts/add-cache-busting.js
echo ""

echo "✅ Build complete!"
echo ""
echo "📦 Package location: dist/public/"
echo "📊 Total size: $(du -sh dist/public | cut -f1)"
echo ""

# Deploy to GitHub Pages if requested
if [ "$AUTO_DEPLOY" = true ]; then
  echo "🚀 Deploying to GitHub Pages..."
  echo ""
  bash scripts/deploy-github-pages.sh
else
  echo "📋 Build complete - deployment skipped"
  echo ""
  echo "To deploy to GitHub Pages:"
  echo "  bash scripts/deploy-github-pages.sh"
  echo ""
  echo "Or run full build with deployment:"
  echo "  ./build-github-pages.sh --deploy"
  echo ""
fi
