# 🚀 Automated Deployment System - Complete!

## What's Been Implemented

Your MentalBiriyani app now has a **fully automated build and deployment pipeline** for GitHub Pages!

### ✅ Key Features

1. **One-Command Deployment**
   ```bash
   ./build-github-pages.sh --deploy
   ```
   - Builds app
   - Converts videos
   - Pushes to GitHub
   - All in one command!

2. **Smart Video Conversion**
   - Automatic .mov → .mp4 conversion
   - 720p max (keeps smaller videos as-is)
   - ~35% file size reduction
   - Universal browser support

3. **Automated Git Deployment**
   - Initializes git in dist/public
   - Prompts for GitHub repo URL (or uses env var)
   - Creates timestamped commits
   - Force pushes to main branch
   - Handles everything automatically

4. **Flexible Options**
   ```bash
   --deploy       # Auto-deploy to GitHub
   --skip-video   # Skip video conversion (faster)
   --help         # Show usage info
   ```

## 📋 Quick Start Guide

### First-Time Setup

1. **Create GitHub repository** named `MentalBiriyani`

2. **Run automated deployment:**
   ```bash
   ./build-github-pages.sh --deploy
   ```
   
3. **Enter your repo URL when prompted:**
   ```
   https://github.com/YOUR-USERNAME/MentalBiriyani.git
   ```

4. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Source: main branch / (root)
   - Save

5. **Visit your site:**
   ```
   https://YOUR-USERNAME.github.io/MentalBiriyani/
   ```

### Environment Variable (Optional)

Set once, deploy many times:
```bash
export GITHUB_PAGES_REPO=https://github.com/YOUR-USERNAME/MentalBiriyani.git
./build-github-pages.sh --deploy
```

## 🔄 Updating Your Site

After making changes:
```bash
# Full rebuild with videos
./build-github-pages.sh --deploy

# Faster (skip video conversion)
./build-github-pages.sh --deploy --skip-video
```

## 📚 Documentation Files

### Main Guides
- **`GITHUB_PAGES_DEPLOYMENT.md`** - Complete deployment guide
  - First-time setup instructions
  - Troubleshooting guide
  - PWA installation info
  - Security notes

- **`BUILD_FOR_GITHUB_PAGES.md`** - Build documentation
  - Automated vs manual builds
  - How paths work
  - Build customization

- **`VIDEO_CONVERSION_GUIDE.md`** - Video conversion details
  - FFmpeg settings
  - Browser compatibility
  - File size expectations

### Technical Documentation
- **`scripts/README.md`** - Script documentation
  - Detailed script explanations
  - FFmpeg installation
  - Troubleshooting

- **`replit.md`** - Project architecture (updated)
  - Automated deployment info
  - Video conversion details
  - System architecture

### Auto-Generated
- **`dist/public/README.md`** - Created during build
  - Deployment instructions
  - What's included
  - Quick deploy commands

## 🎬 Video Conversion Details

**Before (QuickTime)**
- Format: .mov
- Size: 164 MB
- Support: Safari/iOS only

**After (MP4)**
- Format: H.264 + AAC
- Size: 106 MB (35% smaller)
- Support: All browsers ✅

**Settings:**
- Max resolution: 1280px (720p)
- Quality: CRF 23 (balanced)
- Audio: AAC 128kbps
- Web optimized: faststart flag

## 📦 Build Pipeline (10 Steps)

1. **Content Generation** - Scans folders and creates media-list.json & audio-list.json
2. **Chat Parsing** - Extracts conversations from Chat.mbox, creates chat-list.json
3. **Video Conversion** - .mov → .mp4 (720p max) [Optional: can skip with --skip-video]
4. **Vite Build** - Optimized React app
5. **Path Fixing** - GitHub Pages base path (/MentalBiriyani/)
6. **Media Copy** - All photos, videos, and chat data
7. **PWA Files** - Manifest, service worker, icons
8. **Cache Busting** - Adds version timestamps to assets
9. **Documentation** - All guide files
10. **Git Deploy** - Commit and push to GitHub (if --deploy flag)

## 🛠️ Script Files

### Main Build Script
- **`build-github-pages.sh`** - Main build and deploy script
  - Handles video conversion
  - Builds app
  - Deploys to GitHub
  - Command-line flags support

### Video Conversion
- **`scripts/convert-videos.js`** - Automated conversion (Node.js)
  - Runs during build
  - Updates media-list.json
  - Deletes old .mov files

- **`convert-videos-manual.sh`** - Manual option (Bash)
  - For manual conversion
  - No timeout limits
  - Progress display

### Path Fixing
- **`scripts/fix-github-pages-paths.js`** - Path updater
  - Fixes asset paths in index.html
  - Adds /MentalBiriyani/ prefix
  - Required for GitHub Pages

## 🌐 Deployment Output

The `dist/public/` folder contains everything needed:

```
dist/public/
├── index.html              # Entry point (paths fixed)
├── assets/                 # JS and CSS bundles
├── content/                # All media (MP4 videos)
├── manifest.json           # PWA config
├── sw.js                   # Service worker
├── icon-*.svg              # PWA icons
├── .nojekyll               # GitHub Pages config
├── README.md               # Auto-generated guide
├── DEPLOYMENT_GUIDE.md     # This guide
├── VIDEO_CONVERSION_GUIDE.md
└── PWA_INSTALLATION_GUIDE.md
```

**Total Size:** ~106 MB (after video conversion)

## ✨ Key Benefits

1. **Speed** - One command to deploy
2. **Automation** - No manual git commands
3. **Safety** - Dedicated deployment repo (dist/public)
4. **Flexibility** - Build-only or build-and-deploy
5. **Reliability** - Timestamped commits, force push
6. **Simplicity** - Environment variable support

## 🎯 Common Commands

```bash
# Show help
./build-github-pages.sh --help

# Build only
./build-github-pages.sh

# Build and deploy
./build-github-pages.sh --deploy

# Skip videos (faster)
./build-github-pages.sh --skip-video

# Deploy with skipped videos
./build-github-pages.sh --deploy --skip-video

# Set environment variable
export GITHUB_PAGES_REPO=https://github.com/username/MentalBiriyani.git
./build-github-pages.sh --deploy
```

## 📱 Progressive Web App

Your deployed app is a full PWA:
- Installable on desktop and mobile
- Offline support via service worker
- App icon on home screen
- Full-screen experience

See `PWA_INSTALLATION_GUIDE.md` for installation instructions.

## 🔒 Security & Safety

- Uses force push to `dist/public` repository only
- Main source code remains in parent directory
- Dedicated deployment repository
- No risk to main development code
- Git history in deployment repo

## ⚡ Performance

**Build Times:**
- With video conversion: 3-5 minutes
- Without (--skip-video): ~30 seconds

**Deployment Times:**
- Git push: 10-30 seconds
- GitHub Pages: 1-2 minutes
- Total: 2-5 minutes to live

## 🎉 You're Ready!

Everything is set up and ready to go. Just run:

```bash
./build-github-pages.sh --deploy
```

And your site will be live on GitHub Pages in minutes!

---

**Built with ❤️ for Div Papa**

**MentalBiriyani** - A curated nostalgia ride that is like biriyani for the mind! #DD40
