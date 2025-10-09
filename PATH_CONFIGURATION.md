# Path Configuration for GitHub Pages

This document explains how the MentalBiriyani app is configured to work correctly on GitHub Pages at the URL: `https://YOUR-USERNAME.github.io/MentalBiriyani/`

## Overview

GitHub Pages serves repositories at a subdirectory path (e.g., `/MentalBiriyani/`), not at the root. This package is pre-configured to handle this correctly using:

1. **Dynamic base path** in the app router
2. **Relative paths** for static assets
3. **Correct service worker registration**

## Technical Implementation

### 1. Router Base Path (App.tsx)

```javascript
const basePath = import.meta.env.PROD ? "/MentalBiriyani" : "";

<Router base={basePath}>
  <Routes />
</Router>
```

**How it works:**
- In **production** (GitHub Pages): Uses `/MentalBiriyani` base path
- In **development** (local): Uses empty base path `/`
- All routes automatically adjust:
  - `/` → `/MentalBiriyani/`
  - `/home` → `/MentalBiriyani/home`
  - `/share/:id` → `/MentalBiriyani/share/:id`

### 2. Manifest Configuration (manifest.json)

```json
{
  "start_url": ".",
  "scope": ".",
  "icons": [
    { "src": "icon-192.png" }
  ]
}
```

**Why relative paths:**
- `"."` means "current directory"
- Works regardless of deployment path
- Icons use relative paths (no leading `/`)

### 3. Service Worker (sw.js)

```javascript
const CACHE_NAME = 'mental-biriyani-v1';
const urlsToCache = [
  './',
  './index.html'
];

// Registration in index.html
navigator.serviceWorker.register('./sw.js')
```

**Why relative paths:**
- `./sw.js` resolves to current directory
- Works at any base path
- Cache URLs are relative to deployment location

### 4. Index.html References

```html
<link rel="manifest" href="./manifest.json" />
<script>
  navigator.serviceWorker.register('./sw.js')
</script>
```

**All paths are relative:**
- Manifest: `./manifest.json`
- Service Worker: `./sw.js`
- OG Image: `./og-image.png`

## Deployment Scenarios

### Scenario 1: Repository Named "MentalBiriyani" ✅ (Recommended)

**Repository**: `https://github.com/USERNAME/MentalBiriyani`  
**GitHub Pages URL**: `https://USERNAME.github.io/MentalBiriyani/`

**Status**: ✅ Pre-configured and ready to deploy!

No changes needed. Follow the deployment steps in README.md.

### Scenario 2: Different Repository Name

**Repository**: `https://github.com/USERNAME/my-app`  
**GitHub Pages URL**: `https://USERNAME.github.io/my-app/`

**Required changes**:
1. Update App.tsx base path from `/MentalBiriyani` to `/my-app`
2. Rebuild the app with `npm run build`
3. Deploy

### Scenario 3: User/Org GitHub Pages (Root Path)

**Repository**: `https://github.com/USERNAME/USERNAME.github.io`  
**GitHub Pages URL**: `https://USERNAME.github.io/`

**Required changes**:
1. Update App.tsx base path to empty string `""`
2. Rebuild the app with `npm run build`
3. Deploy

## File Structure

```
dist/public/
├── index.html                 # Entry point (relative paths)
├── manifest.json             # PWA manifest (relative paths)
├── sw.js                     # Service worker (relative paths)
├── .nojekyll                 # Prevents Jekyll processing
├── assets/
│   ├── index-*.css          # Styles (auto-prefixed by Vite)
│   └── index-*.js           # App bundle (contains base path logic)
└── content/
    ├── media-list.json      # Media catalog
    └── *.jpeg, *.mov        # Media files
```

## How Paths Work

### Static Assets (CSS, JS, Images)
- Vite automatically handles asset paths during build
- All imports get correct paths in production
- No manual configuration needed

### Dynamic Routes (Wouter)
- Router base path prepends to all routes
- `useLocation()` hook returns paths relative to base
- Navigation automatically includes base path

### Media Content
- Loaded from `/content/` directory
- Path is relative to deployed location
- Works at any base path

## Verification Checklist

After deployment, verify these work:

- [ ] Landing page loads at `https://USERNAME.github.io/MentalBiriyani/`
- [ ] Navigation to `/home` works
- [ ] Media items load from content folder
- [ ] Share URLs work: `/share/:id`
- [ ] Service worker registers successfully
- [ ] PWA manifest is detected
- [ ] App can be installed as PWA
- [ ] All routes work with browser refresh

## Troubleshooting

### Issue: Routes return 404 on refresh

**Cause**: GitHub Pages doesn't handle client-side routing by default  
**Solution**: Add a custom 404.html that redirects to index.html

### Issue: Assets not loading

**Cause**: Incorrect base path configuration  
**Solution**: Verify base path in App.tsx matches repository name

### Issue: Service worker fails to register

**Cause**: HTTPS required for service workers  
**Solution**: GitHub Pages provides HTTPS automatically, ensure you're accessing via https://

### Issue: PWA not installable

**Cause**: Manifest or service worker not loading  
**Solution**: Check browser DevTools → Application → Manifest/Service Workers

## Testing Locally

To test the production build locally:

```bash
# Build the app
npm run build

# Serve the dist/public folder
cd dist/public
python -m http.server 8000

# Access at: http://localhost:8000/
# Note: Base path won't work locally, use deployment URL
```

## Additional Notes

### Why Not Use Hash Routing?

Hash routing (`#/home`) would work without configuration, but:
- URLs are less clean (`#/` vs `/`)
- SEO is negatively impacted
- Sharing URLs is less intuitive
- PWA experience is degraded

Our approach with base path configuration provides:
- ✅ Clean URLs
- ✅ Better SEO
- ✅ Shareable links
- ✅ Full PWA support

### Why Relative Paths?

Relative paths (`.`, `./file.ext`) provide flexibility:
- Work at any deployment path
- No hardcoded URLs
- Easy to move between environments
- Compatible with all hosting providers

## Summary

The app is configured with:

1. **Dynamic base path** - Automatically adjusts for production
2. **Relative asset paths** - Work anywhere
3. **Wouter routing** - Handles base path in routes
4. **Service worker** - Registers with relative path
5. **PWA manifest** - Uses relative paths for icons

This ensures the app works correctly at `https://USERNAME.github.io/MentalBiriyani/` without any additional configuration!

---

**Ready to deploy?** Follow the instructions in README.md! 🚀
