#!/bin/bash

# GitHub Pages Build & Deploy Script for MentalBiriyani
# This script builds the app and optionally deploys to GitHub Pages

set -e  # Exit on error

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

# Generate content lists
echo "📋 Step 1/10: Generating content lists..."
node scripts/generate-content-lists.js
echo ""

# Parse chat conversations
echo "💬 Step 2/10: Parsing chat conversations..."
node scripts/parse-chat.js
echo ""

# Convert videos to MP4 (720p max)
if [ "$SKIP_VIDEO" = false ]; then
  echo "🎬 Step 3/10: Converting videos to MP4..."
  if node scripts/convert-videos.js; then
    echo "✓ Video conversion complete"
  else
    echo "⚠️  Video conversion failed or skipped"
    echo "   Videos will be used as-is (.mov format)"
    echo "   For universal browser support, install FFmpeg and run again"
  fi
  echo ""
else
  echo "⏭️  Step 3/10: Skipping video conversion (--skip-video flag)"
  echo ""
fi

# Build the app
echo "📦 Step 4/10: Building app with Vite..."
npm run build
echo ""

# Fix paths for GitHub Pages
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
echo "🔧 Step 2/5: Fixing asset paths..."
=======
echo "🔧 Step 3/8: Fixing asset paths..."
>>>>>>> d9f894a (Improve asset loading on GitHub Pages with cache-busting)
=======
echo "🔧 Step 4/9: Fixing asset paths..."
>>>>>>> d5031da (Add dynamic content loading and improve build process)
=======
echo "🔧 Step 5/10: Fixing asset paths..."
>>>>>>> c46769e (Add chat conversations to the library view)
node scripts/fix-github-pages-paths.js
echo ""

# Copy content folder
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
echo "📁 Step 3/5: Copying media files..."
=======
echo "📁 Step 5/8: Copying media files..."
>>>>>>> d9f894a (Improve asset loading on GitHub Pages with cache-busting)
=======
echo "📁 Step 4/8: Copying media files..."
>>>>>>> f838057 (Improve how assets are cached to prevent stale content)
=======
echo "📁 Step 5/9: Copying media files..."
>>>>>>> d5031da (Add dynamic content loading and improve build process)
=======
echo "📁 Step 6/10: Copying media files..."
>>>>>>> c46769e (Add chat conversations to the library view)
cp -r client/public/content dist/public/
echo ""

# Copy PWA files
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
echo "📱 Step 4/5: Copying PWA configuration..."
=======
echo "📱 Step 6/8: Copying PWA configuration..."
>>>>>>> d9f894a (Improve asset loading on GitHub Pages with cache-busting)
=======
echo "📱 Step 5/8: Copying PWA configuration..."
>>>>>>> f838057 (Improve how assets are cached to prevent stale content)
=======
echo "📱 Step 6/9: Copying PWA configuration..."
>>>>>>> d5031da (Add dynamic content loading and improve build process)
=======
echo "📱 Step 7/10: Copying PWA configuration..."
>>>>>>> c46769e (Add chat conversations to the library view)
cp client/public/manifest.json client/public/sw.js dist/public/
cp client/public/icon-*.svg dist/public/
touch dist/public/.nojekyll
echo ""

# Add cache-busting version parameters (AFTER copying files)
echo "🔄 Step 8/10: Adding cache-busting version..."
node scripts/add-cache-busting.js
echo ""

# Copy documentation
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
echo "📚 Step 5/5: Copying documentation..."
cp DEPLOYMENT_PACKAGE.md GITHUB_PAGES_DEPLOYMENT.md PWA_INSTALLATION_GUIDE.md dist/public/
=======
echo "📚 Step 7/8: Copying documentation..."
=======
echo "📚 Step 8/9: Copying documentation..."
>>>>>>> d5031da (Add dynamic content loading and improve build process)
=======
echo "📚 Step 9/10: Copying documentation..."
>>>>>>> c46769e (Add chat conversations to the library view)
cp BUILD_FOR_GITHUB_PAGES.md dist/public/DEPLOYMENT_GUIDE.md 2>/dev/null || true
cp VIDEO_CONVERSION_GUIDE.md dist/public/ 2>/dev/null || true
cp PWA_INSTALLATION_GUIDE.md dist/public/ 2>/dev/null || true
echo ""
>>>>>>> d9f894a (Improve asset loading on GitHub Pages with cache-busting)

echo ""

echo "✅ Build complete!"
echo ""
echo "📦 Package location: dist/public/"
echo "📊 Total size: $(du -sh dist/public | cut -f1)"
echo ""

# Deploy to GitHub Pages if requested
if [ "$AUTO_DEPLOY" = true ]; then
  echo "🚀 Step 10/10: Deploying to GitHub Pages..."
  echo ""
  
  cd dist/public
  
  # Check if git repo exists
  if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git branch -M main
  fi
  
  # Get GitHub repo URL from environment variable or use default
  if [ -z "$GITHUB_PAGES_REPO" ]; then
    # Use default repository
    GITHUB_PAGES_REPO="https://github.com/araghunathan99/MentalBiriyani.git"
    echo ""
    echo "📝 Using default GitHub repository: $GITHUB_PAGES_REPO"
    echo "   (Set GITHUB_PAGES_REPO environment variable to override)"
    echo ""
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
