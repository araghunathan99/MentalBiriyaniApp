# Drive Reels - Static Mobile Web App Deployment Guide

## 📦 Deployment Package

Your static mobile web app has been built and packaged in: `drive-reels-static.tar.gz`

This package contains all the files needed to run Drive Reels as a Progressive Web App (PWA) on any mobile device.

## 🚀 Deployment Options

### Option 1: Deploy to Static Hosting Services

Deploy the contents of `dist/public/` to any static hosting service:

- **Netlify**: Drop folder or connect to Git
- **Vercel**: Deploy static site
- **GitHub Pages**: Upload to gh-pages branch
- **Firebase Hosting**: Use `firebase deploy`
- **Cloudflare Pages**: Connect repository or upload

### Option 2: Self-Hosted

1. Extract the package:
   ```bash
   tar -xzf drive-reels-static.tar.gz -C /var/www/html
   ```

2. Serve with any web server (nginx, Apache, etc.)

3. Ensure HTTPS is enabled for PWA features to work

### Option 3: Local Testing

```bash
# Extract the package
tar -xzf drive-reels-static.tar.gz -C ./static-app

# Serve locally (requires Python 3)
cd static-app
python3 -m http.server 8080

# Or with Node.js
npx serve .
```

## 📱 Installing as Mobile App

Once deployed:

1. **On iOS (Safari)**:
   - Visit your deployed URL
   - Tap the Share button
   - Select "Add to Home Screen"

2. **On Android (Chrome)**:
   - Visit your deployed URL
   - Tap the menu (⋮)
   - Select "Install app" or "Add to Home Screen"

## ⚙️ Backend Requirements

**Important**: This app requires a backend server to fetch Google Drive content.

The static frontend files can be deployed anywhere, but you'll need to:

1. Deploy the backend separately (included in `dist/index.js`)
2. Update API endpoint URLs if backend is on different domain
3. Ensure CORS is properly configured

### Backend Deployment

The backend can be deployed to:
- Replit (recommended for easy Google Drive integration)
- Heroku, Railway, Render, or any Node.js hosting
- AWS Lambda, Google Cloud Functions (serverless)

## 🔧 Configuration

The app is configured as a PWA with:
- ✅ Service Worker for offline capability
- ✅ Web App Manifest for installation
- ✅ Mobile-optimized responsive design
- ✅ Dark theme optimized for mobile viewing

## 📂 Package Contents

```
dist/public/
├── index.html          # Main HTML file
├── manifest.json       # PWA manifest
├── sw.js              # Service worker for offline support
└── assets/
    ├── index-*.css    # Compiled styles
    └── index-*.js     # Compiled JavaScript
```

## 🌐 Access Your App

After deployment, your app will be accessible at your hosting URL and can be installed on any mobile device as a standalone app.

For full functionality with Google Drive integration, ensure the backend is running and accessible.
