# Building MentalBiriyani for GitHub Pages

This guide explains how to build and deploy the MentalBiriyani app to GitHub Pages at `https://YOUR-USERNAME.github.io/MentalBiriyani/`.

## 🚀 Quick Deploy (Automated)

The easiest way to build and deploy:

```bash
# Build and deploy in one command
./build-github-pages.sh --deploy

# Or with environment variable
export GITHUB_PAGES_REPO=https://github.com/username/MentalBiriyani.git
./build-github-pages.sh --deploy
```

This will:
1. ✅ Generate content lists for dynamic media loading
2. ✅ Parse chat conversations from MBOX file
3. ✅ Convert videos to MP4 (720p max, universal browser support)
4. ✅ Build optimized React app
5. ✅ Fix asset paths for GitHub Pages
6. ✅ Copy all media files and chat data
7. ✅ Copy PWA configuration files
8. ✅ Add cache-busting version parameters
9. ✅ Copy documentation files
10. ✅ Initialize git repository and deploy (if --deploy flag used)

## 📋 Build Options

```bash
# Show help
./build-github-pages.sh --help

# Build only (no deployment)
./build-github-pages.sh

# Build and deploy
./build-github-pages.sh --deploy

# Skip video conversion (faster builds)
./build-github-pages.sh --skip-video

# Combine flags
./build-github-pages.sh --deploy --skip-video
```

## 🛠️ Manual Build (Advanced)

If you prefer to build manually:

```bash
# 1. Generate content lists
node scripts/generate-content-lists.js

# 2. Parse chat conversations
node scripts/parse-chat.js

# 3. Convert videos (optional but recommended)
node scripts/convert-videos.js

# 4. Build the app
npm run build

# 5. Fix paths for GitHub Pages
node scripts/fix-github-pages-paths.js

# 6. Copy media files to dist/public
cp -r client/public/content dist/public/

# 7. Copy PWA configuration
cp client/public/manifest.json client/public/sw.js dist/public/
cp client/public/icon-*.svg dist/public/
touch dist/public/.nojekyll

# 8. Add cache-busting version
node scripts/add-cache-busting.js

# 9. Copy documentation
cp BUILD_FOR_GITHUB_PAGES.md dist/public/DEPLOYMENT_GUIDE.md
cp VIDEO_CONVERSION_GUIDE.md dist/public/
cp PWA_INSTALLATION_GUIDE.md dist/public/
```

The deployable package will be in `dist/public/`.

## What Gets Built

### 1. Vite Build (`npm run build`)
- Compiles React app with TypeScript
- Bundles JavaScript (~310 KB)
- Bundles CSS (~74 KB)
- Generates optimized assets
- Outputs to `dist/public/`

**Note**: Vite generates paths like `/assets/...` which need to be fixed for GitHub Pages.

### 2. Path Fix Script (`node scripts/fix-github-pages-paths.js`)
This script updates `dist/public/index.html` to use the correct base path:

**Before** (from Vite):
```html
<script src="/assets/index-*.js"></script>
<link href="/assets/index-*.css">
```

**After** (fixed for GitHub Pages):
```html
<script src="/MentalBiriyani/assets/index-*.js"></script>
<link href="/MentalBiriyani/assets/index-*.css">
```

### 3. Content & Config Files
- `content/` folder (178 media items)
- `manifest.json` (PWA manifest)
- `sw.js` (service worker)
- `.nojekyll` (prevents Jekyll processing)

### 4. Documentation Files (Optional)
- `DEPLOYMENT_PACKAGE.md`
- `GITHUB_PAGES_DEPLOYMENT.md`
- `PWA_INSTALLATION_GUIDE.md`
- `README.md` (auto-generated in dist/public)

## How Paths Work

### Development (Local)
When running `npm run dev`:
- Base path: `/` (root)
- Assets: `/assets/...`
- Content: `/content/...`
- Routes: `/`, `/home`, `/share/:id`

**Handled by**:
- `basePath.ts`: Returns empty string in development
- Wouter router: Uses empty base path

### Production (GitHub Pages)
When deployed to `https://USERNAME.github.io/MentalBiriyani/`:
- Base path: `/MentalBiriyani/`
- Assets: `/MentalBiriyani/assets/...` (fixed by script)
- Content: `/MentalBiriyani/content/...` (via basePath.ts)
- Routes: `/MentalBiriyani/`, `/MentalBiriyani/home`, `/MentalBiriyani/share/:id`

**Handled by**:
- `basePath.ts`: Returns `/MentalBiriyani` in production
- Post-build script: Fixes index.html asset paths
- Wouter router: Uses `/MentalBiriyani` base path

## Key Files

### Client-side Path Management
```typescript
// client/src/lib/basePath.ts
export function getBasePath(): string {
  return import.meta.env.PROD ? '/MentalBiriyani' : '';
}

export function getFullPath(path: string): string {
  const base = getBasePath();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}/${cleanPath}`;
}
```

Used in:
- `client/src/lib/localMedia.ts` - For loading media files
- `client/src/App.tsx` - For router base path

### Build Script
```javascript
// scripts/fix-github-pages-paths.js
// Replaces /assets/ with /MentalBiriyani/assets/ in index.html
```

## Building for Different Deployment Paths

### For Different Repository Name
If deploying to `https://USERNAME.github.io/my-app/`:

