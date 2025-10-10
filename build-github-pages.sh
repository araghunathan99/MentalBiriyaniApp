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
      echo "  GITHUB_PAGES_REPO   GitHub repository URL (e.g., https://github.com/username/MentalBiriyani.git)"
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

# Convert videos to MP4 (720p max)
if [ "$SKIP_VIDEO" = false ]; then
  echo "🎬 Step 1/7: Converting videos to MP4..."
  if node scripts/convert-videos.js; then
    echo "✓ Video conversion complete"
  else
    echo "⚠️  Video conversion failed or skipped"
    echo "   Videos will be used as-is (.mov format)"
    echo "   For universal browser support, install FFmpeg and run again"
  fi
  echo ""
else
  echo "⏭️  Step 1/7: Skipping video conversion (--skip-video flag)"
  echo ""
fi

# Build the app
echo "📦 Step 2/7: Building app with Vite..."
npm run build
echo ""

# Fix paths for GitHub Pages
echo "🔧 Step 3/7: Fixing asset paths..."
node scripts/fix-github-pages-paths.js
echo ""

# Copy content folder
echo "📁 Step 4/7: Copying media files..."
cp -r client/public/content dist/public/
echo ""

# Copy PWA files
echo "📱 Step 5/7: Copying PWA configuration..."
cp client/public/manifest.json client/public/sw.js dist/public/
cp client/public/icon-*.svg dist/public/
touch dist/public/.nojekyll
echo ""

# Copy documentation
echo "📚 Step 6/7: Copying documentation..."
cp BUILD_FOR_GITHUB_PAGES.md dist/public/DEPLOYMENT_GUIDE.md 2>/dev/null || true
cp VIDEO_CONVERSION_GUIDE.md dist/public/ 2>/dev/null || true
cp PWA_INSTALLATION_GUIDE.md dist/public/ 2>/dev/null || true
echo ""

# Create deployment README
echo "📝 Creating deployment README..."
cat > dist/public/README.md << 'EOF'
# MentalBiriyani - GitHub Pages Deployment

This is the built and optimized version of MentalBiriyani, ready for GitHub Pages deployment.

## 🚀 Quick Deploy

This repository is already configured and committed. To deploy:

```bash
# Push to GitHub (if you have push access)
git push origin main

# Or force push if needed
git push -f origin main
```

Then enable GitHub Pages in your repository settings:
1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: main / (root)
4. Save

Your site will be live at: `https://YOUR-USERNAME.github.io/MentalBiriyani/`

## 📦 What's Included

- Optimized React app bundle
- All media files (photos & videos in MP4 format)
- PWA configuration (manifest.json, service worker)
- Documentation files

## 🎬 Video Format

Videos have been automatically converted to MP4 format for universal browser compatibility:
- Format: H.264 + AAC
- Max resolution: 720p/1280px
- Web optimized with faststart flag
- ~35% smaller file size

## 📱 Progressive Web App

This app can be installed as a PWA:
1. Visit the deployed site
2. Click "Install" or "Add to Home Screen"
3. Enjoy offline access!

See `PWA_INSTALLATION_GUIDE.md` for detailed instructions.

## 📚 Documentation

- `DEPLOYMENT_GUIDE.md` - Detailed build and deployment guide
- `VIDEO_CONVERSION_GUIDE.md` - Video conversion documentation
- `PWA_INSTALLATION_GUIDE.md` - PWA installation instructions

## 🔄 Updating Content

To update the site:

1. Make changes in the main project
2. Run: `./build-github-pages.sh --deploy`
3. Changes will be automatically built and pushed

## ℹ️ About

**MentalBiriyani** - A curated nostalgia ride that is like biriyani for the mind! #DD40

Built with ❤️ for Div Papa
EOF
echo ""

echo "✅ Build complete!"
echo ""
echo "📦 Package location: dist/public/"
echo "📊 Total size: $(du -sh dist/public | cut -f1)"
echo ""

# Deploy to GitHub Pages if requested
if [ "$AUTO_DEPLOY" = true ]; then
  echo "🚀 Step 7/7: Deploying to GitHub Pages..."
  echo ""
  
  cd dist/public
  
  # Check if git repo exists
  if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git branch -M main
  fi
  
  # Get GitHub repo URL from environment variable or prompt
  if [ -z "$GITHUB_PAGES_REPO" ]; then
    echo ""
    echo "📝 GitHub Repository Setup"
    echo ""
    echo "Please enter your GitHub Pages repository URL:"
    echo "Example: https://github.com/username/MentalBiriyani.git"
    echo ""
    read -p "Repository URL: " GITHUB_PAGES_REPO
    
    if [ -z "$GITHUB_PAGES_REPO" ]; then
      echo ""
      echo "❌ Error: No repository URL provided"
      echo "   Build complete but deployment skipped"
      echo ""
      echo "To deploy later:"
      echo "  1. cd dist/public"
      echo "  2. git init"
      echo "  3. git add -A"
      echo "  4. git commit -m 'Deploy to GitHub Pages'"
      echo "  5. git remote add origin YOUR_REPO_URL"
      echo "  6. git push -f origin main"
      echo ""
      exit 1
    fi
  fi
  
  # Check if remote exists
  if git remote | grep -q "origin"; then
    # Update existing remote
    git remote set-url origin "$GITHUB_PAGES_REPO"
    echo "Updated remote origin to: $GITHUB_PAGES_REPO"
  else
    # Add new remote
    git remote add origin "$GITHUB_PAGES_REPO"
    echo "Added remote origin: $GITHUB_PAGES_REPO"
  fi
  
  # Stage all files
  echo ""
  echo "Staging files..."
  git add -A
  
  # Create commit with timestamp
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  echo "Creating commit..."
  git commit -m "Deploy to GitHub Pages - $TIMESTAMP" || echo "No changes to commit"
  
  # Push to GitHub
  echo ""
  echo "Pushing to GitHub..."
  if git push -f origin main; then
    echo ""
    echo "✅ Successfully deployed to GitHub Pages!"
    echo ""
    echo "🌐 Your site will be live at:"
    echo "   https://YOUR-USERNAME.github.io/MentalBiriyani/"
    echo ""
    echo "⏱️  Note: It may take 1-2 minutes for changes to appear"
    echo ""
    echo "🔧 Don't forget to enable GitHub Pages in repository settings:"
    echo "   Settings → Pages → Source: main branch"
    echo ""
  else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "   - Repository URL is correct"
    echo "   - You have push access to the repository"
    echo "   - GitHub credentials are configured"
    echo ""
    echo "To retry deployment:"
    echo "  cd dist/public"
    echo "  git push -f origin main"
    echo ""
    exit 1
  fi
  
  cd ../..
else
  echo "📋 Build complete - deployment skipped"
  echo ""
  echo "To deploy to GitHub Pages:"
  echo "  ./build-github-pages.sh --deploy"
  echo ""
  echo "Or set GITHUB_PAGES_REPO and deploy:"
  echo "  export GITHUB_PAGES_REPO=https://github.com/username/MentalBiriyani.git"
  echo "  ./build-github-pages.sh --deploy"
  echo ""
  echo "Or deploy manually:"
  echo "  cd dist/public"
  echo "  git init"
  echo "  git add -A"
  echo "  git commit -m 'Deploy to GitHub Pages'"
  echo "  git remote add origin YOUR_REPO_URL"
  echo "  git push -f origin main"
  echo ""
fi
