#!/bin/bash

# Deploy to GitHub Pages using git commands
# This avoids GitHub API rate limits by using standard git operations

set -e

echo "🚀 Deploying to GitHub Pages..."
echo ""

# Check if dist/public exists
if [ ! -d "dist/public" ]; then
  echo "❌ Error: dist/public directory not found"
  echo "   Please run the build script first: ./build-github-pages.sh"
  exit 1
fi

# Get repository info from environment or use default
REPO_OWNER="${GITHUB_REPO_OWNER:-araghunathan99}"
REPO_NAME="${GITHUB_REPO_NAME:-MentalBiriyani}"
REPO_URL="${GITHUB_PAGES_REPO:-https://github.com/${REPO_OWNER}/${REPO_NAME}.git}"
BRANCH="main"

echo "📦 Repository: ${REPO_OWNER}/${REPO_NAME}"
echo "🌿 Branch: ${BRANCH}"
echo "🔗 URL: ${REPO_URL}"
echo ""

# Navigate to dist/public
cd dist/public

# Check if git repo exists
if [ ! -d ".git" ]; then
  echo "📁 Initializing git repository..."
  git init
  git branch -M ${BRANCH}
  echo "✓ Git repository initialized"
else
  echo "✓ Git repository already exists"
fi

# Check if remote exists
if git remote | grep -q "origin"; then
  # Update existing remote
  git remote set-url origin "${REPO_URL}"
  echo "✓ Updated remote origin to: ${REPO_URL}"
else
  # Add new remote
  git remote add origin "${REPO_URL}"
  echo "✓ Added remote origin: ${REPO_URL}"
fi

echo ""
echo "📋 Staging files..."
git add -A

# Check if there are changes to commit
if git diff --cached --quiet; then
  echo "⚠️  No changes to commit"
  cd ../..
  exit 0
fi

# Create commit with timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "💾 Creating commit..."
git commit -m "Deploy to GitHub Pages - ${TIMESTAMP}"
echo "✓ Commit created"

echo ""
echo "📤 Pushing to GitHub..."
echo "   This may take a moment for large files..."
echo ""

# Push to GitHub
if git push -f origin ${BRANCH}; then
  echo ""
  echo "✅ Successfully deployed to GitHub Pages!"
  echo ""
  echo "🌐 Your site will be live at:"
  echo "   https://${REPO_OWNER}.github.io/${REPO_NAME}/"
  echo ""
  echo "⏱️  Note: It may take 1-2 minutes for changes to appear"
  echo ""
  echo "🔧 Make sure GitHub Pages is enabled in repository settings:"
  echo "   Settings → Pages → Source: ${BRANCH} branch → Save"
  echo ""
else
  echo ""
  echo "❌ Push failed. Please check:"
  echo "   - Repository URL is correct: ${REPO_URL}"
  echo "   - You have push access to the repository"
  echo "   - GitHub credentials are configured"
  echo ""
  echo "💡 To configure GitHub credentials:"
  echo "   git config --global user.name 'Your Name'"
  echo "   git config --global user.email 'your.email@example.com'"
  echo ""
  echo "   You may also need to authenticate:"
  echo "   - Use SSH: git@github.com:${REPO_OWNER}/${REPO_NAME}.git"
  echo "   - Or use Personal Access Token for HTTPS"
  echo ""
  cd ../..
  exit 1
fi

cd ../..
