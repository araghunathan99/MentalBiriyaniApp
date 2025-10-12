# Deploy to GitHub Pages - Complete Guide

## 🎉 Build Complete!

Your MentalBiriyani app has been successfully built and is ready for deployment to GitHub Pages!

**Build Summary:**
- ✅ Generated content lists (364 media items, 24 audio files)
- ✅ Parsed chat conversations
- ✅ Built optimized production bundle (114MB)
- ✅ Fixed paths for GitHub Pages (`/MentalBiriyani/`)
- ✅ Added cache-busting for fresh loads
- ✅ Copied all media files and PWA configuration

**Built files location:** `dist/public/`

---

## 📦 Option 1: Deploy Using GitHub Desktop (Recommended)

This is the easiest way to deploy if you're not familiar with Git commands.

### Step 1: Download the Built Files
1. Download the entire `dist/public/` folder to your local machine
2. This folder contains everything needed for GitHub Pages

### Step 2: Create/Clone Your GitHub Repository
1. Go to GitHub.com and create a new repository named `MentalBiriyani`
   - Make it **Public** (required for free GitHub Pages)
   - Don't initialize with README
2. Clone the repository to your local machine using GitHub Desktop

### Step 3: Add Built Files
1. Copy all files from `dist/public/` into your cloned repository folder
2. The root of your repository should contain:
   - `index.html`
   - `assets/` folder
   - `content/` folder
   - `manifest.json`
   - `sw.js`
   - etc.

### Step 4: Commit and Push
1. In GitHub Desktop, you'll see all files listed as changes
2. Write a commit message: "Initial deployment to GitHub Pages"
3. Click "Commit to main"
4. Click "Push origin" to upload to GitHub

### Step 5: Enable GitHub Pages
1. Go to your repository on GitHub.com
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**

### Step 6: Access Your Site
Your site will be live at:
```
https://araghunathan99.github.io/MentalBiriyani/
```

⏱️ **Note:** It may take 1-2 minutes for the site to be available.

---

## 🔧 Option 2: Deploy Using Git Commands

If you're comfortable with the command line:

### Step 1: Navigate to Built Files
```bash
cd dist/public
```

### Step 2: Initialize Git Repository
```bash
git init
git branch -M main
```

### Step 3: Add All Files
```bash
git add -A
```

### Step 4: Create Commit
```bash
git commit -m "Deploy to GitHub Pages - $(date)"
```

### Step 5: Add GitHub Remote
Replace `YOUR-USERNAME` with your GitHub username:
```bash
git remote add origin https://github.com/YOUR-USERNAME/MentalBiriyani.git
```

### Step 6: Push to GitHub
```bash
git push -f origin main
```

### Step 7: Enable GitHub Pages
1. Go to repository **Settings** → **Pages**
2. Select branch: `main`, folder: `/ (root)`
3. Click **Save**

Your site will be live at: `https://YOUR-USERNAME.github.io/MentalBiriyani/`

---

## 🚀 Option 3: Automated Deployment (Git CLI)

After building, deploy using the deployment script:

```bash
# Just deploy (after running build)
bash scripts/deploy-github-pages.sh

# Or build + deploy in one command
./build-github-pages.sh --deploy
```

**Environment Variables:**
- `GITHUB_PAGES_REPO`: Your repository URL (optional)
- `GITHUB_REPO_OWNER`: Repository owner (default: araghunathan99)
- `GITHUB_REPO_NAME`: Repository name (default: MentalBiriyani)

Example with custom repository:
```bash
export GITHUB_PAGES_REPO=https://github.com/username/MentalBiriyani.git
bash scripts/deploy-github-pages.sh
```

**Note:** This requires git credentials to be configured. If you get authentication errors, use Option 1 or 2 instead.

---

## ⚙️ GitHub Pages Settings

After deploying, configure these settings in your GitHub repository:

### 1. Enable GitHub Pages
- **Settings** → **Pages**
- **Source**: Branch `main`, folder `/ (root)`
- **Custom domain** (optional): Add your domain

### 2. Verify Deployment
Check the **Pages** section for deployment status:
- ✅ Green checkmark = Successfully deployed
- 🟡 Yellow dot = Building/Deploying
- ❌ Red X = Deployment failed

### 3. HTTPS (Automatic)
- GitHub Pages automatically provides HTTPS
- Your site will be accessible via `https://`

---

## 🔄 Updating Your Site

When you make changes:

1. **Rebuild the app:**
   ```bash
   ./build-github-pages.sh
   ```

2. **Deploy updated files:**
   - Option A: Use GitHub Desktop (copy new files, commit, push)
   - Option B: Use git commands (steps above)
   - Option C: Run `./build-github-pages.sh --deploy`

---

## 📱 Progressive Web App (PWA)

Your site is PWA-ready! Users can:
- Install it on their devices
- Use it offline (service worker caching)
- Get an app-like experience

The PWA configuration includes:
- ✅ `manifest.json` - App metadata
- ✅ `sw.js` - Service worker for offline support
- ✅ Icons for different devices
- ✅ Cache-busting for updates

---

## 🐛 Troubleshooting

### Site shows 404
- Verify GitHub Pages is enabled in Settings → Pages
- Check that branch is set to `main`
- Wait 1-2 minutes for deployment to complete

### Assets not loading
- Verify files are in the `assets/` folder
- Check that paths use `/MentalBiriyani/` prefix
- Clear browser cache and reload

### Videos not playing
- Videos should be in MP4 format (H.264 codec)
- Large files may take time to load
- Check browser console for errors

### Chat conversations not showing
- Verify `content/chat-list.json` exists
- Check that the file was copied to `dist/public/content/`
- Ensure MBOX file was parsed correctly

---

## 📊 What's Deployed

Your deployed site includes:

**Core App:**
- ✅ Optimized React app (353KB JS, 76KB CSS)
- ✅ Responsive design for all devices
- ✅ PWA functionality

**Media Content:**
- ✅ 262 photos
- ✅ 102 videos (MP4 format, 720p max)
- ✅ 24 audio files (songs)
- ✅ Chat conversations

**Features:**
- ✅ Grid view for photos/videos
- ✅ Reels feed for videos
- ✅ Audio player for songs
- ✅ Chat conversation viewer
- ✅ Dark/light theme support

---

## 🎯 Next Steps

1. ✅ **Build completed** - All files ready in `dist/public/`
2. 📤 **Deploy to GitHub** - Use one of the methods above
3. ⚙️ **Configure GitHub Pages** - Enable in repository settings
4. 🌐 **Share your site** - Access at your GitHub Pages URL
5. 🎨 **Customize** - Update content and rebuild as needed

---

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Custom Domain Setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [PWA Guide](./PWA_INSTALLATION_GUIDE.md)
- [Video Conversion Guide](./VIDEO_CONVERSION_GUIDE.md)

---

**Your MentalBiriyani app is ready to go live! 🚀**
