# Deploy Drive Reels to GitHub Pages

## Quick Setup

### Step 1: Download Your Static Site
Your static website is packaged and ready to download:
- **File**: `dist/drive-reels-github-pages.tar.gz` (111 KB)
- **Location**: In your Replit project files

### Step 2: Upload to GitHub Pages

#### Option A: Using GitHub Web Interface (Easiest)

1. **Create a new GitHub repository**
   - Go to https://github.com/new
   - Name it anything (e.g., `drive-reels`)
   - Make it public
   - Don't add README, .gitignore, or license

2. **Download the tarball from Replit**
   - In Replit Files panel, find `dist/drive-reels-github-pages.tar.gz`
   - Right-click → Download

3. **Extract the tarball on your computer**
   ```bash
   tar -xzf drive-reels-github-pages.tar.gz
   ```

4. **Upload files to GitHub**
   - Go to your new repository
   - Click "uploading an existing file"
   - Drag all extracted files (index.html, assets/, manifest.json, sw.js)
   - Commit directly to main branch

5. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Click Save

6. **Update Google OAuth Settings**
   - Go to https://console.cloud.google.com/apis/credentials
   - Edit your OAuth Client ID
   - Add to "Authorized JavaScript origins":
     ```
     https://YOUR-USERNAME.github.io
     ```
   - Add to "Authorized redirect URIs":
     ```
     https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
     ```

7. **Access your app**
   - Your app will be live at: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`
   - Wait 1-2 minutes for GitHub Pages to deploy

#### Option B: Using Git Command Line

1. **Download and extract the tarball**
   ```bash
   # Download from Replit
   # Then extract
   tar -xzf drive-reels-github-pages.tar.gz -C my-site
   cd my-site
   ```

2. **Initialize Git and push**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Drive Reels static site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

3. **Enable GitHub Pages** (same as Option A step 5)

4. **Update Google OAuth** (same as Option A step 6)

## Important Notes

- **Google OAuth Client ID**: Your app has the Client ID baked in, but you MUST add your GitHub Pages URL to the authorized origins in Google Cloud Console
- **HTTPS Required**: GitHub Pages uses HTTPS, which is required for Google OAuth
- **No Backend Needed**: This is a fully static site that runs entirely in the browser
- **Mobile PWA**: Users can install it on their phones as a Progressive Web App

## Troubleshooting

**"Failed to initialize Google Drive"**
- Make sure you added your GitHub Pages URL to Google Cloud Console authorized JavaScript origins
- Wait a few minutes after adding the URL for Google to update

**"Redirect URI mismatch"**
- Add your exact GitHub Pages URL (with trailing slash) to authorized redirect URIs

**Files not showing**
- Make sure you uploaded ALL files including the assets/ folder
- Check that index.html is in the root directory
