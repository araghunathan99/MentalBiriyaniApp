# MentalBiriyani - GitHub Pages Deployment Package

**A curated nostalgia ride that is like biriyani for the soul! #DD40**

This is the complete, ready-to-deploy static website for MentalBiriyani, configured for GitHub Pages deployment.

## 🚀 Quick Deploy to GitHub Pages

### Option 1: Deploy to Repository Named "MentalBiriyani" (Recommended)

This package is pre-configured to work at the URL: `https://YOUR-USERNAME.github.io/MentalBiriyani/`

1. Create a new **public** repository on GitHub named **`MentalBiriyani`**
2. Navigate to this folder: `cd dist/public`
3. Initialize git and push:
```bash
git init
git add .
git commit -m "Deploy MentalBiriyani"
git remote add origin https://github.com/YOUR-USERNAME/MentalBiriyani.git
git branch -M main
git push -u origin main
```
4. Enable GitHub Pages:
   - Go to repository **Settings** → **Pages**
   - Source: Branch `main`, Folder `/ (root)`
   - Click **Save**
5. Your site will be live at: `https://YOUR-USERNAME.github.io/MentalBiriyani/`

### Option 2: Deploy to Different Repository Name

If you want to use a different repository name, you'll need to update the base path:

1. Open `assets/index-*.js` (the main JavaScript file)
2. Find and replace `/MentalBiriyani` with `/YOUR-REPO-NAME`
3. Follow the deployment steps above with your repository name

### Option 3: Deploy to User/Organization GitHub Pages

For deployment at `https://YOUR-USERNAME.github.io/` (without repo path):

1. Create repository named **`YOUR-USERNAME.github.io`**
2. You'll need to rebuild the app without the base path (contact developer)
3. Deploy using the same steps as above

## 📦 What's Included

- ✅ Complete static website (178 media items: 173 photos + 5 videos)
- ✅ PWA support with offline functionality
- ✅ Service worker for caching
- ✅ All documentation guides
- ✅ Configured for `/MentalBiriyani/` base path
- ✅ Ready for immediate deployment

## ✨ Recent Updates

### Path Configuration
- ✅ Configured base path: `/MentalBiriyani/`
- ✅ All routes work correctly with subdirectory deployment
- ✅ Relative paths for manifest and service worker
- ✅ Wouter router with dynamic base path

### Features
- ✨ Golden yellow landing page subtitle: "Mental Biriyani - A curated nostalgia ride that is like biriyani for the soul! #DD40"
- 🎮 Library viewer with swipe (mobile) and arrow key (web) navigation
- ⭐ Favorite sorting - liked items bubble to top in all views
- 🎨 Back button in top-left corner
- 🧹 Clean, minimal interface

## 🎯 Core Features

- 🎲 Randomized Reels feed (Fisher-Yates shuffle)
- 📚 Grid Library with filters (All/Photos/Videos)
- ⭐ Smart favorite sorting (localStorage)
- 🎮 Multi-input navigation (swipe, arrow keys, click)
- 💾 Offline support via service worker
- 📱 PWA installable on all devices
- 🔗 Shareable URLs for individual media

## 📁 Package Structure

```
dist/public/
├── index.html                    # Main app entry
├── manifest.json                 # PWA manifest (relative paths)
├── sw.js                         # Service worker (relative paths)
├── .nojekyll                     # GitHub Pages config
├── assets/                       # JS & CSS bundles
│   ├── index-*.css              # Styles (~74 KB)
│   └── index-*.js               # App bundle (~310 KB)
├── content/                      # Media library
│   ├── media-list.json          # Media catalog (v1.2.0)
│   ├── *.jpeg                   # 173 photos
│   └── *.mov                    # 5 videos
└── Documentation/
    ├── DEPLOYMENT_PACKAGE.md
    ├── GITHUB_PAGES_DEPLOYMENT.md
    └── PWA_INSTALLATION_GUIDE.md
```

## 🔧 Technical Details

### Base Path Configuration
- **Production base path**: `/MentalBiriyani/`
- **Development base path**: `/` (root)
- **Router**: Wouter with dynamic base path
- **Manifest**: Uses relative paths (`start_url: "."`)
- **Service Worker**: Relative path registration (`./sw.js`)

### Path Resolution
All paths are handled correctly:
- Routes: `/` → `/MentalBiriyani/`
- Routes: `/home` → `/MentalBiriyani/home`
- Routes: `/share/:id` → `/MentalBiriyani/share/:id`
- Assets: Automatically prefixed by build tool
- Content: Loaded from relative `./content/` path

## 📚 Documentation

- **DEPLOYMENT_PACKAGE.md** - Complete deployment guide with all options
- **GITHUB_PAGES_DEPLOYMENT.md** - Step-by-step GitHub Pages setup
- **PWA_INSTALLATION_GUIDE.md** - How to install as mobile/desktop app

## 🎉 After Deployment

Once deployed, your site will be available at:
- **Primary URL**: `https://YOUR-USERNAME.github.io/MentalBiriyani/`
- **PWA**: Users can install it as a standalone app
- **Offline**: Works without internet after first visit
- **Shareable**: Individual media items have unique URLs

## 📊 Package Info

- **Total Size**: ~184 MB (includes all media)
- **Media Items**: 178 total (173 photos, 5 videos)
- **Bundle Size**: ~310 KB JS, ~74 KB CSS (gzipped: ~100 KB + ~12 KB)
- **Cache Strategy**: Version-based with 24-hour expiry
- **Browser Support**: Chrome, Safari, Firefox, Edge (latest versions)

---

Built with ❤️ for Div Papa

**Happy Birthday from the MentalBiriyani team!** 🍛✨
