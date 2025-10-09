# MentalBiriyani - PWA Installation Guide

## 📱 Install as a Progressive Web App (PWA)

MentalBiriyani can be installed as a Progressive Web App on your mobile device or desktop, giving you an app-like experience with offline support!

---

## 📱 iOS (iPhone/iPad)

### Installation Steps:

1. **Open Safari** (must use Safari browser on iOS)
   - Navigate to your MentalBiriyani URL (e.g., `https://your-username.github.io/mentalbiriyani`)

2. **Tap the Share button** (the square with arrow pointing up)
   - Located at the bottom of Safari (iPhone) or top (iPad)

3. **Scroll down and tap "Add to Home Screen"**
   - You'll see the MentalBiriyani icon and name

4. **Tap "Add" in the top right corner**
   - The app will be added to your home screen

5. **Launch the app**
   - Tap the MentalBiriyani icon on your home screen
   - It will open in full-screen mode without Safari UI

### iOS Features:
- ✅ Full-screen app experience
- ✅ Appears on home screen with custom icon
- ✅ Offline support with service worker
- ✅ No browser UI (status bar only)
- ✅ Swipe gestures work perfectly

---

## 🤖 Android

### Chrome Installation:

1. **Open Chrome browser**
   - Navigate to your MentalBiriyani URL

2. **Tap the three-dot menu** (⋮) in the top right

3. **Tap "Add to Home screen" or "Install app"**
   - Chrome will show an installation prompt

4. **Tap "Install" or "Add"**
   - The app will be added to your home screen and app drawer

5. **Launch the app**
   - Find MentalBiriyani in your app drawer or home screen
   - Opens in full-screen standalone mode

### Alternative Android Method:

If you see a banner at the bottom of the screen:
- Simply tap "Install" on the banner
- Confirm installation
- App will be added automatically

### Android Features:
- ✅ Full-screen standalone app
- ✅ Appears in app drawer and home screen
- ✅ Offline support
- ✅ Back button integration
- ✅ System-level app switching

---

## 💻 Desktop (Chrome/Edge)

### Installation Steps:

1. **Open Chrome or Edge browser**
   - Navigate to your MentalBiriyani URL

2. **Look for the install icon** in the address bar
   - Shows as a computer monitor with down arrow (⊕)
   - Or a circled plus icon

3. **Click the install icon**
   - Or go to Menu (⋮) → "Install MentalBiriyani..."

4. **Click "Install" in the popup**
   - The app will open in a new window

5. **Access later**
   - Find it in your apps menu (Windows: Start Menu, Mac: Applications)
   - Or click the app icon in your taskbar/dock

### Desktop Features:
- ✅ Standalone app window
- ✅ No browser UI clutter
- ✅ Keyboard shortcuts support
- ✅ Desktop notifications (if enabled)
- ✅ Offline support

---

## 🔍 Verifying PWA Installation

### Check if Installed Correctly:

**iOS:**
- The app opens without Safari UI
- Status bar shows time/battery but no browser controls
- Swipe up from bottom shows app switcher (not Safari tabs)

**Android:**
- The app appears in your app drawer
- Opens without Chrome address bar
- Shows in recent apps as "MentalBiriyani" (not Chrome)

**Desktop:**
- Opens in separate window (not browser tab)
- Has its own icon in taskbar/dock
- Window shows "MentalBiriyani" in title bar

---

## 🌐 Offline Support

Once installed, MentalBiriyani works offline!

### What Works Offline:
- ✅ View previously loaded media (from cache)
- ✅ Browse cached photos and videos
- ✅ Like/unlike media (syncs when online)
- ✅ Navigation between Reels and Library
- ✅ Filter functionality

### What Requires Internet:
- ❌ Loading new/uncached media for first time
- ❌ Fetching updated media list (cache expires after 24 hours)

### Managing Offline Storage:

The app automatically caches:
- Media list (24-hour cache)
- Recently viewed media
- App resources (HTML, CSS, JS)

**Cache is version-based:**
- When `media-list.json` version changes, cache refreshes automatically
- Manual refresh: Pull down to refresh (mobile) or reload page

---

## 🔄 Updating the App

### When Updates are Available:

**Automatic Updates:**
- Service worker checks for updates when you open the app
- New version downloads in background
- Refresh the app to get latest version

**Manual Update:**
- Close and reopen the app
- Or pull down to refresh (mobile)
- Or reload the page (Ctrl+R or Cmd+R on desktop)

**Checking Current Version:**
- Open browser DevTools (F12)
- Check Console for version logs
- Or check localStorage for `media-cache-version`

---

## 🗑️ Uninstalling the App

### iOS:
1. Long-press the MentalBiriyani icon on home screen
2. Tap "Remove App"
3. Choose "Delete App"

### Android:
1. Long-press the MentalBiriyani icon
2. Drag to "Uninstall" or tap app info → Uninstall
3. Confirm removal

### Desktop (Chrome/Edge):
1. Open the app
2. Click the three-dot menu (⋮) in the app window
3. Choose "Uninstall MentalBiriyani..."
4. Confirm removal

Or:
- **Windows**: Settings → Apps → Find "MentalBiriyani" → Uninstall
- **Mac**: Right-click app in Applications → Move to Trash

---

## 💡 Tips for Best Experience

### Mobile:
- **Use in landscape mode** for videos that are wide
- **Swipe gestures** work best in Reels view
- **Tap to toggle controls** - first tap shows, second tap hides
- **Double-tap to like** media items

### Desktop:
- **Use arrow keys** to navigate Reels (↑↓ for prev/next, ←→ for video seek)
- **Scroll wheel** also navigates Reels
- **Click bottom slider** for precise navigation
- **Keyboard shortcuts** work for media controls

### Performance:
- **Clear cache occasionally** if app feels slow
- **Close and reopen** app after major updates
- **Use WiFi** for initial load (all media downloads)
- **Refresh page** if media doesn't load

---

## 🐛 Troubleshooting

### App won't install:
- **iOS**: Must use Safari (not Chrome or Firefox)
- **Android**: Check Chrome is updated to latest version
- **Desktop**: Try Chrome or Edge (not Firefox or Safari)
- **All**: Ensure HTTPS is enabled on your site

### Media not loading:
- Check internet connection
- Clear browser/app cache
- Verify media files exist in GitHub repo
- Check browser console for errors (F12)

### Offline mode not working:
- Service worker might not be registered
- Check for HTTPS (required for service workers)
- Clear site data and reinstall app

### App looks different than expected:
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Uninstall and reinstall the app
- Clear all site data in browser settings

---

## ✅ Features Summary

Your installed MentalBiriyani PWA includes:

- 🎬 **178 media items** (173 photos + 5 videos)
- 🎲 **Randomized Reels feed** (different order each visit)
- 📚 **Organized grid library** with All/Photos/Videos filters
- ❤️ **Like functionality** (stored locally)
- 🔗 **Share individual media** via unique URLs
- 🌓 **Dark theme** optimized for media viewing
- 📱 **Mobile-first design** with touch gestures
- 💾 **Offline support** with smart caching
- 🔄 **Auto-updates** with version-based cache invalidation

Enjoy your curated nostalgia ride! 🍛✨
