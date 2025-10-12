# GitHub Pages Cache-Busting Guide

## Problem

GitHub Pages aggressively caches static files, including `index.html`. When you deploy new code:

1. **Vite generates new asset files** with content-based hashes:
   - Old: `/MentalBiriyani/assets/index-abc123.js`
   - New: `/MentalBiriyani/assets/index-xyz789.js`

2. **Browsers cache the old `index.html`** which still references:
   - `<script src="/MentalBiriyani/assets/index-abc123.js">`

3. **Result**: Browsers try to load deleted/old assets → 404 errors or stale content

## Solution

### 1. HTTP Cache Control Headers

Added meta tags to prevent `index.html` caching:

```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

### 2. Automatic Version Timestamps

Build script adds unique timestamps to ALL asset URLs:

**Before:**
```html
<script src="/MentalBiriyani/assets/index-abc123.js"></script>
<link rel="stylesheet" href="/MentalBiriyani/assets/index-xyz789.css">
```

**After:**
```html
<script src="/MentalBiriyani/assets/index-abc123.js?v=1760087222447"></script>
<link rel="stylesheet" href="/MentalBiriyani/assets/index-xyz789.css?v=1760087222447">
```

### 3. Assets Covered

The cache-busting system handles:
- ✅ JavaScript bundles (`/assets/*.js`)
- ✅ CSS stylesheets (`/assets/*.css`)
- ✅ PWA manifest (`manifest.json`)
- ✅ Service worker (`sw.js`)

## How It Works

### Build Process (Step 4/8)

1. **Vite builds** the app → generates `dist/public/index.html`
2. **Path fixer** updates paths for GitHub Pages (`/MentalBiriyani/`)
3. **Cache-busting script** (`scripts/add-cache-busting.js`) runs:
   - Generates timestamp: `Date.now()` (e.g., `1760087222447`)
   - Finds all asset references using regex
   - Appends `?v=TIMESTAMP` to each URL
   - Saves updated `index.html`

### The Script

```javascript
// Generate version timestamp
const version = Date.now();

// Add to asset bundles
html = html.replace(
  /((?:src|href)=["'])([^"']*\/MentalBiriyani\/assets\/[^"'?]+)(["'])/g,
  `$1$2?v=${version}$3`
);

// Add to manifest and service worker
html = html.replace(
  /((?:src|href)=["'])(\.[^"'?]*\.(?:json|js))(["'])/g,
  `$1$2?v=${version}$3`
);

// Add to service worker registration
html = html.replace(
  /(\.register\(['"])(\.[^'"?]+\.js)(['"]\))/g,
  `$1$2?v=${version}$3`
);
```

## Testing the Fix

### 1. Clear Browser Cache

**Chrome/Edge:**
- Open DevTools (F12)
- Right-click refresh button → "Empty Cache and Hard Reload"

**Firefox:**
- Ctrl+Shift+Delete → Clear cache

**Safari:**
- Develop menu → Empty Caches

### 2. Check Network Tab

1. Open DevTools → Network tab
2. Refresh the page
3. Look for asset requests:
   - Should see `?v=TIMESTAMP` on all assets
   - Status should be `200 OK` (not `304 Not Modified`)

### 3. Verify Version Updates

Each build generates a NEW timestamp:

**Build 1:** `?v=1760087222447`
**Build 2:** `?v=1760087345678`

Even if file content is identical, the version parameter forces a fresh fetch.

## Deployment Workflow

### Quick Deploy

```bash
./build-github-pages.sh --deploy
```

This automatically:
1. Builds the app
2. Adds cache-busting timestamps
3. Deploys to GitHub Pages

### Manual Verification

After deployment, check the live site:

```bash
# View source on GitHub Pages
curl https://araghunathan99.github.io/MentalBiriyani/ | grep "?v="
```

Should show versioned assets:
```html
<script src="/MentalBiriyani/assets/index-abc.js?v=1760087222447"></script>
```

## Why This Works

1. **Meta tags** tell browsers not to cache `index.html` itself
2. **Version parameters** make each asset URL unique per build
3. **Even if meta tags fail**, the version parameter ensures fresh assets
4. **Browser behavior**: 
   - `script.js` = cached
   - `script.js?v=123` = new request
   - `script.js?v=456` = different new request

## Troubleshooting

### Still seeing old assets?

1. **Hard refresh**: Ctrl+Shift+R (Chrome/Firefox) or Cmd+Shift+R (Mac)
2. **Check version**: View page source, verify `?v=TIMESTAMP` is present
3. **Wait for deployment**: GitHub Pages can take 1-2 minutes to update
4. **Clear ALL cache**: DevTools → Application → Clear storage

### Version not changing?

1. Check build logs: `./build-github-pages.sh --skip-video`
2. Look for: `✅ Added cache-busting version: [timestamp]`
3. Verify `dist/public/index.html` has version parameters

### Assets still 404?

1. Ensure Vite build succeeded (check `dist/public/assets/`)
2. Verify paths are correct: `/MentalBiriyani/assets/`
3. Check GitHub Pages settings: Source = `main` branch, `/ (root)` folder

## Benefits

✅ **No manual intervention** - automatic with every build
✅ **Works with Vite's hashed assets** - complements content hashing
✅ **Survives aggressive caching** - forces fresh loads
✅ **GitHub Pages compatible** - no server config needed
✅ **PWA friendly** - versions service worker too

## Related Files

- `client/index.html` - Source template with cache control meta tags
- `scripts/add-cache-busting.js` - Post-build script that adds versions
- `build-github-pages.sh` - Build script that orchestrates everything
- `dist/public/index.html` - Final output with versioned URLs
