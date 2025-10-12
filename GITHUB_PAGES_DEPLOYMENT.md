# GitHub Pages Deployment Guide

Complete guide for deploying MentalBiriyani to GitHub Pages.

## 🚀 Quick Start (Automated Deployment)

The easiest way to deploy:

```bash
# One command to build and deploy
./build-github-pages.sh --deploy
```

The script will:
1. ✅ Convert videos to MP4 (universal browser support)
2. ✅ Build optimized app
3. ✅ Initialize git repository
4. ✅ Prompt for GitHub repository URL
5. ✅ Push to GitHub automatically
6. ✅ Display deployment status

## 📋 Prerequisites

1. **GitHub Account** - Create one at [github.com](https://github.com)
2. **GitHub Repository** - Create a new repo named `MentalBiriyani`
3. **Git Configured** - Set up git credentials locally

## 🎯 First-Time Deployment

### Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `MentalBiriyani` (or your preferred name)
3. Set to **Public** (required for free GitHub Pages)
4. Don't initialize with README (we'll push our own)
5. Click **Create repository**

### Step 2: Run Automated Deployment

**Option A: Interactive (Recommended for first time)**
```bash
./build-github-pages.sh --deploy
```
The script will prompt you for the repository URL.

**Option B: With Environment Variable**
```bash
export GITHUB_PAGES_REPO=https://github.com/YOUR-USERNAME/MentalBiriyani.git
./build-github-pages.sh --deploy
```

**Option C: Manual Git Setup**
```bash
# Build first
./build-github-pages.sh

# Then manually deploy
cd dist/public
git init
git branch -M main
git add -A
git commit -m "Initial deploy to GitHub Pages"
git remote add origin https://github.com/YOUR-USERNAME/MentalBiriyani.git
git push -f origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
<<<<<<< HEAD
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

### Step 4: Access Your Site

Your site will be live at:
```
https://YOUR-USERNAME.github.io/MentalBiriyani/
```

**Note**: Initial deployment takes 1-2 minutes. Subsequent updates are faster.

## 🔄 Updating Your Site

After making changes to content or code:

```bash
# Quick update (with video conversion)
./build-github-pages.sh --deploy

# Faster update (skip video conversion if unchanged)
./build-github-pages.sh --deploy --skip-video
```

The script will:
- Rebuild your app
- Convert any new videos
- Commit changes with timestamp
- Push to GitHub
- Update live site automatically

## 🛠️ Build Script Options

```bash
# Show all options
./build-github-pages.sh --help

# Build only (no deployment)
./build-github-pages.sh

# Build and deploy
./build-github-pages.sh --deploy

# Skip video conversion (faster)
./build-github-pages.sh --skip-video

# Combine flags
./build-github-pages.sh --deploy --skip-video
```

## 🌐 Environment Variables

Set once for easier deployments:

```bash
# Add to ~/.bashrc or ~/.zshrc
export GITHUB_PAGES_REPO=https://github.com/YOUR-USERNAME/MentalBiriyani.git

# Reload shell config
source ~/.bashrc  # or source ~/.zshrc

# Now deploy without prompts
./build-github-pages.sh --deploy
```

## 📦 What Gets Deployed

The deployment package (`dist/public/`) includes:

### Core Application
- **index.html** - Entry point (paths configured for GitHub Pages)
- **assets/** - Optimized JavaScript (~310KB) and CSS (~74KB)
- **content/** - All photos and videos (MP4 format)

### Progressive Web App (PWA)
- **manifest.json** - App metadata for installation
- **sw.js** - Service worker for offline support
- **icon-192x192.svg** - App icon (192px)
- **icon-512x512.svg** - App icon (512px)

### Configuration
- **.nojekyll** - Prevents Jekyll processing on GitHub Pages
- **README.md** - Deployment documentation

### Documentation (Optional)
- **DEPLOYMENT_GUIDE.md** - This guide
- **VIDEO_CONVERSION_GUIDE.md** - Video conversion details
- **PWA_INSTALLATION_GUIDE.md** - PWA installation instructions

**Total Size**: ~106 MB (after video conversion)

## 🎬 Video Conversion

Videos are automatically converted during build:

**Before (QuickTime .mov)**
- Format: QuickTime
- Browser support: Safari/iOS only
- Total size: ~164 MB

**After (MP4 .mp4)**
- Format: H.264 + AAC
- Browser support: All browsers ✅
- Total size: ~106 MB
- Quality: 720p max (or original if smaller)

**Conversion Settings:**
- Video codec: H.264 (libx264)
- Audio codec: AAC at 128kbps
- Max resolution: 1280px (720p)
- Preset: fast (good quality/speed balance)
- Web optimization: faststart flag

## 🔧 Troubleshooting

### Issue: "Permission denied" on script
**Solution:**
```bash
chmod +x build-github-pages.sh
./build-github-pages.sh --deploy
```

### Issue: "Repository not found" on push
**Causes:**
- Wrong repository URL
- Repository is private (GitHub Pages requires public repo for free tier)
- No push access

**Solution:**
1. Verify repository exists and is public
2. Check repository URL is correct
3. Ensure git credentials are configured:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your@email.com"
   ```

