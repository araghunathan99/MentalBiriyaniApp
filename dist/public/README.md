# Drive Reels - Static Site

This is a fully static, frontend-only Instagram Reels-like app that displays photos and videos from Google Drive.

## 🚀 Deployed on GitHub Pages

This site runs entirely in the browser with no backend required.

## ⚙️ Setup Required

Before the app works, you must configure Google OAuth:

1. Go to https://console.cloud.google.com/apis/credentials
2. Edit your OAuth Client ID
3. Add your GitHub Pages URL to "Authorized JavaScript origins":
   ```
   https://YOUR-USERNAME.github.io
   ```

## 📱 Features

- View photos and videos from Google Drive folder "MentalBiriyani"
- Swipe navigation (mobile-optimized)
- Grid library view
- Like functionality (stored locally)
- Share individual media items
- Progressive Web App (installable on mobile)
- Offline support with service worker

## 🔧 Technical Details

- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Authentication**: Google OAuth 2.0 (browser-based)
- **Storage**: LocalStorage for likes, Google Drive for media
- **PWA**: Manifest + Service Worker for offline capability