1. Update `client/src/lib/basePath.ts`:
   ```typescript
   return import.meta.env.PROD ? '/my-app' : '';
   ```

2. Update `scripts/fix-github-pages-paths.js`:
   ```javascript
   content = content.replace(/src="\/assets\//g, 'src="/my-app/assets/');
   content = content.replace(/href="\/assets\//g, 'href="/my-app/assets/');
   ```

3. Rebuild:
   ```bash
   npm run build
   node scripts/fix-github-pages-paths.js
   # ... copy files as usual
   ```

### For Root Deployment
If deploying to `https://USERNAME.github.io/` (user/org pages):

1. Update `client/src/lib/basePath.ts`:
   ```typescript
   return ''; // Always use root path
   ```

2. Skip the path fix script (not needed)

3. Rebuild:
   ```bash
   npm run build
   # ... copy files as usual
   ```

## Verification Checklist

After building, verify:

- [ ] `dist/public/index.html` has `/MentalBiriyani/assets/...` paths
- [ ] `dist/public/content/` folder exists (178 items)
- [ ] `dist/public/manifest.json` exists
- [ ] `dist/public/sw.js` exists
- [ ] `dist/public/.nojekyll` exists
- [ ] Total package size is ~184 MB

## Troubleshooting

### Issue: Assets still use `/assets/` paths
**Cause**: Forgot to run the fix script  
**Solution**: Run `node scripts/fix-github-pages-paths.js`

### Issue: Content folder missing
**Cause**: Forgot to copy content folder  
**Solution**: Run `cp -r client/public/content dist/public/`

### Issue: 404 on deployed site
**Cause**: Wrong base path or missing files  
**Solution**: Verify paths in index.html and check GitHub Pages settings

### Issue: Service worker not registering
**Cause**: Missing sw.js or manifest.json  
**Solution**: Run `cp client/public/manifest.json client/public/sw.js dist/public/`

## 🎯 Automated Deployment Features

The `build-github-pages.sh` script includes powerful automation:

### Video Conversion
- Automatically converts `.mov` videos to `.mp4` format
- Reduces file size by ~35% (164MB → 106MB)
- Ensures universal browser compatibility
- Can be skipped with `--skip-video` flag for faster builds

### Git Deployment
- Initializes git repository in `dist/public` (if needed)
- Configures GitHub remote automatically
- Creates timestamped commits
- Force pushes to GitHub Pages repository
- Handles both new and existing repositories

### Environment Variable Support
Set once, deploy many times:
```bash
# Add to ~/.bashrc or ~/.zshrc
export GITHUB_PAGES_REPO=https://github.com/username/MentalBiriyani.git

# Then simply run
./build-github-pages.sh --deploy
```

### Command Line Options
```bash
--deploy       # Auto-deploy to GitHub after build
--skip-video   # Skip video conversion (faster builds)
--help         # Show usage information
```

## 📝 First-Time Deployment

### 1. Create GitHub Repository
Create a new repository on GitHub named `MentalBiriyani` (or any name).

### 2. Run Automated Deployment
```bash
# Option 1: Interactive (will prompt for repo URL)
./build-github-pages.sh --deploy

# Option 2: With environment variable
export GITHUB_PAGES_REPO=https://github.com/username/MentalBiriyani.git
./build-github-pages.sh --deploy
```

### 3. Enable GitHub Pages
1. Go to your repository on GitHub
2. Navigate to **Settings → Pages**
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**

### 4. Access Your Site
Your site will be live at:
```
https://YOUR-USERNAME.github.io/MentalBiriyani/
```

**Note**: It may take 1-2 minutes for the site to be available.

## 🔄 Updating Your Site

After making changes to content or code:

```bash
# Quick update with deployment
./build-github-pages.sh --deploy

# Or skip video conversion if videos haven't changed
./build-github-pages.sh --deploy --skip-video
```

The script will:
- Build your changes
- Convert any new videos
- Commit with timestamp
- Push to GitHub
- Update your live site automatically

## 🛠️ Manual Deployment (Alternative)

If you prefer manual control:

```bash
# 1. Build
./build-github-pages.sh

# 2. Navigate to build folder
cd dist/public

# 3. Initialize git (first time only)
git init
git branch -M main

# 4. Add remote (first time only)
git remote add origin https://github.com/username/MentalBiriyani.git

# 5. Commit and push
git add -A
git commit -m "Deploy to GitHub Pages"
git push -f origin main
```

## 📚 What Gets Deployed

The `dist/public/` folder contains:
- **index.html** - Main app entry point (paths fixed for GitHub Pages)
- **assets/** - Optimized JS and CSS bundles
- **content/** - All media files (photos and MP4 videos)
- **manifest.json** - PWA configuration
- **sw.js** - Service worker for offline support
- **icon-*.svg** - PWA icons
- **.nojekyll** - Prevents Jekyll processing
- **README.md** - Deployment documentation
- **DEPLOYMENT_GUIDE.md** - This guide
- **VIDEO_CONVERSION_GUIDE.md** - Video conversion docs
- **PWA_INSTALLATION_GUIDE.md** - PWA installation guide

---

**Built with ❤️ for Div Papa**