### Issue: Site shows 404 after deployment
**Causes:**
- GitHub Pages not enabled
- Wrong source branch/folder selected

**Solution:**
1. Go to Settings → Pages
2. Verify Source is set to `main` branch, `/ (root)` folder
3. Wait 1-2 minutes for deployment
4. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Videos don't play on some browsers
**Causes:**
- Videos still in .mov format (not converted)
- Video conversion skipped

**Solution:**
```bash
# Rebuild with video conversion
./build-github-pages.sh --deploy
```

### Issue: Site works locally but not on GitHub Pages
**Causes:**
- Paths not fixed for GitHub Pages
- Missing base path configuration

**Solution:**
1. Verify `dist/public/index.html` has `/MentalBiriyani/` paths
2. Rebuild:
   ```bash
   ./build-github-pages.sh --deploy
   ```

### Issue: "FFmpeg not found" during build
**Solution:**
FFmpeg is already installed on this Replit. If error persists:
```bash
# Skip video conversion
./build-github-pages.sh --deploy --skip-video
```

### Issue: Push fails with "authentication required"
**Solutions:**

**Option 1: Use Personal Access Token (Recommended)**
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when prompted

**Option 2: Use SSH**
```bash
# Change to SSH URL
export GITHUB_PAGES_REPO=git@github.com:YOUR-USERNAME/MentalBiriyani.git
./build-github-pages.sh --deploy
```

## 📱 Progressive Web App (PWA)

Your deployed app can be installed as a PWA:

### Desktop (Chrome/Edge)
1. Visit your deployed site
2. Click install icon in address bar
3. Or: Menu → Install MentalBiriyani

### Mobile (iOS Safari)
1. Visit your deployed site
2. Tap Share button
3. Scroll down → "Add to Home Screen"
4. Tap "Add"

### Mobile (Android Chrome)
1. Visit your deployed site
2. Tap menu (⋮)
3. Tap "Install app" or "Add to Home screen"

**Benefits:**
- ✅ Offline access
- ✅ Full-screen experience
- ✅ App icon on home screen
- ✅ Faster load times

See `PWA_INSTALLATION_GUIDE.md` for detailed instructions.

## 🔒 Security Notes

- The deployment uses `git push -f` (force push) to `dist/public` repository
- This is safe because `dist/public` is a dedicated deployment repository
- Your main source code remains in the parent directory
- Never force push to your main development repository

## 📊 Performance

**Build Time:**
- With video conversion: ~3-5 minutes
- Without video conversion (`--skip-video`): ~30 seconds

**Deployment Time:**
- Git push: ~10-30 seconds (depends on file size)
- GitHub Pages processing: ~1-2 minutes
- Total: ~2-5 minutes for changes to be live

**Optimization Tips:**
- Use `--skip-video` flag if videos haven't changed
- Videos are only converted once (skipped if .mp4 exists)
- Incremental builds are much faster

## 📚 Additional Resources

- **BUILD_FOR_GITHUB_PAGES.md** - Detailed build documentation
- **VIDEO_CONVERSION_GUIDE.md** - Video conversion guide
- **scripts/README.md** - Script documentation
- **PWA_INSTALLATION_GUIDE.md** - PWA installation guide

## ℹ️ About MentalBiriyani

**MentalBiriyani** - A curated nostalgia ride that is like biriyani for the mind! #DD40

An Instagram Reels-inspired mobile web app featuring:
- Full-screen media feed with swipe navigation
- Grid library with photo/video filtering
- Like functionality (stored locally)
- Share individual items via URL
- Progressive Web App (installable)
- Dark-first design optimized for media

Built with ❤️ for Div Papa

---

