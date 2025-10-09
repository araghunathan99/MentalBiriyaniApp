# Deploy to GitHub Pages - Quick Guide

## 📦 Your Package is Ready

**File**: `dist/github-pages-deploy.tar.gz` (112 KB)

## 🚀 Deploy in 5 Steps

### Step 1: Create GitHub Repository

Go to https://github.com/new and create a new repository:
- Name: `drive-reels` (or any name you prefer)
- Public repository
- **Don't** add README, .gitignore, or license

### Step 2: Download & Extract

1. Download `dist/github-pages-deploy.tar.gz` from Replit
2. Extract on your computer:
   ```bash
   tar -xzf github-pages-deploy.tar.gz -C drive-reels-site
   cd drive-reels-site
   ```

### Step 3: Push to GitHub

**Option A: Using Git Command Line**
```bash
git init
git add .
git commit -m "Deploy Drive Reels to GitHub Pages"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

**Option B: Using GitHub Web Interface**
1. Go to your repository
2. Click "uploading an existing file"
3. Drag ALL files from extracted folder
4. Commit to main branch

### Step 4: Enable GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **(root)**
4. Click **Save**
5. Wait 1-2 minutes for deployment

### Step 5: Configure Google OAuth

**CRITICAL**: Your app won't work until you do this!

1. Go to https://console.cloud.google.com/apis/credentials
2. Click on your OAuth Client ID
3. Under **Authorized JavaScript origins**, click **+ ADD URI**
4. Add: `https://YOUR-USERNAME.github.io`
5. Click **Save**

## ✅ Access Your App

Your app will be live at:
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

## 🔧 Troubleshooting

**"Failed to initialize Google Drive"**
- Did you add your GitHub Pages URL to Google OAuth authorized origins?
- Wait 2-3 minutes after adding the URL

**404 Error**
- Make sure `index.html` is in the root of your repository
- Check that GitHub Pages is enabled and set to deploy from main/(root)

**Files not loading**
- Ensure ALL files including the `assets/` folder were uploaded
- The `.nojekyll` file should be included (it's hidden but important)
