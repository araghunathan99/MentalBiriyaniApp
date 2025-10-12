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
echo "📥 Step 1/11: Downloading Git LFS files..."
if python3 scripts/download-lfs-files.py; then
  echo "✓ LFS files downloaded successfully"
else
  echo "⚠️  LFS download failed or files already present"
fi
echo ""

# Convert videos to MP4 (720p max) with better handling
if [ "$SKIP_VIDEO" = false ]; then
  echo "🎬 Step 2/11: Converting videos to MP4 (H.264, 720p)..."
  chmod +x scripts/convert-videos.sh
  if bash scripts/convert-videos.sh; then
    echo "✓ Video conversion complete"
  else
    echo "⚠️  Some videos failed conversion (check video-conversion.log)"
    echo "   Failed videos will be skipped in the app"
  fi
  echo ""
else
  echo "⏭️  Step 2/11: Skipping video conversion (--skip-video flag)"
  echo ""
fi

# Generate all JSON content lists
echo "📋 Step 3/11: Generating content lists..."
python3 scripts/generate-media-lists.py
echo ""

# Generate content lists (legacy support)
echo "📋 Step 4/11: Generating legacy content lists..."
node scripts/generate-content-lists.js 2>/dev/null || echo "  (Legacy script not found, skipping)"
echo ""

# Parse chat conversations
echo "💬 Step 5/11: Parsing chat conversations..."
node scripts/parse-chat.js
echo ""

# Build the app
echo "📦 Step 6/11: Building app with Vite..."
npm run build
echo ""

# Fix paths for GitHub Pages
echo "🔧 Step 7/11: Fixing asset paths..."
node scripts/fix-github-pages-paths.js
echo ""

# Copy content folder
echo "📁 Step 8/11: Copying media files..."
cp -r client/public/content dist/public/
echo ""

# Copy PWA files
echo "📱 Step 9/11: Copying PWA configuration..."
cp client/public/manifest.json client/public/sw.js dist/public/
cp client/public/icon-*.svg dist/public/
touch dist/public/.nojekyll
echo ""

# Add cache-busting version parameters (AFTER copying files)
echo "🔄 Step 10/11: Adding cache-busting version..."
node scripts/add-cache-busting.js
echo ""

# Copy documentation
echo "📚 Step 11/11: Copying documentation..."
cp BUILD_FOR_GITHUB_PAGES.md dist/public/DEPLOYMENT_GUIDE.md 2>/dev/null || true
cp VIDEO_CONVERSION_GUIDE.md dist/public/ 2>/dev/null || true
cp PWA_INSTALLATION_GUIDE.md dist/public/ 2>/dev/null || true
cp video-conversion.log dist/public/ 2>/dev/null || true
echo ""

echo ""

echo "✅ Build complete!"
echo ""
echo "📦 Package location: dist/public/"
echo "📊 Total size: $(du -sh dist/public | cut -f1)"
echo ""

# Deploy to GitHub Pages if requested
if [ "$AUTO_DEPLOY" = true ]; then
  echo "🚀 Step 12/11: Deploying to GitHub Pages..."
  echo ""
  
  # Use the deployment script
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
  echo "Set custom repository (optional):"
  echo "  export GITHUB_PAGES_REPO=https://github.com/username/MentalBiriyani.git"
  echo "  bash scripts/deploy-github-pages.sh"
  echo ""
fi