**Need Help?**
- Check troubleshooting section above
- Review `BUILD_FOR_GITHUB_PAGES.md` for detailed build info
- See `VIDEO_CONVERSION_GUIDE.md` for video issues
=======
2. Click **Settings** → **Pages** (in left sidebar)
3. Under "Source", select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
4. Click **Save**
5. Wait 1-2 minutes for deployment

### Step 4: Access Your Site

Your site will be available at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

## 📱 Installing as PWA on Mobile

### iOS (iPhone/iPad)

1. **Open in Safari** (must use Safari, not Chrome)
   - Navigate to your GitHub Pages URL
   
2. **Add to Home Screen**:
   - Tap the **Share** button (square with arrow pointing up)
   - Scroll down and tap **"Add to Home Screen"**
   - Edit the name if you want (default: "Drive Reels")
   - Tap **Add** in the top right

3. **Launch the PWA**:
   - Go to your home screen
   - Tap the Drive Reels icon
   - The app will open in full-screen mode without browser UI

**Note**: On iOS, PWAs have some limitations compared to native apps, but the core functionality works great!

### Android

1. **Open in Chrome** (recommended)
   - Navigate to your GitHub Pages URL
   
2. **Install the PWA** (two methods):

   **Method 1 - Automatic Prompt**:
   - Chrome may show an "Install" banner at the bottom
   - Tap **Install** → **Install** to confirm

   **Method 2 - Manual Install**:
   - Tap the **menu** (three dots in top right)
   - Select **"Add to Home screen"** or **"Install app"**
   - Tap **Install** to confirm

3. **Launch the PWA**:
   - Find the Drive Reels icon in your app drawer or home screen
   - Tap to open in standalone mode

## 🎨 Customizing Your Deployment

### Update App Name and Colors

Edit `manifest.json` before deploying:

```json
{
  "name": "Your Custom Name",
  "short_name": "Custom",
  "description": "Your custom description",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait"
}
```

### Add Custom Media

1. Place your media files in the `content/` folder
2. Update `content/media-list.json`:
   - Increment the `version` field
   - Add your media items to the `items` array
   - Follow the existing format

Example:
```json
{
  "version": "1.3.0",
  "lastModified": "2025-10-09T12:00:00.000Z",
  "items": [
    {
      "id": "your-id",
      "name": "Your Photo",
      "file": "your-photo.jpg",
      "mimeType": "image/jpeg",
      "createdTime": "2025-10-09T00:00:00.000Z",
      "modifiedTime": "2025-10-09T00:00:00.000Z"
    }
  ]
}
```

### Custom Domain (Optional)

1. Buy a domain (e.g., from Namecheap, Google Domains)
2. In your GitHub repo settings → Pages:
   - Enter your custom domain
   - Enable "Enforce HTTPS"
3. Configure DNS at your domain provider:
   - Add CNAME record pointing to `YOUR_USERNAME.github.io`

## 🔧 Troubleshooting

### Site Not Loading

- **Wait 2-5 minutes** after enabling GitHub Pages
- **Check Settings → Pages** shows "Your site is live at..."
- **Clear browser cache** and try again
- **Verify branch** is set to `main` and folder is `/root`

### PWA Not Installing on iOS

- **Must use Safari** (iOS PWAs only work in Safari)
- **Check manifest.json** is present in the root
- **Enable JavaScript** in Safari settings

### PWA Not Installing on Android

- **Use Chrome or Edge** (best support)
- **Check HTTPS** - GitHub Pages uses HTTPS automatically
- **Manifest must be valid** - check browser console for errors

### Media Not Loading

- **Verify paths** in media-list.json match actual filenames
- **Check file sizes** - GitHub has 100MB file limit (use Git LFS for larger files)
- **Increment version** in media-list.json to clear cache

### Large Repository Size

If your media files exceed GitHub's limits:

1. **Use Git LFS** (Large File Storage):
   ```bash
   git lfs install
   git lfs track "*.mov"
   git lfs track "*.mp4"
   git add .gitattributes
   git commit -m "Track large files with Git LFS"
   ```

2. **Or host media elsewhere**:
   - Upload to a CDN or cloud storage
   - Update URLs in media-list.json

## 🎉 Success!

Your Drive Reels app is now:
- ✅ Deployed on GitHub Pages
- ✅ Accessible from any device
- ✅ Installable as a PWA on mobile
- ✅ Works offline after first load

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

---

**Need Help?** Check the troubleshooting section or open an issue on GitHub.
>>>>>>> 0a0d563 (Add deployment guide and PWA setup instructions for GitHub Pages)
