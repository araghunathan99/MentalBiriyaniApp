# MentalBiriyani - GitHub Pages Deployment Guide

## 🚀 Deploy to GitHub Pages

Follow these steps to deploy MentalBiriyani to GitHub Pages:

### Step 1: Prepare Your Repository

1. **Create a new GitHub repository**:
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it something like `mentalbiriyani` or `your-username.github.io`
   - Make it public (required for free GitHub Pages)
   - Don't initialize with README, .gitignore, or license (we'll push our code)

### Step 2: Copy the Built Files

The `dist/public` folder contains your ready-to-deploy static site with:
- ✅ 178 media files (173 photos + 5 videos)
- ✅ All HTML, CSS, and JavaScript assets
- ✅ PWA configuration (manifest.json, service worker)
- ✅ Cache invalidation system

### Step 3: Initialize Git and Push

```bash
# Navigate to the dist/public folder
cd dist/public

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial deployment of MentalBiriyani"

# Add your GitHub repository as remote (replace with your repo URL)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

### Step 5: Access Your Site

- Your site will be available at: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`
- If you named your repo `username.github.io`, it will be: `https://username.github.io/`
- GitHub Pages typically takes 1-5 minutes to build and deploy

## 📝 Important Notes

### Custom Domain (Optional)

If you want to use a custom domain:

1. In your repository settings → Pages → Custom domain
2. Enter your domain (e.g., `mentalbiriyani.com`)
3. Add a CNAME file to your repository:
   ```bash
   echo "mentalbiriyani.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```
4. Configure your domain's DNS settings:
   - Add a CNAME record pointing to `YOUR-USERNAME.github.io`

### HTTPS

- GitHub Pages automatically provides HTTPS
- Enable "Enforce HTTPS" in repository settings for secure connections

### Updates

To update your site after making changes:

```bash
# Build the latest version
npm run build

# Navigate to dist/public
cd dist/public

# Commit and push changes
git add .
git commit -m "Update content"
git push
```

## 🔧 Troubleshooting

**Issue: 404 errors on refresh**
- Solution: Already handled with proper routing in the app

**Issue: Assets not loading**
- Ensure `.nojekyll` file exists in the root (already included)
- Check that all paths are relative (already configured)

**Issue: Videos not playing**
- GitHub Pages has a 100MB file size limit per file
- Large videos may need to be compressed or hosted elsewhere

**Issue: Site not updating**
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check GitHub Actions tab for deployment status
- Wait 5-10 minutes for propagation

## ✅ What's Included

Your deployed site includes:
- 📱 Progressive Web App (PWA) support
- 🎨 Dark theme optimized for media viewing
- 🔄 Cache invalidation system (version-based)
- 📸 173 photos + 5 videos
- ❤️ Like functionality (localStorage)
- 🔗 Shareable URLs for individual media
- 🎲 Randomized Reels feed on each visit
- 📚 Organized grid library with filters

## 🌐 Alternative Hosting Options

You can also deploy to:

- **Netlify**: Drag and drop the `dist/public` folder to [Netlify](https://app.netlify.com/drop)
- **Vercel**: Import your GitHub repository in [Vercel](https://vercel.com)
- **Cloudflare Pages**: Connect your GitHub repository in [Cloudflare Pages](https://pages.cloudflare.com)

All platforms offer free hosting with automatic HTTPS and global CDN!
