# Building MentalBiriyani for GitHub Pages

This guide explains how to build the MentalBiriyani app for deployment to GitHub Pages at `https://YOUR-USERNAME.github.io/MentalBiriyani/`.

## Quick Build

To create a production build ready for GitHub Pages deployment:

```bash
# 1. Build the app
npm run build

# 2. Fix paths for GitHub Pages
node scripts/fix-github-pages-paths.js

# 3. Copy required files to dist/public
cp -r client/public/content dist/public/
cp client/public/manifest.json client/public/sw.js dist/public/
touch dist/public/.nojekyll

# 4. Copy documentation (optional)
cp DEPLOYMENT_PACKAGE.md GITHUB_PAGES_DEPLOYMENT.md PWA_INSTALLATION_GUIDE.md dist/public/
```

The deployable package will be in `dist/public/` (~184 MB).

## What Gets Built

### 1. Vite Build (`npm run build`)
- Compiles React app with TypeScript
- Bundles JavaScript (~310 KB)
- Bundles CSS (~74 KB)
- Generates optimized assets
- Outputs to `dist/public/`

**Note**: Vite generates paths like `/assets/...` which need to be fixed for GitHub Pages.

### 2. Path Fix Script (`node scripts/fix-github-pages-paths.js`)
This script updates `dist/public/index.html` to use the correct base path:

**Before** (from Vite):
```html
<script src="/assets/index-*.js"></script>
<link href="/assets/index-*.css">
```

**After** (fixed for GitHub Pages):
```html
<script src="/MentalBiriyani/assets/index-*.js"></script>
<link href="/MentalBiriyani/assets/index-*.css">
```

### 3. Content & Config Files
- `content/` folder (178 media items)
- `manifest.json` (PWA manifest)
- `sw.js` (service worker)
- `.nojekyll` (prevents Jekyll processing)

### 4. Documentation Files (Optional)
- `DEPLOYMENT_PACKAGE.md`
- `GITHUB_PAGES_DEPLOYMENT.md`
- `PWA_INSTALLATION_GUIDE.md`
- `README.md` (auto-generated in dist/public)

## How Paths Work

### Development (Local)
When running `npm run dev`:
- Base path: `/` (root)
- Assets: `/assets/...`
- Content: `/content/...`
- Routes: `/`, `/home`, `/share/:id`

**Handled by**:
- `basePath.ts`: Returns empty string in development
- Wouter router: Uses empty base path

### Production (GitHub Pages)
When deployed to `https://USERNAME.github.io/MentalBiriyani/`:
- Base path: `/MentalBiriyani/`
- Assets: `/MentalBiriyani/assets/...` (fixed by script)
- Content: `/MentalBiriyani/content/...` (via basePath.ts)
- Routes: `/MentalBiriyani/`, `/MentalBiriyani/home`, `/MentalBiriyani/share/:id`

**Handled by**:
- `basePath.ts`: Returns `/MentalBiriyani` in production
- Post-build script: Fixes index.html asset paths
- Wouter router: Uses `/MentalBiriyani` base path

## Key Files

### Client-side Path Management
```typescript
// client/src/lib/basePath.ts
export function getBasePath(): string {
  return import.meta.env.PROD ? '/MentalBiriyani' : '';
}

export function getFullPath(path: string): string {
  const base = getBasePath();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}/${cleanPath}`;
}
```

Used in:
- `client/src/lib/localMedia.ts` - For loading media files
- `client/src/App.tsx` - For router base path

### Build Script
```javascript
// scripts/fix-github-pages-paths.js
// Replaces /assets/ with /MentalBiriyani/assets/ in index.html
```

## Building for Different Deployment Paths

### For Different Repository Name
If deploying to `https://USERNAME.github.io/my-app/`:

1. Update `client/src/lib/basePath.ts`:
   ```typescript
   return import.meta.env.PROD ? '/my-app' : '';
   ```

2. Update `scripts/fix-github-pages-paths.js`:
   ```javascript
   content = content.replace(/src="\/assets\//g, 'src="/my-app/assets/');
   content = content.replace(/href="\/assets\//g, 'href="/my-app/assets/');
   ```

3. Rebuild:
   ```bash
   npm run build
   node scripts/fix-github-pages-paths.js
   # ... copy files as usual
   ```

### For Root Deployment
If deploying to `https://USERNAME.github.io/` (user/org pages):

1. Update `client/src/lib/basePath.ts`:
   ```typescript
   return ''; // Always use root path
   ```

2. Skip the path fix script (not needed)

3. Rebuild:
   ```bash
   npm run build
   # ... copy files as usual
   ```

## Verification Checklist

After building, verify:

- [ ] `dist/public/index.html` has `/MentalBiriyani/assets/...` paths
- [ ] `dist/public/content/` folder exists (178 items)
- [ ] `dist/public/manifest.json` exists
- [ ] `dist/public/sw.js` exists
- [ ] `dist/public/.nojekyll` exists
- [ ] Total package size is ~184 MB

## Troubleshooting

### Issue: Assets still use `/assets/` paths
**Cause**: Forgot to run the fix script  
**Solution**: Run `node scripts/fix-github-pages-paths.js`

### Issue: Content folder missing
**Cause**: Forgot to copy content folder  
**Solution**: Run `cp -r client/public/content dist/public/`

### Issue: 404 on deployed site
**Cause**: Wrong base path or missing files  
**Solution**: Verify paths in index.html and check GitHub Pages settings

### Issue: Service worker not registering
**Cause**: Missing sw.js or manifest.json  
**Solution**: Run `cp client/public/manifest.json client/public/sw.js dist/public/`

## Automated Build Script (Optional)

You can create a single script to do everything:

```bash
#!/bin/bash
# build-github-pages.sh

echo "Building for GitHub Pages..."

# Build
npm run build

# Fix paths
node scripts/fix-github-pages-paths.js

# Copy files
cp -r client/public/content dist/public/
cp client/public/manifest.json client/public/sw.js dist/public/
touch dist/public/.nojekyll

# Copy docs
cp DEPLOYMENT_PACKAGE.md GITHUB_PAGES_DEPLOYMENT.md PWA_INSTALLATION_GUIDE.md dist/public/

echo "✓ Build complete! Package ready at dist/public/"
echo "Total size: $(du -sh dist/public | cut -f1)"
```

Make it executable:
```bash
chmod +x build-github-pages.sh
./build-github-pages.sh
```

## Next Steps

After building, follow the deployment instructions in `dist/public/README.md` to push to GitHub Pages.

---

**Built with ❤️ for Div Papa**
