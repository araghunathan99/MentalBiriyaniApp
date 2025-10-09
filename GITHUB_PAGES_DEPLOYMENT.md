# GitHub Pages Deployment Guide

This guide will help you deploy Drive Reels to GitHub Pages and install it as a Progressive Web App (PWA) on mobile devices.

## 📦 What's Included

The `dist/public` folder contains everything you need:
- Pre-built static website (HTML, CSS, JavaScript)
- 178 media files (173 photos + 5 videos)
- PWA configuration (manifest.json, service worker)
- Total size: ~184MB

## 🚀 Deploying to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it whatever you like (e.g., `drive-reels`)
3. Set it to **Public** (required for free GitHub Pages)
4. Do **NOT** initialize with README, .gitignore, or license

### Step 2: Prepare Your Files

1. **Copy the contents** of `dist/public/` to a new folder on your computer
2. Open terminal/command prompt in that folder
3. Initialize git and push to GitHub:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - Drive Reels PWA"

# Add your GitHub repository as remote (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
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
